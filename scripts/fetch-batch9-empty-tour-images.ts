/**
 * Batch 9 — sandakphu, Kerala family, Andaman family/hopping, Golden Triangle x2,
 * Darjeeling–Gangtok family, Chandratal camping.
 *
 *   npx tsx scripts/fetch-batch9-empty-tour-images.ts
 *   npx tsx scripts/fetch-batch9-empty-tour-images.ts --db-only
 *   npx tsx scripts/fetch-batch9-empty-tour-images.ts --only sandakphu-phalut-trek
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
    const slug = "sandakphu-phalut-trek";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Sandakphu Singalila ridge Kanchenjunga panorama trek", [
          "File:Sunbathed Kanchendzonga from Sandakphu.jpg",
          "File:Sunrise at sandakphu.jpg",
          "File:Sandakphu.jpg",
          "File:Pan picture of snow-capped Himalayan peaks..JPG",
        ]),
        t.g(1, "Phalut summit hut Everest Makalu view ridge", [
          "File:Lhotse, Everest, Makalu and Chomolonzo from Phalut, Oct 2011.jpg",
          "File:Phalut.jpg",
          "File:Kanchenjungha.jpg",
        ]),
        t.g(2, "Tumling Singalila forest trail Nepal border", [
          "File:Sunkissed Trail of Tumling.jpg",
          "File:Tonglutrekkershut.jpg",
          "File:Foggy meadow.jpg",
        ]),
        t.g(3, "Singalila National Park rhododendron ridge walk", [
          "File:Sandakhpu Map.jpg",
          "File:Kukkur keeraa.jpg",
        ]),
        t.g(4, "Kalapokhri black lake sacred Singalila", [
          "File:Kalpokhri Lake on Singalila Trek Route.JPG",
          "File:Kalapokhari.jpg",
          "File:Kalpokhri lake Singalila trek.jpg",
        ]),
        t.d(1, "Bagdogra drive Manebhanjang trailhead", [
          "File:Bagdogra International Airport.jpg",
          "File:Road to Darjeeling from Siliguri.jpg",
          "File:Manebhanjang village Singalila.jpg",
        ]),
        t.d(2, "Trek Tumling misty forest lodge", [
          "File:Foggy meadow.jpg",
          "File:Tonglutrekkershut.jpg",
          "File:Kukkur keeraa.jpg",
        ]),
        t.d(3, "Kalapokhri sacred lake day three", [
          "File:Kalpokhri Lake on Singalila Trek Route.JPG",
          "File:Kalapokhari.jpg",
        ]),
        t.d(4, "Sandakphu highest ridge hut panorama", [
          "File:Sunrise at sandakphu.jpg",
          "File:Sunbathed Kanchendzonga from Sandakphu.jpg",
          "File:Sandakphu.jpg",
        ]),
        t.d(5, "Phalut summit Kanchenjunga face long day", [
          "File:Phalut.jpg",
          "File:Lhotse, Everest, Makalu and Chomolonzo from Phalut, Oct 2011.jpg",
        ]),
        t.d(6, "Descend Manebhanjang Bagdogra trek end", [
          "File:013. BAGDOGRA INTERNATIONAL AIRPORT - ENTRANCE TO AIRPORT TERMINAL DEPARTURE WINGS.jpg",
          "File:Bagdogra International Airport - during LGFC - Bhutan 2019 (24).jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "kerala-family-getaway";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Cheeyappara waterfall Munnar drive Kerala family", [
          "File:Cheeyappara Waterfalls, Kerala (2017).jpg",
          "File:Cheeyappara Waterfalls 04.jpg",
          "File:Cheeyappara Waterfalls Adimaly kerala.jpg",
          "File:Cheeyappara Falls in 2021.jpg",
        ]),
        t.g(1, "Mattupetty Dam Munnar tea hills family", [
          "File:Panoramic View of Mattupetty Dam, Munnar, Kerala, India.jpg",
          "File:Mattupetty Dam reservoir, Munnar (19).jpg",
          "File:Mattupetty Dam - മാട്ടുപ്പെട്ടി അണക്കെട്ട് -6.jpg",
        ]),
        t.g(2, "Tata Tea Museum Munnar plantation", [
          "File:Tata Tea Museum Munnar.jpg",
          "File:Kanan Devan Hills Plantation Munnar.jpg",
          "File:Tea plantations in Munnar (2).jpg",
        ]),
        t.g(3, "Periyar Lake boat Thekkady family Kerala", [
          "File:Periyar Lake kerela.jpg",
          "File:View of the Periyar Lake.jpg",
          "File:Periyar National Park boat.JPG",
        ]),
        t.g(4, "Alleppey backwater houseboat day cruise Kerala", [
          "File:Houseboat on Alleppey backwaters (Kerala, India 2023) (52703799667).jpg",
          "File:Houseboat on Alleppey backwaters (Kerala, India 2023) (52704323376).jpg",
          "File:HOUSEBOAT IN KUTTANAD LAKE IN ALAPPUZHA,KERALA.jpg",
          "File:House Boat in morning, Alappuzha, Kerala.jpg",
        ]),
        t.d(1, "Fort Kochi fishing nets arrive Kerala", [
          "File:Fort Kochi - St. Francis Church.jpg",
          "File:Fallen leaves, Vasco da Gama Square, Fort Kochi, Ernakulam, Kerala, India, 2026-09-07.jpg",
          "File:Fort Kochi - Fisher - 1.jpg",
        ]),
        t.d(2, "Kochi Munnar Cheeyappara scenic drive", [
          "File:Cheeyappara Waterfalls 01.jpg",
          "File:Cheeyappara Waterfalls down Adimaly kerala.jpg",
        ]),
        t.d(3, "Munnar Echo Point Mattupetty viewpoints", [
          "File:Mattupetty Dam, Munnar views (35).jpg",
          "File:Mattupetty Dam Munnar Idukki (259373420).jpg",
        ]),
        t.d(4, "Munnar Thekkady spice country drive", [
          "File:Thekkady Forest Trek.JPG",
          "File:Spice plantation Thekkady Kerala.jpg",
        ]),
        t.d(5, "Alleppey houseboat lunch lagoon", [
          "File:Make Way For The Houseboat! - Backwaters of Alappuzha.jpg",
          "File:Alleppey kerala.jpg",
          "File:Sunset at Alleppey backwaters.3.jpg",
        ]),
        t.d(6, "Cochin airport COK departure Kerala", [
          "File:Cochin international airport terminal.jpg",
          "File:Cochin International Airport Gate.jpg",
          "File:Kathakali mannequin at Cochin International Airport.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "andaman-island-family-adventure";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Corbyn Cove Beach Port Blair family Andaman", [
          "File:Corbyns cove beach-5-port blair-andaman-India.jpg",
          "File:Corbyns cove beach-2-port blair-andaman-India.jpg",
          "File:Corbyns cove beach-14-port blair-andaman-India.jpg",
        ]),
        t.g(1, "Elephant Beach Havelock snorkel family", [
          "File:Havelock Island, Elephant Beach, Andaman Islands.jpg",
          "File:Elephant beach, Havelock Island.jpg",
          "File:Snorkeling at Elephant beach, Havelock Island,Andaman.jpg",
        ]),
        t.g(2, "Neil Island Shaheed Dweep family beach", [
          "File:Neil Island Andaman Islands.jpg",
          "File:Andaman Islands, Neil, Trees at the beach.jpg",
          "File:Shaheed Island, Andaman Islands, Tropical beach.jpg",
        ]),
        t.g(3, "Cellular Jail Port Blair history family", [
          "File:Front View of Cellular Jail, Port Blair.JPG",
          "File:Cellular jail or kaalaapani.jpg",
          "File:Closer view of a cell of Cellular Jail, Port Blair, India.jpg",
        ]),
        t.g(4, "Bharatpur coral beach Neil family", [
          "File:Shaheed Island, Andamans, Laxmanpur Beach.jpg",
          "File:Bharatpur Beach Neil Island Andaman.jpg",
          "File:Coral beach.JPG",
        ]),
        t.d(1, "Arrive Port Blair Cellular Jail cove", [
          "File:Cellular Jail, Andaman & Nicobar, Port Blair, India, night view.jpg",
          "File:Port Blair harbour Andaman.jpg",
        ]),
        t.d(2, "Ferry Havelock Swaraj Dweep Radhanagar", [
          "File:Havelock Island, Radhanagar Beach before sunset, Andaman Islands.jpg",
          "File:Andaman and Nicobar Islands (33).jpg",
        ]),
        t.d(3, "Havelock Elephant Beach boat day", [
          "File:Havelock Island, Sandy lagoon, Andaman Islands.jpg",
          "File:Havelock Island, Mangrove tree on the beach, Andaman Islands.jpg",
          "File:Kala Patthar beach in Havelock. Andaman and Nicobar Islands.jpg",
        ]),
        t.d(4, "Ferry Neil Laxmanpur beach afternoon", [
          "File:Shaheed Island, Andamans, Laxmanpur Beach under rain.jpg",
          "File:Neil Island Andaman Islands.jpg",
        ]),
        t.d(5, "Neil Port Blair market return ferry", [
          "File:Aberdeen Bazar 4180212.JPG",
          "File:Clock tower , Port Blair.jpg",
          "File:Aberdeen Bazar 4180216.JPG",
        ]),
        t.d(6, "Veer Savarkar airport family departure", [
          "File:Veer Savarkar International Airport – New Terminal.jpg",
          "File:Savarkar airport 01.jpg",
          "File:Port Blair Airport runway..JPG",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "golden-triangle-family";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("India Gate Rajpath Delhi family evening", [
          "File:India Gate, New Delhi.jpg",
          "File:India Gate in New Delhi 03-2016.jpg",
          "File:India Gate - Delhi (37282946605).jpg",
          "File:India Gate 1 (New Delhi).jpg",
        ]),
        t.g(1, "Red Fort Lal Qila Delhi family heritage", [
          "File:Red Fort Delhi India.jpg",
          "File:Red Fort, Delhi 01.jpg",
          "File:Lal Qila Red Fort Delhi gate.jpg",
        ]),
        t.g(2, "Taj Mahal Agra family marble icon", [
          "File:Taj Mahal in morning.jpg",
          "File:Taj Mahal sunrise.jpg",
          "File:Taj Mahal, Agra, Uttar Pradesh, India.jpg",
        ]),
        t.g(3, "Agra Fort Yamuna red sandstone family", [
          "File:Agra Fort, Agra, Uttar Pradesh, India.jpg",
          "File:Agra Fort walls.jpg",
          "File:Agra Fort panorama.jpg",
        ]),
        t.g(4, "Hawa Mahal pink facade Jaipur family photo", [
          "File:Hawa Mahal Jaipur India.jpg",
          "File:Hawa Mahal east facade (14-07-2022).jpg",
          "File:East facade Hawa Mahal Jaipur from ground level (July 2022) - img 02.jpg",
        ]),
        t.d(1, "Arrive Delhi India Gate stroll", [
          "File:India Gate, detail, New Delhi.jpg",
          "File:India Gate, New Delhi from West.jpg",
        ]),
        t.d(2, "Old New Delhi Red Fort Qutub", [
          "File:Jama Masjid Delhi.jpg",
          "File:Qutub Minar, Delhi, India.jpg",
          "File:Humayun's Tomb, Delhi 1.jpg",
        ]),
        t.d(3, "Delhi Agra expressway Agra Fort", [
          "File:Agra Fort entrance gate.jpg",
          "File:Yamuna River Agra view.jpg",
        ]),
        t.d(4, "Taj sunrise drive Jaipur pink city", [
          "File:Taj Mahal from Mehtab Bagh.jpg",
          "File:Taj Mahal seen from Mehtab Bagh garden Agra.jpg",
        ]),
        t.d(5, "Jaipur Amber Fort City Palace artisans", [
          "File:Amber Fort, Jaipur, 20191219 1032 9565.jpg",
          "File:Amber Palace ,Jaipur (60445).jpg",
          "File:Nahargarh Fort view Jaipur.jpg",
        ]),
        t.d(6, "Delhi airport DEL family departure", [
          "File:Delhi Airport T3 Terminal (28527779591).jpg",
          "File:T3 interior Delhi international Airport.jpg",
          "File:Delhi IGI Airport T3 Sideview.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "darjeeling-gangtok-family-hills";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Tiger Hill sunrise Kanchenjunga Darjeeling family", [
          "File:Kanchenjunga range from Tiger Hill, Darjeeling.jpg",
          "File:View of Sunrise from Tiger hill, DARJEELING, India.jpg",
          "File:Kangchenjunga from Tiger Hill.jpg",
          "File:Tiger hill under the first ray of Sunlight.jpg",
        ]),
        t.g(1, "Darjeeling Rock Garden family picnic hills", [
          "File:Rock Garden, Darjeeling at mist.JPG",
          "File:Rock Garden View, Darjeeling.jpg",
          "File:Flora in Rock Garden, Darjeeling.jpg",
        ]),
        t.g(2, "Happy Valley tea estate tasting Darjeeling", [
          "File:Happy Valley Tea Estate Darjeeling.jpg",
          "File:Darjeeling tea garden workers.jpg",
          "File:Tea leaves Darjeeling estate.jpg",
        ]),
        t.g(3, "Darjeeling Himalayan Railway Batasia toy train", [
          "File:Darjeeling Himalayan Railway at Ghum station.jpg",
          "File:Ghoom railway station Darjeeling.jpg",
          "File:Train-toy-final-2-720.jpg",
        ]),
        t.g(4, "MG Marg Gangtok pedestrian mall family Sikkim", [
          "File:Mahatma Gandhi Marg (Gangtok) Sikkim.jpg",
          "File:M.G. Marg popularly known as Gangtok mall in Sikkim 24.jpg",
          "File:M.G. Marg, Gangtok 01.jpg",
        ]),
        t.d(1, "Bagdogra drive Darjeeling Mall observatory", [
          "File:Darjeeling Mall Road.jpg",
          "File:Observatory Hill Darjeeling.jpg",
          "File:Darjeeling city view West Bengal.jpg",
        ]),
        t.d(2, "Tiger Hill optional tea estate visit", [
          "File:Happy Valley Tea Estate, Darjeeling (8717542300).jpg",
          "File:Happy Valley Tea Estate in Darjeeling.jpg",
          "File:Snow Leopard in Padmaja Naidu Himalayan Zoological Park (3).JPG",
        ]),
        t.d(3, "Batasia Loop toy train drive Gangtok", [
          "File:Batasia Loop memorial Darjeeling.jpg",
          "File:TEESTA RIVER, SIKKIM WEST BENGAL BORDER.jpg",
          "File:Teesta Sikkim 01.jpg",
        ]),
        t.d(4, "Tsomgo Changu Lake family excursion Gangtok", [
          "File:Tsomgo Lake alias Tsongmo Lake or Changgu Lake in East Sikkim 03.jpg",
          "File:Tsomgo Lake (Changu Lake), East Sikkim,5.jpg",
          "File:Changu Lake, Sikkim.jpg",
        ]),
        t.d(5, "Gangtok Rumtek monastery easy day", [
          "File:Rumtek Monastery 04.jpg",
          "File:Enchey Monastery 02.jpg",
          "File:Enchey Monastery in Gangtok, Sikkim 31.jpg",
        ]),
        t.d(6, "Bagdogra IXB departure East Himalaya", [
          "File:012.BAGDOGRA INTERNATIONAL AIRPORT - OUTER SECURITY CHECKING POST.jpg",
          "File:Bagdogra airport post office.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "chandratal-lake-camping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Chandra Taal Moon Lake Spiti camping Himalaya", [
          "File:Chandra Taal Lake 3.jpg",
          "File:Chandra Taal.jpg",
          "File:Chandra-Taal 02.jpg",
          "File:Camping near Chandratal Lake.jpg",
        ]),
        t.g(1, "Kunzum Pass prayer flags Spiti approach", [
          "File:Kunzum Pass.jpg",
          "File:Kunzum La Pass, Himachal Pradesh.jpg",
          "File:Kunzum pass Lahaul Spiti.jpg",
        ]),
        t.g(2, "Key Monastery Kaza Spiti valley gompa", [
          "File:Key Monastery, Spiti Valley, Himachal Pradesh.jpg",
          "File:Key Gompa, Spiti.jpg",
          "File:Key monastery Spiti valley.jpg",
        ]),
        t.g(3, "Tabo monastery Spiti ancient murals", [
          "File:TaboMonastery-Tabo-Spiti-Himachal-D72 6768.JPG",
          "File:Tabo Monastery , Spiti.jpg",
          "File:Tabo (Buddhist) Monastery, Spiti Valley, Himachal Pradesh, India (2018).jpg",
        ]),
        t.g(4, "Kaza Spiti river valley acclimatisation", [
          "File:Kaza Helipad and Kaza Town.jpg",
          "File:Spiti River Kaza Himachal Jun18 D72 7232.jpg",
          "File:NH505 Spiti Kaza Losar Jun18 D72 7797.jpg",
        ]),
        t.d(1, "Manali Rohtang Atal Tunnel Kaza approach", [
          "File:Manali to Rohtang Pass 01.jpg",
          "File:Snow Rohtang Range Manali May24 A7CR 00128.jpg",
          "File:Manali to Rohtang Pass 04.jpg",
        ], ["destinations/himachal.jpg", "destinations/manali.jpg"]),
        t.d(2, "Kaza Key monastery acclimatisation rest", [
          "File:Key Gompa monastery, Spiti Valley, Himachal Pradesh, India 01.jpg",
          "File:Key Monastery - Spiti -Himachal Pradesh MG 6796.jpg",
          "File:Kee monastery Spiti Valley (edited).jpg",
        ]),
        t.d(3, "Kunzum Chandratal lakeside camp night", [
          "File:Chandra Taal (Lake) Campsite, HP, India,D35 7502 nx01 01.jpg",
          "File:Abandoned tent, Chandra Taal (Lake), HP, India, D35 7242 nx01.jpg",
          "File:Grassland near Chandra Taal (Lake), HP, India, D35 7232 nx01.jpg",
        ]),
        t.d(4, "Chandratal sunrise lake walk return Kaza", [
          "File:Chandra Taal (Lake), HP, India, D35 7276nx-01.jpg",
          "File:Chandra Taal (Lake), HP, India, D35 7255nx-01.jpg",
          "File:Chandra Taal (Lake), HP, India, D35 7324nx-01.jpg",
        ]),
        t.d(5, "Exit Spiti Manali Chhatru belt descent", [
          "File:Manali to Rohtang Pass 02.jpg",
          "File:Snow Rohtang Range Manali May24 A7CR 00128.jpg",
        ], ["destinations/himachal.jpg"]),
        t.d(6, "Manali Chandigarh drop tour ends", [
          "File:Chandigarh International Airport.jpg",
          "File:Chandigarh Airport Terminal.jpg",
          "File:Shaheed Bhagat Singh International Airport Chandigarh.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "andaman-island-hopping";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Port Blair Andaman waterfront leisure arrival", [
          "File:Aberdeen Jetty Port Blair 4140179.JPG",
          "File:Aberdeen jetty @ Port Blair.jpg",
          "File:Lighthouse (221100674).jpg",
        ]),
        t.g(1, "Radhanagar Beach Havelock leisure turquoise", [
          "File:Trees around Radhanagar Beach Havelock vrvbaan042k24 (11).jpg",
          "File:Radhanagar Beach Havelock vrvbaan042k24 (4).jpg",
          "File:Havelock Island, Radhanagar Beach, tropical bliss, Andaman Islands.jpg",
        ]),
        t.g(2, "Havelock free beach café afternoon", [
          "File:Radhanagar Beach Havelock vrvbaan042k24 (1).jpg",
          "File:Havelock Island, Radhanagar Beach sunset, Andaman Islands.jpg",
        ]),
        t.g(3, "Neil Island Laxmanpur coral beach hop", [
          "File:Shaheed Island, Andamans, Laxmanpur Beach, Rain.jpg",
          "File:Shaheed Island, Andamans, Coral bridge with natural arch, Panorama.jpg",
        ]),
        t.g(4, "Makruzz ferry Andaman inter-island", [
          "File:INS Bangaram and INS Battimalv ferry stranded tourists from Havelock Island, 2017 (2).jpg",
          "File:INS Bangaram and INS Battimalv ferry stranded tourists from Havelock Island, 2017 (6).jpg",
          "File:Iron ferry-1-baratang-andaman-India.jpg",
        ]),
        t.d(1, "Port Blair arrive waterfront walk", [
          "File:Cellular Jail, Andaman, Port Blair, India.jpg",
          "File:Port Blair city view Andaman.jpg",
        ]),
        t.d(2, "Ferry Havelock Radhanagar beach day", [
          "File:Havelock Island, Radhanagar Beach, Andaman Islands.jpg",
        ]),
        t.d(3, "Havelock free beach rest cafés", [
          "File:Radhanagar Beach Havelock vrvbaan042k24 (9).jpg",
        ]),
        t.d(4, "Ferry Neil snorkel optional afternoon", [
          "File:Collared Kingfisher at Neil Island (Shaheed Dweep), South Andaman 01.jpg",
          "File:Andaman Islands, Sun reflecting in the waters of Andaman Sea at low tide, Rocky beach.jpg",
        ]),
        t.d(5, "Return Port Blair market stroll", [
          "File:Aberdeen Bazar, Port Blair.JPG",
          "File:Aberdeen Bazar 4180210.JPG",
          "File:Port Blair Fish Market.jpg",
        ]),
        t.d(6, "Port Blair IXZ airport leisure departure", [
          "File:Savarkar airport 01.jpg",
          "File:Veer Savarkar International Airport – New Terminal.jpg",
        ]),
      ],
    };
  })(),
  (() => {
    const slug = "golden-triangle-classic";
    const t = s(slug);
    return {
      slug,
      targets: [
        t.c("Humayun Tomb Delhi classic Golden Triangle", [
          "File:Humayun's Tomb, Delhi 1.jpg",
          "File:Tomb of Humayun, Delhi.jpg",
          "File:Humayun's Tomb-Delhi front view.jpg",
        ]),
        t.g(1, "Qutub Minar Delhi leisure monument", [
          "File:Qutub Minar in Delhi, India.jpg",
          "File:Qutub Minar, Delhi 1.jpg",
          "File:Qutub Minar and Alai Darwaza.jpg",
        ]),
        t.g(2, "Connaught Place Delhi colonial circle", [
          "File:Connaught Place, New Delhi.jpg",
          "File:Inner Circle Connaught Place Delhi.jpg",
        ]),
        t.g(3, "Taj Mahal Agra classic marble mausoleum", [
          "File:Taj Mahal Sunset.jpg",
          "File:Land of the Veda - Taj Mahal - Agra - South Facade.jpg",
          "File:Taj Mahal - South Facade - Agra 2014-05-14 3973.JPG",
        ]),
        t.g(4, "Amber Fort Jaigarh Jaipur leisure hills", [
          "File:20191219 View of Jaigarh Fort from Amber Fort, Jaipur, 1021 9539.jpg",
          "File:Amber Fort seen from Jaigarh Fort, Jaipur, 20191218 1619 9439.jpg",
          "File:Jaipur-Fort Amber-09-Jaigarh Fort-2018-gje.jpg",
        ]),
        t.d(1, "Delhi arrival Connaught India Gate", [
          "File:Connaught Place New Delhi night.jpg",
          "File:India Gate 2014-11-01.jpg",
        ]),
        t.d(2, "Humayun Tomb Qutub Minar Delhi sights", [
          "File:Intricate window at Humayun's Tomb, Delhi.jpg",
          "File:Qutab Minar.JPG",
        ]),
        t.d(3, "Delhi Agra expressway Agra Fort", [
          "File:Agra Fort, India.jpg",
          "File:Agra Fort from Yamuna.jpg",
        ]),
        t.d(4, "Taj Mahal morning drive Jaipur", [
          "File:Taj Mahal reflection on Yamuna river, Agra.jpg",
          "File:Taj Mahal in 2004.jpg",
          "File:Aks The Reflection Taj Mahal.jpg",
        ]),
        t.d(5, "Jaipur Amber bazaars classic leisure", [
          "File:Jaipur, India, Market.jpg",
          "File:Jaipur Market.jpg",
          "File:Jaipur Street Vendors (1581573198).jpg",
        ]),
        t.d(6, "Delhi IGI airport classic departure", [
          "File:Welcome Area Delhi T3 Departure IGI Airport.jpg",
          "File:T3, Indira Gandhi Airport, New Delhi - panoramio.jpg",
          "File:Delhi t3 terminal.jpg",
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
    console.log(`\nBatch 9 complete: ${jobs.length} tours`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});