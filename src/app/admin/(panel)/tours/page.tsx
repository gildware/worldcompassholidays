import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToursWorkspace } from "@/components/admin/ToursWorkspace";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Tours" };

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string }>;
}) {
  if (!modules.tours) notFound();
  const user = await requirePermission("tours.view");
  const canManage = can(user, "tours.manage");
  const { deleted, saved } = await searchParams;

  const [tours, destinations] = await Promise.all([
    prisma.tour.findMany({
      include: { destination: { include: { parent: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.destination.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, parent: { select: { name: true } } },
    }),
  ]);

  return (
    <ToursWorkspace
      canManage={canManage}
      notice={deleted ? "deleted" : saved ? "saved" : null}
      destinations={destinations.map((destination) => ({
        id: destination.id,
        name: destinationChoiceLabel(
          destination.name,
          destination.parent?.name,
        ),
      }))}
      tours={tours.map((tour) => ({
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        summary: tour.summary,
        imageUrl: tour.imageUrl,
        published: tour.published,
        destinationId: tour.destinationId,
        destinationName: tour.destination
          ? destinationChoiceLabel(
              tour.destination.name,
              tour.destination.parent?.name,
            )
          : "",
        category: tour.category,
        durationDays: tour.durationDays,
        durationLabel: tour.durationLabel,
        difficulty: tour.difficulty,
        priceFrom: tour.priceFrom,
        currency: tour.currency,
      }))}
    />
  );
}
