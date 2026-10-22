import { quoteTour } from "@/lib/tours/quote";
import type { CatalogQuery, CatalogSort, CatalogTour } from "@/components/tour-list/catalog/types";

export const PAGE_SIZE = 8;
export const DURS = [
  ["half", "Under 5 hours"],
  ["day", "A full day"],
  ["2", "2 days"],
  ["mid", "3–5 days"],
  ["long", "6 days or more"],
] as const;
export const WHENS = [
  ["morning", "Morning"],
  ["afternoon", "Afternoon"],
  ["evening", "Evening"],
  ["multi", "Multi-day"],
] as const;
export const STYLES = [
  ["private", "Private"],
  ["small", "Small group"],
  ["shared", "Larger group"],
] as const;
export const LEVELS = [
  ["easy", "Easy"],
  ["moderate", "Moderate"],
  ["hard", "Demanding"],
] as const;
export const SORTS: CatalogSort[] = ["match", "price", "value", "rating", "reviews", "short", "long"];
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function catalogToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function defaultDate(today: string) {
  return addDays(today, 14);
}

export function prettyDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${iso}T12:00:00`),
  );
}

export function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function reviewCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function whoLabel(query: CatalogQuery) {
  const adults = `${query.adults} adult${query.adults === 1 ? "" : "s"}`;
  if (!query.children) return adults;
  return `${adults}, ${query.children} child${query.children === 1 ? "" : "ren"}`;
}

export function people(query: CatalogQuery) {
  return query.adults + query.children;
}

function departureOn(tour: CatalogTour, iso: string) {
  return tour.departures.find((item) => item.iso === iso && item.status !== "closed") ?? null;
}

export function partyQuote(tour: CatalogTour, query: CatalogQuery) {
  const departure = departureOn(tour, query.date);
  return quoteTour({
    priceFrom: tour.price,
    mode: "group",
    startIso: query.date || "2000-06-01",
    listedPrice: departure && departure.price > 0 ? departure.price : null,
    adults: query.adults,
    children: query.children,
    ownRoom: false,
  });
}

export function partyTotal(tour: CatalogTour, query: CatalogQuery) {
  return partyQuote(tour, query).total;
}

export function bounds(tours: CatalogTour[], query: CatalogQuery) {
  const totals = tours.map((tour) => partyTotal(tour, query));
  if (!totals.length) return [0, 500] as const;
  const lo = Math.floor(Math.min(...totals) / 500) * 500;
  const hi = Math.ceil(Math.max(...totals) / 500) * 500;
  return [Math.max(0, lo), Math.max(lo + 500, hi)] as const;
}

export function rangeNow(tours: CatalogTour[], query: CatalogQuery) {
  const [lo, hi] = bounds(tours, query);
  return [query.min == null ? lo : query.min, query.max == null ? hi : query.max] as const;
}

export function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay();
}

export function runsOn(tour: CatalogTour, iso: string) {
  if (tour.weekdays && !tour.weekdays.includes(weekday(iso))) return false;
  if (tour.departures.length > 0 && !departureOn(tour, iso)) return false;
  return true;
}

export function seatsLeft(tour: CatalogTour, iso: string) {
  const departure = departureOn(tour, iso);
  return departure ? departure.seats : null;
}

export function statusOf(tour: CatalogTour, iso: string) {
  if (!runsOn(tour, iso)) return "off" as const;
  const seats = seatsLeft(tour, iso);
  if (seats === 0) return "sold" as const;
  return "ok" as const;
}

export function nextOpen(tour: CatalogTour, fromIso: string) {
  for (let i = 1; i <= 21; i += 1) {
    const iso = addDays(fromIso, i);
    if (runsOn(tour, iso) && seatsLeft(tour, iso) !== 0) return iso;
  }
  return null;
}

export function durationLabel(tour: CatalogTour) {
  if (tour.days > 1) return `${tour.days} days`;
  const hours = Math.floor(tour.hours);
  const mins = Math.round((tour.hours - hours) * 60);
  if (!mins) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours} h ${mins} min`;
}

export function groupLabel(tour: CatalogTour) {
  if (tour.style === "private") return `Private · up to ${tour.groupMax}`;
  if (tour.style === "small") return `Small group · max ${tour.groupMax}`;
  return `Shared · max ${tour.groupMax}`;
}

export function runsLabel(tour: CatalogTour) {
  if (!tour.weekdays?.length) return "";
  return `Runs ${tour.weekdays.map((day) => DAY[day].slice(0, 3)).join(", ")}`;
}

export function scoreWords(rating: number) {
  if (rating >= 9.5) return "Exceptional";
  if (rating >= 9) return "Excellent";
  if (rating >= 8.5) return "Very good";
  if (rating >= 8) return "Good";
  return "Pleasant";
}

export function scoreClass(rating: number) {
  if (rating >= 9) return "";
  if (rating >= 8) return "is-mid";
  return "is-low";
}

export function cancelInfo(tour: CatalogTour, query: CatalogQuery, today: string) {
  if (!tour.cancelDays) return { kind: "no" as const, text: "Non-refundable" };
  const deadline = addDays(query.date, -tour.cancelDays);
  if (deadline < today) return { kind: "closed" as const, text: "Free cancellation has closed for this date" };
  return { kind: "yes" as const, text: `Free cancellation until ${prettyDate(deadline)}` };
}

export function priceDetail(tour: CatalogTour, query: CatalogQuery) {
  const quote = partyQuote(tour, query);
  const currency = tour.currency || "INR";
  if (query.children) return `${money(quote.adult, currency)} an adult · children ${money(quote.child, currency)}`;
  if (quote.singles) return `${money(quote.adult, currency)} a person · single room ${money(quote.singleFee, currency)}`;
  return `${money(quote.adult, currency)} a person`;
}

export function extraLine(tour: CatalogTour) {
  const items = tour.excludes.filter((item) => !/refund|small group/i.test(item));
  if (!items.length) return "";
  return `Not included: ${items.slice(0, 2).join(", ")}`;
}

export function bucket(tour: CatalogTour) {
  if (tour.days >= 6) return "long";
  if (tour.days >= 3) return "mid";
  if (tour.days === 2) return "2";
  if (tour.hours < 5) return "half";
  return "day";
}

function has(list: string[], value: string) {
  return list.includes(value);
}

export function pass(
  tour: CatalogTour,
  tours: CatalogTour[],
  query: CatalogQuery,
  today: string,
  ignore?: string,
) {
  const status = statusOf(tour, query.date);
  if (status === "off" && !query.showOff && ignore !== "avail") return false;
  if (status === "sold" && !query.showSold && ignore !== "avail") return false;
  if (query.q && ignore !== "q") {
    const hay = [tour.title, tour.place, tour.region, tour.category, tour.mention, tour.includes.join(" "), tour.langs.join(" ")]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(query.q.trim().toLowerCase())) return false;
  }
  const [min, max] = rangeNow(tours, query);
  const [lo, hi] = bounds(tours, query);
  const full = min <= lo && max >= hi;
  if (!full && ignore !== "price" && (partyTotal(tour, query) < min || partyTotal(tour, query) > max)) return false;
  if (ignore !== "region" && query.region.length && !has(query.region, tour.region)) return false;
  if (ignore !== "cat" && query.cat.length && !has(query.cat, tour.category)) return false;
  if (ignore !== "dur" && query.dur.length && !has(query.dur, bucket(tour))) return false;
  if (ignore !== "when" && query.when.length && !has(query.when, tour.when)) return false;
  if (ignore !== "style" && query.style.length && !has(query.style, tour.style)) return false;
  if (ignore !== "level" && query.level.length && !has(query.level, tour.level)) return false;
  if (ignore !== "lang" && query.lang.length && !tour.langs.some((name) => has(query.lang, name))) return false;
  if (ignore !== "cancel" && query.cancel && cancelInfo(tour, query, today).kind !== "yes") return false;
  if (ignore !== "pickup" && query.pickup && !tour.pickup) return false;
  if (ignore !== "rating" && query.rating && tour.rating < query.rating) return false;
  return true;
}

function matchScore(tour: CatalogTour, query: CatalogQuery, today: string) {
  const trusted = (tour.reviews * tour.rating + 40 * 8.4) / (tour.reviews + 40);
  const cancel = cancelInfo(tour, query, today).kind === "yes" ? 0.08 : 0;
  return trusted + (tour.style !== "shared" ? 0.15 : 0) + cancel + (tour.pickup ? 0.04 : 0);
}

export function visibleTours(
  tours: CatalogTour[],
  query: CatalogQuery,
  today: string,
  saved: string[],
) {
  const rows = tours.filter((tour) => {
    if (query.savedOnly && !saved.includes(tour.id)) return false;
    return pass(tour, tours, query, today);
  });
  const rank: Record<CatalogSort, (a: CatalogTour, b: CatalogTour) => number> = {
    match: (a, b) => matchScore(b, query, today) - matchScore(a, query, today),
    price: (a, b) => partyTotal(a, query) - partyTotal(b, query),
    value: (a, b) => b.rating / (partyTotal(b, query) / 1000) - a.rating / (partyTotal(a, query) / 1000),
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    reviews: (a, b) => b.reviews - a.reviews,
    short: (a, b) => a.hours - b.hours,
    long: (a, b) => b.hours - a.hours,
  };
  rows.sort(
    (a, b) =>
      (statusOf(a, query.date) === "ok" ? 0 : 1) - (statusOf(b, query.date) === "ok" ? 0 : 1) ||
      rank[query.sort](a, b) ||
      a.title.localeCompare(b.title),
  );
  return rows;
}

export function facetCount(
  tours: CatalogTour[],
  query: CatalogQuery,
  today: string,
  saved: string[],
  kind: string,
  value: string,
) {
  return tours.filter((tour) => {
    if (query.savedOnly && kind !== "saved" && !saved.includes(tour.id)) return false;
    if (!pass(tour, tours, query, today, kind)) return false;
    if (kind === "region") return tour.region === value;
    if (kind === "cat") return tour.category === value;
    if (kind === "dur") return bucket(tour) === value;
    if (kind === "when") return tour.when === value;
    if (kind === "style") return tour.style === value;
    if (kind === "level") return tour.level === value;
    if (kind === "lang") return tour.langs.includes(value);
    if (kind === "cancel") return cancelInfo(tour, query, today).kind === "yes";
    if (kind === "pickup") return tour.pickup;
    if (kind === "rating") return tour.rating >= Number(value);
    return false;
  }).length;
}

export function activeCount(query: CatalogQuery) {
  let count = 0;
  if (query.q) count += 1;
  if (query.min != null || query.max != null) count += 1;
  count +=
    query.dur.length +
    query.region.length +
    query.cat.length +
    query.when.length +
    query.style.length +
    query.lang.length +
    query.level.length;
  if (query.cancel) count += 1;
  if (query.pickup) count += 1;
  if (query.rating) count += 1;
  if (query.savedOnly) count += 1;
  if (query.showOff) count += 1;
  if (query.showSold) count += 1;
  return count;
}

export function sortCopy(query: CatalogQuery) {
  const who = whoLabel(query);
  const when = prettyDate(query.date);
  if (query.sort === "price") return `Lowest total for ${who} on ${when}. Tours that do not run that day stay at the bottom.`;
  if (query.sort === "value") return "Best value is the guest score for each ₹1,000 of your total, so a strong cheaper tour can rank above a pricey one.";
  if (query.sort === "rating") return "Highest score first. A score from many reviews and the same score from a handful are not treated as the same once you switch to Best match.";
  if (query.sort === "reviews") return "Most reviews first. Useful when you want the tours other people actually finished.";
  if (query.sort === "short") return "Shortest first, by hours on the ground.";
  if (query.sort === "long") return "Longest first. Multi-day tours rise to the top.";
  return "Best match trusts a score more when more people have reviewed it, then gives a small lift to a small group, free cancellation that is still open, and hotel pickup.";
}

export function uniqueValues(tours: CatalogTour[], key: "region" | "category" | "langs") {
  const values = new Set<string>();
  tours.forEach((tour) => {
    if (key === "langs") tour.langs.forEach((name) => values.add(name));
    else values.add(tour[key]);
  });
  return [...values].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function take(raw: string, allowed: Set<string>) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, all) => item && allowed.has(item) && all.indexOf(item) === index);
}

export function readCatalogQuery(
  params: Record<string, string | string[] | undefined>,
  tours: CatalogTour[],
  today: string,
): CatalogQuery {
  const date = one(params.date);
  const adults = Number(one(params.adults));
  const children = Number(one(params.children));
  const rating = Number(one(params.rating));
  const page = Number(one(params.page));
  const sort = one(params.sort) as CatalogSort;
  const minRaw = one(params.min);
  const maxRaw = one(params.max);
  return {
    q: one(params.q).slice(0, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today ? date : defaultDate(today),
    adults: adults >= 1 && adults <= 8 ? adults : 2,
    children: children >= 0 && children <= 6 ? children : 0,
    min: minRaw !== "" && Number.isFinite(Number(minRaw)) ? Number(minRaw) : null,
    max: maxRaw !== "" && Number.isFinite(Number(maxRaw)) ? Number(maxRaw) : null,
    dur: take(one(params.dur), new Set(DURS.map((item) => item[0]))),
    region: take(one(params.region), new Set(tours.map((tour) => tour.region))),
    cat: take(one(params.cat), new Set(tours.map((tour) => tour.category))),
    when: take(one(params.when), new Set(WHENS.map((item) => item[0]))),
    style: take(one(params.style), new Set(STYLES.map((item) => item[0]))),
    lang: take(one(params.lang), new Set(tours.flatMap((tour) => tour.langs))),
    level: take(one(params.level), new Set(LEVELS.map((item) => item[0]))),
    cancel: one(params.cancel) === "1",
    pickup: one(params.pickup) === "1",
    rating: rating === 8 || rating === 9 ? rating : 0,
    sort: SORTS.includes(sort) ? sort : "match",
    view: one(params.view) === "grid" ? "grid" : "list",
    page: page >= 1 && page <= 20 ? page : 1,
    showOff: one(params.off) === "1",
    showSold: one(params.sold) === "1",
    savedOnly: one(params.saved) === "1",
    compare: take(one(params.cmp), new Set(tours.map((tour) => tour.id))).slice(0, 3),
  };
}

export function catalogSearch(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  params.set("date", query.date);
  if (query.adults !== 2) params.set("adults", String(query.adults));
  if (query.children) params.set("children", String(query.children));
  if (query.min != null) params.set("min", String(query.min));
  if (query.max != null) params.set("max", String(query.max));
  const put = (key: string, values: string[]) => {
    if (values.length) params.set(key, values.join(","));
  };
  put("dur", query.dur);
  put("region", query.region);
  put("cat", query.cat);
  put("when", query.when);
  put("style", query.style);
  put("lang", query.lang);
  put("level", query.level);
  if (query.cancel) params.set("cancel", "1");
  if (query.pickup) params.set("pickup", "1");
  if (query.rating) params.set("rating", String(query.rating));
  if (query.sort !== "match") params.set("sort", query.sort);
  if (query.view === "grid") params.set("view", "grid");
  if (query.page > 1) params.set("page", String(query.page));
  if (query.showOff) params.set("off", "1");
  if (query.showSold) params.set("sold", "1");
  if (query.savedOnly) params.set("saved", "1");
  if (query.compare.length) params.set("cmp", query.compare.join(","));
  return params.toString();
}

export function readMoney(value: string, which: "min" | "max", query: CatalogQuery, lo: number, hi: number) {
  if (value.trim() === "") return null;
  let next = Math.round(Number(value));
  if (!Number.isFinite(next)) return null;
  next = Math.min(hi, Math.max(0, next));
  if (which === "min" && query.max != null) next = Math.min(next, query.max);
  if (which === "max" && query.min != null) next = Math.max(next, query.min);
  if (which === "min" && next <= lo) return null;
  if (which === "max" && next >= hi) return null;
  return next;
}

export function hiddenCounts(tours: CatalogTour[], rows: CatalogTour[], query: CatalogQuery, today: string, saved: string[]) {
  const blocked = tours.filter((tour) => {
    if (query.savedOnly && !saved.includes(tour.id)) return false;
    return statusOf(tour, query.date) !== "ok" && pass(tour, tours, query, today, "avail") && !rows.includes(tour);
  });
  return {
    off: blocked.filter((tour) => statusOf(tour, query.date) === "off").length,
    sold: blocked.filter((tour) => statusOf(tour, query.date) === "sold").length,
  };
}

export function emptyIdeas(tours: CatalogTour[], query: CatalogQuery, today: string) {
  const checks: { key: string; label: string; active: boolean }[] = [
    { key: "q", label: "Clear the search", active: Boolean(query.q) },
    { key: "price", label: "Clear the price", active: query.min != null || query.max != null },
    { key: "region", label: "Clear regions", active: query.region.length > 0 },
    { key: "cat", label: "Clear types", active: query.cat.length > 0 },
    { key: "dur", label: "Clear duration", active: query.dur.length > 0 },
    { key: "when", label: "Clear start time", active: query.when.length > 0 },
    { key: "style", label: "Clear group", active: query.style.length > 0 },
    { key: "level", label: "Clear pace", active: query.level.length > 0 },
    { key: "lang", label: "Clear language", active: query.lang.length > 0 },
    { key: "cancel", label: "Drop free cancellation", active: query.cancel },
    { key: "pickup", label: "Drop hotel pickup", active: query.pickup },
    { key: "rating", label: "Drop the score filter", active: Boolean(query.rating) },
    { key: "saved", label: "Show more than saved", active: query.savedOnly },
    { key: "avail", label: "Show tours that do not run this date", active: !query.showOff || !query.showSold },
  ];
  return checks.flatMap((check) => {
    if (!check.active) return [];
    const count = tours.filter((tour) => pass(tour, tours, query, today, check.key === "saved" ? "saved" : check.key)).length;
    if (!count) return [];
    return [{ key: check.key, label: `${check.label} · ${count}` }];
  });
}

export function clearQuery(query: CatalogQuery): CatalogQuery {
  return {
    ...query,
    q: "",
    min: null,
    max: null,
    dur: [],
    region: [],
    cat: [],
    when: [],
    style: [],
    lang: [],
    level: [],
    cancel: false,
    pickup: false,
    rating: 0,
    savedOnly: false,
    showOff: false,
    showSold: false,
    page: 1,
  };
}

const listKeys = ["dur", "region", "cat", "when", "style", "lang", "level"] as const;

export function dropFilter(query: CatalogQuery, key: string, value: string): CatalogQuery {
  const next = { ...query, page: 1 };
  if (key === "q") next.q = "";
  else if (key === "price") {
    next.min = null;
    next.max = null;
  } else if (key === "rating") next.rating = 0;
  else if (key === "cancel" || key === "pickup" || key === "showOff" || key === "showSold" || key === "savedOnly") {
    next[key] = false;
  } else if (listKeys.includes(key as (typeof listKeys)[number])) {
    const name = key as (typeof listKeys)[number];
    next[name] = query[name].filter((item) => item !== value);
  }
  return next;
}

export function relaxQuery(query: CatalogQuery, key: string): CatalogQuery {
  if (key === "avail") return { ...query, showOff: true, showSold: true, page: 1 };
  if (key === "saved") return { ...query, savedOnly: false, page: 1 };
  if (key === "q") return { ...query, q: "", page: 1 };
  if (key === "price") return { ...query, min: null, max: null, page: 1 };
  if (key === "rating") return { ...query, rating: 0, page: 1 };
  if (key === "cancel" || key === "pickup") return { ...query, [key]: false, page: 1 };
  if (listKeys.includes(key as (typeof listKeys)[number])) {
    return { ...query, [key]: [], page: 1 };
  }
  return { ...query, page: 1 };
}
