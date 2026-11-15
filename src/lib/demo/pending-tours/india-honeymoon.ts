/**
 * Pending locked-format India honeymoon tours (no images yet).
 * Kerala Backwaters Honeymoon is seeded separately — not included here.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

const NO_IMAGES: TourFormat["images"] = {
  banner: null,
  cover: null,
  gallery: [],
  seoImage: null,
};

const BASE_INCLUDE = [
  "Accommodation as per itinerary (twin sharing)",
  "Breakfast + dinner at hotels (MAP)",
  "Private vehicle for transfers & sightseeing",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Meet-and-greet at arrival point",
  "King / double bed on request for couples",
] as const;

const BASE_EXCLUDE = [
  "Flights / trains to starting point",
  "Lunch (unless listed)",
  "Honeymoon décor, spa, or activity add-ons unless quoted",
  "Tips & personal expenses",
  "Travel insurance",
  "Anything not mentioned in includes",
] as const;

const BASE_BEFORE = [
  "Couples pacing",
  "Fitness",
  "Documents",
  "Weather & kit",
  "Arrival",
  "Rooms",
  "Money on the road",
] as const;

const BASE_STYLES = ["Romantic", "Private / Independent", "Family Friendly"] as const;

const BASE_FACILITIES = [
  "Private cab",
  "Airport transfers",
  "MAP meals (B/D)",
  "Optional honeymoon room décor",
  "24×7 helpline",
] as const;

const SHARED_FAQ = [
  "Can we request flower bed or cake on arrival?",
  "Is this a private or group tour?",
  "Are flights included?",
  "Is a candlelit dinner included?",
] as const;

function details(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
  pickupInclude = "Airport / railway pickup & drop as quoted",
): TourFormat["details"] {
  return {
    sharedFaqTitles: [...SHARED_FAQ],
    extraFaqs,
    includeTitles: [...BASE_INCLUDE, pickupInclude, ...includeExtras],
    excludeTitles: [...BASE_EXCLUDE, ...excludeExtras],
    beforeYouGoTitles: [...BASE_BEFORE],
    travelStyleTitles: [...BASE_STYLES],
    facilityTitles: [...BASE_FACILITIES],
  };
}

export const indiaHoneymoonCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Honeymoon" },
  { kind: "style", title: "Romantic" },
  {
    kind: "faq",
    title: "Can we request flower bed or cake on arrival?",
    content:
      "Honeymoon décor (flowers, cake, fruit basket) can be pre-ordered at extra cost — tell us in the request and we confirm rates with the hotel before you pay.",
  },
  {
    kind: "faq",
    title: "Is this a private or group tour?",
    content:
      "Every departure is private for your party only — one cab, your dates, couples pacing. We do not merge honeymoons into shared coaches.",
  },
  {
    kind: "faq",
    title: "Are flights included?",
    content:
      "Flights and trains are quoted separately unless explicitly listed in includes. We align airport pickup with your PNR and share driver contact before you land.",
  },
  {
    kind: "faq",
    title: "Is a candlelit dinner included?",
    content:
      "Where the itinerary lists a candlelit dinner, it is arranged at the hotel or a partner restaurant for your table only. Premium venues or live music are optional upgrades.",
  },
  {
    kind: "before_you_go",
    title: "Couples pacing",
    content:
      "Honeymoon days should breathe — keep arrival light, stash one afternoon purely for pool or spa time, and book flights that land before sunset when possible.",
  },
  {
    kind: "facility",
    title: "Optional honeymoon room décor",
  },
  {
    kind: "include",
    title: "King / double bed on request for couples",
  },
  {
    kind: "include",
    title: "Candlelit dinner arrangement (where listed)",
  },
];

const andamanIslandHoneymoon: TourFormat = {
  slug: "andaman-island-honeymoon",
  general: {
    title: "Andaman Island Honeymoon",
    summary:
      "Turquoise shallows and quiet beaches — Port Blair, Havelock, and Radhanagar at honeymoon pace. Private cab and ferry slots, twin share, from ₹36,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 7,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["andaman", "havelock"],
    primaryDestinationSlug: "andaman",
    address: "Veer Savarkar International Airport (IXZ), Port Blair pickup",
    mapLat: "11.6234",
    mapLng: "92.7265",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Port Blair · Cellular Jail evening",
        morning:
          "Meet your driver at Port Blair airport. Check in at a sea-view hotel and rest after the flight.",
        afternoon:
          "Easy walk on Corbyn's Cove if tides allow. Collect ferry vouchers for Havelock.",
        evening:
          "Light and sound or quiet visit at Cellular Jail (tickets extra). Couples dinner at hotel; overnight Port Blair.",
      },
      {
        dayNumber: 2,
        title: "Ferry to Havelock · beach intro",
        morning:
          "Government or private ferry to Havelock (timing confirmed before payment). Check in at a beach resort.",
        afternoon:
          "First swim at Vijay Nagar or beach in front of your resort — no rushed sightseeing.",
        evening: "Sunset on the sand. Overnight Havelock.",
      },
      {
        dayNumber: 3,
        title: "Radhanagar Beach · Asia's best sunset",
        morning:
          "Late breakfast. Optional snorkel intro at Elephant Beach by boat (paid locally) when sea is calm.",
        afternoon:
          "Drive to Radhanagar (Beach No. 7) for turquoise water and shade under mahua trees.",
        evening:
          "Candlelit dinner arrangement at the resort. Overnight Havelock.",
      },
      {
        dayNumber: 4,
        title: "Slow Havelock · together time",
        morning: "Sleep in or beach yoga on your own schedule.",
        afternoon:
          "Kayak or glass-bottom boat optional. Pool and spa time at the resort.",
        evening: "Second night Havelock with stargazing on the beach.",
      },
      {
        dayNumber: 5,
        title: "Return Port Blair · Chidiyatapu optional",
        morning: "Ferry back to Port Blair. Check in.",
        afternoon:
          "Optional drive to Chidiyatapu sunset point or Samudrika Museum at easy pace.",
        evening: "Farewell dinner; overnight Port Blair.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        morning: "Breakfast. Transfer to airport for onward flight. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Andaman for couples:</strong> Radhanagar's long arc of sand and Havelock's low-key resorts feel far from mainland rush — perfect for your first week as newlyweds.</p>",
      "<p><strong>Stays (5 nights):</strong> 2N Port Blair · 3N Havelock beach resort (MAP). Ferry class confirmed in writing.</p>",
      "<p><strong>Note:</strong> flights to Port Blair are excluded; we sync ferry days with your inbound flight.</p>",
      "<p><strong>Book:</strong> share travel dates at least seven days ahead; we hold ferry seats and room category before payment.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 36999,
    currency: "INR",
    discounts: [{ name: "Off-season (May–Aug)", type: "percent", value: 10 }],
  },
  details: details(
    [
      {
        title: "Are ferry tickets included?",
        content:
          "Yes — standard ferry Port Blair–Havelock–Port Blair for two adults is included. Premium cruise upgrades are optional.",
      },
    ],
    ["Inter-island ferry (standard class)", "Candlelit dinner on Havelock (Day 3)"],
    ["Port Blair–mainland flights", "Elephant Beach boat & snorkel gear", "Cellular Jail entry"],
    "Airport pickup & drop at IXZ",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Andaman Island Honeymoon | 5N/6D Havelock & Radhanagar",
    seoDescription:
      "Andaman honeymoon — Port Blair, Havelock, Radhanagar sunsets, ferry included, from ₹36,999 pp.",
    facebookTitle: "Andaman Honeymoon — Havelock beaches",
    facebookDescription: "Radhanagar sunsets and unhurried island days for two.",
    twitterTitle: "Andaman Honeymoon | 5N/6D",
    twitterDescription: "Port Blair · Havelock · Radhanagar. From ₹36,999 pp.",
    published: true,
  },
};

const goaBeachHoneymoon: TourFormat = {
  slug: "goa-beach-honeymoon",
  general: {
    title: "Goa Beach Honeymoon",
    summary:
      "Sunset sails and sand between palms — four nights in South Goa with heritage and spice morning. Private cab, twin share, from ₹19,499 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 3,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["goa"],
    primaryDestinationSlug: "goa",
    address: "Goa Airport (GOI) or Mopa (GOX) pickup",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · South Goa check-in",
        morning: "Pickup at Dabolim or Mopa. Transfer to a South Goa beach resort.",
        afternoon: "Pool and first walk to Palolem or Agonda — your pick within drive range.",
        evening: "Beach shack dinner or hotel MAP meal. Overnight South Goa.",
      },
      {
        dayNumber: 2,
        title: "Beach day · no agenda",
        morning: "Sleep late; swim when lifeguards flag the zone green.",
        afternoon: "Couples kayak or dolphin watch cruise optional (paid locally).",
        evening: "Sunset from the shack. Overnight South Goa.",
      },
      {
        dayNumber: 3,
        title: "Old Goa · spice plantation",
        morning:
          "Drive north early — Basilica of Bom Jesus and Sé Cathedral before crowds.",
        afternoon: "Ponda spice plantation walk and lunch on tour.",
        evening: "Return south for quiet evening. Overnight South Goa.",
      },
      {
        dayNumber: 4,
        title: "Romantic extras · your pace",
        morning: "Breakfast in bed optional (hotel permitting).",
        afternoon: "Couples massage or sailing slot on request (extra).",
        evening: "Candlelit dinner arrangement. Overnight South Goa.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning: "Breakfast. Transfer to airport. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why South Goa:</strong> Quieter sands than the north party strip — you get palm shade, long sunsets, and still one cultured morning in Old Goa.</p>",
      "<p><strong>Stays:</strong> 4N South Goa beach resort, MAP. King bed on request.</p>",
      "<p><strong>Includes:</strong> spice plantation visit with lunch, one candlelit dinner, private Innova or sedan.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 19499,
    currency: "INR",
    discounts: [{ name: "Weekday check-in", type: "percent", value: 5 }],
  },
  details: details(
    [
      {
        title: "North or South Goa?",
        content: "This honeymoon bases South Goa. North Goa party nights can be quoted as a swap.",
      },
    ],
    ["Spice plantation entry & lunch (Day 3)", "Candlelit dinner (Day 4)"],
    ["Water sports & sunset cruise tickets"],
    "Airport pickup & drop at GOI / GOX",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Goa Beach Honeymoon | 4N/5D South Goa",
    seoDescription: "Goa honeymoon — South Goa beaches, Old Goa, spice lunch, from ₹19,499 pp.",
    facebookTitle: "Goa Beach Honeymoon — South Goa sands",
    facebookDescription: "Palolem pace with heritage morning and candlelit dinner.",
    twitterTitle: "Goa Honeymoon | 4N/5D",
    twitterDescription: "South Goa · Old Goa · spice. From ₹19,499 pp.",
    published: true,
  },
};

const udaipurRomanticPalaceHoneymoon: TourFormat = {
  slug: "udaipur-romantic-palace-honeymoon",
  general: {
    title: "Udaipur Romantic Palace Honeymoon",
    summary:
      "Lake Pichola sunsets and palace corridors — three nights in the City of Lakes with boat and heritage dining. Private cab, twin share, from ₹21,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 4,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["udaipur"],
    primaryDestinationSlug: "udaipur",
    address: "Maharana Pratap Airport (UDR) pickup",
    mapLat: "24.5854",
    mapLng: "73.7125",
    mapZoom: 12,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · lake-view evening",
        morning: "Airport pickup. Check in at a haveli or lake-view hotel.",
        afternoon: "Rest and freshen up. Stroll Lal Ghat or Gangaur Ghat.",
        evening: "Sunset boat on Lake Pichola (shared boat, reserved seats). Dinner at hotel.",
      },
      {
        dayNumber: 2,
        title: "City Palace · old city",
        morning: "City Palace museum and courtyards at opening hour.",
        afternoon: "Jagdish Temple lane and boutique shopping for textiles.",
        evening: "Candlelit rooftop dinner (as quoted). Overnight Udaipur.",
      },
      {
        dayNumber: 3,
        title: "Saheliyon-ki-Bari · Monsoon Palace",
        morning: "Saheliyon-ki-Bari gardens and Fateh Sagar lakeside drive.",
        afternoon: "Optional Monsoon Palace (Sajjangarh) for Aravalli views.",
        evening: "Second lake evening — café time or hotel spa. Overnight Udaipur.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast. Optional morning boat photo stop. Airport transfer.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Palace romance:</strong> Udaipur frames honeymoon photos naturally — white marble, lake reflections, and rooftop dinners without rushing forts.</p>",
      "<p><strong>Stays:</strong> 3N heritage-style MAP hotel near the old city.</p>",
      "<p><strong>Includes:</strong> Lake Pichola boat, City Palace entry coordination, one candlelit dinner.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 21999,
    currency: "INR",
    discounts: [{ name: "Monsoon (Jul–Sep)", type: "percent", value: 8 }],
  },
  details: details(
    [
      {
        title: "Is the boat private?",
        content: "Sunset ride is a reserved segment on a regular lake boat — private charter available at extra cost.",
      },
    ],
    ["Lake Pichola sunset boat (Day 1)", "City Palace entry", "Candlelit rooftop dinner (Day 2)"],
    ["Monsoon Palace vehicle & entry", "Spa treatments"],
    "Airport pickup & drop at UDR",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Udaipur Romantic Palace Honeymoon | 3N/4D",
    seoDescription: "Udaipur honeymoon — City Palace, Lake Pichola boat, candlelit dinner from ₹21,999 pp.",
    facebookTitle: "Udaipur Honeymoon — lakes & palaces",
    facebookDescription: "Three nights in the City of Lakes for newlyweds.",
    twitterTitle: "Udaipur Honeymoon | 3N/4D",
    twitterDescription: "Pichola sunset · City Palace. From ₹21,999 pp.",
    published: true,
  },
};

const manaliHoneymoonEscape: TourFormat = {
  slug: "manali-honeymoon-escape",
  general: {
    title: "Manali Honeymoon Escape",
    summary:
      "Pine air and riverside cafés — four nights in Manali with Solang and Old Manali at easy altitude. Private cab, twin share, from ₹16,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["manali", "himachal"],
    primaryDestinationSlug: "manali",
    address: "Kullu–Manali Airport (KUU) or Chandigarh pickup",
    mapLat: "32.2432",
    mapLng: "77.1892",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Manali · Mall Road evening",
        morning:
          "Pickup at Bhuntar airport or Chandigarh (long drive quoted separately). Check in near Mall Road or Old Manali.",
        afternoon: "Rest for acclimatisation — short walk only.",
        evening: "Couples dinner at a riverside café. Overnight Manali.",
      },
      {
        dayNumber: 2,
        title: "Solang Valley · meadows",
        morning: "Drive to Solang for meadow views. Cable car optional (tickets extra).",
        afternoon: "Return for hotel downtime — hot chocolate and mountain views.",
        evening: "MAP dinner at hotel. Overnight Manali.",
      },
      {
        dayNumber: 3,
        title: "Old Manali · Hadimba",
        morning: "Hadimba Devi Temple in deodar grove. Photo walk in Old Manali lanes.",
        afternoon: "Vashisht hot springs dip (separate pools).",
        evening: "Candlelit dinner arrangement. Overnight Manali.",
      },
      {
        dayNumber: 4,
        title: "Naggar · castle and art",
        morning: "Scenic drive to Naggar Castle and Roerich art gallery.",
        afternoon: "Free afternoon — no packed sightseeing.",
        evening: "Last night Manali.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning: "Breakfast. Transfer to Bhuntar or Chandigarh. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Hill honeymoon without trek fatigue:</strong> Manali sits at a comfortable altitude — Solang and Vashisht fill two days; the rest is café time and castle views.</p>",
      "<p><strong>Stays:</strong> 4N MAP resort or boutique hotel. Snow dates need chain or 4×4 — we advise when you request winter.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 16999,
    currency: "INR",
    discounts: [{ name: "Off-season (Jan–Mar)", type: "percent", value: 7 }],
  },
  details: details(
    [
      {
        title: "Is Chandigarh pickup included?",
        content: "Bhuntar (KUU) transfers are included. Chandigarh start adds drive cost — we quote it in writing.",
      },
    ],
    ["Candlelit dinner (Day 3)"],
    ["Solang ropeway", "Adventure sports at Solang"],
    "Airport pickup & drop at KUU (or Chandigarh if quoted)",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Manali Honeymoon Escape | 4N/5D Solang & Old Manali",
    seoDescription: "Manali honeymoon — Solang, Vashisht, Old Manali, from ₹16,999 pp twin share.",
    facebookTitle: "Manali Honeymoon — riverside & Solang",
    facebookDescription: "Four nights in Himachal for couples.",
    twitterTitle: "Manali Honeymoon | 4N/5D",
    twitterDescription: "Solang · Old Manali. From ₹16,999 pp.",
    published: true,
  },
};

const shimlaManaliHoneymoon: TourFormat = {
  slug: "shimla-manali-honeymoon",
  general: {
    title: "Shimla–Manali Honeymoon",
    summary:
      "Colonial mall to apple-country Manali — six nights across Himachal's classic hill arc. Private cab, twin share, from ₹24,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 7,
    durationNights: 6,
    durationUnit: "days",
    durationLabel: "6 nights / 7 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 5,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["shimla", "manali", "himachal"],
    primaryDestinationSlug: "himachal",
    address: "Chandigarh Airport (IXC) or Chandigarh railway pickup",
    mapLat: "31.1048",
    mapLng: "77.1734",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Chandigarh to Shimla",
        morning: "Meet driver at Chandigarh. Scenic drive via Kandaghat.",
        afternoon: "Check in on Mall Road or near Scandal Point.",
        evening: "Mall stroll and ridge sunset. Overnight Shimla.",
      },
      {
        dayNumber: 2,
        title: "Shimla heritage",
        morning: "Viceregal Lodge or Jakhu ropeway optional.",
        afternoon: "Kufri pony meadow or Himalayan Nature Park.",
        evening: "Couples dinner on the ridge. Overnight Shimla.",
      },
      {
        dayNumber: 3,
        title: "Shimla to Manali",
        morning: "Descend through Mandi apple belt — photo stops at Sundernagar.",
        afternoon: "Reach Manali and check in. Light walk only.",
        evening: "MAP dinner. Overnight Manali.",
      },
      {
        dayNumber: 4,
        title: "Solang · adventure optional",
        morning: "Solang Valley drive. Paragliding only if both want it (extra).",
        afternoon: "Resort downtime.",
        evening: "Overnight Manali.",
      },
      {
        dayNumber: 5,
        title: "Old Manali · temples",
        morning: "Hadimba Temple and Manu Temple trail.",
        afternoon: "Vashisht sulphur springs.",
        evening: "Candlelit dinner. Overnight Manali.",
      },
      {
        dayNumber: 6,
        title: "Manali to Chandigarh",
        morning: "Checkout after breakfast. Long drive to Chandigarh plains.",
        afternoon: "Check in at airport hotel or city stay.",
        evening: "Quiet evening before flight next day. Overnight Chandigarh.",
      },
      {
        dayNumber: 7,
        title: "Departure",
        morning: "Transfer to Chandigarh airport or station. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Two hill moods:</strong> Shimla's ridge walks pair with Manali's deodar cafés — one seamless cab, no train changes with luggage.</p>",
      "<p><strong>Stays:</strong> 2N Shimla · 3N Manali · 1N Chandigarh transit MAP.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 24999,
    currency: "INR",
    discounts: [{ name: "Group of 4 couples", type: "percent", value: 6 }],
  },
  details: details(
    [
      {
        title: "How long is the Shimla–Manali drive?",
        content: "Usually 7–8 hours with lunch stop. We break at Mandi — not a single brutal stretch.",
      },
    ],
    ["Candlelit dinner in Manali (Day 5)", "1N Chandigarh transit hotel"],
    ["Jakhu ropeway", "Kufri activities", "Paragliding at Solang"],
    "Chandigarh pickup & drop at IXC",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Shimla Manali Honeymoon | 6N/7D Himachal",
    seoDescription: "Shimla & Manali honeymoon circuit — Mall Road to Solang, from ₹24,999 pp.",
    facebookTitle: "Shimla–Manali Honeymoon",
    facebookDescription: "Six nights across Himachal for couples.",
    twitterTitle: "Shimla Manali Honeymoon | 6N/7D",
    twitterDescription: "Ridge · apple country · Solang. From ₹24,999 pp.",
    published: true,
  },
};

const lehLadakhHoneymoon: TourFormat = {
  slug: "leh-ladakh-honeymoon",
  general: {
    title: "Leh Ladakh Honeymoon",
    summary:
      "High-desert romance with sensible altitude — Leh acclimatisation, Nubra dunes, and Pangong blues. Private cab, twin share, from ₹39,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "dates",
    durationDays: 7,
    durationNights: 6,
    durationUnit: "days",
    durationLabel: "6 nights / 7 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 10,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["leh", "ladakh", "nubra", "pangong"],
    primaryDestinationSlug: "leh",
    address: "Kushok Bakula Rimpochee Airport (IXL), Leh pickup",
    mapLat: "34.1526",
    mapLng: "77.5771",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Fly Leh · rest day",
        morning: "Meet driver at Leh airport. Transfer to hotel — strict rest.",
        afternoon: "No sightseeing. Hydrate and nap.",
        evening: "Light MAP dinner. Overnight Leh.",
      },
      {
        dayNumber: 2,
        title: "Leh acclimatisation · Shanti Stupa",
        morning: "Late start. Shanti Stupa and Leh Palace from outside if energy permits.",
        afternoon: "Sankar Gompa or market walk — slow pace only.",
        evening: "Stargazing optional. Overnight Leh.",
      },
      {
        dayNumber: 3,
        title: "Leh to Nubra · Khardung La",
        morning: "Early drive over Khardung La to Diskit.",
        afternoon: "Diskit monastery and Hunder sand dunes — double-hump camel ride optional.",
        evening: "Candlelit dinner at camp or hotel. Overnight Nubra.",
      },
      {
        dayNumber: 4,
        title: "Nubra to Pangong",
        morning: "Drive via Shayok or Wari La route as road status allows.",
        afternoon: "First glimpse of Pangong Lake — check in lakeside.",
        evening: "Sunset colours on the water. Overnight Pangong.",
      },
      {
        dayNumber: 5,
        title: "Pangong to Leh",
        morning: "Sunrise by the lake. Photography time together.",
        afternoon: "Return Leh over Chang La — hot tea stops.",
        evening: "Recovery dinner. Overnight Leh.",
      },
      {
        dayNumber: 6,
        title: "Leh couples day",
        morning: "Hall of Fame or SECMOL optional.",
        afternoon: "Spa or shopping for pashmina — no long drives.",
        evening: "Farewell candlelit dinner. Overnight Leh.",
      },
      {
        dayNumber: 7,
        title: "Departure",
        morning: "Breakfast. Airport transfer. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Ladakh for two:</strong> We build two full Leh rest days before high passes — newlyweds should not race altitude.</p>",
      "<p><strong>Stays:</strong> 3N Leh · 1N Nubra · 1N Pangong camp/hotel · 1N Leh. Inner-line permits arranged.</p>",
      "<p><strong>Season:</strong> June–September departures when Manali–Leh road is optional add-on.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 39999,
    currency: "INR",
    discounts: [{ name: "Early book (45+ days)", type: "percent", value: 5 }],
  },
  details: details(
    [
      {
        title: "Are permits included?",
        content: "Yes — protected area permits for Nubra and Pangong for Indian nationals are filed in your names.",
      },
      {
        title: "Can we fly together from Delhi?",
        content: "Flights are extra; we recommend same PNR so you land together and go straight to hotel rest.",
      },
    ],
    [
      "Protected area permits (Nubra / Pangong)",
      "1N Pangong lakeside stay",
      "Candlelit dinners (Nubra & Leh farewell)",
    ],
    ["Delhi–Leh flights", "Camel ride at Hunder", "Oxygen cylinder personal hire"],
    "Airport pickup & drop at IXL",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Leh Ladakh Honeymoon | 6N/7D Nubra & Pangong",
    seoDescription: "Ladakh honeymoon — Leh rest days, Nubra dunes, Pangong lake, from ₹39,999 pp.",
    facebookTitle: "Leh Ladakh Honeymoon",
    facebookDescription: "Altitude-safe romance — Nubra and Pangong for couples.",
    twitterTitle: "Ladakh Honeymoon | 6N/7D",
    twitterDescription: "Leh · Nubra · Pangong. From ₹39,999 pp.",
    published: true,
  },
};

const coorgCoffeeEstateHoneymoon: TourFormat = {
  slug: "coorg-coffee-estate-honeymoon",
  general: {
    title: "Coorg Coffee Estate Honeymoon",
    summary:
      "Mist, coffee, and plantation silence — three nights in Kodagu with Abbey Falls and estate walks. Private cab, twin share, from ₹18,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 4,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["coorg"],
    primaryDestinationSlug: "coorg",
    address: "Mangalore (IXE) or Mysuru pickup",
    mapLat: "12.3375",
    mapLng: "75.8069",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Coorg · estate check-in",
        morning: "Pickup from Mysuru or Mangalore. Wind through coffee country.",
        afternoon: "Check in at plantation stay. Estate walk with host.",
        evening: "MAP dinner with local Kodava flavours. Overnight estate.",
      },
      {
        dayNumber: 2,
        title: "Abbey Falls · Madikeri",
        morning: "Abbey Falls and Raja's Seat viewpoint.",
        afternoon: "Madikeri town café time — no packed schedule.",
        evening: "Return to estate for bonfire if weather allows. Overnight estate.",
      },
      {
        dayNumber: 3,
        title: "Nisargadhama · Dubare optional",
        morning: "Nisargadhama bamboo island walk across hanging bridge.",
        afternoon: "Optional Dubare elephant camp (paid locally) or pool time.",
        evening: "Candlelit dinner on the estate. Overnight estate.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast. Drive to Mysuru or Mangalore. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Plantation intimacy:</strong> Coorg estates give couples space — birdsong mornings, pepper vines, and rainfall on tin roofs.</p>",
      "<p><strong>Stays:</strong> 3N heritage plantation homestay or resort, MAP.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 18999,
    currency: "INR",
    discounts: [{ name: "Monsoon greenery", type: "percent", value: 10 }],
  },
  details: details(
    [
      {
        title: "Which airport is best?",
        content: "Mangalore (IXE) is closer; many couples train to Mysuru — we quote drive time for your gateway.",
      },
    ],
    ["Estate walk with host", "Candlelit dinner (Day 3)"],
    ["Dubare elephant activities", "River rafting in season"],
    "Pickup & drop Mysuru or Mangalore as quoted",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Coorg Coffee Estate Honeymoon | 3N/4D",
    seoDescription: "Coorg honeymoon — plantation stay, Abbey Falls, from ₹18,999 pp.",
    facebookTitle: "Coorg Honeymoon — coffee estate",
    facebookDescription: "Three nights in Kodagu for newlyweds.",
    twitterTitle: "Coorg Honeymoon | 3N/4D",
    twitterDescription: "Estate walks · Abbey Falls. From ₹18,999 pp.",
    published: true,
  },
};

const ootyKodaikanalHoneymoon: TourFormat = {
  slug: "ooty-kodaikanal-honeymoon",
  general: {
    title: "Ooty–Kodaikanal Honeymoon",
    summary:
      "Nilgiri toy-train mood and Kodaikanal lake mist — five nights across Tamil Nadu's twin hill stations. Private cab, twin share, from ₹21,499 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["ooty", "kodaikanal"],
    primaryDestinationSlug: "ooty",
    address: "Coimbatore Airport (CJB) pickup",
    mapLat: "11.4102",
    mapLng: "76.6950",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Coimbatore to Ooty",
        morning: "Pickup at CJB. Climb via Mettupalayam ghat road.",
        afternoon: "Botanical Garden stroll. Check in.",
        evening: "Ooty Lake optional boat. Overnight Ooty.",
      },
      {
        dayNumber: 2,
        title: "Ooty viewpoints",
        morning: "Doddabetta Peak if skies are clear.",
        afternoon: "Tea factory visit and soft hike in pine trails.",
        evening: "MAP dinner. Overnight Ooty.",
      },
      {
        dayNumber: 3,
        title: "Ooty to Kodaikanal",
        morning: "Scenic drive via Palani–Kodaikanal ghat (full day with stops).",
        afternoon: "Check in near Kodaikanal lake.",
        evening: "Lake promenade walk. Overnight Kodaikanal.",
      },
      {
        dayNumber: 4,
        title: "Kodaikanal lake day",
        morning: "Boat on Kodai Lake. Coaker's Walk.",
        afternoon: "Bryant Park flowers. Chocolate shopping.",
        evening: "Candlelit dinner. Overnight Kodaikanal.",
      },
      {
        dayNumber: 5,
        title: "Pillar Rocks · slow farewell",
        morning: "Pillar Rocks and Guna Caves viewpoints.",
        afternoon: "Free time — no checkout rush.",
        evening: "Second lake evening. Overnight Kodaikanal.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        morning: "Drive to Coimbatore or Madurai if quoted. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Two hill personalities:</strong> Ooty's gardens and Kodai's lake loop complement each other without Ladakh-style fatigue.</p>",
      "<p><strong>Stays:</strong> 2N Ooty · 3N Kodaikanal MAP heritage hotels.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 21499,
    currency: "INR",
    discounts: [{ name: "Off-season (Jun)", type: "percent", value: 8 }],
  },
  details: details(
    [
      {
        title: "Is the toy train included?",
        content: "Toy train needs separate booking when operational — we assist with timing but tickets are subject to IRCTC release.",
      },
    ],
    ["Kodaikanal lake boat", "Candlelit dinner (Day 4)"],
    ["Toy train tickets", "Ooty Lake rowboat"],
    "Coimbatore airport pickup & drop",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Ooty Kodaikanal Honeymoon | 5N/6D",
    seoDescription: "Ooty & Kodaikanal honeymoon — gardens, lakes, candlelit dinner from ₹21,499 pp.",
    facebookTitle: "Ooty–Kodaikanal Honeymoon",
    facebookDescription: "Five nights in the Nilgiris and Palani hills.",
    twitterTitle: "Ooty Kodai Honeymoon | 5N/6D",
    twitterDescription: "Botanical Ooty · Kodai lake. From ₹21,499 pp.",
    published: true,
  },
};

const darjeelingGangtokHoneymoon: TourFormat = {
  slug: "darjeeling-gangtok-honeymoon",
  general: {
    title: "Darjeeling–Gangtok Honeymoon",
    summary:
      "Kanchenjunga dawn and Sikkim's monasteries — five nights linking Darjeeling tea country to Gangtok's calm ridges. Private cab, twin share, from ₹26,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 6,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["darjeeling", "gangtok"],
    primaryDestinationSlug: "darjeeling",
    address: "Bagdogra Airport (IXB) pickup",
    mapLat: "27.0360",
    mapLng: "88.2627",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Bagdogra to Darjeeling",
        morning: "Pickup at IXB. Hill drive with tea garden views.",
        afternoon: "Check in on Mall Road or Glenarys side.",
        evening: "Evening walk on the Mall. Overnight Darjeeling.",
      },
      {
        dayNumber: 2,
        title: "Tiger Hill · tea estate",
        morning: "Pre-dawn Tiger Hill Kanchenjunga sunrise (vehicle included).",
        afternoon: "Happy Valley or Glenburn-style estate tour with tasting.",
        evening: "MAP dinner. Overnight Darjeeling.",
      },
      {
        dayNumber: 3,
        title: "Darjeeling to Gangtok",
        morning: "Checkout. Drive via Teesta corridor to Gangtok.",
        afternoon: "MG Marg pedestrian zone stroll.",
        evening: "Café dinner on the strip. Overnight Gangtok.",
      },
      {
        dayNumber: 4,
        title: "Tsomgo · Baba Mandir",
        morning:
          "Excursion to Tsomgo Lake and Baba Harbhajan Mandir (permit arranged; subject to road/weather).",
        afternoon: "Return Gangtok for rest.",
        evening: "Candlelit dinner. Overnight Gangtok.",
      },
      {
        dayNumber: 5,
        title: "Rumtek · Enchey",
        morning: "Rumtek Monastery and Enchey Gompa at gentle pace.",
        afternoon: "Cable car optional to Tashi View (tickets extra).",
        evening: "Last night Gangtok.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        morning: "Breakfast. Transfer to Bagdogra. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>East Himalaya for couples:</strong> Tiger Hill sunrise is worth the early alarm once; Gangtok fills the rest with monastery calm and lakeside permits.</p>",
      "<p><strong>Stays:</strong> 2N Darjeeling · 3N Gangtok MAP. Sikkim permits filed for Tsomgo day.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 26999,
    currency: "INR",
    discounts: [{ name: "Group of 4+", type: "percent", value: 5 }],
  },
  details: details(
    [
      {
        title: "Is Tsomgo guaranteed?",
        content:
          "Permits and weather govern lake day access. If snow blocks the road, we swap to local Gangtok sightseeing — no hidden charge for the vehicle day.",
      },
    ],
    [
      "Tiger Hill sunrise vehicle",
      "Tea estate visit with tasting",
      "Tsomgo / Baba Mandir permits",
      "Candlelit dinner in Gangtok",
    ],
    ["Nathula Pass (if open — extra permit)", "Gangtok ropeway tickets"],
    "Bagdogra pickup & drop at IXB",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Darjeeling Gangtok Honeymoon | 5N/6D",
    seoDescription: "Darjeeling & Gangtok honeymoon — Tiger Hill, Tsomgo, tea estates from ₹26,999 pp.",
    facebookTitle: "Darjeeling–Gangtok Honeymoon",
    facebookDescription: "Sunrise and Sikkim lakes for newlyweds.",
    twitterTitle: "Darjeeling Gangtok | 5N/6D",
    twitterDescription: "Tiger Hill · Tsomgo · tea. From ₹26,999 pp.",
    published: true,
  },
};

const jaipurUdaipurHoneymoon: TourFormat = {
  slug: "jaipur-udaipur-honeymoon",
  general: {
    title: "Jaipur–Udaipur Honeymoon",
    summary:
      "Pink City forts to lake palaces — five nights linking Rajasthan's two most romantic cities. Private cab, twin share, from ₹23,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 5,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["jaipur", "udaipur"],
    primaryDestinationSlug: "jaipur",
    address: "Jaipur Airport (JAI) pickup; drop Udaipur (UDR) optional",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 7,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Jaipur",
        morning: "Pickup at JAI. Check in near Civil Lines or Bani Park.",
        afternoon: "Albert Hall and Old City orientation drive.",
        evening: "Rajasthani thali dinner. Overnight Jaipur.",
      },
      {
        dayNumber: 2,
        title: "Amber · City Palace",
        morning: "Amber Fort jeep or walk. Photo stop at Jal Mahal.",
        afternoon: "City Palace and Jantar Mantar.",
        evening: "Hawa Mahal façade at dusk. Overnight Jaipur.",
      },
      {
        dayNumber: 3,
        title: "Jaipur to Udaipur",
        morning: "After breakfast, drive via Ajmer–Chittorgarh band (7–8 hours with lunch stop).",
        afternoon: "Reach Udaipur. Sunset at Gangaur Ghat.",
        evening: "Check in lake hotel. Overnight Udaipur.",
      },
      {
        dayNumber: 4,
        title: "Udaipur lakes",
        morning: "City Palace interiors. Jagdish Temple lane.",
        afternoon: "Boat on Lake Pichola.",
        evening: "Candlelit dinner. Overnight Udaipur.",
      },
      {
        dayNumber: 5,
        title: "Saheliyon-ki-Bari · free lake time",
        morning: "Gardens and Fateh Sagar drive.",
        afternoon: "Couples spa or shopping — no third fort rush.",
        evening: "Farewell lake evening. Overnight Udaipur.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        morning: "Breakfast. Transfer to Udaipur airport. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Rajasthan double bill:</strong> Jaipur's amber ramparts and Udaipur's boat rides cover classic honeymoon photos in one linear route — exit from Udaipur airport.</p>",
      "<p><strong>Stays:</strong> 2N Jaipur · 3N Udaipur heritage MAP.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 23999,
    currency: "INR",
    discounts: [{ name: "Apr–Jun shoulder", type: "percent", value: 7 }],
  },
  details: details(
    [
      {
        title: "Can we start from Delhi instead?",
        content: "Yes — Delhi pickup adds one transit night or a long first day. We quote when you share flight times.",
      },
    ],
    [
      "Amber Fort entry",
      "Lake Pichola boat (Day 4)",
      "Candlelit dinners (Jaipur Day 2 & Udaipur Day 4)",
    ],
    ["Monument tickets not listed", "Chittorgarh fort stop entry if taken"],
    "Jaipur airport pickup; Udaipur airport drop",
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Jaipur Udaipur Honeymoon | 5N/6D Rajasthan",
    seoDescription: "Jaipur & Udaipur honeymoon — forts, lakes, candlelit dinners from ₹23,999 pp.",
    facebookTitle: "Jaipur–Udaipur Honeymoon",
    facebookDescription: "Five nights linking Pink City and City of Lakes.",
    twitterTitle: "Jaipur Udaipur Honeymoon | 5N/6D",
    twitterDescription: "Amber · Pichola boat. From ₹23,999 pp.",
    published: true,
  },
};

export const indiaHoneymoonPendingTours: TourFormat[] = [
  andamanIslandHoneymoon,
  goaBeachHoneymoon,
  udaipurRomanticPalaceHoneymoon,
  manaliHoneymoonEscape,
  shimlaManaliHoneymoon,
  lehLadakhHoneymoon,
  coorgCoffeeEstateHoneymoon,
  ootyKodaikanalHoneymoon,
  darjeelingGangtokHoneymoon,
  jaipurUdaipurHoneymoon,
];
