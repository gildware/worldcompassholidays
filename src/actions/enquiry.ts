"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ContactFormCopy } from "@/i18n/contact-form";
import { isLocale, type Locale } from "@/i18n/locales";
import { getMessagesFor, getUserLocale } from "@/i18n/get-locale";
import { prisma } from "@/lib/db";
import { deskWhatsAppHref } from "@/lib/brand";
import { firstIssue, type FormState } from "@/lib/forms";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { detailsWithEnquiryReceived } from "@/lib/booking-activity";
import { bookingReference } from "@/lib/bookings";
import { websiteEnquiryKind } from "@/lib/enquiries";
import { toEnglish } from "@/lib/i18n/to-english";
import { enquiryInterests } from "@/lib/navigation";

function enquirySchema(copy: ContactFormCopy) {
  return z.object({
    name: z.string().trim().min(2, copy.errors.name).max(80, copy.errors.nameLong),
    email: z.string().trim().toLowerCase().pipe(z.email(copy.errors.email)),
    phone: z
      .string()
      .trim()
      .min(1, copy.errors.phone)
      .max(30, copy.errors.phoneLong)
      .regex(/^[0-9+\-\s()]+$/, copy.errors.phoneFormat)
      .refine((value) => value.replace(/\D/g, "").length >= 8, copy.errors.phoneShort),
    interest: z.string().trim(),
    message: z.string().trim().min(10, copy.errors.message).max(2000, copy.errors.messageLong),
  });
}

function sameText(left: string, right: string) {
  return left.trim().toLocaleLowerCase("en") === right.trim().toLocaleLowerCase("en");
}

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
  nameEn: string;
  email: string;
  phone: string;
  interest: string;
  interestSource: string;
  message: string;
  messageEn: string;
  locale: Locale;
}) {
  const lines = [`Trip enquiry ${input.reference}`, `Language: ${input.locale}`, `Name: ${input.name}`];
  if (input.nameEn && !sameText(input.nameEn, input.name)) lines.push(`Name in English: ${input.nameEn}`);
  lines.push(`Email: ${input.email}`);
  if (input.phone) lines.push(`Phone: ${input.phone}`);
  lines.push(`About: ${input.interest}`);
  if (input.interestSource && !sameText(input.interestSource, input.interest)) {
    lines.push(`About as submitted: ${input.interestSource}`);
  }
  lines.push(input.message);
  if (input.messageEn && !sameText(input.messageEn, input.message)) {
    lines.push("", "English:", input.messageEn);
  }
  return lines.join("\n");
}

export async function submitEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;
  const submittedLocale = text(formData.get("locale"));
  const locale: Locale = isLocale(submittedLocale) ? submittedLocale : await getUserLocale();
  const copy = (await getMessagesFor(locale)).contactForm;
  const values = {
    name: customer?.name ?? text(formData.get("name")),
    email: customer?.email ?? text(formData.get("email")),
    phone: text(formData.get("phone")) || customer?.phone || "",
    interest: text(formData.get("interest")),
    message: text(formData.get("message")),
  };

  const parsed = enquirySchema(copy).safeParse(values);
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
      error: copy.errors.interest,
      fields: { interest: copy.errors.interest },
      values,
    };
  }

  const interestSource =
    copy.interests[parsed.data.interest as keyof ContactFormCopy["interests"]] || interest.label;
  const [nameEn, messageEn] = await Promise.all([
    toEnglish(parsed.data.name, locale),
    toEnglish(parsed.data.message, locale),
  ]);
  const channel = text(formData.get("channel")) === "whatsapp" ? "whatsapp" : "form";
  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: parsed.data.interest,
      status: "enquiry",
      title: `${interest.label} enquiry`,
      notes: messageEn || parsed.data.message,
      details: detailsWithEnquiryReceived({
        kind: websiteEnquiryKind,
        interest: parsed.data.interest,
        interestLabel: interest.label,
        interestLabelSource: interestSource,
        message: parsed.data.message,
        messageEn,
        contactNameEn: nameEn,
        locale,
        channel,
      }),
      contactName: parsed.data.name,
      contactEmail: parsed.data.email,
      contactPhone: parsed.data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/enquiries");
  if (customer) revalidateCustomerBooking(parsed.data.interest, booking.reference);

  if (channel === "whatsapp") {
    const desk = await deskWhatsAppHref();
    const message = enquiryWhatsAppText({
      reference: booking.reference,
      name: parsed.data.name,
      nameEn,
      email: parsed.data.email,
      phone: parsed.data.phone,
      interest: interest.label,
      interestSource,
      message: parsed.data.message,
      messageEn,
      locale,
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
    redirect(`/account/enquiries/${booking.reference}?created=1`);
  }

  redirect(`/contact?sent=1&ref=${booking.reference}`);
}
