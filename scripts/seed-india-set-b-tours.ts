/**
 * One-shot upsert for Batch 1 India Set B locked tours (does not extend seed-locked-tour REGISTRY).
 *
 *   npx tsx scripts/seed-india-set-b-tours.ts
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  sampleTourCatalogSeed,
  type SampleCatalogRef,
  type TourFormat,
} from "../src/lib/demo/sample-tour-classic-kashmir";
import {
  jaisalmerSamDesertCampCatalogExtras,
  tourJaisalmerSamSandDunesDesertCamp,
} from "../src/lib/demo/tours/jaisalmer-sam-sand-dunes-desert-camp";
import {
  manaliLehBikeTripCatalogExtras,
  tourManaliLehBikeTrip,
} from "../src/lib/demo/tours/manali-leh-bike-trip";
import {
  nagTibbaTrekCatalogExtras,
  tourNagTibbaTrek,
} from "../src/lib/demo/tours/nag-tibba-trek";
import {
  ranthamboreTigerSafariCatalogExtras,
  tourRanthamboreTigerSafari,
} from "../src/lib/demo/tours/ranthambore-tiger-safari";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");

const BUNDLES: { tour: TourFormat; catalog: SampleCatalogRef[] }[] = [
  {
    tour: tourNagTibbaTrek,
    catalog: [...sampleTourCatalogSeed, ...nagTibbaTrekCatalogExtras],
  },
  {
    tour: tourJaisalmerSamSandDunesDesertCamp,
    catalog: [...sampleTourCatalogSeed, ...jaisalmerSamDesertCampCatalogExtras],
  },
  {
    tour: tourManaliLehBikeTrip,
    catalog: [...sampleTourCatalogSeed, ...manaliLehBikeTripCatalogExtras],
  },
  {
    tour: tourRanthamboreTigerSafari,
    catalog: [...sampleTourCatalogSeed, ...ranthamboreTigerSafariCatalogExtras],
  },
];

function localAsset(rel: string | null | undefined) {
  if (!rel) return null;
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function upsertCatalog(rows: SampleCatalogRef[]) {
  const idByKindTitle = new Map<string, string>();
  for (const [index, row] of rows.entries()) {
    const saved = await prisma.catalogItem.upsert({
      where: { kind_title: { kind: row.kind, title: row.title } },
      update: { content: row.content ?? "", sortOrder: index },
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

function idsFor(map: Map<string, string>, kind: string, titles: string[]) {
  return titles.map((title) => {
    const id = map.get(`${kind}::${title}`);
    if (!id) throw new Error(`Missing catalog ${kind}: ${title}`);
    return id;
  });
}

async function seedOne(tour: TourFormat, catalog: SampleCatalogRef[]) {
  const catalogMap = await upsertCatalog(catalog);
  const destinations = await prisma.destination.findMany({
    where: { slug: { in: tour.itinerary.destinationSlugs } },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((d) => [d.slug, d.id]));
  const primaryId = destinationBySlug.get(tour.itinerary.primaryDestinationSlug);
  if (!primaryId) {
    throw new Error(`Missing destination "${tour.itinerary.primaryDestinationSlug}".`);
  }
  const linkIds = tour.itinerary.destinationSlugs
    .map((s) => destinationBySlug.get(s))
    .filter((id): id is string => Boolean(id));
  const categoryId = catalogMap.get(`category::${tour.general.category}`);
  if (!categoryId) throw new Error(`Missing category ${tour.general.category}`);

  const cover = localAsset(tour.images.cover);
  const banner = localAsset(tour.images.banner) ?? cover;
  const seo = localAsset(tour.images.seoImage) ?? cover;
  const gallery = tour.images.gallery
    .map((key) => localAsset(key))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

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
    availabilityFrom: null as Date | null,
    availabilityTo: null as Date | null,
    imageUrl: cover?.url ?? "",
    imageKey: cover?.key ?? "",
    imageDriver: cover?.driver ?? "local",
    featuredImageUrl: banner?.url ?? "",
    featuredImageKey: banner?.key ?? "",
    featuredImageDriver: banner?.driver ?? "local",
    galleryJson: JSON.stringify(
      gallery.map((item) => ({ url: item.url, key: item.key, driver: item.driver })),
    ),
    seoImageUrl: seo?.url ?? "",
    seoImageKey: seo?.key ?? "",
    seoImageDriver: seo?.driver ?? "local",
    faqsJson: JSON.stringify([
      ...idsFor(catalogMap, "faq", tour.details.sharedFaqTitles),
      ...tour.details.extraFaqs.map((item) => ({
        local: true as const,
        title: item.title,
        content: item.content,
      })),
    ]),
    includesJson: JSON.stringify(idsFor(catalogMap, "include", tour.details.includeTitles)),
    excludesJson: JSON.stringify(idsFor(catalogMap, "exclude", tour.details.excludeTitles)),
    beforeYouGoJson: JSON.stringify(
      idsFor(catalogMap, "before_you_go", tour.details.beforeYouGoTitles),
    ),
    travelStylesJson: JSON.stringify(
      idsFor(catalogMap, "style", tour.details.travelStyleTitles),
    ),
    facilitiesJson: JSON.stringify(idsFor(catalogMap, "facility", tour.details.facilityTitles)),
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
    select: { id: true },
  });
  const saved = existing
    ? await prisma.tour.update({
        where: { slug: tour.slug },
        data,
        select: { id: true, slug: true },
      })
    : await prisma.tour.create({
        data: { slug: tour.slug, ...data },
        select: { id: true, slug: true },
      });

  await prisma.itineraryDay.deleteMany({ where: { tourId: saved.id } });
  await prisma.itineraryDay.createMany({
    data: tour.itinerary.days.map((day) => {
      const morning = day.morning?.trim() ?? "";
      const afternoon = day.afternoon?.trim() ?? "";
      const evening = day.evening?.trim() ?? "";
      const description =
        [
          morning && `Morning: ${morning}`,
          afternoon && `Afternoon: ${afternoon}`,
          evening && `Evening: ${evening}`,
        ]
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
    data: linkIds.map((destinationId) => ({ tourId: saved.id, destinationId })),
  });
  console.log(`Seeded: ${saved.slug}`);
}

async function main() {
  for (const bundle of BUNDLES) {
    await seedOne(bundle.tour, bundle.catalog);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
