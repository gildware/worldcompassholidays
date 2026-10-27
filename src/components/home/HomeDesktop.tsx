import { Fragment } from "react";
import Link from "next/link";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import { HomeInvite, HomePromises } from "@/components/home/HomeClose";
import Hero1 from "@/components/hero/hero-1";
import {
  bikeHomeFallback,
  carHomeFallback,
  HomeFleetSection,
  type HomeRide,
} from "@/components/home/HomeFleetSection";
import { HomeBusSection, type HomeBus } from "@/components/home/HomeBusSection";
import { hasServicePart, HomeServicesSection } from "@/components/home/HomeServicesSection";
import { HomeFlipGrid, HomeStayGrid } from "@/components/home/HomeInteractive";
import { formatMoney } from "@/lib/format";
import type { HomePageContent } from "@/lib/home-page";

export type HomeDesktopDestination = {
  id: string;
  slug: string;
  name: string;
  region?: string;
  imageUrl: string;
  hoverText: string;
  meta?: string;
};

export type HomeDesktopTour = {
  id: string;
  slug: string;
  title: string;
  destinationName?: string;
  duration?: string;
  summary?: string;
  chips?: string[];
  priceFrom: number;
  currency: string;
  image: string;
};

export type HomeDesktopHotel = {
  id: string;
  slug: string;
  name: string;
  destinationName?: string;
  priceFrom: number;
  currency: string;
  image: string;
  images?: string[];
  summary?: string;
  stars?: number;
};

export function HomeDesktop({
  content,
  coverUrl,
  destinations,
  tours,
  hotels,
  cars,
  bikes,
  buses,
  showCars,
  showBikes,
  showBuses,
  savedIds,
  signedIn,
}: {
  content: HomePageContent;
  coverUrl: string;
  destinations: HomeDesktopDestination[];
  tours: HomeDesktopTour[];
  hotels: HomeDesktopHotel[];
  cars: HomeRide[];
  bikes: HomeRide[];
  buses: HomeBus[];
  showCars: boolean;
  showBikes: boolean;
  showBuses: boolean;
  savedIds: string[];
  signedIn: boolean;
}) {
  const servicesOn = content.sections.some((section) => section.id === "services" && section.enabled);
  const firstFleet = content.sections.find((section) => {
    if (!section.enabled) return false;
    if (section.id === "cars") return showCars;
    if (section.id === "bikes") return showBikes;
    if (section.id === "buses") return showBuses;
    return false;
  })?.id;
  const tourGuides =
    servicesOn && hasServicePart(content.services, "tours") ? (
      <HomeServicesSection part="tours" embedded services={content.services} />
    ) : null;
  const stayGuides =
    servicesOn && hasServicePart(content.services, "stays") ? (
      <HomeServicesSection part="stays" embedded services={content.services} />
    ) : null;
  const rideGuides =
    servicesOn && hasServicePart(content.services, "rides") ? (
      <HomeServicesSection part="rides" embedded services={content.services} />
    ) : null;

  return (
    <>
      {content.sections.map((section) => {
        if (!section.enabled) return null;
        if (section.id === "hero") {
          return (
            <Hero1
              key="hero"
              coverUrl={coverUrl}
              title={content.hero.title}
              description={content.hero.description}
            />
          );
        }
        if (section.id === "destinations") {
          return (
            <section key="destinations" className="layout-pt-lg layout-pb-md" data-aos="fade-up">
              <div className="container">
                <div className="row y-gap-20 justify-between items-end">
                  <div className="col-auto">
                    <div className="sectionTitle -md">
                      <h2 className="sectionTitle__title">{content.destinations.title}</h2>
                      <p className="sectionTitle__text mt-5 sm:mt-0">
                        {content.destinations.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="col-auto md:d-none">
                    <a
                      href="/destinations"
                      className="button -md -blue-1 bg-blue-1-05 text-blue-1"
                    >
                      {content.destinations.linkLabel}
                      <div className="icon-arrow-top-right ml-15" />
                    </a>
                  </div>
                </div>
                <div className="relative pt-40 sm:pt-20">
                  <PopularDestinations destinations={destinations} />
                </div>
              </div>
            </section>
          );
        }
        if (section.id === "tours" && (tours.length > 0 || tourGuides)) {
          return (
            <section key="tours" className="layout-pt-md layout-pb-md">
              <div className="container">
                {tourGuides}
                <div className="row y-gap-10 justify-between items-end">
                  <div className="col-auto">
                    <div className="sectionTitle -md">
                      <h2 className="sectionTitle__title" id="home-tours-desktop">{content.tours.title}</h2>
                      <p className="sectionTitle__text mt-5 sm:mt-0">{content.tours.subtitle}</p>
                    </div>
                  </div>
                  <div className="col-auto">
                    <Link prefetch={false} href="/tours" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                      {content.tours.linkLabel}
                      <div className="icon-arrow-top-right ml-15" />
                    </Link>
                  </div>
                </div>
                <HomeFlipGrid
                  headingId="home-flip-desktop"
                  tours={tours.slice(0, 4).map((tour) => ({
                    id: tour.id,
                    title: tour.title,
                    place: tour.destinationName || "",
                    days: tour.duration || "",
                    price: tour.priceFrom > 0 ? formatMoney(tour.priceFrom, tour.currency || "INR") : "",
                    image: tour.image,
                    points: tour.chips?.length
                      ? tour.chips
                      : [tour.destinationName, tour.duration].filter((item): item is string => Boolean(item)),
                    href: `/tours/${tour.slug}`,
                    saved: savedIds.includes(tour.id),
                    signedIn,
                  }))}
                />
              </div>
            </section>
          );
        }
        if (section.id === "hotels" && (hotels.length > 0 || stayGuides)) {
          return (
            <Fragment key="hotels">
            {stayGuides}
            {hotels.length > 0 ? (
            <section className="layout-pt-md layout-pb-md">
              <div className="container">
                <div className="row y-gap-10 justify-between items-end">
                  <div className="col-auto">
                    <div className="sectionTitle -md">
                      <h2 className="sectionTitle__title">{content.hotels.title}</h2>
                      <p className="sectionTitle__text mt-5 sm:mt-0">
                        {content.hotels.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="col-auto">
                    <Link prefetch={false} href="/hotels" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                      {content.hotels.linkLabel}
                      <div className="icon-arrow-top-right ml-15" />
                    </Link>
                  </div>
                </div>
                <div className="pt-20">
                  <HomeStayGrid
                    stays={hotels.map((hotel) => ({
                      id: hotel.id,
                      name: hotel.name,
                      place: hotel.destinationName || "",
                      detail: hotel.summary || "",
                      stars: hotel.stars || 0,
                      priceFrom: hotel.priceFrom,
                      currency: hotel.currency || "INR",
                      images: hotel.images?.length ? hotel.images : [hotel.image],
                      href: `/hotels/${hotel.slug}`,
                      saved: savedIds.includes(hotel.id),
                      signedIn,
                    }))}
                  />
                </div>
              </div>
            </section>
            ) : null}
            </Fragment>
          );
        }
        if (section.id === "cars" && showCars) {
          return (
            <Fragment key="cars">
            {firstFleet === "cars" ? rideGuides : null}
            <HomeFleetSection
              title={content.cars.title}
              subtitle={content.cars.subtitle}
              href="/rentals/cars"
              linkLabel={content.cars.linkLabel}
              kindLabel="Car"
              kind="car"
              items={cars}
              empty={carHomeFallback}
              savedIds={savedIds}
              signedIn={signedIn}
            />
            </Fragment>
          );
        }
        if (section.id === "bikes" && showBikes) {
          return (
            <Fragment key="bikes">
            {firstFleet === "bikes" ? rideGuides : null}
            <HomeFleetSection
              title={content.bikes.title}
              subtitle={content.bikes.subtitle}
              href="/rentals/bikes"
              linkLabel={content.bikes.linkLabel}
              kindLabel="Bike"
              kind="bike"
              items={bikes}
              empty={bikeHomeFallback}
              savedIds={savedIds}
              signedIn={signedIn}
            />
            </Fragment>
          );
        }
        if (section.id === "buses" && showBuses) {
          return (
            <Fragment key="buses">
            {firstFleet === "buses" ? rideGuides : null}
            <HomeBusSection
              title={content.buses.title}
              subtitle={content.buses.subtitle}
              href="/buses"
              linkLabel={content.buses.linkLabel}
              items={buses}
            />
            </Fragment>
          );
        }
        if (section.id === "why") {
          return (
            <div key="why" className="container">
              <HomePromises items={content.why.items} headingId="home-promises-desk" />
            </div>
          );
        }
        if (section.id === "services") {
          return (
            <HomeServicesSection
              key="services"
              headingId="home-services-desk"
              services={content.services}
              part="overview"
            />
          );
        }
        if (section.id === "cta") {
          return (
            <div key="cta" className="container">
              <HomeInvite cta={content.cta} headingId="home-invite-desk" />
            </div>
          );
        }
        return null;
      })}
    </>
  );
}
