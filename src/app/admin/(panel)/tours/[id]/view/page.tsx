import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourView } from "@/components/admin/TourView";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { parseJsonArray, type FaqItem, type TitleItem } from "@/lib/tours/json";

export const metadata: Metadata = { title: "View tour" };

export default async function AdminTourViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.tours) notFound();
  const user = await requirePermission("tours.view");
  const { id } = await params;

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      destination: {
        select: { id: true, name: true, parent: { select: { name: true } } },
      },
      days: { orderBy: { dayNumber: "asc" } },
    },
  });

  if (!tour) notFound();

  const includes = parseJsonArray<TitleItem>(tour.includesJson)
    .map((item) => item.title.trim())
    .filter(Boolean);
  const excludes = parseJsonArray<TitleItem>(tour.excludesJson)
    .map((item) => item.title.trim())
    .filter(Boolean);
  const faqs = parseJsonArray<FaqItem>(tour.faqsJson).filter((item) =>
    item.title.trim(),
  );

  return (
    <TourView
      canManage={can(user, "tours.manage")}
      tour={{
        id: tour.id,
        title: tour.title,
        summary: tour.summary,
        description: tour.description,
        category: tour.category,
        imageUrl: tour.imageUrl,
        published: tour.published,
        isFeatured: tour.isFeatured,
        destination: tour.destination
          ? {
              id: tour.destination.id,
              name: destinationChoiceLabel(
                tour.destination.name,
                tour.destination.parent?.name,
              ),
            }
          : null,
        durationDays: tour.durationDays,
        durationLabel: tour.durationLabel,
        difficulty: tour.difficulty,
        priceFrom: tour.priceFrom,
        currency: tour.currency,
        days: tour.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
        })),
        includes,
        excludes,
        faqs,
      }}
    />
  );
}
