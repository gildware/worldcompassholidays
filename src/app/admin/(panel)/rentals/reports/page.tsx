import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { rentalStatusLabel, vehicleStatusLabel } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Rental reports" };

export default async function RentalReportsPage() {
  await requirePermission("vehicles.view");
  const [byStatus, byVehicleStatus, payments, upcomingReturns] = await Promise.all([
    prisma.rentalBooking.groupBy({ by: ["status"], _count: { _all: true }, _sum: { totalAmount: true } }),
    prisma.vehicle.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.rentalPayment.findMany({ where: { status: "paid" } }),
    prisma.rentalBooking.count({
      where: {
        status: { in: ["active", "return_pending"] },
        returnAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  const collected = payments.reduce((sum, payment) => sum + (payment.kind === "refund" ? -payment.amount : payment.amount), 0);
  const refunds = payments.filter((payment) => payment.kind === "refund").reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Rental reports</h1>
        <p className="mt-2 text-sm text-muted">Counts use saved booking prices, so later vehicle price changes do not rewrite history.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="rounded-xl border border-line bg-white p-4">
          <p className="text-sm text-muted">Net collected</p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(collected)}</p>
        </li>
        <li className="rounded-xl border border-line bg-white p-4">
          <p className="text-sm text-muted">Refunds paid</p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(refunds)}</p>
        </li>
        <li className="rounded-xl border border-line bg-white p-4">
          <p className="text-sm text-muted">Returns in 3 days</p>
          <p className="mt-2 text-2xl font-semibold">{upcomingReturns}</p>
        </li>
      </ul>
      <section className="rounded-xl border border-line bg-white">
        <h2 className="border-b border-line px-4 py-3 font-semibold">Bookings</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Count</th>
              <th className="px-4 py-2 font-medium">Rental total</th>
            </tr>
          </thead>
          <tbody>
            {byStatus.map((row) => (
              <tr key={row.status} className="border-t border-line">
                <td className="px-4 py-2">{rentalStatusLabel(row.status)}</td>
                <td className="px-4 py-2">{row._count._all}</td>
                <td className="px-4 py-2">{formatMoney(row._sum.totalAmount ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rounded-xl border border-line bg-white">
        <h2 className="border-b border-line px-4 py-3 font-semibold">Fleet status</h2>
        <table className="w-full text-left text-sm">
          <tbody>
            {byVehicleStatus.map((row) => (
              <tr key={row.status} className="border-t border-line">
                <td className="px-4 py-2">{vehicleStatusLabel(row.status)}</td>
                <td className="px-4 py-2">{row._count._all}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
