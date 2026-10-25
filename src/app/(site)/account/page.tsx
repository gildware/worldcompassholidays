import type { Metadata } from "next";
import Link from "next/link";
import { BookingList } from "@/components/account/BookingList";
import { RentalAccountList } from "@/components/account/FleetAccountPage";
import { requireCustomer } from "@/lib/auth/guards";
import { visibleAccountSections } from "@/lib/account-sections";
import { prisma } from "@/lib/db";
import { listFavoriteCards } from "@/lib/favorites";
import { isCustomEnquiry } from "@/lib/enquiries";
import { parseBookingDetails } from "@/lib/bookings";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("My account", "Your World Compass Holidays bookings and profile.");

export default async function AccountPage() {
  const user = await requireCustomer("account.bookings.view");
  const sections = visibleAccountSections();

  const [bookings, rentals, favorites] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalBooking.findMany({
      where: { userId: user.id },
      include: { vehicle: { select: { name: true, registrationNumber: true, kind: true } } },
      orderBy: { pickupAt: "desc" },
    }),
    listFavoriteCards(user.id),
  ]);

  const confirmed = bookings.filter((booking) => !isCustomEnquiry(parseBookingDetails(booking.details)));
  const enquiries = bookings.filter((booking) => isCustomEnquiry(parseBookingDetails(booking.details)));
  const knownModules = new Set(sections.map((section) => section.module));
  const otherBookings = confirmed.filter((booking) => !knownModules.has(booking.module));
  const stats = sections.map((section) => {
    const count = confirmed.filter((booking) => booking.module === section.module).length;
    const fleet = section.fleet
      ? rentals.filter((booking) => booking.vehicle.kind === section.fleet).length
      : 0;
    return { ...section, value: count + fleet };
  });
  const hasAnything = stats.some((stat) => stat.value > 0) || otherBookings.length > 0 || enquiries.length > 0;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-xl font-semibold leading-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Hello, {user.name}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/account/favorites" className="rounded-lg border border-line bg-white px-4 py-3 hover:border-brand/40">
          <p className="text-xs text-muted">Favorites</p>
          <p className="mt-1 text-2xl font-semibold leading-none">{favorites.length}</p>
          <p className="mt-1.5 text-xs text-muted">Tours, hotels, cars, and bikes you saved</p>
        </Link>
        <Link href="/account/enquiries" className="rounded-lg border border-line bg-white px-4 py-3 hover:border-brand/40">
          <p className="text-xs text-muted">Enquiries</p>
          <p className="mt-1 text-2xl font-semibold leading-none">{enquiries.length}</p>
          <p className="mt-1.5 text-xs text-muted">Tour, hotel, car, and bike requests</p>
        </Link>
        {stats.map((stat) => (
          <Link
            key={stat.key}
            href={stat.href}
            className="rounded-lg border border-line bg-white px-4 py-3 hover:border-brand/40"
          >
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold leading-none">{stat.value}</p>
            <p className="mt-1.5 text-xs text-muted">{stat.description}</p>
          </Link>
        ))}
      </div>

      {hasAnything ? (
        <div className="grid gap-5">
          {stats.map((stat) => {
            const sectionBookings = confirmed.filter((booking) => booking.module === stat.module).slice(0, 3);
            const sectionRentals = stat.fleet
              ? rentals.filter((booking) => booking.vehicle.kind === stat.fleet).slice(0, 3)
              : [];
            if (sectionBookings.length === 0 && sectionRentals.length === 0) return null;
            return (
              <section key={stat.key} className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">{stat.label}</h2>
                  <Link href={stat.href} className="text-xs font-medium text-brand">
                    View all
                  </Link>
                </div>
                {sectionRentals.length > 0 ? <RentalAccountList bookings={sectionRentals} /> : null}
                {sectionBookings.length > 0 && !stat.fleet ? (
                  <BookingList bookings={sectionBookings} showModule={false} />
                ) : null}
              </section>
            );
          })}
          {otherBookings.length > 0 ? (
            <section className="grid gap-2">
              <h2 className="text-sm font-semibold">Other</h2>
              <BookingList bookings={otherBookings.slice(0, 3)} />
            </section>
          ) : null}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
          No bookings yet. Tour, hotel, visa, meet and assist, car, and bike each have their own list.
        </p>
      )}
    </div>
  );
}
