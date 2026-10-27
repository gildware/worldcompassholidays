import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusForm } from "@/components/admin/BusForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { ensureBusCatalog, loadBusFacilities } from "@/lib/bus-catalog";
import { resolveCatalogIds } from "@/lib/catalog";
import { parseGallery, parseStringList } from "@/lib/buses";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Edit bus" };

export default async function EditBusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.buses) notFound();
  await requirePermission("buses.manage");
  const { id } = await params;
  await ensureBusCatalog();

  const [bus, facilities] = await Promise.all([
    prisma.bus.findUnique({ where: { id } }),
    loadBusFacilities(),
  ]);
  if (!bus) notFound();

  const facilityOptions = facilities.map((item) => ({
    id: item.id,
    title: item.title,
    iconUrl: item.iconUrl,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <Link href="/admin/buses" className="text-xs font-medium text-brand hover:underline">
          ← All buses
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Edit bus</h1>
        <p className="mt-1 text-xs text-muted">
          Photos and facilities belong to this bus. Change the cities or the run time on its routes.
        </p>
      </div>
      <BusForm
        facilities={facilityOptions}
        bus={{
          id: bus.id,
          name: bus.name,
          coachType: bus.coachType,
          operator: bus.operator,
          summary: bus.summary,
          about: bus.about,
          facilityIds: resolveCatalogIds(
            parseStringList(bus.amenitiesJson),
            facilityOptions.map((item) => ({ ...item, content: "" })),
          ),
          published: bus.published,
          imageUrl: bus.imageUrl,
          imageKey: bus.imageKey,
          imageDriver: bus.imageDriver === "cloudinary" ? "cloudinary" : "local",
          gallery: parseGallery(bus.galleryJson),
        }}
      />
    </div>
  );
}
