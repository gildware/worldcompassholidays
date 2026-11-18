import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusCatalog } from "@/components/bus/BusCatalog";
import { BusRequestScreen } from "@/components/bus/BusRequestScreen";
import { readBusQuery } from "@/components/bus/query";
import { getUserLocale } from "@/i18n/get-locale";
import { loadCopyMap, translated, withCatalogCopy } from "@/lib/i18n/content";
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

  const locale = await getUserLocale();
  const [routeCopies, busCopies, facilityCopies] = await Promise.all([
    loadCopyMap("busRoute", routes.map((route) => route.id), locale),
    loadCopyMap(
      "bus",
      routes.flatMap((route) => (route.bus ? [route.bus.id] : [])),
      locale,
    ),
    loadCopyMap(
      "catalog",
      facilities.map((item) => item.id),
      locale,
    ),
  ]);
  const spokenFacilities = withCatalogCopy(
    facilities.map((item) => ({ ...item, content: "" })),
    facilityCopies,
  );

  return (
    <BusCatalog
      initial={initial}
      routes={routes.map((route) => {
        const coach = route.bus;
        const routeCopy = routeCopies.get(route.id);
        const busCopy = coach ? busCopies.get(coach.id) : undefined;
        return {
          id: route.id,
          slug: route.slug,
          name: translated(coach?.name || route.name, busCopy?.name ?? routeCopy?.name),
          fromCity: translated(route.fromCity, routeCopy?.fromCity),
          toCity: translated(route.toCity, routeCopy?.toCity),
          operator: translated(coach?.operator || route.operator, busCopy?.operator ?? routeCopy?.operator),
          coachType: coach?.coachType || route.coachType,
          pickup: translated(route.pickup, routeCopy?.pickup),
          dropoff: translated(route.dropoff, routeCopy?.dropoff),
          departTime: route.departTime,
          arriveTime: route.arriveTime,
          duration: route.duration,
          fareFrom: route.fareFrom,
          imageUrl: coach?.imageUrl || route.imageUrl,
          amenities: busAmenityLabels(coach?.amenitiesJson || route.amenitiesJson, spokenFacilities),
        };
      })}
    />
  );
}
