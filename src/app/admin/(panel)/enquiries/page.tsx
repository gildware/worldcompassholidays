import type { Metadata } from "next";
import { EnquiryBoard } from "@/components/enquiries/EnquiryBoard";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { withEnquiryImages } from "@/lib/enquiry-images";
import { customEnquiryWhere, toEnquiryView, websiteEnquiryWhere } from "@/lib/enquiries";

export const metadata: Metadata = { title: "Enquiries" };

const types = new Set(["contact", "tour", "hotel", "car", "bike", "bus"]);

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requirePermission("bookings.view");
  const { type } = await searchParams;
  const active = type && types.has(type) ? type : "all";
  const bookings = await prisma.booking.findMany({
    where:
      active === "all"
        ? customEnquiryWhere()
        : active === "contact"
          ? websiteEnquiryWhere()
          : {
              module: active,
              details: { contains: `"kind":"custom_${active}"` },
            },
    orderBy: { createdAt: "desc" },
  });
  const rows = await withEnquiryImages(
    bookings.flatMap((booking) => {
      const view = toEnquiryView(booking);
      return view ? [view] : [];
    }),
  );

  return (
    <EnquiryBoard
      rows={rows}
      active={active}
      basePath="/admin/enquiries"
      detailPath={(row) => `/admin/enquiries/${row.id}`}
      showContact
      layout="table"
      empty={
        active === "all"
          ? "Contact form messages and tour, hotel, car, or bike requests will show up here."
          : active === "contact"
            ? "No contact-page enquiries yet."
            : `No ${active} enquiries.`
      }
    />
  );
}
