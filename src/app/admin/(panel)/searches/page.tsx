import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  searchSourceLabel,
  searchSources,
  type SearchSource,
} from "@/lib/search/log";

export const metadata: Metadata = { title: "Searches" };

export const dynamic = "force-dynamic";

const ranges = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
] as const;

function isSource(value: string | undefined): value is SearchSource {
  return Boolean(value && (searchSources as readonly string[]).includes(value));
}

function parseFilters(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function filterSummary(raw: string) {
  const filters = parseFilters(raw);
  const parts = Object.entries(filters)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);
  return parts.join(" · ");
}

export default async function AdminSearchesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; range?: string }>;
}) {
  await requirePermission("bookings.view");
  const params = await searchParams;
  const source = isSource(params.source) ? params.source : "all";
  const range = ranges.find((item) => item.key === params.range) ?? ranges[0];
  const since = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000);

  const where = {
    createdAt: { gte: since },
    ...(source === "all" ? {} : { source }),
  };

  const [total, zeroHits, recent, grouped] = await Promise.all([
    prisma.searchEvent.count({ where }),
    prisma.searchEvent.count({ where: { ...where, results: 0 } }),
    prisma.searchEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.searchEvent.groupBy({
      by: ["queryNorm", "source"],
      where,
      _count: { _all: true },
      _max: { query: true, createdAt: true },
      _avg: { results: true },
      orderBy: { _count: { queryNorm: "desc" } },
      take: 40,
    }),
  ]);

  const bySource = await prisma.searchEvent.groupBy({
    by: ["source"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { source: "desc" } },
  });

  const sourceCounts = Object.fromEntries(
    bySource.map((row) => [row.source, row._count._all]),
  ) as Partial<Record<SearchSource, number>>;

  const tabs: { key: "all" | SearchSource; label: string; count: number }[] = [
    { key: "all", label: "All", count: bySource.reduce((sum, row) => sum + row._count._all, 0) },
    ...searchSources.map((key) => ({
      key,
      label: searchSourceLabel[key],
      count: sourceCounts[key] ?? 0,
    })),
  ];

  function href(next: { source?: string; range?: string }) {
    const q = new URLSearchParams();
    const nextSource = next.source ?? (source === "all" ? "" : source);
    const nextRange = next.range ?? range.key;
    if (nextSource && nextSource !== "all") q.set("source", nextSource);
    if (nextRange !== "7") q.set("range", nextRange);
    const text = q.toString();
    return text ? `/admin/searches?${text}` : "/admin/searches";
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight text-navy">Searches</h1>
          <p className="mt-1 text-sm text-muted">
            {total === 0
              ? "No customer searches logged in this period yet."
              : `${total} searches · ${zeroHits} with no results · last ${range.label.toLowerCase()}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ranges.map((item) => (
            <Link
              key={item.key}
              href={href({ range: item.key })}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                item.key === range.key
                  ? "bg-navy text-white"
                  : "border border-line bg-white text-muted hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={href({ source: tab.key })}
            className={`rounded-full px-3 py-1 text-sm ${
              tab.key === source
                ? "bg-navy/10 font-medium text-navy"
                : "text-muted hover:bg-black/5 hover:text-navy"
            }`}
          >
            {tab.label}
            {tab.count > 0 ? ` · ${tab.count}` : ""}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-navy">Top searches</h2>
            <p className="text-xs text-muted">Grouped by query and area of the site.</p>
          </div>
          {grouped.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">Nothing to rank yet.</p>
          ) : (
            <ol className="divide-y divide-line">
              {grouped.map((row, index) => {
                const label =
                  (row.source in searchSourceLabel
                    ? searchSourceLabel[row.source as SearchSource]
                    : row.source) ?? row.source;
                return (
                  <li
                    key={`${row.queryNorm}-${row.source}`}
                    className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-navy">
                        <span className="mr-2 text-muted">{index + 1}.</span>
                        {row._max.query || row.queryNorm}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {label}
                        {row._avg.results != null
                          ? ` · avg ${Math.round(row._avg.results)} results`
                          : ""}
                        {row._max.createdAt
                          ? ` · last ${formatDate(row._max.createdAt)}`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-navy/8 px-2.5 py-0.5 text-xs font-semibold text-navy">
                      {row._count._all}×
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-navy">Recent searches</h2>
            <p className="text-xs text-muted">Latest customer queries and filters.</p>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">No recent searches.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((event) => {
                const label =
                  (event.source in searchSourceLabel
                    ? searchSourceLabel[event.source as SearchSource]
                    : event.source) ?? event.source;
                const filters = filterSummary(event.filtersJson);
                return (
                  <li key={event.id} className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-navy">{event.query}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {label}
                          {" · "}
                          {event.results === 0 ? "no results" : `${event.results} results`}
                          {filters ? ` · ${filters}` : ""}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-muted" dateTime={event.createdAt.toISOString()}>
                        {formatDateTime(event.createdAt)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
