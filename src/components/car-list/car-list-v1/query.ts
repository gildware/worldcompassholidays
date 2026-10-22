import type { CarSort } from "@/components/car-list/types";
import type { CarListFilters } from "@/components/car-list/car-list-v1/Sidebar";

const sorts: CarSort[] = ["recommended", "price-asc", "price-desc", "name"];

export type RentalQueryInput = Record<string, string | string[] | undefined>;

export type RentalFleet = "car" | "bike" | "mixed";

export type RentalListQuery = {
  pickup: string;
  dropoff: string;
  pickupAt: string;
  returnAt: string;
  adults: number;
  children: number;
  rooms: number;
  passengersActive: boolean;
  search: string;
  filters: CarListFilters;
  sort: CarSort;
};

export function rentalOwnedKeys(fleet: RentalFleet) {
  const keys = [
    "q",
    "dropoff",
    "pickup",
    "return",
    "name",
    "loc",
    "type",
    "gear",
    "fuel",
    "sort",
    "brand",
    "spec",
    "miles",
    "tag",
    "min",
    "max",
  ];
  if (fleet !== "bike") keys.push("seats", "adults", "children", "rooms");
  return keys;
}

export function rentalListPath(fleet: RentalFleet) {
  if (fleet === "bike") return "/rentals/bikes";
  if (fleet === "car") return "/rentals/cars";
  return "/rentals";
}

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function list(value: string | string[] | undefined, splitCommas = false) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  const parts = splitCommas ? items.flatMap((item) => item.split(",")) : items;
  return parts.map((item) => item.trim()).filter(Boolean);
}

function whole(value: string) {
  if (!value.trim()) return Number.NaN;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : Number.NaN;
}

function clampPrice(value: number, priceMax: number) {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.min(Math.max(value, 0), priceMax);
}

export function formatRentalDate(date: Date, previous = "") {
  const pad = (part: number) => String(part).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = /T(\d{2}:\d{2})$/.exec(previous)?.[1] ?? "10:00";
  return `${day}T${time}`;
}

export function readRentalQuery(
  params: RentalQueryInput,
  bounds: { priceMax: number },
  options: { fleet?: RentalFleet; locationNames?: string[] } = {},
): RentalListQuery {
  const fleet = options.fleet ?? "mixed";
  const sortRaw = one(params.sort);
  const sort = sorts.includes(sortRaw as CarSort) ? (sortRaw as CarSort) : "recommended";
  const minRaw = clampPrice(whole(one(params.min)), bounds.priceMax);
  const maxRaw = clampPrice(whole(one(params.max)), bounds.priceMax);
  const low = Number.isFinite(minRaw) ? minRaw : 0;
  const high = Number.isFinite(maxRaw) ? maxRaw : bounds.priceMax;
  const explicitLocations = list(params.loc);
  const pickup = one(params.q).trim();
  const knownPlace = (options.locationNames ?? []).find(
    (name) => name.toLowerCase() === pickup.toLowerCase(),
  );
  const canSeedPlace = fleet !== "mixed" && (options.locationNames?.length ?? 0) > 1;
  const locations =
    explicitLocations.length > 0 ? explicitLocations : canSeedPlace && knownPlace ? [knownPlace] : [];

  const adultsRaw = whole(one(params.adults));
  const childrenRaw = whole(one(params.children));
  const roomsRaw = whole(one(params.rooms));
  const seatsRaw = whole(one(params.seats));
  const hasParty = Number.isFinite(adultsRaw) || Number.isFinite(childrenRaw) || Number.isFinite(seatsRaw);
  const adults = Number.isFinite(adultsRaw)
    ? Math.max(0, adultsRaw)
    : Number.isFinite(seatsRaw)
      ? Math.max(0, seatsRaw)
      : 2;
  const children = Number.isFinite(childrenRaw) ? Math.max(0, childrenRaw) : 0;
  const rooms = Number.isFinite(roomsRaw) && roomsRaw > 0 ? roomsRaw : 1;
  const passengersActive = fleet !== "bike" && hasParty && adults + children > 0;

  return {
    pickup,
    dropoff: one(params.dropoff).trim(),
    pickupAt: one(params.pickup).trim(),
    returnAt: one(params.return).trim(),
    adults: passengersActive ? adults : 2,
    children: passengersActive ? children : 1,
    rooms: passengersActive ? rooms : 1,
    passengersActive,
    search: one(params.name).trim(),
    filters: {
      locations,
      categories: list(params.type, true),
      suppliers: list(params.brand),
      specifications: list(params.spec),
      mileage: list(params.miles, true),
      transmissions: list(params.gear, true),
      fuelPolicies: list(params.fuel, true),
      tags: list(params.tag),
      price: low <= high ? [low, high] : [high, low],
    },
    sort,
  };
}

export function rentalQueryParams(
  state: RentalListQuery,
  options: { priceMax: number; fleet: RentalFleet },
) {
  const params = new URLSearchParams();
  const pickup = state.pickup.trim();
  const singlePlace = options.fleet !== "mixed" && state.filters.locations.length === 1;
  const placeIsPickup =
    singlePlace &&
    (!pickup || pickup.toLowerCase() === state.filters.locations[0].toLowerCase());

  if (placeIsPickup) params.set("q", state.filters.locations[0]);
  else if (pickup) params.set("q", pickup);
  if (state.dropoff) params.set("dropoff", state.dropoff);
  if (state.pickupAt) params.set("pickup", state.pickupAt);
  if (state.returnAt) params.set("return", state.returnAt);

  if (options.fleet !== "bike" && state.passengersActive) {
    const total = state.adults + state.children;
    if (total > 0) params.set("seats", String(total));
    if (state.children > 0) {
      params.set("adults", String(state.adults));
      params.set("children", String(state.children));
    }
    if (state.rooms !== 1) params.set("rooms", String(state.rooms));
  }

  if (state.search) params.set("name", state.search);
  if (!placeIsPickup) {
    for (const value of state.filters.locations) params.append("loc", value);
  }
  for (const value of state.filters.categories) params.append("type", value);
  for (const value of state.filters.suppliers) params.append("brand", value);
  for (const value of state.filters.specifications) params.append("spec", value);
  for (const value of state.filters.mileage) params.append("miles", value);
  for (const value of state.filters.transmissions) params.append("gear", value);
  for (const value of state.filters.fuelPolicies) params.append("fuel", value);
  for (const value of state.filters.tags) params.append("tag", value);
  if (state.filters.price[0] > 0) params.set("min", String(state.filters.price[0]));
  if (state.filters.price[1] < options.priceMax) params.set("max", String(state.filters.price[1]));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  return params;
}

export function rentalQueryString(
  state: RentalListQuery,
  options: { priceMax: number; fleet: RentalFleet },
) {
  return rentalQueryParams(state, options).toString();
}
