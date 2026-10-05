import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TourTabsForm } from "@/components/admin/TourTabsForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { loadTourCatalog } from "@/lib/catalog-query";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { mapTourToFormValues } from "@/lib/tours/map-form";

export const metadata: Metadata = { title: "Edit tour" };

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.tours) notFound();
  await requirePermission("tours.manage");
  const { id } = await params;

  const [tour, destinations, catalog] = await Promise.all([
    prisma.tour.findUnique({
      where: { id },
      include: {
        days: { orderBy: { dayNumber: "asc" } },
      },
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
    loadTourCatalog(),
  ]);

  if (!tour) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Link
          href="/admin/tours"
          className="text-xs font-medium text-brand hover:underline"
        >
          ← All tours
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">
          Edit tour
        </h1>
        <p className="mt-0.5 truncate text-xs text-muted">{tour.title}</p>
      </div>

      <TourTabsForm
        destinations={destinations.map((destination) => ({
          id: destination.id,
          name: destinationChoiceLabel(
            destination.name,
            destination.parent?.name,
          ),
          mapLat: destination.mapLat,
          mapLng: destination.mapLng,
          mapZoom: destination.mapZoom,
        }))}
        tour={mapTourToFormValues(tour)}
        catalog={catalog}
      />
    </div>
  );
}
