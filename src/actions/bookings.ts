"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { bookingStatuses } from "@/lib/bookings";

const statusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(bookingStatuses),
});

export async function updateBookingStatus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("bookings.manage");

  const parsed = statusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const booking = await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/account");
  revalidatePath(`/account/bookings/${booking.reference}`);
  return { error: null, success: "Status updated." };
}
