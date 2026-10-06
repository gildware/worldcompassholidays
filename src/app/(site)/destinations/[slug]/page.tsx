import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CallToActions from "@/components/common/CallToActions";
import {
  CarCards,
  CategoryPills,
  HotelCards,
  NearbyDestinations,
  TourCards,
} from "@/components/destinations/single/widgets";
import { HomeFooter } from "@/components/gotrip/HomeFooter";
import { MapEmbed } from "@/components/site/MapEmbed";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { mapApiKey } from "@/lib/map-key";
import { parseMapPoint } from "@/lib/maps";
import { getPublicNav } from "@/lib/navigation";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await prisma.destination.findUnique({
    where: { slug },
    select: { name: true, summary: true },
  });
  return {
    title: destination ? `${destination.name} || GoTrip - Travel & Tour React NextJS Template` : "Destination",
    description: destination?.summary || "GoTrip - Travel & Tour React NextJS Template",
  };
}

function listingMeta(counts: { hotels: number; tours: number; vehicles: number }) {
  const total = counts.hotels + counts.tours + counts.vehicles;
  return `${total.toLocaleString("en-US")} properties`;
}

function slideImages(...groups: Array<string | GalleryItem[] | undefined>) {
  const urls: string[] = [];
  for (const group of groups) {
    if (!group) continue;
    if (typeof group === "string") {
      if (group) urls.push(group);
      continue;
    }
    for (const item of group) {
      if (item?.url) urls.push(item.url);
    }
  }
  return [...new Set(urls)];
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: {
      parent: { select: { name: true, slug: true, published: true } },
      children: {
        where: { published: true },
        orderBy: { name: "asc" },
      },
      tours: { where: { published: true }, orderBy: { title: "asc" } },
      hotels: { where: { published: true }, orderBy: { name: "asc" } },
      vehicles: {
        where: { published: true },
        orderBy: { name: "asc" },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          transmission: { select: { name: true } },
        },
      },
      busRoutes: { where: { published: true }, orderBy: { name: "asc" } },
    },
  });

  if (!destination || !destination.published) notFound();

  const linkedTours = await prisma.tour.findMany({
    where: {
      published: true,
      destinationLinks: { some: { destinationId: destination.id } },
      NOT: { destinationId: destination.id },
    },
    orderBy: { title: "asc" },
  });
  const tours = [...destination.tours, ...linkedTours].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  const nearbyRows = await prisma.destination.findMany({
    where: {
      published: true,
      NOT: { id: destination.id },
      OR: [
        { region: destination.region },
        { country: destination.country },
        ...(destination.parentId ? [{ parentId: destination.parentId }] : []),
      ],
    },
    orderBy: { name: "asc" },
    take: 12,
    include: {
      _count: { select: { hotels: true, tours: true, vehicles: true } },
    },
  });
  const nearby = nearbyRows
    .slice()
    .sort((a, b) => {
      const score = (row: typeof a) =>
        (row.region === destination.region ? 0 : 2) +
        (row.parentId && row.parentId === destination.parentId ? 0 : 1);
      return score(a) - score(b) || a.name.localeCompare(b.name);
    })
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      imageUrl: row.imageUrl,
      meta: listingMeta(row._count),
    }));

  const apiKey = mapApiKey();
  const mapPoint = parseMapPoint(
    destination.mapLat,
    destination.mapLng,
    destination.mapZoom,
  );
  const cars = destination.vehicles.filter((vehicle) => vehicle.kind === "car");
  const bikes = destination.vehicles.filter((vehicle) => vehicle.kind === "bike");
  const placeLabel = [destination.region, destination.country].filter(Boolean).join(", ");

  const categories = [
    modules.hotels && destination.hotels.length
      ? { href: "#hotels", icon: "icon-bed", name: "Hotel" }
      : null,
    modules.tours && tours.length
      ? { href: "#tours", icon: "icon-destination", name: "Tour" }
      : null,
    destination.children.length
      ? { href: "#sights", icon: "icon-ski", name: "Sights" }
      : null,
    modules.cars && cars.length
      ? { href: "#cars", icon: "icon-car", name: "Car" }
      : null,
    modules.bikes && bikes.length
      ? { href: "#bikes", icon: "icon-speedometer", name: "Bike" }
      : null,
    modules.buses && destination.busRoutes.length
      ? { href: "#buses", icon: "icon-tickets", name: "Bus" }
      : null,
  ].filter((item): item is { href: string; icon: string; name: string } => Boolean(item));

  const crumbs = [
    { href: "/destinations", label: "Destinations" },
    destination.parent?.published
      ? { href: `/destinations/${destination.parent.slug}`, label: destination.parent.name }
      : { href: "/destinations", label: destination.country },
    { href: "", label: destination.name },
  ];

  return (
    <div className="gotrip-page">
      <section data-aos="fade" className="d-flex items-center py-15 border-top-light">
        <div className="container">
          <div className="row y-gap-10 items-center justify-between">
            <div className="col-auto">
              <div className="row x-gap-10 y-gap-5 items-center text-14 text-light-1">
                {crumbs.map((crumb, index) => (
                  <div className="col-auto d-flex items-center x-gap-10" key={`${crumb.label}-${index}`}>
                    {index > 0 ? <div>&gt;</div> : null}
                    {crumb.href ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <div className="text-dark-1">{crumb.label}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-auto">
              <div className="text-14 text-light-1">
                {destination.name} Tourism: Best of {destination.name}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-pb-md">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="relative d-flex">
                <img
                  src={destination.imageUrl}
                  alt="image"
                  className="col-12 rounded-4"
                  style={{
                    width: "100%",
                    minHeight: "300px",
                    aspectRatio: "1291 / 510",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
                <div className="absolute z-2 px-50 py-60 md:py-20 md:px-30">
                  <h1 className="text-50 fw-600 text-white lg:text-40 md:text-30">
                    Explore {destination.name}
                  </h1>
                  <div className="text-white">
                    Explore deals, travel guides and things to do in {destination.name}
                  </div>
                </div>
                <div className="absolute d-flex justify-end items-end col-12 h-full z-1 px-10 py-10">
                  <span className="button -md -blue-1 bg-white text-dark-1 text-14 fw-500">
                    See All Photos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="row x-gap-20 y-gap-20 items-center pt-20 item_gap-x10">
              <CategoryPills items={categories} />
            </div>
          ) : null}

          <div className="row y-gap-20 pt-40">
            <div className="col-auto">
              <h2>What to know before visiting {destination.name}</h2>
            </div>
            <div className={mapPoint && apiKey ? "col-xl-8" : "col-12"}>
              <p className="text-15 text-dark-1">{destination.summary}</p>
              <p className="text-15 text-light-1 mt-10">{placeLabel}</p>
            </div>
            {mapPoint && apiKey ? (
              <div className="col-xl-4">
                <div className="relative d-flex ml-35 xl:ml-0">
                  <MapEmbed
                    apiKey={apiKey}
                    lat={destination.mapLat}
                    lng={destination.mapLng}
                    zoom={destination.mapZoom}
                    title={`Map of ${destination.name}`}
                    className="col-12 rounded-4"
                    style={{ minHeight: 300, width: "100%", border: 0, display: "block" }}
                  />
                  {tours.length > 0 ? (
                    <div className="absolute d-flex justify-center items-end col-12 h-full z-1 px-35 py-20">
                      <Link
                        href="#tours"
                        className="button h-50 px-25 -blue-1 bg-white text-dark-1 text-14 fw-500 col-12"
                      >
                        <i className="icon-eye text-18 mr-10" />
                        See popular activities on the map
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-30 mt-30 border-top-light" />
        </div>
      </section>

      {modules.hotels && destination.hotels.length > 0 ? (
        <ListingSection
          id="hotels"
          title="Recommended Hotels"
          text={`Places to stay in ${destination.name}`}
          moreHref="/hotels"
        >
          <HotelCards
            hotels={destination.hotels.map((hotel) => ({
              id: hotel.id,
              href: `/hotels/${hotel.slug}`,
              title: hotel.name,
              location: hotel.address.trim() || placeLabel,
              price: formatMoney(hotel.priceFrom, hotel.currency),
              ratings: hotel.starRating > 0 ? hotel.starRating.toFixed(1) : "",
              reviews: "",
              tag: hotel.isFeatured ? "best seller" : "",
              slideImg: slideImages(
                hotel.featuredImageUrl,
                hotel.imageUrl,
                parseJsonArray<GalleryItem>(hotel.galleryJson),
              ),
            }))}
          />
        </ListingSection>
      ) : null}

      {modules.tours && tours.length > 0 ? (
        <ListingSection
          id="tours"
          title="Most Popular Tours"
          text={`Trips that start in ${destination.name}`}
          moreHref="/tours"
        >
          <TourCards
            tours={tours.map((tour) => ({
              id: tour.id,
              href: `/tours?q=${encodeURIComponent(tour.title)}`,
              title: tour.title,
              location: placeLabel,
              duration: tour.durationLabel.trim() || `${tour.durationDays} days`,
              tourType: tour.category.trim(),
              price: formatMoney(tour.priceFrom, tour.currency),
              tag: tour.isFeatured ? "best seller" : "",
              slideImg: slideImages(
                tour.imageUrl,
                tour.featuredImageUrl,
                parseJsonArray<GalleryItem>(tour.galleryJson),
              ),
            }))}
          />
        </ListingSection>
      ) : null}

      {modules.cars && cars.length > 0 ? (
        <ListingSection
          id="cars"
          title="Popular Car Hire"
          text={`Cars available in ${destination.name}`}
          moreHref="/rentals?kind=car"
        >
          <CarCards
            cars={cars.map((vehicle) => ({
              id: vehicle.id,
              href: `/rentals/${vehicle.slug}`,
              title: vehicle.name,
              location: placeLabel,
              type: "Car",
              seat: String(vehicle.seats),
              luggage: vehicle.luggage ? String(vehicle.luggage) : "",
              transmission: vehicle.transmission?.name ?? "",
              price: formatMoney(vehicle.pricePerDay, vehicle.currency),
              tag: "",
              slideImg: vehicle.images.map((image) => image.url),
            }))}
          />
        </ListingSection>
      ) : null}

      {modules.bikes && bikes.length > 0 ? (
        <ListingSection
          id="bikes"
          title="Bike rental"
          text={`Bikes available in ${destination.name}`}
          moreHref="/rentals?kind=bike"
        >
          <CarCards
            cars={bikes.map((vehicle) => ({
              id: vehicle.id,
              href: `/rentals/${vehicle.slug}`,
              title: vehicle.name,
              location: placeLabel,
              type: "Bike",
              seat: String(vehicle.seats),
              luggage: vehicle.luggage ? String(vehicle.luggage) : "",
              transmission: vehicle.transmission?.name ?? "",
              price: formatMoney(vehicle.pricePerDay, vehicle.currency),
              tag: "",
              slideImg: vehicle.images.map((image) => image.url),
            }))}
          />
        </ListingSection>
      ) : null}

      {modules.buses && destination.busRoutes.length > 0 ? (
        <ListingSection
          id="buses"
          title="Bus routes"
          text={`Routes through ${destination.name}`}
          moreHref="/buses"
        >
          <div className="row y-gap-30">
            {destination.busRoutes.map((route) => (
              <div className="col-lg-4 col-md-6" key={route.id}>
                <div className="rounded-4 border-light px-30 py-30">
                  <h3 className="text-18 fw-500">{route.name}</h3>
                  <p className="text-15 text-light-1 mt-10">
                    {route.fromCity} to {route.toCity}
                  </p>
                  {route.summary ? (
                    <p className="text-15 mt-10">{route.summary}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </ListingSection>
      ) : null}

      {destination.children.length > 0 ? (
        <section id="sights" className="layout-pt-md layout-pb-lg">
          <div className="container">
            <div className="row">
              <div className="col-auto">
                <div className="sectionTitle -md">
                  <h2 className="sectionTitle__title">Top sights in {destination.name}</h2>
                  <p className="sectionTitle__text mt-5 sm:mt-0">
                    These popular destinations have a lot to offer
                  </p>
                </div>
              </div>
            </div>
            <div className="row y-gap-30 pt-40">
              {destination.children.map((place) => (
                <div className="col-lg-6" key={place.id}>
                  <div className="rounded-4 border-light">
                    <div className="d-flex flex-wrap y-gap-30">
                      <div className="col-auto">
                        <div className="ratio ratio-1:1 w-200">
                          <Image
                            width={200}
                            height={200}
                            src={place.imageUrl}
                            alt={place.name}
                            className="img-ratio"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="d-flex flex-column justify-center h-full px-30 py-20">
                          <h3 className="text-18 fw-500">{place.name}</h3>
                          <p className="text-15 mt-5">{place.summary}</p>
                          <Link
                            href={`/destinations/${place.slug}`}
                            className="d-block text-14 text-blue-1 fw-500 underline mt-5"
                          >
                            See More
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {nearby.length > 0 ? (
        <section className="layout-pt-md layout-pb-lg">
          <div className="container">
            <div className="row y-gap-20">
              <div className="col-auto">
                <div className="sectionTitle -md">
                  <h2 className="sectionTitle__title">Destinations near {destination.name}</h2>
                  <p className="sectionTitle__text mt-5 sm:mt-0">
                    These popular destinations have a lot to offer
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-40 relative">
              <NearbyDestinations destinations={nearby} />
            </div>
          </div>
        </section>
      ) : null}

      <CallToActions />
      <HomeFooter items={getPublicNav()} />
    </div>
  );
}

function ListingSection({
  id,
  title,
  text,
  moreHref,
  children,
}: {
  id: string;
  title: string;
  text: string;
  moreHref: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="layout-pt-md layout-pb-md">
      <div className="container">
        <div className="row y-gap-20 justify-between items-end">
          <div className="col-auto">
            <div className="sectionTitle -md">
              <h2 className="sectionTitle__title">{title}</h2>
              <p className="sectionTitle__text mt-5 sm:mt-0">{text}</p>
            </div>
          </div>
          <div className="col-auto">
            <Link href={moreHref} className="button -md -blue-1 bg-blue-1-05 text-blue-1">
              More <div className="icon-arrow-top-right ml-15" />
            </Link>
          </div>
        </div>
        <div className="row y-gap-30 pt-40 sm:pt-20 item_gap-x30">{children}</div>
      </div>
    </section>
  );
}
