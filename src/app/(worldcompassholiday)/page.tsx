import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlockGuide from "@/components/block/BlockGuide";
import CallToActions from "@/components/common/CallToActions";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import Hero1 from "@/components/hero/hero-1";
import { HomeAssistSection } from "@/components/home/HomeAssistSection";
import { HomeExperience } from "@/components/home/HomeExperience";
import {
  bikeHomeFallback,
  carHomeFallback,
  HomeFleetSection,
  type HomeRide,
} from "@/components/home/HomeFleetSection";
import { HomeVisaSection } from "@/components/home/HomeVisaSection";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { durationChoices } from "@/components/tour-list/tour-list-v2/query";
import type { TourListLocation } from "@/components/tour-list/types";
import { HomeFooter } from "@/components/worldcompassholiday/HomeFooter";
import { modules } from "@/config/modules";
import { theme } from "@/config/theme";
import { getSiteBrand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { favoriteIds } from "@/lib/favorites";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublicNav } from "@/lib/navigation";
import { graphLd, organizationNode, pageMetadata, websiteNode } from "@/lib/seo";
import { cached } from "@/lib/ttl-cache";

function popularHoverText(
  counts: { hotels: number; rentals: number; tours: number },
  region: string,
  country: string,
) {
  const parts = [
    counts.hotels
      ? `${counts.hotels} Hotel${counts.hotels === 1 ? "" : "s"}`
      : null,
    counts.rentals
      ? `${counts.rentals} Rental${counts.rentals === 1 ? "" : "s"}`
      : null,
    counts.tours ? `${counts.tours} Tour${counts.tours === 1 ? "" : "s"}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" - ") : `${region}, ${country}`;
}

function destinationMeta(counts: {
  hotels: number;
  rentals: number;
  tours: number;
}) {
  const parts = [
    counts.tours ? `${counts.tours} tour${counts.tours === 1 ? "" : "s"}` : null,
    counts.hotels ? `${counts.hotels} stay${counts.hotels === 1 ? "" : "s"}` : null,
    counts.rentals
      ? `${counts.rentals} rental${counts.rentals === 1 ? "" : "s"}`
      : null,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : "Explore";
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
    destination: { name: string } | null;
    vehicleType: { name: string } | null;
    transmission: { name: string } | null;
    images: { url: string }[];
  },
  fallback: string,
): HomeRide {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    place: vehicle.destination?.name || "",
    seats: vehicle.seats,
    detail: [vehicle.vehicleType?.name, vehicle.transmission?.name].filter(Boolean).join(" · "),
    pricePerDay: vehicle.pricePerDay,
    currency: vehicle.currency || "INR",
    image: vehicle.images[0]?.url || fallback,
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
});

export default async function Page() {
  const items = getPublicNav();
  const user = await getCurrentUser();
  const [
    tourPlaces,
    tourSpan,
    popularDestinations,
    featuredTours,
    featuredHotels,
    featuredCars,
    featuredBikes,
  ] = await cached("home-lists", 20_000, () =>
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
      where: { published: true, popular: true },
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
    }),
    modules.tours
      ? prisma.tour.findMany({
          where: { published: true },
          orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
          take: 10,
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            durationDays: true,
            durationUnit: true,
            durationLabel: true,
            priceFrom: true,
            currency: true,
            imageUrl: true,
            featuredImageUrl: true,
            isFeatured: true,
            destination: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    modules.hotels
      ? prisma.hotel.findMany({
          where: { published: true },
          orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
          take: 10,
          select: {
            id: true,
            slug: true,
            name: true,
            priceFrom: true,
            currency: true,
            imageUrl: true,
            featuredImageUrl: true,
            destination: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    modules.cars
      ? prisma.vehicle.findMany({
          where: { published: true, kind: "car" },
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
          take: 10,
          select: {
            id: true,
            slug: true,
            name: true,
            seats: true,
            pricePerDay: true,
            currency: true,
            destination: { select: { name: true } },
            vehicleType: { select: { name: true } },
            transmission: { select: { name: true } },
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        })
      : Promise.resolve([]),
    modules.bikes
      ? prisma.vehicle.findMany({
          where: { published: true, kind: "bike" },
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
          take: 10,
          select: {
            id: true,
            slug: true,
            name: true,
            seats: true,
            pricePerDay: true,
            currency: true,
            destination: { select: { name: true } },
            vehicleType: { select: { name: true } },
            transmission: { select: { name: true } },
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        })
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

  const brand = await getSiteBrand();
  const signedInCustomer = user?.scope === "customer" ? user : null;
  const savedIds = signedInCustomer
    ? await favoriteIds(signedInCustomer.id, ["tour", "hotel", "car", "bike"])
    : [];
  const desktopTours = featuredTours.slice(0, 4);
  const desktopHotels = featuredHotels.slice(0, 4);

  return (
    <>
      <JsonLd data={graphLd([organizationNode(), websiteNode()])} />

      {/* Phone / tablet only — new app home */}
      <div className="home-mobile-only">
        <HomeExperience
          tourCatalog={tourCatalog}
          destinations={popularDestinations.map((destination) => ({
            slug: destination.slug,
            name: destination.name,
            imageUrl: destination.imageUrl,
            meta: destinationMeta({
              hotels: destination._count.hotels,
              rentals: destination._count.vehicles,
              tours: new Set([
                ...destination.tours.map((tour) => tour.id),
                ...destination.tourLinks.map((link) => link.tourId),
              ]).size,
            }),
          }))}
          tours={featuredTours.map((tour) => ({
            id: tour.id,
            slug: tour.slug,
            title: tour.title,
            place: tour.destination?.name || "",
            duration: tourDurationLabel(tour),
            priceFrom: tour.priceFrom,
            currency: tour.currency || "INR",
            image:
              tour.featuredImageUrl || tour.imageUrl || "/img/tours/header-bg.jpg",
            badge: tour.isFeatured
              ? "Featured"
              : tour.category.trim()
                ? tour.category.trim()
                : undefined,
          }))}
          hotels={featuredHotels.map((hotel) => ({
            id: hotel.id,
            slug: hotel.slug,
            name: hotel.name,
            place: hotel.destination?.name || "",
            priceFrom: hotel.priceFrom,
            currency: hotel.currency || "INR",
            image:
              hotel.featuredImageUrl || hotel.imageUrl || "/img/stays/1/1.png",
          }))}
          cars={featuredCars.map((car) => toRide(car, "/img/cars/1.png"))}
          bikes={featuredBikes.map((bike) => toRide(bike, "/img/bikes/bike-rental-banner.jpg"))}
          showCars={modules.cars}
          showBikes={modules.bikes}
          coverUrl={brand.covers[0]?.url || ""}
          savedIds={savedIds}
          signedIn={Boolean(signedInCustomer)}
        />
      </div>

      {/* Large screen — original site home (unchanged) */}
      <div className="home-desktop-only">
        <Hero1 coverUrl={brand.covers[0]?.url || ""} />

        <section className="layout-pt-lg layout-pb-md" data-aos="fade-up">
          <div className="container">
            <div className="row y-gap-20 justify-between items-end">
              <div className="col-auto">
                <div className="sectionTitle -md">
                  <h2 className="sectionTitle__title">Popular Destinations</h2>
                  <p className=" sectionTitle__text mt-5 sm:mt-0">
                    Places marked popular, with the tours, hotels, and rentals published for
                    each.
                  </p>
                </div>
              </div>
              <div className="col-auto md:d-none">
                <a
                  href="/destinations"
                  className="button -md -blue-1 bg-blue-1-05 text-blue-1"
                >
                  View All Destinations
                  <div className="icon-arrow-top-right ml-15" />
                </a>
              </div>
            </div>
            <div className="relative pt-40 sm:pt-20">
              <PopularDestinations
                destinations={popularDestinations.map((destination) => ({
                  id: destination.id,
                  slug: destination.slug,
                  name: destination.name,
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
                    destination.region,
                    destination.country,
                  ),
                }))}
              />
            </div>
          </div>
        </section>

        {desktopTours.length > 0 ? (
          <section className="layout-pt-md layout-pb-md">
            <div className="container">
              <div className="row y-gap-10 justify-between items-end">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">Tours and treks</h2>
                    <p className="sectionTitle__text mt-5 sm:mt-0">
                      Published routes, with duration and a starting price on each page.
                    </p>
                  </div>
                </div>
                <div className="col-auto">
                  <Link prefetch={false} href="/tours" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                    All tours
                    <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
              <div className="row y-gap-30 pt-20">
                {desktopTours.map((tour, index) => {
                  const image =
                    tour.featuredImageUrl || tour.imageUrl || "/img/tours/header-bg.jpg";
                  return (
                    <div className="col-lg-3 col-sm-6" key={tour.id}>
                      <div className="home-fav-photo">
                        <Link prefetch={false} href={`/tours/${tour.slug}`} className="d-block">
                          <div className="ratio ratio-1:1 rounded-4 overflow-hidden">
                            <Image
                              src={image}
                              alt={tour.title}
                              width={400}
                              height={400}
                              className="img-ratio object-cover"
                              loading={index < 4 ? "eager" : "lazy"}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        </Link>
                        <FavoriteButton
                          kind="tour"
                          itemId={tour.id}
                          initialSaved={savedIds.includes(tour.id)}
                          signedIn={Boolean(signedInCustomer)}
                          title={tour.title}
                          variant="icon"
                          className="fav-btn--float"
                        />
                      </div>
                      <Link prefetch={false} href={`/tours/${tour.slug}`} className="d-block">
                        <h3 className="text-18 fw-500 text-dark-1 mt-15">{tour.title}</h3>
                        {tour.destination?.name ? (
                          <p className="text-15 text-light-1 mt-5">{tour.destination.name}</p>
                        ) : null}
                        {tour.priceFrom > 0 ? (
                          <p className="text-15 fw-500 mt-5">
                            From {formatMoney(tour.priceFrom, tour.currency || "INR")}
                          </p>
                        ) : null}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {desktopHotels.length > 0 ? (
          <section className="layout-pt-md layout-pb-md">
            <div className="container">
              <div className="row y-gap-10 justify-between items-end">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">Hotels and stays</h2>
                    <p className="sectionTitle__text mt-5 sm:mt-0">
                      Published stays. If the hotel you want is not listed, ask us to search.
                    </p>
                  </div>
                </div>
                <div className="col-auto">
                  <Link prefetch={false} href="/hotels" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                    All hotels
                    <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
              <div className="row y-gap-30 pt-20">
                {desktopHotels.map((hotel, index) => {
                  const image =
                    hotel.featuredImageUrl || hotel.imageUrl || "/img/stays/1/1.png";
                  return (
                    <div className="col-lg-3 col-sm-6" key={hotel.id}>
                      <div className="home-fav-photo">
                        <Link prefetch={false} href={`/hotels/${hotel.slug}`} className="d-block">
                          <div className="ratio ratio-4:3 rounded-4 overflow-hidden">
                            <Image
                              src={image}
                              alt={hotel.name}
                              width={400}
                              height={400}
                              className="img-ratio object-cover"
                              loading={index < 4 ? "eager" : "lazy"}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        </Link>
                        <FavoriteButton
                          kind="hotel"
                          itemId={hotel.id}
                          initialSaved={savedIds.includes(hotel.id)}
                          signedIn={Boolean(signedInCustomer)}
                          title={hotel.name}
                          variant="icon"
                          className="fav-btn--float"
                        />
                      </div>
                      <Link prefetch={false} href={`/hotels/${hotel.slug}`} className="d-block">
                        <h3 className="text-18 fw-500 text-dark-1 mt-15">{hotel.name}</h3>
                        {hotel.destination?.name ? (
                          <p className="text-15 text-light-1 mt-5">{hotel.destination.name}</p>
                        ) : null}
                        {hotel.priceFrom > 0 ? (
                          <p className="text-15 fw-500 mt-5">
                            From {formatMoney(hotel.priceFrom, hotel.currency || "INR")}
                          </p>
                        ) : null}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {modules.cars || modules.bikes ? (
          <section className="home-web-road" aria-label="Car and bike rental">
            {modules.cars ? (
              <HomeFleetSection
                nested
                title="Cars for the trip"
                subtitle="Self-drive and chauffeur, priced by the day."
                href="/rentals/cars"
                linkLabel="All cars"
                kindLabel="Car"
                kind="car"
                items={featuredCars.slice(0, 4).map((car) => toRide(car, "/img/cars/1.png"))}
                empty={carHomeFallback}
                savedIds={savedIds}
                signedIn={Boolean(signedInCustomer)}
              />
            ) : null}
            {modules.bikes ? (
              <HomeFleetSection
                nested
                title="Bikes for the road"
                subtitle="Scooters and motorcycles, with a helmet on the hire."
                href="/rentals/bikes"
                linkLabel="All bikes"
                kindLabel="Bike"
                kind="bike"
                items={featuredBikes.slice(0, 4).map((bike) => toRide(bike, "/img/bikes/bike-rental-banner.jpg"))}
                empty={bikeHomeFallback}
                savedIds={savedIds}
                signedIn={Boolean(signedInCustomer)}
              />
            ) : null}
          </section>
        ) : null}

        <section className="layout-pt-md layout-pb-lg">
          <div className="container">
            <div className="row y-gap-20 justify-between">
              <BlockGuide />
            </div>
          </div>
        </section>

        <section className="layout-pt-md layout-pb-md">
          <div className="container">
            <HomeVisaSection headingId="home-visa-desk" />
          </div>
        </section>

        <section className="layout-pt-md layout-pb-lg">
          <div className="container">
            <HomeAssistSection headingId="home-assist-desk" />
          </div>
        </section>

        <CallToActions />
        <HomeFooter items={items} />
      </div>
    </>
  );
}
