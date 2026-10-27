"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveBusRoute } from "@/actions/buses";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  arrivalDayLabel,
  arriveFromDepart,
  coachLabel,
  durationFromClocks,
  formatBusDuration,
  parseBusDuration,
  parseClock,
} from "@/lib/buses";
import { initialFormState } from "@/lib/forms";

export type BusLocationOption = {
  id: string;
  title: string;
  content: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
};

export type RouteBusOption = {
  id: string;
  name: string;
  operator: string;
  coachType: string;
  published: boolean;
  imageUrl: string;
};

export type BusRouteDraft = {
  id: string;
  busId: string;
  fromLocationId: string;
  toLocationId: string;
  pickup: string;
  dropoff: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  fareFrom: number;
  published: boolean;
};

function initialTiming(route: BusRouteDraft | null) {
  const parsed = parseBusDuration(route?.duration ?? "");
  const depart = route?.departTime ?? "";
  if (parsed.hours || parsed.minutes) {
    const arrival = arriveFromDepart(depart, parsed.hours, parsed.minutes);
    return {
      hours: parsed.hours,
      minutes: parsed.minutes,
      arrive: arrival.time || route?.arriveTime || "",
      dayOffset: Math.min(arrival.days, 2),
    };
  }
  const start = parseClock(depart);
  const end = parseClock(route?.arriveTime ?? "");
  const dayOffset = start !== null && end !== null && end <= start ? 1 : 0;
  const span = durationFromClocks(depart, route?.arriveTime ?? "", dayOffset);
  return {
    hours: span?.hours ?? 0,
    minutes: span?.minutes ?? 0,
    arrive: route?.arriveTime ?? "",
    dayOffset,
  };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

export function BusRouteForm({
  route,
  locations,
  buses,
}: {
  route: BusRouteDraft | null;
  locations: BusLocationOption[];
  buses: RouteBusOption[];
}) {
  const [state, action, pending] = useActionState(saveBusRoute, initialFormState);
  const timing = initialTiming(route);
  const [busId, setBusId] = useState(route?.busId ?? "");
  const [fromId, setFromId] = useState(route?.fromLocationId ?? "");
  const [toId, setToId] = useState(route?.toLocationId ?? "");
  const [pickup, setPickup] = useState(route?.pickup ?? "");
  const [dropoff, setDropoff] = useState(route?.dropoff ?? "");
  const [depart, setDepart] = useState(route?.departTime ?? "");
  const [hours, setHours] = useState(timing.hours);
  const [minutes, setMinutes] = useState(timing.minutes);
  const [arrive, setArrive] = useState(timing.arrive);
  const [dayOffset, setDayOffset] = useState(timing.dayOffset);

  const bus = buses.find((item) => item.id === busId);
  const from = locations.find((item) => item.id === fromId);
  const to = locations.find((item) => item.id === toId);
  const samePlace = Boolean(fromId && toId && fromId === toId);
  const pinsReady = Boolean(from?.mapLat && from.mapLng && to?.mapLat && to.mapLng);
  const durationLabel = formatBusDuration(hours, minutes);
  const dayLabel = durationLabel && arrive ? arrivalDayLabel(dayOffset) : "";
  const locationOptions = locations.map((item) => ({
    value: item.id,
    label: item.content ? `${item.title} · ${item.content}` : item.title,
  }));
  const busOptions = buses.map((item) => ({
    value: item.id,
    label: [item.name, item.operator, coachLabel(item.coachType)].filter(Boolean).join(" · "),
  }));

  function applyDuration(nextHours: number, nextMinutes: number, departTime = depart) {
    const safeHours = clamp(nextHours, 0, 47);
    const safeMinutes = clamp(nextMinutes, 0, 59);
    setHours(safeHours);
    setMinutes(safeMinutes);
    const arrival = arriveFromDepart(departTime, safeHours, safeMinutes);
    if (!arrival.time) {
      setArrive("");
      setDayOffset(0);
      return;
    }
    setArrive(arrival.time);
    setDayOffset(Math.min(arrival.days, 2));
  }

  function applyArrival(nextArrive: string, offset = dayOffset, departTime = depart) {
    setArrive(nextArrive);
    let nextOffset = offset;
    const start = parseClock(departTime);
    const end = parseClock(nextArrive);
    if (start !== null && end !== null && end <= start && nextOffset === 0) nextOffset = 1;
    setDayOffset(nextOffset);
    const span = durationFromClocks(departTime, nextArrive, nextOffset);
    if (!span) return;
    setHours(span.hours);
    setMinutes(span.minutes);
  }

  function chooseFrom(id: string) {
    const next = locations.find((item) => item.id === id);
    const previous = locations.find((item) => item.id === fromId);
    setFromId(id);
    setPickup((current) => {
      if (!next) return current;
      if (!current.trim() || current === previous?.content) return next.content;
      return current;
    });
  }

  function chooseTo(id: string) {
    const next = locations.find((item) => item.id === id);
    const previous = locations.find((item) => item.id === toId);
    setToId(id);
    setDropoff((current) => {
      if (!next) return current;
      if (!current.trim() || current === previous?.content) return next.content;
      return current;
    });
  }

  return (
    <form action={action} className="grid min-h-0 flex-1 gap-4 overflow-y-auto pb-4">
      <input type="hidden" name="id" value={route?.id ?? ""} />

      <div className="rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-sm font-semibold text-navy">
          {bus?.name || "Bus"} <span className="text-muted">·</span> {from?.title || "From"}{" "}
          <span className="text-muted">→</span> {to?.title || "To"}
        </p>
        <p className="mt-1 text-sm tabular-nums text-navy">
          {depart || "—"}
          <span className="mx-2 text-muted">·</span>
          {durationLabel || "Set a duration"}
          <span className="mx-2 text-muted">·</span>
          {arrive || "—"}
          {dayLabel ? <span className="text-muted"> {dayLabel}</span> : null}
        </p>
        <p className="mt-1 text-xs text-muted">
          {pickup ? `Boards at ${pickup}` : "Boarding point follows the start city"}
          {dropoff ? ` · Drops at ${dropoff}` : ""}
        </p>
      </div>

      {state.error ? <FormMessage state={state} /> : null}
      {buses.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Add a bus under{" "}
          <Link href="/admin/buses" className="font-medium underline">
            Buses
          </Link>{" "}
          before saving a route. Photos and facilities belong to the bus.
        </p>
      ) : null}
      {locations.length < 2 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Add at least two locations under{" "}
          <Link href="/admin/buses/locations" className="font-medium underline">
            Locations
          </Link>{" "}
          before saving a route.
        </p>
      ) : null}

      <section className="grid gap-4 rounded-xl border border-line bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-navy">Route</h2>
          <p className="mt-0.5 text-xs text-muted">
            Pick a bus that already exists, then the two locations and the run time. Photos and facilities stay on the bus.
          </p>
        </div>
        <Field label="Bus" required>
          <SearchableSelect
            name="busId"
            ariaLabel="Bus"
            value={busId}
            onChange={setBusId}
            options={busOptions}
            placeholder="Choose a bus"
            searchPlaceholder="Search buses"
            disabled={buses.length === 0}
            className="!h-10"
          />
        </Field>
        {bus ? (
          <p className="text-xs text-muted">
            {coachLabel(bus.coachType)}
            {bus.operator ? ` · ${bus.operator}` : ""} · {bus.published ? "Published bus" : "Draft bus — publish it before this route can go live"}
            {" · "}
            <Link href={`/admin/buses/${bus.id}`} className="font-medium text-brand hover:underline">
              Edit this bus
            </Link>
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From" required>
            <SearchableSelect
              name="fromLocationId"
              ariaLabel="From"
              value={fromId}
              onChange={chooseFrom}
              options={locationOptions}
              placeholder="Choose a city"
              searchPlaceholder="Search cities"
              disabled={locations.length === 0}
              className="!h-10"
            />
          </Field>
          <Field label="To" required>
            <SearchableSelect
              name="toLocationId"
              ariaLabel="To"
              value={toId}
              onChange={chooseTo}
              options={locationOptions}
              placeholder="Choose a city"
              searchPlaceholder="Search cities"
              disabled={locations.length === 0}
              invalid={samePlace}
              className="!h-10"
            />
          </Field>
        </div>
        {samePlace ? <p className="text-xs text-red-700">Choose two different places.</p> : null}
        <div className="grid gap-1 sm:grid-cols-2">
          <PinLine place={from} />
          <PinLine place={to} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Boarding point">
            <input
              name="pickup"
              value={pickup}
              onChange={(event) => setPickup(event.target.value)}
              placeholder="Pantha Chowk"
              maxLength={160}
              className="!h-10"
            />
          </Field>
          <Field label="Drop point">
            <input
              name="dropoff"
              value={dropoff}
              onChange={(event) => setDropoff(event.target.value)}
              placeholder="Bus stand"
              maxLength={160}
              className="!h-10"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Departs" required>
            <input
              type="time"
              name="departTime"
              value={depart}
              onChange={(event) => {
                const value = event.target.value;
                setDepart(value);
                applyDuration(hours, minutes, value);
              }}
              className="!h-10"
            />
          </Field>
          <Field label="Hours">
            <input
              type="number"
              name="durationHours"
              min={0}
              max={47}
              value={hours}
              onChange={(event) => applyDuration(Number(event.target.value), minutes)}
              className="!h-10"
            />
          </Field>
          <Field label="Minutes">
            <input
              type="number"
              name="durationMinutes"
              min={0}
              max={59}
              value={minutes}
              onChange={(event) => applyDuration(hours, Number(event.target.value))}
              className="!h-10"
            />
          </Field>
          <Field label="Arrives">
            <input
              type="time"
              name="arriveTime"
              value={arrive}
              onChange={(event) => applyArrival(event.target.value)}
              className="!h-10"
            />
          </Field>
        </div>
        <Field label="Arrival day">
          <select
            value={dayOffset}
            onChange={(event) => applyArrival(arrive, Number(event.target.value))}
            className="!h-10"
          >
            <option value={0}>Same day</option>
            <option value={1}>Next day</option>
            <option value={2}>Two days later</option>
          </select>
        </Field>
        <Field label="Fare from">
          <input type="number" name="fareFrom" min={0} defaultValue={route?.fareFrom ?? 0} className="!h-10" />
        </Field>
        <p className="-mt-2 text-xs text-muted">
          0 means the fare is on request. Duration and arrival stay in step.
        </p>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="secondary"
          disabled={pending || buses.length === 0 || locations.length < 2 || samePlace}
        >
          {pending ? "Saving…" : "Save draft"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending || !bus?.published || locations.length < 2 || samePlace || !pinsReady}
        >
          {pending ? "Saving…" : route?.published ? "Update" : "Publish"}
        </Button>
      </div>
    </form>
  );
}

function PinLine({ place }: { place?: BusLocationOption }) {
  if (!place) return <p className="text-xs text-muted">Choose a location to see its map pin.</p>;
  if (place.mapLat && place.mapLng) {
    return (
      <p className="text-xs text-muted">
        {place.title} pin {place.mapLat}, {place.mapLng}
      </p>
    );
  }
  return (
    <p className="text-xs text-amber-800">
      {place.title} has no map pin.{" "}
      <Link href="/admin/buses/locations" className="font-medium underline">
        Add coordinates
      </Link>
    </p>
  );
}
