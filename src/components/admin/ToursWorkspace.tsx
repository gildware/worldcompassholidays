"use client";

import { useCallback, useMemo, useState } from "react";
import { deleteTour } from "@/actions/tours";
import { Badge } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type TourRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  destinationName: string;
  imageUrl: string;
  published: boolean;
  meta: string;
};

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
  const [deleting, setDeleting] = useState<TourRow | null>(null);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return tours;
    return tours.filter((tour) => {
      const haystack = [
        tour.title,
        tour.summary,
        tour.destinationName,
        tour.slug,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [tours, debouncedQuery]);

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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search tours</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, destination, or difficulty"
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
        <p className="text-xs text-muted">
          {filtered.length} of {tours.length}
          {debouncedQuery.trim() ? " match" : ""}
        </p>
      </div>

      <ul className="overflow-hidden rounded-lg border border-line bg-white">
        {tours.length === 0 ? (
          <li className="px-3.5 py-6 text-center text-sm text-muted">
            No tours yet.
            {canManage && destinations.length > 0
              ? " Add the first trek or tour."
              : ""}
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-3.5 py-6 text-center text-sm text-muted">
            No tours match “{debouncedQuery.trim()}”.
          </li>
        ) : (
          filtered.map((tour) => (
            <li
              key={tour.id}
              className="flex flex-col gap-3 border-b border-line px-3.5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tour.imageUrl}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-md border border-line object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-navy">{tour.title}</p>
                    {tour.published ? null : <Badge tone="warning">Draft</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{tour.meta}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {tour.summary}
                  </p>
                </div>
              </div>

              {canManage ? (
                <div className="flex shrink-0 gap-2">
                  <ButtonLink
                    href={`/admin/tours/${tour.id}`}
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    Edit
                  </ButtonLink>
                  <Button
                    type="button"
                    variant="dangerOutline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setDeleting(tour)}
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>

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
