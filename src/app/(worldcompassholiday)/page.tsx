import type { Metadata } from "next";
import { HomeDesktop } from "@/components/home/HomeDesktop";
import { HomeExperience } from "@/components/home/HomeExperience";
import { type HomeBus } from "@/components/home/HomeBusSection";
import { type HomeRide } from "@/components/home/home-ride-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { durationChoices } from "@/components/tour-list/tour-list-v2/query";
import type { TourListLocation } from "@/components/tour-list/types";
import { HomeFooter } from "@/components/worldcompassholiday/HomeFooter";
import { modules } from "@/config/modules";
import { theme } from "@/config/theme";
import { getSiteSettings } from "@/lib/brand";
import { coachLabel } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { favoriteIds } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/auth/session";
import { getGoogleReviewsForPlace } from "@/lib/google-reviews";
import { getHomePageContent, orderByIds, type HomeRailConfig } from "@/lib/home-page";
import { getMessages, getUiDictionary, getUserLocale } from "@/i18n/get-locale";
import { loadCopyMap, withHotelCopy, withNameCopy, withPlaceCopy, withTourCopy, withVehicleCopy } from "@/lib/i18n/content";
import { localizeCopy, localizeHome } from "@/i18n/home-copy";
import { getPublicNav } from "@/lib/navigation";
import { resolveRideCover, stayImageList } from "@/lib/catalog-media";
import { formatNumber } from "@/lib/format";
import { clipText, graphLd, organizationNode, pageMetadata, plainText, websiteNode } from "@/lib/seo";
import { cached } from "@/lib/ttl-cache";

function counted(count: number, one: string, many: string, t: (value: string) => string, locale: Parameters<typeof formatNumber>[1]) {
  return `${formatNumber(count, locale)} ${t(count === 1 ? one : many)}`;
}

function popularHoverText(
  counts: { hotels: number; rentals: number; tours: number },
  region: string,
  country: string,
  t: (value: string) => string,
  locale: Parameters<typeof formatNumber>[1],
) {
  const parts = [
    counts.hotels ? counted(counts.hotels, "Hotel", "Hotels", t, locale) : null,
    counts.rentals ? counted(counts.rentals, "rental", "rentals", t, locale) : null,
    counts.tours ? counted(counts.tours, "tour", "tours", t, locale) : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" - ") : `${region}, ${country}`;
}

function destinationMeta(
  counts: { hotels: number; rentals: number; tours: number },
  t: (value: string) => string,
  locale: Parameters<typeof formatNumber>[1],
) {
  const parts = [
    counts.tours ? counted(counts.tours, "tour", "tours", t, locale) : null,
    counts.hotels ? counted(counts.hotels, "stay", "stays", t, locale) : null,
    counts.rentals ? counted(counts.rentals, "rental", "rentals", t, locale) : null,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : t("Explore");
}

function label(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function tourPlanCopy(
  tour: {
    summary: string;
    category: string;
    difficulty: string;
    destination: { name: string } | null;
  },
  duration: string,
) {
  const place = tour.destination?.name || "";
  const summary =
    plainText(tour.summary).trim() ||
    `A ${duration} plan${place ? ` through ${place}` : ""}.`;
  const chips = [label(tour.category), label(tour.difficulty), place].filter(
    (item, index, all) => Boolean(item) && all.indexOf(item) === index,
  );
  return { summary, chips: chips.slice(0, 4) };
}

function stayImages(
  featured: string,
  image: string,
  galleryJson: string,
  place = "",
  slug = "",
) {
  const extra: string[] = [];
  try {
    const parsed = JSON.parse(galleryJson || "[]") as unknown;
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const url =
          typeof item === "string"
            ? item
            : item && typeof item === "object" && "url" in item
              ? String((item as { url?: unknown }).url || "")
              : "";
        if (url.trim()) extra.push(url.trim());
      }
    }
  } catch {
    /* a bad gallery still leaves the cover photo */
  }
  return stayImageList({
    images: [featured, image, ...extra],
    place,
    slug,
  });
}

function tourDurationLabel(tour: {
  durationLabel: string;
  durationDays: number;
  durationUnit: string;
}) {
  if (tour.durationLabel.trim()) return tour.durationLabel.trim();
  const unit = tour.durationUnit || "days";
  return `${tour.durationDays} ${unit}`;
}

function toRide(
  vehicle: {
    id: string;
    slug: string;
    name: string;
    seats: number;
    pricePerDay: number;
    currency: string;
    kind?: string;
    destination: { name: string } | null;
    vehicleType: { name: string } | null;
    transmission: { name: string } | null;
    images: { url: string }[];
  },
  fallback: string,
): HomeRide {
  const kind = vehicle.kind === "bike" ? "bike" : "car";
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    place: vehicle.destination?.name || "",
    seats: vehicle.seats,
    detail: [vehicle.vehicleType?.name, vehicle.transmission?.name].filter(Boolean).join(" · "),
    pricePerDay: vehicle.pricePerDay,
    currency: vehicle.currency || "INR",
    image: resolveRideCover({
      url: vehicle.images[0]?.url,
      slug: vehicle.slug,
      kind,
      fallback,
    }),
  };
}

const homeTitle = `${theme.brandName} | Tours, Hotels & Rentals`;

export const metadata: Metadata = pageMetadata({
  title: homeTitle,
  description: theme.description,
  path: "/",
  absoluteTitle: true,
  image: "/img/masthead/1/bg.webp",
  imageAlt: "A mountain road planned by World Compass Holidays",
  keywords: [
    "World Compass Holidays",
    "India tours",
    "holiday packages India",
    "hotels in India",
    "car rental India",
    "bike rental India",
    "visa assistance",
    "airport meet and assist",
  ],
});

function railWhere(rail: HomeRailConfig, auto: Record<string, unknown>) {
  if (rail.mode === "manual" && rail.ids.length > 0) {
    return { published: true, id: { in: rail.ids } };
  }
  return auto;
}

export default async function Page() {
  const copy = await getMessages();
  const locale = await getUserLocale();
  const dictionary = await getUiDictionary();
  const t = (value: string) => localizeCopy(value, locale, dictionary);
  const items = getPublicNav(copy.nav);
  const user = await getCurrentUser();
  const home = localizeHome(await getHomePageContent(), locale, dictionary);
  const reviewsEnabled = home.sections.some((section) => section.id === "reviews" && section.enabled);
  const googleReviews =
    reviewsEnabled && home.reviews.placeId.trim()
      ? await getGoogleReviewsForPlace(home.reviews.placeId)
      : null;
  const listKey = [
    home.destinations.mode,
    home.destinations.ids.join(","),
    home.tours.mode,
    home.tours.ids.join(","),
    home.hotels.mode,
    home.hotels.ids.join(","),
    home.cars.mode,
    home.cars.ids.join(","),
    home.bikes.mode,
    home.bikes.ids.join(","),
    home.buses.mode,
    home.buses.ids.join(","),
  ].join("|");
  const [
    tourPlaces,
    tourSpan,
    popularDestinations,
    featuredTours,
    featuredHotels,
    featuredCars,
    featuredBikes,
    featuredBuses,
  ] = await cached(`home-lists:${listKey}`, 20_000, () =>
    Promise.all([
    prisma.destination.findMany({
      where: {
        published: true,
        OR: [
          { tours: { some: { published: true } } },
          { tourLinks: { some: { tour: { published: true } } } },
        ],
      },
      select: { id: true, name: true, region: true, country: true },
      orderBy: { name: "asc" },
    }),
    prisma.tour
      .findMany({
        where: { published: true },
        distinct: ["category"],
        select: { category: true, currency: true },
        orderBy: { category: "asc" },
      })
      .then(async (categories) => {
        const span = await prisma.tour.aggregate({
          where: { published: true },
          _min: { priceFrom: true },
          _max: { priceFrom: true },
        });
        return {
          priceMin: span._min.priceFrom ?? 0,
          priceMax: span._max.priceFrom ?? span._min.priceFrom ?? 0,
          currency: categories.find((tour) => tour.currency)?.currency || "INR",
          categories: [
            ...new Set(categories.map((tour) => tour.category.trim() || "Tours")),
          ].sort((a, b) => a.localeCompare(b)),
        };
      }),
    prisma.destination.findMany({
      where: railWhere(home.destinations, { published: true, popular: true }),
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        region: true,
        country: true,
        imageUrl: true,
        tours: { where: { published: true }, select: { id: true } },
        tourLinks: {
          where: { tour: { published: true } },
          select: { tourId: true },
        },
        _count: {
          select: {
            hotels: { where: { published: true } },
            vehicles: { where: { published: true } },
          },
        },
      },
    }).then((rows) =>
      home.destinations.mode === "manual" && home.destinations.ids.length
        ? orderByIds(rows, home.destinations.ids)
        : rows,
    ),
    modules.tours
      ? prisma.tour.findMany({
          where: railWhere(home.tours, { published: true }),
          orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
          take: home.tours.mode === "manual" && home.tours.ids.length ? 24 : 10,
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            durationDays: true,
            durationUnit: true,
            durationLabel: true,
            summary: true,
            difficulty: true,
            priceFrom: true,
            currency: true,
            imageUrl: true,
            featuredImageUrl: true,
            isFeatured: true,
            destination: { select: { id: true, name: true } },
          },
        }).then((rows) =>
          home.tours.mode === "manual" && home.tours.ids.length
            ? orderByIds(rows, home.tours.ids)
            : rows,
        )
      : Promise.resolve([]),
    modules.hotels
      ? prisma.hotel.findMany({
          where: railWhere(home.hotels, { published: true }),
          orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
          take: home.hotels.mode === "manual" && home.hotels.ids.length ? 24 : 10,
          select: {
            id: true,
            slug: true,
            name: true,
            priceFrom: true,
            currency: true,
            imageUrl: true,
            featuredImageUrl: true,
            summary: true,
            starRating: true,
            galleryJson: true,
            destination: { select: { id: true, name: true } },
          },
        }).then((rows) =>
          home.hotels.mode === "manual" && home.hotels.ids.length
            ? orderByIds(rows, home.hotels.ids)
            : rows,
        )
      : Promise.resolve([]),
    modules.cars
      ? prisma.vehicle.findMany({
          where: railWhere(home.cars, { published: true, kind: "car" }),
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
          take: home.cars.mode === "manual" && home.cars.ids.length ? 24 : 10,
          select: {
            id: true,
            slug: true,
            name: true,
            seats: true,
            pricePerDay: true,
            currency: true,
            destination: { select: { id: true, name: true } },
            vehicleType: { select: { id: true, name: true } },
            transmission: { select: { id: true, name: true } },
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        }).then((rows) =>
          home.cars.mode === "manual" && home.cars.ids.length
            ? orderByIds(rows, home.cars.ids)
            : rows,
        )
      : Promise.resolve([]),
    modules.bikes
      ? prisma.vehicle.findMany({
          where: railWhere(home.bikes, { published: true, kind: "bike" }),
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
          take: home.bikes.mode === "manual" && home.bikes.ids.length ? 24 : 10,
          select: {
            id: true,
            slug: true,
            name: true,
            seats: true,
            pricePerDay: true,
            currency: true,
            destination: { select: { id: true, name: true } },
            vehicleType: { select: { id: true, name: true } },
            transmission: { select: { id: true, name: true } },
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        }).then((rows) =>
          home.bikes.mode === "manual" && home.bikes.ids.length
            ? orderByIds(rows, home.bikes.ids)
            : rows,
        )
      : Promise.resolve([]),
    modules.buses
      ? prisma.busRoute
          .findMany({
            where: railWhere(home.buses, { published: true }),
            orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
            take: home.buses.mode === "manual" && home.buses.ids.length ? 24 : 10,
            select: {
              id: true,
              slug: true,
              name: true,
              fromCity: true,
              toCity: true,
              operator: true,
              coachType: true,
              departTime: true,
              duration: true,
              fareFrom: true,
              imageUrl: true,
            },
          })
          .then((rows) =>
            home.buses.mode === "manual" && home.buses.ids.length
              ? orderByIds(rows, home.buses.ids)
              : rows,
          )
      : Promise.resolve([]),
  ]),
  );

  const tourLocations: TourListLocation[] = tourPlaces.map((destination) => ({
    id: destination.id,
    name: destination.name,
    address: [destination.region, destination.country].filter(Boolean).join(", "),
  }));

  const tourCatalog = {
    locations: tourLocations,
    categories: tourSpan.categories.map((label) => ({ value: label, label })),
    durations: durationChoices.map(({ value, label }) => ({ value, label })),
    priceMin: tourSpan.priceMin,
    priceMax: tourSpan.priceMax,
    currency: tourSpan.currency,
  };

  const mappedBuses: HomeBus[] = featuredBuses.map((bus) => ({
    id: bus.id,
    slug: bus.slug,
    name: bus.name,
    fromCity: bus.fromCity,
    toCity: bus.toCity,
    operator: bus.operator,
    coach: coachLabel(bus.coachType),
    departTime: bus.departTime,
    duration: bus.duration,
    fareFrom: bus.fareFrom,
    image: bus.imageUrl,
  }));

  const brand = await getSiteSettings();
  const signedInCustomer = user?.scope === "customer" ? user : null;
  const savedIds = signedInCustomer
    ? await favoriteIds(signedInCustomer.id, ["tour", "hotel", "car", "bike"])
    : [];
  const coverUrl = home.hero.image?.url || brand.covers[0]?.url || "";
  const rides = [...featuredCars, ...featuredBikes];
  const [tourCopies, placeCopies, hotelCopies, vehicleCopies, configCopies] = await Promise.all([
    loadCopyMap("tour", featuredTours.map((tour) => tour.id), locale),
    loadCopyMap(
      "destination",
      [
        ...new Set([
          ...featuredTours.flatMap((tour) => (tour.destination ? [tour.destination.id] : [])),
          ...featuredHotels.flatMap((hotel) => (hotel.destination ? [hotel.destination.id] : [])),
          ...rides.flatMap((ride) => (ride.destination ? [ride.destination.id] : [])),
          ...popularDestinations.map((destination) => destination.id),
        ]),
      ],
      locale,
    ),
    loadCopyMap("hotel", featuredHotels.map((hotel) => hotel.id), locale),
    loadCopyMap("vehicle", rides.map((ride) => ride.id), locale),
    loadCopyMap(
      "rentalConfig",
      rides.flatMap((ride) => [ride.vehicleType?.id, ride.transmission?.id].filter((id): id is string => Boolean(id))),
      locale,
    ),
  ]);
  const spokenTours = featuredTours.map((tour) => {
    const localized = withTourCopy({ ...tour, description: "" }, tourCopies.get(tour.id));
    const destination = tour.destination
      ? withPlaceCopy({ ...tour.destination, summary: "" }, placeCopies.get(tour.destination.id))
      : null;
    return { ...localized, destination };
  });
  const spokenHotels = featuredHotels.map((hotel) => {
    const localized = withHotelCopy({ ...hotel, description: "" }, hotelCopies.get(hotel.id));
    const destination = hotel.destination
      ? withPlaceCopy({ ...hotel.destination, summary: "" }, placeCopies.get(hotel.destination.id))
      : null;
    return { ...localized, destination };
  });
  const spokenRides = new Map(
    rides.map((ride) => {
      const named = withVehicleCopy(ride, vehicleCopies.get(ride.id));
      const destination = ride.destination
        ? withPlaceCopy({ ...ride.destination, summary: "" }, placeCopies.get(ride.destination.id))
        : null;
      const vehicleType = ride.vehicleType
        ? withNameCopy(ride.vehicleType, configCopies.get(ride.vehicleType.id))
        : null;
      const transmission = ride.transmission
        ? withNameCopy(ride.transmission, configCopies.get(ride.transmission.id))
        : null;
      return [ride.id, { ...named, destination, vehicleType, transmission }] as const;
    }),
  );
  const mappedDestinations = popularDestinations.map((destination) => {
    const named = withPlaceCopy({ ...destination, summary: "" }, placeCopies.get(destination.id));
    return {
    id: destination.id,
    slug: destination.slug,
    name: named.name,
    region: named.region,
    imageUrl: destination.imageUrl,
    hoverText: popularHoverText(
      {
        hotels: destination._count.hotels,
        rentals: destination._count.vehicles,
        tours: new Set([
          ...destination.tours.map((tour) => tour.id),
          ...destination.tourLinks.map((link) => link.tourId),
        ]).size,
      },
      named.region,
      named.country,
      t,
      locale,
    ),
    meta: destinationMeta({
      hotels: destination._count.hotels,
      rentals: destination._count.vehicles,
      tours: new Set([
        ...destination.tours.map((tour) => tour.id),
        ...destination.tourLinks.map((link) => link.tourId),
      ]).size,
    }, t, locale),
  };
  });

  return (
    <>
      <JsonLd data={graphLd([organizationNode(), websiteNode()])} />

      {/* Phone / tablet only — new app home */}
      <div className="home-mobile-only">
        <HomeExperience
          content={home}
          contactPhone={brand.phone}
          tourCatalog={tourCatalog}
          destinations={mappedDestinations}
          tours={spokenTours.map((tour) => {
            const duration = tourDurationLabel(tour);
            const plan = tourPlanCopy(tour, duration);
            return {
            id: tour.id,
            slug: tour.slug,
            title: tour.title,
            place: tour.destination?.name || "",
            duration,
            priceFrom: tour.priceFrom,
            currency: tour.currency || "INR",
            image:
              tour.featuredImageUrl || tour.imageUrl || "/img/tours/header-bg.jpg",
            badge: tour.isFeatured
              ? t("Featured")
              : tour.category.trim()
                ? tour.category.trim()
                : undefined,
            summary: plan.summary,
            chips: plan.chips,
          };
          })}
          hotels={spokenHotels.map((hotel) => {
            const place = hotel.destination?.name || "";
            const images = stayImages(
              hotel.featuredImageUrl,
              hotel.imageUrl,
              hotel.galleryJson,
              place,
              hotel.slug,
            );
            return {
            id: hotel.id,
            slug: hotel.slug,
            name: hotel.name,
            place,
            priceFrom: hotel.priceFrom,
            currency: hotel.currency || "INR",
            image: images[0] || "/img/company/service-hotels.jpg",
            images,
            summary: clipText(hotel.summary || "", 110),
            stars: hotel.starRating || 0,
          };
          })}
          cars={featuredCars.map((car) => toRide({ ...(spokenRides.get(car.id) ?? car), kind: "car" }, "/img/cars/car-rental-banner.jpg"))}
          bikes={featuredBikes.map((bike) => toRide({ ...(spokenRides.get(bike.id) ?? bike), kind: "bike" }, "/img/bikes/bike-rental-banner.jpg"))}
          buses={mappedBuses}
          showCars={modules.cars}
          showBikes={modules.bikes}
          showBuses={modules.buses}
          coverUrl={coverUrl}
          savedIds={savedIds}
          signedIn={Boolean(signedInCustomer)}
          googleReviews={googleReviews}
        />
      </div>

      {/* Large screen — original site home */}
      <div className="home-desktop-only">
        <HomeDesktop
          content={home}
          coverUrl={coverUrl}
          destinations={mappedDestinations}
          tours={spokenTours.map((tour) => {
            const duration = tourDurationLabel(tour);
            const plan = tourPlanCopy(tour, duration);
            return {
            id: tour.id,
            slug: tour.slug,
            title: tour.title,
            destinationName: tour.destination?.name,
            duration,
            priceFrom: tour.priceFrom,
            currency: tour.currency || "INR",
            image: tour.featuredImageUrl || tour.imageUrl || "/img/tours/header-bg.jpg",
            summary: plan.summary,
            chips: plan.chips,
          };
          })}
          hotels={spokenHotels.map((hotel) => {
            const place = hotel.destination?.name || "";
            const images = stayImages(
              hotel.featuredImageUrl,
              hotel.imageUrl,
              hotel.galleryJson,
              place,
              hotel.slug,
            );
            return {
            id: hotel.id,
            slug: hotel.slug,
            name: hotel.name,
            destinationName: place,
            priceFrom: hotel.priceFrom,
            currency: hotel.currency || "INR",
            image: images[0] || "/img/company/service-hotels.jpg",
            images,
            summary: clipText(hotel.summary || "", 110),
            stars: hotel.starRating || 0,
          };
          })}
          cars={featuredCars.map((car) => toRide({ ...(spokenRides.get(car.id) ?? car), kind: "car" }, "/img/cars/car-rental-banner.jpg"))}
          bikes={featuredBikes.map((bike) => toRide({ ...(spokenRides.get(bike.id) ?? bike), kind: "bike" }, "/img/bikes/bike-rental-banner.jpg"))}
          buses={mappedBuses}
          showCars={modules.cars}
          showBikes={modules.bikes}
          showBuses={modules.buses}
          savedIds={savedIds}
          signedIn={Boolean(signedInCustomer)}
          locale={locale}
          googleReviews={googleReviews}
        />
        <HomeFooter items={items} />
      </div>
    </>
  );
}
