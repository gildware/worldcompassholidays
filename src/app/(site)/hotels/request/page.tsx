import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelRequestDesk, type HotelRequestPlace } from "@/components/hotel-request/HotelRequestDesk";
import type { HotelRequestDefaults } from "@/components/hotel-request/HotelRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
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
  }>;
}) {
  if (!modules.hotels) notFound();
  const [params, user, destinations] = await Promise.all([
    searchParams,
    getCurrentUser(),
    prisma.destination.findMany({
      where: { published: true },
      select: { name: true, region: true, country: true, summary: true, imageUrl: true },
      orderBy: [{ popular: "desc" }, { name: "asc" }],
    }),
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
  };
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
      />
    </WorldCompassHolidayFrame>
  );
}
