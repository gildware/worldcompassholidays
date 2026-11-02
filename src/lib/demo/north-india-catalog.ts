/** Production Kashmir Valley destination catalog. */

import { kashmirDestinationSummaries } from "./kashmir-destination-summaries";
import { kashmirHotels, type DemoHotel } from "./kashmir-hotels";

export type { DemoHotel };
export const demoHotels: DemoHotel[] = kashmirHotels;

export type DemoDestination = {
  slug: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  parentSlug?: string;
  popular?: boolean;
};

export const demoDestinations: DemoDestination[] = [
  {
    slug: "kashmir",
    name: "Kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["kashmir"],
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 8,
    popular: true,
  },
  {
    slug: "srinagar",
    name: "Srinagar",
    region: "Srinagar, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["srinagar"],
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 11,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "gulmarg",
    name: "Gulmarg",
    region: "Baramulla, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["gulmarg"],
    mapLat: "34.0484",
    mapLng: "74.3805",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "pahalgam",
    name: "Pahalgam",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["pahalgam"],
    mapLat: "34.0161",
    mapLng: "75.3150",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "aru-valley",
    name: "Aru Valley",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["aru-valley"],
    mapLat: "34.0912",
    mapLng: "75.2634",
    mapZoom: 13,
    parentSlug: "pahalgam",
    popular: true,
  },
  {
    slug: "betaab-valley",
    name: "Betaab Valley",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["betaab-valley"],
    mapLat: "34.0478",
    mapLng: "75.3331",
    mapZoom: 13,
    parentSlug: "pahalgam",
  },
  {
    slug: "chandanwari",
    name: "Chandanwari",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["chandanwari"],
    mapLat: "34.0985",
    mapLng: "75.4168",
    mapZoom: 13,
    parentSlug: "pahalgam",
  },
  {
    slug: "sonamarg",
    name: "Sonamarg",
    region: "Ganderbal, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["sonamarg"],
    mapLat: "34.3032",
    mapLng: "75.2990",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "doodhpathri",
    name: "Doodhpathri",
    region: "Budgam, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["doodhpathri"],
    mapLat: "33.8438",
    mapLng: "74.5655",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "yusmarg",
    name: "Yusmarg",
    region: "Budgam, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["yusmarg"],
    mapLat: "33.8275",
    mapLng: "74.6647",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "gurez",
    name: "Gurez Valley",
    region: "Bandipora, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["gurez"],
    mapLat: "34.6370",
    mapLng: "74.8430",
    mapZoom: 10,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "kokernag",
    name: "Kokernag",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["kokernag"],
    mapLat: "33.5847",
    mapLng: "75.3169",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "achabal",
    name: "Achabal",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["achabal"],
    mapLat: "33.6820",
    mapLng: "75.2250",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "verinag",
    name: "Verinag",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["verinag"],
    mapLat: "33.5370",
    mapLng: "75.2500",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "daksum",
    name: "Daksum",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["daksum"],
    mapLat: "33.6100",
    mapLng: "75.4350",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "sinthan-top",
    name: "Sinthan Top",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["sinthan-top"],
    mapLat: "33.5800",
    mapLng: "75.5000",
    mapZoom: 11,
    parentSlug: "kashmir",
  },
  {
    slug: "manasbal",
    name: "Manasbal Lake",
    region: "Ganderbal, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["manasbal"],
    mapLat: "34.2500",
    mapLng: "74.6700",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "wular-lake",
    name: "Wular Lake",
    region: "Bandipora, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["wular-lake"],
    mapLat: "34.3500",
    mapLng: "74.5500",
    mapZoom: 11,
    parentSlug: "kashmir",
  },
  {
    slug: "tangmarg",
    name: "Tangmarg",
    region: "Baramulla, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["tangmarg"],
    mapLat: "34.0600",
    mapLng: "74.4300",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "aharbal",
    name: "Aharbal",
    region: "Kulgam, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["aharbal"],
    mapLat: "33.6450",
    mapLng: "74.7850",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "lolab",
    name: "Lolab Valley",
    region: "Kupwara, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["lolab"],
    mapLat: "34.5200",
    mapLng: "74.3000",
    mapZoom: 11,
    parentSlug: "kashmir",
  },
  {
    slug: "bangus",
    name: "Bangus Valley",
    region: "Kupwara, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["bangus"],
    mapLat: "34.3900",
    mapLng: "74.0500",
    mapZoom: 10,
    parentSlug: "kashmir",
  },
  {
    slug: "naranag",
    name: "Naranag",
    region: "Ganderbal, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["naranag"],
    mapLat: "34.3580",
    mapLng: "74.9780",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "pampore",
    name: "Pampore",
    region: "Pulwama, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["pampore"],
    mapLat: "34.0160",
    mapLng: "74.9310",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
];

export type DemoTour = {
  slug: string;
  title: string;
  category: string;
  destinationSlug: string;
  summary: string;
  description: string;
  durationDays: number;
  difficulty: string;
  maxGroupSize: number;
  priceFrom: number;
  isFeatured?: boolean;
  coverPrompt: string;
  galleryPrompts: [string, string];
};

export const demoTours: DemoTour[] = [
  {
    slug: "amarnath-yatra",
    title: "Amarnath Yatra",
    category: "Religious",
    destinationSlug: "pahalgam",
    summary: "Guided Amarnath pilgrimage via the Pahalgam route with acclimatization support.",
    description:
      "<p>A paced Amarnath Yatra package with base nights near Pahalgam, pony or trek arrangements as needed, and staff support for the holy cave darshan.</p>",
    durationDays: 7,
    difficulty: "challenging",
    maxGroupSize: 16,
    priceFrom: 28500,
    isFeatured: true,
    coverPrompt:
      "Photorealistic travel photo of the snowy Amarnath holy cave mountain path in Kashmir Himalayas at dawn, pilgrims as distant small figures, ice and rock, golden light, no readable text, editorial pilgrimage tourism style, 16:9 landscape",
    galleryPrompts: [
      "Photorealistic Kashmir mountain trail toward Amarnath with prayer flags and snow peaks, natural daylight, no text watermark",
      "Photorealistic Pahalgam Lidder river valley meadows used as Amarnath base camp landscape, pine trees, soft morning light, no text",
    ],
  },
  {
    slug: "vaishno-devi-yatra",
    title: "Vaishno Devi Yatra",
    category: "Religious",
    destinationSlug: "katra",
    summary: "Katra-based Vaishno Devi darshan with hotel stay and early morning climb support.",
    description:
      "<p>Stay in Katra, walk or take battery car options on the track, and complete the Mata Vaishno Devi darshan with local guidance.</p>",
    durationDays: 3,
    difficulty: "moderate",
    maxGroupSize: 20,
    priceFrom: 9900,
    isFeatured: true,
    coverPrompt:
      "Photorealistic view of the Vaishno Devi pilgrimage track near Katra Trikuta hills Jammu, temple town mountain path at sunrise, devotees distant, no readable text, travel photography",
    galleryPrompts: [
      "Photorealistic Katra town at dusk with Trikuta hills backdrop, warm lights, pilgrimage atmosphere, no text",
      "Photorealistic mountain shrine path stone steps in Trikuta hills Kashmir region, morning mist, no text",
    ],
  },
  {
    slug: "kashmir-shrine-circuit",
    title: "Kashmir Shrine Circuit",
    category: "Religious",
    destinationSlug: "srinagar",
    summary: "Hazratbal, Sharika Devi, and valley ziyarat stops around Srinagar.",
    description:
      "<p>A respectful day-and-overnight circuit of Kashmir’s important shrines with a lake-side stay in Srinagar.</p>",
    durationDays: 4,
    difficulty: "easy",
    maxGroupSize: 14,
    priceFrom: 14500,
    coverPrompt:
      "Photorealistic Hazratbal shrine white dome beside Dal Lake Srinagar Kashmir, calm water reflection, blue sky, no text, travel photo",
    galleryPrompts: [
      "Photorealistic Hari Parbat fort hill and Sharika temple area Srinagar, golden hour, no text",
      "Photorealistic Dal Lake shikara near shrine shoreline Srinagar Kashmir, soft light, no text",
    ],
  },
  {
    slug: "hemkund-sahib-yatra",
    title: "Hemkund Sahib Yatra",
    category: "Religious",
    destinationSlug: "himachal",
    summary: "High-altitude Sikh pilgrimage approach through the Garhwal–Himachal mountain corridor.",
    description:
      "<p>Acclimatized Hemkund Sahib visit with mountain lodge nights and guided trek segments.</p>",
    durationDays: 6,
    difficulty: "challenging",
    maxGroupSize: 12,
    priceFrom: 26500,
    coverPrompt:
      "Photorealistic Hemkund Sahib high altitude alpine lake and gurudwara in Himalayas surrounded by snow peaks, clear daylight, pilgrimage travel photo, no text",
    galleryPrompts: [
      "Photorealistic Himalayan meadow path with colorful flowers leading toward Hemkund, trekkers distant, no text",
      "Photorealistic mountain valley camp near Hemkund trail Himachal region, morning light, no text",
    ],
  },
  {
    slug: "martand-anantnag-circuit",
    title: "Martand & Anantnag Circuit",
    category: "Religious",
    destinationSlug: "pahalgam",
    summary: "Martand Sun Temple ruins and Anantnag spiritual day circuit from south Kashmir.",
    description:
      "<p>Explore Martand’s stone ruins, Mattan springs, and quiet village shrines with a Pahalgam overnight.</p>",
    durationDays: 3,
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 11800,
    coverPrompt:
      "Photorealistic ancient Martand Sun Temple stone ruins in Anantnag Kashmir against mountain backdrop, dramatic daylight, heritage travel photo, no text",
    galleryPrompts: [
      "Photorealistic Mattan temple spring area south Kashmir village, soft light, no text",
      "Photorealistic Anantnag countryside orchards and hills Kashmir, afternoon light, no text",
    ],
  },
  {
    slug: "ladakh-monastery-pilgrimage",
    title: "Ladakh Monastery Pilgrimage",
    category: "Religious",
    destinationSlug: "ladakh",
    summary: "Hemis, Thiksey, and Diskit monastery darshan with acclimatization in Leh.",
    description:
      "<p>A paced spiritual road trip through Ladakh’s great monasteries with rest days in Leh and Nubra.</p>",
    durationDays: 8,
    difficulty: "moderate",
    maxGroupSize: 10,
    priceFrom: 38500,
    isFeatured: true,
    coverPrompt:
      "Photorealistic Thiksey monastery golden rooftops stacked on a hill above Indus valley Ladakh, clear blue sky, travel photography, no text",
    galleryPrompts: [
      "Photorealistic Hemis monastery courtyard Ladakh with colorful prayer flags, daylight, no text",
      "Photorealistic Diskit monastery and giant Buddha statue overlooking Nubra valley Ladakh, no text",
    ],
  },
  {
    slug: "kashmir-valley-trek",
    title: "Kashmir Valley Trek",
    category: "Adventure",
    destinationSlug: "srinagar",
    summary: "Meadows, alpine lakes, and village stays above Srinagar.",
    description:
      "<p>A guided trek through the Kashmir valley with camping nights and local support.</p>",
    durationDays: 6,
    difficulty: "moderate",
    maxGroupSize: 12,
    priceFrom: 24500,
    isFeatured: true,
    coverPrompt:
      "Photorealistic Kashmir alpine meadow trek with wildflowers and snow peaks, hikers as small figures, golden hour, no text",
    galleryPrompts: [
      "Photorealistic Kashmir high camp tents beside glacial stream at dusk, no text",
      "Photorealistic pine forest trail above Srinagar Kashmir mountains, morning mist, no text",
    ],
  },
  {
    slug: "kolahoi-lidder-trek",
    title: "Kolahoi Lidder Trek",
    category: "Adventure",
    destinationSlug: "pahalgam",
    summary: "Lidder valley approach toward Kolahoi glacier views from Pahalgam.",
    description:
      "<p>Trek days along the Lidder with glacier viewpoints and riverside camps.</p>",
    durationDays: 5,
    difficulty: "challenging",
    maxGroupSize: 10,
    priceFrom: 22800,
    coverPrompt:
      "Photorealistic Kolahoi glacier mountain view from Lidder valley Kashmir, rocky trail and turquoise river, daylight, no text",
    galleryPrompts: [
      "Photorealistic Pahalgam Lidder river trek path with boulders and pines, no text",
      "Photorealistic high Kashmir camp near snow-dusted peaks Kolahoi approach, no text",
    ],
  },
  {
    slug: "hampta-pass-trek",
    title: "Hampta Pass Trek",
    category: "Adventure",
    destinationSlug: "himachal",
    summary: "Classic Himachal pass trek from lush valleys into Spiti-side landscapes.",
    description:
      "<p>Cross Hampta Pass with Manali logistics, camping, and guided acclimatization.</p>",
    durationDays: 5,
    difficulty: "challenging",
    maxGroupSize: 12,
    priceFrom: 18900,
    coverPrompt:
      "Photorealistic Hampta Pass Himachal rocky alpine saddle with trekkers distant, dramatic clouds, no text",
    galleryPrompts: [
      "Photorealistic green Himachal valley campsite before Hampta Pass, wildflowers, no text",
      "Photorealistic barren Spiti-side landscape after Hampta Pass crossing, stark mountains, no text",
    ],
  },
  {
    slug: "markha-valley-trek",
    title: "Markha Valley Trek",
    category: "Adventure",
    destinationSlug: "ladakh",
    summary: "Village-to-village trek through Markha with high passes and monastery stops.",
    description:
      "<p>Multi-day Markha Valley trek with ponies for bags and nights in homestays or camps.</p>",
    durationDays: 8,
    difficulty: "challenging",
    maxGroupSize: 10,
    priceFrom: 32000,
    coverPrompt:
      "Photorealistic Markha Valley Ladakh trek trail through arid canyon and river, distant village, blue sky, no text",
    galleryPrompts: [
      "Photorealistic Ladakh mountain pass prayer flags on Markha trek, windy clear day, no text",
      "Photorealistic traditional Ladakhi village mud houses in Markha valley, afternoon light, no text",
    ],
  },
  {
    slug: "srinagar-leh-road-trip",
    title: "Srinagar to Leh Road Trip",
    category: "Road trip",
    destinationSlug: "sonamarg",
    summary: "Classic Zoji La route from the valley meadows into high Ladakh.",
    description:
      "<p>Drive Srinagar–Sonamarg–Kargil–Leh with overnight stops and acclimatization.</p>",
    durationDays: 6,
    difficulty: "moderate",
    maxGroupSize: 8,
    priceFrom: 35500,
    isFeatured: true,
    coverPrompt:
      "Photorealistic Zoji La mountain highway between Kashmir and Ladakh, winding road, SUV tiny on road, dramatic peaks, no text",
    galleryPrompts: [
      "Photorealistic Sonamarg meadow of gold Kashmir with Sindh river, daylight, no text",
      "Photorealistic Kargil to Leh Indus river road canyon Ladakh, clear sky, no text",
    ],
  },
  {
    slug: "manali-leh-highway",
    title: "Manali to Leh Highway",
    category: "Road trip",
    destinationSlug: "himachal",
    summary: "High passes from Manali across Baralacha and Tanglang toward Leh.",
    description:
      "<p>Iconic Manali–Leh drive with Jispa/Sarchu style stops and paced altitude gain.</p>",
    durationDays: 5,
    difficulty: "challenging",
    maxGroupSize: 8,
    priceFrom: 29500,
    coverPrompt:
      "Photorealistic Manali to Leh highway hairpin bends high Himalayas, motorcycle and SUV distant, blue sky, no text",
    galleryPrompts: [
      "Photorealistic Baralacha La snow pass Himachal Ladakh border road, daylight, no text",
      "Photorealistic Pangong approach high desert road Ladakh after Manali Leh drive, no text",
    ],
  },
  {
    slug: "leh-nubra-pangong-loop",
    title: "Leh Nubra Pangong Loop",
    category: "Road trip",
    destinationSlug: "ladakh",
    summary: "Khardung La to Nubra dunes, then Pangong lake and return to Leh.",
    description:
      "<p>The classic Ladakh loop with desert camps, Diskit, and a night by Pangong.</p>",
    durationDays: 5,
    difficulty: "moderate",
    maxGroupSize: 10,
    priceFrom: 27500,
    coverPrompt:
      "Photorealistic Pangong lake vivid blue water with arid mountains Ladakh, shoreline, travel photo, no text",
    galleryPrompts: [
      "Photorealistic Nubra valley sand dunes and double-hump camel distant Ladakh, daylight, no text",
      "Photorealistic Khardung La high pass road sign area without readable text, prayer flags, snow, Ladakh",
    ],
  },
  {
    slug: "dal-lake-mughal-gardens",
    title: "Dal Lake & Mughal Gardens",
    category: "Leisure",
    destinationSlug: "srinagar",
    summary: "Shikara rides, Nishat and Shalimar gardens, and a soft Srinagar stay.",
    description:
      "<p>Unhurried Srinagar days on the lake with garden walks and Kashmiri meals.</p>",
    durationDays: 4,
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 16500,
    isFeatured: true,
    coverPrompt:
      "Photorealistic Dal Lake Srinagar shikara boats on calm water with Himalayan backdrop, golden hour, no text",
    galleryPrompts: [
      "Photorealistic Nishat Bagh Mughal garden terraces Srinagar Kashmir, blooming flowers, no text",
      "Photorealistic Kashmir houseboat interior corridor windows overlooking Dal Lake, soft light, no text",
    ],
  },
  {
    slug: "gulmarg-gondola-meadows",
    title: "Gulmarg Gondola & Meadows",
    category: "Leisure",
    destinationSlug: "gulmarg",
    summary: "Gondola rides, meadow walks, and mountain views above Gulmarg.",
    description:
      "<p>Stay on the meadow, ride the gondola, and keep days light for families.</p>",
    durationDays: 3,
    difficulty: "easy",
    maxGroupSize: 14,
    priceFrom: 15500,
    coverPrompt:
      "Photorealistic Gulmarg Kashmir green meadows with gondola cables and snow peaks, summer day, no text",
    galleryPrompts: [
      "Photorealistic Gulmarg gondola cabin rising over pine forest Kashmir, no text",
      "Photorealistic Gulmarg meadow wildflowers and ponies distant, soft light, no text",
    ],
  },
  {
    slug: "pahalgam-betaab-valley",
    title: "Pahalgam & Betaab Valley",
    category: "Leisure",
    destinationSlug: "pahalgam",
    summary: "River walks, Betaab Valley meadows, and Aru day trips.",
    description:
      "<p>Easy sightseeing from Pahalgam with picnic meadows and Lidder river time.</p>",
    durationDays: 3,
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 12800,
    coverPrompt:
      "Photorealistic Betaab Valley Kashmir lush green meadow with pine forest and mountains, clear day, no text",
    galleryPrompts: [
      "Photorealistic Pahalgam Lidder river wooden bridge and pines, daylight, no text",
      "Photorealistic Aru valley meadow Kashmir mountains, afternoon light, no text",
    ],
  },
  {
    slug: "srinagar-old-city-crafts",
    title: "Srinagar Old City & Crafts",
    category: "Culture",
    destinationSlug: "srinagar",
    summary: "Old city lanes, papier-mâché workshops, and Kashmiri craft heritage.",
    description:
      "<p>Walk the old quarters with a craftsperson visit and lakeside evenings.</p>",
    durationDays: 3,
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 11200,
    coverPrompt:
      "Photorealistic Srinagar old city wooden architecture lane Kashmir, warm afternoon light, heritage travel photo, no text",
    galleryPrompts: [
      "Photorealistic Kashmiri papier-mache craft workshop colorful pieces on table, soft indoor light, no text",
      "Photorealistic Jhelum river embankment historic Srinagar bridges, daylight, no text",
    ],
  },
  {
    slug: "leh-palace-heritage",
    title: "Leh Palace & Market Heritage",
    category: "Culture",
    destinationSlug: "ladakh",
    summary: "Leh Palace, Shanti Stupa sunset, and the old market lanes.",
    description:
      "<p>Acclimatized culture days in Leh with palace views and monastery evenings.</p>",
    durationDays: 3,
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 14800,
    coverPrompt:
      "Photorealistic Leh Palace mud-brick fortress above Leh town Ladakh at sunset, dramatic light, no text",
    galleryPrompts: [
      "Photorealistic Shanti Stupa white dome Leh Ladakh at blue hour, no text",
      "Photorealistic Leh main bazaar street mountain town Ladakh, daylight, no text",
    ],
  },
  {
    slug: "gulmarg-pahalgam-family",
    title: "Gulmarg & Pahalgam Family Circuit",
    category: "Family",
    destinationSlug: "gulmarg",
    summary: "Soft family days between Gulmarg meadows and Pahalgam rivers.",
    description:
      "<p>Kid-friendly pacing with short sightseeing blocks and comfortable valley hotels.</p>",
    durationDays: 5,
    difficulty: "easy",
    maxGroupSize: 14,
    priceFrom: 21500,
    coverPrompt:
      "Photorealistic Kashmir family travel scene Gulmarg meadow picnic with mountains, soft daylight, people distant, no text",
    galleryPrompts: [
      "Photorealistic Pahalgam riverside park Kashmir suitable for families, green lawns, no text",
      "Photorealistic Kashmir hotel garden breakfast terrace with mountain view, morning light, no text",
    ],
  },
  {
    slug: "manali-family-hills",
    title: "Manali Family Hills",
    category: "Family",
    destinationSlug: "himachal",
    summary: "Solang Valley, Old Manali cafes, and easy Himachal hill days.",
    description:
      "<p>A relaxed Manali family package with adventure optional extras in Solang.</p>",
    durationDays: 4,
    difficulty: "easy",
    maxGroupSize: 14,
    priceFrom: 17500,
    coverPrompt:
      "Photorealistic Manali Himachal pine hills and Beas valley viewpoint, summer day, travel photo, no text",
    galleryPrompts: [
      "Photorealistic Solang Valley Himachal green slopes with mountains, daylight, no text",
      "Photorealistic Old Manali cafe street with wooden balconies, soft evening light, no text",
    ],
  },
];

export type DemoCar = {
  slug: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  type: "Hatchback" | "Sedan" | "SUV" | "MUV" | "Luxury" | "EV";
  fuel: "Petrol" | "Diesel";
  transmission: "Automatic" | "Manual";
  seats: number;
  doors: number;
  luggage: number;
  pricePerDay: number;
  destination: string;
  availability: string[];
  summary: string;
  description: string;
  prompt: string;
  registrationNumber: string;
};

/** Production Kashmir car / cab fleet with market day rates. */
export const demoCars: DemoCar[] = [
  {
    slug: "toyota-innova-crysta",
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    modelName: "Innova Crysta",
    year: 2023,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    doors: 5,
    luggage: 3,
    pricePerDay: 4500,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Premium 7-seater Innova Crysta for Kashmir family tours — from ₹4,500/day.",
    description:
      "<p>Toyota Innova Crysta is the preferred premium MUV for Kashmir sightseeing — Srinagar airport pickups, Gulmarg, Pahalgam, and Sonamarg day circuits. Spacious cabin for 6–7 guests with stronger luggage comfort than a sedan.</p><p>Typical Kashmir day hire includes an experienced local driver. Final quote depends on itinerary and season.</p>",
    prompt:
      "Photorealistic silver Toyota Innova Crysta MPV on Srinagar Kashmir highway with mountains, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C4501",
  },
  {
    slug: "toyota-innova",
    name: "Toyota Innova",
    brand: "Toyota",
    modelName: "Innova",
    year: 2022,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    doors: 5,
    luggage: 3,
    pricePerDay: 3300,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Reliable 7-seater Innova for Kashmir valley touring — from ₹3,300/day.",
    description:
      "<p>The Toyota Innova remains Kashmir’s workhorse family cab for multi-day packages and airport-to-resort transfers. Ideal when you need seven seats without stepping up to Crysta pricing.</p>",
    prompt:
      "Photorealistic white Toyota Innova MPV parked near Dal Lake Srinagar Kashmir, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C3302",
  },
  {
    slug: "force-urbania",
    name: "Force Urbania",
    brand: "Force",
    modelName: "Urbania",
    year: 2024,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 14,
    doors: 4,
    luggage: 5,
    pricePerDay: 7000,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Premium Force Urbania group van with recliner comfort — from ₹7,000/day.",
    description:
      "<p>Force Urbania is the premium group vehicle for Kashmir — better ride and seating comfort than a standard Tempo Traveller for families, corporates, and friend groups. Commonly booked as 10–17 seat layouts; our listed day rate starts from the popular Srinagar touring band.</p>",
    prompt:
      "Photorealistic white Force Urbania luxury van on Kashmir mountain highway pines, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C7003",
  },
  {
    slug: "tempo-traveller",
    name: "Tempo Traveller",
    brand: "Force",
    modelName: "Tempo Traveller",
    year: 2023,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 14,
    doors: 4,
    luggage: 5,
    pricePerDay: 6000,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "14-seater Tempo Traveller for Kashmir group tours — from ₹6,000/day.",
    description:
      "<p>Tempo Traveller is the classic Kashmir group cab for joint families and tour batches. Push-back seating, AC touring setups, and roof carrier space make it the value pick versus Urbania for larger passenger counts.</p>",
    prompt:
      "Photorealistic white Tempo Traveller van on Pahalgam Kashmir road with pines, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C6004",
  },
  {
    slug: "sedan",
    name: "Sedan",
    brand: "Maruti",
    modelName: "Dzire / Etios class",
    year: 2024,
    type: "Sedan",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 4,
    doors: 4,
    luggage: 2,
    pricePerDay: 2500,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Sedan (Dzire / Etios class) for couples and small families — from ₹2,500/day.",
    description:
      "<p>Our Sedan category covers the standard Kashmir cab class used for couples and small families — typically Dzire, Etios, or Glanza equivalents. Best for airport transfers and lighter sightseeing days when luggage is modest.</p>",
    prompt:
      "Photorealistic silver Maruti Dzire sedan on Srinagar Kashmir boulevard, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C2505",
  },
];


export type DemoBike = {
  slug: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  type: "Scooter" | "Cruiser" | "Adventure" | "Motorcycle";
  fuel: "Petrol";
  transmission: "Automatic" | "Manual";
  pricePerDay: number;
  destination: string;
  availability: string[];
  summary: string;
  description: string;
  prompt: string;
  registrationNumber: string;
};

/** Production Kashmir bike fleet. */
export const demoBikes: DemoBike[] = [
  {
    slug: "tvs-ntorq",
    name: "TVS Ntorq",
    brand: "TVS",
    modelName: "Ntorq",
    year: 2024,
    type: "Scooter",
    fuel: "Petrol",
    transmission: "Automatic",
    pricePerDay: 900,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam"],
    summary: "Sporty automatic scooty for Srinagar city lanes and short Kashmir day rides — ₹900/day.",
    description:
      "<p>The TVS Ntorq is our automatic scooty option for travellers who want easy Kashmir city mobility without a geared motorcycle. Ideal for Boulevard Road, local markets, and short valley hops when you prefer a scooter over a bike.</p><p>Helmet included. Valid two-wheeler licence required.</p>",
    prompt:
      "Photorealistic yellow TVS Ntorq scooter beside Dal Lake boulevard Srinagar Kashmir, three-quarter front, daylight, rental catalog, no readable plate text, no watermark",
    registrationNumber: "JK01B0901",
  },
  {
    slug: "royal-enfield-classic-350",
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    modelName: "Classic 350",
    year: 2024,
    type: "Cruiser",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1300,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam"],
    summary: "Iconic Classic 350cc cruiser for Kashmir highway and sightseeing days — ₹1,300/day.",
    description:
      "<p>Royal Enfield Classic 350 is the classic Kashmir rental choice for comfortable paced riding across Srinagar, Gulmarg approach roads, and Pahalgam valleys. Manual gearbox, petrol, two-up friendly with helmets.</p>",
    prompt:
      "Photorealistic black Royal Enfield Classic 350 motorcycle on Kashmir chinar avenue Srinagar, three-quarter front, daylight, no readable plate, no watermark",
    registrationNumber: "JK01B1302",
  },
  {
    slug: "royal-enfield-hunter-350",
    name: "Royal Enfield Hunter 350",
    brand: "Royal Enfield",
    modelName: "Hunter 350",
    year: 2024,
    type: "Cruiser",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1500,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam"],
    summary: "Agile Hunter 350cc roadster for valley roads and photo stops — ₹1,500/day.",
    description:
      "<p>Royal Enfield Hunter 350 suits riders who want a lighter, more agile 350cc roadster than the Classic for Kashmir sightseeing loops. Great for couples exploring Srinagar surrounds and day rides toward Gulmarg or Pahalgam.</p>",
    prompt:
      "Photorealistic grey Royal Enfield Hunter 350 motorcycle on Kashmir mountain highway with pines, three-quarter front, daylight, no readable plate, no watermark",
    registrationNumber: "JK01B1503",
  },
  {
    slug: "royal-enfield-himalayan-411",
    name: "Royal Enfield Himalayan 411",
    brand: "Royal Enfield",
    modelName: "Himalayan 411",
    year: 2023,
    type: "Adventure",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1800,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Adventure-ready Himalayan 411cc for rough Kashmir roads and longer valley days — ₹1,800/day.",
    description:
      "<p>The Himalayan 411 is built for mixed Kashmir surfaces — highway stretches, broken patches, and higher valley approaches toward Sonamarg or Gulmarg. Choose this when you want adventure posture and luggage practicality over a pure cruiser.</p>",
    prompt:
      "Photorealistic khaki Royal Enfield Himalayan 411 adventure motorcycle on Sonamarg Kashmir mountain road, three-quarter front, daylight, no readable plate, no watermark",
    registrationNumber: "JK01B1804",
  },
  {
    slug: "royal-enfield-himalayan-450",
    name: "Royal Enfield Himalayan 450",
    brand: "Royal Enfield",
    modelName: "Himalayan 450",
    year: 2024,
    type: "Adventure",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 2200,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Latest Himalayan 450cc adventure bike for serious Kashmir mountain riding — ₹2,200/day.",
    description:
      "<p>Royal Enfield Himalayan 450 is our top adventure rental for riders who want more power and modern adventure ergonomics on Kashmir mountain roads. Best for experienced riders planning longer Gulmarg, Sonamarg, or multi-day valley rides.</p>",
    prompt:
      "Photorealistic modern Royal Enfield Himalayan 450 adventure motorcycle on Gulmarg Kashmir alpine road, three-quarter front, clear daylight, no readable plate, no watermark",
    registrationNumber: "JK01B2205",
  },
];

export const destinationPrompts: Record<string, string> = {
  jammu: "Photorealistic panoramic view of Jammu city and Tawi river valley hills India, daylight travel photo, no text",
  katra: "Photorealistic Katra town Trikuta hills Vaishno Devi base Jammu, daylight, no text",
  kashmir: "Photorealistic Dal Lake Srinagar Kashmir with shikaras and mountains, golden hour, no text",
  gulmarg: "Photorealistic Gulmarg Kashmir meadows and snow peaks, summer daylight, no text",
  pahalgam: "Photorealistic Pahalgam Lidder valley Kashmir pines and river, daylight, no text",
  sonamarg: "Photorealistic Sonamarg meadow of gold Kashmir mountains, daylight, no text",
  himachal: "Photorealistic Manali Himachal Beas valley pine hills, daylight, no text",
  shimla: "Photorealistic Shimla ridge Himachal colonial buildings and pines, daylight, no text",
  ladakh: "Photorealistic Leh Ladakh town with palace and barren mountains, daylight, no text",
  nubra: "Photorealistic Nubra valley sand dunes and mountains Ladakh, daylight, no text",
};
