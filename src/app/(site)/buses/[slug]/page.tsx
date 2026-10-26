import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusBookLink, BusBookPanel } from "@/components/bus/BusBookPanel";
import { BusGallery } from "@/components/bus/BusGallery";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { coachLabel, parseStringList } from "@/lib/buses";
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
    select: { name: true, fromCity: true, toCity: true, summary: true, published: true },
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
    title: route.name,
    description: route.summary || `${route.fromCity} to ${route.toCity}. Request a quote for this listed bus.`,
    path: `/buses/${slug}`,
  });
}

export default async function BusDetailsPage({ params }: Props) {
  if (!modules.buses) notFound();
  const { slug } = await params;
  const [route, user] = await Promise.all([prisma.busRoute.findUnique({ where: { slug } }), getCurrentUser()]);
  if (!route || !route.published) notFound();
  const signedIn = user?.scope === "customer";
  const loginHref = `/login?next=${encodeURIComponent(`/buses/${route.slug}`)}`;

  const gallery = parseStringList(route.galleryJson);
  const images = [route.imageUrl, ...gallery.filter((src) => src !== route.imageUrl)].filter(Boolean);
  const amenities = parseStringList(route.amenitiesJson);

  const others = await prisma.busRoute.findMany({
    where: { published: true, slug: { not: route.slug }, fromCity: route.fromCity, toCity: route.toCity },
    orderBy: { departTime: "asc" },
    take: 4,
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
              <p className="bus-desk__kicker">{route.operator || "Listed coach"}</p>
              <h1>{route.name}</h1>
              <p className="bus-run__place">
                {coachLabel(route.coachType)} · {route.fromCity} to {route.toCity}
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
              <strong>{route.arriveTime || "—"}</strong>
              <span>{route.dropoff || route.toCity}</span>
            </div>
          </div>

          <BusGallery images={images} name={route.name} />

          <div className="bus-run__grid">
            <div>
              <section className="bus-run__block">
                <h2>On this run</h2>
                <p className="bus-run__lede">{route.about || route.summary || `${route.fromCity} to ${route.toCity}.`}</p>
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
              name={route.name}
              fromCity={route.fromCity}
              toCity={route.toCity}
              coach={route.coachType}
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
                    {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span />}
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.departTime} · {coachLabel(item.coachType)}
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
