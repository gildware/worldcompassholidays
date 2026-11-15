/**
 * Batch 1 — place-matched unique images for shorter hot empty tours.
 *
 *   npx tsx scripts/fetch-batch1-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch1-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch1-empty-tour-images.ts --only aru-lidderwat-day-trek
 */
import { loadEnvConfig } from "@next/env";
import {
  cover,
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

function s(slug: string) {
  return {
    c: (place: string, titles: string[], local?: string[]) =>
      cover(`${slug}-cover.jpg`, place, titles, local),
    g: (n: 1 | 2 | 3 | 4, place: string, titles: string[], local?: string[]) =>
      gallery(`${slug}-g${n}.jpg`, place, titles, local),
    d: (n: number, place: string, titles: string[], local?: string[]) =>
      day(`${slug}-d${n}.jpg`, n, place, titles, local),
  };
}

const JOBS: TourImageJob[] = [
  (() => {
    const slug = "aru-lidderwat-day-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Lidderwat meadow Aru valley Pahalgam Kashmir", [
          "File:Lidderwat.jpg",
          "File:Aru Valley, Pahalgam.jpg",
          "File:Aru valley Kashmir.jpg",
          "File:Pahalgam meadows.jpg",
        ], ["destinations/aru-valley.jpg", "destinations/pahalgam.jpg"]),
        t.g(1, "Aru village Pahalgam Kashmir", [
          "File:Aru village Pahalgam.jpg",
          "File:Aru, Jammu and Kashmir.jpg",
          "File:Pahalgam Aru road.jpg",
        ], ["destinations/pahalgam.jpg"]),
        t.g(2, "Lidder river Pahalgam Kashmir", [
          "File:Lidder River Pahalgam.jpg",
          "File:Lidder River.jpg",
          "File:Pahalgam Lidder.jpg",
        ], ["destinations/pahalgam.jpg"]),
        t.g(3, "Pine forest trail Pahalgam Kashmir", [
          "File:Pine trees in the snow in Pahalgam.jpg",
          "File:Pine Tree-Pahalgam,Jammu&Kashmir,India.JPG",
          "File:Pinus wallichiana forest in Pahalgam valley.jpg",
          "File:Trees and valley.jpg",
        ]),
        t.g(4, "Betaab valley near Pahalgam Kashmir", [
          "File:Betaab Valley.jpg",
          "File:Betaab Valley Pahalgam.jpg",
          "File:Baisaran Pahalgam.jpg",
        ], ["destinations/betaab-valley.jpg", "destinations/pahalgam.jpg"]),
        t.d(1, "Lidderwat alpine meadow Kashmir", [
          "File:Lidderwat meadows.jpg",
          "File:Towards Lidderwat.jpg",
          "File:Aru to Lidderwat trek.jpg",
        ], ["destinations/aru-valley.jpg"]),
        t.d(2, "Pahalgam town Kashmir departure", [
          "File:Pahalgam town.jpg",
          "File:Pahalgam main market.jpg",
          "File:Pahalgam Jammu and Kashmir.jpg",
        ], ["destinations/pahalgam.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "thajiwas-glacier-day-walk";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Thajiwas glacier Sonamarg Kashmir", [
          "File:Thajiwas Glacier.jpg",
          "File:Thajwas glacier Sonamarg.jpg",
          "File:Sonamarg glacier.jpg",
          "File:Thajiwas Sonamarg Kashmir.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.g(1, "Sonamarg meadow Kashmir", [
          "File:Sonamarg.jpg",
          "File:Sonamarg meadow.jpg",
          "File:Sonmarg Kashmir.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.g(2, "Sind river Sonamarg Kashmir", [
          "File:Sind River Sonamarg.jpg",
          "File:Sindh River Kashmir.jpg",
          "File:Sonamarg valley.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.g(3, "Zoji La road near Sonamarg", [
          "File:Zoji La.jpg",
          "File:Zojila Pass.jpg",
          "File:Sonamarg mountains.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.g(4, "Snow peaks Sonamarg Kashmir", [
          "File:Sonamarg snow peaks.jpg",
          "File:Kashmir Himalaya Sonamarg.jpg",
          "File:Thajiwas peak.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.d(1, "Thajiwas glacier walk Sonamarg", [
          "File:Thajiwas Park, Sonamarg, Jammu and Kashmir, India.jpg",
          "File:Sonmarg, Kashmir.jpg",
          "File:Thajwas glacier.jpg",
          "File:Snow at Sonamarg.jpg",
          "File:Baltal Sonamarg.jpg",
        ]),
        t.d(2, "Srinagar Dal Lake return Kashmir", [
          "File:Dal Lake Srinagar.jpg",
          "File:Dal Lake.jpg",
          "File:Srinagar Boulevard.jpg",
        ], ["destinations/srinagar.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "alpather-lake-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Alpather Lake Gulmarg Kashmir frozen", [
          "File:Alpather Lake.jpg",
          "File:Alpather lake Gulmarg.jpg",
          "File:Frozen lake Gulmarg.jpg",
          "File:Apharwat Alpather.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.g(1, "Gulmarg meadow Kashmir", [
          "File:Gulmarg.jpg",
          "File:Gulmarg meadow.jpg",
          "File:Gulmarg Jammu and Kashmir.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.g(2, "Gulmarg Gondola Kashmir", [
          "File:Gulmarg Gondola.jpg",
          "File:Gondola Gulmarg.jpg",
          "File:Gulmarg cable car.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.g(3, "Apharwat peak Gulmarg Kashmir", [
          "File:Apharwat Peak.jpg",
          "File:Apharwat Gulmarg.jpg",
          "File:Kongdori Gulmarg.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.g(4, "Pine forests Gulmarg Kashmir", [
          "File:Gulmarg pine forest.jpg",
          "File:Fir trees Gulmarg.jpg",
          "File:Gulmarg forest trail.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.d(1, "Gulmarg resort meadow arrival", [
          "File:Gulmarg Grassland.jpg",
          "File:Green meadows of Gulmarg.jpg",
          "File:Gulmarg hill Station.jpg",
          "File:Wild flowers- Gulmarg.jpg",
          "File:Wild flowers at Gulmarg.jpg",
          "File:Gulmarg-Valley.jpg",
        ]),
        t.d(2, "Alpather Lake trek Apharwat", [
          "File:Alpathar Lake.jpg",
          "File:Lake near Apharwat.jpg",
          "File:Gulmarg high altitude lake.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.d(3, "Tangmarg road Kashmir departure", [
          "File:Tangmarg.jpg",
          "File:Tangmarg Gulmarg road.jpg",
          "File:Baramulla district hills.jpg",
        ], ["destinations/tangmarg.jpg", "destinations/gulmarg.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "golden-temple-amritsar-darshan";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Golden Temple Amritsar Harmandir Sahib", [
          "File:Golden Temple Amritsar.jpg",
          "File:Harmandir Sahib.jpg",
          "File:Golden Temple night.jpg",
          "File:Sri Harmandir Sahib.jpg",
        ]),
        t.g(1, "Golden Temple sarovar Amritsar", [
          "File:Golden Temple and Sarovar.jpg",
          "File:Amritsar Golden Temple complex.jpg",
          "File:Harmandir Sahib sarovar.jpg",
        ]),
        t.g(2, "Golden Temple reflection Amritsar", [
          "File:Golden Temple reflection.jpg",
          "File:Harmandir Sahib reflection.jpg",
          "File:Amrit Sarovar Amritsar.jpg",
        ]),
        t.g(3, "Amritsar old city bazaar", [
          "File:Dharam Singh Market, Amritsar.jpg",
          "File:Amritsar Market.jpg",
          "File:Calles de Amritsar-India09.JPG",
          "File:Hall Bazaar Amritsar.jpg",
        ]),
        t.g(4, "Jallianwala Bagh Amritsar", [
          "File:Jallianwala Bagh.jpg",
          "File:Jallianwala Bagh Amritsar.jpg",
          "File:Jallianwala Bagh memorial.jpg",
        ]),
        t.d(1, "Golden Temple evening Amritsar", [
          "File:Golden Temple evening.jpg",
          "File:Harmandir Sahib dusk.jpg",
          "File:Amritsar temple lights.jpg",
        ]),
        t.d(2, "Golden Temple morning langar Amritsar", [
          "File:Langar , participatory community kitchen , Golden Temple ,Amritsar 01.jpg",
          "File:Langar , participatory community kitchen , Golden Temple ,Amritsar 02.jpg",
          "File:Guru Ram Das Langar in the golden temple complex in Amritsar 03.jpg",
          "File:Guru Ram Das Langar in the golden temple complex in Amritsar 02.jpg",
          "File:Golden Temple Amritsar morning.jpg",
        ]),
        t.d(3, "Amritsar airport road departure", [
          "File:Amritsar city.jpg",
          "File:Amritsar skyline.jpg",
          "File:Guru Nanak Dev University Amritsar.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "rishikesh-beach-camping-rafting";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Rishikesh Ganga rafting white water", [
          "File:Rafting in Rishikesh.jpg",
          "File:White water rafting Rishikesh.jpg",
          "File:Ganges rafting Rishikesh.jpg",
          "File:Rishikesh river rafting.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(1, "Rishikesh beach camp Ganga", [
          "File:Camping Rishikesh.jpg",
          "File:Beach camp Rishikesh.jpg",
          "File:Ganga beach Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(2, "Laxman Jhula Rishikesh", [
          "File:Laxman Jhula.jpg",
          "File:Lakshman Jhula Rishikesh.jpg",
          "File:Ram Jhula Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(3, "Ganga aarti Rishikesh", [
          "File:Ganga Aarti Rishikesh.jpg",
          "File:Triveni Ghat aarti.jpg",
          "File:Rishikesh evening aarti.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(4, "Himalayan foothills Rishikesh", [
          "File:Rishikesh hills.jpg",
          "File:Rishikesh mountains.jpg",
          "File:Garhwal foothills Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(1, "Rafting Shivpuri Rishikesh", [
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 01.jpg",
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 02.jpg",
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 03.jpg",
          "File:Rafting in the Ganga, Rishikesh.jpg",
          "File:Rishikesh - Rafting & Fun In Ganga.JPG",
          "File:Ganga at Kaudiayala.jpg",
        ]),
        t.d(2, "Rishikesh sunrise Ganga", [
          "File:Sunrise Rishikesh.jpg",
          "File:Ganga sunrise Rishikesh.jpg",
          "File:Morning Ganges Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "bir-billing-paragliding-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Bir Billing paragliding Himachal", [
          "File:Paragliding Bir Billing.jpg",
          "File:Bir Billing paragliders.jpg",
          "File:Paragliding Billing Himachal.jpg",
          "File:Bir paragliding.jpg",
        ], ["destinations/himachal.jpg", "destinations/mcleodganj.jpg"]),
        t.g(1, "Bir Tibetan colony Himachal", [
          "File:Chokling Monastery, Bir.jpg",
          "File:Chokling Monastery.jpg",
          "File:Chokling Monastery, External View.jpg",
          "File:Bir-08-Kloster-Innenhof-gje.jpg",
          "File:ༀམཎིཔདྨེཧཱུྃ། Tibetan pilgrim spinning a prayer wheel (mani wheel) at the Tibetan Buddhist Monastery,Bir,HP,India.jpg",
        ]),
        t.g(2, "Billing takeoff ridge Himachal", [
          "File:Billing Himachal.jpg",
          "File:Billing take off site.jpg",
          "File:Dhauladhar from Billing.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(3, "Dhauladhar range Kangra", [
          "File:Dhauladhar range.jpg",
          "File:Dhauladhar mountains.jpg",
          "File:Kangra valley mountains.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(4, "Paraglider landing Bir field", [
          "File:Bir Billing- Paragliding Capital of India.jpg",
          "File:Bir-Billing.jpg",
          "File:Paragliding in Bir Billing.jpg",
          "File:Paraglider Himachal Pradesh.jpg",
        ]),
        t.d(1, "Bir village Himachal arrival", [
          "File:Bir village.jpg",
          "File:Baijnath temple near Bir.jpg",
          "File:Kangra valley Bir.jpg",
        ], ["destinations/mcleodganj.jpg"]),
        t.d(2, "Billing tandem paragliding flight", [
          "File:Tandem paragliding Bir.jpg",
          "File:Paragliding over Bir.jpg",
          "File:Aerial Bir Billing.jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(3, "Dharamshala McLeod Ganj buffer", [
          "File:McLeod Ganj.jpg",
          "File:Dharamshala.jpg",
          "File:Tsuglagkhang Temple.jpg",
        ], ["destinations/mcleodganj.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "bandhavgarh-tiger-safari";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Bandhavgarh tiger safari Madhya Pradesh", [
          "File:Tiger in Bandhavgarh.jpg",
          "File:Bandhavgarh National Park tiger.jpg",
          "File:Bengal tiger Bandhavgarh.jpg",
          "File:Bandhavgarh tiger jeep.jpg",
        ]),
        t.g(1, "Bandhavgarh forest Madhya Pradesh", [
          "File:Bandhavgarh National Park.jpg",
          "File:Bandhavgarh forest.jpg",
          "File:Bandhavgarh landscape.jpg",
        ]),
        t.g(2, "Bandhavgarh jeep safari", [
          "File:Jeep safari Bandhavgarh.jpg",
          "File:Safari vehicle Bandhavgarh.jpg",
          "File:Wildlife safari Madhya Pradesh.jpg",
        ]),
        t.g(3, "Bandhavgarh Fort Madhya Pradesh", [
          "File:Fort Bandhavgarh National Park Madhya Pradesh India.jpg",
          "File:Bandhavgarh Fort.jpg",
          "File:Bandhavgarh fort ruins.jpg",
          "File:Ficus temple.jpg",
        ]),
        t.g(4, "Bandhavgarh meadow grassland", [
          "File:Chital in Bandhavgarh National Park May 2026 by Tisha Mukherjee 02.jpg",
          "File:Spotted deer in Bandhavgarh National Park 08.jpg",
          "File:Sambar deer at Bandhavgarh National Park.jpg",
          "File:Spotted deer in Bandhavgarh National Park 04.jpg",
          "File:Chital in Bandhavgarh National Park May 2026 by Tisha Mukherjee 01.jpg",
        ]),
        t.d(1, "Bandhavgarh afternoon safari", [
          "File:Afternoon safari Bandhavgarh.jpg",
          "File:Tiger track Bandhavgarh.jpg",
          "File:Bandhavgarh zone safari.jpg",
        ]),
        t.d(2, "Bandhavgarh twin safari day", [
          "File:Morning safari Bandhavgarh.jpg",
          "File:Wildlife Bandhavgarh.jpg",
          "File:Tigress Bandhavgarh.jpg",
        ]),
        t.d(3, "Bandhavgarh fort viewpoint departure", [
          "File:Bandhavgarh fort view.jpg",
          "File:View from Bandhavgarh Fort.jpg",
          "File:Umaria Madhya Pradesh.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "kaziranga-rhino-safari";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Kaziranga one horned rhinoceros Assam", [
          "File:Indian Rhinoceros Kaziranga.jpg",
          "File:One horned rhino Kaziranga.jpg",
          "File:Rhinoceros unicornis Kaziranga.jpg",
          "File:Kaziranga National Park rhino.jpg",
        ]),
        t.g(1, "Kaziranga National Park Assam", [
          "File:Kaziranga National Park.jpg",
          "File:Kaziranga landscape.jpg",
          "File:Kaziranga grasslands.jpg",
        ]),
        t.g(2, "Kaziranga jeep safari Assam", [
          "File:Jeep safari Kaziranga.jpg",
          "File:Kaziranga safari.jpg",
          "File:Wildlife safari Assam.jpg",
        ]),
        t.g(3, "Kaziranga elephant grass Assam", [
          "File:Elephant grass Kaziranga.jpg",
          "File:Kaziranga wetlands.jpg",
          "File:Brahmaputra near Kaziranga.jpg",
        ]),
        t.g(4, "Wild elephants Kaziranga Assam", [
          "File:Elephants in Kaziranga.jpg",
          "File:Asian elephant Kaziranga.jpg",
          "File:Kaziranga elephants.jpg",
        ]),
        t.d(1, "Kaziranga western range Kohora", [
          "File:THE GREAT INDIAN ONE HORNED RHINO BASKING IN THE MORNING SUN AT KAZIRANGA RESERVE.jpg",
          "File:Aggressive Kaziranga rhino.jpg",
          "File:Baby Rhino following its mother.jpg",
          "File:The mighty rhino.jpg",
          "File:Kaziranga Elephant Safari.jpg",
        ]),
        t.d(2, "Kaziranga central range safari", [
          "File:Central range Kaziranga.jpg",
          "File:Kaziranga National Park safari.jpg",
          "File:Birds Kaziranga.jpg",
        ]),
        t.d(3, "Kaziranga orchid park Assam", [
          "File:Orchid Kaziranga.jpg",
          "File:Assam tea garden near Kaziranga.jpg",
          "File:Kaziranga exit road.jpg",
        ]),
      ],
    };
  })(),
];

async function main() {
  const only = (() => {
    const i = process.argv.indexOf("--only");
    return i >= 0 ? process.argv[i + 1] : null;
  })();
  const dbOnly = process.argv.includes("--db-only");
  const jobs = only ? JOBS.filter((j) => j.slug === only) : JOBS;
  if (!jobs.length) throw new Error(`No jobs matched --only ${only}`);

  // Shared blocklist so later tours in this batch cannot reuse earlier claims.
  const shared = createBatchBlocklist(jobs[0]!.slug);
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

  // Also claim any files already written for slugs in this batch (resume-safe).
  for (const job of jobs) {
    for (const target of job.targets) {
      const file = path.join(tourDir, target.file);
      if (!existsSync(file)) continue;
      claimSource(shared, { hash: hashBuffer(readFileSync(file)) });
    }
  }

  const failed: string[] = [];
  for (const job of jobs) {
    try {
      await fetchAndWireTourImages(job, { dbOnly, sharedBlock: shared });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`FAILED ${job.slug}: ${msg}`);
      failed.push(`${job.slug}: ${msg}`);
    }
  }
  if (failed.length) {
    console.error("\nBatch failures:\n" + failed.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`\nBatch 1 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
