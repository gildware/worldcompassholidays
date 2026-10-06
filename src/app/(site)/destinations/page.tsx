import type { Metadata } from "next";
import { DestinationListV3 } from "@/components/destination-list/destination-list-v3/DestinationListV3";
import type { DestinationListCard, DestinationListLocation } from "@/components/destination-list/types";
import { prisma } from "@/lib/db";
import { mapApiKey } from "@/lib/map-key";
import { parseMapPoint } from "@/lib/maps";

export const metadata: Metadata = {
  title: "Destinations",
};

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rows = await prisma.destination.findMany({
    where: { published: true },
    orderBy: [{ popular: "desc" }, { name: "asc" }],
    include: {
      parent: { select: { name: true } },
      children: {
        where: { published: true },
        select: { name: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: {
          tours: { where: { published: true } },
          hotels: { where: { published: true } },
          vehicles: { where: { published: true } },
        },
      },
    },
  });

  const destinations: DestinationListCard[] = rows.map((destination) => {
    const point = parseMapPoint(destination.mapLat, destination.mapLng, destination.mapZoom);
    return {
      id: destination.id,
      slug: destination.slug,
      name: destination.name,
      region: destination.region,
      country: destination.country,
      summary: destination.summary,
      imageUrl: destination.imageUrl,
      parentName: destination.parent?.name ?? "",
      placeNames: destination.children.map((child) => child.name),
      popular: destination.popular,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      tourCount: destination._count.tours,
      hotelCount: destination._count.hotels,
      rentalCount: destination._count.vehicles,
      href: `/destinations/${destination.slug}`,
    };
  });

  const locations: DestinationListLocation[] = destinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    address: [destination.region, destination.country].filter(Boolean).join(", "),
  }));

  return (
    <DestinationListV3
      destinations={destinations}
      locations={locations}
      initialLocation={one(params.q)}
      mapApiKey={mapApiKey()}
    />
  );
}
