import type { Metadata } from "next";
import { DestinationCatalog } from "@/components/destination-list/catalog/DestinationCatalog";
import { readDestQuery } from "@/components/destination-list/catalog/logic";
import type { DestinationListCard } from "@/components/destination-list/types";
import { prisma } from "@/lib/db";
import { parseMapPoint } from "@/lib/maps";
import { logListingSearch } from "@/lib/search/log";
import { clipText, pageMetadata } from "@/lib/seo";
import { cached } from "@/lib/ttl-cache";

export const metadata: Metadata = pageMetadata({
  title: "Travel Destinations Across India",
  description:
    "Explore destinations we plan trips for across India — each with tours, hotels, and car or bike rentals. Search by region, state, or city.",
  path: "/destinations",
  keywords: ["India destinations", "travel destinations India", "Kashmir", "Ladakh", "Goa", "Kerala"],
});

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rows = await cached("destinations", 20_000, () =>
    prisma.destination.findMany({
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
    }),
  );

  const destinations: DestinationListCard[] = rows.map((destination) => {
    const point = parseMapPoint(destination.mapLat, destination.mapLng, destination.mapZoom);
    return {
      id: destination.id,
      slug: destination.slug,
      name: destination.name,
      region: destination.region,
      country: destination.country,
      summary: clipText(destination.summary, 140),
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

  const initial = readDestQuery(params, one(params.q));
  logListingSearch("destinations", params, {
    queryOverride: [initial.q, initial.country, initial.region].filter(Boolean).join(" · ") || undefined,
  });

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <DestinationCatalog destinations={destinations} initial={initial} />
    </>
  );
}
