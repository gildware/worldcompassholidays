import Link from "next/link";
import { moduleLabel, statusLabel } from "@/lib/bookings";
import { formatDate } from "@/lib/format";

export type AccountBookingRow = {
  id: string;
  reference: string;
  title: string;
  module: string;
  guests: number;
  status: string;
  createdAt: Date;
};

export function BookingList({
  bookings,
  showModule = true,
}: {
  bookings: AccountBookingRow[];
  showModule?: boolean;
}) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Link
            href={`/account/bookings/${booking.reference}`}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm hover:bg-surface"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{booking.title}</p>
              <p className="truncate text-xs text-muted">
                {booking.reference}
                {showModule ? ` · ${moduleLabel(booking.module)}` : ""} · {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium">{statusLabel(booking.status)}</p>
              <p className="text-xs text-muted">{formatDate(booking.createdAt)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
