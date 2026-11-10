import Link from "next/link";
import { HomeBusScene } from "@/components/home/HomeBusScene";
import { formatMoney } from "@/lib/format";
import "@/components/home/home-bus.css";

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

export const busHomeImage = "/img/buses/bus-request-illustration.jpg";
export const busRequestStubImage = "/img/buses/bus-request-stub.jpg";

export function HomeBusRequestCard() {
  return (
    <Link
      prefetch={false}
      href="/buses/request"
      className="hb-request"
      aria-label="Hire a private coach — request a custom quote"
    >
      <div className="hb-request__body">
        <p className="hb-request__eyebrow">Private coach hire</p>
        <h3 className="hb-request__title">Hire a bus</h3>
        <p className="hb-request__text">
          Share the route, dates, and group size. You get a clear quote before anyone is booked.
        </p>
        <ul className="hb-request__points">
          <li>Any Indian route</li>
          <li>Seater or sleeper</li>
          <li>Quote first, pay later</li>
        </ul>
        <div className="hb-request__foot">
          <span className="hb-request__cta">
            Request a bus
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="hb-request__note">Usually within ~2 hrs</p>
        </div>
      </div>
      <HomeBusScene />
    </Link>
  );
}

function HomeBusRunCard({ bus }: { bus: HomeBus }) {
  const from = bus.fromCity || "From";
  const to = bus.toCity || "To";
  const fare = bus.fareFrom > 0 ? formatMoney(bus.fareFrom) : "On request";

  return (
    <Link prefetch={false} href={`/buses/${bus.slug}`} className="hb-run">
      <div className="hb-run__shot">
        <img src={bus.image || busHomeImage} alt="" />
        {bus.coach ? <span className="hb-run__coach">{bus.coach}</span> : null}
      </div>
      <div className="hb-run__body">
        <p className="hb-run__name">{bus.name}</p>
        <div className="hb-run__line">
          <div className="hb-run__city">
            <b>{from}</b>
            <span>{bus.departTime ? `Departs ${bus.departTime}` : "Time on request"}</span>
          </div>
          <div className="hb-run__mid">
            <i aria-hidden />
            <span>{bus.duration || "On road"}</span>
          </div>
          <div className="hb-run__city">
            <b>{to}</b>
            <span>Drop-off</span>
          </div>
        </div>
        {bus.operator ? <p className="hb-run__op">{bus.operator}</p> : null}
      </div>
      <div className="hb-run__pay">
        <div className="hb-run__price">
          <strong>{fare}</strong>
          <small>{bus.fareFrom > 0 ? "Indicative" : "Quote first"}</small>
        </div>
        <span className="hb-run__cta">See run</span>
      </div>
    </Link>
  );
}

export function HomeBusRunList({ items }: { items: HomeBus[] }) {
  if (!items.length) return null;
  return (
    <div className="hb-runs">
      {items.map((bus) => (
        <HomeBusRunCard key={bus.id} bus={bus} />
      ))}
    </div>
  );
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
  const hasBuses = items.length > 0;

  return (
    <section className="layout-pt-md layout-pb-md">
      <div className="container">
        {hasBuses ? (
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
        ) : null}
        {hasBuses ? (
          <div className="pt-20">
            <HomeBusRunList items={items} />
          </div>
        ) : (
          <HomeBusRequestCard />
        )}
      </div>
    </section>
  );
}
