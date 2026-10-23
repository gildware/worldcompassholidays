import Image from "next/image";
import Link from "next/link";
import { theme } from "@/config/theme";
import { formatMoney } from "@/lib/format";
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

export type HomeCar = {
  slug: string;
  name: string;
  place: string;
  seats: number;
  pricePerDay: number;
  currency: string;
  image: string;
};

export type HomeCatalog = {
  locations: TourListLocation[];
  categories: { value: string; label: string }[];
  durations: { value: string; label: string }[];
  priceMin: number;
  priceMax: number;
  currency: string;
};

const chips = [
  { href: "/tours", label: "Tours & treks", accent: true },
  { href: "/hotels", label: "Hotels" },
  { href: "/rentals/cars", label: "Cars" },
  { href: "/rentals/bikes", label: "Bikes" },
  { href: "/destinations", label: "Destinations" },
  { href: "/visa-services", label: "Visa" },
  { href: "/meet-and-assist", label: "Meet & assist" },
] as const;

function RailHead({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="home-x__rail-head">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link href={href}>{linkLabel}</Link>
    </div>
  );
}

export function HomeExperience({
  destinations,
  tours,
  hotels,
  cars,
  showCars,
  showBikes,
}: {
  destinations: HomeDestination[];
  tours: HomeTour[];
  hotels: HomeHotel[];
  cars: HomeCar[];
  tourCatalog?: HomeCatalog;
  showCars: boolean;
  showBikes: boolean;
}) {
  const serviceLinks = [
    {
      href: "/visa-services",
      title: "Visa help",
      text: "Document list and a clear service fee before you pay.",
    },
    {
      href: "/meet-and-assist",
      title: "Meet & assist",
      text: "A greeter at arrival, departure, or a connection.",
    },
    showCars
      ? {
          href: "/rentals/cars",
          title: "Car rental",
          text: "Self-drive or chauffeur, quoted by the day.",
        }
      : null,
    showBikes
      ? {
          href: "/rentals/bikes",
          title: "Bike rental",
          text: "Motorbikes and scooters for the same dates.",
        }
      : null,
  ].filter(Boolean) as { href: string; title: string; text: string }[];

  return (
    <div className="home-x">
      <section className="home-x__hero">
        <div className="home-x__hero-media" aria-hidden>
          <Image
            src="/img/masthead/1/bg.webp"
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

      <nav className="home-x__cats" aria-label="Browse">
        {chips
          .filter((c) => {
            if (c.href === "/rentals/cars" && !showCars) return false;
            if (c.href === "/rentals/bikes" && !showBikes) return false;
            return true;
          })
          .map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              className={`home-x__chip${"accent" in chip && chip.accent ? " is-accent" : ""}`}
            >
              {chip.label}
            </Link>
          ))}
      </nav>

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

      {cars.length > 0 ? (
        <section className="home-x__rail" aria-labelledby="home-cars">
          <RailHead
            title="Cars for the trip"
            subtitle="Self-drive and chauffeur, by the day"
            href="/rentals/cars"
            linkLabel="All cars"
          />
          <div className="home-x__scroller" id="home-cars">
            {cars.map((car) => (
              <Link key={car.slug} href={`/rentals/${car.slug}`} className="home-x__card">
                <div className="home-x__card-media">
                  <Image
                    src={car.image}
                    alt=""
                    fill
                    sizes="280px"
                    style={{ objectFit: "cover" }}
                  />
                  <span className="home-x__badge">{car.seats} seats</span>
                </div>
                <div className="home-x__card-body">
                  <h3>{car.name}</h3>
                  <p className="home-x__meta">{car.place}</p>
                  <p className="home-x__price">
                    {formatMoney(car.pricePerDay, car.currency)}{" "}
                    <small>/ day</small>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
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

      {serviceLinks.length > 0 ? (
        <section className="home-x__services">
          <RailHead
            title="More ways we help"
            subtitle="Add-ons for the days you are there"
            href="/contact"
            linkLabel="Ask us"
          />
          <div className="home-x__scroller">
            {serviceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="home-x__service">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
