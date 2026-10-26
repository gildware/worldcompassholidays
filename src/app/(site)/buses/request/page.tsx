import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusRequestForm, type BusRequestDefaults } from "@/components/bus/BusRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { busCoachTypes, busTimeWindows, requestBusHref } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import "@/styles/hotel-request.css";

const pageTitle = "Request a bus";
const pageDescription =
  "Send the cities, date, and coach you want. We quote listed buses and options that are not on the list. Nothing is booked until you accept.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/buses/request",
});

function dateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function countParam(value: string | undefined, fallback: string) {
  return value && /^\d{1,2}$/.test(value) ? value : fallback;
}

export default async function BusRequestPage({
  searchParams,
}: {
  searchParams: Promise<{
    sent?: string;
    ref?: string;
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
    coach?: string;
    time?: string;
    busName?: string;
    slug?: string;
    message?: string;
  }>;
}) {
  if (!modules.buses) notFound();
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const reference = params.ref && /^BK-[A-Z0-9]+$/.test(params.ref) ? params.ref : "";
  const slug = (params.slug ?? "").slice(0, 80);
  const namedBus = await (slug
    ? prisma.busRoute.findFirst({
        where: { slug, published: true },
        select: { name: true, fromCity: true, toCity: true, coachType: true },
      })
    : Promise.resolve(null));
  const artSrc = "/img/buses/bus-request-illustration.jpg";
  const artAlt = namedBus
    ? `${namedBus.name} from ${namedBus.fromCity} to ${namedBus.toCity}`
    : "A coach on a mountain road";

  const defaults: BusRequestDefaults = {
    fromCity: (params.from ?? namedBus?.fromCity ?? "").slice(0, 80),
    toCity: (params.to ?? namedBus?.toCity ?? "").slice(0, 80),
    travelDate: dateParam(params.date),
    passengers: countParam(params.passengers, "1"),
    coach: busCoachTypes.some((option) => option.value === params.coach)
      ? params.coach || "any"
      : namedBus?.coachType || "any",
    timeWindow: busTimeWindows.some((option) => option.value === params.time) ? params.time || "any" : "any",
    busName: (params.busName ?? namedBus?.name ?? "").slice(0, 120),
    slug,
    message: (params.message ?? "").slice(0, 500),
  };

  const returnPath = requestBusHref({
    slug: defaults.slug,
    from: defaults.fromCity,
    to: defaults.toCity,
    date: defaults.travelDate,
    passengers: defaults.passengers,
    coach: defaults.coach,
    time: defaults.timeWindow,
    busName: defaults.busName,
  });
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  return (
    <WorldCompassHolidayFrame>
      <div className="hotel-brief is-bus-request">
        <header className="hotel-brief-top">
          <div className="container">
            <p className="hotel-brief-crumb">
              <a href="/buses">Buses</a>
              <span aria-hidden="true">/</span>
              Request
            </p>
          </div>
        </header>
        <div className="container hotel-brief-layout is-art">
          <figure className="hotel-brief-art">
            <img src={artSrc} alt={artAlt} />
            <figcaption>
              <strong>{namedBus ? namedBus.name : "Request a listed coach"}</strong>
              <span>
                {namedBus
                  ? `${namedBus.fromCity} to ${namedBus.toCity}. Send the date and passenger count.`
                  : "Send the cities and date. We quote before anything is booked."}
              </span>
            </figcaption>
          </figure>
          <aside className="hotel-brief-side">
            <BusRequestForm
              sent={params.sent === "1"}
              reference={reference}
              customer={customer}
              defaults={defaults}
              loginHref={loginHref}
            />
          </aside>
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
