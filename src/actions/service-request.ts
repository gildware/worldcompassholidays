"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { emailField } from "@/lib/validation";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const kinds = ["tour", "car", "bike"] as const;
const budgetBands = ["upto-1000", "1000-5000", "5000-10000", "10000-20000", "above-20000"] as const;

const budgetBandNotes: Record<(typeof budgetBands)[number], string> = {
  "upto-1000": "Up to INR 1,000",
  "1000-5000": "INR 1,000 to 5,000",
  "5000-10000": "INR 5,000 to 10,000",
  "10000-20000": "INR 10,000 to 20,000",
  "above-20000": "Above INR 20,000",
};

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function localToday() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function countField(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, `Enter ${label}`)
    .transform(Number)
    .pipe(z.number().min(min, `Enter ${label}`).max(max, `Enter ${label}`));
}

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function budgetNote(value: string) {
  if ((budgetBands as readonly string[]).includes(value)) return budgetBandNotes[value as (typeof budgetBands)[number]];
  if (/^\d+$/.test(value)) return `INR ${Number(value).toLocaleString("en-IN")}`;
  return "not set";
}

const requestSchema = z
  .object({
    kind: z.enum(kinds),
    name: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
    email: emailField,
    phone: z
      .string()
      .trim()
      .max(30, "That phone number is too long")
      .refine((value) => value === "" || /^[0-9+\-\s()]+$/.test(value), "Use digits, spaces, and + for the country code")
      .refine((value) => value === "" || value.replace(/\D/g, "").length >= 8, "Enter a phone number with the country code"),
    destination: z.string().trim().min(2, "Enter the place").max(120, "That place name is too long"),
    itemName: z.string().trim().max(120, "That name is too long").default(""),
    start: z.string().regex(datePattern, "Choose a start date"),
    end: z.string().trim().default(""),
    adults: countField(1, 20, "how many adults, from 1 to 20"),
    children: countField(0, 12, "how many children, from 0 to 12"),
    budget: z
      .string()
      .trim()
      .default("")
      .refine(
        (value) =>
          value === "" ||
          (budgetBands as readonly string[]).includes(value) ||
          (/^\d+$/.test(value) && Number(value) >= 100 && Number(value) <= 500000),
        "Choose a budget, or enter an amount from 100 to 500000",
      ),
    message: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  })
  .superRefine((data, ctx) => {
    if (!data.phone.replace(/\D/g, "")) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a phone number" });
    }
    if (data.start < localToday()) {
      ctx.addIssue({ code: "custom", path: ["start"], message: "Choose a date from today onward" });
    }
    if (data.kind !== "tour" && !datePattern.test(data.end)) {
      ctx.addIssue({ code: "custom", path: ["end"], message: "Choose a return date" });
    }
    if (datePattern.test(data.end) && data.end <= data.start) {
      ctx.addIssue({ code: "custom", path: ["end"], message: "Return must be after the start date" });
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

const labels = {
  tour: { noun: "Tour", place: "Place" },
  car: { noun: "Car", place: "Pickup city" },
  bike: { noun: "Bike", place: "Pickup city" },
} as const;

function requestNotes(input: z.infer<typeof requestSchema>) {
  const copy = labels[input.kind];
  const lines = [
    `Custom ${copy.noun.toLowerCase()} request`,
    `${copy.place}: ${input.destination}`,
    input.itemName ? `Asked for: ${input.itemName}` : "",
    input.end && datePattern.test(input.end)
      ? `Dates: ${prettyDate(input.start)} to ${prettyDate(input.end)}`
      : `Date: ${prettyDate(input.start)}`,
    `Party: ${input.adults} ${input.adults === 1 ? "adult" : "adults"}, ${input.children} ${input.children === 1 ? "child" : "children"}`,
    `Budget: ${budgetNote(input.budget)}`,
    input.message ? `Note: ${input.message}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function submitServiceRequest(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const typedPhone = text(formData.get("phone")).trim();
  const phone = typedPhone || customer?.phone || "";
  const values = {
    kind: text(formData.get("kind")),
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: customer?.phone ? typedPhone : phone,
    destination: text(formData.get("destination")),
    itemName: text(formData.get("itemName")),
    start: text(formData.get("start")),
    end: text(formData.get("end")),
    adults: text(formData.get("adults")),
    children: text(formData.get("children")),
    budget: text(formData.get("budget")),
    message: text(formData.get("message")),
  };

  if (!customer) {
    return { error: "Log in to send this request.", values };
  }

  const parsed = requestSchema.safeParse({ ...values, phone });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), fields: fieldErrors(parsed.error), values };
  }

  const data = parsed.data;
  const copy = labels[data.kind];
  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: data.kind,
      status: "enquiry",
      title: data.itemName ? `${copy.noun} request: ${data.itemName}` : `${copy.noun} request in ${data.destination}`,
      startDate: new Date(`${data.start}T00:00:00`),
      endDate: datePattern.test(data.end) ? new Date(`${data.end}T00:00:00`) : null,
      guests: data.adults + data.children,
      notes: [requestNotes(data), customer.phone && typedPhone && data.phone !== customer.phone ? `Account phone: ${customer.phone}` : ""]
        .filter(Boolean)
        .join("\n"),
      details: detailsWithEnquiryReceived({
        kind: `custom_${data.kind}`,
        destination: data.destination,
        itemName: data.itemName,
        start: data.start,
        end: data.end,
        adults: data.adults,
        children: data.children,
        budget: /^\d+$/.test(data.budget) ? Number(data.budget) : null,
        budgetBand: (budgetBands as readonly string[]).includes(data.budget) ? data.budget : null,
        message: data.message,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer.id,
    },
  });

  revalidatePath("/admin/bookings");
  revalidateCustomerBooking(data.kind, booking.reference);

  return {
    error: null,
    success: `Saved as ${booking.reference}.`,
    reference: booking.reference,
    values,
  };
}
