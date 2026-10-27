import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { HomeInvite, HomePromises } from "@/components/home/HomeClose";
import type { FavoriteKind } from "@/lib/favorite-kinds";
import { formatMoney } from "@/lib/format";
import { defaultHomePageContent, type HomePageContent } from "@/lib/home-page";
import {
  busDeal,
  busHomeFallback,
  type HomeBus,
} from "@/components/home/HomeBusSection";
import { HomeDealList, HomeFlipGrid, HomeStayGrid } from "@/components/home/HomeInteractive";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import {
  bikeHomeFallback,
  carHomeFallback,
  HomeRidePromoCard,
  type HomeRide,
} from "@/components/home/HomeFleetSection";
import { hasServicePart, HomeServicesSection } from "@/components/home/HomeServicesSection";
import type { TourListLocation } from "@/components/tour-list/types";
import "@/styles/home-experience.css";

export type HomeDestination = {
  slug: string;
  name: string;
  region?: string;
  imageUrl: string;
  meta: string;
  hoverText?: string;
};

export type HomeTour = {
  id: string;
  slug: string;
  title: string;
  place: string;
  duration: string;
  priceFrom: number;
  currency: string;
  image: string;
  badge?: string;
  summary?: string;
  chips?: string[];
};

export type HomeHotel = {
  id: string;
  slug: string;
  name: string;
  place: string;
  priceFrom: number;
  currency: string;
  image: string;
  images?: string[];
  summary?: string;
  stars?: number;
};

export type HomeCar = HomeRide;

export type HomeCatalog = {
  locations: TourListLocation[];
  categories: { value: string; label: string }[];
  durations: { value: string; label: string }[];
  priceMin: number;
  priceMax: number;
  currency: string;
};

function RailHead({
  title,
  subtitle,
  href,
  linkLabel,
  headingId,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  headingId?: string;
}) {
  return (
    <div className="home-x__rail-head">
      <div>
        <h2 id={headingId}>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link prefetch={false} href={href}>{linkLabel}</Link>
    </div>
  );
}

function CardFavorite({
  kind,
  id,
  title,
  savedIds,
  signedIn,
}: {
  kind: FavoriteKind;
  id: string;
  title: string;
  savedIds: string[];
  signedIn: boolean;
}) {
  return (
    <FavoriteButton
      kind={kind}
      itemId={id}
      initialSaved={savedIds.includes(id)}
      signedIn={signedIn}
      title={title}
      variant="icon"
      className="fav-btn--float"
    />
  );
}

function RideRail({
  id,
  title,
  subtitle,
  href,
  linkLabel,
  kind,
  kindLabel,
  items,
  empty,
  savedIds,
  signedIn,
}: {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  kind: FavoriteKind;
  kindLabel: string;
  items: HomeRide[];
  empty: typeof carHomeFallback;
  savedIds: string[];
  signedIn: boolean;
}) {
  return (
    <section className="home-x__rail" aria-labelledby={id}>
      <RailHead
        title={title}
        subtitle={subtitle}
        href={href}
        linkLabel={linkLabel}
        headingId={id}
      />
      {items.length > 0 ? (
        <div className="home-x__scroller">
          {items.map((ride) => (
            <article key={ride.slug} className="home-x__card">
              <div className="home-x__card-media">
                <Link prefetch={false} href={`/rentals/${ride.slug}`} className="home-x__card-shot" aria-label={ride.name}>
                  <Image
                    src={ride.image}
                    alt=""
                    fill
                    sizes="280px"
                    style={{ objectFit: "cover" }}
                  />
                </Link>
                <span className="home-x__badge">{kindLabel}</span>
                <CardFavorite
                  kind={kind}
                  id={ride.id}
                  title={ride.name}
                  savedIds={savedIds}
                  signedIn={signedIn}
                />
              </div>
              <Link prefetch={false} href={`/rentals/${ride.slug}`} className="home-x__card-body">
                <h3>{ride.name}</h3>
                <p className="home-x__meta">
                  {[ride.place, ride.detail, ride.seats ? `${ride.seats} seats` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {ride.pricePerDay > 0 ? (
                  <p className="home-x__price">
                    {formatMoney(ride.pricePerDay, ride.currency)} <small>/ day</small>
                  </p>
                ) : null}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <HomeRidePromoCard promo={empty} />
      )}
    </section>
  );
}

export function HomeExperience({
  destinations,
  tours,
  hotels,
  cars,
  bikes,
  buses,
  showCars,
  showBikes,
  showBuses,
  coverUrl,
  savedIds = [],
  signedIn = false,
  content = defaultHomePageContent,
  contactPhone,
}: {
  destinations: HomeDestination[];
  tours: HomeTour[];
  hotels: HomeHotel[];
  cars: HomeRide[];
  bikes: HomeRide[];
  buses: HomeBus[];
  tourCatalog?: HomeCatalog;
  showCars: boolean;
  showBikes: boolean;
  showBuses: boolean;
  coverUrl?: string;
  savedIds?: string[];
  signedIn?: boolean;
  content?: HomePageContent;
  contactPhone?: string;
}) {
  const destRail = (
    destinations.length > 0 ? (
      <section key="destinations" className="home-x__rail" aria-labelledby="home-destinations">
        <RailHead
          title={content.destinations.title}
          subtitle={content.destinations.subtitle}
          href="/destinations"
          linkLabel={content.destinations.linkLabel}
        />
        <div className="home-x__scroller" id="home-destinations">
          {destinations.map((d) => (
            <Link prefetch={false} key={d.slug} href={`/destinations/${d.slug}`} className="home-x__dest">
              <Image
                src={d.imageUrl || "/img/destinations/1/1.png"}
                alt=""
                fill
                sizes="200px"
                style={{ objectFit: "cover" }}
              />
              <strong>{d.name}</strong>
              <span>{d.meta}</span>
            </Link>
          ))}
        </div>
      </section>
    ) : null
  );

  const servicesOn = content.sections.some((section) => section.id === "services" && section.enabled);
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
  const firstFleet = content.sections.find((section) => {
    if (!section.enabled) return false;
    if (section.id === "cars") return showCars;
    if (section.id === "bikes") return showBikes;
    if (section.id === "buses") return showBuses;
    return false;
  })?.id;

  const tourRail = tours.length > 0 || tourGuides ? (
    <section key="tours" className="home-x__rail" aria-labelledby="home-tours">
      {tourGuides}
      <RailHead
        title={content.tours.title}
        subtitle={content.tours.subtitle}
        href="/tours"
        linkLabel={content.tours.linkLabel}
        headingId="home-tours"
      />
      <HomeFlipGrid
        headingId="home-flip-mobile"
        tours={tours.slice(0, 4).map((tour) => ({
          id: tour.id,
          title: tour.title,
          place: tour.place,
          days: tour.duration,
          price: tour.priceFrom > 0 ? formatMoney(tour.priceFrom, tour.currency) : "",
          image: tour.image,
          points: tour.chips?.length
            ? tour.chips
            : [tour.badge, tour.place, tour.duration].filter((item): item is string => Boolean(item)),
          href: `/tours/${tour.slug}`,
          saved: savedIds.includes(tour.id),
          signedIn,
        }))}
      />
    </section>
  ) : null;

  const hotelRail = hotels.length > 0 || stayGuides ? (
    <Fragment key="hotels">
    {stayGuides}
    {hotels.length > 0 ? (
    <section key="hotels" className="home-x__rail" aria-labelledby="home-hotels">
      <RailHead
        title={content.hotels.title}
        subtitle={content.hotels.subtitle}
        href="/hotels"
        linkLabel={content.hotels.linkLabel}
      />
      <div id="home-hotels">
        <HomeStayGrid
          stays={hotels.map((hotel) => ({
            id: hotel.id,
            name: hotel.name,
            place: hotel.place,
            detail: hotel.summary || "",
            stars: hotel.stars || 0,
            priceFrom: hotel.priceFrom,
            currency: hotel.currency,
            images: hotel.images?.length ? hotel.images : [hotel.image],
            href: `/hotels/${hotel.slug}`,
            saved: savedIds.includes(hotel.id),
            signedIn,
          }))}
        />
      </div>
    </section>
    ) : null}
    </Fragment>
  ) : null;

  return (
    <div className="home-x">
      {content.sections.map((section) => {
        if (!section.enabled) return null;
        if (section.id === "hero") {
          return (
            <section key="hero" className="home-x__hero">
              <div className="home-x__hero-media" aria-hidden>
                <Image
                  src={coverUrl || "/img/masthead/1/bg.webp"}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="home-x__hero-inner">
                <h1>{content.hero.title}</h1>
                <p>{content.hero.description}</p>
                <HomeHeroSearch />
              </div>
            </section>
          );
        }
        if (section.id === "destinations") return destRail;
        if (section.id === "tours") return tourRail;
        if (section.id === "hotels") return hotelRail;
        if (section.id === "cars" && showCars) {
          return (
            <Fragment key="cars">
            {firstFleet === "cars" ? rideGuides : null}
            <RideRail
              id="home-cars"
              title={content.cars.title}
              subtitle={content.cars.subtitle}
              href="/rentals/cars"
              linkLabel={content.cars.linkLabel}
              kind="car"
              kindLabel="Car"
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
            <RideRail
              id="home-bikes"
              title={content.bikes.title}
              subtitle={content.bikes.subtitle}
              href="/rentals/bikes"
              linkLabel={content.bikes.linkLabel}
              kind="bike"
              kindLabel="Bike"
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
            <section className="home-x__rail" aria-labelledby="home-buses">
              <RailHead
                title={content.buses.title}
                subtitle={content.buses.subtitle}
                href="/buses"
                linkLabel={content.buses.linkLabel}
                headingId="home-buses"
              />
              {buses.length > 0 ? (
                <HomeDealList items={buses.map(busDeal)} />
              ) : (
                <HomeRidePromoCard promo={busHomeFallback} />
              )}
            </section>
            </Fragment>
          );
        }
        if (section.id === "why") {
          return (
            <HomePromises
              key="why"
              items={content.why.items}
              contactPhone={contactPhone}
              headingId="home-promises-mobile"
            />
          );
        }
        if (section.id === "services") {
          return (
            <HomeServicesSection
              key="services"
              headingId="home-services-app"
              services={content.services}
              part="overview"
            />
          );
        }
        if (section.id === "cta") {
          return (
            <HomeInvite
              key="cta"
              cta={content.cta}
              contactPhone={contactPhone}
              headingId="home-invite-mobile"
            />
          );
        }
        return null;
      })}
    </div>
  );
}
