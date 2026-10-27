"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteBusRoute } from "@/actions/buses";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { coachLabel, parseBusDuration } from "@/lib/buses";
import { formatMoney } from "@/lib/format";

export type BusListRow = {
  id: string;
  name: string;
  slug: string;
  fromCity: string;
  toCity: string;
  departTime: string;
  duration: string;
  fareFrom: number;
  coachType: string;
  operator: string;
  published: boolean;
  imageUrl: string;
  scheduleCount: number;
};

type SortKey = "name" | "route" | "depart" | "duration" | "fare" | "status";

function durationMinutes(value: string) {
  const parsed = parseBusDuration(value);
  return parsed.hours * 60 + parsed.minutes;
}

export function BusesWorkspace({
  routes,
  canManage,
  locationCount,
  busCount,
  notice,
}: {
  routes: BusListRow[];
  canManage: boolean;
  locationCount: number;
  busCount: number;
  notice: "saved" | "deleted" | null;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [fromCity, setFromCity] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("depart");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleting, setDeleting] = useState<BusListRow | null>(null);

  const cities = useMemo(
    () => [...new Set(routes.map((route) => route.fromCity).filter(Boolean))].sort(),
    [routes],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = routes.filter((route) => {
      if (status === "published" && !route.published) return false;
      if (status === "draft" && route.published) return false;
      if (fromCity !== "all" && route.fromCity !== fromCity) return false;
      if (!needle) return true;
      return [route.name, route.fromCity, route.toCity, route.operator, coachLabel(route.coachType)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    const direction = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const pair =
        sortKey === "route"
          ? [`${a.fromCity} ${a.toCity}`, `${b.fromCity} ${b.toCity}`]
          : sortKey === "depart"
            ? [a.departTime, b.departTime]
            : sortKey === "duration"
              ? [durationMinutes(a.duration), durationMinutes(b.duration)]
              : sortKey === "fare"
                ? [a.fareFrom, b.fareFrom]
                : sortKey === "status"
                  ? [a.published ? 1 : 0, b.published ? 1 : 0]
                  : [a.name, b.name];
      if (pair[0] < pair[1]) return -1 * direction;
      if (pair[0] > pair[1]) return 1 * direction;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [fromCity, query, routes, sortDir, sortKey, status]);

  function toggleSort(column: SortKey) {
    if (sortKey === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column);
    setSortDir(column === "name" || column === "route" ? "asc" : "asc");
  }

  const filtersActive = Boolean(query || status !== "all" || fromCity !== "all");

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">Routes</h1>
          <p className="mt-0.5 text-xs text-muted">
            A bus running between two locations, with boarding points, duration, and fare.
          </p>
        </div>
        {canManage ? (
          <ButtonLink href="/admin/buses/routes/new" size="sm" className="w-full shrink-0 sm:w-auto">
            Add route
          </ButtonLink>
        ) : null}
      </div>

      {notice === "saved" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Route saved.
        </p>
      ) : null}
      {notice === "deleted" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Route deleted.
        </p>
      ) : null}
      {canManage && busCount < 1 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Add a coach under{" "}
          <Link href="/admin/buses" className="font-medium underline">
            Buses
          </Link>{" "}
          first. Photos and facilities belong to the bus.
        </p>
      ) : null}
      {canManage && locationCount < 2 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Add at least two cities under{" "}
          <Link href="/admin/buses/locations" className="font-medium underline">
            Locations
          </Link>{" "}
          so a route can start and end somewhere.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search routes</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search coach, city, operator"
            className="!h-10"
            autoComplete="off"
          />
        </label>
        <SearchableSelect
          ariaLabel="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ]}
          className="!h-10"
          wrapperClassName="lg:w-40"
        />
        <SearchableSelect
          ariaLabel="Filter by start city"
          value={fromCity}
          onChange={setFromCity}
          options={[{ value: "all", label: "All start cities" }, ...cities.map((city) => ({ value: city, label: city }))]}
          className="!h-10"
          wrapperClassName="lg:w-52"
        />
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setFromCity("all");
            }}
            className="text-left text-xs font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        <p className="text-xs text-muted lg:ml-auto">
          {filtered.length} of {routes.length}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[64rem] border-collapse text-sm">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th scope="col" className="w-16 px-3 py-2.5">
                <span className="sr-only">Image</span>
              </th>
              <SortHeader label="Coach" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Route" column="route" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Departs" column="depart" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Duration" column="duration" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Fare" column="fare" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
              <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="text-xs font-semibold text-navy">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No routes yet.{canManage ? " Add the first route." : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No routes match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((route) => (
                <tr key={route.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">
                    {route.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={route.imageUrl} alt="" className="h-10 w-14 rounded-md border border-line object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded-md border border-line bg-surface" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/buses/routes/${route.id}/view`} className="font-semibold text-navy hover:text-brand hover:underline">
                      {route.name}
                    </Link>
                    <p className="line-clamp-1 max-w-xs text-xs text-muted">
                      {[route.operator, coachLabel(route.coachType)].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-navy">
                    {route.fromCity} → {route.toCity}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-navy">{route.departTime || "—"}</td>
                  <td className="px-3 py-2 text-navy">{route.duration || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-navy">
                    {route.fareFrom ? formatMoney(route.fareFrom) : "On request"}
                  </td>
                  <td className="px-3 py-2">
                    {route.published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <ActionPill label="View" tone="view" href={`/admin/buses/routes/${route.id}/view`}>
                        <EyeIcon />
                      </ActionPill>
                      {canManage ? (
                        <ActionPill label="Edit" tone="edit" href={`/admin/buses/routes/${route.id}`}>
                          <PencilIcon />
                        </ActionPill>
                      ) : null}
                      {canManage ? (
                        <ActionPill label="Delete" tone="delete" onClick={() => setDeleting(route)}>
                          <TrashIcon />
                        </ActionPill>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this route?"
        description={
          deleting
            ? `“${deleting.name}” will be removed${
                deleting.scheduleCount
                  ? `, along with ${deleting.scheduleCount} schedule${deleting.scheduleCount === 1 ? "" : "s"}`
                  : ""
              }. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete route"
        action={deleting ? deleteBusRoute : undefined}
        fields={deleting ? { routeId: deleting.id } : undefined}
      />
    </div>
  );
}

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (column: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === column;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-brand ${
          align === "right" ? "ml-auto" : ""
        }`}
      >
        {label}
        <span aria-hidden className={active ? "text-brand" : "text-muted"}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function ActionPill({
  label,
  tone,
  children,
  href,
  onClick,
}: {
  label: string;
  tone: "view" | "edit" | "delete";
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const tones = {
    view: "border-brand/30 bg-brand-soft text-brand hover:bg-brand/15",
    edit: "border-line bg-white text-navy hover:bg-surface",
    delete: "border-red-200 bg-white text-red-700 hover:bg-red-50",
  };
  const className = `inline-flex h-7 w-7 items-center justify-center rounded-full border ${tones[tone]}`;
  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4S1.5 8 1.5 8Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M9.2 3.2 12.8 6.8 5.5 14.1H2v-3.5L9.2 3.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.6 8.2h5.8l.6-8.2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
