import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusRouteForm } from "@/components/admin/BusRouteForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { ensureBusCatalog, loadBusLocations } from "@/lib/bus-catalog";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Add route" };

export default async function NewBusRoutePage() {
  if (!modules.buses) notFound();
  await requirePermission("buses.manage");
  await ensureBusCatalog();
  const [locations, buses] = await Promise.all([
    loadBusLocations(),
    prisma.bus.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <Link href="/admin/buses/routes" className="text-xs font-medium text-brand hover:underline">
          ← All routes
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Add a route</h1>
        <p className="mt-1 text-xs text-muted">
          Choose a bus and two locations. Photos and facilities are edited on the bus. Map pins are edited under Locations.
        </p>
      </div>
      <BusRouteForm
        route={null}
        locations={locations}
        buses={buses.map((bus) => ({
          id: bus.id,
          name: bus.name,
          operator: bus.operator,
          coachType: bus.coachType,
          published: bus.published,
          imageUrl: bus.imageUrl,
        }))}
      />
    </div>
  );
}
