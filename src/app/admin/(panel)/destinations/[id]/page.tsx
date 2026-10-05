import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationView } from "@/components/admin/DestinationView";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "View destination" };

export default async function AdminDestinationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("destinations.view");
  const { id } = await params;

  const destination = await prisma.destination.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      children: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          summary: true,
          published: true,
          imageUrl: true,
        },
      },
      tours: {
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          summary: true,
          published: true,
          durationDays: true,
          priceFrom: true,
          currency: true,
          imageUrl: true,
        },
      },
      hotels: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          summary: true,
          published: true,
          priceFrom: true,
          currency: true,
          _count: { select: { rooms: true } },
        },
      },
      vehicles: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          kind: true,
          summary: true,
          published: true,
          seats: true,
          pricePerDay: true,
          currency: true,
        },
      },
      busRoutes: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          fromCity: true,
          toCity: true,
          summary: true,
          published: true,
        },
      },
    },
  });

  if (!destination) notFound();

  return (
    <DestinationView
      destination={{
        id: destination.id,
        name: destination.name,
        slug: destination.slug,
        region: destination.region,
        country: destination.country,
        summary: destination.summary,
        imageUrl: destination.imageUrl,
        published: destination.published,
        parent: destination.parent,
        children: destination.children,
        tours: destination.tours,
        hotels: destination.hotels.map((hotel) => ({
          id: hotel.id,
          name: hotel.name,
          summary: hotel.summary,
          published: hotel.published,
          priceFrom: hotel.priceFrom,
          currency: hotel.currency,
          roomCount: hotel._count.rooms,
        })),
        vehicles: destination.vehicles,
        busRoutes: destination.busRoutes,
      }}
    />
  );
}
