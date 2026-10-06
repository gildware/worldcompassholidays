import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelSingleV2 } from "@/components/hotel-single/HotelSingleV2";
import type { HotelListLocation } from "@/components/hotel-list/types";
import type { HotelRoomCard, HotelSingleData, SimilarHotelCard } from "@/components/hotel-single/types";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { loadHotelCatalog } from "@/lib/catalog-query";
import type { CatalogOption } from "@/lib/catalog";
import { resolveFaqs, resolveTitles } from "@/lib/hotels/labels";
import { mealPlanLabel, propertyTypeLabel } from "@/lib/hotels/options";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

type Props = { params: Promise<{ slug: string }> };

const ratingLabels = ["", "Pleasant", "Good", "Very good", "Excellent", "Exceptional"];

function amenityNames(stored: string, catalog: CatalogOption[]) {
  const resolved = resolveTitles(stored, catalog);
  if (resolved.length > 0) return resolved;
  return parseJsonArray<string>(stored).flatMap((value) => {
    if (typeof value !== "string" || !value) return [];
    const label = value.replace(/^catalog_(hotel|room)_amenity_/, "").replace(/_/g, " ");
    return [label.charAt(0).toUpperCase() + label.slice(1)];
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { name: true, seoTitle: true, seoDescription: true, published: true },
  });
  if (!hotel?.published) return { title: "Hotel" };
  return {
    title: hotel.seoTitle || hotel.name,
    description: hotel.seoDescription || undefined,
  };
}

export default async function HotelPage({ params }: Props) {
  if (!modules.hotels) notFound();
  const { slug } = await params;

  const [hotel, catalog, destinations] = await Promise.all([
    prisma.hotel.findUnique({
      where: { slug },
      include: {
        destination: true,
        rooms: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    loadHotelCatalog(),
    prisma.destination.findMany({
      where: { published: true, hotels: { some: { published: true } } },
      select: { id: true, name: true, region: true, country: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!hotel || !hotel.published) notFound();

  const similarRows = await prisma.hotel.findMany({
    where: { published: true, id: { not: hotel.id } },
    include: { destination: { select: { name: true } } },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    take: 8,
  });

  const gallery = parseJsonArray<GalleryItem>(hotel.galleryJson).flatMap((item) =>
    item?.url ? [item.url] : [],
  );
  const images = [...new Set([hotel.imageUrl, hotel.featuredImageUrl, ...gallery].filter(Boolean))];
  const amenities = amenityNames(hotel.amenitiesJson, catalog.amenities);
  const faqs = resolveFaqs(hotel.faqsJson, catalog.faqs);
  const freeCancellation = /free cancellation/i.test(hotel.cancellationPolicy);
  const mapUrl =
    hotel.mapLat && hotel.mapLng
      ? `https://www.google.com/maps?q=${encodeURIComponent(`${hotel.mapLat},${hotel.mapLng}`)}`
      : "";

  const rooms: HotelRoomCard[] = hotel.rooms.map((room) => {
    const features = [
      ...resolveTitles(room.featuresJson, catalog.features),
      ...resolveTitles(room.amenitiesJson, catalog.roomAmenities),
    ];
    return {
      id: room.id,
      name: room.name,
      image: room.imageUrl || images[0] || "/img/general/map.svg",
      occupancy: room.occupancy,
      bedLabel: room.bedType ? `1 ${room.bedType.toLowerCase()} bed` : "",
      summary: room.summary,
      price: room.pricePerNight,
      currency: hotel.currency || "INR",
      quantity: room.quantity,
      meal: mealPlanLabel(room.mealPlan),
      features,
      freeCancellation,
      cancellation: hotel.cancellationPolicy,
    };
  });

  const similar: SimilarHotelCard[] = similarRows.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    location: item.destination?.name ?? "",
    image: item.featuredImageUrl || item.imageUrl || "/img/general/map.svg",
    priceLabel: formatMoney(item.priceFrom, item.currency || "INR"),
    score: item.starRating > 0 ? item.starRating.toFixed(1) : "",
    scoreLabel: ratingLabels[item.starRating] ?? "",
  }));

  const locations: HotelListLocation[] = destinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    address: [destination.region, destination.country].filter(Boolean).join(", "),
  }));

  const data: HotelSingleData = {
    name: hotel.name,
    slug: hotel.slug,
    location: hotel.destination?.name ?? "",
    destinationHref: hotel.destination ? `/destinations/${hotel.destination.slug}` : "/hotels",
    address: hotel.address,
    summary: hotel.summary,
    description: hotel.description,
    stars: hotel.starRating,
    scoreLabel: ratingLabels[hotel.starRating] ?? "",
    priceLabel: formatMoney(hotel.priceFrom, hotel.currency || "INR"),
    images: images.length > 0 ? images : ["/img/general/map.svg"],
    mapUrl,
    amenities,
    checkIn: hotel.checkIn || "2:00 PM",
    checkOut: hotel.checkOut || "11:00 AM",
    cancellation: hotel.cancellationPolicy,
    houseRules: hotel.houseRules,
    propertyType: propertyTypeLabel(hotel.propertyType),
    roomCount: hotel.rooms.reduce((sum, room) => sum + Math.max(1, room.quantity), 0),
    faqs:
      faqs.length > 0
        ? faqs
        : [
            {
              title: "What time is check-in?",
              content: `Check-in from ${hotel.checkIn || "2:00 PM"} and check-out until ${hotel.checkOut || "11:00 AM"}.`,
            },
          ],
    rooms,
    similar,
    locations,
  };

  return <HotelSingleV2 hotel={data} />;
}
