import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusFleetWorkspace } from "@/components/admin/BusFleetWorkspace";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { ensureBusCatalog } from "@/lib/bus-catalog";
import { parseStringList } from "@/lib/buses";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Buses" };

export default async function AdminBusesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string; blocked?: string }>;
}) {
  if (!modules.buses) notFound();
  const user = await requirePermission("buses.view");
  const { deleted, saved, blocked } = await searchParams;
  await ensureBusCatalog();

  const buses = await prisma.bus.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { routes: true } } },
  });

  return (
    <BusFleetWorkspace
      canManage={can(user, "buses.manage")}
      notice={blocked ? "blocked" : deleted ? "deleted" : saved ? "saved" : null}
      buses={buses.map((bus) => ({
        id: bus.id,
        name: bus.name,
        operator: bus.operator,
        coachType: bus.coachType,
        published: bus.published,
        imageUrl: bus.imageUrl,
        facilityCount: parseStringList(bus.amenitiesJson).length,
        routeCount: bus._count.routes,
      }))}
    />
  );
}
