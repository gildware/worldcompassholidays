import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/config/modules";
import { requireStaff } from "@/lib/auth/guards";
import type { StaffPermission } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/session";
import { statusLabel } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

type Stat = {
  label: string;
  href: string;
  permission: StaffPermission;
  enabled: boolean;
  count: () => Promise<number>;
};

const stats: Stat[] = [
  {
    label: "Destinations",
    href: "/admin/destinations",
    permission: "destinations.view",
    enabled: true,
    count: () => prisma.destination.count(),
  },
  {
    label: "Tours",
    href: "/admin/tours",
    permission: "tours.view",
    enabled: modules.tours,
    count: () => prisma.tour.count(),
  },
  {
    label: "Hotels",
    href: "/admin/hotels",
    permission: "hotels.view",
    enabled: modules.hotels,
    count: () => prisma.hotel.count(),
  },
  {
    label: "Rentals",
    href: "/admin/rentals",
    permission: "vehicles.view",
    enabled: modules.cars || modules.bikes,
    count: () => prisma.vehicle.count(),
  },
  {
    label: "Bus routes",
    href: "/admin/buses",
    permission: "buses.view",
    enabled: modules.buses,
    count: () => prisma.busRoute.count(),
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    permission: "bookings.view",
    enabled: true,
    count: () => prisma.booking.count(),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    permission: "customers.view",
    enabled: true,
    count: () => prisma.user.count({ where: { role: { scope: "customer" } } }),
  },
  {
    label: "Staff",
    href: "/admin/staff",
    permission: "staff.view",
    enabled: true,
    count: () => prisma.user.count({ where: { role: { scope: "staff" } } }),
  },
];

export default async function AdminHomePage() {
  const user = await requireStaff();
  const visible = stats.filter((stat) => stat.enabled && can(user, stat.permission));
  const counts = await Promise.all(visible.map((stat) => stat.count()));
  const canSeeBookings = can(user, "bookings.view");

  const latest = canSeeBookings
    ? await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as {user.roleName}
        {user.allAccess ? " with full access." : ". You only see what your role allows."}
      </p>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">
          Your role has no permissions yet. Ask an administrator to add some.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((stat, index) => (
            <li key={stat.href}>
              <Link href={stat.href} className="block rounded-xl border border-line bg-white p-5">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{counts[index]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {canSeeBookings ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Latest bookings</h2>
          {latest.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Website enquiries will land here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
              {latest.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{booking.contactName}</p>
                    <p className="text-muted">
                      {booking.reference} · {booking.module} · {statusLabel(booking.status)}
                    </p>
                  </div>
                  <p className="text-muted">{formatDate(booking.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
