import type { HotelSort } from "@/components/hotel-list/types";

export const starChoices = [
  { value: "5", label: "5 stars", match: (stars: number) => stars === 5 },
  { value: "4", label: "4 stars", match: (stars: number) => stars === 4 },
  { value: "3", label: "3 stars", match: (stars: number) => stars === 3 },
  { value: "2", label: "2 stars", match: (stars: number) => stars === 2 },
  { value: "1", label: "1 star", match: (stars: number) => stars === 1 },
];

const sorts: HotelSort[] = ["recommended", "price-asc", "price-desc", "name"];

export const hotelOwnedKeys = ["q", "name", "type", "stars", "min", "max", "sort"] as const;

export type HotelListQueryInput = Record<string, string | string[] | undefined>;

export type HotelListFilters = {
  query: string;
  types: string[];
  price: [number, number];
  stars: string[];
};

export type HotelListQuery = {
  location: string;
  name: string;
  types: string[];
  stars: string[];
  price: [number, number];
  sort: HotelSort;
};

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

export function readHotelQuery(
  params: HotelListQueryInput,
  bounds: { priceMin: number; priceMax: number },
): HotelListQuery {
  const sortRaw = one(params.sort);
  const sort = sorts.includes(sortRaw as HotelSort) ? (sortRaw as HotelSort) : "recommended";
  const minText = one(params.min).trim();
  const maxText = one(params.max).trim();
  const minRaw = minText === "" ? Number.NaN : Number(minText);
  const maxRaw = maxText === "" ? Number.NaN : Number(maxText);
  const low = Number.isFinite(minRaw)
    ? Math.min(Math.max(Math.round(minRaw), bounds.priceMin), bounds.priceMax)
    : bounds.priceMin;
  const high = Number.isFinite(maxRaw)
    ? Math.min(Math.max(Math.round(maxRaw), bounds.priceMin), bounds.priceMax)
    : bounds.priceMax;
  const knownStars = new Set(starChoices.map((choice) => choice.value));

  return {
    location: one(params.q).trim(),
    name: one(params.name).trim(),
    types: list(params.type),
    stars: list(params.stars).filter((value) => knownStars.has(value)),
    price: low <= high ? [low, high] : [high, low],
    sort,
  };
}

export function hotelQueryString(
  state: HotelListQuery,
  bounds: { priceMin: number; priceMax: number },
) {
  const params = new URLSearchParams();
  if (state.location) params.set("q", state.location);
  if (state.name) params.set("name", state.name);
  if (state.types.length) params.set("type", state.types.join(","));
  if (state.stars.length) params.set("stars", state.stars.join(","));
  if (state.price[0] !== bounds.priceMin) params.set("min", String(state.price[0]));
  if (state.price[1] !== bounds.priceMax) params.set("max", String(state.price[1]));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  return params.toString();
}
