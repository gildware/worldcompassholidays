"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { fleetLabel, vehicleStatusLabel } from "@/lib/rentals/labels";

export type AvailabilitySpan = {
  id: string;
  kind: "booking" | "hold" | "maintenance";
  label: string;
  detail: string;
  start: string;
  end: string;
};

export type AvailabilityVehicle = {
  id: string;
  name: string;
  registrationNumber: string;
  kind: string;
  typeId: string;
  typeName: string;
  imageUrl: string;
  status: string;
  spans: AvailabilitySpan[];
};

const dayLimit = 62;

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthEnd(iso: string) {
  const start = parseDay(iso);
  return isoDate(new Date(start.getFullYear(), start.getMonth() + 1, 0));
}

function eachDay(from: string, to: string) {
  const start = parseDay(from);
  const end = parseDay(to);
  const days: Date[] = [];
  for (let cursor = start; cursor <= end && days.length < dayLimit; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

function standingLabel(status: string) {
  if (status === "inactive" || status === "maintenance" || status === "on_hold") {
    return vehicleStatusLabel(status);
  }
  return "";
}

function overlaps(span: AvailabilitySpan, start: Date, end: Date) {
  return new Date(span.start) < end && new Date(span.end) > start;
}

function spanTone(kind: AvailabilitySpan["kind"]) {
  if (kind === "maintenance") return "bg-amber-200 text-amber-950";
  if (kind === "hold") return "bg-rose-200 text-rose-950";
  return "bg-sky-200 text-sky-950";
}

function formatRange(start: string, end: string) {
  const from = new Date(start);
  const to = new Date(end);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${from.toLocaleDateString(undefined, options)} – ${to.toLocaleDateString(undefined, options)}`;
}

export function AvailabilityWorkspace({
  vehicles,
  types,
}: {
  vehicles: AvailabilityVehicle[];
  types: { id: string; name: string }[];
}) {
  const today = useMemo(() => isoDate(new Date()), []);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(monthEnd(today));
  const [typeId, setTypeId] = useState("all");

  const rangeInvalid = !from || !to || to < from;
  const days = useMemo(() => (rangeInvalid ? [] : eachDay(from, to)), [from, rangeInvalid, to]);
  const clipped = !rangeInvalid && days.length === dayLimit && isoDate(days[days.length - 1]) < to;

  const window = useMemo(() => {
    if (rangeInvalid || days.length === 0) return null;
    return { start: days[0], end: addDays(days[days.length - 1], 1) };
  }, [days, rangeInvalid]);

  const rows = useMemo(() => {
    return vehicles
      .filter((vehicle) => typeId === "all" || vehicle.typeId === typeId)
      .map((vehicle) => {
        const standing = standingLabel(vehicle.status);
        const hits = window ? vehicle.spans.filter((span) => overlaps(span, window.start, window.end)) : [];
        return { vehicle, standing, hits, taken: Boolean(standing) || hits.length > 0 };
      });
  }, [typeId, vehicles, window]);

  const takenCount = rows.filter((row) => row.taken).length;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 overflow-x-auto">
        <h1 className="shrink-0 text-xl font-semibold tracking-tight text-navy">Availability</h1>
        <div className="inline-flex shrink-0 rounded-full border border-line bg-white p-0.5">
          {(["calendar", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                view === option ? "bg-brand font-medium text-white" : "text-navy/80 hover:text-navy"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <p className="text-xs text-muted">
            {rangeInvalid ? "Pick a valid date range" : `${takenCount} taken · ${rows.length - takenCount} available`}
          </p>
          <label className="flex items-center gap-2 text-xs text-muted">
            From
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="!h-10" />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted">
            To
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="!h-10" />
          </label>
          <SearchableSelect
            ariaLabel="Filter by vehicle type"
            value={typeId}
            onChange={setTypeId}
            searchPlaceholder="Search vehicle types"
            options={[
              { value: "all", label: "All vehicle types" },
              ...types.map((type) => ({ value: type.id, label: type.name })),
            ]}
            className="!h-10"
            wrapperClassName="w-52"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-sky-200" /> Booking
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-200" /> Maintenance
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-rose-200" /> Hold
        </span>
      </div>

      {rangeInvalid ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          The end date has to be on or after the start date.
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-line bg-white px-3 py-8 text-center text-sm text-muted">
          No vehicles match this type.
        </p>
      ) : view === "list" ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th scope="col" className="w-16 px-3 py-2.5">
                  <span className="sr-only">Image</span>
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Vehicle
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Type
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ vehicle, standing, hits, taken }) => (
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
                    <p className="text-xs text-muted">{fleetLabel(vehicle.kind)}</p>
                  </td>
                  <td className="px-3 py-2 text-navy">{vehicle.typeName || "—"}</td>
                  <td className="px-3 py-2">
                    <Badge tone={taken ? "brand" : "success"}>{taken ? "Taken" : "Available"}</Badge>
                  </td>
                  <td className="px-3 py-2 text-navy">
                    {standing ? <p>{standing} for every date</p> : null}
                    {hits.length === 0 && !standing ? <p className="text-muted">Free for these dates</p> : null}
                    {hits.map((span) => (
                      <p key={span.id}>
                        {span.label}
                        <span className="text-muted">
                          {" "}
                          · {span.detail} · {formatRange(span.start, span.end)}
                        </span>
                      </p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          {clipped ? (
            <p className="border-b border-line px-3 py-2 text-xs text-muted">
              Showing the first {dayLimit} days of this range.
            </p>
          ) : null}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th scope="col" className="sticky left-0 z-10 min-w-44 bg-surface px-3 py-2 text-left font-semibold text-navy">
                  Vehicle
                </th>
                {days.map((day) => {
                  const key = isoDate(day);
                  const isToday = key === today;
                  return (
                    <th
                      key={key}
                      scope="col"
                      className={`min-w-9 px-1 py-2 text-center font-medium ${isToday ? "text-brand" : "text-muted"}`}
                    >
                      <span className="block uppercase">{day.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                      <span className="tabular-nums text-navy">{day.getDate()}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ vehicle, standing }) => (
                <tr key={vehicle.id} className="border-b border-line last:border-b-0">
                  <th scope="row" className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium">
                    <Link href={`/admin/rentals/fleet/${vehicle.id}`} className="text-navy hover:text-brand hover:underline">
                      {vehicle.name}
                    </Link>
                    <p className="font-medium tracking-wide text-navy">{vehicle.registrationNumber}</p>
                    <p className="font-normal text-muted">{vehicle.typeName || fleetLabel(vehicle.kind)}</p>
                  </th>
                  {days.map((day) => {
                    const start = day;
                    const end = addDays(day, 1);
                    const hit = standing ? null : vehicle.spans.find((span) => overlaps(span, start, end));
                    const title = standing
                      ? `${vehicle.name} is ${standing.toLowerCase()}`
                      : hit
                        ? `${vehicle.name}: ${hit.label} (${hit.detail})`
                        : `${vehicle.name} is available`;
                    return (
                      <td key={isoDate(day)} title={title} className="p-0.5">
                        <span
                          className={`block h-8 rounded-sm ${
                            standing
                              ? "bg-stone-200"
                              : hit
                                ? spanTone(hit.kind)
                                : "bg-emerald-50 ring-1 ring-inset ring-emerald-100"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
