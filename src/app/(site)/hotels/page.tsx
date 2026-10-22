import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelStayList } from "@/components/hotel-list/stay-list/HotelStayList";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { loadHotelCatalog } from "@/lib/catalog-query";
import type { CatalogOption } from "@/lib/catalog";
import { resolveTitles } from "@/lib/hotels/labels";
import { propertyTypeLabel } from "@/lib/hotels/options";
import { getHotelSettings } from "@/lib/hotels/settings";
import { readStayState, type StayListHotel, type StayPlace } from "@/lib/hotels/stay-list";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hotels and stays",
  description:
    "Hotels and stays with rates, locations, and what is included. Search by city and dates, or ask us to find a place that is not listed.",
  path: "/hotels",
});

function isoAhead(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function plain(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cancelLead(policy: string) {
  if (!/free cancellation/i.test(policy)) return null;
  const days = policy.match(/(\d+)\s*days?/i);
  if (days) return Number(days[1]);
  const hours = policy.match(/(\d+)\s*hours?/i);
  if (hours) return Math.max(1, Math.ceil(Number(hours[1]) / 24));
  return 2;
}

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
  const [rows, catalog, destinations] = await Promise.all([
    prisma.hotel.findMany({
      where: { published: true },
      include: {
        destination: { select: { name: true, slug: true } },
        rooms: {
          where: { active: true },
          orderBy: { pricePerNight: "asc" },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
    loadHotelCatalog(),
    prisma.destination.findMany({
      where: { published: true, hotels: { some: { published: true } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const hotels: StayListHotel[] = rows.map((hotel) => {
    const room = hotel.rooms[0];
    const gallery = parseJsonArray<GalleryItem>(hotel.galleryJson).flatMap((item) =>
      item?.url ? [item.url] : [],
    );
    const images = [...new Set([hotel.imageUrl, hotel.featuredImageUrl, ...gallery].filter(Boolean))];
    const lat = Number(hotel.mapLat);
    const lng = Number(hotel.mapLng);
    const town = hotel.destination?.name ?? "";
    const area = hotel.address.split(",")[0]?.trim() || town;
    const lead = cancelLead(hotel.cancellationPolicy);
    const nightly = room?.pricePerNight || hotel.priceFrom;
    const photos = (images.length ? images : ["/img/general/map.svg"]).map((src) => ({
      src,
      alt: hotel.name,
    }));

    return {
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      stars: hotel.starRating,
      type: propertyTypeLabel(hotel.propertyType),
      area,
      town,
      townId: hotel.destination?.slug || "other",
      lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
      lng: Number.isFinite(lng) && lng !== 0 ? lng : null,
      score: null,
      reviews: null,
      parts: null,
      nightly,
      currency: hotel.currency || "INR",
      breakfast: Boolean(room && room.mealPlan !== "room_only"),
      freeCancel: lead != null,
      cancelDays: lead ?? 2,
      pay: false,
      left: null,
      amenities: amenityNames(hotel.amenitiesJson, catalog.amenities),
      line: plain(hotel.summary),
      photos,
      roomName: room?.name ?? "",
    };
  });

  const places: StayPlace[] = destinations.map((destination) => ({
    id: destination.slug,
    name: destination.name,
  }));
  if (hotels.some((hotel) => hotel.townId === "other")) places.push({ id: "other", name: "Other" });

  const checkin = isoAhead(0);
  const checkout = isoAhead(1);
  const { taxEnabled } = await getHotelSettings();
  const initial = readStayState(params, {
    places: places.map((place) => place.id),
    checkin,
    checkout,
  });

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <HotelStayList hotels={hotels} places={places} initial={initial} defaults={{ checkin, checkout }} taxEnabled={taxEnabled} />
    </>
  );
}
