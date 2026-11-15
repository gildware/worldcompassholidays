/**
 * Place-matched Commons media for Kashmir tours that had NO images.
 * Cover + 4 gallery + day slots. No local/stock fallbacks.
 *
 *   npx tsx scripts/fetch-kashmir-blank-gaps.ts
 *   npx tsx scripts/fetch-kashmir-blank-gaps.ts --only doodhpathri-yusmarg-meadows
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
    slug: "best-of-kashmir-sonamarg",
    targets: [
      cover("best-of-kashmir-sonamarg-cover.jpg", "Sonamarg Kashmir", [
        "File:Sonamarg.jpg",
        "File:Mountain Meadow in Sonamarg, Kashmir, India.jpg",
      ]),
      gallery("best-of-kashmir-sonamarg-g1.jpg", "Dal Lake Srinagar", [
        "File:Dal Lake, Srinagar, Jammu and Kashmir.jpg",
      ]),
      gallery("best-of-kashmir-sonamarg-g2.jpg", "Gulmarg Kashmir", [
        "File:Gulmarg.jpg",
        "File:Gulmarg Meadows.jpg",
      ]),
      gallery("best-of-kashmir-sonamarg-g3.jpg", "Pahalgam Kashmir", [
        "File:Pahalgam Valley.jpg",
        "File:Pahalgam 1.jpg",
      ]),
      gallery("best-of-kashmir-sonamarg-g4.jpg", "Sonamarg Kashmir", [
        "File:Sonamarg Valley.jpg",
        "File:Thajiwas Glacier Sonamarg.jpg",
      ]),
      day("best-of-kashmir-sonamarg-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      day("best-of-kashmir-sonamarg-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg Gondola.jpg", "File:Gulmarg.jpg"]),
      day("best-of-kashmir-sonamarg-d3.jpg", 3, "Pahalgam Kashmir", ["File:Betaab Valley.jpg"]),
      day("best-of-kashmir-sonamarg-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg 2.jpg"]),
      day("best-of-kashmir-sonamarg-d5.jpg", 5, "Sonamarg Kashmir", ["File:Thajiwas Glacier Sonamarg.jpg"]),
      day("best-of-kashmir-sonamarg-d6.jpg", 6, "Dal Lake Srinagar", ["File:Floating market on Dal Lake, Srinagar 2.jpg"]),
    ],
  },
  {
    slug: "budget-express-kashmir",
    targets: [
      cover("budget-express-kashmir-cover.jpg", "Dal Lake Srinagar", [
        "File:Dal Lake Srinagar.jpg",
        "File:Dal Lake, Srinagar 2.jpg",
      ]),
      gallery("budget-express-kashmir-g1.jpg", "Mughal Gardens Srinagar", [
        "File:Nishat Bagh.jpg",
        "File:Shalimar Bagh Srinagar.jpg",
      ]),
      gallery("budget-express-kashmir-g2.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("budget-express-kashmir-g3.jpg", "Pahalgam Kashmir", ["File:Pahalgam Valley.jpg"]),
      gallery("budget-express-kashmir-g4.jpg", "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
      day("budget-express-kashmir-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 4.jpg"]),
      day("budget-express-kashmir-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg Meadows.jpg", "File:Gulmarg.jpg"]),
      day("budget-express-kashmir-d3.jpg", 3, "Pahalgam Kashmir", ["File:Lidder at Pahalgam.jpg"]),
    ],
  },
  {
    slug: "valley-day-trip-circuit",
    targets: [
      cover("valley-day-trip-circuit-cover.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 6.jpg"]),
      gallery("valley-day-trip-circuit-g1.jpg", "Nishat Bagh Srinagar", ["File:Nishat Bagh.jpg"]),
      gallery("valley-day-trip-circuit-g2.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("valley-day-trip-circuit-g3.jpg", "Pahalgam Kashmir", ["File:Pahalgam 1.jpg"]),
      gallery("valley-day-trip-circuit-g4.jpg", "Sonamarg Kashmir", ["File:Sonamarg Valley.jpg"]),
      day("valley-day-trip-circuit-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      day("valley-day-trip-circuit-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      day("valley-day-trip-circuit-d3.jpg", 3, "Pahalgam Kashmir", ["File:Betaab Valley.jpg"]),
      day("valley-day-trip-circuit-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
    ],
  },
  {
    slug: "romantic-kashmir-honeymoon",
    targets: [
      cover("romantic-kashmir-honeymoon-cover.jpg", "Dal Lake houseboat Srinagar", [
        "File:Houseboat on Dal Lake.jpg",
        "File:Dal Lake houseboats.jpg",
      ]),
      gallery("romantic-kashmir-honeymoon-g1.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar, Jammu and Kashmir.jpg"]),
      gallery("romantic-kashmir-honeymoon-g2.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("romantic-kashmir-honeymoon-g3.jpg", "Pahalgam Kashmir", ["File:Pahalgam Valley.jpg"]),
      gallery("romantic-kashmir-honeymoon-g4.jpg", "Shikara Dal Lake", ["File:Shikara on Dal Lake.jpg", "File:Shikara Dal Lake.jpg"]),
      day("romantic-kashmir-honeymoon-d1.jpg", 1, "Dal Lake houseboat", ["File:Houseboats Dal Lake.jpg", "File:Dal Lake, Srinagar 2.jpg"]),
      day("romantic-kashmir-honeymoon-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg Meadows.jpg", "File:Gulmarg.jpg"]),
      day("romantic-kashmir-honeymoon-d3.jpg", 3, "Pahalgam Kashmir", ["File:Lidder at Pahalgam.jpg"]),
      day("romantic-kashmir-honeymoon-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
      day("romantic-kashmir-honeymoon-d5.jpg", 5, "Dal Lake Srinagar", ["File:Floating market on Dal Lake, Srinagar 2.jpg"]),
    ],
  },
  {
    slug: "luxury-houseboat-escape",
    targets: [
      cover("luxury-houseboat-escape-cover.jpg", "Dal Lake houseboat Srinagar", [
        "File:Houseboat on Dal Lake.jpg",
        "File:Dal Lake houseboats.jpg",
      ]),
      gallery("luxury-houseboat-escape-g1.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      gallery("luxury-houseboat-escape-g2.jpg", "Shikara Dal Lake", ["File:Shikara on Dal Lake.jpg"]),
      gallery("luxury-houseboat-escape-g3.jpg", "Nishat Bagh Srinagar", ["File:Nishat Bagh.jpg"]),
      gallery("luxury-houseboat-escape-g4.jpg", "Shalimar Bagh Srinagar", ["File:Shalimar Bagh Srinagar.jpg", "File:Shalimar Bagh.jpg"]),
      day("luxury-houseboat-escape-d1.jpg", 1, "Dal Lake houseboat", ["File:Dal Lake, Srinagar 4.jpg"]),
      day("luxury-houseboat-escape-d2.jpg", 2, "Mughal Gardens Srinagar", ["File:Nishat Bagh.jpg"]),
      day("luxury-houseboat-escape-d3.jpg", 3, "Dal Lake Srinagar", ["File:Floating market on Dal Lake, Srinagar 2.jpg"]),
    ],
  },
  {
    slug: "winter-white-gulmarg",
    targets: [
      cover("winter-white-gulmarg-cover.jpg", "Gulmarg snow Kashmir", [
        "File:Gulmarg in winter.jpg",
        "File:Gulmarg snow.jpg",
        "File:Gulmarg.jpg",
      ]),
      gallery("winter-white-gulmarg-g1.jpg", "Gulmarg Kashmir snow", ["File:Gulmarg Meadows.jpg", "File:Gulmarg.jpg"]),
      gallery("winter-white-gulmarg-g2.jpg", "Gulmarg Gondola", ["File:Gulmarg Gondola.jpg", "File:Gondola Gulmarg.jpg"]),
      gallery("winter-white-gulmarg-g3.jpg", "Dal Lake winter Srinagar", ["File:Dal Lake, Srinagar 2.jpg"]),
      gallery("winter-white-gulmarg-g4.jpg", "Apharwat Gulmarg", ["File:Alpather lake,Gulmarg.jpg", "File:Gulmarg.jpg"]),
      day("winter-white-gulmarg-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 6.jpg"]),
      day("winter-white-gulmarg-d2.jpg", 2, "Gulmarg snow", ["File:Gulmarg.jpg"]),
      day("winter-white-gulmarg-d3.jpg", 3, "Gulmarg Gondola", ["File:Gondola to Apharwat, Gulmarg.jpg", "File:Gulmarg.jpg"]),
      day("winter-white-gulmarg-d4.jpg", 4, "Gulmarg Kashmir", ["File:Gulmarg Meadows.jpg", "File:Gulmarg.jpg"]),
    ],
  },
  {
    slug: "kashmir-snow-tour",
    targets: [
      cover("kashmir-snow-tour-cover.jpg", "Gulmarg snow Kashmir", ["File:Gulmarg.jpg"]),
      gallery("kashmir-snow-tour-g1.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar, Jammu and Kashmir.jpg"]),
      gallery("kashmir-snow-tour-g2.jpg", "Gulmarg Kashmir", ["File:Gulmarg Meadows.jpg", "File:Gulmarg.jpg"]),
      gallery("kashmir-snow-tour-g3.jpg", "Pahalgam Kashmir", ["File:Pahalgam Valley.jpg"]),
      gallery("kashmir-snow-tour-g4.jpg", "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
      day("kashmir-snow-tour-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      day("kashmir-snow-tour-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      day("kashmir-snow-tour-d3.jpg", 3, "Pahalgam Kashmir", ["File:Pahalgam 1.jpg"]),
      day("kashmir-snow-tour-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg Valley.jpg"]),
      day("kashmir-snow-tour-d5.jpg", 5, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 4.jpg"]),
    ],
  },
  {
    slug: "offbeat-meadows-doodhpathri-yusmarg",
    targets: [
      cover("offbeat-meadows-doodhpathri-yusmarg-cover.jpg", "Doodhpathri Kashmir", [
        "File:Doodhpathri.jpg",
        "File:Doodhpathri meadows.jpg",
      ]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g1.jpg", "Doodhpathri Kashmir", ["File:Doodhpathri.jpg"]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g2.jpg", "Yusmarg Kashmir", ["File:Yusmarg.jpg", "File:Yousmarg.jpg"]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g3.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 2.jpg"]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g4.jpg", "Yusmarg Kashmir meadow", ["File:Yusmarg Kashmir.jpg", "File:Yusmarg.jpg"]),
      day("offbeat-meadows-doodhpathri-yusmarg-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 6.jpg"]),
      day("offbeat-meadows-doodhpathri-yusmarg-d2.jpg", 2, "Doodhpathri Kashmir", ["File:Doodhpathri.jpg"]),
      day("offbeat-meadows-doodhpathri-yusmarg-d3.jpg", 3, "Yusmarg Kashmir", ["File:Yusmarg.jpg", "File:Yousmarg.jpg"]),
      day("offbeat-meadows-doodhpathri-yusmarg-d4.jpg", 4, "Dal Lake Srinagar", ["File:Floating market on Dal Lake, Srinagar 2.jpg"]),
    ],
  },
  {
    slug: "gurez-valley-discovery",
    targets: [
      cover("gurez-valley-discovery-cover.jpg", "Gurez Valley Kashmir", [
        "File:Gurez Valley.jpg",
        "File:Gurez.jpg",
        "File:Dawar Gurez.jpg",
      ]),
      gallery("gurez-valley-discovery-g1.jpg", "Gurez Kashmir", ["File:Gurez Valley.jpg", "File:Gurez.jpg"]),
      gallery("gurez-valley-discovery-g2.jpg", "Razdan Pass Kashmir", ["File:Razdan Pass.jpg", "File:Gurez.jpg"]),
      gallery("gurez-valley-discovery-g3.jpg", "Kishanganga Gurez", ["File:Kishanganga River.jpg", "File:Gurez Valley.jpg"]),
      gallery("gurez-valley-discovery-g4.jpg", "Habba Khatoon Gurez", ["File:Habba Khatoon peak.jpg", "File:Gurez.jpg"]),
      day("gurez-valley-discovery-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      day("gurez-valley-discovery-d2.jpg", 2, "Gurez Valley", ["File:Gurez Valley.jpg", "File:Gurez.jpg"]),
      day("gurez-valley-discovery-d3.jpg", 3, "Gurez Kashmir", ["File:Gurez.jpg"]),
      day("gurez-valley-discovery-d4.jpg", 4, "Gurez Valley", ["File:Gurez Valley.jpg"]),
      day("gurez-valley-discovery-d5.jpg", 5, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 4.jpg"]),
    ],
  },
  {
    slug: "south-kashmir-springs",
    targets: [
      cover("south-kashmir-springs-cover.jpg", "Verinag Kashmir", [
        "File:Verinag.jpg",
        "File:Verinag Spring.jpg",
        "File:Verinag Mughal garden.jpg",
      ]),
      gallery("south-kashmir-springs-g1.jpg", "Kokernag Kashmir", ["File:Kokernag.jpg", "File:Kokernag gardens.jpg"]),
      gallery("south-kashmir-springs-g2.jpg", "Verinag Kashmir", ["File:Verinag.jpg"]),
      gallery("south-kashmir-springs-g3.jpg", "Aharbal Kashmir", ["File:Aharbal Falls.jpg", "File:Aharbal.jpg"]),
      gallery("south-kashmir-springs-g4.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 2.jpg"]),
      day("south-kashmir-springs-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 6.jpg"]),
      day("south-kashmir-springs-d2.jpg", 2, "Verinag Kashmir", ["File:Verinag.jpg"]),
      day("south-kashmir-springs-d3.jpg", 3, "Kokernag Kashmir", ["File:Kokernag.jpg"]),
      day("south-kashmir-springs-d4.jpg", 4, "Aharbal Kashmir", ["File:Aharbal Falls.jpg", "File:Aharbal.jpg"]),
    ],
  },
  {
    slug: "warwan-valley-trek",
    targets: [
      cover("warwan-valley-trek-cover.jpg", "Warwan Valley Kashmir", [
        "File:Warwan Valley.jpg",
        "File:Warwan.jpg",
      ]),
      gallery("warwan-valley-trek-g1.jpg", "Warwan Kashmir", ["File:Warwan Valley.jpg"]),
      gallery("warwan-valley-trek-g2.jpg", "Kashmir alpine meadow trek", ["File:Group Trekking near Gangabal.jpg"]),
      gallery("warwan-valley-trek-g3.jpg", "Naranag Kashmir", ["File:Naranag Temple.jpg"]),
      gallery("warwan-valley-trek-g4.jpg", "Gangabal Lake Kashmir", ["File:Gangabal Lake.jpg"]),
      day("warwan-valley-trek-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      day("warwan-valley-trek-d2.jpg", 2, "Naranag Kashmir", ["File:Naranag.jpg"]),
      day("warwan-valley-trek-d3.jpg", 3, "Kashmir alpine trek", ["File:Group Trekking near Gangabal.jpg"]),
      day("warwan-valley-trek-d4.jpg", 4, "Gangabal Lake Kashmir", ["File:Gangabal Lake.jpg"]),
      day("warwan-valley-trek-d5.jpg", 5, "Nundkol Lake Kashmir", ["File:Nundkol and Gangabal Lakes of Kashmir.jpg"]),
      day("warwan-valley-trek-d6.jpg", 6, "Kashmir meadow trek", ["File:Mountain Meadow in Sonamarg, Kashmir, India.jpg"]),
      day("warwan-valley-trek-d7.jpg", 7, "Naranag Kashmir", ["File:Ancient Temple, Naranag, Jammu and Kashmir, India.jpg"]),
      day("warwan-valley-trek-d8.jpg", 8, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 4.jpg"]),
    ],
  },
  {
    slug: "family-album-kashmir",
    targets: [
      cover("family-album-kashmir-cover.jpg", "Dal Lake Srinagar", ["File:Dal Lake, Srinagar, Jammu and Kashmir.jpg"]),
      gallery("family-album-kashmir-g1.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("family-album-kashmir-g2.jpg", "Pahalgam Kashmir", ["File:Pahalgam Valley.jpg"]),
      gallery("family-album-kashmir-g3.jpg", "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
      gallery("family-album-kashmir-g4.jpg", "Shikara Dal Lake", ["File:Shikara on Dal Lake.jpg", "File:Dal Lake, Srinagar 2.jpg"]),
      day("family-album-kashmir-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 6.jpg"]),
      day("family-album-kashmir-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg Meadows.jpg", "File:Gulmarg.jpg"]),
      day("family-album-kashmir-d3.jpg", 3, "Pahalgam Kashmir", ["File:Betaab Valley.jpg"]),
      day("family-album-kashmir-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg Valley.jpg"]),
      day("family-album-kashmir-d5.jpg", 5, "Dal Lake Srinagar", ["File:Floating market on Dal Lake, Srinagar 2.jpg"]),
    ],
  },
  {
    slug: "wular-gurez-lolab",
    targets: [
      cover("wular-gurez-lolab-cover.jpg", "Wular Lake Kashmir", [
        "File:Wular Lake.jpg",
        "File:Wular lake Kashmir.jpg",
      ]),
      gallery("wular-gurez-lolab-g1.jpg", "Gurez Valley Kashmir", ["File:Gurez Valley.jpg", "File:Gurez.jpg"]),
      gallery("wular-gurez-lolab-g2.jpg", "Wular Lake Kashmir", ["File:Wular Lake.jpg"]),
      gallery("wular-gurez-lolab-g3.jpg", "Lolab Valley Kashmir", ["File:Lolab Valley.jpg", "File:Lolab.jpg"]),
      gallery("wular-gurez-lolab-g4.jpg", "Bandipora Kashmir", ["File:Bandipora.jpg", "File:Wular Lake.jpg"]),
      day("wular-gurez-lolab-d1.jpg", 1, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 3.jpg"]),
      day("wular-gurez-lolab-d2.jpg", 2, "Wular Lake Kashmir", ["File:Wular Lake.jpg"]),
      day("wular-gurez-lolab-d3.jpg", 3, "Gurez Valley", ["File:Gurez.jpg", "File:Gurez Valley.jpg"]),
      day("wular-gurez-lolab-d4.jpg", 4, "Lolab Valley Kashmir", ["File:Lolab Valley.jpg", "File:Lolab.jpg"]),
      day("wular-gurez-lolab-d5.jpg", 5, "Dal Lake Srinagar", ["File:Dal Lake, Srinagar 4.jpg"]),
    ],
  },
];

function resetSlugMedia(slug: string) {
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
  const forceReset = process.argv.includes("--reset");
  const jobs = only ? JOBS.filter((j) => j.slug === only) : JOBS;
  if (!jobs.length) throw new Error(`No jobs matched ${only}`);

  for (const job of jobs) {
    const attr = path.join(tourDir, `${job.slug}-ATTRIBUTION.txt`);
    const gal = readdirSync(tourDir).filter((n) =>
      new RegExp(`^${job.slug}-g\\d+\\.jpg$`).test(n),
    ).length;
    if (forceReset || (!existsSync(attr) && gal < 4)) resetSlugMedia(job.slug);
  }

  const shared = createBatchBlocklist("__kashmir-blank__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  for (const job of jobs) {
    try {
      await fetchAndWireTourImages(job, { sharedBlock: shared });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (/No record was found|Record to update not found|need ≥4 gallery|Missing cover/i.test(msg)) {
        console.warn(`[${job.slug}] media ok; DB skipped: ${msg.split("\n")[0]}`);
        continue;
      }
      console.error(`[${job.slug}] FAILED: ${msg}`);
      // continue other jobs
    }
  }
  console.log("\nKashmir blank-gaps pass finished.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
