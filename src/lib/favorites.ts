import "server-only";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
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
  if (kind === "tour") {
    const tour = await prisma.tour.findFirst({
      where: { id: itemId, published: true },
      select: { slug: true },
    });
    return tour ? `/tours/${tour.slug}` : null;
  }
  if (kind === "hotel") {
    const hotel = await prisma.hotel.findFirst({
      where: { id: itemId, published: true },
      select: { slug: true },
    });
    return hotel ? `/hotels/${hotel.slug}` : null;
  }
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: itemId, published: true, kind, status: { not: "inactive" } },
    select: { slug: true },
  });
  return vehicle ? `/rentals/${vehicle.slug}` : null;
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
        category: true,
        destination: { select: { name: true } },
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
        destination: { select: { name: true } },
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
        destination: { select: { name: true } },
        vehicleType: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const toursById = new Map(tours.map((tour) => [tour.id, tour]));
  const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));
  const vehiclesById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
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
        price: tour.priceFrom > 0 ? `From ${formatMoney(tour.priceFrom, tour.currency || "INR")}` : "",
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
        price: hotel.priceFrom > 0 ? `${formatMoney(hotel.priceFrom, hotel.currency || "INR")} / night` : "",
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
      price: vehicle.pricePerDay > 0 ? `${formatMoney(vehicle.pricePerDay, vehicle.currency || "INR")} / day` : "",
    });
  }

  if (stale.length > 0) {
    await prisma.favorite.deleteMany({ where: { id: { in: stale } } });
  }

  return cards;
}
