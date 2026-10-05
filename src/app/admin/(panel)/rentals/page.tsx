import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { blockingBookingStatuses, rentalStatusLabel } from "@/lib/rentals/labels";
import { ensureRentalDefaults } from "@/lib/rentals/defaults";

export const metadata: Metadata = { title: "Rentals" };

export default async function RentalDashboardPage() {
  await requirePermission("vehicles.view");
  await ensureRentalDefaults();
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [fleet, active, pendingDocs, unpaid, expiring, pickups, maintenance] = await Promise.all([
    prisma.vehicle.count(),
    prisma.rentalBooking.count({ where: { status: { in: ["active", "return_pending"] } } }),
    prisma.rentalBooking.count({
      where: { status: { in: ["documents_required", "documents_under_review", "pending"] } },
    }),
    prisma.rentalPayment.count({ where: { status: "unpaid" } }),
    prisma.vehicleDocument.findMany({
      where: { expiryDate: { lte: soon } },
      include: { vehicle: { select: { id: true, name: true } } },
      orderBy: { expiryDate: "asc" },
      take: 6,
    }),
    prisma.rentalBooking.findMany({
      where: {
        status: { in: [...blockingBookingStatuses] },
        pickupAt: { gte: now, lte: week },
      },
      include: { vehicle: { select: { name: true } } },
      orderBy: { pickupAt: "asc" },
      take: 6,
    }),
    prisma.maintenanceRecord.count({
      where: { status: { in: ["scheduled", "in_progress"] } },
    }),
  ]);

  const stats = [
    ["Fleet", fleet, "/admin/rentals/fleet"],
    ["On rent", active, "/admin/rentals/bookings?status=active"],
    ["Needs review", pendingDocs, "/admin/rentals/bookings"],
    ["Unpaid", unpaid, "/admin/rentals/payments"],
    ["Open maintenance", maintenance, "/admin/rentals/maintenance"],
  ] as const;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Rental desk</h1>
        <p className="mt-2 text-sm text-muted">
          Cars and bikes, bookings, documents, and payments. Online checkout can be attached to the unpaid payment records later.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, count, href]) => (
          <li key={label}>
            <Link href={href} className="block rounded-xl border border-line bg-white p-4">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{count}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="font-semibold">Pickups this week</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {pickups.length === 0 ? <li className="py-3 text-muted">No pickups scheduled.</li> : null}
            {pickups.map((booking) => (
              <li key={booking.id} className="flex justify-between gap-3 py-3">
                <Link href={`/admin/rentals/bookings/${booking.id}`} className="font-medium">
                  {booking.vehicle.name}
                </Link>
                <span className="text-muted">{rentalStatusLabel(booking.status)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="font-semibold">Document expiry</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {expiring.length === 0 ? <li className="py-3 text-muted">No documents expiring in 30 days.</li> : null}
            {expiring.map((document) => (
              <li key={document.id} className="flex justify-between gap-3 py-3">
                <Link href={`/admin/rentals/fleet/${document.vehicle.id}`} className="font-medium">
                  {document.vehicle.name} · {document.typeName}
                </Link>
                <span className="text-muted">{document.expiryDate ? formatDate(document.expiryDate) : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
