"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { removeVehicle } from "@/actions/rental-admin";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatMoney } from "@/lib/format";
import { fleetLabel } from "@/lib/rentals/labels";

type SortKey = "name" | "destination" | "type" | "seats" | "price" | "listing";

export type FleetRow = {
  id: string;
  slug: string;
  name: string;
  registrationNumber: string;
  summary: string;
  imageUrl: string;
  kind: string;
  typeName: string;
  destinationId: string;
  destinationName: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  currency: string;
  published: boolean;
  documentWarning: "" | "soon" | "expired";
};

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

export function FleetWorkspace({
  vehicles,
  destinations,
  canManage,
  notice,
  error,
}: {
  vehicles: FleetRow[];
  destinations: { id: string; name: string }[];
  canManage: boolean;
  notice?: "deleted" | "saved" | null;
  error?: string | null;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [listingFilter, setListingFilter] = useState<"all" | "published" | "draft">("all");
  const [fleetFilter, setFleetFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleting, setDeleting] = useState<FleetRow | null>(null);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const rows = vehicles.filter((vehicle) => {
      if (listingFilter === "published" && !vehicle.published) return false;
      if (listingFilter === "draft" && vehicle.published) return false;
      if (fleetFilter !== "all" && vehicle.kind !== fleetFilter) return false;
      if (destinationFilter !== "all" && vehicle.destinationId !== destinationFilter) return false;
      if (!needle) return true;
      const haystack = [
        vehicle.name,
        vehicle.registrationNumber,
        vehicle.summary,
        vehicle.destinationName,
        vehicle.typeName,
        vehicle.transmission,
        vehicle.fuel,
        vehicle.slug,
        fleetLabel(vehicle.kind),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    const direction = sortDir === "asc" ? 1 : -1;
    const value = (vehicle: FleetRow) => {
      switch (sortKey) {
        case "destination":
          return vehicle.destinationName;
        case "type":
          return vehicle.typeName;
        case "seats":
          return vehicle.seats;
        case "price":
          return vehicle.pricePerDay;
        case "listing":
          return `${vehicle.published ? "Published" : "Draft"} ${vehicle.documentWarning}`;
        default:
          return vehicle.name;
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
      return a.name.localeCompare(b.name);
    });
  }, [debouncedQuery, destinationFilter, fleetFilter, listingFilter, sortDir, sortKey, vehicles]);

  const filtersActive =
    Boolean(debouncedQuery.trim()) ||
    listingFilter !== "all" ||
    fleetFilter !== "all" ||
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
          <h1 className="text-xl font-semibold tracking-tight text-navy">Fleet</h1>
          <p className="mt-0.5 text-xs text-muted">
            Cars and bikes. Use the step form to add or edit.
          </p>
        </div>
        {canManage ? (
          <ButtonLink href="/admin/rentals/fleet/new" size="sm" className="w-full shrink-0 sm:w-auto">
            Add vehicle
          </ButtonLink>
        ) : null}
      </div>

      {notice === "deleted" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Vehicle deleted.
        </p>
      ) : null}
      {notice === "saved" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Vehicle saved.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search vehicles</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, type, destination"
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
          ariaLabel="Filter by listing"
          value={listingFilter}
          onChange={(value) => setListingFilter(value as "all" | "published" | "draft")}
          searchPlaceholder="Search listing"
          options={[
            { value: "all", label: "All listings" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ]}
          className="!h-10"
          wrapperClassName="lg:w-40"
        />
        <SearchableSelect
          ariaLabel="Filter by fleet"
          value={fleetFilter}
          onChange={setFleetFilter}
          searchPlaceholder="Search fleet"
          options={[
            { value: "all", label: "Cars and bikes" },
            { value: "car", label: "Cars" },
            { value: "bike", label: "Bikes" },
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
            ...destinations.map((destination) => ({
              value: destination.id,
              label: destination.name,
            })),
          ]}
          className="!h-10"
          wrapperClassName="lg:w-48"
        />
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setListingFilter("all");
              setFleetFilter("all");
              setDestinationFilter("all");
            }}
            className="text-left text-xs font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        <p className="text-xs text-muted lg:ml-auto">
          {filtered.length} of {vehicles.length}
          {filtersActive ? " match" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[72rem] border-collapse text-sm">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th scope="col" className="w-16 px-3 py-2.5">
                <span className="sr-only">Image</span>
              </th>
              <SortHeader label="Name" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Destination" column="destination" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Type" column="type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Seats" column="seats" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Price" column="price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
              <SortHeader label="Listing" column="listing" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="text-xs font-semibold text-navy">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No vehicles yet.{canManage ? " Add the first car or bike." : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No vehicles match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">
                    {vehicle.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={vehicle.imageUrl} alt="" className="h-10 w-14 rounded-md border border-line object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded-md border border-line bg-surface" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/rentals/fleet/${vehicle.id}`} className="font-semibold text-navy hover:text-brand hover:underline">
                      {vehicle.name}
                    </Link>
                    <p className="text-xs font-medium tracking-wide text-navy">{vehicle.registrationNumber}</p>
                    <p className="line-clamp-1 max-w-xs text-xs text-muted">
                      {fleetLabel(vehicle.kind)}
                      {vehicle.summary ? ` · ${vehicle.summary}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-navy">{vehicle.destinationName || "—"}</td>
                  <td className="px-3 py-2 text-navy">
                    {vehicle.typeName || "—"}
                    <p className="text-xs text-muted">
                      {[vehicle.transmission, vehicle.fuel].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-navy">{vehicle.seats}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-navy">
                    {formatMoney(vehicle.pricePerDay, vehicle.currency)}
                    <p className="text-xs text-muted">/ day</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {vehicle.published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
                      {vehicle.documentWarning === "expired" ? <Badge tone="danger">Document expired</Badge> : null}
                      {vehicle.documentWarning === "soon" ? <Badge tone="warning">Expires soon</Badge> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <ActionPill label="View" tone="view" href={vehicle.published ? `/rentals/${vehicle.slug}` : `/admin/rentals/fleet/${vehicle.id}`}>
                        <EyeIcon />
                      </ActionPill>
                      {canManage ? (
                        <ActionPill label="Edit" tone="edit" href={`/admin/rentals/fleet/${vehicle.id}`}>
                          <PencilIcon />
                        </ActionPill>
                      ) : null}
                      {canManage ? (
                        <ActionPill label="Delete" tone="delete" onClick={() => setDeleting(vehicle)}>
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
        title="Delete this vehicle?"
        description={
          deleting ? `“${deleting.name}” will be removed. This cannot be undone.` : ""
        }
        confirmLabel="Delete vehicle"
        action={deleting ? removeVehicle : undefined}
        fields={deleting ? { id: deleting.id } : undefined}
      />
    </div>
  );
}
