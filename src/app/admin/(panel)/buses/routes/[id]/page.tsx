import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusRouteForm } from "@/components/admin/BusRouteForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { ensureBusCatalog, loadBusLocations } from "@/lib/bus-catalog";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Edit route" };

export default async function EditBusRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.buses) notFound();
  await requirePermission("buses.manage");
  const { id } = await params;
  await ensureBusCatalog();

  const [route, locations, buses] = await Promise.all([
    prisma.busRoute.findUnique({ where: { id } }),
    loadBusLocations(),
    prisma.bus.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!route) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <Link href="/admin/buses/routes" className="text-xs font-medium text-brand hover:underline">
          ← All routes
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Edit route</h1>
        <p className="mt-1 text-xs text-muted">
          The bus, the two locations, and the run time. Photos and facilities are edited on the bus.
        </p>
      </div>
      <BusRouteForm
        locations={locations}
        buses={buses.map((bus) => ({
          id: bus.id,
          name: bus.name,
          operator: bus.operator,
          coachType: bus.coachType,
          published: bus.published,
          imageUrl: bus.imageUrl,
        }))}
        route={{
          id: route.id,
          busId: route.busId ?? "",
          fromLocationId: route.fromLocationId ?? "",
          toLocationId: route.toLocationId ?? "",
          pickup: route.pickup,
          dropoff: route.dropoff,
          departTime: route.departTime,
          arriveTime: route.arriveTime,
          duration: route.duration,
          fareFrom: route.fareFrom,
          published: route.published,
        }}
      />
    </div>
  );
}
