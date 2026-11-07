import { headers } from "next/headers";
import { BusRequestForm, type BusRequestDefaults } from "@/components/bus/BusRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { countryIsoFromHeaders } from "@/lib/auth/countries";
import { getCurrentUser } from "@/lib/auth/session";
import { loadBusLocations } from "@/lib/bus-catalog";
import { busCoachTypes, busTimeWindows, requestBusHref } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { firebaseWebConfig } from "@/lib/firebase/config";

export type BusRequestSearchParams = {
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
};

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

function pickParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

/** Public bus quote form — kept light so first paint is not blocked by catalog migrations. */
export async function BusRequestScreen({
  searchParams,
}: {
  searchParams: BusRequestSearchParams | Record<string, string | string[] | undefined>;
}) {
  const params: BusRequestSearchParams = {
    from: pickParam(searchParams.from),
    to: pickParam(searchParams.to),
    date: pickParam(searchParams.date),
    passengers: pickParam(searchParams.passengers),
    adults: pickParam(searchParams.adults),
    children: pickParam(searchParams.children),
    coach: pickParam(searchParams.coach),
    time: pickParam(searchParams.time),
    luggageQuantity: pickParam(searchParams.luggageQuantity),
    luggageWeight: pickParam(searchParams.luggageWeight),
    busName: pickParam(searchParams.busName),
    slug: pickParam(searchParams.slug),
    message: pickParam(searchParams.message),
  };

  const slug = (params.slug ?? "").slice(0, 80);
  const [user, locations, namedBus, requestHeaders] = await Promise.all([
    getCurrentUser(),
    loadBusLocations(),
    slug
      ? prisma.busRoute.findFirst({
          where: { slug, published: true },
          select: { name: true, fromCity: true, toCity: true, coachType: true },
        })
      : Promise.resolve(null),
    headers(),
  ]);

  const cities = locations.map((location) => location.title);
  const citySet = new Set(cities);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
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
            defaultCountry={countryIsoFromHeaders(requestHeaders)}
          />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
