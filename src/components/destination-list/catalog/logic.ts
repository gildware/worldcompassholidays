import type { DestinationListCard, DestinationSort } from "@/components/destination-list/types";

export type DestCatalogView = "list" | "grid";

export type DestCatalogQuery = {
  q: string;
  country: string;
  region: string;
  popular: boolean;
  hasTours: boolean;
  hasHotels: boolean;
  hasRentals: boolean;
  sort: DestinationSort;
  view: DestCatalogView;
};

export const SORT_LABELS: Record<DestinationSort, string> = {
  recommended: "Recommended",
  name: "Name A–Z",
  country: "Country",
};

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function uniqueValues(items: DestinationListCard[], field: "country" | "region", country = "") {
  const source = country ? items.filter((item) => item.country === country) : items;
  return [...new Set(source.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "en"));
}

export function placeOptions(items: DestinationListCard[]) {
  const names = new Set<string>();
  items.forEach((item) => {
    names.add(item.name);
    if (item.region && item.region !== item.name) names.add(item.region);
    item.placeNames.forEach((place) => names.add(place));
  });
  return [...names].sort((a, b) => a.localeCompare(b, "en"));
}

function haystack(item: DestinationListCard) {
  return `${item.name} ${item.region} ${item.country} ${item.parentName} ${item.placeNames.join(" ")} ${item.summary}`.toLowerCase();
}

export type MatchIgnore = "q" | "country" | "region" | "popular" | "tours" | "hotels" | "rentals";

export function matches(item: DestinationListCard, query: DestCatalogQuery, ignore?: MatchIgnore) {
  if (ignore !== "q" && query.q.trim()) {
    if (!haystack(item).includes(query.q.trim().toLowerCase())) return false;
  }
  if (ignore !== "country" && query.country && item.country !== query.country) return false;
  if (ignore !== "region" && query.region && item.region !== query.region) return false;
  if (ignore !== "popular" && query.popular && !item.popular) return false;
  if (ignore !== "tours" && query.hasTours && item.tourCount <= 0) return false;
  if (ignore !== "hotels" && query.hasHotels && item.hotelCount <= 0) return false;
  if (ignore !== "rentals" && query.hasRentals && item.rentalCount <= 0) return false;
  return true;
}

export function facetCount(
  items: DestinationListCard[],
  query: DestCatalogQuery,
  ignore: MatchIgnore,
  test: (item: DestinationListCard) => boolean,
) {
  return items.filter((item) => matches(item, query, ignore) && test(item)).length;
}

function compare(a: DestinationListCard, b: DestinationListCard, sort: DestinationSort) {
  if (sort === "name") return a.name.localeCompare(b.name, "en");
  if (sort === "country") {
    return a.country.localeCompare(b.country, "en") || a.name.localeCompare(b.name, "en");
  }
  return Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name, "en");
}

export function visibleDestinations(items: DestinationListCard[], query: DestCatalogQuery) {
  return items.filter((item) => matches(item, query)).sort((a, b) => compare(a, b, query.sort));
}

export function activeCount(query: DestCatalogQuery) {
  let count = 0;
  if (query.q.trim()) count += 1;
  if (query.country) count += 1;
  if (query.region) count += 1;
  if (query.popular) count += 1;
  if (query.hasTours) count += 1;
  if (query.hasHotels) count += 1;
  if (query.hasRentals) count += 1;
  return count;
}

export function clearQuery(current: DestCatalogQuery): DestCatalogQuery {
  return {
    ...current,
    q: "",
    country: "",
    region: "",
    popular: false,
    hasTours: false,
    hasHotels: false,
    hasRentals: false,
  };
}

export function readDestQuery(
  params: Record<string, string | string[] | undefined>,
  fallbackQ = "",
): DestCatalogQuery {
  const rawSort = one(params.sort);
  const sort: DestinationSort =
    rawSort === "name" || rawSort === "country" || rawSort === "recommended" ? rawSort : "recommended";
  return {
    q: one(params.q) || fallbackQ,
    country: one(params.country),
    region: one(params.region),
    popular: one(params.popular) === "1",
    hasTours: one(params.tours) === "1",
    hasHotels: one(params.hotels) === "1",
    hasRentals: one(params.rentals) === "1",
    sort,
    view: one(params.view) === "list" ? "list" : "grid",
  };
}

export function catalogSearch(query: DestCatalogQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.country) params.set("country", query.country);
  if (query.region) params.set("region", query.region);
  if (query.popular) params.set("popular", "1");
  if (query.hasTours) params.set("tours", "1");
  if (query.hasHotels) params.set("hotels", "1");
  if (query.hasRentals) params.set("rentals", "1");
  if (query.sort !== "recommended") params.set("sort", query.sort);
  if (query.view !== "list") params.set("view", query.view);
  return params.toString();
}

export function listingLine(item: DestinationListCard) {
  const parts = [
    item.tourCount > 0 ? `${item.tourCount} tour${item.tourCount === 1 ? "" : "s"}` : "",
    item.hotelCount > 0 ? `${item.hotelCount} stay${item.hotelCount === 1 ? "" : "s"}` : "",
    item.rentalCount > 0 ? `${item.rentalCount} rental${item.rentalCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Listings coming soon";
}

export function sortCopy(query: DestCatalogQuery, total: number) {
  const noun = total === 1 ? "destination" : "destinations";
  if (query.q.trim()) return `${total} ${noun} matching your search, sorted by ${SORT_LABELS[query.sort].toLowerCase()}.`;
  return `${total} ${noun}, sorted by ${SORT_LABELS[query.sort].toLowerCase()}.`;
}
