"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteDestination, setDestinationPopular } from "@/actions/destinations";
import {
  DestinationForm,
  type DestinationFormValues,
} from "@/components/admin/DestinationForm";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Toggle } from "@/components/ui/Toggle";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { descendantIds } from "@/lib/destinations";

type SortKey =
  | "name"
  | "parent"
  | "region"
  | "country"
  | "places"
  | "listings"
  | "popular"
  | "status";

type DestinationRow = DestinationFormValues & {
  slug: string;
  parentName: string | null;
  childCount: number;
  linkedCount: number;
  meta: string;
};

function toastMessage(
  notice?: "deleted" | "children" | "listings" | "added" | "saved" | null,
) {
  if (notice === "added") return "Destination added.";
  if (notice === "saved") return "Destination saved.";
  return null;
}

function destinationMatchesSearch(item: DestinationRow, needle: string) {
  const tokens = needle.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const identity = [
    item.name,
    item.parentName,
    item.summary,
    item.slug,
    item.mapLat,
    item.mapLng,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const region = item.region.toLowerCase();
  const country = item.country.toLowerCase();

  if (tokens.length === 1) {
    const token = tokens[0];
    if (identity.includes(token)) return true;
    // "jammu" is a destination, not every place in "Jammu and Kashmir".
    return region === token || country === token;
  }

  const haystack = `${identity} ${region} ${country}`;
  return tokens.every((token) => haystack.includes(token));
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
  const className = `inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-medium whitespace-nowrap ${tones[tone]}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
      {label}
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

export function DestinationsWorkspace({
  destinations,
  canManage,
  mapApiKey,
  notice,
}: {
  destinations: DestinationRow[];
  canManage: boolean;
  mapApiKey: string;
  notice?: "deleted" | "children" | "listings" | "added" | "saved" | null;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [parentFilter, setParentFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const [published, setPublished] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [popularState, setPopularState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(destinations.map((item) => [item.id, item.popular])),
  );
  const [popularError, setPopularError] = useState<string | null>(null);
  const [pendingPopularId, setPendingPopularId] = useState<string | null>(null);
  const [, startPopular] = useTransition();
  const [deleting, setDeleting] = useState<DestinationRow | null>(null);
  const [toast, setToast] = useState<string | null>(() => toastMessage(notice));

  const closeCreate = useCallback(() => setCreateOpen(false), []);
  const closeEdit = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const afterSave = useCallback((close: () => void, message: string) => {
    close();
    setToast(message);
  }, []);

  useEffect(() => {
    setPopularState(
      Object.fromEntries(destinations.map((item) => [item.id, item.popular])),
    );
  }, [destinations]);

  useEffect(() => {
    const message = toastMessage(notice);
    if (!message) return;
    setToast(message);
    document.cookie = "destination_toast=; Max-Age=0; path=/admin/destinations";
    const url = new URL(window.location.href);
    if (!url.searchParams.has("saved")) return;
    url.searchParams.delete("saved");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
  }, [notice]);

  const parentChoices = useMemo(() => {
    const used = new Set(
      destinations
        .map((destination) => destination.parentId)
        .filter((id): id is string => Boolean(id)),
    );
    return destinations
      .filter((destination) => used.has(destination.id))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [destinations]);

  const countryChoices = useMemo(
    () =>
      [...new Set(destinations.map((destination) => destination.country))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [destinations],
  );

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const rows = destinations.filter((item) => {
      if (statusFilter === "active" && !item.published) return false;
      if (statusFilter === "inactive" && item.published) return false;
      if (parentFilter === "top" && item.parentId) return false;
      if (
        parentFilter !== "all" &&
        parentFilter !== "top" &&
        item.parentId !== parentFilter
      ) {
        return false;
      }
      if (countryFilter !== "all" && item.country !== countryFilter) return false;
      return destinationMatchesSearch(item, needle);
    });

    const direction = sortDir === "asc" ? 1 : -1;
    const value = (item: DestinationRow) => {
      switch (sortKey) {
        case "parent":
          return item.parentName ?? "";
        case "region":
          return item.region;
        case "country":
          return item.country;
        case "places":
          return item.childCount;
        case "listings":
          return item.linkedCount;
        case "popular":
          return popularState[item.id] ? 1 : 0;
        case "status":
          return item.published ? "Active" : "Inactive";
        default:
          return item.name;
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
  }, [
    countryFilter,
    debouncedQuery,
    destinations,
    parentFilter,
    sortDir,
    popularState,
    sortKey,
    statusFilter,
  ]);

  const filtersActive =
    Boolean(debouncedQuery.trim()) ||
    statusFilter !== "all" ||
    parentFilter !== "all" ||
    countryFilter !== "all";

  function togglePopular(destination: DestinationRow) {
    const next = !(popularState[destination.id] ?? destination.popular);
    setPopularError(null);
    setPopularState((current) => ({ ...current, [destination.id]: next }));
    setPendingPopularId(destination.id);
    startPopular(async () => {
      const result = await setDestinationPopular(destination.id, next);
      setPendingPopularId(null);
      if (result.error) {
        setPopularState((current) => ({ ...current, [destination.id]: !next }));
        setPopularError(result.error);
      }
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  const parentOptionsFor = useCallback(
    (excludeId?: string) => {
      const hidden = new Set<string>();
      if (excludeId) {
        hidden.add(excludeId);
        for (const id of descendantIds(excludeId, destinations)) hidden.add(id);
      }
      const byId = new Map(destinations.map((row) => [row.id, row]));
      const labelFor = (row: DestinationRow) => {
        const names = [row.name];
        let current = row;
        const seen = new Set([row.id]);
        while (
          current.parentId &&
          byId.has(current.parentId) &&
          !seen.has(current.parentId)
        ) {
          const parent = byId.get(current.parentId)!;
          seen.add(parent.id);
          names.unshift(parent.name);
          current = parent;
        }
        return names.join(" / ");
      };

      return destinations
        .filter((row) => !hidden.has(row.id))
        .map((row) => ({ id: row.id, label: labelFor(row) }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    [destinations],
  );

  const deleteBlockedReason = deleting
    ? deleting.childCount > 0
      ? "children"
      : deleting.linkedCount > 0
        ? "listings"
        : null
    : null;

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">
            Destinations
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Places on the site. Mark a destination as popular to feature it on
            the home page. A destination can sit inside another, such as
            Pahalgam inside Kashmir.
          </p>
        </div>
        {canManage ? (
          <Button
            type="button"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => {
              setFormPopular(false);
              setCreateOpen(true);
            }}
          >
            Add destination
          </Button>
        ) : null}
      </div>

      {notice === "deleted" ? (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800"
        >
          Destination deleted.
        </p>
      ) : null}
      {notice === "children" ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          That destination still has places inside it. Move or delete those
          first.
        </p>
      ) : null}
      {notice === "listings" ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          That destination still has tours, hotels, rentals, or bus routes. Move
          or remove them first.
        </p>
      ) : null}
      {popularError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {popularError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search destinations</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, parent, region"
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
            setStatusFilter(value as "all" | "active" | "inactive")
          }
          searchPlaceholder="Search statuses"
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          className="!h-10"
          wrapperClassName="lg:w-40"
        />
        <SearchableSelect
          ariaLabel="Filter by parent"
          value={parentFilter}
          onChange={setParentFilter}
          searchPlaceholder="Search parents"
          options={[
            { value: "all", label: "All parents" },
            { value: "top", label: "Top-level only" },
            ...parentChoices.map((parent) => ({
              value: parent.id,
              label: `In ${parent.name}`,
            })),
          ]}
          className="!h-10"
          wrapperClassName="lg:w-52"
        />
        <SearchableSelect
          ariaLabel="Filter by country"
          value={countryFilter}
          onChange={setCountryFilter}
          searchPlaceholder="Search countries"
          options={[
            { value: "all", label: "All countries" },
            ...countryChoices.map((country) => ({
              value: country,
              label: country,
            })),
          ]}
          className="!h-10"
          wrapperClassName="lg:w-44"
        />
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setParentFilter("all");
              setCountryFilter("all");
            }}
            className="text-left text-xs font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        <p className="text-xs text-muted lg:ml-auto">
          {filtered.length} of {destinations.length}
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
              <SortHeader
                label="Name"
                column="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Parent"
                column="parent"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Region"
                column="region"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Country"
                column="country"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Places"
                column="places"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="Listings"
                column="listings"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="Popular"
                column="popular"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
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
            {destinations.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-8 text-center text-sm text-muted"
                >
                  No destinations yet.
                  {canManage ? " Add the first place your clients book." : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-8 text-center text-sm text-muted"
                >
                  No destinations match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((destination) => (
                <tr key={destination.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={destination.imageUrl}
                      alt=""
                      className="h-10 w-14 rounded-md border border-line object-cover"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/destinations/${destination.id}`}
                      className="font-semibold text-navy hover:text-brand hover:underline"
                    >
                      {destination.name}
                    </Link>
                    <p className="line-clamp-1 max-w-xs text-xs text-muted">
                      {destination.summary}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {destination.parentName ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-navy">{destination.region}</td>
                  <td className="px-3 py-2 text-navy">{destination.country}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-navy">
                    {destination.childCount}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-navy">
                    {destination.linkedCount}
                  </td>
                  <td className="px-3 py-2">
                    {canManage ? (
                      <Toggle
                        checked={Boolean(popularState[destination.id])}
                        disabled={pendingPopularId === destination.id}
                        onChange={() => togglePopular(destination)}
                        label={
                          popularState[destination.id]
                            ? `${destination.name} is popular`
                            : `Mark ${destination.name} as popular`
                        }
                      />
                    ) : popularState[destination.id] ? (
                      <Badge tone="brand">Popular</Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {destination.published ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="warning">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <ActionPill
                        label="View"
                        tone="view"
                        href={`/admin/destinations/${destination.id}`}
                      >
                        <EyeIcon />
                      </ActionPill>
                      {canManage ? (
                        <ActionPill
                          label="Edit"
                          tone="edit"
                          onClick={() => {
                            setPublished(destination.published);
                            setFormPopular(Boolean(popularState[destination.id]));
                            setEditing(destination);
                          }}
                        >
                          <PencilIcon />
                        </ActionPill>
                      ) : null}
                      {canManage ? (
                        <ActionPill
                          label="Delete"
                          tone="delete"
                          onClick={() => setDeleting(destination)}
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

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Add destination"
        description="Add a top-level place, or put it inside another destination."
        size="xl"
        fill
        headerExtra={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
              Popular
              <FieldHelp label="Popular" />
            </span>
            <Toggle
              checked={formPopular}
              onChange={setFormPopular}
              label={formPopular ? "Popular" : "Not popular"}
              size="md"
            />
          </div>
        }
      >
        <DestinationForm
          parentOptions={parentOptionsFor()}
          mapApiKey={mapApiKey}
          popular={formPopular}
          onCancel={closeCreate}
          onSuccess={(message) => afterSave(closeCreate, message)}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={closeEdit}
        title="Edit destination"
        description="Changes show on the public site as soon as you save."
        size="xl"
        fill
        headerExtra={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                Popular
                <FieldHelp label="Popular" />
              </span>
              <Toggle
                checked={formPopular}
                onChange={setFormPopular}
                label={formPopular ? "Popular" : "Not popular"}
                size="md"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                Active
                <FieldHelp label="Active" />
              </span>
              <Toggle
                checked={published}
                onChange={setPublished}
                label={published ? "Active" : "Inactive"}
                size="md"
              />
            </div>
          </div>
        }
      >
        {editing ? (
          <DestinationForm
            destination={editing}
            parentOptions={parentOptionsFor(editing.id)}
            mapApiKey={mapApiKey}
            published={published}
            popular={formPopular}
            onCancel={closeEdit}
            onSuccess={(message) => afterSave(closeEdit, message)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={closeDelete}
        title={
          deleteBlockedReason
            ? "Cannot delete this destination"
            : "Delete this destination?"
        }
        description={
          deleting
            ? deleteBlockedReason === "children"
              ? `“${deleting.name}” still has ${deleting.childCount} place${
                  deleting.childCount === 1 ? "" : "s"
                } inside it. Move or delete those first.`
              : deleteBlockedReason === "listings"
                ? `“${deleting.name}” still has ${deleting.linkedCount} linked listing${
                    deleting.linkedCount === 1 ? "" : "s"
                  }. Move or remove them first.`
                : `“${deleting.name}” will be removed from the site. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete destination"
        action={deleteBlockedReason || !deleting ? undefined : deleteDestination}
        fields={deleting ? { destinationId: deleting.id } : undefined}
      />
      {toast ? <SuccessToast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}

function SuccessToast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = window.setTimeout(() => onDoneRef.current(), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <p
        role="status"
        className="pointer-events-auto rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 shadow-lg"
      >
        {message}
      </p>
    </div>
  );
}
