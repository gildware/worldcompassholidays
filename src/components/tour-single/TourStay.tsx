"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { FirebaseOptions } from "firebase/app";
import { submitTourRequest } from "@/actions/tour-request";
import { RequestPhoneVerify } from "@/components/auth/RequestPhoneVerify";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { usePhotoSwipe } from "@/hooks/usePhotoSwipe";
import { useSectionTabs } from "@/hooks/useSectionTabs";
import { canonicalPhone, formatPhone } from "@/lib/auth/phone";
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
  morning?: string;
  afternoon?: string;
  evening?: string;
  imageUrl: string;
};

export type TourStayListItem = {
  title: string;
  iconUrl: string;
  content?: string;
};

export type TourStayData = {
  id: string;
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
  defaultState: "always" | "dates";
  availabilityFrom: string | null;
  availabilityTo: string | null;
  images: string[];
  summary: string;
  description: string;
  includes: TourStayListItem[];
  excludes: TourStayListItem[];
  beforeYouGo: TourStayListItem[];
  facilities: TourStayListItem[];
  styles: TourStayListItem[];
  categoryIconUrl: string;
  languages: string[];
  faqs: { title: string; content: string; iconUrl?: string }[];
  days: TourStayDay[];
  departures: TourStayDeparture[];
  address: string;
  map: { lat: number; lng: number } | null;
  similar: { href: string; title: string; location: string; duration: string; price: string; image: string }[];
};

type Guest = { name: string; email: string; phone: string } | null;

function money(amount: number, currency: string) {
  return formatMoney(Math.round(amount), currency);
}

function paceLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
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

function beats(day: TourStayDay) {
  const periods = [
    { when: "Morning", text: (day.morning ?? "").trim() },
    { when: "Afternoon", text: (day.afternoon ?? "").trim() },
    { when: "Evening", text: (day.evening ?? "").trim() },
  ].filter((period) => period.text);
  if (periods.length > 0) return periods;

  const clean = plainText(day.description);
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
  return [{ when: "The day", text: clean || "Details for this day are shared when your trip is confirmed." }];
}

const ICON = "/uploads/catalog/icons";
const DEFAULT_FAQ_ICON = `${ICON}/message-circle-question.svg`;
const DEFAULT_OK_ICON = `${ICON}/circle-help.svg`;

const FAQ_ICON_BY_TITLE: Record<string, string> = {
  "Which hotels are used on this package?": `${ICON}/hotel.svg`,
  "How much should I budget for local extras?": `${ICON}/wallet.svg`,
  "When can this be cancelled?": `${ICON}/calendar-x.svg`,
  "Is a seat held when I send this?": `${ICON}/credit-card.svg`,
};

function CatalogIcon({
  url,
  title,
  tone,
}: {
  url: string;
  title: string;
  tone: "ok" | "no";
}) {
  const src = url || (tone === "ok" ? DEFAULT_OK_ICON : "");
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="road-list-icon" src={src} alt="" />
    );
  }
  return (
    <span className={`road-list-fallback road-list-fallback--${tone}`} aria-hidden="true">
      {tone === "ok" ? "✓" : "–"}
    </span>
  );
}

function FaqIcon({ url, title }: { url?: string; title: string }) {
  const src = url || FAQ_ICON_BY_TITLE[title] || DEFAULT_FAQ_ICON;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="road-list-icon" src={src} alt="" />
  );
}

function CardIcon({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="road-card-icon" src={src} alt="" />
  );
}

export function TourStay({
  tour,
  customer,
  saved = false,
  firebaseConfig = null,
  defaultCountry = "IN",
}: {
  tour: TourStayData;
  customer: Guest;
  saved?: boolean;
  firebaseConfig?: FirebaseOptions | null;
  defaultCountry?: string;
}) {
  const currency = tour.currency || "INR";
  const photos = tour.images.length > 0 ? tour.images : [];
  const visible = photos.slice(0, 5);
  const signedIn = Boolean(customer);
  const loginHref = `/login?next=${encodeURIComponent(`/tours/${tour.slug}`)}`;
  const formRef = useRef<HTMLFormElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLElement>(null);
  const verifiedRef = useRef(Boolean(customer));
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [mode, setMode] = useState<"group" | "private">("group");
  const [departureId, setDepartureId] = useState(
    tour.defaultState === "dates" && !tour.availabilityFrom
      ? (tour.departures[0]?.id ?? "")
      : "",
  );
  const [groupDate, setGroupDate] = useState(
    tour.availabilityFrom
      ? tour.availabilityFrom > todayIso()
        ? tour.availabilityFrom
        : todayIso()
      : tour.defaultState === "dates" && tour.departures[0]?.iso
        ? tour.departures[0].iso
        : addDays(todayIso(), 21),
  );
  const [privateDate, setPrivateDate] = useState(
    tour.availabilityFrom
      ? tour.availabilityFrom > todayIso()
        ? tour.availabilityFrom
        : todayIso()
      : tour.departures[0]?.iso || addDays(todayIso(), 28),
  );
  const [adults, setAdults] = useState(Math.max(2, tour.minPeople || 1));
  const [children, setChildren] = useState(0);
  const [ownRoom, setOwnRoom] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const [listHref, setListHref] = useState("/tours");
  const [state, action, pending] = useActionState(submitTourRequest, initialFormState);

  const departure =
    tour.departures.find((item) => item.id === departureId) ??
    tour.departures.find((item) => item.iso === groupDate) ??
    null;
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
  const outOfRange =
    tour.defaultState === "dates" &&
    (tour.availabilityFrom && tour.availabilityTo
      ? startIso < tour.availabilityFrom || startIso > tour.availabilityTo
      : !(mode === "group" && departure && departure.iso === startIso));
  const block = outOfRange
    ? "Choose a start date within the availability range."
    : startIso
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
  const childWarn = !block && children > adults ? "More children than adults — we'll check this works for your party." : "";
  const rateLabel = mode === "private" ? "private rate" : "listed rate";
  const sentence = `${adults} ${adults === 1 ? "adult" : "adults"}${children ? ` · ${children} ${children === 1 ? "child" : "children"}` : ""} · ${rateLabel} · ${shortDate(startIso)}${quote.seasonName ? ` · ${quote.seasonName}` : ""}`;
  const cancelOn = startIso ? addDays(startIso, -tour.cancelDays) : "";
  const cancelOpen = Boolean(cancelOn && cancelOn >= todayIso());
  const succeeded = Boolean(state.success && state.reference);
  const summary = plainText(tour.summary);
  const description = plainText(tour.description);
  const hasListedDepartures = tour.defaultState === "dates" && tour.departures.length > 0 && !tour.availabilityFrom;
  const hasSeasonWindow = tour.defaultState === "dates" && Boolean(tour.availabilityFrom && tour.availabilityTo);
  const showDepartures = hasListedDepartures || hasSeasonWindow;
  const showTrip =
    Boolean(tour.category) || tour.styles.length > 0 || tour.facilities.length > 0 || tour.languages.length > 0;
  useEffect(() => {
    document.body.classList.toggle("road-sheet", sheet);
    return () => document.body.classList.remove("road-sheet");
  }, [sheet]);

  useEffect(() => {
    try {
      const query = sessionStorage.getItem("wch-tour-list-query");
      if (query) setListHref(`/tours?${query}`);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* Keep the booking card fixed under the tabs — never let CSS sticky shove it upward at FAQ. */
  useEffect(() => {
    const aside = asideRef.current;
    const book = bookRef.current;
    if (!aside || !book) return;

    const mq = window.matchMedia("(min-width: 1025px)");
    let frame = 0;
    let topPx = 146;

    const clearPin = () => {
      book.classList.remove("is-pinned");
      book.style.removeProperty("left");
      book.style.removeProperty("width");
      aside.style.removeProperty("height");
    };

    const readTop = () => {
      const topRaw = getComputedStyle(book).getPropertyValue("--road-book-top").trim() || "146px";
      const probe = document.createElement("div");
      probe.style.cssText = `position:fixed;top:${topRaw};visibility:hidden;pointer-events:none`;
      document.body.appendChild(probe);
      topPx = probe.getBoundingClientRect().top || 146;
      probe.remove();
    };

    const update = () => {
      frame = 0;
      if (!mq.matches) {
        clearPin();
        return;
      }

      aside.style.height = `${book.offsetHeight}px`;
      const rect = aside.getBoundingClientRect();

      if (rect.top <= topPx) {
        book.classList.add("is-pinned");
        book.style.left = `${Math.round(rect.left)}px`;
        book.style.width = `${Math.round(rect.width)}px`;
      } else {
        book.classList.remove("is-pinned");
        book.style.removeProperty("left");
        book.style.removeProperty("width");
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      readTop();
      onScroll();
    };

    readTop();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onResize);
      if (frame) window.cancelAnimationFrame(frame);
      clearPin();
    };
  }, []);

  const { isActive, selectHref } = useSectionTabs(".road-sub a", [tour.slug, tour.days.length]);
  const tab = (href: string, label: string) => (
    <a
      href={href}
      className={isActive(href) ? "is-on" : undefined}
      aria-current={isActive(href) ? "true" : undefined}
      onClick={(event) => selectHref(href, event)}
    >
      {label}
    </a>
  );

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

  const heroSwipe = usePhotoSwipe({
    enabled: photos.length > 1,
    ignore: ".road-gallery-m__thumbs",
    onStep: (direction) => {
      setGalleryIndex((index) => (index + direction + photos.length) % photos.length);
    },
  });

  const lightSwipe = usePhotoSwipe({
    enabled: photos.length > 1,
    ignore: "button",
    onStep: (direction) => stepPhoto(direction),
  });

  const hasMap = Boolean(tour.map && Number.isFinite(tour.map.lat) && Number.isFinite(tour.map.lng));
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${tour.map!.lng - 0.04},${tour.map!.lat - 0.03},${tour.map!.lng + 0.04},${tour.map!.lat + 0.03}`)}&layer=mapnik&marker=${tour.map!.lat}%2C${tour.map!.lng}`
    : "";
  const includes =
    tour.includes.length > 0
      ? tour.includes
      : [
          {
            title: "Transport, guiding, and the inclusions listed for this package.",
            iconUrl: "",
          },
        ];
  const excludes =
    tour.excludes.length > 0
      ? tour.excludes
      : [
          {
            title: "Personal expenses, travel insurance, and anything not listed as included.",
            iconUrl: "",
          },
        ];
  const faqs = [
    ...tour.faqs,
    {
      title: "When can this be cancelled?",
      content: cancelOpen
        ? `Free cancellation until ${longDate(cancelOn)}.`
        : `This start date falls inside the ${tour.cancelDays}-day cancellation window. We'll confirm what can still be refunded.`,
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
      <header className="road-topbar">
        <Link href={listHref} className="road-topbar__back" aria-label="Back to tours">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <div className="road-topbar__title">
          <p>Tour</p>
          <strong>{tour.title}</strong>
        </div>
        {signedIn ? (
          <button className="road-btn road-btn--small road-topbar__book" type="button" onClick={openBook}>
            Request tour
          </button>
        ) : (
          <Link className="road-btn road-btn--small road-topbar__book" href={loginHref}>
            Request tour
          </Link>
        )}
      </header>
      <div className="road-wrap">
        <nav className="road-crumb" aria-label="Breadcrumb">
          <Link href={listHref}>Tours</Link>
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
          <p className="road-eyebrow road-eyebrow--with-icon">
            {tour.categoryIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="road-cat-icon" src={tour.categoryIconUrl} alt="" />
            ) : null}
            <span>{[tour.category, tour.durationLabel].filter(Boolean).join(" · ") || "Tour"}</span>
          </p>
          <h1>{tour.title}</h1>
          <div className="road-hero__meta">
            <p className="road-place">
              {tour.location ? <a href="#meeting">{tour.location}</a> : null}
              {tour.difficulty ? <span>{paceLabel(tour.difficulty)}</span> : null}
              <span>{money(tour.priceFrom, currency)} a person</span>
            </p>
            <FavoriteButton
              kind="tour"
              itemId={tour.id}
              initialSaved={saved}
              signedIn={signedIn}
              title={tour.title}
              variant="icon"
              className="fav-btn--plain"
            />
          </div>
        </div>

        {visible.length > 0 ? (
          <>
            <div className={`road-gallery road-gallery--desk road-gallery--${visible.length}`} aria-label={`Photographs of ${tour.title}`}>
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
            <div className="road-gallery-m" aria-label={`Photographs of ${tour.title}`}>
              <button
                className="road-gallery-m__hero"
                type="button"
                onPointerDown={heroSwipe.onPointerDown}
                onPointerUp={heroSwipe.onPointerUp}
                onPointerCancel={heroSwipe.onPointerCancel}
                onClick={() => {
                  if (heroSwipe.didSwipe()) return;
                  openPhotos(galleryIndex);
                }}
                aria-label={`Open photograph ${galleryIndex + 1} of ${photos.length}`}
              >
                <img src={photos[galleryIndex] || photos[0]} alt={`${tour.title} photograph ${galleryIndex + 1}`} draggable={false} />
                {photos.length > 1 ? (
                  <span className="road-gallery-m__count">
                    {galleryIndex + 1} / {photos.length}
                  </span>
                ) : null}
              </button>
              {photos.length > 1 ? (
                <div className="road-gallery-m__thumbs" role="list">
                  {photos.map((src, index) => (
                    <button
                      key={`m-${src}-${index}`}
                      type="button"
                      role="listitem"
                      className={index === galleryIndex ? "is-on" : undefined}
                      aria-label={`Photograph ${index + 1}`}
                      aria-current={index === galleryIndex ? "true" : undefined}
                      onClick={() => setGalleryIndex(index)}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <nav className="road-sub" aria-label="On this page" data-section-tabs>
          {tab("#overview", "Overview")}
          {showDepartures ? tab("#departures", "Departures") : null}
          {tour.days.length > 0 ? tab("#itinerary", "Itinerary") : null}
          {tab("#included", "Included")}
          {tab("#excluded", "Excluded")}
          {tour.beforeYouGo.length > 0 ? tab("#before", "Before you go") : null}
          {faqs.length > 0 ? tab("#faq", "FAQ") : null}
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
                  <b className="road-stat__title">
                    <CardIcon src={`${ICON}/calendar-clock.svg`} />
                    {tour.durationLabel || `${tour.durationDays} days`}
                  </b>
                  <span>Duration</span>
                </div>
                <div className="road-stat">
                  <b className="road-stat__title">
                    <CardIcon src={`${ICON}/users-round.svg`} />
                    {tour.maxGroupSize > 0 ? `Up to ${tour.maxGroupSize}` : "Small group"}
                  </b>
                  <span>Travelers</span>
                </div>
                <div className="road-stat">
                  <b className="road-stat__title">
                    <CardIcon src={`${ICON}/mountain-snow.svg`} />
                    {tour.difficulty ? paceLabel(tour.difficulty) : "Steady"}
                  </b>
                  <span>Pace</span>
                </div>
                <div className="road-stat">
                  <b className="road-stat__title">
                    <CardIcon src={`${ICON}/receipt-indian-rupee.svg`} />
                    {money(tour.priceFrom, currency)}
                  </b>
                  <span>From</span>
                </div>
              </div>
              <div className="road-hi">
                <article>
                  <h3>
                    <CardIcon src={`${ICON}/wallet.svg`} />
                    <span>Package price</span>
                  </h3>
                  <p>
                    From {money(tour.priceFrom, currency)} a person twin share
                    {tour.minPeople > 1 ? ` (min. ${tour.minPeople})` : ""}. Party total updates in the booking card.
                  </p>
                </article>
                <article>
                  <h3>
                    <CardIcon src={`${ICON}/calendar-x.svg`} />
                    <span>Cancellation</span>
                  </h3>
                  <p>
                    {cancelOpen
                      ? `Free cancellation until ${longDate(cancelOn)}.`
                      : `Free cancellation ends ${tour.cancelDays} days before departure. This date is already inside that window.`}
                  </p>
                </article>
                <article>
                  <h3>
                    <CardIcon src={mode === "private" ? `${ICON}/user-round.svg` : `${ICON}/users.svg`} />
                    <span>{mode === "private" ? "Private rate" : "Listed rate"}</span>
                  </h3>
                  <p>
                    {mode === "private"
                      ? "Dedicated private departure from about 1.46× the listed twin-share rate, then adjusted for the season."
                      : hasListedDepartures
                        ? "Listed twin-share price on an open start date. Your party still travels in its own vehicle unless the itinerary says otherwise."
                        : "Listed twin-share price. Your party keeps its own cab when the package includes a private vehicle."}
                  </p>
                </article>
                <article>
                  <h3>
                    <CardIcon src={`${ICON}/car-front.svg`} />
                    <span>{tour.days.length > 0 ? `${tour.days.length}-day itinerary` : "Itinerary on request"}</span>
                  </h3>
                  <p>
                    {tour.days.length > 0
                      ? `${tour.days.length} days planned end to end — open Itinerary for places, drive times, and overnight towns.`
                      : "We'll share the full day-by-day plan when we confirm your request."}
                  </p>
                </article>
              </div>
            </section>

            {showDepartures ? (
              <section className="road-section" id="departures">
                <h2>Departures</h2>
                {hasListedDepartures && mode === "group" ? (
                  <>
                    <p className="road-lede">
                      {tour.departures.length} open start {tour.departures.length === 1 ? "date" : "dates"} at the listed rate
                      {departure ? ` · selected ${departure.label}` : ""}.
                    </p>
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
                              <small>{item.seats > 0 ? `${item.seats} seats left` : "Open departure"}</small>
                            </span>
                            <em>{money(shown, currency)}</em>
                          </button>
                        );
                      })}
                    </div>
                    <p className="road-lede">Need a different day? Switch to Private in the booking card.</p>
                  </>
                ) : hasListedDepartures && mode === "private" ? (
                  <p className="road-lede">
                    Private start — choose any date in the booking card. Switch back to Listed rate to use an open departure
                    {tour.departures.length > 0 ? ` (${tour.departures.length} available)` : ""}.
                  </p>
                ) : (
                  <p className="road-lede">
                    Start dates from {longDate(tour.availabilityFrom!)} through {longDate(tour.availabilityTo!)}. Choose yours in
                    the booking card.
                  </p>
                )}
              </section>
            ) : null}

            {tour.days.length > 0 ? (
              <section className="road-section" id="itinerary">
                <h2>Itinerary</h2>
                <p className="road-lede">
                  Day-by-day plan for this {tour.durationLabel || `${tour.durationDays}-day`} trip. Open a day for places, drive
                  times, and overnight towns.
                </p>
                {tour.days.map((day, index) => (
                  <details className="road-day" key={`${day.dayNumber}-${day.title}`} open={index === 0}>
                    <summary>
                      <span className="road-day-title">
                        <strong>Day {day.dayNumber}</strong>
                        {day.title ? <span className="road-day-name">{day.title}</span> : null}
                      </span>
                    </summary>
                    <div className={`road-day-body${day.imageUrl ? " has-photo" : ""}`}>
                      {day.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="road-day-img" src={day.imageUrl} alt="" />
                      ) : null}
                      <div className="road-day-copy">
                        {beats(day).map((beat) => (
                          <p className="road-beat" key={beat.when}>
                            <strong>{beat.when}</strong>
                            {beat.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </section>
            ) : null}

            <section className="road-section road-section--included" id="included">
              <h2>Included</h2>
              <p className="road-lede">Covered in the package price.</p>
              <div className="road-panel road-panel--included">
                <ul className="road-ok">
                  {includes.map((item) => (
                    <li key={item.title}>
                      <CatalogIcon url={item.iconUrl} title={item.title} tone="ok" />
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="road-section road-section--excluded" id="excluded">
              <h2>Excluded</h2>
              <p className="road-lede">Paid separately or not part of this package.</p>
              <div className="road-panel road-panel--excluded">
                <ul className="road-no">
                  {excludes.map((item) => (
                    <li key={item.title}>
                      <CatalogIcon url={item.iconUrl} title={item.title} tone="no" />
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {showTrip ? (
              <section className="road-section" id="trip">
                <h2>The trip</h2>
                <p className="road-lede">
                  {[
                    tour.category ? `${tour.category} trip` : "",
                    tour.styles.length > 0 ? "travel style" : "",
                    tour.facilities.length > 0 ? "practical touches on the road" : "",
                    tour.languages.length > 0 ? `guided in ${tour.languages.join(", ")}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")
                    .replace(/^./, (ch) => ch.toUpperCase())}
                  .
                </p>
                {tour.styles.length > 0 ? (
                  <div className="road-styles" aria-label="Travel styles">
                    {tour.styles.map((item) => (
                      <span className="road-style-chip" key={item.title}>
                        {item.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.iconUrl} alt="" />
                        ) : null}
                        {item.title}
                      </span>
                    ))}
                  </div>
                ) : null}
                {tour.facilities.length > 0 ? (
                  <div className="road-styles" aria-label="Facilities">
                    {tour.facilities.map((item) => (
                      <span className="road-style-chip" key={item.title}>
                        {item.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.iconUrl} alt="" />
                        ) : null}
                        {item.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="road-section" id="meeting">
              <h2>Meeting</h2>
              <p className="road-lede">Where day 1 begins.</p>
              <p className="road-lede">
                {tour.address
                  ? tour.address
                  : tour.location
                    ? `We'll share the exact meeting point in ${tour.location} when your trip is confirmed.`
                    : "We'll share the exact meeting point when your trip is confirmed."}
              </p>
              {hasMap ? <iframe className="road-map" title={`Map for ${tour.title}`} src={mapSrc} loading="lazy" /> : null}
            </section>

            {tour.beforeYouGo.length > 0 ? (
              <section className="road-section" id="before">
                <h2>Before you go</h2>
                <p className="road-lede">Practical prep for day one — fitness, documents, kit, and arrival.</p>
                <div className="road-facts">
                  {tour.beforeYouGo.map((item) => (
                    <div key={item.title}>
                      <strong className="road-facts__title">
                        <CatalogIcon url={item.iconUrl} title={item.title} tone="ok" />
                        <span>{item.title}</span>
                      </strong>
                      {item.content ? <span>{plainText(item.content)}</span> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {faqs.length > 0 ? (
              <section className="road-section" id="faq">
                <h2>FAQ</h2>
                <p className="road-lede">Questions people ask before they request.</p>
                {faqs.map((item) => (
                  <details className="road-faq" key={item.title}>
                    <summary>
                      <span className="road-faq__title">
                        <FaqIcon url={item.iconUrl} title={item.title} />
                        <span>{item.title}</span>
                      </span>
                    </summary>
                    <p>{plainText(item.content)}</p>
                  </details>
                ))}
              </section>
            ) : null}

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
          </div>

          <div className="road-aside" ref={asideRef}>
          <aside className="road-book" id="book" ref={bookRef} aria-label="Request this tour">
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

            <div className="road-segment" role="group" aria-label="Listed rate or private rate">
              <button className={mode === "group" ? "is-on" : ""} type="button" onClick={() => setMode("group")}>
                Listed rate
              </button>
              <button className={mode === "private" ? "is-on" : ""} type="button" onClick={() => setMode("private")}>
                Private rate
              </button>
            </div>
            <p className="road-fine">
              {mode === "private"
                ? "Private rate is a dedicated departure from about 1.46× the listed twin-share price."
                : "Listed rate is twin share. Your party still uses its own cab when the package includes a private vehicle."}
            </p>
            {mode === "group" && tour.defaultState === "dates" && departure && !tour.availabilityFrom ? (
              <p className="road-kicker">Starts {departure.label}. {departure.seats > 0 ? `${departure.seats} seats left on this departure.` : "Seats confirmed when you book."}</p>
            ) : (
              <label className="road-field">
                {mode === "private" ? "Private start date" : "Start date"}
                <input
                  type="date"
                  min={tour.defaultState === "dates" && tour.availabilityFrom
                    ? (tour.availabilityFrom > todayIso() ? tour.availabilityFrom : todayIso())
                    : todayIso()}
                  max={tour.defaultState === "dates" ? tour.availabilityTo ?? undefined : undefined}
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
                ? `Free cancellation until ${longDate(cancelOn)}.`
                : "This date is inside the cancellation window — we'll confirm any refund."}{" "}
              A child is 5–11 and pays 65% of the adult rate. Nothing is charged now.
            </p>
            <button className="road-btn road-btn--block" type="button" disabled={Boolean(block)} onClick={openRequest} style={{ marginTop: 12 }}>
              Request this trip
            </button>
          </aside>
          </div>
        </div>

        <footer className="road-footer">
          Prices and dates are for this tour. A request does not hold a seat or charge your card.
        </footer>
      </div>

      <button className="road-backdrop" type="button" aria-label="Close request" onClick={() => setSheet(false)} />
      <div className="road-dock">
        <div>
          <strong>{money(quote.total, currency)}</strong>
          <span>{sentence}</span>
        </div>
        {signedIn ? (
          <button className="road-btn" type="button" onClick={openBook}>
            Request tour
          </button>
        ) : (
          <Link className="road-btn" href={loginHref}>
            Request tour
          </Link>
        )}
      </div>

      <dialog
        className="road-light"
        id="road-light"
        aria-label="Photographs"
        onPointerDown={lightSwipe.onPointerDown}
        onPointerUp={lightSwipe.onPointerUp}
        onPointerCancel={lightSwipe.onPointerCancel}
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
          {photos[photoIndex] ? <img src={photos[photoIndex]} alt={`${tour.title} photograph ${photoIndex + 1}`} draggable={false} /> : null}
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
              <a className="road-btn" href="/tours">
                Explore more
              </a>
              <a className="road-btn" href={`/account/bookings/${state.reference}`}>
                View booking
              </a>
            </div>
          </div>
        ) : (
          <form
            ref={formRef}
            action={action}
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              if (customer || verifiedRef.current) return;
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const name = String(data.get("name") || "").trim();
              const phone = String(data.get("phone") || "").trim();
              setGuestName(name);
              setGuestPhone(phone);
              if (name.length < 2 || !canonicalPhone(phone)) return;
              setVerifyOpen(true);
            }}
          >
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
            {customer ? (
              <>
                <div className="road-guest">
                  <strong>{customer.name}</strong>
                  <span>
                    {customer.phone
                      ? formatPhone(customer.phone) || customer.phone
                      : customer.email}
                  </span>
                </div>
                <input type="hidden" name="name" value={customer.name} />
                <input type="hidden" name="email" value={customer.email} />
                {customer.phone ? <input type="hidden" name="phone" value={customer.phone} /> : null}
                {!customer.phone ? (
                  <label>
                    Phone
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      defaultValue={state.values?.phone || ""}
                      placeholder="+91"
                    />
                  </label>
                ) : null}
              </>
            ) : (
              <>
                <label>
                  Full name
                  <input name="name" required minLength={2} autoComplete="name" defaultValue={state.values?.name || guestName} />
                </label>
                <label>
                  Contact number
                  <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={state.values?.phone || guestPhone} placeholder="+91 98765 43210" />
                </label>
                <p className="road-lede">We’ll text a verification code to this number when you send the request.</p>
              </>
            )}
            <label>
              Notes for your trip
              <textarea name="note" rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Arrival flight, dietary needs, room preferences…" />
            </label>
            {state.error ? <p className="road-error">{state.error}</p> : null}
            {state.fields?.name ? <p className="road-error">{state.fields.name}</p> : null}
            {state.fields?.phone ? <p className="road-error">{state.fields.phone}</p> : null}
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
      <RequestPhoneVerify
        open={verifyOpen}
        name={guestName}
        phone={guestPhone}
        config={firebaseConfig}
        defaultCountry={defaultCountry}
        onClose={() => setVerifyOpen(false)}
        onVerified={({ name: verifiedName, phone: verifiedPhone }) => {
          verifiedRef.current = true;
          setGuestName(verifiedName);
          setGuestPhone(formatPhone(verifiedPhone) || verifiedPhone);
          setVerifyOpen(false);
          window.setTimeout(() => formRef.current?.requestSubmit(), 0);
        }}
      />

      <div className={`road-toast${toast ? " is-on" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
