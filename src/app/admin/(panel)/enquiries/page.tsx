import type { Metadata } from "next";
import { EnquiryBoard } from "@/components/enquiries/EnquiryBoard";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { withEnquiryImages } from "@/lib/enquiry-images";
import { customEnquiryWhere, enquiryIsOpen, toEnquiryView } from "@/lib/enquiries";

export const metadata: Metadata = { title: "Enquiries" };

const types = new Set(["tour", "hotel", "car", "bike"]);

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requirePermission("bookings.view");
  const { type } = await searchParams;
  const active = type && types.has(type) ? type : "all";
  const bookings = await prisma.booking.findMany({
    where: {
      ...(active === "all" ? {} : { module: active }),
      ...customEnquiryWhere(),
    },
    orderBy: { createdAt: "desc" },
  });
  const rows = await withEnquiryImages(
    bookings.flatMap((booking) => {
      const view = toEnquiryView(booking);
      return view ? [view] : [];
    }),
  );
  const open = rows.filter((row) => enquiryIsOpen(row.status)).length;

  return (
    <div className="grid gap-3">
      <div>
        <h1 className="text-xl font-semibold leading-tight text-navy">Enquiries</h1>
        <p className="mt-1 text-sm text-muted">
          {rows.length === 0 ? "No requests yet." : `${open} open · ${rows.length} total. These are requests, not bookings.`}
        </p>
      </div>
      <EnquiryBoard
        rows={rows}
        active={active}
        basePath="/admin/enquiries"
        detailPath={(row) => `/admin/enquiries/${row.id}`}
        showContact
        empty={active === "all" ? "Tour, hotel, car, and bike requests will show up here." : `No ${active} enquiries.`}
      />
    </div>
  );
}
