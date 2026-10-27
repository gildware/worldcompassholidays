import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusesWorkspace } from "@/components/admin/BusesWorkspace";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { ensureBusCatalog, loadBusLocations } from "@/lib/bus-catalog";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Bus routes" };

export default async function AdminBusRoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string }>;
}) {
  if (!modules.buses) notFound();
  const user = await requirePermission("buses.view");
  const { deleted, saved } = await searchParams;
  await ensureBusCatalog();

  const [routes, locations, busCount] = await Promise.all([
    prisma.busRoute.findMany({
      orderBy: [{ fromCity: "asc" }, { departTime: "asc" }],
      include: { _count: { select: { schedules: true } } },
    }),
    loadBusLocations(),
    prisma.bus.count(),
  ]);

  return (
    <BusesWorkspace
      canManage={can(user, "buses.manage")}
      locationCount={locations.length}
      busCount={busCount}
      notice={deleted ? "deleted" : saved ? "saved" : null}
      routes={routes.map((route) => ({
        id: route.id,
        name: route.name,
        slug: route.slug,
        fromCity: route.fromCity,
        toCity: route.toCity,
        departTime: route.departTime,
        duration: route.duration,
        fareFrom: route.fareFrom,
        coachType: route.coachType,
        operator: route.operator,
        published: route.published,
        imageUrl: route.imageUrl,
        scheduleCount: route._count.schedules,
      }))}
    />
  );
}
