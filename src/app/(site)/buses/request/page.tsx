import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BusRequestForm, type BusRequestDefaults } from "@/components/bus/BusRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { modules } from "@/config/modules";
import { countryIsoFromHeaders } from "@/lib/auth/countries";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureBusCatalog, loadBusLocations } from "@/lib/bus-catalog";
import { busCoachTypes, busTimeWindows, requestBusHref } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { firebaseWebConfig } from "@/lib/firebase/config";
import { pageMetadata } from "@/lib/seo";
import "@/styles/hotel-request.css";

const pageTitle = "Request Intercity Bus Hire";
const pageDescription =
  "Send the cities, travel date, and coach type you want. We quote listed buses and options that are not on the list — nothing is booked until you accept.";

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

function luggageQuantityParam(value: string | undefined) {
  if (!value || !/^\d{1,2}$/.test(value) || Number(value) > 50) return "0";
  return value;
}

function weightParam(value: string | undefined) {
  if (!value || !/^\d{1,3}(?:\.\d{1,2})?$/.test(value) || Number(value) > 500) return "0";
  return value;
}

export default async function BusRequestPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
    adults?: string;
    children?: string;
    coach?: string;
    time?: string;
    luggageQuantity?: string;
    luggageWeight?: string;
    busName?: string;
    slug?: string;
    message?: string;
  }>;
}) {
  if (!modules.buses) notFound();
  await ensureBusCatalog();
  const [params, user, locations] = await Promise.all([
    searchParams,
    getCurrentUser(),
    loadBusLocations(),
  ]);
  const cities = locations.map((location) => location.title);
  const citySet = new Set(cities);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const slug = (params.slug ?? "").slice(0, 80);
  const namedBus = await (slug
    ? prisma.busRoute.findFirst({
        where: { slug, published: true },
        select: { name: true, fromCity: true, toCity: true, coachType: true },
      })
    : Promise.resolve(null));

  const requestedFrom = (params.from ?? namedBus?.fromCity ?? "").slice(0, 80);
  const requestedTo = (params.to ?? namedBus?.toCity ?? "").slice(0, 80);
  const defaults: BusRequestDefaults = {
    fromCity: citySet.has(requestedFrom) ? requestedFrom : "",
    toCity: citySet.has(requestedTo) ? requestedTo : "",
    travelDate: dateParam(params.date),
    adults: countParam(params.adults ?? params.passengers, "1"),
    children: countParam(params.children, "0"),
    coach: busCoachTypes.some((option) => option.value === params.coach)
      ? params.coach || "any"
      : namedBus?.coachType || "any",
    timeWindow: busTimeWindows.some((option) => option.value === params.time) ? params.time || "any" : "any",
    luggageQuantity: luggageQuantityParam(params.luggageQuantity),
    luggageWeight: weightParam(params.luggageWeight),
    busName: (params.busName ?? namedBus?.name ?? "").slice(0, 120),
    slug,
    message: (params.message ?? "").slice(0, 500),
  };

  const returnPath = requestBusHref({
    slug: defaults.slug,
    from: defaults.fromCity,
    to: defaults.toCity,
    date: defaults.travelDate,
    passengers: Number(defaults.adults) + Number(defaults.children),
    adults: defaults.adults,
    children: defaults.children,
    coach: defaults.coach,
    time: defaults.timeWindow,
    luggageQuantity: defaults.luggageQuantity,
    luggageWeight: defaults.luggageWeight,
    busName: defaults.busName,
    message: defaults.message,
  });
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  return (
    <WorldCompassHolidayFrame className="is-hotel-request">
      <div className="hotel-brief">
        <div className="container hotel-brief-layout is-solo">
          <BusRequestForm
            customer={customer}
            defaults={defaults}
            cities={cities}
            loginHref={loginHref}
            firebaseConfig={firebaseWebConfig()}
            defaultCountry={countryIsoFromHeaders(await headers())}
          />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
