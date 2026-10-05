import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Buses" };

export default async function AdminBusesPage() {
  if (!modules.buses) notFound();
  await requirePermission("buses.view");

  const routes = await prisma.busRoute.findMany({
    include: { schedules: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Buses</h1>
      <p className="mt-2 text-sm text-muted">
        Routes and schedules are stored separately from tours and hotels.
      </p>
      {routes.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No routes yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
          {routes.map((route) => (
            <li key={route.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{route.name}</p>
              <p className="text-muted">
                {route.fromCity} to {route.toCity} · {route.schedules.length}{" "}
                schedules
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
