"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { bookingReference } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/forms";
import { theme } from "@/config/theme";
import { emailField } from "@/lib/validation";
import { visaWhatsAppText, whatsAppHref } from "@/lib/visa";

const visaTypes = ["tourist", "business", "family", "transit", "other"] as const;

const visaTypeLabels: Record<(typeof visaTypes)[number], string> = {
  tourist: "Tourist",
  business: "Business",
  family: "Family visit",
  transit: "Transit",
  other: "Not sure yet",
};

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function localToday() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const visaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter the full name on the passport")
      .max(80, "That name is too long"),
    email: emailField,
    phone: z
      .string()
      .trim()
      .min(8, "Enter a phone number with the country code")
      .max(20, "That phone number is too long")
      .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, and + for the country code"),
    country: z
      .string()
      .trim()
      .min(2, "Enter the country you need a visa for")
      .max(80, "That country name is too long"),
    nationality: z
      .string()
      .trim()
      .min(2, "Enter the nationality on the passport")
      .max(80, "That nationality is too long"),
    visaType: z.string().refine(
      (value): value is (typeof visaTypes)[number] =>
        (visaTypes as readonly string[]).includes(value),
      "Choose a visa type",
    ),
    departure: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a departure date"),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a return date"),
    travellers: z
      .string()
      .trim()
      .min(1, "Enter how many travellers need a visa")
      .regex(/^\d+$/, "Enter a whole number of travellers")
      .transform(Number)
      .pipe(
        z
          .number()
          .min(1, "Add at least one traveller")
          .max(20, "One request can cover up to 20 travellers"),
      ),
    message: z.string().trim().max(2000, "Keep the note under 2000 characters").default(""),
  })
  .refine((data) => data.departure >= localToday(), {
    message: "Choose a departure date from today onward",
    path: ["departure"],
  })
  .refine((data) => data.returnDate >= data.departure, {
    message: "Return must be on or after the departure date",
    path: ["returnDate"],
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

export async function submitVisaRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const values = {
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: text(formData.get("phone")) || customer?.phone || "",
    country: text(formData.get("country")),
    nationality: text(formData.get("nationality")),
    visaType: text(formData.get("visaType")),
    departure: text(formData.get("departure")),
    returnDate: text(formData.get("returnDate")),
    travellers: text(formData.get("travellers")),
    message: text(formData.get("message")),
  };

  const parsed = visaSchema.safeParse({
    ...values,
    travellers: values.travellers,
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
  const visaLabel = visaTypeLabels[data.visaType];
  const notes = [
    `${visaLabel} visa for ${data.country}.`,
    `Nationality: ${data.nationality}.`,
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: "visa",
      status: "enquiry",
      title: `Visa assistance · ${data.country}`,
      startDate: day(data.departure),
      endDate: day(data.returnDate),
      guests: data.travellers,
      notes,
      details: JSON.stringify({
        country: data.country,
        nationality: data.nationality,
        visaType: data.visaType,
        channel,
      }),
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/visa");
  if (customer) revalidateCustomerBooking("visa", booking.reference);

  if (channel === "whatsapp") {
    const desk = whatsAppHref(theme.contact.whatsapp);
    const message = visaWhatsAppText({
      reference: booking.reference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      nationality: data.nationality,
      visaType: data.visaType,
      departure: data.departure,
      returnDate: data.returnDate,
      travellers: data.travellers,
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

  redirect(`/visa-services?sent=1&ref=${booking.reference}`);
}

export async function updateVisaStaffNote(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("bookings.manage");

  const bookingId = text(formData.get("bookingId")).trim();
  const note = text(formData.get("note")).trim().slice(0, 1000);
  if (!bookingId) return { error: "Choose a visa request." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.module !== "visa") return { error: "That visa request was not found." };

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
    where: { id: bookingId },
    data: { details: JSON.stringify(details) },
  });

  revalidatePath("/admin/visa");
  return { error: null, success: "Note saved." };
}
