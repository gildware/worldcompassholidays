import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourListV2 } from "@/components/tour-list/tour-list-v2/TourListV2";
import type { TourListCard, TourListLocation } from "@/components/tour-list/types";
import { modules } from "@/config/modules";
import { loadTourCatalog } from "@/lib/catalog-query";
import { prisma } from "@/lib/db";
import { resolveTitles } from "@/lib/hotels/labels";
import { formatTourDuration, parseDurationUnit, parseJsonArray, type GalleryItem } from "@/lib/tours/json";

export const metadata: Metadata = { title: "Tours" };

const languageNames = ["English", "Spanish", "French", "Turkish"];

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function durationInDays(count: number, unit: string) {
  const amount = Number.isFinite(count) && count > 0 ? count : 0;
  if (unit === "hours") return Math.max(1, Math.ceil(amount / 24));
  if (unit === "weeks") return Math.round(amount * 7);
  return Math.round(amount);
}

function durationText(count: number, unit: string, label: string) {
  if (label.trim()) return label.trim();
  if (unit === "hours") return `${count}+ hours`;
  return formatTourDuration(count, parseDurationUnit(unit));
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.tours) notFound();
  const params = await searchParams;

  const [rows, catalog, destinations, priceBounds] = await Promise.all([
    prisma.tour.findMany({
      where: { published: true },
      include: {
        destination: {
          select: { name: true, slug: true, region: true, country: true },
        },
        destinationLinks: {
          include: {
            destination: {
              select: { name: true, slug: true, region: true, country: true },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
    }),
    loadTourCatalog(),
    prisma.destination.findMany({
      where: {
        published: true,
        OR: [
          { tours: { some: { published: true } } },
          { tourLinks: { some: { tour: { published: true } } } },
        ],
      },
      select: { id: true, name: true, region: true, country: true },
      orderBy: { name: "asc" },
    }),
    prisma.tour.aggregate({
      where: { published: true, priceFrom: { gt: 0 } },
      _min: { priceFrom: true },
      _max: { priceFrom: true },
    }),
  ]);

  const tours: TourListCard[] = rows.map((tour) => {
    const place = tour.destination ?? tour.destinationLinks[0]?.destination ?? null;
    const gallery = parseJsonArray<GalleryItem>(tour.galleryJson).flatMap((item) =>
      item?.url ? [item.url] : [],
    );
    const images = [...new Set([tour.imageUrl, tour.featuredImageUrl, ...gallery].filter(Boolean))];
    const includes = resolveTitles(tour.includesJson, catalog.includes);
    const unit = parseDurationUnit(tour.durationUnit);
    const haystack = `${tour.title} ${tour.summary} ${plainText(tour.description)} ${includes.join(" ")}`;
    const languages = languageNames.filter((name) => haystack.toLowerCase().includes(name.toLowerCase()));
    const tag = tour.isFeatured
      ? "best seller"
      : tour.maxGroupSize > 0 && tour.maxGroupSize <= 8
        ? "likely to sell out*"
        : "";

    return {
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      summary: tour.summary,
      location: place?.name ?? "",
      address: tour.address,
      durationLabel: durationText(tour.durationDays, unit, tour.durationLabel),
      durationDays: durationInDays(tour.durationDays, unit),
      category: tour.category.trim() || "Tours",
      images,
      price: tour.priceFrom,
      currency: tour.currency || "INR",
      tag,
      freeCancellation: /free cancellation/i.test(haystack),
      languages,
      href: `/tours/${tour.slug}`,
    };
  });

  const locations: TourListLocation[] = destinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    address: [destination.region, destination.country].filter(Boolean).join(", "),
  }));

  const priceMin = priceBounds._min.priceFrom ?? 0;
  const priceMax = Math.max(priceMin, priceBounds._max.priceFrom ?? priceMin);

  return (
    <TourListV2
      tours={tours}
      locations={locations}
      query={params}
      priceMin={priceMin}
      priceMax={priceMax}
    />
  );
}
