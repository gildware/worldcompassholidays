import type { Metadata } from "next";
import Link from "next/link";
import { BookingList } from "@/components/account/BookingList";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "My bookings",
  "Trips and enquiries on your World Compass Holidays account.",
);

export default async function AccountBookingsPage() {
  const user = await requireCustomer("account.bookings.view");
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">Bookings</h1>
          <p className="mt-1 text-sm text-muted">Trips and enquiries</p>
        </div>
        <Link href="/contact" className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white">
          New enquiry
        </Link>
      </div>
      {bookings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
          No bookings yet. Send an enquiry and it will show up here.
        </p>
      ) : (
        <BookingList bookings={bookings} />
      )}
    </div>
  );
}
