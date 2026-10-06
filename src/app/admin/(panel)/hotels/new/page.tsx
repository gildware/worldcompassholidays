import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HotelTabsForm } from "@/components/admin/HotelTabsForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { loadHotelCatalog } from "@/lib/catalog-query";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { mapApiKey } from "@/lib/map-key";

export const metadata: Metadata = { title: "Add hotel" };

export default async function NewHotelPage() {
  if (!modules.hotels) notFound();
  await requirePermission("hotels.manage");

  const [destinationRows, catalog] = await Promise.all([
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

  if (destinationRows.length === 0) {
    return (
      <div>
        <Link href="/admin/hotels" className="text-xs font-medium text-brand hover:underline">
          ← All hotels
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Add hotel</h1>
        <p className="mt-3 text-sm text-muted">Add a destination before creating a hotel.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Link href="/admin/hotels" className="text-xs font-medium text-brand hover:underline">
          ← All hotels
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Add hotel</h1>
      </div>
      <HotelTabsForm
        mapApiKey={mapApiKey()}
        catalog={catalog}
        destinations={destinationRows.map((destination) => ({
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
