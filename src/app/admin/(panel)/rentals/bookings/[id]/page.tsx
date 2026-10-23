import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingDeskHint } from "@/components/admin/BookingDeskHint";
import { BookingDesk } from "@/components/admin/rentals/BookingDesk";
import "@/components/admin/bookings-desk.css";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { deskJourneyLabels, deskModuleThumb } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { primaryRentalAction, rentalStatusLabel } from "@/lib/rentals/labels";
import { parseQuote } from "@/lib/rentals/pricing";

type Props = { params: Promise<{ id: string }> };

function rentalStatusTone(status: string) {
  switch (status) {
    case "confirmed":
    case "ready_for_pickup":
    case "active":
    case "completed":
      return "ok";
    case "pending":
    case "documents_required":
    case "documents_under_review":
    case "return_pending":
      return "warn";
    case "cancelled":
    case "rejected":
      return "danger";
    default:
      return "info";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const booking = await prisma.rentalBooking.findUnique({ where: { id } });
  return { title: booking?.reference ?? "Booking" };
}

export default async function RentalBookingAdminPage({ params }: Props) {
  const user = await requirePermission("vehicles.view");
  const { id } = await params;
  const booking = await prisma.rentalBooking.findUnique({
    where: { id },
    include: {
      vehicle: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      user: { select: { name: true, email: true, phone: true } },
      pickupLocation: true,
      returnLocation: true,
      documents: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
      addons: true,
    },
  });
  if (!booking) notFound();

  const quote = parseQuote(booking.pricingSnapshot);
  const fleetSegment = booking.vehicle.kind === "bike" ? "bikes" : "cars";
  const deskLabel = booking.vehicle.kind === "bike" ? "Bikes" : "Cars";
  const moduleKey = booking.vehicle.kind === "bike" ? "bike" : "car";
  const journey = deskJourneyLabels(moduleKey);
  const tone = rentalStatusTone(booking.status);
  const primary = primaryRentalAction(booking.status);
  const thumb =
    booking.vehicle.images[0]?.url || deskModuleThumb(moduleKey);

  const phoneDigits = booking.contactPhone.replace(/\D/g, "");
  const whatsapp =
    phoneDigits.length >= 10
      ? `https://wa.me/${phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits}`
      : null;

  const guestLine = [booking.contactEmail, booking.contactPhone].filter(Boolean).join(" · ");
  const pickupSub =
    booking.pickupMode === "delivery"
      ? `Deliver to ${booking.deliveryAddress || "address"}`
      : booking.pickupLocation?.name ?? "Counter";
  const returnSub =
    booking.returnMode === "delivery"
      ? `Collect from ${booking.returnAddress || "address"}`
      : booking.returnLocation?.name ?? "Counter";

  const paidTotal = booking.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const rentalTotal = quote?.totalAmount ?? 0;
  const deposit = quote?.securityDeposit ?? 0;
  const currency = quote?.currency || booking.currency || "INR";

  const pendingDocs = booking.documents.filter((doc) => doc.status !== "verified").length;
  const canManage = can(user, "vehicles.manage");
  const deskDocs = booking.documents.map((document) => ({
    id: document.id,
    typeName: document.typeName,
    number: document.number,
    fileUrl: document.fileUrl,
    status: document.status,
    rejectionReason: document.rejectionReason,
    issueDate: document.issueDate ? formatDate(document.issueDate) : "",
    expiryDate: document.expiryDate ? formatDate(document.expiryDate) : "",
  }));
  const deskPayments = booking.payments.map((payment) => ({
    id: payment.id,
    kind: payment.kind,
    status: payment.status,
    amount: payment.amount,
    currency: booking.currency,
    method: payment.method,
    note: payment.note,
    gatewayRef: payment.gatewayRef,
  }));
  const canCharge = ["active", "return_pending", "completed"].includes(booking.status);

  return (
    <div className="bk-desk grid gap-4">
      <BookingDeskHint segment={fleetSegment} />

      <nav className="bk-crumb" aria-label="Breadcrumb">
        <Link href="/admin/bookings">Bookings</Link>
        <span>/</span>
        <Link href={`/admin/bookings/${fleetSegment}`}>{deskLabel}</Link>
        <span>/</span>
        <b>{booking.reference}</b>
      </nav>

      <div className="bk-sheet">
        <div className="bk-stack">
          <header className="bk-detail-hero">
            <div
              className="bk-detail-hero__thumb"
              style={{ backgroundImage: `url(${thumb})` }}
              role="img"
              aria-label={booking.vehicle.name}
            />
            <div className="bk-detail-hero__meta">
              <p className="bk-detail-hero__ref">{booking.reference}</p>
              <h1>{booking.vehicle.name}</h1>
              <p className="bk-detail-hero__sub">
                {deskLabel.slice(0, -1)} desk · {booking.vehicle.registrationNumber}
                {booking.pickupLocation?.name ? ` · ${booking.pickupLocation.name}` : ""}
              </p>
              <div className="bk-detail-hero__pills">
                <span className={`bk-status bk-status--${tone}`}>
                  {rentalStatusLabel(booking.status)}
                </span>
                <span className="bk-status bk-status--neutral">{deskLabel}</span>
              </div>
              {pendingDocs > 0 &&
              ["documents_required", "documents_under_review"].includes(booking.status) ? (
                <p className="bk-sla">
                  {pendingDocs} doc{pendingDocs === 1 ? "" : "s"} pending · blocks confirm
                </p>
              ) : primary ? (
                <p className="bk-sla">Next: {primary.label}</p>
              ) : null}
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
            ) : null}
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
            <div className="bk-journey">
              <div>
                <strong>{journey.from}</strong>
                <p>{formatDateTime(booking.pickupAt)}</p>
                <small>{pickupSub}</small>
              </div>
              <div className="bk-journey__line" aria-hidden />
              <div style={{ textAlign: "right" }}>
                <strong>{journey.to}</strong>
                <p>{formatDateTime(booking.returnAt)}</p>
                <small>{returnSub}</small>
              </div>
            </div>
            <dl className="bk-dl bk-dl--2" style={{ marginTop: 14 }}>
              <div>
                <dt>Vehicle</dt>
                <dd>{booking.vehicle.name}</dd>
              </div>
              <div>
                <dt>Registration</dt>
                <dd>{booking.vehicle.registrationNumber}</dd>
              </div>
              <div>
                <dt>Docs</dt>
                <dd>
                  {booking.documents.length === 0
                    ? "None uploaded"
                    : `${booking.documents.filter((d) => d.status === "verified").length}/${booking.documents.length} verified`}
                </dd>
              </div>
              {quote ? (
                <div>
                  <dt>Included km</dt>
                  <dd>
                    {quote.includedKmPerDay > 0
                      ? `${quote.includedKmPerDay} / day`
                      : "Unlimited"}
                  </dd>
                </div>
              ) : null}
            </dl>
            {booking.deliveryLat && booking.deliveryLng ? (
              <p className="mt-3 text-sm">
                <a
                  className="text-brand"
                  href={`https://www.google.com/maps?q=${encodeURIComponent(`${booking.deliveryLat},${booking.deliveryLng}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open delivery map
                </a>
              </p>
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
              {booking.events.length === 0 ? (
                <li data-done="true">
                  <span className="bk-timeline__dot" aria-hidden />
                  <div>
                    <p>Booking created</p>
                    <small>{formatDateTime(booking.createdAt)}</small>
                  </div>
                </li>
              ) : (
                booking.events.map((event) => (
                  <li key={event.id} data-done="true">
                    <span className="bk-timeline__dot" aria-hidden />
                    <div>
                      <p>{rentalStatusLabel(event.status)}</p>
                      <small>
                        {formatDateTime(event.createdAt)}
                        {event.message ? ` · ${event.message}` : ""}
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

          {canManage ? (
            <BookingDesk
              bookingId={booking.id}
              status={booking.status}
              canCharge={canCharge}
              documents={deskDocs}
              payments={deskPayments}
              section="stack"
            />
          ) : null}
        </div>

        <aside className="bk-rail">
          <div className={`bk-money${quote ? "" : " bk-money--empty"}`}>
            <p className="bk-money__label">Rental due</p>
            <p className="bk-money__total">
              {quote ? formatMoney(quote.amountDue, currency) : "Awaiting quote"}
            </p>
            <p className="bk-money__sub">
              {deposit > 0
                ? `Deposit hold ${formatMoney(deposit, currency)} separate`
                : "No deposit on this quote"}
            </p>
            {quote ? (
              <ul>
                <li>
                  <span>Rental</span>
                  <span>{formatMoney(rentalTotal, currency)}</span>
                </li>
                <li>
                  <span>Deposit hold</span>
                  <span>{formatMoney(deposit, currency)}</span>
                </li>
                <li>
                  <span>Collected</span>
                  <span>{formatMoney(paidTotal, currency)}</span>
                </li>
              </ul>
            ) : null}
          </div>

          {canManage ? (
            <BookingDesk
              bookingId={booking.id}
              status={booking.status}
              canCharge={canCharge}
              documents={deskDocs}
              payments={deskPayments}
              section="rail"
            />
          ) : (
            <section className="bk-panel">
              <h2>Actions</h2>
              <p className="text-sm text-muted">
                Your role can view this booking but not change it.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
