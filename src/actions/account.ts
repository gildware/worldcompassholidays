"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requireCustomer } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyUserSessions } from "@/lib/auth/session";
import { customerEditableStatuses } from "@/lib/bookings";
import { nameField, passwordField, phoneField } from "@/lib/validation";

const profileSchema = z.object({
  name: nameField,
  phone: phoneField,
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordField,
});

const bookingSchema = z.object({
  reference: z.string().min(1),
  guests: z.coerce.number().int().min(1, "At least 1 guest").max(50),
  startDate: z
    .string()
    .trim()
    .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), "Pick a valid date"),
  notes: z.string().trim().max(2000),
});

export async function updateProfile(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCustomer("account.profile.update");
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/account");
  return { error: null, success: "Profile saved." };
}

export async function changePassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCustomer("account.profile.update");
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return { error: "Current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  await destroyUserSessions(user.id);
  await createSession(user.id, "customer");

  return { error: null, success: "Password changed. Other devices were signed out." };
}

export async function updateMyBooking(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCustomer("account.bookings.update");
  const parsed = bookingSchema.safeParse({
    reference: formData.get("reference"),
    guests: formData.get("guests"),
    startDate: formData.get("startDate") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const booking = await prisma.booking.findUnique({
    where: { reference: parsed.data.reference },
  });
  if (!booking || booking.userId !== user.id) {
    return { error: "Booking not found." };
  }
  if (!customerEditableStatuses.includes(booking.status)) {
    return { error: "This booking is confirmed. Contact us to change it." };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      guests: parsed.data.guests,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/account");
  revalidatePath(`/account/bookings/${booking.reference}`);
  return { error: null, success: "Booking updated." };
}
