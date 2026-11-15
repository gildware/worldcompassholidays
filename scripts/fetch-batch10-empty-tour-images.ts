/**
 * Batch 10 (8 tours) — shimla-manali-combo, ranthambore-jaipur-combo, andaman honeymoon,
 * nafran trek, leh honeymoon, har-ki-dun, ladakh family, north sikkim.
 *
 *   npx tsx scripts/fetch-batch10-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch10-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch10-empty-tour-images.ts --only har-ki-dun-trek
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
    const slug = "shimla-manali-combo";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Shimla GPO Mall Road leisure ridge Himachal", [
          "File:Shimla Observatory Hill.jpg",
          "File:Kandaghat Shimla road.jpg",
          "File:Annandale, Shimla.jpg",
          "File:Indian Institute of Advanced Study, Shimla 05.jpg",
          "File:Mall road shimla.jpg",
        ], ["destinations/shimla.jpg", "destinations/himachal.jpg"]),
        t.g(1, "Kufri Himalayan meadow outing Shimla", [
          "File:Kufri winter meadow Shimla.jpg",
          "File:Flea Market in Kufri Shimla.jpg",
          "File:Cedrus deodara Shimla Kufri 1.jpg",
          "File:Kufri in Shimla 3.jpg",
        ], ["destinations/shimla.jpg"]),
        t.g(2, "Scandal Point Mall Road Shimla", [
          "File:Scandal Point Shimla.jpg",
          "File:Shimla town hall.jpg",
          "File:Shimla Observatory Hill.jpg",
        ], ["destinations/shimla.jpg"]),
        t.g(3, "Beas valley Old Manali bridge", [
          "File:Beas River - Manali, Himachal Pradesh, India - rohanakakaka.jpg",
          "File:Old Manali Village.jpg",
          "File:Bridge in Manali.jpg",
        ], ["destinations/manali.jpg"]),
        t.g(4, "Hadimba cedar grove Manali leisure", [
          "File:Hidimba Devi Temple, Manali.jpg",
          "File:Hadimba temple Manali cedar.jpg",
          "File:Hadimba Devi Temple architecture.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(1, "Chandigarh IXC climb to Shimla Mall", [
          "File:Chandigarh Capitol Complex.jpg",
          "File:Rock Garden Chandigarh.jpg",
          "File:Shimla highway Himachal.jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(2, "Kufri outing Himalayan Nature Park", [
          "File:Himalayan Nature Park Kufri.jpg",
          "File:Road to Kufri, Shimla.jpg",
          "File:Great Himalaya view from Kufri, Shimla.jpg",
        ], ["destinations/shimla.jpg"]),
        t.d(3, "Shimla Manali scenic highway Mandi", [
          "File:River Beas - Chandigarh-Manali Highway - NH-21 - Mandi 2014-05-09 2149.JPG",
          "File:Beas river Kullu Manali road.jpg",
          "File:Sundernagar lake Mandi.jpg",
        ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
        t.d(4, "Hadimba Old Manali afternoon", [
          "File:Hidimba Devi Temple, Dhungri Manali 2.jpg",
          "File:Manu Temple Manali.jpg",
          "File:Museum Of Himachal Culture & Folk Art, Manali, Kullu, HP India.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(5, "Solang optional valley Manali", [
          "File:Solang Valley ,Paragliding view, Manali, Himachal Pardes,india.JPG",
          "File:Paragliders at Solang Valley, Manali.jpg",
          "File:Manali Solang summer.jpg",
        ], ["destinations/manali.jpg"]),
        t.d(6, "Manali Chandigarh IXC drop", [
          "File:Shaheed Bhagat Singh International Airport Gates 7,8,9 and 10.jpg",
          "File:Chandigarh Airport Terminal.jpg",
          "File:Chandigarh International Airport.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "ranthambore-jaipur-combo";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Albert Hall Museum Jaipur pink city combo", [
          "File:Albert Hall Museum Jaipur.jpg",
          "File:Albert Hall Museum Jaipur night.jpg",
          "File:Jaipur Albert Hall at night.jpg",
          "File:Central Museum Jaipur.jpg",
        ], ["destinations/jaipur.jpg"]),
        t.g(1, "Amer Fort Sheesh Mahal Jaipur", [
          "File:Amer Fort Sheesh Mahal.jpg",
          "File:Amber Palace Jaipur.jpg",
          "File:Amber Fort courtyard Jaipur.jpg",
        ], ["destinations/jaipur.jpg"]),
        t.g(2, "Jantar Mantar observatory Jaipur", [
          "File:Jantar Mantar Jaipur.jpg",
          "File:Samdrat Yantra Jaipur.jpg",
          "File:Jantar Mantar observatory Jaipur India.jpg",
        ], ["destinations/jaipur.jpg"]),
        t.g(3, "Ranthambore Fort Jain temple overlook", [
          "File:Ranthambore Fort, Rajasthan.JPG",
          "File:Ranthambore Fort view.jpg",
          "File:Ranthambore National Park entrance gate.jpg",
        ]),
        t.g(4, "Jeep safari Ranthambore National Park", [
          "File:Jeep safari Ranthambore.jpg",
          "File:Safari jeep Ranthambore National Park.jpg",
          "File:Ranthambore National Park safari.jpg",
        ]),
        t.d(1, "Jaipur arrive Hawa Mahal bazaars", [
          "File:Johari-bazaar 0.jpg",
          "File:Hawa Mahal street Jaipur.jpg",
          "File:Jaipur old city pink buildings.jpg",
        ], ["destinations/jaipur.jpg"]),
        t.d(2, "Amer Fort City Palace Jaipur day", [
          "File:Amber Fort, Jaipur, 20191219 1032 9565.jpg",
          "File:Jaipur City Palace courtyard.jpg",
          "File:City Palace Jaipur.jpg",
        ], ["destinations/jaipur.jpg"]),
        t.d(3, "Drive Sawai Madhopur Ranthambore lodge", [
          "File:Ranthambore Pravesh Mahad Dwaar at Hamir Circle, Sawai Madhopur.jpg",
          "File:Sawai Madhopur railway station.jpg",
          "File:Ranthambore National Park entrance.jpg",
        ]),
        t.d(4, "Twin jeep tiger safaris Ranthambore", [
          "File:Fauna.Parque nacional Ranthambore. Rajasthan..JPG",
          "File:Nilgai Ranthambore National Park.jpg",
          "File:Chital deer Ranthambore National Park.jpg",
        ]),
        t.d(5, "Ranthambore Fort return Jaipur shopping", [
          "File:Jaipur Market.jpg",
          "File:Sanganer block printing Jaipur.jpg",
          "File:Jaipur Street Vendors (1581573198).jpg",
        ], ["destinations/jaipur.jpg"]),
        t.d(6, "Jaipur JAI airport departure", [
          "File:JaiAirport.JPG",
          "File:Jaipur International Airport.jpg",
          "File:Jaipur city morning departure.jpg",
        ], ["destinations/jaipur.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "andaman-island-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Radhanagar Beach Havelock honeymoon sunset", [
          "File:Havelock Island, Radhanagar Beach before sunset, Andaman Islands.jpg",
          "File:Havelock Island, Radhanagar Beach sunset, Andaman Islands.jpg",
          "File:Radhanagar Beach Havelock vrvbaan042k24 (4).jpg",
          "File:Havelock Island, Radhanagar Beach, tropical bliss, Andaman Islands.jpg",
        ]),
        t.g(1, "Corbyn Cove Port Blair couples arrival", [
          "File:Corbyns cove beach-1-port blair-andaman-India.jpg",
          "File:Corbyns cove beach-3-port blair-andaman-India.jpg",
          "File:Corbyn's Cove beach Port Blair.jpg",
        ]),
        t.g(2, "Cellular Jail Port Blair history", [
          "File:Cellular Jail, Andaman, Port Blair, India.jpg",
          "File:Front View of Cellular Jail, Port Blair.JPG",
          "File:Cellular Jail, Andaman & Nicobar, Port Blair, India, night view.jpg",
        ]),
        t.g(3, "Elephant Beach Havelock snorkel shallows", [
          "File:Elephant beach, Havelock Island.jpg",
          "File:Snorkeling at Elephant beach, Havelock Island,Andaman.jpg",
          "File:Havelock Island, Sandy lagoon, Andaman Islands.jpg",
        ]),
        t.g(4, "Vijay Nagar quiet Havelock beach", [
          "File:Havelock Island, Mangrove tree on the beach, Andaman Islands.jpg",
          "File:Kala Patthar beach in Havelock. Andaman and Nicobar Islands.jpg",
          "File:Havelock Island, Radhanagar Beach, Andaman Islands.jpg",
        ]),
        t.d(1, "Port Blair arrive Cellular Jail evening", [
          "File:Port Blair harbour Andaman.jpg",
          "File:Closer view of a cell of Cellular Jail, Port Blair, India.jpg",
        ]),
        t.d(2, "Ferry Havelock Vijay Nagar beach intro", [
          "File:Havelock Island, Radhanagar Beach, Andaman Islands.jpg",
          "File:Beautiful beach in Havelock Island, Andaman.JPG",
          "File:Havelock Island, Vijaynagar Beach, Andaman Islands.jpg",
          "File:Andaman beach Havelock Island 02.jpg",
        ]),
        t.d(3, "Radhanagar Beach No 7 couples sunset", [
          "File:Radhanagar Beach Havelock vrvbaan042k24 (11).jpg",
          "File:Radhanagar Beach Havelock vrvbaan042k24 (9).jpg",
        ]),
        t.d(4, "Slow Havelock together beach day", [
          "File:Radhanagar Beach Havelock vrvbaan042k24 (1).jpg",
          "File:Trees around Radhanagar Beach Havelock vrvbaan042k24 (11).jpg",
        ]),
        t.d(5, "Chidiyatapu sunset return Port Blair", [
          "File:Chidiyatapu sunset.jpg",
          "File:Chidiya Tapu Andaman Nicobar.jpg",
          "File:Munda Pahar Beach Chidiyatapu.jpg",
        ]),
        t.d(6, "Port Blair IXZ honeymoon departure", [
          "File:Port Blair Airport runway..JPG",
          "File:Veer Savarkar International Airport – New Terminal.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "nafran-valley-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Sonamarg alpine meadow Nafran trek Kashmir", [
          "File:Sonmarg Kashmir.jpg",
          "File:Sonamarg valley.jpg",
          "File:Thajwas glacier Sonamarg.jpg",
          "File:Sonamarg mountains.jpg",
        ], ["destinations/sonamarg.jpg", "destinations/kashmir.jpg"]),
        t.g(1, "Sind river Sonamarg trailhead", [
          "File:Sonmarg, Kashmir.jpg",
          "File:Thajiwas peak.jpg",
          "File:Zoji La pass near Sonamarg.jpg",
          "File:Sindh River Kashmir.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.g(2, "Zoji La gateway Sonamarg trek", [
          "File:Zoji La.jpg",
          "File:Zojila Pass.jpg",
          "File:Baltal Sonamarg.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.g(3, "Kashmir Himalaya meadow camp", [
          "File:Kashmir Himalaya Sonamarg.jpg",
          "File:Thajiwas peak.jpg",
          "File:Sonamarg meadow.jpg",
        ], ["destinations/kashmir.jpg"]),
        t.g(4, "Thajiwas range glacier views trek", [
          "File:Mount Harmukh District Ganderbal.jpg",
          "File:Harmukh Peak, Kashmir.jpg",
          "File:Alpine meadow Kashmir Himalaya.jpg",
        ], ["destinations/sonamarg.jpg", "destinations/kashmir.jpg"]),
        t.d(1, "Srinagar Sonamarg acclimatisation", [
          "File:Sonmarg, Kashmir.jpg",
          "File:Thajwas glacier.jpg",
          "File:Thajiwas Park, Sonamarg, Jammu and Kashmir, India.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.d(2, "Jeep trailhead first Nafran meadow camp", [
          "File:Thajiwas Glacier.jpg",
          "File:Thajwas glacier Sonamarg.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.d(3, "High ridge inner valley lake bowl", [
          "File:Krishansar Lake, Sonmarg, Kashmir valley, India 01.jpg",
          "File:Alpine lake Kashmir trek.jpg",
          "File:Mountain meadow Kashmir Himalaya.jpg",
        ], ["destinations/kashmir.jpg"]),
        t.d(4, "Nafran pass views photography day", [
          "File:Nundkol and Gangabal Lakes of Kashmir.jpg",
          "File:Nichnai Pass Kashmir trek.jpg",
          "File:Satsar Lake Kashmir.jpg",
        ], ["destinations/kashmir.jpg"]),
        t.d(5, "Descend Nafran stream meadow exit", [
          "File:Sonamarg.jpg",
          "File:Thajiwas Sonamarg Kashmir.jpg",
        ], ["destinations/sonamarg.jpg"]),
        t.d(6, "Sonamarg road Srinagar recovery", [
          "File:Man on Boulevard - Dal Lake - Srinagar - Jammu & Kashmir - India (26775412051).jpg",
          "File:Srinagar Boulevard.jpg",
          "File:Dal Lake Srinagar 3.jpg",
        ], ["destinations/srinagar.jpg"]),
        t.d(7, "Srinagar SXR airport trek departure", [
          "File:Srinagar (SXR) airport - vrvvkbjk2k23pxl (2).jpg",
          "File:Srinagar Airport.jpg",
          "File:Srinagar International Airport terminal.jpg",
        ], ["destinations/srinagar.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "leh-ladakh-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Shanti Stupa Leh Ladakh honeymoon dusk", [
          "File:Shanti Stupa, Leh.jpg",
          "File:Shanti Stupa Leh Ladakh.jpg",
          "File:Leh Shanti Stupa panorama.jpg",
          "File:Shanti Stupa at Leh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(1, "Leh Palace Indus valley romance", [
          "File:Leh Palace, Ladakh, India.jpg",
          "File:Leh Palace Ladakh.jpg",
          "File:Leh, Ladakh, India.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(2, "Magnetic Hill Leh Ladakh", [
          "File:Magnetic Hill, Ladakh.jpg",
          "File:Magnetic hill sign Ladakh.jpg",
          "File:Magnetic Hill Ladakh India.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(3, "Diskit monastery Nubra honeymoon", [
          "File:Diskit Valley view from the Monastery.jpg",
          "File:Diskit monastery Ladakh.jpg",
          "File:Diskit Buddha statue Ladakh.jpg",
        ], ["destinations/nubra.jpg", "destinations/ladakh.jpg"]),
        t.g(4, "Pangong Tso blues lakeside", [
          "File:Pangong Lake in Ladakh.jpg",
          "File:Morning at Pangong Lake.jpg",
          "File:Ladakh Pangong lake view.jpg",
          "File:Pangong Lake Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(1, "Fly Leh strict rest acclimatisation", [
          "File:Leh Kushok Bakula Rimpochee Airport terminal.jpg",
          "File:Airport Leh Ladakh mountains.jpg",
          "File:Ladakh Range 01.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(2, "Shanti Stupa Leh Palace soft day", [
          "File:Dried Apricots for Sale in a Market ,Leh, Ladakh 03.jpg",
          "File:Leh Palace view from Changspa Ladakh.jpg",
          "File:Prayer wheels Leh market Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(3, "Khardung La Diskit dunes Nubra", [
          "File:En route Nubra Valley from Leh, Ladakh, India (2015).jpg",
          "File:Nubra Valley 2.jpg",
          "File:Sand dunes in Nubra Valley, Ladakh.jpg",
        ], ["destinations/nubra.jpg"]),
        t.d(4, "Shyok route Pangong first colours", [
          "File:Pangong Lake, Ladakh, India 02.jpg",
          "File:Pangong Lake, Ladakh, India 03.jpg",
          "File:Spangmik village Pangong Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(5, "Sunrise Pangong Chang La Leh return", [
          "File:Chroicocephalus brunnicephalus, near Chang La Pass, Ladakh, India.jpg",
          "File:Chang La (pass), Ladakh.jpg",
          "File:Chang La (pass), Checkpoint, Ladakh, North India.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(6, "Leh couples market farewell dinner", [
          "File:Hall of Fame Leh Ladakh.jpg",
          "File:Confluence of Indus and Zanskar rivers.jpg",
          "File:Indus River near Leh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(7, "Leh IXL airport departure", [
          "File:The Prime Minister, Dr. Manmohan Singh unveiling the plaque for renaming the Leh Airport Terminal as Kushok Bakula Rimpochhe Terminal at Leh on June 10, 2005.jpg",
          "File:Kushok Bakula Rimpochee airport Leh.jpg",
        ], ["destinations/ladakh.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "har-ki-dun-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Har Ki Dun valley Swargarohini amphitheatre trek", [
          "File:Entering Har Ki Dun.JPG",
          "File:Har Ki Dun Valley View (20823461470).jpg",
          "File:Har Ki Dun.jpg",
          "File:Har ki Dun.jpg",
        ]),
        t.g(1, "Supin river valley Govind sanctuary", [
          "File:SUPIN RIVER VALLEY.jpg",
          "File:Har Ki Dun Valley View (21018687911).jpg",
        ]),
        t.g(2, "Osla village traditional Uttarakhand", [
          "File:Village osla.jpg",
          "File:Duryodhan Temple in Osla Village, Uttarkasi 01.jpg",
          "File:Duryodhan Temple in Osla Village, Uttarkasi 02.jpg",
        ]),
        t.g(3, "Swargarohini peak Har Ki Dun bowl", [
          "File:SWARGAROHINI PEAK.jpg",
          "File:SWARGAROHINI MOUNTAIN.2.jpg",
          "File:Mount Swargarohini .jpg",
        ]),
        t.g(4, "Har Ki Dun meadow camp pine forest", [
          "File:Duryodhan Temple Mountains.jpg",
          "File:Snow Peaks From Valley.jpg",
          "File:Mountain Within Clouds.jpg",
        ]),
        t.d(1, "Dehradun drive Sankri guesthouse", [
          "File:Dehradun Railway Station.jpg",
          "File:Jolly Grant Airport Dehradun.jpg",
          "File:Dehradun city Uttarakhand.jpg",
        ], ["destinations/dehradun.jpg", "destinations/uttarakhand.jpg"]),
        t.d(2, "Taluka roadhead trek toward Osla", [
          "File:Har ki Dun.jpg",
          "File:Entering Har Ki Dun.JPG",
        ]),
        t.d(3, "Osla Har Ki Dun meadow camp", [
          "File:Har Ki Dun Valley View (21018687911).jpg",
          "File:Har Ki Dun Valley View (20823461470).jpg",
        ]),
        t.d(4, "Har Ki Dun bowl photography hour", [
          "File:Pink Flowers Valley.jpg",
          "File:Recent Snowfall On Mountain.jpg",
        ]),
        t.d(5, "Optional Jaundhar glacier ridge", [
          "File:Atta Valley Bone Mountain.jpg",
          "File:Mirunda Taal LAke Snow View.jpg",
        ]),
        t.d(6, "Descend Taluka Sankri recovery", [
          "File:Flowers And View.jpg",
          "File:All Green Trees.jpg",
        ]),
        t.d(7, "Dehradun DED departure trek end", [
          "File:Forest Research Institute Dehradun.jpg",
          "File:Robber's Cave Dehradun.jpg",
          "File:Clement Town Dehradun.jpg",
          "File:Dehradun railway station Uttarakhand.jpg",
        ], ["destinations/dehradun.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "ladakh-family-expedition";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Thiksey Monastery Ladakh family Indus view", [
          "File:Thiksey Monastery, Ladakh 14.jpg",
          "File:Maitreya Buddha, Thiksey Monastery.jpg",
          "File:Thiksey Monastery.jpg",
          "File:Thiksey Gompa Ladakh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(1, "Leh Shanti Stupa family acclimatisation", [
          "File:Shanti Stupa Leh.jpg",
          "File:View of Leh from Shanti Stupa.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(2, "Khardung La family Nubra crossing", [
          "File:Khurdung La Pass.jpg",
          "File:Khardung La Pass, highest road in the world (2563941837).jpg",
        ], ["destinations/ladakh.jpg"]),
        t.g(3, "Hunder dunes Bactrian camel Nubra", [
          "File:Bactrian camels at Hunder sand dunes Ladakh.jpg",
          "File:A Lady in White Dress, Hunder Sand Dunes, Nubra Valley, Ladakh.jpg",
          "File:Sand dunes and poplars Nubra Valley Ladakh.jpg",
        ], ["destinations/nubra.jpg"]),
        t.g(4, "Pangong Spangmik family lakeside", [
          "File:Panoramic view of Pnagong lake, Pangong Tso, view form Spangmik area, july 2022.jpg",
          "File:Some of the peaks aroung the Pangong Tso at Spangmik (10035185326).jpg",
          "File:Pangong Lake, Ladakh, India 05.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(1, "Arrive Leh family rest day", [
          "File:Leh airport Ladakh.jpg",
          "File:Indus Valley near Leh.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(2, "Soft Leh Shanti Stupa market", [
          "File:Shey Palace Leh.jpg",
          "File:Leh main bazaar.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(3, "Khardung La Diskit family Nubra", [
          "File:Land of Sand Dunes! - Nubra Valley.jpg",
          "File:Shyok river at Hunder, Nubra valley.jpg",
        ], ["destinations/nubra.jpg"]),
        t.d(4, "Shyok Pangong lakeside family camp", [
          "File:Pangong Lake, Ladakh, India 04.jpg",
          "File:Pangong Tso in eastern Ladakh(Changthang).jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(5, "Pangong sunrise return Leh Chang La", [
          "File:Pangong Lake, Ladakh, India 06.jpg",
          "File:Pangong Lake 3.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(6, "Buffer Leh Hall of Fame river walk", [
          "File:Pathar Sahib Gurudwara Ladakh.jpg",
          "File:Confluence of the Indus and Zanskar Rivers.jpg",
          "File:Magnet Hill on the Leh-Kargil-Srinagar national highway.jpg",
          "File:Leh Kushok Bakula Rimpochee statue.jpg",
        ], ["destinations/ladakh.jpg"]),
        t.d(7, "Leh IXL family departure", [
          "File:Aerial View of Leh Kushok Bakula Rinpoche Airport (IXL) Ladakh Jammu & Kashmir India.jpg",
          "File:Leh Kushok Bakula Rimpochee Airport terminal.jpg",
        ], ["destinations/ladakh.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "north-sikkim-lachen-lachung-yumthang";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Yumthang green valley flowers North Sikkim", [
          "File:The green valley of YUMTHANG.jpg",
          "File:Yumthang valley5, North Sikkim.jpg",
          "File:Yumthung valley, Sikkim.jpg",
          "File:A view of Yumthang valley, Sikkim India,.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.g(1, "Gurudongmar Lake high North Sikkim", [
          "File:Gurudongmar Lake Sikkim, India.jpg",
          "File:Gurudongmar Lake, North Sikkim, India.jpg",
          "File:Guru Dongmar Lake Panorama.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.g(2, "Lachung town Teesta valley", [
          "File:Lachung Town.jpg",
          "File:Lachung river, lachung, sikkim, India.jpg",
          "File:View of lachung river from lachung.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.g(3, "Zero Point Yumesamdong snow line", [
          "File:Zero Point, Yumesamdong, North Sikkim.jpg",
          "File:To zero past yumthang.jpg",
          "File:View of 0 Point 2.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.g(4, "Rhododendron Shingba sanctuary Yumthang", [
          "File:Rhododendron Sikkim.jpg",
          "File:Valley of Rhododendron flowered trees.jpg",
          "File:Horse and owner in Yumthang, Sikkim.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.d(1, "IXB drive Gangtok mall North Sikkim", [
          "File:TEESTA RIVER, SIKKIM WEST BENGAL BORDER.jpg",
          "File:Teesta Sikkim 01.jpg",
          "File:View of Gangtok City from Crown Prince Tenzing Kunzang Namgyal Walkway.jpg",
        ], ["destinations/gangtok.jpg", "destinations/sikkim.jpg"]),
        t.d(2, "Gangtok Lachen permit hill drive", [
          "File:Road to heaven in Sikkim.jpg",
          "File:Sikkim hills.jpg",
          "File:NAGA FALLS,SIKKIM.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.d(3, "Gurudongmar approach Lachen day", [
          "File:Gurudongmar Lake in May 2015.jpg",
          "File:Gurudongmar Lake In October.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.d(4, "Lachen Lachung scenic transfer", [
          "File:Bridge over Lachung River, North Sikkim.jpg",
          "File:Lachung village and Lachung River valley with Himalayan peaks, North Sikkim, India.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.d(5, "Yumthang valley Zero Point optional", [
          "File:Bird's eye view of Yumthang Valley from valley view point, North Sikkim 01.jpg",
          "File:Bridge over the river in Yumthang Valley, North Sikkim, India.jpg",
        ], ["destinations/sikkim.jpg"]),
        t.d(6, "Lachung Gangtok descent free evening", [
          "File:Lachung Monastery, Sikkim India.jpg",
          "File:Mahatma Gandhi Marg (Gangtok) Sikkim.jpg",
        ], ["destinations/gangtok.jpg"]),
        t.d(7, "Bagdogra IXB departure Northeast", [
          "File:012.BAGDOGRA INTERNATIONAL AIRPORT - OUTER SECURITY CHECKING POST.jpg",
          "File:Bagdogra International Airport.jpg",
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
    console.log(`\nBatch 10 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});