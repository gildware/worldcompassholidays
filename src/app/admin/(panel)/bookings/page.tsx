import type { Metadata } from "next";
import { BookingStatusForm } from "@/components/admin/BookingStatusForm";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { statusLabel } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  const user = await requirePermission("bookings.view");
  const canManage = can(user, "bookings.manage");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Tours, hotels, cars, and bikes share this list. Website messages
        arrive as enquiries.
        {canManage ? "" : " Your role can view bookings but not change them."}
      </p>
      {bookings.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No bookings yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
          {bookings.map((booking) => (
            <li key={booking.id} className="px-4 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{booking.title}</p>
                <p className="text-muted">{booking.reference}</p>
              </div>
              <p className="mt-1 text-muted">
                {booking.contactName} · {booking.contactEmail} · {booking.module} ·{" "}
                {statusLabel(booking.status)} · {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
                {booking.user ? " · has account" : " · guest enquiry"}
              </p>
              {booking.notes ? <p className="mt-2">{booking.notes}</p> : null}
              <p className="mt-2 text-muted">
                Received {formatDate(booking.createdAt)}
                {booking.startDate ? ` · starts ${formatDate(booking.startDate)}` : ""}
              </p>
              {canManage ? (
                <BookingStatusForm bookingId={booking.id} status={booking.status} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
