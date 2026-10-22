"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { submitTourRequest } from "@/actions/tour-request";
import { initialFormState } from "@/lib/forms";
import { partyBlock } from "@/lib/tours/quote";
import {
  DURS,
  LEVELS,
  PAGE_SIZE,
  SORTS,
  STYLES,
  WHENS,
  activeCount,
  bounds,
  bucket,
  cancelInfo,
  catalogSearch,
  clearQuery,
  dropFilter,
  durationLabel,
  emptyIdeas,
  extraLine,
  facetCount,
  groupLabel,
  hiddenCounts,
  money,
  nextOpen,
  pass,
  partyTotal,
  prettyDate,
  priceDetail,
  rangeNow,
  readMoney,
  relaxQuery,
  reviewCount,
  runsLabel,
  scoreClass,
  scoreWords,
  seatsLeft,
  sortCopy,
  statusOf,
  uniqueValues,
  visibleTours,
  weekday,
  whoLabel,
} from "@/components/tour-list/catalog/logic";
import type { CatalogGuest, CatalogQuery, CatalogSort, CatalogTour } from "@/components/tour-list/catalog/types";
import "@/components/tour-list/catalog/tour-catalog.css";

const SORT_LABEL: Record<CatalogSort, string> = {
  match: "Best match",
  price: "Lowest total",
  value: "Best value",
  rating: "Highest score",
  reviews: "Most reviews",
  short: "Shortest",
  long: "Longest",
};

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SAVED_KEY = "wch-tours-saved";

export function TourCatalog({
  tours,
  initial,
  today,
  customer,
  featured,
}: {
  tours: CatalogTour[];
  initial: CatalogQuery;
  today: string;
  customer: CatalogGuest | null;
  featured: { href: string; title: string } | null;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initial);
  const [qInput, setQInput] = useState(initial.q);
  const [minText, setMinText] = useState(initial.min == null ? "" : String(initial.min));
  const [maxText, setMaxText] = useState(initial.max == null ? "" : String(initial.max));
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [menu, setMenu] = useState<null | "where" | "date" | "who" | "sort" | "dock">(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const filtersRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDialogElement>(null);
  const compareRef = useRef<HTMLDialogElement>(null);
  const filterReturn = useRef<HTMLElement | null>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => visibleTours(tours, query, today, saved), [tours, query, today, saved]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topId = rows.find((tour) => statusOf(tour, query.date) === "ok")?.id ?? "";
  const noun = rows.length === 1 ? "tour" : "tours";
  const hidden = hiddenCounts(tours, rows, query, today, saved);
  const filtersOn = activeCount(query);
  const [lo, hi] = bounds(tours, query);
  const [min, max] = rangeNow(tours, query);
  const whereOptions = useMemo(() => {
    const names = new Set<string>();
    tours.forEach((tour) => {
      if (tour.place) names.add(tour.place);
      if (tour.region && tour.region !== tour.place) names.add(tour.region);
    });
    return [...names].sort((a, b) => a.localeCompare(b, "en"));
  }, [tours]);
  const regions = uniqueValues(tours, "region");
  const categories = uniqueValues(tours, "category");
  const languages = uniqueValues(tours, "langs");
  const ideas = rows.length ? [] : emptyIdeas(tours, query, today).slice(0, 3);
  const preview = tours.find((tour) => tour.id === previewId) ?? null;
  const compared = query.compare.flatMap((id) => {
    const tour = tours.find((item) => item.id === id);
    return tour ? [tour] : [];
  });

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as unknown;
      if (Array.isArray(raw)) {
        const ids = new Set(tours.map((tour) => tour.id));
        setSaved(raw.filter((id): id is string => typeof id === "string" && ids.has(id)));
      }
    } catch {
      setSaved([]);
    }
    setHydrated(true);
  }, [tours]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      setToast("Saving is blocked in this browser");
      setToastOn(true);
    }
  }, [saved, hydrated]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qInput.trim().slice(0, 80);
      setQuery((current) => (current.q === next ? current : { ...current, q: next, page: 1 }));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [qInput]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const current = query;
      const nextMin = readMoney(minText, "min", current, lo, hi);
      const nextMax = readMoney(maxText, "max", current, lo, hi);
      setQuery((value) =>
        value.min === nextMin && value.max === nextMax ? value : { ...value, min: nextMin, max: nextMax, page: 1 },
      );
    }, 220);
    return () => window.clearTimeout(handle);
  }, [hi, lo, maxText, minText, query]);

  useEffect(() => {
    if (document.activeElement !== minRef.current) setMinText(query.min == null ? "" : String(query.min));
    if (document.activeElement !== maxRef.current) setMaxText(query.max == null ? "" : String(query.max));
  }, [query.max, query.min]);

  useEffect(() => {
    const search = catalogSearch({ ...query, page });
    const url = search ? `${pathname}?${search}` : pathname;
    if (url !== `${pathname}${window.location.search}`) history.replaceState(null, "", url);
  }, [page, pathname, query]);

  useEffect(() => {
    const title = `${rows.length} ${noun} · World Compass Holidays`;
    if (document.title !== title) document.title = title;
  }, [noun, rows.length]);

  useEffect(() => {
    if (!toastOn) return;
    const handle = window.setTimeout(() => setToastOn(false), 2400);
    return () => window.clearTimeout(handle);
  }, [toast, toastOn]);

  useEffect(() => {
    const dialog = previewRef.current;
    if (!dialog) return;
    if (previewId && !dialog.open) dialog.showModal();
    if (!previewId && dialog.open) dialog.close();
  }, [previewId]);

  useEffect(() => {
    const dialog = compareRef.current;
    if (!dialog) return;
    if (compareOpen && !dialog.open) dialog.showModal();
    if (!compareOpen && dialog.open) dialog.close();
  }, [compareOpen]);

  useEffect(() => {
    if (!filtersOpen) return;
    const node = filtersRef.current?.querySelector<HTMLElement>(".filters__close");
    node?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
      if (event.key !== "Tab" || !filtersRef.current) return;
      const nodes = [...filtersRef.current.querySelectorAll<HTMLElement>("button, input, select, a")].filter(
        (item) => !item.hasAttribute("disabled") && item.offsetParent,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) setFiltersOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (menu === "where") searchRef.current?.focus();
  }, [menu]);

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
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (!compareOpen && !previewId) return;
    const y = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    const stopPageScroll = (event: WheelEvent) => {
      const box = event.target instanceof Element ? event.target.closest("dialog") : null;
      if (!(box instanceof HTMLElement) || !box.open || box.scrollHeight <= box.clientHeight + 1) {
        event.preventDefault();
        return;
      }
      const atTop = box.scrollTop <= 0;
      const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) event.preventDefault();
    };
    document.addEventListener("wheel", stopPageScroll, { capture: true, passive: false });
    return () => {
      document.removeEventListener("wheel", stopPageScroll, { capture: true });
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      window.scrollTo(0, y);
    };
  }, [compareOpen, previewId]);

  function showToast(text: string) {
    setToast(text);
    setToastOn(true);
  }

  function scrollResults() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function toggleValue(key: "dur" | "region" | "cat" | "when" | "style" | "lang" | "level", value: string) {
    setQuery((current) => ({
      ...current,
      page: 1,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }));
  }

  function toggleCompare(id: string, on: boolean) {
    setQuery((current) => {
      if (on) {
        if (current.compare.includes(id)) return current;
        if (current.compare.length >= 3) {
          showToast("Compare holds three tours. Remove one first.");
          return current;
        }
        return { ...current, compare: [...current.compare, id] };
      }
      return { ...current, compare: current.compare.filter((item) => item !== id) };
    });
  }

  function openFilters() {
    filterReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFiltersOpen(true);
  }

  function closeFilters() {
    setFiltersOpen(false);
    filterReturn.current?.focus();
    filterReturn.current = null;
  }

  function jumpDate(iso: string) {
    setPreviewId(null);
    setQuery((current) => ({ ...current, date: iso, showOff: false, showSold: false, page: 1 }));
  }

  const where = query.q ? ` matching “${query.q.trim()}”` : "";
  const insight = [
    hidden.off ? `${hidden.off} ${hidden.off === 1 ? "tour does not run" : "tours do not run"}` : "",
    hidden.sold ? `${hidden.sold} ${hidden.sold === 1 ? "is sold out" : "are sold out"}` : "",
  ]
    .filter(Boolean)
    .join(", and ");

  const bins = priceBins(tours, query, today, saved, lo, hi, min, max);

  return (
    <div className={`tour-catalog${filtersOpen || compareOpen || previewId ? " is-locked" : ""}`}>
      <a className="skip" href="#results">
        Skip to tours
      </a>
      <div className="bar">
        <button
          className="btn btn--ghost btn--small"
          type="button"
          aria-pressed={query.savedOnly}
          onClick={() => setQuery((current) => ({ ...current, savedOnly: !current.savedOnly, page: 1 }))}
        >
          Saved {saved.length ? <span>({saved.length})</span> : null}
        </button>
        <button
          className="btn btn--ghost btn--small"
          type="button"
          onClick={async () => {
            const search = catalogSearch({ ...query, page });
            const url = `${window.location.origin}${pathname}${search ? `?${search}` : ""}`;
            try {
              await navigator.clipboard.writeText(url);
              showToast("Link copied. It keeps the date, the party, and the filters.");
            } catch {
              showToast(url);
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
            <strong>{query.q.trim() || "Anywhere in this list"}</strong>
            <span>
              {prettyDate(query.date)} · {whoLabel(query)}
            </span>
          </button>
          <form
            className={`search${searchOpen ? " is-open" : ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              const next = qInput.trim().slice(0, 80);
              setQuery((current) => ({ ...current, q: next, page: 1 }));
              setSearchOpen(false);
              setMenu(null);
              scrollResults();
            }}
          >
            <div className="field" data-picker>
              <button className="who-btn" type="button" aria-haspopup="listbox" aria-expanded={menu === "where"} aria-label="Where or what" onClick={() => setMenu((current) => (current === "where" ? null : "where"))}>
                <span className="k">Where or what</span>
                <strong>{query.q.trim() || "Anywhere"}</strong>
              </button>
              {menu === "where" ? (
                <WhereMenu
                  inputRef={searchRef}
                  value={qInput}
                  places={whereOptions}
                  tours={tours}
                  onChange={setQInput}
                  onPick={(value) => {
                    const next = value.trim().slice(0, 80);
                    setQInput(next);
                    setQuery((current) => ({ ...current, q: next, page: 1 }));
                    setMenu(null);
                  }}
                />
              ) : null}
            </div>
            <div className="field" data-picker>
              <button className="who-btn" type="button" aria-haspopup="dialog" aria-expanded={menu === "date"} aria-label="Date" onClick={() => setMenu((current) => (current === "date" ? null : "date"))}>
                <span className="k">Date</span>
                <strong>{prettyDate(query.date)}</strong>
              </button>
              {menu === "date" ? (
                <DateMenu
                  value={query.date}
                  min={today}
                  onPick={(date) => {
                    setQuery((current) => ({ ...current, date, page: 1 }));
                    setMenu(null);
                  }}
                />
              ) : null}
            </div>
            <div className="field" data-picker>
              <button className="who-btn" type="button" aria-expanded={menu === "who"} onClick={() => setMenu((current) => (current === "who" ? null : "who"))}>
                <span className="k">Travelers</span>
                <strong>{whoLabel(query)}</strong>
              </button>
              {menu === "who" ? (
                <div className="who-panel">
                  <div className="guest">
                    <span>
                      Adults <small>Ages 12 and over</small>
                    </span>
                    <span className="step">
                      <button type="button" aria-label="Fewer adults" disabled={query.adults <= 1} onClick={() => setQuery((current) => ({ ...current, adults: Math.max(1, current.adults - 1), page: 1 }))}>
                        −
                      </button>
                      <b>{query.adults}</b>
                      <button type="button" aria-label="More adults" disabled={query.adults >= 8} onClick={() => setQuery((current) => ({ ...current, adults: Math.min(8, current.adults + 1), page: 1 }))}>
                        +
                      </button>
                    </span>
                  </div>
                  <div className="guest">
                    <span>
                      Children <small>Ages 5–11, at 65%</small>
                    </span>
                    <span className="step">
                      <button type="button" aria-label="Fewer children" disabled={query.children <= 0} onClick={() => setQuery((current) => ({ ...current, children: Math.max(0, current.children - 1), page: 1 }))}>
                        −
                      </button>
                      <b>{query.children}</b>
                      <button type="button" aria-label="More children" disabled={query.children >= 6} onClick={() => setQuery((current) => ({ ...current, children: Math.min(6, current.children + 1), page: 1 }))}>
                        +
                      </button>
                    </span>
                  </div>
                  <p className="who-note">A child pays 65% of the adult rate. The total on each card is for this party.</p>
                </div>
              ) : null}
            </div>
            <button className="btn" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>

      <main className="wrap">
        <div className="head">
          <p className="eyebrow">Departures you can compare</p>
          <h1 id="count">
            {rows.length} {noun}
            {where}
          </h1>
          <p className="promise">
            The price is the total for the travelers and date you chose. Cancellation is for that date. Anything you still pay on the spot is written on the card.
          </p>
        </div>

        <div className="chips" role="toolbar" aria-label="Recommended filters">
          <QuickChip
            label="Free cancellation"
            count={facetCount(tours, query, today, saved, "cancel", "1")}
            pressed={query.cancel}
            onClick={() => setQuery((current) => ({ ...current, cancel: !current.cancel, page: 1 }))}
          />
          <QuickChip
            label="Private"
            count={facetCount(tours, query, today, saved, "style", "private")}
            pressed={query.style.includes("private")}
            onClick={() => toggleValue("style", "private")}
          />
          <QuickChip
            label="Rated 9+"
            count={facetCount(tours, query, today, saved, "rating", "9")}
            pressed={query.rating >= 9}
            onClick={() => setQuery((current) => ({ ...current, rating: current.rating >= 9 ? 0 : 9, page: 1 }))}
          />
          <QuickChip
            label="Hotel pickup"
            count={facetCount(tours, query, today, saved, "pickup", "1")}
            pressed={query.pickup}
            onClick={() => setQuery((current) => ({ ...current, pickup: !current.pickup, page: 1 }))}
          />
          <QuickChip
            label="Morning"
            count={facetCount(tours, query, today, saved, "when", "morning")}
            pressed={query.when.includes("morning")}
            onClick={() => toggleValue("when", "morning")}
          />
          <QuickChip
            label="Small group"
            count={facetCount(tours, query, today, saved, "style", "small")}
            pressed={query.style.includes("small")}
            onClick={() => toggleValue("style", "small")}
          />
        </div>

        <div className="applied" aria-label="Filters in use">
          {query.q ? (
            <button type="button" onClick={() => { setQInput(""); setQuery((current) => dropFilter(current, "q", "")); }}>
              “{query.q}” ×
            </button>
          ) : null}
          {query.min != null || query.max != null ? (
            <button type="button" onClick={() => { setMinText(""); setMaxText(""); setQuery((current) => dropFilter(current, "price", "")); }}>
              {money(min)}–{money(max)} ×
            </button>
          ) : null}
          {namedChips(query).map((chip) => (
            <button key={`${chip.key}-${chip.value}`} type="button" onClick={() => setQuery((current) => dropFilter(current, chip.key, chip.value))}>
              {chip.label} ×
            </button>
          ))}
        </div>

        <div className="page">
          <aside className={`filters${filtersOpen ? " is-open" : ""}`} ref={filtersRef} aria-label="Filters">
            <div className="filters__top">
              <h2>Filters</h2>
              <button className="textlink" type="button" onClick={() => { setQInput(""); setMinText(""); setMaxText(""); setQuery((current) => clearQuery(current)); }}>
                Clear
              </button>
              <button className="btn btn--ghost btn--small filters__close" type="button" onClick={closeFilters}>
                Close
              </button>
            </div>
            <fieldset>
              <legend>Total for your party</legend>
              <span className="hint">
                {money(min)} – {money(max)} for {whoLabel(query)}
              </span>
              <div className="hist">
                {bins.map((bin) => (
                  <button
                    key={bin.start}
                    type="button"
                    className={bin.inside ? "is-in" : ""}
                    style={{ height: bin.height }}
                    disabled={!bin.count}
                    aria-label={`${bin.count} ${bin.count === 1 ? "tour" : "tours"} from ${money(bin.start)} to ${money(bin.end)}`}
                    onClick={() => {
                      const nextMin = bin.start <= lo ? null : bin.start;
                      const nextMax = bin.end >= hi ? null : bin.end;
                      setMinText(nextMin == null ? "" : String(nextMin));
                      setMaxText(nextMax == null ? "" : String(nextMax));
                      setQuery((current) => ({ ...current, min: nextMin, max: nextMax, page: 1 }));
                    }}
                  />
                ))}
              </div>
              <div className="price-row">
                <label>
                  Minimum
                  <input ref={minRef} inputMode="numeric" type="number" min={0} step={100} placeholder="Any" value={minText} onChange={(event) => setMinText(event.target.value)} />
                </label>
                <label>
                  Maximum
                  <input ref={maxRef} inputMode="numeric" type="number" min={0} step={100} placeholder="Any" value={maxText} onChange={(event) => setMaxText(event.target.value)} />
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Duration</legend>
              <div className="pills">
                {DURS.map(([value, label]) => (
                  <Pill key={value} label={label} count={facetCount(tours, query, today, saved, "dur", value)} checked={query.dur.includes(value)} onChange={() => toggleValue("dur", value)} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Region</legend>
              {regions.map((value) => (
                <Check key={value} label={value} count={facetCount(tours, query, today, saved, "region", value)} checked={query.region.includes(value)} onChange={() => toggleValue("region", value)} />
              ))}
            </fieldset>
            <fieldset>
              <legend>Type</legend>
              {categories.map((value) => (
                <Check key={value} label={value} count={facetCount(tours, query, today, saved, "cat", value)} checked={query.cat.includes(value)} onChange={() => toggleValue("cat", value)} />
              ))}
            </fieldset>
            <fieldset>
              <legend>Starts</legend>
              <div className="pills">
                {WHENS.map(([value, label]) => (
                  <Pill key={value} label={label} count={facetCount(tours, query, today, saved, "when", value)} checked={query.when.includes(value)} onChange={() => toggleValue("when", value)} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Group</legend>
              <span className="hint">Private is a car, jeep, or boat for your party.</span>
              <div className="pills">
                {STYLES.map(([value, label]) => (
                  <Pill key={value} label={label} count={facetCount(tours, query, today, saved, "style", value)} checked={query.style.includes(value)} onChange={() => toggleValue("style", value)} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Pace</legend>
              <span className="hint">Easy is a short walk or a seat. Demanding means altitude or a pass.</span>
              <div className="pills">
                {LEVELS.map(([value, label]) => (
                  <Pill key={value} label={label} count={facetCount(tours, query, today, saved, "level", value)} checked={query.level.includes(value)} onChange={() => toggleValue("level", value)} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Language</legend>
              <span className="hint">A tour stays in the list if it runs in any language you tick.</span>
              {languages.map((value) => (
                <Check key={value} label={value} count={facetCount(tours, query, today, saved, "lang", value)} checked={query.lang.includes(value)} onChange={() => toggleValue("lang", value)} />
              ))}
            </fieldset>
            <fieldset>
              <legend>Guest score</legend>
              <div className="pills">
                {[
                  [0, "Any"],
                  [8, "8+"],
                  [9, "9+"],
                ].map(([value, label]) => (
                  <label className="pill" key={label}>
                    {label}
                    <input type="radio" name="rating" value={value} checked={query.rating === value} onChange={() => setQuery((current) => ({ ...current, rating: Number(value), page: 1 }))} />
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>On this date</legend>
              <label className="check">
                <input type="checkbox" checked={query.showOff} onChange={(event) => setQuery((current) => ({ ...current, showOff: event.target.checked, page: 1 }))} />
                Show tours that do not run
              </label>
              <label className="check">
                <input type="checkbox" checked={query.showSold} onChange={(event) => setQuery((current) => ({ ...current, showSold: event.target.checked, page: 1 }))} />
                Show sold out tours
              </label>
            </fieldset>
            <div className="sheet-apply">
              <button className="btn btn--block" type="button" onClick={closeFilters}>
                Show {rows.length} {noun}
              </button>
            </div>
          </aside>

          <section id="results" ref={resultsRef} aria-labelledby="count">
            <div className="toolbar">
              <p className="sort-note">{sortCopy(query)}</p>
              <div className="toolbar__controls">
                <div className="sort" data-picker>
                  <span>Sort</span>
                  <button className="sort-btn" type="button" aria-haspopup="listbox" aria-expanded={menu === "sort"} aria-label="Sort tours" onClick={() => setMenu((current) => (current === "sort" ? null : "sort"))}>
                    {SORT_LABEL[query.sort]}
                  </button>
                  {menu === "sort" ? <SortMenu value={query.sort} onPick={(sort) => { setQuery((current) => ({ ...current, sort, page: 1 })); setMenu(null); }} /> : null}
                </div>
                <div className="layout-switch" role="group" aria-label="Layout">
                  <button type="button" aria-pressed={query.view === "list"} onClick={() => setQuery((current) => ({ ...current, view: "list" }))}>
                    List
                  </button>
                  <button type="button" aria-pressed={query.view === "grid"} onClick={() => setQuery((current) => ({ ...current, view: "grid" }))}>
                    Grid
                  </button>
                </div>
              </div>
            </div>
            {insight ? (
              <div className="insight">
                <p>
                  {insight} on {prettyDate(query.date)}. They are hidden so the list stays bookable.
                </p>
                <button className="btn btn--ghost btn--small" type="button" onClick={() => setQuery((current) => ({ ...current, showOff: true, showSold: true, page: 1 }))}>
                  Show them
                </button>
              </div>
            ) : null}
            {rows.length ? (
              <div className={`list${query.view === "grid" ? " is-grid" : ""}`}>
                {slice.map((tour, index) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    query={query}
                    today={today}
                    saved={saved.includes(tour.id)}
                    compared={query.compare.includes(tour.id)}
                    eager={page === 1 && index < 2}
                    badge={badgeFor(tour, topId, query)}
                    onSave={() => setSaved((current) => (current.includes(tour.id) ? current.filter((id) => id !== tour.id) : [...current, tour.id]))}
                    onOpen={() => setPreviewId(tour.id)}
                    onDate={jumpDate}
                    onCompare={(on) => toggleCompare(tour.id, on)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h2>Nothing matches</h2>
                <p>
                  {ideas.length
                    ? "One of these filters is doing the blocking. Removing it brings tours back."
                    : "Nothing in this list runs for that combination. Move the date, or clear the filters."}
                </p>
                <div className="empty__actions">
                  {ideas.map((idea) => (
                    <button key={idea.key} className="btn btn--ghost btn--small" type="button" onClick={() => {
                      if (idea.key === "q") setQInput("");
                      if (idea.key === "price") { setMinText(""); setMaxText(""); }
                      setQuery((current) => relaxQuery(current, idea.key));
                    }}>
                      {idea.label}
                    </button>
                  ))}
                  <button className="btn btn--small" type="button" onClick={() => { setQInput(""); setMinText(""); setMaxText(""); setQuery((current) => clearQuery(current)); }}>
                    Clear filters
                  </button>
                </div>
              </div>
            )}
            {pages > 1 ? (
              <nav className="pager" aria-label="Pages">
                <button type="button" disabled={page === 1} onClick={() => { setQuery((current) => ({ ...current, page: page - 1 })); scrollResults(); }}>
                  Previous
                </button>
                {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                  <button key={number} type="button" aria-current={number === page ? "page" : undefined} onClick={() => { setQuery((current) => ({ ...current, page: number })); scrollResults(); }}>
                    {number}
                  </button>
                ))}
                <button type="button" disabled={page === pages} onClick={() => { setQuery((current) => ({ ...current, page: page + 1 })); scrollResults(); }}>
                  Next
                </button>
              </nav>
            ) : null}
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="wrap">
          A request is an enquiry. Nothing is charged until you accept the trip.
          {featured ? (
            <>
              {" "}
              <Link href={featured.href}>{featured.title}</Link>
            </>
          ) : null}{" "}
          · <Link href="/hotels">Hotels</Link>
        </div>
      </footer>

      <div className="dock">
        <button className="btn btn--ghost" type="button" onClick={openFilters}>
          Filters {filtersOn ? <span className="count-pip">{filtersOn}</span> : null}
        </button>
        <div className="sort" data-picker>
          <span>Sort</span>
          <button className="sort-btn" type="button" aria-haspopup="listbox" aria-expanded={menu === "dock"} aria-label="Sort tours" onClick={() => setMenu((current) => (current === "dock" ? null : "dock"))}>
            {SORT_LABEL[query.sort]}
          </button>
          {menu === "dock" ? <SortMenu value={query.sort} onPick={(sort) => { setQuery((current) => ({ ...current, sort, page: 1 })); setMenu(null); }} /> : null}
        </div>
      </div>
      {filtersOpen ? <button className="shade" type="button" aria-label="Close filters" onClick={closeFilters} /> : null}

      {compared.length ? (
        <div className="comparebar">
          <div className="slots">
            {compared.map((tour) => (
              <div className="slot" key={tour.id}>
                {tour.img ? <img alt="" src={tour.img} /> : null}
                <span>{tour.title}</span>
                <button type="button" aria-label={`Remove ${tour.title} from compare`} onClick={() => toggleCompare(tour.id, false)}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn--small" type="button" disabled={compared.length < 2} onClick={() => setCompareOpen(true)}>
            Compare
          </button>
          <button className="btn btn--ghost btn--small" type="button" onClick={() => setQuery((current) => ({ ...current, compare: [] }))}>
            Clear
          </button>
        </div>
      ) : null}

      <dialog className="preview" ref={previewRef} aria-labelledby="tour-title" onClose={() => setPreviewId(null)} onClick={(event) => { if (event.target === event.currentTarget) setPreviewId(null); }}>
        {preview ? (
          <Preview
            key={preview.id}
            tour={preview}
            query={query}
            today={today}
            customer={customer}
            onClose={() => setPreviewId(null)}
            onDate={jumpDate}
          />
        ) : null}
      </dialog>
      <dialog className="compare" ref={compareRef} aria-labelledby="compare-title" onClose={() => setCompareOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setCompareOpen(false); }}>
        {compareOpen ? <CompareTable tours={compared} query={query} today={today} onClose={() => setCompareOpen(false)} /> : null}
      </dialog>
      <div className={`toast${toastOn ? " is-on" : ""}`} role="status">
        {toast}
      </div>
      <p className="sr" aria-live="polite">
        {rows.length} {noun} for {whoLabel(query)} on {prettyDate(query.date)}
      </p>
    </div>
  );
}

function WhereMenu({
  inputRef,
  value,
  places,
  tours,
  onChange,
  onPick,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  places: string[];
  tours: CatalogTour[];
  onChange: (value: string) => void;
  onPick: (value: string) => void;
}) {
  const needle = value.trim().toLowerCase();
  const placeHits = places.filter((name) => !needle || name.toLowerCase().includes(needle));
  const titleHits = needle
    ? tours.filter((tour) => tour.title.toLowerCase().includes(needle)).slice(0, 6)
    : [];
  return (
    <div className="menu where-menu" role="listbox" aria-label="Where or what">
      <input
        id="tour-q"
        ref={inputRef}
        value={value}
        maxLength={80}
        placeholder="Srinagar, food, a fort"
        aria-label="Search by place or tour"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onPick(value);
          }
        }}
      />
      {!needle ? (
        <button type="button" role="option" onClick={() => onPick("")}>Anywhere</button>
      ) : null}
      {placeHits.map((name) => (
        <button key={name} type="button" role="option" onClick={() => onPick(name)}>{name}</button>
      ))}
      {titleHits.map((tour) => (
        <button key={tour.id} type="button" role="option" onClick={() => onPick(tour.title)}>{tour.title}</button>
      ))}
      {needle && !placeHits.length && !titleHits.length ? <p className="where-empty">Nothing matches that yet. The list updates as you type.</p> : null}
    </div>
  );
}

function SortMenu({ value, onPick }: { value: CatalogSort; onPick: (sort: CatalogSort) => void }) {
  return (
    <div className="menu" role="listbox" aria-label="Sort tours">
      {SORTS.map((item) => (
        <button key={item} type="button" role="option" aria-selected={value === item} className={value === item ? "is-on" : ""} onClick={() => onPick(item)}>
          {SORT_LABEL[item]}
        </button>
      ))}
    </div>
  );
}

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function dayIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function DateMenu({ value, min, onPick }: { value: string; min: string; onPick: (iso: string) => void }) {
  const selected = parseDay(value);
  const earliest = parseDay(min);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + count }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previousBlocked = new Date(year, month, 0) < earliest;

  return (
    <div className="menu cal" role="dialog" aria-label={title}>
      <div className="cal__head">
        <button type="button" aria-label="Previous month" disabled={previousBlocked} onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
        <strong>{title}</strong>
        <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="cal__grid" role="grid">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <span className="cal__dow" key={day}>{day}</span>
        ))}
        {days.map((day, index) => {
          if (day == null) return <span key={`empty-${index}`} />;
          const date = new Date(year, month, day);
          const iso = dayIso(date);
          const disabled = date < earliest;
          return (
            <button key={iso} type="button" disabled={disabled} className={iso === value ? "is-on" : ""} aria-label={prettyDate(iso)} aria-pressed={iso === value} onClick={() => onPick(iso)}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuickChip({ label, count, pressed, onClick }: { label: string; count: number; pressed: boolean; onClick: () => void }) {
  return (
    <button className="chip" type="button" aria-pressed={pressed} disabled={count === 0 && !pressed} onClick={onClick}>
      {label} <span className="n">{count}</span>
    </button>
  );
}

function Pill({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="pill">
      {label} <span className="n">{count}</span>
      <input type="checkbox" checked={checked} disabled={count === 0 && !checked} onChange={onChange} />
    </label>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  const zero = count === 0 && !checked;
  return (
    <label className={`check${zero ? " is-zero" : ""}`}>
      <input type="checkbox" checked={checked} disabled={zero} onChange={onChange} />
      <span>{label}</span>
      <span className="n">{count}</span>
    </label>
  );
}

function badgeFor(tour: CatalogTour, topId: string, query: CatalogQuery) {
  const status = statusOf(tour, query.date);
  if (tour.id === topId && status === "ok") return { text: SORT_LABEL[query.sort], hot: true };
  const seats = seatsLeft(tour, query.date);
  if (status === "ok" && seats != null && seats > 0 && seats <= 4) {
    return { text: `${seats} seat${seats === 1 ? "" : "s"} left`, hot: false };
  }
  if (tour.featured || (tour.reviews >= 1000 && tour.rating >= 9)) return { text: "Best seller", hot: true };
  return null;
}

function TourCard({
  tour,
  query,
  today,
  saved,
  compared,
  eager,
  badge,
  onSave,
  onOpen,
  onDate,
  onCompare,
}: {
  tour: CatalogTour;
  query: CatalogQuery;
  today: string;
  saved: boolean;
  compared: boolean;
  eager: boolean;
  badge: { text: string; hot: boolean } | null;
  onSave: () => void;
  onOpen: () => void;
  onDate: (iso: string) => void;
  onCompare: (on: boolean) => void;
}) {
  const status = statusOf(tour, query.date);
  const cancel = cancelInfo(tour, query, today);
  const place = tour.place === tour.region ? tour.place : `${tour.place}, ${tour.region}`;
  const bits = [durationLabel(tour), tour.when === "multi" ? runsLabel(tour) || "Starts any day" : "", groupLabel(tour)].filter(Boolean);
  const runs = runsLabel(tour);
  const next = status === "ok" ? null : nextOpen(tour, query.date);
  const block = partyBlock({
    mode: "group",
    adults: query.adults,
    children: query.children,
    minPeople: tour.minPeople,
    maxGroupSize: tour.groupMax,
    seats: seatsLeft(tour, query.date),
  });
  const miss = extraLine(tour);
  return (
    <article className={`card${compared ? " is-compared" : ""}${status === "ok" ? "" : " is-dim"}`}>
      <div className="photo">
        {tour.img ? <img src={tour.img} alt={tour.alt} fetchPriority={eager ? "high" : undefined} loading={eager ? undefined : "lazy"} decoding="async" /> : null}
        {badge ? <span className={`badge${badge.hot ? " is-hot" : " is-low"}`}>{badge.text}</span> : null}
        <button className="save" type="button" aria-pressed={saved} aria-label={`${saved ? "Remove from saved" : "Save"} ${tour.title}`} onClick={onSave}>
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="main">
        <p className="kicker">
          {tour.category} · {place}
        </p>
        <h2>
          <Link href={tour.href}>{tour.title}</Link>
        </h2>
        {tour.reviews > 0 ? (
          <div className="score">
            <b className={scoreClass(tour.rating)}>{tour.rating.toFixed(1)}</b>
            <span>
              <strong>{scoreWords(tour.rating)}</strong>
              <span>{reviewCount(tour.reviews)} reviews</span>
            </span>
          </div>
        ) : null}
        <p className="meta">
          {bits.join(" · ")}
          {runs && tour.when !== "multi" ? ` · ${runs}` : ""}
        </p>
        <p className="meta">
          {tour.meetShort} · {tour.langs.join(", ")}
        </p>
        {tour.mention ? <p className="mention">{tour.mention}</p> : null}
        {tour.levelNote ? <p className="expect">{tour.levelNote}</p> : null}
        {tour.includes.length ? (
          <div className="tags">
            {tour.includes.slice(0, 3).map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {miss ? <p className="miss">{miss}</p> : null}
      </div>
      <div className="buy">
        <p className="total">{money(partyTotal(tour, query), tour.currency)}</p>
        <p className="sub">for {whoLabel(query)}</p>
        <p className="sub">{priceDetail(tour, query)}</p>
        <p className={cancel.kind === "yes" ? "ok" : cancel.kind === "no" ? "warn" : "muted"}>{cancel.text}</p>
        {block ? <p className="warn">{block}</p> : null}
        {status === "ok" ? (
          <Link className="btn btn--small" href={tour.href}>
            See the tour
          </Link>
        ) : (
          <>
            <p className="warn">{status === "sold" ? `Sold out on ${prettyDate(query.date)}` : `Does not run on ${DAY[weekday(query.date)]}`}</p>
            {next ? (
              <button className="btn btn--small" type="button" onClick={() => onDate(next)}>
                Next date · {prettyDate(next)}
              </button>
            ) : (
              <p className="muted">No open date in the next 3 weeks</p>
            )}
          </>
        )}
        <button className="textlink" type="button" onClick={onOpen}>
          Quick look
        </button>
        <label className="cmp">
          <input type="checkbox" checked={compared} onChange={(event) => onCompare(event.target.checked)} /> Compare
        </label>
      </div>
    </article>
  );
}

function Preview({
  tour,
  query,
  today,
  customer,
  onClose,
  onDate,
}: {
  tour: CatalogTour;
  query: CatalogQuery;
  today: string;
  customer: CatalogGuest | null;
  onClose: () => void;
  onDate: (iso: string) => void;
}) {
  const status = statusOf(tour, query.date);
  const cancel = cancelInfo(tour, query, today);
  const next = status === "ok" ? null : nextOpen(tour, query.date);
  const departure = tour.departures.find((item) => item.iso === query.date && item.status !== "closed");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="dialog-pad">
      <div className="dialog-head">
        <div>
          <p className="kicker">
            {tour.category} · {tour.place}, {tour.region}
          </p>
          <h2 id="tour-title">{tour.title}</h2>
        </div>
        <button className="btn btn--ghost btn--small" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {tour.img ? <img className="preview-photo" alt={tour.alt} src={tour.img} /> : null}
      {tour.story ? <p className="lede">{tour.story}</p> : null}
      <p className="meta" style={{ marginTop: 8 }}>
        {durationLabel(tour)} · {groupLabel(tour)} · {tour.langs.join(", ")}
      </p>
      <p className="mention">{tour.meet}</p>
      {tour.levelNote ? <p className="expect">{tour.levelNote}</p> : null}
      <div className="split">
        <div>
          <h3>Included</h3>
          <ul>{(tour.includes.length ? tour.includes : ["Ask the desk to confirm what is included."]).map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h3>Not included</h3>
          <ul>{(tour.excludes.length ? tour.excludes : ["Anything not listed as included."]).map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      {tour.timeline.length ? (
        <>
          <h3 style={{ marginTop: 14 }}>The day</h3>
          <ol className="timeline">
            {tour.timeline.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </>
      ) : null}
      <div className="bill">
        <div>
          <p className="bill__total">{money(partyTotal(tour, query), tour.currency)}</p>
          <p className="sub">
            for {whoLabel(query)} · {priceDetail(tour, query)}
          </p>
          <p className={cancel.kind === "yes" ? "ok" : cancel.kind === "no" ? "warn" : "muted"}>{cancel.text}</p>
        </div>
        <Link className="btn btn--small" href={tour.href}>
          Full page
        </Link>
      </div>
      {next ? (
        <p style={{ marginTop: 10 }}>
          <button className="btn btn--ghost btn--small" type="button" onClick={() => onDate(next)}>
            Move the search to {prettyDate(next)}
          </button>
        </p>
      ) : null}
      {done ? (
        <div className="success">{done}</div>
      ) : (
        <form
          className="form"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const name = String(data.get("name") || "").trim();
            const email = String(data.get("email") || "").trim();
            const phone = String(data.get("phone") || "").trim();
            if (name.length < 2) { setError("Add your name."); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Add a real email."); return; }
            if (phone.replace(/\D/g, "").length < 8) { setError("Add a phone number with the country code."); return; }
            setError("");
            setPending(true);
            const result = await submitTourRequest(initialFormState, data);
            setPending(false);
            if (result.error) { setError(result.error); return; }
            setDone(`Request noted for ${tour.title} on ${prettyDate(query.date)}. Nothing was charged.${result.reference ? ` Reference ${result.reference}.` : ""}`);
          }}
        >
          <input type="hidden" name="tourSlug" value={tour.slug} />
          <input type="hidden" name="mode" value="group" />
          <input type="hidden" name="startDate" value={query.date} />
          <input type="hidden" name="departureId" value={departure?.id ?? ""} />
          <input type="hidden" name="adults" value={String(query.adults)} />
          <input type="hidden" name="children" value={String(query.children)} />
          <input type="hidden" name="ownRoom" value="0" />
          <label>
            Name
            <input name="name" required minLength={2} autoComplete="name" defaultValue={customer?.name ?? ""} readOnly={Boolean(customer?.name)} />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" defaultValue={customer?.email ?? ""} readOnly={Boolean(customer?.email)} />
          </label>
          <label>
            Phone
            <input name="phone" required autoComplete="tel" defaultValue={customer?.phone ?? ""} placeholder="+91" />
          </label>
          <label>
            Note
            <textarea name="note" rows={3} maxLength={400} placeholder="Hotel name, or a question" />
          </label>
          <p className="err">{error}</p>
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Sending" : "Send a request"}
          </button>
          <p className="fine">Nothing is charged. The desk replies with the next step.</p>
        </form>
      )}
    </div>
  );
}

function CompareTable({
  tours,
  query,
  today,
  onClose,
}: {
  tours: CatalogTour[];
  query: CatalogQuery;
  today: string;
  onClose: () => void;
}) {
  const totals = tours.map((tour) => partyTotal(tour, query));
  const ratings = tours.map((tour) => (tour.reviews > 0 ? tour.rating : null));
  const bestPrice = bestIndexes(totals, "low");
  const bestRate = bestIndexes(ratings, "high");
  const row = (label: string, cells: { text: string; best: boolean }[]) => (
    <tr>
      <th>{label}</th>
      {cells.map((cell, index) => (
        <td key={`${label}-${tours[index]?.id}`} className={cell.best ? "is-best" : ""}>
          {cell.text}
        </td>
      ))}
    </tr>
  );
  return (
    <div className="dialog-pad">
      <div className="dialog-head">
        <h2 id="compare-title">Compare {tours.length} tours</h2>
        <button className="btn btn--ghost btn--small" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="mention">
        Totals are for {whoLabel(query)} on {prettyDate(query.date)}. Green marks the lower total and the higher score.
      </p>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th />
              {tours.map((tour) => (
                <th key={tour.id}>
                  <div className="compare-tour">
                    {tour.img ? <img src={tour.img} alt="" /> : null}
                    <span>{tour.title}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {row("Total", tours.map((tour, index) => ({ text: money(totals[index], tour.currency), best: bestPrice.has(index) })))}
            {row("How the price works", tours.map((tour) => ({ text: priceDetail(tour, query), best: false })))}
            {row("Score", tours.map((tour, index) => ({ text: tour.reviews > 0 ? `${tour.rating.toFixed(1)} · ${scoreWords(tour.rating)}` : "No guest score yet", best: bestRate.has(index) })))}
            {row("Reviews", tours.map((tour) => ({ text: tour.reviews ? reviewCount(tour.reviews) : "—", best: false })))}
            {row("Length", tours.map((tour) => ({ text: durationLabel(tour), best: false })))}
            {row("Start", tours.map((tour) => ({ text: tour.when === "multi" ? runsLabel(tour) || "Any day" : "Day tour", best: false })))}
            {row("Group", tours.map((tour) => ({ text: groupLabel(tour), best: false })))}
            {row("This date", tours.map((tour) => ({ text: statusOf(tour, query.date) === "ok" ? "Open" : statusOf(tour, query.date) === "sold" ? "Sold out" : "Does not run", best: false })))}
            {row("Cancellation", tours.map((tour) => ({ text: cancelInfo(tour, query, today).text, best: false })))}
            {row("Meeting", tours.map((tour) => ({ text: tour.meetShort, best: false })))}
            {row("Languages", tours.map((tour) => ({ text: tour.langs.join(", "), best: false })))}
            {row("Not included", tours.map((tour) => ({ text: extraLine(tour) || "—", best: false })))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function bestIndexes(values: (number | null)[], dir: "low" | "high") {
  const present = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (!present.length) return new Set<number>();
  const target = dir === "low" ? Math.min(...present) : Math.max(...present);
  return new Set(values.flatMap((value, index) => (value === target ? [index] : [])));
}

function namedChips(query: CatalogQuery) {
  const chips: { key: string; value: string; label: string }[] = [];
  const named = [
    ["dur", query.dur, DURS],
    ["when", query.when, WHENS],
    ["style", query.style, STYLES],
    ["level", query.level, LEVELS],
  ] as const;
  named.forEach(([key, values, options]) => {
    values.forEach((value) => {
      const label = options.find((item) => item[0] === value)?.[1] ?? value;
      chips.push({ key, value, label });
    });
  });
  query.lang.forEach((value) => chips.push({ key: "lang", value, label: value }));
  query.region.forEach((value) => chips.push({ key: "region", value, label: value }));
  query.cat.forEach((value) => chips.push({ key: "cat", value, label: value }));
  if (query.rating) chips.push({ key: "rating", value: "", label: `${query.rating}+ score` });
  if (query.cancel) chips.push({ key: "cancel", value: "", label: "Free cancellation" });
  if (query.pickup) chips.push({ key: "pickup", value: "", label: "Hotel pickup" });
  if (query.savedOnly) chips.push({ key: "savedOnly", value: "", label: "Saved" });
  if (query.showOff) chips.push({ key: "showOff", value: "", label: "Including closed days" });
  if (query.showSold) chips.push({ key: "showSold", value: "", label: "Including sold out" });
  return chips;
}

function priceBins(
  tours: CatalogTour[],
  query: CatalogQuery,
  today: string,
  saved: string[],
  lo: number,
  hi: number,
  min: number,
  max: number,
) {
  const count = 14;
  const step = (hi - lo) / count || 1;
  const counts = Array.from({ length: count }, () => 0);
  tours.forEach((tour) => {
    if (query.savedOnly && !saved.includes(tour.id)) return;
    if (!pass(tour, tours, query, today, "price")) return;
    let index = Math.floor((partyTotal(tour, query) - lo) / step);
    if (index < 0) index = 0;
    if (index >= count) index = count - 1;
    counts[index] += 1;
  });
  const peak = Math.max(1, ...counts);
  const priced = query.min != null || query.max != null;
  return counts.map((value, index) => {
    const start = Math.round(lo + index * step);
    const end = Math.round(lo + (index + 1) * step);
    return {
      start,
      end,
      count: value,
      inside: priced && end >= min && start <= max,
      height: Math.max(4, Math.round((value / peak) * 52)),
    };
  });
}
