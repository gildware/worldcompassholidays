import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { rentalListGroup, rentalStatusLabel } from "@/lib/rentals/labels";
import { StatusPill } from "@/components/rentals/VehicleCard";

export const metadata: Metadata = { title: "My rentals" };

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
    include: { vehicle: { select: { name: true, slug: true } } },
    orderBy: { pickupAt: "desc" },
  });
  const visible = bookings.filter((booking) => rentalListGroup(booking.status) === selected);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-sm font-medium text-brand uppercase">My rentals</p>
      <h1 className="mt-2 text-3xl font-semibold">Your car and bike bookings</h1>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/account/rentals?view=${group.id}`}
            className={[
              "rounded-full border px-3 py-1.5 text-sm",
              selected === group.id ? "border-brand bg-brand-soft font-medium text-brand" : "border-line bg-white",
            ].join(" ")}
          >
            {group.label}
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">
          Nothing in {selected} rentals. <Link href="/rentals" className="text-brand">Browse the fleet</Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
          {visible.map((booking) => (
            <li key={booking.id}>
              <Link href={`/account/rentals/${booking.reference}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
                <div>
                  <p className="font-medium">{booking.vehicle.name}</p>
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
