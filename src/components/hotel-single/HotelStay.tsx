"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { submitHotelRequest } from "@/actions/hotel-request";
import type { HotelSingleData } from "@/components/hotel-single/types";
import { StayMark } from "@/components/hotel-single/StayMark";
import { initialFormState } from "@/lib/forms";
import { formatMoney } from "@/lib/format";
import { plainText } from "@/lib/seo";
import "@/styles/hotel-stay.css";

type Guest = { name: string; email: string; phone: string } | null;

function money(amount: number, currency: string) {
  return formatMoney(Math.round(amount), currency);
}

function parseISO(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function iso(date: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pretty(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function rangeLabel(start: Date, end: Date) {
  const short = { day: "numeric", month: "short" } as const;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.toLocaleDateString("en-GB", short)}`;
  }
  return `${start.toLocaleDateString("en-GB", short)} – ${end.toLocaleDateString("en-GB", short)}`;
}

function starValue(stars: number) {
  if (stars >= 5) return "5";
  if (stars >= 4) return "4";
  if (stars >= 3) return "3";
  return "any";
}

function chunks<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export function HotelStay({
  hotel,
  customer,
  defaultCheckIn,
  defaultCheckOut,
  defaultAdults = 2,
  defaultChildren = 0,
  defaultRooms = 1,
  taxEnabled = false,
}: {
  hotel: HotelSingleData;
  customer: Guest;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultAdults?: number;
  defaultChildren?: number;
  defaultRooms?: number;
  taxEnabled?: boolean;
}) {
  const rooms = hotel.rooms.length > 0 ? hotel.rooms : [];
  const currency = rooms[0]?.currency || "INR";
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [adults, setAdults] = useState(defaultAdults);
  const [children, setChildren] = useState(defaultChildren);
  const [roomQty, setRoomQty] = useState(defaultRooms);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [listHref, setListHref] = useState("/hotels");
  const [note, setNote] = useState("");
  const [sheet, setSheet] = useState(false);
  const [roomSlide, setRoomSlide] = useState<Record<string, number>>({});
  const [viewer, setViewer] = useState<{ images: string[]; index: number; label: string } | null>(null);
  const [state, action, pending] = useActionState(submitHotelRequest, initialFormState);
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];

  const photos = useMemo(() => (hotel.images.length > 0 ? hotel.images : ["/img/general/map.svg"]), [hotel.images]);
  const visible = photos.slice(0, 5);
  const amenityGroups = chunks(hotel.amenities, 6);
  const shownAmenities = amenityGroups.slice(0, 4);
  const extraAmenities = amenityGroups.slice(4);

  useEffect(() => {
    document.body.classList.toggle("stay-sheet", sheet);
    return () => document.body.classList.remove("stay-sheet");
  }, [sheet]);

  useEffect(() => {
    try {
      const query = sessionStorage.getItem("wch-list-query");
      if (query) setListHref(`/hotels?${query}`);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".stay-links a")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href") || ""))
      .filter((section): section is Element => Boolean(section));
    if (!("IntersectionObserver" in window)) return;
    const watcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((link) => link.classList.toggle("is-on", link.getAttribute("href") === id));
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((section) => watcher.observe(section));
    return () => watcher.disconnect();
  }, [hotel.slug]);

  const today = startOfDay(new Date());
  let arrival = parseISO(checkIn);
  if (Number.isNaN(arrival.getTime()) || arrival < today) arrival = today;
  let departure = parseISO(checkOut);
  if (Number.isNaN(departure.getTime()) || departure <= arrival) departure = addDays(arrival, 1);
  const nights = Math.max(1, Math.round((departure.getTime() - arrival.getTime()) / 86400000));
  const cap = Math.max(1, room?.quantity ?? 1);
  const qty = Math.min(roomQty, cap);
  const nightly = room ? room.price : 0;
  const roomSum = nightly * nights * qty;
  const gst = taxEnabled && currency === "INR" ? Math.round(roomSum * 0.18) : 0;
  const stayTotal = roomSum + gst;
  const people = adults + children;
  const sleeps = (room?.occupancy || 2) * qty;
  const guests = [`${adults} adult${adults > 1 ? "s" : ""}`];
  if (children) guests.push(`${children} ${children > 1 ? "children" : "child"}`);
  const roomBit = room ? (qty > 1 ? `${qty} × ${room.name}` : room.name) : hotel.name;
  const sentence = `${guests.join(", ")} · ${rangeLabel(arrival, departure)} · ${nights} night${nights > 1 ? "s" : ""} · ${roomBit}`;
  const cancelText = hotel.cancellation || "The house confirms the cancellation terms with your request.";
  const requestMessage = [
    room ? `Room: ${room.name}` : "",
    `Quoted total: ${money(stayTotal, currency)} for ${nights} night${nights > 1 ? "s" : ""}${gst ? ", GST included" : ""}`,
    note.trim() ? `Note: ${note.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  function openBook() {
    if (window.matchMedia("(max-width: 980px)").matches) setSheet(true);
    else document.getElementById("stay-checkin")?.focus();
  }

  function openPhotos(images: string[], index: number, label: string) {
    setViewer({ images, index, label });
    document.querySelector<HTMLDialogElement>("#stay-light")?.showModal();
  }

  function stepPhoto(direction: number) {
    setViewer((current) => {
      if (!current || current.images.length === 0) return current;
      const index = (current.index + direction + current.images.length) % current.images.length;
      return { ...current, index };
    });
  }

  function stepRoom(id: string, total: number, direction: number) {
    setRoomSlide((current) => {
      const index = current[id] ?? 0;
      return { ...current, [id]: (index + direction + total) % total };
    });
  }

  const stars = hotel.stars > 0 ? "★".repeat(Math.min(5, hotel.stars)) : "";
  const place = hotel.address || hotel.location;
  const lat = Number(hotel.mapLat);
  const lng = Number(hotel.mapLng);
  const hasMap = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${lng - 0.03},${lat - 0.02},${lng + 0.03},${lat + 0.02}`)}&layer=mapnik&marker=${lat}%2C${lng}`
    : "";
  const summary = plainText(hotel.summary);
  const description = plainText(hotel.description);
  const more = description && description !== summary ? hotel.description : "";
  const breakfast = rooms.some((item) => /breakfast|half board|full board/i.test(item.meal));
  const highlights = [
    hotel.roomCount > 0 ? { title: `${hotel.roomCount} ${hotel.roomCount === 1 ? "room" : "rooms"}`, text: hotel.propertyType || "Stay" } : null,
    breakfast ? { title: "Breakfast on these rates", text: "Included with the rooms that say so below." } : null,
    hotel.cancellation ? { title: "Cancellation", text: hotel.cancellation } : null,
  ].filter((item): item is { title: string; text: string } => Boolean(item));
  const facts = [
    hotel.checkIn ? { title: "Check-in", text: hotel.checkIn } : null,
    hotel.checkOut ? { title: "Check-out", text: hotel.checkOut } : null,
    hotel.cancellation ? { title: "Cancellation", text: hotel.cancellation } : null,
    hotel.houseRules ? { title: "House rules", text: hotel.houseRules } : null,
    { title: "Payment", text: "This request holds nothing. You pay only after you accept a stay." },
  ].filter((item): item is { title: string; text: string } => Boolean(item));
  const succeeded = Boolean(state.success && state.reference);

  return (
    <div className="stay">
      <a className="stay-skip" href="#overview">
        Skip to stay details
      </a>
      <div className="stay-wrap">
        <nav className="stay-crumb" aria-label="Breadcrumb">
          <Link href={listHref}>Hotels</Link>
          <span aria-hidden="true">/</span>
          {hotel.location ? (
            <>
              <Link href={hotel.destinationHref || "/hotels"}>{hotel.location}</Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span>{hotel.name}</span>
        </nav>

        <div className="stay-hero">
          <div>
            {hotel.scoreLabel ? <p className="stay-eyebrow">{hotel.scoreLabel}</p> : null}
            <h1>{hotel.name}</h1>
            <p className="stay-place">
              {stars ? (
                <span className="stay-stars" aria-label={`${hotel.stars} star stay`}>
                  <span className="stay-stars-n">{hotel.stars}</span>
                  {stars}
                </span>
              ) : null}
              {place ? <a href="#location">{place}</a> : null}
              {hotel.propertyType ? <span>{hotel.propertyType}</span> : null}
            </p>
          </div>
          {hotel.stars > 0 ? (
            <button className="stay-score" type="button" onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}>
              <b>{hotel.stars.toFixed(1)}</b>
              <span>
                <strong>{hotel.scoreLabel || "Star rating"}</strong>
                <span>Property rating</span>
              </span>
            </button>
          ) : null}
        </div>

        <div className={`stay-gallery stay-gallery--${visible.length}`} aria-label={`Photographs of ${hotel.name}`}>
          {visible.map((src, index) => (
            <button
              key={`${src}-${index}`}
              className={index === 0 ? "stay-shot stay-g1" : "stay-shot"}
              type="button"
              onClick={() => openPhotos(photos, index, hotel.name)}
            >
              <img src={src} alt={`${hotel.name} photograph ${index + 1}`} />
            </button>
          ))}
          {photos.length > 1 ? (
            <button className="stay-all" type="button" onClick={() => openPhotos(photos, 0, hotel.name)}>
              View all {photos.length} photos
            </button>
          ) : null}
        </div>
      </div>

      <nav className="stay-subnav" aria-label="On this page">
        <div className="stay-wrap stay-subnav-in">
          <div className="stay-links">
            <a href="#overview">Overview</a>
            <a href="#rooms">Rooms</a>
            {hotel.amenities.length > 0 ? <a href="#amenities">Amenities</a> : null}
            <a href="#location">Location</a>
            {hotel.stars > 0 ? <a href="#reviews">Rating</a> : null}
            <a href="#policies">Policies</a>
          </div>
          <div className="stay-subnav-cta">
            <span className="stay-subnav-total">{money(stayTotal, currency)}</span>
            <button className="stay-btn stay-btn--small" type="button" onClick={openBook}>
              Reserve
            </button>
          </div>
        </div>
      </nav>

      <div className="stay-wrap stay-layout">
        <main>
          <section className="stay-block" id="overview">
            <h2>{summary ? "The stay" : hotel.name}</h2>
            {summary ? <p className="stay-lede">{summary}</p> : null}
            {more ? <div className="stay-prose" dangerouslySetInnerHTML={{ __html: more }} /> : null}
            {highlights.length > 0 ? (
              <div className="stay-highlights">
                {highlights.map((item) => (
                  <article className="stay-highlight" key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="stay-block" id="rooms">
            <h2>Rooms for these dates</h2>
            {room ? null : <p className="stay-lede">Rooms for this stay are confirmed when you send a request.</p>}
            {rooms.map((item) => {
              const selected = item.id === room?.id;
              const itemNightly = item.price;
              const ticks = [...item.features];
              if (item.meal && item.meal !== "Room only") ticks.unshift(item.meal);
              const shownTicks = ticks.slice(0, 4);
              const slides = item.images.length > 0 ? item.images : [item.image];
              const slide = roomSlide[item.id] ?? 0;
              return (
                <article className={selected ? "stay-room is-on" : "stay-room"} key={item.id}>
                  <div className="stay-room-slides">
                    <button className="stay-room-shot" type="button" onClick={() => openPhotos(slides, slide, item.name)} aria-label={`View ${item.name} photos`}>
                      <img src={slides[slide] || slides[0]} alt="" />
                    </button>
                    {slides.length > 1 ? (
                      <div className="stay-room-film">
                        <button type="button" aria-label="Previous room photo" onClick={() => stepRoom(item.id, slides.length, -1)}>
                          ‹
                        </button>
                        <span>
                          {slide + 1} / {slides.length}
                        </span>
                        <button type="button" aria-label="Next room photo" onClick={() => stepRoom(item.id, slides.length, 1)}>
                          ›
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <div className="stay-room-top">
                      <h3>{item.name}</h3>
                      <button
                        className={selected ? "stay-btn stay-btn--small" : "stay-btn stay-btn--ghost stay-btn--small"}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setRoomId(item.id);
                          setRoomQty(1);
                        }}
                      >
                        {selected ? "Selected" : "Select"}
                      </button>
                    </div>
                    <p className="stay-meta">
                      {[`Sleeps ${item.occupancy}`, item.bedLabel, item.sizeSqm ? `${item.sizeSqm} m²` : "", item.quantity > 0 ? `${item.quantity} available` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.summary ? <p className="stay-meta">{item.summary}</p> : null}
                    <p className="stay-room-price">
                      {money(itemNightly, item.currency)} <small>a night</small>
                    </p>
                    <p className="stay-for">
                      {money(itemNightly * nights, item.currency)} for {nights} night{nights > 1 ? "s" : ""}
                    </p>
                    <p className="stay-cancel">{cancelText}</p>
                    {shownTicks.length > 0 ? (
                      <ul className="stay-ticks">
                        {shownTicks.map((tick) => (
                          <li key={tick}>
                            <StayMark name={tick} />
                            <span>{tick}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>

          {hotel.amenities.length > 0 ? (
            <section className="stay-block" id="amenities">
              <h2>What is in the house</h2>
              <div className="stay-amenities">
                {shownAmenities.map((group, index) => (
                  <article className="stay-amenity" key={group.join("-")}>
                    <h3>{shownAmenities.length === 1 ? "Facilities" : `Facilities ${index + 1}`}</h3>
                    <ul>
                      {group.map((item) => (
                        <li key={item}>
                          <StayMark name={item} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              {extraAmenities.length > 0 ? (
                <>
                  <input className="stay-more" type="checkbox" id="stay-amenities-more" tabIndex={-1} />
                  <div className="stay-extra stay-amenities">
                    {extraAmenities.map((group, index) => (
                      <article className="stay-amenity" key={group.join("-")}>
                        <h3>Also included {index + 1}</h3>
                        <ul>
                          {group.map((item) => (
                            <li key={item}>
                              <StayMark name={item} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                  <label className="stay-textbtn" htmlFor="stay-amenities-more">
                    <span className="stay-when-closed">Show {extraAmenities.reduce((sum, group) => sum + group.length, 0)} more</span>
                    <span className="stay-when-open">Show fewer</span>
                  </label>
                </>
              ) : null}
            </section>
          ) : null}

          <section className="stay-block" id="location">
            <h2>Where you will be</h2>
            {place ? <p className="stay-lede">{place}{hotel.location && hotel.address ? ` · ${hotel.location}` : ""}</p> : null}
            <div className="stay-loc">
              {mapSrc ? (
                <iframe className="stay-map" title={`Map showing ${hotel.name}`} loading="lazy" src={mapSrc} />
              ) : (
                <div className="stay-map" />
              )}
              <ul className="stay-dist">
                {hotel.address ? (
                  <li>
                    <StayMark name="Address" />
                    <span>Address</span>
                    <b>{hotel.address}</b>
                  </li>
                ) : null}
                {hotel.location ? (
                  <li>
                    <StayMark name="Area" />
                    <span>Area</span>
                    <b>{hotel.location}</b>
                  </li>
                ) : null}
                {hotel.checkIn ? (
                  <li>
                    <StayMark name="Check-in" />
                    <span>Check-in</span>
                    <b>{hotel.checkIn}</b>
                  </li>
                ) : null}
                {hotel.checkOut ? (
                  <li>
                    <StayMark name="Check-out" />
                    <span>Check-out</span>
                    <b>{hotel.checkOut}</b>
                  </li>
                ) : null}
              </ul>
            </div>
            {hasMap ? (
              <a className="stay-maplink" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`} target="_blank" rel="noopener noreferrer">
                Open the map
              </a>
            ) : hotel.mapUrl ? (
              <a className="stay-maplink" href={hotel.mapUrl} target="_blank" rel="noopener noreferrer">
                Open the map
              </a>
            ) : null}
          </section>

          {hotel.stars > 0 ? (
            <section className="stay-block" id="reviews">
              <h2>The rating</h2>
              <p className="stay-lede">
                {hotel.stars.toFixed(1)} out of 5. {hotel.scoreLabel || "Rated by the property listing."} Guest stories are added when people have stayed.
              </p>
            </section>
          ) : null}

          <section className="stay-block" id="policies">
            <h2>Before you arrive</h2>
            <div className="stay-facts">
              {facts.map((item) => (
                <div key={item.title}>
                  <StayMark name={item.title} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
            {hotel.faqs.length > 0 ? (
              <>
                <h2 className="stay-ask">Questions guests actually ask</h2>
                {hotel.faqs.map((item) => (
                  <details className="stay-faq" key={item.title}>
                    <summary>{item.title}</summary>
                    {item.content ? <p>{plainText(item.content)}</p> : null}
                  </details>
                ))}
              </>
            ) : null}
          </section>
        </main>

        <aside className="stay-book" id="stay-book" aria-label="Price and request">
          <div className="stay-handle" aria-hidden="true" />
          <button className="stay-close stay-btn stay-btn--ghost stay-btn--small" type="button" onClick={() => setSheet(false)}>
            Close
          </button>
          <p className="stay-price">{money(stayTotal, currency)}</p>
          <p className="stay-sub">
            {money(nightly, currency)} a night · {nights} night{nights > 1 ? "s" : ""}
          </p>
          <p className="stay-sentence">{sentence}</p>
          <p>
            <a className="stay-change" href="#rooms" onClick={() => setSheet(false)}>
              Change room
            </a>
          </p>
          <div className="stay-dates">
            <label className="stay-field">
              Check-in
              <input id="stay-checkin" type="date" value={iso(arrival)} min={iso(today)} onChange={(event) => setCheckIn(event.target.value)} />
            </label>
            <label className="stay-field">
              Check-out
              <input type="date" value={iso(departure)} min={iso(addDays(arrival, 1))} onChange={(event) => setCheckOut(event.target.value)} />
            </label>
          </div>
          <div className="stay-guests">
            <div className="stay-guest">
              <span>Adults</span>
              <div className="stay-step">
                <button type="button" aria-label="Fewer adults" disabled={adults <= 1} onClick={() => setAdults((value) => value - 1)}>−</button>
                <b>{adults}</b>
                <button type="button" aria-label="More adults" disabled={adults >= 8} onClick={() => setAdults((value) => value + 1)}>+</button>
              </div>
            </div>
            <div className="stay-guest">
              <span>Children</span>
              <div className="stay-step">
                <button type="button" aria-label="Fewer children" disabled={children <= 0} onClick={() => setChildren((value) => value - 1)}>−</button>
                <b>{children}</b>
                <button type="button" aria-label="More children" disabled={children >= 6} onClick={() => setChildren((value) => value + 1)}>+</button>
              </div>
            </div>
            <div className="stay-guest">
              <span>Rooms</span>
              <div className="stay-step">
                <button type="button" aria-label="Fewer rooms" disabled={qty <= 1} onClick={() => setRoomQty((value) => value - 1)}>−</button>
                <b>{qty}</b>
                <button type="button" aria-label="More rooms" disabled={qty >= cap} onClick={() => setRoomQty((value) => value + 1)}>+</button>
              </div>
            </div>
          </div>
          <p className="stay-warn" hidden={people <= sleeps}>
            This selection sleeps {sleeps}. You have {people} guests — add a room, or choose one that sleeps more.
          </p>
          <dl className="stay-receipt">
            <div>
              <dt>{room ? `${room.name} · ${nights} night${nights > 1 ? "s" : ""}${qty > 1 ? ` · ${qty} rooms` : ""}` : "Stay"}</dt>
              <dd>{money(roomSum, currency)}</dd>
            </div>
            {gst ? (
              <div>
                <dt>GST 18%</dt>
                <dd>{money(gst, currency)}</dd>
              </div>
            ) : null}
            <div className="stay-receipt-total">
              <dt>Total</dt>
              <dd>{money(stayTotal, currency)}</dd>
            </div>
          </dl>
          <button
            className="stay-btn stay-btn--block"
            type="button"
            onClick={() => {
              setSheet(false);
              document.querySelector<HTMLDialogElement>("#stay-reserve")?.showModal();
            }}
          >
            Request this stay
          </button>
          <p className="stay-fine">{gst ? "GST is included. " : ""}Price is for the rooms, not per guest. The house confirms the request before anything is held or charged.</p>
        </aside>
      </div>

      {hotel.similar.length > 0 ? (
        <div className="stay-wrap stay-similar">
          <h2>Other stays</h2>
          <div className="stay-cards">
            {hotel.similar.slice(0, 3).map((item) => (
              <Link className="stay-card" href={`/hotels/${item.slug}`} key={item.id}>
                <img src={item.image} alt="" />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {[item.location, item.priceLabel ? `from ${item.priceLabel} a night` : "", item.score ? item.score : ""].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <footer className="stay-footer">
        <div className="stay-wrap">
          {hotel.name}
          {hotel.location ? ` · ${hotel.location}` : ""}. A request on this page is sent to World Compass Holidays. Nothing is charged here.
        </div>
      </footer>

      <button className="stay-backdrop" type="button" aria-label="Close booking panel" onClick={() => setSheet(false)} />
      <div className="stay-dock">
        <div>
          <strong>{money(stayTotal, currency)}</strong>
          <span>
            {nights} night{nights > 1 ? "s" : ""}
          </span>
        </div>
        <button className="stay-btn" type="button" onClick={openBook}>
          View deal
        </button>
      </div>
      <p className="stay-sr" aria-live="polite">{money(stayTotal, currency)}</p>

      <dialog
        className="stay-light"
        id="stay-light"
        aria-label="Photographs"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") stepPhoto(1);
          if (event.key === "ArrowLeft") stepPhoto(-1);
        }}
      >
        <button className="stay-light-x" type="button" onClick={() => document.querySelector<HTMLDialogElement>("#stay-light")?.close()}>
          Close
        </button>
        <button className="stay-light-nav stay-light-prev" type="button" aria-label="Previous photo" onClick={() => stepPhoto(-1)}>
          ‹
        </button>
        <figure>
          <img src={viewer?.images[viewer.index]} alt={`${viewer?.label || hotel.name} photograph ${(viewer?.index ?? 0) + 1}`} />
          <figcaption>
            {viewer ? `${viewer.index + 1} of ${viewer.images.length}` : ""}
          </figcaption>
        </figure>
        <button className="stay-light-nav stay-light-next" type="button" aria-label="Next photo" onClick={() => stepPhoto(1)}>
          ›
        </button>
      </dialog>

      <dialog className="stay-reserve" id="stay-reserve" aria-labelledby="stay-reserve-title">
        {succeeded ? (
          <div className="stay-success">
            <h2>Request received</h2>
            <p>
              {state.values?.name || customer?.name || "Your request"} for {sentence} is {money(stayTotal, currency)}. Reference {state.reference}. Nothing is charged until you accept a stay.
            </p>
            <div className="stay-form-actions">
              <button className="stay-btn" type="button" onClick={() => document.querySelector<HTMLDialogElement>("#stay-reserve")?.close()}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form action={action} className={state.error ? "was-validated" : undefined}>
            <h2 id="stay-reserve-title">Request this stay</h2>
            <p className="stay-lede">
              {sentence}. Total {money(stayTotal, currency)}.
            </p>
            <input type="hidden" name="surface" value="stay" />
            <input type="hidden" name="destination" value={hotel.location || hotel.address || hotel.name} />
            <input type="hidden" name="hotelName" value={hotel.name} />
            <input type="hidden" name="checkIn" value={iso(arrival)} />
            <input type="hidden" name="checkOut" value={iso(departure)} />
            <input type="hidden" name="adults" value={String(adults)} />
            <input type="hidden" name="children" value={String(children)} />
            <input type="hidden" name="rooms" value={String(qty)} />
            <input type="hidden" name="stars" value={starValue(hotel.stars)} />
            <input type="hidden" name="budget" value={nightly >= 500 ? String(Math.round(nightly)) : ""} />
            <input type="hidden" name="message" value={requestMessage} />
            <label>
              Full name
              <input name="name" required minLength={2} autoComplete="name" defaultValue={customer?.name || ""} />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" defaultValue={customer?.email || ""} />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={customer?.phone || ""} />
            </label>
            <label>
              Anything the house should know
              <textarea rows={3} placeholder="Arrival time, a quiet room, a birthday" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            {state.error ? <p className="stay-error">{state.error}</p> : null}
            <div className="stay-form-actions">
              <button className="stay-btn stay-btn--ghost" type="button" onClick={() => document.querySelector<HTMLDialogElement>("#stay-reserve")?.close()}>
                Cancel
              </button>
              <button className="stay-btn" type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send request"}
              </button>
            </div>
            <p className="stay-fine">Nothing is charged from this form.</p>
          </form>
        )}
      </dialog>
    </div>
  );
}
