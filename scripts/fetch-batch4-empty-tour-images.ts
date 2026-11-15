/**
 * Batch 4 — place-matched unique images for trek, safari, family, and honeymoon empty tours.
 *
 *   npx tsx scripts/fetch-batch4-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch4-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch4-empty-tour-images.ts --only beas-kund-trek
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
    const slug = "beas-kund-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Solang valley Beas Kund trek Manali snow peaks", [
          "File:Solang valley under snow, 2015.jpg",
          "File:Solang valley mountain view.jpg",
          "File:Paragliders at Solang Valley, Manali.jpg",
          "File:Solang Valley 5.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.g(1, "Solang Valley meadow Manali orientation", [
          "File:Solang Valley Manali.JPG",
          "File:Solang Valley ,Manali, Himachal Pardes, India.JPG",
          "File:Bouldering in Solang Valley - Manali, India.jpg",
        ], ["destinations/manali.jpg"]),
        t.g(2, "Solang meadow Rohtang approach Manali", [
          "File:A view of solang valley on the way to rohtang pass.jpg",
          "File:Solang Valley ,Paragliding view, Manali, Himachal Pardes,india.JPG",
          "File:Solang Valley.JPG",
        ], ["destinations/manali.jpg"]),
        t.g(3, "Dhundi trek trail Kullu Manali", [
          "File:Kullu manali (28).JPG",
          "File:Kullu manali (36).JPG",
          "File:Kullu manali (33).JPG",
        ], ["destinations/manali.jpg"]),
        t.g(4, "Beas river valley Manali Himachal trek", [
          "File:Hills of Manali 1.jpg",
          "File:Manali and Beas River.jpg",
          "File:Beas River Manali.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.d(1, "Arrive Manali Solang orientation", [
          "File:Solang Valley, Paragliding, India.jpg",
          "File:Kullu manali (100).JPG",
          "File:Mall Road, Manali, Himachal Pradesh.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(2, "Solang to Dhundi camp meadow", [
          "File:Kullu manali (101).JPG",
          "File:Solang Valley ,Paragliding view, Manali, Himachal Pardes,india.JPG",
          "File:Kullu manali (28).JPG",
        ], ["destinations/manali.jpg"]),
        t.d(3, "Dhundi to Beas Kund alpine lake", [
          "File:Beas River at Nehru Kund, Manali (2).jpg",
          "File:Hampta Mountain.jpg",
          "File:Beas Kund trek.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.d(4, "Departure Bhuntar Kullu Manali", [
          "File:Mall Road - Manali 2014-05-10 2240.JPG",
          "File:Kullu valley airport Bhuntar.jpg",
          "File:Bhuntar airport Himachal.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "bhrigu-lake-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Bhrigu Lake alpine meadow Himachal", [
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (3).jpg",
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (1).jpg",
          "File:Adventure to Bhrigu.jpg",
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (2).jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.g(1, "Bhrigu Lake glacial bowl Himachal", [
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (4).jpg",
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (2).jpg",
          "File:Adventure to Bhrigu.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(2, "Gulaba snowline Manali trek", [
          "File:Gulaba manali.jpg",
          "File:Himalayas - Gulaba - Leh-Manali Highway 2014-05-10 2438-2439 Compress.JPG",
          "File:Leh–Manali Highway - Gulaba - Kullu 2014-05-10 2449.JPG",
        ], ["destinations/manali.jpg"]),
        t.g(3, "Rola Kholi campsite meadow Bhrigu", [
          "File:Himalayas - Gulaba - Leh-Manali Highway 2014-05-10 2404-2422 Compress.JPG",
          "File:Himalayas - Leh-Manali Highway - Gulaba 2014-05-10 2470-2484 Compress.JPG",
          "File:The mighty himalayas.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(4, "Manali valley Himalayan trek approach", [
          "File:Kullu manali (36).JPG",
          "File:Solang valley mountain view.jpg",
          "File:Kullu Manali scenic view.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(1, "Manali arrival trek base", [
          "File:Club House Manali (4) (17179366639).jpg",
          "File:Club House Manali (5) (16743073154).jpg",
          "File:Manali view.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(2, "Gulaba to Rola Kholi camp", [
          "File:Himalayas - Gulaba - Leh-Manali Highway 2014-05-10 2398-2402 Compress.JPG",
          "File:Traffic Jam - Leh–Manali Highway - Gulaba - Kullu 2014-05-10 2366.JPG",
          "File:Gulaba manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(3, "Bhrigu Lake descent day", [
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (1).jpg",
          "File:Bombus in Himachal Pradesh (1).jpg",
          "File:Bhrigu Lake by Ahmad Faiz Mustafa (3).jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(4, "Departure Kullu Manali", [
          "File:Mall Road - Manali 2014-05-11 2633.JPG",
          "File:Kullu Manali highway Beas.jpg",
          "File:Kullu valley airport Bhuntar.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "bir-billing-paragliding-camp";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Bir Billing paragliding camp Himachal", [
          "File:Paragliding at Bir, HP.jpg",
          "File:Paragliding Capital of India- Bir Billing.jpg",
          "File:Gaggle - Paragliding in Bir, Himachal Pradesh.jpg",
          "File:Best paragliding in Bir Biling.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(1, "Chokling Monastery Bir colony", [
          "File:Chokling Monastery, Bir, Himachal Pradesh.jpg",
          "File:Chokling Monastery, Bir, Himachal Pradesh 2.jpg",
          "File:Chokling Monastery, External View.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(2, "Billing takeoff ridge paragliding", [
          "File:Upper paragliding takeoff at Bir-Billing.JPG",
          "File:Pilot on a paragliding takeoff at Bir-Billing.JPG",
          "File:Pilots on a paragliding takeoff at Bir-Billing.JPG",
        ], ["destinations/himachal.jpg"]),
        t.g(3, "Bir forest Kangra valley camp", [
          "File:Bir forest.jpg",
          "File:Pasture Land of Bir, himachal Pradesh.jpg",
          "File:Sunset in Bir, Himachal Pradesh.jpg",
        ], ["destinations/himachal.jpg"]),
        t.g(4, "Tandem flight Bir Billing air", [
          "File:Paragliding in Bir-Billing (41721).jpg",
          "File:Paragliding in Bir-Billing (60201).jpg",
          "File:Paragliding, Bir-Billing (HP), India.jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(1, "Arrive Bir Tibetan village", [
          "File:Bir Village 01.jpg",
          "File:Bir Village 03.jpg",
          "File:Bir Village 05.jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(2, "Paraglide day Billing tandem", [
          "File:Paragliding in Bir-Billing (15274).jpg",
          "File:BIR BILLING PARAGLIDING.jpg",
          "File:Paraglider under paragliding takeoff at Bir-Billing.JPG",
        ], ["destinations/himachal.jpg"]),
        t.d(3, "Checkout Bir sunset glide", [
          "File:Sunset gliding in Bir, Himachal Pradesh.jpg",
          "File:Bir Village 06.jpg",
          "File:Paragliding in Bir-Billing (79401).jpg",
        ], ["destinations/himachal.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "sundarbans-boat-safari";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Sundarbans mangrove tiger reserve boat", [
          "File:Dense Mangrove Forest of the Sundarban Tiger Reserve during High Tide, West Bengal, India 03.jpg",
          "File:Mangrove Vegetation of Sundarban, West Bengal, India 05.jpg",
          "File:Tourist Boat in Sundarbans, West Bengal, India 03.jpg",
          "File:Sundarban Tiger Reserve forest and adjacent rivers 06.jpg",
        ]),
        t.g(1, "Sundarbans mangrove channels West Bengal", [
          "File:Mangrove Vegetation of Sundarban, West Bengal, India 09.jpg",
          "File:Mangrove Vegetation of Sundarban, West Bengal, India 08.jpg",
          "File:Dense Mangrove Forest of the Sundarban Tiger Reserve during High Tide, West Bengal, India 02.jpg",
        ]),
        t.g(2, "Safari boat Sundarbans delta", [
          "File:Tourist Boat in Sundarbans, West Bengal, India 07.jpg",
          "File:Tourist Boat in Sundarbans, West Bengal, India 05.jpg",
          "File:Tourist Boat in Sundarbans, West Bengal, India 04.jpg",
        ]),
        t.g(3, "Godkhali ferry Sundarbans embark", [
          "File:Ferry at Godkhali in Sunderbans (38271313106).jpg",
          "File:A boat carrying an auto rickshaw from Godkhali to Gosaba Island in Sundarban, West Bengal, India.jpg",
          "File:Local Boats in Sundarban 06.jpg",
        ]),
        t.g(4, "Netidhopani watch camp jetty", [
          "File:The Jetty of Netidhopani Camp, Sundarban National Park, West Bengal, India 01.jpg",
          "File:UNESCO World Heritage Site Board at Netidhopani Camp in Sundarban National Park.jpg",
          "File:Board for recording Tiger sightings at Netidhopani Camp in Sundarban National Park.jpg",
        ]),
        t.d(1, "Kolkata drive to Godkhali", [
          "File:Victoria Memorial Kolkata.jpg",
          "File:Howrah Bridge Kolkata.jpg",
          "File:Kolkata city skyline.jpg",
          "File:Victoria Memorial, Kolkata.jpg",
        ]),
        t.d(2, "Core-zone cruise watch towers", [
          "File:Tourist Boat in Sundarbans, West Bengal, India 06.jpg",
          "File:Tourists exploring Sundarbans on country boat near Rajat Jubilee Ghat, West Bengal, India 08.jpg",
          "File:Sundarban Tiger Reserve forest and adjacent rivers 17.jpg",
        ]),
        t.d(3, "Tiger territory margins mudflats", [
          "File:Sundarban Mudflats during low tide, Sundarban Tiger Reserve, West Bengal, India 02.jpg",
          "File:A Rhesus macaque in Sundarban Tiger Reserve, West Bengal, India 06.jpg",
          "File:Crocodile at the Sundarbans Tiger Reserve.jpg",
        ]),
        t.d(4, "Return Kolkata departure", [
          "File:Howrah Bridge at night, Kolkata.jpg",
          "File:Esplanade Kolkata.jpg",
          "File:Netaji Subhas Chandra Bose International Airport.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "goa-family-splash";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Baga Calangute family beach Goa", [
          "File:Panorama of Baga Beach, Goa.jpg",
          "File:Baga Beach Goa.JPG",
          "File:Goa Beach - Baga Beach.jpg",
          "File:Baga Beach 25012016.jpg",
        ]),
        t.g(1, "Baga beach North Goa family", [
          "File:Baga Beach In North Goa.jpg",
          "File:Baga Beach, Goa.jpg",
          "File:India - Goa - 010 - Touristy Baga Beach.jpg",
        ]),
        t.g(2, "Calangute beach coast Goa", [
          "File:Calangute-beach-2.jpg",
          "File:Calangute beach bear Panaji, Goa (December 2018).jpg",
          "File:Calangute Beach,Goa - panoramio.jpg",
        ]),
        t.g(3, "Fort Aguada North Goa lookout", [
          "File:Fort Aguada Remote view 25012016.jpg",
          "File:Aguada Goa Fort.jpg",
          "File:Aguada Fort Top View, North Goa.jpg",
        ]),
        t.g(4, "Old Goa heritage churches", [
          "File:Front Elevation of Basilica of Bom Jesus.jpg",
          "File:Se Cathedral from Rua Direita.jpg",
          "File:Church of St. Francis of Assisi and Se Cathedral.jpg",
        ]),
        t.d(1, "Arrive beach sundown Baga", [
          "File:Sun Set at Baga beach Goa.jpg",
          "File:Baga Beach-Goa India-Andres Larin.jpg",
          "File:Glow sticks on Baga beach at night.jpg",
        ]),
        t.d(2, "Baga Calangute coast day", [
          "File:Goa, India -- Calangute beach, one evening ... before the tourist deluge.jpg",
          "File:Crowds on Calangute beach, Goa, India (464049822).jpg",
          "File:Baga Beach, Calangute, Goa.jpg",
        ]),
        t.d(3, "Old Goa heritage Basilica", [
          "File:Basilica of Bom Jesus 4 (Old Goa).jpg",
          "File:Basilica of Bom Jesus 5 (Old Goa).jpg",
          "File:Perspective of Se Cathedral.jpg",
        ]),
        t.d(4, "Checkout Goa departure", [
          "File:Fort Aguada, Goa, India.jpg",
          "File:Goa International Airport.jpg",
          "File:Candolim Beach Goa Camotim Vaddo.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "jaipur-udaipur-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Lake Pichola honeymoon Udaipur Rajasthan", [
          "File:20191207 Zachód słońca nad jeziorem Pichola w Udajpurze 1733 7352.jpg",
          "File:Jag Mandir, Udaipur, 20191207 1428 7201.jpg",
          "File:Pichola lake sunset.JPG",
          "File:20191207 Lake Pichola, Udaipur, 1652 7315.jpg",
        ]),
        t.g(1, "Hawa Mahal Jaipur pink facade", [
          "File:East facade Hawa Mahal Jaipur from ground level (July 2022) - img 01.jpg",
          "File:Hawa Mahal in Jaipur India.jpg",
          "File:Hawa Mahal (The Palace of Winds) in Jaipur, 20191218 1201 9174.jpg",
        ]),
        t.g(2, "Amber Fort Jaipur hill palace", [
          "File:Amber Fort, Jaipur, 20191219 1011 9509.jpg",
          "File:Amber Fort-Jaipur-India0010.JPG",
          "File:20191219 Amber Fort, Amer, Jaipur 1019 9533.jpg",
        ]),
        t.g(3, "City Palace Udaipur lake view", [
          "File:City Palace Udaipur Rajasthan India.JPG",
          "File:20191207 City Palace, Udaipur 1701 7325.jpg",
          "File:View of Udaipur from City Palace.jpg",
        ]),
        t.g(4, "Jal Mahal Man Sagar Jaipur", [
          "File:Man Sagar Lake with Jal Mahal Palace, Jaipur, 20191218 1427 9225.jpg",
          "File:20191218 Jal Mahal Palace in Jaipur 1429 9234.jpg",
          "File:Jal Mahal Palace in Jaipur, 20191218 1427 9226.jpg",
        ]),
        t.d(1, "Arrive Jaipur honeymoon", [
          "File:Hawa Mahal east facade (14-07-2022).jpg",
          "File:Jaipur 03-2016 27 Hawa Mahal - Palace of the Winds.jpg",
          "File:Musician artisan inside Hawa Mahal in Jaipur, Rajasthan.jpg",
        ]),
        t.d(2, "Amber City Palace Jaipur day", [
          "File:Jaipur 03-2016 02 Amber Fort.jpg",
          "File:Amber Fort, Jaipur, 20191219 1045 9589.jpg",
          "File:Jaipur 03-2016 39 Jal Mahal - Water Palace.jpg",
        ]),
        t.d(3, "Jaipur to Udaipur lakes drive", [
          "File:Aravalli hills Rajasthan.jpg",
          "File:Rajasthan highway hills.jpg",
          "File:Chittorgarh Fort Rajasthan.jpg",
        ]),
        t.d(4, "Udaipur lakes City Palace", [
          "File:20191207 Lake Pichola, Udaipur, 1531 7276.jpg",
          "File:20191207 Łódź turystyczna na Jeziorze Pichola 1406 7139.jpg",
          "File:Taj Lake Palace Udaipur from City Palace.jpg",
        ]),
        t.d(5, "Saheliyon-ki-Bari free lake time", [
          "File:Saheliyon-ki-Bari (Udaipur, Rajasthan).jpg",
          "File:Garden view of Saheliyon-ki-Bari, Udaipur.jpg",
          "File:Saheliyon ki Bari Udaipur.jpg",
        ]),
        t.d(6, "Departure Udaipur Rajasthan", [
          "File:Maharana Pratap Airport Udaipur.jpg",
          "File:Udaipur city Rajasthan.jpg",
          "File:Shiv Niwas Palace, Udaipur, 20191207 1408 7142.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "rishikesh-white-water-rafting-package";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Ganga white water rafting Rishikesh", [
          "File:River Ganga Rushikesh.jpg",
          "File:Rishikesh - Rafting & Fun In Ganga.JPG",
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 02.jpg",
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 03.jpg",
        ], ["destinations/rishikesh.jpg", "destinations/uttarakhand.jpg"]),
        t.g(1, "Ganga rapids Shivpuri Rishikesh", [
          "File:Rapids (in Ganga) at Kodiyala.jpg",
          "File:Ganga at Kaudiayala.jpg",
          "File:Rishikesh rafting point.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(2, "Laxman Jhula Ganga Rishikesh", [
          "File:Laxman Jhula.jpg",
          "File:Lakshman Jhula Rishikesh.jpg",
          "File:Lakshman jhula Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(3, "Rafting camp banks Ganga Rishikesh", [
          "File:A rafting camp on the banks of Ganga.JPG",
          "File:Peaceful and spiritual destination on the banks of the sacred River Ganga.jpg",
          "File:Rishikesh (Ganges View).jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.g(4, "Raft crew Ganga whitewater", [
          "File:Raft in Ganga.jpg",
          "File:Rishikesh rafting point.jpg",
          "File:A camp site by the Ganga, Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(1, "Arrive Rishikesh safety briefing", [
          "File:Triveni Ghat - Rishikesh.jpg",
          "File:Ganga Aarti at Triveni Ghat Rishikesh Uttarakhand India.jpg",
          "File:Rishikesh hills.jpg",
        ], ["destinations/rishikesh.jpg"]),
        t.d(2, "Full rafting day Ganga", [
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 03.jpg",
          "File:River Rafting in Ganga Near Ram Jhula Rishikesh 02.jpg",
          "File:Rafting in the Ganga, Rishikesh.jpg",
        ]),
        t.d(3, "Short raft or leisure departure", [
          "File:Ganga at Kaudiayala.jpg",
          "File:Sunrise Rishikesh.jpg",
          "File:Morning Ganges Rishikesh.jpg",
        ], ["destinations/rishikesh.jpg", "destinations/dehradun.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "coorg-coffee-hills";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Coorg coffee plantation hills Karnataka", [
          "File:Coffee Coconuts Pepper Estate Coorg Feb24 A7C 09365.jpg",
          "File:Coffee Shade Trees Paddy Fields Coorg Feb24 R16 07670.jpg",
          "File:Ripe Seeds Coffee Robusta Coorg Karnataka India Feb24 D72 25688.jpg",
          "File:Burls Trunk Coffee Robusta Balamuri Coorg Feb24 A7C 09430.jpg",
        ]),
        t.g(1, "Coffee estate shade trees Coorg", [
          "File:Gnarled Old Coffee Robusta Trunk Coorg Feb24 D72 25962.jpg",
          "File:Beans Drying Coffee Robusta Balamuri Coorg Feb24 A7C 09491.jpg",
          "File:Pepper Corns Green Coorg Feb24 A7C 09369.jpg",
        ]),
        t.g(2, "Abbey Falls Coorg waterfall", [
          "File:ABBEY FALLS ,COORG ,KARNATAKA.jpg",
          "File:Abbey falls- Coorg❤.jpg",
          "File:Abbey falls,coorg.jpg",
        ]),
        t.g(3, "Madikeri town Kodagu hills", [
          "File:Madikeri Town.jpg",
          "File:Madikeri, Karnataka India.jpg",
          "File:Omkareshwara Temple, Madikeri, Kodagu, Karnataka, India.jpg",
        ]),
        t.g(4, "Raja Seat Madikeri viewpoint", [
          "File:Raja's Tomb, Madikeri, Kodagu, Karnataka, India.jpg",
          "File:Cannon in the Madikeri Fort Museum.jpg",
          "File:Omkareshwara Temple, Madikeri, Kodugu, Karnataka 05.jpg",
        ]),
        t.d(1, "Arrive Coorg plantation", [
          "File:Paddy Field Stubble Balamuri Coorg Feb24 A7C 09450.jpg",
          "File:Flower Buds Coffee Robusta Coorg Feb24 D72 25939.jpg",
          "File:Streets of Madikeri.jpg",
        ]),
        t.d(2, "Waterfalls Abbey Coorg", [
          "File:Snail walking on an iron bar, Abbey falls, Coorg, Karnataka.JPG",
          "File:ABBEY FALLS ,COORG ,KARNATAKA.jpg",
          "File:Abbey falls,coorg.jpg",
        ]),
        t.d(3, "Madikeri fort temple town", [
          "File:Raja's Tomb, Madikeri (Mercara), Kodagu, Karnataka, India.jpg",
          "File:Kaveri river goddess Madikeri.jpg",
          "File:Ornamental brass bells in Madikeri, Karnataka.jpg",
        ]),
        t.d(4, "Departure Coorg Karnataka", [
          "File:Mysore Airport.jpg",
          "File:Kushalnagar Karnataka India.jpg",
          "File:Mangalore International Airport.jpg",
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
    console.log(`\nBatch 4 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
