import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HotelRequestForm, type HotelRequestDefaults } from "@/components/hotel-request/HotelRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import {
  allHotelBudgetBands,
  hotelAdditionalPreferences,
  hotelMeals,
  hotelRoomTypes,
  hotelStayPreferences,
  isBudgetValue,
  legacyHotelRoomTypes,
} from "@/lib/custom-request";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import "@/styles/hotel-request.css";

const pageTitle = "Request a hotel";
const pageDescription =
  "Can't find the hotel you want? Send the city, dates, and what you need. We search, including stays that are not listed, and contact you with options.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/hotels/request",
});

function dateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function countParam(value: string | undefined, fallback: string) {
  return value && /^\d{1,2}$/.test(value) ? value : fallback;
}

export default async function HotelRequestPage({
  searchParams,
}: {
  searchParams: Promise<{
    sent?: string;
    ref?: string;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    hotelName?: string;
    message?: string;
    stars?: string;
    budget?: string;
    area?: string;
    roomType?: string;
    meals?: string;
    childAges?: string;
    stayPreference?: string;
    preferences?: string;
    resume?: string;
  }>;
}) {
  if (!modules.hotels) notFound();
  const [params, user, destinationRows] = await Promise.all([
    searchParams,
    getCurrentUser(),
    prisma.destination.findMany({
      where: { published: true },
      select: { name: true, region: true, country: true },
      orderBy: [{ popular: "desc" }, { name: "asc" }],
    }),
  ]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const reference = params.ref && /^BK-[A-Z0-9]+$/.test(params.ref) ? params.ref : "";
  let preferenceValues: string[] = [];
  try {
    const parsed: unknown = JSON.parse(params.preferences ?? "[]");
    if (Array.isArray(parsed)) {
      const allowed = new Set<string>(hotelAdditionalPreferences.map((item) => item.value));
      preferenceValues = [...new Set(parsed.filter((item): item is string => typeof item === "string" && allowed.has(item)))];
    }
  } catch {
    preferenceValues = [];
  }
  const defaults: HotelRequestDefaults = {
    destination: (params.destination ?? "").slice(0, 120),
    checkIn: dateParam(params.checkIn),
    checkOut: dateParam(params.checkOut),
    adults: countParam(params.adults, "2"),
    children: countParam(params.children, "0"),
    rooms: countParam(params.rooms, "1"),
    hotelName: (params.hotelName ?? "").slice(0, 120),
    message: (params.message ?? "").slice(0, 500),
    stars: params.stars === "3" || params.stars === "4" || params.stars === "5" ? params.stars : "any",
    budget: isBudgetValue(allHotelBudgetBands, (params.budget ?? "").slice(0, 20)) ? (params.budget ?? "").slice(0, 20) : "",
    area: (params.area ?? "").slice(0, 120),
    roomType: [...hotelRoomTypes, ...legacyHotelRoomTypes].some((option) => option.value === params.roomType) ? params.roomType || "any" : "any",
    meals: hotelMeals.some((option) => option.value === params.meals) ? params.meals || "any" : "any",
    childAges: (params.childAges ?? "").slice(0, 80),
    stayPreference: hotelStayPreferences.some((option) => option.value === params.stayPreference) ? params.stayPreference || "any" : "any",
    preferences: JSON.stringify(preferenceValues),
  };
  const nextQuery = new URLSearchParams();
  for (const [key, value] of Object.entries({
    destination: defaults.destination,
    checkIn: defaults.checkIn,
    checkOut: defaults.checkOut,
    adults: params.adults ? defaults.adults : "",
    children: params.children ? defaults.children : "",
    rooms: params.rooms ? defaults.rooms : "",
    hotelName: defaults.hotelName,
    message: defaults.message,
    stars: defaults.stars === "any" ? "" : defaults.stars,
    budget: defaults.budget,
    area: defaults.area,
    roomType: defaults.roomType === "any" ? "" : defaults.roomType,
    meals: defaults.meals === "any" ? "" : defaults.meals,
    childAges: defaults.childAges,
    stayPreference: defaults.stayPreference === "any" ? "" : defaults.stayPreference,
    preferences: defaults.preferences === "[]" ? "" : defaults.preferences,
  })) {
    if (value) nextQuery.set(key, value);
  }
  const returnPath = nextQuery.size ? `/hotels/request?${nextQuery}` : "/hotels/request";
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  if (!customer) redirect(loginHref);
  const destinationSuggestions = [...new Set(destinationRows.flatMap((place) => {
    const values = [
      place.name,
      [place.name, place.country].filter(Boolean).join(", "),
      [place.name, place.region, place.country].filter(Boolean).join(", "),
      [place.region, place.country].filter(Boolean).join(", "),
      place.country,
    ];
    return values.map((value) => value.trim()).filter(Boolean);
  }))];
  return (
    <WorldCompassHolidayFrame className="is-hotel-request">
      <div className="hotel-brief">
        <div className="container hotel-brief-layout is-solo">
          <HotelRequestForm
            sent={params.sent === "1"}
            reference={reference}
            customer={customer}
            defaults={defaults}
            destinations={destinationSuggestions}
            loginHref={loginHref}
            autoSubmit={params.resume === "1" && Boolean(customer)}
          />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
