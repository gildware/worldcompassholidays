/**
 * Batch 8 — Gulmarg ski holiday, Andaman scuba, Nainital–Corbett family, Coorg–Mysore,
 * Kolahoi & Kounsarnag treks, Ooty–Kodai honeymoon, Darjeeling–Gangtok honeymoon.
 *
 *   npx tsx scripts/fetch-batch8-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch8-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch8-empty-tour-images.ts --only kolahoi-glacier-trek
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
    const slug = "gulmarg-skiing-holiday";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Gulmarg National Winter Games skiing Kashmir snow", [
          "File:Ski race player performing at the 5th National Winter Games at Gulmarg, Jammu & Kashmir on February 22, 2008.jpg",
          "File:Skiing in Gulmarg - APHSV28-06.jpg",
          "File:Gulmarg in winter, Jammu and Kashmir, India (2).jpg",
          "File:Gulmarg in winter, Jammu and Kashmir, India (1).jpg",
        ], ["destinations/gulmarg-5.jpg", "destinations/gulmarg-4.jpg"]),
        t.g(1, "Gulmarg gondola cable car winter snow", [
          "File:Gondola in Gulmarg.JPG",
          "File:Gulmarg Gondola, Jammu and Kashmir.jpg",
          "File:Jammu & Kashmir gulmarg gondola (Phase II) to Khilanmarg Mountain.jpg",
        ], ["destinations/gulmarg-3.jpg"]),
        t.g(2, "Gulmarg nursery slope ski holiday Kashmir", [
          "File:Snow in Gulmarg, Kashmir.jpg",
          "File:Snow capped Gulmarg during snowfall.jpg",
          "File:Footprints in the snow on slopes of Mount Apharwat..JPG",
          "File:Gondola to Apharwat, Gulmarg.jpg",
        ], ["destinations/tangmarg-4.jpg"]),
        t.g(3, "Apharwat Kongdori ridge Gulmarg ski", [
          "File:Gondola up the mountain, Gulmarg.jpg",
          "File:Gondola down to Gulmarg.jpg",
          "File:Gondola phase 1 in march.jpg",
          "File:Snow way.JPG",
        ], ["destinations/tangmarg-5.jpg"]),
        t.g(4, "Tangmarg snow road Gulmarg approach", [
          "File:Tangmarg in Winter.JPG",
          "File:Tangmarg Market.JPG",
          "File:Road to Gulmarg in winter.jpg",
        ], ["destinations/tangmarg-2.jpg", "destinations/tangmarg.jpg"]),
        t.d(1, "Srinagar Tangmarg Gulmarg snow drive", [
          "File:Road from Tangmarg to Gulmarg.jpg",
          "File:Tangmarg, Jammu and Kashmir.jpg",
          "File:Gulmarg in winter, Jammu and Kashmir, India.jpg",
        ], ["destinations/tangmarg-3.jpg", "destinations/srinagar-3.jpg"]),
        t.d(2, "Gulmarg beginner lesson slope day two", [
          "File:Kongdoori to Apharwat Route.jpg",
          "File:Apharwat Right Wing.jpg",
          "File:Apharwat Peak.JPG",
          "File:Gulmarg1.jpg",
        ], ["destinations/gulmarg.jpg"]),
        t.d(3, "Kongdori ridge gondola meadow practice", [
          "File:Kongdoori Station, Gulmarg 2.jpg",
          "File:Panorama of Kongdoori Station, Gulmarg.jpg",
          "File:Gondola to Apharwat, Gulmarg.jpg",
        ], ["destinations/gulmarg-4.jpg"]),
        t.d(4, "Free ski day Gulmarg powder meadow", [
          "File:Gulmarg Kashmir21102023A.jpg",
          "File:Footprints in the snow on slopes of Mount Apharwat..JPG",
          "File:Snow capped Gulmarg during snowfall.jpg",
        ], ["destinations/gulmarg-2.jpg"]),
        {
          ...t.d(5, "Srinagar airport departure Kashmir", [
            "File:Lapangan terbang Srinagar.jpg",
            "File:Lapangan terbang Srinagar 2.jpg",
          ], ["destinations/wular-lake-4.jpg", "destinations/srinagar-5.jpg"]),
          skipSearch: true,
        },
      ],
    };
  })(),
  (() => {
    const slug = "scuba-diving-andaman-package";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Scuba diving Havelock Andaman reef", [
          "File:Scuba diving in havelock island.jpg",
          "File:Ocean Tribe Scuba Diving Havelock.jpg",
          "File:Under Andaman Sea 2016.jpg",
          "File:SCUBA bubbles Andaman and Nicobar Islands.jpg",
        ]),
        t.g(1, "SCUBA diver bubbles Andaman sea", [
          "File:Sun reflection SCUBA bubble Andaman and Nicobar Islands.jpg",
          "File:Reflection of a diver SCUBA bubble ring Andaman and Nicobar Islands.jpg",
          "File:Reflection of sun SCUBA bubble ring Andaman and Nicobar Islands DSCN8533.jpg",
        ]),
        t.g(2, "Havelock Island Andaman ferry destination", [
          "File:Havelock Island, Radhanagar Beach, Andaman Islands.jpg",
          "File:Havelock Island, Radhanagar Beach, tropical bliss, Andaman Islands.jpg",
          "File:Neil Island, Andaman and Nicobar Islands.jpg",
        ]),
        t.g(3, "Cellular Jail Port Blair Andaman history", [
          "File:Cellular Jail, Andaman, Port Blair, India.jpg",
          "File:Front View of Cellular Jail, Port Blair.JPG",
          "File:Cellular jail or kaalaapani.jpg",
        ]),
        t.g(4, "Radhanagar beach Havelock after dives", [
          "File:Radhanagar Beach Havelock vrvbaan042k24 (9).jpg",
          "File:Trees around Radhanagar Beach Havelock vrvbaan042k24 (11).jpg",
          "File:Havelock Island, Radhanagar Beach, tropical bliss, Andaman Islands.jpg",
        ]),
        t.d(1, "Port Blair arrival Cellular Jail cove", [
          "File:Cellular Jail, Andaman & Nicobar, Port Blair, India, night view.jpg",
          "File:Corbyn's Cove Beach, Port Blair.jpg",
          "File:Closer view of a cell of Cellular Jail, Port Blair, India.jpg",
        ]),
        t.d(2, "Ferry Port Blair Havelock Swaraj Dweep", [
          "File:Havelock Island, Radhanagar Beach before sunset, Andaman Islands.jpg",
          "File:Port Blair harbour Andaman.jpg",
          "File:Andaman and Nicobar Islands (33).jpg",
        ]),
        t.d(3, "Dive day one boat reef Havelock", [
          "File:Scuba diving in havelock island.jpg",
          "File:Ocean Tribe Scuba Diving Havelock.jpg",
          "File:Under Andaman Sea 2016.jpg",
        ]),
        t.d(4, "Dive day two Radhanagar beach swim", [
          "File:Radhanagar Beach Havelock vrvbaan042k24 (4).jpg",
          "File:Radhanagar Beach Havelock vrvbaan042k24 (1).jpg",
          "File:Havelock Island, Radhanagar Beach sunset, Andaman Islands.jpg",
        ]),
        t.d(5, "Veer Savarkar airport Port Blair departure", [
          "File:Veer Savarkar International Airport vrvbaan042k24 (118).jpg",
          "File:Veer Savarkar International Airport – New Terminal.jpg",
          "File:Savarkar airport 01.jpg",
          "File:Port Blair Airport runway..JPG",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "nainital-jim-corbett-family-getaway";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Naini Lake Nainital Uttarakhand family", [
          "File:Naini Lake, Nainital, Uttarakhand, India.jpg",
          "File:Nainital Lake 07.jpg",
          "File:Nainital Lake view.jpg",
          "File:Nainital Lake view (64636).jpg",
        ]),
        t.g(1, "Nainital Mall Road lake boating", [
          "File:Nainital Lake 03.jpg",
          "File:Nainital Lake view (95280).jpg",
          "File:Nainital boating lake.jpg",
        ]),
        t.g(2, "Snow View ropeway Nainital hills", [
          "File:Nainital Ropeway.jpg",
          "File:Tiffin Top, Nainital.jpg",
          "File:Nainital hill station view Uttarakhand.jpg",
          "File:Panoramic view of Nainital.jpg",
        ]),
        t.g(3, "Jim Corbett National Park jungle", [
          "File:Jim Corbett National Park (India).jpg",
          "File:Jim Corbett Park.jpg",
          "File:The jungle safari in Jhirna Zone, Jim Corbett National Park.jpg",
        ]),
        t.g(4, "Bengal tiger Corbett river bed", [
          "File:Bengal Tiger resting on river bed in dawn at Jim Corbett National Park.jpg",
          "File:Bengal Tiger at Jim Corbett National Park.jpg",
          "File:Single tusk elephant at Jim Corbett National Park.jpg",
        ]),
        t.d(1, "Arrive Nainital Naini Lake boat", [
          "File:Nainital Lake view (14622).jpg",
          "File:Nainital Lake view (31709).jpg",
          "File:Nainital town lake view.jpg",
        ]),
        t.d(2, "Snow View zoo Nainital viewpoints", [
          "File:High altitude zoo nainital, uttarakhand, india.jpg",
          "File:Pt. G.B. Pant High Altitude Zoo Nainital.jpg",
          "File:Nainital Lake view (95280).jpg",
        ]),
        t.d(3, "Nainital to Corbett Ramnagar descent", [
          "File:Kosi River, Jim Corbett National Park, Ramnagar, Uttarakhand.jpeg",
          "File:Jim CORBETT NATIONAL PARK, RAMNAGAR.jpg",
          "File:Panther in captivity, Jim Corbett National Park, Ramnagar, Uttarakhand.jpg",
          "File:GirijaDeviTemple Ramnagar Nainital.jpg",
        ]),
        t.d(4, "Corbett jeep safari family morning", [
          "File:Bengal Tiger in backlight at Corbett National Park.jpg",
          "File:Jim Corebtt National Park India.jpg",
          "File:The jungle safari in Jhirna Zone, Jim Corbett National Park.jpg",
        ]),
        t.d(5, "Kathgodam Pantnagar railway departure", [
          "File:Kathgodam railway station.jpg",
          "File:Pantnagar Airport Uttarakhand.jpg",
          "File:Kathgodam Railway Station Platform.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "coorg-mysore-family-circuit";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Mysore Palace illuminated family Karnataka", [
          "File:Mysore Palace Morning.jpg",
          "File:Mysuru Palace - Left Front Towers.jpg",
          "File:Mysore Palace Windows.jpg",
          "File:Mysore Palace illuminated night.jpg",
        ]),
        t.g(1, "Dubare elephant camp Coorg family", [
          "File:Dubare - Coorg (Kudagu) Elephant Safari 6438.JPG",
          "File:Elephant, Dubare Elephant Camp, Coorg, India.jpg",
          "File:Dubare - Coorg (Kudagu) Elephant Safari 6435.JPG",
        ]),
        t.g(2, "Iruppu Falls Coorg waterfall circuit", [
          "File:Iruppu Waterfalls.jpg",
          "File:Iruppu waterfalls located near coorg.jpg",
          "File:Irupu Falls, Karnataka.jpg",
        ]),
        t.g(3, "Chamundi Hill Mysore temple viewpoint", [
          "File:Chamundi Temple Mysore.jpg",
          "File:Mysore palace lit up, seen from Chamundi hill.jpg",
          "File:Mysore Palace seen from Chamundi Hill Viewpoint at night.jpg",
        ]),
        t.g(4, "Brindavan Gardens Krishna Raja Sagara Mysore", [
          "File:Brindavan Gardens.JPG",
          "File:Brindavan Garden Mysore fountain2.JPG",
          "File:Musical Fountain Show at Brindavan Gardens, Mysore - 1.jpg",
        ]),
        t.d(1, "Arrive Coorg estate plantation walk", [
          "File:COORG.1.jpg",
          "File:Coffee Shade Trees Paddy Fields Coorg Feb24 R16 07670.jpg",
          "File:Homestay, Coorg, Karnataka.jpg",
        ]),
        t.d(2, "Coorg waterfalls Dubare riverside", [
          "File:Dubare - Coorg (Kudagu) 6530.JPG",
          "File:Baby elephant playing with the mother, Dubare Elephant Camp, Coorg, Karnataka.JPG",
          "File:Iruppu Waterfalls.jpg",
        ]),
        t.d(3, "Scenic drive Coorg to Mysore Chamundi", [
          "File:Mysore Palace Gate.jpg",
          "File:The Mysore Palace Full View.jpg",
          "File:Mysore Palace Mysore.jpg",
        ]),
        t.d(4, "Mysore palace Brindavan fountain evening", [
          "File:Chandelier Hall Mysore Palace Dec23 A7C 08290.jpg",
          "File:Musical Fountain Show at Brindavan Gardens, Mysore - 2.jpg",
          "File:Granite Pillars Darbar Hall Mysore Palace Dec23 A7C 08283.jpg",
        ]),
        t.d(5, "Mangalore Mysore airport departure Karnataka", [
          "File:Mangalore International Airport.jpg",
          "File:Mysore Airport.jpg",
          "File:Kushalnagar Karnataka India.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "kolahoi-glacier-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Kolahoi Glacier Lidder valley Pahalgam trek", [
          "File:Kolahoi Glacier(4792m), The biggest Glacier of Kashmir Valley which 27km from Aru Valley reached via Lidder Watt.jpg",
          "File:Kolahoi Glacier andMt.Kolahoi(5425m) North view -the highest mountain in Kashmir valley.JPG",
          "File:Mt.KOLAHOI (5425m) highest peak of Kashmir Valley.jpg",
          "File:Kolahoi Glacier.jpg",
        ], ["destinations/pahalgam.jpg", "destinations/aru-valley.jpg"]),
        t.g(1, "Mt Kolahoi Matterhorn Kashmir peak", [
          "File:Mt.Kolahoi(5425m) Highest Mountain Peak of Kashmir Valley.It is also called Matterhorn of Kashmir because it is like The Mt.Matterhorn of Swiss.jpg",
          "File:Mount Kolahoi Kashmir.jpg",
          "File:Kolahoi peak Kashmir.jpg",
        ], ["destinations/pahalgam-2.jpg"]),
        t.g(2, "Aru Valley Pahalgam trailhead Kolahoi", [
          "File:Man with horse, Aru Valley, Pahalgam, India.jpg",
          "File:Aru Valley Pehalgam Jammu and Kashmir.jpg",
          "File:Aru Valley in Kashmir.jpg",
        ], ["destinations/aru-valley-2.jpg", "destinations/pahalgam-3.jpg"]),
        t.g(3, "Lidder river trek Pahalgam Kashmir", [
          "File:River view of Pahalgam, Kashmir.jpg",
          "File:Trek through Kashmir Valley, Pahalgam.jpg",
          "File:Trek through Kashmir Valley, Pahalgam 2.jpg",
        ], ["destinations/pahalgam-4.jpg"]),
        t.g(4, "Pahalgam valley meadows Kashmir trek", [
          "File:Pahalgam Valley.jpg",
          "File:Pahalgam, Kashmir.jpg",
          "File:Rocks in Pahalgam, Kashmir.jpg",
        ], ["destinations/pahalgam-5.jpg"]),
        t.d(1, "Arrive Pahalgam hotel briefing Kashmir", [
          "File:Pahalgam Valley.jpg",
          "File:Masjid sharif Pahalgam jammu and kashmir.jpg",
          "File:Pahalgam main market.jpg",
        ], ["destinations/pahalgam.jpg"]),
        t.d(2, "Aru drive Lidderwat meadow camp", [
          "File:Pahalgam Aru Valley.jpg",
          "File:TINY WILD FLOWER IN ARU VALLEY , PAHALGAM, KASHMIR.jpg",
          "File:Aru Valley Kashmir in Autumn.jpg",
        ], ["destinations/aru-valley-3.jpg"]),
        t.d(3, "High camp moraine Lidder branch", [
          "File:Kolahoi Glacier andMt.Kolahoi(5425m) North view -the highest mountain in Kashmir valley.JPG",
          "File:Trek through Kashmir Valley, Pahalgam 3.jpg",
          "File:Aru Valley Kashmir in winter view.jpg",
        ], ["destinations/pahalgam-2.jpg"]),
        t.d(4, "Kolahoi ice snout glacier approach day", [
          "File:Trek through Kashmir Valley, Pahalgam 3.jpg",
          "File:Aru Valley Kashmir in winter view.jpg",
          "File:Mt.KOLAHOI (5425m) highest peak of Kashmir Valley.jpg",
        ], ["destinations/pahalgam-3.jpg", "destinations/aru-valley-4.jpg"]),
        t.d(5, "Descend Aru Pahalgam hot shower", [
          "File:Trek through Kashmir Valley, Pahalgam 2.jpg",
          "File:Pahalgam town.jpg",
        ], ["destinations/pahalgam-4.jpg"]),
        t.d(6, "Srinagar airport Kolahoi trek end", [
          "File:Go air at SXR as of 7th january,2021.jpg",
          "File:Kangan Kashmir valley road.jpg",
          "File:Dal Lake, Srinagar at Dusk.jpg",
        ], ["destinations/kashmir-5.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "kounsarnag-lake-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Aharbal waterfall south Kashmir Kounsarnag approach", [
          "File:Aharbal Waterfall, Kashmir.jpg",
          "File:Aharbal waterfalls Kashmir.jpg",
          "File:Waterfall of Aharbal.JPG",
          "File:Aharbal.jpg",
        ], ["destinations/aharbal.jpg", "destinations/aharbal-2.jpg"]),
        t.g(1, "Kongwattan meadow south Kashmir trek", [
          "File:Kongwattan.jpg",
          "File:Sangam wooden Bridge over River Aherbal 3 kms from Aherbal waterfall foot road approaching Kongwattan.jpg",
          "File:Aharbal falls, a closer view.jpg",
        ], ["destinations/aharbal-3.jpg"]),
        t.g(2, "Aharbal falls Pir Panjal Kashmir", [
          "File:Aharbal Falls (139323901).jpeg",
          "File:Aharbal falls, a closer view.jpg",
          "File:Aharbal waterfalls Kashmir.jpg",
        ], ["destinations/aharbal-4.jpg"]),
        t.g(3, "Pine rhododendron forest Kashmir trail", [
          "File:Pinus wallichiana forest in Pahalgam valley.jpg",
          "File:Deodar trees Kashmir forest.jpg",
          "File:Kashmir forest trail.jpg",
        ], ["destinations/daksum.jpg", "destinations/kashmir.jpg"]),
        t.g(4, "South Kashmir valley meadow camp", [
          "File:Kashmir valley meadow green.jpg",
          "File:Kashmir hills meadow.jpg",
          "File:Verdant meadows Kashmir.jpg",
        ], ["destinations/kashmir-2.jpg", "destinations/aharbal-5.jpg"]),
        t.d(1, "Srinagar south Pir Panjal foothill drive", [
          "File:Jhelum River Srinagar.jpg",
          "File:South Kashmir countryside.jpg",
          "File:Bijbehara Kashmir.jpg",
        ], ["destinations/srinagar-2.jpg", "destinations/kashmir-3.jpg"]),
        t.d(2, "Forest belt meadow camp stream", [
          "File:Daksum Kashmir forest.jpg",
          "File:Trees and valley.jpg",
          "File:Kashmir forest pine.jpg",
        ], ["destinations/daksum-2.jpg"]),
        t.d(3, "Kounsarnag oval lake rim day", [
          "File:Kongwattan.jpg",
          "File:Aharbal Waterfall, Kashmir.jpg",
        ], ["destinations/aharbal.jpg"]),
        t.d(4, "Descent Aharbal waterfall viewpoint", [
          "File:Aharbal.jpg",
          "File:Waterfall of Aharbal.JPG",
        ], ["destinations/aharbal-2.jpg"]),
        t.d(5, "Return Srinagar hotel south Kashmir", [
          "File:Dal Lake, Srinagar 2.jpg",
          "File:Nishat Bagh Srinagar.jpg",
        ], ["destinations/srinagar.jpg"]),
        t.d(6, "Srinagar airport departure Kashmir", [
          "File:Go air at SXR as of 7th january,2021.jpg",
          "File:A. K. Antony arrives at the Srinagar Airport, on his visit to J&K. The Chief of Army Staff, General Bikram Singh, the Northern Command Chief, Lt. Gen. K.T. Parnaik, and the J&K Sports Minister.jpg",
        ], ["destinations/naranag-4.jpg", "destinations/wular-lake-5.jpg"]),
      ],
    };
  })(),
  (() => {
    const slug = "ooty-kodaikanal-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Kodaikanal Lake mist boat honeymoon Tamil Nadu", [
          "File:Boating in Kodaikanal Lake with Mist.jpg",
          "File:Mist covering the boating in Kodaikanal Lake.jpg",
          "File:Kodaikanal lake boat house.jpg",
          "File:Kodaikanal Lake Boating.JPG",
        ]),
        t.g(1, "Kodaikanal lake promenade boat house", [
          "File:Boat house on Kodaikanal lake.jpg",
          "File:Kodaikanal lake view.jpg",
          "File:Kodaikanal - lake (6053884124).jpg",
        ]),
        t.g(2, "Bryant Park flowers Kodaikanal honeymoon", [
          "File:Bryant Park, Kodaikanal 1.jpg",
          "File:Flowers at Bryant Park Kodaikanal, India.jpg",
          "File:Bryant Park in Kodaikanal.jpg",
        ]),
        t.g(3, "Coakers Walk Kodaikanal ridge view", [
          "File:Coakers Walk - Kodaikanal.jpg",
          "File:KOD14-4840 View from Coakers walk Kodaikanal.jpg",
          "File:Kodaikanal - Coakers Walk.jpg",
        ]),
        t.g(4, "Government Rose Garden Ooty Nilgiris", [
          "File:Government Rose Garden, Ooty, Tamil Nadu, India.jpg",
          "File:Rose Garden, Ooty 4.jpg",
          "File:Rose Garden, Ooty 10.jpg",
        ]),
        t.d(1, "Coimbatore ghat Ooty botanical arrival", [
          "File:Government Botanical Garden Ooty.jpg",
          "File:Botanical Gardens - Ootacamund (Ooty) - India 02.JPG",
          "File:Ooty town Nilgiris view.jpg",
        ]),
        t.d(2, "Ooty Doddabetta tea factory viewpoints", [
          "File:Tea Factory in Ooty.jpg",
          "File:Tea Museum Ooty.JPG",
          "File:Doddabetta Peak View Point in Ooty,Tamil Nadu.JPG",
        ]),
        t.d(3, "Palani ghat drive Ooty to Kodaikanal", [
          "File:View of Western Ghats from Palani-Kodaikanal Road.jpg",
          "File:Trees covered by clouds in Palani-Kodaikanal Road.jpg",
          "File:Mountains covered by clouds in Palani-Kodaikanal Road.jpg",
          "File:Kodaikanal Ghat Road - panoramio.jpg",
        ]),
        t.d(4, "Kodaikanal lake Coakers Walk Bryant Park", [
          "File:KOD14-4727 Rose Bryant Park Kodaikanal Tamil Nadu.jpg",
          "File:Kodaikanal coakers walk (1).jpg",
          "File:Bryant park kodaikanal.jpg",
        ]),
        t.d(5, "Pillar Rocks Guna Caves Kodaikanal", [
          "File:Pillar Rocks Kodaikanal.jpg",
          "File:Guna Cave Kodaikanal.jpg",
          "File:Kodaikanal pillars rocks view.jpg",
        ]),
        t.d(6, "Coimbatore CJB airport departure Nilgiris", [
          "File:Domestic terminal at CJB.JPG",
          "File:Coimbatore Airport.jpg",
          "File:CJB airport 1.JPG",
          "File:Arrival terminal at CJB.JPG",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "darjeeling-gangtok-honeymoon";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Glenburn tea estate Kanchenjunga Darjeeling honeymoon", [
          "File:Kangchenjunga from Glenburn Tea Estate AJTJohnsingh DSC01329.jpg",
          "File:Tea plantation Glenburn Darjeeling.jpg",
          "File:Glenburn Tea Estate Darjeeling.jpg",
          "File:Darjeeling Glenburn tea garden.jpg",
        ]),
        t.g(1, "Himalayan Mountaineering Institute Darjeeling", [
          "File:Himalayan Mountaineering Institute campus in Darjeeling 03.jpg",
          "File:Himalayan Mountaineering Institute campus in Darjeeling 08.jpg",
          "File:Himalayan Mountaineering Institute Darjeeling West Bengal India (7).JPG",
        ]),
        t.g(2, "MG Marg Gangtok pedestrian mall Sikkim", [
          "File:M.G. Marg, Gangtok 01.jpg",
          "File:Mahatma Gandhi Marg (Gangtok) Sikkim.jpg",
          "File:M.G. Marg popularly known as Gangtok mall in Sikkim 24.jpg",
        ]),
        t.g(3, "Darjeeling Mall observatory Kanchenjunga", [
          "File:Observatory Hill Darjeeling.jpg",
          "File:Darjeeling Mall Road.jpg",
          "File:Darjeeling city view West Bengal.jpg",
        ]),
        t.g(4, "Enchey Monastery Gangtok honeymoon calm", [
          "File:Enchey Monastery in Gangtok, Sikkim 23.jpg",
          "File:Enchey Monastery 01.jpg",
          "File:Enchey Monastery in Gangtok, Sikkim 10.jpg",
        ]),
        t.d(1, "Bagdogra drive Darjeeling Mall check-in", [
          "File:Himalayan Mountaineering Institute campus in Darjeeling 12.jpg",
          "File:Himalayan Mountaineering Institute campus in Darjeeling 17.jpg",
          "File:Japanese Peace Pagoda, Darjeeling, West Bengal 01.jpg",
        ]),
        t.d(2, "Glenburn tea tasting Kanchenjunga view", [
          "File:Happy Valley Tea Estate Darjeeling.jpg",
          "File:Tea leaves Darjeeling estate.jpg",
          "File:Kangchenjunga from Glenburn Tea Estate AJTJohnsingh DSC01329.jpg",
        ]),
        t.d(3, "Teesta corridor drive Darjeeling Gangtok", [
          "File:TEESTA RIVER, SIKKIM WEST BENGAL BORDER.jpg",
          "File:Teesta River , Sikkim - West Bengal Border.jpg",
          "File:Teesta Sikkim 01.jpg",
          "File:Overlooking the confluence of Teesta River and Rangeet River from Lover's Point, West Bengal.jpg",
        ]),
        t.d(4, "Tsomgo Baba Mandir excursion Gangtok", [
          "File:Tsomgo Lake (Changu Lake), East Sikkim,5.jpg",
          "File:Baba Harbhajan Singh Temple Sikkim.jpg",
          "File:Tsomgo Lake alias Tsongmo Lake or Changgu Lake in East Sikkim 03.jpg",
        ]),
        t.d(5, "Rumtek Enchey monastery Gangtok day", [
          "File:Rumtek Monastery 01.jpg",
          "File:Gate of Rumtek Monastery.jpg",
          "File:Enchey Monastery in Gangtok, Sikkim 23.jpg",
        ]),
        t.d(6, "Bagdogra IXB airport departure", [
          "File:Bagdogra International Airport with Himalayas.jpg",
          "File:Bagdogra International Airport.jpg",
          "File:013. BAGDOGRA INTERNATIONAL AIRPORT - ENTRANCE TO AIRPORT TERMINAL DEPARTURE WINGS.jpg",
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
    console.log(`\nBatch 8 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});