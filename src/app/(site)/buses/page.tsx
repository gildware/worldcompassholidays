import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusCatalog } from "@/components/bus/BusCatalog";
import { readBusQuery } from "@/components/bus/query";
import { modules } from "@/config/modules";
import { loadBusFacilities } from "@/lib/bus-catalog";
import { busAmenityLabels } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find a bus",
  description: "Listed coaches between cities, with photos and an indicative fare. Send a request — nothing is booked until you accept a quote.",
  path: "/buses",
  index: modules.buses,
});

export default async function BusesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.buses) notFound();
  const params = await searchParams;
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
      initial={readBusQuery(params)}
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
