import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelRentalBooking } from "@/actions/rental-bookings";
import { ActionForm } from "@/components/rentals/ActionForm";
import { CustomerDocumentForm } from "@/components/rentals/CustomerDocumentForm";
import { PriceBreakdown } from "@/components/rentals/PriceBreakdown";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { cancellationRefund } from "@/lib/rentals/availability";
import {
  customerCancelStatuses,
  documentStatusLabels,
  paymentKindLabels,
  paymentStatusLabels,
  rentalStatusLabel,
} from "@/lib/rentals/labels";
import { parseQuote } from "@/lib/rentals/pricing";

type Props = { params: Promise<{ reference: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return { title: reference };
}

export default async function RentalBookingPage({ params }: Props) {
  const user = await requireCustomer("account.bookings.view");
  const { reference } = await params;
  const booking = await prisma.rentalBooking.findUnique({
    where: { reference },
    include: {
      vehicle: true,
      pickupLocation: true,
      returnLocation: true,
      documents: { include: { config: true } },
      addons: true,
      payments: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking || booking.userId !== user.id) notFound();

  const quote = parseQuote(booking.pricingSnapshot);
  const required = await prisma.rentalConfig.findMany({
    where: {
      kind: "customer_document",
      active: true,
      OR: [{ appliesTo: "all" }, { appliesTo: booking.vehicle.kind }],
    },
    orderBy: { sortOrder: "asc" },
  });
  const canUpload = ["pending", "documents_required", "documents_under_review"].includes(booking.status);
  const missing = required.filter(
    (config) => !booking.documents.some((document) => document.configId === config.id && document.status !== "rejected"),
  );
  const canCancel = customerCancelStatuses.includes(
    booking.status as (typeof customerCancelStatuses)[number],
  );
  const policies = canCancel
    ? await prisma.rentalPolicy.findMany({ where: { kind: "cancellation", active: true } })
    : [];
  const decision = canCancel
    ? cancellationRefund({ pickupAt: booking.pickupAt, cancelledAt: new Date(), policies })
    : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12">
      <div>
        <Link href="/account/rentals" className="text-sm text-brand">
          My rentals
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{booking.vehicle.name}</h1>
          <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {booking.vehicle.registrationNumber} · {booking.reference}
        </p>
      </div>

      <section className="grid gap-3 rounded-xl border border-line bg-white p-5 text-sm md:grid-cols-2">
        <p>Pickup {formatDateTime(booking.pickupAt)}</p>
        <p>Return {formatDateTime(booking.returnAt)}</p>
        <p>
          Receive: {booking.pickupMode === "delivery" ? booking.deliveryAddress : booking.pickupLocation?.name ?? "Location"}
        </p>
        <p>
          Return: {booking.returnMode === "delivery" ? booking.returnAddress : booking.returnLocation?.name ?? "Location"}
        </p>
        {booking.notes ? <p className="md:col-span-2">Notes: {booking.notes}</p> : null}
        {booking.cancellationReason ? <p className="md:col-span-2">Cancellation: {booking.cancellationReason}</p> : null}
        {booking.rejectionReason ? <p className="md:col-span-2">Rejected: {booking.rejectionReason}</p> : null}
      </section>

      {quote ? <PriceBreakdown quote={quote} /> : null}

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        {booking.documents.map((document) => (
          <article key={document.id} className="rounded-xl border border-line bg-white p-4 text-sm">
            <p className="font-medium">{document.typeName}</p>
            <p className="text-muted">
              {document.number || "No number"} · {documentStatusLabels[document.status] ?? document.status}
              {document.expiryDate ? ` · expires ${formatDate(document.expiryDate)}` : ""}
            </p>
            {document.rejectionReason ? <p className="mt-1 text-red-700">{document.rejectionReason}</p> : null}
            {document.fileUrl ? (
              <a href={document.fileUrl} className="mt-2 inline-flex text-brand" target="_blank" rel="noreferrer">
                Open file
              </a>
            ) : null}
          </article>
        ))}
        {canUpload
          ? missing.map((config) => (
              <CustomerDocumentForm
                key={config.id}
                bookingId={booking.id}
                configId={config.id}
                label={config.name}
                requiresNumber={config.requiresNumber}
                requiresIssueDate={config.requiresIssueDate}
                requiresExpiry={config.requiresExpiry}
              />
            ))
          : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Payments</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white text-sm">
          {booking.payments.map((payment) => (
            <li key={payment.id} className="flex justify-between gap-3 px-4 py-3">
              <span>
                {paymentKindLabels[payment.kind] ?? payment.kind} · {paymentStatusLabels[payment.status] ?? payment.status}
              </span>
              <span>{formatMoney(payment.amount, booking.currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Online payment is not connected yet. Unpaid amounts stay on the booking until staff record them or a gateway is added.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Status timeline</h2>
        <ol className="mt-3 grid gap-3">
          {booking.events.map((event) => (
            <li key={event.id} className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
              <p className="font-medium">{rentalStatusLabel(event.status)}</p>
              <p className="text-muted">{event.message}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(event.createdAt)}</p>
            </li>
          ))}
        </ol>
      </section>

      {canCancel && decision ? (
        <ActionForm action={cancelRentalBooking} className="grid gap-3 rounded-xl border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Cancel booking</h2>
          <p className="text-sm text-muted">
            {decision.policyName}: {decision.refundPercent}% of paid rental charges. The security deposit is included in full if it was paid. Refunds stay unpaid until staff or the payment gateway send them.
          </p>
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="grid gap-1 text-sm">
            Reason
            <input name="reason" required />
          </label>
          <SubmitButton variant="danger" pendingLabel="Cancelling">
            Cancel booking
          </SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
