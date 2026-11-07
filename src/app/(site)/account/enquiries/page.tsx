import type { Metadata } from "next";
import { EnquiryBoard } from "@/components/enquiries/EnquiryBoard";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { withEnquiryImages } from "@/lib/enquiry-images";
import {
  customEnquiryWhere,
  toEnquiryView,
  websiteEnquiryWhere,
} from "@/lib/enquiries";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Enquiries", "Contact form and tour, hotel, car, bike, and bus requests on your account.");

const types = new Set(["contact", "tour", "hotel", "car", "bike", "bus"]);

export default async function AccountEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireCustomer("account.bookings.view");
  const { type } = await searchParams;
  const active = type && types.has(type) ? type : "all";
  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      ...(active === "all"
        ? customEnquiryWhere()
        : active === "contact"
          ? websiteEnquiryWhere()
          : {
              module: active,
              details: { contains: `"kind":"custom_${active}"` },
            }),
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
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length === 0 ? "Nothing sent yet." : `${rows.length} ${rows.length === 1 ? "request" : "requests"}. Nothing is booked until you accept.`}
          </p>
        </div>
      </div>
      <EnquiryBoard
        rows={rows}
        active={active}
        basePath="/account/enquiries"
        detailPath={(row) => `/account/enquiries/${row.reference}`}
        empty={
          active === "all"
            ? "Send a contact, tour, hotel, car, or bike request and it will show up here."
            : active === "contact"
              ? "No contact-page enquiries yet."
              : `No ${active} enquiries yet.`
        }
      />
    </div>
  );
}
