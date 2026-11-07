import { prisma } from "@/lib/db";
import { hasSearchableQuery, normalizeSearch } from "@/lib/search/rank";

export const searchSources = [
  "catalog",
  "tours",
  "hotels",
  "cars",
  "bikes",
  "buses",
  "destinations",
] as const;

export type SearchSource = (typeof searchSources)[number];

export const searchSourceLabel: Record<SearchSource, string> = {
  catalog: "Site search",
  tours: "Tours",
  hotels: "Hotels",
  cars: "Cars",
  bikes: "Bikes",
  buses: "Buses",
  destinations: "Destinations",
};

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function compactFilters(filters: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value == null) continue;
    if (typeof value === "string" && !value.trim()) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/** Persist a customer search. Safe to fire-and-forget — failures are logged only. */
export async function recordSearch(input: {
  query: string;
  source: SearchSource;
  results?: number;
  filters?: Record<string, unknown>;
}) {
  const query = input.query.trim().slice(0, 120);
  const filters = compactFilters(input.filters ?? {});
  const queryNorm =
    normalizeSearch(query) ||
    normalizeSearch(
      Object.values(filters)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map(String)
        .join(" "),
    );

  if (!queryNorm || (query.length < 2 && Object.keys(filters).length === 0)) return;
  if (query && !hasSearchableQuery(query) && Object.keys(filters).length === 0) return;

  try {
    await prisma.searchEvent.create({
      data: {
        query: query || Object.values(filters).flatMap((v) => (Array.isArray(v) ? v : [v])).map(String).join(" · ").slice(0, 120),
        queryNorm,
        source: input.source,
        results: Math.max(0, Math.floor(input.results ?? 0)),
        filtersJson: JSON.stringify(filters),
      },
    });
  } catch (error) {
    console.error("search log failed", error);
  }
}

/** Log a listing-page filter/search from URL params without blocking the page. */
export function logListingSearch(
  source: SearchSource,
  params: Record<string, string | string[] | undefined>,
  extras?: { results?: number; placeLabel?: string; queryOverride?: string },
) {
  const q = extras?.queryOverride?.trim() || one(params.q);
  const place = one(params.place);
  const from = one(params.from);
  const to = one(params.to);
  const region = one(params.region);
  const location = one(params.location) || one(params.loc);
  const name = one(params.name);

  let query = q;
  if (!query && extras?.placeLabel) query = extras.placeLabel;
  if (!query && place && place !== "all") query = extras?.placeLabel || place;
  if (!query && from && to) query = `${from} → ${to}`;
  else if (!query && from) query = from;
  else if (!query && to) query = to;
  if (!query && region) query = region;
  if (!query && location) query = location;
  if (!query && name) query = name;

  const filters = compactFilters({
    place: place && place !== "all" ? place : undefined,
    from: from || undefined,
    to: to || undefined,
    region: region || undefined,
    location: location || undefined,
    cat: one(params.cat) || undefined,
  });

  // Only log when the customer typed something or picked a place/route — skip bare date/sort loads.
  if (!query.trim() && Object.keys(filters).length === 0) return;

  void recordSearch({
    query,
    source,
    results: extras?.results,
    filters,
  });
}
