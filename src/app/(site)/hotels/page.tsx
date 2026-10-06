import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelListV1 } from "@/components/hotel-list/hotel-list-v1/HotelListV1";
import type { HotelListCard, HotelListLocation } from "@/components/hotel-list/types";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { loadHotelCatalog } from "@/lib/catalog-query";
import type { CatalogOption } from "@/lib/catalog";
import { resolveTitles } from "@/lib/hotels/labels";
import { mealPlanLabel, propertyTypeLabel } from "@/lib/hotels/options";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

export const metadata: Metadata = { title: "Hotels" };

function amenityNames(stored: string, catalog: CatalogOption[]) {
  const resolved = resolveTitles(stored, catalog);
  if (resolved.length > 0) return resolved;
  return parseJsonArray<string>(stored).flatMap((value) => {
    if (typeof value !== "string" || !value) return [];
    const label = value
      .replace(/^catalog_(hotel|room)_amenity_/, "")
      .replace(/_/g, " ");
    return [label.charAt(0).toUpperCase() + label.slice(1)];
  });
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.hotels) notFound();
  const params = await searchParams;
  const locationQuery = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";

  const [rows, catalog, destinations] = await Promise.all([
    prisma.hotel.findMany({
      where: { published: true },
      include: {
        destination: { select: { name: true, region: true, country: true } },
        rooms: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
    loadHotelCatalog(),
    prisma.destination.findMany({
      where: { published: true, hotels: { some: { published: true } } },
      select: { id: true, name: true, region: true, country: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const hotels: HotelListCard[] = rows.map((hotel) => {
    const room = hotel.rooms[0];
    const gallery = parseJsonArray<GalleryItem>(hotel.galleryJson).flatMap((item) =>
      item?.url ? [item.url] : [],
    );
    const images = [...new Set([hotel.imageUrl, hotel.featuredImageUrl, ...gallery].filter(Boolean))];
    const amenities = amenityNames(hotel.amenitiesJson, catalog.amenities);
    if (room && room.mealPlan !== "room_only") {
      const meal = mealPlanLabel(room.mealPlan);
      const pill = meal === "Breakfast included" ? "Breakfast" : meal;
      if (!amenities.includes(pill)) amenities.unshift(pill);
    }
    const freeCancellation = /free cancellation/i.test(hotel.cancellationPolicy);
    const mapUrl =
      hotel.mapLat && hotel.mapLng
        ? `https://www.google.com/maps?q=${encodeURIComponent(`${hotel.mapLat},${hotel.mapLng}`)}`
        : "";

    return {
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      location: hotel.destination?.name ?? "",
      address: hotel.address,
      stars: hotel.starRating,
      images: images.length > 0 ? images : ["/img/general/map.svg"],
      roomName: room?.name ?? "",
      bedLabel: room?.bedType ? `1 ${room.bedType.toLowerCase()} bed` : room?.summary ?? "",
      cancellationTitle: freeCancellation
        ? "Free cancellation"
        : hotel.cancellationPolicy
          ? "Cancellation policy"
          : "",
      cancellationDetail: freeCancellation
        ? "You can cancel later, so lock in this great price today."
        : hotel.cancellationPolicy,
      freeCancellation,
      amenities: amenities.slice(0, 4),
      price: hotel.priceFrom,
      currency: hotel.currency || "INR",
      propertyType: propertyTypeLabel(hotel.propertyType),
      mapUrl,
    };
  });

  const locations: HotelListLocation[] = destinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    address: [destination.region, destination.country].filter(Boolean).join(", "),
  }));

  return (
    <HotelListV1 hotels={hotels} locations={locations} initialLocation={locationQuery} />
  );
}
