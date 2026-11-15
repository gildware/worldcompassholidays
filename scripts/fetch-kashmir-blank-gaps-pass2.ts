/**
 * Pass 2 — finish stalled Kashmir blank tours with verified place Commons titles.
 *
 *   npx tsx scripts/fetch-kashmir-blank-gaps-pass2.ts
 */
import { readdirSync, readFileSync } from "node:fs";
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
    slug: "winter-white-gulmarg",
    targets: [
      cover("winter-white-gulmarg-cover.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("winter-white-gulmarg-g1.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("winter-white-gulmarg-g2.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("winter-white-gulmarg-g3.jpg", "Nigeen Lake Srinagar", [
        "File:Nigeen Lake pano (edited).jpg",
        "File:Nagin Lake (Srinagar).jpg",
        "File:Sunrise in Nigeen Lake.jpg",
      ]),
      gallery("winter-white-gulmarg-g4.jpg", "Alpather Gulmarg", [
        "File:Alpather lake,Gulmarg.jpg",
        "File:Footprints in the snow on slopes of Mount Apharwat..JPG",
      ]),
      day("winter-white-gulmarg-d1.jpg", 1, "Char Chinar Dal Lake", [
        "File:Char Chinar at Dal Lake 3.jpg",
        "File:Char Chinar.jpg",
      ]),
      day("winter-white-gulmarg-d2.jpg", 2, "Gulmarg Kashmir", [
        "File:Abandoned Gulmarg Hotel.jpg",
        "File:Gulmarg.jpg",
      ]),
      day("winter-white-gulmarg-d3.jpg", 3, "Apharwat Gulmarg", [
        "File:Gondola to Apharwat, Gulmarg.jpg",
        "File:Slopes of Mount Apharwat..JPG",
      ]),
      day("winter-white-gulmarg-d4.jpg", 4, "Gulmarg Kashmir", [
        "File:Restaurants at Apharwat, Gulmarg.jpg",
        "File:Gulmarg.jpg",
      ]),
    ],
  },
  {
    slug: "kashmir-snow-tour",
    targets: [
      cover("kashmir-snow-tour-cover.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("kashmir-snow-tour-g1.jpg", "Char Chinar Dal Lake", ["File:Char Chinar- Dal Lake.jpg"]),
      gallery("kashmir-snow-tour-g2.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("kashmir-snow-tour-g3.jpg", "Pahalgam Kashmir", ["File:Pahalgam Valley.jpg"]),
      gallery("kashmir-snow-tour-g4.jpg", "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
      day("kashmir-snow-tour-d1.jpg", 1, "Nigeen Lake Srinagar", [
        "File:Shikara at Nigeen Lake.jpg",
        "File:Nigeen Lake Kashmir25102023.jpg",
      ]),
      day("kashmir-snow-tour-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      day("kashmir-snow-tour-d3.jpg", 3, "Pahalgam Kashmir", ["File:Pahalgam 1.jpg"]),
      day("kashmir-snow-tour-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg Valley.jpg"]),
      day("kashmir-snow-tour-d5.jpg", 5, "Char Chinar Dal Lake", [
        "File:Char Chinar at Dal Lake 1.jpg",
        "File:One of Char Chinars.jpg",
      ]),
    ],
  },
  {
    slug: "offbeat-meadows-doodhpathri-yusmarg",
    targets: [
      cover("offbeat-meadows-doodhpathri-yusmarg-cover.jpg", "Doodhpathri Kashmir", [
        "File:Doodhpathri southwest Jammu Kashmir India (5).jpg",
        "File:Doude pather meadows upper.jpg",
      ]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g1.jpg", "Doodhpathri Kashmir", [
        "File:Doude pather upper view.jpg",
        "File:Doodhpathri southwest Jammu Kashmir India (8).jpg",
      ]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g2.jpg", "Yusmarg Kashmir", [
        "File:Yousmarg.jpg",
        "File:Yusmarg, beautiful valley in Kashmir.jpg",
      ]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g3.jpg", "Doodhpathri Kashmir", [
        "File:Doude pather forests.jpg",
        "File:Doude pather waters.jpg",
      ]),
      gallery("offbeat-meadows-doodhpathri-yusmarg-g4.jpg", "Nilnag Yusmarg Kashmir", [
        "File:Nilnag Lake.jpg",
        "File:Yusmarg, beautiful valley in Kashmir.jpg",
      ]),
      day("offbeat-meadows-doodhpathri-yusmarg-d1.jpg", 1, "Nigeen Lake Srinagar", [
        "File:Chinars, Nigeen Lake - panoramio.jpg",
        "File:Full moon view of Nagin lake ,Srinagar ,Kashmir 08.jpg",
      ]),
      day("offbeat-meadows-doodhpathri-yusmarg-d2.jpg", 2, "Doodhpathri Kashmir", [
        "File:A bench with scenic view Doodhpathri southwest Jammu Kashmir India.jpg",
        "File:Doodhpathri southwest Jammu Kashmir India (4).jpg",
      ]),
      day("offbeat-meadows-doodhpathri-yusmarg-d3.jpg", 3, "Yusmarg Kashmir", [
        "File:Yousmarg.jpg",
      ]),
      day("offbeat-meadows-doodhpathri-yusmarg-d4.jpg", 4, "Char Chinar Dal Lake", [
        "File:Char Chinar at Dal Lake 2.jpg",
        "File:India - Srinagar - 019 - Char Chinar Island on Dal Lake.jpg",
      ]),
    ],
  },
  {
    slug: "gurez-valley-discovery",
    targets: [
      cover("gurez-valley-discovery-cover.jpg", "Gurez Kashmir", ["File:Habba Khatoon Pyramid Mountain.jpg"]),
      gallery("gurez-valley-discovery-g1.jpg", "Dawar Gurez", ["File:Dawar Bridge.jpg"]),
      gallery("gurez-valley-discovery-g2.jpg", "Dawar Gurez", [
        "File:Shina Cultural centre, Dawar.jpg",
        "File:House with Sloped roof.jpg",
      ]),
      gallery("gurez-valley-discovery-g3.jpg", "Gurez Kashmir", [
        "File:Abandoned wooden Log houses.jpg",
        "File:Grocery Shop.jpg",
      ]),
      gallery("gurez-valley-discovery-g4.jpg", "Habba Khatoon Gurez", [
        "File:Habba Khatoon Pyramid Mountain.jpg",
      ]),
      day("gurez-valley-discovery-d1.jpg", 1, "Nigeen Lake Srinagar", [
        "File:Nigeen Lake pano.jpg",
      ]),
      day("gurez-valley-discovery-d2.jpg", 2, "Dawar Gurez", ["File:Information board, Dawar.jpg"]),
      day("gurez-valley-discovery-d3.jpg", 3, "Dawar Gurez", ["File:Markazi Jama Masjid Neelum, Dawar.jpg"]),
      day("gurez-valley-discovery-d4.jpg", 4, "Gurez Kashmir", ["File:Wooden plank shop.jpg"]),
      day("gurez-valley-discovery-d5.jpg", 5, "Char Chinar Dal Lake", [
        "File:Char Chinar (viewed from Lake).jpg",
      ]),
    ],
  },
  {
    slug: "south-kashmir-springs",
    targets: [
      cover("south-kashmir-springs-cover.jpg", "Verinag Kashmir", [
        "File:Verinag Spring - Aerial view.JPG",
        "File:A view of Verinag (derivative).jpg",
      ]),
      gallery("south-kashmir-springs-g1.jpg", "Kokernag Kashmir", [
        "File:Kokernag garden stream.jpg",
        "File:Botanical garden kokernag 11.jpg",
      ]),
      gallery("south-kashmir-springs-g2.jpg", "Verinag Kashmir", [
        "File:Verinag Mughal Garden in Autumn.JPG",
        "File:Spring at Verinag and Mughal Arcade.JPG",
      ]),
      gallery("south-kashmir-springs-g3.jpg", "Aharbal Kashmir", [
        "File:Aharbal Waterfall, Kashmir.jpg",
        "File:Waterfall of Aharbal.JPG",
      ]),
      gallery("south-kashmir-springs-g4.jpg", "Aharbal Kashmir", [
        "File:Aharbal Falls (139323901).jpeg",
        "File:Sangam Aharbal, Kashmir.jpg",
      ]),
      day("south-kashmir-springs-d1.jpg", 1, "Char Chinar Dal Lake", [
        "File:One of Char Chinars.jpg",
      ]),
      day("south-kashmir-springs-d2.jpg", 2, "Verinag Kashmir", [
        "File:Verinag Garden.JPG",
        "File:Verinag Spiring.JPG",
      ]),
      day("south-kashmir-springs-d3.jpg", 3, "Kokernag Kashmir", [
        "File:Chinar in Botanical garden, Kokernag, Anantnag, J&K.jpg",
        "File:Flowers from the Kokernag botanical garden.jpg",
      ]),
      day("south-kashmir-springs-d4.jpg", 4, "Aharbal Kashmir", [
        "File:Aharbal waterfalls Kashmir.jpg",
        "File:Aharbal River.jpg",
      ]),
    ],
  },
  {
    slug: "warwan-valley-trek",
    targets: [
      cover("warwan-valley-trek-cover.jpg", "Warwan Valley Kashmir", [
        "File:Warwan valley.jpg",
        "File:Warwan.jpg",
        "File:Inshan warwan.jpg",
      ]),
      gallery("warwan-valley-trek-g1.jpg", "Warwan Kashmir", ["File:Warwan valley.jpg"]),
      gallery("warwan-valley-trek-g2.jpg", "Warwan Kashmir", ["File:Inshan warwan.jpg"]),
      gallery("warwan-valley-trek-g3.jpg", "Margan Warwan Kashmir", [
        "File:Margan top hidden waterfall.jpg",
        "File:Shilsar valley mountains.jpg",
      ]),
      gallery("warwan-valley-trek-g4.jpg", "Warwan Kashmir", ["File:Warwan.jpg"]),
      day("warwan-valley-trek-d1.jpg", 1, "Nigeen Lake Srinagar", [
        "File:Domestic duck at Dal lake.jpg",
      ]),
      day("warwan-valley-trek-d2.jpg", 2, "Warwan Kashmir", ["File:Warwan valley.jpg"]),
      day("warwan-valley-trek-d3.jpg", 3, "Warwan Kashmir", ["File:Inshan warwan.jpg"]),
      day("warwan-valley-trek-d4.jpg", 4, "Shilsar Kashmir", ["File:Shilsar valley mountains.jpg"]),
      day("warwan-valley-trek-d5.jpg", 5, "Margan Kashmir", ["File:Margan top hidden waterfall.jpg"]),
      day("warwan-valley-trek-d6.jpg", 6, "Warwan Kashmir", ["File:Warwan.jpg"]),
      day("warwan-valley-trek-d7.jpg", 7, "Warwan Valley Kashmir", ["File:Warwan valley.jpg"]),
      day("warwan-valley-trek-d8.jpg", 8, "Char Chinar Dal Lake", [
        "File:Char Chinar - panoramio.jpg",
      ]),
    ],
  },
  {
    slug: "family-album-kashmir",
    targets: [
      cover("family-album-kashmir-cover.jpg", "Char Chinar Dal Lake", [
        "File:Char Chinar.jpg",
        "File:Char Chinar at Dal Lake 3.jpg",
      ]),
      gallery("family-album-kashmir-g1.jpg", "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      gallery("family-album-kashmir-g2.jpg", "Pahalgam Kashmir", ["File:Pahalgam Valley.jpg"]),
      gallery("family-album-kashmir-g3.jpg", "Sonamarg Kashmir", ["File:Sonamarg.jpg"]),
      gallery("family-album-kashmir-g4.jpg", "Nigeen Lake Srinagar", [
        "File:Shikara at Nigeen Lake.jpg",
      ]),
      day("family-album-kashmir-d1.jpg", 1, "Nigeen Lake Srinagar", [
        "File:Sunrise in Nigeen Lake.jpg",
      ]),
      day("family-album-kashmir-d2.jpg", 2, "Gulmarg Kashmir", ["File:Gulmarg.jpg"]),
      day("family-album-kashmir-d3.jpg", 3, "Pahalgam Kashmir", ["File:Betaab Valley.jpg"]),
      day("family-album-kashmir-d4.jpg", 4, "Sonamarg Kashmir", ["File:Sonamarg Valley.jpg"]),
      day("family-album-kashmir-d5.jpg", 5, "Char Chinar Dal Lake", [
        "File:Char Chinar- Dal Lake.jpg",
      ]),
    ],
  },
  {
    slug: "wular-gurez-lolab",
    targets: [
      cover("wular-gurez-lolab-cover.jpg", "Wular Lake Kashmir", [
        "File:Wular scenic.jpg",
        "File:Wular Lake 1.jpg",
      ]),
      gallery("wular-gurez-lolab-g1.jpg", "Wular Lake Kashmir", [
        "File:Wular Lake – geese & cows.jpg",
        "File:World famous Wular Lake in rain.jpg",
      ]),
      gallery("wular-gurez-lolab-g2.jpg", "Wular Lake Kashmir", ["File:Wular Lake1.jpg"]),
      gallery("wular-gurez-lolab-g3.jpg", "Dawar Gurez", ["File:Dawar Bridge.jpg"]),
      gallery("wular-gurez-lolab-g4.jpg", "Habba Khatoon Gurez", [
        "File:Habba Khatoon Pyramid Mountain.jpg",
      ]),
      day("wular-gurez-lolab-d1.jpg", 1, "Nigeen Lake Srinagar", [
        "File:Nagin Lake (Srinagar).jpg",
      ]),
      day("wular-gurez-lolab-d2.jpg", 2, "Wular Lake Kashmir", [
        "File:Wular lake sopore.jpeg",
        "File:A marine commando at wular lake.jpg",
      ]),
      day("wular-gurez-lolab-d3.jpg", 3, "Dawar Gurez", ["File:House with Sloped roof.jpg"]),
      day("wular-gurez-lolab-d4.jpg", 4, "Dawar Gurez", ["File:Shina Cultural centre, Dawar.jpg"]),
      day("wular-gurez-lolab-d5.jpg", 5, "Char Chinar Dal Lake", [
        "File:India - Srinagar - 019 - Char Chinar Island on Dal Lake.jpg",
      ]),
    ],
  },
];

async function main() {
  const shared = createBatchBlocklist("__kashmir-pass2__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }
  for (const job of JOBS) {
    try {
      await fetchAndWireTourImages(job, { sharedBlock: shared });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[${job.slug}] ${msg.split("\n")[0]}`);
    }
  }
  console.log("\nPass 2 finished.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
