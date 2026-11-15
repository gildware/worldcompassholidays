/**
 * Locked-format tour — Photography & Autumn Chinar (Batch A #2).
 * Oct–Nov foliage window: golden chinars, clear light, quieter valleys.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const autumnChinarCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Cultural" },
  {
    kind: "style",
    title: "Photography",
  },
  {
    kind: "faq",
    title: "When is chinar colour at its best?",
    content:
      "Peak gold and copper usually land mid-October to early November, depending on frost. Late September can still be green; mid-November often means bare branches and colder mornings. We confirm foliage reports before you lock flights.",
  },
  {
    kind: "faq",
    title: "Is this a photography workshop?",
    content:
      "No formal workshop — it is a private leisure circuit paced for golden-hour stops, chinar avenues, and valley viewpoints. Bring your own camera; your driver will wait at agreed photo pauses (we list them in the day plan).",
  },
  {
    kind: "before_you_go",
    title: "Autumn kit",
    content:
      "Mornings are cold — pack a warm layer, gloves for dawn shoots, and a polariser if you use filters. Trails can be damp with leaf litter; wear shoes with grip.",
  },
  {
    kind: "before_you_go",
    title: "Foliage timing",
    content:
      "Book only inside the autumn window. If colour peaks early or late, we keep the same hotels and cab and shift photo stops to the best remaining avenues and lake light.",
  },
  {
    kind: "facility",
    title: "Golden-hour photo stops",
  },
  {
    kind: "include",
    title: "Flexible photo pauses at agreed viewpoints",
  },
];

export const tourPhotographyAutumnChinar: TourFormat = {
  slug: "photography-autumn-chinar-tour",
  general: {
    title: "Photography & Autumn Chinar Tour",
    summary:
      "Kashmir’s October–November colour week — chinar avenues, Dal Lake reflections, overnight Gulmarg and Pahalgam timed for clear autumn light. Private cab, twin share, from ₹16,499 a person (min. 2).",
    category: "Cultural",
    availability: "dates",
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
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "pahalgam", "pampore"],
    primaryDestinationSlug: "kashmir",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · chinars, gardens, lake light",
        morning:
          "Meet your driver at Srinagar Airport and transfer to a hotel near Dalgate (or a deluxe houseboat if upgraded). Settle in and check gear.",
        afternoon:
          "Walk Nishat and Shalimar while chinars are turning — soft side light on terraces and water channels. Pause for leaf-carpet frames your driver can wait for.",
        evening:
          "Golden-hour Shikara on Dal Lake for mountain reflections. Dinner at the hotel; overnight Srinagar.",
        imageKey: "tours/photography-autumn-chinar-tour-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Drive to Gulmarg · pine and autumn meadow",
        morning:
          "After breakfast, drive via Tangmarg into Gulmarg (about 1.5–2 hours). Clear autumn air usually means sharp Pir Panjal views. Check in on or near the meadow.",
        afternoon:
          "Gondola Phase I when tickets are available; photograph Kongdori ridges and pine edges. Optional Phase II if weather and queue allow.",
        evening: "Blue-hour meadow walk. Dinner and overnight Gulmarg.",
        imageKey: "tours/photography-autumn-chinar-tour-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Gulmarg to Pahalgam · saffron fields if in bloom",
        morning:
          "Checkout after breakfast and continue toward Pahalgam (typically 4–5 hours with photo stops).",
        afternoon:
          "Stop at Pampore if saffron flowers are out (usually mid-Oct to Nov), then Awantipora ruins for stone-and-sky frames. Check in by the Lidder.",
        evening: "Riverside leaf colour and kahwa. Overnight Pahalgam.",
        imageKey: "tours/photography-autumn-chinar-tour-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Betaab and Aru · valley light day",
        morning:
          "Local union cab (paid locally) for Betaab Valley — autumn meadows and pine backdrops.",
        afternoon:
          "Continue to Aru for wider mountain compositions. Optional Baisaran if time allows.",
        evening: "Return for dinner. Overnight Pahalgam.",
        imageKey: "tours/photography-autumn-chinar-tour-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Return to Srinagar · boulevard chinars and crafts",
        morning:
          "Drive back to Srinagar (about 2.5–3 hours). Check into your return hotel.",
        afternoon:
          "Boulevard / Nigeen chinar stretches for street and lake frames, optional Shankaracharya for the wide panorama, then dry fruit and craft shopping.",
        evening: "Dinner and overnight Srinagar.",
        imageKey: "tours/photography-autumn-chinar-tour-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Departure transfer",
        morning:
          "Breakfast at the hotel. Keep a 3-hour buffer before domestic flights. Private transfer to Srinagar Airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/photography-autumn-chinar-tour-d6.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this window:</strong> October–November brings Kashmir’s famous chinar colour, clearer skies, and fewer crowds than summer. This circuit keeps the Classic Triangle shape but paces Day 1 and Day 5 for garden avenues and lake light, with Pampore saffron as a seasonal bonus when flowers are out.</p>",
      "<p><strong>Stays (5 nights):</strong> 1N Hotel Royal Batoo or similar near Dalgate · 1N Apple Tree Resorts or similar in Gulmarg · 2N White Villa Resort or similar by the Lidder · 1N Hotel Asian Park or similar on return. Optional deluxe houseboat upgrade on night 1.</p>",
      "<p><strong>What you get:</strong> private Innova or Dzire, breakfast and dinner at the hotel each night (MAP), airport transfers, and agreed golden-hour photo pauses. Gondola, Pahalgam union cab, and lunches remain local extras — listed before you confirm.</p>",
      "<p><strong>How to book:</strong> pick a start date inside the autumn window and send a request. Nothing is charged until you accept the confirmed trip.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 16499,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "When is chinar colour at its best?",
      "Is this a photography workshop?",
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
          "Gondola Phase I about ₹1,500–2,500; Pahalgam union cab about ₹2,000–3,500 for Aru + Betaab; lunch about ₹400–800 pp per day.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Flexible photo pauses at agreed viewpoints",
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
      "Foliage timing",
      "Autumn kit",
      "Fitness",
      "Documents",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Hill Stations", "Photography", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Shikara ride",
      "Golden-hour photo stops",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/photography-autumn-chinar-tour-cover.jpg",
    cover: "tours/photography-autumn-chinar-tour-cover.jpg",
    gallery: [
      "tours/photography-autumn-chinar-tour-g1.jpg",
      "tours/photography-autumn-chinar-tour-g2.jpg",
      "tours/photography-autumn-chinar-tour-g3.jpg",
      "tours/photography-autumn-chinar-tour-g4.jpg",
    ],
    seoImage: "tours/photography-autumn-chinar-tour-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Kashmir Autumn Chinar Photography Tour | 5N/6D",
    seoDescription:
      "Request the Photography & Autumn Chinar Tour — golden chinars, Dal Lake light, overnight Gulmarg and Pahalgam. Own cab, hotel breakfast & dinner, from ₹16,499 pp.",
    facebookTitle: "Photography & Autumn Chinar — Kashmir in colour",
    facebookDescription:
      "October–November chinar avenues, lake reflections, and quieter valleys with your own cab.",
    twitterTitle: "Autumn Chinar Kashmir | 5N/6D",
    twitterDescription:
      "Chinar colour · Gulmarg · Pahalgam with MAP meals. From ₹16,499 pp twin share.",
    published: true,
  },
};
