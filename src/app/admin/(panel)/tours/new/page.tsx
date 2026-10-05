import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { TourTabsForm } from "@/components/admin/TourTabsForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Add tour" };

export default async function NewTourPage() {
  if (!modules.tours) notFound();
  await requirePermission("tours.manage");

  const destinationRows = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, parent: { select: { name: true } } },
  });
  const destinations = destinationRows.map((destination) => ({
    id: destination.id,
    name: destinationChoiceLabel(destination.name, destination.parent?.name),
  }));

  if (destinations.length === 0) {
    redirect("/admin/tours");
  }

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
          Add new tour
        </h1>
      </div>

      <TourTabsForm destinations={destinations} />
    </div>
  );
}
