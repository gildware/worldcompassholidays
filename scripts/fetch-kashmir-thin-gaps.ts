/**
 * Fill thin Kashmir tour image gaps with place-matched Wikimedia Commons only.
 * No local/stock fallbacks.
 *
 *   npx tsx scripts/fetch-kashmir-thin-gaps.ts
 *   npx tsx scripts/fetch-kashmir-thin-gaps.ts --only kashmir-great-lakes-trek
 */
import { existsSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
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

loadEnvConfig(process.cwd());

const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

const JOBS: TourImageJob[] = [
  {
    slug: "kashmir-great-lakes-trek",
    targets: [
      cover("kashmir-great-lakes-trek-cover.jpg", "Gangabal Lake Harmukh Kashmir", [
        "File:Gangabal Lake.jpg",
        "File:Gangabal lake, Kashmir.jpg",
        "File:Nundkol Lake and Gangabal Lake.jpg",
      ]),
      gallery("kashmir-great-lakes-trek-g1.jpg", "Vishansar Lake Kashmir trek", [
        "File:Vishansar Lake.jpg",
        "File:Vishansar lake Kashmir.jpg",
        "File:Kishansar and Vishansar Lakes.jpg",
      ]),
      gallery("kashmir-great-lakes-trek-g2.jpg", "Gadsar Lake Kashmir trek", [
        "File:Gadsar Lake.jpg",
        "File:Gadsar lake Kashmir.jpg",
      ]),
      gallery("kashmir-great-lakes-trek-g3.jpg", "Sonamarg meadow Kashmir", [
        "File:Sonamarg.jpg",
        "File:Sonamarg Valley.jpg",
        "File:Thajiwas Glacier Sonamarg.jpg",
      ]),
      gallery("kashmir-great-lakes-trek-g4.jpg", "Naranag temple Kashmir", [
        "File:Ancient Temple, Naranag, Jammu and Kashmir, India.jpg",
        "File:Naranag Temple.jpg",
        "File:Naranag temples.jpg",
      ]),
      day("kashmir-great-lakes-trek-d1.jpg", 1, "Sonamarg Kashmir trek base", [
        "File:Sonamarg 2.jpg",
        "File:Sonamarg Meadows.jpg",
        "File:Sind River Sonamarg.jpg",
      ]),
      day("kashmir-great-lakes-trek-d2.jpg", 2, "Sonamarg Kashmir", [
        "File:Sonamarg Valley.jpg",
        "File:Thajiwas Glacier Sonamarg.jpg",
        "File:Sonamarg Meadows.jpg",
        "File:Sind River at Sonamarg.jpg",
        "File:Sonamarg Landscape.jpg",
      ]),
      day("kashmir-great-lakes-trek-d3.jpg", 3, "Vishansar Lake Kashmir", [
        "File:Kishansar Lake.jpg",
        "File:Kishansar and Vishansar Lakes.jpg",
        "File:Vishansar lake.jpg",
      ]),
      day("kashmir-great-lakes-trek-d4.jpg", 4, "Gadsar Lake Kashmir", [
        "File:Gadsar Lake.jpg",
        "File:Yamsar and Gadsar lake.jpg",
      ]),
      day("kashmir-great-lakes-trek-d5.jpg", 5, "Satsar Kashmir", [
        "File:Satsar Lakes.jpg",
        "File:Satsar lake.jpg",
        "File:Gangabal Lake.jpg",
      ]),
      day("kashmir-great-lakes-trek-d6.jpg", 6, "Nundkol Lake Kashmir", [
        "File:Nundkol Lake.jpg",
        "File:Nundkol Lake and Gangabal Lake.jpg",
        "File:Gangabal.jpg",
      ]),
      day("kashmir-great-lakes-trek-d7.jpg", 7, "Naranag Kashmir", [
        "File:Ancient Temple, Naranag, Jammu and Kashmir, India.jpg",
        "File:Naranag.jpg",
        "File:Wangath temple complex Naranag.jpg",
      ]),
      day("kashmir-great-lakes-trek-d8.jpg", 8, "Dal Lake Srinagar", [
        "File:Dal Lake, Srinagar 3.jpg",
        "File:Floating market on Dal Lake, Srinagar 2.jpg",
        "File:Dal Lake Srinagar.jpg",
      ]),
    ],
  },
  {
    slug: "tarsar-marsar-trek",
    targets: [
      cover("tarsar-marsar-trek-cover.jpg", "Tarsar Lake Kashmir alpine", [
        "File:Tarsar Lake.jpg",
        "File:Tarsar lake Kashmir.jpg",
        "File:Tarsar Marsar.jpg",
      ]),
      gallery("tarsar-marsar-trek-g1.jpg", "Aru Valley Pahalgam Kashmir", [
        "File:Aru Valley Pehalgam Jammu and Kashmir.jpg",
        "File:Aru Valley, Pahalgam.jpg",
        "File:Square Panorama of Aru Valley, Jammu and Kashmir, India.jpg",
      ]),
      gallery("tarsar-marsar-trek-g2.jpg", "Lidderwat meadow Pahalgam Kashmir", [
        "File:Tiya on Pony Trek from Aru to Lidderwat (14391496017).jpg",
        "File:Maya on Pony Trek from Aru to Lidderwat (14576178814).jpg",
        "File:The river Lidder flows through the Pahalgam valley.jpg",
      ]),
      gallery("tarsar-marsar-trek-g3.jpg", "Tarsar Lake Kashmir camp", [
        "File:Tarsar Lake Kashmir India.jpg",
        "File:Tarsar.jpg",
      ]),
      gallery("tarsar-marsar-trek-g4.jpg", "Pahalgam pine valley Kashmir", [
        "File:Pahalgam Valley.jpg",
        "File:Pahalgam 1.jpg",
        "File:A view of Pahalgam valley.jpg",
      ]),
      day("tarsar-marsar-trek-d1.jpg", 1, "Aru village Pahalgam Kashmir", [
        "File:Aru village Pahalgam.jpg",
        "File:Aru Valley.jpg",
      ]),
      day("tarsar-marsar-trek-d2.jpg", 2, "Lidderwat Kashmir trek", [
        "File:Lidder at Pahalgam.jpg",
        "File:River Lidder, Pahalgam, Kashmir.jpg",
      ]),
      day("tarsar-marsar-trek-d3.jpg", 3, "Tarsar Lake Kashmir", [
        "File:Tarsar Lake.jpg",
      ]),
      day("tarsar-marsar-trek-d4.jpg", 4, "Marsar Lake Kashmir", [
        "File:Marsar tarsar lake j&k.jpg",
        "File:Tarsar Marsar Trek.jpg",
        "File:Kolahoi Glacier(4792m), The biggest Glacier of Kashmir Valley which 27km from Aru Valley reached via Lidder Watt.jpg",
      ]),
      day("tarsar-marsar-trek-d5.jpg", 5, "Aru Valley Kashmir", [
        "File:Aru Valley Kashmir in Autumn.jpg",
        "File:Beautiful scenes in Aru valley.jpg",
        "File:Nisha and Maya on Pony Trek from Aru to Lidderwat (14554827686).jpg",
      ]),
      day("tarsar-marsar-trek-d6.jpg", 6, "Pahalgam Kashmir", [
        "File:Pahalgam Mountain Range.jpg",
        "File:A view of Pahalgam valley.jpg",
        "File:Lidder River 1.jpg",
      ]),
    ],
  },
  {
    slug: "amarnath-yatra",
    targets: [
      cover("amarnath-yatra-cover.jpg", "Amarnath cave", [
        "File:Shri Amarnath Ji Holy Cave(GUFA).jpg",
        "File:Shri Amarnath cave.jpg",
        "File:Amarnath Cave Temple.jpg",
        "File:Cave Temple of Lord Amarnath.jpg",
      ]),
      gallery("amarnath-yatra-g1.jpg", "Sheshnag Lake Amarnath", [
        "File:Sheshnag Lake-Amarnath Yatra Series.jpg",
        "File:Sheshnag Lake J&K.jpg",
      ]),
      gallery("amarnath-yatra-g2.jpg", "Amarnath Yatra Kashmir", [
        "File:Panjatarani - amarnath yatra.jpg",
        "File:Amarnath Yatra -Jammu & Kashmir.jpg",
      ]),
      gallery("amarnath-yatra-g3.jpg", "Amarnath Cave Temple", [
        "File:Cave Temple of Lord Amarnath.jpg",
        "File:Lord Amarnath.jpg",
      ]),
      gallery("amarnath-yatra-g4.jpg", "Pahalgam Kashmir", [
        "File:Pahalgam Valley.jpg",
        "File:Betaab Valley.jpg",
      ]),
      day("amarnath-yatra-d1.jpg", 1, "Dal Lake Srinagar", [
        "File:Dal Lake, Srinagar, Jammu and Kashmir.jpg",
        "File:Floating market on Dal Lake, Srinagar 2.jpg",
      ]),
      day("amarnath-yatra-d2.jpg", 2, "Pahalgam Kashmir", [
        "File:Pahalgam 1.jpg",
        "File:Lidder at Pahalgam.jpg",
      ]),
      day("amarnath-yatra-d3.jpg", 3, "Sheshnag Lake", [
        "File:Sheshnag Lake-Amarnath Yatra Series.jpg",
        "File:Sheshnag Lake J&K.jpg",
      ]),
      day("amarnath-yatra-d4.jpg", 4, "Amarnath cave", [
        "File:Shri Amarnath Ji Holy Cave(GUFA).jpg",
        "File:Shri Amarnath cave.jpg",
      ]),
      day("amarnath-yatra-d5.jpg", 5, "Amarnath Yatra", [
        "File:Panjatarani - amarnath yatra.jpg",
        "File:Amarnath Yatra -Jammu & Kashmir.jpg",
      ]),
      day("amarnath-yatra-d6.jpg", 6, "Pahalgam Kashmir", [
        "File:Betaab Valley.jpg",
        "File:Pahalgam Mountain Range.jpg",
      ]),
      day("amarnath-yatra-d7.jpg", 7, "Dal Lake Srinagar", [
        "File:Dal Lake, Srinagar 3.jpg",
        "File:The Ancient Shankaracharya Temple (Srinagar, Jammu and Kashmir) (cropped).jpg",
      ]),
    ],
  },
  {
    slug: "vaishno-devi-yatra",
    targets: [
      cover("vaishno-devi-yatra-cover.jpg", "Vaishno Devi Katra", [
        "File:Vaishno Devi Bhavan.jpg",
        "File:Mata Vaishno Devi Mandir, Katra.jpg",
        "File:Vaishno Devi Pindi Katra Vaishno Devi.jpg",
      ]),
      gallery("vaishno-devi-yatra-g1.jpg", "Katra Jammu", [
        "File:Katra, Jammu and Kashmir.jpg",
        "File:Houses and Shops located in Katra, Jammu and Kashmir.jpg",
        "File:Katra (Jammu and Kashmir) seen from NE (216955635).jpg",
      ]),
      gallery("vaishno-devi-yatra-g2.jpg", "Vaishno Devi entrance Katra", [
        "File:Vaishno Devi entrance.jpg",
        "File:Vaishno Devi Pindi Katra Vaishno Devi.jpg",
      ]),
      gallery("vaishno-devi-yatra-g3.jpg", "Vaishno Devi Bhavan", [
        "File:Vaishno Devi Bhavan.jpg",
        "File:Mata Vaishno Devi Mandir, Katra.jpg",
      ]),
      gallery("vaishno-devi-yatra-g4.jpg", "Katra hill temple Jammu", [
        "File:A Hindu temple on hilltop at Katra, Jammu & Kashmir.jpg",
        "File:Katra jammu road.jpg",
      ]),
      day("vaishno-devi-yatra-d1.jpg", 1, "Katra Jammu arrival", [
        "File:Katra Bus stand, Katra, Jammu ^ Kashmir, India - panoramio.jpg",
        "File:Katra, Jammu and Kashmir.jpg",
      ]),
      day("vaishno-devi-yatra-d2.jpg", 2, "Vaishno Devi darshan", [
        "File:Vaishno Devi Bhavan.jpg",
        "File:Vaishno Devi entrance.jpg",
      ]),
      day("vaishno-devi-yatra-d3.jpg", 3, "Katra Jammu", [
        "File:Katra jammu road.jpg",
        "File:Houses and Shops located in Katra, Jammu and Kashmir.jpg",
      ]),
    ],
  },
  {
    slug: "srinagar-leh-road-trip",
    targets: [
      cover("srinagar-leh-road-trip-cover.jpg", "Zoji La Kashmir", [
        "File:A view from Zoji La.jpg",
        "File:Zoji La - Ladakh.jpg",
        "File:Zoji La.jpg",
      ]),
      gallery("srinagar-leh-road-trip-g1.jpg", "Sonamarg Kashmir", [
        "File:Sonamarg Valley.jpg",
        "File:Mountain Meadow in Sonamarg, Kashmir, India.jpg",
      ]),
      gallery("srinagar-leh-road-trip-g2.jpg", "Kargil Ladakh", [
        "File:Kargil Town Panorama.jpg",
        "File:A traditional-style building in Kargil, Ladakh 01.jpg",
      ]),
      gallery("srinagar-leh-road-trip-g3.jpg", "Zoji La Ladakh", [
        "File:Zoji La 1.jpg",
        "File:Zoji La - Jammu And Kasmir.jpg",
      ]),
      gallery("srinagar-leh-road-trip-g4.jpg", "Leh Palace Ladakh", [
        "File:Leh Palace - Leh - Ladakh - View from Shanti Stupa.jpg",
        "File:Leh Palace from Central Asian Museum.jpg",
      ]),
      day("srinagar-leh-road-trip-d1.jpg", 1, "Dal Lake Srinagar", [
        "File:Dal Lake, Srinagar, Jammu and Kashmir.jpg",
        "File:Floating market on Dal Lake, Srinagar 2.jpg",
      ]),
      day("srinagar-leh-road-trip-d2.jpg", 2, "Sonamarg Kashmir", [
        "File:Thajiwas Glacier Sonamarg.jpg",
        "File:Sonamarg 2.jpg",
      ]),
      day("srinagar-leh-road-trip-d3.jpg", 3, "Zoji La", [
        "File:Zoji La.jpg",
        "File:A view from Zoji La.jpg",
      ]),
      day("srinagar-leh-road-trip-d4.jpg", 4, "Kargil Ladakh", [
        "File:Kargil Town Panorama.jpg",
        "File:Munshi Aziz Bhat Museum in Kargil, Ladakh 02.jpg",
      ]),
      day("srinagar-leh-road-trip-d5.jpg", 5, "Leh Palace Ladakh", [
        "File:Leh Palace from Central Asian Museum.jpg",
        "File:Leh Palace - Leh - Ladakh - View from Shanti Stupa.jpg",
      ]),
      day("srinagar-leh-road-trip-d6.jpg", 6, "Leh Ladakh", [
        "File:Leh Palace - Prayer Rooom Statue (01).jpg",
        "File:Leh Palace from Central Asian Museum.jpg",
      ]),
    ],
  },
];

/** Wipe unattributed / incomplete sets so place-matched Commons replace them. */
function resetSlugMedia(slug: string) {
  if (!existsSync(tourDir)) return;
  const re = new RegExp(`^${slug}-(cover|g\\d+|d\\d+|ATTRIBUTION)\\.(jpe?g|webp|txt)$`, "i");
  for (const name of readdirSync(tourDir)) {
    if (!re.test(name)) continue;
    unlinkSync(path.join(tourDir, name));
    console.log(`reset ${name}`);
  }
}

async function main() {
  const only = process.argv.includes("--only")
    ? process.argv[process.argv.indexOf("--only") + 1]
    : null;
  const jobs = only ? JOBS.filter((j) => j.slug === only) : JOBS;
  if (!jobs.length) throw new Error(`No jobs matched ${only}`);

  const forceReset = process.argv.includes("--reset");
  for (const job of jobs) {
    const attr = path.join(tourDir, `${job.slug}-ATTRIBUTION.txt`);
    const galCount = readdirSync(tourDir).filter((n) =>
      new RegExp(`^${job.slug}-g\\d+\\.jpg$`).test(n),
    ).length;
    // Full wipe only with --reset, or first-time thin set with no attribution and <4 gallery
    if (forceReset || (!existsSync(attr) && galCount < 4)) {
      resetSlugMedia(job.slug);
    }
  }

  const shared = createBatchBlocklist("__kashmir-thin__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  for (const job of jobs) {
    try {
      await fetchAndWireTourImages(job, { sharedBlock: shared });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Media may still be on disk when tour row is missing in DB
      if (/Record to update not found|No record was found|need ≥4 gallery|Missing cover/i.test(msg)) {
        console.warn(`[${job.slug}] media saved; DB wire skipped/failed: ${msg}`);
        continue;
      }
      throw error;
    }
  }
  console.log("\nThin Kashmir gaps pass complete.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
