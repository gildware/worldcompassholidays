"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { deleteHotel } from "@/actions/hotels";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatMoney } from "@/lib/format";
import { propertyTypeLabel } from "@/lib/hotels/options";

type SortKey = "name" | "destination" | "type" | "rooms" | "price" | "status";

export type HotelRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  published: boolean;
  destinationId: string | null;
  destinationName: string;
  propertyType: string;
  starRating: number;
  roomCount: number;
  priceFrom: number;
  currency: string;
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

export function HotelsWorkspace({
  hotels,
  destinations,
  canManage,
  notice,
}: {
  hotels: HotelRow[];
  destinations: { id: string; name: string }[];
  canManage: boolean;
  notice?: "deleted" | "saved" | null;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleting, setDeleting] = useState<HotelRow | null>(null);
  const closeDelete = useCallback(() => setDeleting(null), []);
  const hasUnassigned = hotels.some((hotel) => !hotel.destinationId);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const rows = hotels.filter((hotel) => {
      if (statusFilter === "published" && !hotel.published) return false;
      if (statusFilter === "draft" && hotel.published) return false;
      if (destinationFilter === "none" && hotel.destinationId) return false;
      if (
        destinationFilter !== "all" &&
        destinationFilter !== "none" &&
        hotel.destinationId !== destinationFilter
      ) {
        return false;
      }
      if (!needle) return true;
      return [
        hotel.name,
        hotel.summary,
        hotel.destinationName,
        propertyTypeLabel(hotel.propertyType),
        hotel.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    const direction = sortDir === "asc" ? 1 : -1;
    const value = (hotel: HotelRow) => {
      switch (sortKey) {
        case "destination":
          return hotel.destinationName;
        case "type":
          return propertyTypeLabel(hotel.propertyType);
        case "rooms":
          return hotel.roomCount;
        case "price":
          return hotel.priceFrom;
        case "status":
          return hotel.published ? "Published" : "Draft";
        default:
          return hotel.name;
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
  }, [debouncedQuery, destinationFilter, hotels, sortDir, sortKey, statusFilter]);

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
          <h1 className="text-xl font-semibold tracking-tight text-navy">Hotels</h1>
          <p className="mt-0.5 text-xs text-muted">
            A property has shared amenities. Each room has its own price, features, and amenities.
          </p>
        </div>
        {canManage && destinations.length > 0 ? (
          <ButtonLink href="/admin/hotels/new" size="sm" className="w-full shrink-0 sm:w-auto">
            Add hotel
          </ButtonLink>
        ) : null}
      </div>

      {notice === "deleted" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Hotel deleted.
        </p>
      ) : null}
      {notice === "saved" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Hotel saved.
        </p>
      ) : null}
      {canManage && destinations.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Add at least one destination before creating hotels.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search hotels</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or destination"
            className="!h-10 pr-9"
            autoComplete="off"
          />
        </label>
        <SearchableSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as "all" | "published" | "draft")}
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
            ...(hasUnassigned ? [{ value: "none", label: "No destination" }] : []),
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
          {filtered.length} of {hotels.length}
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
              <SortHeader label="Name" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Destination" column="destination" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Type" column="type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Rooms" column="rooms" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="From" column="price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
              <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="text-xs font-semibold text-navy">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No hotels yet.
                  {canManage && destinations.length > 0 ? " Add the first stay." : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                  No hotels match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((hotel) => (
                <tr key={hotel.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <div className="relative h-10 w-14 overflow-hidden rounded bg-surface">
                      {hotel.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={hotel.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-navy">{hotel.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                      {hotel.starRating > 0 ? `${hotel.starRating}-star · ` : ""}
                      {hotel.summary || hotel.slug}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-muted">{hotel.destinationName || "—"}</td>
                  <td className="px-3 py-2">{propertyTypeLabel(hotel.propertyType)}</td>
                  <td className="px-3 py-2">{hotel.roomCount}</td>
                  <td className="px-3 py-2 text-right">
                    {formatMoney(hotel.priceFrom, hotel.currency)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={hotel.published ? "success" : "warning"}>
                      {hotel.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <ActionPill label="View hotel" tone="view" href={`/admin/hotels/${hotel.id}/view`}>
                        <span aria-hidden>◉</span>
                      </ActionPill>
                      {canManage ? (
                        <ActionPill label="Edit hotel" tone="edit" href={`/admin/hotels/${hotel.id}`}>
                          <span aria-hidden>✎</span>
                        </ActionPill>
                      ) : null}
                      {canManage ? (
                        <ActionPill label="Delete hotel" tone="delete" onClick={() => setDeleting(hotel)}>
                          <span aria-hidden>✕</span>
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
        title="Delete this hotel?"
        description={
          deleting
            ? `${deleting.name} and its rooms will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete hotel"
        action={deleteHotel}
        fields={deleting ? { hotelId: deleting.id } : undefined}
      />
    </div>
  );
}
