import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingDeskHint } from "@/components/admin/BookingDeskHint";
import { BookingDetailDesk } from "@/components/admin/BookingDetailDesk";
import "@/components/admin/bookings-desk.css";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { loadStaffAssignees } from "@/lib/booking-admin";
import { deskForModule } from "@/lib/booking-desks";
import { activityFromDetails } from "@/lib/booking-activity";
import { resolveEnquiryThumb } from "@/lib/booking-desk-thumb";
import {
  assigneeFromDetails,
  bookingStatusTone,
  deskJourneyLabels,
  detailRows,
  moduleLabel,
  parseBookingDetails,
  primaryBookingAction,
  staffNoteFromDetails,
  statusLabel,
} from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: booking?.reference ?? "Booking" };
}

export default async function AdminBookingDetailPage({ params }: Props) {
  const user = await requirePermission("bookings.view");
  const { id } = await params;

  const [booking, staffOptions] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
    loadStaffAssignees(),
  ]);
  if (!booking) notFound();

  const canManage = can(user, "bookings.manage");
  const details = parseBookingDetails(booking.details);
  const staffNote = staffNoteFromDetails(details);
  const assignee = assigneeFromDetails(details);
  const activity = activityFromDetails(details);
  const rows = detailRows(details).filter(
    (row) =>
      row.label !== "Assignee Id" &&
      row.label !== "Assignee Name" &&
      row.label !== "Tour" &&
      row.label !== "Hotel",
  );
  const tone = bookingStatusTone(booking.status);
  const desk = deskForModule(booking.module);
  const journey = deskJourneyLabels(booking.module);
  const primary = primaryBookingAction(booking.status);
  const thumb = await resolveEnquiryThumb(booking.module, details, booking.title);

  const phoneDigits = booking.contactPhone.replace(/\D/g, "");
  const whatsapp =
    phoneDigits.length >= 10
      ? `https://wa.me/${phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits}`
      : null;

  const deskSegment = desk?.href.split("/").pop() ?? "";
  const guestLine = [booking.contactEmail, booking.contactPhone].filter(Boolean).join(" · ");
  const datesPending = !booking.startDate && !booking.endDate;
  const hasActivity = activity.length > 0;

  return (
    <div className="bk-desk grid gap-4">
      {deskSegment ? <BookingDeskHint segment={deskSegment} /> : null}

      <nav className="bk-crumb" aria-label="Breadcrumb">
        <Link href="/admin/bookings">Bookings</Link>
        <span>/</span>
        {desk ? (
          <>
            <Link href={desk.href}>{desk.shortLabel}</Link>
            <span>/</span>
          </>
        ) : null}
        <b>{booking.reference}</b>
      </nav>

      <div className="bk-sheet">
        <div className="bk-stack">
          <header className="bk-detail-hero">
            <div
              className="bk-detail-hero__thumb"
              style={{ backgroundImage: `url(${thumb})` }}
              role="img"
              aria-label={booking.title}
            />
            <div className="bk-detail-hero__meta">
              <p className="bk-detail-hero__ref">{booking.reference}</p>
              <h1>{booking.title}</h1>
              <p className="bk-detail-hero__sub">
                {moduleLabel(booking.module)} desk · {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
                {booking.user ? " · linked account" : " · guest enquiry"}
              </p>
              <div className="bk-detail-hero__pills">
                <span className={`bk-status bk-status--${tone}`}>{statusLabel(booking.status)}</span>
                <span className="bk-status bk-status--neutral">
                  {desk?.shortLabel ?? moduleLabel(booking.module)}
                </span>
              </div>
              {primary ? <p className="bk-sla">Next: {primary.label}</p> : null}
            </div>
          </header>

          <section className="bk-panel">
            <h2>Guest</h2>
            <p className="bk-guest-name">{booking.contactName}</p>
            <p className="bk-guest-meta">{guestLine || "No contact details yet"}</p>
            {booking.user ? (
              <p className="bk-guest-meta">
                Account: {booking.user.name} ({booking.user.email})
              </p>
            ) : (
              <p className="bk-guest-meta">No customer account linked</p>
            )}
            <div className="bk-contact-actions">
              <a href={`mailto:${booking.contactEmail}`}>Email</a>
              {booking.contactPhone ? <a href={`tel:${booking.contactPhone}`}>Call</a> : null}
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              ) : null}
            </div>
          </section>

          <section className="bk-panel">
            <h2>Trip</h2>
            <div className={`bk-journey${datesPending ? " bk-journey--pending" : ""}`}>
              <div>
                <strong>{journey.from}</strong>
                <p>{booking.startDate ? formatDate(booking.startDate) : "Awaiting dates"}</p>
                <small>
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </small>
              </div>
              <div className="bk-journey__line" aria-hidden />
              <div style={{ textAlign: "right" }}>
                <strong>{journey.to}</strong>
                <p>{booking.endDate ? formatDate(booking.endDate) : "Open"}</p>
                <small>{moduleLabel(booking.module)}</small>
              </div>
            </div>
            {rows.length > 0 ? (
              <dl className="bk-dl bk-dl--2" style={{ marginTop: 14 }}>
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {booking.notes ? (
              <div className="mt-4 rounded-lg bg-surface px-3 py-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Customer notes
                </p>
                <p className="mt-1 whitespace-pre-line text-navy">{booking.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="bk-panel">
            <h2>Activity</h2>
            <ol className="bk-timeline">
              {!hasActivity ? (
                <li data-done="true">
                  <span className="bk-timeline__dot" aria-hidden />
                  <div>
                    <p>Enquiry received</p>
                    <small>{formatDateTime(booking.createdAt)} · system</small>
                  </div>
                </li>
              ) : (
                activity.map((item) => (
                  <li key={`${item.at}-${item.status}-${item.message}`} data-done="true">
                    <span className="bk-timeline__dot" aria-hidden />
                    <div>
                      <p>{item.message || statusLabel(item.status)}</p>
                      <small>
                        {formatDateTime(new Date(item.at))}
                        {item.actorName ? ` · ${item.actorName}` : ""}
                      </small>
                    </div>
                  </li>
                ))
              )}
              {primary ? (
                <li data-done="false">
                  <span className="bk-timeline__dot" aria-hidden />
                  <div>
                    <p>{primary.label}</p>
                    <small>Next · desk</small>
                  </div>
                </li>
              ) : null}
            </ol>
          </section>
        </div>

        <aside className="bk-rail">
          <div className={`bk-money${booking.amount > 0 ? "" : " bk-money--empty"}`}>
            <p className="bk-money__label">
              {booking.amount > 0 ? "Quoted total" : "Quote"}
            </p>
            <p className="bk-money__total">
              {booking.amount > 0
                ? formatMoney(booking.amount, booking.currency)
                : "Awaiting quote"}
            </p>
            <p className="bk-money__sub">
              {booking.amount > 0
                ? `${booking.currency} · shown on guest account`
                : "Add an amount under Quote & other status"}
            </p>
            {booking.amount > 0 ? (
              <ul>
                <li>
                  <span>Quoted</span>
                  <span>{formatMoney(booking.amount, booking.currency)}</span>
                </li>
                <li>
                  <span>Pipeline</span>
                  <span>{statusLabel(booking.status)}</span>
                </li>
              </ul>
            ) : null}
          </div>

          {canManage ? (
            <BookingDetailDesk
              bookingId={booking.id}
              status={booking.status}
              amount={booking.amount}
              currency={booking.currency}
              staffNote={staffNote}
              assigneeId={assignee.assigneeId}
              assigneeName={assignee.assigneeName}
              staffOptions={staffOptions}
            />
          ) : (
            <section className="bk-panel">
              <h2>Actions</h2>
              <p className="text-sm text-muted">
                Your role can view this booking but not change status, quotes, or notes.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
