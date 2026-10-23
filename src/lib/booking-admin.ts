import {
  actionBookingStatuses,
  bookingDesks,
  type BookingDeskKey,
} from "@/lib/booking-desks";
import {
  assigneeFromDetails,
  parseBookingDetails,
  staffNoteFromDetails,
} from "@/lib/bookings";
import { prisma } from "@/lib/db";
import type { NavItem } from "@/lib/navigation";

export type BookingListRow = {
  id: string;
  reference: string;
  module: string;
  status: string;
  title: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  guests: number;
  amount: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  hasAccount: boolean;
  staffNote: string;
  assigneeId: string | null;
  assigneeName: string | null;
};

export function toBookingListRow(booking: {
  id: string;
  reference: string;
  module: string;
  status: string;
  title: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  guests: number;
  amount: number;
  currency: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  details: string;
  user: { id: string } | null;
}): BookingListRow {
  const details = parseBookingDetails(booking.details);
  const assignee = assigneeFromDetails(details);
  return {
    id: booking.id,
    reference: booking.reference,
    module: booking.module,
    status: booking.status,
    title: booking.title,
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    guests: booking.guests,
    amount: booking.amount,
    currency: booking.currency,
    startDate: booking.startDate?.toISOString() ?? null,
    endDate: booking.endDate?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    hasAccount: Boolean(booking.user),
    staffNote: staffNoteFromDetails(details),
    assigneeId: assignee.assigneeId,
    assigneeName: assignee.assigneeName,
  };
}

export async function loadDeskBookings(module?: BookingDeskKey) {
  return prisma.booking.findMany({
    where: module ? { module } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true } },
    },
  });
}

export async function loadStaffAssignees() {
  return prisma.user.findMany({
    where: { isActive: true, role: { scope: "staff" } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}

export type DeskBadgeStats = {
  module: string;
  total: number;
  action: number;
  unassignedAction: number;
};

export async function loadBookingDeskStats(): Promise<DeskBadgeStats[]> {
  const enabled = bookingDesks.filter((d) => d.enabled).map((d) => d.key);
  const bookings = await prisma.booking.findMany({
    where: { module: { in: [...enabled] } },
    select: { module: true, status: true, details: true },
  });

  return enabled.map((module) => {
    const rows = bookings.filter((b) => b.module === module);
    const actionRows = rows.filter((b) =>
      (actionBookingStatuses as readonly string[]).includes(b.status),
    );
    return {
      module,
      total: rows.length,
      action: actionRows.length,
      unassignedAction: actionRows.filter((b) => {
        const { assigneeId } = assigneeFromDetails(parseBookingDetails(b.details));
        return !assigneeId;
      }).length,
    };
  });
}

export type FleetBadgeCounts = { cars: number; bikes: number };

/** Attach needs-action badges onto the Bookings nav tree. */
export function applyBookingNavBadges(
  items: NavItem[],
  stats: DeskBadgeStats[],
  fleet: FleetBadgeCounts = { cars: 0, bikes: 0 },
): NavItem[] {
  const byModule = Object.fromEntries(stats.map((s) => [s.module, s.action]));
  const deskAction = stats.reduce((sum, s) => sum + s.action, 0);
  const totalAction = deskAction + fleet.cars + fleet.bikes;

  return items.map((item) => {
    if (item.href !== "/admin/bookings") return item;
    return {
      ...item,
      badge: totalAction > 0 ? totalAction : undefined,
      children: item.children?.map((child) => {
        if (child.href === "/admin/bookings") {
          return { ...child, badge: totalAction > 0 ? totalAction : undefined };
        }
        if (child.href === "/admin/bookings/cars") {
          return { ...child, badge: fleet.cars > 0 ? fleet.cars : undefined };
        }
        if (child.href === "/admin/bookings/bikes") {
          return { ...child, badge: fleet.bikes > 0 ? fleet.bikes : undefined };
        }
        const desk = bookingDesks.find((d) => d.href === child.href);
        const count = desk ? byModule[desk.key] ?? 0 : 0;
        return { ...child, badge: count > 0 ? count : undefined };
      }),
    };
  });
}

export async function loadFleetActionCounts(): Promise<FleetBadgeCounts> {
  const [cars, bikes] = await Promise.all([
    prisma.rentalBooking.count({
      where: {
        vehicle: { kind: "car" },
        status: { in: ["pending", "documents_required", "documents_under_review"] },
      },
    }),
    prisma.rentalBooking.count({
      where: {
        vehicle: { kind: "bike" },
        status: { in: ["pending", "documents_required", "documents_under_review"] },
      },
    }),
  ]);
  return { cars, bikes };
}
