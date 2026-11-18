"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCopy, useFormatMoney, useFormatNumber } from "@/components/i18n/I18nProvider";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { FavoriteKind } from "@/lib/favorite-kinds";
import {
  bikeHomeFallback,
  carHomeFallback,
  type HomeRide,
  type HomeRidePromo,
} from "@/components/home/home-ride-data";
import "@/styles/home-desks.css";

export type { HomeRide, HomeRidePromo };
export { bikeHomeFallback, carHomeFallback };

const carSectionArt = {
  src: "/img/company/service-transfers.jpg",
  alt: "Car for airport and city travel",
} as const;

export function HomeRidePromoCard({ promo }: { promo: HomeRidePromo }) {
  const t = useCopy();
  return (
    <Link prefetch={false} href={promo.href} className="ride-promo">
      <Image src={promo.image} alt="" fill sizes="(max-width: 1024px) 100vw, 1100px" />
      <div className="ride-promo__body">
        <h3>{t(promo.title)}</h3>
        <p>{t(promo.text)}</p>
        <ul>
          {(promo.points ?? []).map((point) => (
            <li key={point}>{t(point)}</li>
          ))}
        </ul>
        <span className="ride-promo__cta">{t(promo.cta)}</span>
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
  const t = useCopy();
  const money = useFormatMoney();
  const count = useFormatNumber();
  const href = `/rentals/${ride.slug}`;
  const fallback = kind === "bike" ? "/img/bikes/bike-rental-banner.jpg" : carSectionArt.src;
  const image = broken || !ride.image ? fallback : ride.image;
  const isCar = kind === "car";

  return (
    <article className={`home-fleet-card${isCar ? " home-fleet-card--car" : ""}`}>
      <div className="home-fleet-card__media">
        {isCar ? (
          <div className="home-fleet-card__scene" aria-hidden>
            <span className="home-fleet-card__hill" />
            <span className="home-fleet-card__road" />
            <span className="home-fleet-card__sun" />
          </div>
        ) : null}
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
        <span className="home-fleet-card__badge">{t(kindLabel)}</span>
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
          {[ride.place, ride.seats ? `${count(ride.seats)} ${t("seats")}` : ""].filter(Boolean).join(" · ")}
        </p>
        <div className="home-fleet-card__foot">
          {ride.pricePerDay > 0 ? (
            <p className="home-fleet-card__price">
              <strong>{money(ride.pricePerDay, ride.currency)}</strong> <small>{t("/ day")}</small>
            </p>
          ) : (
            <p className="home-fleet-card__price">
              <strong>{t("Price on request")}</strong>
            </p>
          )}
          <Link prefetch={false} href={href} className="home-fleet-card__btn">
            {t("View")}
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
  const isCar = kind === "car";

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
          <div className={`home-fleet-scroll${isCar ? " home-fleet-scroll--car" : " pt-20"}`}>
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
