/**
 * Upsert the LOCKED-format reference tour (Classic Kashmir Triangle) + catalog rows.
 * Attaches place-accurate cover / gallery / day photos when files exist.
 * Does NOT delete other tours.
 *
 *   npx tsx scripts/seed-sample-tour.ts
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  sampleTourCatalogSeed,
  sampleTourClassicKashmir,
} from "../src/lib/demo/sample-tour-classic-kashmir";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");

function localAsset(rel: string | null | undefined) {
  if (!rel) return null;
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function upsertCatalog() {
  const idByKindTitle = new Map<string, string>();

  for (const [index, row] of sampleTourCatalogSeed.entries()) {
    const saved = await prisma.catalogItem.upsert({
      where: { kind_title: { kind: row.kind, title: row.title } },
      update: {
        content: row.content ?? "",
        sortOrder: index,
      },
      create: {
        kind: row.kind,
        title: row.title,
        content: row.content ?? "",
        sortOrder: index,
      },
      select: { id: true, kind: true, title: true },
    });
    idByKindTitle.set(`${saved.kind}::${saved.title}`, saved.id);
  }

  return idByKindTitle;
}

function idsFor(
  map: Map<string, string>,
  kind: string,
  titles: string[],
): string[] {
  return titles.map((title) => {
    const id = map.get(`${kind}::${title}`);
    if (!id) throw new Error(`Missing catalog ${kind}: ${title}`);
    return id;
  });
}

async function main() {
  const tour = sampleTourClassicKashmir;
  const catalog = await upsertCatalog();

  const destinations = await prisma.destination.findMany({
    where: { slug: { in: tour.itinerary.destinationSlugs } },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((d) => [d.slug, d.id]));
  const primaryId = destinationBySlug.get(tour.itinerary.primaryDestinationSlug);
  if (!primaryId) {
    throw new Error(
      `Missing destination "${tour.itinerary.primaryDestinationSlug}". Seed Kashmir destinations first.`,
    );
  }

  const linkIds = tour.itinerary.destinationSlugs
    .map((slug) => destinationBySlug.get(slug))
    .filter((id): id is string => Boolean(id));

  const categoryId = catalog.get(`category::${tour.general.category}`);
  if (!categoryId) throw new Error(`Missing category ${tour.general.category}`);

  const faqsJson = JSON.stringify([
    ...idsFor(catalog, "faq", tour.details.sharedFaqTitles),
    ...tour.details.extraFaqs.map((item) => ({
      local: true as const,
      title: item.title,
      content: item.content,
    })),
  ]);

  const data = {
    title: tour.general.title,
    summary: tour.general.summary,
    description: tour.content.descriptionHtml,
    category: tour.general.category,
    categoryId,
    youtubeUrl: tour.general.youtubeUrl,
    minDayBeforeBooking: tour.general.minDayBeforeBooking,
    durationDays: tour.general.durationDays,
    durationUnit: tour.general.durationUnit,
    durationLabel: tour.general.durationLabel,
    difficulty: tour.general.difficulty,
    minPeople: tour.general.minPeople,
    maxGroupSize: tour.general.maxGroupSize,
    priceFrom: tour.pricing.priceFrom,
    currency: tour.pricing.currency,
    discountsJson: JSON.stringify(tour.pricing.discounts),
    destinationId: primaryId,
    destinationIdsJson: JSON.stringify(linkIds),
    address: tour.itinerary.address,
    mapLat: tour.itinerary.mapLat,
    mapLng: tour.itinerary.mapLng,
    mapZoom: tour.itinerary.mapZoom,
    isFeatured: tour.general.isFeatured,
    defaultState: tour.general.availability,
    availabilityFrom: null,
    availabilityTo: null,
    ...((): Record<string, string> => {
      const cover = localAsset(tour.images.cover);
      const banner = localAsset(tour.images.banner) ?? cover;
      const seo = localAsset(tour.images.seoImage) ?? cover;
      const gallery = tour.images.gallery
        .map((key) => localAsset(key))
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      return {
        imageUrl: cover?.url ?? "",
        imageKey: cover?.key ?? "",
        imageDriver: cover?.driver ?? "local",
        featuredImageUrl: banner?.url ?? "",
        featuredImageKey: banner?.key ?? "",
        featuredImageDriver: banner?.driver ?? "local",
        galleryJson: JSON.stringify(
          gallery.map((item) => ({
            url: item.url,
            key: item.key,
            driver: item.driver,
          })),
        ),
        seoImageUrl: seo?.url ?? "",
        seoImageKey: seo?.key ?? "",
        seoImageDriver: seo?.driver ?? "local",
      };
    })(),
    faqsJson,
    includesJson: JSON.stringify(idsFor(catalog, "include", tour.details.includeTitles)),
    excludesJson: JSON.stringify(idsFor(catalog, "exclude", tour.details.excludeTitles)),
    beforeYouGoJson: JSON.stringify(
      idsFor(catalog, "before_you_go", tour.details.beforeYouGoTitles),
    ),
    travelStylesJson: JSON.stringify(idsFor(catalog, "style", tour.details.travelStyleTitles)),
    facilitiesJson: JSON.stringify(idsFor(catalog, "facility", tour.details.facilityTitles)),
    seoIndex: tour.seo.seoIndex,
    seoTitle: tour.seo.seoTitle,
    seoDescription: tour.seo.seoDescription,
    facebookTitle: tour.seo.facebookTitle,
    facebookDescription: tour.seo.facebookDescription,
    twitterTitle: tour.seo.twitterTitle,
    twitterDescription: tour.seo.twitterDescription,
    published: tour.seo.published,
  };

  const existing = await prisma.tour.findUnique({
    where: { slug: tour.slug },
    select: { id: true, published: true },
  });

  const saved = existing
    ? await prisma.tour.update({
        where: { slug: tour.slug },
        data: { ...data, published: existing.published || data.published },
        select: { id: true, slug: true, published: true },
      })
    : await prisma.tour.create({
        data: { slug: tour.slug, ...data },
        select: { id: true, slug: true, published: true },
      });

  await prisma.itineraryDay.deleteMany({ where: { tourId: saved.id } });
  await prisma.itineraryDay.createMany({
    data: tour.itinerary.days.map((day) => {
      const morning = day.morning?.trim() ?? "";
      const afternoon = day.afternoon?.trim() ?? "";
      const evening = day.evening?.trim() ?? "";
      const description =
        [morning && `Morning: ${morning}`, afternoon && `Afternoon: ${afternoon}`, evening && `Evening: ${evening}`]
          .filter(Boolean)
          .join("\n\n") ||
        day.description?.trim() ||
        "";
      const photo = localAsset(day.imageKey);
      return {
        tourId: saved.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description,
        morning,
        afternoon,
        evening,
        imageUrl: photo?.url ?? "",
        imageKey: photo?.key ?? "",
        imageDriver: photo?.driver ?? "local",
      };
    }),
  });

  await prisma.tourDestination.deleteMany({ where: { tourId: saved.id } });
  await prisma.tourDestination.createMany({
    data: linkIds.map((destinationId) => ({
      tourId: saved.id,
      destinationId,
    })),
  });

  const withDayPhotos = tour.itinerary.days.filter((day) => localAsset(day.imageKey)).length;
  console.log(
    `Sample tour ready: ${saved.slug} (id=${saved.id}, published=${saved.published}, cover=${Boolean(localAsset(tour.images.cover))}, gallery=${tour.images.gallery.filter((k) => localAsset(k)).length}, dayPhotos=${withDayPhotos}/${tour.itinerary.days.length})`,
  );
  console.log(`Preview: http://localhost:3000/sample-tour-preview.html`);
  console.log(`Admin:   http://localhost:3000/admin/tours/${saved.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
