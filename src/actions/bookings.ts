"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appendBookingActivity } from "@/lib/booking-activity";
import { notifyEnquiryStatusChange } from "@/lib/booking-notify";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { revalidateCustomerBooking } from "@/lib/account-revalidate";
import { bookingStatuses, parseBookingDetails, statusLabel } from "@/lib/bookings";
import { enquiryStatusLabel, enquiryStatuses, isCustomEnquiry } from "@/lib/enquiries";

const statusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.string().trim().min(1),
});

const noteSchema = z.object({
  bookingId: z.string().min(1),
  note: z.string().max(1000),
});

const quoteSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.coerce.number().int().min(0).max(50_000_000),
  currency: z.string().trim().min(3).max(3).default("INR"),
});

function deskPathForModule(module: string) {
  switch (module) {
    case "tour":
      return "/admin/bookings/tours";
    case "hotel":
      return "/admin/bookings/hotels";
    case "visa":
      return "/admin/bookings/visa";
    case "assist":
      return "/admin/bookings/assist";
    default:
      return "/admin/bookings";
  }
}

function revalidateBookingPaths(module: string, reference: string, bookingId: string) {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${bookingId}`);
  revalidatePath(deskPathForModule(module));
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin");
  revalidateCustomerBooking(module, reference);
}

const assigneeSchema = z.object({
  bookingId: z.string().min(1),
  assigneeId: z.string().optional(),
});

export async function updateBookingAssignee(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("bookings.manage");

  const rawAssignee = String(formData.get("assigneeId") ?? "").trim();
  const parsed = assigneeSchema.safeParse({
    bookingId: formData.get("bookingId"),
    assigneeId: rawAssignee || undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!existing) return { error: "Booking not found." };

  let assigneeName = "";
  if (parsed.data.assigneeId) {
    const staff = await prisma.user.findFirst({
      where: {
        id: parsed.data.assigneeId,
        isActive: true,
        role: { scope: "staff" },
      },
      select: { id: true, name: true },
    });
    if (!staff) return { error: "Choose an active staff member." };
    assigneeName = staff.name;
  }

  const details = parseBookingDetails(existing.details);
  if (parsed.data.assigneeId) {
    details.assigneeId = parsed.data.assigneeId;
    details.assigneeName = assigneeName;
  } else {
    delete details.assigneeId;
    delete details.assigneeName;
  }

  const booking = await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: { details: JSON.stringify(details) },
  });

  revalidateBookingPaths(booking.module, booking.reference, booking.id);
  return {
    error: null,
    success: parsed.data.assigneeId ? "Owner assigned." : "Owner cleared.",
  };
}

export async function updateBookingStatus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("bookings.manage");

  const parsed = statusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });
  if (!existing) return { error: "Booking not found." };
  const custom = isCustomEnquiry(parseBookingDetails(existing.details));
  const allowed = custom ? enquiryStatuses : bookingStatuses;
  if (!(allowed as readonly string[]).includes(parsed.data.status)) {
    return { error: "Choose a status." };
  }
  const current = custom && existing.status === "enquiry" ? "pending" : existing.status;
  if (current === parsed.data.status) {
    return { error: null, success: "Already on that status." };
  }

  const details = appendBookingActivity(existing.details, {
    status: parsed.data.status,
    message: `Status changed to ${custom ? enquiryStatusLabel(parsed.data.status) : statusLabel(parsed.data.status)}`,
    actorName: actor.name,
  });

  const booking = await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: {
      status: parsed.data.status,
      details,
    },
  });

  revalidateBookingPaths(booking.module, booking.reference, booking.id);

  void notifyEnquiryStatusChange({
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    reference: booking.reference,
    title: booking.title,
    module: booking.module,
    status: booking.status,
    previousStatus: existing.status,
    amount: booking.amount,
    currency: booking.currency,
    hasAccount: Boolean(booking.userId),
  }).catch((error) => console.error("[notify:enquiry]", error));

  return { error: null, success: "Status updated. Guest notified by email when mail is configured." };
}

export async function updateBookingStaffNote(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("bookings.manage");

  const parsed = noteSchema.safeParse({
    bookingId: formData.get("bookingId"),
    note: String(formData.get("note") ?? "").trim(),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!existing) return { error: "Booking not found." };

  const details = parseBookingDetails(existing.details);
  details.staffNote = parsed.data.note;

  const booking = await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: { details: JSON.stringify(details) },
  });

  revalidateBookingPaths(booking.module, booking.reference, booking.id);
  return { error: null, success: "Staff note saved." };
}

export async function updateBookingQuote(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("bookings.manage");

  const parsed = quoteSchema.safeParse({
    bookingId: formData.get("bookingId"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || "INR",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const booking = await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: {
      amount: parsed.data.amount,
      currency: parsed.data.currency.toUpperCase(),
    },
  });

  revalidateBookingPaths(booking.module, booking.reference, booking.id);
  return { error: null, success: "Quote amount saved." };
}
