import type { Metadata } from "next";
import { BookingsOverview } from "@/components/admin/BookingsOverview";
import { requirePermission } from "@/lib/auth/guards";
import { loadBookingDeskStats, loadFleetActionCounts } from "@/lib/booking-admin";
import { deskSegmentForModule } from "@/lib/booking-desks";
import { prisma } from "@/lib/db";
import { notCustomEnquiryWhere } from "@/lib/enquiries";

export const metadata: Metadata = { title: "Bookings overview" };

export default async function AdminBookingsOverviewPage() {
  await requirePermission("bookings.view");

  const [stats, rentalAction, enquiryRecent, rentalRecent] = await Promise.all([
    loadBookingDeskStats(),
    loadFleetActionCounts(),
    prisma.booking.findMany({
      where: notCustomEnquiryWhere(),
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        reference: true,
        module: true,
        status: true,
        title: true,
        contactName: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.rentalBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        reference: true,
        status: true,
        contactName: true,
        amountDue: true,
        currency: true,
        createdAt: true,
        vehicle: { select: { kind: true, name: true } },
      },
    }),
  ]);

  const recent = [
    ...enquiryRecent.map((row) => ({
      id: row.id,
      reference: row.reference,
      module: row.module,
      status: row.status,
      title: row.title,
      contactName: row.contactName,
      amount: row.amount,
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      href: (() => {
        const desk = deskSegmentForModule(row.module);
        return desk
          ? `/admin/bookings/${row.id}?desk=${desk}`
          : `/admin/bookings/${row.id}`;
      })(),
    })),
    ...rentalRecent.map((row) => ({
      id: row.id,
      reference: row.reference,
      module: row.vehicle.kind,
      status: row.status,
      title: row.vehicle.name,
      contactName: row.contactName,
      amount: row.amountDue,
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      href: `/admin/rentals/bookings/${row.id}?desk=${row.vehicle.kind === "bike" ? "bikes" : "cars"}`,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <BookingsOverview stats={stats} rentalAction={rentalAction} recent={recent} />
  );
}
