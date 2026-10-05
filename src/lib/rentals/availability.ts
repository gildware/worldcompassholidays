import { prisma } from "@/lib/db";
import { blockingBookingStatuses } from "@/lib/rentals/labels";

type Window = { startAt: Date; endAt: Date };

export function rangesOverlap(a: Window, b: Window) {
  return a.startAt < b.endAt && a.endAt > b.startAt;
}

export function expiryState(expiry: Date | null | undefined, now = new Date()) {
  if (!expiry) return "none" as const;
  const ms = expiry.getTime() - now.getTime();
  if (ms < 0) return "expired" as const;
  if (ms <= 30 * 24 * 60 * 60 * 1000) return "soon" as const;
  return "ok" as const;
}

export async function findAvailabilityConflicts(input: {
  vehicleId: string;
  pickupAt: Date;
  returnAt: Date;
  ignoreBookingId?: string;
}) {
  const [bookings, blocks] = await Promise.all([
    prisma.rentalBooking.findMany({
      where: {
        vehicleId: input.vehicleId,
        status: { in: [...blockingBookingStatuses] },
        id: input.ignoreBookingId ? { not: input.ignoreBookingId } : undefined,
        pickupAt: { lt: input.returnAt },
        returnAt: { gt: input.pickupAt },
      },
      select: { id: true, reference: true, status: true },
    }),
    prisma.vehicleBlock.findMany({
      where: {
        vehicleId: input.vehicleId,
        startAt: { lt: input.returnAt },
        endAt: { gt: input.pickupAt },
      },
      select: { id: true, kind: true, reason: true },
    }),
  ]);

  return { bookings, blocks };
}

export function vehicleCanBeBooked(status: string) {
  return status === "available";
}

export function unavailableReason(input: {
  status: string;
  bookings: { reference: string }[];
  blocks: { kind: string }[];
}) {
  if (input.status === "inactive") return "This vehicle is inactive.";
  if (input.status === "maintenance") return "This vehicle is in maintenance.";
  if (input.status === "on_hold") return "This vehicle is on hold.";
  if (input.bookings.length > 0) {
    return `Already booked (${input.bookings[0].reference}).`;
  }
  if (input.blocks.some((block) => block.kind === "maintenance")) {
    return "In maintenance for those dates.";
  }
  if (input.blocks.length > 0) return "Held for those dates.";
  return null;
}

export function effectiveVehicleStatus(input: {
  status: string;
  now?: Date;
  bookings: { status: string; pickupAt: Date; returnAt: Date }[];
}) {
  if (input.status !== "available") return input.status;
  const now = input.now ?? new Date();
  const current = input.bookings.find(
    (booking) =>
      blockingBookingStatuses.includes(
        booking.status as (typeof blockingBookingStatuses)[number],
      ) &&
      booking.pickupAt <= now &&
      booking.returnAt > now,
  );
  if (!current) {
    const upcoming = input.bookings.some(
      (booking) =>
        blockingBookingStatuses.includes(
          booking.status as (typeof blockingBookingStatuses)[number],
        ) && booking.pickupAt > now,
    );
    return upcoming ? "booked" : "available";
  }
  if (current.status === "active" || current.status === "return_pending") {
    return "active";
  }
  return "booked";
}

export function handoverModes(input: {
  systemPickup: boolean;
  systemDelivery: boolean;
  vehiclePickup: boolean;
  vehicleDelivery: boolean;
}) {
  return {
    counter: input.systemPickup && input.vehiclePickup,
    delivery: input.systemDelivery && input.vehicleDelivery,
  };
}

export function cancellationRefund(input: {
  pickupAt: Date;
  cancelledAt: Date;
  policies: { hoursBeforePickup: number | null; refundPercent: number; name: string }[];
}) {
  const hours =
    (input.pickupAt.getTime() - input.cancelledAt.getTime()) / (60 * 60 * 1000);
  const matches = input.policies
    .filter(
      (policy) =>
        policy.hoursBeforePickup !== null && hours >= policy.hoursBeforePickup,
    )
    .sort((a, b) => (b.hoursBeforePickup ?? 0) - (a.hoursBeforePickup ?? 0));
  const match = matches[0];
  if (!match) {
    return {
      hours,
      refundPercent: 0,
      policyName: hours < 0 ? "After pickup" : "No matching cancellation window",
    };
  }
  return {
    hours,
    refundPercent: match.refundPercent,
    policyName: match.name,
  };
}
