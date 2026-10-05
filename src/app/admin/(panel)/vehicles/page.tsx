import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Vehicles" };

export default async function AdminVehiclesPage() {
  if (!modules.cars && !modules.bikes) notFound();
  await requirePermission("vehicles.view");

  const vehicles = await prisma.vehicle.findMany({
    include: { destination: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Vehicles</h1>
      <p className="mt-2 text-sm text-muted">
        Cars and bikes are one catalog, split by kind.
      </p>
      {vehicles.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No vehicles yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{vehicle.name}</p>
              <p className="text-muted">
                {vehicle.kind} · {vehicle.destination.name} ·{" "}
                {formatMoney(vehicle.pricePerDay, vehicle.currency)} / day
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
