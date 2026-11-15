/**
 * Batch 3 — place-matched unique images for spiritual, honeymoon, and camp empty tours.
 *
 *   npx tsx scripts/fetch-batch3-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch3-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch3-empty-tour-images.ts --only haridwar-rishikesh-spiritual-escape
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
    const slug = "haridwar-rishikesh-spiritual-escape";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Har Ki Pauri Ganga aarti Haridwar Uttarakhand", [
          "File:Har Ki Pauri.jpg",
          "File:Har Ki Pauri, Haridwar.jpg",
          "File:Ganga Aarti at Har ki Pauri.jpg",
          "File:Evening Ganga Aarti at Hari Ki Pauri, Haridwar (44781251182).jpg",
        ], ["destinations/haridwar.jpg", "destinations/uttarakhand.jpg"]),
        t.g(1, "Haridwar Ganga ghats pilgrimage", [
          "File:Haridwar ghats.jpg",
          "File:Ganges in Haridwar.jpg",
          "File:Haridwar - Varanasi.JPG",
        ], ["destinations/haridwar.jpg"]),
        t.g(2, "Mansa Devi temple Haridwar hill", [
          "File:Mansa Devi Temple Haridwar.jpg",
          "File:Mansa Devi Temple, Haridwar.jpg",
          "File:Mansa Devi Mandir Haridwar.jpg",
        ], ["destinations/haridwar.jpg"]),
        t.g(3, "Parmarth Niketan Rishikesh Ganga ghat", [
          "File:Parmarth Niketan.jpg",
          "File:Parmarth Niketan Ashram.jpg",
          "File:Evening Ganga Aarti at Parmarth Niketan, Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(4, "Ram Jhula suspension bridge Rishikesh", [
          "File:Ram Jhula bridge Rishikesh.jpg",
          "File:Ram Jhula, Rishikesh.jpg",
          "File:Ram Jhula on the Ganges in Rishikesh Uttarakhand.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(1, "Har Ki Pauri evening aarti Haridwar", [
          "File:Haridwar Evening Aarti.jpg",
          "File:Twilight Aarti on the banks of the Ganges River, Haridwar, India.jpg",
          "File:A night time shot at Har-ki-Pauri, Haridwar.jpg",
        ], ["destinations/haridwar.jpg"]),
        t.d(2, "Rishikesh Tapovan Ganga aarti", [
          "File:Ganga Aarti at Triveni Ghat Rishikesh Uttarakhand India.jpg",
          "File:Triveni Ghat - Rishikesh.jpg",
          "File:Trivenighat.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(3, "Beatles Ashram Rishikesh murals", [
          "File:Beatles Ashram Rishikesh.jpg",
          "File:Maharishi Mahesh Yogi Ashram.jpg",
          "File:The Beatles Ashram.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(4, "Neelkanth Mahadev temple forest Rishikesh", [
          "File:Neelkanth Mahadev Temple.jpg",
          "File:Neelkanth temple near Rishikesh.jpg",
          "File:Neelkanth Mahadev Temple, Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg", "destinations/uttarakhand.jpg"]),
        t.d(5, "Dehradun Jolly Grant airport departure Uttarakhand", [
          "File:Dehradun city Uttarakhand.jpg",
          "File:Dehradun Valley.jpg",
          "File:Mussoorie range from Dehradun.jpg",
        ], ["destinations/dehradun.jpg", "destinations/uttarakhand.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "mathura-vrindavan-agra-circuit";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Prem Mandir Vrindavan white temple Braj", [
          "File:Prem Mandir, Vrindavan.jpg",
          "File:Prem Mandir (Vrindavan).jpg",
          "File:Prem Mandir Vrindavan lights.jpg",
          "File:Prem Mandir Vrindavan night.jpg",
        ]),
        t.g(1, "Shri Krishna Janmabhoomi Mathura", [
          "File:Krishna Janmabhoomi Mathura.jpg",
          "File:Krishna Janmasthan Temple Complex.jpg",
          "File:Mathura Krishna Janmabhoomi.jpg",
        ]),
        t.g(2, "Banke Bihari Temple Vrindavan", [
          "File:Banke Bihari Temple, Vrindavan.jpg",
          "File:Banke Bihari Mandir Vrindavan.jpg",
          "File:Banke Bihari Temple Vrindavan India.jpg",
        ]),
        t.g(3, "ISKCON temple Vrindavan", [
          "File:ISKCON Vrindavan.jpg",
          "File:ISKCON temple Vrindavan.jpg",
          "File:Sri Sri Krishna Balaram Mandir Vrindavan.jpg",
        ]),
        t.g(4, "Yamuna ghats Vishram Ghat Mathura", [
          "File:Vishram Ghat Mathura.jpg",
          "File:Yamuna River Mathura.jpg",
          "File:Ghats of Mathura.jpg",
        ]),
        t.d(1, "Mathura Janmabhoomi Vishram Ghat", [
          "File:Shri Krishna Janmasthan.jpg",
          "File:Mathura city Uttar Pradesh.jpg",
          "File:Krishna temple Mathura.jpg",
        ]),
        t.d(2, "Vrindavan temple circuit Banke Bihari", [
          "File:Vrindavan temples.jpg",
          "File:Vrindavan, Uttar Pradesh.jpg",
          "File:Temples in Vrindavan.jpg",
        ]),
        t.d(3, "Govardhan hill parikrama Braj", [
          "File:Govardhan Hill.jpg",
          "File:Govardhan parikrama.jpg",
          "File:Giriraj Govardhan.jpg",
        ]),
        t.d(4, "Taj Mahal Agra sunrise", [
          "File:Taj Mahal, Agra, India.jpg",
          "File:Taj Mahal in Agra.jpg",
          "File:Taj Mahal Uttar Pradesh India.jpg",
        ]),
        t.d(5, "Agra Fort departure circuit", [
          "File:Agra Fort.jpg",
          "File:Agra fort Taj view.jpg",
          "File:Red Fort Agra.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "ajmer-sharif-pushkar-darshan";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Ajmer Sharif Dargah Khwaja Moinuddin Chishti", [
          "File:Ajmer Sharif Dargah.jpg",
          "File:Dargah Sharif Ajmer.jpg",
          "File:Ajmer Sharif mosque.jpg",
          "File:Shrine of Khwaja Moinuddin Chishti.jpg",
        ]),
        t.g(1, "Dargah Sharif courtyard Ajmer", [
          "File:Ajmer Dargah entrance.jpg",
          "File:Gate of Dargah Ajmer Sharif.jpg",
          "File:Dargah Sharif Ajmer Rajasthan.jpg",
        ]),
        t.g(2, "Ana Sagar lake Ajmer Rajasthan", [
          "File:Ana Sagar Lake Ajmer.jpg",
          "File:Ana Sagar Lake.jpg",
          "File:Ana Sagar Baradari Ajmer.jpg",
        ]),
        t.g(3, "Adhai Din Ka Jhonpra Ajmer", [
          "File:Adhai Din Ka Jhonpra.jpg",
          "File:Adhai Din Ka Jhonpra, Ajmer.jpg",
          "File:Adhai Din-ka-Jhonpra Mosque Ajmer.jpg",
        ]),
        t.g(4, "Pushkar Brahma Temple ghats", [
          "File:Pushkar Lake.jpg",
          "File:Pushkar ghats.jpg",
          "File:Brahma Temple Pushkar.jpg",
        ]),
        t.d(1, "Arrive Ajmer Dargah Sharif", [
          "File:Ajmer city Rajasthan.jpg",
          "File:Ajmer Sharif at night.jpg",
          "File:Dargah bazaar Ajmer.jpg",
        ]),
        t.d(2, "Ajmer Dargah ziarat Ana Sagar", [
          "File:Urs festival Ajmer Sharif.jpg",
          "File:Ana Sagar sunset Ajmer.jpg",
          "File:Baradari at Ana Sagar.jpg",
        ]),
        t.d(3, "Pushkar lake Brahma temple", [
          "File:Pushkar fair lake.jpg",
          "File:Pushkar Rajasthan holy lake.jpg",
          "File:Pushkar Brahma mandir.jpg",
        ]),
        t.d(4, "Jaipur airport departure Rajasthan", [
          "File:Jaipur city skyline.jpg",
          "File:Jaipur Pink City.jpg",
          "File:Hawa Mahal Jaipur.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "ujjain-mahakaleshwar-darshan";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Mahakaleshwar Jyotirlinga temple Ujjain", [
          "File:Mahakaleshwar Jyotirlinga.jpg",
          "File:Mahakaleshwar Temple Ujjain.jpg",
          "File:Mahakal Mandir Ujjain.jpg",
          "File:Shri Mahakaleshwar Temple.jpg",
        ]),
        t.g(1, "Mahakaleshwar temple shikhara Ujjain", [
          "File:Mahakaleshwar Temple.jpg",
          "File:Mahakal temple complex Ujjain.jpg",
          "File:Mahakaleshwar facade.jpg",
        ]),
        t.g(2, "Shipra River Ram Ghat Ujjain", [
          "File:Shipra River Ujjain.jpg",
          "File:Ram Ghat Ujjain.jpg",
          "File:Shipra aarti Ujjain.jpg",
        ]),
        t.g(3, "Harsiddhi Temple Ujjain", [
          "File:Harsiddhi Temple Ujjain.jpg",
          "File:Harsiddhi Mata Temple.jpg",
          "File:Harsiddhi Ujjain.jpg",
        ]),
        t.g(4, "Kal Bhairav temple Ujjain", [
          "File:Kal Bhairav Temple Ujjain.jpg",
          "File:Kal Bhairav Mandir Ujjain.jpg",
          "File:Bhairav temple Ujjain.jpg",
        ]),
        t.d(1, "Indore to Ujjain Shipra Ram Ghat aarti", [
          "File:Evening aarti Shipra River Ujjain.jpg",
          "File:Ujjain city Madhya Pradesh.jpg",
          "File:Ram ghat evening Ujjain.jpg",
        ]),
        t.d(2, "Mahakaleshwar Bhasma aarti morning darshan", [
          "File:Bhasma Aarti Mahakaleshwar.jpg",
          "File:Mahakal morning darshan.jpg",
          "File:Mahakaleshwar temple interior.jpg",
        ]),
        t.d(3, "Indore airport departure Madhya Pradesh", [
          "File:Indore city skyline.jpg",
          "File:Indore Rajwada.jpg",
          "File:Devi Ahilya Bai Holkar Airport.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "manali-honeymoon-escape";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Manali honeymoon Beas valley Himachal couples", [
          "File:Manali and Beas River.jpg",
          "File:Beas River Manali.jpg",
          "File:Manali valley honeymoon hills.jpg",
          "File:Kullu Manali scenic view.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.g(1, "Solang Valley meadow Manali", [
          "File:Solang Valley.jpg",
          "File:Solang valley summer Manali.jpg",
          "File:Solang Nala meadow.jpg",
        ], ["destinations/manali.jpg"]),
        t.g(2, "Hadimba Devi Temple deodar grove Manali", [
          "File:Hadimba Temple in Manali.jpg",
          "File:Hidimba Devi Temple Manali forest.jpg",
          "File:Deodar forest Hadimba Manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.g(3, "Vashisht hot springs village Manali", [
          "File:Vashisht hot water springs Manali.jpg",
          "File:Vashisht temple Manali.jpg",
          "File:Vashisht village Manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.g(4, "Old Manali cafés lane Beas", [
          "File:Old Manali village.jpg",
          "File:Old Manali cafes.jpg",
          "File:Manali Old Village Himachal.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(1, "Manali Mall Road arrival evening", [
          "File:Manali Mall Road.jpg",
          "File:Mall road Manali night.jpg",
          "File:Manali main market.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(2, "Solang Valley cable car meadow", [
          "File:Solang ropeway Manali.jpg",
          "File:Solang ski slopes.jpg",
          "File:Paragliding Solang Valley.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(3, "Hadimba Vashisht honeymoon day Manali", [
          "File:Manu Temple Old Manali.jpg",
          "File:Vashisht sulphur springs.jpg",
          "File:Hadimba temple Manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(4, "Naggar Castle Roerich gallery Kullu", [
          "File:Naggar Castle Kullu.jpg",
          "File:Nicholas Roerich Art Gallery Naggar.jpg",
          "File:Naggar heritage castle Himachal.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.d(5, "Bhuntar Kullu airport departure", [
          "File:Kullu valley airport Bhuntar.jpg",
          "File:Kullu Manali highway Beas.jpg",
          "File:Bhuntar airport Himachal.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "shimla-manali-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Shimla Viceregal Lodge honeymoon ridge Himachal", [
          "File:Indian Institute of Advanced Study, Shimla.jpg",
          "File:Viceregal Lodge Shimla.jpg",
          "File:Rashtrapati Niwas Shimla.jpg",
          "File:Shimla Observatory Hill.jpg",
        ], ["destinations/shimla.jpg", "destinations/himachal.jpg"]),
        t.g(1, "Jakhu Temple Hanuman Shimla", [
          "File:Jakhoo Temple Shimla.jpg",
          "File:Jakhu Temple Shimla Hanuman.jpg",
          "File:Jakhu hill Shimla.jpg",
        ], ["destinations/shimla.jpg"]),
        t.g(2, "Shimla Scandal Point Mall Road", [
          "File:Scandal Point Shimla.jpg",
          "File:Shimla GPO Mall Road.jpg",
          "File:Shimla town hall.jpg",
        ], ["destinations/shimla.jpg"]),
        t.g(3, "Kullu valley Mandi Beas river highway", [
          "File:Kullu Valley Himachal.jpg",
          "File:Mandi Himachal Pradesh valley.jpg",
          "File:Beas river Kullu Manali road.jpg",
        ], ["destinations/himachal.jpg", "destinations/manali.jpg"]),
        t.g(4, "Vashisht temple sulphur springs Manali", [
          "File:Vashisht Manali temple.jpg",
          "File:Vashisht hot springs.jpg",
          "File:Sulphur springs Vashisht.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(1, "Chandigarh to Shimla Kandaghat drive", [
          "File:Shimla highway Himachal.jpg",
          "File:Kandaghat Shimla road.jpg",
          "File:Himachal hill road Shimla.jpg",
        ], ["destinations/shimla.jpg", "destinations/himachal.jpg"]),
        t.d(2, "Shimla Kufri Himalayan Nature Park", [
          "File:Himalayan Nature Park Kufri.jpg",
          "File:Kufri winter meadow Shimla.jpg",
          "File:Kufri yak ride Shimla.jpg",
        ], ["destinations/shimla.jpg"]),
        t.d(3, "Shimla to Manali Mandi apple country", [
          "File:Mandi town Himachal.jpg",
          "File:Sundernagar lake Mandi.jpg",
          "File:National Highway 21 Mandi.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.d(4, "Solang Valley Manali optional paragliding", [
          "File:Solang Valley paragliding.jpg",
          "File:Manali Solang summer.jpg",
          "File:Zorbing Solang Manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(5, "Manu Temple Hadimba Old Manali", [
          "File:Manu Temple Manali.jpg",
          "File:Manu Rishi temple Old Manali.jpg",
          "File:Hadimba and Manu trail Manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(6, "Manali to Chandigarh plains transit", [
          "File:Rock Garden Chandigarh.jpg",
          "File:Sukhna Lake Chandigarh.jpg",
          "File:Chandigarh Capitol Complex.jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(7, "Chandigarh airport departure", [
          "File:Chandigarh airport terminal.jpg",
          "File:Chandigarh city sector.jpg",
          "File:Chandigarh India skyline.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "pawna-lake-camping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Pawna lake Lonavala Maharashtra camping sunset", [
          "File:Pawna Lake.jpg",
          "File:Pawna lake Lonavala.jpg",
          "File:Pawna Dam Lonavala.jpg",
          "File:Pawna lake camping.jpg",
        ]),
        t.g(1, "Lonavala misty Western Ghats lakes", [
          "File:Lonavala hills.jpg",
          "File:Lonavala Maharashtra Western Ghats.jpg",
          "File:Lonavala valley monsoon.jpg",
        ]),
        t.g(2, "Pawna lake shoreline tents Maharashtra", [
          "File:Pawna Lake campsite.jpg",
          "File:Lakeside camping Pawna.jpg",
          "File:Pawna lake night sky.jpg",
        ]),
        t.g(3, "Tungarli lake Lonavala near Pawna", [
          "File:Tungarli Lake Lonavala.jpg",
          "File:Tungarli dam Lonavala.jpg",
          "File:Lonavala lake view.jpg",
        ]),
        t.g(4, "Lohagad fort monsoon Lonavala", [
          "File:Lohagad Fort Lonavala.jpg",
          "File:Lohagad fort Maharashtra.jpg",
          "File:Visapur Lohagad Lonavala.jpg",
        ]),
        t.d(1, "Lonavala jeep to Pawna lakeside camp", [
          "File:Pawna lake evening.jpg",
          "File:Camping at Pawna.jpg",
          "File:Pawna Lonavala barbecue camp.jpg",
        ]),
        t.d(2, "Pawna sunrise return Pune Lonavala", [
          "File:Sunrise Lonavala.jpg",
          "File:Lonavala sunrise hills.jpg",
          "File:Pune Lonavala expressway ghats.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "wayanad-forest-camping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Wayanad Kerala forest plantation camping hills", [
          "File:Wayanad hills Kerala.jpg",
          "File:Wayanad landscape.jpg",
          "File:Wayanad forest Kerala.jpg",
          "File:Wayanad tea plantation.jpg",
        ]),
        t.g(1, "Wayanad rainforest Western Ghats Kerala", [
          "File:Western Ghats Wayanad.jpg",
          "File:Wayanad wildlife sanctuary.jpg",
          "File:Rainforest Wayanad Kerala.jpg",
        ]),
        t.g(2, "Edakkal Caves Wayanad petroglyphs", [
          "File:Edakkal Caves.jpg",
          "File:Edakkal caves Wayanad.jpg",
          "File:Edakkal Cave petroglyphs.jpg",
        ]),
        t.g(3, "Soochipara waterfall Wayanad", [
          "File:Soochipara Falls.jpg",
          "File:Soochipara waterfall Wayanad.jpg",
          "File:Sentinel Rock waterfall Wayanad.jpg",
        ]),
        t.g(4, "Wayanad coffee pepper plantation trail", [
          "File:Coffee plantation Wayanad.jpg",
          "File:Pepper plantation Kerala Wayanad.jpg",
          "File:Wayanad spice plantation.jpg",
        ]),
        t.d(1, "Arrive Wayanad forest camp plantation", [
          "File:Wayanad homestay forest.jpg",
          "File:Forest camp Wayanad.jpg",
          "File:Wayanad night camping Kerala.jpg",
        ]),
        t.d(2, "Soochipara stream viewpoint Wayanad", [
          "File:Wayanad trekking trail.jpg",
          "File:Chembra Peak Wayanad view.jpg",
          "File:Wayanad birding forest.jpg",
        ]),
        t.d(3, "Calicut checkout Kerala hills departure", [
          "File:Kozhikode Calicut beach.jpg",
          "File:Calicut city Kerala.jpg",
          "File:Calicut airport Kerala.jpg",
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
    console.log(`\nBatch 3 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
