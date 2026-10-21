import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { rentalListGroup, rentalStatusLabel } from "@/lib/rentals/labels";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("My rentals", "Car and bike rentals on your World Compass Holidays account.");

const groups = [
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export default async function MyRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireCustomer("account.bookings.view");
  const { view } = await searchParams;
  const selected = groups.some((group) => group.id === view) ? view! : "upcoming";
  const bookings = await prisma.rentalBooking.findMany({
    where: { userId: user.id },
    include: { vehicle: { select: { name: true, slug: true, registrationNumber: true } } },
    orderBy: { pickupAt: "desc" },
  });
  const visible = bookings.filter((booking) => rentalListGroup(booking.status) === selected);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold leading-tight">Rentals</h1>
        <p className="mt-1 text-sm text-muted">Cars and bikes</p>
      </div>
      <div className="flex gap-1.5 overflow-x-auto">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/account/rentals?view=${group.id}`}
            className={[
              "rounded-full border px-3 py-1 text-sm",
              selected === group.id ? "border-brand bg-brand-soft font-medium text-brand" : "border-line bg-white",
            ].join(" ")}
          >
            {group.label}
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
          Nothing in {selected} rentals. <Link href="/rentals" className="text-brand">Browse the fleet</Link>
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {visible.map((booking) => (
            <li key={booking.id}>
              <Link href={`/account/rentals/${booking.reference}`} className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 text-sm hover:bg-surface">
                <div>
                  <p className="font-medium">{booking.vehicle.name}</p>
                  <p className="text-xs font-medium tracking-wide">{booking.vehicle.registrationNumber}</p>
                  <p className="text-muted">
                    {booking.reference} · {formatDateTime(booking.pickupAt)} – {formatDateTime(booking.returnAt)}
                  </p>
                </div>
                <div className="text-right">
                  <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
                  <p className="mt-1 text-muted">{formatMoney(booking.amountDue, booking.currency)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
