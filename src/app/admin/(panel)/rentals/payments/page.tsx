import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { paymentKindLabels, paymentStatusLabels } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Rental payments" };

export default async function RentalPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission("vehicles.view");
  const { status = "unpaid" } = await searchParams;
  const payments = await prisma.rentalPayment.findMany({
    where: status === "all" ? {} : { status: status || "unpaid" },
    include: { booking: { select: { id: true, reference: true, currency: true, contactName: true } } },
    orderBy: { createdAt: "desc" },
  });
  const paid = await prisma.rentalPayment.findMany({ where: { status: "paid" } });
  const collected = paid.reduce((sum, payment) => sum + (payment.kind === "refund" ? -payment.amount : payment.amount), 0);

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">Payments and refunds</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Collected so far {formatMoney(collected)}. Gateway checkout is not connected. Mark a row paid from the booking when money is received, or leave it unpaid for a future gateway.
        </p>
      </div>
      <form method="get" className="flex gap-2">
        <SearchableSelect
          name="status"
          defaultValue={status}
          ariaLabel="Payment status"
          searchPlaceholder="Search statuses"
          wrapperClassName="max-w-xs"
          className="!h-10"
          options={[
            { value: "unpaid", label: "Unpaid" },
            { value: "paid", label: "Paid" },
            { value: "failed", label: "Failed" },
            { value: "all", label: "All" },
          ]}
        />
        <button type="submit" className="h-11 rounded-lg border border-line bg-white px-4 text-sm">
          Filter
        </button>
      </form>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white text-sm">
        {payments.length === 0 ? <li className="px-4 py-6 text-muted">No payments in this view.</li> : null}
        {payments.map((payment) => (
          <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">
                {paymentKindLabels[payment.kind] ?? payment.kind} · {formatMoney(payment.amount, payment.booking.currency)}
              </p>
              <p className="text-muted">
                {payment.booking.contactName} · {paymentStatusLabels[payment.status] ?? payment.status} · {formatDateTime(payment.createdAt)}
              </p>
            </div>
            <Link href={`/admin/rentals/bookings/${payment.booking.id}`} className="text-brand">
              {payment.booking.reference}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
