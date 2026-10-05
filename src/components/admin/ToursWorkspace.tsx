"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { deleteTour } from "@/actions/tours";
import { Badge } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatMoney } from "@/lib/format";

type SortKey =
  | "title"
  | "destination"
  | "category"
  | "duration"
  | "price"
  | "status";

export type TourRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  published: boolean;
  destinationId: string | null;
  destinationName: string;
  category: string;
  durationDays: number;
  durationLabel: string;
  difficulty: string;
  priceFrom: number;
  currency: string;
};

function durationText(tour: TourRow) {
  if (tour.durationLabel.trim()) return tour.durationLabel;
  return `${tour.durationDays} day${tour.durationDays === 1 ? "" : "s"}`;
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
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M1.5 8S3.8 3.5 8 3.5 14.5 8 14.5 8 12.2 12.5 8 12.5 1.5 8 1.5 8Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M9.2 3.2 12.8 6.8M2.5 13.5l2.7-.6 7.4-7.4a1.2 1.2 0 0 0 0-1.7L11.2 2.4a1.2 1.2 0 0 0-1.7 0L2.1 9.8l.4 3.7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M3 4.5h10M6.2 4.5V3.2h3.6v1.3M4.2 4.5l.5 8.2h6.6l.5-8.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToursWorkspace({
  tours,
  destinations,
  canManage,
  notice,
}: {
  tours: TourRow[];
  destinations: { id: string; name: string }[];
  canManage: boolean;
  notice?: "deleted" | "saved" | null;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all",
  );
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleting, setDeleting] = useState<TourRow | null>(null);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const hasUnassigned = tours.some((tour) => !tour.destinationId);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const rows = tours.filter((tour) => {
      if (statusFilter === "published" && !tour.published) return false;
      if (statusFilter === "draft" && tour.published) return false;
      if (destinationFilter === "none" && tour.destinationId) return false;
      if (
        destinationFilter !== "all" &&
        destinationFilter !== "none" &&
        tour.destinationId !== destinationFilter
      ) {
        return false;
      }
      if (!needle) return true;
      const haystack = [
        tour.title,
        tour.summary,
        tour.destinationName,
        tour.category,
        tour.difficulty,
        tour.slug,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    const direction = sortDir === "asc" ? 1 : -1;
    const value = (tour: TourRow) => {
      switch (sortKey) {
        case "destination":
          return tour.destinationName;
        case "category":
          return tour.category;
        case "duration":
          return tour.durationDays;
        case "price":
          return tour.priceFrom;
        case "status":
          return tour.published ? "Published" : "Draft";
        default:
          return tour.title;
      }
    };

    return rows.slice().sort((a, b) => {
      const left = value(a);
      const right = value(b);
      const compared =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      if (compared !== 0) return compared * direction;
      return a.title.localeCompare(b.title);
    });
  }, [
    debouncedQuery,
    destinationFilter,
    sortDir,
    sortKey,
    statusFilter,
    tours,
  ]);

  const filtersActive =
    Boolean(debouncedQuery.trim()) ||
    statusFilter !== "all" ||
    destinationFilter !== "all";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">
            Tours and treks
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Trips attached to a destination. Use the step form to add or edit.
          </p>
        </div>
        {canManage && destinations.length > 0 ? (
          <ButtonLink
            href="/admin/tours/new"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
          >
            Add tour
          </ButtonLink>
        ) : null}
      </div>

      {notice === "deleted" ? (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800"
        >
          Tour deleted.
        </p>
      ) : null}
      {notice === "saved" ? (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800"
        >
          Tour saved.
        </p>
      ) : null}

      {canManage && destinations.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Add at least one destination before creating tours.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search tours</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, destination, category"
            className="!h-10 pr-9"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-1.5 text-xs text-muted hover:text-navy"
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </label>
        <SearchableSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          onChange={(value) =>
            setStatusFilter(value as "all" | "published" | "draft")
          }
          searchPlaceholder="Search statuses"
          options={[
            { value: "all", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ]}
          className="!h-10"
          wrapperClassName="lg:w-40"
        />
        <SearchableSelect
          ariaLabel="Filter by destination"
          value={destinationFilter}
          onChange={setDestinationFilter}
          searchPlaceholder="Search destinations"
          options={[
            { value: "all", label: "All destinations" },
            ...(hasUnassigned
              ? [{ value: "none", label: "No destination" }]
              : []),
            ...destinations.map((destination) => ({
              value: destination.id,
              label: destination.name,
            })),
          ]}
          className="!h-10"
          wrapperClassName="lg:w-52"
        />
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setDestinationFilter("all");
            }}
            className="text-left text-xs font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        <p className="text-xs text-muted lg:ml-auto">
          {filtered.length} of {tours.length}
          {filtersActive ? " match" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[64rem] border-collapse text-sm">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th scope="col" className="w-16 px-3 py-2.5">
                <span className="sr-only">Image</span>
              </th>
              <SortHeader
                label="Title"
                column="title"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Destination"
                column="destination"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Category"
                column="category"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Duration"
                column="duration"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Price"
                column="price"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="Status"
                column="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="text-xs font-semibold text-navy">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tours.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-muted"
                >
                  No tours yet.
                  {canManage && destinations.length > 0
                    ? " Add the first trek or tour."
                    : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-muted"
                >
                  No tours match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((tour) => (
                <tr key={tour.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">
                    {tour.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tour.imageUrl}
                        alt=""
                        className="h-10 w-14 rounded-md border border-line object-cover"
                      />
                    ) : (
                      <div className="h-10 w-14 rounded-md border border-line bg-surface" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/tours/${tour.id}/view`}
                      className="font-semibold text-navy hover:text-brand hover:underline"
                    >
                      {tour.title}
                    </Link>
                    <p className="line-clamp-1 max-w-xs text-xs text-muted">
                      {tour.summary || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-navy">
                    {tour.destinationId ? tour.destinationName : "—"}
                  </td>
                  <td className="px-3 py-2 text-navy">
                    {tour.category.trim() || "—"}
                  </td>
                  <td className="px-3 py-2 text-navy">{durationText(tour)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-navy">
                    {formatMoney(tour.priceFrom, tour.currency)}
                  </td>
                  <td className="px-3 py-2">
                    {tour.published ? (
                      <Badge tone="success">Published</Badge>
                    ) : (
                      <Badge tone="warning">Draft</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <ActionPill
                        label="View"
                        tone="view"
                        href={`/admin/tours/${tour.id}/view`}
                      >
                        <EyeIcon />
                      </ActionPill>
                      {canManage ? (
                        <ActionPill
                          label="Edit"
                          tone="edit"
                          href={`/admin/tours/${tour.id}`}
                        >
                          <PencilIcon />
                        </ActionPill>
                      ) : null}
                      {canManage ? (
                        <ActionPill
                          label="Delete"
                          tone="delete"
                          onClick={() => setDeleting(tour)}
                        >
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
        onClose={closeDelete}
        title="Delete this tour?"
        description={
          deleting
            ? `“${deleting.title}” will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete tour"
        action={deleting ? deleteTour : undefined}
        fields={deleting ? { tourId: deleting.id } : undefined}
      />
    </div>
  );
}
