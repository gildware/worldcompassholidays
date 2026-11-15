/**
 * Locked-format tour — Pahalgam Riverside Couples Escape (Batch Kashmir #1).
 * Lidder riverside leisure: Betaab, Aru, couples pacing — 3N/4D.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const pahalgamCouplesCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Honeymoon" },
  { kind: "style", title: "Romantic" },
  {
    kind: "faq",
    title: "Is this a honeymoon-only departure?",
    content:
      "It is built for couples — twin room, riverside pacing, and optional room décor on request. Friends travelling together are welcome; we keep the same easy rhythm and private cab.",
  },
  {
    kind: "faq",
    title: "Can we add a houseboat night in Srinagar?",
    content:
      "Yes. Swap night 1 for a deluxe houseboat or add a Srinagar night before Pahalgam — quote depends on season. Mention it in your request.",
  },
  {
    kind: "before_you_go",
    title: "Couples pacing",
    content:
      "Three nights in Pahalgam pass quickly. Keep arrival day light; valley cabs to Betaab and Aru are union-run and paid locally — budget ₹2,000–3,500 for both stops.",
  },
  {
    kind: "facility",
    title: "Optional honeymoon room décor",
  },
  {
    kind: "include",
    title: "Candlelit dinner arrangement (1 night)",
  },
  {
    kind: "include",
    title: "Lidder riverside walk time on itinerary",
  },
];

export const tourPahalgamRiversideCouplesEscape: TourFormat = {
  slug: "pahalgam-riverside-couples-escape",
  general: {
    title: "Pahalgam Riverside Couples Escape",
    summary:
      "Slow days by the Lidder — overnight Pahalgam, Betaab and Aru at couples pace, one Srinagar night optional. Private cab, twin share, from ₹12,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "pahalgam"],
    primaryDestinationSlug: "pahalgam",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0159",
    mapLng: "75.3140",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · drive to Pahalgam",
        morning:
          "Meet your driver at Srinagar Airport. Optional brief stop for kahwa en route — then climb the Lidder valley to Pahalgam (about 2.5 hours).",
        afternoon:
          "Check in at a riverside hotel. Unpack and take a gentle stroll along the Lidder promenade.",
        evening:
          "Candlelit dinner arrangement (as quoted). Overnight Pahalgam.",
        imageKey: "tours/pahalgam-riverside-couples-escape-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Betaab Valley · meadow picnic mood",
        morning:
          "After breakfast, union cab to Betaab Valley for film-set meadows and river views at an unhurried pace.",
        afternoon:
          "Picnic-style lunch spot (lunch extra) or return to town for a riverside café. Free time to read, walk, or photograph the Lidder.",
        evening: "Dinner at the hotel. Overnight Pahalgam.",
        imageKey: "tours/pahalgam-riverside-couples-escape-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Aru valley · pine trails and quiet",
        morning:
          "Union cab to Aru — cooler air, pony meadows, and short forest walks you can do together without rushing.",
        afternoon:
          "Return to Pahalgam. Optional riverside tea; pack for tomorrow’s departure.",
        evening: "Farewell dinner. Overnight Pahalgam.",
        imageKey: "tours/pahalgam-riverside-couples-escape-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Departure to Srinagar Airport",
        morning:
          "Breakfast and checkout. Drive to Srinagar Airport with a 3-hour flight buffer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/pahalgam-riverside-couples-escape-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why couples pick this:</strong> you sleep three nights in Pahalgam instead of racing the full triangle. Betaab and Aru are timed for long lunches and river walks — not checklist sightseeing.</p>",
      "<p><strong>Stays (3 nights):</strong> White Villa Resort or similar by the Lidder · Heevan Resort category if sold out. Optional Srinagar or houseboat add-on on request.</p>",
      "<p><strong>What you get:</strong> private Innova or Dzire, MAP meals at the hotel, airport transfers, one candlelit dinner setup, and driver allowance for the Srinagar–Pahalgam sector.</p>",
      "<p><strong>Local extras:</strong> Betaab / Aru union cabs and pony rides are paid on the spot — typical ranges shared before you confirm.</p>",
      "<p><strong>How to book:</strong> pick a start date and party size (min. 2). Nothing is charged until you accept the confirmed trip.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 12999,
    currency: "INR",
    discounts: [{ name: "Group of 4 couples", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is this a honeymoon-only departure?",
      "Can we add a houseboat night in Srinagar?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Which hotels are used?",
        content:
          "White Villa Resort or Heevan category on the Lidder — twin rooms with valley views where available. Exact property confirmed in writing before payment.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Meet-and-greet at Srinagar Airport",
      "Candlelit dinner arrangement (1 night)",
      "Lidder riverside walk time on itinerary",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Pahalgam union sightseeing cabs",
      "Pony / sled rides in valleys",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Couples pacing",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Hill Stations", "Romantic", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Optional honeymoon room décor",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/pahalgam-riverside-couples-escape-cover.jpg",
    cover: "tours/pahalgam-riverside-couples-escape-cover.jpg",
    gallery: [
      "tours/pahalgam-riverside-couples-escape-g1.jpg",
      "tours/pahalgam-riverside-couples-escape-g2.jpg",
      "tours/pahalgam-riverside-couples-escape-g3.jpg",
      "tours/pahalgam-riverside-couples-escape-g4.jpg",
    ],
    seoImage: "tours/pahalgam-riverside-couples-escape-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Pahalgam Riverside Couples Escape | 3N/4D Honeymoon",
    seoDescription:
      "Request Pahalgam for couples — Lidder riverside stays, Betaab and Aru at easy pace. Private cab, MAP meals, from ₹12,999 pp twin share.",
    facebookTitle: "Pahalgam Riverside Couples Escape — Lidder valley romance",
    facebookDescription:
      "Three nights by the river, Betaab meadows, Aru walks. Private cab, candlelit dinner included.",
    twitterTitle: "Pahalgam Couples Escape | 3N/4D",
    twitterDescription:
      "Lidder · Betaab · Aru at couples pace. From ₹12,999 pp.",
    published: true,
  },
};
