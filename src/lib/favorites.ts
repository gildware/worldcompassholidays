import "server-only";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { getUserLocale } from "@/i18n/get-locale";
import { loadCopyMap, withHotelCopy, withNameCopy, withPlaceCopy, withTourCopy, withVehicleCopy } from "@/lib/i18n/content";
import { type FavoriteCard, type FavoriteKind, isFavoriteKind } from "@/lib/favorite-kinds";
import { formatMoney } from "@/lib/format";
import { propertyTypeLabel } from "@/lib/hotels/options";

export async function favoriteIds(userId: string, kinds: FavoriteKind | FavoriteKind[]) {
  const list = Array.isArray(kinds) ? kinds : [kinds];
  if (list.length === 0) return [];
  const rows = await prisma.favorite.findMany({
    where: { userId, kind: { in: list } },
    select: { itemId: true },
  });
  return rows.map((row) => row.itemId);
}

export async function isFavorited(userId: string, kind: FavoriteKind, itemId: string) {
  const row = await prisma.favorite.findUnique({
    where: { userId_kind_itemId: { userId, kind, itemId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function publishedFavoritePath(kind: FavoriteKind, itemId: string) {
  const key = itemId.trim();
  if (!key) return null;
  if (kind === "tour") {
    const tour = await prisma.tour.findFirst({
      where: { published: true, OR: [{ id: key }, { slug: key }] },
      select: { id: true, slug: true },
    });
    return tour ? { path: `/tours/${tour.slug}`, itemId: tour.id } : null;
  }
  if (kind === "hotel") {
    const hotel = await prisma.hotel.findFirst({
      where: { published: true, OR: [{ id: key }, { slug: key }] },
      select: { id: true, slug: true },
    });
    return hotel ? { path: `/hotels/${hotel.slug}`, itemId: hotel.id } : null;
  }
  const vehicle = await prisma.vehicle.findFirst({
    where: { published: true, kind, status: { not: "inactive" }, OR: [{ id: key }, { slug: key }] },
    select: { id: true, slug: true },
  });
  return vehicle ? { path: `/rentals/${vehicle.slug}`, itemId: vehicle.id } : null;
}

function kindEnabled(kind: FavoriteKind) {
  if (kind === "tour") return modules.tours;
  if (kind === "hotel") return modules.hotels;
  if (kind === "car") return modules.cars;
  return modules.bikes;
}

function firstImage(...values: string[]) {
  return values.find((value) => value.trim()) ?? "";
}

export async function listFavoriteCards(userId: string): Promise<FavoriteCard[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (rows.length === 0) return [];

  const ids = (kind: FavoriteKind) => rows.filter((row) => row.kind === kind).map((row) => row.itemId);
  const [tours, hotels, vehicles] = await Promise.all([
    prisma.tour.findMany({
      where: { id: { in: ids("tour") }, published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
        featuredImageUrl: true,
        priceFrom: true,
        currency: true,
        summary: true,
        description: true,
        category: true,
        destination: { select: { id: true, name: true, summary: true } },
      },
    }),
    prisma.hotel.findMany({
      where: { id: { in: ids("hotel") }, published: true },
      select: {
        id: true,
        slug: true,
        name: true,
        imageUrl: true,
        featuredImageUrl: true,
        priceFrom: true,
        currency: true,
        propertyType: true,
        destination: { select: { id: true, name: true, summary: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: { id: { in: [...ids("car"), ...ids("bike")] }, published: true, status: { not: "inactive" } },
      select: {
        id: true,
        slug: true,
        name: true,
        kind: true,
        pricePerDay: true,
        currency: true,
        brand: true,
        destination: { select: { id: true, name: true, summary: true } },
        vehicleType: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const locale = await getUserLocale();
  const [tourCopies, placeCopies, hotelCopies, vehicleCopies, configCopies] = await Promise.all([
    loadCopyMap("tour", tours.map((tour) => tour.id), locale),
    loadCopyMap(
      "destination",
      [
        ...tours.flatMap((tour) => (tour.destination ? [tour.destination.id] : [])),
        ...hotels.flatMap((hotel) => (hotel.destination ? [hotel.destination.id] : [])),
        ...vehicles.flatMap((vehicle) => (vehicle.destination ? [vehicle.destination.id] : [])),
      ],
      locale,
    ),
    loadCopyMap("hotel", hotels.map((hotel) => hotel.id), locale),
    loadCopyMap("vehicle", vehicles.map((vehicle) => vehicle.id), locale),
    loadCopyMap(
      "rentalConfig",
      vehicles.flatMap((vehicle) => (vehicle.vehicleType ? [vehicle.vehicleType.id] : [])),
      locale,
    ),
  ]);
  const toursById = new Map(
    tours.map((tour) => {
      const localized = withTourCopy(tour, tourCopies.get(tour.id));
      const destination = tour.destination
        ? withPlaceCopy(tour.destination, placeCopies.get(tour.destination.id))
        : null;
      return [tour.id, { ...localized, destination }] as const;
    }),
  );
  const hotelsById = new Map(
    hotels.map((hotel) => {
      const localized = withHotelCopy({ ...hotel, summary: "", description: "" }, hotelCopies.get(hotel.id));
      const destination = hotel.destination
        ? withPlaceCopy(hotel.destination, placeCopies.get(hotel.destination.id))
        : null;
      return [hotel.id, { ...localized, destination }] as const;
    }),
  );
  const vehiclesById = new Map(
    vehicles.map((vehicle) => {
      const localized = withVehicleCopy(vehicle, vehicleCopies.get(vehicle.id));
      const destination = vehicle.destination
        ? withPlaceCopy(vehicle.destination, placeCopies.get(vehicle.destination.id))
        : null;
      const vehicleType = vehicle.vehicleType
        ? withNameCopy(vehicle.vehicleType, configCopies.get(vehicle.vehicleType.id))
        : null;
      return [vehicle.id, { ...localized, destination, vehicleType }] as const;
    }),
  );
  const stale: string[] = [];
  const cards: FavoriteCard[] = [];

  for (const row of rows) {
    if (!isFavoriteKind(row.kind) || !kindEnabled(row.kind)) continue;
    if (row.kind === "tour") {
      const tour = toursById.get(row.itemId);
      if (!tour) {
        stale.push(row.id);
        continue;
      }
      const place = [tour.destination?.name, tour.category].filter(Boolean).join(" · ");
      cards.push({
        id: row.id,
        kind: "tour",
        itemId: tour.id,
        title: tour.title,
        href: `/tours/${tour.slug}`,
        image: firstImage(tour.featuredImageUrl, tour.imageUrl),
        meta: place || "Tour",
        price: tour.priceFrom > 0 ? `From ${formatMoney(tour.priceFrom, tour.currency || "INR", locale)}` : "",
      });
      continue;
    }
    if (row.kind === "hotel") {
      const hotel = hotelsById.get(row.itemId);
      if (!hotel) {
        stale.push(row.id);
        continue;
      }
      cards.push({
        id: row.id,
        kind: "hotel",
        itemId: hotel.id,
        title: hotel.name,
        href: `/hotels/${hotel.slug}`,
        image: firstImage(hotel.featuredImageUrl, hotel.imageUrl),
        meta: [hotel.destination?.name, propertyTypeLabel(hotel.propertyType)].filter(Boolean).join(" · ") || "Hotel",
        price: hotel.priceFrom > 0 ? `${formatMoney(hotel.priceFrom, hotel.currency || "INR", locale)} / night` : "",
      });
      continue;
    }
    const vehicle = vehiclesById.get(row.itemId);
    if (!vehicle || vehicle.kind !== row.kind) {
      stale.push(row.id);
      continue;
    }
    cards.push({
      id: row.id,
      kind: row.kind,
      itemId: vehicle.id,
      title: vehicle.name,
      href: `/rentals/${vehicle.slug}`,
      image: vehicle.images[0]?.url ?? "",
      meta: [vehicle.destination?.name, vehicle.vehicleType?.name || vehicle.brand].filter(Boolean).join(" · "),
      price: vehicle.pricePerDay > 0 ? `${formatMoney(vehicle.pricePerDay, vehicle.currency || "INR", locale)} / day` : "",
    });
  }

  if (stale.length > 0) {
    await prisma.favorite.deleteMany({ where: { id: { in: stale } } });
  }

  return cards;
}
