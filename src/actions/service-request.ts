"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import {
  bikeBudgetBands,
  bikeTypes,
  budgetNote,
  carBudgetBands,
  carTypes,
  driveOptions,
  helmetOptions,
  isBudgetValue,
  optionLabel,
  riderOptions,
  tourBudgetBands,
  tourLengths,
  tourStyles,
  transmissionOptions,
  yesNoOptions,
} from "@/lib/custom-request";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { emailField } from "@/lib/validation";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;
const kinds = ["tour", "car", "bike"] as const;

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

function normalizeTime(value: string) {
  const match = value.trim().match(timePattern);
  return match ? `${match[1]}:${match[2]}` : value.trim();
}

function valuesOf(options: readonly { value: string }[]) {
  return options.map((option) => option.value);
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
    destination: z.string().trim().max(120).default(""),
    startCity: z.string().trim().max(120).default(""),
    places: z.string().trim().max(200).default(""),
    itemName: z.string().trim().max(120, "That name is too long").default(""),
    pickupPoint: z.string().trim().max(160).default(""),
    dropMode: z.string().default(""),
    dropoffCity: z.string().trim().max(120).default(""),
    start: z.string().default(""),
    end: z.string().default(""),
    pickupTime: z.string().default(""),
    length: z.string().default(""),
    style: z.string().default(""),
    adults: z.string().default(""),
    children: z.string().default(""),
    hotelPickup: z.string().default(""),
    pickupHotel: z.string().trim().max(120).default(""),
    datesFlexible: z.string().default("no"),
    vehicleType: z.string().default("any"),
    passengers: z.string().default(""),
    drive: z.string().default(""),
    transmission: z.string().default("either"),
    childSeats: z.string().default("0"),
    bikeType: z.string().default("any"),
    riders: z.string().default(""),
    licence: z.string().default(""),
    helmets: z.string().default(""),
    budget: z.string().trim().default(""),
    message: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  })
  .superRefine((data, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (!data.phone.replace(/\D/g, "")) issue("phone", "Enter a phone number");

    if (data.kind === "tour") {
      if (data.startCity.trim().length < 2) issue("startCity", "Enter the starting city");
      if (data.places.trim().length < 2) issue("places", "Enter the places to cover");
      if (!datePattern.test(data.start)) issue("start", "Choose a start date");
      else if (data.start < localToday()) issue("start", "Choose a date from today onward");
      if (!valuesOf(tourLengths).includes(data.length)) issue("length", "Choose how long the tour should be");
      if (!valuesOf(tourStyles).includes(data.style)) issue("style", "Choose a shared group or a private tour");
      if (!/^\d+$/.test(data.adults) || Number(data.adults) < 1 || Number(data.adults) > 20) {
        issue("adults", "Enter how many adults, from 1 to 20");
      }
      if (!/^\d+$/.test(data.children) || Number(data.children) < 0 || Number(data.children) > 12) {
        issue("children", "Enter how many children, from 0 to 12");
      }
      if (!valuesOf(yesNoOptions).includes(data.hotelPickup)) issue("hotelPickup", "Say whether you want hotel pickup");
      if (data.hotelPickup === "yes" && data.pickupHotel.trim().length < 2) issue("pickupHotel", "Enter the hotel name");
      if (!valuesOf(yesNoOptions).includes(data.datesFlexible)) issue("datesFlexible", "Say whether the dates can move");
      if (!isBudgetValue(tourBudgetBands, data.budget)) issue("budget", "Choose a budget, or enter an amount from 100 to 500000");
      return;
    }

    if (data.destination.trim().length < 2) issue("destination", "Enter the pickup city");
    if (data.pickupPoint.trim().length < 2) issue("pickupPoint", "Enter the pickup point");
    if (data.dropMode === "other" && data.dropoffCity.trim().length < 2) issue("dropoffCity", "Enter the drop-off city");
    else if (data.dropoffCity && data.dropoffCity.trim().length < 2) issue("dropoffCity", "Enter the drop-off city");
    if (!datePattern.test(data.start)) issue("start", "Choose a pickup date");
    else if (data.start < localToday()) issue("start", "Choose a date from today onward");
    if (!datePattern.test(data.end)) issue("end", "Choose a return date");
    else if (datePattern.test(data.start) && data.end <= data.start) issue("end", "Return must be after the pickup date");

    if (data.kind === "car") {
      if (!timePattern.test(data.pickupTime)) issue("pickupTime", "Choose a pickup time");
      if (!valuesOf(carTypes).includes(data.vehicleType)) issue("vehicleType", "Choose a vehicle type");
      if (!/^\d+$/.test(data.passengers) || Number(data.passengers) < 1 || Number(data.passengers) > 12) {
        issue("passengers", "Enter how many passengers, from 1 to 12");
      }
      if (!valuesOf(driveOptions).includes(data.drive)) issue("drive", "Say whether you need a driver");
      if (!valuesOf(transmissionOptions).includes(data.transmission)) issue("transmission", "Choose a transmission");
      if (!/^\d+$/.test(data.childSeats) || Number(data.childSeats) < 0 || Number(data.childSeats) > 4) {
        issue("childSeats", "Enter how many child seats, from 0 to 4");
      }
      if (!isBudgetValue(carBudgetBands, data.budget)) issue("budget", "Choose a budget, or enter an amount from 100 to 500000");
      return;
    }

    if (!valuesOf(bikeTypes).includes(data.bikeType)) issue("bikeType", "Choose a bike type");
    if (!valuesOf(riderOptions).includes(data.riders)) issue("riders", "Choose solo or with a pillion");
    if (!valuesOf(yesNoOptions).includes(data.licence)) issue("licence", "Say whether you have a valid two-wheeler licence");
    if (!valuesOf(helmetOptions).includes(data.helmets)) issue("helmets", "Choose how many helmets");
    if (!isBudgetValue(bikeBudgetBands, data.budget)) issue("budget", "Choose a budget, or enter an amount from 100 to 500000");
  });

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

type RequestInput = z.infer<typeof requestSchema>;

function requestNotes(input: RequestInput) {
  const lines: string[] = [];
  if (input.kind === "tour") {
    lines.push(
      "Custom tour request",
      `Starting from: ${input.startCity}`,
      `Places: ${input.places}`,
      input.itemName ? `Tour: ${input.itemName}` : "",
      `Date: ${prettyDate(input.start)}`,
      `Length: ${optionLabel(tourLengths, input.length)}`,
      `Style: ${optionLabel(tourStyles, input.style)}`,
      `Party: ${input.adults} ${input.adults === "1" ? "adult" : "adults"}, ${input.children} ${input.children === "1" ? "child" : "children"}`,
      input.hotelPickup === "yes" ? `Hotel pickup: ${input.pickupHotel}` : "Hotel pickup: No",
      `Dates can move: ${input.datesFlexible === "yes" ? "Yes" : "No"}`,
      `Budget: ${budgetNote(tourBudgetBands, input.budget, "per person")}`,
    );
  } else if (input.kind === "car") {
    lines.push(
      "Custom car request",
      `Pickup city: ${input.destination}`,
      `Pickup point: ${input.pickupPoint}`,
      input.dropoffCity ? `Drop-off: ${input.dropoffCity}` : "Drop-off: same city",
      input.itemName ? `Model: ${input.itemName}` : "",
      `Pickup: ${prettyDate(input.start)}, ${normalizeTime(input.pickupTime)}`,
      `Return: ${prettyDate(input.end)}`,
      `Type: ${optionLabel(carTypes, input.vehicleType)}`,
      `Passengers: ${input.passengers}`,
      `Driver: ${optionLabel(driveOptions, input.drive)}`,
      `Transmission: ${optionLabel(transmissionOptions, input.transmission)}`,
      Number(input.childSeats) > 0 ? `Child seats: ${input.childSeats}` : "Child seats: none",
      `Budget: ${budgetNote(carBudgetBands, input.budget, "per day")}`,
    );
  } else {
    lines.push(
      "Custom bike request",
      `Pickup city: ${input.destination}`,
      `Pickup point: ${input.pickupPoint}`,
      input.dropoffCity ? `Drop-off: ${input.dropoffCity}` : "Drop-off: same city",
      input.itemName ? `Model: ${input.itemName}` : "",
      `Dates: ${prettyDate(input.start)} to ${prettyDate(input.end)}`,
      `Type: ${optionLabel(bikeTypes, input.bikeType)}`,
      `Riders: ${optionLabel(riderOptions, input.riders)}`,
      `Licence: ${input.licence === "yes" ? "Yes" : "No"}`,
      `Helmets: ${input.helmets}`,
      `Budget: ${budgetNote(bikeBudgetBands, input.budget, "per day")}`,
    );
  }
  if (input.message) lines.push(`Note: ${input.message}`);
  return lines.filter(Boolean).join("\n");
}

function requestTitle(input: RequestInput) {
  if (input.kind === "tour") {
    return input.itemName ? `Tour request: ${input.itemName}` : `Tour request from ${input.startCity}`;
  }
  const noun = input.kind === "car" ? "Car" : "Bike";
  if (input.itemName) return `${noun} request: ${input.itemName}`;
  if (input.dropoffCity) return `${noun} request: ${input.destination} to ${input.dropoffCity}`;
  return `${noun} request in ${input.destination}`;
}

function guestCount(input: RequestInput) {
  if (input.kind === "tour") return Number(input.adults) + Number(input.children);
  if (input.kind === "car") return Number(input.passengers);
  return Number(input.riders);
}

export async function submitServiceRequest(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const typedPhone = text(formData.get("phone")).trim();
  const phone = typedPhone || customer?.phone || "";
  const kind = text(formData.get("kind"));
  const values = {
    kind,
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: customer?.phone ? typedPhone : phone,
    destination: text(formData.get("destination")),
    startCity: text(formData.get("startCity")) || (kind === "tour" ? text(formData.get("destination")) : ""),
    places: text(formData.get("places")),
    itemName: text(formData.get("itemName")),
    pickupPoint: text(formData.get("pickupPoint")),
    dropMode: text(formData.get("dropMode")),
    dropoffCity: text(formData.get("dropMode")) === "same" ? "" : text(formData.get("dropoffCity")),
    start: text(formData.get("start")),
    end: text(formData.get("end")),
    pickupTime: normalizeTime(text(formData.get("pickupTime"))),
    length: text(formData.get("length")),
    style: text(formData.get("style")),
    adults: text(formData.get("adults")),
    children: text(formData.get("children")),
    hotelPickup: text(formData.get("hotelPickup")),
    pickupHotel: text(formData.get("pickupHotel")),
    datesFlexible: text(formData.get("datesFlexible")) || "no",
    vehicleType: text(formData.get("vehicleType")) || "any",
    passengers: text(formData.get("passengers")),
    drive: text(formData.get("drive")),
    transmission: text(formData.get("transmission")) || "either",
    childSeats: text(formData.get("childSeats")) || "0",
    bikeType: text(formData.get("bikeType")) || "any",
    riders: text(formData.get("riders")),
    licence: text(formData.get("licence")),
    helmets: text(formData.get("helmets")),
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
  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: data.kind,
      status: "pending",
      title: requestTitle(data),
      startDate: new Date(`${data.start}T00:00:00`),
      endDate: data.kind === "tour" ? null : new Date(`${data.end}T00:00:00`),
      guests: guestCount(data),
      notes: [requestNotes(data), customer.phone && typedPhone && data.phone !== customer.phone ? `Account phone: ${customer.phone}` : ""]
        .filter(Boolean)
        .join("\n"),
      details: detailsWithEnquiryReceived({
        kind: `custom_${data.kind}`,
        destination: data.kind === "tour" ? data.startCity : data.destination,
        startCity: data.startCity,
        places: data.places,
        itemName: data.itemName,
        pickupPoint: data.pickupPoint,
        dropoffCity: data.dropoffCity,
        start: data.start,
        end: data.kind === "tour" ? "" : data.end,
        pickupTime: data.kind === "car" ? normalizeTime(data.pickupTime) : "",
        length: data.length,
        style: data.style,
        adults: data.kind === "tour" ? Number(data.adults) : null,
        children: data.kind === "tour" ? Number(data.children) : null,
        hotelPickup: data.hotelPickup,
        pickupHotel: data.pickupHotel,
        datesFlexible: data.datesFlexible === "yes",
        vehicleType: data.vehicleType,
        passengers: data.kind === "car" ? Number(data.passengers) : null,
        drive: data.drive,
        transmission: data.transmission,
        childSeats: data.kind === "car" ? Number(data.childSeats) : null,
        bikeType: data.bikeType,
        riders: data.kind === "bike" ? Number(data.riders) : null,
        licence: data.licence,
        helmets: data.kind === "bike" ? Number(data.helmets) : null,
        budget: /^\d+$/.test(data.budget) ? Number(data.budget) : null,
        budgetBand: /^\d+$/.test(data.budget) || !data.budget ? null : data.budget,
        message: data.message,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer.id,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/enquiries");
  revalidateCustomerBooking(data.kind, booking.reference);

  return {
    error: null,
    success: `Saved as ${booking.reference}.`,
    reference: booking.reference,
    values,
  };
}
