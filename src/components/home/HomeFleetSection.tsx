"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { FavoriteKind } from "@/lib/favorite-kinds";
import { formatMoney } from "@/lib/format";
import "@/styles/home-desks.css";

export type HomeRide = {
  id: string;
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
    <Link prefetch={false} href={promo.href} className="ride-promo">
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

function RideCard({
  ride,
  kind,
  kindLabel,
  saved,
  signedIn,
  eager,
}: {
  ride: HomeRide;
  kind: FavoriteKind;
  kindLabel: string;
  saved: boolean;
  signedIn: boolean;
  eager: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const href = `/rentals/${ride.slug}`;
  const fallback = kind === "bike" ? "/img/bikes/bike-rental-banner.jpg" : "/img/cars/car-rental-banner.jpg";
  const image = broken || !ride.image ? fallback : ride.image;

  return (
    <article className="home-fleet-card">
      <div className="home-fleet-card__media">
        <Link prefetch={false} href={href} className="home-fleet-card__shot" aria-label={ride.name}>
          <Image
            src={image}
            alt=""
            fill
            sizes="280px"
            className="object-cover"
            loading={eager ? "eager" : "lazy"}
            onError={() => setBroken(true)}
          />
        </Link>
        <span className="home-fleet-card__badge">{kindLabel}</span>
        <FavoriteButton
          kind={kind}
          itemId={ride.id}
          initialSaved={saved}
          signedIn={signedIn}
          title={ride.name}
          variant="icon"
          className="fav-btn--float"
        />
      </div>
      <div className="home-fleet-card__body">
        {ride.detail ? <p className="home-fleet-card__kicker">{ride.detail}</p> : null}
        <h3>
          <Link prefetch={false} href={href}>
            {ride.name}
          </Link>
        </h3>
        <p className="home-fleet-card__meta">
          {[ride.place, ride.seats ? `${ride.seats} seats` : ""].filter(Boolean).join(" · ")}
        </p>
        <div className="home-fleet-card__foot">
          {ride.pricePerDay > 0 ? (
            <p className="home-fleet-card__price">
              <strong>{formatMoney(ride.pricePerDay, ride.currency)}</strong> <small>/ day</small>
            </p>
          ) : (
            <p className="home-fleet-card__price">
              <strong>Price on request</strong>
            </p>
          )}
          <Link prefetch={false} href={href} className="home-fleet-card__btn">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HomeFleetSection({
  title,
  subtitle,
  href,
  linkLabel,
  kindLabel,
  kind,
  items,
  empty,
  savedIds = [],
  signedIn = false,
  nested = false,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  kindLabel: string;
  kind: FavoriteKind;
  items: HomeRide[];
  empty: HomeRidePromo;
  savedIds?: string[];
  signedIn?: boolean;
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
            <Link prefetch={false} href={href} className="button -md -blue-1 bg-blue-1-05 text-blue-1">
              {linkLabel}
              <div className="icon-arrow-top-right ml-15" />
            </Link>
          </div>
        </div>
        {items.length > 0 ? (
          <div className="home-fleet-scroll pt-20">
            {items.map((ride, index) => (
              <div className="home-fleet-scroll__item" key={ride.slug}>
                <RideCard
                  ride={ride}
                  kind={kind}
                  kindLabel={kindLabel}
                  saved={savedIds.includes(ride.id)}
                  signedIn={signedIn}
                  eager={index < 4}
                />
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
