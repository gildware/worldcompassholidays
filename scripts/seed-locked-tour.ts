/**
 * Upsert any locked-format tour + its catalog rows.
 *
 *   npx tsx scripts/seed-locked-tour.ts kashmir-in-tulip-season
 *   npx tsx scripts/seed-locked-tour.ts classic-kashmir-triangle
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  sampleTourCatalogSeed,
  sampleTourClassicKashmir,
  type SampleCatalogRef,
  type TourFormat,
} from "../src/lib/demo/sample-tour-classic-kashmir";
import {
  tourKashmirInTulipSeason,
  tulipSeasonCatalogExtras,
} from "../src/lib/demo/tours/kashmir-in-tulip-season";
import {
  autumnChinarCatalogExtras,
  tourPhotographyAutumnChinar,
} from "../src/lib/demo/tours/photography-autumn-chinar";
import {
  srinagarWeekendCatalogExtras,
  tourSrinagarWeekendGetaway,
} from "../src/lib/demo/tours/srinagar-weekend-getaway";
import {
  gulmargSkiCatalogExtras,
  tourGulmargBeginnerSki,
} from "../src/lib/demo/tours/gulmarg-beginner-ski";
import {
  pahalgamCouplesCatalogExtras,
  tourPahalgamRiversideCouplesEscape,
} from "../src/lib/demo/tours/pahalgam-riverside-couples-escape";
import {
  familySnowGulmargCatalogExtras,
  tourFamilySnowGulmargSpecial,
} from "../src/lib/demo/tours/family-snow-gulmarg-special";
import {
  gurezKeranCatalogExtras,
  tourGurezKeranValleyExplorer,
} from "../src/lib/demo/tours/gurez-keran-valley-explorer";
import {
  kashmirAdventureCatalogExtras,
  tourKashmirAdventureActivityPackage,
} from "../src/lib/demo/tours/kashmir-adventure-activity-package";
import {
  tulianLakeTrekCatalogExtras,
  tourTulianLakeTrek,
} from "../src/lib/demo/tours/tulian-lake-trek";
import {
  ayodhyaRamMandirCatalogExtras,
  tourAyodhyaRamMandirDarshan,
} from "../src/lib/demo/tours/ayodhya-ram-mandir-darshan";
import {
  keralaBackwatersHoneymoonCatalogExtras,
  tourKeralaBackwatersHoneymoon,
} from "../src/lib/demo/tours/kerala-backwaters-honeymoon";
import {
  nagTibbaTrekCatalogExtras,
  tourNagTibbaTrek,
} from "../src/lib/demo/tours/nag-tibba-trek";
import {
  shimlaManaliFamilyCatalogExtras,
  tourShimlaManaliFamilyDelight,
} from "../src/lib/demo/tours/shimla-manali-family-delight";
import {
  jaisalmerSamDesertCampCatalogExtras,
  tourJaisalmerSamSandDunesDesertCamp,
} from "../src/lib/demo/tours/jaisalmer-sam-sand-dunes-desert-camp";
import {
  goaBeachGetawayCatalogExtras,
  tourGoaBeachGetaway,
} from "../src/lib/demo/tours/goa-beach-getaway";
import {
  manaliLehBikeTripCatalogExtras,
  tourManaliLehBikeTrip,
} from "../src/lib/demo/tours/manali-leh-bike-trip";
import {
  ranthamboreTigerSafariCatalogExtras,
  tourRanthamboreTigerSafari,
} from "../src/lib/demo/tours/ranthambore-tiger-safari";
import {
  keralaAyurvedaWellnessCatalogExtras,
  tourKeralaAyurvedaWellnessRetreat,
} from "../src/lib/demo/tours/kerala-ayurveda-wellness-retreat";
import {
  nafranValleyTrekCatalogExtras,
  tourNafranValleyTrek,
} from "../src/lib/demo/tours/nafran-valley-trek";
import {
  varanasiSpiritualTourCatalogExtras,
  tourVaranasiSpiritualTour,
} from "../src/lib/demo/tours/varanasi-spiritual-tour";
import {
  andamanIslandHoneymoonCatalogExtras,
  tourAndamanIslandHoneymoon,
} from "../src/lib/demo/tours/andaman-island-honeymoon";
import {
  harKiDunTrekCatalogExtras,
  tourHarKiDunTrek,
} from "../src/lib/demo/tours/har-ki-dun-trek";
import {
  keralaFamilyGetawayCatalogExtras,
  tourKeralaFamilyGetaway,
} from "../src/lib/demo/tours/kerala-family-getaway";
import {
  bodpathriMeadowsTrekCatalogExtras,
  tourBodpathriMeadowsTrek,
} from "../src/lib/demo/tours/bodpathri-meadows-trek";
import {
  shirdiSaiBabaDarshanCatalogExtras,
  tourShirdiSaiBabaDarshan,
} from "../src/lib/demo/tours/shirdi-sai-baba-darshan";
import {
  goaBeachHoneymoonCatalogExtras,
  tourGoaBeachHoneymoon,
} from "../src/lib/demo/tours/goa-beach-honeymoon";
import {
  goechaLaTrekCatalogExtras,
  tourGoechaLaTrek,
} from "../src/lib/demo/tours/goecha-la-trek";
import {
  goaFamilySplashCatalogExtras,
  tourGoaFamilySplash,
} from "../src/lib/demo/tours/goa-family-splash";
import {
  gurezValleyTrekCatalogExtras,
  tourGurezValleyTrek,
} from "../src/lib/demo/tours/gurez-valley-trek";
import {
  naranagGangabalTrekCatalogExtras,
  tourNaranagGangabalTrek,
} from "../src/lib/demo/tours/naranag-gangabal-trek";
import {
  kolahoiGlacierTrekCatalogExtras,
  tourKolahoiGlacierTrek,
} from "../src/lib/demo/tours/kolahoi-glacier-trek";
import {
  kounsarnagLakeTrekCatalogExtras,
  tourKounsarnagLakeTrek,
} from "../src/lib/demo/tours/kounsarnag-lake-trek";
import {
  thajiwasGlacierDayWalkCatalogExtras,
  tourThajiwasGlacierDayWalk,
} from "../src/lib/demo/tours/thajiwas-glacier-day-walk";
import {
  aruLidderwatDayTrekCatalogExtras,
  tourAruLidderwatDayTrek,
} from "../src/lib/demo/tours/aru-lidderwat-day-trek";
import {
  alpatherLakeTrekCatalogExtras,
  tourAlpatherLakeTrek,
} from "../src/lib/demo/tours/alpather-lake-trek";
import {
  marchoiValleyWinterTrekCatalogExtras,
  tourMarchoiValleyWinterTrek,
} from "../src/lib/demo/tours/marchoi-valley-winter-trek";
import {
  sandakphuPhalutTrekCatalogExtras,
  tourSandakphuPhalutTrek,
} from "../src/lib/demo/tours/sandakphu-phalut-trek";
import {
  beasKundTrekCatalogExtras,
  tourBeasKundTrek,
} from "../src/lib/demo/tours/beas-kund-trek";
import {
  bhriguLakeTrekCatalogExtras,
  tourBhriguLakeTrek,
} from "../src/lib/demo/tours/bhrigu-lake-trek";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");

type LockedTourBundle = {
  tour: TourFormat;
  catalog: SampleCatalogRef[];
  /** Optional seasonal window (UTC dates). */
  availability?: { from: Date; to: Date };
};

const year = new Date().getUTCFullYear();

/** One tour from each category — Batch 1. */
export const BATCH1_SLUGS = [
  "pahalgam-riverside-couples-escape",
  "family-snow-gulmarg-special",
  "gurez-keran-valley-explorer",
  "kashmir-adventure-activity-package",
  "tulian-lake-trek",
  "ayodhya-ram-mandir-darshan",
  "kerala-backwaters-honeymoon",
  "nag-tibba-trek",
  "shimla-manali-family-delight",
  "jaisalmer-sam-sand-dunes-desert-camp",
  "goa-beach-getaway",
  "manali-leh-bike-trip",
  "ranthambore-tiger-safari",
  "kerala-ayurveda-wellness-retreat",
] as const;

/** Five tours, mixed categories — Batch 2. */
export const BATCH2_SLUGS = [
  "nafran-valley-trek",
  "varanasi-spiritual-tour",
  "andaman-island-honeymoon",
  "har-ki-dun-trek",
  "kerala-family-getaway",
] as const;

/** Five tours — Batch 3. */
export const BATCH3_SLUGS = [
  "bodpathri-meadows-trek",
  "shirdi-sai-baba-darshan",
  "goa-beach-honeymoon",
  "goecha-la-trek",
  "goa-family-splash",
] as const;

/** Eleven media-ready treks — Batch 4. */
export const BATCH4_SLUGS = [
  "gurez-valley-trek",
  "naranag-gangabal-trek",
  "kolahoi-glacier-trek",
  "kounsarnag-lake-trek",
  "thajiwas-glacier-day-walk",
  "aru-lidderwat-day-trek",
  "alpather-lake-trek",
  "marchoi-valley-winter-trek",
  "sandakphu-phalut-trek",
  "beas-kund-trek",
  "bhrigu-lake-trek",
] as const;

const REGISTRY: Record<string, LockedTourBundle> = {
  "classic-kashmir-triangle": {
    tour: sampleTourClassicKashmir,
    catalog: sampleTourCatalogSeed,
  },
  "kashmir-in-tulip-season": {
    tour: tourKashmirInTulipSeason,
    catalog: [...sampleTourCatalogSeed, ...tulipSeasonCatalogExtras],
    availability: {
      from: new Date(Date.UTC(year, 2, 20)), // 20 Mar
      to: new Date(Date.UTC(year, 3, 20)), // 20 Apr
    },
  },
  "photography-autumn-chinar-tour": {
    tour: tourPhotographyAutumnChinar,
    catalog: [...sampleTourCatalogSeed, ...autumnChinarCatalogExtras],
    availability: {
      from: new Date(Date.UTC(year, 9, 1)), // 1 Oct
      to: new Date(Date.UTC(year, 10, 20)), // 20 Nov
    },
  },
  "srinagar-weekend-getaway": {
    tour: tourSrinagarWeekendGetaway,
    catalog: [...sampleTourCatalogSeed, ...srinagarWeekendCatalogExtras],
  },
  "gulmarg-beginner-ski-package": {
    tour: tourGulmargBeginnerSki,
    catalog: [...sampleTourCatalogSeed, ...gulmargSkiCatalogExtras],
    availability: {
      from: new Date(Date.UTC(year, 11, 15)), // 15 Dec
      to: new Date(Date.UTC(year + 1, 2, 15)), // 15 Mar next year
    },
  },
  "pahalgam-riverside-couples-escape": {
    tour: tourPahalgamRiversideCouplesEscape,
    catalog: [...sampleTourCatalogSeed, ...pahalgamCouplesCatalogExtras],
  },
  "family-snow-gulmarg-special": {
    tour: tourFamilySnowGulmargSpecial,
    catalog: [...sampleTourCatalogSeed, ...familySnowGulmargCatalogExtras],
    availability: {
      from: new Date(Date.UTC(year, 11, 15)),
      to: new Date(Date.UTC(year + 1, 2, 15)),
    },
  },
  "gurez-keran-valley-explorer": {
    tour: tourGurezKeranValleyExplorer,
    catalog: [...sampleTourCatalogSeed, ...gurezKeranCatalogExtras],
  },
  "kashmir-adventure-activity-package": {
    tour: tourKashmirAdventureActivityPackage,
    catalog: [...sampleTourCatalogSeed, ...kashmirAdventureCatalogExtras],
  },
  "tulian-lake-trek": {
    tour: tourTulianLakeTrek,
    catalog: [...sampleTourCatalogSeed, ...tulianLakeTrekCatalogExtras],
  },
  "ayodhya-ram-mandir-darshan": {
    tour: tourAyodhyaRamMandirDarshan,
    catalog: [...sampleTourCatalogSeed, ...ayodhyaRamMandirCatalogExtras],
  },
  "kerala-backwaters-honeymoon": {
    tour: tourKeralaBackwatersHoneymoon,
    catalog: [...sampleTourCatalogSeed, ...keralaBackwatersHoneymoonCatalogExtras],
  },
  "nag-tibba-trek": {
    tour: tourNagTibbaTrek,
    catalog: [...sampleTourCatalogSeed, ...nagTibbaTrekCatalogExtras],
  },
  "shimla-manali-family-delight": {
    tour: tourShimlaManaliFamilyDelight,
    catalog: [...sampleTourCatalogSeed, ...shimlaManaliFamilyCatalogExtras],
  },
  "jaisalmer-sam-sand-dunes-desert-camp": {
    tour: tourJaisalmerSamSandDunesDesertCamp,
    catalog: [...sampleTourCatalogSeed, ...jaisalmerSamDesertCampCatalogExtras],
  },
  "goa-beach-getaway": {
    tour: tourGoaBeachGetaway,
    catalog: [...sampleTourCatalogSeed, ...goaBeachGetawayCatalogExtras],
  },
  "manali-leh-bike-trip": {
    tour: tourManaliLehBikeTrip,
    catalog: [...sampleTourCatalogSeed, ...manaliLehBikeTripCatalogExtras],
  },
  "ranthambore-tiger-safari": {
    tour: tourRanthamboreTigerSafari,
    catalog: [...sampleTourCatalogSeed, ...ranthamboreTigerSafariCatalogExtras],
  },
  "kerala-ayurveda-wellness-retreat": {
    tour: tourKeralaAyurvedaWellnessRetreat,
    catalog: [...sampleTourCatalogSeed, ...keralaAyurvedaWellnessCatalogExtras],
  },
  "nafran-valley-trek": {
    tour: tourNafranValleyTrek,
    catalog: [...sampleTourCatalogSeed, ...nafranValleyTrekCatalogExtras],
  },
  "varanasi-spiritual-tour": {
    tour: tourVaranasiSpiritualTour,
    catalog: [...sampleTourCatalogSeed, ...varanasiSpiritualTourCatalogExtras],
  },
  "andaman-island-honeymoon": {
    tour: tourAndamanIslandHoneymoon,
    catalog: [...sampleTourCatalogSeed, ...andamanIslandHoneymoonCatalogExtras],
  },
  "har-ki-dun-trek": {
    tour: tourHarKiDunTrek,
    catalog: [...sampleTourCatalogSeed, ...harKiDunTrekCatalogExtras],
  },
  "kerala-family-getaway": {
    tour: tourKeralaFamilyGetaway,
    catalog: [...sampleTourCatalogSeed, ...keralaFamilyGetawayCatalogExtras],
  },
  "bodpathri-meadows-trek": {
    tour: tourBodpathriMeadowsTrek,
    catalog: [...sampleTourCatalogSeed, ...bodpathriMeadowsTrekCatalogExtras],
  },
  "shirdi-sai-baba-darshan": {
    tour: tourShirdiSaiBabaDarshan,
    catalog: [...sampleTourCatalogSeed, ...shirdiSaiBabaDarshanCatalogExtras],
  },
  "goa-beach-honeymoon": {
    tour: tourGoaBeachHoneymoon,
    catalog: [...sampleTourCatalogSeed, ...goaBeachHoneymoonCatalogExtras],
  },
  "goecha-la-trek": {
    tour: tourGoechaLaTrek,
    catalog: [...sampleTourCatalogSeed, ...goechaLaTrekCatalogExtras],
  },
  "goa-family-splash": {
    tour: tourGoaFamilySplash,
    catalog: [...sampleTourCatalogSeed, ...goaFamilySplashCatalogExtras],
  },
  "gurez-valley-trek": {
    tour: tourGurezValleyTrek,
    catalog: [...sampleTourCatalogSeed, ...gurezValleyTrekCatalogExtras],
  },
  "naranag-gangabal-trek": {
    tour: tourNaranagGangabalTrek,
    catalog: [...sampleTourCatalogSeed, ...naranagGangabalTrekCatalogExtras],
  },
  "kolahoi-glacier-trek": {
    tour: tourKolahoiGlacierTrek,
    catalog: [...sampleTourCatalogSeed, ...kolahoiGlacierTrekCatalogExtras],
  },
  "kounsarnag-lake-trek": {
    tour: tourKounsarnagLakeTrek,
    catalog: [...sampleTourCatalogSeed, ...kounsarnagLakeTrekCatalogExtras],
  },
  "thajiwas-glacier-day-walk": {
    tour: tourThajiwasGlacierDayWalk,
    catalog: [...sampleTourCatalogSeed, ...thajiwasGlacierDayWalkCatalogExtras],
  },
  "aru-lidderwat-day-trek": {
    tour: tourAruLidderwatDayTrek,
    catalog: [...sampleTourCatalogSeed, ...aruLidderwatDayTrekCatalogExtras],
  },
  "alpather-lake-trek": {
    tour: tourAlpatherLakeTrek,
    catalog: [...sampleTourCatalogSeed, ...alpatherLakeTrekCatalogExtras],
  },
  "marchoi-valley-winter-trek": {
    tour: tourMarchoiValleyWinterTrek,
    catalog: [...sampleTourCatalogSeed, ...marchoiValleyWinterTrekCatalogExtras],
    availability: {
      from: new Date(Date.UTC(year, 0, 5)), // 5 Jan
      to: new Date(Date.UTC(year, 2, 20)), // 20 Mar
    },
  },
  "sandakphu-phalut-trek": {
    tour: tourSandakphuPhalutTrek,
    catalog: [...sampleTourCatalogSeed, ...sandakphuPhalutTrekCatalogExtras],
    availability: {
      from: new Date(Date.UTC(year, 2, 15)), // 15 Mar
      to: new Date(Date.UTC(year, 4, 15)), // 15 May
    },
  },
  "beas-kund-trek": {
    tour: tourBeasKundTrek,
    catalog: [...sampleTourCatalogSeed, ...beasKundTrekCatalogExtras],
  },
  "bhrigu-lake-trek": {
    tour: tourBhriguLakeTrek,
    catalog: [...sampleTourCatalogSeed, ...bhriguLakeTrekCatalogExtras],
  },
};

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

function idsFor(map: Map<string, string>, kind: string, titles: string[]) {
  return titles.map((title) => {
    const id = map.get(`${kind}::${title}`);
    if (!id) throw new Error(`Missing catalog ${kind}: ${title}`);
    return id;
  });
}

function impliedCatalogFromTour(tour: TourFormat): SampleCatalogRef[] {
  const rows: SampleCatalogRef[] = [
    { kind: "category", title: tour.general.category },
  ];
  for (const title of tour.details.sharedFaqTitles) {
    rows.push({ kind: "faq", title, content: "" });
  }
  for (const title of tour.details.includeTitles) {
    rows.push({ kind: "include", title });
  }
  for (const title of tour.details.excludeTitles) {
    rows.push({ kind: "exclude", title });
  }
  for (const title of tour.details.beforeYouGoTitles) {
    rows.push({ kind: "before_you_go", title, content: "" });
  }
  for (const title of tour.details.travelStyleTitles) {
    rows.push({ kind: "style", title });
  }
  for (const title of tour.details.facilityTitles) {
    rows.push({ kind: "facility", title });
  }
  return rows;
}

async function seedOne(slug: string) {
  const bundle = REGISTRY[slug];
  if (!bundle) {
    throw new Error(
      `Unknown tour "${slug}". Known: ${Object.keys(REGISTRY).join(", ")}`,
    );
  }
  const { tour, catalog, availability } = bundle;
  // Ensure every referenced title exists (tour extras may omit some).
  // Prefer content from explicit catalog rows over empty implied stubs.
  const merged = [...impliedCatalogFromTour(tour), ...catalog];
  const catalogMap = await upsertCatalog(merged);

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
    availabilityFrom: availability?.from ?? null,
    availabilityTo: availability?.to ?? null,
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
    faqsJson: JSON.stringify([
      ...idsFor(catalogMap, "faq", tour.details.sharedFaqTitles),
      ...tour.details.extraFaqs.map((item) => ({
        local: true as const,
        title: item.title,
        content: item.content,
      })),
    ]),
    includesJson: JSON.stringify(
      idsFor(catalogMap, "include", tour.details.includeTitles),
    ),
    excludesJson: JSON.stringify(
      idsFor(catalogMap, "exclude", tour.details.excludeTitles),
    ),
    beforeYouGoJson: JSON.stringify(
      idsFor(catalogMap, "before_you_go", tour.details.beforeYouGoTitles),
    ),
    travelStylesJson: JSON.stringify(
      idsFor(catalogMap, "style", tour.details.travelStyleTitles),
    ),
    facilitiesJson: JSON.stringify(
      idsFor(catalogMap, "facility", tour.details.facilityTitles),
    ),
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
    data: linkIds.map((destinationId) => ({
      tourId: saved.id,
      destinationId,
    })),
  });

  const dayPhotos = tour.itinerary.days.filter((d) => localAsset(d.imageKey)).length;
  console.log(
    `Locked tour ready: ${saved.slug} (id=${saved.id}, published=${saved.published}, cover=${Boolean(cover)}, gallery=${gallery.length}, dayPhotos=${dayPhotos}/${tour.itinerary.days.length})`,
  );
  console.log(`Live:  http://localhost:3000/tours/${saved.slug}`);
  console.log(`Admin: http://localhost:3000/admin/tours/${saved.id}`);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.log(
      "Usage: npx tsx scripts/seed-locked-tour.ts <slug|--batch1|--batch2|--batch3|--batch4>",
    );
    console.log(`Known: ${Object.keys(REGISTRY).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  const slugs =
    arg === "--batch1"
      ? [...BATCH1_SLUGS]
      : arg === "--batch2"
        ? [...BATCH2_SLUGS]
        : arg === "--batch3"
          ? [...BATCH3_SLUGS]
          : arg === "--batch4"
            ? [...BATCH4_SLUGS]
            : [arg];
  for (const slug of slugs) {
    console.log(`\n—— seeding ${slug} ——`);
    await seedOne(slug);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
