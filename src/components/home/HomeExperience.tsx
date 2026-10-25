import Image from "next/image";
import Link from "next/link";
import { theme } from "@/config/theme";
import { formatMoney } from "@/lib/format";
import { HomeAssistSection } from "@/components/home/HomeAssistSection";
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
      <Link href={href}>{linkLabel}</Link>
    </div>
  );
}

function RideRail({
  id,
  title,
  subtitle,
  href,
  linkLabel,
  kindLabel,
  items,
  empty,
}: {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  kindLabel: string;
  items: HomeRide[];
  empty: typeof carHomeFallback;
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
            <Link key={ride.slug} href={`/rentals/${ride.slug}`} className="home-x__card">
              <div className="home-x__card-media">
                <Image
                  src={ride.image}
                  alt=""
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover" }}
                />
                <span className="home-x__badge">{kindLabel}</span>
              </div>
              <div className="home-x__card-body">
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
              </div>
            </Link>
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
  showCars,
  showBikes,
  coverUrl,
}: {
  destinations: HomeDestination[];
  tours: HomeTour[];
  hotels: HomeHotel[];
  cars: HomeRide[];
  bikes: HomeRide[];
  tourCatalog?: HomeCatalog;
  showCars: boolean;
  showBikes: boolean;
  coverUrl?: string;
}) {
  return (
    <div className="home-x">
      <section className="home-x__hero">
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
          <h1>{theme.headline}</h1>
          <p>{theme.tagline}</p>
        </div>
      </section>

      {destinations.length > 0 ? (
        <section className="home-x__rail" aria-labelledby="home-destinations">
          <RailHead
            title="Popular destinations"
            subtitle="Tap a place to see tours, stays, and rentals"
            href="/destinations"
            linkLabel="See all"
          />
          <div className="home-x__scroller" id="home-destinations">
            {destinations.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} className="home-x__dest">
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
      ) : null}

      {tours.length > 0 ? (
        <section className="home-x__rail" aria-labelledby="home-tours">
          <RailHead
            title="Featured tours"
            subtitle="Quoted routes across mountains and coast"
            href="/tours"
            linkLabel="All tours"
          />
          <div className="home-x__scroller" id="home-tours">
            {tours.map((tour) => (
              <Link key={tour.slug} href={`/tours/${tour.slug}`} className="home-x__card">
                <div className="home-x__card-media">
                  <Image
                    src={tour.image}
                    alt=""
                    fill
                    sizes="280px"
                    style={{ objectFit: "cover" }}
                  />
                  {tour.badge ? <span className="home-x__badge">{tour.badge}</span> : null}
                </div>
                <div className="home-x__card-body">
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
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {hotels.length > 0 ? (
        <section className="home-x__rail" aria-labelledby="home-hotels">
          <RailHead
            title="Stays we quote"
            subtitle="Boutique, heritage, and lake stays"
            href="/hotels"
            linkLabel="All hotels"
          />
          <div className="home-x__scroller" id="home-hotels">
            {hotels.map((hotel) => (
              <Link key={hotel.slug} href={`/hotels/${hotel.slug}`} className="home-x__card">
                <div className="home-x__card-media">
                  <Image
                    src={hotel.image}
                    alt=""
                    fill
                    sizes="280px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="home-x__card-body">
                  <h3>{hotel.name}</h3>
                  <p className="home-x__meta">{hotel.place}</p>
                  {hotel.priceFrom > 0 ? (
                    <p className="home-x__price">
                      {formatMoney(hotel.priceFrom, hotel.currency)}{" "}
                      <small>/ night from</small>
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {showCars ? (
        <RideRail
          id="home-cars"
          title="Cars for the trip"
          subtitle="Self-drive and chauffeur, by the day"
          href="/rentals/cars"
          linkLabel="All cars"
          kindLabel="Car"
          items={cars}
          empty={carHomeFallback}
        />
      ) : null}

      {showBikes ? (
        <RideRail
          id="home-bikes"
          title="Bikes for the road"
          subtitle="Scooters and motorcycles, with a helmet"
          href="/rentals/bikes"
          linkLabel="All bikes"
          kindLabel="Bike"
          items={bikes}
          empty={bikeHomeFallback}
        />
      ) : null}

      <div className="home-x__trust">
        <div className="home-x__trust-item">
          <strong>Quote before you pay</strong>
          <span>We price the trip clearly. You accept before anything is booked.</span>
        </div>
        <div className="home-x__trust-item">
          <strong>One request for the whole trip</strong>
          <span>Tours, stays, visas, and rentals from the same enquiry.</span>
        </div>
        <div className="home-x__trust-item">
          <strong>A person replies from India</strong>
          <span>Call or WhatsApp {theme.contact.phone}.</span>
        </div>
      </div>

      <HomeVisaSection headingId="home-visa-app" />
      <HomeAssistSection headingId="home-assist-app" />

      <div className="home-x__cta">
        <div>
          <h2>Tell us the trip. We quote it before you pay.</h2>
          <p>Tours, hotels, visas, airport meet, and car or bike rental.</p>
        </div>
        <Link href="/contact">Contact us</Link>
      </div>
    </div>
  );
}
