export type StayPhoto = { src: string; alt: string };

export type StayListHotel = {
  id: string;
  slug: string;
  name: string;
  stars: number;
  type: string;
  area: string;
  town: string;
  townId: string;
  lat: number | null;
  lng: number | null;
  score: number | null;
  reviews: number | null;
  parts: [number, number, number] | null;
  nightly: number;
  currency: string;
  breakfast: boolean;
  freeCancel: boolean;
  cancelDays: number;
  pay: boolean;
  left: number | null;
  amenities: string[];
  line: string;
  photos: StayPhoto[];
  roomName: string;
};

export type StayPlace = { id: string; name: string };

export type StaySort = "best" | "score" | "price" | "price-desc" | "distance" | "stars";

export type StayListState = {
  place: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  sort: StaySort;
  minPrice: number | null;
  maxPrice: number | null;
  minScore: number;
  stars: string[];
  types: string[];
  areas: string[];
  amenities: string[];
  breakfast: boolean;
  cancel: boolean;
  pay: boolean;
  savedOnly: boolean;
  q: string;
  map: boolean;
  compare: string[];
};

const sorts: StaySort[] = ["best", "score", "price", "price-desc", "distance", "stars"];

export function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function pinMoney(amount: number, currency = "INR") {
  const sign = currency === "INR" ? "₹" : "";
  if (!sign) return money(amount, currency);
  if (amount >= 100000) return `₹${Math.round(amount / 1000)}k`;
  const rounded = Math.round(amount / 100) / 10;
  return `₹${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}k`;
}

export function parseISO(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function toISO(date: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function pretty(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function rangeLabel(checkin: string, checkout: string) {
  const start = parseISO(checkin);
  const end = parseISO(checkout);
  const short = { day: "numeric", month: "short" } as const;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.toLocaleDateString("en-GB", short)}`;
  }
  return `${start.toLocaleDateString("en-GB", short)} – ${end.toLocaleDateString("en-GB", short)}`;
}

export function nightsBetween(checkin: string, checkout: string) {
  const nights = Math.round((parseISO(checkout).getTime() - parseISO(checkin).getTime()) / 86400000);
  return nights > 0 ? nights : 1;
}

export function stayTotal(nightly: number, nights: number, rooms: number, currency: string, taxEnabled = false) {
  const roomSum = nightly * nights * rooms;
  const tax = taxEnabled && currency === "INR" ? Math.round(roomSum * 0.18) : 0;
  return { roomSum, tax, total: roomSum + tax };
}

export function guestText(adults: number, children: number, rooms: number) {
  const adultLabel = `${adults} adult${adults > 1 ? "s" : ""}`;
  const childLabel = children ? `, ${children} ${children > 1 ? "children" : "child"}` : "";
  return `${adultLabel}${childLabel} · ${rooms} room${rooms > 1 ? "s" : ""}`;
}

export function scoreWord(score: number) {
  if (score >= 9.5) return "Exceptional";
  if (score >= 9) return "Wonderful";
  if (score >= 8.5) return "Excellent";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  return "Fair";
}

export function scoreTone(score: number) {
  if (score >= 9) return "";
  if (score >= 8) return "is-mid";
  return "is-low";
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function centroid(hotels: StayListHotel[]) {
  const points = hotels.filter((hotel) => hotel.lat != null && hotel.lng != null);
  if (!points.length) return null;
  return {
    lat: points.reduce((sum, hotel) => sum + (hotel.lat as number), 0) / points.length,
    lng: points.reduce((sum, hotel) => sum + (hotel.lng as number), 0) / points.length,
  };
}

export function kmFromCentre(hotel: StayListHotel, centre: { lat: number; lng: number } | null) {
  if (!centre || hotel.lat == null || hotel.lng == null) return null;
  return haversineKm(centre.lat, centre.lng, hotel.lat, hotel.lng);
}

export function kmText(km: number) {
  if (km < 0.15) return "";
  return Number.isInteger(Math.round(km * 10) / 10) && Math.abs(km - Math.round(km)) < 0.05
    ? String(Math.round(km))
    : km.toFixed(1);
}

export function whereLine(hotel: StayListHotel, km: number | null, centreName: string) {
  const place = [hotel.area, hotel.town].filter(Boolean).join(", ");
  const text = kmText(km ?? 99);
  if (!text || !centreName) return place;
  return `${place} · ${text} km from ${centreName}`;
}

export function refundable(hotel: StayListHotel, checkin: string, today: Date) {
  if (!hotel.freeCancel) return false;
  return addDays(parseISO(checkin), -hotel.cancelDays) >= startOfDay(today);
}

export function cancelFact(hotel: StayListHotel, checkin: string, today: Date) {
  if (!hotel.freeCancel) return { ok: false, text: "Non-refundable" };
  const deadline = addDays(parseISO(checkin), -hotel.cancelDays);
  if (deadline < startOfDay(today)) return { ok: false, text: "Free cancellation has closed for these dates" };
  return { ok: true, text: `Free cancellation until ${pretty(deadline)}` };
}

export function inPlace(hotel: StayListHotel, place: string) {
  return place === "all" || hotel.townId === place;
}

export function hotelsInPlace(hotels: StayListHotel[], place: string) {
  return hotels.filter((hotel) => inPlace(hotel, place));
}

type Except =
  | "q"
  | "saved"
  | "price"
  | "score"
  | "stars"
  | "types"
  | "areas"
  | "breakfast"
  | "cancel"
  | "pay"
  | "amenities"
  | "";

export function matches(
  hotel: StayListHotel,
  state: StayListState,
  saved: Set<string>,
  today: Date,
  except: Except = "",
) {
  if (!inPlace(hotel, state.place)) return false;
  if (except !== "q" && state.q && !hotel.name.toLowerCase().includes(state.q.trim().toLowerCase())) return false;
  if (except !== "saved" && state.savedOnly && !saved.has(hotel.id)) return false;
  if (except !== "price" && state.minPrice != null && hotel.nightly < state.minPrice) return false;
  if (except !== "price" && state.maxPrice != null && hotel.nightly > state.maxPrice) return false;
  if (except !== "score" && state.minScore && (hotel.score == null || hotel.score < state.minScore)) return false;
  if (except !== "stars" && state.stars.length && !state.stars.includes(String(hotel.stars))) return false;
  if (except !== "types" && state.types.length && !state.types.includes(hotel.type)) return false;
  if (except !== "areas" && state.areas.length && !state.areas.includes(hotel.area)) return false;
  if (except !== "breakfast" && state.breakfast && !hotel.breakfast) return false;
  if (except !== "cancel" && state.cancel && !refundable(hotel, state.checkin, today)) return false;
  if (except !== "pay" && state.pay && !hotel.pay) return false;
  if (except !== "amenities" && state.amenities.some((name) => !hotel.amenities.includes(name))) return false;
  return true;
}

export function rateBounds(hotels: StayListHotel[]) {
  const rates = hotels.map((hotel) => hotel.nightly);
  if (!rates.length) return { min: 0, max: 0 };
  return { min: Math.min(...rates), max: Math.max(...rates) };
}

function totalOf(hotel: StayListHotel, state: StayListState, taxEnabled: boolean) {
  return stayTotal(hotel.nightly, nightsBetween(state.checkin, state.checkout), state.rooms, hotel.currency, taxEnabled).total;
}

export function compareHotels(
  a: StayListHotel,
  b: StayListHotel,
  state: StayListState,
  distance: Map<string, number | null>,
  taxEnabled = false,
) {
  const price = (hotel: StayListHotel) => totalOf(hotel, state, taxEnabled);
  const score = (hotel: StayListHotel) => hotel.score ?? -1;
  if (state.sort === "price") return price(a) - price(b) || score(b) - score(a) || a.name.localeCompare(b.name);
  if (state.sort === "price-desc") return price(b) - price(a) || score(b) - score(a) || a.name.localeCompare(b.name);
  if (state.sort === "score") return score(b) - score(a) || (b.reviews ?? 0) - (a.reviews ?? 0) || a.name.localeCompare(b.name);
  if (state.sort === "distance") {
    const left = distance.get(a.id);
    const right = distance.get(b.id);
    if (left == null && right == null) return a.name.localeCompare(b.name);
    if (left == null) return 1;
    if (right == null) return -1;
    return left - right || score(b) - score(a);
  }
  if (state.sort === "stars") return b.stars - a.stars || score(b) - score(a) || price(a) - price(b);
  if (a.score != null && b.score != null) {
    const bandA = Math.floor(a.score * 2) / 2;
    const bandB = Math.floor(b.score * 2) / 2;
    if (bandA !== bandB) return bandB - bandA;
    return price(a) - price(b) || (b.reviews ?? 0) - (a.reviews ?? 0) || a.name.localeCompare(b.name);
  }
  if (a.stars !== b.stars) return b.stars - a.stars;
  return price(a) - price(b) || a.name.localeCompare(b.name);
}

export function activeFilters(state: StayListState, bounds: { min: number; max: number }, currency: string) {
  const items: [string, string][] = [];
  if (state.q.trim()) items.push(["q", `Name “${state.q.trim()}”`]);
  if (state.minPrice != null || state.maxPrice != null) {
    const low = state.minPrice ?? bounds.min;
    const high = state.maxPrice ?? bounds.max;
    items.push(["price", `${money(low, currency)}–${money(high, currency)} a night`]);
  }
  if (state.minScore) items.push(["score", `Score ${state.minScore}+`]);
  [...state.stars].sort().forEach((star) => items.push([`star:${star}`, `${star} star`]));
  state.types.forEach((type) => items.push([`type:${type}`, type]));
  state.areas.forEach((area) => items.push([`area:${area}`, area]));
  if (state.breakfast) items.push(["breakfast", "Breakfast"]);
  if (state.cancel) items.push(["cancel", "Free cancellation"]);
  if (state.pay) items.push(["pay", "Pay at the property"]);
  state.amenities.forEach((name) => items.push([`amenity:${name}`, name]));
  if (state.savedOnly) items.push(["saved", "Saved"]);
  return items;
}

export function exceptFor(key: string): Except {
  if (key.startsWith("star:")) return "stars";
  if (key.startsWith("type:")) return "types";
  if (key.startsWith("area:")) return "areas";
  if (key.startsWith("amenity:")) return "amenities";
  if (
    key === "q" ||
    key === "saved" ||
    key === "price" ||
    key === "score" ||
    key === "breakfast" ||
    key === "cancel" ||
    key === "pay"
  ) {
    return key;
  }
  return "";
}

export function clearOne(state: StayListState, key: string): StayListState {
  const next = { ...state, stars: [...state.stars], types: [...state.types], areas: [...state.areas], amenities: [...state.amenities], compare: [...state.compare] };
  if (key === "q") next.q = "";
  else if (key === "price") {
    next.minPrice = null;
    next.maxPrice = null;
  } else if (key === "score") next.minScore = 0;
  else if (key === "breakfast") next.breakfast = false;
  else if (key === "cancel") next.cancel = false;
  else if (key === "pay") next.pay = false;
  else if (key === "saved") next.savedOnly = false;
  else if (key.startsWith("star:")) next.stars = next.stars.filter((star) => star !== key.slice(5));
  else if (key.startsWith("type:")) next.types = next.types.filter((type) => type !== key.slice(5));
  else if (key.startsWith("area:")) next.areas = next.areas.filter((area) => area !== key.slice(5));
  else if (key.startsWith("amenity:")) next.amenities = next.amenities.filter((name) => name !== key.slice(8));
  return next;
}

export function clearFilters(state: StayListState): StayListState {
  return {
    ...state,
    minPrice: null,
    maxPrice: null,
    minScore: 0,
    q: "",
    stars: [],
    types: [],
    areas: [],
    amenities: [],
    breakfast: false,
    cancel: false,
    pay: false,
    savedOnly: false,
  };
}

export function quickPicks(hotels: StayListHotel[]) {
  const nightly = hotels.map((hotel) => hotel.nightly).sort((a, b) => a - b);
  let priceCap: number | null = null;
  if (nightly.length > 1) {
    const target = nightly[Math.floor((nightly.length - 1) * 0.55)];
    const cap = Math.max(1000, Math.round(target / 1000) * 1000);
    const below = hotels.filter((hotel) => hotel.nightly <= cap).length;
    if (below > 0 && below < hotels.length) priceCap = cap;
  }
  let type: string | null = null;
  let typeCount = Number.POSITIVE_INFINITY;
  const typeCounts = new Map<string, number>();
  hotels.forEach((hotel) => typeCounts.set(hotel.type, (typeCounts.get(hotel.type) || 0) + 1));
  typeCounts.forEach((count, name) => {
    if (count > 0 && count < hotels.length && count < typeCount) {
      type = name;
      typeCount = count;
    }
  });
  const amenityCounts = new Map<string, number>();
  hotels.forEach((hotel) => hotel.amenities.forEach((name) => amenityCounts.set(name, (amenityCounts.get(name) || 0) + 1)));
  const priority = ["Pool", "Spa", "Parking", "Airport pickup", "Restaurant", "Laundry"];
  let amenity: string | null = priority.find((name) => {
    const count = amenityCounts.get(name) || 0;
    return count > 0 && count < hotels.length;
  }) ?? null;
  if (!amenity) {
    for (const [name, count] of amenityCounts) {
      if (count > 0 && count < hotels.length && !/wi-?fi/i.test(name)) {
        amenity = name;
        break;
      }
    }
  }
  return {
    priceCap,
    type,
    amenity,
    hasScores: hotels.some((hotel) => hotel.score != null && hotel.score > 0),
    hasPay: hotels.some((hotel) => hotel.pay),
  };
}

export function projectPins(hotels: StayListHotel[]) {
  const points = hotels.filter((hotel) => hotel.lat != null && hotel.lng != null);
  if (!points.length) return [] as { id: string; left: number; top: number }[];
  if (points.length === 1) return [{ id: points[0].id, left: 50, top: 46 }];
  const lats = points.map((hotel) => hotel.lat as number);
  const lngs = points.map((hotel) => hotel.lng as number);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;
  return points.map((hotel) => ({
    id: hotel.id,
    left: 14 + (((hotel.lng as number) - minLng) / lngSpan) * 72,
    top: 16 + ((maxLat - (hotel.lat as number)) / latSpan) * 68,
  }));
}

export function sortCopy(sort: StaySort, hasScores: boolean, centreName: string, taxEnabled = false) {
  const taxNote = taxEnabled ? " GST is already in the price." : "";
  if (sort === "score") return "Sorted by guest score. A tie goes to the stay with more reviews.";
  if (sort === "price") return `Sorted by the lowest total for these dates.${taxNote}`;
  if (sort === "price-desc") return `Sorted by the highest total for these dates.${taxNote}`;
  if (sort === "distance") return centreName ? `Sorted by distance from ${centreName}.` : "Sorted by distance within this place.";
  if (sort === "stars") return hasScores ? "Sorted by star rating, then guest score." : "Sorted by star rating, then the lower total.";
  return hasScores
    ? "Ordered in half-point guest-score bands, then by the lower total. A stay cannot pay to move up."
    : "Ordered by star rating, then by the lower total. A stay cannot pay to move up.";
}

export function stayHref(hotel: StayListHotel, state: StayListState) {
  const params = new URLSearchParams({
    in: state.checkin,
    out: state.checkout,
    adults: String(state.adults),
    children: String(state.children),
    rooms: String(state.rooms),
  });
  return `/hotels/${hotel.slug}?${params.toString()}`;
}

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function list(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function readStayState(
  params: Record<string, string | string[] | undefined>,
  options: { places: string[]; checkin: string; checkout: string },
): StayListState {
  const place = one(params.place);
  const sortRaw = one(params.sort);
  const min = Number(one(params.min));
  const max = Number(one(params.max));
  const score = Number(one(params.score));
  const adults = Number(one(params.adults));
  const children = Number(one(params.children));
  const rooms = Number(one(params.rooms));
  const checkin = one(params.in);
  const checkout = one(params.out);
  return {
    place: place === "all" || options.places.includes(place) ? place || "all" : "all",
    checkin: /^\d{4}-\d{2}-\d{2}$/.test(checkin) ? checkin : options.checkin,
    checkout: /^\d{4}-\d{2}-\d{2}$/.test(checkout) ? checkout : options.checkout,
    adults: adults >= 1 && adults <= 8 ? adults : 2,
    children: children >= 0 && children <= 6 ? children : 0,
    rooms: rooms >= 1 && rooms <= 4 ? rooms : 1,
    sort: sorts.includes(sortRaw as StaySort) ? (sortRaw as StaySort) : "best",
    minPrice: Number.isFinite(min) && one(params.min) !== "" ? min : null,
    maxPrice: Number.isFinite(max) && one(params.max) !== "" ? max : null,
    minScore: score === 8 || score === 9 ? score : 0,
    stars: list(params.stars).filter((star) => /^[1-5]$/.test(star)),
    types: list(params.types),
    areas: list(params.areas),
    amenities: list(params.amenities),
    breakfast: one(params.breakfast) === "1",
    cancel: one(params.cancel) === "1",
    pay: one(params.pay) === "1",
    savedOnly: one(params.saved) === "1",
    q: one(params.q),
    map: false,
    compare: list(params.compare).slice(0, 3),
  };
}

export function writeStayQuery(state: StayListState, defaults: { checkin: string; checkout: string }) {
  const params = new URLSearchParams();
  if (state.place !== "all") params.set("place", state.place);
  if (state.checkin !== defaults.checkin) params.set("in", state.checkin);
  if (state.checkout !== defaults.checkout) params.set("out", state.checkout);
  if (state.adults !== 2) params.set("adults", String(state.adults));
  if (state.children) params.set("children", String(state.children));
  if (state.rooms !== 1) params.set("rooms", String(state.rooms));
  if (state.sort !== "best") params.set("sort", state.sort);
  if (state.minPrice != null) params.set("min", String(state.minPrice));
  if (state.maxPrice != null) params.set("max", String(state.maxPrice));
  if (state.minScore) params.set("score", String(state.minScore));
  if (state.stars.length) params.set("stars", state.stars.join(","));
  if (state.types.length) params.set("types", state.types.join(","));
  if (state.areas.length) params.set("areas", state.areas.join(","));
  if (state.amenities.length) params.set("amenities", state.amenities.join(","));
  if (state.breakfast) params.set("breakfast", "1");
  if (state.cancel) params.set("cancel", "1");
  if (state.pay) params.set("pay", "1");
  if (state.savedOnly) params.set("saved", "1");
  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.compare.length) params.set("compare", state.compare.join(","));
  return params.toString();
}

export function clampStay(state: StayListState, today: Date, bounds: { min: number; max: number }): StayListState {
  let checkin = parseISO(state.checkin);
  if (Number.isNaN(checkin.getTime()) || checkin < startOfDay(today)) checkin = startOfDay(today);
  let checkout = parseISO(state.checkout);
  if (Number.isNaN(checkout.getTime()) || checkout <= checkin) checkout = addDays(checkin, 1);
  let minPrice = state.minPrice;
  let maxPrice = state.maxPrice;
  if (minPrice != null && minPrice <= bounds.min) minPrice = null;
  if (maxPrice != null && maxPrice >= bounds.max) maxPrice = null;
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    const swap = minPrice;
    minPrice = maxPrice;
    maxPrice = swap;
  }
  return {
    ...state,
    checkin: toISO(checkin),
    checkout: toISO(checkout),
    adults: Math.min(8, Math.max(1, state.adults)),
    children: Math.min(6, Math.max(0, state.children)),
    rooms: Math.min(4, Math.max(1, state.rooms)),
    minPrice,
    maxPrice,
  };
}

export function bestFlags(nums: number[], low: boolean) {
  if (nums.every((value) => value === nums[0])) return nums.map(() => false);
  const target = low ? Math.min(...nums) : Math.max(...nums);
  return nums.map((value) => value === target);
}

export function histogram(hotels: StayListHotel[], bounds: { min: number; max: number }) {
  const buckets = 12;
  const span = bounds.max === bounds.min ? 1 : bounds.max - bounds.min;
  const width = span / buckets;
  const counts = Array.from({ length: buckets }, () => 0);
  hotels.forEach((hotel) => {
    let index = Math.floor((hotel.nightly - bounds.min) / width);
    if (index >= buckets) index = buckets - 1;
    if (index < 0) index = 0;
    counts[index] += 1;
  });
  const peak = Math.max(...counts, 1);
  return counts.map((count, index) => ({
    count,
    upper: Math.round(bounds.min + width * (index + 1)),
    low: bounds.min + width * index,
    height: Math.max(8, (count / peak) * 100),
  }));
}

export function isWifi(name: string) {
  return /wi-?fi/i.test(name);
}
