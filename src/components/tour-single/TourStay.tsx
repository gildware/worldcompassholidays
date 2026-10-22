"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { submitTourRequest } from "@/actions/tour-request";
import { initialFormState } from "@/lib/forms";
import { formatMoney } from "@/lib/format";
import { plainText } from "@/lib/seo";
import { partyBlock, quoteTour } from "@/lib/tours/quote";
import "@/styles/tour-stay.css";

export type TourStayDeparture = {
  id: string;
  iso: string;
  endIso: string;
  label: string;
  seats: number;
  price: number;
};

export type TourStayDay = {
  dayNumber: number;
  title: string;
  description: string;
  imageUrl: string;
};

export type TourStayData = {
  title: string;
  slug: string;
  location: string;
  destinationHref: string;
  category: string;
  durationLabel: string;
  durationDays: number;
  difficulty: string;
  minPeople: number;
  maxGroupSize: number;
  priceFrom: number;
  currency: string;
  cancelDays: number;
  images: string[];
  summary: string;
  description: string;
  includes: string[];
  excludes: string[];
  facilities: string[];
  languages: string[];
  faqs: { title: string; content: string }[];
  days: TourStayDay[];
  departures: TourStayDeparture[];
  address: string;
  map: { lat: number; lng: number } | null;
  similar: { href: string; title: string; location: string; duration: string; price: string; image: string }[];
};

type Guest = { name: string; email: string; phone: string } | null;

const PACK = [
  "Government photo ID",
  "Personal medicines",
  "A day bag",
  "Comfortable walking shoes",
  "A warm layer for the evening",
  "Cash for personal expenses",
];

function money(amount: number, currency: string) {
  return formatMoney(Math.round(amount), currency);
}

function todayIso() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function longDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function shortDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "the chosen date";
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  return `${weekday} ${date.getDate()} ${month}`;
}

function beats(text: string) {
  const clean = plainText(text);
  const parts = clean.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const source = parts.length > 1 ? parts : clean.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  if (source.length >= 2 && parts.length <= 1) {
    const mid = Math.ceil(source.length / 2);
    return [
      { when: "Morning", text: source.slice(0, mid).join(" ") },
      { when: "Later", text: source.slice(mid).join(" ") },
    ];
  }
  if (source.length > 1) return source.map((part, index) => ({ when: `Part ${index + 1}`, text: part }));
  return [{ when: "The day", text: clean || "The plan for this day is confirmed with your request." }];
}

function chunk<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export function TourStay({ tour, customer }: { tour: TourStayData; customer: Guest }) {
  const currency = tour.currency || "INR";
  const photos = tour.images.length > 0 ? tour.images : [];
  const visible = photos.slice(0, 5);
  const [mode, setMode] = useState<"group" | "private">("group");
  const [departureId, setDepartureId] = useState(tour.departures[0]?.id ?? "");
  const [groupDate, setGroupDate] = useState(addDays(todayIso(), 21));
  const [privateDate, setPrivateDate] = useState(tour.departures[0]?.iso || addDays(todayIso(), 28));
  const [adults, setAdults] = useState(Math.max(2, tour.minPeople || 1));
  const [children, setChildren] = useState(0);
  const [ownRoom, setOwnRoom] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const [packed, setPacked] = useState<boolean[]>(() => PACK.map(() => false));
  const [state, action, pending] = useActionState(submitTourRequest, initialFormState);

  const departure = tour.departures.find((item) => item.id === departureId) ?? tour.departures[0] ?? null;
  const startIso = mode === "group" ? (departure ? departure.iso : groupDate) : privateDate;
  const quote = useMemo(
    () =>
      quoteTour({
        priceFrom: tour.priceFrom,
        mode,
        startIso,
        listedPrice: mode === "group" && departure ? departure.price : null,
        adults,
        children,
        ownRoom,
      }),
    [adults, children, departure, mode, ownRoom, startIso, tour.priceFrom],
  );
  const block = startIso
    ? partyBlock({
        mode,
        adults,
        children,
        minPeople: tour.minPeople,
        maxGroupSize: tour.maxGroupSize,
        seats: mode === "group" && departure ? departure.seats : null,
      })
    : "Choose a start date.";
  const people = adults + children;
  const nextDate = tour.departures.find((item) => item.id !== departure?.id && item.seats >= people && item.iso >= todayIso());
  const childWarn = !block && children > adults ? "More children than adults. The desk will confirm this is alright." : "";
  const sentence = `${adults} ${adults === 1 ? "adult" : "adults"}${children ? ` · ${children} ${children === 1 ? "child" : "children"}` : ""} · ${mode} · ${shortDate(startIso)}${quote.seasonName ? ` · ${quote.seasonName}` : ""}`;
  const cancelOn = startIso ? addDays(startIso, -tour.cancelDays) : "";
  const cancelOpen = Boolean(cancelOn && cancelOn >= todayIso());
  const succeeded = Boolean(state.success && state.reference);
  const summary = plainText(tour.summary);
  const description = plainText(tour.description);
  const stops = useMemo(() => {
    if (tour.days.length === 0) return [];
    if (tour.days.length <= 4) return tour.days;
    return [tour.days[0], tour.days[1], tour.days[2], tour.days[tour.days.length - 1]];
  }, [tour.days]);
  const amenityGroups = useMemo(() => {
    if (tour.facilities.length > 0) {
      return chunk(tour.facilities, 4).map((items, index) => ({
        title: index === 0 ? "On this tour" : `Also included ${index + 1}`,
        items,
      }));
    }
    return [
      {
        title: "The trip",
        items: [tour.durationLabel, tour.difficulty || "Pace confirmed with the desk", tour.maxGroupSize > 0 ? `Up to ${tour.maxGroupSize} travelers` : "Small group"].filter(Boolean),
      },
      {
        title: "Before you pay",
        items: [`Cancel until ${tour.cancelDays} days before the start`, "Nothing is held until you accept"],
      },
    ];
  }, [tour.cancelDays, tour.difficulty, tour.durationLabel, tour.facilities, tour.maxGroupSize]);

  useEffect(() => {
    document.body.classList.toggle("road-sheet", sheet);
    return () => document.body.classList.remove("road-sheet");
  }, [sheet]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`wch-tour-${tour.slug}-pack`);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) setPacked(PACK.map((_, index) => Boolean(parsed[index])));
      }
    } catch {
      setPacked(PACK.map(() => false));
    }
  }, [tour.slug]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".road-sub a"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          for (const link of links) link.classList.toggle("is-on", link.getAttribute("href") === `#${id}`);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    for (const link of links) {
      const node = document.querySelector(link.getAttribute("href") || "");
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  function openBook() {
    if (window.matchMedia("(max-width: 980px)").matches) {
      setSheet(true);
      return;
    }
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openRequest() {
    if (block) return;
    document.querySelector<HTMLDialogElement>("#road-reserve")?.showModal();
  }

  function openPhotos(index: number) {
    setPhotoIndex(index);
    document.querySelector<HTMLDialogElement>("#road-light")?.showModal();
  }

  function stepPhoto(step: number) {
    if (photos.length === 0) return;
    setPhotoIndex((current) => (current + step + photos.length) % photos.length);
  }

  function togglePack(index: number) {
    setPacked((current) => {
      const next = current.map((item, itemIndex) => (itemIndex === index ? !item : item));
      try {
        localStorage.setItem(`wch-tour-${tour.slug}-pack`, JSON.stringify(next));
      } catch {
        setToast("Saving is blocked in this browser");
      }
      return next;
    });
  }

  const hasMap = Boolean(tour.map && Number.isFinite(tour.map.lat) && Number.isFinite(tour.map.lng));
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${tour.map!.lng - 0.04},${tour.map!.lat - 0.03},${tour.map!.lng + 0.04},${tour.map!.lat + 0.03}`)}&layer=mapnik&marker=${tour.map!.lat}%2C${tour.map!.lng}`
    : "";
  const includes = tour.includes.length > 0 ? tour.includes : ["The price on this page is the trip as listed. Ask the desk to confirm hotels and meals before you pay."];
  const excludes = tour.excludes.length > 0 ? tour.excludes : ["Personal expenses, travel insurance, and anything not listed as included."];
  const faqs = [
    ...tour.faqs,
    {
      title: "When can this be cancelled?",
      content: cancelOpen
        ? `This trip can be cancelled until ${longDate(cancelOn)}.`
        : `This start date is inside the ${tour.cancelDays}-day window. The desk confirms what can still be refunded.`,
    },
    {
      title: "Is a seat held when I send this?",
      content: "No. This is a request. Nothing is charged and no seat is held until you accept the trip.",
    },
  ];

  return (
    <div className="road">
      <a className="road-skip" href="#overview">
        Skip to the tour
      </a>
      <div className="road-wrap">
        <nav className="road-crumb" aria-label="Breadcrumb">
          <Link href="/tours">Tours</Link>
          <span aria-hidden="true">/</span>
          {tour.location ? (
            <>
              <Link href={tour.destinationHref}>{tour.location}</Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span>{tour.title}</span>
        </nav>

        <div className="road-hero">
          <div>
            <p className="road-eyebrow">{[tour.category, tour.durationLabel].filter(Boolean).join(" · ") || "Tour"}</p>
            <h1>{tour.title}</h1>
            <p className="road-place">
              {tour.location ? <a href="#meeting">{tour.location}</a> : null}
              {tour.difficulty ? <span>{tour.difficulty}</span> : null}
              <span>{money(tour.priceFrom, currency)} a person</span>
            </p>
          </div>
        </div>

        {visible.length > 0 ? (
          <div className={`road-gallery road-gallery--${visible.length}`} aria-label={`Photographs of ${tour.title}`}>
            {visible.map((src, index) => (
              <button key={`${src}-${index}`} className={index === 0 ? "road-shot road-g1" : "road-shot"} type="button" onClick={() => openPhotos(index)}>
                <img src={src} alt={`${tour.title} photograph ${index + 1}`} />
              </button>
            ))}
            {photos.length > 1 ? (
              <button className="road-all" type="button" onClick={() => openPhotos(0)}>
                View all {photos.length} photos
              </button>
            ) : null}
          </div>
        ) : null}

        {stops.length > 0 ? (
          <div className="road-route" aria-label="Route">
            {stops.map((day) => (
              <div className="road-stop" key={`${day.dayNumber}-${day.title}`}>
                <span>Day {day.dayNumber}</span>
                <strong>{day.title}</strong>
              </div>
            ))}
          </div>
        ) : null}

        <nav className="road-sub" aria-label="On this page">
          <a href="#overview">Overview</a>
          <a href="#departures">Departures</a>
          {tour.days.length > 0 ? <a href="#itinerary">Itinerary</a> : null}
          <a href="#included">Included</a>
          <a href="#trip">The trip</a>
          <a href="#meeting">Meeting</a>
          <a href="#before">Before you go</a>
          <button className="road-sub-total" type="button" onClick={openBook}>
            {money(quote.total, currency)}
          </button>
        </nav>

        <div className="road-layout">
          <div className="road-main">
            <section className="road-section" id="overview">
              <h2>Overview</h2>
              {summary ? <p className="road-lede">{summary}</p> : null}
              {description && description !== summary ? <p className="road-lede">{description}</p> : null}
              <div className="road-stats">
                <div className="road-stat">
                  <b>{tour.durationLabel || `${tour.durationDays} days`}</b>
                  <span>On the road</span>
                </div>
                <div className="road-stat">
                  <b>{tour.maxGroupSize > 0 ? `Up to ${tour.maxGroupSize}` : "Small group"}</b>
                  <span>Travelers</span>
                </div>
                <div className="road-stat">
                  <b>{tour.difficulty || "Steady"}</b>
                  <span>Pace</span>
                </div>
                <div className="road-stat">
                  <b>{money(tour.priceFrom, currency)}</b>
                  <span>From</span>
                </div>
              </div>
              <div className="road-hi">
                <article>
                  <h3>One total</h3>
                  <p>The figure in the card is the amount the desk will confirm.</p>
                </article>
                <article>
                  <h3>Cancellation</h3>
                  <p>
                    {cancelOpen
                      ? `Cancel until ${longDate(cancelOn)}.`
                      : `Cancellation is ${tour.cancelDays} days before the start. This date is already inside that window.`}
                  </p>
                </article>
                <article>
                  <h3>{mode === "private" ? "Private" : "Group"}</h3>
                  <p>
                    {mode === "private"
                      ? "A private departure is your own vehicle and guide, priced from the listed rate."
                      : departure
                        ? "Group dates use the price stored for that departure."
                        : "No fixed departure is listed. Pick a start date and the desk confirms the group."}
                  </p>
                </article>
                <article>
                  <h3>{tour.days.length > 0 ? `${tour.days.length} days written out` : "Day by day on request"}</h3>
                  <p>{tour.days.length > 0 ? "Each day below is the plan stored for this tour." : "The day-by-day plan is confirmed with your request."}</p>
                </article>
              </div>
            </section>

            <section className="road-section" id="departures">
              <h2>Departures</h2>
              <p className="road-lede">
                {tour.departures.length > 0
                  ? "Group dates are the open departures. Private uses your own start date."
                  : "This tour has no fixed departure listed. Choose group or private, then a start date. The desk confirms it is open before anything is held."}
              </p>
              {mode === "group" && tour.departures.length > 0 ? (
                <div className="road-dates">
                  {tour.departures.map((item) => {
                    const shown = Math.round(item.price / 10) * 10;
                    return (
                      <button
                        key={item.id}
                        className={`road-dep${item.id === departure?.id ? " is-on" : ""}`}
                        type="button"
                        onClick={() => setDepartureId(item.id)}
                      >
                        <span>
                          <b>{item.label}</b>
                          <small>{item.seats > 0 ? `${item.seats} seats` : "Open departure"}</small>
                        </span>
                        <em>{money(shown, currency)}</em>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="road-lede">The start date sits in the request card. Private is about 1.46 times the listed rate, then the season for that month.</p>
              )}
            </section>

            {tour.days.length > 0 ? (
              <section className="road-section" id="itinerary">
                <h2>Itinerary</h2>
                {tour.days.map((day, index) => (
                  <details className="road-day" key={`${day.dayNumber}-${day.title}`} open={index === 0}>
                    <summary>
                      <span>
                        <strong>
                          Day {day.dayNumber}
                          {day.title ? ` · ${day.title}` : ""}
                        </strong>
                      </span>
                    </summary>
                    <div className="road-day-body">
                      {day.imageUrl ? <img src={day.imageUrl} alt="" style={{ width: "100%", borderRadius: 14, maxHeight: 180, objectFit: "cover" }} /> : null}
                      {beats(day.description).map((beat) => (
                        <div className="road-beat" key={beat.when}>
                          <span>{beat.when}</span>
                          <p>{beat.text}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </section>
            ) : null}

            <section className="road-section" id="included">
              <h2>Included</h2>
              <div className="road-split">
                <div>
                  <h3>In the price</h3>
                  <ul className="road-ok">
                    {includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Not in the price</h3>
                  <ul className="road-no">
                    {excludes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="road-section" id="trip">
              <h2>The trip</h2>
              <div className="road-amen">
                {amenityGroups.map((group) => (
                  <article key={group.title}>
                    <h3>{group.title}</h3>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="road-pack">
                {PACK.map((item, index) => (
                  <label key={item}>
                    <input type="checkbox" checked={packed[index] ?? false} onChange={() => togglePack(index)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <p className="road-fine">The packing list stays in this browser.</p>
            </section>

            <section className="road-section" id="meeting">
              <h2>Meeting</h2>
              <p className="road-lede">
                {tour.address
                  ? tour.address
                  : tour.location
                    ? `The meeting point in ${tour.location} is confirmed with your request.`
                    : "The meeting point is confirmed with your request."}
              </p>
              {tour.languages.length > 0 ? <p className="road-lede">Languages named on this tour: {tour.languages.join(", ")}.</p> : null}
              {hasMap ? <iframe className="road-map" title={`Map for ${tour.title}`} src={mapSrc} loading="lazy" /> : null}
            </section>

            <section className="road-section" id="before">
              <h2>Before you go</h2>
              <div className="road-facts">
                <div>
                  <strong>Duration</strong>
                  <span>{tour.durationLabel || `${tour.durationDays} days`}</span>
                </div>
                <div>
                  <strong>Group</strong>
                  <span>
                    {tour.minPeople > 1 ? `From ${tour.minPeople} travelers. ` : ""}
                    {tour.maxGroupSize > 0 ? `Up to ${tour.maxGroupSize}.` : "The desk confirms the group size."}
                  </span>
                </div>
                <div>
                  <strong>Cancellation</strong>
                  <span>
                    {cancelOpen
                      ? `Cancel until ${longDate(cancelOn)}.`
                      : `Cancellation is ${tour.cancelDays} days before the start. This date is already inside that window.`}
                  </span>
                </div>
                <div>
                  <strong>Payment</strong>
                  <span>This request holds nothing. You pay only after you accept the trip.</span>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                {faqs.map((item) => (
                  <details className="road-faq" key={item.title}>
                    <summary>{item.title}</summary>
                    <p>{plainText(item.content)}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="road-book" id="book" aria-label="Request this tour">
            <div className="road-handle" aria-hidden="true" />
            <div className="road-sheet-head">
              <strong>Your trip</strong>
              <button type="button" onClick={() => setSheet(false)}>
                Close
              </button>
            </div>
            <p className="road-price" aria-live="polite">
              {money(quote.total, currency)}
            </p>
            <p className="road-kicker">Total for this party</p>
            <p className="road-sentence">{sentence}</p>

            <div className="road-segment" role="group" aria-label="Group or private">
              <button className={mode === "group" ? "is-on" : ""} type="button" onClick={() => setMode("group")}>
                Group
              </button>
              <button className={mode === "private" ? "is-on" : ""} type="button" onClick={() => setMode("private")}>
                Private
              </button>
            </div>
            {mode === "group" && departure ? (
              <p className="road-kicker">Starts {departure.label}. {departure.seats > 0 ? `${departure.seats} seats on this departure.` : "The desk confirms seats."}</p>
            ) : (
              <label className="road-field">
                {mode === "private" ? "Private start date" : "Start date"}
                <input
                  type="date"
                  min={todayIso()}
                  value={mode === "private" ? privateDate : groupDate}
                  onChange={(event) => (mode === "private" ? setPrivateDate(event.target.value) : setGroupDate(event.target.value))}
                />
              </label>
            )}

            <div className="road-travelers">
              <div className="road-step">
                <span>Adults</span>
                <div>
                  <button type="button" aria-label="Fewer adults" disabled={adults <= 1} onClick={() => setAdults((value) => Math.max(1, value - 1))}>
                    –
                  </button>
                  <b>{adults}</b>
                  <button type="button" aria-label="More adults" disabled={adults >= 20} onClick={() => setAdults((value) => Math.min(20, value + 1))}>
                    +
                  </button>
                </div>
              </div>
              <div className="road-step">
                <span>Children 5–11</span>
                <div>
                  <button type="button" aria-label="Fewer children" disabled={children <= 0} onClick={() => setChildren((value) => Math.max(0, value - 1))}>
                    –
                  </button>
                  <b>{children}</b>
                  <button type="button" aria-label="More children" disabled={children >= 12} onClick={() => setChildren((value) => Math.min(12, value + 1))}>
                    +
                  </button>
                </div>
              </div>
            </div>
            <label className="road-check">
              <input type="checkbox" checked={ownRoom} onChange={(event) => setOwnRoom(event.target.checked)} />
              <span>
                Own room for every adult
                <small>{money(quote.singleFee, currency)} a person when someone is not sharing. An odd number of adults already adds one single room.</small>
              </span>
            </label>
            {block ? <p className="road-warn">{block}</p> : null}
            {block && nextDate && mode === "group" ? (
              <button className="road-btn road-btn--ghost road-btn--small road-use" type="button" onClick={() => setDepartureId(nextDate.id)}>
                Use {nextDate.label} instead
              </button>
            ) : null}
            {childWarn ? <p className="road-warn is-gold">{childWarn}</p> : null}

            <dl className="road-receipt">
              <div>
                <dt>
                  {adults} × {money(quote.adult, currency)}
                </dt>
                <dd>{money(quote.adult * adults, currency)}</dd>
              </div>
              {children > 0 ? (
                <div>
                  <dt>
                    {children} × {money(quote.child, currency)} child
                  </dt>
                  <dd>{money(quote.child * children, currency)}</dd>
                </div>
              ) : null}
              {quote.singles > 0 ? (
                <div>
                  <dt>
                    {quote.singles} single {quote.singles === 1 ? "room" : "rooms"}
                  </dt>
                  <dd>{money(quote.singleFee * quote.singles, currency)}</dd>
                </div>
              ) : null}
              <div className="road-receipt-total">
                <dt>Total</dt>
                <dd>{money(quote.total, currency)}</dd>
              </div>
            </dl>
            <p className="road-fine">
              {cancelOpen
                ? `Cancel until ${longDate(cancelOn)}.`
                : "This date is inside the cancellation window. The desk confirms the refund."}{" "}
              A child is 5–11 and pays 65% of the adult rate. Nothing is charged now.
            </p>
            <button className="road-btn road-btn--block" type="button" disabled={Boolean(block)} onClick={openRequest} style={{ marginTop: 12 }}>
              Request this trip
            </button>
          </aside>
        </div>

        {tour.similar.length > 0 ? (
          <section className="road-similar" aria-label="Other tours">
            <h2>Other tours</h2>
            <div className="road-cards">
              {tour.similar.slice(0, 3).map((item) => (
                <Link className="road-card" href={item.href} key={item.href}>
                  {item.image ? <img src={item.image} alt="" /> : <img src="/img/tours/5.png" alt="" />}
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {[item.location, item.duration, item.price].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="road-footer">
          The price, seats, and dates on this page come from this tour. A request does not hold a seat or charge a card.
        </footer>
      </div>

      <button className="road-backdrop" type="button" aria-label="Close request" onClick={() => setSheet(false)} />
      <div className="road-dock">
        <div>
          <strong>{money(quote.total, currency)}</strong>
          <span>{sentence}</span>
        </div>
        <button className="road-btn" type="button" onClick={openBook}>
          Request
        </button>
      </div>

      <dialog
        className="road-light"
        id="road-light"
        aria-label="Photographs"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") stepPhoto(1);
          if (event.key === "ArrowLeft") stepPhoto(-1);
        }}
      >
        <button className="road-light-x" type="button" onClick={() => document.querySelector<HTMLDialogElement>("#road-light")?.close()}>
          Close
        </button>
        <button className="road-light-nav road-light-prev" type="button" aria-label="Previous photo" onClick={() => stepPhoto(-1)}>
          ‹
        </button>
        <figure>
          {photos[photoIndex] ? <img src={photos[photoIndex]} alt={`${tour.title} photograph ${photoIndex + 1}`} /> : null}
          <figcaption>
            {photos.length > 0 ? `${photoIndex + 1} of ${photos.length}` : ""}
          </figcaption>
        </figure>
        <button className="road-light-nav road-light-next" type="button" aria-label="Next photo" onClick={() => stepPhoto(1)}>
          ›
        </button>
      </dialog>

      <dialog className="road-dialog" id="road-reserve" aria-labelledby="road-reserve-title">
        {succeeded ? (
          <div className="road-success">
            <h2>Request received</h2>
            <p>
              {state.values?.name || customer?.name || "Your request"} for {sentence} is {money(quote.total, currency)}. Reference {state.reference}. Nothing is charged and no seat is held.
            </p>
            <div className="road-form-actions">
              <button className="road-btn" type="button" onClick={() => document.querySelector<HTMLDialogElement>("#road-reserve")?.close()}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form action={action}>
            <h2 id="road-reserve-title">Request this trip</h2>
            <p className="road-lede">
              {sentence}. Total {money(quote.total, currency)}.
            </p>
            <input type="hidden" name="tourSlug" value={tour.slug} />
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="startDate" value={startIso} />
            <input type="hidden" name="departureId" value={mode === "group" && departure ? departure.id : ""} />
            <input type="hidden" name="adults" value={String(adults)} />
            <input type="hidden" name="children" value={String(children)} />
            <input type="hidden" name="ownRoom" value={ownRoom ? "1" : "0"} />
            <label>
              Full name
              <input name="name" required minLength={2} autoComplete="name" defaultValue={customer?.name || state.values?.name || ""} />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" defaultValue={customer?.email || state.values?.email || ""} />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={customer?.phone || state.values?.phone || ""} />
            </label>
            <label>
              Anything the desk should know
              <textarea name="note" rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Arrival flight, a dietary need, a room request" />
            </label>
            {state.error ? <p className="road-error">{state.error}</p> : null}
            {state.fields?.name ? <p className="road-error">{state.fields.name}</p> : null}
            <div className="road-form-actions">
              <button className="road-btn road-btn--ghost" type="button" onClick={() => document.querySelector<HTMLDialogElement>("#road-reserve")?.close()}>
                Cancel
              </button>
              <button className="road-btn" type="submit" disabled={pending || Boolean(block)}>
                {pending ? "Sending…" : "Send request"}
              </button>
            </div>
          </form>
        )}
      </dialog>

      <div className={`road-toast${toast ? " is-on" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
