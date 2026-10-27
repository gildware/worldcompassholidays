import Link from "next/link";
import { HomeDealList, type HomeDealCard } from "@/components/home/HomeInteractive";
import { HomeRidePromoCard, type HomeRidePromo } from "@/components/home/HomeFleetSection";
import { formatMoney } from "@/lib/format";

export type HomeBus = {
  id: string;
  slug: string;
  name: string;
  fromCity: string;
  toCity: string;
  operator: string;
  coach: string;
  departTime: string;
  duration: string;
  fareFrom: number;
  image: string;
};

export const busHomeFallback: HomeRidePromo = {
  href: "/buses",
  title: "Buses between cities",
  text: "Listed coaches with times and an indicative fare. Request a quote before anything is booked.",
  points: ["City to city coaches", "Times and indicative fares", "Quote before you pay"],
  image: "/img/buses/bus-request-illustration.jpg",
  cta: "Browse buses",
};

export const busHomeImage = "/img/buses/bus-request-illustration.jpg";

export function busDeal(bus: HomeBus): HomeDealCard {
  const route = [bus.fromCity, bus.toCity].filter(Boolean).join(" to ");
  const when = [bus.departTime, bus.duration].filter(Boolean).join(" · ");
  return {
    id: bus.id,
    title: bus.name,
    meta: route,
    detail: [bus.operator, when].filter(Boolean).join(" · "),
    price: bus.fareFrom > 0 ? formatMoney(bus.fareFrom) : "On request",
    unit: bus.fareFrom > 0 ? "fare" : "",
    ribbon: bus.coach || "Coach",
    image: bus.image || busHomeImage,
    href: `/buses/${bus.slug}`,
  };
}

export function HomeBusSection({
  title,
  subtitle,
  href,
  linkLabel,
  items,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  items: HomeBus[];
}) {
  return (
    <section className="layout-pt-md layout-pb-md">
      <div className="container">
        <div className="row y-gap-10 justify-between items-end">
          <div className="col-auto">
            <div className="sectionTitle -md">
              <h2 className="sectionTitle__title">{title}</h2>
              <p className="sectionTitle__text mt-5 sm:mt-0">{subtitle}</p>
            </div>
          </div>
          <div className="col-auto">
            <Link prefetch={false} href={href} className="button -md -blue-1 bg-blue-1-05 text-blue-1">
              {linkLabel}
              <div className="icon-arrow-top-right ml-15" />
            </Link>
          </div>
        </div>
        {items.length > 0 ? (
          <div className="pt-20">
            <HomeDealList items={items.map(busDeal)} />
          </div>
        ) : (
          <div className="pt-40">
            <HomeRidePromoCard promo={busHomeFallback} />
          </div>
        )}
      </div>
    </section>
  );
}
