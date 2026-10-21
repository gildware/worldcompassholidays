import type { Metadata } from "next";
import Link from "next/link";
import { BookingList } from "@/components/account/BookingList";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { rentalStatusLabel } from "@/lib/rentals/labels";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("My account", "Your World Compass Holidays bookings and profile.");

const closedRentals = ["completed", "cancelled", "rejected"];

export default async function AccountPage() {
  const user = await requireCustomer("account.bookings.view");

  const [bookingCount, openEnquiries, activeRentals, recentBookings, recentRentals] = await Promise.all([
    prisma.booking.count({ where: { userId: user.id } }),
    prisma.booking.count({ where: { userId: user.id, status: { in: ["enquiry", "quoted"] } } }),
    prisma.rentalBooking.count({ where: { userId: user.id, status: { notIn: closedRentals } } }),
    prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.rentalBooking.findMany({
      where: { userId: user.id },
      include: { vehicle: { select: { name: true } } },
      orderBy: { pickupAt: "desc" },
      take: 4,
    }),
  ]);

  const stats = [
    { href: "/account/bookings", label: "Bookings", value: bookingCount, hint: "Trips and enquiries" },
    { href: "/account/bookings", label: "Open enquiries", value: openEnquiries, hint: "Waiting on the team" },
    { href: "/account/rentals", label: "Rentals", value: activeRentals, hint: "Upcoming or on the road" },
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Hello, {user.name}</p>
        </div>
        <Link href="/contact" className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white">
          New enquiry
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-line bg-white px-4 py-3 hover:border-brand/40"
          >
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold leading-none">{stat.value}</p>
            <p className="mt-1.5 text-xs text-muted">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <section className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Recent bookings</h2>
          <Link href="/account/bookings" className="text-xs font-medium text-brand">
            View all
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
            No bookings yet. Send an enquiry and it will show up here.
          </p>
        ) : (
          <BookingList bookings={recentBookings} />
        )}
      </section>

      <section className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Recent rentals</h2>
          <Link href="/account/rentals" className="text-xs font-medium text-brand">
            View all
          </Link>
        </div>
        {recentRentals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
            No rentals yet. <Link href="/rentals" className="text-brand">Browse the fleet</Link>
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
            {recentRentals.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/account/rentals/${booking.reference}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{booking.vehicle.name}</p>
                    <p className="truncate text-xs text-muted">
                      {booking.reference} · {formatDateTime(booking.pickupAt)}
                    </p>
                  </div>
                  <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
