import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  await requirePermission("customers.view");

  const customers = await prisma.user.findMany({
    where: { role: { scope: "customer" } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="mt-2 text-sm text-muted">
        People who created an account on the website. Guest enquiries stay in
        bookings until the customer signs up.
      </p>
      {customers.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No customer accounts yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-muted">
                  {customer.email}
                  {customer.phone ? ` · ${customer.phone}` : ""}
                </p>
              </div>
              <p className="text-muted">
                {customer._count.bookings}{" "}
                {customer._count.bookings === 1 ? "booking" : "bookings"} · joined{" "}
                {formatDate(customer.createdAt)}
                {customer.isActive ? "" : " · disabled"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
