import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingDesk } from "@/components/admin/rentals/BookingDesk";
import { PriceBreakdown } from "@/components/rentals/PriceBreakdown";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { rentalStatusLabel } from "@/lib/rentals/labels";
import { parseQuote } from "@/lib/rentals/pricing";

type Props = { params: Promise<{ id: string }> };

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
      vehicle: true,
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

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/rentals/bookings" className="text-sm text-brand">
          All rental bookings
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{booking.reference}</h1>
          <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {booking.vehicle.name} · {booking.vehicle.registrationNumber} · {booking.contactName} · {booking.contactEmail}
          {booking.contactPhone ? ` · ${booking.contactPhone}` : ""}
        </p>
      </div>
      <section className="grid gap-2 rounded-xl border border-line bg-white p-4 text-sm md:grid-cols-2">
        <p>Pickup {formatDateTime(booking.pickupAt)}</p>
        <p>Return {formatDateTime(booking.returnAt)}</p>
        <p>{booking.pickupMode === "delivery" ? `Deliver to ${booking.deliveryAddress}` : `Pickup at ${booking.pickupLocation?.name ?? "location"}`}</p>
        <p>{booking.returnMode === "delivery" ? `Collect from ${booking.returnAddress}` : `Return at ${booking.returnLocation?.name ?? "location"}`}</p>
        {booking.notes ? <p className="md:col-span-2">Customer note: {booking.notes}</p> : null}
      </section>
      {quote ? <PriceBreakdown quote={quote} /> : null}
      <section>
        <h2 className="mb-3 font-semibold">Timeline</h2>
        <ol className="grid gap-2">
          {booking.events.map((event) => (
            <li key={event.id} className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
              <p className="font-medium">{rentalStatusLabel(event.status)}</p>
              <p className="text-muted">{event.message}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(event.createdAt)}</p>
            </li>
          ))}
        </ol>
      </section>
      {can(user, "vehicles.manage") ? (
        <BookingDesk
          bookingId={booking.id}
          status={booking.status}
          canCharge={["active", "return_pending", "completed"].includes(booking.status)}
          documents={booking.documents.map((document) => ({
            id: document.id,
            typeName: document.typeName,
            number: document.number,
            fileUrl: document.fileUrl,
            status: document.status,
            rejectionReason: document.rejectionReason,
            issueDate: document.issueDate ? formatDate(document.issueDate) : "",
            expiryDate: document.expiryDate ? formatDate(document.expiryDate) : "",
          }))}
          payments={booking.payments.map((payment) => ({
            id: payment.id,
            kind: payment.kind,
            status: payment.status,
            amount: payment.amount,
            currency: booking.currency,
            method: payment.method,
            note: payment.note,
            gatewayRef: payment.gatewayRef,
          }))}
        />
      ) : (
        <p className="text-sm text-muted">Your role can view this booking but not change it.</p>
      )}
    </div>
  );
}
