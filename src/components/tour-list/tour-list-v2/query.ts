import type { TourSort } from "@/components/tour-list/types";

export const durationChoices = [
  { value: "1", label: "1 day", match: (days: number) => days === 1 },
  { value: "2", label: "2 days", match: (days: number) => days === 2 },
  { value: "3", label: "3 days", match: (days: number) => days === 3 },
  { value: "4", label: "4 days", match: (days: number) => days === 4 },
  { value: "5+", label: "5 days and above", match: (days: number) => days >= 5 },
];

const sorts: TourSort[] = ["recommended", "price-asc", "price-desc", "title"];

export type TourListQueryInput = Record<string, string | string[] | undefined>;

export type TourListQuery = {
  location: string;
  name: string;
  types: string[];
  days: string[];
  price: [number, number];
  sort: TourSort;
  page: number;
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

export function readTourQuery(
  params: TourListQueryInput,
  bounds: { priceMin: number; priceMax: number },
): TourListQuery {
  const sortRaw = one(params.sort);
  const sort = sorts.includes(sortRaw as TourSort) ? (sortRaw as TourSort) : "recommended";
  const page = Math.max(1, Math.floor(Number(one(params.page)) || 1));
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
  const knownDays = new Set(durationChoices.map((choice) => choice.value));

  return {
    location: one(params.q).trim(),
    name: one(params.name).trim(),
    types: list(params.type),
    days: list(params.days).filter((value) => knownDays.has(value)),
    price: low <= high ? [low, high] : [high, low],
    sort,
    page,
  };
}

export function tourQueryString(
  state: TourListQuery,
  bounds: { priceMin: number; priceMax: number },
) {
  const params = new URLSearchParams();
  if (state.location) params.set("q", state.location);
  if (state.name) params.set("name", state.name);
  if (state.types.length) params.set("type", state.types.join(","));
  if (state.days.length) params.set("days", state.days.join(","));
  if (state.price[0] !== bounds.priceMin) params.set("min", String(state.price[0]));
  if (state.price[1] !== bounds.priceMax) params.set("max", String(state.price[1]));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}
