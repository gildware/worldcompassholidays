/**
 * Batch 2 — place-matched unique images for shorter hot empty tours.
 *
 *   npx tsx scripts/fetch-batch2-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch2-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch2-empty-tour-images.ts --only gir-asiatic-lion-safari
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
    const slug = "gir-asiatic-lion-safari";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Asiatic lion Sasan Gir National Park Gujarat", [
          "File:Asiatic Lion Gir.jpg",
          "File:Panthera leo persica in Gir Forest.jpg",
          "File:Asiatic Lion 03.jpg",
          "File:Lion in Gir National Park.jpg",
        ]),
        t.g(1, "Gir National Park teak scrub Gujarat", [
          "File:Gir Forest National Park.jpg",
          "File:Sasan-Gir National Park.jpg",
          "File:Gir forest Gujarat.jpg",
        ]),
        t.g(2, "Gypsy safari Gir lion territory Gujarat", [
          "File:Jeep safari in Gir forest.jpg",
          "File:Gir lion safari jeep.jpg",
          "File:Gujarat forest gypsy safari.jpg",
        ]),
        t.g(3, "Devalia interpretation zone Gir Gujarat", [
          "File:Devalia park Gir.jpg",
          "File:Devalia Gir Safari Park.jpg",
          "File:Asiatic lion Devalia.jpg",
        ]),
        t.g(4, "Sasan Gir buffer village Gujarat", [
          "File:Sasan Gir village.jpg",
          "File:Junagadh Gir route.jpg",
          "File:Gir Wildlife Sanctuary entrance.jpg",
        ]),
        t.d(1, "Afternoon gypsy safari Sasan Gir", [
          "File:Afternoon safari Gir.jpg",
          "File:Lion track Gir Forest.jpg",
          "File:Gir National Park safari route.jpg",
        ]),
        t.d(2, "Dawn and dusk lion circuits Gir", [
          "File:Morning safari Gir National Park.jpg",
          "File:Asiatic lions at dawn Gir.jpg",
          "File:Evening gypsy Gir Gujarat.jpg",
        ]),
        t.d(3, "Somnath coastal temple departure Gujarat", [
          "File:Somnath Temple Gujarat.jpg",
          "File:Somnath temple shore.jpg",
          "File:Junagadh Rajkot road Gujarat.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "kanha-jungle-book-safari";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Kanha National Park tiger sal forest Madhya Pradesh", [
          "File:Kanha National Park,Madhya Pradesh (11).jpg",
          "File:Kanha Tiger Reserve.jpg",
          "File:Tiger in Kanha National Park.jpg",
          "File:Kanha meadow Madhya Pradesh.jpg",
        ]),
        t.g(1, "Sal and bamboo ridges Kanha MP", [
          "File:Sal forest Kanha.jpg",
          "File:Bamboo grove Kanha National Park.jpg",
          "File:Kanha jungle landscape.jpg",
        ]),
        t.g(2, "Barasingha swamp deer Kanha meadow", [
          "File:Barasingha at Kanha Tiger Reserve.jpg",
          "File:Swamp deer Kanha.jpg",
          "File:Barasingha Kanha National Park.jpg",
        ]),
        t.g(3, "Jeep safari Kisli Mukki Kanha", [
          "File:Jeep safari Kanha.jpg",
          "File:Kanha wildlife jeep.jpg",
          "File:Madhya Pradesh forest safari jeep.jpg",
        ]),
        t.g(4, "Kanha buffer village Madhya Pradesh", [
          "File:Kanha buffer zone village.jpg",
          "File:Mandla district Kanha.jpg",
          "File:Gondia Kanha road.jpg",
        ]),
        t.d(1, "Arrive Kanha buffer evening jeep", [
          "File:Evening safari Kanha National Park.jpg",
          "File:Kanha lodge arrival meadow.jpg",
          "File:Kisli gate Kanha.jpg",
        ]),
        t.d(2, "Twin morning evening drives Kanha", [
          "File:Sunrise jeep Kanha.jpg",
          "File:Tiger tracking Kanha morning.jpg",
          "File:Kanha meadow evening safari.jpg",
        ]),
        t.d(3, "Departure Gondia Jabalpur tiger land", [
          "File:Kanha National Park exit.jpg",
          "File:Jabalpur Madhya Pradesh road.jpg",
          "File:Gondia railway station area.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "varanasi-spiritual-tour";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Varanasi Ganga ghats Dashashwamedh aarti Kashi", [
          "File:Varanasi Ghats.jpg",
          "File:Ganga Aarti in Varanasi.jpg",
          "File:Dashashwamedh Ghat,aarti,Varanasi.jpg",
          "File:Ghats of Varanasi at night.jpg",
        ]),
        t.g(1, "Dashashwamedh Ghat Varanasi promenade", [
          "File:Dashashwamedh Ghat.jpg",
          "File:Dashashwamedh Ghat Varanasi.jpg",
          "File:Varanasi Dasaswamedh Ghat.jpg",
        ]),
        t.g(2, "Manikarnika Ghat Varanasi riverfront", [
          "File:Manikarnika Ghat Varanasi.jpg",
          "File:Burning Ghat Varanasi.jpg",
          "File:Manikarnika ghat view.jpg",
        ]),
        t.g(3, "Kashi Vishwanath corridor Varanasi", [
          "File:Kashi Vishwanath Temple Varanasi.jpg",
          "File:Shri Kashi Vishwanath Dham.jpg",
          "File:Vishwanath temple Varanasi.jpg",
        ]),
        t.g(4, "Ganga rowboat sunset Varanasi", [
          "File:Boat ride on Ganges Varanasi.jpg",
          "File:Sunset boat Varanasi.jpg",
          "File:Ganges river boats Varanasi.jpg",
        ]),
        t.d(1, "Arrive Kashi first glimpse Ganga ghats", [
          "File:Assi Ghat Varanasi.jpg",
          "File:Varanasi ghat promenade.jpg",
          "File:Ganga river Varanasi evening.jpg",
        ]),
        t.d(2, "Kashi Vishwanath old city silk lanes", [
          "File:Varanasi old city lanes.jpg",
          "File:Varanasi street temple.jpg",
          "File:Banaras silk weaving unit.jpg",
        ]),
        t.d(3, "Sarnath Buddhist heritage Dhamek Stupa", [
          "File:Sarnath Buddha.jpg",
          "File:Dhamek Stupa Sarnath.jpg",
          "File:Sarnath archaeological site.jpg",
        ]),
        t.d(4, "Morning prayer departure Varanasi", [
          "File:Subah aarti Varanasi.jpg",
          "File:Morning ghat Varanasi.jpg",
          "File:Lal Bahadur Shastri Airport Varanasi.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "shirdi-sai-baba-darshan";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Shirdi Sai Samadhi Mandir Maharashtra pilgrimage", [
          "File:Shirdi Sai baba temple.jpg",
          "File:Saibaba temple in shirdi.jpg",
          "File:Shirdi temple complex Maharashtra.jpg",
          "File:Sai Baba Samadhi Mandir Shirdi.jpg",
        ]),
        t.g(1, "Sai Samadhi Mandir Shirdi sanctum", [
          "File:Samadhi Mandir Shirdi.jpg",
          "File:Shirdi Samadhi temple.jpg",
          "File:Saibaba Samadhi Shirdi.jpg",
        ]),
        t.g(2, "Dwarkamai mosque Shirdi Sai Baba", [
          "File:Dwarkamai Shirdi.jpg",
          "File:Dwarkamai mosque Shirdi.jpg",
          "File:Shirdi Dwarkamai interior.jpg",
        ]),
        t.g(3, "Chavadi Shirdi pilgrimage site", [
          "File:Chavadi Shirdi.jpg",
          "File:Shirdi Chavadi temple.jpg",
          "File:Sai Baba Chavadi Shirdi.jpg",
        ]),
        t.g(4, "Lendi Baug Gurusthan Shirdi", [
          "File:Lendi Baug Shirdi.jpg",
          "File:Gurusthan Shirdi.jpg",
          "File:Shirdi garden Lendi.jpg",
        ]),
        t.d(1, "Arrive Shirdi evening Samadhi darshan", [
          "File:Evening darshan Shirdi temple.jpg",
          "File:Shirdi temple lights night.jpg",
          "File:Shirdi pilgrimage queue evening.jpg",
        ]),
        t.d(2, "Morning aarti Dwarkamai Chavadi circuit", [
          "File:Kakad aarti Shirdi.jpg",
          "File:Morning aarti Sai temple Shirdi.jpg",
          "File:Shirdi temple morning crowd.jpg",
        ]),
        t.d(3, "Prayer departure Shirdi airport road", [
          "File:Shirdi town Maharashtra.jpg",
          "File:Shirdi Airport SAG.jpg",
          "File:Kopargaon railway Shirdi route.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "amritsar-heritage-wagah-border";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Amritsar Harmandir Sahib Wagah border Punjab heritage", [
          "File:Akal Takht Amritsar.jpg",
          "File:Durgiana Temple Amritsar.jpg",
          "File:Amritsar Wagah border ceremony.jpg",
          "File:Gobindgarh Fort Amritsar.jpg",
        ]),
        t.g(1, "Akal Takht Golden Temple complex Amritsar", [
          "File:Akal Takht.jpg",
          "File:Akal Takht Golden Temple.jpg",
          "File:Golden Temple complex Akal Takht.jpg",
        ]),
        t.g(2, "Wagah Attari Beating Retreat ceremony", [
          "File:Wagah border ceremony India Pakistan.jpg",
          "File:The Retreat Ceremony at Wagah border 1.jpg",
          "File:Attari Wagah flag ceremony.jpg",
        ]),
        t.g(3, "Gobindgarh Fort Amritsar heritage", [
          "File:Gobindgarh Fort.jpg",
          "File:Gobindgarh Fort moat Amritsar.jpg",
          "File:Bharatia Fort Gobindgarh Amritsar.jpg",
        ]),
        t.g(4, "Amritsar old city bazaar Hall Gate", [
          "File:Hall Gate Amritsar.jpg",
          "File:Katra Jaimal Singh Amritsar.jpg",
          "File:Amritsar Heritage Street.jpg",
        ]),
        t.d(1, "Arrive Golden Temple evening sarovar Amritsar", [
          "File:Golden Temple from clock tower Amritsar.jpg",
          "File:Durgiana Temple sarovar evening.jpg",
          "File:Sikh pilgrims Amritsar temple evening.jpg",
        ]),
        t.d(2, "Dawn darshan Jallianwala heritage Amritsar", [
          "File:Partition Museum Amritsar.jpg",
          "File:Jallianwala Bagh gate.jpg",
          "File:Morning langar Golden Temple pilgrims.jpg",
        ]),
        t.d(3, "Wagah border Beating Retreat seats", [
          "File:Wagah border stadium crowd.jpg",
          "File:India Pakistan border Wagah soldiers.jpg",
          "File:Wagah ceremony sunset Punjab.jpg",
        ]),
        t.d(4, "Departure Amritsar airport railway", [
          "File:Sri Guru Ram Dass Jee International Airport.jpg",
          "File:Amritsar Junction railway station.jpg",
          "File:Amritsar Punjab skyline morning.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "goa-beach-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Palolem South Goa beach honeymoon couples", [
          "File:Palolem Beach.jpg",
          "File:Palolem Beach Goa.jpg",
          "File:Palolem beach panorama Goa.jpg",
          "File:Sunset at Palolem Beach Goa.jpg",
        ]),
        t.g(1, "Agonda quiet beach South Goa", [
          "File:Agonda Beach.jpg",
          "File:Agonda Beach Goa.jpg",
          "File:Agonda south Goa coastline.jpg",
        ]),
        t.g(2, "Butterfly Beach Cola lagoon South Goa", [
          "File:Butterfly Beach Palolem Goa.jpg",
          "File:Cola Beach lagoon South Goa.jpg",
          "File:Hidden beach South Goa lagoon.jpg",
        ]),
        t.g(3, "Fort Aguada Candolim Goa coast", [
          "File:Fort Aguada Goa.jpg",
          "File:Aguada Fort lighthouse Goa.jpg",
          "File:Fort Aguada view Goa.jpg",
        ]),
        t.g(4, "Ponda spice plantation Kerala Goa hills", [
          "File:Ponda spice plantation Goa.jpg",
          "File:Spice farm Ponda Goa.jpg",
          "File:IN-Goa-Ponda-Spice-plantation.jpg",
        ]),
        t.d(1, "Arrive South Goa Palolem Agonda check-in", [
          "File:South Goa beach palms.jpg",
          "File:Palolem beach shack sunset.jpg",
          "File:Goa south coast palm trees.jpg",
        ]),
        t.d(2, "Beach day couples South Goa sands", [
          "File:Agonda beach sunset Goa.jpg",
          "File:South Goa beach couple walking.jpg",
          "File:Quiet beach South Goa honeymoon.jpg",
        ]),
        t.d(3, "Old Goa Basilica spice plantation morning", [
          "File:Church of St. Cajetan Old Goa.jpg",
          "File:Church of St Francis of Assisi Goa.jpg",
          "File:Spice plantation tour Goa lunch.jpg",
        ]),
        t.d(4, "Romantic sunset sail South Goa evening", [
          "File:Sunset cruise Goa.jpg",
          "File:Goa beach candlelight dinner.jpg",
          "File:South Goa romantic sunset sea.jpg",
        ]),
        t.d(5, "Departure Goa airport Dabolim Mopa", [
          "File:Goa International Airport Dabolim.jpg",
          "File:Mopa Goa airport exterior.jpg",
          "File:Goa departure beach morning.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "jaipur-city-break";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Jaipur Pink City Hawa Mahal Amber Fort Rajasthan", [
          "File:Hawa Mahal Jaipur 003.jpg",
          "File:Hawa Mahal Jaipur India.jpg",
          "File:Jaipur Hawa Mahal facade.jpg",
          "File:Amer Fort Jaipur.jpg",
        ]),
        t.g(1, "Amber Fort Amer Rajasthan palace", [
          "File:Amber Palace Jaipur.jpg",
          "File:Amer Fort courtyard Jaipur.jpg",
          "File:Jaigarh and Amber Fort view.jpg",
        ]),
        t.g(2, "City Palace Jaipur museum courtyard", [
          "File:City Palace Jaipur.jpg",
          "File:Jaipur City Palace courtyard.jpg",
          "File:City Palace museum Jaipur.jpg",
        ]),
        t.g(3, "Jantar Mantar observatory Jaipur", [
          "File:Jantar Mantar Jaipur.jpg",
          "File:Jantar Mantar observatory Jaipur India.jpg",
          "File:Samdrat Yantra Jaipur.jpg",
        ]),
        t.g(4, "Jal Mahal water palace Jaipur lake", [
          "File:Jal Mahal Jaipur.jpg",
          "File:Jal Mahal Man Sagar Lake.jpg",
          "File:Water Palace Jaipur Rajasthan.jpg",
        ]),
        t.d(1, "Arrive Jaipur City Palace Hawa Mahal area", [
          "File:Jaipur old city pink buildings.jpg",
          "File:Johari Bazaar Jaipur.jpg",
          "File:Hawa Mahal street Jaipur.jpg",
        ]),
        t.d(2, "Amber Fort block printing crafts Jaipur", [
          "File:Elephant ride Amber Fort Jaipur.jpg",
          "File:Amber Fort Sheesh Mahal.jpg",
          "File:Sanganer block printing Jaipur.jpg",
        ]),
        t.d(3, "Departure Jaipur airport JAI", [
          "File:Jaipur International Airport.jpg",
          "File:Jaipur city morning departure.jpg",
          "File:Nahargarh Fort view Jaipur.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "udaipur-lakes-weekend";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Udaipur Lake Pichola City Palace Rajasthan", [
          "File:City Palace Udaipur.jpg",
          "File:Lake Pichola Udaipur.jpg",
          "File:Udaipur city of lakes panorama.jpg",
          "File:Udaipur Rajasthan skyline.jpg",
        ]),
        t.g(1, "Lake Pichola boat palace view Udaipur", [
          "File:Boat ride Lake Pichola Udaipur.jpg",
          "File:Lake Pichola boat palace.jpg",
          "File:Udaipur Lake Pichola evening.jpg",
        ]),
        t.g(2, "Jag Mandir island palace Lake Pichola", [
          "File:Jag Mandir Udaipur.jpg",
          "File:Jag Mandir Palace Udaipur.jpg",
          "File:Lake Palace Udaipur.jpg",
        ]),
        t.g(3, "Jagdish Temple Udaipur old city", [
          "File:Jagdish Temple Udaipur.jpg",
          "File:Jagdish Mandir Udaipur Rajasthan.jpg",
          "File:Udaipur temple street Jagdish.jpg",
        ]),
        t.g(4, "Saheliyon ki Bari garden Udaipur", [
          "File:Saheliyon Ki Bari Udaipur.jpg",
          "File:Sahelion Ki Bari fountains Udaipur.jpg",
          "File:Garden of Maidens Udaipur.jpg",
        ]),
        t.d(1, "Arrive Udaipur City Palace museum", [
          "File:City Palace museum Udaipur entrance.jpg",
          "File:Udaipur palace facade Lake Pichola.jpg",
          "File:Ambrai Ghat Udaipur evening.jpg",
        ]),
        t.d(2, "Jagdish lane boat ride sunset ghat", [
          "File:Sunset ghat Udaipur.jpg",
          "File:Udaipur sunset Lake Pichola ghats.jpg",
          "File:Boat sunset Udaipur Rajasthan.jpg",
        ]),
        t.d(3, "Departure Udaipur airport UDR", [
          "File:Maharana Pratap Airport Udaipur.jpg",
          "File:Udaipur airport departure.jpg",
          "File:Fateh Sagar Lake Udaipur morning.jpg",
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
    console.log(`\nBatch 2 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
