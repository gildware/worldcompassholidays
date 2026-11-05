import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryFacts } from "@/components/enquiries/EnquiryBoard";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { withEnquiryImages } from "@/lib/enquiry-images";
import { toEnquiryView } from "@/lib/enquiries";
import { privateMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return privateMetadata(`Enquiry ${reference}`, "A request on your World Compass Holidays account.");
}

export default async function AccountEnquiryPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const user = await requireCustomer("account.bookings.view");
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking || booking.userId !== user.id) notFound();
  const view = toEnquiryView(booking);
  if (!view) notFound();
  const [enquiry] = await withEnquiryImages([view]);
  if (!enquiry) notFound();

  return (
    <div className="grid max-w-4xl gap-4">
      <Link href="/account/enquiries" className="text-sm font-medium text-brand">
        Enquiries
      </Link>
      <div>
        <EnquiryFacts
          enquiry={enquiry}
          footer={<p className="px-1 text-xs text-muted">Nothing is booked until you accept a price.</p>}
        />
      </div>
    </div>
  );
}
