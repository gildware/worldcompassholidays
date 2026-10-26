import type { Metadata } from "next";
import { HomePageStudio, type HomePickItem } from "@/components/admin/home/HomePageStudio";
import { requirePermission } from "@/lib/auth/guards";
import { getSiteBrand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { getHomePageContent, withLiveHomeLists } from "@/lib/home-page";

export const metadata: Metadata = { title: "Homepage" };

function destItem(row: {
  id: string;
  name: string;
  region: string;
  country: string;
  imageUrl: string;
}): HomePickItem {
  return {
    id: row.id,
    title: row.name,
    subtitle: [row.region, row.country].filter(Boolean).join(", "),
    image: row.imageUrl,
  };
}

export default async function HomePageEditor() {
  await requirePermission("staff.manage");
  const [home, brand, destinations, popular, tours, featuredTours, hotels, featuredHotels, cars, liveCars, bikes, liveBikes, buses, liveBuses] =
    await Promise.all([
      getHomePageContent(),
      getSiteBrand(),
      prisma.destination.findMany({
        where: { published: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, region: true, country: true, imageUrl: true },
      }),
      prisma.destination.findMany({
        where: { published: true, popular: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, region: true, country: true, imageUrl: true },
      }),
      prisma.tour.findMany({
        where: { published: true },
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          featuredImageUrl: true,
          destination: { select: { name: true } },
        },
      }),
      prisma.tour.findMany({
        where: { published: true },
        orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
        take: 10,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          featuredImageUrl: true,
          destination: { select: { name: true } },
        },
      }),
      prisma.hotel.findMany({
        where: { published: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          featuredImageUrl: true,
          destination: { select: { name: true } },
        },
      }),
      prisma.hotel.findMany({
        where: { published: true },
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          imageUrl: true,
          featuredImageUrl: true,
          destination: { select: { name: true } },
        },
      }),
      prisma.vehicle.findMany({
        where: { published: true, kind: "car" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          destination: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      }),
      prisma.vehicle.findMany({
        where: { published: true, kind: "car" },
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          destination: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      }),
      prisma.vehicle.findMany({
        where: { published: true, kind: "bike" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          destination: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      }),
      prisma.vehicle.findMany({
        where: { published: true, kind: "bike" },
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          destination: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      }),
      prisma.busRoute.findMany({
        where: { published: true },
        orderBy: [{ fromCity: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          fromCity: true,
          toCity: true,
          operator: true,
          imageUrl: true,
        },
      }),
      prisma.busRoute.findMany({
        where: { published: true },
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          fromCity: true,
          toCity: true,
          operator: true,
          imageUrl: true,
        },
      }),
    ]);

  const toTour = (item: (typeof tours)[number]): HomePickItem => ({
    id: item.id,
    title: item.title,
    subtitle: item.destination?.name,
    image: item.featuredImageUrl || item.imageUrl,
  });
  const toHotel = (item: (typeof hotels)[number]): HomePickItem => ({
    id: item.id,
    title: item.name,
    subtitle: item.destination?.name,
    image: item.featuredImageUrl || item.imageUrl,
  });
  const toRide = (item: (typeof cars)[number]): HomePickItem => ({
    id: item.id,
    title: item.name,
    subtitle: item.destination?.name,
    image: item.images[0]?.url,
  });
  const toBus = (item: (typeof buses)[number]): HomePickItem => ({
    id: item.id,
    title: item.name,
    subtitle: [item.fromCity, item.toCity].filter(Boolean).join(" to ") || item.operator,
    image: item.imageUrl || undefined,
  });

  const live = {
    destinations: popular.map(destItem),
    tours: featuredTours.map(toTour),
    hotels: featuredHotels.map(toHotel),
    cars: liveCars.map(toRide),
    bikes: liveBikes.map(toRide),
    buses: liveBuses.map(toBus),
  };

  const initial = withLiveHomeLists(home, {
    destinations: live.destinations.map((item) => item.id),
    tours: live.tours.map((item) => item.id),
    hotels: live.hotels.map((item) => item.id),
    cars: live.cars.map((item) => item.id),
    bikes: live.bikes.map((item) => item.id),
    buses: live.buses.map((item) => item.id),
  });

  return (
    <HomePageStudio
      initial={initial}
      coverUrl={home.hero.image?.url || brand.covers[0]?.url || ""}
      live={live}
      destinations={destinations.map(destItem)}
      tours={tours.map(toTour)}
      hotels={hotels.map(toHotel)}
      cars={cars.map(toRide)}
      bikes={bikes.map(toRide)}
      buses={buses.map(toBus)}
    />
  );
}
