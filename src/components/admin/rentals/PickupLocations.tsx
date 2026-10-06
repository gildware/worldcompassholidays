"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removePickupLocation, saveRentalLocation } from "@/actions/rental-admin";
import { LocationMapPicker } from "@/components/admin/LocationMapPicker";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";

export type PickupLocation = {
  id: string;
  name: string;
  address: string;
  active: boolean;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
};

type SortKey = "name" | "address" | "status";

function toImage(location: PickupLocation | null): UploadedImage | null {
  if (!location?.imageUrl) return null;
  return {
    url: location.imageUrl,
    key: location.imageKey,
    driver: location.imageDriver === "cloudinary" ? "cloudinary" : "local",
  };
}

function ActionPill({
  label,
  tone,
  children,
  onClick,
}: {
  label: string;
  tone: "edit" | "delete";
  children: React.ReactNode;
  onClick: () => void;
}) {
  const tones = {
    edit: "border-line bg-white text-navy hover:bg-surface",
    delete: "border-red-200 bg-white text-red-700 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-medium whitespace-nowrap ${tones[tone]}`}
    >
      {children}
      {label}
    </button>
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

export function PickupLocations({
  locations,
  mapApiKey,
  manage,
  blocked,
}: {
  locations: PickupLocation[];
  mapApiKey: string;
  manage: boolean;
  blocked?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PickupLocation | null>(null);
  const [deleting, setDeleting] = useState<PickupLocation | null>(null);
  const open = creating || Boolean(editing);
  const current = editing;

  const filtered = useMemo(() => {
    const tokens = debouncedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = locations.filter((location) => {
      if (statusFilter === "active" && !location.active) return false;
      if (statusFilter === "inactive" && location.active) return false;
      if (tokens.length === 0) return true;
      const haystack = [location.name, location.address, location.mapLat, location.mapLng]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
    const direction = sortDir === "asc" ? 1 : -1;
    return rows.slice().sort((a, b) => {
      const left =
        sortKey === "address" ? a.address : sortKey === "status" ? (a.active ? "Active" : "Inactive") : a.name;
      const right =
        sortKey === "address" ? b.address : sortKey === "status" ? (b.active ? "Active" : "Inactive") : b.name;
      const compared = left.localeCompare(right);
      return compared === 0 ? a.name.localeCompare(b.name) : compared * direction;
    });
  }, [debouncedQuery, locations, sortDir, sortKey, statusFilter]);

  const filtersActive = Boolean(debouncedQuery.trim()) || statusFilter !== "all";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((currentDir) => (currentDir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">Pickup locations</h1>
          <p className="mt-0.5 text-xs text-muted">
            Counter desks customers can choose. Each one has a name, address, map pin, and image.
          </p>
        </div>
        {manage ? (
          <Button type="button" size="sm" className="w-full shrink-0 sm:w-auto" onClick={() => setCreating(true)}>
            Add location
          </Button>
        ) : null}
      </div>

      {blocked ? (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          That location is used on bookings. Deactivate it instead of deleting it.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search pickup locations</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or address"
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
          onChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
          searchPlaceholder="Search statuses"
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          className="!h-10"
          wrapperClassName="lg:w-40"
        />
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="text-left text-xs font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        <p className="text-xs text-muted lg:ml-auto">
          {filtered.length} of {locations.length}
          {filtersActive ? " match" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th scope="col" className="w-16 px-3 py-2.5">
                <span className="sr-only">Image</span>
              </th>
              <SortHead label="Name" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHead label="Address" column="address" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                Location
              </th>
              <SortHead label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="text-xs font-semibold text-navy">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                  No pickup locations yet.{manage ? " Add the first desk." : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                  No pickup locations match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((location) => (
                <tr key={location.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">
                    {location.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={location.imageUrl}
                        alt=""
                        className="h-10 w-14 rounded-md border border-line object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-14 items-center justify-center rounded-md border border-line bg-surface text-xs font-semibold text-muted">
                        {location.name.slice(0, 1)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-navy">{location.name}</p>
                  </td>
                  <td className="max-w-xs px-3 py-2 text-navy">
                    <p className="line-clamp-2">{location.address || "—"}</p>
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {location.mapLat && location.mapLng ? `${location.mapLat}, ${location.mapLng}` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {location.active ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    {manage ? (
                      <div className="flex justify-end gap-1.5">
                        <ActionPill label="Edit" tone="edit" onClick={() => setEditing(location)}>
                          <PencilIcon />
                        </ActionPill>
                        <ActionPill label="Delete" tone="delete" onClick={() => setDeleting(location)}>
                          <TrashIcon />
                        </ActionPill>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={closeForm}
        title={current ? "Edit location" : "Add location"}
        description="Name, address, map pin, and image for this pickup desk."
        size="xl"
      >
        {open ? (
          <LocationForm
            key={current?.id ?? "new"}
            location={current}
            mapApiKey={mapApiKey}
            onCancel={closeForm}
            onSaved={() => {
              closeForm();
              router.refresh();
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this location?"
        description={
          deleting ? `“${deleting.name}” will be removed. This cannot be undone.` : ""
        }
        confirmLabel="Delete location"
        action={deleting ? removePickupLocation : undefined}
        fields={deleting ? { id: deleting.id } : undefined}
      />
    </div>
  );
}

function SortHead({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (column: SortKey) => void;
}) {
  const active = sortKey === column;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className="px-3 py-2.5 text-left"
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-brand"
      >
        {label}
        <span aria-hidden className={active ? "text-brand" : "text-muted"}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function LocationForm({
  location,
  mapApiKey,
  onCancel,
  onSaved,
}: {
  location: PickupLocation | null;
  mapApiKey: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, action] = useActionState(saveRentalLocation, initialFormState);
  const [name, setName] = useState(location?.name ?? "");
  const [address, setAddress] = useState(location?.address ?? "");
  const [active, setActive] = useState(location?.active ?? true);
  const [mapLat, setMapLat] = useState(location?.mapLat ?? "");
  const [mapLng, setMapLng] = useState(location?.mapLng ?? "");
  const [mapZoom, setMapZoom] = useState(location?.mapZoom || 14);
  const [image, setImage] = useState<UploadedImage | null>(toImage(location));
  const [imageBusy, setImageBusy] = useState(false);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (!state.success) return;
    onSavedRef.current();
  }, [state]);

  return (
    <form
      action={action}
      className="grid gap-4"
      onSubmit={(event) => {
        if (imageBusy || !image) event.preventDefault();
      }}
    >
      {location ? <input type="hidden" name="id" value={location.id} /> : null}
      <input type="hidden" name="imageUrl" value={image?.url ?? ""} />
      <input type="hidden" name="imageKey" value={image?.key ?? ""} />
      <input type="hidden" name="imageDriver" value={image?.driver ?? "local"} />
      {state.error ? <FormMessage state={state} /> : null}

      <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="grid gap-3">
          <Field label="Name" required>
            <input name="name" value={name} onChange={(event) => setName(event.target.value)} required className="!h-10" />
          </Field>
          <Field label="Address" required>
            <textarea
              name="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              className="min-h-20"
            />
          </Field>
        </div>
        <ImageUploader
          folder="locations"
          label="Image"
          required
          value={image}
          initialValue={toImage(location)}
          onChange={setImage}
          onBusyChange={setImageBusy}
          hint="JPG, PNG, WebP, or GIF up to 5 MB."
        />
      </div>

      <div className="grid gap-3">
        <p className="text-xs text-muted">Search the map for the pickup desk, or enter latitude and longitude.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Latitude">
            <input
              name="mapLat"
              value={mapLat}
              onChange={(event) => setMapLat(event.target.value)}
              inputMode="decimal"
              placeholder="e.g. 34.0837"
              className="!h-10"
            />
          </Field>
          <Field label="Longitude">
            <input
              name="mapLng"
              value={mapLng}
              onChange={(event) => setMapLng(event.target.value)}
              inputMode="decimal"
              placeholder="e.g. 74.7973"
              className="!h-10"
            />
          </Field>
          <Field label="Map zoom">
            <input
              name="mapZoom"
              type="number"
              min={1}
              max={20}
              value={mapZoom}
              onChange={(event) => setMapZoom(Number(event.target.value))}
              className="!h-10"
            />
          </Field>
        </div>
        {mapApiKey ? (
          <LocationMapPicker
            apiKey={mapApiKey}
            lat={mapLat}
            lng={mapLng}
            zoom={mapZoom}
            onChange={({ lat, lng, zoom }) => {
              setMapLat(lat);
              setMapLng(lng);
              setMapZoom(zoom);
            }}
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-line bg-surface px-4 text-center text-xs text-muted">
            Set MAP_API_KEY to search and preview this pin on Google Maps.
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" value="on" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active
      </label>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton pendingLabel="Saving" disabled={imageBusy || !image}>
          {location ? "Save location" : "Add location"}
        </SubmitButton>
      </div>
    </form>
  );
}
