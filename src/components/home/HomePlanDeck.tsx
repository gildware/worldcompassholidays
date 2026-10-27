"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./home-plan-deck.css";

export type HomePlanTrip = {
  id: string;
  title: string;
  meta: string;
  price: string;
  image: string;
  summary: string;
  chips: string[];
  href: string;
};

export type HomeDeckCard = {
  id: string;
  title: string;
  meta: string;
  image: string;
  href: string;
};

export function HomePlanDeck({
  trips,
  deck,
  seeAllHref = "/tours",
  seeAllLabel = "All tours",
  headingId = "home-plan-title",
}: {
  trips: HomePlanTrip[];
  deck: HomeDeckCard[];
  seeAllHref?: string;
  seeAllLabel?: string;
  headingId?: string;
}) {
  const router = useRouter();
  const [openTrip, setOpenTrip] = useState(trips[0]?.id ?? "");
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number } | null>(null);
  const swiped = useRef(false);

  if (trips.length === 0) return null;

  function moveDeck(direction: number) {
    if (deck.length === 0) return;
    setIndex((current) => (current + direction + deck.length) % deck.length);
  }

  return (
    <section className="home-plan" aria-labelledby={headingId}>
      <div className="home-plan__head">
        <div>
          <p className="home-plan__kicker">Expand and swipe</p>
          <h2 id={headingId}>Open a plan, or deal the next trip</h2>
        </div>
        <p>Tap a photo or a row to open that plan. In the deck, tap a card behind to bring it forward, or swipe the front card.</p>
        <Link prefetch={false} href={seeAllHref} className="home-plan__all">
          {seeAllLabel}
        </Link>
      </div>

      <div className="home-plan__split">
        <div className="home-plan__trips">
          {trips.map((trip) => {
            const open = openTrip === trip.id;
            return (
              <article key={trip.id} className={open ? "home-plan__trip is-open" : "home-plan__trip"}>
                <button
                  type="button"
                  className="home-plan__media"
                  aria-expanded={open}
                  aria-label={`${open ? "Close" : "Open"} ${trip.title}`}
                  onClick={() => setOpenTrip(open ? "" : trip.id)}
                >
                  <img src={trip.image} alt="" />
                </button>
                <div className="home-plan__main">
                  <button
                    type="button"
                    className="home-plan__toggle"
                    aria-expanded={open}
                    onClick={() => setOpenTrip(open ? "" : trip.id)}
                  >
                    <span>
                      <small>{trip.meta}</small>
                      <strong>{trip.title}</strong>
                    </span>
                    {trip.price ? (
                      <span className="home-plan__price">
                        <strong>{trip.price}</strong>
                      </span>
                    ) : null}
                  </button>
                  {open ? (
                    <div className="home-plan__more">
                      <p>{trip.summary}</p>
                      {trip.chips.length > 0 ? (
                        <div className="home-plan__chips">
                          {trip.chips.map((chip) => (
                            <span key={chip}>{chip}</span>
                          ))}
                        </div>
                      ) : null}
                      <div>
                        <Link prefetch={false} href={trip.href} className="home-plan__btn">
                          Choose this plan
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {deck.length > 0 ? (
          <div className="home-plan__stage">
            <p className="home-plan__kicker">Deck</p>
            <h3 className="home-plan__stage-title">Next trip</h3>
            <div
              className="home-plan__deck"
              tabIndex={0}
              aria-label="Trip deck. Arrow keys move it."
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") moveDeck(1);
                if (event.key === "ArrowLeft") moveDeck(-1);
              }}
            >
              {deck.map((card, cardIndex) => {
                const offset = (cardIndex - index + deck.length) % deck.length;
                const hidden = offset > 3;
                return (
                  <button
                    key={card.id}
                    type="button"
                    className="home-plan__card"
                    aria-hidden={hidden}
                    aria-label={offset === 0 ? `${card.title}. ${card.meta}` : `Bring ${card.title} forward`}
                    tabIndex={hidden ? -1 : 0}
                    style={{
                      zIndex: 20 - offset,
                      opacity: hidden ? 0 : 1,
                      pointerEvents: hidden ? "none" : "auto",
                      transform: hidden
                        ? "translate(110px, 40px) scale(0.86)"
                        : `translate(${offset * 34}px, ${offset * 14}px) scale(${1 - offset * 0.045}) rotate(${offset * 1.6}deg)`,
                    }}
                    onPointerDown={(event) => {
                      if (offset !== 0) return;
                      drag.current = { x: event.clientX };
                    }}
                    onPointerUp={(event) => {
                      if (!drag.current || offset !== 0) return;
                      const delta = event.clientX - drag.current.x;
                      drag.current = null;
                      if (Math.abs(delta) < 48) return;
                      swiped.current = true;
                      moveDeck(delta < 0 ? 1 : -1);
                    }}
                    onClick={() => {
                      if (swiped.current) {
                        swiped.current = false;
                        return;
                      }
                      if (offset === 0) router.push(card.href);
                      else setIndex(cardIndex);
                    }}
                  >
                    <img src={card.image} alt="" />
                    <span className="home-plan__shade" />
                    <span className="home-plan__copy">
                      <small>{card.meta}</small>
                      <strong>{card.title}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="home-plan__bar">
              <button type="button" className="home-plan__btn home-plan__btn--line" onClick={() => moveDeck(-1)}>
                Previous
              </button>
              <div className="home-plan__dots">
                {deck.map((card, cardIndex) => (
                  <button
                    key={card.id}
                    type="button"
                    className={cardIndex === index ? "is-on" : ""}
                    aria-label={`Show ${card.title}`}
                    onClick={() => setIndex(cardIndex)}
                  />
                ))}
              </div>
              <button type="button" className="home-plan__btn home-plan__btn--line" onClick={() => moveDeck(1)}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
