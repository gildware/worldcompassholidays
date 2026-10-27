"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { BusSearchBar } from "@/components/bus/BusSearchBar";
import { useLazySlice } from "@/hooks/useLazySlice";
import { arrivesNextDay, busCoachTypes, busTimeWindows, coachLabel, inTimeWindow, requestBusHref } from "@/lib/buses";
import type { BusListItem, BusQuery, BusSort } from "@/components/bus/query";
import { formatMoney } from "@/lib/format";
import "@/components/tour-list/catalog/tour-catalog.css";
import "@/styles/ask-request.css";
import "@/styles/listing-app.css";
import "@/styles/bus-desk.css";

const SORTS: { value: BusSort; label: string }[] = [
  { value: "depart", label: "Earliest departure" },
  { value: "fare", label: "Lowest fare" },
  { value: "short", label: "Shortest trip" },
  { value: "name", label: "Name" },
];

const COACHES = busCoachTypes.filter((option) => option.value !== "any");
const TIMES = busTimeWindows.filter((option) => option.value !== "any");

function toSearch(query: BusQuery) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.date) params.set("date", query.date);
  if (query.q) params.set("q", query.q);
  if (query.passengers !== 1) params.set("passengers", String(query.passengers));
  query.coach.forEach((value) => params.append("coach", value));
  query.time.forEach((value) => params.append("time", value));
  if (query.min != null) params.set("min", String(query.min));
  if (query.max != null) params.set("max", String(query.max));
  if (query.sort !== "depart") params.set("sort", query.sort);
  return params.toString();
}

function prettyDate(iso: string) {
  if (!iso) return "Any date";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "Any date";
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function whoLabel(count: number) {
  return count === 1 ? "1 passenger" : `${count} passengers`;
}

function departKey(time: string) {
  return /^\d{2}:\d{2}$/.test(time) ? time : "99:99";
}

function durationMinutes(value: string) {
  const hours = /(\d+)\s*h/i.exec(value);
  const mins = /(\d+)\s*m/i.exec(value);
  if (!hours && !mins) return Number.POSITIVE_INFINITY;
  return (hours ? Number(hours[1]) : 0) * 60 + (mins ? Number(mins[1]) : 0);
}

function includesCity(city: string, needle: string) {
  return city.toLowerCase().includes(needle.trim().toLowerCase());
}

function matches(route: BusListItem, query: BusQuery, ignore?: "coach" | "time" | "price") {
  if (query.from && !includesCity(route.fromCity, query.from)) return false;
  if (query.to && !includesCity(route.toCity, query.to)) return false;
  if (query.q) {
    const needle = query.q.trim().toLowerCase();
    const hay = [route.name, route.operator, route.fromCity, route.toCity, route.pickup, route.dropoff, coachLabel(route.coachType)]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (ignore !== "coach" && query.coach.length && !query.coach.includes(route.coachType)) return false;
  if (ignore !== "time" && query.time.length && !query.time.some((window) => inTimeWindow(route.departTime, window))) return false;
  if (ignore !== "price" && (query.min != null || query.max != null)) {
    if (!route.fareFrom) return false;
    if (query.min != null && route.fareFrom < query.min) return false;
    if (query.max != null && route.fareFrom > query.max) return false;
  }
  return true;
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function BusCatalog({ routes, initial }: { routes: BusListItem[]; initial: BusQuery }) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initial);
  const [qInput, setQInput] = useState(initial.q);
  const [menu, setMenu] = useState<null | "loc" | "dock" | "trip">(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const initialKey = JSON.stringify(initial);
  const initialRef = useRef(initial);
  initialRef.current = initial;

  const citiesFrom = useMemo(() => Array.from(new Set(routes.map((route) => route.fromCity))).sort((a, b) => a.localeCompare(b, "en")), [routes]);
  const citiesTo = useMemo(() => Array.from(new Set(routes.map((route) => route.toCity))).sort((a, b) => a.localeCompare(b, "en")), [routes]);
  const pricedFares = useMemo(() => routes.map((route) => route.fareFrom).filter((fare) => fare > 0), [routes]);
  const lo = pricedFares.length ? Math.min(...pricedFares) : 0;
  const hi = pricedFares.length ? Math.max(...pricedFares) : 0;
  const canPrice = hi > lo;
  const span = canPrice ? hi - lo : 1;
  const min = query.min == null ? lo : Math.min(Math.max(query.min, lo), hi);
  const max = query.max == null ? hi : Math.min(Math.max(query.max, lo), hi);
  const priced = query.min != null || query.max != null;
  const filtersOn = query.coach.length + query.time.length + (priced ? 1 : 0) + (query.q ? 1 : 0);

  const shown = useMemo(() => {
    const filtered = routes.filter((route) => matches(route, query));
    return filtered.sort((a, b) => {
      if (query.sort === "fare") {
        const diff = (a.fareFrom || Number.POSITIVE_INFINITY) - (b.fareFrom || Number.POSITIVE_INFINITY);
        if (diff !== 0) return diff;
      } else if (query.sort === "short") {
        const diff = durationMinutes(a.duration) - durationMinutes(b.duration);
        if (diff !== 0) return diff;
      } else if (query.sort === "name") {
        return a.name.localeCompare(b.name, "en");
      } else {
        const diff = departKey(a.departTime).localeCompare(departKey(b.departTime));
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name, "en");
    });
  }, [routes, query]);

  const windowKey = [
    query.q,
    query.from,
    query.to,
    query.sort,
    query.min,
    query.max,
    query.coach.join("\0"),
    query.time.join("\0"),
  ].join("|");
  const { visible, sentinelRef, hasMore } = useLazySlice(shown, windowKey);
  const corridors = useMemo(() => {
    const groups = new Map<string, BusListItem[]>();
    visible.forEach((route) => {
      const key = `${route.fromCity} → ${route.toCity}`;
      const list = groups.get(key);
      if (list) list.push(route);
      else groups.set(key, [route]);
    });
    return [...groups.entries()];
  }, [visible]);

  const placeLine = query.from && query.to ? `${query.from} to ${query.to}` : query.from ? `Leaving ${query.from}` : query.to ? `Arriving ${query.to}` : "Listed coaches";
  const mobileTitle = query.q.trim() && !query.from && !query.to ? query.q.trim() : placeLine === "Listed coaches" ? "All buses" : placeLine;
  const requestHref = requestBusHref({
    from: query.from,
    to: query.to,
    date: query.date,
    passengers: query.passengers,
    coach: query.coach.length === 1 ? query.coach[0] : undefined,
    time: query.time.length === 1 ? query.time[0] : undefined,
  });
  const bins = useMemo(() => priceBins(pricedFares, lo, hi), [pricedFares, lo, hi]);

  useEffect(() => {
    setQuery(initialRef.current);
    setQInput(initialRef.current.q);
  }, [initialKey]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qInput.trim().slice(0, 80);
      setQuery((current) => (current.q === next ? current : { ...current, q: next }));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [qInput]);

  useEffect(() => {
    const search = toSearch(query);
    const url = search ? `${pathname}?${search}` : pathname;
    if (url !== `${pathname}${window.location.search}`) history.replaceState(null, "", url);
  }, [pathname, query]);

  useEffect(() => {
    if (!menu) return;
    function close(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-picker]")) return;
      setMenu(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  useEffect(() => {
    if (!filtersOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  function onPrice(which: "min" | "max", value: number) {
    let low = which === "min" ? value : min;
    let high = which === "max" ? value : max;
    if (low > high) {
      if (which === "min") low = high;
      else high = low;
    }
    setQuery((current) => ({
      ...current,
      min: low <= lo ? null : low,
      max: high >= hi ? null : high,
    }));
  }

  function clearFilters() {
    setQInput("");
    setQuery((current) => ({ ...current, q: "", coach: [], time: [], min: null, max: null }));
  }

  function showAll() {
    setQInput("");
    setMenu(null);
    setQuery({ q: "", from: "", to: "", date: "", passengers: 1, coach: [], time: [], min: null, max: null, sort: "depart" });
  }

  function facet(kind: "coach" | "time", value: string) {
    return routes.filter((route) => {
      if (!matches(route, query, kind)) return false;
      if (kind === "coach") return route.coachType === value;
      return inTimeWindow(route.departTime, value);
    }).length;
  }

  return (
    <div className="bus-desk">
      <header className="bus-desk__top">
        <div className="bus-desk__bar">
          <BusSearchBar
            from={query.from}
            to={query.to}
            date={query.date}
            coach={query.coach[0] || "any"}
            passengers={String(query.passengers)}
            time={query.time[0] || "any"}
            citiesFrom={citiesFrom}
            citiesTo={citiesTo}
            onSearch={(next) =>
              setQuery((current) => ({
                ...current,
                from: next.from,
                to: next.to,
                date: next.date,
                passengers: Math.min(20, Math.max(1, Number(next.passengers) || 1)),
                coach: next.coach && next.coach !== "any" ? [next.coach] : [],
              }))
            }
          />
          <Link prefetch={false} className="bus-desk__ask" href={requestHref}>
            Request a bus
          </Link>
        </div>
      </header>

      <div className={`tour-catalog bus-app${filtersOpen ? " is-locked" : ""}`}>
        <div className="search-wrap">
          <div className="wrap">
            <div className="m-bar app-chrome-mobile" data-picker>
              <div className="m-bar__row">
                <button
                  className="m-bar__loc"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={menu === "loc"}
                  aria-label="From"
                  onClick={() => setMenu((current) => (current === "loc" ? null : "loc"))}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span>{query.from || "Anywhere"}</span>
                </button>
                <form
                  className="m-bar__form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const next = qInput.trim().slice(0, 80);
                    setQuery((current) => ({ ...current, q: next }));
                    setMenu(null);
                    document.getElementById("bus-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4 4" />
                  </svg>
                  <input
                    value={qInput}
                    onChange={(event) => {
                      setQInput(event.target.value);
                      setMenu(null);
                    }}
                    placeholder="Search buses"
                    aria-label="Search buses"
                    enterKeyHint="search"
                    autoComplete="off"
                  />
                </form>
              </div>
              <div className="m-bar__trip">
                <button
                  className="m-bar__meta"
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={menu === "trip"}
                  onClick={() => setMenu((current) => (current === "trip" ? null : "trip"))}
                >
                  {query.to || "Any city"} · {prettyDate(query.date)} · {whoLabel(query.passengers)}
                </button>
                <div className="m-bar__tools" aria-label="Listing actions">
                  <button
                    className="m-bar__filter"
                    type="button"
                    onClick={() => {
                      setMenu(null);
                      setFiltersOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                    Filters{filtersOn ? ` · ${filtersOn}` : ""}
                  </button>
                  <div className="m-bar__sort" data-picker>
                    <button
                      className="m-bar__sort-btn"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={menu === "dock"}
                      aria-label={`Sort: ${SORTS.find((item) => item.value === query.sort)?.label ?? "Earliest departure"}`}
                      onClick={() => setMenu((current) => (current === "dock" ? null : "dock"))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M7 6v12M7 18l-2.5-2.5M7 18l2.5-2.5M17 18V6M17 6l-2.5 2.5M17 6l2.5 2.5" />
                      </svg>
                      Sort
                    </button>
                    {menu === "dock" ? (
                      <div className="menu" role="listbox" aria-label="Sort buses">
                        {SORTS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            role="option"
                            aria-selected={query.sort === item.value}
                            className={query.sort === item.value ? "is-on" : undefined}
                            onClick={() => {
                              setQuery((current) => ({ ...current, sort: item.value }));
                              setMenu(null);
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {menu === "loc" ? (
                <div className="m-bar__menu" role="listbox" aria-label="From">
                  <button
                    type="button"
                    role="option"
                    aria-selected={!query.from}
                    className={!query.from ? "is-on" : undefined}
                    onClick={() => {
                      setQuery((current) => ({ ...current, from: "" }));
                      setMenu(null);
                    }}
                  >
                    Anywhere
                  </button>
                  {citiesFrom.map((city) => (
                    <button
                      key={city}
                      type="button"
                      role="option"
                      aria-selected={query.from === city}
                      className={query.from === city ? "is-on" : undefined}
                      onClick={() => {
                        setQuery((current) => ({ ...current, from: city }));
                        setMenu(null);
                        document.getElementById("bus-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="wrap">
          <div className="head">
            <h1>
              <span className="head__title">{mobileTitle}</span>
            </h1>
          </div>
          <Link prefetch={false} className="ask-request" href={requestHref}>
            <span>Need a coach that is not listed? Send the cities and date.</span>
            <strong>Request a bus</strong>
          </Link>
        </div>

        <aside className={`filters${filtersOpen ? " is-open" : ""}`} aria-label="Filters">
          <div className="filters__top">
            <h2>Filters</h2>
            <button className="textlink" type="button" onClick={clearFilters}>
              Clear
            </button>
            <button className="btn btn--ghost btn--small filters__close" type="button" onClick={() => setFiltersOpen(false)}>
              Close
            </button>
          </div>
          {canPrice ? (
            <fieldset>
              <legend>
                Fare <span>{priced ? `${formatMoney(min)} – ${formatMoney(max)}` : "Any fare"}</span>
              </legend>
              <div className="hist" role="group" aria-label="Fare distribution">
                {bins.map((bin) => {
                  const on = bin.end >= min - span / 16 && bin.start <= max + span / 16;
                  return (
                    <button
                      key={bin.start}
                      type="button"
                      className={on ? "is-in" : ""}
                      style={{ height: `${bin.height}%` }}
                      aria-label={`${bin.count} ${bin.count === 1 ? "bus" : "buses"} up to ${formatMoney(Math.round(bin.end))}`}
                      onClick={() => setQuery((current) => ({ ...current, min: null, max: bin.end >= hi ? null : Math.round(bin.end) }))}
                    />
                  );
                })}
              </div>
              <div className="range">
                <div className="range__track">
                  <div
                    className="range__fill"
                    style={{
                      left: `${((min - lo) / span) * 100}%`,
                      width: `${Math.max(0, ((max - min) / span) * 100)}%`,
                    }}
                  />
                </div>
                <input type="range" min={lo} max={hi} step={span > 500 ? 50 : 10} aria-label="Minimum fare" value={min} onChange={(event) => onPrice("min", Number(event.target.value))} />
                <input type="range" min={lo} max={hi} step={span > 500 ? 50 : 10} aria-label="Maximum fare" value={max} onChange={(event) => onPrice("max", Number(event.target.value))} />
              </div>
              <p className="hint">{priced ? `Listed fares in this band are ${formatMoney(min)} – ${formatMoney(max)}.` : "Drag either end. Fares are indicative."}</p>
            </fieldset>
          ) : null}
          <fieldset>
            <legend>Coach</legend>
            <div className="pills">
              {COACHES.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  count={facet("coach", option.value)}
                  checked={query.coach.includes(option.value)}
                  onChange={() => setQuery((current) => ({ ...current, coach: toggleValue(current.coach, option.value) }))}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Departs</legend>
            <div className="pills">
              {TIMES.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  count={facet("time", option.value)}
                  checked={query.time.includes(option.value)}
                  onChange={() => setQuery((current) => ({ ...current, time: toggleValue(current.time, option.value) }))}
                />
              ))}
            </div>
          </fieldset>
          <div className="sheet-apply">
            <button className="btn btn--block" type="button" onClick={() => setFiltersOpen(false)}>
              Show {shown.length} {shown.length === 1 ? "bus" : "buses"}
            </button>
          </div>
        </aside>
        {filtersOpen ? <button className="shade" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} /> : null}
        {menu === "trip" ? (
          <TripSheet
            query={query}
            citiesFrom={citiesFrom}
            citiesTo={citiesTo}
            onClose={() => setMenu(null)}
            onChange={(next) => setQuery((current) => ({ ...current, ...next }))}
          />
        ) : null}
        <p className="sr" aria-live="polite">
          {shown.length} {shown.length === 1 ? "bus" : "buses"}
        </p>
      </div>

      <main className="bus-desk__wrap">
        <div className="bus-desk__intro">
          <p className="bus-desk__kicker">Buses</p>
          <h1>{placeLine}</h1>
          <p className="bus-desk__promise">
            {shown.length} listed {shown.length === 1 ? "run" : "runs"}. Times and fares are indicative. Request a quote — nothing is held until you accept.
          </p>
        </div>
        <Link className="bus-desk__banner" href={requestHref}>
          <span>Need a coach that is not listed? Send the cities and date.</span>
          <strong>Request a bus</strong>
        </Link>

        <div className="bus-chips" aria-label="Filters">
          <button type="button" className={`bus-chip${query.coach.length === 0 ? " is-on" : ""}`} onClick={() => setQuery((current) => ({ ...current, coach: [] }))}>
            Any coach
          </button>
          {COACHES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`bus-chip${query.coach.includes(option.value) ? " is-on" : ""}`}
              onClick={() => setQuery((current) => ({ ...current, coach: toggleValue(current.coach, option.value) }))}
            >
              {option.label}
            </button>
          ))}
          <button type="button" className={`bus-chip${query.time.length === 0 ? " is-on" : ""}`} onClick={() => setQuery((current) => ({ ...current, time: [] }))}>
            Any time
          </button>
          {TIMES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`bus-chip${query.time.includes(option.value) ? " is-on" : ""}`}
              onClick={() => setQuery((current) => ({ ...current, time: toggleValue(current.time, option.value) }))}
            >
              {option.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="bus-empty" id="bus-results">
            <h2>No listed buses match this search</h2>
            <p>Try another city pair, or send a request with the date you need.</p>
            <div className="bus-empty__actions">
              <Link className="bus-btn" href={requestHref}>
                Request a bus
              </Link>
              <button className="bus-btn bus-btn--ghost" type="button" onClick={showAll}>
                Show all
              </button>
            </div>
          </div>
        ) : (
          <div className="bus-results" id="bus-results">
            {corridors.map(([key, group]) => (
              <section className="bus-corridor" key={key}>
                <div className="bus-corridor__head">
                  <h2>
                    {group[0].fromCity} to {group[0].toCity}
                  </h2>
                  <p>
                    {group.length} {group.length === 1 ? "coach" : "coaches"}
                  </p>
                </div>
                {group.map((route) => {
                  const href = `/buses/${route.slug}`;
                  const quoteHref = requestBusHref({
                    slug: route.slug,
                    from: route.fromCity,
                    to: route.toCity,
                    date: query.date,
                    passengers: query.passengers,
                    coach: route.coachType,
                    busName: route.name,
                  });
                  return (
                    <article className="bus-run-card" key={route.id}>
                      <Link prefetch={false} href={href} className="bus-hit" tabIndex={-1} aria-hidden="true" />
                      <Link prefetch={false} className="bus-run-card__shot" href={href} aria-label={`Photos of ${route.name}`}>
                        {route.imageUrl ? <img src={route.imageUrl} alt="" width={640} height={420} /> : null}
                        <span className="bus-run-card__stamp">{coachLabel(route.coachType)}</span>
                      </Link>
                      <div className="bus-run-card__main">
                        <p className="bus-run-card__op">{route.operator || "Listed coach"}</p>
                        <p className="bus-m-kicker">
                          {coachLabel(route.coachType)} · {route.fromCity} to {route.toCity}
                        </p>
                        <h3>
                          <Link prefetch={false} href={href}>
                            {route.name}
                          </Link>
                        </h3>
                        <div className="bus-line">
                          <div>
                            <strong>{route.departTime || "—"}</strong>
                            <span>{route.pickup || route.fromCity}</span>
                          </div>
                          <em>{route.duration || "On road"}</em>
                          <div>
                            <strong>
                              {route.arriveTime || "—"}
                              {arrivesNextDay(route.departTime, route.arriveTime) ? " · next day" : ""}
                            </strong>
                            <span>{route.dropoff || route.toCity}</span>
                          </div>
                        </div>
                        <ul className="bus-m-facts" aria-label="Bus details">
                          {route.departTime ? (
                            <li>
                              <span>{route.departTime}</span>
                            </li>
                          ) : null}
                          {route.duration ? (
                            <li>
                              <span>
                                {route.duration}
                                {arrivesNextDay(route.departTime, route.arriveTime) ? " · next day" : ""}
                              </span>
                            </li>
                          ) : null}
                        </ul>
                        {route.amenities.length ? (
                          <div className="bus-run-card__meta">
                            {route.amenities.slice(0, 4).map((name) => (
                              <span className="bus-tag" key={name}>
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="bus-run-card__pay">
                        <div>
                          <b className={route.fareFrom ? undefined : "is-ask"}>{route.fareFrom ? formatMoney(route.fareFrom) : "On request"}</b>
                          <small>Indicative fare</small>
                        </div>
                        <Link prefetch={false} className="bus-btn" href={href}>
                          See this run
                        </Link>
                        <Link prefetch={false} className="bus-btn bus-btn--ghost" href={quoteHref}>
                          Request this bus
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            ))}
            {hasMore ? <div ref={sentinelRef} className="bus-results__more" aria-hidden="true" /> : null}
          </div>
        )}
      </main>
    </div>
  );
}

function Pill({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  if (count === 0 && !checked) return null;
  return (
    <label className="pill">
      {label} <span className="n">{count}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function priceBins(fares: number[], lo: number, hi: number) {
  if (hi <= lo) return [];
  const span = hi - lo;
  const buckets = Array.from({ length: 8 }, () => 0);
  fares.forEach((fare) => {
    const index = Math.min(7, Math.floor(((fare - lo) / span) * 8));
    buckets[index] += 1;
  });
  const peak = Math.max(1, ...buckets);
  return buckets.map((count, index) => ({
    start: lo + (span * index) / 8,
    end: lo + (span * (index + 1)) / 8,
    count,
    height: Math.max(12, (count / peak) * 100),
  }));
}

function dayIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function TripSheet({
  query,
  citiesFrom,
  citiesTo,
  onClose,
  onChange,
}: {
  query: BusQuery;
  citiesFrom: string[];
  citiesTo: string[];
  onClose: () => void;
  onChange: (next: Partial<BusQuery>) => void;
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const selected = query.date ? parseDay(query.date) : today;
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [leg, setLeg] = useState<"from" | "to">(query.from ? "to" : "from");
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + daysInMonth }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previousBlocked = new Date(year, month, 0) < today;
  const cities = leg === "from" ? citiesFrom : citiesTo;
  const picked = leg === "from" ? query.from : query.to;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const panel = (
    <>
      <button type="button" className="m-cal-backdrop" aria-label="Close trip details" onClick={onClose} data-picker />
      <div className="m-cal-sheet is-sheet is-trip" role="dialog" aria-modal="true" aria-label="Route, date, and passengers" data-picker>
        <div className="m-cal-sheet__grab" aria-hidden />
        <p className="m-cal-sheet__title">Route &amp; date</p>
        <div className="m-trip__body">
          <div className="m-trip__tabs">
            <button type="button" className={leg === "from" ? "is-on" : undefined} onClick={() => setLeg("from")}>
              <span>From</span>
              <strong>{query.from || "Anywhere"}</strong>
            </button>
            <button type="button" className={leg === "to" ? "is-on" : undefined} onClick={() => setLeg("to")}>
              <span>To</span>
              <strong>{query.to || "Any city"}</strong>
            </button>
          </div>
          <div className="bus-trip__cities" role="listbox" aria-label={leg === "from" ? "From" : "To"}>
            <button
              type="button"
              className={!picked ? "is-on" : undefined}
              onClick={() => onChange(leg === "from" ? { from: "" } : { to: "" })}
            >
              {leg === "from" ? "Anywhere" : "Any city"}
            </button>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                className={picked === city ? "is-on" : undefined}
                onClick={() => onChange(leg === "from" ? { from: city } : { to: city })}
              >
                {city}
              </button>
            ))}
          </div>
          <div className="cal__head">
            <button type="button" aria-label="Previous month" disabled={previousBlocked} onClick={() => setCursor(new Date(year, month - 1, 1))}>
              ‹
            </button>
            <strong>{title}</strong>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>
              ›
            </button>
          </div>
          <div className="cal__grid" role="grid">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span className="cal__dow" key={day}>
                {day}
              </span>
            ))}
            {days.map((day, index) => {
              if (day == null) return <span key={`empty-${index}`} />;
              const next = new Date(year, month, day);
              const iso = dayIso(next);
              const disabled = next < today;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  className={iso === query.date ? "is-on" : undefined}
                  aria-label={prettyDate(iso)}
                  aria-pressed={iso === query.date}
                  onClick={() => onChange({ date: iso })}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <button className="textlink bus-trip__clear" type="button" onClick={() => onChange({ date: "" })}>
            Any date
          </button>
          <div className="m-trip__guests">
            <p className="m-trip__label">Passengers</p>
            <div className="m-trip__row">
              <span>
                Travelers <small>Seats on the request</small>
              </span>
              <span className="m-trip__step">
                <button type="button" aria-label="Fewer passengers" disabled={query.passengers <= 1} onClick={() => onChange({ passengers: Math.max(1, query.passengers - 1) })}>
                  −
                </button>
                <b>{query.passengers}</b>
                <button type="button" aria-label="More passengers" disabled={query.passengers >= 20} onClick={() => onChange({ passengers: Math.min(20, query.passengers + 1) })}>
                  +
                </button>
              </span>
            </div>
          </div>
        </div>
        <div className="m-trip__foot">
          <button type="button" className="m-cal-sheet__done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}
