import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusSearchBar } from "@/components/bus/BusSearchBar";
import { modules } from "@/config/modules";
import { busCoachTypes, busTimeWindows, coachLabel, inTimeWindow, parseStringList, requestBusHref } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import "@/styles/bus-desk.css";

export const metadata: Metadata = pageMetadata({
  title: "Find a bus",
  description: "Listed coaches between cities, with photos and an indicative fare. Send a request — nothing is booked until you accept a quote.",
  path: "/buses",
  index: modules.buses,
});

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function BusesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.buses) notFound();
  const params = await searchParams;
  const from = one(params.from).trim();
  const to = one(params.to).trim();
  const date = one(params.date).trim();
  const coach = one(params.coach).trim() || "any";
  const time = one(params.time).trim() || "any";
  const passengers = one(params.passengers).trim() || "1";

  const routes = await prisma.busRoute.findMany({
    where: { published: true },
    orderBy: [{ fromCity: "asc" }, { departTime: "asc" }],
  });

  const citiesFrom = Array.from(new Set(routes.map((route) => route.fromCity))).sort();
  const citiesTo = Array.from(new Set(routes.map((route) => route.toCity))).sort();

  const shown = routes.filter((route) => {
    if (from && !route.fromCity.toLowerCase().includes(from.toLowerCase())) return false;
    if (to && !route.toCity.toLowerCase().includes(to.toLowerCase())) return false;
    if (coach && coach !== "any" && route.coachType !== coach) return false;
    if (!inTimeWindow(route.departTime, time)) return false;
    return true;
  });

  const corridors = Object.values(
    shown.reduce<Record<string, typeof shown>>((groups, route) => {
      const key = `${route.fromCity} → ${route.toCity}`;
      (groups[key] ??= []).push(route);
      return groups;
    }, {}),
  );

  const requestHref = requestBusHref({ from, to, date, passengers, coach, time });
  const placeLine = from && to ? `${from} to ${to}` : from ? `Leaving ${from}` : to ? `Arriving ${to}` : "Listed coaches";

  function filterHref(next: { coach?: string; time?: string }) {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (date) query.set("date", date);
    const nextCoach = next.coach ?? coach;
    const nextTime = next.time ?? time;
    if (nextCoach && nextCoach !== "any") query.set("coach", nextCoach);
    if (nextTime && nextTime !== "any") query.set("time", nextTime);
    if (passengers !== "1") query.set("passengers", passengers);
    const search = query.toString();
    return search ? `/buses?${search}` : "/buses";
  }

  return (
    <div className="bus-desk">
        <header className="bus-desk__top">
          <div className="bus-desk__bar">
            <BusSearchBar
              from={from}
              to={to}
              date={date}
              coach={coach}
              passengers={passengers}
              time={time}
              citiesFrom={citiesFrom}
              citiesTo={citiesTo}
            />
            <Link prefetch={false} className="bus-desk__ask" href={requestHref}>
              Request a bus
            </Link>
          </div>
        </header>

        <main className="bus-desk__wrap">
          <div className="bus-desk__intro">
            <p className="bus-desk__kicker">Buses</p>
            <h1>{placeLine}</h1>
            <p className="bus-desk__promise">
              {shown.length} listed {shown.length === 1 ? "run" : "runs"}. Times and fares are indicative. Request a quote — nothing is held until you accept.
            </p>
          </div>
          <Link className="bus-desk__banner" href={requestHref}>
            <span>Need a coach that is not listed? Send the cities and date.</span>
            <strong>Request a bus</strong>
          </Link>

          <div className="bus-chips" aria-label="Filters">
            {busCoachTypes.map((option) => (
              <Link key={option.value} href={filterHref({ coach: option.value })} className={`bus-chip${coach === option.value ? " is-on" : ""}`}>
                {option.label}
              </Link>
            ))}
            {busTimeWindows.map((option) => (
              <Link key={option.value} href={filterHref({ time: option.value })} className={`bus-chip${time === option.value ? " is-on" : ""}`}>
                {option.label}
              </Link>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="bus-empty">
              <h2>No listed buses match this search</h2>
              <p>Try another city pair, or send a request with the date you need.</p>
              <div className="bus-empty__actions">
                <Link className="bus-btn" href={requestHref}>
                  Request a bus
                </Link>
                <Link className="bus-btn bus-btn--ghost" href="/buses">
                  Show all
                </Link>
              </div>
            </div>
          ) : (
            corridors.map((group) => (
              <section className="bus-corridor" key={`${group[0].fromCity}-${group[0].toCity}`}>
                <div className="bus-corridor__head">
                  <h2>
                    {group[0].fromCity} to {group[0].toCity}
                  </h2>
                  <p>
                    {group.length} {group.length === 1 ? "coach" : "coaches"}
                  </p>
                </div>
                {group.map((route) => {
                  const photos = [route.imageUrl, ...parseStringList(route.galleryJson)].filter(Boolean);
                  const amenities = parseStringList(route.amenitiesJson);
                  const href = `/buses/${route.slug}`;
                  const quoteHref = requestBusHref({
                    slug: route.slug,
                    from: route.fromCity,
                    to: route.toCity,
                    date,
                    passengers,
                    coach: route.coachType,
                    busName: route.name,
                  });
                  return (
                    <article className="bus-run-card" key={route.id}>
                      <Link prefetch={false} className="bus-run-card__shot" href={href} aria-label={`Photos of ${route.name}`}>
                        {photos[0] ? <img src={photos[0]} alt="" width={640} height={420} /> : null}
                        <span className="bus-run-card__stamp">{coachLabel(route.coachType)}</span>
                      </Link>
                      <div className="bus-run-card__main">
                        <p className="bus-run-card__op">{route.operator || "Listed coach"}</p>
                        <h3>
                          <Link prefetch={false} href={href}>
                            {route.name}
                          </Link>
                        </h3>
                        <div className="bus-line">
                          <div>
                            <strong>{route.departTime || "—"}</strong>
                            <span>{route.pickup || route.fromCity}</span>
                          </div>
                          <em>{route.duration || "On road"}</em>
                          <div>
                            <strong>{route.arriveTime || "—"}</strong>
                            <span>{route.dropoff || route.toCity}</span>
                          </div>
                        </div>
                        {amenities.length ? (
                          <div className="bus-run-card__meta">
                            {amenities.slice(0, 4).map((name) => (
                              <span className="bus-tag" key={name}>
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="bus-run-card__pay">
                        <div>
                          <b>{route.fareFrom ? formatMoney(route.fareFrom) : "On request"}</b>
                          <small>Indicative fare</small>
                        </div>
                        <Link prefetch={false} className="bus-btn" href={href}>
                          See this run
                        </Link>
                        <Link prefetch={false} className="bus-btn bus-btn--ghost" href={quoteHref}>
                          Request this bus
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            ))
          )}
        </main>
    </div>
  );
}
