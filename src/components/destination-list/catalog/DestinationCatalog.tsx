"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { useLazySlice } from "@/hooks/useLazySlice";
import type { DestinationListCard, DestinationSort } from "@/components/destination-list/types";
import {
  SORT_LABELS,
  activeCount,
  catalogSearch,
  clearQuery,
  facetCount,
  listingLine,
  matches,
  placeOptions,
  uniqueValues,
  type DestCatalogQuery,
} from "@/components/destination-list/catalog/logic";
import "@/components/tour-list/catalog/tour-catalog.css";
import "@/components/destination-list/catalog/destination-catalog.css";
import "@/styles/listing-app.css";

const SORTS: DestinationSort[] = ["recommended", "name", "country"];

export function DestinationCatalog({
  destinations,
  initial,
}: {
  destinations: DestinationListCard[];
  initial: DestCatalogQuery;
}) {
  const pathname = usePathname();
  const initialKey = JSON.stringify(initial);
  const [query, setQuery] = useState(initial);
  const [qInput, setQInput] = useState(initial.q);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<null | "where" | "country" | "region" | "loc" | "sort" | "dock" | "trip">(null);
  const resultsRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const countries = useMemo(() => uniqueValues(destinations, "country"), [destinations]);
  const regions = useMemo(() => uniqueValues(destinations, "region", query.country), [destinations, query.country]);
  const whereOptions = useMemo(() => placeOptions(destinations), [destinations]);

  const rows = useMemo(
    () =>
      destinations
        .filter((item) => matches(item, query))
        .sort((a, b) => {
          if (query.sort === "name") return a.name.localeCompare(b.name, "en");
          if (query.sort === "country") {
            return a.country.localeCompare(b.country, "en") || a.name.localeCompare(b.name, "en");
          }
          return Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name, "en");
        }),
    [destinations, query],
  );

  const windowKey = useMemo(
    () =>
      [
        query.q,
        query.country,
        query.region,
        query.sort,
        query.view,
        query.popular,
        query.hasTours,
        query.hasHotels,
        query.hasRentals,
      ].join("|"),
    [query],
  );
  const { visible: slice, sentinelRef, hasMore } = useLazySlice(rows, windowKey);
  const filtersOn = activeCount(query);
  const noun = rows.length === 1 ? "destination" : "destinations";
  const where = query.q.trim() ? ` matching “${query.q.trim()}”` : "";
  const title =
    query.region && query.country
      ? `${query.region}, ${query.country}`
      : query.country || query.region || query.q.trim() || "All destinations";

  const metaLine = [query.country, query.region].filter(Boolean).join(" · ") || "Any country or region";

  useEffect(() => {
    setQuery(initial);
    setQInput(initial.q);
  }, [initialKey, initial]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qInput.trim().slice(0, 80);
      setQuery((current) => (current.q === next ? current : { ...current, q: next }));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [qInput]);

  useEffect(() => {
    const search = catalogSearch(query);
    const url = search ? `${pathname}?${search}` : pathname;
    if (url !== `${pathname}${window.location.search}`) history.replaceState(null, "", url);
  }, [pathname, query]);

  useEffect(() => {
    const title = `${rows.length} ${noun} · World Compass Holidays`;
    if (document.title !== title) document.title = title;
  }, [noun, rows.length]);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-picker]")) return;
      setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    const timer = window.setTimeout(() => document.addEventListener("pointerdown", onPointer), 0);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (menu === "where") searchRef.current?.focus();
  }, [menu]);

  useEffect(() => {
    if (query.region && !regions.includes(query.region)) {
      setQuery((current) => ({ ...current, region: "" }));
    }
  }, [query.region, regions]);

  function scrollResults() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function applySearch() {
    const next = qInput.trim().slice(0, 80);
    setQuery((current) => ({ ...current, q: next }));
    setSearchOpen(false);
    setMenu(null);
    scrollResults();
  }

  return (
    <div className="tour-catalog dest-catalog">
      <a className="skip" href="#results">
        Skip to destinations
      </a>
      <div className="bar">
        <button
          className="btn btn--ghost btn--small"
          type="button"
          onClick={async () => {
            const search = catalogSearch(query);
            const url = `${window.location.origin}${pathname}${search ? `?${search}` : ""}`;
            try {
              await navigator.clipboard.writeText(url);
            } catch {
              /* ignore */
            }
          }}
        >
          Share <span>link</span>
        </button>
      </div>

      <div className="search-wrap">
        <div className="wrap">
          <button
            className="search-summary"
            type="button"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((open) => !open);
              window.setTimeout(() => searchRef.current?.focus(), 0);
            }}
          >
            <strong>{query.q.trim() || title}</strong>
            <span>{metaLine}</span>
          </button>

          <div className="m-bar app-chrome-mobile" data-picker>
            <div className="m-bar__row">
              <button
                className="m-bar__loc"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu === "loc"}
                aria-label="Place"
                onClick={() => setMenu((current) => (current === "loc" ? null : "loc"))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{whereOptions.includes(query.q.trim()) ? query.q.trim() : query.q.trim() || "Anywhere"}</span>
              </button>
              <form
                className="m-bar__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  applySearch();
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
                  placeholder="Search destinations"
                  aria-label="Search destinations"
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
                {metaLine}
              </button>
              <div className="m-bar__tools" aria-label="Listing actions">
                <div className="m-bar__sort" data-picker>
                  <button
                    className="m-bar__sort-btn"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={menu === "dock"}
                    aria-label={`Sort: ${SORT_LABELS[query.sort]}`}
                    onClick={() => setMenu((current) => (current === "dock" ? null : "dock"))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M7 6v12M7 18l-2.5-2.5M7 18l2.5-2.5M17 18V6M17 6l-2.5 2.5M17 6l2.5 2.5" />
                    </svg>
                    Sort
                  </button>
                  {menu === "dock" ? (
                    <SortMenu value={query.sort} onPick={(sort) => { setQuery((current) => ({ ...current, sort })); setMenu(null); }} />
                  ) : null}
                </div>
              </div>
            </div>
            {menu === "loc" ? (
              <MobileLocMenu
                options={whereOptions}
                current={query.q.trim()}
                onPick={(name) => {
                  setQInput(name);
                  setQuery((current) => ({ ...current, q: name }));
                  setMenu(null);
                  scrollResults();
                }}
                onClear={() => {
                  setQInput("");
                  setQuery((current) => ({ ...current, q: "" }));
                  setMenu(null);
                }}
              />
            ) : null}
            {menu === "trip" ? (
              <TripSheet
                countries={countries}
                regions={regions}
                country={query.country}
                region={query.region}
                onClose={() => setMenu(null)}
                onChange={(next) => {
                  setQuery((current) => {
                    const country = next.country !== undefined ? next.country : current.country;
                    const region =
                      next.country !== undefined && next.country !== current.country
                        ? ""
                        : next.region !== undefined
                          ? next.region
                          : current.region;
                    return { ...current, country, region };
                  });
                }}
              />
            ) : null}
          </div>

          <form
            className={`search${searchOpen ? " is-open" : ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              applySearch();
            }}
          >
            <div className="field" data-picker>
              <button
                className="who-btn"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu === "where"}
                aria-label="Where or name"
                onClick={() => setMenu((current) => (current === "where" ? null : "where"))}
              >
                <span className="k">Where</span>
                <strong>{query.q.trim() || "Anywhere"}</strong>
              </button>
              {menu === "where" ? (
                <WhereMenu inputRef={searchRef} value={qInput} places={whereOptions} onChange={setQInput} onPick={(value) => {
                  const next = value.trim().slice(0, 80);
                  setQInput(next);
                  setQuery((current) => ({ ...current, q: next }));
                  setMenu(null);
                }} />
              ) : null}
            </div>
            <div className="field" data-picker>
              <button
                className="who-btn"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu === "country"}
                aria-label="Country"
                onClick={() => setMenu((current) => (current === "country" ? null : "country"))}
              >
                <span className="k">Country</span>
                <strong>{query.country || "Any country"}</strong>
              </button>
              {menu === "country" ? (
                <PickMenu
                  label="Country"
                  options={countries}
                  current={query.country}
                  onPick={(value) => {
                    setQuery((current) => ({ ...current, country: value, region: "" }));
                    setMenu(null);
                  }}
                  anyLabel="Any country"
                />
              ) : null}
            </div>
            <div className="field" data-picker>
              <button
                className="who-btn"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu === "region"}
                aria-label="Region"
                onClick={() => setMenu((current) => (current === "region" ? null : "region"))}
              >
                <span className="k">Region</span>
                <strong>{query.region || "Any region"}</strong>
              </button>
              {menu === "region" ? (
                <PickMenu
                  label="Region"
                  options={regions}
                  current={query.region}
                  onPick={(value) => {
                    setQuery((current) => ({ ...current, region: value }));
                    setMenu(null);
                  }}
                  anyLabel="Any region"
                />
              ) : null}
            </div>
            <button className="btn" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>

      <main className="wrap">
        <div className="page">
          <section id="results" ref={resultsRef} aria-labelledby="count">
            <div className="dest-rail">
              <h1 id="count" className="dest-rail__count">
                {rows.length} {noun}
                {where ? <span className="dest-rail__where">{where}</span> : null}
              </h1>

              <div className="dest-rail__chips chips" role="toolbar" aria-label="Quick filters">
                <QuickChip
                  label="Popular"
                  count={facetCount(destinations, query, "popular", (item) => item.popular)}
                  pressed={query.popular}
                  onClick={() => setQuery((current) => ({ ...current, popular: !current.popular }))}
                />
                <QuickChip
                  label="Has tours"
                  count={facetCount(destinations, query, "tours", (item) => item.tourCount > 0)}
                  pressed={query.hasTours}
                  onClick={() => setQuery((current) => ({ ...current, hasTours: !current.hasTours }))}
                />
                <QuickChip
                  label="Has stays"
                  count={facetCount(destinations, query, "hotels", (item) => item.hotelCount > 0)}
                  pressed={query.hasHotels}
                  onClick={() => setQuery((current) => ({ ...current, hasHotels: !current.hasHotels }))}
                />
                <QuickChip
                  label="Has rentals"
                  count={facetCount(destinations, query, "rentals", (item) => item.rentalCount > 0)}
                  pressed={query.hasRentals}
                  onClick={() => setQuery((current) => ({ ...current, hasRentals: !current.hasRentals }))}
                />
                {countries.length > 0 && countries.length <= 6
                  ? countries.map((country) => (
                      <QuickChip
                        key={country}
                        label={country}
                        count={facetCount(destinations, query, "country", (item) => item.country === country)}
                        pressed={query.country === country}
                        onClick={() =>
                          setQuery((current) => ({
                            ...current,
                            country: current.country === country ? "" : country,
                            region: "",
                          }))
                        }
                      />
                    ))
                  : null}
                {query.q ? (
                  <button className="chip is-on" type="button" onClick={() => { setQInput(""); setQuery((current) => ({ ...current, q: "" })); }}>
                    “{query.q}” ×
                  </button>
                ) : null}
                {query.country ? (
                  <button className="chip is-on" type="button" onClick={() => setQuery((current) => ({ ...current, country: "", region: "" }))}>
                    {query.country} ×
                  </button>
                ) : null}
                {query.region ? (
                  <button className="chip is-on" type="button" onClick={() => setQuery((current) => ({ ...current, region: "" }))}>
                    {query.region} ×
                  </button>
                ) : null}
                {filtersOn ? (
                  <button
                    className="chip chip--clear"
                    type="button"
                    onClick={() => {
                      setQInput("");
                      setQuery((current) => clearQuery(current));
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="dest-rail__tools">
                <label className="dest-rail__search">
                  <span className="sr-only">Search</span>
                  <input
                    type="search"
                    value={qInput}
                    onChange={(event) => setQInput(event.target.value)}
                    placeholder="Filter list"
                    aria-label="Filter destinations"
                  />
                </label>
                <div className="sort" data-picker>
                  <button
                    className="sort-btn"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={menu === "sort"}
                    aria-label="Sort destinations"
                    onClick={() => setMenu((current) => (current === "sort" ? null : "sort"))}
                  >
                    {SORT_LABELS[query.sort]}
                  </button>
                  {menu === "sort" ? (
                    <SortMenu value={query.sort} onPick={(sort) => { setQuery((current) => ({ ...current, sort })); setMenu(null); }} />
                  ) : null}
                </div>
                <div className="layout-switch" role="group" aria-label="Layout">
                  <button
                    type="button"
                    aria-pressed={query.view === "list"}
                    aria-label="List view"
                    onClick={() => setQuery((current) => ({ ...current, view: "list" }))}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    aria-pressed={query.view === "grid"}
                    aria-label="Grid view"
                    onClick={() => setQuery((current) => ({ ...current, view: "grid" }))}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>

            {rows.length ? (
              <div className={`list${query.view === "grid" ? " is-grid" : ""}`}>
                {slice.map((item, index) => (
                  <DestCard key={item.id} item={item} eager={index < 2} />
                ))}
                {hasMore ? <div ref={sentinelRef} className="tour-catalog__more" aria-hidden="true" /> : null}
              </div>
            ) : (
              <div className="empty">
                <h2>Nothing matches</h2>
                <p>Try another place name, country, or region — or clear the listing filters.</p>
                <div className="empty__actions">
                  <button
                    className="btn btn--small"
                    type="button"
                    onClick={() => {
                      setQInput("");
                      setQuery((current) => clearQuery(current));
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function DestCard({ item, eager }: { item: DestinationListCard; eager: boolean }) {
  const place = [item.region, item.country].filter(Boolean).join(", ");
  const line = listingLine(item);
  return (
    <Link prefetch={false} href={item.href} className="card dest-card">
      <div className="photo">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            fetchPriority={eager ? "high" : undefined}
            loading={eager ? undefined : "lazy"}
            decoding="async"
          />
        ) : null}
        {item.popular ? <span className="badge is-hot">Popular</span> : null}
      </div>
      <div className="main">
        <p className="kicker">
          <span className="kicker__full">{place || item.country || "Destination"}</span>
          <span className="kicker__short">{item.region || item.country || "India"}</span>
        </p>
        <h2>{item.name}</h2>
        {item.summary ? <p className="mention">{item.summary}</p> : null}
        {line ? <p className="sub">{line}</p> : null}
      </div>
    </Link>
  );
}

function SortMenu({ value, onPick }: { value: DestinationSort; onPick: (sort: DestinationSort) => void }) {
  return (
    <div className="menu" role="listbox" aria-label="Sort">
      {SORTS.map((sort) => (
        <button
          key={sort}
          type="button"
          role="option"
          aria-selected={value === sort}
          className={value === sort ? "is-on" : undefined}
          onClick={() => onPick(sort)}
        >
          {SORT_LABELS[sort]}
        </button>
      ))}
    </div>
  );
}

function WhereMenu({
  inputRef,
  value,
  places,
  onChange,
  onPick,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  places: string[];
  onChange: (value: string) => void;
  onPick: (value: string) => void;
}) {
  const needle = value.trim().toLowerCase();
  const hits = places.filter((place) => !needle || place.toLowerCase().includes(needle)).slice(0, 12);
  return (
    <div className="menu where-menu" role="listbox" aria-label="Where">
      <input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} placeholder="City, region, or name" aria-label="Search place" />
      {hits.length ? (
        hits.map((place) => (
          <button key={place} type="button" role="option" className={value.trim() === place ? "is-on" : undefined} onClick={() => onPick(place)}>
            {place}
          </button>
        ))
      ) : (
        <p className="where-empty">No places in the list match that text.</p>
      )}
    </div>
  );
}

function PickMenu({
  label,
  options,
  current,
  onPick,
  anyLabel,
}: {
  label: string;
  options: string[];
  current: string;
  onPick: (value: string) => void;
  anyLabel: string;
}) {
  return (
    <div className="menu" role="listbox" aria-label={label}>
      <button type="button" role="option" aria-selected={!current} className={!current ? "is-on" : undefined} onClick={() => onPick("")}>
        {anyLabel}
      </button>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="option"
          aria-selected={current === option}
          className={current === option ? "is-on" : undefined}
          onClick={() => onPick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MobileLocMenu({
  options,
  current,
  onPick,
  onClear,
}: {
  options: string[];
  current: string;
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="m-bar__menu" role="listbox" aria-label="Place">
      <button type="button" role="option" onClick={onClear}>
        Anywhere
      </button>
      {options.slice(0, 24).map((name) => (
        <button
          key={name}
          type="button"
          role="option"
          aria-selected={current === name}
          className={current === name ? "is-on" : undefined}
          onClick={() => onPick(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function TripSheet({
  countries,
  regions,
  country,
  region,
  onClose,
  onChange,
}: {
  countries: string[];
  regions: string[];
  country: string;
  region: string;
  onClose: () => void;
  onChange: (next: { country?: string; region?: string }) => void;
}) {
  return (
    <div className="who-panel" style={{ position: "fixed", left: 12, right: 12, bottom: 72, zIndex: 1050, maxWidth: 420, margin: "0 auto" }}>
      <div className="cal__head">
        <strong>Country &amp; region</strong>
        <button type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <p className="hint" style={{ marginBottom: 8 }}>
        Country
      </p>
      <div className="pills" style={{ marginBottom: 12 }}>
        <Pill label="Any" count={countries.length} checked={!country} onChange={() => onChange({ country: "" })} />
        {countries.map((item) => (
          <Pill key={item} label={item} count={1} checked={country === item} onChange={() => onChange({ country: item })} />
        ))}
      </div>
      {regions.length ? (
        <>
          <p className="hint" style={{ marginBottom: 8 }}>
            Region
          </p>
          <div className="pills">
            <Pill label="Any" count={regions.length} checked={!region} onChange={() => onChange({ region: "" })} />
            {regions.map((item) => (
              <Pill key={item} label={item} count={1} checked={region === item} onChange={() => onChange({ region: item })} />
            ))}
          </div>
        </>
      ) : null}
      <button className="btn btn--block" type="button" style={{ marginTop: 12 }} onClick={onClose}>
        Done
      </button>
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

function QuickChip({ label, count, pressed, onClick }: { label: string; count: number; pressed: boolean; onClick: () => void }) {
  if (count === 0 && !pressed) return null;
  return (
    <button className="chip" type="button" aria-pressed={pressed} onClick={onClick}>
      {label} <span className="n">{count}</span>
    </button>
  );
}

