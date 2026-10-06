"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setDestinationPopular } from "@/actions/destinations";
import { Badge } from "@/components/ui/Card";
import { MapEmbed } from "@/components/site/MapEmbed";
import { modules } from "@/config/modules";
import { formatMoney } from "@/lib/format";
import { parseMapPoint } from "@/lib/maps";

type Place = {
  id: string;
  name: string;
  summary: string;
  published: boolean;
  imageUrl: string;
};

type TourItem = {
  id: string;
  title: string;
  summary: string;
  published: boolean;
  durationDays: number;
  durationLabel: string;
  priceFrom: number;
  currency: string;
  imageUrl: string;
};

type HotelItem = {
  id: string;
  name: string;
  summary: string;
  published: boolean;
  priceFrom: number;
  currency: string;
  roomCount: number;
};

type VehicleItem = {
  id: string;
  name: string;
  kind: string;
  summary: string;
  published: boolean;
  seats: number;
  pricePerDay: number;
  currency: string;
};

type BusItem = {
  id: string;
  name: string;
  fromCity: string;
  toCity: string;
  summary: string;
  published: boolean;
};

export type DestinationViewData = {
  id: string;
  name: string;
  slug: string;
  region: string;
  country: string;
  summary: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  imageUrl: string;
  published: boolean;
  popular: boolean;
  parent: { id: string; name: string } | null;
  children: Place[];
  tours: TourItem[];
  hotels: HotelItem[];
  vehicles: VehicleItem[];
  busRoutes: BusItem[];
};

const tabs = [
  { id: "places", label: "Places" },
  ...(modules.tours ? [{ id: "tours", label: "Tours" }] : []),
  ...(modules.hotels ? [{ id: "hotels", label: "Hotels" }] : []),
  ...(modules.cars || modules.bikes ? [{ id: "rentals", label: "Rentals" }] : []),
  ...(modules.buses ? [{ id: "buses", label: "Buses" }] : []),
] as const;

type TabId = (typeof tabs)[number]["id"];

export function DestinationView({
  destination,
  mapApiKey,
  canManage,
}: {
  destination: DestinationViewData;
  mapApiKey: string;
  canManage: boolean;
}) {
  const [tab, setTab] = useState<TabId>("places");
  const [popular, setPopular] = useState(destination.popular);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [popularPending, startPopular] = useTransition();
  const mapPoint = parseMapPoint(
    destination.mapLat,
    destination.mapLng,
    destination.mapZoom,
  );
  const counts: Record<string, number> = {
    places: destination.children.length,
    tours: destination.tours.length,
    hotels: destination.hotels.length,
    rentals: destination.vehicles.length,
    buses: destination.busRoutes.length,
  };

  return (
    <div className="grid gap-4">
      <Link
        href="/admin/destinations"
        className="text-xs font-medium text-brand hover:underline"
      >
        ← Destinations
      </Link>

      <section className="rounded-xl border border-line bg-white p-3 sm:p-4">
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={destination.imageUrl}
            alt=""
            className="h-24 w-36 shrink-0 rounded-lg object-cover sm:h-[6.5rem] sm:w-48"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-navy">
                {destination.name}
              </h1>
              {destination.published ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge tone="warning">Inactive</Badge>
              )}
              {canManage ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={popular}
                  disabled={popularPending}
                  onClick={() => {
                    const next = !popular;
                    setPopular(next);
                    setPopularError(null);
                    startPopular(async () => {
                      const result = await setDestinationPopular(destination.id, next);
                      if (result.error) {
                        setPopular(!next);
                        setPopularError(result.error);
                      }
                    });
                  }}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    popular
                      ? "border-brand/30 bg-brand-soft text-brand"
                      : "border-line bg-white text-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-3.5 w-6 rounded-full p-0.5",
                      popular ? "bg-brand" : "bg-slate-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "block h-2.5 w-2.5 rounded-full bg-white transition-transform",
                        popular ? "translate-x-2.5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </span>
                  Popular
                </button>
              ) : popular ? (
                <Badge tone="brand">Popular</Badge>
              ) : null}
            </div>
            {popularError ? (
              <p className="mt-2 text-xs text-red-700">{popularError}</p>
            ) : null}
            <p className="mt-1 line-clamp-1 text-sm text-muted">{destination.summary}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-6">
              <Fact
                label="Parent"
                value={destination.parent?.name ?? "Top-level"}
                href={
                  destination.parent
                    ? `/admin/destinations/${destination.parent.id}`
                    : undefined
                }
              />
              <Fact label="Region" value={destination.region} />
              <Fact label="Country" value={destination.country} />
              <Fact
                label="Coordinates"
                value={
                  mapPoint
                    ? `${destination.mapLat}, ${destination.mapLng}`
                    : "Not set"
                }
              />
              <Fact label="Places" value={String(destination.children.length)} />
              <Fact label="Listings" value={String(listingCount(destination))} />
            </dl>
          </div>
          {mapPoint && mapApiKey ? (
            <MapEmbed
              apiKey={mapApiKey}
              lat={destination.mapLat}
              lng={destination.mapLng}
              zoom={destination.mapZoom}
              title={`Map of ${destination.name}`}
              className="min-h-24 w-36 shrink-0 self-stretch overflow-hidden rounded-lg border border-line sm:min-h-[6.5rem] sm:w-48"
            />
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-lg border border-line bg-white">
          <div
            role="tablist"
            aria-label="Destination content"
            className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2"
          >
            {tabs.map((item) => {
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${
                    selected
                      ? "bg-navy text-white"
                      : "text-muted hover:bg-surface hover:text-navy"
                  }`}
                >
                  {item.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      selected ? "bg-white/20" : "bg-surface text-navy"
                    }`}
                  >
                    {counts[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="p-4">
            {tab === "places" ? (
              <RecordList
                empty="No places sit inside this destination."
                activeLabel="Active"
                inactiveLabel="Inactive"
                items={destination.children.map((place) => ({
                  id: place.id,
                  href: `/admin/destinations/${place.id}`,
                  imageUrl: place.imageUrl,
                  title: place.name,
                  detail: place.summary,
                  published: place.published,
                }))}
              />
            ) : null}
            {tab === "tours" ? (
              <RecordList
                empty="No tours are attached to this destination."
                items={destination.tours.map((tour) => ({
                  id: tour.id,
                  href: `/admin/tours/${tour.id}/view`,
                  imageUrl: tour.imageUrl,
                  title: tour.title,
                  detail: `${tour.durationLabel.trim() || `${tour.durationDays} days`} · ${formatMoney(tour.priceFrom, tour.currency)}`,
                  published: tour.published,
                }))}
              />
            ) : null}
            {tab === "hotels" ? (
              <RecordList
                empty="No hotels are attached to this destination."
                items={destination.hotels.map((hotel) => ({
                  id: hotel.id,
                  href: `/admin/hotels/${hotel.id}/view`,
                  title: hotel.name,
                  detail: `${hotel.roomCount} room${hotel.roomCount === 1 ? "" : "s"} · ${formatMoney(hotel.priceFrom, hotel.currency)}`,
                  published: hotel.published,
                }))}
              />
            ) : null}
            {tab === "rentals" ? (
              <RecordList
                empty="No rentals are attached to this destination."
                items={destination.vehicles.map((vehicle) => ({
                  id: vehicle.id,
                  title: vehicle.name,
                  detail: `${vehicle.kind} · ${vehicle.seats} seats · ${formatMoney(vehicle.pricePerDay, vehicle.currency)} / day`,
                  published: vehicle.published,
                }))}
              />
            ) : null}
            {tab === "buses" ? (
              <RecordList
                empty="No bus routes are attached to this destination."
                items={destination.busRoutes.map((route) => ({
                  id: route.id,
                  title: route.name,
                  detail: `${route.fromCity} to ${route.toCity}`,
                  published: route.published,
                }))}
              />
            ) : null}
          </div>
        </section>
    </div>
  );
}

function listingCount(destination: DestinationViewData) {
  return (
    destination.tours.length +
    destination.hotels.length +
    destination.vehicles.length +
    destination.busRoutes.length
  );
}

function Fact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-navy">
        {href ? (
          <Link href={href} className="text-brand hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function RecordList({
  items,
  empty,
  activeLabel = "Published",
  inactiveLabel = "Draft",
}: {
  empty: string;
  activeLabel?: string;
  inactiveLabel?: string;
  items: {
    id: string;
    title: string;
    detail: string;
    published: boolean;
    href?: string;
    imageUrl?: string;
  }[];
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const body = (
          <div className="flex min-w-0 items-center gap-3">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-10 w-14 shrink-0 rounded-md border border-line object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
              <p className="truncate text-xs text-muted">{item.detail}</p>
            </div>
          </div>
        );

        return (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            {item.href ? (
              <Link href={item.href} className="min-w-0 hover:underline">
                {body}
              </Link>
            ) : (
              body
            )}
            {item.published ? (
              <Badge tone="success">{activeLabel}</Badge>
            ) : (
              <Badge tone="warning">{inactiveLabel}</Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}
