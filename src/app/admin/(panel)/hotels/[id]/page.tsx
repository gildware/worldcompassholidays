import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HotelTabsForm } from "@/components/admin/HotelTabsForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { loadHotelCatalog } from "@/lib/catalog-query";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { mapHotelToFormValues } from "@/lib/hotels/map-form";
import { mapApiKey } from "@/lib/map-key";

export const metadata: Metadata = { title: "Edit hotel" };

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.hotels) notFound();
  await requirePermission("hotels.manage");
  const { id } = await params;

  const [hotel, destinations, catalog] = await Promise.all([
    prisma.hotel.findUnique({
      where: { id },
      include: { rooms: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.destination.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        mapLat: true,
        mapLng: true,
        mapZoom: true,
        parent: { select: { name: true } },
      },
    }),
    loadHotelCatalog(),
  ]);

  if (!hotel) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Link href="/admin/hotels" className="text-xs font-medium text-brand hover:underline">
          ← All hotels
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Edit hotel</h1>
        <p className="mt-0.5 truncate text-xs text-muted">{hotel.name}</p>
      </div>
      <HotelTabsForm
        mapApiKey={mapApiKey()}
        catalog={catalog}
        hotel={mapHotelToFormValues(hotel)}
        destinations={destinations.map((destination) => ({
          id: destination.id,
          name: destinationChoiceLabel(destination.name, destination.parent?.name),
          mapLat: destination.mapLat,
          mapLng: destination.mapLng,
          mapZoom: destination.mapZoom,
        }))}
      />
    </div>
  );
}
