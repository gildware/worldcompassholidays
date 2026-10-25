"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFavoriteList } from "@/components/favorites/FavoriteButton";
import { createPortal } from "react-dom";
import { useLazySlice } from "@/hooks/useLazySlice";
import {
  activeFilters,
  bestFlags,
  cancelFact,
  centroid,
  clampStay,
  clearFilters,
  clearOne,
  compareHotels,
  exceptFor,
  guestText,
  histogram,
  hotelsInPlace,
  isWifi,
  kmFromCentre,
  matches,
  money,
  addDays,
  nightsBetween,
  parseISO,
  quickPicks,
  rangeLabel,
  rateBounds,
  readStayState,
  refundable,
  scoreTone,
  scoreWord,
  sortCopy,
  stayHref,
  stayTotal,
  toISO,
  whereLine,
  writeStayQuery,
  type StayListHotel,
  type StayListState,
  type StayPlace,
} from "@/lib/hotels/stay-list";
import "@/styles/hotel-list-stay.css";
import "@/styles/listing-app.css";

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function amenityCount(hotels: StayListHotel[], state: StayListState, saved: Set<string>, today: Date, name: string) {
  const others = state.amenities.filter((item) => item !== name);
  return hotels.filter(
    (hotel) =>
      matches(hotel, state, saved, today, "amenities") &&
      hotel.amenities.includes(name) &&
      others.every((item) => hotel.amenities.includes(item)),
  ).length;
}

export function HotelStayList({
  hotels,
  places,
  initial,
  defaults,
  taxEnabled = false,
  savedIds = [],
  signedIn = false,
}: {
  hotels: StayListHotel[];
  places: StayPlace[];
  initial: StayListState;
  defaults: { checkin: string; checkout: string };
  taxEnabled?: boolean;
  savedIds?: string[];
  signedIn?: boolean;
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [state, setState] = useState(initial);
  const favorites = useFavoriteList(savedIds, signedIn);
  const saved = favorites.saved;
  const [photos, setPhotos] = useState<Record<string, number>>({});
  const [menu, setMenu] = useState<null | "place" | "in" | "out" | "who" | "sort" | "dock-sort" | "m-place" | "trip">(null);
  const [searching, setSearching] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [hotId, setHotId] = useState("");
  const [toast, setToast] = useState("");
  const [live, setLive] = useState("");
  const topRef = useRef<HTMLElement>(null);
  const filtersRef = useRef<HTMLFormElement>(null);
  const closeFiltersRef = useRef<HTMLButtonElement>(null);
  const openFiltersRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ready = useRef(false);
  const savedSet = useMemo(() => new Set(saved), [saved]);
  const currency = hotels.find((hotel) => inPlaceCurrency(hotel, state.place))?.currency || hotels[0]?.currency || "INR";

  const pool = useMemo(() => hotelsInPlace(hotels, state.place), [hotels, state.place]);
  const centre = useMemo(() => centroid(pool), [pool]);
  const centreName = state.place === "all" ? "" : places.find((place) => place.id === state.place)?.name || "";
  const distance = useMemo(() => {
    const map = new Map<string, number | null>();
    pool.forEach((hotel) => map.set(hotel.id, kmFromCentre(hotel, centre)));
    return map;
  }, [centre, pool]);
  const bounds = useMemo(() => rateBounds(pool), [pool]);
  const picks = useMemo(() => quickPicks(pool), [pool]);
  const nights = nightsBetween(state.checkin, state.checkout);
  const results = useMemo(() => {
    return pool
      .filter((hotel) => matches(hotel, state, savedSet, today))
      .sort((a, b) => compareHotels(a, b, state, distance, taxEnabled));
  }, [distance, pool, savedSet, state, taxEnabled, today]);
  const windowKey = useMemo(
    () =>
      [
        state.place,
        state.q,
        state.sort,
        state.checkin,
        state.checkout,
        state.adults,
        state.children,
        state.rooms,
        state.minPrice,
        state.maxPrice,
        state.breakfast,
        state.cancel,
        state.pay,
        state.savedOnly,
        state.stars.join("\0"),
        state.types.join("\0"),
        state.areas.join("\0"),
        state.amenities.join("\0"),
        [...savedSet].join("\0"),
      ].join("|"),
    [savedSet, state],
  );
  const { visible, sentinelRef, hasMore } = useLazySlice(results, windowKey);
  const filters = activeFilters(state, bounds, currency);
  const placeName = state.place === "all" ? "All stays" : places.find((place) => place.id === state.place)?.name || "Stays";
  const requestHref = useMemo(() => {
    const params = new URLSearchParams({
      checkIn: state.checkin,
      checkOut: state.checkout,
      adults: String(state.adults),
      children: String(state.children),
      rooms: String(state.rooms),
    });
    if (state.place !== "all" && placeName !== "Stays") params.set("destination", placeName);
    return `/hotels/request?${params.toString()}`;
  }, [placeName, state.adults, state.checkin, state.checkout, state.children, state.place, state.rooms]);
  const types = [...new Set(pool.map((hotel) => hotel.type))].sort((a, b) => a.localeCompare(b));
  const areas = [...new Set(pool.map((hotel) => hotel.area).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const amenityNames = [...new Set(pool.flatMap((hotel) => hotel.amenities))]
    .filter((name) => !(picks && pool.every((hotel) => hotel.amenities.some((item) => isWifi(item))) && isWifi(name)))
    .sort((a, b) => a.localeCompare(b));
  const starOptions = [5, 4, 3, 2, 1].filter(
    (star) => pool.some((hotel) => hotel.stars === star) || state.stars.includes(String(star)),
  );
  const wifiEverywhere = pool.length > 0 && pool.every((hotel) => hotel.amenities.some((name) => isWifi(name)));
  const gst = taxEnabled && currency === "INR";

  useEffect(() => {
    const next = clampStay(state, today, bounds);
    const changed =
      next.checkin !== state.checkin ||
      next.checkout !== state.checkout ||
      next.minPrice !== state.minPrice ||
      next.maxPrice !== state.maxPrice ||
      next.adults !== state.adults ||
      next.rooms !== state.rooms;
    if (changed) setState(next);
  }, [bounds, state, today]);

  useEffect(() => {
    const query = writeStayQuery(state, defaults);
    try {
      sessionStorage.setItem("wch-list-query", query);
    } catch {
      /* private mode */
    }
    if (!ready.current) {
      ready.current = true;
      return;
    }
    const want = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (want !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", want);
    }
  }, [defaults, state]);

  useEffect(() => {
    const onPop = () => {
      const params = Object.fromEntries(new URLSearchParams(window.location.search));
      setState(readStayState(params, { places: places.map((place) => place.id), ...defaults }));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [defaults, places]);

  useEffect(() => {
    const message = `${results.length} ${results.length === 1 ? "stay" : "stays"} in ${placeName}`;
    setLive((current) => (current === message ? current : message));
  }, [placeName, results.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (compareOpen && !dialog.open) dialog.showModal();
    if (!compareOpen && dialog.open) dialog.close();
  }, [compareOpen]);

  useEffect(() => {
    if (!compareOpen) return;
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
      const dialog = dialogRef.current;
      const box = event.target instanceof Element ? event.target.closest(".sl-dialog") : null;
      if (!dialog?.open || !(box instanceof HTMLElement) || box.scrollHeight <= box.clientHeight + 1) {
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
  }, [compareOpen]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (event: PointerEvent) => {
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
      document.addEventListener("pointerdown", onDown);
    }, 0);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (!filtersOpen) return;
    closeFiltersRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function patch(partial: Partial<StayListState>) {
    setState((current) => ({ ...current, ...partial }));
  }

  function toggleMenu(next: "place" | "in" | "out" | "who" | "sort") {
    setMenu((current) => (current === next ? null : next));
  }

  const sortOptions: { value: StayListState["sort"]; label: string }[] = [
    { value: "best", label: "Best for these dates" },
    ...(picks.hasScores ? [{ value: "score" as const, label: "Guest score" }] : []),
    { value: "price", label: "Lowest total" },
    { value: "price-desc", label: "Highest total" },
    { value: "distance", label: "Closest" },
    { value: "stars", label: "Star rating" },
  ];
  const sortLabel = sortOptions.find((option) => option.value === state.sort)?.label ?? "Best for these dates";

  function toggleSave(id: string) {
    void favorites.toggle("hotel", id);
  }

  function toggleCompare(id: string) {
    setState((current) => {
      if (current.compare.includes(id)) return { ...current, compare: current.compare.filter((item) => item !== id) };
      if (current.compare.length >= 3) return current;
      return { ...current, compare: [...current.compare, id] };
    });
  }

  function facet(except: Parameters<typeof matches>[4], pred: (hotel: StayListHotel) => boolean) {
    return pool.filter((hotel) => matches(hotel, state, savedSet, today, except) && pred(hotel)).length;
  }

  function jump(id: string) {
    document.querySelector(`[data-stay="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHotId(id);
    window.setTimeout(() => setHotId((current) => (current === id ? "" : current)), 1600);
  }

  function openFilters() {
    if (window.matchMedia("(min-width: 1081px)").matches) return;
    setFiltersOpen(true);
  }

  function closeFilters() {
    setFiltersOpen(false);
    openFiltersRef.current?.focus();
  }

  const people = state.adults + state.children;
  const whoNote =
    people > state.rooms * 3
      ? `More than three guests in a room may need an extra bed. The total is still for ${state.rooms} room${state.rooms > 1 ? "s" : ""}, not per guest.`
      : "The total is for the rooms, not per guest.";
  const lo = state.minPrice ?? bounds.min;
  const hi = state.maxPrice ?? bounds.max;
  const span = bounds.max === bounds.min ? 1 : bounds.max - bounds.min;
  const bars = histogram(pool, bounds);
  const compared = state.compare.flatMap((id) => {
    const hotel = hotels.find((item) => item.id === id);
    return hotel ? [hotel] : [];
  });
  const cheapest = results.reduce<StayListHotel | null>((best, hotel) => {
    if (!best) return hotel;
    return totalOf(hotel) <= totalOf(best) ? hotel : best;
  }, null);
  const highest = results.reduce<StayListHotel | null>((best, hotel) => {
    if (!best) return hotel;
    if (picks.hasScores) {
      const score = hotel.score ?? -1;
      const bestScore = best.score ?? -1;
      if (score === bestScore) return (hotel.reviews ?? 0) >= (best.reviews ?? 0) ? hotel : best;
      return score > bestScore ? hotel : best;
    }
    return hotel.stars > best.stars || (hotel.stars === best.stars && totalOf(hotel) < totalOf(best)) ? hotel : best;
  }, null);

  function totalOf(hotel: StayListHotel) {
    return stayTotal(hotel.nightly, nights, state.rooms, hotel.currency, taxEnabled).total;
  }

  const quickChips: { id: string; label: string; on: boolean }[] = [];
  if (pool.some((hotel) => refundable(hotel, state.checkin, today)) && pool.some((hotel) => !refundable(hotel, state.checkin, today))) {
    quickChips.push({ id: "cancel", label: "Free cancellation", on: state.cancel });
  } else if (state.cancel) quickChips.push({ id: "cancel", label: "Free cancellation", on: true });
  if (pool.some((hotel) => hotel.breakfast) && pool.some((hotel) => !hotel.breakfast)) {
    quickChips.push({ id: "breakfast", label: "Breakfast included", on: state.breakfast });
  } else if (state.breakfast) quickChips.push({ id: "breakfast", label: "Breakfast included", on: true });
  if (picks.hasScores && pool.some((hotel) => (hotel.score ?? 0) >= 9) && pool.some((hotel) => (hotel.score ?? 0) < 9)) {
    quickChips.push({ id: "score", label: "Guest score 9+", on: state.minScore >= 9 });
  } else if (state.minScore >= 9) quickChips.push({ id: "score", label: "Guest score 9+", on: true });
  if (picks.amenity) quickChips.push({ id: "amenity", label: picks.amenity, on: state.amenities.includes(picks.amenity) });
  if (picks.priceCap != null) {
    quickChips.push({
      id: "price",
      label: `Under ${money(picks.priceCap, currency)} a night`,
      on: state.minPrice == null && state.maxPrice === picks.priceCap,
    });
  }
  if (picks.type) quickChips.push({ id: "type", label: picks.type, on: state.types.includes(picks.type) });

  const covered = new Set<string>();
  if (state.cancel) covered.add("cancel");
  if (state.breakfast) covered.add("breakfast");
  if (state.minScore >= 9) covered.add("score");
  if (picks.amenity && state.amenities.includes(picks.amenity)) covered.add(`amenity:${picks.amenity}`);
  if (picks.priceCap != null && state.minPrice == null && state.maxPrice === picks.priceCap) covered.add("price");
  if (picks.type && state.types.includes(picks.type)) covered.add(`type:${picks.type}`);

  function pressQuick(id: string) {
    if (id === "cancel") patch({ cancel: !state.cancel });
    else if (id === "breakfast") patch({ breakfast: !state.breakfast });
    else if (id === "score") patch({ minScore: state.minScore >= 9 ? 0 : 9 });
    else if (id === "amenity" && picks.amenity) patch({ amenities: toggleValue(state.amenities, picks.amenity) });
    else if (id === "price" && picks.priceCap != null) {
      if (state.minPrice == null && state.maxPrice === picks.priceCap) patch({ minPrice: null, maxPrice: null });
      else patch({ minPrice: null, maxPrice: picks.priceCap });
    } else if (id === "type" && picks.type) patch({ types: toggleValue(state.types, picks.type) });
  }

  const blocking = filters
    .map(([key, label]) => ({
      key,
      label,
      n: pool.filter((hotel) => matches(hotel, state, savedSet, today, exceptFor(key))).length,
    }))
    .sort((a, b) => b.n - a.n)[0];

  async function share() {
    const query = writeStayQuery(state, defaults);
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied");
    } catch {
      setToast("Copy the address from the browser bar");
    }
  }

  const compareRows: [string, boolean[], string[]][] = compared.length
    ? [
        [gst ? "Total, GST included" : "Total", bestFlags(compared.map((hotel) => totalOf(hotel)), true), compared.map((hotel) => money(totalOf(hotel), hotel.currency))],
        [gst ? "A night, before GST" : "A night", bestFlags(compared.map((hotel) => hotel.nightly), true), compared.map((hotel) => money(hotel.nightly, hotel.currency))],
        ...(gst
          ? [[
              "GST 18%",
              bestFlags(compared.map((hotel) => stayTotal(hotel.nightly, nights, state.rooms, hotel.currency, true).tax), true),
              compared.map((hotel) => money(stayTotal(hotel.nightly, nights, state.rooms, hotel.currency, true).tax, hotel.currency)),
            ] as [string, boolean[], string[]]]
          : []),
        ...(picks.hasScores
          ? [[
              "Guest score",
              bestFlags(compared.map((hotel) => hotel.score ?? 0), false),
              compared.map((hotel) => (hotel.score != null ? `${hotel.score.toFixed(1)} ${scoreWord(hotel.score)}` : "—")),
            ] as [string, boolean[], string[]]]
          : []),
        ["Stars", bestFlags(compared.map((hotel) => hotel.stars), false), compared.map((hotel) => (hotel.stars ? `${hotel.stars} star` : "Unrated"))],
        ["Distance", bestFlags(compared.map((hotel) => distance.get(hotel.id) ?? Number.POSITIVE_INFINITY), true), compared.map((hotel) => whereLine(hotel, distance.get(hotel.id) ?? null, centreName) || hotel.town)],
        ["Breakfast", bestFlags(compared.map((hotel) => (hotel.breakfast ? 1 : 0)), false), compared.map((hotel) => (hotel.breakfast ? "Included" : "Not included"))],
        ["Cancellation", bestFlags(compared.map((hotel) => (refundable(hotel, state.checkin, today) ? 1 : 0)), false), compared.map((hotel) => cancelFact(hotel, state.checkin, today).text)],
        ...(picks.hasPay
          ? [[
              "Pay at property",
              bestFlags(compared.map((hotel) => (hotel.pay ? 1 : 0)), false),
              compared.map((hotel) => (hotel.pay ? "Yes" : "Pay now")),
            ] as [string, boolean[], string[]]]
          : []),
        ["Type", compared.map(() => false), compared.map((hotel) => [hotel.type, hotel.area].filter(Boolean).join(" · "))],
        ...amenityNames.flatMap((name) => {
          if (compared.every((hotel) => hotel.amenities.includes(name) === compared[0].amenities.includes(name))) return [];
          return [[
            name,
            bestFlags(compared.map((hotel) => (hotel.amenities.includes(name) ? 1 : 0)), false),
            compared.map((hotel) => (hotel.amenities.includes(name) ? "Yes" : "No")),
          ] as [string, boolean[], string[]]];
        }),
      ]
    : [];

  return (
    <div className={`stay-list${state.compare.length ? " has-compare" : ""}${filtersOpen || compareOpen ? " is-locked" : ""}`}>
      <a className="sl-skip" href="#list">Skip to stays</a>
      <header className={`sl-top${searching ? " is-searching" : ""}`} ref={topRef} inert={filtersOpen}>
        <div className="sl-top__row">
          <button className="sl-summary" type="button" onClick={() => { setSearching(true); }}>
            <strong>{placeName}</strong>
            <span>{rangeLabel(state.checkin, state.checkout)} · {guestText(state.adults, state.children, state.rooms)}</span>
          </button>

          <div className="m-bar app-chrome-mobile" data-picker>
            <div className="m-bar__row">
              <button
                className="m-bar__loc"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menu === "m-place"}
                aria-label="Location"
                onClick={() => setMenu((current) => (current === "m-place" ? null : "m-place"))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{state.place === "all" ? "Anywhere" : placeName}</span>
              </button>
              <form
                className="m-bar__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4 4" />
                </svg>
                <input
                  value={state.q}
                  onChange={(event) => patch({ q: event.target.value })}
                  placeholder="Search hotels"
                  aria-label="Search hotels"
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
                {rangeLabel(state.checkin, state.checkout)} · {guestText(state.adults, state.children, state.rooms)}
              </button>
              <div className="m-bar__tools" aria-label="Listing actions">
                <button className="m-bar__filter" type="button" onClick={openFilters}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                  {filters.length ? `Filters · ${filters.length}` : "Filters"}
                </button>
                <div className="m-bar__sort" data-picker>
                  <button
                    className="m-bar__sort-btn"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={menu === "dock-sort"}
                    aria-label={`Sort: ${sortLabel}`}
                    onClick={() => setMenu((current) => (current === "dock-sort" ? null : "dock-sort"))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M7 6v12M7 18l-2.5-2.5M7 18l2.5-2.5M17 18V6M17 6l-2.5 2.5M17 6l2.5 2.5" />
                    </svg>
                    Sort
                  </button>
                  {menu === "dock-sort" ? (
                    <div className="sl-menu" role="listbox" aria-label="Sort stays">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={state.sort === option.value}
                          className={state.sort === option.value ? "is-on" : ""}
                          onClick={() => {
                            patch({ sort: option.value });
                            setMenu(null);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {menu === "m-place" ? (
              <div className="m-bar__menu" role="listbox" aria-label="Location">
                <button
                  type="button"
                  role="option"
                  aria-selected={state.place === "all"}
                  className={state.place === "all" ? "is-on" : undefined}
                  onClick={() => {
                    patch({ place: "all", areas: [], types: [] });
                    setMenu(null);
                  }}
                >
                  All stays
                </button>
                {places.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    role="option"
                    aria-selected={state.place === place.id}
                    className={state.place === place.id ? "is-on" : undefined}
                    onClick={() => {
                      patch({ place: place.id, areas: [], types: [] });
                      setMenu(null);
                    }}
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            ) : null}
            {!searching && menu === "trip" ? (
              <StayTripSheet
                checkin={state.checkin}
                checkout={state.checkout}
                adults={state.adults}
                children={state.children}
                rooms={state.rooms}
                today={today}
                whoNote={whoNote}
                onClose={() => setMenu(null)}
                onChange={(next) => patch(next)}
              />
            ) : null}
          </div>

          <form
            className="sl-search-wrap"
            onSubmit={(event) => {
              event.preventDefault();
              setSearching(false);
              setMenu(null);
              document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <div className="sl-search">
              <div className="sl-field sl-place" data-picker>
                <button className="sl-who" type="button" aria-haspopup="listbox" aria-expanded={menu === "place"} aria-label="Destination" onClick={() => toggleMenu("place")}>
                  <span className="sl-k">Where</span>
                  <strong>{placeName}</strong>
                </button>
                {menu === "place" ? (
                  <div className="sl-menu" role="listbox" aria-label="Destination">
                    <button type="button" role="option" aria-selected={state.place === "all"} className={state.place === "all" ? "is-on" : ""} onClick={() => { patch({ place: "all", areas: [], types: [] }); setMenu(null); }}>All stays</button>
                    {places.map((place) => (
                      <button key={place.id} type="button" role="option" aria-selected={state.place === place.id} className={state.place === place.id ? "is-on" : ""} onClick={() => { patch({ place: place.id, areas: [], types: [] }); setMenu(null); }}>{place.name}</button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="sl-field" data-picker>
                <button className="sl-who" type="button" aria-haspopup="dialog" aria-expanded={menu === "in"} aria-label="Check-in" onClick={() => toggleMenu("in")}>
                  <span className="sl-k">Check-in</span>
                  <strong>{prettyStayDate(state.checkin)}</strong>
                </button>
                {searching && menu === "in" ? (
                  <DateMenu
                    label="Check-in"
                    value={state.checkin}
                    min={toISO(today)}
                    onClose={() => setMenu(null)}
                    onPick={(checkin) => {
                      patch({ checkin });
                      setMenu("out");
                    }}
                  />
                ) : null}
              </div>
              <div className="sl-field sl-field--end" data-picker>
                <button className="sl-who" type="button" aria-haspopup="dialog" aria-expanded={menu === "out"} aria-label="Check-out" onClick={() => toggleMenu("out")}>
                  <span className="sl-k">Check-out</span>
                  <strong>{prettyStayDate(state.checkout)}</strong>
                </button>
                {searching && menu === "out" ? (
                  <DateMenu
                    label="Check-out"
                    value={state.checkout}
                    min={toISO(addDays(parseISO(state.checkin), 1))}
                    onClose={() => setMenu(null)}
                    onPick={(checkout) => {
                      patch({ checkout });
                      setMenu(null);
                    }}
                  />
                ) : null}
              </div>
              <div className="sl-field sl-who-wrap" data-picker>
                <button className="sl-who" type="button" aria-expanded={menu === "who"} onClick={() => toggleMenu("who")}>
                  <span className="sl-k">Who</span>
                  <strong>{guestText(state.adults, state.children, state.rooms)}</strong>
                </button>
                {menu === "who" ? (
                  <div className="sl-who-panel">
                    <Step label="Adults" value={state.adults} min={1} max={8} less="Fewer adults" more="More adults" onChange={(adults) => patch({ adults })} />
                    <Step label="Children" value={state.children} min={0} max={6} less="Fewer children" more="More children" onChange={(children) => patch({ children })} />
                    <Step label="Rooms" value={state.rooms} min={1} max={4} less="Fewer rooms" more="More rooms" onChange={(rooms) => patch({ rooms })} />
                    <p className="sl-who-note">{whoNote}</p>
                  </div>
                ) : null}
              </div>
              <button className="sl-btn" type="submit">Search</button>
            </div>
          </form>
          <div className="sl-actions">
            <Link className="sl-btn sl-btn--small" href={requestHref}>Request hotel</Link>
            <button
              className="sl-btn sl-btn--ghost sl-btn--small"
              type="button"
              aria-pressed={state.savedOnly}
              onClick={() => {
                if (!signedIn) {
                  setToast("Log in first to mark it as a favorite");
                  return;
                }
                if (!saved.length && !state.savedOnly) {
                  setToast("Add a hotel from the heart on its photo");
                  return;
                }
                patch({ savedOnly: !state.savedOnly });
              }}
            >
              {saved.length ? `Favorites · ${saved.length}` : "Favorites"}
            </button>
            <button className="sl-btn sl-btn--ghost sl-btn--small" type="button" onClick={share}>Share</button>
          </div>
        </div>
      </header>

      <main className="sl-wrap">
        <div className="sl-page">
          <form
            className={`sl-filters${filtersOpen ? " is-open" : ""}`}
            ref={filtersRef}
            aria-label="Filters"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="sl-filters__top">
              <h2>Filters</h2>
              <button className="sl-btn sl-btn--ghost sl-btn--small sl-filters__close" ref={closeFiltersRef} type="button" onClick={closeFilters}>Close</button>
            </div>
            <div className="sl-filters__body">
            <fieldset>
              <legend>Nightly rate <span>{state.minPrice != null || state.maxPrice != null ? `${money(lo, currency)} – ${money(hi, currency)} a night` : "Any nightly rate"}</span></legend>
              <div className="sl-hist" role="group" aria-label="Price distribution">
                {bars.map((bar) => {
                  const on = bar.upper >= lo - (span / 12) / 2 && bar.low <= hi + (span / 12) / 2;
                  return (
                    <button
                      key={bar.upper}
                      type="button"
                      className={on ? "is-in" : ""}
                      style={{ height: `${bar.height}%` }}
                      aria-label={`${bar.count} ${bar.count === 1 ? "stay" : "stays"} up to ${money(bar.upper, currency)} a night`}
                      onClick={() => patch({ minPrice: null, maxPrice: bar.upper >= bounds.max ? null : bar.upper })}
                    />
                  );
                })}
              </div>
              <div className="sl-range">
                <div className="sl-range__track">
                  <div className="sl-range__fill" style={{ left: `${((lo - bounds.min) / span) * 100}%`, width: `${Math.max(0, ((hi - lo) / span) * 100)}%` }} />
                </div>
                <input type="range" min={bounds.min} max={bounds.max} step={span > 500 ? 100 : 1} aria-label="Minimum nightly rate" value={lo} onChange={(event) => onPrice("min", Number(event.target.value))} />
                <input type="range" min={bounds.min} max={bounds.max} step={span > 500 ? 100 : 1} aria-label="Maximum nightly rate" value={hi} onChange={(event) => onPrice("max", Number(event.target.value))} />
              </div>
              <p className="sl-hint">
                {state.minPrice != null || state.maxPrice != null
                  ? `A stay inside this nightly band totals between ${money(stayTotal(lo, nights, state.rooms, currency, taxEnabled).total, currency)} and ${money(stayTotal(hi, nights, state.rooms, currency, taxEnabled).total, currency)} for ${nights} night${nights > 1 ? "s" : ""}${state.rooms > 1 ? ` and ${state.rooms} rooms` : ""}${gst ? ", GST included" : ""}.`
                  : gst
                    ? "Drag either end. The total on each stay already includes GST."
                    : "Drag either end. The total on each stay is for these dates."}
              </p>
            </fieldset>
            {picks.hasScores ? (
              <fieldset>
                <legend>Guest score</legend>
                <div className="sl-pills">
                  {[0, 8, 9].map((score) => {
                    const count = score === 0 ? null : facet("score", (hotel) => (hotel.score ?? 0) >= score);
                    const checked = (state.minScore >= 9 ? 9 : state.minScore >= 8 ? 8 : 0) === score;
                    return (
                      <label className="sl-pill" key={score}>
                        {score === 0 ? "Any" : `${score}+`}
                        {count != null ? <span className="n">{count}</span> : null}
                        <input type="radio" name="score" checked={checked} onChange={() => patch({ minScore: score })} />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
            {starOptions.length ? (
              <fieldset>
                <legend>Star rating <span>Match any</span></legend>
                <div className="sl-pills">
                  {starOptions.map((star) => {
                    const count = facet("stars", (hotel) => hotel.stars === star);
                    const checked = state.stars.includes(String(star));
                    return (
                      <label className="sl-pill" key={star}>
                        {star}{star >= 4 ? <GoldStar /> : null} <span className="n">{count}</span>
                        <input type="checkbox" checked={checked} disabled={count === 0 && !checked} onChange={() => patch({ stars: toggleValue(state.stars, String(star)) })} />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
            {types.length ? (
              <fieldset>
                <legend>Property type <span>Match any</span></legend>
                {types.map((type) => {
                  const count = facet("types", (hotel) => hotel.type === type);
                  const checked = state.types.includes(type);
                  return (
                    <label className="sl-check" key={type}>
                      <input type="checkbox" checked={checked} disabled={count === 0 && !checked} onChange={() => patch({ types: toggleValue(state.types, type) })} />
                      <span>{type}</span>
                      <span className="n">{count}</span>
                    </label>
                  );
                })}
              </fieldset>
            ) : null}
            {areas.length ? (
              <fieldset>
                <legend>Neighbourhood <span>Match any</span></legend>
                {areas.map((area) => {
                  const count = facet("areas", (hotel) => hotel.area === area);
                  const checked = state.areas.includes(area);
                  return (
                    <label className="sl-check" key={area}>
                      <input type="checkbox" checked={checked} disabled={count === 0 && !checked} onChange={() => patch({ areas: toggleValue(state.areas, area) })} />
                      <span>{area}</span>
                      <span className="n">{count}</span>
                    </label>
                  );
                })}
              </fieldset>
            ) : null}
            <fieldset>
              <legend>Policies</legend>
              <Policy
                label="Breakfast included"
                checked={state.breakfast}
                count={facet("breakfast", (hotel) => hotel.breakfast)}
                onChange={(breakfast) => patch({ breakfast })}
              />
              <Policy
                label="Free cancellation"
                checked={state.cancel}
                count={facet("cancel", (hotel) => refundable(hotel, state.checkin, today))}
                onChange={(cancel) => patch({ cancel })}
              />
              {picks.hasPay ? (
                <Policy
                  label="Pay at the property"
                  checked={state.pay}
                  count={facet("pay", (hotel) => hotel.pay)}
                  onChange={(pay) => patch({ pay })}
                />
              ) : null}
            </fieldset>
            {amenityNames.length ? (
              <fieldset>
                <legend>Amenities <span>Match all</span></legend>
                {amenityNames.map((name) => {
                  const count = amenityCount(pool, state, savedSet, today, name);
                  const checked = state.amenities.includes(name);
                  return (
                    <label className="sl-check" key={name}>
                      <input type="checkbox" checked={checked} disabled={count === 0 && !checked} onChange={() => patch({ amenities: toggleValue(state.amenities, name) })} />
                      <span>{name}</span>
                      <span className="n">{count}</span>
                    </label>
                  );
                })}
                {wifiEverywhere ? <p className="sl-fine">Wi-Fi is in every stay here, so it is not a filter.</p> : null}
              </fieldset>
            ) : null}
            </div>
            <div className="sl-filters__bar">
              <button className="sl-btn sl-btn--ghost" type="button" disabled={filters.length === 0} onClick={() => setState((current) => clearFilters(current))}>Clear</button>
            </div>
          </form>

          <div className="sl-results" id="results" inert={filtersOpen}>
            <header className="sl-head">
              <p className="sl-eyebrow">{rangeLabel(state.checkin, state.checkout)} · {nights} night{nights > 1 ? "s" : ""} · {guestText(state.adults, state.children, state.rooms)}</p>
              <div className="sl-head__row">
                <h1>{placeName}</h1>
              </div>
              <p className="sl-promise">
                {gst ? "Totals include GST. " : ""}Nothing here is paid to rank higher.
              </p>
            </header>
            <div className="sl-toolbar">
              <label className="sl-sr" htmlFor="stay-q">Search by stay name</label>
              <input id="stay-q" className="sl-find" type="search" placeholder="Search by name" autoComplete="off" enterKeyHint="search" value={state.q} onChange={(event) => patch({ q: event.target.value })} />
              <div className="sl-tools">
                <div className="sl-sort sl-field sl-field--end" data-picker>
                  <span>Sort</span>
                  <button className="sl-sort-btn" type="button" aria-haspopup="listbox" aria-expanded={menu === "sort"} aria-label="Sort stays" onClick={() => toggleMenu("sort")}>{sortLabel}</button>
                  {menu === "sort" ? (
                    <div className="sl-menu" role="listbox" aria-label="Sort stays">
                      {sortOptions.map((option) => (
                        <button key={option.value} type="button" role="option" aria-selected={state.sort === option.value} className={state.sort === option.value ? "is-on" : ""} onClick={() => { patch({ sort: option.value }); setMenu(null); }}>{option.label}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button className="sl-btn sl-btn--ghost sl-btn--small sl-open-filters" ref={openFiltersRef} type="button" onClick={openFilters}>
                  {filters.length ? `Filters · ${filters.length}` : "Filters"}
                </button>
              </div>
            </div>
            <p className="sl-sort-note">{sortCopy(state.sort, picks.hasScores, centreName || "the middle of these stays", gst)}</p>
            <div className="sl-chips" aria-label="Quick filters">
              {quickChips.map((chip) => (
                <button key={chip.id} className={`sl-chip${chip.on ? " is-on" : ""}`} type="button" aria-pressed={chip.on} onClick={() => pressQuick(chip.id)}>{chip.label}</button>
              ))}
              {filters.filter(([key]) => !covered.has(key)).map(([key, label]) => (
                <button key={key} className="sl-chip is-on" type="button" onClick={() => setState((current) => clearOne(current, key))}>
                  {label} <span className="x" aria-hidden="true">×</span><span className="sl-sr">Remove</span>
                </button>
              ))}
              {filters.length ? (
                <button className="sl-chip" type="button" onClick={() => setState((current) => clearFilters(current))}>Clear filters</button>
              ) : null}
            </div>
            {results.length > 1 && cheapest && highest ? (
              <div className="sl-insight">
                {cheapest.id === highest.id ? (
                  <>
                    <button className="sl-textlink" type="button" onClick={() => jump(cheapest.id)}>{cheapest.name}</button>
                    {picks.hasScores
                      ? ` is both the highest guest score and the lowest total, ${money(totalOf(cheapest), cheapest.currency)}.`
                      : ` is both a top star rating and the lowest total, ${money(totalOf(cheapest), cheapest.currency)}.`}
                  </>
                ) : (
                  <>
                    Lowest total is <button className="sl-textlink" type="button" onClick={() => jump(cheapest.id)}>{cheapest.name}</button> at {money(totalOf(cheapest), cheapest.currency)}.
                    {" "}
                    {picks.hasScores && highest.score != null ? (
                      <>Highest guest score is <button className="sl-textlink" type="button" onClick={() => jump(highest.id)}>{highest.name}</button> at {highest.score.toFixed(1)}.</>
                    ) : (
                      <>Highest star rating is <button className="sl-textlink" type="button" onClick={() => jump(highest.id)}>{highest.name}</button>.</>
                    )}
                  </>
                )}
              </div>
            ) : null}
            <Link className="sl-request" href={requestHref}>
              <span>Not on this list? Ask us to find a stay.</span>
              <strong>Request hotel</strong>
            </Link>
            <div className="sl-list" id="list">
              {results.length === 0 ? (
                <div className="sl-empty">
                  <h2>No stays match</h2>
                  <p>
                    {blocking && blocking.n
                      ? `${blocking.label} is the filter holding results back. Removing it brings back ${blocking.n} ${blocking.n === 1 ? "stay" : "stays"}.`
                      : "Nothing in this place matches these dates and filters together."}
                  </p>
                  <div className="sl-empty__actions">
                    {blocking && blocking.n ? (
                      <button className="sl-btn" type="button" onClick={() => setState((current) => clearOne(current, blocking.key))}>Remove {blocking.label}</button>
                    ) : null}
                    {state.place !== "all" ? (
                      <button className="sl-btn sl-btn--ghost" type="button" onClick={() => patch({ place: "all", areas: [], types: [] })}>Search all stays</button>
                    ) : null}
                    <button className="sl-btn sl-btn--ghost" type="button" onClick={() => setState((current) => clearFilters(current))}>Clear filters</button>
                  </div>
                </div>
              ) : (
                <>
                  {visible.map((hotel, index) => (
                    <StayCard
                      key={hotel.id}
                      hotel={hotel}
                      index={index}
                      state={state}
                      nights={nights}
                      saved={savedSet.has(hotel.id)}
                      photo={photos[hotel.id] || 0}
                      hot={hotId === hotel.id}
                      km={distance.get(hotel.id) ?? null}
                      centreName={centreName}
                      compared={state.compare.includes(hotel.id)}
                      compareFull={!state.compare.includes(hotel.id) && state.compare.length >= 3}
                      today={today}
                      taxEnabled={taxEnabled}
                      onPhoto={(index) => setPhotos((current) => ({ ...current, [hotel.id]: index }))}
                      onSave={() => toggleSave(hotel.id)}
                      onCompare={() => toggleCompare(hotel.id)}
                    />
                  ))}
                  {hasMore ? <div ref={sentinelRef} className="stay-list__more" aria-hidden="true" /> : null}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="sl-footer">
        <div className="sl-wrap">
          {gst ? "The total on every stay includes GST. " : ""}
          A stay cannot pay to move up the list. See availability opens the stay with these dates.
        </div>
      </footer>

      {filtersOpen ? <button className="sl-shade" type="button" aria-label="Close filters" onClick={closeFilters} /> : null}
      {state.compare.length ? (
        <div className="sl-compare">
          <div className="sl-slots">
            {compared.map((hotel) => (
              <div className="sl-slot" key={hotel.id}>
                <img src={hotel.photos[0]?.src || "/img/general/map.svg"} alt="" />
                <span>{hotel.name}</span>
                <button type="button" aria-label={`Remove ${hotel.name} from compare`} onClick={() => toggleCompare(hotel.id)}>×</button>
              </div>
            ))}
          </div>
          <button className="sl-btn sl-btn--small sl-btn--quiet" type="button" onClick={() => patch({ compare: [] })}>Clear</button>
          <button className="sl-btn sl-btn--small" type="button" disabled={state.compare.length < 2} onClick={() => setCompareOpen(true)}>
            {state.compare.length >= 2 ? `Compare ${state.compare.length}` : "Pick one more"}
          </button>
        </div>
      ) : null}
      <p className="sl-sr" aria-live="polite">{live}</p>
      <div className={`sl-toast${toast ? " is-on" : ""}`} role="status">{toast}</div>

      <dialog className="sl-dialog sl-dialog--compare" ref={dialogRef} aria-labelledby="compare-title" onClose={() => setCompareOpen(false)}>
        <div className="sl-dialog-pad">
          <div className="sl-dialog-head">
            <div>
              <h2 id="compare-title">Compare stays</h2>
              <p className="sl-fine">Green marks the stronger value on that row, when the stays differ.</p>
            </div>
            <button className="sl-btn sl-btn--ghost sl-btn--small" type="button" onClick={() => setCompareOpen(false)}>Close</button>
          </div>
          <div className="sl-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col"> </th>
                  {compared.map((hotel) => (
                    <th key={hotel.id}>
                      <div className="sl-compare-hotel">
                        {hotel.photos[0] ? <img src={hotel.photos[0].src} alt="" /> : null}
                        <span>{hotel.name}</span>
                        <Link href={stayHref(hotel, state)}>See availability</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([label, flags, values]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {values.map((value, index) => (
                      <td key={`${label}-${index}`} className={flags[index] ? "is-best" : ""}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    </div>
  );

  function onPrice(which: "min" | "max", value: number) {
    let low = which === "min" ? value : lo;
    let high = which === "max" ? value : hi;
    if (low > high) {
      if (which === "min") low = high;
      else high = low;
    }
    patch({
      minPrice: low <= bounds.min ? null : low,
      maxPrice: high >= bounds.max ? null : high,
    });
  }
}

function inPlaceCurrency(hotel: StayListHotel, place: string) {
  return place === "all" || hotel.townId === place;
}

function Step({
  label,
  value,
  min,
  max,
  less,
  more,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  less: string;
  more: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="sl-guest">
      <span>{label}</span>
      <div className="sl-step">
        <button type="button" aria-label={less} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <b>{value}</b>
        <button type="button" aria-label={more} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

function Policy({
  label,
  checked,
  count,
  onChange,
}: {
  label: string;
  checked: boolean;
  count: number;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="sl-check">
      <input type="checkbox" checked={checked} disabled={count === 0 && !checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
      <span className="n">{count}</span>
    </label>
  );
}

function StayCard({
  hotel,
  index,
  state,
  nights,
  saved,
  photo,
  hot,
  km,
  centreName,
  compared,
  compareFull,
  today,
  taxEnabled,
  onPhoto,
  onSave,
  onCompare,
}: {
  hotel: StayListHotel;
  index: number;
  state: StayListState;
  nights: number;
  saved: boolean;
  photo: number;
  hot: boolean;
  km: number | null;
  centreName: string;
  compared: boolean;
  compareFull: boolean;
  today: Date;
  taxEnabled: boolean;
  onPhoto: (index: number) => void;
  onSave: () => void;
  onCompare: () => void;
}) {
  const total = stayTotal(hotel.nightly, nights, state.rooms, hotel.currency, taxEnabled);
  const shot = hotel.photos[photo] || hotel.photos[0];
  const cancel = cancelFact(hotel, state.checkin, today);
  const favourite = (hotel.score ?? 0) >= 9.5;
  const href = stayHref(hotel, state);
  const bits = [
    state.breakfast && hotel.breakfast ? "breakfast" : "",
    state.cancel && refundable(hotel, state.checkin, today) ? "free cancellation" : "",
    state.pay && hotel.pay ? "pay at the property" : "",
    ...state.amenities.filter((name) => hotel.amenities.includes(name)).map((name) => name.toLowerCase()),
  ].filter(Boolean);
  const nightLine = state.rooms > 1
    ? `${money(hotel.nightly, hotel.currency)} × ${nights} nights × ${state.rooms} rooms`
    : `${money(hotel.nightly, hotel.currency)} × ${nights} night${nights > 1 ? "s" : ""}`;
  const stars = hotel.stars > 0 ? "★".repeat(Math.min(5, hotel.stars)) + "☆".repeat(Math.max(0, 5 - hotel.stars)) : "";

  return (
    <article className={`sl-card${hot ? " is-hot" : ""}`} data-stay={hotel.id}>
      <div className="sl-photos">
        <Link className="sl-shot" href={href} aria-label={`Photos of ${hotel.name}`}>
          {shot ? (
            <img src={shot.src} alt={shot.alt} width={900} height={600} fetchPriority={index === 0 ? "high" : undefined} loading={index === 0 ? undefined : "lazy"} decoding="async" />
          ) : null}
        </Link>
        <button className="sl-save" type="button" aria-pressed={saved} aria-label={`${saved ? "Remove" : "Add"} ${hotel.name} ${saved ? "from" : "to"} favorites`} onClick={onSave}>{saved ? "♥" : "♡"}</button>
        {favourite ? <span className="sl-badge">Guest favourite</span> : null}
        {hotel.photos.length > 1 ? (
          <div className="sl-dots" role="tablist" aria-label={`Photos of ${hotel.name}`}>
            {hotel.photos.map((item, photoIndex) => (
              <button
                key={`${hotel.id}-${item.src}-${photoIndex}`}
                type="button"
                role="tab"
                aria-selected={photoIndex === photo}
                aria-label={`Photo ${photoIndex + 1} of ${hotel.photos.length}`}
                className={photoIndex === photo ? "is-on" : undefined}
                onClick={() => onPhoto(photoIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="sl-body">
        <div>
          <p className="sl-kicker">{hotel.type}{favourite ? <span className="sl-fav"> · Guest favourite</span> : null}</p>
          <h2><Link href={href}>{hotel.name}</Link></h2>
          {stars ? <p className="sl-stars" aria-label={`${hotel.stars} of 5 stars`}>{stars}</p> : null}
          <p className="sl-where">{whereLine(hotel, km, centreName)}</p>
          {hotel.score != null ? (
            <div className="sl-score">
              <b className={scoreTone(hotel.score)}>{hotel.score.toFixed(1)}</b>
              <span>
                <strong>{scoreWord(hotel.score)}</strong>
                <span>{hotel.reviews != null ? `${new Intl.NumberFormat("en-IN").format(hotel.reviews)} reviews` : "Guest score"}</span>
              </span>
            </div>
          ) : null}
          {hotel.parts ? <p className="sl-parts">Clean {hotel.parts[0].toFixed(1)} · Place {hotel.parts[1].toFixed(1)} · Sleep {hotel.parts[2].toFixed(1)}</p> : null}
          {hotel.line ? <p className="sl-blurb">{hotel.line}</p> : null}
          <ul className="sl-facts">
            <li className={cancel.ok ? "sl-ok" : "sl-muted"}>{cancel.text}</li>
            <li className={hotel.breakfast ? "sl-ok" : "sl-muted"}>{hotel.breakfast ? "Breakfast included" : "Breakfast not included"}</li>
            {hotel.pay ? <li>Pay at the property</li> : null}
          </ul>
          <ul className="m-facts" aria-label="Stay details">
            {whereLine(hotel, km, centreName) ? <li><span>{whereLine(hotel, km, centreName)}</span></li> : null}
            {hotel.stars > 0 ? <li><span>{`${hotel.stars}-star`}</span></li> : null}
            {hotel.breakfast ? <li className="is-ok"><span>Breakfast included</span></li> : null}
          </ul>
          {bits.length ? <p className="sl-match">Matches {bits.join(", ")}</p> : null}
          {hotel.amenities.length ? (
            <div className="sl-tags">
              {hotel.amenities.slice(0, 4).map((name) => (
                <span className={`sl-tag${state.amenities.includes(name) ? " is-hit" : ""}`} key={name}>{name}</span>
              ))}
              {hotel.amenities.length > 4 ? <span className="sl-tag">+{hotel.amenities.length - 4}</span> : null}
            </div>
          ) : null}
        </div>
        <div className="sl-side">
          <p className="sl-total">{money(total.total, hotel.currency)}</p>
          <p className="sl-sub">{nightLine}</p>
          <p className="sl-sub">{total.tax ? "GST included" : "Total for these dates"}</p>
          {hotel.left != null && hotel.left <= 3 ? <p className="sl-warn">{hotel.left} room{hotel.left === 1 ? "" : "s"} left at this rate</p> : null}
          <details className="sl-breakdown">
            <summary>Price breakdown</summary>
            <p><span>{hotel.roomName || "Rooms"}</span><span>{money(total.roomSum, hotel.currency)}</span></p>
            {total.tax ? <p><span>GST 18%</span><span>{money(total.tax, hotel.currency)}</span></p> : null}
            <p><span>Total</span><span>{money(total.total, hotel.currency)}</span></p>
          </details>
          <Link className="sl-btn" href={href}>See availability</Link>
          <label className="sl-cmp">
            <input type="checkbox" checked={compared} disabled={compareFull} onChange={onCompare} /> Compare
          </label>
        </div>
      </div>
    </article>
  );
}

function prettyStayDate(iso: string) {
  return parseISO(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function GoldStar() {
  return (
    <svg className="sl-star" viewBox="0 0 12 12" aria-hidden="true">
      <path fill="currentColor" d="M6 .7 7.45 4.05l3.7.32-2.82 2.42.86 3.62L6 8.7 2.81 10.4l.86-3.62L.85 4.37l3.7-.32L6 .7z" />
    </svg>
  );
}

function StayTripSheet({
  checkin,
  checkout,
  adults,
  children,
  rooms,
  today,
  whoNote,
  onClose,
  onChange,
}: {
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  today: Date;
  whoNote: string;
  onClose: () => void;
  onChange: (next: Partial<StayListState>) => void;
}) {
  const [focus, setFocus] = useState<"in" | "out">("in");
  const value = focus === "in" ? checkin : checkout;
  const min = focus === "in" ? toISO(today) : toISO(addDays(parseISO(checkin), 1));
  const selected = parseISO(value);
  const earliest = parseISO(min);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + daysInMonth }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previous = new Date(year, month - 1, 1);
  const previousBlocked = new Date(year, month, 0) < earliest;

  useEffect(() => {
    const date = parseISO(focus === "in" ? checkin : checkout);
    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [focus, checkin, checkout]);

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
      <div className="m-cal-sheet is-sheet is-trip" role="dialog" aria-modal="true" aria-label="Dates and guests" data-picker>
        <div className="m-cal-sheet__grab" aria-hidden />
        <p className="m-cal-sheet__title">Dates &amp; guests</p>
        <div className="m-trip__body">
          <div className="m-trip__tabs" role="tablist" aria-label="Stay dates">
            <button
              type="button"
              role="tab"
              aria-selected={focus === "in"}
              className={focus === "in" ? "is-on" : undefined}
              onClick={() => setFocus("in")}
            >
              <span>Check-in</span>
              <strong>{prettyStayDate(checkin)}</strong>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={focus === "out"}
              className={focus === "out" ? "is-on" : undefined}
              onClick={() => setFocus("out")}
            >
              <span>Check-out</span>
              <strong>{prettyStayDate(checkout)}</strong>
            </button>
          </div>
          <div className="sl-cal__head">
            <button type="button" aria-label="Previous month" disabled={previousBlocked} onClick={() => setCursor(previous)}>‹</button>
            <strong>{title}</strong>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="sl-cal__grid" role="grid">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span className="sl-cal__dow" key={day}>{day}</span>
            ))}
            {days.map((day, index) => {
              if (day == null) return <span key={`empty-${index}`} />;
              const date = new Date(year, month, day);
              const iso = toISO(date);
              const disabled = date < earliest;
              const inRange =
                parseISO(checkin) <= date && date <= parseISO(checkout) && nightsBetween(checkin, checkout) > 0;
              const isEdge = iso === checkin || iso === checkout;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  className={`${isEdge ? "is-on" : ""}${inRange && !isEdge ? " is-range" : ""}`.trim()}
                  aria-label={prettyStayDate(iso)}
                  aria-pressed={iso === value}
                  onClick={() => {
                    if (focus === "in") {
                      const nextOut =
                        parseISO(checkout) <= parseISO(iso)
                          ? toISO(addDays(parseISO(iso), 1))
                          : checkout;
                      onChange({ checkin: iso, checkout: nextOut });
                      setFocus("out");
                      return;
                    }
                    onChange({ checkout: iso });
                    document.getElementById("m-trip-guests")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="m-trip__guests" id="m-trip-guests">
            <p className="m-trip__label">Guests</p>
            <Step label="Adults" value={adults} min={1} max={8} less="Fewer adults" more="More adults" onChange={(next) => onChange({ adults: next })} />
            <Step label="Children" value={children} min={0} max={6} less="Fewer children" more="More children" onChange={(next) => onChange({ children: next })} />
            <Step label="Rooms" value={rooms} min={1} max={4} less="Fewer rooms" more="More rooms" onChange={(next) => onChange({ rooms: next })} />
            <p className="m-trip__note">{whoNote}</p>
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
  const selected = parseISO(value);
  const earliest = parseISO(min);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [mobile, setMobile] = useState<boolean | null>(null);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + count }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previous = new Date(year, month - 1, 1);
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
        className={`sl-menu sl-cal m-cal-sheet${sheet ? " is-sheet" : ""}`}
        role="dialog"
        aria-modal={sheet || undefined}
        aria-label={label || title}
        data-picker
      >
        {sheet ? <div className="m-cal-sheet__grab" aria-hidden /> : null}
        {label && sheet ? <p className="m-cal-sheet__title">{label}</p> : null}
        <div className="sl-cal__head">
          <button type="button" aria-label="Previous month" disabled={previousBlocked} onClick={() => setCursor(previous)}>‹</button>
          <strong>{title}</strong>
          <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="sl-cal__grid" role="grid">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <span className="sl-cal__dow" key={day}>{day}</span>
          ))}
          {days.map((day, index) => {
            if (day == null) return <span key={`empty-${index}`} />;
            const date = new Date(year, month, day);
            const iso = toISO(date);
            const disabled = date < earliest;
            return (
              <button key={iso} type="button" disabled={disabled} className={iso === value ? "is-on" : ""} aria-label={prettyStayDate(iso)} aria-pressed={iso === value} onClick={() => onPick(iso)}>
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
