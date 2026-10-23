import Link from "next/link";
import { bookingStatusTone, moduleLabel, statusLabel } from "@/lib/bookings";
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

const toneClass: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-800",
  warn: "bg-amber-50 text-amber-900",
  info: "bg-sky-50 text-sky-900",
  danger: "bg-rose-50 text-rose-800",
  neutral: "bg-surface text-navy",
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
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  toneClass[bookingStatusTone(booking.status)] ?? toneClass.neutral
                }`}
              >
                {statusLabel(booking.status)}
              </span>
              <p className="mt-0.5 text-xs text-muted">{formatDate(booking.createdAt)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
