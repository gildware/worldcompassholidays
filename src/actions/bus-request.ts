"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deskWhatsAppHref } from "@/lib/brand";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import { busCoachTypes, busTimeWindows, coachLabel, timeWindowLabel } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { emailField } from "@/lib/validation";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const coachValues = busCoachTypes.map((option) => option.value);
const timeValues = busTimeWindows.map((option) => option.value);

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function localToday() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const requestSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
    email: emailField,
    phone: z
      .string()
      .trim()
      .max(30, "That phone number is too long")
      .refine((value) => value === "" || /^[0-9+\-\s()]+$/.test(value), "Use digits, spaces, and + for the country code")
      .refine((value) => value === "" || value.replace(/\D/g, "").length >= 8, "Enter a phone number with the country code"),
    fromCity: z.string().trim().min(2, "Enter the boarding city").max(80, "That city name is too long"),
    toCity: z.string().trim().min(2, "Enter the arrival city").max(80, "That city name is too long"),
    travelDate: z.string().regex(datePattern, "Choose a travel date"),
    passengers: z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter how many passengers, from 1 to 20")
      .transform(Number)
      .pipe(z.number().min(1, "Enter how many passengers, from 1 to 20").max(20, "Enter how many passengers, from 1 to 20")),
    coach: z.string().trim().default("any"),
    timeWindow: z.string().trim().default("any"),
    busName: z.string().trim().max(120, "That bus name is too long").default(""),
    slug: z.string().trim().max(80).default(""),
    message: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  })
  .superRefine((data, ctx) => {
    if (!data.phone.replace(/\D/g, "")) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a phone number" });
    }
    if (data.travelDate < localToday()) {
      ctx.addIssue({ code: "custom", path: ["travelDate"], message: "Choose a date from today onward" });
    }
    if (!coachValues.includes(data.coach as (typeof coachValues)[number])) {
      ctx.addIssue({ code: "custom", path: ["coach"], message: "Choose a coach type" });
    }
    if (!timeValues.includes(data.timeWindow as (typeof timeValues)[number])) {
      ctx.addIssue({ code: "custom", path: ["timeWindow"], message: "Choose a time window" });
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

function requestNotes(input: z.infer<typeof requestSchema>) {
  return [
    "Custom bus request",
    `Route: ${input.fromCity} to ${input.toCity}`,
    input.busName ? `Bus they asked for: ${input.busName}` : "",
    `Travel: ${prettyDate(input.travelDate)}`,
    `Passengers: ${input.passengers}`,
    input.coach !== "any" ? `Coach: ${coachLabel(input.coach)}` : "",
    input.timeWindow !== "any" ? `Time: ${timeWindowLabel(input.timeWindow)}` : "",
    input.message ? `Note: ${input.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function whatsAppText(input: z.infer<typeof requestSchema> & { reference: string }) {
  return [`Bus request ${input.reference}`, requestNotes(input), `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.phone}`].join(
    "\n",
  );
}

export async function submitBusRequest(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const typedPhone = text(formData.get("phone")).trim();
  const phone = typedPhone || customer?.phone || "";
  const values = {
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: customer?.phone ? typedPhone : phone,
    fromCity: text(formData.get("fromCity")),
    toCity: text(formData.get("toCity")),
    travelDate: text(formData.get("travelDate")),
    passengers: text(formData.get("passengers")),
    coach: text(formData.get("coach")) || "any",
    timeWindow: text(formData.get("timeWindow")) || "any",
    busName: text(formData.get("busName")),
    slug: text(formData.get("slug")),
    message: text(formData.get("message")),
  };

  if (!customer) {
    return {
      error: "Log in to send this request.",
      values,
    };
  }

  const parsed = requestSchema.safeParse({ ...values, phone });
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
      module: "bus",
      status: "pending",
      title: data.busName ? `Bus request: ${data.busName}` : `Bus request: ${data.fromCity} to ${data.toCity}`,
      startDate: new Date(`${data.travelDate}T00:00:00`),
      endDate: new Date(`${data.travelDate}T00:00:00`),
      guests: data.passengers,
      notes: [
        requestNotes(data),
        customer.phone && typedPhone && data.phone !== customer.phone ? `Account phone: ${customer.phone}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      details: detailsWithEnquiryReceived({
        kind: "custom_bus",
        destination: `${data.fromCity} to ${data.toCity}`,
        fromCity: data.fromCity,
        toCity: data.toCity,
        itemName: data.busName,
        slug: data.slug,
        start: data.travelDate,
        passengers: data.passengers,
        coach: data.coach,
        timeWindow: data.timeWindow,
        message: data.message,
        channel,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer.id,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/enquiries");
  revalidateCustomerBooking("bus", booking.reference);

  if (channel === "whatsapp") {
    const desk = await deskWhatsAppHref();
    const message = whatsAppText({ ...data, reference: booking.reference });
    return {
      error: null,
      success: `Saved as ${booking.reference}. Send the WhatsApp message so the desk has the same request.`,
      reference: booking.reference,
      whatsappUrl: desk ? `${desk}?text=${encodeURIComponent(message)}` : null,
      values,
    };
  }

  return {
    error: null,
    success: `Saved as ${booking.reference}.`,
    reference: booking.reference,
    values,
  };
}
