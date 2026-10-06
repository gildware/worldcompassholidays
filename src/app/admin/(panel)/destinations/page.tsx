import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DestinationsWorkspace } from "@/components/admin/DestinationsWorkspace";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { mapApiKey } from "@/lib/map-key";

export const metadata: Metadata = { title: "Destinations" };

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; blocked?: string; saved?: string }>;
}) {
  const user = await requirePermission("destinations.view");
  const params = await searchParams;
  const toastKind = (await cookies()).get("destination_toast")?.value;

  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { name: true } },
      _count: {
        select: {
          tours: true,
          hotels: true,
          vehicles: true,
          busRoutes: true,
          children: true,
        },
      },
    },
  });

  const notice = params.deleted
    ? "deleted"
    : params.blocked === "children"
      ? "children"
      : params.blocked
        ? "listings"
        : params.saved === "added" || toastKind === "added"
          ? "added"
          : params.saved === "updated" || toastKind === "updated"
            ? "saved"
            : null;

  return (
    <DestinationsWorkspace
      canManage={can(user, "destinations.manage")}
      mapApiKey={mapApiKey()}
      notice={notice}
      destinations={destinations.map((destination) => {
        const linkedCount =
          destination._count.tours +
          destination._count.hotels +
          destination._count.vehicles +
          (modules.buses ? destination._count.busRoutes : 0);

        const parts = [
          destination.parent ? `In ${destination.parent.name}` : null,
          `${destination.region}, ${destination.country}`,
          destination._count.tours
            ? `${destination._count.tours} tour${destination._count.tours === 1 ? "" : "s"}`
            : null,
          destination._count.hotels
            ? `${destination._count.hotels} hotel${destination._count.hotels === 1 ? "" : "s"}`
            : null,
          destination._count.vehicles
            ? `${destination._count.vehicles} rental${destination._count.vehicles === 1 ? "" : "s"}`
            : null,
          modules.buses && destination._count.busRoutes
            ? `${destination._count.busRoutes} bus route${destination._count.busRoutes === 1 ? "" : "s"}`
            : null,
          linkedCount === 0 ? "No listings yet" : null,
        ].filter(Boolean);

        return {
          id: destination.id,
          slug: destination.slug,
          name: destination.name,
          region: destination.region,
          country: destination.country,
          summary: destination.summary,
          mapLat: destination.mapLat,
          mapLng: destination.mapLng,
          mapZoom: destination.mapZoom,
          imageUrl: destination.imageUrl,
          imageKey: destination.imageKey,
          imageDriver: destination.imageDriver,
          published: destination.published,
          popular: destination.popular,
          parentId: destination.parentId,
          parentName: destination.parent?.name ?? null,
          childCount: destination._count.children,
          linkedCount,
          meta: parts.join(" · "),
        };
      })}
    />
  );
}
