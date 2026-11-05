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
    <div className="grid max-w-4xl gap-3">
      <Link href="/admin/enquiries" className="text-sm font-medium text-brand">
        Enquiries
      </Link>
      <div>
        <EnquiryFacts
          enquiry={enquiry}
          footer={
            canManage ? (
              <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <BookingStatusForm
                  bookingId={booking.id}
                  status={enquiryStatusValue(booking.status)}
                  options={enquiryStatuses.map((value) => ({ value, label: enquiryStatusLabels[value] }))}
                />
              </section>
            ) : null
          }
        />
      </div>
    </div>
  );
}
