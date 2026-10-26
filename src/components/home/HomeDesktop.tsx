import Image from "next/image";
import Link from "next/link";
import BlockGuide from "@/components/block/BlockGuide";
import CallToActions from "@/components/common/CallToActions";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import Hero1 from "@/components/hero/hero-1";
import { HomeAssistSection } from "@/components/home/HomeAssistSection";
import {
  bikeHomeFallback,
  carHomeFallback,
  HomeFleetSection,
  type HomeRide,
} from "@/components/home/HomeFleetSection";
import { HomeBusSection, type HomeBus } from "@/components/home/HomeBusSection";
import { HomeVisaSection } from "@/components/home/HomeVisaSection";
import { formatMoney } from "@/lib/format";
import type { HomePageContent } from "@/lib/home-page";

export type HomeDesktopDestination = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  hoverText: string;
};

export type HomeDesktopTour = {
  id: string;
  slug: string;
  title: string;
  destinationName?: string;
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
  const desktopTours = tours.slice(0, 4);
  const desktopHotels = hotels.slice(0, 4);

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
        if (section.id === "tours" && desktopTours.length > 0) {
          return (
            <section key="tours" className="layout-pt-md layout-pb-md">
              <div className="container">
                <div className="row y-gap-10 justify-between items-end">
                  <div className="col-auto">
                    <div className="sectionTitle -md">
                      <h2 className="sectionTitle__title">{content.tours.title}</h2>
                      <p className="sectionTitle__text mt-5 sm:mt-0">
                        {content.tours.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="col-auto">
                    <Link prefetch={false} href="/tours" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                      {content.tours.linkLabel}
                      <div className="icon-arrow-top-right ml-15" />
                    </Link>
                  </div>
                </div>
                <div className="row y-gap-30 pt-20">
                  {desktopTours.map((tour, index) => (
                    <div className="col-lg-3 col-sm-6" key={tour.id}>
                      <div className="home-fav-photo">
                        <Link prefetch={false} href={`/tours/${tour.slug}`} className="d-block">
                          <div className="ratio ratio-1:1 rounded-4 overflow-hidden">
                            <Image
                              src={tour.image}
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
                          signedIn={signedIn}
                          title={tour.title}
                          variant="icon"
                          className="fav-btn--float"
                        />
                      </div>
                      <Link prefetch={false} href={`/tours/${tour.slug}`} className="d-block">
                        <h3 className="text-18 fw-500 text-dark-1 mt-15">{tour.title}</h3>
                        {tour.destinationName ? (
                          <p className="text-15 text-light-1 mt-5">{tour.destinationName}</p>
                        ) : null}
                        {tour.priceFrom > 0 ? (
                          <p className="text-15 fw-500 mt-5">
                            From {formatMoney(tour.priceFrom, tour.currency || "INR")}
                          </p>
                        ) : null}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }
        if (section.id === "hotels" && desktopHotels.length > 0) {
          return (
            <section key="hotels" className="layout-pt-md layout-pb-md">
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
                <div className="row y-gap-30 pt-20">
                  {desktopHotels.map((hotel, index) => (
                    <div className="col-lg-3 col-sm-6" key={hotel.id}>
                      <div className="home-fav-photo">
                        <Link prefetch={false} href={`/hotels/${hotel.slug}`} className="d-block">
                          <div className="ratio ratio-4:3 rounded-4 overflow-hidden">
                            <Image
                              src={hotel.image}
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
                          signedIn={signedIn}
                          title={hotel.name}
                          variant="icon"
                          className="fav-btn--float"
                        />
                      </div>
                      <Link prefetch={false} href={`/hotels/${hotel.slug}`} className="d-block">
                        <h3 className="text-18 fw-500 text-dark-1 mt-15">{hotel.name}</h3>
                        {hotel.destinationName ? (
                          <p className="text-15 text-light-1 mt-5">{hotel.destinationName}</p>
                        ) : null}
                        {hotel.priceFrom > 0 ? (
                          <p className="text-15 fw-500 mt-5">
                            From {formatMoney(hotel.priceFrom, hotel.currency || "INR")}
                          </p>
                        ) : null}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }
        if (section.id === "cars" && showCars) {
          return (
            <HomeFleetSection
              key="cars"
              title={content.cars.title}
              subtitle={content.cars.subtitle}
              href="/rentals/cars"
              linkLabel={content.cars.linkLabel}
              kindLabel="Car"
              kind="car"
              items={cars.slice(0, 4)}
              empty={carHomeFallback}
              savedIds={savedIds}
              signedIn={signedIn}
            />
          );
        }
        if (section.id === "bikes" && showBikes) {
          return (
            <HomeFleetSection
              key="bikes"
              title={content.bikes.title}
              subtitle={content.bikes.subtitle}
              href="/rentals/bikes"
              linkLabel={content.bikes.linkLabel}
              kindLabel="Bike"
              kind="bike"
              items={bikes.slice(0, 4)}
              empty={bikeHomeFallback}
              savedIds={savedIds}
              signedIn={signedIn}
            />
          );
        }
        if (section.id === "buses" && showBuses) {
          return (
            <HomeBusSection
              key="buses"
              title={content.buses.title}
              subtitle={content.buses.subtitle}
              href="/buses"
              linkLabel={content.buses.linkLabel}
              items={buses.slice(0, 4)}
            />
          );
        }
        if (section.id === "why") {
          return (
            <section key="why" className="layout-pt-md layout-pb-lg">
              <div className="container">
                <div className="row y-gap-20 justify-between">
                  <BlockGuide items={content.why.items} />
                </div>
              </div>
            </section>
          );
        }
        if (section.id === "visa") {
          return (
            <section key="visa" className="layout-pt-md layout-pb-md">
              <div className="container">
                <HomeVisaSection
                  headingId="home-visa-desk"
                  title={content.visa.title}
                  subtitle={content.visa.subtitle}
                  meta={content.visa.meta}
                  moreLabel={content.visa.moreLabel}
                  ctaLabel={content.visa.ctaLabel}
                />
              </div>
            </section>
          );
        }
        if (section.id === "assist") {
          return (
            <section key="assist" className="layout-pt-md layout-pb-lg">
              <div className="container">
                <HomeAssistSection
                  headingId="home-assist-desk"
                  title={content.assist.title}
                  subtitle={content.assist.subtitle}
                  moreLabel={content.assist.moreLabel}
                  ctaLabel={content.assist.ctaLabel}
                />
              </div>
            </section>
          );
        }
        if (section.id === "cta") {
          return (
            <CallToActions
              key="cta"
              title={content.cta.title}
              subtitle={content.cta.subtitle}
              buttonLabel={content.cta.buttonLabel}
            />
          );
        }
        return null;
      })}
    </>
  );
}
