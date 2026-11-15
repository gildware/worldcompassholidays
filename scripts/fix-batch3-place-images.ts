/**
 * Finish batch-3 tours with probed, place-matched Wikimedia File: titles (width ≥800).
 *
 *   npx tsx scripts/fix-batch3-place-images.ts
 */
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  cover,
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
  type ImageTarget,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

/** Missing slots refetched with verified Commons titles (skip auto-search). */
const FIX_JOBS: TourImageJob[] = [
  {
    slug: "mathura-vrindavan-agra-circuit",
    targets: [
      day("mathura-vrindavan-agra-circuit-d1.jpg", 1, "Mathura Krishna Janmabhoomi Vishram Ghat", [
        "File:Krishna Janmasthan Temple.jpg",
        "File:Krishna Janmasthan Temple (10397).jpg",
        "File:Vishram Ghat.jpg",
        "File:Vishram Ghat Yamuna Mathura India in 1949.jpg",
      ]),
      day("mathura-vrindavan-agra-circuit-d2.jpg", 2, "Vrindavan temple circuit Banke Bihari", [
        "File:Banke Bihari Vrindavan.jpg",
        "File:Radhavallabh Lal ju Maharaj Temple Vrindavan 2022 17.jpg",
        "File:Shahji temple Vrindavan 08.jpg",
      ]),
      day("mathura-vrindavan-agra-circuit-d3.jpg", 3, "Govardhan hill parikrama Braj", [
        "File:Kund at Goverdhan Dham at starting of Parikrama - panoramio.jpg",
      ]),
      day("mathura-vrindavan-agra-circuit-d4.jpg", 4, "Taj Mahal Agra sunrise", [
        "File:Taj Mahal, Agra, India.jpg",
        "File:Taj Mahal, Agra, India edit2.jpg",
        "File:El Taj Mahal-Agra India0023.JPG",
      ]),
      day("mathura-vrindavan-agra-circuit-d5.jpg", 5, "Agra Fort departure circuit", [
        "File:Agra Fort walls.jpg",
        "File:Agra 03-2016 14 Agra Fort.jpg",
        "File:20191204 Moat and walls of Agra Fort 0925 6582.jpg",
      ]),
    ],
  },
  {
    slug: "ajmer-sharif-pushkar-darshan",
    targets: [
      gallery("ajmer-sharif-pushkar-darshan-g1.jpg", "Dargah Sharif courtyard Ajmer", [
        "File:Ajmer Sharif, Dargah of Mainuddin Chisti in Ajmer, Rajasthan 30.jpg",
        "File:Ajmer Sharif, Dargah of Mainuddin Chisti in Ajmer, Rajasthan 19.jpg",
        "File:Night View of Ajmer Sharif Dargah.jpg",
      ]),
      gallery("ajmer-sharif-pushkar-darshan-g2.jpg", "Ana Sagar lake Ajmer Rajasthan", [
        "File:20191216 Ana Sagar Lake Ajmer 1129 8858.jpg",
        "File:ANA SAGAR-AJMER-RAJASTHAN-DSC001.jpg",
        "File:Ana Sagar Lake.jpg",
        "File:Ana Sagar Boating.jpg",
      ]),
      gallery("ajmer-sharif-pushkar-darshan-g3.jpg", "Adhai Din Ka Jhonpra Ajmer", [
        "File:20191216 Adhai Din Ka Jhonpra, Ajmer 1203 8870.jpg",
        "File:Adhai-Din-ka-Jhonpra with Mountains.jpg",
        "File:Adhai din ka-Jhonpra ajmer 1.jpg",
      ]),
      gallery("ajmer-sharif-pushkar-darshan-g4.jpg", "Pushkar Brahma Temple ghats", [
        "File:Brahma Temple, Pushkar, RJ.jpg",
        "File:Pushkar Brahma Temple, at Pushkar in Rajasthan 03.jpg",
        "File:20191215 Jezioro Puszkar i ghaty na jego północno-wschodnim brzegu 0937 8641.jpg",
      ]),
      day("ajmer-sharif-pushkar-darshan-d1.jpg", 1, "Arrive Ajmer Dargah Sharif", [
        "File:Ajmer Sharif, Dargah of Mainuddin Chisti in Ajmer, Rajasthan 11.jpg",
        "File:Ajmer Sharif, Dargah of Mainuddin Chisti in Ajmer, Rajasthan 28.jpg",
      ]),
      day("ajmer-sharif-pushkar-darshan-d2.jpg", 2, "Ajmer Dargah ziarat Ana Sagar", [
        "File:Ajmer Sharif, Dargah of Mainuddin Chisti in Ajmer, Rajasthan 23.jpg",
        "File:Ana Sagar pavilion sunset 2016.jpg",
      ]),
      day("ajmer-sharif-pushkar-darshan-d3.jpg", 3, "Pushkar lake Brahma temple", [
        "File:20191215 Ghaty nad Jeziorem Puszkar 1230 8789.jpg",
        "File:20191215 Ghaty nad Jeziorem Puszkar 0950 8651.jpg",
      ]),
      day("ajmer-sharif-pushkar-darshan-d4.jpg", 4, "Jaipur airport departure Rajasthan", [
        "File:Hawa Mahal, Jaipur.jpg",
        "File:Jaipur City Palace.jpg",
      ], ["destinations/jaipur.jpg"]),
    ],
  },
  {
    slug: "ujjain-mahakaleshwar-darshan",
    targets: [
      gallery("ujjain-mahakaleshwar-darshan-g1.jpg", "Mahakaleshwar temple shikhara Ujjain", [
        "File:Shri Mahakaleshwar Temple Ujjain - panoramio (2).jpg",
        "File:Shri mahakaleshwar jyotirlinga temple Ujjain 01.jpg",
        "File:Mahakaleshwar ujjain.jpg",
      ]),
      gallery("ujjain-mahakaleshwar-darshan-g2.jpg", "Shipra River Ram Ghat Ujjain", [
        "File:Ram Ghat, Ujjain 01.jpg",
        "File:Shri Ram Ghat 03.jpg",
        "File:Ram ghat, Ujjain.jpg",
      ]),
      gallery("ujjain-mahakaleshwar-darshan-g3.jpg", "Harsiddhi Temple Ujjain", [
        "File:Harsiddhi Temple, Ujjain 02.jpg",
        "File:Harsiddhi Temple, Ujjain 01.jpg",
        "File:Harsiddhi temple pillars Ujjain.jpg",
      ]),
      gallery("ujjain-mahakaleshwar-darshan-g4.jpg", "Kal Bhairav temple Ujjain", [
        "File:Kal Bhairav temple Ujjain.jpg",
        "File:Kal Bhairav Ujjain - Deepmalika.jpg",
        "File:Lord Kal Bhairav, Ujjain.jpg",
      ]),
      day("ujjain-mahakaleshwar-darshan-d1.jpg", 1, "Indore to Ujjain Shipra Ram Ghat aarti", [
        "File:Bank of Shipra with Devotees, Ram Ghat , Ujjain on a Bright Sunny day.jpg",
        "File:Ram Ghat, Ujjain 02.jpg",
        "File:Shri Ram Ghat 02.jpg",
      ]),
      day("ujjain-mahakaleshwar-darshan-d2.jpg", 2, "Mahakaleshwar Bhasma aarti morning darshan", [
        "File:Mahakaleshwar Mandir in Ujjain.jpg",
        "File:Shri mahakaleshwar jyotirlinga temple Ujjain 01.jpg",
        "File:Shri Mahakaleshwar Temple Ujjain - panoramio (3).jpg",
      ]),
      day("ujjain-mahakaleshwar-darshan-d3.jpg", 3, "Indore airport departure Madhya Pradesh", [
        "File:Rajwada Palace, Indore.jpg",
        "File:Rajwada at Indore, Madhya Pradesh.jpg",
        "File:Indore Rajwada at night.jpg",
      ]),
    ],
  },
  {
    slug: "manali-honeymoon-escape",
    targets: [
      gallery("manali-honeymoon-escape-g3.jpg", "Vashisht hot springs village Manali", [
        "File:Vashishth temple.jpg",
        "File:Vashisht temple near manali.jpg",
        "File:Vashisht Manali.jpg",
      ], ["destinations/manali.jpg"]),
      gallery("manali-honeymoon-escape-g4.jpg", "Old Manali cafés lane Beas", [
        "File:Kullu Valley at dawn.jpg",
        "File:Mall road, Manali 01 by Tanweer.JPG",
      ], ["destinations/manali.jpg"]),
      day("manali-honeymoon-escape-d1.jpg", 1, "Manali Mall Road arrival evening", [
        "File:Mall Road, Manali.jpg",
        "File:Mall Road - Manali 01.jpg",
        "File:Mall Road, Manali, Himachal Pradesh.jpg",
      ], ["destinations/manali.jpg"]),
      day("manali-honeymoon-escape-d2.jpg", 2, "Solang Valley cable car meadow", [
        "File:Kullu manali (101).JPG",
        "File:Kullu manali (100).JPG",
        "File:Mall Road - Manali 2014-05-11 2633.JPG",
      ], ["destinations/manali.jpg"]),
      day("manali-honeymoon-escape-d3.jpg", 3, "Hadimba Vashisht honeymoon day Manali", [
        "File:Durga Mata Mandir at Mall Road, Manali.jpg",
        "File:Manali Mall road (17363588372).jpg",
      ], ["destinations/manali.jpg"]),
      day("manali-honeymoon-escape-d4.jpg", 4, "Naggar Castle Roerich gallery Kullu", [
        "File:Kullu Valley, Naggar Castle, India.jpg",
        "File:Naggar Castle Kullu WLM22-4062.jpg",
        "File:Naggar castle, Kullu district - 2.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      day("manali-honeymoon-escape-d5.jpg", 5, "Bhuntar Kullu airport departure", [
        "File:Mall Road - Manali 2014-05-10 2251.JPG",
        "File:Mall Road - Manali 2014-05-10 2240.JPG",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
    ],
  },
  {
    slug: "shimla-manali-honeymoon",
    targets: [
      gallery("shimla-manali-honeymoon-g4.jpg", "Vashisht temple sulphur springs Manali", [
        "File:Vashisht Manali.jpg",
        "File:Vashisht temple near manali.jpg",
      ], ["destinations/manali.jpg"]),
      day("shimla-manali-honeymoon-d1.jpg", 1, "Chandigarh to Shimla Kandaghat drive", [
        "File:Shikara - Sukhna Lake - Chandigarh 2016-08-07 (edit).jpg",
        "File:Panorama of Sukhna Lake, Chandigarh.jpg",
        "File:Rock Garden, Chandigarh 37.jpg",
      ]),
      day("shimla-manali-honeymoon-d2.jpg", 2, "Shimla Kufri Himalayan Nature Park", [
        "File:Kufri Simla Himachal India (5).jpg",
        "File:Kufri Simla Himachal India (14).jpg",
        "File:Crow from Kufri, Himachal (2).jpg",
      ], ["destinations/shimla.jpg"]),
      day("shimla-manali-honeymoon-d3.jpg", 3, "Shimla to Manali Mandi apple country", [
        "File:Mandi town in Himachal Pradesh 01.jpg",
        "File:Mandi town ,Himachal Pardesh.jpg",
        "File:Mandi town 2.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      day("shimla-manali-honeymoon-d4.jpg", 4, "Solang Valley Manali optional paragliding", [
        "File:Mall road, Manali 02 by Tanweer.JPG",
        "File:Beas View from Naggar Castle compound.jpg",
      ], ["destinations/manali.jpg"]),
      day("shimla-manali-honeymoon-d5.jpg", 5, "Manu Temple Hadimba Old Manali", [
        "File:Public Entrance alleyway Naggar Castle Manali.jpg",
        "File:Naggar Palace Manali.jpg",
      ], ["destinations/manali.jpg"]),
      day("shimla-manali-honeymoon-d6.jpg", 6, "Manali to Chandigarh plains transit", [
        "File:Sukhna Lake Chandigarh Evening.jpg",
        "File:Shivalik hills from Sukhna Lake in Chandigarh, India.jpg",
      ], ["destinations/himachal.jpg"]),
      day("shimla-manali-honeymoon-d7.jpg", 7, "Chandigarh airport departure", [
        "File:Rock Garden Memory Stone, Chandigarh, India.jpg",
        "File:Rock Garden of Chandigarh 20180907 172335.jpg",
        "File:Chandigarh Rock Garden 4.jpg",
      ]),
    ],
  },
  {
    slug: "pawna-lake-camping",
    targets: [
      gallery("pawna-lake-camping-g1.jpg", "Lonavala misty Western Ghats lakes", [
        "File:Lonavala Hills seen from train.jpg",
        "File:Through the mist in lonavala hill station.jpg",
        "File:Lonavala, and its environs, Maharashtra, India. 2012. 60.jpg",
      ]),
      gallery("pawna-lake-camping-g2.jpg", "Pawna lake shoreline tents Maharashtra", [
        "File:Beautiful view near Pawna Lake, Lonavala.jpg",
        "File:Beautiful Panorama view at Pawna Lake, Lonavala.jpg",
        "File:Clicked by Bunny327 view of the lake with a ⛵.jpg",
      ]),
      gallery("pawna-lake-camping-g3.jpg", "Tungarli lake Lonavala near Pawna", [
        "File:Lonavla view.jpg",
        "File:Lonavala Valley (51430499813).jpg",
        "File:Pune to lonavala scenic beauty.jpg",
      ]),
      gallery("pawna-lake-camping-g4.jpg", "Lohagad fort monsoon Lonavala", [
        "File:Lohagad Fort Vinchu Kata 6.jpg",
        "File:Bastions of Lohagad Fort 3.jpg",
        "File:Lohagad fort N-MH-M8-6.JPG",
      ]),
      day("pawna-lake-camping-d1.jpg", 1, "Lonavala jeep to Pawna lakeside camp", [
        "File:Amazing view at Pawna Lake, Lonavala.jpg",
        "File:Beautiful view at Pawna Lake near Lonavala.jpg",
      ]),
      day("pawna-lake-camping-d2.jpg", 2, "Pawna sunrise return Pune Lonavala", [
        "File:Sunset at Lonavala Hills, Pune.jpg",
        "File:Beautiful view at Pawna Lake, Lonavala.jpg",
      ]),
    ],
  },
  {
    slug: "wayanad-forest-camping",
    targets: [
      cover("wayanad-forest-camping-cover.jpg", "Wayanad Kerala forest plantation camping hills", [
        "File:Wayanad - Kanthanpara Waterfalls - 4.jpg",
        "File:Wayanad Tea Museum.jpg",
        "File:Church in Wayanad Kerala India.jpg",
      ]),
      gallery("wayanad-forest-camping-g1.jpg", "Wayanad rainforest Western Ghats Kerala", [
        "File:Wayanad - Kanthanpara Waterfalls - 3.jpg",
        "File:Wayanad - Highway Sign Painter.jpg",
      ]),
      gallery("wayanad-forest-camping-g2.jpg", "Edakkal Caves Wayanad petroglyphs", [
        "File:Edakkal Caves - Petroglyphs - 4.jpg",
        "File:Edakkal Caves - Interior.jpg",
        "File:Edakkal Caves 0429.jpg",
      ]),
      gallery("wayanad-forest-camping-g3.jpg", "Soochipara waterfall Wayanad", [
        "File:Soochipara falls.jpg",
        "File:Soochippara waterfalls,Wayanad,kerala.jpg",
        "File:Soochipara Falls, Wayanad Kerala, 2013.jpeg",
      ]),
      gallery("wayanad-forest-camping-g4.jpg", "Wayanad coffee pepper plantation trail", [
        "File:Wayanad Tea Museum.jpg",
        "File:Chembra Peak Heart Lake.jpg",
      ]),
      day("wayanad-forest-camping-d1.jpg", 1, "Arrive Wayanad forest camp plantation", [
        "File:Edakkal Caves - Petroglyphs - 1.jpg",
        "File:Cave at Edakkal(Inside).JPG",
      ]),
      day("wayanad-forest-camping-d2.jpg", 2, "Soochipara stream viewpoint Wayanad", [
        "File:Chembra Peak, Wayanad - panoramio.jpg",
        "File:Chembra Peak 2.jpg",
        "File:En Ooru - Chembra Peak View.jpg",
      ]),
      day("wayanad-forest-camping-d3.jpg", 3, "Calicut checkout Kerala hills departure", [
        "File:Kozhikode beach.jpg",
        "File:Calicut International Airport.jpg",
      ]),
    ],
  },
];

/** Cover + gallery (+ selective days) refetched when ATTRIBUTION has no line for the file. */
const ATTR_BACKFILL: TourImageJob[] = [
  {
    slug: "mathura-vrindavan-agra-circuit",
    targets: [
      cover("mathura-vrindavan-agra-circuit-cover.jpg", "Prem Mandir Vrindavan white temple Braj", [
        "File:Mathura Temple-Mathura-India0002.JPG",
        "File:Radha Syamasundar Vrindavan Radhastami 2004.jpg",
      ]),
      gallery("mathura-vrindavan-agra-circuit-g1.jpg", "Shri Krishna Janmabhoomi Mathura", [
        "File:Krishna Janmasthan Temple.jpg",
        "File:Keshav Dev Temple at the Shri Krishna Janma-Bhoomi - Mathura - India - 2013-03 096 (11552205214).jpg",
      ]),
      gallery("mathura-vrindavan-agra-circuit-g2.jpg", "Banke Bihari Temple Vrindavan", [
        "File:Banke bihari (37).JPG",
        "File:Banke bihari (38).JPG",
      ]),
      gallery("mathura-vrindavan-agra-circuit-g3.jpg", "ISKCON temple Vrindavan", [
        "File:Radhavallabh Lal ju Maharaj Temple Vrindavan 2022 09.jpg",
        "File:Shahji temple Vrindavan 08.jpg",
      ]),
      gallery("mathura-vrindavan-agra-circuit-g4.jpg", "Yamuna ghats Vishram Ghat Mathura", [
        "File:Vishram Ghat.jpg",
        "File:Mathura banner.jpg",
      ]),
    ],
  },
  {
    slug: "ajmer-sharif-pushkar-darshan",
    targets: [
      cover("ajmer-sharif-pushkar-darshan-cover.jpg", "Ajmer Sharif Dargah Khwaja Moinuddin Chishti", [
        "File:Night View of Ajmer Sharif Dargah.jpg",
        "File:Ajmer Sharif, Dargah of Mainuddin Chisti in Ajmer, Rajasthan 19.jpg",
      ]),
    ],
  },
  {
    slug: "ujjain-mahakaleshwar-darshan",
    targets: [
      cover("ujjain-mahakaleshwar-darshan-cover.jpg", "Mahakaleshwar Jyotirlinga temple Ujjain", [
        "File:Mahakaleshwar Temple, Ujjain.jpg",
        "File:Mahakaleshwar ujjain.jpg",
      ]),
    ],
  },
  {
    slug: "manali-honeymoon-escape",
    targets: [
      cover("manali-honeymoon-escape-cover.jpg", "Manali honeymoon Beas valley Himachal couples", [
        "File:Mall Road, Manali, Himachal Pradesh.jpg",
        "File:Durga Mata Mandir at Mall Road, Manali.jpg",
      ], ["destinations/manali.jpg"]),
      gallery("manali-honeymoon-escape-g1.jpg", "Solang Valley meadow Manali", [
        "File:Kullu manali (100).JPG",
        "File:Mall road, Manali 01 by Tanweer.JPG",
      ], ["destinations/manali.jpg"]),
      gallery("manali-honeymoon-escape-g2.jpg", "Hadimba Devi Temple deodar grove Manali", [
        "File:Naggar Palace Manali.jpg",
        "File:Naggar Castle city view.jpg",
      ], ["destinations/manali.jpg"]),
    ],
  },
  {
    slug: "shimla-manali-honeymoon",
    targets: [
      cover("shimla-manali-honeymoon-cover.jpg", "Shimla Viceregal Lodge honeymoon ridge Himachal", [
        "File:Indian Institute of Advanced Study, Shimla.jpg",
        "File:Kufri Simla Himachal India (16).jpg",
      ], ["destinations/shimla.jpg"]),
      gallery("shimla-manali-honeymoon-g1.jpg", "Jakhu Temple Hanuman Shimla", [
        "File:Kufri Simla Himachal India (14).jpg",
        "File:Kufri Simla Himachal India (13).jpg",
      ], ["destinations/shimla.jpg"]),
      gallery("shimla-manali-honeymoon-g2.jpg", "Shimla Scandal Point Mall Road", [
        "File:The Ridge, Shimla.jpg",
        "File:Crow from Kufri, Himachal (2).jpg",
      ], ["destinations/shimla.jpg"]),
      gallery("shimla-manali-honeymoon-g3.jpg", "Kullu valley Mandi Beas river highway", [
        "File:Mandi town in Himachal Pradesh 02.jpg",
        "File:Mandi Town (38817).jpg",
      ], ["destinations/himachal.jpg"]),
      day("shimla-manali-honeymoon-d1.jpg", 1, "Chandigarh to Shimla Kandaghat drive", [
        "File:The Ridge, Shimla.jpg",
        "File:Rock Garden, Chandigarh 2.jpg",
        "File:Shikara - Sukhna Lake - Chandigarh 2016-08-07 (edit).jpg",
      ]),
    ],
  },
  {
    slug: "pawna-lake-camping",
    targets: [
      cover("pawna-lake-camping-cover.jpg", "Pawna lake Lonavala Maharashtra camping sunset", [
        "File:Beautiful Panorama view at Pawna Lake, Lonavala.jpg",
        "File:Beautiful view at Pawna Lake near Lonavala.jpg",
      ]),
    ],
  },
  {
    slug: "haridwar-rishikesh-spiritual-escape",
    targets: [
      cover("haridwar-rishikesh-spiritual-escape-cover.jpg", "Har Ki Pauri Ganga aarti Haridwar Uttarakhand", [
        "File:Sunrise view of the main bathing ghat at Har-ki-pauri, Haridwar.jpg",
        "File:Har-ki-pauri, Haridwar.JPG",
        "File:Temples at Har ki Pauri, Haridwar.jpg",
      ]),
      gallery("haridwar-rishikesh-spiritual-escape-g1.jpg", "Haridwar Ganga ghats pilgrimage", [
        "File:Pilgrims sitting at the ghats, Har ki Pauri, Haridwar.jpg",
        "File:Har Ki Pauri Haridwar aryagraphy.jpg",
      ]),
      gallery("haridwar-rishikesh-spiritual-escape-g2.jpg", "Mansa Devi temple Haridwar hill", [
        "File:Mansa Devi Temple, Haridwar 01.jpg",
        "File:Mansa Devi Ropeway, Haridwar.jpg",
      ], ["destinations/haridwar.jpg"]),
      gallery("haridwar-rishikesh-spiritual-escape-g3.jpg", "Parmarth Niketan Rishikesh Ganga ghat", [
        "File:River ghat (of River Ganges) at the Parmarth Niketan, in Rishikesh, Uttarakhand.jpg",
        "File:Front entrance of the Parmarth Niketan, in Rishikesh, Uttarakhand.jpg",
      ]),
      gallery("haridwar-rishikesh-spiritual-escape-g4.jpg", "Ram Jhula suspension bridge Rishikesh", [
        "File:Ram Jhula footbridge - Rishikesh.jpg",
        "File:Devotees and Tourist Enjoying the Sunset at Rishikesh Ram jhula 07.jpg",
      ]),
    ],
  },
];

function slotsMissingAttribution(slug: string, tourDir: string): Set<string> {
  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  const text = existsSync(attrPath) ? readFileSync(attrPath, "utf8") : "";
  const missing = new Set<string>();
  for (const name of readdirSync(tourDir)) {
    if (!name.startsWith(`${slug}-`) || !name.endsWith(".jpg")) continue;
    if (!text.split("\n").some((line) => line.startsWith(`${name}  ←`))) missing.add(name);
  }
  return missing;
}

function probeTitles(titles: string[]): Map<string, boolean> {
  const pyPath = path.join(tmpdir(), "probe-batch3-commons-verify.py");
  const titlesPath = path.join(tmpdir(), "probe-batch3-titles.json");
  writeFileSync(titlesPath, JSON.stringify(titles));
  writeFileSync(
    pyPath,
    `import json, urllib.parse, urllib.request, time, sys
agent = "WorldCompassHoliday/1.0 (batch3-fix-probe)"
titles = json.load(open(sys.argv[1]))
out = {}
for t in titles:
    time.sleep(0.85)
    params = urllib.parse.urlencode({
        "action": "query", "titles": t, "prop": "imageinfo",
        "iiprop": "mime|size", "format": "json"
    })
    req = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{params}",
        headers={"User-Agent": agent},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = json.loads(r.read())
    except Exception:
        out[t] = False
        continue
    ok = False
    for pid, p in data.get("query", {}).get("pages", {}).items():
        if pid == "-1":
            break
        ii = (p.get("imageinfo") or [{}])[0]
        w = ii.get("width", 0)
        mime = ii.get("mime", "")
        ok = w >= 800 and mime.startswith("image/") and "svg" not in mime
        break
    out[t] = ok
print(json.dumps(out))
`,
  );
  const raw = execFileSync("python3", [pyPath, titlesPath], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  return new Map(Object.entries(JSON.parse(raw.trim()) as Record<string, boolean>));
}

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

function filterProbed(target: ImageTarget, probed: Map<string, boolean>): ImageTarget {
  const verified = target.titles.filter((t) => probed.get(t));
  if (!verified.length && !target.titles.length && !target.localFallbacks?.length) {
    throw new Error(`No titles or fallbacks for ${target.file} (${target.place})`);
  }
  if (!verified.length && target.titles.length) {
    console.log(`  probe ${target.file}: 0/${target.titles.length} (rate-limit — trying curated list)`);
  } else {
    console.log(`  probe ${target.file}: ${verified.length}/${target.titles.length} titles ok`);
  }
  return {
    ...target,
    titles: verified.length ? verified : target.titles,
    skipSearch: true,
  };
}

function missingTargets(slug: string, want: ImageTarget[], tourDir: string): ImageTarget[] {
  return want.filter((t) => !existsSync(path.join(tourDir, t.file)));
}

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const toFix = FIX_JOBS.flatMap((job) => missingTargets(job.slug, job.targets, tourDir));
  if (!toFix.length) {
    console.log("No missing batch-3 image slots under public/uploads/tours");
  } else {
    const allTitles = [...new Set(toFix.flatMap((t) => t.titles))];
    console.log(`Probing ${allTitles.length} curated File: titles…`);
    const probed = probeTitles(allTitles);

    const shared = createBatchBlocklist("__fix_batch3__");
    for (const name of readdirSync(tourDir)) {
      if (!/\.jpe?g$/i.test(name)) continue;
      claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
    }

    for (const job of FIX_JOBS) {
      const pending = missingTargets(job.slug, job.targets, tourDir);
      if (!pending.length) {
        console.log(`\nSkip ${job.slug}: image slots complete`);
        continue;
      }
      const existing: ImageTarget[] = [];
      for (const name of readdirSync(tourDir)) {
        if (!name.startsWith(`${job.slug}-`) || !name.endsWith(".jpg")) continue;
        if (pending.some((t) => t.file === name)) continue;
        const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
        existing.push(keepStub(name, dayNumber));
      }
      const targets = pending.map((t) => filterProbed(t, probed));
      console.log(`\nFixing ${job.slug}: ${targets.map((t) => t.file).join(", ")}`);
      await fetchAndWireTourImages({ slug: job.slug, targets: [...existing, ...targets] }, { sharedBlock: shared });
    }
  }

  const backfillPending = ATTR_BACKFILL.flatMap((job) => {
    const miss = slotsMissingAttribution(job.slug, tourDir);
    return job.targets
      .filter(
        (t) => miss.has(t.file) || !existsSync(path.join(tourDir, t.file)),
      )
      .map((t) => ({ slug: job.slug, target: t }));
  });
  if (backfillPending.length) {
    const titles = [...new Set(backfillPending.flatMap((p) => p.target.titles))];
    console.log(`\nAttribution backfill: ${backfillPending.length} slots, probing ${titles.length} titles…`);
    const probed = probeTitles(titles);
    const shared = createBatchBlocklist("__fix_batch3_attr__");
    for (const name of readdirSync(tourDir)) {
      if (!/\.jpe?g$/i.test(name)) continue;
      claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
    }
    const bySlug = new Map<string, ImageTarget[]>();
    for (const { slug, target } of backfillPending) {
      const full = path.join(tourDir, target.file);
      if (existsSync(full)) {
        const miss = slotsMissingAttribution(slug, tourDir);
        if (!miss.has(target.file)) continue;
        unlinkSync(full);
      }
      const probedTarget = filterProbed(target, probed);
      const list = bySlug.get(slug) ?? [];
      list.push(probedTarget);
      bySlug.set(slug, list);
    }
    for (const [slug, pending] of bySlug) {
      const existing: ImageTarget[] = [];
      for (const name of readdirSync(tourDir)) {
        if (!name.startsWith(`${slug}-`) || !name.endsWith(".jpg")) continue;
        if (pending.some((t) => t.file === name)) continue;
        const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
        existing.push(keepStub(name, dayNumber));
      }
      console.log(`\nAttribution backfill ${slug}: ${pending.map((t) => t.file).join(", ")}`);
      await fetchAndWireTourImages({ slug, targets: [...existing, ...pending] }, { sharedBlock: shared });
    }
  }

  console.log("\n=== Batch 3 final status ===");
  const slugs = [
    "haridwar-rishikesh-spiritual-escape",
    "mathura-vrindavan-agra-circuit",
    "ajmer-sharif-pushkar-darshan",
    "ujjain-mahakaleshwar-darshan",
    "manali-honeymoon-escape",
    "shimla-manali-honeymoon",
    "pawna-lake-camping",
    "wayanad-forest-camping",
  ];
  for (const slug of slugs) {
    const parts = ["cover", "g1", "g2", "g3", "g4"];
    const days = readdirSync(tourDir)
      .filter((n) => n.startsWith(`${slug}-d`) && n.endsWith(".jpg"))
      .sort();
    const missMedia = parts.filter((p) => !existsSync(path.join(tourDir, `${slug}-${p}.jpg`)));
    const attr = existsSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`));
    const attrLines = attr
      ? readFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), "utf8").split("\n").filter((l) => l.includes("←")).length
      : 0;
    const total = parts.length + days.length;
    const ok = missMedia.length === 0 && days.length >= 1;
    console.log(
      `  ${slug}: media=${ok ? "OK" : "INCOMPLETE"} (${total - missMedia.length - (days.length < 1 ? 999 : 0)}/${total} files, ${days.length} day imgs) attribution=${attr ? `${attrLines} lines` : "missing"}`,
    );
    if (missMedia.length) console.log(`    missing: ${missMedia.join(", ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
