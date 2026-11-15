/**
 * Locked-format tour — Kashmir in Tulip Season (Batch A #1).
 * Clone of Classic Kashmir Triangle structure; seasonal Mar–Apr focus on IGM Tulip Garden.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const tulipSeasonCatalogExtras: SampleCatalogRef[] = [
  {
    kind: "faq",
    title: "When do the tulips bloom?",
    content:
      "Indira Gandhi Memorial Tulip Garden usually opens from late March through mid-April, peaking for about two weeks. Exact dates shift with snowmelt — we confirm bloom status before you lock flights.",
  },
  {
    kind: "faq",
    title: "Is Tulip Garden entry included?",
    content:
      "Garden entry tickets are paid locally (typically a few hundred rupees per person). Your driver takes you to the gate; queues are longest mid-morning on weekends.",
  },
  {
    kind: "before_you_go",
    title: "Tulip season timing",
    content:
      "Book only if your dates fall in the official garden window. If blooms are late or early, we pivot Day 1 to Mughal gardens and a longer lake hour — same hotels and cab.",
  },
  {
    kind: "include",
    title: "Guided visit to IGM Tulip Garden (entry extra)",
  },
  {
    kind: "exclude",
    title: "Tulip Garden entry tickets",
  },
];

export const tourKashmirInTulipSeason: TourFormat = {
  slug: "kashmir-in-tulip-season",
  general: {
    title: "Kashmir in Tulip Season",
    summary:
      "Spring’s short window in Srinagar — Indira Gandhi Memorial Tulip Garden, overnight Gulmarg and Pahalgam, Shikara, Betaab and Aru. Private cab, twin share, from ₹16,999 a person (min. 2).",
    category: "Leisure",
    availability: "dates",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 7,
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
        title: "Arrive Srinagar · Tulip Garden and lake hour",
        morning:
          "Meet your driver at Srinagar Airport and transfer to a hotel near Dalgate (or a deluxe houseboat if you upgraded). Freshen up after the flight.",
        afternoon:
          "Head to Indira Gandhi Memorial Tulip Garden while the light is soft — walk the colour rows at an easy pace. If the garden is closed that day, we swap to Nishat and Shalimar instead.",
        evening:
          "Private one-hour Shikara on Dal Lake. Dinner at the hotel; overnight Srinagar.",
        imageKey: "tours/kashmir-in-tulip-season-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Drive to Gulmarg · spring meadow and Gondola",
        morning:
          "After breakfast, drive via Tangmarg into Gulmarg (about 1.5–2 hours). Check in on or near the meadow — spring grass is usually showing by tulip season.",
        afternoon:
          "Ride Gondola Phase I to Kongdori when tickets are available locally; Phase II depends on weather. Walk pine trails or visit St. Mary’s Church.",
        evening: "Dinner and overnight in Gulmarg.",
        imageKey: "tours/kashmir-in-tulip-season-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Gulmarg to Pahalgam via the south road",
        morning:
          "Checkout after breakfast and continue toward Pahalgam (typically 4–5 hours with photo stops).",
        afternoon:
          "Pause at Pampore saffron fields if green, and the Awantipora ruins. Check in at a Lidder-side hotel.",
        evening: "Riverside walk and kahwa. Overnight Pahalgam.",
        imageKey: "tours/kashmir-in-tulip-season-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Pahalgam valleys — Betaab and Aru",
        morning:
          "Hire a local union cab (paid locally) for Betaab Valley — meadows are fresh green in spring.",
        afternoon:
          "Continue to Aru Valley. Optional Baisaran or Chandanwari if time and weather allow.",
        evening: "Return to the hotel for dinner. Overnight Pahalgam.",
        imageKey: "tours/kashmir-in-tulip-season-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Return to Srinagar · gardens reprise or crafts",
        morning:
          "Drive back to Srinagar (about 2.5–3 hours) and check into your return hotel.",
        afternoon:
          "Optional second Tulip Garden pass if blooms are still open, or Shankaracharya for the lake panorama, then Boulevard shopping for dry fruit and crafts.",
        evening: "Dinner and overnight Srinagar.",
        imageKey: "tours/kashmir-in-tulip-season-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Departure transfer",
        morning:
          "Breakfast at the hotel. Keep a 3-hour buffer before domestic flights. Private transfer to Srinagar Airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/kashmir-in-tulip-season-d6.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why book this window:</strong> Kashmir’s tulip season is short — usually late March to mid-April — and the Indira Gandhi Memorial Tulip Garden is Asia’s largest. This package times the Classic Triangle so Day 1 is built around the garden, then you still sleep in Gulmarg and Pahalgam instead of day-tripping both.</p>",
      "<p><strong>Stays (5 nights):</strong> 1N Hotel Royal Batoo or similar near Dalgate · 1N Apple Tree Resorts or similar in Gulmarg · 2N White Villa Resort or similar by the Lidder · 1N Hotel Asian Park or similar on return. Optional deluxe houseboat upgrade on night 1.</p>",
      "<p><strong>What you get:</strong> private Innova or Dzire for your party, breakfast and dinner at the hotel each night (MAP), airport transfers, and a written note of local extras (Tulip Garden tickets, Gondola, Pahalgam union cab) before you confirm.</p>",
      "<p><strong>Season note:</strong> if blooms shift, we keep the same hotels and cab and move Day 1 emphasis to Mughal gardens — you are never left without a spring Srinagar plan.</p>",
      "<p><strong>How to book:</strong> pick a start date inside the tulip window and send a request. Nothing is charged until you accept the confirmed trip.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 16999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "When do the tulips bloom?",
      "Is Tulip Garden entry included?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Which hotels are used on this package?",
        content:
          "Hotel Royal Batoo (Srinagar), Apple Tree Resorts (Gulmarg), White Villa Resort (Pahalgam — 2 nights), and Hotel Asian Park (return), or the same 3-star category if a date is sold out. Exact names are confirmed in writing before payment.",
      },
      {
        title: "How much should I budget for local extras?",
        content:
          "Tulip Garden entry is usually a few hundred rupees pp; Gondola Phase I about ₹1,500–2,500; Pahalgam union cab about ₹2,000–3,500 for Aru + Betaab; lunch about ₹400–800 pp per day.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Guided visit to IGM Tulip Garden (entry extra)",
      "One-hour Shikara on Dal Lake (Day 1)",
      "Meet-and-greet at Srinagar Airport",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Tulip Garden entry tickets",
      "Gulmarg Gondola tickets",
      "Pahalgam union sightseeing cabs",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Tulip season timing",
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
    banner: "tours/kashmir-in-tulip-season-cover.jpg",
    cover: "tours/kashmir-in-tulip-season-cover.jpg",
    gallery: [
      "tours/kashmir-in-tulip-season-g1.jpg",
      "tours/kashmir-in-tulip-season-g2.jpg",
      "tours/kashmir-in-tulip-season-g3.jpg",
      "tours/kashmir-in-tulip-season-g4.jpg",
    ],
    seoImage: "tours/kashmir-in-tulip-season-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Kashmir Tulip Season Package | 5N/6D Srinagar Gulmarg Pahalgam",
    seoDescription:
      "Request Kashmir in Tulip Season — IGM Tulip Garden, overnight Gulmarg and Pahalgam, Shikara, Betaab and Aru. Own cab, hotel breakfast & dinner, from ₹16,999 pp.",
    facebookTitle: "Kashmir in Tulip Season — spring in the valleys",
    facebookDescription:
      "Catch Asia’s largest tulip garden, then sleep in Gulmarg and Pahalgam. Private cab, MAP meals.",
    twitterTitle: "Kashmir in Tulip Season | 5N/6D",
    twitterDescription:
      "Tulip Garden · Gulmarg · Pahalgam circuit with hotel breakfast & dinner. From ₹16,999 pp twin share.",
    published: true,
  },
};
