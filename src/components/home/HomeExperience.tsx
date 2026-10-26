import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { theme } from "@/config/theme";
import type { FavoriteKind } from "@/lib/favorite-kinds";
import { formatMoney } from "@/lib/format";
import { defaultHomePageContent, type HomePageContent } from "@/lib/home-page";
import { HomeAssistSection } from "@/components/home/HomeAssistSection";
import {
  busHomeFallback,
  busHomeImage,
  type HomeBus,
} from "@/components/home/HomeBusSection";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import {
  bikeHomeFallback,
  carHomeFallback,
  HomeRidePromoCard,
  type HomeRide,
} from "@/components/home/HomeFleetSection";
import { HomeVisaSection } from "@/components/home/HomeVisaSection";
import type { TourListLocation } from "@/components/tour-list/types";
import "@/styles/home-experience.css";

export type HomeDestination = {
  slug: string;
  name: string;
  imageUrl: string;
  meta: string;
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
};

export type HomeHotel = {
  id: string;
  slug: string;
  name: string;
  place: string;
  priceFrom: number;
  currency: string;
  image: string;
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

  const tourRail = tours.length > 0 ? (
    <section key="tours" className="home-x__rail" aria-labelledby="home-tours">
      <RailHead
        title={content.tours.title}
        subtitle={content.tours.subtitle}
        href="/tours"
        linkLabel={content.tours.linkLabel}
      />
      <div className="home-x__scroller" id="home-tours">
        {tours.map((tour) => (
          <article key={tour.slug} className="home-x__card">
            <div className="home-x__card-media">
              <Link prefetch={false} href={`/tours/${tour.slug}`} className="home-x__card-shot" aria-label={tour.title}>
                <Image
                  src={tour.image}
                  alt=""
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover" }}
                />
              </Link>
              {tour.badge ? <span className="home-x__badge">{tour.badge}</span> : null}
              <CardFavorite
                kind="tour"
                id={tour.id}
                title={tour.title}
                savedIds={savedIds}
                signedIn={signedIn}
              />
            </div>
            <Link prefetch={false} href={`/tours/${tour.slug}`} className="home-x__card-body">
              <h3>{tour.title}</h3>
              <p className="home-x__meta">
                {[tour.place, tour.duration].filter(Boolean).join(" · ")}
              </p>
              {tour.priceFrom > 0 ? (
                <p className="home-x__price">
                  {formatMoney(tour.priceFrom, tour.currency)}{" "}
                  <small>/ start</small>
                </p>
              ) : null}
            </Link>
          </article>
        ))}
      </div>
    </section>
  ) : null;

  const hotelRail = hotels.length > 0 ? (
    <section key="hotels" className="home-x__rail" aria-labelledby="home-hotels">
      <RailHead
        title={content.hotels.title}
        subtitle={content.hotels.subtitle}
        href="/hotels"
        linkLabel={content.hotels.linkLabel}
      />
      <div className="home-x__scroller" id="home-hotels">
        {hotels.map((hotel) => (
          <article key={hotel.slug} className="home-x__card">
            <div className="home-x__card-media">
              <Link prefetch={false} href={`/hotels/${hotel.slug}`} className="home-x__card-shot" aria-label={hotel.name}>
                <Image
                  src={hotel.image}
                  alt=""
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover" }}
                />
              </Link>
              <CardFavorite
                kind="hotel"
                id={hotel.id}
                title={hotel.name}
                savedIds={savedIds}
                signedIn={signedIn}
              />
            </div>
            <Link prefetch={false} href={`/hotels/${hotel.slug}`} className="home-x__card-body">
              <h3>{hotel.name}</h3>
              <p className="home-x__meta">{hotel.place}</p>
              {hotel.priceFrom > 0 ? (
                <p className="home-x__price">
                  {formatMoney(hotel.priceFrom, hotel.currency)}{" "}
                  <small>/ night from</small>
                </p>
              ) : null}
            </Link>
          </article>
        ))}
      </div>
    </section>
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
            <RideRail
              key="cars"
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
          );
        }
        if (section.id === "bikes" && showBikes) {
          return (
            <RideRail
              key="bikes"
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
          );
        }
        if (section.id === "buses" && showBuses) {
          return (
            <section key="buses" className="home-x__rail" aria-labelledby="home-buses">
              <RailHead
                title={content.buses.title}
                subtitle={content.buses.subtitle}
                href="/buses"
                linkLabel={content.buses.linkLabel}
                headingId="home-buses"
              />
              {buses.length > 0 ? (
                <div className="home-x__scroller">
                  {buses.map((bus) => {
                    const route = [bus.fromCity, bus.toCity].filter(Boolean).join(" to ");
                    const when = [bus.departTime, bus.duration].filter(Boolean).join(" · ");
                    return (
                      <article key={bus.id} className="home-x__card">
                        <div className="home-x__card-media">
                          <Link prefetch={false} href={`/buses/${bus.slug}`} className="home-x__card-shot" aria-label={bus.name}>
                            {/* Plain img: listed coaches can use hosts outside the Next image allowlist. */}
                            <img
                              src={bus.image || busHomeImage}
                              alt=""
                              style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            />
                          </Link>
                          <span className="home-x__badge">{bus.coach || "Bus"}</span>
                        </div>
                        <Link prefetch={false} href={`/buses/${bus.slug}`} className="home-x__card-body">
                          <h3>{bus.name}</h3>
                          <p className="home-x__meta">{[route, when, bus.operator].filter(Boolean).join(" · ")}</p>
                          <p className="home-x__price">
                            {bus.fareFrom > 0 ? (
                              <>
                                {formatMoney(bus.fareFrom)} <small>fare</small>
                              </>
                            ) : (
                              "Fare on request"
                            )}
                          </p>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <HomeRidePromoCard promo={busHomeFallback} />
              )}
            </section>
          );
        }
        if (section.id === "why") {
          return (
            <div key="why" className="home-x__trust">
              {content.why.items.map((item) => (
                <div key={item.id} className="home-x__trust-item">
                  <strong>{item.title}</strong>
                  <span>
                    {item.id === "reply" && contactPhone
                      ? item.text.replace(theme.contact.phone, contactPhone)
                      : item.text}
                  </span>
                </div>
              ))}
            </div>
          );
        }
        if (section.id === "visa") {
          return (
            <HomeVisaSection
              key="visa"
              headingId="home-visa-app"
              title={content.visa.title}
              subtitle={content.visa.subtitle}
              meta={content.visa.meta}
              moreLabel={content.visa.moreLabel}
              ctaLabel={content.visa.ctaLabel}
            />
          );
        }
        if (section.id === "assist") {
          return (
            <HomeAssistSection
              key="assist"
              headingId="home-assist-app"
              title={content.assist.title}
              subtitle={content.assist.subtitle}
              moreLabel={content.assist.moreLabel}
              ctaLabel={content.assist.ctaLabel}
            />
          );
        }
        if (section.id === "cta") {
          return (
            <div key="cta" className="home-x__cta">
              <div>
                <h2>{content.cta.title}</h2>
                <p>{content.cta.subtitle}</p>
              </div>
              <Link prefetch={false} href="/contact">{content.cta.buttonLabel}</Link>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
