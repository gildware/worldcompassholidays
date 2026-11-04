/** Production Kashmir tour packages — popular OTA / operator bestsellers with full itineraries. */

export type KashmirTourDay = {
  dayNumber: number;
  title: string;
  description: string;
};

export type KashmirTour = {
  slug: string;
  title: string;
  category: string;
  destinationSlug: string;
  destinationSlugs: string[];
  /** Destination image slugs used as cover/gallery when tour-specific JPGs are missing. */
  imageSlugs?: string[];
  /** Named stays shown in copy and includes (builds booking trust). */
  stays?: string[];
  /** How many upcoming open departures to seed (0 = request-only). */
  openDepartures?: number;
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  durationLabel: string;
  difficulty: string;
  maxGroupSize: number;
  priceFrom: number;
  isFeatured?: boolean;
  mapLat: string;
  mapLng: string;
  includes: string[];
  excludes: string[];
  faqs: { title: string; content: string }[];
  days: KashmirTourDay[];
  coverPrompt: string;
  galleryPrompts: [string, string, string, string];
};

const sharedIncludes = [
  "Accommodation as per itinerary (twin sharing)",
  "Daily breakfast and dinner (MAP)",
  "Private vehicle for transfers and sightseeing",
  "Airport pickup and drop in Srinagar",
  "1-hour Shikara ride on Dal Lake (where listed)",
  "Driver allowance, tolls, parking, and GST as quoted",
];

const sharedExcludes = [
  "Flights to / from Srinagar",
  "Gulmarg Gondola tickets (Phase I / II)",
  "Pahalgam local union cabs (Aru / Betaab / Chandanwari / Baisaran)",
  "Sonamarg pony / sled to Thajiwas Glacier or Zero Point",
  "Lunch, tips, laundry, and personal expenses",
  "Travel insurance and entry fees not listed",
];

const winterNote =
  "Gondola Phase II and high snow points are weather-dependent. Union sightseeing cabs in Pahalgam are paid locally.";

function faq(bestTime: string, note?: string) {
  return [
    {
      title: "What is the best time for this tour?",
      content: bestTime,
    },
    {
      title: "Are Gondola and valley cabs included?",
      content: note ?? winterNote,
    },
    {
      title: "Is this a private tour?",
      content:
        "Yes — private cab and hotels as quoted. Group-departure variants can be arranged on request for pilgrimage packages.",
    },
  ];
}

function prompt(place: string, scene: string) {
  return `Photorealistic ${place} Kashmir, ${scene}, natural daylight, editorial travel photography, no readable text, 16:9 landscape`;
}

export const kashmirTours: KashmirTour[] = [
  {
    slug: "classic-kashmir-triangle",
    title: "Classic Kashmir Triangle",
    category: "Leisure",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam", "betaab-valley", "aru-valley"],
    imageSlugs: ["srinagar", "gulmarg", "pahalgam", "betaab-valley", "aru-valley"],
    stays: [
      "1N Hotel Royal Batoo or similar (Srinagar / Dalgate)",
      "1N Apple Tree Resorts or similar (Gulmarg)",
      "1N White Villa Resort or similar (Pahalgam)",
      "1N Hotel Asian Park or similar (return Srinagar)",
      "Optional upgrade: 1N deluxe Dal Lake houseboat on night 1",
    ],
    openDepartures: 6,
    summary:
      "Kashmir’s #1 first trip — overnight in Gulmarg and Pahalgam, Mughal Gardens, Shikara, Betaab & Aru. Private cab from ₹14,999 pp.",
    description:
      "<p><strong>Why travellers book this:</strong> you sleep in the mountains, not only day-trip them. One night in Gulmarg means an early Gondola without the Srinagar rush; one night in Pahalgam means Betaab and Aru without a 6-hour round trip.</p><p><strong>Stays in this quote:</strong> Hotel Royal Batoo (or similar) near Dalgate, Apple Tree Resorts (or similar) in Gulmarg, White Villa Resort (or similar) by the Lidder, then Hotel Asian Park (or similar) on return. Houseboat upgrade available for night 1.</p><p>Private Innova/Swift Dzire throughout. Gondola tickets and Pahalgam union cabs are paid locally — we list exact extras before you confirm.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 14999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [
      ...sharedIncludes,
      "Stays: Royal Batoo / Apple Tree / White Villa / Asian Park category (or similar)",
      "Meet-and-greet at Srinagar Airport",
    ],
    excludes: sharedExcludes,
    faqs: [
      ...faq("April–June for blooms, July–September for green meadows, December–February for snow."),
      {
        title: "Which hotels will I get?",
        content:
          "The quote uses Hotel Royal Batoo (Srinagar), Apple Tree Resorts (Gulmarg), White Villa Resort (Pahalgam), and Hotel Asian Park (return) or the same star category if a date is sold out. Exact names are confirmed in writing before payment.",
      },
      {
        title: "How much should I budget for extras?",
        content:
          "Plan roughly ₹1,500–2,500 for Gondola Phase I (more for Phase II), and ₹2,000–3,500 for a Pahalgam union cab covering Aru + Betaab. Lunch is usually ₹400–800 per person per day.",
      },
    ],
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · Gardens & Shikara",
        description:
          "Your driver meets you at Srinagar Airport and transfers you to Hotel Royal Batoo (or similar) near Dalgate — a short walk from Dal Lake.\nAfter lunch on your own, visit Nishat Bagh, Shalimar Bagh, and Chashme Shahi. At golden hour, take a private one-hour Shikara on Dal Lake past the houseboats and floating gardens. Dinner at the hotel; overnight Srinagar.",
      },
      {
        dayNumber: 2,
        title: "Srinagar to Gulmarg · Gondola day",
        description:
          "After breakfast, drive 50–60 km (about 1.5–2 hours) via Tangmarg into Gulmarg. Check in at Apple Tree Resorts (or similar) on the meadow.\nRide Gondola Phase I to Kongdori (tickets extra; Phase II to Apharwat if weather allows). Walk the pine trails or visit St. Mary’s Church. Dinner and overnight in Gulmarg so you are on the meadow at sunrise.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg to Pahalgam via Pampore",
        description:
          "Checkout after breakfast and drive toward Pahalgam (typically 4–5 hours). Stop at the Pampore saffron fields in season and the 9th-century Awantipora ruins.\nCheck in at White Villa Resort (or similar) along the Lidder. Evening free for a riverside walk and kahwa. Overnight Pahalgam.",
      },
      {
        dayNumber: 4,
        title: "Betaab & Aru valleys",
        description:
          "Hire a local union cab (paid locally — outside cars cannot do this circuit). Visit Betaab Valley — the classic Bollywood meadow — then Aru Valley for wider mountain views. Optional add-on: Chandanwari or Baisaran (“mini Switzerland”).\nReturn to the resort for dinner. Overnight Pahalgam.",
      },
      {
        dayNumber: 5,
        title: "Pahalgam to Srinagar · shopping",
        description:
          "Drive back to Srinagar (about 2.5–3 hours) and check in at Hotel Asian Park (or similar).\nOptional Shankaracharya Temple for lake views, then Lal Chowk / Boulevard for pashmina, dry fruit, and papier-mâché (we can suggest reputable shops). Dinner and overnight Srinagar.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description:
          "Breakfast at the hotel. Keep a 3-hour buffer before domestic flights.\nPrivate transfer to Srinagar Airport. Trip ends.",
      },
    ],
    coverPrompt: prompt("Dal Lake Srinagar", "shikara boats on calm water with Himalayan backdrop at golden hour"),
    galleryPrompts: [
      prompt("Gulmarg", "gondola cables over green meadows and snow peaks"),
      prompt("Betaab Valley Pahalgam", "lush meadow with pine forest and mountains"),
      prompt("Pahalgam Lidder", "turquoise river with wooden bridge and pines"),
      prompt("Nishat Bagh Srinagar", "terraced Mughal garden blooming flowers"),
    ],
  },
  {
    slug: "best-of-kashmir-sonamarg",
    title: "Best of Kashmir with Sonamarg",
    category: "Leisure",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "sonamarg", "gulmarg", "pahalgam"],
    imageSlugs: ["sonamarg", "gulmarg", "pahalgam", "srinagar", "betaab-valley"],
    stays: [
      "2N Hotel Golden Leaf or similar (Srinagar)",
      "1N Hotel Zahgeer Continental or similar (Gulmarg)",
      "1N Hotel Green Heights or similar (Pahalgam)",
      "1N Hotel Golden Leaf or similar (return Srinagar)",
    ],
    openDepartures: 6,
    summary:
      "Four valleys in 6 days — Srinagar, Sonamarg (Thajiwas), Gulmarg Gondola overnight, and Pahalgam. The OTA mid-range bestseller from ₹16,999 pp.",
    description:
      "<p><strong>Four valleys, one loop:</strong> this is the MakeMyTrip / TravelTriangle “Best of Kashmir with Sonmarg” skeleton — Classic Triangle plus a full Sonamarg day for Thajiwas Glacier and Zero Point.</p><p><strong>Stays:</strong> Hotel Golden Leaf (Srinagar), Zahgeer Continental (Gulmarg), Green Heights (Pahalgam), or the same category if a date is full. Private cab throughout; pony rides and Gondola are optional extras quoted before you pay.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 16999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [
      ...sharedIncludes,
      "Stays: Golden Leaf / Zahgeer Continental / Green Heights category (or similar)",
      "Full-day Sonamarg excursion with private cab",
    ],
    excludes: sharedExcludes,
    faqs: [
      ...faq("March–June and September–October are ideal; winter needs snow-ready vehicles for Sonamarg."),
      {
        title: "Is Zero Point included?",
        content:
          "The drive to Sonamarg is included. Shared/local jeeps or ponies from Sonamarg market to Thajiwas / Zero Point are paid on the spot (typically ₹3,000–6,000 per vehicle depending on season).",
      },
    ],
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · lake evening",
        description:
          "Airport pickup to Hotel Golden Leaf (or similar). Freshen up, then Mughal Gardens — Nishat and Shalimar.\nSunset Shikara on Dal Lake (1 hour, included). Dinner and overnight Srinagar.",
      },
      {
        dayNumber: 2,
        title: "Sonamarg · Thajiwas day",
        description:
          "Full-day drive along the Sindh River to Sonamarg, the Meadow of Gold (about 85 km / 2.5–3 hours each way).\nOptional pony or local vehicle to Thajiwas Glacier / Zero Point (paid locally). Return to Srinagar for dinner and overnight.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg overnight",
        description:
          "Drive to Gulmarg and check in at Zahgeer Continental (or similar) near the Gondola road.\nRide Phase I (and Phase II if open — tickets extra). Meadow walks and St. Mary’s Church. Overnight Gulmarg for cooler mountain air.",
      },
      {
        dayNumber: 4,
        title: "Gulmarg to Pahalgam",
        description:
          "Scenic transfer to Pahalgam via Awantipora. Check in at Hotel Green Heights (or similar).\nEvening Lidder riverside walk. Overnight Pahalgam.",
      },
      {
        dayNumber: 5,
        title: "Pahalgam valleys · return Srinagar",
        description:
          "Morning union-cab circuit to Betaab and Aru (paid locally). After lunch, drive back to Srinagar.\nCheck in at Golden Leaf (or similar). Shopping buffer at Boulevard / Lal Chowk. Overnight Srinagar.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description:
          "Breakfast and private airport transfer. Keep a comfortable flight buffer.",
      },
    ],
    coverPrompt: prompt("Sonamarg", "golden meadow with Sindh river and snow peaks"),
    galleryPrompts: [
      prompt("Thajiwas Glacier Sonamarg", "pony trail toward glacier with pine forest"),
      prompt("Gulmarg Gondola", "cabin rising over pine forest toward Apharwat"),
      prompt("Pahalgam", "Lidder riverside resort meadow"),
      prompt("Dal Lake", "sunset shikara silhouette"),
    ],
  },
  {
    slug: "budget-express-kashmir",
    title: "Budget Express Kashmir",
    category: "Leisure",
    destinationSlug: "srinagar",
    destinationSlugs: ["srinagar", "gulmarg", "pahalgam"],
    imageSlugs: ["srinagar", "gulmarg", "pahalgam"],
    stays: ["3N Hotel Jhelum Comfort Residency or similar (all nights Srinagar)"],
    openDepartures: 8,
    summary:
      "3 nights all in Srinagar — day trips to Gulmarg & Pahalgam. No hotel hopping. From ₹9,499 pp with breakfast + private cab.",
    description:
      "<p><strong>Built for short holidays:</strong> you unpack once at Jhelum Comfort Residency (or similar) near Lal Mandi, then day-trip Gulmarg and Pahalgam. That is why this undercuts overnight-in-the-valleys packages.</p><p><strong>Honest pace:</strong> long days in the car, big views, optional Gondola and valley cabs. Ideal for friends, couples on a budget, and first looks at Kashmir before a longer return trip.</p>",
    durationDays: 4,
    durationNights: 3,
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 9499,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [
      "3 nights Hotel Jhelum Comfort Residency or similar (Srinagar, twin sharing)",
      "Daily breakfast",
      "Private cab for Gulmarg and Pahalgam day trips",
      "Airport pickup and drop",
      "1-hour Shikara ride on Dal Lake",
      "Driver allowance, tolls, parking",
    ],
    excludes: sharedExcludes,
    faqs: [
      ...faq("Works year-round; winter day trips need an early start."),
      {
        title: "Why aren’t we sleeping in Gulmarg?",
        content:
          "Keeping all nights in Srinagar cuts the hotel bill and packing. You still see Gulmarg and Pahalgam as full days — just with earlier starts and later returns.",
      },
    ],
    days: [
      {
        dayNumber: 1,
        title: "Arrive · Shikara evening",
        description:
          "Airport pickup to Jhelum Comfort Residency (or similar). Check in and rest.\nEvening Shikara on Dal Lake (included). Dinner on your own near Lal Chowk or Dalgate. Overnight Srinagar.",
      },
      {
        dayNumber: 2,
        title: "Gulmarg full-day trip",
        description:
          "Leave by 8:00 am for Gulmarg (1.5–2 hours). Meadows, photo stops, optional Gondola Phase I (tickets extra).\nReturn to Srinagar by evening. Overnight same hotel — no packing.",
      },
      {
        dayNumber: 3,
        title: "Pahalgam full-day trip",
        description:
          "Full-day drive to Pahalgam via Pampore. Optional Aru + Betaab on a local union cab (paid locally).\nReturn to Srinagar. Overnight same hotel.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        description:
          "Breakfast, quick dry-fruit shopping if time allows, then airport drop.",
      },
    ],
    coverPrompt: prompt("Srinagar Boulevard", "Dal Lake shoreline with shikaras and mountains"),
    galleryPrompts: [
      prompt("Gulmarg meadows", "summer wildflowers and distant peaks"),
      prompt("Pahalgam", "valley road along Lidder river"),
      prompt("Dal Lake houseboats", "row of wooden houseboats at dusk"),
      prompt("Srinagar market", "Lal Chowk evening street without readable signs"),
    ],
  },
  {
    slug: "valley-day-trip-circuit",
    title: "Valley Day-Trip Circuit",
    category: "Leisure",
    destinationSlug: "srinagar",
    destinationSlugs: ["srinagar", "sonamarg", "gulmarg", "pahalgam", "pampore"],
    summary:
      "EaseMyTrip-style 4N/5D: every night in Srinagar with Sonamarg, Gulmarg, and Pahalgam as full-day excursions.",
    description:
      "<p>Cheaper lodging, longer drives. Perfect if you want the four classic stops without packing every night. Includes the saffron fields and Awantipora ruins on the Pahalgam day.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    maxGroupSize: 14,
    priceFrom: 12999,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: sharedIncludes,
    excludes: sharedExcludes,
    faqs: faq("April–October for open Sonamarg roads; winter variants swap in snow points when open."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive · Mughal Gardens",
        description:
          "Transfer to hotel. Afternoon Nishat, Shalimar, Chashme Shahi, and Shankaracharya Temple.\nOvernight Srinagar.",
      },
      {
        dayNumber: 2,
        title: "Sonamarg excursion",
        description: "Full-day Sonamarg with optional Thajiwas / Zero Point.\nReturn Srinagar.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg excursion",
        description: "Full-day Gulmarg meadows and Gondola (extra).\nReturn Srinagar.",
      },
      {
        dayNumber: 4,
        title: "Pahalgam excursion",
        description:
          "Full-day Pahalgam via Pampore saffron fields and Awantipora.\nReturn Srinagar.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        description: "Airport transfer after breakfast.",
      },
    ],
    coverPrompt: prompt("Kashmir valley road", "winding highway through poplars toward mountains"),
    galleryPrompts: [
      prompt("Sonamarg", "meadow of gold with tourists distant"),
      prompt("Gulmarg", "highest golf course meadow view"),
      prompt("Pampore", "saffron field purple bloom autumn"),
      prompt("Shankaracharya Temple", "hilltop temple overlooking Dal Lake"),
    ],
  },
  {
    slug: "romantic-kashmir-honeymoon",
    title: "Romantic Kashmir Honeymoon",
    category: "Honeymoon",
    destinationSlug: "srinagar",
    destinationSlugs: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    imageSlugs: ["srinagar", "gulmarg", "pahalgam", "betaab-valley", "sonamarg"],
    stays: [
      "1N deluxe Dal / Nigeen Lake houseboat (decorated)",
      "1N Hotel Heritage Luxury or similar (Srinagar)",
      "1N Hotel Signature or similar (Gulmarg)",
      "1N The Pahalgam Shore or similar (riverside)",
      "1N Hotel Heritage Luxury or similar (return)",
    ],
    openDepartures: 6,
    summary:
      "Decorated houseboat, cake & candlelight, private Shikara, Gulmarg overnight, and riverside Pahalgam — Kashmir’s top couples package from ₹18,999 pp.",
    description:
      "<p><strong>Built for two:</strong> night one on a decorated deluxe houseboat with flower bed, honeymoon cake, Kahwa Shikara, and candlelight dinner. Then Heritage Luxury (or similar) in Srinagar, Hotel Signature (or similar) in Gulmarg, and The Pahalgam Shore (or similar) on the Lidder.</p><p>Private transfers only — no group coach. Gondola and valley cabs stay optional so you control the adventure budget.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 2,
    priceFrom: 18999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [
      ...sharedIncludes,
      "1 night deluxe decorated houseboat on Dal / Nigeen",
      "Flower bed decoration and honeymoon cake",
      "Candlelight dinner for the couple",
      "Private sunset Shikara with Kahwa",
      "Stays: Heritage Luxury / Signature / Pahalgam Shore category (or similar)",
    ],
    excludes: sharedExcludes,
    faqs: [
      ...faq("October–November and March–May are peak honeymoon months; Dec–Feb for snow romance."),
      {
        title: "Is the houseboat heated in winter?",
        content:
          "Yes — winter departures use heated deluxe houseboats. We confirm the boat name and heating type in your voucher before arrival.",
      },
      {
        title: "Can parents or friends join?",
        content:
          "This SKU is priced and paced for two. For a family honeymoon-plus group, ask for the Family Album or Classic Triangle instead.",
      },
    ],
    days: [
      {
        dayNumber: 1,
        title: "Decorated houseboat welcome",
        description:
          "Private airport pickup to your deluxe houseboat on Dal or Nigeen Lake. Flower bed and cake waiting in the cabin.\nPrivate sunset Shikara with Kahwa, then candlelight dinner on board. Overnight on the water.",
      },
      {
        dayNumber: 2,
        title: "Gardens · soft Srinagar day",
        description:
          "After a late breakfast, check into Hotel Heritage Luxury (or similar). Visit Nishat and Shalimar at an easy pace.\nBoulevard walk and couple photos. Dinner at the hotel. Overnight Srinagar.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg overnight",
        description:
          "Drive to Gulmarg and check in at Hotel Signature (or similar). Gondola Phase I together (tickets extra).\nQuiet meadow time away from day-trip crowds. Dinner and overnight Gulmarg.",
      },
      {
        dayNumber: 4,
        title: "Pahalgam riverside",
        description:
          "Transfer to The Pahalgam Shore (or similar) by the Lidder. Afternoon free for riverside photography.\nOptional short walk only — no forced sightseeing. Overnight Pahalgam.",
      },
      {
        dayNumber: 5,
        title: "Betaab picnic · return Srinagar",
        description:
          "Morning Betaab Valley picnic via union cab (paid locally). Optional Aru if you want a second meadow.\nReturn to Heritage Luxury (or similar) in Srinagar. Leisure evening. Overnight Srinagar.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description:
          "Breakfast together, then private airport transfer. We time the drop to your flight.",
      },
    ],
    coverPrompt: prompt("Dal Lake houseboat", "romantic shikara at sunset with soft warm light"),
    galleryPrompts: [
      prompt("Kashmir houseboat bedroom", "decorated room with flowers overlooking lake windows"),
      prompt("Gulmarg couple viewpoint", "meadow path with mountains, people distant"),
      prompt("Pahalgam riverside", "quiet Lidder bank at golden hour"),
      prompt("Betaab Valley", "picnic meadow framed by pines"),
    ],
  },
  {
    slug: "luxury-houseboat-escape",
    title: "Luxury Houseboat Escape",
    category: "Honeymoon",
    destinationSlug: "srinagar",
    destinationSlugs: ["srinagar", "gulmarg"],
    summary:
      "Short 3N/4D houseboat-first getaway with optional Gulmarg snow or meadow day — popular for winter couples.",
    description:
      "<p>Stay on a heated deluxe houseboat, keep sightseeing light, and add one Gulmarg day if you want snow or Gondola views without a long circuit.</p>",
    durationDays: 4,
    durationNights: 3,
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    maxGroupSize: 4,
    priceFrom: 18999,
    mapLat: "34.1036",
    mapLng: "74.8606",
    includes: [
      "3 nights deluxe / heated houseboat",
      "MAP meals with one candlelight dinner",
      "Private Shikara",
      "Optional Gulmarg day with private cab",
      "Airport transfers",
    ],
    excludes: sharedExcludes,
    faqs: faq("December–February for snow; April–June for gardens and mild lake weather."),
    days: [
      {
        dayNumber: 1,
        title: "Houseboat check-in",
        description: "Transfer to luxury houseboat. Sunset Shikara and dinner on board.",
      },
      {
        dayNumber: 2,
        title: "Srinagar soft day",
        description: "Mughal Gardens and Boulevard leisure. Spa or Old City crafts optional.",
      },
      {
        dayNumber: 3,
        title: "Optional Gulmarg day",
        description: "Day trip to Gulmarg for Gondola and snow or meadow walks. Return houseboat.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        description: "Breakfast and airport drop.",
      },
    ],
    coverPrompt: prompt("luxury Kashmir houseboat", "wooden deck overlooking Nigeen Lake morning mist"),
    galleryPrompts: [
      prompt("houseboat dining", "candlelit table by lake window"),
      prompt("Dal Lake dawn", "mirror-calm water with mountain reflection"),
      prompt("Gulmarg snow", "fresh powder meadow with pines"),
      prompt("Nishat Bagh", "quiet garden terrace"),
    ],
  },
  {
    slug: "family-album-kashmir",
    title: "Family Album Kashmir",
    category: "Family",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam"],
    summary:
      "Easy-paced 5N/6D for families — short sightseeing blocks, pony or sled options, and Betaab picnic time.",
    description:
      "<p>Built for kids and mixed ages: Phase I Gondola for grandparents, picnic meadows, and no forced long treks. Family rooms or connecting options on request.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 14,
    priceFrom: 13999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [...sharedIncludes, "Family-friendly hotel rooms where available"],
    excludes: sharedExcludes,
    faqs: faq("May–June and September school-holiday windows are busiest."),
    days: [
      {
        dayNumber: 1,
        title: "Soft Srinagar arrival",
        description: "Hotel check-in and a short Shikara. Keep the rest of the day light.",
      },
      {
        dayNumber: 2,
        title: "Gulmarg family day",
        description: "Gondola Phase I, meadow play, optional pony or winter sled. Overnight Gulmarg or Srinagar.",
      },
      {
        dayNumber: 3,
        title: "Transfer to Pahalgam",
        description: "Drive with picnic stops. Check in near the Lidder.",
      },
      {
        dayNumber: 4,
        title: "Betaab picnic",
        description: "Union cab to Betaab for a family picnic; optional short Aru stop. Overnight Pahalgam.",
      },
      {
        dayNumber: 5,
        title: "Return Srinagar",
        description: "Gardens or shopping. Overnight Srinagar.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description: "Airport transfer.",
      },
    ],
    coverPrompt: prompt("Kashmir family picnic", "Gulmarg meadow with mountains, people distant"),
    galleryPrompts: [
      prompt("Gulmarg gondola Phase I", "families boarding meadow station"),
      prompt("Betaab Valley picnic", "green lawn and stream"),
      prompt("Pahalgam park", "riverside lawn suitable for children"),
      prompt("Dal Lake shikara", "family boat ride calm water"),
    ],
  },
  {
    slug: "family-grand-circuit",
    title: "Family Grand Circuit",
    category: "Family",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam", "sonamarg", "yusmarg"],
    summary:
      "6N/7D kid- and senior-friendly circuit with short drives, houseboat night, and optional Yusmarg soft day.",
    description:
      "<p>All four classic valleys at a slower pace — Innova or Tempo Traveller, family rooms, and Phase I Gondola for elders. Ideal when three generations travel together.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 24999,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: sharedIncludes,
    excludes: sharedExcludes,
    faqs: faq("April–October for the full Sonamarg and Yusmarg add-ons."),
    days: [
      { dayNumber: 1, title: "Arrive Srinagar", description: "Houseboat or hotel welcome. Evening Shikara." },
      { dayNumber: 2, title: "Srinagar gardens", description: "Full local sightseeing day at an easy pace." },
      { dayNumber: 3, title: "Gulmarg overnight", description: "Gondola Phase I and meadow time. Overnight Gulmarg." },
      { dayNumber: 4, title: "Pahalgam overnight", description: "Transfer to Pahalgam. Riverside evening." },
      { dayNumber: 5, title: "Pahalgam leisure", description: "Valleys or soft Lidder day. Overnight Pahalgam." },
      {
        dayNumber: 6,
        title: "Sonamarg or Yusmarg",
        description: "Day trip to Sonamarg or a quieter Yusmarg meadow day. Overnight Srinagar.",
      },
      { dayNumber: 7, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Kashmir family road trip", "Innova on valley highway with poplars"),
    galleryPrompts: [
      prompt("Yusmarg", "pine-ringed meadow quiet and open"),
      prompt("Gulmarg", "meadow walk with elders and children distant"),
      prompt("Sonamarg", "Sindh river viewpoint"),
      prompt("Srinagar houseboat", "family breakfast on deck"),
    ],
  },
  {
    slug: "premium-relaxed-kashmir",
    title: "Premium Relaxed Kashmir",
    category: "Luxury",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam"],
    summary:
      "6N/7D slow luxury — extra nights in Gulmarg and Pahalgam, houseboat welcome, and unhurried sightseeing.",
    description:
      "<p>Thomas Cook–style “Exotic Kashmir with Gulmarg stay”: two nights each in the mountain resorts so Gondola, ski or golf, and Lidder valleys are not day-trip rushes.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "easy",
    maxGroupSize: 8,
    priceFrom: 38999,
    isFeatured: true,
    mapLat: "34.0484",
    mapLng: "74.3805",
    includes: [
      ...sharedIncludes,
      "Premium / 4-star category hotels where available",
      "One night deluxe houseboat",
    ],
    excludes: sharedExcludes,
    faqs: faq("Book early for December–January ski weeks and April tulip season."),
    days: [
      { dayNumber: 1, title: "Houseboat & Shikara", description: "Arrive and settle on a deluxe houseboat with sunset Shikara." },
      { dayNumber: 2, title: "Full Srinagar day", description: "Gardens, Shankaracharya, crafts. Overnight hotel or houseboat." },
      { dayNumber: 3, title: "Gulmarg night 1", description: "Transfer to Gulmarg resort. Gondola afternoon." },
      { dayNumber: 4, title: "Gulmarg leisure", description: "Second Gondola attempt, golf, ski, or forest walks." },
      { dayNumber: 5, title: "Pahalgam night 1", description: "Drive to riverside resort. Evening free." },
      { dayNumber: 6, title: "Pahalgam valleys", description: "Aru, Betaab, optional Chandanwari at a relaxed pace." },
      { dayNumber: 7, title: "Depart or Srinagar buffer", description: "Return toward airport with shopping buffer if flight timing allows." },
    ],
    coverPrompt: prompt("Gulmarg luxury resort", "chalet balcony overlooking snow meadow"),
    galleryPrompts: [
      prompt("Pahalgam luxury riverside", "resort terrace above Lidder"),
      prompt("Dal Lake deluxe houseboat", "panelled suite with lake windows"),
      prompt("Gulmarg gondola Phase II", "Apharwat snow ridge view"),
      prompt("Kashmir wazwan thali", "traditional feast spread elegant table"),
    ],
  },
  {
    slug: "winter-white-gulmarg",
    title: "Winter White Gulmarg",
    category: "Winter",
    destinationSlug: "gulmarg",
    destinationSlugs: ["gulmarg", "srinagar"],
    imageSlugs: ["gulmarg", "gulmarg", "srinagar", "tangmarg", "gulmarg"],
    stays: [
      "1N heated Hotel Milan or similar (Srinagar)",
      "2N heated Apple Tree Resorts or Mama Palace (Gulmarg)",
      "1N heated Hotel Milan or similar (return Srinagar)",
    ],
    openDepartures: 6,
    summary:
      "2 nights in Gulmarg snow — heated hotels, chain-ready cab, two Gondola chances. Kashmir’s winter bestseller from ₹15,999 pp.",
    description:
      "<p><strong>For snow, not checklists:</strong> two nights in Gulmarg give you a second Gondola / weather window. Heated rooms at Apple Tree Resorts or Mama Palace (or similar), winter-equipped private cab with chains, and a Srinagar buffer night each side.</p><p>Beginner ski lessons are optional and paid to the ski school — we coordinate timing so you are not stuck in a queue without a plan.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "moderate",
    maxGroupSize: 10,
    priceFrom: 15999,
    isFeatured: true,
    mapLat: "34.0484",
    mapLng: "74.3805",
    includes: [
      ...sharedIncludes,
      "2 nights heated Gulmarg hotel (Apple Tree / Mama Palace category or similar)",
      "Winter-equipped vehicle with chains where required",
      "Heated Srinagar hotel nights",
      "Ski-school timing coordination (lesson fees extra)",
    ],
    excludes: [...sharedExcludes, "Ski lesson and equipment rental fees paid to ski school"],
    faqs: [
      ...faq("Mid-December to February for reliable snow; confirm Gondola status daily."),
      {
        title: "What if Gondola Phase II is closed?",
        content:
          "Phase II closes often in high wind. Your second Gulmarg night is the backup window. Phase I meadows and sledding usually still run.",
      },
    ],
    days: [
      {
        dayNumber: 1,
        title: "Arrive · heated Srinagar night",
        description:
          "Airport pickup in a winter-ready cab. Check in at Hotel Milan (or similar, heated).\nShort Shikara if the lake is calm; otherwise rest and early dinner. Overnight Srinagar.",
      },
      {
        dayNumber: 2,
        title: "Gulmarg snow day 1",
        description:
          "Drive via Tangmarg (chains fitted if required). Check in at Apple Tree / Mama Palace (or similar).\nGondola Phase I; attempt Phase II if the mountain is open. Snow play and photos. Overnight Gulmarg.",
      },
      {
        dayNumber: 3,
        title: "Gulmarg snow day 2",
        description:
          "Second Gondola window in the morning. Optional beginner ski lesson (fees to ski school — we book the slot).\nAfternoon sledding or meadow walk. Overnight Gulmarg.",
      },
      {
        dayNumber: 4,
        title: "Return Srinagar",
        description:
          "Descend to Srinagar after breakfast. Soft shopping day for dry fruit and pherans.\nOvernight heated hotel. Pack layers for the flight.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        description:
          "Breakfast and airport transfer. Winter traffic can be slow — we leave with buffer.",
      },
    ],
    coverPrompt: prompt("Gulmarg winter", "deep snow meadow with gondola and pines"),
    galleryPrompts: [
      prompt("Gulmarg skiing", "beginner slope with instructor distant"),
      prompt("Apharwat", "high snow ridge under clear winter sky"),
      prompt("Srinagar winter houseboat", "snow on deck roof Dal Lake"),
      prompt("Gulmarg sledding", "families on snow slope"),
    ],
  },
  {
    slug: "kashmir-snow-tour",
    title: "Kashmir Snow Tour",
    category: "Winter",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "sonamarg", "pahalgam"],
    summary:
      "5N/6D winter circuit with 2 nights Gulmarg, Sonamarg in snow, and a soft Pahalgam or houseboat finish.",
    description:
      "<p>The winter first-timer package sold widely from ~₹13k. Two Gondola chances in Gulmarg, heated houseboat, and Sonamarg when the road allows.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 12,
    priceFrom: 14999,
    isFeatured: true,
    mapLat: "34.0484",
    mapLng: "74.3805",
    includes: [...sharedIncludes, "Heated stays confirmed for winter"],
    excludes: sharedExcludes,
    faqs: faq("December–March. Sonamarg may be limited in heavy snow — we swap for Doodhpathri when needed."),
    days: [
      { dayNumber: 1, title: "Heated houseboat", description: "Arrive Srinagar. Settle into heated houseboat." },
      { dayNumber: 2, title: "Gulmarg night 1", description: "Snow day and overnight Gulmarg." },
      { dayNumber: 3, title: "Gulmarg night 2", description: "Second Gondola attempt and snow activities." },
      { dayNumber: 4, title: "Sonamarg snow day", description: "Day trip to Sonamarg if roads open; else Doodhpathri snow." },
      { dayNumber: 5, title: "Pahalgam soft day", description: "Optional soft Pahalgam or Srinagar leisure. Overnight Srinagar." },
      { dayNumber: 6, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Kashmir winter highway", "snow-lined road toward Gulmarg with peaks"),
    galleryPrompts: [
      prompt("Sonamarg winter", "snowfield and frozen stream"),
      prompt("Gulmarg gondola winter", "cabin over white pines"),
      prompt("Dal Lake winter", "misty morning houseboats"),
      prompt("Pahalgam snow", "Lidder banks with light snow"),
    ],
  },
  {
    slug: "winter-sports-week",
    title: "Winter Sports Week",
    category: "Adventure",
    destinationSlug: "gulmarg",
    destinationSlugs: ["gulmarg", "srinagar", "pahalgam"],
    summary:
      "7N/8D ski week — 4 nights Gulmarg with lessons and gear, houseboat bookends, and a Pahalgam snowshoe day.",
    description:
      "<p>For beginners and intermediates who want real slope time. Includes coordinated ski school, equipment rental days, and Gondola access toward Apharwat when open.</p>",
    durationDays: 8,
    durationNights: 7,
    durationLabel: "7 nights / 8 days",
    difficulty: "challenging",
    maxGroupSize: 8,
    priceFrom: 45999,
    mapLat: "34.0484",
    mapLng: "74.3805",
    includes: [
      "2 nights Srinagar houseboat",
      "4 nights Gulmarg resort",
      "1 night Pahalgam lodge",
      "Ski/snowboard equipment rental coordination (4 days)",
      "Guided group lesson coordination",
      "Gondola tickets as quoted",
      "Guided snowshoe trek in Pahalgam",
      "Private transfers and MAP meals",
    ],
    excludes: ["Flights", "Personal gear upgrades", "Lunch and tips", "Travel insurance"],
    faqs: faq("Late December to mid-March for best ski conditions."),
    days: [
      { dayNumber: 1, title: "Arrive houseboat", description: "Settle in Srinagar. Safety briefing." },
      { dayNumber: 2, title: "Transfer Gulmarg", description: "Gear fitting and first snow familiarization." },
      { dayNumber: 3, title: "Ski day 1", description: "Lessons and Phase I slopes." },
      { dayNumber: 4, title: "Ski day 2", description: "Progression day; Phase II if conditions allow." },
      { dayNumber: 5, title: "Ski day 3", description: "Guided skiing / free practice." },
      { dayNumber: 6, title: "Ski day 4", description: "Final Gulmarg slope day." },
      { dayNumber: 7, title: "Pahalgam snowshoe", description: "Transfer and guided snowshoe trek. Overnight Pahalgam." },
      { dayNumber: 8, title: "Departure", description: "Return toward Srinagar Airport." },
    ],
    coverPrompt: prompt("Gulmarg ski slopes", "skiers on powder under Apharwat peak"),
    galleryPrompts: [
      prompt("Gulmarg ski school", "beginner lesson on gentle slope"),
      prompt("Apharwat ridge", "wide snow bowl alpine view"),
      prompt("Pahalgam snowshoe", "pine trail with snowshoers distant"),
      prompt("Gulmarg resort evening", "lit chalet windows in snow"),
    ],
  },
  {
    slug: "winter-adventure-mini",
    title: "Winter Adventure Mini",
    category: "Adventure",
    destinationSlug: "gulmarg",
    destinationSlugs: ["srinagar", "gulmarg", "doodhpathri", "pahalgam"],
    summary:
      "4N/5D active winter mix — Gulmarg ski coordination, Doodhpathri snow trek, and Pahalgam Lidder night.",
    description:
      "<p>For couples and friends who want snow under their boots without a full ski week. Private heated SUV and winter-ready transfers included.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "moderate",
    maxGroupSize: 8,
    priceFrom: 22999,
    mapLat: "34.0484",
    mapLng: "74.3805",
    includes: [
      "1 night heated houseboat",
      "2 nights Gulmarg hotel",
      "1 night Pahalgam",
      "Doodhpathri snow trek with local guide",
      "Ski school coordination (fees to operator)",
      "Private winter vehicle",
    ],
    excludes: [...sharedExcludes, "Ski school fees paid directly"],
    faqs: faq("January–February for deepest snow on the Doodhpathri trek."),
    days: [
      { dayNumber: 1, title: "Srinagar arrival", description: "Old City walk optional, houseboat, Shikara." },
      { dayNumber: 2, title: "Gulmarg snow", description: "Ski school coordination and snow day. Overnight Gulmarg." },
      { dayNumber: 3, title: "Gulmarg day 2", description: "Second snow / Gondola day. Overnight Gulmarg." },
      { dayNumber: 4, title: "Doodhpathri trek · Pahalgam", description: "Guided snow trek then transfer to Pahalgam." },
      { dayNumber: 5, title: "Departure", description: "Airport via Srinagar." },
    ],
    coverPrompt: prompt("Doodhpathri winter", "snow meadow trek with pine forest"),
    galleryPrompts: [
      prompt("Gulmarg adventure", "snowmobile track across meadow"),
      prompt("Doodhpathri stream winter", "frozen banks valley of milk"),
      prompt("Pahalgam winter hotel", "riverside snow evening"),
      prompt("Srinagar old city winter", "wooden houses light snow"),
    ],
  },
  {
    slug: "winter-honeymoon-circuit",
    title: "Winter Honeymoon Valley Circuit",
    category: "Honeymoon",
    destinationSlug: "srinagar",
    destinationSlugs: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary:
      "5N/6D winter couples circuit — houseboat romance, Gulmarg snow, and soft Pahalgam nights.",
    description:
      "<p>The winter honeymoon SKU from ~₹17k on local operators: MAP meals, 3-star/houseboat mix, cable car, and snow play without aggressive adventure days.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 2,
    priceFrom: 16999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [
      ...sharedIncludes,
      "Honeymoon cake and flower decoration",
      "Candlelight dinner",
      "Heated rooms",
    ],
    excludes: sharedExcludes,
    faqs: faq("December–February. Carry thermal layers; Phase II Gondola is weather-gated."),
    days: [
      { dayNumber: 1, title: "Romantic houseboat", description: "Decorated stay, private Shikara, candlelight dinner." },
      { dayNumber: 2, title: "Gulmarg snow", description: "Cable car and snow play. Overnight Gulmarg or Srinagar." },
      { dayNumber: 3, title: "Second snow day", description: "Gulmarg reprise or Sonamarg snow day." },
      { dayNumber: 4, title: "Pahalgam", description: "Riverside hotel. Soft evening." },
      { dayNumber: 5, title: "Valleys · return", description: "Optional union valleys if open; return Srinagar." },
      { dayNumber: 6, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Kashmir winter honeymoon", "couple distant on Gulmarg snow under pines"),
    galleryPrompts: [
      prompt("houseboat winter romance", "kahwa tray by frosted lake window"),
      prompt("Gulmarg gondola snow", "white landscape from cabin"),
      prompt("Pahalgam snow riverside", "quiet Lidder in winter"),
      prompt("Srinagar Boulevard winter", "plane trees and light snow"),
    ],
  },
  {
    slug: "offbeat-meadows-doodhpathri-yusmarg",
    title: "Offbeat Meadows: Doodhpathri & Yusmarg",
    category: "Offbeat",
    destinationSlug: "srinagar",
    destinationSlugs: ["srinagar", "doodhpathri", "yusmarg", "manasbal", "sonamarg"],
    summary:
      "5N/6D for second-timers — Doodhpathri, Yusmarg, Manasbal, and Sonamarg day trips from Srinagar without Gulmarg crowds.",
    description:
      "<p>Quiet alpine meadows an hour from the city. Best April–October. Swap a day for Gulmarg if you still want the Gondola.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 10,
    priceFrom: 15810,
    mapLat: "33.8830",
    mapLng: "74.5730",
    includes: sharedIncludes,
    excludes: [...sharedExcludes, "Pony rides at Yusmarg / Sonamarg"],
    faqs: faq("April–October. Heavy snow can close upper Doodhpathri and Yusmarg roads in deep winter."),
    days: [
      { dayNumber: 1, title: "Dal Lake & gardens", description: "Arrive Srinagar. Nishat, Shalimar, evening Shikara." },
      { dayNumber: 2, title: "Doodhpathri", description: "Full day in the Valley of Milk along Shaliganga meadows." },
      { dayNumber: 3, title: "Yusmarg & Nilnag", description: "Pine meadows and optional walk toward Nilnag Lake." },
      { dayNumber: 4, title: "Manasbal & Wular view", description: "Manasbal Lake, optional Kheer Bhawani, Wular viewpoint." },
      { dayNumber: 5, title: "Sonamarg", description: "Golden meadow day with optional Thajiwas pony." },
      { dayNumber: 6, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Doodhpathri", "milky stream through open green meadow and pines"),
    galleryPrompts: [
      prompt("Yusmarg", "rolling meadow toward Doodh Ganga"),
      prompt("Manasbal Lake", "clear lake with lotus and hills"),
      prompt("Nilnag", "forest lake near Yusmarg"),
      prompt("Sonamarg meadow", "wide alpine grass with peaks"),
    ],
  },
  {
    slug: "south-kashmir-springs",
    title: "South Kashmir Springs & Waterfalls",
    category: "Offbeat",
    destinationSlug: "kokernag",
    destinationSlugs: ["srinagar", "pahalgam", "aharbal", "kokernag", "daksum", "verinag", "achabal"],
    summary:
      "7N/8D nature circuit — Aharbal waterfall, Kokernag springs, Daksum pines, Verinag and Achabal Mughal gardens.",
    description:
      "<p>The quieter south sold as Aharbal–Kokernag–Daksum explorer packages. A strong add-on after you have already done Gulmarg and Pahalgam, or a winter-capable alternative when Gurez is closed.</p>",
    durationDays: 8,
    durationNights: 7,
    durationLabel: "7 nights / 8 days",
    difficulty: "moderate",
    maxGroupSize: 10,
    priceFrom: 24999,
    mapLat: "33.5900",
    mapLng: "75.3000",
    includes: sharedIncludes,
    excludes: sharedExcludes,
    faqs: faq("May–October for full waterfall flow; winter variant keeps lower south Kashmir stops."),
    days: [
      { dayNumber: 1, title: "Arrive Srinagar", description: "Hotel / houseboat. Rest day." },
      { dayNumber: 2, title: "Toward Pahalgam", description: "Transfer south. Overnight Pahalgam." },
      { dayNumber: 3, title: "Aharbal", description: "Day at Aharbal waterfall and river gorge." },
      { dayNumber: 4, title: "Kokernag", description: "Springs, botanical gardens, trout farm area." },
      { dayNumber: 5, title: "Daksum", description: "Pine forests and Bringhi river landscapes." },
      { dayNumber: 6, title: "Verinag & Achabal", description: "Mughal spring source and garden stops." },
      { dayNumber: 7, title: "Return Srinagar", description: "Buffer night for shopping and lake time." },
      { dayNumber: 8, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Aharbal waterfall", "powerful cascade through rocky gorge Kashmir"),
    galleryPrompts: [
      prompt("Kokernag gardens", "terraced spring gardens"),
      prompt("Daksum forest", "dense pine road Bringhi valley"),
      prompt("Verinag spring", "octagonal Mughal spring pool"),
      prompt("Achabal garden", "Mughal charbagh with chinars"),
    ],
  },
  {
    slug: "gurez-valley-discovery",
    title: "Gurez Valley Discovery",
    category: "Offbeat",
    destinationSlug: "gurez",
    destinationSlugs: ["srinagar", "gurez", "wular-lake"],
    summary:
      "6N/7D frontier valley over Razdan Pass — Dawar homestays, Habba Khatoon peak, and Tulail as permitted.",
    description:
      "<p>Open roughly late May to October. Checkpoint registration handled; carry government photo ID. Homestays and huts replace resort hotels once you cross the pass.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "moderate",
    maxGroupSize: 8,
    priceFrom: 23999,
    isFeatured: true,
    mapLat: "34.6333",
    mapLng: "74.8500",
    includes: [
      "Houseboat / Srinagar hotel nights",
      "Gurez homestay nights",
      "All meals on MAP or full-board in Gurez as quoted",
      "4×4 / Innova suited to mountain roads",
      "Checkpoint documentation support",
      "Shikara in Srinagar",
    ],
    excludes: ["Flights", "Personal trekking gear", "Tips", "Travel insurance"],
    faqs: faq(
      "Late May–October only. Razdan Pass usually closes with heavy snow around November.",
      "Gurez requires ID at checkpoints. Tulail access follows local permission.",
    ),
    days: [
      { dayNumber: 1, title: "Srinagar houseboat", description: "Arrive and rest before the long mountain drive." },
      {
        dayNumber: 2,
        title: "Razdan Pass to Gurez",
        description:
          "Early start via Bandipora and Razdan Pass (about 6–8 hours with stops).\nCheck in at a Dawar homestay beside the Kishanganga.",
      },
      {
        dayNumber: 3,
        title: "Gurez & Tulail",
        description:
          "Habba Khatoon peak views, Dawar wooden hamlets, and Tulail Valley as far as permitted.\nOvernight Gurez.",
      },
      { dayNumber: 4, title: "Kishanganga day", description: "Riverside walks and village time. Overnight Gurez." },
      { dayNumber: 5, title: "Return Srinagar", description: "Descend the pass. Overnight Srinagar." },
      { dayNumber: 6, title: "Srinagar leisure", description: "Gardens or lake time after the frontier days." },
      { dayNumber: 7, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Gurez Valley", "Kishanganga turquoise river and Habba Khatoon peak"),
    galleryPrompts: [
      prompt("Razdan Pass", "high mountain road with dramatic drop"),
      prompt("Dawar Gurez", "wooden village houses alpine valley"),
      prompt("Tulail Valley", "remote meadow toward border mountains"),
      prompt("Wular Lake", "vast lake toward Bandipora hills"),
    ],
  },
  {
    slug: "offbeat-north-gurez-lolab",
    title: "Offbeat North: Gurez · Lolab · Wular",
    category: "Offbeat",
    destinationSlug: "gurez",
    destinationSlugs: ["gurez", "lolab", "wular-lake", "doodhpathri", "kokernag", "srinagar"],
    summary:
      "7N/8D second-visit circuit — 2N Gurez, Lolab orchards, Wular, Doodhpathri, and south springs.",
    description:
      "<p>Pack The Bag–style offbeat north. Outside Gurez season we run the quiet south plan with Doodhpathri, Yusmarg, and Mughal springs instead of Razdan Pass.</p>",
    durationDays: 8,
    durationNights: 7,
    durationLabel: "7 nights / 8 days",
    difficulty: "moderate",
    maxGroupSize: 8,
    priceFrom: 28999,
    mapLat: "34.6333",
    mapLng: "74.8500",
    includes: [
      "7 nights mix of houseboat, homestays, and hotels",
      "Private SUV with mountain-road driver",
      "Breakfast and dinner daily",
      "Checkpoint support for Gurez",
    ],
    excludes: ["Flights", "Lunches", "Ponies", "Travel insurance"],
    faqs: faq("June–October for Gurez/Lolab; Nov–May south-meadows substitute itinerary."),
    days: [
      { dayNumber: 1, title: "Srinagar / houseboat", description: "Arrive and brief for checkpoint documents." },
      { dayNumber: 2, title: "Into Gurez", description: "Razdan Pass crossing. Overnight Gurez." },
      { dayNumber: 3, title: "Gurez explore", description: "Dawar and Tulail. Overnight Gurez." },
      { dayNumber: 4, title: "Lolab orchards", description: "Descend toward Lolab Valley overnight." },
      { dayNumber: 5, title: "Wular · Srinagar", description: "Wular / Manasbal views then Srinagar." },
      { dayNumber: 6, title: "Doodhpathri", description: "Meadow day trip." },
      { dayNumber: 7, title: "Kokernag / Verinag", description: "South springs day." },
      { dayNumber: 8, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Lolab Valley", "walnut orchards and quiet village meadows Kupwara"),
    galleryPrompts: [
      prompt("Gurez Kishanganga", "riverbend with green fields"),
      prompt("Wular Lake evening", "wide water under monsoon clouds"),
      prompt("Doodhpathri summer", "open pasture and stream"),
      prompt("Kokernag spring", "clear water gardens"),
    ],
  },
  {
    slug: "hidden-valleys-gurez-bangus",
    title: "Hidden Valleys: Gurez · Bangus · Doodhpathri",
    category: "Adventure",
    destinationSlug: "gurez",
    destinationSlugs: ["gurez", "bangus", "doodhpathri", "srinagar"],
    summary:
      "6N/7D off-grid — Gurez, Bangus meadows in Kupwara, then Doodhpathri. Late May–October only.",
    description:
      "<p>Long drive days and homestay nights. Bangus sees a fraction of Gulmarg traffic — bring layers, cash, and flexible expectations on eco-stays.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "challenging",
    maxGroupSize: 6,
    priceFrom: 25999,
    mapLat: "34.5500",
    mapLng: "74.3000",
    includes: [
      "Houseboat, verified homestays, and Srinagar hotel",
      "Daily breakfast and traditional dinner",
      "Innova / Scorpio / 4×4",
      "Sunset Shikara",
      "Gurez checkpoint support",
    ],
    excludes: ["Flights", "Camping upgrades", "Tips", "Travel insurance"],
    faqs: faq("Late May–October. Do not plan Bangus or Gurez in deep winter."),
    days: [
      { dayNumber: 1, title: "Srinagar", description: "Arrive and rest." },
      { dayNumber: 2, title: "Drive to Gurez", description: "6–8 hour mountain transfer to Dawar." },
      { dayNumber: 3, title: "Gurez & Tulail", description: "Full sightseeing day in Gurez." },
      { dayNumber: 4, title: "Gurez to Bangus", description: "Long drive to Bangus meadows / eco-stay." },
      { dayNumber: 5, title: "Bangus to Doodhpathri", description: "Meadow transfer and overnight countryside." },
      { dayNumber: 6, title: "Return Srinagar", description: "Morning meadow walk then city gardens." },
      { dayNumber: 7, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Bangus Valley", "twin highland meadows ringed by deodar forest"),
    galleryPrompts: [
      prompt("Gurez frontier", "dramatic valley toward Habba Khatoon"),
      prompt("Bangus camping", "tent on green highland"),
      prompt("Doodhpathri evening", "golden light on milk-white stream"),
      prompt("Kupwara forest road", "deodar corridor mountain track"),
    ],
  },
  {
    slug: "deep-gurez-immersion",
    title: "Deep Gurez Immersion",
    category: "Offbeat",
    destinationSlug: "gurez",
    destinationSlugs: ["gurez", "sonamarg", "srinagar"],
    summary:
      "8N/9D slow explorer — five nights in Gurez and Tulail to know the Dard-Shina villages, then Sonamarg exit.",
    description:
      "<p>Enough time to stop treating Gurez as a checkbox. Riverside days, Habba Khatoon viewpoints, and village stays before a Sonamarg / Thajiwas finish.</p>",
    durationDays: 9,
    durationNights: 8,
    durationLabel: "8 nights / 9 days",
    difficulty: "moderate",
    maxGroupSize: 6,
    priceFrom: 34999,
    mapLat: "34.6333",
    mapLng: "74.8500",
    includes: [
      "5 nights Gurez / Tulail homestays",
      "Srinagar and Sonamarg nights as itinerary",
      "Private mountain vehicle",
      "Most meals included",
      "Permit / checkpoint handling",
    ],
    excludes: ["Flights", "Personal expenses", "Travel insurance"],
    faqs: faq("June–September for the most reliable Razdan Pass weather."),
    days: [
      { dayNumber: 1, title: "Srinagar", description: "Arrive and document check." },
      { dayNumber: 2, title: "Enter Gurez", description: "Razdan Pass to Dawar. Night 1 of 5." },
      { dayNumber: 3, title: "Habba Khatoon", description: "Peak viewpoints and Dawar walks." },
      { dayNumber: 4, title: "Tulail deep", description: "Dard-Shina villages as permitted." },
      { dayNumber: 5, title: "Kishanganga slow day", description: "Riverside leisure and photography." },
      { dayNumber: 6, title: "Gurez free day", description: "Flexible local explorations." },
      { dayNumber: 7, title: "Exit via Sonamarg", description: "Toward Sonamarg / Thajiwas overnight or long day." },
      { dayNumber: 8, title: "Srinagar buffer", description: "Lake and crafts day." },
      { dayNumber: 9, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Gurez Tulail", "remote Himalayan village meadows at sunrise"),
    galleryPrompts: [
      prompt("Habba Khatoon peak", "pyramid mountain above Gurez"),
      prompt("Kishanganga morning", "fishermen distant turquoise water"),
      prompt("Gurez homestay", "wooden interior mountain hospitality"),
      prompt("Sonamarg Thajiwas", "glacier approach after Gurez exit"),
    ],
  },
  {
    slug: "grand-kashmir-circuit",
    title: "Grand Kashmir Circuit",
    category: "Leisure",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam", "sonamarg", "gurez"],
    summary:
      "11N/12D complete valley — classic SGP + Sonamarg plus remote Gurez for a long holiday.",
    description:
      "<p>The comprehensive circuit combining postcard Kashmir with the frontier. Best for travellers who want one trip to cover icons and offbeat north (summer only for Gurez legs).</p>",
    durationDays: 12,
    durationNights: 11,
    durationLabel: "11 nights / 12 days",
    difficulty: "moderate",
    maxGroupSize: 10,
    priceFrom: 53999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: sharedIncludes.concat(["Gurez homestay block", "Checkpoint support"]),
    excludes: sharedExcludes,
    faqs: faq("June–September to include Gurez; otherwise we extend south meadows instead."),
    days: [
      { dayNumber: 1, title: "Srinagar houseboat", description: "Arrive and Shikara." },
      { dayNumber: 2, title: "Srinagar gardens", description: "Full city and garden day." },
      { dayNumber: 3, title: "Srinagar buffer", description: "Crafts, Old City, or leisure." },
      { dayNumber: 4, title: "Gulmarg night 1", description: "Gondola and meadows." },
      { dayNumber: 5, title: "Gulmarg night 2", description: "Leisure / second Gondola." },
      { dayNumber: 6, title: "Pahalgam night 1", description: "Transfer via Pampore." },
      { dayNumber: 7, title: "Pahalgam valleys", description: "Aru, Betaab, optional Chandanwari." },
      { dayNumber: 8, title: "Sonamarg", description: "Thajiwas / Zero Point day or overnight." },
      { dayNumber: 9, title: "Toward Gurez", description: "Razdan Pass to Dawar." },
      { dayNumber: 10, title: "Gurez explore", description: "Habba Khatoon and Tulail." },
      { dayNumber: 11, title: "Return Srinagar", description: "Descend and rest." },
      { dayNumber: 12, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Kashmir grand panorama", "valley lakes meadows and distant Himalayan wall"),
    galleryPrompts: [
      prompt("Gulmarg summer", "flower meadow gondola"),
      prompt("Pahalgam Betaab", "classic valley postcard"),
      prompt("Sonamarg", "glacier meadow"),
      prompt("Gurez", "frontier river valley"),
    ],
  },
  {
    slug: "amarnath-yatra-group",
    title: "Amarnath Yatra Group Tour",
    category: "Religious",
    destinationSlug: "pahalgam",
    destinationSlugs: ["pahalgam", "chandanwari", "srinagar"],
    summary:
      "Seasonal 5N/6D pilgrimage via Pahalgam or Baltal with registration support and base-camp nights.",
    description:
      "<p>Group-departure style Amarnath package. Helicopter slots, pony, and trek arrangements depend on the year’s Yatra board rules. Medical certificate and registration are mandatory.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "challenging",
    maxGroupSize: 20,
    priceFrom: 30999,
    mapLat: "34.0985",
    mapLng: "75.4168",
    includes: [
      "Base nights near Pahalgam or Baltal as allotted",
      "Srinagar staging hotel",
      "Registration guidance",
      "Group transfers as per Yatra plan",
      "Breakfast and dinner on hotel nights",
    ],
    excludes: [
      "Helicopter tickets (if chosen)",
      "Pony / palki / porter",
      "Yatra registration fees",
      "Personal medicines and gear",
      "Flights",
    ],
    faqs: faq(
      "Typically July–August during the official Amarnath Yatra window.",
      "Registration, medical fitness, and daily Yatra board advisories apply. Helicopter is optional and waitlisted.",
    ),
    days: [
      { dayNumber: 1, title: "Arrive staging", description: "Srinagar or Jammu staging hotel. Document check." },
      { dayNumber: 2, title: "Base camp transfer", description: "Move to Pahalgam or Baltal camp." },
      { dayNumber: 3, title: "Yatra day", description: "Trek or helicopter toward the Holy Cave as booked." },
      { dayNumber: 4, title: "Darshan / return", description: "Complete darshan and descend to base." },
      { dayNumber: 5, title: "Return Srinagar", description: "Rest day after the Yatra." },
      { dayNumber: 6, title: "Departure", description: "Airport or onward transfer." },
    ],
    coverPrompt: prompt("Amarnath Yatra path", "snowy mountain pilgrimage trail at dawn pilgrims distant"),
    galleryPrompts: [
      prompt("Chandanwari", "Amarnath base landscape Lidder"),
      prompt("Kashmir glacier path", "ice and rock holy cave approach"),
      prompt("Pahalgam base", "tented pilgrimage staging"),
      prompt("Sheshnag landscape", "alpine lake on Yatra route"),
    ],
  },
  {
    slug: "kashmir-vaishno-devi",
    title: "Kashmir + Vaishno Devi",
    category: "Religious",
    destinationSlug: "kashmir",
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary:
      "9N/10D Thomas Cook–style combo — Mata Vaishno Devi darshan at Katra plus the classic Kashmir valley circuit.",
    description:
      "<p>Family pilgrimage and leisure in one booking. Katra nights for darshan (heli optional), then fly or drive into Srinagar for Gulmarg, Pahalgam, and Sonamarg.</p>",
    durationDays: 10,
    durationNights: 9,
    durationLabel: "9 nights / 10 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 55999,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: [
      "Katra hotel nights for Vaishno Devi",
      "Kashmir hotels / houseboat as itinerary",
      "MAP meals on most nights",
      "Private transfers within each sector",
      "Shikara in Srinagar",
    ],
    excludes: [
      "Flights between sectors unless quoted",
      "Vaishno Devi helicopter tickets",
      "Gondola and Pahalgam union cabs",
      "Personal expenses",
    ],
    faqs: faq("Year-round for Vaishno Devi; pair with Kashmir spring, summer, or snow season as preferred."),
    days: [
      { dayNumber: 1, title: "Arrive Katra", description: "Hotel check-in and rest." },
      { dayNumber: 2, title: "Vaishno Devi darshan", description: "Track walk or battery / heli options as booked." },
      { dayNumber: 3, title: "Katra buffer", description: "Second darshan attempt or leisure." },
      { dayNumber: 4, title: "To Srinagar", description: "Fly or drive to Srinagar. Houseboat / hotel." },
      { dayNumber: 5, title: "Srinagar sightseeing", description: "Gardens and Shikara." },
      { dayNumber: 6, title: "Gulmarg", description: "Gondola day or overnight." },
      { dayNumber: 7, title: "Pahalgam", description: "Lidder valleys." },
      { dayNumber: 8, title: "Sonamarg", description: "Golden meadow day trip." },
      { dayNumber: 9, title: "Srinagar leisure", description: "Shopping and crafts." },
      { dayNumber: 10, title: "Departure", description: "Srinagar Airport transfer." },
    ],
    coverPrompt: prompt("Vaishno Devi track", "Trikuta hills pilgrimage path at sunrise"),
    galleryPrompts: [
      prompt("Katra town evening", "lights against Trikuta hills"),
      prompt("Dal Lake", "shikara after pilgrimage leg"),
      prompt("Gulmarg", "meadow family visit"),
      prompt("Pahalgam", "river valley after Katra"),
    ],
  },
  {
    slug: "classic-doodhpathri-yusmarg-addon",
    title: "Classic + Doodhpathri & Yusmarg",
    category: "Leisure",
    destinationSlug: "kashmir",
    destinationSlugs: [
      "kashmir",
      "srinagar",
      "gulmarg",
      "pahalgam",
      "doodhpathri",
      "sonamarg",
      "yusmarg",
    ],
    summary:
      "7–9 day longer leisure — full SGP overnights then Doodhpathri, Sonamarg, and Yusmarg meadow days.",
    description:
      "<p>NatureWings-style extended classic. After Gulmarg and Pahalgam you return to a Srinagar houseboat and fan out to the quieter meadows most 6-day packages skip.</p>",
    durationDays: 9,
    durationNights: 8,
    durationLabel: "8 nights / 9 days",
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 28999,
    isFeatured: true,
    mapLat: "34.0837",
    mapLng: "74.7973",
    includes: sharedIncludes,
    excludes: sharedExcludes,
    faqs: faq("May–October for all meadow days open; winter keeps SGP and swaps high meadows as needed."),
    days: [
      { dayNumber: 1, title: "Houseboat Srinagar", description: "Arrive, gardens optional, Shikara." },
      { dayNumber: 2, title: "Gulmarg overnight", description: "Gondola and meadows." },
      { dayNumber: 3, title: "Gulmarg to Pahalgam", description: "Transfer and riverside evening." },
      { dayNumber: 4, title: "Pahalgam valleys", description: "Betaab, Aru, optional Chandanwari." },
      { dayNumber: 5, title: "Return houseboat", description: "Back to Srinagar Dal Lake stay." },
      { dayNumber: 6, title: "Doodhpathri day", description: "Valley of Milk excursion." },
      { dayNumber: 7, title: "Sonamarg day", description: "Thajiwas / Zero Point optional." },
      { dayNumber: 8, title: "Yusmarg day", description: "Quiet pines and Nilnag walk." },
      { dayNumber: 9, title: "Departure", description: "Airport transfer." },
    ],
    coverPrompt: prompt("Yusmarg Kashmir", "quiet pine meadow resembling a quieter Gulmarg"),
    galleryPrompts: [
      prompt("Doodhpathri", "stream and wide pasture"),
      prompt("Gulmarg overnight", "evening meadow resort"),
      prompt("Pahalgam Aru", "village meadow trail"),
      prompt("Sonamarg", "Zero Point snow patch summer"),
    ],
  },
];

/** Shape expected by demo catalog + gallery prompt tooling. */
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

export const demoTours: DemoTour[] = kashmirTours.map((tour) => ({
  slug: tour.slug,
  title: tour.title,
  category: tour.category,
  destinationSlug: tour.destinationSlug,
  summary: tour.summary,
  description: tour.description,
  durationDays: tour.durationDays,
  difficulty: tour.difficulty,
  maxGroupSize: tour.maxGroupSize,
  priceFrom: tour.priceFrom,
  isFeatured: tour.isFeatured,
  coverPrompt: tour.coverPrompt,
  galleryPrompts: [tour.galleryPrompts[0], tour.galleryPrompts[1]],
}));
