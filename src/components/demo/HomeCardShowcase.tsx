"use client";

import { useEffect, useRef, useState } from "react";
import "./home-card-showcase.css";

type Pick = { id: string; title: string };

const tiltCards = [
  {
    id: "tilt-kashmir",
    place: "Kashmir Valley",
    chip: "Mountains",
    meta: "24 tours · 18 stays",
    price: "₹12,400",
    image: "/img/masthead/1/bg.webp",
    blurb: "Houseboats on Dal, then the meadows above Pahalgam.",
  },
  {
    id: "tilt-ladakh",
    place: "Ladakh",
    chip: "High passes",
    meta: "16 tours · 9 camps",
    price: "₹18,900",
    image: "/img/tours/header-bg.jpg",
    blurb: "Two rest days, then the high road out to Pangong.",
  },
  {
    id: "tilt-goa",
    place: "Goa coast",
    chip: "Beaches",
    meta: "11 tours · 22 stays",
    price: "₹9,800",
    image: "/img/company/service-sightseeing.jpg",
    blurb: "Old Goa in the morning, a quiet beach after lunch.",
  },
  {
    id: "tilt-kerala",
    place: "Kerala",
    chip: "Backwaters",
    meta: "21 tours · 14 stays",
    price: "₹11,200",
    image: "/img/company/service-holidays.jpg",
    blurb: "A houseboat night and a slow morning on the canals.",
  },
];

const stayCards = [
  {
    id: "stay-dal",
    name: "Dal houseboat",
    place: "Srinagar",
    detail: "Lake view · Breakfast",
    score: "9.4",
    word: "Superb",
    price: "₹4,800",
    amount: 4800,
    images: ["/img/company/service-hotels.jpg", "/img/assist/assist-arrival.jpg", "/img/company/about-hero.jpg"],
  },
  {
    id: "stay-leh",
    name: "Leh courtyard",
    place: "Leh",
    detail: "Mountain view · Heater",
    score: "9.1",
    word: "Excellent",
    price: "₹6,200",
    amount: 6200,
    images: ["/img/buses/high-pass-volvo-cover.jpg", "/img/buses/hill-sleeper-cover.jpg", "/img/company/about-fleet.jpg"],
  },
  {
    id: "stay-goa",
    name: "Fontainhas inn",
    place: "Panaji",
    detail: "Old town · Walk to the river",
    score: "8.8",
    word: "Very good",
    price: "₹5,400",
    amount: 5400,
    images: ["/img/company/service-sightseeing.jpg", "/img/company/service-packages.jpg", "/img/assist/assist-family.jpg"],
  },
  {
    id: "stay-munnar",
    name: "Tea-garden lodge",
    place: "Munnar",
    detail: "Estate view · Kitchen",
    score: "9.0",
    word: "Excellent",
    price: "₹3,900",
    amount: 3900,
    images: ["/img/company/service-holidays.jpg", "/img/company/about-branches.jpg", "/img/masthead/1/bg.webp"],
  },
];

const flipCards = [
  {
    id: "flip-kashmir",
    title: "Kashmir meadow trek",
    place: "Srinagar · Pahalgam",
    days: "6 days",
    price: "₹18,400",
    image: "/img/tours/header-bg.jpg",
    points: ["Guide and permits", "Houseboat first night", "Meadow camps", "Airport pickup"],
  },
  {
    id: "flip-spiti",
    title: "Spiti high road",
    place: "Shimla · Kaza",
    days: "8 days",
    price: "₹24,900",
    image: "/img/buses/high-pass-volvo-cover.jpg",
    points: ["Shared 4x4", "Monastery stays", "Key monastery visit", "Oxygen on board"],
  },
  {
    id: "flip-gokarna",
    title: "Gokarna coast walk",
    place: "Goa · Gokarna",
    days: "5 days",
    price: "₹14,200",
    image: "/img/company/service-sightseeing.jpg",
    points: ["Beach hops", "One cliff stay", "Scooter day", "Sunset cruise"],
  },
  {
    id: "flip-alleppey",
    title: "Backwater cruise",
    place: "Kochi · Alleppey",
    days: "4 days",
    price: "₹16,800",
    image: "/img/company/service-holidays.jpg",
    points: ["Private houseboat", "Chef on board", "Village walk", "Fort Kochi evening"],
  },
];

const tripCards = [
  {
    id: "trip-pahalgam",
    title: "Srinagar to Pahalgam",
    meta: "6 days · Kashmir",
    price: "₹18,400",
    image: "/img/masthead/1/bg.webp",
    summary: "A slow valley week: one night on Dal Lake, then meadows, a short trek, and a free afternoon in Srinagar.",
    chips: ["Houseboat", "Guide", "Breakfast", "Pickup"],
  },
  {
    id: "trip-leh",
    title: "Manali to Leh",
    meta: "7 days · Ladakh",
    price: "₹27,500",
    image: "/img/tours/header-bg.jpg",
    summary: "The high-road crossing with two acclimatisation nights, monastery stops, and a Pangong day.",
    chips: ["4x4", "Camps", "Permits", "Oxygen"],
  },
  {
    id: "trip-alleppey",
    title: "Kochi to Alleppey",
    meta: "4 days · Kerala",
    price: "₹16,800",
    image: "/img/company/service-holidays.jpg",
    summary: "Fort Kochi on foot, then a private houseboat through the narrow canals with a cook on board.",
    chips: ["Houseboat", "Cook", "Transfers"],
  },
];

const deckCards = [
  {
    id: "deck-jaipur",
    title: "Jaipur",
    meta: "Palaces · 4 days from ₹13,600",
    image: "/img/company/service-packages.jpg",
  },
  {
    id: "deck-manali",
    title: "Manali",
    meta: "Pine valleys · 5 days from ₹15,200",
    image: "/img/buses/morning-seater-cover.jpg",
  },
  {
    id: "deck-coorg",
    title: "Coorg",
    meta: "Coffee estates · 4 days from ₹12,100",
    image: "/img/company/service-sightseeing.jpg",
  },
  {
    id: "deck-rishikesh",
    title: "Rishikesh",
    meta: "River camp · 3 days from ₹8,400",
    image: "/img/assist/assist-transit.jpg",
  },
  {
    id: "deck-udaipur",
    title: "Udaipur",
    meta: "Lakes · 4 days from ₹14,900",
    image: "/img/company/about-hero.jpg",
  },
];

const spotCards = [
  { id: "spot-tours", kicker: "Trips", title: "Tours", line: "Fixed dates and private departures.", image: "/img/company/service-holidays.jpg" },
  { id: "spot-hotels", kicker: "Stays", title: "Hotels", line: "Stays we have already checked.", image: "/img/company/service-hotels.jpg" },
  { id: "spot-cars", kicker: "Self-drive", title: "Cars", line: "Self-drive from the hill towns.", image: "/img/cars/car-rental-banner.jpg" },
  { id: "spot-bikes", kicker: "Two wheels", title: "Bikes", line: "Daily hire with helmets included.", image: "/img/bikes/bike-rental-banner.jpg" },
  { id: "spot-buses", kicker: "Hill coaches", title: "Buses", line: "Night coaches into the valley.", image: "/img/buses/valley-volvo-cover.jpg" },
  { id: "spot-visa", kicker: "Paperwork", title: "Visa", line: "Forms, documents, and a status you can track.", image: "/img/visa/visa-tourist.jpg" },
];

const dealCards = [
  {
    id: "deal-bus",
    title: "Srinagar night sleeper",
    meta: "Delhi to Srinagar · Friday departure",
    was: "₹2,400",
    now: "₹1,890",
    unit: "per seat",
    seats: "4 seats left",
    image: "/img/buses/night-sleeper-cover.jpg",
    ribbon: "Tonight",
    detail: "Lower berth if you book now. Blanket and a morning chai stop.",
  },
  {
    id: "deal-car",
    title: "Thar for the Spiti road",
    meta: "Manali pickup · Unlimited km this week",
    was: "₹4,100",
    now: "₹3,200",
    unit: "per day",
    seats: "2 vehicles left",
    image: "/img/cars/car-rental-banner.jpg",
    ribbon: "This week",
    detail: "Manual Thar, full tank to empty, pickup in Manali.",
  },
];

const nav = [
  ["tilt", "Tilt"],
  ["stays", "Photo cycle"],
  ["flip", "Flip"],
  ["trips", "Expand & deck"],
  ["glow", "Glow"],
  ["deals", "Deals"],
];

function NightStepper({
  count,
  onChange,
}: {
  count: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="hcd-stepper">
      <button
        type="button"
        aria-label="Fewer nights"
        disabled={count <= 1}
        onClick={() => onChange(Math.max(1, count - 1))}
      >
        −
      </button>
      <span>
        {count} {count === 1 ? "night" : "nights"}
      </span>
      <button
        type="button"
        aria-label="More nights"
        disabled={count >= 14}
        onClick={() => onChange(Math.min(14, count + 1))}
      >
        +
      </button>
    </div>
  );
}

function Heart({
  on,
  label,
  onClick,
  className,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`hcd-heart${on ? " is-on" : ""}${className ? ` ${className}` : ""}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${label} from saved` : `Save ${label}`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
      </svg>
    </button>
  );
}

export function HomeCardShowcase() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<Record<string, number>>({});
  const [nights, setNights] = useState<Record<string, number>>({});
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [openTilt, setOpenTilt] = useState<string | null>(null);
  const [openTrip, setOpenTrip] = useState<string>(tripCards[0].id);
  const [openSpot, setOpenSpot] = useState<string | null>(null);
  const [openDeal, setOpenDeal] = useState<string | null>(null);
  const [deck, setDeck] = useState(0);
  const [pick, setPick] = useState<Pick | null>(null);
  const [calm, setCalm] = useState(false);
  const drag = useRef<{ x: number } | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setCalm(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  function toggleSave(id: string) {
    setSaved((current) => ({ ...current, [id]: !current[id] }));
  }

  function choose(id: string, title: string) {
    setPick({ id, title });
  }

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

  function tiltMove(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    tiltTo(event);
  }

  function tiltDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") return;
    tiltTo(event);
  }

  function tiltLeave(event: React.PointerEvent<HTMLElement>) {
    const card = event.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.classList.remove("is-hot");
  }

  function stepPhoto(id: string, total: number, direction: number) {
    setPhotos((current) => {
      const index = current[id] ?? 0;
      return { ...current, [id]: (index + direction + total) % total };
    });
  }

  function glow(event: React.PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    event.currentTarget.classList.add("is-lit");
  }

  function glowLeave(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.classList.remove("is-lit");
  }

  function moveDeck(direction: number) {
    setDeck((current) => (current + direction + deckCards.length) % deckCards.length);
  }

  return (
    <div className={calm ? "hcd is-calm" : "hcd"}>
      <header className="hcd-hero">
        <div className="hcd-hero__bg">
          <img src="/img/masthead/1/bg.webp" alt="" />
        </div>
        <div className="hcd-wrap hcd-hero__copy">
          <span className="hcd-eyebrow">Home card lab</span>
          <h1>Six ways a home card can move.</h1>
          <p>
            Separate from the live home. Tilt a destination, cycle stay photos, flip a tour,
            open a plan, swipe the deck, and follow the glow.
          </p>
        </div>
      </header>

      <div className="hcd-wrap">
        <nav className="hcd-nav" aria-label="Card styles">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <section className="hcd-section" id="tilt" aria-labelledby="tilt-title">
          <div className="hcd-head">
            <div>
              <p className="hcd-kicker">3D tilt and glare</p>
              <h2 id="tilt-title">Destinations follow the pointer</h2>
            </div>
            <p>Move over a card to tilt it. Tap the card to open the note. The heart and Explore still work on their own.</p>
          </div>
          <div className="hcd-grid">
            {tiltCards.map((card) => (
              <article
                key={card.id}
                className={`hcd-tilt${openTilt === card.id ? " is-open" : ""}${pick?.id === card.id ? " is-picked" : ""}`}
                onPointerMove={tiltMove}
                onPointerDown={tiltDown}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") return;
                  tiltLeave(event);
                }}
                onPointerCancel={tiltLeave}
                onPointerLeave={tiltLeave}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return;
                  setOpenTilt((current) => (current === card.id ? null : card.id));
                }}
              >
                <div className="hcd-tilt__media">
                  <img src={card.image} alt="" />
                  <span className="hcd-tilt__glare" />
                </div>
                <span className="hcd-tilt__chip">{card.chip}</span>
                <Heart
                  className="hcd-tilt__heart"
                  on={Boolean(saved[card.id])}
                  label={card.place}
                  onClick={() => toggleSave(card.id)}
                />
                <div className="hcd-tilt__body">
                  <h3>{card.place}</h3>
                  <p className="hcd-note">{card.meta}</p>
                  {openTilt === card.id ? <p className="hcd-tilt__sheet">{card.blurb}</p> : null}
                  <div className="hcd-tilt__foot">
                    <p className="hcd-price">
                      <strong>{card.price}</strong> <small>from</small>
                    </p>
                    <button type="button" className="hcd-btn" onClick={() => choose(card.id, card.place)}>
                      Explore
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="hcd-section" id="stays" aria-labelledby="stays-title">
          <div className="hcd-head">
            <div>
              <p className="hcd-kicker">Photo cycle</p>
              <h2 id="stays-title">Stays, the way booking sites do them</h2>
            </div>
            <p>Tap either half of the photo to change it. The night stepper on every card updates the total.</p>
          </div>
          <div className="hcd-grid">
            {stayCards.map((stay) => {
              const index = photos[stay.id] ?? 0;
              const count = nights[stay.id] ?? 2;
              const total = stay.amount * count;
              return (
                <article key={stay.id} className={`hcd-stay${pick?.id === stay.id ? " is-picked" : ""}`}>
                  <div
                    className="hcd-stay__media"
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest("button")) return;
                      const rect = event.currentTarget.getBoundingClientRect();
                      const back = event.clientX - rect.left < rect.width / 2;
                      stepPhoto(stay.id, stay.images.length, back ? -1 : 1);
                    }}
                  >
                    <img src={stay.images[index]} alt="" />
                    <Heart
                      className="hcd-stay__heart"
                      on={Boolean(saved[stay.id])}
                      label={stay.name}
                      onClick={() => toggleSave(stay.id)}
                    />
                    <button
                      type="button"
                      className="hcd-stay__nav hcd-stay__nav--prev"
                      aria-label={`Previous photo of ${stay.name}`}
                      onClick={() => stepPhoto(stay.id, stay.images.length, -1)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="hcd-stay__nav hcd-stay__nav--next"
                      aria-label={`Next photo of ${stay.name}`}
                      onClick={() => stepPhoto(stay.id, stay.images.length, 1)}
                    >
                      ›
                    </button>
                    <span className="hcd-score">
                      <b>{stay.score}</b> {stay.word}
                    </span>
                    <div className="hcd-dots">
                      {stay.images.map((image, dot) => (
                        <button
                          key={image}
                          type="button"
                          className={dot === index ? "is-on" : ""}
                          aria-label={`Photo ${dot + 1} of ${stay.name}`}
                          onClick={() => setPhotos((current) => ({ ...current, [stay.id]: dot }))}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="hcd-stay__body">
                    <p className="hcd-kicker">{stay.place}</p>
                    <h3>{stay.name}</h3>
                    <p className="hcd-note">{stay.detail}</p>
                    <NightStepper
                      count={count}
                      onChange={(next) => setNights((current) => ({ ...current, [stay.id]: next }))}
                    />
                    <div className="hcd-stay__foot">
                      <p className="hcd-price">
                        <strong>₹{total.toLocaleString("en-IN")}</strong> <small>· {stay.price} / night</small>
                      </p>
                      <button type="button" className="hcd-btn" onClick={() => choose(stay.id, stay.name)}>
                        View
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="hcd-section" id="flip" aria-labelledby="flip-title">
          <div className="hcd-head">
            <div>
              <p className="hcd-kicker">Flip</p>
              <h2 id="flip-title">Tap a tour to read the plan</h2>
            </div>
            <p>The front is the poster. The back is the itinerary, so the rail stays short.</p>
          </div>
          <div className="hcd-grid">
            {flipCards.map((tour) => {
              const open = Boolean(flipped[tour.id]);
              return (
                <div key={tour.id} className={`hcd-flip${open ? " is-flipped" : ""}`}>
                  <div className="hcd-flip__inner">
                    <article
                      className={`hcd-flip__face hcd-flip__front${pick?.id === tour.id ? " is-picked" : ""}`}
                      onClick={() => setFlipped((current) => ({ ...current, [tour.id]: true }))}
                    >
                      <div className="hcd-flip__shot">
                        <img src={tour.image} alt="" />
                        <Heart
                          className="hcd-flip__heart"
                          on={Boolean(saved[tour.id])}
                          label={tour.title}
                          onClick={() => toggleSave(tour.id)}
                        />
                      </div>
                      <div className="hcd-flip__front-body">
                        <p className="hcd-kicker">{tour.place}</p>
                        <h3>{tour.title}</h3>
                        <p className="hcd-note">{tour.days}</p>
                        <div className="hcd-tilt__foot">
                          <p className="hcd-price">
                            <strong>{tour.price}</strong> <small>/ person</small>
                          </p>
                          <button
                            type="button"
                            className="hcd-btn hcd-btn--line"
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
                    <article className="hcd-flip__face hcd-flip__back">
                      <p className="hcd-kicker" style={{ color: "#b9c8ff" }}>
                        {tour.days}
                      </p>
                      <h3>{tour.title}</h3>
                      <ul>
                        {tour.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                      <div className="hcd-flip__actions">
                        <button
                          type="button"
                          className="hcd-btn"
                          onClick={() => choose(tour.id, tour.title)}
                        >
                          Choose
                        </button>
                        <button
                          type="button"
                          className="hcd-btn hcd-btn--ghost"
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
        </section>

        <section className="hcd-section" id="trips" aria-labelledby="trips-title">
          <div className="hcd-head">
            <div>
              <p className="hcd-kicker">Expand and swipe</p>
              <h2 id="trips-title">Open a plan, or deal the next trip</h2>
            </div>
            <p>Tap a photo or a row to open that plan. In the deck, tap a card behind to bring it forward, or swipe the front card.</p>
          </div>
          <div className="hcd-split">
            <div className="hcd-trips">
              {tripCards.map((trip) => {
                const open = openTrip === trip.id;
                return (
                  <article key={trip.id} className={`hcd-trip${open ? " is-open" : ""}${pick?.id === trip.id ? " is-picked" : ""}`}>
                    <button
                      type="button"
                      className="hcd-trip__media"
                      aria-expanded={open}
                      aria-label={`${open ? "Close" : "Open"} ${trip.title}`}
                      onClick={() => setOpenTrip(open ? "" : trip.id)}
                    >
                      <img src={trip.image} alt="" />
                    </button>
                    <div className="hcd-trip__main">
                      <button
                        type="button"
                        className="hcd-trip__toggle"
                        aria-expanded={open}
                        onClick={() => setOpenTrip(open ? "" : trip.id)}
                      >
                        <span>
                          <small>{trip.meta}</small>
                          <strong>{trip.title}</strong>
                        </span>
                        <span className="hcd-price">
                          <strong>{trip.price}</strong>
                        </span>
                      </button>
                      {open ? (
                        <div className="hcd-trip__more">
                          <p>{trip.summary}</p>
                          <div className="hcd-chips">
                            {trip.chips.map((chip) => (
                              <span key={chip}>{chip}</span>
                            ))}
                          </div>
                          <div>
                            <button type="button" className="hcd-btn" onClick={() => choose(trip.id, trip.title)}>
                              Choose this plan
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hcd-stage">
              <div className="hcd-head">
                <div>
                  <p className="hcd-kicker">Deck</p>
                  <h2 style={{ fontSize: "1.25rem" }}>Next trip</h2>
                </div>
              </div>
              <div
                className="hcd-deck"
                tabIndex={0}
                aria-label="Trip deck. Arrow keys move it."
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") moveDeck(1);
                  if (event.key === "ArrowLeft") moveDeck(-1);
                }}
              >
                {deckCards.map((card, index) => {
                  const offset = (index - deck + deckCards.length) % deckCards.length;
                  const hidden = offset > 3;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className="hcd-deck__card"
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
                        if (offset === 0) choose(card.id, card.title);
                        else setDeck(index);
                      }}
                    >
                      <img src={card.image} alt="" />
                      <span className="hcd-deck__shade" />
                      <span className="hcd-deck__copy">
                        <small>{card.meta}</small>
                        <strong>{card.title}</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="hcd-deck__bar">
                <button type="button" className="hcd-btn hcd-btn--line" onClick={() => moveDeck(-1)}>
                  Previous
                </button>
                <div className="hcd-deck__dots">
                  {deckCards.map((card, index) => (
                    <button
                      key={card.id}
                      type="button"
                      className={index === deck ? "is-on" : ""}
                      aria-label={`Show ${card.title}`}
                      onClick={() => setDeck(index)}
                    />
                  ))}
                </div>
                <button type="button" className="hcd-btn hcd-btn--line" onClick={() => moveDeck(1)}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="hcd-section" id="glow" aria-labelledby="glow-title">
          <div className="hcd-head">
            <div>
              <p className="hcd-kicker">Cursor glow</p>
              <h2 id="glow-title">Service tiles light up where you point</h2>
            </div>
            <p>Move across a tile and the edge lights up. Tap it to open what that service includes.</p>
          </div>
          <div className="hcd-spot-grid">
            {spotCards.map((spot) => {
              const open = openSpot === spot.id;
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`hcd-spot${open ? " is-open is-lit" : ""}${pick?.id === spot.id ? " is-picked" : ""}`}
                  aria-expanded={open}
                  onPointerMove={glow}
                  onPointerDown={glow}
                  onPointerLeave={glowLeave}
                  onClick={() => {
                    setOpenSpot((current) => (current === spot.id ? null : spot.id));
                    choose(spot.id, spot.title);
                  }}
                >
                  <img src={spot.image} alt="" />
                  <span className="hcd-spot__shade" />
                  {open ? <span className="hcd-spot__more">{spot.line}</span> : null}
                  <span className="hcd-spot__label">
                    <small>{spot.kicker}</small>
                    <strong>{spot.title}</strong>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="hcd-section" id="deals" aria-labelledby="deals-title">
          <div className="hcd-head">
            <div>
              <p className="hcd-kicker">Offer card</p>
              <h2 id="deals-title">A wide deal with a live scarcity cue</h2>
            </div>
            <p>Tap a deal to read what is included. Hold keeps it, and the heart saves it.</p>
          </div>
          <div className="hcd-deals">
            {dealCards.map((deal) => {
              const open = openDeal === deal.id;
              return (
              <article
                key={deal.id}
                className={`hcd-deal${open ? " is-open" : ""}${pick?.id === deal.id ? " is-picked" : ""}`}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return;
                  setOpenDeal((current) => (current === deal.id ? null : deal.id));
                  choose(deal.id, deal.title);
                }}
              >
                <div className="hcd-deal__media">
                  <img src={deal.image} alt="" />
                  <span className="hcd-ribbon">{deal.ribbon}</span>
                </div>
                <div className="hcd-deal__body">
                  <div className="hcd-deal__top">
                    <div>
                      <h3>{deal.title}</h3>
                      <p className="hcd-note">{deal.meta}</p>
                    </div>
                    <Heart on={Boolean(saved[deal.id])} label={deal.title} onClick={() => toggleSave(deal.id)} />
                  </div>
                  {open ? <p className="hcd-deal__extra">{deal.detail}</p> : null}
                  <p className="hcd-seats">
                    <span className="hcd-pulse" aria-hidden="true" />
                    {deal.seats}
                  </p>
                  <div className="hcd-deal__foot">
                    <p className="hcd-price">
                      <span className="hcd-was">{deal.was}</span>
                      <strong>{deal.now}</strong> <small>{deal.unit}</small>
                    </p>
                    <button type="button" className="hcd-btn" onClick={() => choose(deal.id, deal.title)}>
                      Hold
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </section>
      </div>

      {pick ? (
        <div className="hcd-toast" role="status">
          <span>Picked {pick.title}</span>
          <button type="button" onClick={() => setPick(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
