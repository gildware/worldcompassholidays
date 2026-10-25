import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import "@/styles/home-desks.css";

export type HomeRide = {
  slug: string;
  name: string;
  place: string;
  seats: number;
  detail: string;
  pricePerDay: number;
  currency: string;
  image: string;
};

export type HomeRidePromo = {
  href: string;
  title: string;
  text: string;
  points: readonly string[];
  image: string;
  cta: string;
};

export const carHomeFallback: HomeRidePromo = {
  href: "/rentals/cars",
  title: "Cars for the trip",
  text: "Self-drive and chauffeur, priced by the day before you reserve.",
  points: ["Airport and hotel pickup", "Chauffeur or self-drive", "Quote before you pay"],
  image: "/img/cars/car-rental-banner.jpg",
  cta: "Browse cars",
};

export const bikeHomeFallback: HomeRidePromo = {
  href: "/rentals/bikes",
  title: "Bikes for the road",
  text: "Scooters and motorcycles by the day, with a helmet on the hire.",
  points: ["Scooter or motorcycle", "Helmet with the hire", "Mountain and coast routes"],
  image: "/img/bikes/bike-rental-banner.jpg",
  cta: "Browse bikes",
};

export function HomeRidePromoCard({ promo }: { promo: HomeRidePromo }) {
  return (
    <Link href={promo.href} className="ride-promo">
      <Image src={promo.image} alt="" fill sizes="(max-width: 1024px) 100vw, 1100px" />
      <div className="ride-promo__body">
        <h3>{promo.title}</h3>
        <p>{promo.text}</p>
        <ul>
          {promo.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <span className="ride-promo__cta">{promo.cta}</span>
      </div>
    </Link>
  );
}

export function HomeFleetSection({
  title,
  subtitle,
  href,
  linkLabel,
  kindLabel,
  items,
  empty,
  nested = false,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  kindLabel: string;
  items: HomeRide[];
  empty: HomeRidePromo;
  nested?: boolean;
}) {
  return (
    <section className={nested ? "home-web-nested" : "layout-pt-md layout-pb-md"}>
      <div className="container">
        <div className="row y-gap-10 justify-between items-end">
          <div className="col-auto">
            <div className="sectionTitle -md">
              <h2 className="sectionTitle__title">{title}</h2>
              <p className="sectionTitle__text mt-5 sm:mt-0">{subtitle}</p>
            </div>
          </div>
          <div className="col-auto">
            <Link href={href} className="button -md -blue-1 bg-blue-1-05 text-blue-1">
              {linkLabel}
              <div className="icon-arrow-top-right ml-15" />
            </Link>
          </div>
        </div>
        {items.length > 0 ? (
          <div className="row y-gap-30 pt-20">
            {items.map((ride, index) => (
              <div className="col-lg-3 col-sm-6" key={ride.slug}>
                <Link href={`/rentals/${ride.slug}`} className="d-block">
                  <div className="ratio ratio-16:9 rounded-4 overflow-hidden">
                    <Image
                      src={ride.image}
                      alt={ride.name}
                      width={400}
                      height={400}
                      className="img-ratio object-cover"
                      loading={index < 4 ? "eager" : "lazy"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <p className="text-14 fw-500 text-blue-1 mt-15">
                    {[kindLabel, ride.detail].filter(Boolean).join(" · ")}
                  </p>
                  <h3 className="text-18 fw-500 text-dark-1 mt-5">{ride.name}</h3>
                  <p className="text-15 text-light-1 mt-5">
                    {[ride.place, ride.seats ? `${ride.seats} seats` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {ride.pricePerDay > 0 ? (
                    <p className="text-15 fw-500 mt-5">
                      {formatMoney(ride.pricePerDay, ride.currency)} / day
                    </p>
                  ) : null}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-40">
            <HomeRidePromoCard promo={empty} />
          </div>
        )}
      </div>
    </section>
  );
}
