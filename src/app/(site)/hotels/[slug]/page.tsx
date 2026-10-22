import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelStay } from "@/components/hotel-single/HotelStay";
import type { HotelListLocation } from "@/components/hotel-list/types";
import type { HotelRoomCard, HotelSingleData, SimilarHotelCard } from "@/components/hotel-single/types";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/session";
import { loadHotelCatalog } from "@/lib/catalog-query";
import type { CatalogOption } from "@/lib/catalog";
import { resolveFaqs, resolveTitles } from "@/lib/hotels/labels";
import { mealPlanLabel, propertyTypeLabel } from "@/lib/hotels/options";
import { getHotelSettings } from "@/lib/hotels/settings";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  breadcrumbNode,
  faqNode,
  graphLd,
  organizationNode,
  pageMetadata,
  plainText,
  privateMetadata,
} from "@/lib/seo";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const ratingLabels = ["", "Pleasant", "Good", "Very good", "Excellent", "Exceptional"];

function stayDate(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

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
    select: {
      name: true,
      summary: true,
      seoTitle: true,
      seoDescription: true,
      seoIndex: true,
      seoImageUrl: true,
      imageUrl: true,
      featuredImageUrl: true,
      published: true,
      destination: { select: { name: true } },
    },
  });
  if (!hotel?.published) return privateMetadata("Hotel");
  const place = hotel.destination?.name;
  return pageMetadata({
    title: hotel.seoTitle.trim() || hotel.name,
    description:
      hotel.seoDescription.trim() ||
      hotel.summary.trim() ||
      `${hotel.name}${place ? ` in ${place}` : ""}. Rooms, rates, and what is included.`,
    path: `/hotels/${slug}`,
    image: hotel.seoImageUrl || hotel.featuredImageUrl || hotel.imageUrl,
    imageAlt: hotel.name,
    index: hotel.seoIndex,
  });
}

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function bounded(value: string, min: number, max: number, fallback: number) {
  const number = Number(value);
  return number >= min && number <= max ? number : fallback;
}

export default async function HotelPage({ params, searchParams }: Props) {
  if (!modules.hotels) notFound();
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};

  const [hotel, catalog, destinations, user, settings] = await Promise.all([
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
    getCurrentUser(),
    getHotelSettings(),
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
    const roomImages = [...new Set([room.imageUrl, ...images].filter(Boolean))];
    return {
      id: room.id,
      name: room.name,
      image: roomImages[0] || "/img/general/map.svg",
      images: roomImages.length > 0 ? roomImages : ["/img/general/map.svg"],
      occupancy: room.occupancy,
      sizeSqm: room.sizeSqm,
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
    mapLat: hotel.mapLat,
    mapLng: hotel.mapLng,
    mapZoom: hotel.mapZoom,
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

  const path = `/hotels/${hotel.slug}`;
  const description =
    hotel.seoDescription.trim() ||
    hotel.summary.trim() ||
    plainText(hotel.description) ||
    `${hotel.name}${hotel.destination?.name ? ` in ${hotel.destination.name}` : ""}.`;
  const addressCountry = hotel.destination?.country
    ? hotel.destination.country === "India"
      ? "IN"
      : hotel.destination.country
    : "";

  return (
    <>
      <JsonLd
        data={graphLd([
          organizationNode(),
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Hotels", path: "/hotels" },
            ...(hotel.destination
              ? [{ name: hotel.destination.name, path: `/destinations/${hotel.destination.slug}` }]
              : []),
            { name: hotel.name, path },
          ]),
          faqNode(data.faqs),
          {
            "@type": "Hotel",
            name: hotel.name,
            description,
            url: absoluteUrl(path),
            image: data.images.map((image) => absoluteUrl(image)),
            ...(hotel.starRating > 0
              ? {
                  starRating: {
                    "@type": "Rating",
                    ratingValue: String(hotel.starRating),
                    bestRating: "5",
                  },
                }
              : {}),
            ...(hotel.address.trim() || hotel.destination?.name || addressCountry
              ? {
                  address: {
                    "@type": "PostalAddress",
                    ...(hotel.address.trim() ? { streetAddress: hotel.address.trim() } : {}),
                    ...(hotel.destination?.name ? { addressLocality: hotel.destination.name } : {}),
                    ...(addressCountry ? { addressCountry } : {}),
                  },
                }
              : {}),
            ...(hotel.priceFrom > 0
              ? { priceRange: formatMoney(hotel.priceFrom, hotel.currency || "INR") }
              : {}),
          },
        ])}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <HotelStay
        hotel={data}
        customer={user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null}
        defaultCheckIn={/^\d{4}-\d{2}-\d{2}$/.test(one(query.in)) ? one(query.in) : stayDate(0)}
        defaultCheckOut={/^\d{4}-\d{2}-\d{2}$/.test(one(query.out)) ? one(query.out) : stayDate(1)}
        defaultAdults={bounded(one(query.adults), 1, 8, 2)}
        defaultChildren={bounded(one(query.children), 0, 6, 0)}
        defaultRooms={bounded(one(query.rooms), 1, 4, 1)}
        taxEnabled={settings.taxEnabled}
      />
    </>
  );
}
