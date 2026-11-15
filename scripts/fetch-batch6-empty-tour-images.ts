/**
 * Batch 6 — Puri, Udaipur honeymoon, Ooty family/nilgiris, Pangong camp, Darjeeling, Pondy, Rishikesh yoga.
 *
 *   npx tsx scripts/fetch-batch6-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch6-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch6-empty-tour-images.ts --only puri-jagannath-darshan
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
    const slug = "puri-jagannath-darshan";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Jagannath Temple Puri Odisha pilgrimage", [
          "File:Jagannath Temple, Puri 04.jpg",
          "File:Jagannath Temple, Puri 03.jpg",
          "File:Lord Jagannath temple at night.jpg",
          "File:Jagannath Temple, Puri 06.jpg",
        ]),
        t.g(1, "Konark Sun Temple stone wheels Odisha", [
          "File:Sun Temple Main Structure, Konark, Orissa.jpg",
          "File:Konark Sun Temple Puri district, Odisha, India 3.jpg",
          "File:Wheel engraved in the 13th century built Konark Sun Temple in Orissa, India.jpg",
        ]),
        t.g(2, "Puri sea beach Bay of Bengal", [
          "File:People at the Puri Beach in Puri, Odisha 15.jpg",
          "File:At Puri beach 05.jpg",
          "File:Decorated one-humped Camel, Camelus dromedarius, at Puri Sea Beach, Odisha, India.jpg",
        ]),
        t.g(3, "Lingaraj Temple Bhubaneswar Odisha", [
          "File:Lingaraj Temple Complex - Odisha - IX.jpg",
          "File:Lingaraj Temple Complex - Odisha - XI.jpg",
          "File:Lingaraj Temple Complex - Odisha - XVI.jpg",
        ]),
        t.g(4, "Konark temple sculptures Odisha heritage", [
          "File:13th Century stone curvings at Konark Sun Temple Puri district, Odisha, India.jpg",
          "File:Closeup of the center of a stone wheel - Konark Sun Temple, Orissa, India.jpg",
          "File:Stone wheel engraved in the 13th century built Konark Sun Temple in Orissa, India.jpg",
        ]),
        t.d(1, "Bhubaneswar pickup drive Puri", [
          "File:Lingaraj Temple Complex - Odisha - XVIII.jpg",
          "File:Lingaraj Temple Complex - Odisha - XVII.jpg",
          "File:Lingaraj Temple Complex - Odisha - XIII.jpg",
        ]),
        t.d(2, "Jagannath darshan Puri temple", [
          "File:Jagannath Temple, Puri 09.jpg",
          "File:Jagannath Temple, Puri 08.jpg",
          "File:Jagannath Temple, Puri 02.jpg",
        ]),
        t.d(3, "Konark Sun Temple day trip", [
          "File:13th Century sculptures at Konark Sun Temple Puri district, Odisha, India.jpg",
          "File:13th Century stone curvings at Konark Sun Temple Puri district, Odisha, India 5.jpg",
          "File:Sun Temple Main Structure, Konark, Orissa.jpg",
        ]),
        t.d(4, "Departure Bhubaneswar BBI airport", [
          "File:People at the Puri Beach in Puri, Odisha 05.jpg",
          "File:People at the Puri Beach in Puri, Odisha 01.jpg",
          "File:At Puri beach 04.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "udaipur-romantic-palace-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Monsoon Palace Sajjangarh Udaipur honeymoon", [
          "File:Sajjangarh Monsoon Palace at dusk, Udaipur, Rajasthan, India.jpg",
          "File:Monsoon palace udaipur.jpg",
          "File:Udaipur from Sajjangarh fort.jpg",
          "File:Sajjangarh fort, Udaipur.jpg",
        ]),
        t.g(1, "Fateh Sagar Lake Udaipur romantic", [
          "File:Fateh Sagar Lake, Udaipur, Rajasthan.jpg",
          "File:Fateh Sagar Lake Udaipur Rajasthan.jpg",
          "File:Fateh Sagar Lake Udaipur.jpg",
        ]),
        t.g(2, "Ambrai Ghat Lake Pichola evening", [
          "File:Ambrai ghat at evening.jpg",
          "File:Ambrai Ghat Night Life.jpg",
          "File:Ambrai ghat.jpg",
        ]),
        t.g(3, "Lake Palace Taj Udaipur romantic", [
          "File:Taj Lake Palace Udaipur from City Palace.jpg",
          "File:20191207 Lake Pichola, Udaipur, 1652 7315.jpg",
          "File:20191207 Zachód słońca nad jeziorem Pichola w Udajpurze 1733 7352.jpg",
        ]),
        t.g(4, "City Palace courtyards Udaipur heritage", [
          "File:20191207 City Palace, Udaipur 1701 7325.jpg",
          "File:City Palace Udaipur Rajasthan India.JPG",
          "File:View of Udaipur from City Palace.jpg",
        ]),
        t.d(1, "Arrive Udaipur lake-view hotel", [
          "File:Fateh Sagar Lake, Udaipur1.jpg",
          "File:Udaipur-Fateh Sagar-08-2018-gje.jpg",
          "File:Udaipur ni20-42.jpg",
        ]),
        t.d(2, "City Palace Jagdish lane candlelit dinner", [
          "File:20191207 Lake Pichola, Udaipur, 1531 7276.jpg",
          "File:Jag Mandir, Udaipur, 20191207 1428 7201.jpg",
          "File:Pichola lake sunset.JPG",
        ]),
        t.d(3, "Saheliyon ki Bari Monsoon Palace views", [
          "File:Window at Sajjangarh fort, udaipur.jpg",
          "File:Sajjangarh - Rajasthan - 20170701141432 IMG 4939-01.jpg",
          "File:Saheliyon-ki-Bari (Udaipur, Rajasthan).jpg",
        ]),
        t.d(4, "Departure Maharana Pratap Airport UDR", [
          "File:Shiv Niwas Palace, Udaipur, 20191207 1408 7142.jpg",
          "File:Udaipur city Rajasthan.jpg",
          "File:City of lakes.jpeg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "ooty-coonoor-family-hills";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Ooty Botanical Garden Nilgiri family hills", [
          "File:Front Gate House Botanical Garden Ooty Aug26 A7CR 12481-2 Pano.jpg",
          "File:Sunken Garden Botanical Garden Ooty Aug26 A7CR 12465.jpg",
          "File:Botanical Gardens - Ootacamund (Ooty) - India 03.JPG",
          "File:Toda Hut Botanical Garden Ooty Aug26 A7CR 12469.jpg",
        ]),
        t.g(1, "Ooty Lake boating family", [
          "File:Boating, Ooty Lake 04.jpg",
          "File:Boating, Ooty Lake 01.jpg",
          "File:Boat House, Ooty Lake.jpg",
        ]),
        t.g(2, "Doddabetta peak viewpoint Ooty", [
          "File:Doddabetta viewOf Ooty 1.jpg",
          "File:Doddabetta Peak View Point in Ooty,Tamil Nadu.JPG",
          "File:View from the Doddabetta Peak - Ooty,Tamil Nadu.JPG",
          "File:Panoramic view of Doddabetta peak with the telescope house.jpg",
        ]),
        t.g(3, "Sim Park Coonoor Nilgiris", [
          "File:Sim's Park Coonoor 01.jpg",
          "File:Sim's Park in Coonoor.JPG",
          "File:Sim's Park, Coonoor, Tamil Nadu, India.jpg",
        ]),
        t.g(4, "Lamb Rock Coonoor viewpoint", [
          "File:Lamb's Rock, Coonoor, Tamil Nadu, India.jpg",
          "File:Lamb's Rock.jpg",
          "File:View from Lamb's Rock.jpg",
        ]),
        t.d(1, "Coimbatore drive Ooty botanical gardens", [
          "File:Botanical garden-14-ooty-India.jpg",
          "File:Botanical garden-65-ooty-India.jpg",
          "File:Botanical Garden, Ooty - vrvvkbjk2k23pxl (5).jpg",
        ]),
        t.d(2, "Ooty Lake toy train Doddabetta", [
          "File:White horses for ride at Ooty lake boat house-Nilgiris.jpg",
          "File:Boating, Ooty Lake 03.jpg",
          "File:Ticket counter, Boat House, Ooty Lake.jpg",
        ]),
        t.d(3, "Coonoor Sim Park Lamb Rock day", [
          "File:Botanical garden-68-ooty-India.jpg",
          "File:Selfie spot, Ooty Lake 2.jpg",
          "File:Boating, Ooty Lake 02.jpg",
        ]),
        t.d(4, "Departure Coimbatore CJB", [
          "File:Doddabetta Peak, Ooty, Tamil Nadu, India.jpg",
          "File:Botanical Gardens - Ootacamund (Ooty) - India 03.JPG",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "pangong-lake-shore-camping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Pangong Tso shore camp Ladakh", [
          "File:Pangong Lake, Ladakh, India 07.jpg",
          "File:Pangong Lake, Ladakh, India 04.jpg",
          "File:Pangong Tso in eastern Ladakh(Changthang).jpg",
          "File:Pangong Tso 2.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(1, "Pangong lake colours Spangmik Ladakh", [
          "File:Panoramic view of Pnagong lake, Pangong Tso, view form Spangmik area, july 2022.jpg",
          "File:Some of the peaks aroung the Pangong Tso at Spangmik (10035185326).jpg",
          "File:Pangong Lake, Ladakh, India 05.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(2, "Chang La pass Ladakh gateway Pangong", [
          "File:Chang La (pass), Ladakh.jpg",
          "File:Khurdung La Pass.jpg",
          "File:Chang La (pass), Checkpoint, Ladakh, North India.jpg",
        ]),
        t.g(3, "Leh acclimatization Indus valley", [
          "File:Indus Valley near Leh.jpg",
          "File:Flora at pngong lake in leh ladakh.jpg",
          "File:Tree near pangong lake in leh ladakh.jpg",
        ]),
        t.g(4, "Pangong lakeside camp tents Ladakh", [
          "File:Pangong Lake 3.jpg",
          "File:Pangong Lake, Ladakh, India 06.jpg",
          "File:Pangong Lake, Ladakh, India 01.jpg",
        ]),
        t.d(1, "Arrive Leh rest acclimatisation", [
          "File:Leh, Ladakh, India.jpg",
          "File:Ladakh Range 01.jpg",
          "File:Leh Palace Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(2, "Leh to Pangong shore camp", [
          "File:En route Pangong Lake from Leh, Ladakh, India.jpg",
          "File:Road to Pangong Tso Ladakh.jpg",
          "File:Pangong Lake Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(3, "Sunrise Pangong return Leh", [
          "File:Pangong Lake in Ladakh.jpg",
          "File:Morning at Pangong Lake.jpg",
          "File:Ladakh Pangong lake view.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(4, "Departure Leh airport IXL", [
          "File:Leh Kushok Bakula Rimpochee Airport terminal.jpg",
          "File:Airport Leh Ladakh mountains.jpg",
          "File:Leh airfield Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "darjeeling-tea-hills";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Darjeeling tea hills Kanchenjunga West Bengal", [
          "File:Darjeeling tea gardens.jpg",
          "File:Tea Plantation in Darjeeling.jpg",
          "File:Happy Valley Tea Estate Darjeeling.jpg",
          "File:Darjeeling hill town view.jpg",
        ]),
        t.g(1, "Tiger Hill sunrise Darjeeling", [
          "File:Sunrise at Tiger Hill, Darjeeling.jpg",
          "File:Tiger Hill Darjeeling sunrise.jpg",
          "File:Tiger Hill View Point Darjeeling.jpg",
        ]),
        t.g(2, "Happy Valley tea estate Darjeeling", [
          "File:Happy Valley Tea Estate, Darjeeling.jpg",
          "File:Tea leaves Darjeeling estate.jpg",
          "File:Darjeeling Tea Garden.jpg",
        ]),
        t.g(3, "Darjeeling Himalayan Railway toy train", [
          "File:Train-toy-final-2-720.jpg",
          "File:Darjeeling Himalayan Railway at Ghum station.jpg",
          "File:Darjeeling toy train.jpg",
        ]),
        t.g(4, "Japanese Peace Pagoda Darjeeling", [
          "File:Japanese Peace Pagoda, Darjeeling, West Bengal 03.jpg",
          "File:Peace Pagoda, Darjeeling, West Bengal, India.jpg",
          "File:Japanese Peace Pagoda, Darjeeling, Full view.jpg",
        ]),
        t.d(1, "Bagdogra drive Darjeeling hills", [
          "File:Darjeeling city view.jpg",
          "File:Darjeeling town West Bengal.jpg",
          "File:View of Darjeeling.jpg",
        ]),
        t.d(2, "Tea estate tasting toy train", [
          "File:Batasia Loop Darjeeling.jpg",
          "File:Ghoom railway station Darjeeling.jpg",
          "File:Japanese Peace Pagoda, Darjeeling, West Bengal 11.jpg",
        ]),
        t.d(3, "Tiger Hill Peace Pagoda optional", [
          "File:Japanese Peace Pagoda, Darjeeling, West Bengal 20.jpg",
          "File:Buddhist Temple Peace Pagoda Darjeeling West Bengal India (10).JPG",
          "File:Observatory Hill Darjeeling.jpg",
        ]),
        t.d(4, "Departure Bagdogra IXB", [
          "File:Darjeeling Himalayan Railway.jpg",
          "File:Darjeeling railway station.jpg",
          "File:Darjeeling tea plantation hills.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "ooty-coonoor-nilgiris";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Rose Garden Ooty Nilgiris leisure", [
          "File:Government Rose Garden, Ooty, Tamil Nadu, India.jpg",
          "File:Rose Garden, Ooty 4.jpg",
          "File:Rose Garden, Ooty 10.jpg",
          "File:Papagena rose ooty gardens.jpg",
        ]),
        t.g(1, "Ooty rose gardens terraces", [
          "File:Rose Garden, Ooty 2.jpg",
          "File:Rose Garden, Ooty 1.jpg",
          "File:Rose Garden, Ooty 10.jpg",
        ]),
        t.g(2, "Nilgiri Mountain Railway Coonoor", [
          "File:Nilgiri Mountain Railway-Coonoor Railway Station-WUS05885.jpg",
          "File:Nilgiri Mountain Railway-Coonoor Railway Station-WUS05886.jpg",
          "File:Coonoor railway station train.jpg",
        ]),
        t.g(3, "Dolphin Nose Coonoor ridge view", [
          "File:Dolphin's Nose, Coonoor, Nilgiris District, Tamil Nadu, India.jpg",
          "File:Dolphin Nose ViewPoint Coonoor TamilNadu India.jpg",
          "File:View from the Dolphin Peak in Ooty,Tamil Nadu.JPG",
        ]),
        t.g(4, "Coonoor valley Nilgiri viewpoints", [
          "File:Coonoor - കൂന്നൂർ 06.jpg",
          "File:Nilgiri Mountain Railway-Coonoor Railway Station-WUS05890.jpg",
          "File:Nilgiri Mountain Railway-Coonoor Railway Station-WUS05887.jpg",
        ]),
        t.d(1, "Hill transfer Ooty lake walk", [
          "File:Ooty Lake in Tamil Nadu 01.jpg",
          "File:Ooty Lake in Tamil Nadu 03.jpg",
          "File:Emerald Lake Ooty - panoramio.jpg",
        ]),
        t.d(2, "Botanical Garden tea factory Ooty", [
          "File:Ooty Lake in Tamil Nadu 04.jpg",
          "File:SW Marlimund Lake Ooty Aug25 A7CR 07269.jpg",
          "File:Nilgiri Biosphere Reserve-Doddabetta-WUS06042.jpg",
        ]),
        t.d(3, "Toy train Coonoor viewpoints", [
          "File:Nilgiri Mountain Railway-Coonoor Railway Station-WUS05887.jpg",
          "File:Monkey in Dolphin's Nose.jpg",
          "File:Sumi Image-20160606.jpg",
        ]),
        t.d(4, "Departure Coimbatore CJB", [
          "File:Ooty Lake in Tamil Nadu 06.jpg",
          "File:Marlimund Lake Ooty Nilgiris Dec15 DSC01213.jpg",
          "File:Ooty Lake in Tamil Nadu 05.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "pondicherry-french-escape";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Pondicherry White Town French quarter", [
          "File:French Quarter Pondicherry.jpg",
          "File:Pondicherry White Town heritage street.jpg",
          "File:French War Memorial-1-white town-pondicherry-India.jpg",
          "File:Raj Nivas Puducherry.jpg",
        ]),
        t.g(1, "Matrimandir Auroville visitor centre", [
          "File:Matrimandir, Auroville 01.jpg",
          "File:Matrimandir, Auroville 03.jpg",
          "File:Matrimandir Auroville Pondicherry.jpg",
        ]),
        t.g(2, "Promenade Rock Beach Pondicherry", [
          "File:Pondicherry, Promenade Beach, Rock Beach, India.jpg",
          "File:Rock Beach in Puducherry.jpg",
          "File:Pondicherry rock beach.jpg",
        ]),
        t.g(3, "French War Memorial Promenade", [
          "File:French War Memorial-3-white town-pondicherry-India.jpg",
          "File:First world war memorial Pondicherry 01.jpg",
          "File:French war memorial.jpg",
        ]),
        t.g(4, "White Town café lanes Puducherry", [
          "File:French War memorial.JPG",
          "File:First world war memorial Pondicherry 02.jpg",
          "File:Pondicherry-Rock beach aerial view.jpg",
        ]),
        t.d(1, "Chennai coastal drive White Town walk", [
          "File:French War Memorial-1-white town-pondicherry-India.jpg",
          "File:Matrimandir-auroville-tamilnadu-india.jpg",
          "File:Matrimandir, Auroville 02.jpg",
        ]),
        t.d(2, "Auroville Matrimandir beach afternoon", [
          "File:Rock beach night harbor.jpg",
          "File:Pondicherry rock beach.jpeg",
          "File:Golden Mosaic.jpg",
        ]),
        t.d(3, "French quarter Promenade cycling", [
          "File:Gandhi statue on Promenade on the coast in Pondicherry.JPG",
          "File:Puducherry-Mahatma Gandhi Statue-WUS02339.jpg",
          "File:La promenade du bord de mer (Pondichéry, Inde) (13995096815).jpg",
        ]),
        t.d(4, "Departure Chennai MAA", [
          "File:Pondicherry-Rock beach aerial view.jpg",
          "File:First world war memorial Pondicherry 01.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "rishikesh-yoga-ganga-retreat";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Yoga retreat Ganga Rishikesh Uttarakhand", [
          "File:I am the Eggman, Beatles Ashram, Rishikesh, India (front).jpg",
          "File:Beatles Ashram 02.jpg",
          "File:Beatles Ashram 03.jpg",
          "File:Beatles Ashram Satsang Hall Rishikesh.JPG",
        ], ["destinations/rishikesh.jpg"]),
        t.g(1, "Parmarth Niketan ashram Ganga ghat", [
          "File:Parmarth Niketan.jpg",
          "File:Parmarth Niketan Ashram.jpg",
          "File:Ganga Aarti preparation at Parmarth Niketan, Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(2, "Beatles Ashram Chaurasi Kutiya murals", [
          "File:Beatles Ashram 01.jpg",
          "File:Beatles Ashram Satsang Hall Rishikesh.JPG",
          "File:Graffiti in the abandoned Mahesh Yogi's Ashram Muni-ki-Reti mostly by Beatles fans DSCN0010.jpg",
          "File:Beatles Ashram At Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(3, "Kundalini yoga class Ganga bank Rishikesh", [
          "File:Kundalini Yoga Class near the bank of ganga river.jpg",
          "File:Graffiti in the abandoned Mahesh Yogi's Ashram Muni-ki-Reti mostly by Beatles fans DSCN0011.jpg",
          "File:A cave at Beatles Ashram at Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(4, "Ganga foothills meditation terrace Rishikesh", [
          "File:Graffiti in the abandoned Mahesh Yogi's Ashram Muni-ki-Reti mostly by Beatles fans DSCN0008.jpg",
          "File:Beatles Ashram 03.jpg",
          "File:Beatles Ashram At Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(1, "Arrive Rishikesh Ganga aarti evening", [
          "File:Evening praying time at Parmarth Niketan ghat, by the Ganges, Rishikesh.jpg",
          "File:India - Rishikesh - 018 - evening on the ghats (2090623627).jpg",
          "File:Evening prayers on the banks of Ganges, Muni ki Reti, Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(2, "Morning yoga Beatles Ashram walk", [
          "File:Chris Dyer painting his I am the Eggman Beatles Ashram Mural.jpg",
          "File:I am the Eggman, Beatles Ashram, Rishikesh, India.jpg",
          "File:Beatles Ashram Satsang Hall Rishikesh.JPG",
        ], ["destinations/rishikesh.jpg"]),
        t.d(3, "Neelkanth optional waterfall spa day", [
          "File:Neelkanth Mahadev Temple, Rishikesh.jpg",
          "File:Neelkanth temple near Rishikesh.jpg",
          "File:Graffiti in the abandoned Mahesh Yogi's Ashram Muni-ki-Reti mostly by Beatles fans DSCN0010.jpg",
        ], ["destinations/rishikesh.jpg", "destinations/uttarakhand.jpg"]),
        t.d(4, "Closing yoga Dehradun Haridwar drop", [
          "File:Mussoorie range from Dehradun.jpg",
          "File:Ganges in Haridwar.jpg",
          "File:Haridwar ghats.jpg",
        ], ["destinations/dehradun.jpg", "destinations/haridwar.jpg"]),
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
    console.log(`\nBatch 6 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
