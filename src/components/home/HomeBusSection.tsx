import Link from "next/link";
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

function routeLine(bus: HomeBus) {
  return [bus.fromCity, bus.toCity].filter(Boolean).join(" to ");
}

function timeLine(bus: HomeBus) {
  return [bus.departTime, bus.duration].filter(Boolean).join(" · ");
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
          <div className="row y-gap-30 pt-20">
            {items.map((bus, index) => (
              <div className="col-lg-3 col-sm-6" key={bus.id}>
                <Link prefetch={false} href={`/buses/${bus.slug}`} className="d-block">
                  <div className="ratio ratio-16:9 rounded-4 overflow-hidden">
                    {/* Plain img: listed coaches can use hosts outside the Next image allowlist. */}
                    <img
                      src={bus.image || busHomeImage}
                      alt={bus.name}
                      width={400}
                      height={225}
                      className="img-ratio object-cover"
                      loading={index < 4 ? "eager" : "lazy"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <p className="text-14 fw-500 text-blue-1 mt-15">
                    {[bus.coach, bus.operator].filter(Boolean).join(" · ") || "Bus"}
                  </p>
                  <h3 className="text-18 fw-500 text-dark-1 mt-5">{bus.name}</h3>
                  {routeLine(bus) ? (
                    <p className="text-15 text-light-1 mt-5">{routeLine(bus)}</p>
                  ) : null}
                  {timeLine(bus) ? (
                    <p className="text-15 text-light-1 mt-5">{timeLine(bus)}</p>
                  ) : null}
                  <p className="text-15 fw-500 mt-5">
                    {bus.fareFrom > 0 ? `${formatMoney(bus.fareFrom)} fare` : "Fare on request"}
                  </p>
                </Link>
              </div>
            ))}
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
