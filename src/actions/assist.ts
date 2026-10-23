"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import {
  assistExtraLabel,
  assistExtras,
  assistServiceLabel,
  assistServices,
  assistWhatsAppText,
  whatsAppHref,
} from "@/lib/assist";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import { theme } from "@/config/theme";
import { airportLabel, findAirport } from "@/lib/data/airports";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/forms";
import { emailField } from "@/lib/validation";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function localToday() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const timePattern = /^([01]\d|2[0-3]):(00|30)$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const assistSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the name on the booking").max(80, "That name is too long"),
    email: emailField,
    phone: z
      .string()
      .trim()
      .min(8, "Enter a phone number with the country code")
      .max(20, "That phone number is too long")
      .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, and + for the country code"),
    service: z.string().refine(
      (value): value is (typeof assistServices)[number] =>
        (assistServices as readonly string[]).includes(value),
      "Choose arrival, departure, a connection, or both",
    ),
    airport: z.string().trim().min(2, "Choose an airport"),
    airportName: z.string().trim().max(80, "That airport name is too long").default(""),
    flightDate: z.string().regex(datePattern, "Choose the flight date"),
    flightTime: z.string().regex(timePattern, "Choose a flight time"),
    flightNumber: z
      .string()
      .trim()
      .min(2, "Enter the flight number")
      .max(10, "That flight number is too long")
      .regex(/^[A-Za-z0-9 ]+$/, "Use letters and digits for the flight number"),
    returnDate: z.string().default(""),
    returnTime: z.string().default(""),
    returnFlight: z.string().trim().max(10, "That flight number is too long").default(""),
    travellers: z
      .string()
      .trim()
      .min(1, "Enter how many travellers to meet")
      .regex(/^\d+$/, "Enter a whole number of travellers")
      .transform(Number)
      .pipe(z.number().min(1, "Add at least one traveller").max(20, "One request can cover up to 20 travellers")),
    extras: z.array(z.string()).default([]),
    message: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  })
  .superRefine((data, ctx) => {
    if (data.airport === "other" && data.airportName.trim().length < 2) {
      ctx.addIssue({ code: "custom", path: ["airportName"], message: "Enter the airport name" });
    }
    if (data.airport !== "other" && !findAirport(data.airport)) {
      ctx.addIssue({ code: "custom", path: ["airport"], message: "Choose an airport from the list" });
    }
    if (data.flightDate < localToday()) {
      ctx.addIssue({ code: "custom", path: ["flightDate"], message: "Choose a flight date from today onward" });
    }
    if (data.service !== "round") return;
    if (!datePattern.test(data.returnDate)) {
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Choose the return flight date" });
    } else if (data.returnDate < data.flightDate) {
      ctx.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "The return flight must be on or after the first flight",
      });
    }
    if (!timePattern.test(data.returnTime)) {
      ctx.addIssue({ code: "custom", path: ["returnTime"], message: "Choose the return flight time" });
    }
    if (!/^[A-Za-z0-9 ]{2,10}$/.test(data.returnFlight)) {
      ctx.addIssue({ code: "custom", path: ["returnFlight"], message: "Enter the return flight number" });
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

function day(value: string) {
  return new Date(`${value}T00:00:00`);
}

function placeLabel(code: string, written: string) {
  if (code === "other") return written.trim();
  const airport = findAirport(code);
  return airport ? `${airportLabel(airport)} · ${airport.name}` : written.trim();
}

export async function submitAssistRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const extras = formData
    .getAll("extras")
    .map(String)
    .filter((item) => (assistExtras as readonly string[]).includes(item));
  const values = {
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: text(formData.get("phone")) || customer?.phone || "",
    service: text(formData.get("service")),
    airport: text(formData.get("airport")),
    airportName: text(formData.get("airportName")),
    flightDate: text(formData.get("flightDate")),
    flightTime: text(formData.get("flightTime")),
    flightNumber: text(formData.get("flightNumber")),
    returnDate: text(formData.get("returnDate")),
    returnTime: text(formData.get("returnTime")),
    returnFlight: text(formData.get("returnFlight")),
    travellers: text(formData.get("travellers")),
    extras: extras.join(","),
    message: text(formData.get("message")),
  };

  const parsed = assistSchema.safeParse({
    ...values,
    extras,
  });
  if (!parsed.success) {
    return {
      error: "Check the highlighted fields.",
      fields: fieldErrors(parsed.error),
      values,
    };
  }

  const data = parsed.data;
  const channel = text(formData.get("channel")) === "whatsapp" ? "whatsapp" : "form";
  const airport = data.airport === "other" ? null : findAirport(data.airport);
  const airportName = airport ? airport.name : data.airportName.trim();
  const city = airport?.city ?? "";
  const place = placeLabel(data.airport, airportName);
  const flightNumber = data.flightNumber.replace(/\s+/g, "").toUpperCase();
  const returnFlight = data.service === "round" ? data.returnFlight.replace(/\s+/g, "").toUpperCase() : "";
  const extraLabels = data.extras.map(assistExtraLabel);
  const notes = [
    `${assistServiceLabel(data.service)} at ${place}.`,
    `Flight ${flightNumber} at ${data.flightTime}.`,
    data.service === "round" ? `Return flight ${returnFlight} at ${data.returnTime}.` : "",
    extraLabels.length ? `Help wanted: ${extraLabels.join(", ")}.` : "",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: "assist",
      status: "enquiry",
      title: `Meet and assist · ${place}`,
      startDate: day(data.flightDate),
      endDate: day(data.service === "round" ? data.returnDate : data.flightDate),
      guests: data.travellers,
      notes,
      details: detailsWithEnquiryReceived({
        service: data.service,
        airportCode: airport?.code ?? "",
        airportName,
        city,
        flightNumber,
        flightTime: data.flightTime,
        returnFlight,
        returnTime: data.service === "round" ? data.returnTime : "",
        extras: data.extras,
        channel,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/meet-and-assist");
  if (customer) revalidateCustomerBooking("assist", booking.reference);

  if (channel === "whatsapp") {
    const desk = whatsAppHref(theme.contact.whatsapp);
    const message = assistWhatsAppText({
      reference: booking.reference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      airport: place,
      flightNumber,
      flightDate: data.flightDate,
      flightTime: data.flightTime,
      returnFlight,
      returnDate: data.returnDate,
      returnTime: data.returnTime,
      travellers: data.travellers,
      extras: data.extras,
      message: data.message,
    });
    return {
      error: null,
      success: `Saved as ${booking.reference}. Send the WhatsApp message so the desk has the same request.`,
      reference: booking.reference,
      whatsappUrl: desk ? `${desk}?text=${encodeURIComponent(message)}` : null,
      values,
    };
  }

  redirect(`/meet-and-assist?sent=1&ref=${booking.reference}`);
}

export async function updateAssistStaffNote(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("bookings.manage");

  const bookingId = text(formData.get("bookingId")).trim();
  const note = text(formData.get("note")).trim().slice(0, 1000);
  if (!bookingId) return { error: "Choose a meet and assist request." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.module !== "assist") return { error: "That request was not found." };

  let details: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(booking.details) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      details = parsed as Record<string, unknown>;
    }
  } catch {
    details = {};
  }
  details.staffNote = note;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { details: JSON.stringify(details) },
  });
  revalidatePath("/admin/meet-and-assist");
  return { error: null, success: note ? "Note saved." : "Note cleared." };
}
