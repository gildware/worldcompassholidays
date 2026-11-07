import { parseBookingDetails } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { destinationChoiceLabel } from "@/lib/destinations";

export type CatalogOverviewKind = "tour" | "hotel";

export type CatalogRankRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  subtitle: string;
  count: number;
  href: string;
  published: boolean;
};

export type CatalogOverviewStats = {
  total: number;
  published: number;
  draft: number;
  bookings: number;
  openBookings: number;
  confirmedBookings: number;
  favorites: number;
  totalViews: number;
  searches: number;
};

export type CatalogOverviewData = {
  kind: CatalogOverviewKind;
  stats: CatalogOverviewStats;
  topBooked: CatalogRankRow[];
  topViewed: CatalogRankRow[];
  recentBookings: {
    id: string;
    reference: string;
    title: string;
    contactName: string;
    status: string;
    createdAt: Date;
    href: string;
  }[];
};

const confirmedStatuses = new Set(["confirmed", "paid", "completed"]);
const openStatuses = new Set(["enquiry", "pending", "quoted", "under_review"]);

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function cover(...urls: (string | null | undefined)[]) {
  return urls.find((url) => Boolean(url?.trim())) || "";
}

function isConfirmed(status: string) {
  return confirmedStatuses.has(status);
}

function isOpen(status: string) {
  return openStatuses.has(status);
}

export async function loadCatalogOverview(
  kind: CatalogOverviewKind,
  limit = 8,
): Promise<CatalogOverviewData> {
  const module = kind;
  const listHref = kind === "tour" ? "/admin/tours" : "/admin/hotels";
  const bookingDesk = kind === "tour" ? "tours" : "hotels";
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (kind === "tour") {
    const [tours, bookings, favorites, searches, recent] = await Promise.all([
      prisma.tour.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          imageUrl: true,
          featuredImageUrl: true,
          published: true,
          viewCount: true,
          destination: { select: { name: true, parent: { select: { name: true } } } },
        },
        orderBy: { viewCount: "desc" },
      }),
      prisma.booking.findMany({
        where: { module },
        select: { id: true, title: true, status: true, details: true },
      }),
      prisma.favorite.count({ where: { kind } }),
      prisma.searchEvent.count({ where: { source: "tours", createdAt: { gte: since } } }),
      prisma.booking.findMany({
        where: { module },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          reference: true,
          title: true,
          contactName: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const bySlug = new Map(tours.map((tour) => [tour.slug, tour]));
    const byTitle = new Map(tours.map((tour) => [normalize(tour.title), tour]));
    const booked = new Map<string, number>();

    for (const booking of bookings) {
      const details = parseBookingDetails(booking.details);
      const slug = typeof details.tourSlug === "string" ? details.tourSlug.trim() : "";
      const matched =
        (slug && bySlug.get(slug)) ||
        byTitle.get(normalize(booking.title)) ||
        null;
      if (!matched) continue;
      booked.set(matched.id, (booked.get(matched.id) ?? 0) + 1);
    }

    const topBooked = [...booked.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .flatMap(([id, count]) => {
        const tour = tours.find((row) => row.id === id);
        if (!tour) return [];
        const place = tour.destination
          ? destinationChoiceLabel(tour.destination.name, tour.destination.parent?.name)
          : "";
        return [
          {
            id: tour.id,
            name: tour.title,
            slug: tour.slug,
            imageUrl: cover(tour.featuredImageUrl, tour.imageUrl),
            subtitle: place || (tour.published ? "Published" : "Draft"),
            count,
            href: `${listHref}/${tour.id}/view`,
            published: tour.published,
          },
        ];
      });

    const topViewed = [...tours]
      .filter((tour) => tour.viewCount > 0)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit)
      .map((tour) => {
        const place = tour.destination
          ? destinationChoiceLabel(tour.destination.name, tour.destination.parent?.name)
          : "";
        return {
          id: tour.id,
          name: tour.title,
          slug: tour.slug,
          imageUrl: cover(tour.featuredImageUrl, tour.imageUrl),
          subtitle: place || (tour.published ? "Published" : "Draft"),
          count: tour.viewCount,
          href: `${listHref}/${tour.id}/view`,
          published: tour.published,
        };
      });

    const published = tours.filter((tour) => tour.published).length;
    const confirmedBookings = bookings.filter((row) => isConfirmed(row.status)).length;
    const openBookings = bookings.filter((row) => isOpen(row.status)).length;

    return {
      kind,
      stats: {
        total: tours.length,
        published,
        draft: tours.length - published,
        bookings: bookings.length,
        openBookings,
        confirmedBookings,
        favorites,
        totalViews: tours.reduce((sum, tour) => sum + tour.viewCount, 0),
        searches,
      },
      topBooked,
      topViewed,
      recentBookings: recent.map((row) => ({
        ...row,
        href: `/admin/bookings/${row.id}?desk=${bookingDesk}`,
      })),
    };
  }

  const [hotels, bookings, favorites, searches, recent] = await Promise.all([
    prisma.hotel.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        imageUrl: true,
        featuredImageUrl: true,
        published: true,
        viewCount: true,
        starRating: true,
        destination: { select: { name: true, parent: { select: { name: true } } } },
        _count: { select: { rooms: true } },
      },
      orderBy: { viewCount: "desc" },
    }),
    prisma.booking.findMany({
      where: { module },
      select: { id: true, title: true, status: true, details: true },
    }),
    prisma.favorite.count({ where: { kind } }),
    prisma.searchEvent.count({ where: { source: "hotels", createdAt: { gte: since } } }),
    prisma.booking.findMany({
      where: { module },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        reference: true,
        title: true,
        contactName: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const bySlug = new Map(hotels.map((hotel) => [hotel.slug, hotel]));
  const byName = new Map(hotels.map((hotel) => [normalize(hotel.name), hotel]));
  const booked = new Map<string, number>();

  for (const booking of bookings) {
    const details = parseBookingDetails(booking.details);
    const slug = typeof details.hotelSlug === "string" ? details.hotelSlug.trim() : "";
    const hotelName = typeof details.hotelName === "string" ? details.hotelName.trim() : "";
    const titleMatch = booking.title.replace(/^Hotel request:\s*/i, "").trim();
    const matched =
      (slug && bySlug.get(slug)) ||
      (hotelName && byName.get(normalize(hotelName))) ||
      (titleMatch && byName.get(normalize(titleMatch))) ||
      null;
    if (!matched) continue;
    booked.set(matched.id, (booked.get(matched.id) ?? 0) + 1);
  }

  const topBooked = [...booked.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .flatMap(([id, count]) => {
      const hotel = hotels.find((row) => row.id === id);
      if (!hotel) return [];
      const place = hotel.destination
        ? destinationChoiceLabel(hotel.destination.name, hotel.destination.parent?.name)
        : "";
      const stars = hotel.starRating > 0 ? `${hotel.starRating}★` : "";
      return [
        {
          id: hotel.id,
          name: hotel.name,
          slug: hotel.slug,
          imageUrl: cover(hotel.featuredImageUrl, hotel.imageUrl),
          subtitle: [place, stars, hotel.published ? "Published" : "Draft"].filter(Boolean).join(" · "),
          count,
          href: `${listHref}/${hotel.id}/view`,
          published: hotel.published,
        },
      ];
    });

  const topViewed = [...hotels]
    .filter((hotel) => hotel.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit)
    .map((hotel) => {
      const place = hotel.destination
        ? destinationChoiceLabel(hotel.destination.name, hotel.destination.parent?.name)
        : "";
      const stars = hotel.starRating > 0 ? `${hotel.starRating}★` : "";
      return {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
        imageUrl: cover(hotel.featuredImageUrl, hotel.imageUrl),
        subtitle: [place, stars, hotel.published ? "Published" : "Draft"].filter(Boolean).join(" · "),
        count: hotel.viewCount,
        href: `${listHref}/${hotel.id}/view`,
        published: hotel.published,
      };
    });

  const published = hotels.filter((hotel) => hotel.published).length;
  const confirmedBookings = bookings.filter((row) => isConfirmed(row.status)).length;
  const openBookings = bookings.filter((row) => isOpen(row.status)).length;

  return {
    kind,
    stats: {
      total: hotels.length,
      published,
      draft: hotels.length - published,
      bookings: bookings.length,
      openBookings,
      confirmedBookings,
      favorites,
      totalViews: hotels.reduce((sum, hotel) => sum + hotel.viewCount, 0),
      searches,
    },
    topBooked,
    topViewed,
    recentBookings: recent.map((row) => ({
      ...row,
      href: `/admin/bookings/${row.id}?desk=${bookingDesk}`,
    })),
  };
}
