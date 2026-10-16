import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { blockingBookingStatuses, rentalStatusLabel } from "@/lib/rentals/labels";
import { ensureRentalDefaults } from "@/lib/rentals/defaults";

export async function RentalDesk({ kind }: { kind: "car" | "bike" }) {
  await requirePermission("vehicles.view");
  await ensureRentalDefaults();
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const base = kind === "bike" ? "/admin/rentals/bikes" : "/admin/rentals/cars";
  const noun = kind === "bike" ? "Bike" : "Car";

  const [fleet, active, pendingDocs, expiring, pickups] = await Promise.all([
    prisma.vehicle.count({ where: { kind } }),
    prisma.rentalBooking.count({ where: { status: { in: ["active", "return_pending"] }, vehicle: { kind } } }),
    prisma.rentalBooking.count({
      where: {
        status: { in: ["documents_required", "documents_under_review", "pending"] },
        vehicle: { kind },
      },
    }),
    prisma.vehicleDocument.findMany({
      where: { expiryDate: { lte: soon }, vehicle: { kind } },
      include: { vehicle: { select: { id: true, name: true } } },
      orderBy: { expiryDate: "asc" },
      take: 6,
    }),
    prisma.rentalBooking.findMany({
      where: {
        status: { in: [...blockingBookingStatuses] },
        pickupAt: { gte: now, lte: week },
        vehicle: { kind },
      },
      include: { vehicle: { select: { name: true, registrationNumber: true } } },
      orderBy: { pickupAt: "asc" },
      take: 6,
    }),
  ]);

  const stats = [
    [`${noun}s`, fleet, base],
    ["On rent", active, `${base}/bookings`],
    ["Needs review", pendingDocs, `${base}/bookings`],
  ] as const;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{noun} rental</h1>
        <p className="mt-2 text-sm text-muted">{noun}s, bookings, locations, and rules stay in this section.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
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
                  <span className="font-normal text-muted"> · {booking.vehicle.registrationNumber}</span>
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
