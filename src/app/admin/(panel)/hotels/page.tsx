import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelsWorkspace } from "@/components/admin/HotelsWorkspace";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Hotels" };

export default async function AdminHotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string }>;
}) {
  if (!modules.hotels) notFound();
  const user = await requirePermission("hotels.view");
  const canManage = can(user, "hotels.manage");
  const { deleted, saved } = await searchParams;

  const [hotels, destinations] = await Promise.all([
    prisma.hotel.findMany({
      include: {
        destination: { include: { parent: { select: { name: true } } } },
        _count: { select: { rooms: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.destination.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, parent: { select: { name: true } } },
    }),
  ]);

  return (
    <HotelsWorkspace
      canManage={canManage}
      notice={deleted ? "deleted" : saved ? "saved" : null}
      destinations={destinations.map((destination) => ({
        id: destination.id,
        name: destinationChoiceLabel(destination.name, destination.parent?.name),
      }))}
      hotels={hotels.map((hotel) => ({
        id: hotel.id,
        slug: hotel.slug,
        name: hotel.name,
        summary: hotel.summary,
        imageUrl: hotel.imageUrl,
        published: hotel.published,
        destinationId: hotel.destinationId,
        destinationName: hotel.destination
          ? destinationChoiceLabel(hotel.destination.name, hotel.destination.parent?.name)
          : "",
        propertyType: hotel.propertyType,
        starRating: hotel.starRating,
        roomCount: hotel._count.rooms,
        priceFrom: hotel.priceFrom,
        currency: hotel.currency,
      }))}
    />
  );
}
