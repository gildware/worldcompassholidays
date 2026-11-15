/**
 * Place-matched Commons for the last 11 Kashmir title gaps.
 * Titles uniquely assigned from unused Commons pool.
 *
 *   npx tsx scripts/fetch-kashmir-remaining-11.ts
 *   npx tsx scripts/fetch-kashmir-remaining-11.ts --only bangus
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
    slug: "premium-relaxed-kashmir",
    targets: [
      cover("premium-relaxed-kashmir-cover.jpg", "Gulmarg Kashmir", [
        "File:Gulmarg hill Station.jpg",
      ]),
      gallery("premium-relaxed-kashmir-g1.jpg", "Gulmarg Gondola", [
        "File:Kangdoor Ski slopes of Gulmarg.JPG",
      ]),
      gallery("premium-relaxed-kashmir-g2.jpg", "Pahalgam Lidder", [
        "File:The Lidder, Pahalgam.jpg",
      ]),
      gallery("premium-relaxed-kashmir-g3.jpg", "Nigeen Srinagar", [
        "File:Nigeen Lake Kashmir25102023.jpg",
      ]),
      gallery("premium-relaxed-kashmir-g4.jpg", "Betaab Valley", [
        "File:Betaab Valley, Pehalgam, Kashmir.jpg",
      ]),
      day("premium-relaxed-kashmir-d1.jpg", 1, "Nishat Bagh", [
        "File:Nishat Bagh.JPG",
      ]),
      day("premium-relaxed-kashmir-d2.jpg", 2, "Shalimar Bagh", [
        "File:Trees in Shalimar Bagh (Srinagar).jpg",
      ]),
      day("premium-relaxed-kashmir-d3.jpg", 3, "Gulmarg Gondola", [
        "File:Gulmarg-Gondala.JPG",
      ]),
      day("premium-relaxed-kashmir-d4.jpg", 4, "Kongdoori Gulmarg", [
        "File:Iism gulmarg.JPG",
      ]),
      day("premium-relaxed-kashmir-d5.jpg", 5, "Pahalgam Lidder", [
        "File:River Lidder, Pahalgam, Kashmir.jpg",
      ]),
      day("premium-relaxed-kashmir-d6.jpg", 6, "Aru Valley", [
        "File:Aruvillage.jpg",
      ]),
      day("premium-relaxed-kashmir-d7.jpg", 7, "Dal Lake shikara", [
        "File:Shikara, Dal Lake.jpg",
      ]),
    ],
  },
  {
    slug: "grand-kashmir-circuit",
    targets: [
      cover("grand-kashmir-circuit-cover.jpg", "Bangus Valley", [
        "File:Bangus Valley Kahmir.jpg",
      ]),
      gallery("grand-kashmir-circuit-g1.jpg", "Gulmarg Gondola", [
        "File:Skiers on the ski-lift..JPG",
      ]),
      gallery("grand-kashmir-circuit-g2.jpg", "Pahalgam Lidder", [
        "File:Lidder river in pahalgam.jpg",
      ]),
      gallery("grand-kashmir-circuit-g3.jpg", "Sonamarg Thajiwas", [
        "File:Thajiwas Glacier, Sonamarg (14550895976).jpg",
      ]),
      gallery("grand-kashmir-circuit-g4.jpg", "Gurez Habba", [
        "File:Gurez Valley 03.jpg",
      ]),
      day("grand-kashmir-circuit-d1.jpg", 1, "Nishat Bagh", [
        "File:Srinagar - Nishat Gardens 12.jpg",
      ]),
      day("grand-kashmir-circuit-d2.jpg", 2, "Shalimar Bagh", [
        "File:Shalimar gardens.jpg",
      ]),
      day("grand-kashmir-circuit-d3.jpg", 3, "Dal Lake shikara", [
        "File:Shikara ride in Dal Lake in Srinagar.jpg",
      ]),
      day("grand-kashmir-circuit-d4.jpg", 4, "Gulmarg ski", [
        "File:Ski race player performing at the 5th National Winter Games at Gulmarg, Jammu & Kashmir on February 22, 2008.jpg",
      ]),
      day("grand-kashmir-circuit-d5.jpg", 5, "Gulmarg Gondola", [
        "File:GulmargGondola.jpg",
      ]),
      day("grand-kashmir-circuit-d6.jpg", 6, "Pahalgam Lidder", [
        "File:Lidder river.jpg",
      ]),
      day("grand-kashmir-circuit-d7.jpg", 7, "Betaab Valley", [
        "File:Betaab Valley Pahalgam Anantnag.jpg",
      ]),
      day("grand-kashmir-circuit-d8.jpg", 8, "Sonamarg Kashmir", [
        "File:Sonamarg 8.jpg",
      ]),
      day("grand-kashmir-circuit-d9.jpg", 9, "Gurez Valley", [
        "File:Gurez Valley 10.jpg",
      ]),
      day("grand-kashmir-circuit-d10.jpg", 10, "Gurez Valley", [
        "File:Gurez Valley 08.jpg",
      ]),
      day("grand-kashmir-circuit-d11.jpg", 11, "Nigeen Srinagar", [
        "File:Boathouse view of Nagin lake ,Srinagar,Kashmir.jpg",
      ]),
      day("grand-kashmir-circuit-d12.jpg", 12, "Dal Lake shikara", [
        "File:Dal LakeVR.jpg",
      ]),
    ],
  },
  {
    slug: "classic-doodhpathri-yusmarg-addon",
    targets: [
      cover("classic-doodhpathri-yusmarg-addon-cover.jpg", "Doodhpathri Kashmir", [
        "File:Doudpather upper meadows.jpg",
      ]),
      gallery("classic-doodhpathri-yusmarg-addon-g1.jpg", "Doodhpathri Kashmir", [
        "File:Doudepather upper meadows.jpg",
      ]),
      gallery("classic-doodhpathri-yusmarg-addon-g2.jpg", "Aharbal Kashmir", [
        "File:Aharbal Waterfall, Kashmir.jpg",
      ]),
      gallery("classic-doodhpathri-yusmarg-addon-g3.jpg", "Kokernag Kashmir", [
        "File:Flowers from the Kokernag botanical garden.jpg",
      ]),
      gallery("classic-doodhpathri-yusmarg-addon-g4.jpg", "Gulmarg Gondola", [
        "File:GULMARGWINTERS.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d1.jpg", 1, "Dal Lake shikara", [
        "File:Dal lake and shikara boats.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d2.jpg", 2, "Gulmarg Kashmir", [
        "File:Tourists at the Gulmarg Gondola station in 2013.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d3.jpg", 3, "Pahalgam Lidder", [
        "File:Hotel by the Lidder river, Pahalgam 2012.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d4.jpg", 4, "Aru Valley", [
        "File:Aru Valley, Jammu & Kashmir.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d5.jpg", 5, "Doodhpathri Kashmir", [
        "File:Doude pather meadows upper.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d6.jpg", 6, "Aharbal Kashmir", [
        "File:Aharbal falls, a closer view.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d7.jpg", 7, "Sonamarg Thajiwas", [
        "File:Sonamarg 5.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d8.jpg", 8, "Kokernag Kashmir", [
        "File:Kokernag garden stream.jpg",
      ]),
      day("classic-doodhpathri-yusmarg-addon-d9.jpg", 9, "Nigeen Srinagar", [
        "File:Sunrse view of Nagin lake ,Srinagar,,Kashmir.jpg",
      ]),
    ],
  },
  {
    slug: "winter-honeymoon-circuit",
    targets: [
      cover("winter-honeymoon-circuit-cover.jpg", "Gulmarg ski", [
        "File:Gondola or Cable car at Gulmarg, Kashmir, India.jpg",
      ]),
      gallery("winter-honeymoon-circuit-g1.jpg", "Nigeen Srinagar", [
        "File:Full moon view at Nagin lake ,stinagar ,Kashmir 05.jpg",
      ]),
      gallery("winter-honeymoon-circuit-g2.jpg", "Gulmarg Gondola", [
        "File:Gulmarg Gondola (ropeway or cable transport) station in Jammu and Kashmir.jpg",
      ]),
      gallery("winter-honeymoon-circuit-g3.jpg", "Pahalgam Lidder", [
        "File:Pahalgam River near Lidder Valley.jpg",
      ]),
      gallery("winter-honeymoon-circuit-g4.jpg", "Sonamarg Kashmir", [
        "File:Sonamarg 6.jpg",
      ]),
      day("winter-honeymoon-circuit-d1.jpg", 1, "Nishat Bagh", [
        "File:Nishat Garden and around, Srinagar - vrvvkbjk2k23iph (21).jpg",
      ]),
      day("winter-honeymoon-circuit-d2.jpg", 2, "Gulmarg Gondola", [
        "File:Gulmarg Gondola Seen108.jpg",
      ]),
      day("winter-honeymoon-circuit-d3.jpg", 3, "Apharwat Gulmarg", [
        "File:Gulmarg Gondola Seen116.jpg",
      ]),
      day("winter-honeymoon-circuit-d4.jpg", 4, "Betaab Valley", [
        "File:Betaab Valley, Pahalgam, Kashmir.jpg",
      ]),
      day("winter-honeymoon-circuit-d5.jpg", 5, "Sonamarg Thajiwas", [
        "File:Sonamarg 1.jpg",
      ]),
      day("winter-honeymoon-circuit-d6.jpg", 6, "Shalimar Bagh", [
        "File:The entrance to Shalimar Bagh, Srinagar.jpg",
      ]),
    ],
  },
  {
    slug: "family-grand-circuit",
    targets: [
      cover("family-grand-circuit-cover.jpg", "Verinag Kashmir", [
        "File:A view of Verinag (derivative).jpg",
      ]),
      gallery("family-grand-circuit-g1.jpg", "Gulmarg Gondola", [
        "File:Gulmarg Gondola Seen110.jpg",
      ]),
      gallery("family-grand-circuit-g2.jpg", "Pahalgam Lidder", [
        "File:Srinagar to Pahalgam - vrvvkbjk2k23iph (465).jpg",
      ]),
      gallery("family-grand-circuit-g3.jpg", "Sonamarg Kashmir", [
        "File:Sonamarg 4.jpg",
      ]),
      gallery("family-grand-circuit-g4.jpg", "Kokernag Kashmir", [
        "File:Fish farm kokernag 2.jpg",
      ]),
      day("family-grand-circuit-d1.jpg", 1, "Nishat Bagh", [
        "File:Nishat Garden and around, Srinagar - vrvvkbjk2k23pxl (23).jpg",
      ]),
      day("family-grand-circuit-d2.jpg", 2, "Shalimar Bagh", [
        "File:Shalimar Bagh, Srinagar - panoramio (3930).jpg",
      ]),
      day("family-grand-circuit-d3.jpg", 3, "Gulmarg Kashmir", [
        "File:Gulmarg Gondola Seen115.jpg",
      ]),
      day("family-grand-circuit-d4.jpg", 4, "Aru Valley", [
        "File:View of Aru Village enclosed by snow clad mountains from top of Birzamal.jpg",
      ]),
      day("family-grand-circuit-d5.jpg", 5, "Betaab Valley", [
        "File:Betaab Valley- Pahalgam.jpg",
      ]),
      day("family-grand-circuit-d6.jpg", 6, "Aharbal Kashmir", [
        "File:Waterfall of Aharbal.JPG",
      ]),
      day("family-grand-circuit-d7.jpg", 7, "Nigeen Srinagar", [
        "File:Nagin lake 1.jpg",
      ]),
    ],
  },
  {
    slug: "winter-sports-week",
    targets: [
      cover("winter-sports-week-cover.jpg", "Gulmarg ski", [
        "File:Gulmarg Gondola Seen105.jpg",
      ]),
      gallery("winter-sports-week-g1.jpg", "Gulmarg Gondola", [
        "File:Gulmarg Gondola Seen125.jpg",
      ]),
      gallery("winter-sports-week-g2.jpg", "Kongdoori Gulmarg", [
        "File:Gulmarg Gondola Seen101.jpg",
      ]),
      gallery("winter-sports-week-g3.jpg", "Apharwat Gulmarg", [
        "File:Kongdoori 1.jpg",
      ]),
      gallery("winter-sports-week-g4.jpg", "Pahalgam Lidder", [
        "File:Srinagar to Pahalgam - vrvvkbjk2k23iph (440).jpg",
      ]),
      day("winter-sports-week-d1.jpg", 1, "Nigeen Srinagar", [
        "File:Fishermen at Negin lake.jpg",
      ]),
      day("winter-sports-week-d2.jpg", 2, "Gulmarg Kashmir", [
        "File:Kongdoori to Apharwat Route.jpg",
      ]),
      day("winter-sports-week-d3.jpg", 3, "Gulmarg Gondola", [
        "File:Kongdoori.jpg",
      ]),
      day("winter-sports-week-d4.jpg", 4, "Gulmarg ski", [
        "File:Apharwat Peak Gulmarg Kashmir.jpg",
      ]),
      day("winter-sports-week-d5.jpg", 5, "Apharwat Gulmarg", [
        "File:Apharwat Right Wing.jpg",
      ]),
      day("winter-sports-week-d6.jpg", 6, "Kongdoori Gulmarg", [
        "File:Route to apharwat peak.jpg",
      ]),
      day("winter-sports-week-d7.jpg", 7, "Betaab Valley", [
        "File:Natural beauty of Betaab Valley in Jammu and Kashmir.jpg",
      ]),
      day("winter-sports-week-d8.jpg", 8, "Dal Lake shikara", [
        "File:Shikaras at Dal Lake.jpg",
      ]),
    ],
  },
  {
    slug: "winter-adventure-mini",
    targets: [
      cover("winter-adventure-mini-cover.jpg", "Doodhpathri Kashmir", [
        "File:Doudpather backside.jpg",
      ]),
      gallery("winter-adventure-mini-g1.jpg", "Gulmarg Gondola", [
        "File:Slopes of Mount Apharwat..JPG",
      ]),
      gallery("winter-adventure-mini-g2.jpg", "Doodhpathri Kashmir", [
        "File:Doude pather towards tousa maidaan.jpg",
      ]),
      gallery("winter-adventure-mini-g3.jpg", "Pahalgam Lidder", [
        "File:Srinagar to Pahalgam - vrvvkbjk2k23iph (388).jpg",
      ]),
      gallery("winter-adventure-mini-g4.jpg", "Gulmarg ski", [
        "File:Gulmarg1.jpg",
      ]),
      day("winter-adventure-mini-d1.jpg", 1, "Nishat Bagh", [
        "File:Nishat Garden and around, Srinagar - vrvvkbjk2k23pxl (46).jpg",
      ]),
      day("winter-adventure-mini-d2.jpg", 2, "Gulmarg Gondola", [
        "File:Gulmarg-Valley.jpg",
      ]),
      day("winter-adventure-mini-d3.jpg", 3, "Apharwat Gulmarg", [
        "File:View of Baba Hanif Uddin Rishi Peak from Apharwat peak.jpg",
      ]),
      day("winter-adventure-mini-d4.jpg", 4, "Verinag Kashmir", [
        "File:Verinag Mughal Garden in Autumn.JPG",
      ]),
      day("winter-adventure-mini-d5.jpg", 5, "Aru Valley", [
        "File:Aru Valley Kashmir in winter view.jpg",
      ]),
    ],
  },
  {
    slug: "hidden-valleys-gurez-bangus",
    targets: [
      cover("hidden-valleys-gurez-bangus-cover.jpg", "Bangus Valley", [
        "File:Beauty of bangus valley.jpg",
      ]),
      gallery("hidden-valleys-gurez-bangus-g1.jpg", "Bangus Valley", [
        "File:Beauty of bangus.jpg",
      ]),
      gallery("hidden-valleys-gurez-bangus-g2.jpg", "Bangus Valley", [
        "File:Bangus Valley Kashmir.jpg",
      ]),
      gallery("hidden-valleys-gurez-bangus-g3.jpg", "Gurez Valley", [
        "File:Gurez Valley 05.jpg",
      ]),
      gallery("hidden-valleys-gurez-bangus-g4.jpg", "Lolab Kupwara", [
        "File:Lolab Valley-Kupwara.JPG",
      ]),
      day("hidden-valleys-gurez-bangus-d1.jpg", 1, "Nigeen Srinagar", [
        "File:Children on a canoe at Nagin lake in Srinagar Kashmir.jpg",
      ]),
      day("hidden-valleys-gurez-bangus-d2.jpg", 2, "Gurez Valley", [
        "File:A calm morning in the farmland of Markoot Village , Gurez Valley, Kashmir.jpg",
      ]),
      day("hidden-valleys-gurez-bangus-d3.jpg", 3, "Gurez Habba", [
        "File:Gurez Valley 09.jpg",
      ]),
      day("hidden-valleys-gurez-bangus-d4.jpg", 4, "Bangus Valley", [
        "File:Bangus valley glacier.jpg",
      ]),
      day("hidden-valleys-gurez-bangus-d5.jpg", 5, "Dachigam Kashmir", [
        "File:On top of Dachigam.jpg",
      ]),
      day("hidden-valleys-gurez-bangus-d6.jpg", 6, "Kokernag Kashmir", [
        "File:Botanical garden kokernag 11.jpg",
      ]),
      day("hidden-valleys-gurez-bangus-d7.jpg", 7, "Dal Lake shikara", [
        "File:Dal Lake Shikara at Dawn (14362763690).jpg",
      ]),
    ],
  },
  {
    slug: "deep-gurez-immersion",
    targets: [
      cover("deep-gurez-immersion-cover.jpg", "Gurez Valley", [
        "File:Gurez Valley 06.jpg",
      ]),
      gallery("deep-gurez-immersion-g1.jpg", "Gurez Valley", [
        "File:Habba Khatoon.jpg",
      ]),
      gallery("deep-gurez-immersion-g2.jpg", "Gurez Valley", [
        "File:A river sight from Gurez-Tulail Valley.jpg",
      ]),
      gallery("deep-gurez-immersion-g3.jpg", "Gurez Habba", [
        "File:Markoot Village, Gurez Valley, Kashmir.jpg",
      ]),
      gallery("deep-gurez-immersion-g4.jpg", "Sonamarg Thajiwas", [
        "File:Sonamarg 3.jpg",
      ]),
      day("deep-gurez-immersion-d1.jpg", 1, "Nigeen Srinagar", [
        "File:Beauty of Kashmir.jpg",
      ]),
      day("deep-gurez-immersion-d2.jpg", 2, "Gurez Valley", [
        "File:Grocery Shop.jpg",
      ]),
      day("deep-gurez-immersion-d3.jpg", 3, "Gurez Valley", [
        "File:Flowers on a Slab.jpg",
      ]),
      day("deep-gurez-immersion-d4.jpg", 4, "Bangus Valley", [
        "File:Bangus Valley 2.jpg",
      ]),
      day("deep-gurez-immersion-d5.jpg", 5, "Bangus Valley", [
        "File:Bangus Valley 5.jpg",
      ]),
      day("deep-gurez-immersion-d6.jpg", 6, "Verinag Kashmir", [
        "File:Verinag (4).JPG",
      ]),
      day("deep-gurez-immersion-d7.jpg", 7, "Sonamarg Kashmir", [
        "File:Sonamarg 9.jpg",
      ]),
      day("deep-gurez-immersion-d8.jpg", 8, "Nishat Bagh", [
        "File:Nishat Bagh (14362659870).jpg",
      ]),
      day("deep-gurez-immersion-d9.jpg", 9, "Dal Lake shikara", [
        "File:Dal Lake's sunset tour on a shikara - Srinagar (9966936105).jpg",
      ]),
    ],
  },
  {
    slug: "amarnath-yatra-helicopter",
    targets: [
      cover("amarnath-yatra-helicopter-cover.jpg", "Amarnath Yatra", [
        "File:Amarnath Yatra 49.JPG",
      ]),
      gallery("amarnath-yatra-helicopter-g1.jpg", "Baltal Amarnath", [
        "File:Amarnath Yatra 42.JPG",
      ]),
      gallery("amarnath-yatra-helicopter-g2.jpg", "Amarnath Yatra", [
        "File:Amarnath Yatra 31.JPG",
      ]),
      gallery("amarnath-yatra-helicopter-g3.jpg", "Amarnath Yatra", [
        "File:Amarnath Yatra 29.JPG",
      ]),
      gallery("amarnath-yatra-helicopter-g4.jpg", "Sonamarg Thajiwas", [
        "File:Thajiwas Glacier, Sonamarg, Kashmir - Picture 1 (8707802225).jpg",
      ]),
      day("amarnath-yatra-helicopter-d1.jpg", 1, "Sonamarg Kashmir", [
        "File:Killer Crevasse-Sonamarg glacier (Jammu and Kashmir).jpg",
      ]),
      day("amarnath-yatra-helicopter-d2.jpg", 2, "Amarnath Yatra", [
        "File:Amarnath Yatra 04.JPG",
      ]),
      day("amarnath-yatra-helicopter-d3.jpg", 3, "Baltal Amarnath", [
        "File:Amarnath Yatra 12.JPG",
      ]),
      day("amarnath-yatra-helicopter-d4.jpg", 4, "Nigeen Srinagar", [
        "File:A canoe on the creek.jpg",
      ]),
    ],
  },
  {
    slug: "kashmir-vaishno-devi",
    targets: [
      cover("kashmir-vaishno-devi-cover.jpg", "Vaishno Devi", [
        "File:Vaishno Devi temple complex at night.jpg",
      ]),
      gallery("kashmir-vaishno-devi-g1.jpg", "Katra Jammu", [
        "File:Katra (Jammu and Kashmir) seen from NE (216955635).jpg",
      ]),
      gallery("kashmir-vaishno-devi-g2.jpg", "Vaishno Devi", [
        "File:Vaishno Devi Shrine.jpg",
      ]),
      gallery("kashmir-vaishno-devi-g3.jpg", "Gulmarg Gondola", [
        "File:Verinag Spiring.JPG",
      ]),
      gallery("kashmir-vaishno-devi-g4.jpg", "Pahalgam Lidder", [
        "File:Srinagar to Pahalgam - vrvvkbjk2k23iph (393).jpg",
      ]),
      day("kashmir-vaishno-devi-d1.jpg", 1, "Katra Jammu", [
        "File:Katra (Jammu & Kashmir).jpg",
      ]),
      day("kashmir-vaishno-devi-d2.jpg", 2, "Vaishno Devi", [
        "File:Vaishno Devi Temple arena.jpg",
      ]),
      day("kashmir-vaishno-devi-d3.jpg", 3, "Katra Jammu", [
        "File:Katra - Jammu Tawi Road views 04.JPG",
      ]),
      day("kashmir-vaishno-devi-d4.jpg", 4, "Nishat Bagh", [
        "File:Nishat Bagh (14362717638).jpg",
      ]),
      day("kashmir-vaishno-devi-d5.jpg", 5, "Shalimar Bagh", [
        "File:Shalimar Bagh (Srinagar) - panoramio (3929).jpg",
      ]),
      day("kashmir-vaishno-devi-d6.jpg", 6, "Gulmarg Gondola", [
        "File:Verinag (3).JPG",
      ]),
      day("kashmir-vaishno-devi-d7.jpg", 7, "Betaab Valley", [
        "File:Betaab Valley,Kashmir.jpg",
      ]),
      day("kashmir-vaishno-devi-d8.jpg", 8, "Sonamarg Kashmir", [
        "File:Thajiwas Glacier.jpg",
      ]),
      day("kashmir-vaishno-devi-d9.jpg", 9, "Nigeen Srinagar", [
        "File:Spring at Verinag and Mughal Arcade.JPG",
      ]),
      day("kashmir-vaishno-devi-d10.jpg", 10, "Dal Lake shikara", [
        "File:Shikara, Dal Lake (14550938576).jpg",
      ]),
    ],
  },
];

async function main() {
  const onlyArg = process.argv.includes("--only")
    ? process.argv[process.argv.indexOf("--only") + 1]
    : null;
  const jobs = onlyArg
    ? JOBS.filter((j) => j.slug.includes(onlyArg))
    : JOBS;
  if (!jobs.length) throw new Error(`No jobs for ${onlyArg}`);

  const shared = createBatchBlocklist("__kashmir-remaining11__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  let okCount = 0;
  let fail = 0;
  for (const job of jobs) {
    try {
      await fetchAndWireTourImages(job, { sharedBlock: shared });
      okCount++;
    } catch (error) {
      fail++;
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[${job.slug}] ${msg.split("\n")[0]}`);
    }
  }
  console.log(`\nRemaining-11 pass done. ok≈${okCount} warned=${fail}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
