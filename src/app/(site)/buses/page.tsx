import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusCatalog } from "@/components/bus/BusCatalog";
import { BusRequestScreen } from "@/components/bus/BusRequestScreen";
import { readBusQuery } from "@/components/bus/query";
import { modules } from "@/config/modules";
import { loadBusFacilities } from "@/lib/bus-catalog";
import { busAmenityLabels } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { logListingSearch } from "@/lib/search/log";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Intercity Bus Hire Across India",
  description:
    "Browse listed coaches between Indian cities with photos and an indicative fare. Request a quote — nothing is booked until you accept it.",
  path: "/buses",
  index: modules.buses,
  keywords: ["bus hire India", "intercity coach", "group bus rental"],
});

export default async function BusesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.buses) notFound();
  const params = await searchParams;
  const initial = readBusQuery(params);
  logListingSearch("buses", params, {
    queryOverride:
      [initial.q, initial.from && initial.to ? `${initial.from} → ${initial.to}` : initial.from || initial.to]
        .filter(Boolean)
        .join(" · ") || undefined,
  });

  const publishedCount = await prisma.busRoute.count({ where: { published: true } });
  // No listed runs yet — show the quote form here so we don't bounce through a second white screen.
  if (publishedCount === 0) {
    return <BusRequestScreen searchParams={{ ...params, passengers: params.passengers ?? "1" }} />;
  }

  const [routes, facilities] = await Promise.all([
    prisma.busRoute.findMany({
      where: { published: true },
      orderBy: [{ fromCity: "asc" }, { departTime: "asc" }],
      include: { bus: true },
    }),
    loadBusFacilities(),
  ]);

  return (
    <BusCatalog
      initial={initial}
      routes={routes.map((route) => {
        const coach = route.bus;
        return {
          id: route.id,
          slug: route.slug,
          name: coach?.name || route.name,
          fromCity: route.fromCity,
          toCity: route.toCity,
          operator: coach?.operator || route.operator,
          coachType: coach?.coachType || route.coachType,
          pickup: route.pickup,
          dropoff: route.dropoff,
          departTime: route.departTime,
          arriveTime: route.arriveTime,
          duration: route.duration,
          fareFrom: route.fareFrom,
          imageUrl: coach?.imageUrl || route.imageUrl,
          amenities: busAmenityLabels(coach?.amenitiesJson || route.amenitiesJson, facilities),
        };
      })}
    />
  );
}
