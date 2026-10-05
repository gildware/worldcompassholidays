import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { bookingStatuses, rentalStatusLabel } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Rental bookings" };

export default async function RentalBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requirePermission("vehicles.view");
  const { status = "", q = "" } = await searchParams;
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      ...(bookingStatuses.includes(status as (typeof bookingStatuses)[number]) ? { status } : {}),
      ...(q
        ? {
            OR: [
              { reference: { contains: q } },
              { contactName: { contains: q } },
              { contactEmail: { contains: q } },
              { vehicle: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { vehicle: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">Rental bookings</h1>
        <p className="mt-2 text-sm text-muted">These are separate from tour and hotel enquiries.</p>
      </div>
      <form method="get" className="flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Reference, name, or vehicle" className="max-w-xs" />
        <SearchableSelect
          name="status"
          defaultValue={status}
          emptyLabel="All statuses"
          ariaLabel="Booking status"
          searchPlaceholder="Search statuses"
          wrapperClassName="max-w-xs"
          className="!h-10"
          options={bookingStatuses.map((item) => ({
            value: item,
            label: rentalStatusLabel(item),
          }))}
        />
        <button type="submit" className="h-11 rounded-lg border border-line bg-white px-4 text-sm">
          Filter
        </button>
      </form>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {bookings.length === 0 ? (
          <li className="px-4 py-8 text-sm text-muted">No rental bookings yet.</li>
        ) : (
          bookings.map((booking) => (
            <li key={booking.id}>
              <Link href={`/admin/rentals/bookings/${booking.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{booking.vehicle.name}</p>
                  <p className="text-muted">
                    {booking.reference} · {booking.contactName} · {formatDateTime(booking.pickupAt)}
                  </p>
                </div>
                <div className="text-right">
                  <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
                  <p className="mt-1 text-muted">{formatMoney(booking.amountDue, booking.currency)}</p>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
