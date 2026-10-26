import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelRequestDesk, type HotelRequestPlace } from "@/components/hotel-request/HotelRequestDesk";
import type { HotelRequestDefaults } from "@/components/hotel-request/HotelRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { hotelBudgetBands, hotelMeals, hotelRoomTypes, isBudgetValue } from "@/lib/custom-request";
import { hotelRequestFaqs } from "@/lib/hotels/request-content";
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
  }>;
}) {
  if (!modules.hotels) notFound();
  const [params, user, destinations, settings] = await Promise.all([
    searchParams,
    getCurrentUser(),
    prisma.destination.findMany({
      where: { published: true },
      select: { name: true, region: true, country: true, summary: true, imageUrl: true },
      orderBy: [{ popular: "desc" }, { name: "asc" }],
    }),
    getSiteSettings(),
  ]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const reference = params.ref && /^BK-[A-Z0-9]+$/.test(params.ref) ? params.ref : "";
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
    budget: isBudgetValue(hotelBudgetBands, (params.budget ?? "").slice(0, 12)) ? (params.budget ?? "").slice(0, 12) : "",
    area: (params.area ?? "").slice(0, 120),
    roomType: hotelRoomTypes.some((option) => option.value === params.roomType) ? params.roomType || "any" : "any",
    meals: hotelMeals.some((option) => option.value === params.meals) ? params.meals || "any" : "any",
    childAges: (params.childAges ?? "").slice(0, 80),
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
  })) {
    if (value) nextQuery.set(key, value);
  }
  const returnPath = nextQuery.size ? `/hotels/request?${nextQuery}` : "/hotels/request";
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const places: HotelRequestPlace[] = destinations.map((place) => ({
    name: place.name,
    region: place.region,
    country: place.country,
    summary: place.summary,
    imageUrl: place.imageUrl,
  }));
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hotelRequestFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <WorldCompassHolidayFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HotelRequestDesk
        sent={params.sent === "1"}
        reference={reference}
        customer={customer}
        defaults={defaults}
        places={places}
        loginHref={loginHref}
        contact={{ phone: settings.phone, email: settings.email, whatsapp: settings.whatsapp }}
      />
    </WorldCompassHolidayFrame>
  );
}
