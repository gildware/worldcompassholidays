"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useLazySlice } from "@/hooks/useLazySlice";
import { partyBlock } from "@/lib/tours/quote";
import {
  DURS,
  LEVELS,
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
  partyQuote,
  partyTotal,
  prettyDate,
  priceDetail,
  rangeNow,
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
import "@/styles/listing-app.css";

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
  featured,
}: {
  tours: CatalogTour[];
  initial: CatalogQuery;
  today: string;
  customer?: CatalogGuest | null;
  featured: { href: string; title: string } | null;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initial);
  const [qInput, setQInput] = useState(initial.q);
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [menu, setMenu] = useState<null | "where" | "date" | "who" | "sort" | "dock" | "loc" | "trip">(null);
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
  const searchRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => visibleTours(tours, query, today, saved), [tours, query, today, saved]);
  const windowKey = useMemo(
    () =>
      [
        query.q,
        query.date,
        query.sort,
        query.view,
        query.adults,
        query.children,
        query.cancel,
        query.pickup,
        query.rating,
        query.min,
        query.max,
        query.showOff,
        query.showSold,
        query.savedOnly,
        query.dur.join("\0"),
        query.region.join("\0"),
        query.cat.join("\0"),
        query.when.join("\0"),
        query.style.join("\0"),
        query.lang.join("\0"),
        query.level.join("\0"),
        saved.join("\0"),
      ].join("|"),
    [query, saved],
  );
  const { visible: slice, sentinelRef, hasMore } = useLazySlice(rows, windowKey);
  const topId = rows.find((tour) => statusOf(tour, query.date) === "ok")?.id ?? "";
  const noun = rows.length === 1 ? "tour" : "tours";
  const hidden = hiddenCounts(tours, rows, query, today, saved);
  const filtersOn = activeCount(query);
  const [lo, hi] = bounds(tours, query);
  const [min, max] = rangeNow(tours, query);
  const span = hi === lo ? 1 : hi - lo;
  const priced = query.min != null || query.max != null;
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
    const search = catalogSearch({ ...query, page: 1 });
    const url = search ? `${pathname}?${search}` : pathname;
    if (url !== `${pathname}${window.location.search}`) history.replaceState(null, "", url);
  }, [pathname, query]);

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
      if (
        target instanceof Element &&
        target.closest("[data-picker], .sl-cal, .cal, .m-cal-backdrop, .m-cal-sheet")
      ) {
        return;
      }
      setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointer);
    }, 0);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
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
      page: 1,
    }));
  }

  const where = query.q ? ` matching “${query.q.trim()}”` : "";
  const insight = [
    hidden.off ? `${hidden.off} ${hidden.off === 1 ? "tour does not run" : "tours do not run"}` : "",
    hidden.sold ? `${hidden.sold} ${hidden.sold === 1 ? "is sold out" : "are sold out"}` : "",
  ]
    .filter(Boolean)
    .join(", and ");

  const bins = priceBins(tours, query, today, saved, lo, hi);

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

          <div className="m-bar app-chrome-mobile" data-picker>
            <div className="m-bar__row">
              <button
                className="m-bar__loc"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu === "loc"}
                aria-label="Location"
                onClick={() => setMenu((current) => (current === "loc" ? null : "loc"))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>
                  {(whereOptions.includes(query.q.trim()) ? query.q.trim() : "") || "Anywhere"}
                </span>
              </button>
              <form
                className="m-bar__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const next = qInput.trim().slice(0, 80);
                  setQuery((current) => ({ ...current, q: next, page: 1 }));
                  setMenu(null);
                  scrollResults();
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
                  onBlur={() => {
                    const next = qInput.trim().slice(0, 80);
                    if (next !== query.q) setQuery((current) => ({ ...current, q: next, page: 1 }));
                  }}
                  placeholder="Search tours"
                  aria-label="Search tours"
                  enterKeyHint="search"
                  autoComplete="off"
                />
              </form>
              <button
                className="m-bar__view"
                type="button"
                aria-label={query.view === "grid" ? "Show as list" : "Show as grid"}
                aria-pressed={query.view === "grid"}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    view: current.view === "grid" ? "list" : "grid",
                  }))
                }
              >
                {query.view === "grid" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M5 7h14M5 12h14M5 17h14" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <rect x="4" y="4" width="7" height="7" rx="1.5" />
                    <rect x="13" y="4" width="7" height="7" rx="1.5" />
                    <rect x="4" y="13" width="7" height="7" rx="1.5" />
                    <rect x="13" y="13" width="7" height="7" rx="1.5" />
                  </svg>
                )}
              </button>
            </div>
            <div className="m-bar__trip">
              <button
                className="m-bar__meta"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={menu === "trip"}
                onClick={() => setMenu((current) => (current === "trip" ? null : "trip"))}
              >
                {prettyDate(query.date)} · {whoLabel(query)}
              </button>
              <div className="m-bar__tools" aria-label="Listing actions">
                <button className="m-bar__filter" type="button" onClick={openFilters}>
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
                    aria-label={`Sort: ${SORT_LABEL[query.sort]}`}
                    onClick={() => setMenu((current) => (current === "dock" ? null : "dock"))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M7 6v12M7 18l-2.5-2.5M7 18l2.5-2.5M17 18V6M17 6l-2.5 2.5M17 6l2.5 2.5" />
                    </svg>
                    Sort
                  </button>
                  {menu === "dock" ? (
                    <SortMenu
                      value={query.sort}
                      onPick={(sort) => {
                        setQuery((current) => ({ ...current, sort, page: 1 }));
                        setMenu(null);
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
            {menu === "loc" ? (
              <div className="m-bar__menu" role="listbox" aria-label="Location">
                <button
                  type="button"
                  role="option"
                  onClick={() => {
                    setQInput("");
                    setQuery((current) => ({ ...current, q: "", page: 1 }));
                    setMenu(null);
                  }}
                >
                  Anywhere
                </button>
                {whereOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={query.q.trim() === name}
                    className={query.q.trim() === name ? "is-on" : undefined}
                    onClick={() => {
                      setQInput(name);
                      setQuery((current) => ({ ...current, q: name, page: 1 }));
                      setMenu(null);
                      scrollResults();
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ) : null}
            {!searchOpen && menu === "trip" ? (
              <TourTripSheet
                date={query.date}
                adults={query.adults}
                children={query.children}
                today={today}
                onClose={() => setMenu(null)}
                onChange={(next) => setQuery((current) => ({ ...current, ...next, page: 1 }))}
              />
            ) : null}
          </div>

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
              {searchOpen && menu === "date" ? (
                <DateMenu
                  label="Travel date"
                  value={query.date}
                  min={today}
                  onClose={() => setMenu(null)}
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
          <div className="head__row">
            <h1 id="count">
              <span className="head__count">
                {rows.length} {noun}
                {where}
              </span>
              <span className="head__title">{query.q.trim() || "All tours"}</span>
            </h1>
            <button
              className="view-toggle"
              type="button"
              aria-label={query.view === "grid" ? "Show as list" : "Show as grid"}
              aria-pressed={query.view === "grid"}
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  view: current.view === "grid" ? "list" : "grid",
                }))
              }
            >
              {query.view === "grid" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M5 7h14M5 12h14M5 17h14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="4" y="4" width="7" height="7" rx="1.5" />
                  <rect x="13" y="4" width="7" height="7" rx="1.5" />
                  <rect x="4" y="13" width="7" height="7" rx="1.5" />
                  <rect x="13" y="13" width="7" height="7" rx="1.5" />
                </svg>
              )}
            </button>
          </div>
          <p className="promise">
            The price is the total for the travelers and date you chose. Cancellation is for that date. Anything you still pay on the spot is written on the card.
          </p>
        </div>

        <div className="chips" role="toolbar" aria-label="Filters">
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
          {query.q ? (
            <button className="chip is-on" type="button" onClick={() => { setQInput(""); setQuery((current) => dropFilter(current, "q", "")); }}>
              “{query.q}” ×
            </button>
          ) : null}
          {priced ? (
            <button className="chip is-on" type="button" onClick={() => setQuery((current) => dropFilter(current, "price", ""))}>
              {money(min)}–{money(max)} ×
            </button>
          ) : null}
          {namedChips(query)
            .filter((chip) => {
              if (chip.key === "cancel" || chip.key === "pickup") return false;
              if (chip.key === "rating" && query.rating >= 9) return false;
              if (chip.key === "style" && (chip.value === "private" || chip.value === "small")) return false;
              if (chip.key === "when" && chip.value === "morning") return false;
              return true;
            })
            .map((chip) => (
              <button key={`${chip.key}-${chip.value}`} className="chip is-on" type="button" onClick={() => setQuery((current) => dropFilter(current, chip.key, chip.value))}>
                {chip.label} ×
              </button>
            ))}
          {filtersOn ? (
            <button className="chip chip--clear" type="button" onClick={() => { setQInput(""); setQuery((current) => clearQuery(current)); }}>
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="page">
          <aside className={`filters${filtersOpen ? " is-open" : ""}`} ref={filtersRef} aria-label="Filters">
            <div className="filters__top">
              <h2>Filters</h2>
              <button className="textlink" type="button" onClick={() => { setQInput(""); setQuery((current) => clearQuery(current)); }}>
                Clear
              </button>
              <button className="btn btn--ghost btn--small filters__close" type="button" onClick={closeFilters}>
                Close
              </button>
            </div>
            <fieldset>
              <legend>
                Total for your party{" "}
                <span>{priced ? `${money(min)} – ${money(max)} for ${whoLabel(query)}` : "Any price"}</span>
              </legend>
              <div className="hist" role="group" aria-label="Price distribution">
                {bins.map((bin) => {
                  const on = bin.end >= min - span / 28 && bin.start <= max + span / 28;
                  return (
                    <button
                      key={bin.start}
                      type="button"
                      className={on ? "is-in" : ""}
                      style={{ height: `${bin.height}%` }}
                      aria-label={`${bin.count} ${bin.count === 1 ? "tour" : "tours"} up to ${money(bin.end)} for ${whoLabel(query)}`}
                      onClick={() =>
                        setQuery((current) => ({
                          ...current,
                          min: null,
                          max: bin.end >= hi ? null : bin.end,
                          page: 1,
                        }))
                      }
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
                <input
                  type="range"
                  min={lo}
                  max={hi}
                  step={span > 500 ? 100 : 1}
                  aria-label="Minimum total for your party"
                  value={min}
                  onChange={(event) => onPrice("min", Number(event.target.value))}
                />
                <input
                  type="range"
                  min={lo}
                  max={hi}
                  step={span > 500 ? 100 : 1}
                  aria-label="Maximum total for your party"
                  value={max}
                  onChange={(event) => onPrice("max", Number(event.target.value))}
                />
              </div>
              <p className="hint">
                {priced
                  ? `Tours in this band cost ${money(min)} – ${money(max)} for ${whoLabel(query)}.`
                  : "Drag either end. The total on each tour is for your travelers."}
              </p>
            </fieldset>
            <FilterGroup
              legend="Duration"
              layout="pills"
              items={DURS.map(([value, label]) => {
                const count = facetCount(tours, query, today, saved, "dur", value);
                const checked = query.dur.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Pill key={value} label={label} count={count} checked={checked} onChange={() => toggleValue("dur", value)} />,
                };
              })}
            />
            <FilterGroup
              legend="Region"
              items={regions.map((value) => {
                const count = facetCount(tours, query, today, saved, "region", value);
                const checked = query.region.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Check key={value} label={value} count={count} checked={checked} onChange={() => toggleValue("region", value)} />,
                };
              })}
            />
            <FilterGroup
              legend="Type"
              items={categories.map((value) => {
                const count = facetCount(tours, query, today, saved, "cat", value);
                const checked = query.cat.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Check key={value} label={value} count={count} checked={checked} onChange={() => toggleValue("cat", value)} />,
                };
              })}
            />
            <FilterGroup
              legend="Starts"
              layout="pills"
              items={WHENS.map(([value, label]) => {
                const count = facetCount(tours, query, today, saved, "when", value);
                const checked = query.when.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Pill key={value} label={label} count={count} checked={checked} onChange={() => toggleValue("when", value)} />,
                };
              })}
            />
            <FilterGroup
              legend="Group"
              hint="Private is a car, jeep, or boat for your party."
              layout="pills"
              items={STYLES.map(([value, label]) => {
                const count = facetCount(tours, query, today, saved, "style", value);
                const checked = query.style.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Pill key={value} label={label} count={count} checked={checked} onChange={() => toggleValue("style", value)} />,
                };
              })}
            />
            <FilterGroup
              legend="Pace"
              hint="Easy is a short walk or a seat. Demanding means altitude or a pass."
              layout="pills"
              items={LEVELS.map(([value, label]) => {
                const count = facetCount(tours, query, today, saved, "level", value);
                const checked = query.level.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Pill key={value} label={label} count={count} checked={checked} onChange={() => toggleValue("level", value)} />,
                };
              })}
            />
            <FilterGroup
              legend="Language"
              hint="A tour stays in the list if it runs in any language you tick."
              items={languages.map((value) => {
                const count = facetCount(tours, query, today, saved, "lang", value);
                const checked = query.lang.includes(value);
                return {
                  key: value,
                  count,
                  checked,
                  node: <Check key={value} label={value} count={count} checked={checked} onChange={() => toggleValue("lang", value)} />,
                };
              })}
            />
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
                  <button type="button" aria-pressed={query.view === "list"} aria-label="List view" onClick={() => setQuery((current) => ({ ...current, view: "list" }))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M5 7h14M5 12h14M5 17h14" />
                    </svg>
                    List
                  </button>
                  <button type="button" aria-pressed={query.view === "grid"} aria-label="Grid view" onClick={() => setQuery((current) => ({ ...current, view: "grid" }))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <rect x="4" y="4" width="7" height="7" rx="1.5" />
                      <rect x="13" y="4" width="7" height="7" rx="1.5" />
                      <rect x="4" y="13" width="7" height="7" rx="1.5" />
                      <rect x="13" y="13" width="7" height="7" rx="1.5" />
                    </svg>
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
                    eager={index < 2}
                    badge={badgeFor(tour, topId, query)}
                    onSave={() => setSaved((current) => (current.includes(tour.id) ? current.filter((id) => id !== tour.id) : [...current, tour.id]))}
                    onOpen={() => setPreviewId(tour.id)}
                    onDate={jumpDate}
                    onCompare={(on) => toggleCompare(tour.id, on)}
                  />
                ))}
                {hasMore ? <div ref={sentinelRef} className="tour-catalog__more" aria-hidden="true" /> : null}
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
                      setQuery((current) => relaxQuery(current, idea.key));
                    }}>
                      {idea.label}
                    </button>
                  ))}
                  <button className="btn btn--small" type="button" onClick={() => { setQInput(""); setQuery((current) => clearQuery(current)); }}>
                    Clear filters
                  </button>
                </div>
              </div>
            )}
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

function TourTripSheet({
  date,
  adults,
  children,
  today,
  onClose,
  onChange,
}: {
  date: string;
  adults: number;
  children: number;
  today: string;
  onClose: () => void;
  onChange: (next: Partial<CatalogQuery>) => void;
}) {
  const selected = parseDay(date);
  const earliest = parseDay(today);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + daysInMonth }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previousBlocked = new Date(year, month, 0) < earliest;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const panel = (
    <>
      <button type="button" className="m-cal-backdrop" aria-label="Close trip details" onClick={onClose} data-picker />
      <div className="m-cal-sheet is-sheet is-trip" role="dialog" aria-modal="true" aria-label="Date and travelers" data-picker>
        <div className="m-cal-sheet__grab" aria-hidden />
        <p className="m-cal-sheet__title">Date &amp; travelers</p>
        <div className="m-trip__body">
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
              const next = new Date(year, month, day);
              const iso = dayIso(next);
              const disabled = next < earliest;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  className={iso === date ? "is-on" : ""}
                  aria-label={prettyDate(iso)}
                  aria-pressed={iso === date}
                  onClick={() => {
                    onChange({ date: iso });
                    document.getElementById("m-trip-travelers")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="m-trip__guests" id="m-trip-travelers">
            <p className="m-trip__label">Travelers</p>
            <div className="m-trip__row">
              <span>
                Adults <small>Ages 12+</small>
              </span>
              <span className="m-trip__step">
                <button type="button" aria-label="Fewer adults" disabled={adults <= 1} onClick={() => onChange({ adults: Math.max(1, adults - 1) })}>−</button>
                <b>{adults}</b>
                <button type="button" aria-label="More adults" disabled={adults >= 8} onClick={() => onChange({ adults: Math.min(8, adults + 1) })}>+</button>
              </span>
            </div>
            <div className="m-trip__row">
              <span>
                Children <small>Ages 5–11</small>
              </span>
              <span className="m-trip__step">
                <button type="button" aria-label="Fewer children" disabled={children <= 0} onClick={() => onChange({ children: Math.max(0, children - 1) })}>−</button>
                <b>{children}</b>
                <button type="button" aria-label="More children" disabled={children >= 6} onClick={() => onChange({ children: Math.min(6, children + 1) })}>+</button>
              </span>
            </div>
            <p className="m-trip__note">A child pays 65% of the adult rate. Card totals use this party.</p>
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

function DateMenu({
  value,
  min,
  onPick,
  onClose,
  label,
}: {
  value: string;
  min: string;
  onPick: (iso: string) => void;
  onClose?: () => void;
  label?: string;
}) {
  const selected = parseDay(value);
  const earliest = parseDay(min);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [mobile, setMobile] = useState<boolean | null>(null);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + count }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previousBlocked = new Date(year, month, 0) < earliest;
  const sheet = Boolean(onClose) && mobile === true;

  useLayoutEffect(() => {
    const query = window.matchMedia("(max-width: 1024px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sheet]);

  if (onClose && mobile === null) return null;

  const panel = (
    <>
      {sheet ? (
        <button type="button" className="m-cal-backdrop" aria-label="Close calendar" onClick={onClose} data-picker />
      ) : null}
      <div
        className={`menu cal m-cal-sheet${sheet ? " is-sheet" : ""}`}
        role="dialog"
        aria-modal={sheet || undefined}
        aria-label={label || title}
        data-picker
      >
        {sheet ? <div className="m-cal-sheet__grab" aria-hidden /> : null}
        {label && sheet ? <p className="m-cal-sheet__title">{label}</p> : null}
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
        {sheet && onClose ? (
          <button type="button" className="m-cal-sheet__done" onClick={onClose}>
            Done
          </button>
        ) : null}
      </div>
    </>
  );

  if (sheet && typeof document !== "undefined") {
    return createPortal(panel, document.body);
  }

  return panel;
}

function FilterGroup({
  legend,
  hint,
  items,
  layout,
}: {
  legend: string;
  hint?: string;
  items: { key: string; count: number; checked: boolean; node: ReactNode }[];
  layout?: "pills";
}) {
  const visible = items.filter((item) => item.count > 0 || item.checked);
  if (!visible.length) return null;
  return (
    <fieldset>
      <legend>{legend}</legend>
      {hint ? <span className="hint">{hint}</span> : null}
      {layout === "pills" ? <div className="pills">{visible.map((item) => item.node)}</div> : visible.map((item) => item.node)}
    </fieldset>
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

function Pill({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  if (count === 0 && !checked) return null;
  return (
    <label className="pill">
      {label} <span className="n">{count}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  if (count === 0 && !checked) return null;
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} />
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
  const placeShort = tour.place || tour.region;
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
  const quote = partyQuote(tour, query);
  const currency = tour.currency || "INR";
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
          <span className="kicker__full">{tour.category} · {place}</span>
          <span className="kicker__short">{tour.category} · {placeShort}</span>
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
        <ul className="m-facts" aria-label="Tour details">
          {durationLabel(tour) ? <li><span>{durationLabel(tour)}</span></li> : null}
          {groupLabel(tour) ? <li><span>{groupLabel(tour)}</span></li> : null}
        </ul>
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
        <p className="total">{money(quote.total, currency)}</p>
        <p className="sub">{priceDetail(tour, query)}</p>
        <p className="sub">Total for these travelers</p>
        <details className="breakdown">
          <summary>Price breakdown</summary>
          <p>
            <span>
              {query.adults} × {money(quote.adult, currency)}
            </span>
            <span>{money(quote.adult * query.adults, currency)}</span>
          </p>
          {query.children > 0 ? (
            <p>
              <span>
                {query.children} × {money(quote.child, currency)} child
              </span>
              <span>{money(quote.child * query.children, currency)}</span>
            </p>
          ) : null}
          {quote.singles > 0 ? (
            <p>
              <span>
                {quote.singles} single {quote.singles === 1 ? "room" : "rooms"}
              </span>
              <span>{money(quote.singleFee * quote.singles, currency)}</span>
            </p>
          ) : null}
          <p>
            <span>Total</span>
            <span>{money(quote.total, currency)}</span>
          </p>
        </details>
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
  onClose,
  onDate,
}: {
  tour: CatalogTour;
  query: CatalogQuery;
  today: string;
  onClose: () => void;
  onDate: (iso: string) => void;
}) {
  const status = statusOf(tour, query.date);
  const cancel = cancelInfo(tour, query, today);
  const next = status === "ok" ? null : nextOpen(tour, query.date);
  const quote = partyQuote(tour, query);
  const currency = tour.currency || "INR";
  const place = tour.place === tour.region ? tour.place : `${tour.place}, ${tour.region}`;
  const includes = tour.includes.slice(0, 5);

  return (
    <div className="preview-body">
      <div className="preview-media">
        {tour.img ? <img alt={tour.alt} src={tour.img} /> : <div className="preview-media__empty" />}
        <button className="preview-close" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="preview-copy">
        <p className="kicker">
          {tour.category} · {place}
        </p>
        <h2 id="tour-title">{tour.title}</h2>
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
          {durationLabel(tour)} · {groupLabel(tour)} · {tour.langs.join(", ")}
        </p>
        <p className="mention">{tour.meetShort}</p>
        {tour.story ? <p className="lede">{tour.story}</p> : null}
        {tour.levelNote ? <p className="expect">{tour.levelNote}</p> : null}
        {includes.length ? (
          <div className="tags">
            {includes.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
            {tour.includes.length > includes.length ? <span className="tag">+{tour.includes.length - includes.length} more</span> : null}
          </div>
        ) : null}
        <div className="preview-price">
          <div>
            <p className="total">{money(quote.total, currency)}</p>
            <p className="sub">{priceDetail(tour, query)}</p>
            <p className="sub">Total for these travelers</p>
            <p className={cancel.kind === "yes" ? "ok" : cancel.kind === "no" ? "warn" : "muted"}>{cancel.text}</p>
            {status !== "ok" ? (
              <p className="warn">{status === "sold" ? `Sold out on ${prettyDate(query.date)}` : `Does not run on ${DAY[weekday(query.date)]}`}</p>
            ) : null}
          </div>
          <div className="preview-actions">
            <Link className="btn" href={tour.href}>
              See the tour
            </Link>
            {next ? (
              <button className="btn btn--ghost" type="button" onClick={() => onDate(next)}>
                Next date · {prettyDate(next)}
              </button>
            ) : null}
          </div>
        </div>
      </div>
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
) {
  const count = 12;
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
  return counts.map((value, index) => {
    const start = Math.round(lo + index * step);
    const end = Math.round(lo + (index + 1) * step);
    return {
      start,
      end,
      count: value,
      height: Math.max(8, Math.round((value / peak) * 100)),
    };
  });
}
