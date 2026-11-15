/**
 * LOCKED TOUR FORMAT — approved reference for every tour we add.
 * Status: locked (see `src/lib/tours/format.ts` + `.cursor/rules/tour-format.mdc`).
 * Place-accurate cover / gallery / per-day photos under public/uploads/tours/classic-kashmir-triangle-*.jpg
 * (refetch with: npx tsx scripts/fetch-classic-kashmir-images.ts).
 */

export type SampleCatalogRef = {
  kind: "category" | "style" | "facility" | "faq" | "include" | "exclude" | "before_you_go";
  title: string;
  content?: string;
};

export type SampleTourFormat = {
  slug: string;
  /** 1 · General */
  general: {
    title: string;
    summary: string;
    category: string;
    availability: "always" | "dates";
    durationDays: number;
    durationNights: number;
    durationUnit: "days";
    durationLabel: string;
    difficulty: "easy" | "moderate" | "difficult";
    minPeople: number;
    maxGroupSize: number;
    minDayBeforeBooking: number | null;
    isFeatured: boolean;
    youtubeUrl: string;
  };
  /** 2 · Itinerary */
  itinerary: {
    destinationSlugs: string[];
    primaryDestinationSlug: string;
    address: string;
    mapLat: string;
    mapLng: string;
    mapZoom: number;
    days: {
      dayNumber: number;
      title: string;
      description?: string;
      morning?: string;
      afternoon?: string;
      evening?: string;
      /** Relative to public/uploads — place-matched to that day’s stops. */
      imageKey?: string;
    }[];
  };
  /** 3 · Content */
  content: {
    descriptionHtml: string;
  };
  /** 4 · Pricing */
  pricing: {
    priceFrom: number;
    currency: "INR";
    discounts: { name: string; type: "percent" | "amount"; value: number }[];
  };
  /** 5 · Tour details (titles resolve to shared catalog) */
  details: {
    sharedFaqTitles: string[];
    extraFaqs: { title: string; content: string }[];
    includeTitles: string[];
    excludeTitles: string[];
    beforeYouGoTitles: string[];
    travelStyleTitles: string[];
    facilityTitles: string[];
  };
  /** 6 · Images — cover + gallery (keys relative to public/uploads) */
  images: {
    banner: string | null;
    cover: string | null;
    gallery: string[];
    seoImage: string | null;
  };
  /** 7 · SEO */
  seo: {
    seoIndex: boolean;
    seoTitle: string;
    seoDescription: string;
    facebookTitle: string;
    facebookDescription: string;
    twitterTitle: string;
    twitterDescription: string;
    published: boolean;
  };
};

/** Canonical name for the locked format shape. */
export type TourFormat = SampleTourFormat;

/** Shared catalog rows created with this pilot (icons via seed-catalog-icons.ts). */
export const sampleTourCatalogSeed: SampleCatalogRef[] = [
  { kind: "category", title: "Leisure" },
  { kind: "style", title: "Hill Stations" },
  { kind: "style", title: "Family Friendly" },
  { kind: "style", title: "Private / Independent" },
  { kind: "facility", title: "Private cab" },
  { kind: "facility", title: "Airport transfers" },
  { kind: "facility", title: "MAP meals (B/D)" },
  { kind: "facility", title: "Shikara ride" },
  { kind: "facility", title: "24×7 helpline" },
  {
    kind: "faq",
    title: "What is the best time for this tour?",
    content:
      "April–June for spring blooms, July–September for lush meadows, and December–February if you want snow in Gulmarg. Shoulder months (March, October) are quieter and good value.",
  },
  {
    kind: "faq",
    title: "Is this a private or group tour?",
    content:
      "Your party always travels in its own cab — you are not mixed with strangers. In the booking card, Listed rate is the twin-share package price on any start date. Private rate is a dedicated departure from about 1.46× that price.",
  },
  {
    kind: "faq",
    title: "Are flights included?",
    content:
      "No. Flights to and from Srinagar are excluded so you can book the timings that suit you. Airport pickup and drop are included.",
  },
  {
    kind: "faq",
    title: "What extras are paid locally?",
    content:
      "Gulmarg Gondola tickets, Pahalgam union valley cabs (Aru / Betaab / Baisaran), pony or sled rides, lunches, and personal shopping are paid on the spot. We share typical ranges before you confirm.",
  },
  { kind: "include", title: "Accommodation as per itinerary (twin sharing)" },
  { kind: "include", title: "Breakfast + dinner at the hotel each night (MAP)" },
  { kind: "include", title: "Private vehicle for transfers & sightseeing" },
  { kind: "include", title: "Airport pickup & drop" },
  { kind: "include", title: "Driver allowance, tolls & parking" },
  { kind: "include", title: "GST as quoted" },
  { kind: "include", title: "One-hour Shikara on Dal Lake (Day 1)" },
  { kind: "include", title: "Meet-and-greet at Srinagar Airport" },
  { kind: "exclude", title: "Flights / trains to starting point" },
  { kind: "exclude", title: "Lunch (unless listed)" },
  { kind: "exclude", title: "Tips & personal expenses" },
  { kind: "exclude", title: "Travel insurance" },
  { kind: "exclude", title: "Gulmarg Gondola tickets" },
  { kind: "exclude", title: "Pahalgam union sightseeing cabs" },
  { kind: "exclude", title: "Anything not mentioned in includes" },
  {
    kind: "before_you_go",
    title: "Fitness",
    content:
      "Pace is easy. Expect full travel days and walking between stops — say so in your request if you need a gentler rhythm.",
  },
  {
    kind: "before_you_go",
    title: "Documents",
    content:
      "Carry a government photo ID for hotel check-ins and any permits. Keep a clear photo of it on your phone as backup.",
  },
  {
    kind: "before_you_go",
    title: "Weather & kit",
    content:
      "Dress for Kashmir: layers for cool evenings, sun protection by day, and shoes you can walk in for several hours.",
  },
  {
    kind: "before_you_go",
    title: "Arrival",
    content:
      "Plan to be at Srinagar Airport on time on day 1. Exact pickup details are shared once the trip is confirmed.",
  },
  {
    kind: "before_you_go",
    title: "Rooms",
    content:
      "The listed rate is twin share. Solo travelers usually need a single-room supplement — we confirm that before you pay.",
  },
  {
    kind: "before_you_go",
    title: "Money on the road",
    content:
      "Bring a little cash for snacks, tips, Gondola tickets, and the Pahalgam union cab. Lunch and extras outside the package are on you.",
  },
];

export const sampleTourClassicKashmir: SampleTourFormat = {
  slug: "classic-kashmir-triangle",
  general: {
    title: "Classic Kashmir Triangle",
    summary:
      "Kashmir’s favourite first holiday — overnight Gulmarg and Pahalgam, Mughal Gardens, Dal Lake Shikara, Betaab and Aru. Your own cab, twin share, from ₹14,999 a person (min. 2).",
    category: "Leisure",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 3,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam"],
    primaryDestinationSlug: "kashmir",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Touchdown in Srinagar · gardens and lake hour",
        morning:
          "Meet your driver at Srinagar Airport and transfer to a centrally located hotel near Dalgate (or a deluxe houseboat if you upgraded). Settle in and freshen up.",
        afternoon:
          "Visit the terraced Mughal gardens — Nishat, Shalimar, and Chashme Shahi — at an easy pace.",
        evening:
          "As the light softens, enjoy a private one-hour Shikara on Dal Lake. Dinner at the hotel; overnight Srinagar.",
        imageKey: "tours/classic-kashmir-triangle-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Drive to Gulmarg · meadow and Gondola",
        morning:
          "After breakfast, drive via Tangmarg into Gulmarg (about 1.5–2 hours). Check in on or near the meadow.",
        afternoon:
          "Ride Gondola Phase I to Kongdori when tickets are available locally; Phase II to Apharwat depends on weather and queue. Spend time on pine trails or at St. Mary’s Church.",
        evening: "Dinner and overnight in Gulmarg so you wake on the meadow.",
        imageKey: "tours/classic-kashmir-triangle-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Gulmarg to Pahalgam via the south road",
        morning:
          "Checkout after breakfast and continue toward Pahalgam (typically 4–5 hours with photo stops).",
        afternoon:
          "Pause at the Pampore saffron fields in season and the Awantipora ruins. Check in at a Lidder-side hotel.",
        evening: "Riverside walk and kahwa. Overnight Pahalgam.",
        imageKey: "tours/classic-kashmir-triangle-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Pahalgam valleys — Betaab and Aru",
        morning:
          "Use a local union cab (paid locally; outside vehicles are not allowed on this circuit) for Betaab Valley.",
        afternoon:
          "Continue to Aru Valley. Optional add-ons: Baisaran meadow or Chandanwari if time and weather allow.",
        evening: "Return to the hotel for dinner. Overnight Pahalgam.",
        imageKey: "tours/classic-kashmir-triangle-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Return to Srinagar · crafts and lake views",
        morning:
          "Drive back to Srinagar (about 2.5–3 hours) and check into your return hotel.",
        afternoon:
          "Optional visit to Shankaracharya for the wide lake panorama, then Boulevard / Lal Chowk for dry fruit, papier-mâché, and pashmina shopping with vetted shop suggestions on request.",
        evening: "Dinner and overnight Srinagar.",
        imageKey: "tours/classic-kashmir-triangle-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Departure transfer",
        morning:
          "Breakfast at the hotel. Keep a comfortable buffer before domestic flights (we recommend 3 hours). Private transfer to Srinagar Airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/classic-kashmir-triangle-d6.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this itinerary works:</strong> you sleep in Gulmarg and Pahalgam instead of rushing both as long day trips from Srinagar. That means an early Gondola window and a full valley day without a six-hour return drive.</p>",
      "<p><strong>Stays (5 nights):</strong> 1N Hotel Royal Batoo or similar near Dalgate · 1N Apple Tree Resorts or similar in Gulmarg · 2N White Villa Resort or similar by the Lidder · 1N Hotel Asian Park or similar on return to Srinagar. Optional deluxe houseboat upgrade on night 1.</p>",
      "<p><strong>What you get:</strong> a private Innova or Dzire for your party only, breakfast and dinner at the hotel each night (MAP), and a written note of local extras (Gondola, Pahalgam union cab, lunches) before you confirm. Exact hotel names are locked in writing before you pay the balance.</p>",
      "<p><strong>How to book:</strong> pick a start date and party size in the booking card, then send a request. Nothing is charged and no seat is held until you accept the confirmed trip.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 14999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "What is the best time for this tour?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Which hotels are used on this package?",
        content:
          "This quote uses Hotel Royal Batoo (Srinagar), Apple Tree Resorts (Gulmarg), White Villa Resort (Pahalgam — 2 nights), and Hotel Asian Park (return), or the same 3-star category if a date is sold out. Exact names are confirmed in writing before payment.",
      },
      {
        title: "How much should I budget for local extras?",
        content:
          "Plan about ₹1,500–2,500 for Gondola Phase I (more for Phase II), ₹2,000–3,500 for a Pahalgam union cab covering Aru and Betaab, and ₹400–800 per person per day for lunch.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "One-hour Shikara on Dal Lake (Day 1)",
      "Meet-and-greet at Srinagar Airport",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Gulmarg Gondola tickets",
      "Pahalgam union sightseeing cabs",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Hill Stations", "Family Friendly", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Shikara ride",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/classic-kashmir-triangle-cover.jpg",
    cover: "tours/classic-kashmir-triangle-cover.jpg",
    gallery: [
      "tours/classic-kashmir-triangle-g1.jpg",
      "tours/classic-kashmir-triangle-g2.jpg",
      "tours/classic-kashmir-triangle-g3.jpg",
      "tours/classic-kashmir-triangle-g4.jpg",
    ],
    seoImage: "tours/classic-kashmir-triangle-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Classic Kashmir Triangle Package | 5N/6D Srinagar Gulmarg Pahalgam",
    seoDescription:
      "Request the Classic Kashmir Triangle — overnight Gulmarg and 2 nights Pahalgam, Mughal Gardens, Shikara, Betaab and Aru. Own cab, hotel breakfast & dinner, from ₹14,999 pp.",
    facebookTitle: "Classic Kashmir Triangle — 5 nights in the valleys",
    facebookDescription:
      "Sleep in Gulmarg and Pahalgam, not just day-trip them. Gardens, Shikara, Betaab & Aru with your own cab.",
    twitterTitle: "Classic Kashmir Triangle | 5N/6D",
    twitterDescription:
      "Srinagar · Gulmarg · Pahalgam circuit with hotel breakfast & dinner. From ₹14,999 pp twin share.",
    published: true,
  },
};
