import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourView } from "@/components/admin/TourView";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { localFaqs, selectionKeys, type CatalogOption } from "@/lib/catalog";
import { loadTourCatalog } from "@/lib/catalog-query";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { sanitizeTourHtml } from "@/lib/tours/html";
import {
  parseDurationUnit,
  parseJsonArray,
  type GalleryItem,
  type PriceDiscount,
} from "@/lib/tours/json";

export const metadata: Metadata = { title: "View tour" };

export default async function AdminTourViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.tours) notFound();
  const user = await requirePermission("tours.view");
  const { id } = await params;

  const [tour, catalog] = await Promise.all([
    prisma.tour.findUnique({
    where: { id },
    include: {
      destination: {
        select: { id: true, name: true, parent: { select: { name: true } } },
      },
      days: { orderBy: { dayNumber: "asc" } },
    },
  }),
    loadTourCatalog(),
  ]);

  if (!tour) notFound();

  const storedIds = parseJsonArray<string>(tour.destinationIdsJson).filter(
    (id) => id.trim(),
  );
  const destinationIds =
    storedIds.length > 0
      ? storedIds
      : tour.destination
        ? [tour.destination.id]
        : [];
  const destinationRows =
    destinationIds.length > 0
      ? await prisma.destination.findMany({
          where: { id: { in: destinationIds } },
          select: {
            id: true,
            name: true,
            parent: { select: { name: true } },
          },
        })
      : [];
  const destinationById = new Map(destinationRows.map((row) => [row.id, row]));
  const destinations = destinationIds.flatMap((id) => {
    const row = destinationById.get(id);
    if (!row) return [];
    return [
      {
        id: row.id,
        name: destinationChoiceLabel(row.name, row.parent?.name),
      },
    ];
  });

  const categoryItem = catalog.categories.find(
    (item) => item.id === tour.categoryId || item.title === tour.category,
  );
  const includes = labeled(tour.includesJson, catalog.includes);
  const excludes = labeled(tour.excludesJson, catalog.excludes);
  const styles = labeled(tour.travelStylesJson, catalog.styles);
  const facilities = labeled(tour.facilitiesJson, catalog.facilities);
  const storedFaqs = parseJsonArray<unknown>(tour.faqsJson);
  const faqs = [
    ...selectionKeys(storedFaqs).flatMap((key) => {
      const item = catalog.faqs.find((row) => row.id === key || row.title === key);
      if (!item) return [];
      return [{ title: item.title, content: item.content }];
    }),
    ...localFaqs(storedFaqs),
  ];

  return (
    <TourView
      canManage={can(user, "tours.manage")}
      tour={{
        id: tour.id,
        title: tour.title,
        summary: tour.summary,
        category: categoryItem?.title || tour.category,
        categoryIconUrl: categoryItem?.iconUrl ?? "",
        imageUrl: tour.imageUrl,
        bannerUrl: tour.featuredImageUrl,
        gallery: parseJsonArray<GalleryItem>(tour.galleryJson)
          .map((item) => item.url)
          .filter(Boolean),
        published: tour.published,
        isFeatured: tour.isFeatured,
        destinations,
        durationDays: tour.durationDays,
        durationUnit: parseDurationUnit(tour.durationUnit),
        durationLabel: tour.durationLabel,
        minPeople: tour.minPeople,
        maxGroupSize: tour.maxGroupSize,
        priceFrom: tour.priceFrom,
        currency: tour.currency,
        discounts: parseJsonArray<PriceDiscount>(tour.discountsJson),
        descriptionHtml: sanitizeTourHtml(tour.description),
        days: tour.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          imageUrl: day.imageUrl,
        })),
        includes,
        excludes,
        styles,
        facilities,
        faqs,
        seoIndex: tour.seoIndex,
        seoTitle: tour.seoTitle,
        seoDescription: tour.seoDescription,
        seoImageUrl: tour.seoImageUrl,
        facebookTitle: tour.facebookTitle,
        facebookDescription: tour.facebookDescription,
        twitterTitle: tour.twitterTitle,
        twitterDescription: tour.twitterDescription,
      }}
    />
  );
}

function labeled(raw: string, items: CatalogOption[]) {
  return selectionKeys(parseJsonArray<unknown>(raw)).flatMap((key) => {
    const item = items.find((row) => row.id === key || row.title === key);
    return item ? [{ title: item.title, iconUrl: item.iconUrl }] : [];
  });
}
