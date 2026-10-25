import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingStatusForm } from "@/components/admin/BookingStatusForm";
import { EnquiryFacts } from "@/components/enquiries/EnquiryBoard";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { withEnquiryImages } from "@/lib/enquiry-images";
import { enquiryStatusLabels, enquiryStatuses, enquiryStatusValue, toEnquiryView } from "@/lib/enquiries";
import { formatDateTime } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, select: { reference: true } });
  return { title: booking ? `Enquiry ${booking.reference}` : "Enquiry" };
}

export default async function AdminEnquiryPage({ params }: Props) {
  const user = await requirePermission("bookings.view");
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) notFound();
  const view = toEnquiryView(booking);
  if (!view) notFound();
  const [enquiry] = await withEnquiryImages([view]);
  if (!enquiry) notFound();
  const canManage = can(user, "bookings.manage");

  return (
    <div className="grid max-w-3xl gap-3">
      <Link href="/admin/enquiries" className="text-sm font-medium text-brand">
        Enquiries
      </Link>
      <div className="rounded-lg border border-line bg-white p-4">
        <EnquiryFacts enquiry={enquiry} />
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Name</dt>
            <dd className="truncate text-sm text-navy">{enquiry.contactName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Phone</dt>
            <dd className="truncate text-sm text-navy">{enquiry.contactPhone || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Email</dt>
            <dd className="truncate text-sm text-navy">{enquiry.contactEmail}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Received {formatDateTime(enquiry.createdAt)}</p>
        {canManage ? (
          <BookingStatusForm
            bookingId={booking.id}
            status={enquiryStatusValue(booking.status)}
            options={enquiryStatuses.map((value) => ({ value, label: enquiryStatusLabels[value] }))}
          />
        ) : null}
      </div>
    </div>
  );
}
