import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { documentStatusLabels, rentalStatusLabel } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Rental customers" };

export default async function RentalCustomersPage() {
  await requirePermission("vehicles.view");
  const [queue, customers] = await Promise.all([
    prisma.rentalBookingDocument.findMany({
      where: { status: { in: ["pending", "rejected"] }, booking: { status: { in: ["documents_required", "documents_under_review", "pending"] } } },
      include: {
        booking: { select: { id: true, reference: true, contactName: true, status: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
    prisma.user.findMany({
      where: { rentalBookings: { some: {} } },
      include: { _count: { select: { rentalBookings: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Rental customers</h1>
        <p className="mt-2 text-sm text-muted">
          Accounts that have a rental booking. Document review happens on the booking.
        </p>
      </div>
      <section>
        <h2 className="font-semibold">Documents to review</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white text-sm">
          {queue.length === 0 ? <li className="px-4 py-6 text-muted">No documents waiting.</li> : null}
          {queue.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{document.typeName}</p>
                <p className="text-muted">
                  {document.booking.contactName} · {document.booking.reference} · {documentStatusLabels[document.status]}
                </p>
              </div>
              <Link href={`/admin/rentals/bookings/${document.booking.id}`} className="text-brand">
                {rentalStatusLabel(document.booking.status)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-semibold">Customers</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white text-sm">
          {customers.length === 0 ? <li className="px-4 py-6 text-muted">No rental customers yet.</li> : null}
          {customers.map((customer) => (
            <li key={customer.id} className="flex justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-muted">{customer.email}</p>
              </div>
              <p className="text-muted">{customer._count.rentalBookings} rentals</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
