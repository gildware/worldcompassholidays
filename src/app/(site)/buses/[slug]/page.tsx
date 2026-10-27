import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusBookLink, BusBookPanel } from "@/components/bus/BusBookPanel";
import { BusGallery } from "@/components/bus/BusGallery";
import { BusStopsMap } from "@/components/bus/BusStopsMap";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { loadBusFacilities, loadBusLocations, matchBusPlace } from "@/lib/bus-catalog";
import { mapApiKey } from "@/lib/map-key";
import { arrivesNextDay, busAmenityLabels, coachLabel, parseGallery } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import "@/styles/bus-desk.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await prisma.busRoute.findUnique({
    where: { slug },
    select: {
      name: true,
      fromCity: true,
      toCity: true,
      summary: true,
      published: true,
      bus: { select: { name: true, summary: true } },
    },
  });
  if (!route || !route.published || !modules.buses) {
    return pageMetadata({
      title: "Bus",
      description: "This listed coach is not available.",
      path: `/buses/${slug}`,
      index: false,
    });
  }
  return pageMetadata({
    title: route.bus?.name || route.name,
    description: route.bus?.summary || route.summary || `${route.fromCity} to ${route.toCity}. Request a quote for this listed bus.`,
    path: `/buses/${slug}`,
  });
}

export default async function BusDetailsPage({ params }: Props) {
  if (!modules.buses) notFound();
  const { slug } = await params;
  const [route, user, facilities, places] = await Promise.all([
    prisma.busRoute.findUnique({ where: { slug }, include: { bus: true } }),
    getCurrentUser(),
    loadBusFacilities(),
    loadBusLocations(),
  ]);
  if (!route || !route.published) notFound();
  const signedIn = user?.scope === "customer";
  const loginHref = `/login?next=${encodeURIComponent(`/buses/${route.slug}`)}`;

  const coach = route.bus;
  const name = coach?.name || route.name;
  const operator = coach?.operator || route.operator;
  const coachType = coach?.coachType || route.coachType;
  const summary = coach?.summary || route.summary;
  const about = coach?.about || route.about;
  const imageUrl = coach?.imageUrl || route.imageUrl;
  const gallery = parseGallery(coach?.galleryJson || route.galleryJson).map((item) => item.url);
  const images = [imageUrl, ...gallery.filter((src) => src !== imageUrl)].filter(Boolean);
  const amenities = busAmenityLabels(coach?.amenitiesJson || route.amenitiesJson, facilities);
  const nextDay = arrivesNextDay(route.departTime, route.arriveTime);
  const fromPlace = matchBusPlace(places, route.fromLocationId, route.fromCity);
  const toPlace = matchBusPlace(places, route.toLocationId, route.toCity);

  const others = await     prisma.busRoute.findMany({
    where: { published: true, slug: { not: route.slug }, fromCity: route.fromCity, toCity: route.toCity },
    orderBy: { departTime: "asc" },
    take: 4,
    include: { bus: true },
  });

  return (
    <div className="bus-run">
        <div className="bus-run__wrap">
          <p className="bus-crumb">
            <Link href="/buses">Buses</Link>
            <span aria-hidden="true">/</span>
            {route.fromCity} to {route.toCity}
          </p>
          <header className="bus-run__hero">
            <div>
              <p className="bus-desk__kicker">{operator || "Listed coach"}</p>
              <h1>{name}</h1>
              <p className="bus-run__place">
                {coachLabel(coachType)} · {route.fromCity} to {route.toCity}
              </p>
            </div>
            <div className="bus-run__hero-side">
              <b>{route.fareFrom ? formatMoney(route.fareFrom) : "On request"}</b>
              <small>Indicative fare</small>
              <BusBookLink className="bus-btn" signedIn={signedIn} loginHref={loginHref} />
            </div>
          </header>

          <div className="bus-track">
            <div>
              <strong>{route.departTime || "—"}</strong>
              <span>{route.pickup || route.fromCity}</span>
            </div>
            <em>{route.duration || "Travel time"}</em>
            <div>
              <strong>
                {route.arriveTime || "—"}
                {nextDay ? " · next day" : ""}
              </strong>
              <span>{route.dropoff || route.toCity}</span>
            </div>
          </div>

          <BusGallery images={images} name={name} />

          <div className="bus-run__grid">
            <div>
              <section className="bus-run__block">
                <h2>On this run</h2>
                <p className="bus-run__lede">{about || summary || `${route.fromCity} to ${route.toCity}.`}</p>
              </section>
              <section className="bus-run__block">
                <h2>Boarding</h2>
                <div className="bus-stations">
                  <div className="bus-station">
                    <b>Pickup</b>
                    <p>{route.pickup || route.fromCity}</p>
                  </div>
                  <div className="bus-station">
                    <b>Drop-off</b>
                    <p>{route.dropoff || route.toCity}</p>
                  </div>
                </div>
              </section>
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
                <section className="bus-run__block">
                  <h2>On board</h2>
                  <ul className="bus-ticks">
                    {amenities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
            <BusBookPanel
              name={name}
              fromCity={route.fromCity}
              toCity={route.toCity}
              coach={coachType}
              slug={route.slug}
              fare={route.fareFrom ? formatMoney(route.fareFrom) : "On request"}
              signedIn={signedIn}
              loginHref={loginHref}
            />
          </div>

          {others.length ? (
            <section className="bus-more">
              <h2>Other coaches on this corridor</h2>
              <div className="bus-more__list">
                {others.map((item) => (
                  <Link href={`/buses/${item.slug}`} key={item.id}>
                    {(item.bus?.imageUrl || item.imageUrl) ? <img src={item.bus?.imageUrl || item.imageUrl} alt="" /> : <span />}
                    <div>
                      <h3>{item.bus?.name || item.name}</h3>
                      <p>
                        {item.departTime} · {coachLabel(item.bus?.coachType || item.coachType)}
                      </p>
                      <p>{item.fareFrom ? formatMoney(item.fareFrom) : "On request"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
    </div>
  );
}
