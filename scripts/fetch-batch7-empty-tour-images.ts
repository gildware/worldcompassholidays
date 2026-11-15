/**
 * Batch 7 — Holi, Periyar, Rann Utsav, Pushkar fair, Gurez trek, Gangabal trek, Dwarka–Somnath, Rameswaram.
 *
 *   npx tsx scripts/fetch-batch7-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch7-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch7-empty-tour-images.ts --only holi-mathura-vrindavan-special
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
    const slug = "holi-mathura-vrindavan-special";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Lathmar Holi Barsana Braj colours", [
          "File:Barsana Holi Festival.jpg",
          "File:Lathmar Holi at Barsana.jpg",
          "File:Famous Lathmar Holi of Barsana and Nandgaon.jpg",
          "File:LATHMAR HOLI ,BARSANA.jpg",
        ]),
        t.g(1, "Lathmar Holi play Barsana", [
          "File:Lathmar Holi Play at Barsana.jpg",
          "File:Barsana Holi 4.jpg",
          "File:AVDbarsana22 (30).jpg",
        ]),
        t.g(2, "Holi colours Vrindavan lanes", [
          "File:Holi Madness.jpg",
          "File:Colourful Braj Dhaam.jpg",
          "File:Real Indian Culture.jpg",
        ]),
        t.g(3, "Dwarkadhish Temple Mathura", [
          "File:Krishna Janmabhoomi Mathura.jpg",
          "File:Krishna Janmasthan Temple Complex.jpg",
          "File:Shri Krishna Janmasthan.jpg",
        ]),
        t.g(4, "Yamuna ghats Vishram Mathura", [
          "File:Vishram Ghat Mathura.jpg",
          "File:Ghats of Mathura.jpg",
          "File:Yamuna River Mathura.jpg",
        ]),
        t.d(1, "Barsana Lathmar preview Nandgaon", [
          "File:Lathmar Holi 2022 in Nandgaon, Uttar Pradesh.jpg",
          "File:Holi Celebration in Nandgaon, Mathura, Uttar Pradesh.jpg",
          "File:Vibrant and mesmerizing Holi celebrations - Nandgaon, Mathura , India.jpg",
        ]),
        t.d(2, "Holi peak Vrindavan Mathura", [
          "File:Lathmar Holi is a local celebration of the Hindu festival of Holi which takes in Barsana and Nandgaon.jpg",
          "File:The Samaj Rituals- Holi at Nandgaon , Mathura.jpg",
          "File:Holi Celebration in Nandgaon, Mathura.jpg",
        ]),
        t.d(3, "Post-Holi departure Braj", [
          "File:Lathmaar Holi.jpg",
          "File:FOLK DANCE IN BARSANA.jpg",
          "File:SPREADING COLORS OF JOY.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "periyar-thekkady-wildlife-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Periyar Lake boat Thekkady Kerala", [
          "File:Periyar National Park-Thekkady Lake - Jalakanyaka-WUS07796.jpg",
          "File:Periyar National Park boat.JPG",
          "File:View of the Periyar Lake.jpg",
          "File:Periyar Lake kerela.jpg",
        ]),
        t.g(1, "Periyar wildlife lake Kerala", [
          "File:Periyar National Park - 2.JPG",
          "File:Periyar National Park 2019.jpg",
          "File:Periyar Wildlife Preserve.jpg",
        ]),
        t.g(2, "Spice plantation Kumily Cardamom Hills", [
          "File:Thekkady Forest Trek.JPG",
          "File:Herd of bisons in Thekkady, Kerala.jpg",
          "File:Periyar National Park-WUS07729.jpg",
        ]),
        t.g(3, "Forest birds Periyar National Park", [
          "File:A bird in periyar national park.jpg",
          "File:Periyar National Park-WUS07746.jpg",
          "File:Periyar National Park-WUS07611.jpg",
        ]),
        t.g(4, "Cardamom Hills Thekkady mist Kerala", [
          "File:Periyar National Park-WUS07597.jpg",
          "File:Periyar National Park-WUS07562.jpg",
          "File:Periyar National Park-WUS07593.jpg",
        ]),
        t.d(1, "Arrive Thekkady Cardamom Hills", [
          "File:Periyar National Park-WUS07716.jpg",
          "File:Periyar National Park-WUS07587.jpg",
          "File:Periyar National Park banner.JPG",
        ]),
        t.d(2, "Periyar Lake boat spice garden", [
          "File:Periyar National Park-WUS07737-Verbessert-RR.jpg",
          "File:Periyar National Park-WUS07664-Verbessert-RR.jpg",
          "File:Periyar at aluva manalpuram - panoramio.jpg",
        ]),
        t.d(3, "Nature walk buffer forest Thekkady", [
          "File:Vembanad-Kol wetlands-WUS08041.jpg",
          "File:Periyar National Park-WUS07562.jpg",
        ]),
        t.d(4, "Departure Cochin Madurai gateway", [
          "File:Cochin International Airport, Kerala - September 2026.jpg",
          "File:Cochin international airport terminal.jpg",
          "File:Kathakali mannequin at Cochin International Airport.jpg",
          "File:Cochin International Airport Gate.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "rann-utsav-package";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Rann Utsav festival Dhordo tent city", [
          "File:Rann Utsav Venue.jpg",
          "File:Kutch White Rann Tents (8335851293).jpg",
          "File:Tent View.jpg",
          "File:Rann utsav 02.jpg",
        ]),
        t.g(1, "Rann Utsav Swiss cottage tents", [
          "File:Tent Example.jpg",
          "File:Rann utsav 01.jpg",
          "File:White desert.....JPG",
        ]),
        t.g(2, "Kutch handicraft embroidery village", [
          "File:Rann of Kutch, India ESA377539.jpg",
          "File:'Camel Rides' on 'White Desert' at Rann Utsav.JPG",
        ]),
        t.g(3, "Bhuj heritage Kutch gateway", [
          "File:Aina Mahal Bhuj.jpg",
          "File:View of bhuj city.jpg",
          "File:Ram Kund - Bhuj - Gujarat - 001.jpg",
        ]),
        t.g(4, "Dhordo White Rann festival grounds", [
          "File:'WHITE DESERT' at Dhordo in Great Rann of Kutch.JPG",
          "File:Rann of Kutch - Highest Point.jpg",
        ]),
        t.d(1, "Bhuj crafts drive Dhordo tents", [
          "File:Airport Bhuj.jpg",
          "File:Bhuj kaccha.jpg",
        ]),
        t.d(2, "White Rann full moon session", [
          "File:Rann of Kutch - White Desert.jpg",
          "File:Rann utsav 04.jpg",
        ]),
        t.d(3, "Kalo Dungar Hodka artisans", [
          "File:Rann of Kutch from Kala Dungar.jpg",
          "File:Kala Dungar, Kachchh - panoramio.jpg",
          "File:View of ran of Kachchh from Kala Dungar, Kachchh - panoramio.jpg",
        ]),
        t.d(4, "Return Bhuj airport", [
          "File:Kala dungar, Kachchh - panoramio.jpg",
          "File:View of ran of Kachchh from Kala Dungar, Kachchh - panoramio (1).jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "pushkar-camel-fair-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Pushkar Camel Fair Rajasthan livestock", [
          "File:Pushkar camel fair.jpg",
          "File:Camels of Pushkar Camel Fair (2015).jpg",
          "File:Pushkar Fair.jpg",
          "File:Pushkar Camel Fair (49153853733).jpg",
        ]),
        t.g(1, "Decorated camel Pushkar fairground", [
          "File:A decorated camel at Pushkar Camel Fair.jpg",
          "File:(A) Camel Pushkar fair.jpg",
          "File:(3) Pushkar Fair, A camel dressed up like a bride.jpg",
        ]),
        t.g(2, "Pushkar fair bazaar evening", [
          "File:Bazaar in the evening, Pushkar Fair 2019 (49147091372).jpg",
          "File:Pushkar.in Sunset at Camel Fair - panoramio.jpg",
          "File:Pushkar Fair (4).jpg",
        ]),
        t.g(3, "Camel trading fields Pushkar fair", [
          "File:Camels,cattle & horses for sale at Pushkar Fair..jpg",
          "File:Pushkar Camel Fair (49147147747).jpg",
          "File:Pushkar.- The camel market october 2009.jpg",
        ]),
        t.g(4, "Fair spectators grandstand Pushkar", [
          "File:'grandstand' for tourists and spectators at Pushkar fair..jpg",
          "File:Local villagers arriving at the Pushkar Fair..jpg",
          "File:A camels hair being shorn at Pushkar..jpg",
        ]),
        t.d(1, "Jaipur drive Pushkar fair periphery", [
          "File:Pushkar Camel safari Tours.JPG",
          "File:Pushkar Fair (49153853733).jpg",
        ]),
        t.d(2, "Fairground sunrise camels ferris", [
          "File:Pushkar camel fair.jpg",
          "File:Camels of Pushkar Camel Fair (2015).jpg",
        ]),
        t.d(3, "Kartik Purnima bathing fair shopping", [
          "File:Pushkar Fair.jpg",
          "File:Bazaar in the evening, Pushkar Fair 2019 (49147091372).jpg",
        ]),
        t.d(4, "Return Jaipur airport", [
          "File:Pushkar Camel Fair (49147147747).jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "gurez-valley-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Gurez valley shepherd trek Kishanganga", [
          "File:Landscape, Gurez.jpg",
          "File:Gurez Valley 09.jpg",
          "File:Habba Khatoon Pyramid Mountain.jpg",
          "File:Habba Khatoon.jpg",
        ], ["destinations/gurez-4.jpg", "destinations/gurez.jpg"]),
        t.g(1, "Tulail valley shepherd trail Gurez", [
          "File:Neelum River (Pakistan) 15.jpg",
          "File:Gurez Valley 05.jpg",
          "File:Gurez Valley 06.jpg",
          "File:Tulail valley gurez.jpg",
        ], ["destinations/bangus-2.jpg", "destinations/lolab-2.jpg"]),
        t.g(2, "Kishanganga riverside Gurez trek", [
          "File:River Kishenganga at Gurez Valley.jpg",
          "File:Neelum River (Pakistan) 15.jpg",
          "File:Gurez Valley 06.jpg",
        ], ["destinations/gurez-4.jpg", "destinations/lolab-3.jpg"]),
        t.g(3, "Shepherd trail meadow Gurez", [
          "File:Gurez valley kashmir landscape.jpg",
          "File:Gurez Valley 08.jpg",
          "File:Gurez Valley 03.jpg",
        ], ["destinations/kashmir.jpg"]),
        t.g(4, "Kishanganga river valley trek", [
          "File:River Kishenganga at Gurez Valley.jpg",
          "File:Neelum River AKA Kishanganga River at Gurez.jpg",
          "File:Kishanganga valley Kashmir.jpg",
        ], ["destinations/wular-lake-2.jpg"]),
        t.d(1, "Srinagar briefing Gurez sector", [
          "File:Jhelum River Srinagar.jpg",
          "File:Nishat Bagh Srinagar.jpg",
        ], ["destinations/srinagar-2.jpg"]),
        t.d(2, "Razdan Pass Dawar guesthouse", [
          "File:Gurez Valley 07.jpg",
          "File:Gurez Valley 05.jpg",
        ], ["destinations/kashmir-2.jpg", "destinations/gurez-3.jpg"]),
        t.d(3, "Shepherd ridge trek Dawar", [
          "File:Gurez Valley 08.jpg",
          "File:Landscape, Gurez.jpg",
        ], ["destinations/lolab-2.jpg"]),
        t.d(4, "Descend Bandipora Srinagar", [
          "File:Bandipora Kashmir.jpg",
          "File:Wular lake bandipora.jpg",
          "File:Mountains in Bandipora.jpg",
        ], ["destinations/wular-lake.jpg"]),
        t.d(5, "Srinagar airport departure", [
          "File:Sheikh Ul Alam International Airport Srinagar.jpg",
          "File:Srinagar airport terminal Kashmir.jpg",
          "File:Jammu and Kashmir Srinagar aerial.jpg",
        ], ["destinations/kashmir-3.jpg", "destinations/srinagar-4.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "naranag-gangabal-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Gangabal alpine lake Harmukh Kashmir trek", [
          "File:GangbalPanorama.jpg",
          "File:Nundkol and Gangabal Lakes of Kashmir.jpg",
          "File:Gangabal Lake, India, by George Strahan.jpg",
          "File:Harmukh.jpg",
        ], ["destinations/naranag.jpg", "destinations/kashmir.jpg"]),
        t.g(1, "Naranag ancient temple trailhead", [
          "File:Wangath Temple Complex, Naranag, Jammu and Kashmir, India.jpg",
          "File:8th century Bhutesa temples group, Naranag, Jammu & Kashmir.jpg",
          "File:Group of Ancient Temples, Naranag, Jammu and Kashmir.jpg",
        ], ["destinations/naranag-2.jpg"]),
        t.g(2, "Gangbal lake shore alpine Kashmir", [
          "File:Gangbal Lake.jpg",
          "File:Gangbal, Kashmir.jpg",
          "File:GangbalPanorama1.jpg",
        ], ["destinations/kashmir-2.jpg"]),
        t.g(3, "Harmukh peak view Gangabal trek", [
          "File:Gangabal Lake 13970520 16.jpg",
          "File:Gangabal Lake 13970520 09.jpg",
          "File:Gangabal Lake 13970520 04.jpg",
        ], ["destinations/kashmir.jpg"]),
        t.g(4, "Meadow ascent Trunkhol camp route", [
          "File:Gangabal Lake 13970520 07.jpg",
          "File:Gangabal Lake 13970520 01.jpg",
          "File:Gangabal Lake 13970520 15.jpg",
        ], ["destinations/naranag-3.jpg"]),
        t.d(1, "Srinagar drive Naranag temple", [
          "File:Ancient Temple 1, Naranag.jpg",
          "File:Naranag temple ganderbal.jpg",
        ], ["destinations/naranag.jpg"]),
        t.d(2, "Climb Trunkhol meadow camp", [
          "File:Naranag11.jpg",
          "File:Ancient Temple, Naranag, Jammu and Kashmir, India.jpg",
        ], ["destinations/naranag-4.jpg"]),
        t.d(3, "Gangabal Lake Nundkol day", [
          "File:Shiva shrine, Gangabal Lake (cropped).jpg",
          "File:Gangabal Lake 13970520 15.jpg",
        ], ["destinations/kashmir-3.jpg"]),
        t.d(4, "Granite steps descent Srinagar", [
          "File:Dal Lake, Srinagar at Dusk.jpg",
          "File:Boats on Dal Lake, Srinagar during Sunset.jpg",
          "File:Kangan Kashmir valley road.jpg",
        ], ["destinations/srinagar-5.jpg"]),
        {
          ...t.d(5, "Airport drop Srinagar", [], [
            "destinations/naranag-4.jpg",
            "destinations/kashmir-5.jpg",
          ]),
          skipSearch: true,
        },
      ],
    };
  })(),
  (() => {
    const slug = "dwarka-somnath-gujarat-temple-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Dwarkadhish Temple Dwarka Gujarat", [
          "File:Dwarkadhish Temple, Dwarka, Gujarat.JPG",
          "File:Dwarakadhish Temple Of Lord Krishna, At Dwarka, Gujarat..JPG",
          "File:Dwarkadhish Temple 20.jpg",
          "File:Guj21 Dwarka Dwarkadhish Temple from Sudama Setu.jpg",
        ]),
        t.g(1, "Bet Dwarka Sudarshan Setu island", [
          "File:Sudarshan setu dwarka bet.jpg",
          "File:Hanuman Temple at Bhent Dwarka.JPG",
          "File:Guj21 Bet Dwaraka Shree Golden Dwarka Holy Place exhibits.jpg",
          "File:Bet Dwarka during Dwaraka DWARASPDB 2015 (49).jpg",
        ]),
        t.g(2, "Somnath Jyotirlinga Prabhas Patan", [
          "File:Ancient Somnath temple, Veraval Gujarat.jpg",
          "File:Somnath Jyotirling Temple, Gujarat 01.jpg",
          "File:Shree Somnath Temple.jpg",
        ]),
        t.g(3, "Nageshwar Jyotirlinga Gujarat", [
          "File:श्री नागेश्वर ज्योतिर्लिंग मंदिर.jpg",
          "File:Guj21 Nageshwar pond Grey heron 1.jpg",
          "File:Guj21 Nageshwar pond Great egret.jpg",
        ]),
        t.g(4, "Dwarka temple towers Mul Dwarka", [
          "File:Dwarkadhish Group of Temples Mul Dwarka-Dwarka-Gujarat-DSC 0241.jpg",
          "File:N-GJ-126 Dwarkadhish Temple, Dwarka Temple Tower Closeup.jpg",
          "File:Dwarka - Temple 1.jpg",
        ]),
        t.d(1, "Arrive drive Dwarka darshan", [
          "File:Dwarka - Temple 2.jpg",
          "File:DWARKADHISH TEMPLE.jpg",
          "File:Dwarkadhish Group of Temples Mul Dwarka-Dwarka-Gujarat-DSC 0240.jpg",
        ]),
        t.d(2, "Bet Dwarka ferry Nageshwar", [
          "File:Bet Dwarka during Dwaraka DWARASPDB 2015 (53).jpg",
          "File:Guj21 Nageshwar pond Grey heron 2.jpg",
        ]),
        t.d(3, "Somnath Jyotirlinga sea pradakshina", [
          "File:Somnath temple Gujarat India.jpg",
          "File:Surya temple, Somnath Veraval Gujarat.jpg",
          "File:Somanath mandir (cropped).jpg",
        ]),
        t.d(4, "Coastal drive Veraval Rajkot belt", [
          "File:\"Aerial view of Somnath temple 01, Prabhas Patan Gujarat.jpg",
          "File:Somnath temple Prabhas Veraval Gujarat, artwork 1 with captions.jpg",
        ]),
        t.d(5, "Departure Rajkot Ahmedabad airport", [
          "File:N-GJ-126 Dwarkadhish Temple, Dwarka Flag Hoisting.jpg",
          "File:Sujay Chatterjee at Somnath Temple, 2024.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "rameswaram-temple-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Ramanathaswamy Temple corridor Rameswaram", [
          "File:The great corridor at Rameswaram Ramanathaswamy Temple.jpg",
          "File:Ramanathaswamy Temple.jpg",
          "File:Ramanathaswamy Temple Rameswaram (2).jpg",
          "File:Ramanathaswamy Temple night view.jpg",
        ]),
        t.g(1, "Temple shore gopuram Rameswaram", [
          "File:Ramanathaswamy Temple Shore 01.jpg",
          "File:Ramanathaswamy Temple Shore 03.jpg",
          "File:Ramanathaswamy Temple Shore 05.jpg",
        ]),
        t.g(2, "Pamban bridge Rameswaram island", [
          "File:New Pamban Bridge Rameswaram 2024.jpg",
          "File:Pamban Bridge, Rameswaram 1.jpg",
          "File:Rameswaram bridge Pamban bridge.jpg",
        ]),
        t.g(3, "Dhanushkodi coast ghost town", [
          "File:Dhanushkodi Beach.jpg",
          "File:Dhanushkodi ruins Tamil Nadu.jpg",
          "File:Dhanushkodi church ruins.jpg",
        ]),
        t.g(4, "Rameswaram island harbour Tamil Nadu", [
          "File:Rameswaram harbour.jpg",
          "File:Rameswaram coral beach.jpg",
          "File:Kothandaramar temple.jpg",
        ]),
        t.d(1, "Madurai Pamban drive Rameswaram", [
          "File:Ramanathaswamy Temple Rameswaram (1).jpg",
          "File:Ramanathaswamy Temple Rameswaram (3).jpg",
        ]),
        t.d(2, "Jyotirlinga darshan theertham corridor", [
          "File:Villonditheertham rameswaram.jpg",
          "File:Arulmuguramapata temple view3.jpg",
        ]),
        t.d(3, "Dhanushkodi jeep Gandhamadhana", [
          "File:Thirupuramkundaram temple.jpg",
        ]),
        t.d(4, "Return Madurai Meenakshi", [
          "File:Madurai Meenakshi Amman Temple.jpg",
          "File:Meenakshi temple Madurai.jpg",
        ]),
        t.d(5, "Madurai airport departure", [
          "File:Madurai Airport.jpg",
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
    console.log(`\nBatch 7 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});