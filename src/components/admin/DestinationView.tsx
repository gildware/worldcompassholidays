"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { setDestinationPopular } from "@/actions/destinations";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { MapEmbed } from "@/components/site/MapEmbed";
import { modules } from "@/config/modules";
import { formatMoney } from "@/lib/format";
import { parseMapPoint } from "@/lib/maps";
import { clipText } from "@/lib/seo";

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
  ...(modules.cars ? [{ id: "cars", label: "Car rental" }] : []),
  ...(modules.bikes ? [{ id: "bikes", label: "Bike rental" }] : []),
  ...(modules.buses ? [{ id: "buses", label: "Buses" }] : []),
] as const;

type TabId = (typeof tabs)[number]["id"];

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
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
      <dd className="mt-0.5 text-sm font-semibold leading-5 text-navy [overflow-wrap:anywhere]">
        {href ? (
          <Link href={href} className="text-brand hover:underline">
            {value}
          </Link>
        ) : (
          value || "—"
        )}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white p-3 sm:p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-navy">{value}</p>
    </div>
  );
}

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
  const placeLine = [destination.region, destination.country].filter(Boolean).join(", ");
  const summaryText = clipText(destination.summary, 220);
  const summaryHtml = destination.summary.trim();
  const summaryIsHtml = looksLikeHtml(summaryHtml);
  const cars = destination.vehicles.filter((vehicle) => vehicle.kind === "car");
  const bikes = destination.vehicles.filter((vehicle) => vehicle.kind === "bike");
  const counts: Record<string, number> = {
    places: destination.children.length,
    tours: destination.tours.length,
    hotels: destination.hotels.length,
    cars: cars.length,
    bikes: bikes.length,
    buses: destination.busRoutes.length,
  };
  const totalListings = listingCount(destination);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/destinations"
          className="text-xs font-medium text-brand hover:underline"
        >
          ← Destinations
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={destination.published ? "success" : "warning"}>
            {destination.published ? "Published" : "Draft"}
          </Badge>
          {popular ? <Badge tone="brand">Popular</Badge> : null}
          {destination.published && destination.slug ? (
            <ButtonLink
              href={`/destinations/${destination.slug}`}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on website
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-line bg-white p-3 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            {destination.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.imageUrl}
                alt=""
                className="aspect-[4/3] max-h-48 w-full object-cover sm:max-h-none"
              />
            ) : (
              <div className="flex aspect-[4/3] max-h-48 items-center justify-center text-sm text-muted sm:max-h-none">
                No photo
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-brand uppercase">
                  {[destination.parent?.name, placeLine].filter(Boolean).join(" · ") || "Destination"}
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                  {destination.name}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  /destinations/{destination.slug}
                </p>
              </div>

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
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
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
              ) : null}
            </div>

            {popularError ? (
              <p className="mt-2 text-xs text-red-700">{popularError}</p>
            ) : null}

            {summaryText ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy">{summaryText}</p>
            ) : null}

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-6">
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
              <Fact label="Listings" value={String(totalListings)} />
            </dl>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Places" value={counts.places} />
        {modules.tours ? <StatCard label="Tours" value={counts.tours} /> : null}
        {modules.hotels ? <StatCard label="Hotels" value={counts.hotels} /> : null}
        {modules.cars ? <StatCard label="Cars" value={counts.cars} /> : null}
        {modules.bikes ? <StatCard label="Bikes" value={counts.bikes} /> : null}
        {modules.buses ? <StatCard label="Buses" value={counts.buses} /> : null}
      </div>

      {summaryHtml ? (
        <Section title="About this destination">
          {summaryIsHtml ? (
            <div
              className="prose prose-sm max-w-none text-sm leading-6 text-navy prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-navy prose-p:my-2 prose-ul:my-2"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-6 text-navy">{summaryHtml}</p>
          )}
        </Section>
      ) : null}

      {mapPoint && mapApiKey ? (
        <Section title="Map location">
          <MapEmbed
            apiKey={mapApiKey}
            lat={destination.mapLat}
            lng={destination.mapLng}
            zoom={destination.mapZoom}
            title={`Map of ${destination.name}`}
            className="min-h-56 w-full overflow-hidden rounded-lg border border-line sm:min-h-72"
          />
        </Section>
      ) : null}

      <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-white">
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

        <div role="tabpanel" className="p-3 sm:p-4">
          {tab === "places" ? (
            <RecordGrid
              empty="No places sit inside this destination."
              activeLabel="Active"
              inactiveLabel="Inactive"
              items={destination.children.map((place) => ({
                id: place.id,
                href: `/admin/destinations/${place.id}`,
                imageUrl: place.imageUrl,
                title: place.name,
                detail: clipText(place.summary, 90) || "Child destination",
                published: place.published,
              }))}
            />
          ) : null}
          {tab === "tours" ? (
            <RecordGrid
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
            <RecordGrid
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
          {tab === "cars" ? (
            <RecordGrid
              empty="No cars are attached to this destination."
              items={cars.map((vehicle) => ({
                id: vehicle.id,
                href: `/admin/rentals/fleet/${vehicle.id}/view`,
                title: vehicle.name,
                detail: `${vehicle.seats} seats · ${formatMoney(vehicle.pricePerDay, vehicle.currency)} / day`,
                published: vehicle.published,
              }))}
            />
          ) : null}
          {tab === "bikes" ? (
            <RecordGrid
              empty="No bikes are attached to this destination."
              items={bikes.map((vehicle) => ({
                id: vehicle.id,
                href: `/admin/rentals/fleet/${vehicle.id}/view`,
                title: vehicle.name,
                detail: `${vehicle.seats} seats · ${formatMoney(vehicle.pricePerDay, vehicle.currency)} / day`,
                published: vehicle.published,
              }))}
            />
          ) : null}
          {tab === "buses" ? (
            <RecordGrid
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

function RecordGrid({
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
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface/60 px-4 py-10 text-center">
        <p className="text-sm text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const card = (
          <>
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-xs text-muted">
                  No photo
                </div>
              )}
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                {item.published ? (
                  <Badge tone="success">{activeLabel}</Badge>
                ) : (
                  <Badge tone="warning">{inactiveLabel}</Badge>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.detail}</p>
            </div>
          </>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                href={item.href}
                className="block rounded-xl border border-line bg-white p-2.5 transition hover:border-brand/40 hover:shadow-sm"
              >
                {card}
              </Link>
            ) : (
              <div className="rounded-xl border border-line bg-white p-2.5">{card}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
