import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlockGuide from "@/components/block/BlockGuide";
import CallToActions from "@/components/common/CallToActions";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import Hero1 from "@/components/hero/hero-1";
import { HomeExperience } from "@/components/home/HomeExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { durationChoices } from "@/components/tour-list/tour-list-v2/query";
import type { TourListLocation } from "@/components/tour-list/types";
import { HomeFooter } from "@/components/worldcompassholiday/HomeFooter";
import { modules } from "@/config/modules";
import { theme } from "@/config/theme";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getPublicNav } from "@/lib/navigation";
import { graphLd, organizationNode, pageMetadata, websiteNode } from "@/lib/seo";

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
  const [
    tourPlaces,
    publishedTours,
    popularDestinations,
    featuredTours,
    featuredHotels,
    featuredCars,
  ] = await Promise.all([
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
    prisma.tour.findMany({
      where: { published: true },
      select: { category: true, priceFrom: true, currency: true },
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
        hotels: { where: { published: true }, select: { id: true } },
        vehicles: { where: { published: true }, select: { id: true } },
      },
    }),
    modules.tours
      ? prisma.tour.findMany({
          where: { published: true },
          orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
          take: 10,
          select: {
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
            slug: true,
            name: true,
            seats: true,
            pricePerDay: true,
            currency: true,
            destination: { select: { name: true } },
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const tourLocations: TourListLocation[] = tourPlaces.map((destination) => ({
    id: destination.id,
    name: destination.name,
    address: [destination.region, destination.country].filter(Boolean).join(", "),
  }));
  const tourPrices = publishedTours.map((tour) => tour.priceFrom);
  const tourPriceMin = tourPrices.length ? Math.min(...tourPrices) : 0;
  const tourPriceMax = tourPrices.length ? Math.max(...tourPrices) : tourPriceMin;
  const tourCategories = [
    ...new Set(publishedTours.map((tour) => tour.category.trim() || "Tours")),
  ].sort((a, b) => a.localeCompare(b));

  const tourCatalog = {
    locations: tourLocations,
    categories: tourCategories.map((label) => ({ value: label, label })),
    durations: durationChoices.map(({ value, label }) => ({ value, label })),
    priceMin: tourPriceMin,
    priceMax: tourPriceMax,
    currency: publishedTours[0]?.currency || "INR",
  };

  const desktopTours = featuredTours.slice(0, 4);
  const desktopHotels = featuredHotels.slice(0, 4);

  return (
    <>
      <JsonLd data={graphLd([organizationNode(), websiteNode()])} />

      {/* Phone / tablet only — new app home */}
      <div className="home-mobile-only">
        <HomeExperience
          showCars={modules.cars}
          showBikes={modules.bikes}
          tourCatalog={tourCatalog}
          destinations={popularDestinations.map((destination) => ({
            slug: destination.slug,
            name: destination.name,
            imageUrl: destination.imageUrl,
            meta: destinationMeta({
              hotels: destination.hotels.length,
              rentals: destination.vehicles.length,
              tours: new Set([
                ...destination.tours.map((tour) => tour.id),
                ...destination.tourLinks.map((link) => link.tourId),
              ]).size,
            }),
          }))}
          tours={featuredTours.map((tour) => ({
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
            slug: hotel.slug,
            name: hotel.name,
            place: hotel.destination?.name || "",
            priceFrom: hotel.priceFrom,
            currency: hotel.currency || "INR",
            image:
              hotel.featuredImageUrl || hotel.imageUrl || "/img/stays/1/1.png",
          }))}
          cars={featuredCars.map((car) => ({
            slug: car.slug,
            name: car.name,
            place: car.destination?.name || "",
            seats: car.seats,
            pricePerDay: car.pricePerDay,
            currency: car.currency || "INR",
            image: car.images[0]?.url || "/img/cars/1.png",
          }))}
        />
      </div>

      {/* Large screen — original site home (unchanged) */}
      <div className="home-desktop-only">
        <Hero1 tourCatalog={tourCatalog} />

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
                      hotels: destination.hotels.length,
                      rentals: destination.vehicles.length,
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
                  <Link href="/tours" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                    All tours
                    <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
              <div className="row y-gap-30 pt-40">
                {desktopTours.map((tour, index) => {
                  const image =
                    tour.featuredImageUrl || tour.imageUrl || "/img/tours/header-bg.jpg";
                  return (
                    <div className="col-lg-3 col-sm-6" key={tour.slug}>
                      <Link href={`/tours/${tour.slug}`} className="d-block">
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
                  <Link href="/hotels" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                    All hotels
                    <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
              <div className="row y-gap-30 pt-40">
                {desktopHotels.map((hotel, index) => {
                  const image =
                    hotel.featuredImageUrl || hotel.imageUrl || "/img/stays/1/1.png";
                  return (
                    <div className="col-lg-3 col-sm-6" key={hotel.slug}>
                      <Link href={`/hotels/${hotel.slug}`} className="d-block">
                        <div className="ratio ratio-1:1 rounded-4 overflow-hidden">
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

        <section className="layout-pt-md layout-pb-lg">
          <div className="container">
            <div className="row y-gap-20 justify-between">
              <BlockGuide />
            </div>
          </div>
        </section>

        <section className="layout-pt-md layout-pb-lg">
          <div className="container">
            <div className="row justify-center text-center">
              <div className="col-auto">
                <div className="sectionTitle -md">
                  <h2 className="sectionTitle__title">More ways we help</h2>
                  <p className="sectionTitle__text mt-5 sm:mt-0">
                    Visa files, an airport greeter, and a car or bike for the days you are there.
                  </p>
                </div>
              </div>
            </div>
            <div className="row y-gap-30 pt-40">
              {[
                {
                  href: "/visa-services",
                  title: "Visa help",
                  text: "Document list and a service fee quoted before you pay.",
                },
                {
                  href: "/meet-and-assist",
                  title: "Meet and assist",
                  text: "A greeter at arrival, departure, or a connection.",
                },
                modules.cars
                  ? {
                      href: "/rentals/cars",
                      title: "Car rental",
                      text: "Self-drive cars with a daily rate and a pickup point.",
                    }
                  : null,
                modules.bikes
                  ? {
                      href: "/rentals/bikes",
                      title: "Bike rental",
                      text: "Motorbikes and scooters for the same dates.",
                    }
                  : null,
              ]
                .filter(
                  (item): item is { href: string; title: string; text: string } => Boolean(item),
                )
                .map((item) => (
                  <div className="col-lg-3 col-sm-6" key={item.href}>
                    <Link
                      href={item.href}
                      className="d-block rounded-4 border-light px-20 py-20 h-full"
                    >
                      <h3 className="text-18 fw-500 text-dark-1">{item.title}</h3>
                      <p className="text-15 text-light-1 mt-10">{item.text}</p>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </section>

        <CallToActions />
        <HomeFooter items={items} />
      </div>
    </>
  );
}
