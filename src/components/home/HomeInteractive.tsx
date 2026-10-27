"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { FavoriteKind } from "@/lib/favorite-kinds";
import { formatMoney } from "@/lib/format";
import "./home-interactive.css";

function useCalm() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setCalm(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return calm;
}

function shell(calm: boolean) {
  return calm ? "hic is-calm" : "hic";
}

export function GlowLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  function move(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    event.currentTarget.classList.add("is-lit");
  }
  function leave(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.classList.remove("is-lit");
  }
  const classes = `${className} hic-glow`;
  if (href.startsWith("http")) {
    return (
      <a className={classes} href={href} onPointerMove={move} onPointerDown={move} onPointerLeave={leave}>
        {children}
      </a>
    );
  }
  return (
    <Link
      prefetch={false}
      href={href || "/"}
      className={classes}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={leave}
    >
      {children}
    </Link>
  );
}

function Save({
  kind,
  id,
  title,
  saved,
  signedIn,
}: {
  kind: FavoriteKind;
  id: string;
  title: string;
  saved: boolean;
  signedIn: boolean;
}) {
  return (
    <span className="hic-fav" onClick={(event) => event.stopPropagation()}>
      <FavoriteButton
        kind={kind}
        itemId={id}
        initialSaved={saved}
        signedIn={signedIn}
        title={title}
        variant="icon"
        className="fav-btn--float"
      />
    </span>
  );
}

export type HomeTiltCard = {
  id: string;
  place: string;
  chip: string;
  meta: string;
  blurb: string;
  image: string;
  href: string;
};

export function HomeTiltGrid({ cards }: { cards: HomeTiltCard[] }) {
  const calm = useCalm();
  const [open, setOpen] = useState<string | null>(null);
  if (!cards.length) return null;

  function tiltTo(event: React.PointerEvent<HTMLElement>) {
    if (calm) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    card.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    card.classList.add("is-hot");
  }

  function tiltLeave(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
    event.currentTarget.classList.remove("is-hot");
  }

  return (
    <div className={shell(calm)}>
      <div className="hic-grid">
        {cards.map((card) => (
          <article
            key={card.id}
            className={`hic-tilt${open === card.id ? " is-open" : ""}`}
            onPointerMove={(event) => {
              if (event.pointerType === "mouse") tiltTo(event);
            }}
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse") tiltTo(event);
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "mouse") tiltLeave(event);
            }}
            onPointerCancel={tiltLeave}
            onPointerLeave={tiltLeave}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a, button")) return;
              setOpen((current) => (current === card.id ? null : card.id));
            }}
          >
            <div className="hic-tilt__media">
              <img src={card.image} alt="" />
              <span className="hic-tilt__glare" />
            </div>
            <span className="hic-tilt__chip">{card.chip}</span>
            <div className="hic-tilt__body">
              <h3>{card.place}</h3>
              {card.meta ? <p className="hic-note">{card.meta}</p> : null}
              {open === card.id && card.blurb ? <p className="hic-tilt__sheet">{card.blurb}</p> : null}
              <div className="hic-tilt__foot">
                <span />
                <Link prefetch={false} href={card.href} className="hic-btn">
                  Explore
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export type HomeStayCard = {
  id: string;
  name: string;
  place: string;
  detail: string;
  stars: number;
  priceFrom: number;
  currency: string;
  images: string[];
  href: string;
  saved: boolean;
  signedIn: boolean;
};

function starWord(stars: number) {
  if (stars >= 5) return "Superb";
  if (stars >= 4) return "Excellent";
  if (stars >= 3) return "Very good";
  if (stars >= 1) return "Good";
  return "";
}

export function HomeStayGrid({ stays }: { stays: HomeStayCard[] }) {
  const calm = useCalm();
  const [photos, setPhotos] = useState<Record<string, number>>({});
  const [nights, setNights] = useState<Record<string, number>>({});
  if (!stays.length) return null;

  function stepPhoto(id: string, total: number, direction: number) {
    setPhotos((current) => {
      const index = current[id] ?? 0;
      return { ...current, [id]: (index + direction + total) % total };
    });
  }

  return (
    <div className={shell(calm)}>
      <div className="hic-row">
        {stays.map((stay) => {
          const images = stay.images.filter(Boolean);
          const shots = images.length ? images : [""];
          const index = photos[stay.id] ?? 0;
          const many = shots.length > 1 && Boolean(shots[0]);
          const count = nights[stay.id] ?? 1;
          const word = starWord(stay.stars);
          return (
            <article key={stay.id} className="hic-stay">
              <div
                className={`hic-stay__media${many ? " is-cycle" : ""}`}
                onClick={(event) => {
                  if (!many) return;
                  if ((event.target as HTMLElement).closest("button")) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  const back = event.clientX - rect.left < rect.width / 2;
                  stepPhoto(stay.id, shots.length, back ? -1 : 1);
                }}
              >
                {shots[index] ? <img src={shots[index]} alt="" /> : null}
                <Save
                  kind="hotel"
                  id={stay.id}
                  title={stay.name}
                  saved={stay.saved}
                  signedIn={stay.signedIn}
                />
                {many ? (
                  <>
                    <button
                      type="button"
                      className="hic-stay__nav hic-stay__nav--prev"
                      aria-label={`Previous photo of ${stay.name}`}
                      onClick={() => stepPhoto(stay.id, shots.length, -1)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="hic-stay__nav hic-stay__nav--next"
                      aria-label={`Next photo of ${stay.name}`}
                      onClick={() => stepPhoto(stay.id, shots.length, 1)}
                    >
                      ›
                    </button>
                    <div className="hic-dots">
                      {shots.map((image, dot) => (
                        <button
                          key={`${stay.id}-${dot}-${image}`}
                          type="button"
                          className={dot === index ? "is-on" : ""}
                          aria-label={`Photo ${dot + 1} of ${stay.name}`}
                          onClick={() => setPhotos((current) => ({ ...current, [stay.id]: dot }))}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
                {word ? (
                  <span className="hic-score">
                    <b>{stay.stars.toFixed(1)}</b> {word}
                  </span>
                ) : null}
              </div>
              <div className="hic-stay__body">
                {stay.place ? <p className="hic-kicker">{stay.place}</p> : null}
                <h3>{stay.name}</h3>
                {stay.detail ? <p className="hic-note">{stay.detail}</p> : null}
                {stay.priceFrom > 0 ? (
                  <div className="hic-stepper">
                    <button
                      type="button"
                      aria-label={`Fewer nights at ${stay.name}`}
                      disabled={count <= 1}
                      onClick={() => setNights((current) => ({ ...current, [stay.id]: Math.max(1, count - 1) }))}
                    >
                      −
                    </button>
                    <span>
                      {count} night{count === 1 ? "" : "s"}
                    </span>
                    <button
                      type="button"
                      aria-label={`More nights at ${stay.name}`}
                      disabled={count >= 14}
                      onClick={() => setNights((current) => ({ ...current, [stay.id]: Math.min(14, count + 1) }))}
                    >
                      +
                    </button>
                  </div>
                ) : null}
                <div className="hic-stay__foot">
                  <p className="hic-price">
                    {stay.priceFrom > 0 ? (
                      <>
                        <strong>{formatMoney(stay.priceFrom * count, stay.currency || "INR")}</strong>{" "}
                        <small>
                          · {formatMoney(stay.priceFrom, stay.currency || "INR")} / night
                        </small>
                      </>
                    ) : (
                      <strong>Price on request</strong>
                    )}
                  </p>
                  <Link prefetch={false} href={stay.href} className="hic-btn">
                    View
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export type HomeFlipCard = {
  id: string;
  title: string;
  place: string;
  days: string;
  price: string;
  image: string;
  points: string[];
  href: string;
  saved: boolean;
  signedIn: boolean;
};

export function HomeFlipGrid({
  tours,
  headingId,
}: {
  tours: HomeFlipCard[];
  headingId: string;
}) {
  const calm = useCalm();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  if (!tours.length) return null;

  return (
    <div className={`${shell(calm)} hic-block`}>
      <div className="hic-head">
        <div>
          <p className="hic-kicker">Flip</p>
          <h2 id={headingId}>Tap a tour to read the plan</h2>
        </div>
      </div>
      <div className="hic-grid">
        {tours.map((tour) => {
          const open = Boolean(flipped[tour.id]);
          return (
            <div key={tour.id} className={`hic-flip${open ? " is-flipped" : ""}`}>
              <div className="hic-flip__inner">
                <article
                  className="hic-flip__face hic-flip__front"
                  onClick={() => setFlipped((current) => ({ ...current, [tour.id]: true }))}
                >
                  <div className="hic-flip__shot">
                    <img src={tour.image} alt="" />
                    <Save
                      kind="tour"
                      id={tour.id}
                      title={tour.title}
                      saved={tour.saved}
                      signedIn={tour.signedIn}
                    />
                  </div>
                  <div className="hic-flip__front-body">
                    {tour.place ? <p className="hic-kicker">{tour.place}</p> : null}
                    <h3>{tour.title}</h3>
                    {tour.days ? <p className="hic-note">{tour.days}</p> : null}
                    <div className="hic-tilt__foot">
                      <p className="hic-price">
                        {tour.price ? (
                          <>
                            <strong>{tour.price}</strong> <small>/ person</small>
                          </>
                        ) : (
                          <strong>Price on request</strong>
                        )}
                      </p>
                      <button
                        type="button"
                        className="hic-btn hic-btn--line"
                        aria-pressed={open}
                        onClick={(event) => {
                          event.stopPropagation();
                          setFlipped((current) => ({ ...current, [tour.id]: true }));
                        }}
                      >
                        See plan
                      </button>
                    </div>
                  </div>
                </article>
                <article className="hic-flip__face hic-flip__back">
                  {tour.days ? <p className="hic-kicker" style={{ color: "#b9c8ff" }}>{tour.days}</p> : null}
                  <h3>{tour.title}</h3>
                  {tour.points.length > 0 ? (
                    <ul>
                      {tour.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="hic-flip__actions">
                    <Link prefetch={false} href={tour.href} className="hic-btn">
                      View tour
                    </Link>
                    <button
                      type="button"
                      className="hic-btn hic-btn--ghost"
                      onClick={() => setFlipped((current) => ({ ...current, [tour.id]: false }))}
                    >
                      Flip back
                    </button>
                  </div>
                </article>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type HomeDealCard = {
  id: string;
  title: string;
  meta: string;
  detail: string;
  price: string;
  unit: string;
  ribbon: string;
  image: string;
  href: string;
};

export function HomeDealList({ items }: { items: HomeDealCard[] }) {
  const calm = useCalm();
  if (!items.length) return null;

  return (
    <div className={shell(calm)}>
      <div className="hic-deals">
        {items.map((deal) => (
          <article key={deal.id} className="hic-deal">
            <div className="hic-deal__media">
              <img src={deal.image} alt="" />
              {deal.ribbon ? <span className="hic-ribbon">{deal.ribbon}</span> : null}
            </div>
            <div className="hic-deal__body">
              <h3>{deal.title}</h3>
              {deal.meta ? <p className="hic-note">{deal.meta}</p> : <p className="hic-note">City to city</p>}
              <p className="hic-deal__extra">{deal.detail || "Indicative fare. Ask before you pay."}</p>
              <div className="hic-deal__foot">
                <p className="hic-price">
                  <strong>{deal.price}</strong> {deal.unit ? <small>{deal.unit}</small> : null}
                </p>
                <Link prefetch={false} href={deal.href} className="hic-btn">
                  Hold
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
