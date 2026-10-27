import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { BusStopsMap } from "@/components/bus/BusStopsMap";
import { loadBusFacilities, loadBusLocations, matchBusPlace } from "@/lib/bus-catalog";
import { mapApiKey } from "@/lib/map-key";
import {
  arrivalDayLabel,
  arriveFromDepart,
  arrivesNextDay,
  busAmenityLabels,
  coachLabel,
  parseBusDuration,
  parseGallery,
} from "@/lib/buses";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Bus route" };

export default async function ViewBusRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.buses) notFound();
  const user = await requirePermission("buses.view");
  const { id } = await params;
  const [route, facilities, places] = await Promise.all([
    prisma.busRoute.findUnique({
      where: { id },
      include: { bus: true, _count: { select: { schedules: true } } },
    }),
    loadBusFacilities(),
    loadBusLocations(),
  ]);
  if (!route) notFound();

  const coach = route.bus;
  const duration = parseBusDuration(route.duration);
  const computed = arriveFromDepart(route.departTime, duration.hours, duration.minutes);
  const days = computed.time
    ? computed.days
    : arrivesNextDay(route.departTime, route.arriveTime)
      ? 1
      : 0;
  const photos = [
    ...new Set(
      [coach?.imageUrl || route.imageUrl, ...parseGallery(coach?.galleryJson || route.galleryJson).map((item) => item.url)].filter(Boolean),
    ),
  ];
  const amenities = busAmenityLabels(coach?.amenitiesJson || route.amenitiesJson, facilities);
  const fromPlace = matchBusPlace(places, route.fromLocationId, route.fromCity);
  const toPlace = matchBusPlace(places, route.toLocationId, route.toCity);
  const name = coach?.name || route.name;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/buses/routes" className="text-xs font-medium text-brand hover:underline">
            ← All routes
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">{name}</h1>
          <p className="mt-1 text-sm text-muted">
            {route.fromCity} → {route.toCity}
            {coach?.operator ? ` · ${coach.operator}` : ""} · {coachLabel(coach?.coachType || route.coachType)}
          </p>
        </div>
        <div className="flex gap-2">
          {route.published ? (
            <ButtonLink href={`/buses/${route.slug}`} size="sm" variant="secondary">
              Public page
            </ButtonLink>
          ) : null}
          {coach ? (
            <ButtonLink href={`/admin/buses/${coach.id}/view`} size="sm" variant="secondary">
              Bus
            </ButtonLink>
          ) : null}
          {can(user, "buses.manage") ? (
            <ButtonLink href={`/admin/buses/routes/${route.id}`} size="sm">
              Edit
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-sm tabular-nums text-navy">
          {route.departTime || "—"}
          <span className="mx-2 text-muted">·</span>
          {route.duration || "Duration not set"}
          <span className="mx-2 text-muted">·</span>
          {route.arriveTime || "—"}
          {route.arriveTime && route.duration ? (
            <span className="text-muted"> {arrivalDayLabel(days)}</span>
          ) : null}
        </p>
        <p className="mt-1 text-xs text-muted">
          Boards at {route.pickup || route.fromCity}
          {" · "}
          Drops at {route.dropoff || route.toCity}
          {" · "}
          {route.fareFrom ? formatMoney(route.fareFrom) : "Fare on request"}
          {" · "}
          {route.published ? "Published" : "Draft"}
        </p>
      </div>

      {coach?.summary || coach?.about ? (
        <section className="rounded-xl border border-line bg-white p-4">
          {coach.summary ? <p className="text-sm font-medium text-navy">{coach.summary}</p> : null}
          {coach.about ? <p className="mt-2 whitespace-pre-line text-sm text-muted">{coach.about}</p> : null}
        </section>
      ) : null}

      <BusStopsMap
        apiKey={mapApiKey()}
        from={
          fromPlace
            ? {
                title: fromPlace.title,
                label: "Pickup",
                lat: fromPlace.mapLat,
                lng: fromPlace.mapLng,
                zoom: fromPlace.mapZoom,
              }
            : null
        }
        to={
          toPlace
            ? {
                title: toPlace.title,
                label: "Drop-off",
                lat: toPlace.mapLat,
                lng: toPlace.mapLng,
                zoom: toPlace.mapZoom,
              }
            : null
        }
      />

      {amenities.length ? (
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-navy">On this bus</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {amenities.map((item) => (
              <li key={item} className="rounded-full bg-surface px-2.5 py-1 text-xs text-navy">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="h-28 w-full rounded-lg border border-line object-cover" />
          ))}
        </div>
      ) : null}

      {route._count.schedules ? (
        <p className="text-xs text-muted">
          {route._count.schedules} dated schedule{route._count.schedules === 1 ? "" : "s"} sit on this route.
        </p>
      ) : null}
    </div>
  );
}
