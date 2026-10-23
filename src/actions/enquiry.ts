"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { theme } from "@/config/theme";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import { enquiryInterests } from "@/lib/navigation";
import { emailField } from "@/lib/validation";
import { whatsAppHref } from "@/lib/visa";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
  email: emailField,
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .max(30, "That phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, and + for the country code")
    .refine((value) => value.replace(/\D/g, "").length >= 8, "Enter a phone number with the country code"),
  interest: z.string().trim(),
  message: z.string().trim().min(10, "Tell us a little more").max(2000, "Keep the message under 2000 characters"),
});

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

function enquiryWhatsAppText(input: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}) {
  const lines = [
    `Trip enquiry ${input.reference}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
  ];
  if (input.phone) lines.push(`Phone: ${input.phone}`);
  lines.push(`About: ${input.interest}`, input.message);
  return lines.join("\n");
}

export async function submitEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const values = {
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: text(formData.get("phone")) || customer?.phone || "",
    interest: text(formData.get("interest")),
    message: text(formData.get("message")),
  };

  const parsed = enquirySchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: firstIssue(parsed.error),
      fields: fieldErrors(parsed.error),
      values,
    };
  }

  const interests = enquiryInterests();
  const interest = interests.find((item) => item.value === parsed.data.interest);
  if (!interest) {
    return {
      error: "Choose what you want to book",
      fields: { interest: "Choose what you want to book" },
      values,
    };
  }

  const channel = text(formData.get("channel")) === "whatsapp" ? "whatsapp" : "form";
  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: parsed.data.interest,
      status: "enquiry",
      title: "Website enquiry",
      notes: `${interest.label}\n${parsed.data.message}`,
      details: detailsWithEnquiryReceived({
        interest: parsed.data.interest,
        channel,
      }),
      contactName: parsed.data.name,
      contactEmail: parsed.data.email,
      contactPhone: parsed.data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");
  if (customer) revalidateCustomerBooking(parsed.data.interest, booking.reference);

  if (channel === "whatsapp") {
    const desk = whatsAppHref(theme.contact.whatsapp);
    const message = enquiryWhatsAppText({
      reference: booking.reference,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      interest: interest.label,
      message: parsed.data.message,
    });
    return {
      error: null,
      success: `Saved as ${booking.reference}. Send the WhatsApp message so the desk has the same request.`,
      reference: booking.reference,
      whatsappUrl: desk ? `${desk}?text=${encodeURIComponent(message)}` : null,
      values,
    };
  }

  if (customer) {
    redirect(`/account/bookings/${booking.reference}?created=1`);
  }

  redirect(`/contact?sent=1&ref=${booking.reference}`);
}
