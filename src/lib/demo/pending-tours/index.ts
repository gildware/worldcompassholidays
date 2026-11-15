/**
 * All pending locked-format tours + ready demo modules not yet in the DB.
 * Images are stripped at seed time — do not reintroduce media here.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";
import { sampleTourCatalogSeed } from "../sample-tour-classic-kashmir";
import {
  ayodhyaRamMandirCatalogExtras,
  tourAyodhyaRamMandirDarshan,
} from "../tours/ayodhya-ram-mandir-darshan";
import {
  familySnowGulmargCatalogExtras,
  tourFamilySnowGulmargSpecial,
} from "../tours/family-snow-gulmarg-special";
import {
  goaBeachGetawayCatalogExtras,
  tourGoaBeachGetaway,
} from "../tours/goa-beach-getaway";
import {
  gurezKeranCatalogExtras,
  tourGurezKeranValleyExplorer,
} from "../tours/gurez-keran-valley-explorer";
import {
  kashmirAdventureCatalogExtras,
  tourKashmirAdventureActivityPackage,
} from "../tours/kashmir-adventure-activity-package";
import {
  keralaAyurvedaWellnessCatalogExtras,
  tourKeralaAyurvedaWellnessRetreat,
} from "../tours/kerala-ayurveda-wellness-retreat";
import {
  keralaBackwatersHoneymoonCatalogExtras,
  tourKeralaBackwatersHoneymoon,
} from "../tours/kerala-backwaters-honeymoon";
import {
  pahalgamCouplesCatalogExtras,
  tourPahalgamRiversideCouplesEscape,
} from "../tours/pahalgam-riverside-couples-escape";
import {
  shimlaManaliFamilyCatalogExtras,
  tourShimlaManaliFamilyDelight,
} from "../tours/shimla-manali-family-delight";
import {
  tulianLakeTrekCatalogExtras,
  tourTulianLakeTrek,
} from "../tours/tulian-lake-trek";
import {
  indiaFamilyCampLeisureCatalogExtras,
  indiaFamilyCampLeisurePendingTours,
} from "./india-family-camp-leisure";
import {
  indiaHoneymoonCatalogExtras,
  indiaHoneymoonPendingTours,
} from "./india-honeymoon";
import {
  indiaReligiousCatalogExtras,
  indiaReligiousPendingTours,
} from "./india-religious";
import {
  indiaTrekAdventureCatalogExtras,
  indiaTrekAdventurePendingTours,
} from "./india-trek-adventure";
import {
  indiaWildlifeWellnessCatalogExtras,
  indiaWildlifeWellnessPendingTours,
} from "./india-wildlife-wellness";
import {
  kashmirPendingCatalogExtras,
  kashmirPendingTours,
} from "./kashmir-pending";

export function stripTourImages(tour: TourFormat): TourFormat {
  return {
    ...tour,
    images: {
      banner: null,
      cover: null,
      gallery: [],
      seoImage: null,
    },
    itinerary: {
      ...tour.itinerary,
      days: tour.itinerary.days.map(({ imageKey: _omit, ...day }) => day),
    },
  };
}

type ReadyBundle = { tour: TourFormat; catalog: SampleCatalogRef[] };

const READY_DEMO_BUNDLES: ReadyBundle[] = [
  {
    tour: tourPahalgamRiversideCouplesEscape,
    catalog: pahalgamCouplesCatalogExtras,
  },
  {
    tour: tourFamilySnowGulmargSpecial,
    catalog: familySnowGulmargCatalogExtras,
  },
  {
    tour: tourGurezKeranValleyExplorer,
    catalog: gurezKeranCatalogExtras,
  },
  {
    tour: tourKashmirAdventureActivityPackage,
    catalog: kashmirAdventureCatalogExtras,
  },
  {
    tour: tourTulianLakeTrek,
    catalog: tulianLakeTrekCatalogExtras,
  },
  {
    tour: tourAyodhyaRamMandirDarshan,
    catalog: ayodhyaRamMandirCatalogExtras,
  },
  {
    tour: tourKeralaBackwatersHoneymoon,
    catalog: keralaBackwatersHoneymoonCatalogExtras,
  },
  {
    tour: tourShimlaManaliFamilyDelight,
    catalog: shimlaManaliFamilyCatalogExtras,
  },
  {
    tour: tourGoaBeachGetaway,
    catalog: goaBeachGetawayCatalogExtras,
  },
  {
    tour: tourKeralaAyurvedaWellnessRetreat,
    catalog: keralaAyurvedaWellnessCatalogExtras,
  },
];

const GENERATED: TourFormat[] = [
  ...kashmirPendingTours,
  ...indiaReligiousPendingTours,
  ...indiaHoneymoonPendingTours,
  ...indiaTrekAdventurePendingTours,
  ...indiaFamilyCampLeisurePendingTours,
  ...indiaWildlifeWellnessPendingTours,
];

const GENERATED_CATALOG: SampleCatalogRef[] = [
  ...kashmirPendingCatalogExtras,
  ...indiaReligiousCatalogExtras,
  ...indiaHoneymoonCatalogExtras,
  ...indiaTrekAdventureCatalogExtras,
  ...indiaFamilyCampLeisureCatalogExtras,
  ...indiaWildlifeWellnessCatalogExtras,
];

/** Deduped catalog for the full pending seed. */
export const pendingToursCatalogSeed: SampleCatalogRef[] = (() => {
  const seen = new Set<string>();
  const out: SampleCatalogRef[] = [];
  for (const row of [
    ...sampleTourCatalogSeed,
    ...GENERATED_CATALOG,
    ...READY_DEMO_BUNDLES.flatMap((b) => b.catalog),
  ]) {
    const key = `${row.kind}::${row.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
})();

/** All tours to seed without images (ready demos stripped + generated). */
export const pendingToursNoImages: TourFormat[] = (() => {
  const bySlug = new Map<string, TourFormat>();
  for (const tour of [
    ...READY_DEMO_BUNDLES.map((b) => stripTourImages(b.tour)),
    ...GENERATED.map(stripTourImages),
  ]) {
    bySlug.set(tour.slug, tour);
  }
  return [...bySlug.values()];
})();
