/**
 * Replace mismatched batch-1 slots with curated place-matched Commons files.
 *
 *   npx tsx scripts/fix-batch1-place-images.ts
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
  type ImageTarget,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

const FIXES: TourImageJob[] = [
  {
    slug: "golden-temple-amritsar-darshan",
    targets: [
      day("golden-temple-amritsar-darshan-d3.jpg", 3, "Amritsar Punjab old city", [
        "File:Facade - Old City - Amritsar - Punjab - India (12675492005).jpg",
        "File:Facades - Old City - Amritsar - Punjab - India (12675604103).jpg",
        "File:Golden Temple -Amritsar Punjab India.jpg",
      ]),
    ],
  },
  {
    slug: "bir-billing-paragliding-tour",
    targets: [
      day("bir-billing-paragliding-tour-d2.jpg", 2, "Bir Billing paragliding Himachal", [
        "File:Paragliding in Bir-Billing.jpg",
        "File:Paragliding in Bir-Billing (41721).jpg",
        "File:Gaggle - Paragliding in Bir, Himachal Pradesh.jpg",
        "File:Paraglider under paragliding takeoff at Bir-Billing.JPG",
        "File:BIR BILLING PARAGLIDING.jpg",
      ]),
    ],
  },
  {
    slug: "bandhavgarh-tiger-safari",
    targets: [
      gallery("bandhavgarh-tiger-safari-g3.jpg", "Bandhavgarh tiger Madhya Pradesh", [
        "File:Bengal tiger in Bandhavgarh National Park 02.jpg",
        "File:Bengal tiger (Panthera tigris tigris), Bandhavgarh National Park.jpg",
        "File:Bengal tiger in Bandhavgarh National Park 01.jpg",
        "File:Bandhavgarh Tiger Habitat.jpg",
      ]),
      day("bandhavgarh-tiger-safari-d2.jpg", 2, "Bandhavgarh tiger safari", [
        "File:Tigress of Bandhavgarh National Park, India, 25 February 2025.jpg",
        "File:Bengal tiger in Bandhavgarh National Park May 2026 by Tisha Mukherjee 54.jpg",
        "File:Chital in Bandhavgarh National Park May 2026 by Tisha Mukherjee 04.jpg",
      ]),
      day("bandhavgarh-tiger-safari-d3.jpg", 3, "Bandhavgarh National Park Madhya Pradesh", [
        "File:1 Bandhavgarh National Park Madhya Pradesh India.jpg",
        "File:Indian roller - Bandhavgarh.jpg",
        "File:Spotted deer in Bandhavgarh National Park 07.jpg",
      ]),
    ],
  },
  {
    slug: "alpather-lake-trek",
    targets: [
      day("alpather-lake-trek-d2.jpg", 2, "Alpather Lake Gulmarg Apharwat", [
        "File:Alpather lake,Gulmarg.jpg",
        "File:Gondola to Apharwat, Gulmarg.jpg",
        "File:Footprints in the snow on slopes of Mount Apharwat..JPG",
        "File:Slopes of Mount Apharwat..JPG",
        "File:Restaurants at Apharwat, Gulmarg.jpg",
      ]),
    ],
  },
];

function keepStub(file: string, dayNumber?: number): ImageTarget {
  const isCover = file.endsWith("-cover.jpg");
  const isDay = /-d\d+\.jpg$/.test(file);
  return {
    file,
    dayNumber,
    place: "keep",
    titles: [],
    w: isCover ? 1920 : isDay ? 1400 : 1600,
    h: isCover ? 1080 : isDay ? 933 : 1067,
    skipSearch: true,
  };
}

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const shared = createBatchBlocklist("__fix__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  for (const fix of FIXES) {
    const existing: ImageTarget[] = [];
    for (const name of readdirSync(tourDir)) {
      if (!name.startsWith(`${fix.slug}-`) || !name.endsWith(".jpg")) continue;
      if (fix.targets.some((t) => t.file === name)) continue;
      const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
      existing.push(keepStub(name, dayNumber));
    }
    const job: TourImageJob = {
      slug: fix.slug,
      targets: [
        ...existing,
        ...fix.targets.map((t) => ({ ...t, skipSearch: true })),
      ],
    };
    console.log(`Fixing ${fix.slug}: fetch ${fix.targets.map((t) => t.file).join(", ")}`);
    await fetchAndWireTourImages(job, { sharedBlock: shared });
  }
  console.log("Fixed mismatched batch-1 slots");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
