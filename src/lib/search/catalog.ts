import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { isLocale } from "@/i18n/locales";
import { loadCopyMap, withHotelCopy, withNameCopy, withPlaceCopy, withTourCopy, withVehicleCopy } from "@/lib/i18n/content";
import { clipText, plainText } from "@/lib/seo";
import { prepareQuery, scoreSearch, tokenVariants } from "@/lib/search/rank";
import type { SearchHit, SearchKind } from "@/lib/search/types";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

const perKind = 20;

type ScoredHit = SearchHit & { score: number };

function contains(token: string) {
  return { contains: token };
}

function caseVariants(token: string) {
  const lower = token.toLowerCase();
  const titled = lower.charAt(0).toUpperCase() + lower.slice(1);
  return [token, lower, token.toUpperCase(), titled];
}

function matchVariants(token: string) {
  return [...new Set(tokenVariants(token).flatMap((variant) => caseVariants(variant)))];
}

function tokenClause(token: string, fields: ((variant: string) => object)[]) {
  return {
    OR: matchVariants(token).flatMap((variant) => fields.map((field) => field(variant))),
  };
}

function textWhere(tokens: string[], fields: ((variant: string) => object)[]) {
  if (!tokens.length) return {};
  return { AND: tokens.map((token) => tokenClause(token, fields)) };
}

function placeLine(destination: { name: string; region: string; country: string } | null) {
  if (!destination) return "";
  return [destination.name, destination.region, destination.country].filter(Boolean).join(" ");
}

function coverImage(imageUrl: string, featuredImageUrl = "", galleryJson = "") {
  const gallery = galleryJson
    ? parseJsonArray<GalleryItem>(galleryJson).flatMap((item) => (item?.url ? [item.url] : []))
    : [];
  return [imageUrl, featuredImageUrl, ...gallery].map((url) => url.trim()).find(Boolean) ?? "";
}

function label(value: string) {
  const clean = value.trim();
  if (!clean) return "";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function rank(
  hit: Omit<SearchHit, "reason">,
  fields: { place: string; type: string; blurb: string },
  textTokens: string[],
  featured = false,
): ScoredHit {
  const scored = scoreSearch({
    title: hit.title,
    place: fields.place,
    type: fields.type,
    blurb: fields.blurb,
    textTokens,
    featured,
  });
  return { ...hit, reason: scored.reason, score: scored.score || 1 };
}

const placeFields = [
  (variant: string) => ({ destination: { name: contains(variant) } }),
  (variant: string) => ({ destination: { region: contains(variant) } }),
  (variant: string) => ({ destination: { country: contains(variant) } }),
];

async function searchTours(text: string[]): Promise<ScoredHit[]> {
  const tours = await prisma.tour.findMany({
    where: {
      published: true,
      ...textWhere(text, [
        (variant) => ({ title: contains(variant) }),
        (variant) => ({ summary: contains(variant) }),
        (variant) => ({ description: contains(variant) }),
        (variant) => ({ category: contains(variant) }),
        ...placeFields,
      ]),
    },
    take: 40,
    select: {
      slug: true,
      title: true,
      summary: true,
      description: true,
      category: true,
      durationDays: true,
      durationUnit: true,
      durationLabel: true,
      priceFrom: true,
      currency: true,
      imageUrl: true,
      featuredImageUrl: true,
      galleryJson: true,
      isFeatured: true,
      destination: { select: { name: true, region: true, country: true } },
    },
  });

  return tours.map((tour) => {
    const blurb = plainText(tour.summary || tour.description);
    const style = tour.category.trim() || "Tour";
    const detail = tour.durationLabel.trim() || `${tour.durationDays} ${tour.durationUnit || "days"}`;
    return rank(
      {
        kind: "tour",
        slug: tour.slug,
        title: tour.title,
        place: tour.destination?.name ?? "",
        style,
        detail,
        blurb: clipText(blurb, 110),
        image: coverImage(tour.imageUrl, tour.featuredImageUrl, tour.galleryJson),
        price: tour.priceFrom,
        currency: tour.currency || "INR",
        href: `/tours/${tour.slug}`,
      },
      {
        place: placeLine(tour.destination),
        type: style,
        blurb,
      },
      text,
      tour.isFeatured,
    );
  });
}

async function searchHotels(text: string[]): Promise<ScoredHit[]> {
  const hotels = await prisma.hotel.findMany({
    where: {
      published: true,
      ...textWhere(text, [
        (variant) => ({ name: contains(variant) }),
        (variant) => ({ summary: contains(variant) }),
        (variant) => ({ description: contains(variant) }),
        (variant) => ({ propertyType: contains(variant) }),
        (variant) => ({ address: contains(variant) }),
        ...placeFields,
      ]),
    },
    take: 40,
    select: {
      id: true,
      slug: true,
      name: true,
      summary: true,
      description: true,
      propertyType: true,
      starRating: true,
      priceFrom: true,
      currency: true,
      imageUrl: true,
      featuredImageUrl: true,
      galleryJson: true,
      isFeatured: true,
      destination: { select: { id: true, name: true, region: true, country: true, summary: true } },
      rooms: {
        where: { active: true },
        orderBy: { pricePerNight: "asc" },
        take: 1,
        select: { pricePerNight: true },
      },
    },
  });

  return hotels.map((hotel) => {
    const blurb = plainText(hotel.summary || hotel.description);
    const style = label(hotel.propertyType || "hotel");
    const detail = hotel.starRating > 0 ? `${hotel.starRating}-star` : "Stay";
    return rank(
      {
        kind: "hotel",
        slug: hotel.slug,
        title: hotel.name,
        place: hotel.destination?.name ?? "",
        style,
        detail,
        blurb: clipText(blurb, 110),
        image: coverImage(hotel.imageUrl, hotel.featuredImageUrl, hotel.galleryJson),
        price: hotel.priceFrom || hotel.rooms[0]?.pricePerNight || 0,
        currency: hotel.currency || "INR",
        href: `/hotels/${hotel.slug}`,
      },
      {
        place: placeLine(hotel.destination),
        type: `${style} hotel stay`,
        blurb,
      },
      text,
      hotel.isFeatured,
    );
  });
}

async function searchVehicles(kind: "car" | "bike", text: string[]): Promise<ScoredHit[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      published: true,
      kind,
      status: { not: "inactive" },
      ...textWhere(text, [
        (variant) => ({ name: contains(variant) }),
        (variant) => ({ summary: contains(variant) }),
        (variant) => ({ description: contains(variant) }),
        (variant) => ({ brand: contains(variant) }),
        (variant) => ({ modelName: contains(variant) }),
        (variant) => ({ vehicleType: { name: contains(variant) } }),
        (variant) => ({ transmission: { name: contains(variant) } }),
        ...placeFields,
      ]),
    },
    take: 40,
    select: {
      id: true,
      slug: true,
      name: true,
      summary: true,
      description: true,
      brand: true,
      modelName: true,
      seats: true,
      pricePerDay: true,
      currency: true,
      destination: { select: { id: true, name: true, region: true, country: true, summary: true } },
      vehicleType: { select: { id: true, name: true } },
      transmission: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  return vehicles.map((vehicle) => {
    const blurb = plainText(vehicle.summary || vehicle.description);
    const style = vehicle.vehicleType?.name || (kind === "bike" ? "Bike" : "Car");
    const detail = kind === "bike" ? vehicle.transmission?.name || "" : vehicle.seats ? `${vehicle.seats} seats` : "";
    return rank(
      {
        kind,
        slug: vehicle.slug,
        title: vehicle.name,
        place: vehicle.destination?.name ?? "",
        style,
        detail,
        blurb: clipText(blurb, 110),
        image: vehicle.images[0]?.url?.trim() ?? "",
        price: vehicle.pricePerDay,
        currency: vehicle.currency || "INR",
        href: `/rentals/${vehicle.slug}`,
      },
      {
        place: placeLine(vehicle.destination),
        type: [vehicle.brand, vehicle.modelName, style, vehicle.transmission?.name ?? ""].join(" "),
        blurb,
      },
      text,
    );
  });
}

const runners: Record<SearchKind, (text: string[]) => Promise<ScoredHit[]>> = {
  tour: searchTours,
  hotel: searchHotels,
  car: (text) => searchVehicles("car", text),
  bike: (text) => searchVehicles("bike", text),
};

const enabled: Record<SearchKind, boolean> = {
  tour: modules.tours,
  hotel: modules.hotels,
  car: modules.cars,
  bike: modules.bikes,
};

export async function localizeTourHits(hits: SearchHit[], locale: string): Promise<SearchHit[]> {
  if (!isLocale(locale) || locale === "en") return hits;
  const slugs = hits.filter((hit) => hit.kind === "tour").map((hit) => hit.slug);
  const tours = slugs.length === 0 ? [] : await prisma.tour.findMany({
    where: { slug: { in: slugs }, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      category: true,
      durationLabel: true,
      address: true,
      destination: { select: { id: true, name: true, summary: true } },
    },
  });
  const [copies, placeCopies] = await Promise.all([
    loadCopyMap("tour", tours.map((tour) => tour.id), locale),
    loadCopyMap(
      "destination",
      tours.flatMap((tour) => (tour.destination ? [tour.destination.id] : [])),
      locale,
    ),
  ]);
  const hotelSlugs = hits.filter((hit) => hit.kind === "hotel").map((hit) => hit.slug);
  const rideSlugs = hits.filter((hit) => hit.kind === "car" || hit.kind === "bike").map((hit) => hit.slug);
  const [hotels, vehicles] = await Promise.all([
    hotelSlugs.length
      ? prisma.hotel.findMany({
          where: { slug: { in: hotelSlugs }, published: true },
          select: {
            id: true,
            slug: true,
            name: true,
            summary: true,
            description: true,
            destination: { select: { id: true, name: true, summary: true } },
          },
        })
      : Promise.resolve([]),
    rideSlugs.length
      ? prisma.vehicle.findMany({
          where: { slug: { in: rideSlugs }, published: true },
          select: {
            id: true,
            slug: true,
            name: true,
            summary: true,
            description: true,
            vehicleType: { select: { id: true, name: true } },
            transmission: { select: { id: true, name: true } },
            destination: { select: { id: true, name: true, summary: true } },
          },
        })
      : Promise.resolve([]),
  ]);
  const [hotelCopies, vehicleCopies, extraPlaces, configCopies] = await Promise.all([
    loadCopyMap("hotel", hotels.map((hotel) => hotel.id), locale),
    loadCopyMap("vehicle", vehicles.map((vehicle) => vehicle.id), locale),
    loadCopyMap(
      "destination",
      [
        ...hotels.flatMap((hotel) => (hotel.destination ? [hotel.destination.id] : [])),
        ...vehicles.flatMap((vehicle) => (vehicle.destination ? [vehicle.destination.id] : [])),
      ],
      locale,
    ),
    loadCopyMap(
      "rentalConfig",
      vehicles.flatMap((vehicle) =>
        [vehicle.vehicleType?.id, vehicle.transmission?.id].filter((id): id is string => Boolean(id)),
      ),
      locale,
    ),
  ]);
  const hotelsBySlug = new Map(hotels.map((hotel) => [hotel.slug, hotel]));
  const vehiclesBySlug = new Map(vehicles.map((vehicle) => [vehicle.slug, vehicle]));

  const bySlug = new Map(tours.map((tour) => [tour.slug, tour]));
  return hits.map((hit) => {
    if (hit.kind === "hotel") {
      const hotel = hotelsBySlug.get(hit.slug);
      if (!hotel) return hit;
      const localized = withHotelCopy(hotel, hotelCopies.get(hotel.id));
      const place = hotel.destination
        ? withPlaceCopy(hotel.destination, extraPlaces.get(hotel.destination.id))
        : null;
      const blurb = plainText(localized.summary || localized.description);
      return {
        ...hit,
        title: localized.name,
        place: place?.name || hit.place,
        blurb: blurb ? clipText(blurb, 110) : hit.blurb,
      };
    }
    if (hit.kind === "car" || hit.kind === "bike") {
      const vehicle = vehiclesBySlug.get(hit.slug);
      if (!vehicle) return hit;
      const localized = withVehicleCopy(vehicle, vehicleCopies.get(vehicle.id));
      const place = vehicle.destination
        ? withPlaceCopy(vehicle.destination, extraPlaces.get(vehicle.destination.id))
        : null;
      const typeName = vehicle.vehicleType
        ? withNameCopy(vehicle.vehicleType, configCopies.get(vehicle.vehicleType.id)).name
        : "";
      const transmissionName = vehicle.transmission
        ? withNameCopy(vehicle.transmission, configCopies.get(vehicle.transmission.id)).name
        : "";
      const blurb = plainText(localized.summary || localized.description);
      return {
        ...hit,
        title: localized.name,
        place: place?.name || hit.place,
        style: typeName || hit.style,
        detail: hit.kind === "bike" ? transmissionName || hit.detail : hit.detail,
        blurb: blurb ? clipText(blurb, 110) : hit.blurb,
      };
    }
    if (hit.kind !== "tour") return hit;
    const tour = bySlug.get(hit.slug);
    if (!tour) return hit;
    const localized = withTourCopy(tour, copies.get(tour.id));
    const place = tour.destination
      ? withPlaceCopy(tour.destination, placeCopies.get(tour.destination.id))
      : null;
    const blurb = plainText(localized.summary || localized.description);
    return {
      ...hit,
      title: localized.title,
      place: place?.name || hit.place,
      style: localized.category.trim() || hit.style,
      detail: localized.durationLabel.trim() || hit.detail,
      blurb: blurb ? clipText(blurb, 110) : hit.blurb,
    };
  });
}

export async function searchCatalog(rawQuery: string): Promise<SearchHit[]> {
  const query = rawQuery.trim().slice(0, 80);
  const { kinds, text } = prepareQuery(query);
  if (!text.length && !kinds.length) return [];

  const active = (Object.keys(runners) as SearchKind[]).filter((kind) => {
    if (!enabled[kind]) return false;
    return kinds.length === 0 || kinds.includes(kind);
  });

  const groups = await Promise.all(active.map((kind) => runners[kind](text)));
  const ranked = groups.flat().sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const kept = new Map<SearchKind, number>();
  const hits: SearchHit[] = [];
  for (const hit of ranked) {
    const count = kept.get(hit.kind) ?? 0;
    if (count >= perKind) continue;
    kept.set(hit.kind, count + 1);
    hits.push({
      kind: hit.kind,
      slug: hit.slug,
      title: hit.title,
      place: hit.place,
      style: hit.style,
      detail: hit.detail,
      blurb: hit.blurb,
      image: hit.image,
      price: hit.price,
      currency: hit.currency,
      href: hit.href,
      reason: hit.reason,
    });
  }
  return hits;
}
