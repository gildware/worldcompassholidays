import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusCatalog } from "@/components/bus/BusCatalog";
import { readBusQuery } from "@/components/bus/query";
import { modules } from "@/config/modules";
import { parseStringList } from "@/lib/buses";
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
  const routes = await prisma.busRoute.findMany({
    where: { published: true },
    orderBy: [{ fromCity: "asc" }, { departTime: "asc" }],
  });

  return (
    <BusCatalog
      initial={readBusQuery(params)}
      routes={routes.map((route) => ({
        id: route.id,
        slug: route.slug,
        name: route.name,
        fromCity: route.fromCity,
        toCity: route.toCity,
        operator: route.operator,
        coachType: route.coachType,
        pickup: route.pickup,
        dropoff: route.dropoff,
        departTime: route.departTime,
        arriveTime: route.arriveTime,
        duration: route.duration,
        fareFrom: route.fareFrom,
        imageUrl: route.imageUrl,
        amenities: parseStringList(route.amenitiesJson),
      }))}
    />
  );
}
