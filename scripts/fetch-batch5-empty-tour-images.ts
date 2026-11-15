/**
 * Batch 5 — place-matched unique images for winter trek, desert camp, ski, pilgrimage, meadow trek, honeymoon, family Sikkim, Nubra.
 *
 *   npx tsx scripts/fetch-batch5-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch5-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch5-empty-tour-images.ts --only marchoi-valley-winter-trek
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
    const slug = "marchoi-valley-winter-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Marchoi Gangbal winter trek Naranag Kashmir snow", [
          "File:Group Trekking near Gangbal.jpg",
          "File:Trekking near Gangbal Lake.jpg",
          "File:Gangbal.7alpinelakestrekk.jpg",
          "File:Shiva shrine, Gangabal Lake.jpg",
        ], ["destinations/naranag.jpg", "destinations/kashmir.jpg"]),
        t.g(1, "Naranag ancient temple Kashmir trek base", [
          "File:Ancient Temple, Naranag, Jammu and Kashmir, India.jpg",
          "File:Wangath Temple Complex, Naranag, Jammu and Kashmir, India.jpg",
          "File:8th century Bhutesa temples group, Naranag, Jammu & Kashmir.jpg",
        ], ["destinations/naranag.jpg"]),
        t.g(2, "Srinagar Dal Lake Kashmir orientation", [
          "File:Dal Lake, Srinagar 3.jpg",
          "File:Dal Lake, Srinagar, Jammu and Kashmir.jpg",
          "File:Boats on Dal Lake, Srinagar during Sunset.jpg",
        ], ["destinations/srinagar.jpg"]),
        t.g(3, "Naranag valley meadow Kashmir approach", [
          "File:Naranag11.jpg",
          "File:Ancient Temple 1, Naranag.jpg",
          "File:Group of Ancient Temples, Naranag, Jammu and Kashmir.jpg",
        ], ["destinations/naranag.jpg"]),
        t.g(4, "Gangbal alpine lake trek Kashmir", [
          "File:Gangbal.7alpinelakestrekk.jpg",
          "File:Trekking near Gangbal Lake.jpg",
        ], ["destinations/kashmir.jpg"]),
        t.d(1, "Srinagar Naranag trek orientation", [
          "File:Srinagar pano.jpg",
          "File:Empty shikara on Dal Lake, Srinagar, India 2013-08-23 (flickr 9967093983).jpg",
          "File:The Ancient Shankaracharya Temple (Srinagar, Jammu and Kashmir) (cropped).jpg",
        ], ["destinations/srinagar.jpg"]),
        t.d(2, "Marchoi Valley snow trek Naranag", [
          "File:Group Trekking near Gangbal.jpg",
          "File:Ruins of Naranag temple in Ganderbal district J&K India.jpg",
          "File:Naranag temple ganderbal.jpg",
        ], ["destinations/naranag.jpg", "destinations/kashmir.jpg"]),
        t.d(3, "Return Srinagar airport departure", [
          "File:Dal lake by Ahanger HOBO.jpg",
          "File:House boats on Dal Lake, Srinagar 5.jpg",
          "File:Floating market on Dal Lake, Srinagar 2.jpg",
        ], ["destinations/srinagar.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "rann-of-kutch-white-desert-camping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Great Rann of Kutch white salt desert Gujarat", [
          "File:White salt desert at Rann of Kutch.jpg",
          "File:The White Desert in Kutch, the great rann of kutch.jpg",
          "File:Rann of Kutch - White Desert.jpg",
          "File:'WHITE DESERT' at Dhordo in Great Rann of Kutch.JPG",
        ]),
        t.g(1, "White Rann salt flats panorama Gujarat", [
          "File:The Rann of Kutch Panorama view.jpg",
          "File:Rann of Kutch from Kala Dungar.jpg",
          "File:White Rann of Kutch - Landscape.jpeg",
        ]),
        t.g(2, "Rann Utsav desert camp tents", [
          "File:Rann utsav 03.jpg",
          "File:Rann Utsav Venue.jpg",
          "File:Tent View.jpg",
        ]),
        t.g(3, "Bhuj Kutch heritage city Gujarat", [
          "File:Prag Mahal Bhuj.jpg",
          "File:View of bhuj city.jpg",
          "File:Bhuj kaccha.jpg",
        ]),
        t.g(4, "Camel rides white desert Rann", [
          "File:'Camel Rides' on 'White Desert' at Rann Utsav.JPG",
          "File:Rann utsav 01.jpg",
          "File:Sunset- ranotsav.JPG",
        ]),
        t.d(1, "Arrive Bhuj Kutch gateway", [
          "File:Airport Bhuj.jpg",
          "File:Ram Kund - Bhuj - Gujarat - 001.jpg",
          "File:Prag Mahal Bhuj.jpg",
        ]),
        t.d(2, "White Rann overnight desert camp", [
          "File:Rann utsav 04.jpg",
          "File:Kutch White Rann Tents (8335851293).jpg",
          "File:Safed Rann, Kutch.jpg",
        ]),
        t.d(3, "Dawn Rann departure white desert", [
          "File:Sunset - white desert.JPG",
          "File:White Rann of Kutch.jpg",
          "File:Rann of Kutch - White Desert 2.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "auli-skiing-winter-package";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Auli ski slopes Nanda Devi winter Uttarakhand", [
          "File:SDRF (Uttarakhand) Course on Ski and Snow Craft based Search and Rescue by Nanda Devi Institute of Adventure Sports (NDI).jpg",
          "File:SDRF Uttarakhand search & rescue course at Auli, Nanda Devi Institute of Adventure Sports.jpg",
          "File:Nanda Devi in Auli.jpg",
          "File:Auli-slopes.jpg",
        ], ["destinations/uttarakhand.jpg", "destinations/himachal.jpg"]),
        t.g(1, "Auli ski resort slopes Garhwal", [
          "File:Auli in October 2015 - 40.jpg",
          "File:Auli in October 2015 - 39.jpg",
          "File:Auli, India.jpg",
        ], ["destinations/uttarakhand.jpg"]),
        t.g(2, "Joshimath Auli ropeway approach", [
          "File:Ropeway at Joshimath, Uttarakhand.jpg",
          "File:Auli Temple From Ropeway (196432903).jpeg",
          "File:Joshimath Snow.jpg",
        ], ["destinations/uttarakhand.jpg"]),
        t.g(3, "Joshimath gateway Auli Himalaya", [
          "File:Joshimath 01.jpg",
          "File:Joshimath 02.jpg",
          "File:Joshimath 03.jpg",
        ], ["destinations/uttarakhand.jpg"]),
        t.g(4, "Nanda Devi peak view Auli", [
          "File:Mountain Nanda Devi seen from Auli.jpg",
          "File:Himalayas near Auli.jpg",
          "File:Auli Bugyal Himalayas.jpg",
        ], ["destinations/uttarakhand.jpg"]),
        t.d(1, "Haridwar belt Joshimath drive", [
          "File:Bibekraj Joshimath Uttarakhand.jpg",
          "File:Joshimath peak(behind the scenes of Anjaan ek dastak).jpg",
          "File:Ropeway at Joshimath, Uttarakhand (cropped).jpg",
        ], ["destinations/haridwar.jpg", "destinations/uttarakhand.jpg"]),
        t.d(2, "Joshimath Auli gondola ski lesson", [
          "File:SDRF (Uttarakhand) Course on Ski and Snow Craft based Search and Rescue by Nanda Devi Institute of Adventure Sports (NDI).jpg",
          "File:Auli Lake.jpg",
          "File:Auli Ski Resort in summer 2012.jpg",
        ], ["destinations/uttarakhand.jpg"]),
        t.d(3, "Second ski day Auli slopes", [
          "File:SDRF Uttarakhand search & rescue course at Auli, Nanda Devi Institute of Adventure Sports.jpg",
          "File:Auli in summer.jpg",
          "File:Auli hill station.jpg",
        ], ["destinations/uttarakhand.jpg"]),
        t.d(4, "Return Haridwar Dehradun departure", [
          "File:Auli in October 2015 - 39.jpg",
        ], ["destinations/dehradun.jpg", "destinations/haridwar.jpg", "destinations/rishikesh.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "bodh-gaya-enlightenment-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Mahabodhi Temple Bodh Gaya Bihar pilgrimage", [
          "File:Mahabodhi Temple South Wall (2).jpg",
          "File:Great Buddha Statue, Bodh Gaya at Sunset.jpg",
          "File:Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg",
          "File:Decorative Panels on Votive Stupas - Mahabodhi Temple Complex (1).jpg",
        ]),
        t.g(1, "Mahabodhi Temple complex stupas", [
          "File:Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (18).jpg",
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 01.jpg",
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 11.jpg",
        ]),
        t.g(2, "Great Buddha statue Bodh Gaya", [
          "File:Great Buddha statue at Bodh Gaya, Bihar, India.jpg",
          "File:Great Buddha Statue, Bodh Gaya.jpg",
          "File:The Great Buddha statue, Bodh Gaya.jpg",
        ]),
        t.g(3, "Thai monastery Bodh Gaya", [
          "File:Thai Buddhist Temple (Inside), Bodh Gaya, India.jpg",
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 17.jpg",
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 18.jpg",
        ]),
        t.g(4, "Nalanda Mahavihara ruins Bihar", [
          "File:Nalanda Ruins (6).jpg",
          "File:Nalanda Ruins (29).jpg",
          "File:Monastery 5 - Nalanda Mahavihara (1).jpg",
        ]),
        t.d(1, "Arrive Bodh Gaya pilgrimage", [
          "File:Great Buddha Statue, Buddha Gaya and surrounding places- IRCTC 2017 (57).jpg",
          "File:Bodh Gaya - Buddha Statue - Front View (9224970905).jpg",
          "File:Great Buddha statue at Bodh Gaya (2), Bihar, India.jpg",
        ]),
        t.d(2, "Mahabodhi Temple full day", [
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 12.jpg",
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 09.jpg",
          "File:Votive Stupas - Mahabodhi Temple Complex - Bodh Gaya (13).jpg",
        ]),
        t.d(3, "Rajgir Nalanda ancient ruins", [
          "File:Rajgir (bihar) 3.jpg",
          "File:Jain Shrine Ruins - Vaibhar Hills - Rajgir 06.jpg",
          "File:Temple 12 - Nalanda Mahavihara (17).jpg",
        ]),
        t.d(4, "Departure Bodh Gaya Bihar", [
          "File:Great Buddha Statue, Buddha Gaya and surrounding places- IRCTC 2017 (62).jpg",
          "File:Mahabodhi Temple Railing - Bodh Gaya ASI Museum - 06.jpg",
          "File:Ruins of Nalanda University At Nalanda Bihar in India.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "bodpathri-meadows-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Doodhpathri meadow valley Kashmir trek", [
          "File:Meadows and Forests Doodhpathri southwest Jammu Kashmir India.jpg",
          "File:Virgin valley Doud pather.jpg",
          "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
          "File:Trancendent.jpg",
        ], ["destinations/doodhpathri.jpg", "destinations/kashmir.jpg"]),
        t.g(1, "Doodhpathri lush meadows Kashmir", [
          "File:Doodhpathri - A dirt road goes through the many meadows southwest Jammu Kashmir India.jpg",
          "File:Doodh Patthri, Kashmir.jpg",
          "File:A Rural Road towards Doodhpathri from Magam Jammu Kashmir India May 2014.jpg",
        ], ["destinations/doodhpathri.jpg"]),
        t.g(2, "Bodpathri bowl alpine meadow trek", [
          "File:Meadows and Forests Doodhpathri southwest Jammu Kashmir India.jpg",
          "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
        ], ["destinations/doodhpathri.jpg"]),
        t.g(3, "Doodhpathri forest valley Kashmir", [
          "File:Virgin valley Doud pather.jpg",
          "File:Trancendent.jpg",
        ], ["destinations/doodhpathri.jpg", "destinations/kashmir.jpg"]),
        t.g(4, "Srinagar gateway meadow trek", [
          "File:A view of Shalimar Bagh, Srinagar, in 2013.jpg",
          "File:Yellow tree stands out at Shalimar Bagh, Srinagar.jpg",
          "File:Trees in Shalimar Bagh (Srinagar).jpg",
        ], ["destinations/srinagar.jpg"]),
        t.d(1, "Srinagar drive Doodhpathri trailhead", [
          "File:Dal Lake Hazratbal Srinagar.jpg",
          "File:Mughal era architecture inside of the Shalimar Bagh, Srinagar.jpg",
          "File:A view of Shalimar Bagh in Srinagar.jpg",
        ], ["destinations/srinagar.jpg", "destinations/doodhpathri.jpg"]),
        t.d(2, "Trek into Bodpathri meadow bowl", [
          "File:Doodhpathri - A dirt road goes through the many meadows southwest Jammu Kashmir India.jpg",
          "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
        ], ["destinations/doodhpathri.jpg"]),
        t.d(3, "Meadow loop return Doodhpathri", [
          "File:A Rural Road towards Doodhpathri from Magam Jammu Kashmir India May 2014.jpg",
          "File:Doodh Patthri, Kashmir.jpg",
        ], ["destinations/doodhpathri-3.jpg", "destinations/doodhpathri-4.jpg"]),
        t.d(4, "Depart Srinagar Kashmir", [
          "File:Dal Lake, Srinagar 2.jpg",
          "File:Dal Lake, Srinagar at Dusk.jpg",
        ], ["destinations/srinagar.jpg", "destinations/kashmir.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "coorg-coffee-estate-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Coorg homestay estate hills honeymoon Karnataka", [
          "File:Blue Mountain Homestay Inakanahalli Coorg Jun24 A7CR 01433.jpg",
          "File:Homestay, Coorg, Karnataka.jpg",
          "File:Areca Meadows Inakanahalli Somwarpet Jun24 A7CR 01395.jpg",
          "File:Nakoor Volkot Suntikoppa Coorg Apr24 A7C 10727.jpg",
        ]),
        t.g(1, "Coffee estate homestay Kodagu", [
          "File:Chicoo Fruit Tree Inakanahalli Coorg Nov24 A7CR 04501.jpg",
          "File:Sign Nakoor Volkot Suntikoppa Coorg Apr24 A7C 10778.jpg",
          "File:Blue Mountain Homestay Inakanahalli Coorg Jun24 A7CR 01433.jpg",
        ]),
        t.g(2, "Harangi reservoir Coorg hills", [
          "File:Harangi Reservoir, Coorg.jpg",
          "File:Kotebetta , Coorg.jpg",
          "File:Iruppu Waterfalls.jpg",
        ]),
        t.g(3, "Talacauvery source hills Coorg", [
          "File:Talakaveri Temple, Talacauvery and surroundings (6).jpg",
          "File:Talakaveri Temple, Talacauvery and surroundings (19).jpg",
          "File:Talakaveri Temple, Talacauvery and surroundings (52).jpg",
        ]),
        t.g(4, "Bylakuppe Golden Temple Coorg", [
          "File:Golden Temple Coorg, Karnataka01.jpg",
          "File:Golden Temple In Coorg.JPG",
          "File:Bylakuppe Golden Temple in Coorg.jpg",
        ]),
        t.d(1, "Arrive Coorg estate check-in", [
          "File:Homestay, Coorg, Karnataka.jpg",
          "File:Areca Meadows Inakanahalli Somwarpet Jun24 A7CR 01395.jpg",
        ]),
        t.d(2, "Abbey Falls Madikeri Coorg", [
          "File:Abbey Falls in Madikeri , Coorg.jpg",
          "File:Abbey falls 3.jpg",
          "File:Coorg-Abbey falls.jpg",
          "File:Abbey falls coorg.jpg",
        ]),
        t.d(3, "Nisargadhama Dubare elephants Coorg", [
          "File:COORG.1.jpg",
          "File:Dubare Elephant Camp.jpg",
          "File:Baby elephant playing with the mother, Dubare Elephant Camp, Coorg, Karnataka.JPG",
          "File:Coorg Deer Park The Deer 01.jpg",
        ]),
        t.d(4, "Departure Kushalnagar Coorg Karnataka", [
          "File:Golden Temple Coorg, Karnataka04.jpg",
          "File:Iruppu Waterfalls.jpg",
          "File:Harangi Reservoir, Coorg.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "gangtok-tsomgo-lake-family";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Tsomgo Changu Lake Gangtok family Sikkim", [
          "File:Tsomgo Lake alias Tsongmo Lake or Changgu Lake in East Sikkim 01.jpg",
          "File:Changu (Tsomgo) Lake.jpg",
          "File:Tsomgo Lake, Sikkim 1.jpg",
          "File:Tsongmo Lake or Changu Lake - East Sikkim.jpg",
        ]),
        t.g(1, "Tsomgo lake mountain reflection Sikkim", [
          "File:Tsomgo Lake alias Tsongmo Lake or Changgu Lake in East Sikkim 02.jpg",
          "File:Tsomgo Lake (Changu Lake), East Sikkim,4.jpg",
          "File:Yak near Tsomgo Lake, Sikkim.jpg",
        ]),
        t.g(2, "Gangtok city ropeway view Sikkim", [
          "File:View of Gangtok city from Ropeway.jpg",
          "File:Bird's eye view of Gangtok City from Ganeshtok.jpg",
          "File:Gangtok from Tibet Road.jpg",
        ]),
        t.g(3, "Rumtek Monastery Sikkim", [
          "File:Rumtek Monastery 04.jpg",
          "File:Gate of Rumtek Monastery.jpg",
          "File:Mystic Rumtek Monastery, Sikkim, India.jpg",
        ]),
        t.g(4, "Enchey Monastery Gangtok", [
          "File:Enchey Monastery 01.jpg",
          "File:Enchey Monastery in Gangtok, Sikkim 23.jpg",
          "File:Enchey Monastery in Gangtok, Sikkim 10.jpg",
        ]),
        t.d(1, "IXB drive to Gangtok family", [
          "File:View of Gangtok City from Crown Prince Tenzing Kunzang Namgyal Walkway.jpg",
          "File:Sikkim Gangtok.jpg",
          "File:Secretariat Building of Sikkim in Gangtok,1.jpg",
        ]),
        t.d(2, "Tsomgo Lake Baba Mandir day trip", [
          "File:Tsomgo Lake (Changu Lake), East Sikkim,1.jpg",
          "File:Baba Mandir - View Outside.jpg",
          "File:Changu Lake, Sikkim.jpg",
        ]),
        t.d(3, "Gangtok monasteries sightseeing", [
          "File:Rumtek Monastery 01.jpg",
          "File:Enchey Monastery 02.jpg",
          "File:Enchey Monastery in Gangtok, Sikkim 31.jpg",
        ]),
        t.d(4, "Departure Gangtok Sikkim", [
          "File:Main Gate of the Sikkim Secretariat Building in Gangtok,2.jpg",
          "File:View of Gangtok city from Ropeway.jpg",
          "File:Changu Lake of Sikkim, India.JPG",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "nubra-valley-desert-camping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Nubra Valley Hunder sand dunes Ladakh camping", [
          "File:Sand dunes of Nubra Valley, Ladakh.jpg",
          "File:Bactrian camels at Hunder sand dunes Ladakh.jpg",
          "File:A Lady in White Dress, Hunder Sand Dunes, Nubra Valley, Ladakh.jpg",
          "File:Sand dunes and poplars Nubra Valley Ladakh.jpg",
        ], ["destinations/nubra.jpg", "destinations/ladakh.jpg"]),
        t.g(1, "Hunder camel dunes Nubra", [
          "File:Hunder, Nubra valley.jpg",
          "File:Land of Sand Dunes! - Nubra Valley.jpg",
          "File:Shyok river at Hunder, Nubra valley.jpg",
        ], ["destinations/nubra.jpg"]),
        t.g(2, "Khardung La pass Ladakh gateway", [
          "File:Khardung La (pass), Ladakh, North India.jpg",
          "File:Khurdung La Pass.jpg",
          "File:Khardung La Pass, highest road in the world (2563941837).jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(3, "Diskit monastery Nubra valley", [
          "File:Diskit Gompa 2.jpg",
          "File:Jampa Buddha - Diskit Monastery - Ladakh - 1.jpg",
          "File:Diskit Valley view from the Monastery.jpg",
        ], ["destinations/nubra.jpg", "destinations/ladakh.jpg"]),
        t.g(4, "Shyok river Nubra landscape", [
          "File:Shyok River (India) in Nubra Valley.jpg",
          "File:Bridge in Nubra Valley, Ladakh.jpg",
          "File:Peaceful landscape with rocks, sand dunes, trees and river in Nubra Valley, Ladakh.jpg",
        ], ["destinations/nubra.jpg"]),
        t.d(1, "Leh acclimatization rest day", [
          "File:Leh Palace - Leh - Ladakh - View from Shanti Stupa.jpg",
          "File:Thiksey Monastery, Ladakh 14.jpg",
          "File:Indus Valley near Leh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(2, "Khardung La Nubra desert camp", [
          "File:Khardung La (pass), Checkpoint, Ladakh, North India.jpg",
          "File:En route Nubra Valley from Leh, Ladakh, India (2015).jpg",
          "File:Nubra Valley 2.jpg",
        ], ["destinations/nubra.jpg", "destinations/ladakh.jpg"]),
        t.d(3, "Sand dunes morning return Leh", [
          "File:Bactrian camel in Nubra Valley, Ladakh.jpg",
          "File:Sand dunes in Nubra Valley, Ladakh.jpg",
          "File:Hunder-Ladakh Region, India.jpg",
        ], ["destinations/nubra.jpg"]),
        t.d(4, "Departure Leh Ladakh", [
          "File:Leh, Ladakh, India.jpg",
          "File:Leh Palace, Ladakh, India.jpg",
          "File:Ladakh Range 01.jpg",
        ], ["destinations/ladakh.jpg"]),
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

  const shared = createBatchBlocklist(jobs[0]!.slug);
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

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
    console.log(`\nBatch 5 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
