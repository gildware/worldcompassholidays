"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { theme } from "@/config/theme";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { bookingReference } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { emailField } from "@/lib/validation";
import { whatsAppHref } from "@/lib/visa";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const stars = ["any", "3", "4", "5"] as const;

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function localToday() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function nightsBetween(start: string, end: string) {
  const ms = new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime();
  return Math.round(ms / 86400000);
}

function countField(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, `Enter ${label}`)
    .transform(Number)
    .pipe(z.number().min(min, `Enter ${label}`).max(max, `Enter ${label}`));
}

const requestSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
    email: emailField,
    phone: z
      .string()
      .trim()
      .min(1, "Enter a phone number")
      .max(30, "That phone number is too long")
      .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, and + for the country code")
      .refine((value) => value.replace(/\D/g, "").length >= 8, "Enter a phone number with the country code"),
    destination: z.string().trim().min(2, "Enter the city or area").max(120, "That place name is too long"),
    hotelName: z.string().trim().max(120, "That hotel name is too long").default(""),
    checkIn: z.string().regex(datePattern, "Choose a check-in date"),
    checkOut: z.string().regex(datePattern, "Choose a check-out date"),
    adults: countField(1, 20, "how many adults, from 1 to 20"),
    children: countField(0, 12, "how many children, from 0 to 12"),
    rooms: countField(1, 10, "how many rooms, from 1 to 10"),
    stars: z.enum(stars, { error: "Choose a star preference" }),
    budget: z
      .string()
      .trim()
      .default("")
      .refine((value) => value === "" || /^\d+$/.test(value), "Enter the nightly budget in rupees")
      .refine(
        (value) => value === "" || (Number(value) >= 500 && Number(value) <= 500000),
        "Enter a nightly budget between 500 and 500000",
      ),
    message: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  })
  .superRefine((data, ctx) => {
    if (data.checkIn < localToday()) {
      ctx.addIssue({ code: "custom", path: ["checkIn"], message: "Choose a check-in date from today onward" });
    }
    if (datePattern.test(data.checkIn) && datePattern.test(data.checkOut) && data.checkOut <= data.checkIn) {
      ctx.addIssue({ code: "custom", path: ["checkOut"], message: "Check-out must be after check-in" });
    }
    if (datePattern.test(data.checkIn) && datePattern.test(data.checkOut)) {
      const nights = nightsBetween(data.checkIn, data.checkOut);
      if (nights > 60) {
        ctx.addIssue({ code: "custom", path: ["checkOut"], message: "One request can cover up to 60 nights" });
      }
    }
  });

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function starLabel(value: (typeof stars)[number]) {
  if (value === "any") return "Any star rating";
  return `${value} stars or more`;
}

function requestNotes(input: z.infer<typeof requestSchema>) {
  const guests = [
    `${input.adults} ${input.adults === 1 ? "adult" : "adults"}`,
    `${input.children} ${input.children === 1 ? "child" : "children"}`,
    `${input.rooms} ${input.rooms === 1 ? "room" : "rooms"}`,
  ];
  const lines = [
    "Custom hotel request",
    `Place: ${input.destination}`,
    input.hotelName ? `Hotel they asked for: ${input.hotelName}` : "",
    `Stay: ${prettyDate(input.checkIn)} to ${prettyDate(input.checkOut)}`,
    `Party: ${guests.join(", ")}`,
    `Stars: ${starLabel(input.stars)}`,
    input.budget ? `Budget: INR ${Number(input.budget).toLocaleString("en-IN")} per night` : "Budget: not set",
    input.message ? `Note: ${input.message}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function whatsAppText(input: z.infer<typeof requestSchema> & { reference: string }) {
  return [`Hotel request ${input.reference}`, requestNotes(input), `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.phone}`].join(
    "\n",
  );
}

export async function submitHotelRequest(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const values = {
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: text(formData.get("phone")) || customer?.phone || "",
    destination: text(formData.get("destination")),
    hotelName: text(formData.get("hotelName")),
    checkIn: text(formData.get("checkIn")),
    checkOut: text(formData.get("checkOut")),
    adults: text(formData.get("adults")),
    children: text(formData.get("children")),
    rooms: text(formData.get("rooms")),
    stars: text(formData.get("stars")) || "any",
    budget: text(formData.get("budget")),
    message: text(formData.get("message")),
  };

  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: firstIssue(parsed.error),
      fields: fieldErrors(parsed.error),
      values,
    };
  }

  const channel = text(formData.get("channel")) === "whatsapp" ? "whatsapp" : "form";
  const data = parsed.data;
  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: "hotel",
      status: "enquiry",
      title: data.hotelName ? `Hotel request: ${data.hotelName}` : `Hotel request in ${data.destination}`,
      startDate: new Date(`${data.checkIn}T00:00:00`),
      endDate: new Date(`${data.checkOut}T00:00:00`),
      guests: data.adults + data.children,
      notes: requestNotes(data),
      details: JSON.stringify({
        kind: "custom_hotel",
        destination: data.destination,
        hotelName: data.hotelName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adults: data.adults,
        children: data.children,
        rooms: data.rooms,
        stars: data.stars,
        budget: data.budget ? Number(data.budget) : null,
        message: data.message,
        channel,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");
  if (customer) revalidateCustomerBooking("hotel", booking.reference);

  if (channel === "whatsapp") {
    const desk = whatsAppHref(theme.contact.whatsapp);
    const message = whatsAppText({ ...data, reference: booking.reference });
    return {
      error: null,
      success: `Saved as ${booking.reference}. Send the WhatsApp message so the desk has the same request.`,
      reference: booking.reference,
      whatsappUrl: desk ? `${desk}?text=${encodeURIComponent(message)}` : null,
      values,
    };
  }

  if (text(formData.get("surface")) === "stay") {
    return {
      error: null,
      success: `Saved as ${booking.reference}.`,
      reference: booking.reference,
      values,
    };
  }

  if (customer) {
    redirect(`/account/bookings/${booking.reference}?created=1`);
  }

  redirect(`/hotels/request?sent=1&ref=${booking.reference}`);
}
