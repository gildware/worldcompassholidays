import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingEditForm } from "@/components/account/BookingEditForm";
import { HotelStayReply } from "@/components/account/HotelStayReply";
import { requireCustomer } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { accountSectionForModule } from "@/lib/account-sections";
import { activityFromDetails } from "@/lib/booking-activity";
import {
  bookingStatusTone,
  customerEditableStatuses,
  moduleLabel,
  parseBookingDetails,
  statusLabel,
} from "@/lib/bookings";
import { bookedHotelStatuses, readHotelReply } from "@/lib/hotel-reply";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { privateMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return privateMetadata(`Booking ${reference}`, "A booking on your World Compass Holidays account.");
}

export default async function AccountBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireCustomer("account.bookings.view");
  const [{ reference }, { created }] = await Promise.all([params, searchParams]);

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking || booking.userId !== user.id) notFound();

  const section = accountSectionForModule(booking.module);
  const editable =
    can(user, "account.bookings.update") &&
    customerEditableStatuses.includes(booking.status);
  const canReply =
    booking.module === "hotel" &&
    bookedHotelStatuses.includes(booking.status as (typeof bookedHotelStatuses)[number]);

  const activity = activityFromDetails(parseBookingDetails(booking.details));
  const tone = bookingStatusTone(booking.status);
  const toneClass =
    {
      ok: "bg-emerald-50 text-emerald-800",
      warn: "bg-amber-50 text-amber-900",
      info: "bg-sky-50 text-sky-900",
      danger: "bg-rose-50 text-rose-800",
      neutral: "bg-surface text-navy",
    }[tone] ?? "bg-surface text-navy";

  const rows = [
    ["Service", moduleLabel(booking.module)],
    ["Guests", String(booking.guests)],
    ["Preferred start", booking.startDate ? formatDate(booking.startDate) : "Not set"],
    ["Amount", booking.amount > 0 ? formatMoney(booking.amount, booking.currency) : "Not quoted yet"],
    ["Received", formatDate(booking.createdAt)],
  ];

  return (
    <div className="grid max-w-3xl gap-5">
      <Link href={section?.href ?? "/account"} className="text-sm font-medium text-brand">
        {section?.label ?? "Account"}
      </Link>
      {created ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Enquiry sent. The team will reply soon.
        </p>
      ) : null}
      <div>
        <p className="text-sm text-muted">{booking.reference}</p>
        <h1 className="mt-1 text-2xl font-semibold">{booking.title}</h1>
        <p className="mt-2">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}>
            {statusLabel(booking.status)}
          </span>
        </p>
      </div>
      <dl className="grid gap-3 rounded-xl border border-line bg-white p-5 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted">{label}</dt>
            <dd className="mt-1 font-medium capitalize">{value}</dd>
          </div>
        ))}
        {booking.notes ? (
          <div className="sm:col-span-2">
            <dt className="text-muted">Notes</dt>
            <dd className="mt-1 whitespace-pre-line">{booking.notes}</dd>
          </div>
        ) : null}
      </dl>
      {activity.length > 0 ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Updates</h2>
          <ol className="mt-3 space-y-3">
            {activity.map((item) => (
              <li key={`${item.at}-${item.status}-${item.message}`} className="text-sm">
                <p className="font-medium text-navy">{item.message || statusLabel(item.status)}</p>
                <p className="text-xs text-muted">
                  {formatDateTime(new Date(item.at))} · {statusLabel(item.status)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {canReply ? (
        <HotelStayReply reference={booking.reference} review={readHotelReply(booking.details)} />
      ) : null}
      {editable ? (
        <BookingEditForm
          reference={booking.reference}
          guests={booking.guests}
          startDate={booking.startDate ? booking.startDate.toISOString().slice(0, 10) : ""}
          notes={booking.notes}
        />
      ) : (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          This booking is {statusLabel(booking.status).toLowerCase()} and can no longer be
          changed online. Contact us if something needs to change.
        </p>
      )}
    </div>
  );
}
