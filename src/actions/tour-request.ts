"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { partyBlock, quoteTour } from "@/lib/tours/quote";
import { emailField } from "@/lib/validation";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

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

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

const requestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
  email: emailField,
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .max(30, "That phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, and + for the country code")
    .refine((value) => value.replace(/\D/g, "").length >= 8, "Enter a phone number with the country code"),
  note: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  tourSlug: z.string().trim().min(1, "Choose a tour"),
  mode: z.enum(["group", "private"], { error: "Choose group or private" }),
  startDate: z.string().regex(datePattern, "Choose a start date"),
  departureId: z.string().trim().max(80).default(""),
  adults: countField(1, 20, "how many adults, from 1 to 20"),
  children: countField(0, 12, "how many children, from 0 to 12"),
  ownRoom: z.enum(["0", "1"]).default("0"),
});

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export async function submitTourRequest(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  if (!customer) {
    return { error: "Sign in to request this trip", fields: {}, values: {} };
  }
  const values = {
    name: customer.name.trim() || text(formData.get("name")),
    email: customer.email.trim() || text(formData.get("email")),
    phone: (customer.phone || "").trim() || text(formData.get("phone")),
    note: text(formData.get("note")),
    tourSlug: text(formData.get("tourSlug")),
    mode: text(formData.get("mode")) || "group",
    startDate: text(formData.get("startDate")),
    departureId: text(formData.get("departureId")),
    adults: text(formData.get("adults")),
    children: text(formData.get("children")),
    ownRoom: text(formData.get("ownRoom")) === "1" ? "1" : "0",
  };

  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), fields: fieldErrors(parsed.error), values };
  }

  const data = parsed.data;
  if (data.startDate < localToday()) {
    return { error: "Choose a start date from today onward", fields: { startDate: "Choose a start date from today onward" }, values };
  }

  const tour = await prisma.tour.findUnique({
    where: { slug: data.tourSlug },
    include: { departures: true },
  });
  if (!tour?.published) {
    return { error: "This tour is not open for requests", fields: {}, values };
  }

  const departure = data.departureId ? tour.departures.find((item) => item.id === data.departureId) : null;
  if (data.mode === "group" && data.departureId && (!departure || departure.status === "closed")) {
    return { error: "Choose an open departure", fields: { startDate: "Choose an open departure" }, values };
  }
  if (data.mode === "group" && departure && isoDay(departure.startDate) !== data.startDate) {
    return { error: "Choose an open departure", fields: { startDate: "Choose an open departure" }, values };
  }

  const listedPrice = data.mode === "group" && departure ? (departure.price > 0 ? departure.price : tour.priceFrom) : null;
  const block = partyBlock({
    mode: data.mode,
    adults: data.adults,
    children: data.children,
    minPeople: tour.minPeople,
    maxGroupSize: tour.maxGroupSize,
    seats: departure ? departure.seatsTotal : null,
  });
  if (block) return { error: block, fields: {}, values };

  const quote = quoteTour({
    priceFrom: tour.priceFrom,
    mode: data.mode,
    startIso: data.startDate,
    listedPrice,
    adults: data.adults,
    children: data.children,
    ownRoom: data.ownRoom === "1",
  });
  const endIso = departure?.endDate ? isoDay(departure.endDate) : addDays(data.startDate, Math.max(0, tour.durationDays - 1));
  const roomLabel = data.ownRoom === "1" ? "own room for every adult" : quote.singles ? `${quote.singles} single room` : "twin share";
  const notes = [
    "Tour request",
    `Tour: ${tour.title}`,
    `Start: ${prettyDate(data.startDate)}`,
    `Return: ${prettyDate(endIso)}`,
    `Way of travel: ${data.mode}`,
    quote.seasonName ? `Season: ${quote.seasonName}` : "",
    `Party: ${data.adults} adults, ${data.children} children`,
    `Rooms: ${roomLabel}`,
    `Quoted total: INR ${quote.total.toLocaleString("en-IN")}`,
    data.note ? `Note: ${data.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: "tour",
      status: "enquiry",
      title: tour.title,
      startDate: new Date(`${data.startDate}T00:00:00`),
      endDate: new Date(`${endIso}T00:00:00`),
      guests: data.adults + data.children,
      amount: quote.total,
      currency: tour.currency || "INR",
      notes,
      details: detailsWithEnquiryReceived({
        kind: "custom_tour",
        tourSlug: tour.slug,
        mode: data.mode,
        startDate: data.startDate,
        endDate: endIso,
        departureId: departure?.id ?? "",
        adults: data.adults,
        children: data.children,
        ownRoom: data.ownRoom === "1",
        singles: quote.singles,
        season: quote.seasonName,
        adultRate: quote.adult,
        childRate: quote.child,
        singleFee: quote.singleFee,
        total: quote.total,
        note: data.note,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");
  if (customer) revalidateCustomerBooking("tour", booking.reference);

  return {
    error: null,
    success: `Saved as ${booking.reference}.`,
    reference: booking.reference,
    values,
  };
}
