"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteBus } from "@/actions/buses";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { coachLabel } from "@/lib/buses";

export type BusFleetRow = {
  id: string;
  name: string;
  operator: string;
  coachType: string;
  published: boolean;
  imageUrl: string;
  facilityCount: number;
  routeCount: number;
};

export function BusFleetWorkspace({
  buses,
  canManage,
  notice,
}: {
  buses: BusFleetRow[];
  canManage: boolean;
  notice: "saved" | "deleted" | "blocked" | null;
}) {
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<BusFleetRow | null>(null);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return buses;
    return buses.filter((bus) =>
      [bus.name, bus.operator, coachLabel(bus.coachType)].join(" ").toLowerCase().includes(needle),
    );
  }, [buses, query]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">Buses</h1>
          <p className="mt-0.5 text-xs text-muted">
            The coach, its photos, and its facilities. A route is added separately and then chooses one of these.
          </p>
        </div>
        {canManage ? (
          <ButtonLink href="/admin/buses/new" size="sm" className="w-full shrink-0 sm:w-auto">
            Add bus
          </ButtonLink>
        ) : null}
      </div>

      {notice === "saved" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Bus saved.
        </p>
      ) : null}
      {notice === "deleted" ? (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          Bus deleted.
        </p>
      ) : null}
      {notice === "blocked" ? (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          That bus still has routes. Remove the routes first, then delete the bus.
        </p>
      ) : null}

      <label className="relative block w-full max-w-xs">
        <span className="sr-only">Search buses</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search coach or operator"
          className="!h-10"
          autoComplete="off"
        />
      </label>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th scope="col" className="w-16 px-3 py-2.5">
                <span className="sr-only">Image</span>
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                Coach
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                Facilities
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                Routes
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                Status
              </th>
              <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-navy">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {buses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                  No buses yet.{canManage ? " Add the first coach." : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                  No buses match this search.
                </td>
              </tr>
            ) : (
              filtered.map((bus) => (
                <tr key={bus.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2">
                    {bus.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bus.imageUrl} alt="" className="h-10 w-14 rounded-md border border-line object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded-md border border-line bg-surface" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/buses/${bus.id}/view`} className="font-semibold text-navy hover:text-brand hover:underline">
                      {bus.name}
                    </Link>
                    <p className="line-clamp-1 max-w-xs text-xs text-muted">
                      {[bus.operator, coachLabel(bus.coachType)].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-navy">{bus.facilityCount}</td>
                  <td className="px-3 py-2 tabular-nums text-navy">{bus.routeCount}</td>
                  <td className="px-3 py-2">
                    {bus.published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/buses/${bus.id}/view`}
                        className="inline-flex h-7 items-center rounded-full border border-brand/30 bg-brand-soft px-2.5 text-xs font-medium text-brand"
                      >
                        View
                      </Link>
                      {canManage ? (
                        <Link
                          href={`/admin/buses/${bus.id}`}
                          className="inline-flex h-7 items-center rounded-full border border-line bg-white px-2.5 text-xs font-medium text-navy"
                        >
                          Edit
                        </Link>
                      ) : null}
                      {canManage ? (
                        <button
                          type="button"
                          onClick={() => setDeleting(bus)}
                          className="inline-flex h-7 items-center rounded-full border border-red-200 bg-white px-2.5 text-xs font-medium text-red-700"
                        >
                          Delete
                        </button>
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
        title="Delete this bus?"
        description={
          deleting
            ? deleting.routeCount
              ? `“${deleting.name}” still runs ${deleting.routeCount} route${deleting.routeCount === 1 ? "" : "s"}. Remove those routes first.`
              : `“${deleting.name}” and its photos will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete bus"
        action={deleting ? deleteBus : undefined}
        fields={deleting ? { busId: deleting.id } : undefined}
      />
    </div>
  );
}
