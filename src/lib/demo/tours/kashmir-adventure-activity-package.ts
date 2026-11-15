/**
 * Locked-format tour — Kashmir Adventure Activity Package (Batch Kashmir #4).
 * Rafting, Gondola, ATV in a short triangle — 4N/5D; activities often local pay.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const kashmirAdventureCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Adventure" },
  {
    kind: "style",
    title: "Adventure Sports",
  },
  {
    kind: "faq",
    title: "Which activities are included vs paid locally?",
    content:
      "Lidder white-water rafting (guided stretch) is included as quoted when the river is runnable. Gulmarg Gondola and Sonamarg/Pahalgam ATV sessions are arranged but tickets or hire fees are paid on the spot unless your quote states otherwise.",
  },
  {
    kind: "faq",
    title: "When is rafting open on the Lidder?",
    content:
      "Usually late April through early September when water levels are safe. Outside the window we swap Day 3 to a river-side trek or Betaab excursion and credit rafting if prepaid.",
  },
  {
    kind: "before_you_go",
    title: "Adventure fitness",
    content:
      "Rafting and ATV need basic mobility — you must fit life jackets and helmets. Tell us injuries or heart conditions in the request.",
  },
  {
    kind: "facility",
    title: "Rafting safety briefing",
  },
  {
    kind: "facility",
    title: "ATV hire coordination",
  },
  {
    kind: "include",
    title: "Guided Lidder rafting stretch (seasonal)",
  },
  {
    kind: "exclude",
    title: "Gulmarg Gondola tickets",
  },
  {
    kind: "exclude",
    title: "ATV hire charges",
  },
];

export const tourKashmirAdventureActivityPackage: TourFormat = {
  slug: "kashmir-adventure-activity-package",
  general: {
    title: "Kashmir Adventure Activity Package",
    summary:
      "Action-packed triangle — Srinagar, Gulmarg Gondola day, Lidder rafting, ATV add-on slot. Private cab, twin share, from ₹16,999 a person (min. 2).",
    category: "Adventure",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 5,
    isFeatured: false,
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
        title: "Arrive Srinagar · gardens and lake",
        morning:
          "Airport pickup and hotel check-in near Dalgate.",
        afternoon:
          "Nishat or Shalimar gardens and a one-hour Shikara — light start before adventure days.",
        evening: "Dinner and overnight Srinagar.",
        imageKey: "tours/kashmir-adventure-activity-package-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Gulmarg · Gondola and meadow",
        morning:
          "Drive to Gulmarg. Safety brief; optional Gondola Phase I ride for alpine views (tickets extra).",
        afternoon:
          "Meadow walk or winter sports zone depending on season. Return or overnight Gulmarg per hotel plan.",
        evening: "Dinner. Overnight Gulmarg or return Srinagar (as confirmed).",
        imageKey: "tours/kashmir-adventure-activity-package-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Pahalgam · Lidder rafting",
        morning:
          "Transfer to Pahalgam. Change into rafting gear; guided stretch on the Lidder when river is open.",
        afternoon:
          "Dry off, lunch (extra), optional Betaab union cab if energy permits.",
        evening: "Overnight Pahalgam.",
        imageKey: "tours/kashmir-adventure-activity-package-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "ATV slot · return Srinagar",
        morning:
          "ATV hire coordination on meadows near Pahalgam or Sonamarg-side track (hire paid locally, ~30–45 minutes seat time).",
        afternoon:
          "Drive back to Srinagar. Pack and unwind.",
        evening: "Farewell dinner. Overnight Srinagar.",
        imageKey: "tours/kashmir-adventure-activity-package-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Departure transfer",
        morning:
          "Breakfast and airport transfer with 3-hour buffer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/kashmir-adventure-activity-package-d5.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why adventure travellers book this:</strong> you still sleep across Srinagar, Gulmarg, and Pahalgam, but each day has a headline activity instead of passive sightseeing only.</p>",
      "<p><strong>Stays (4 nights):</strong> 2N Srinagar · 1N Gulmarg or Srinagar base · 1N Pahalgam — exact split confirmed in writing. MAP meals at hotels.</p>",
      "<p><strong>Included activity:</strong> guided Lidder rafting when the river is runnable. Gondola and ATV are arranged with known vendors; tickets and hire are usually paid locally — typical ranges shared before you confirm.</p>",
      "<p><strong>Safety:</strong> rafting operator provides life jackets and helmets; ATV routes are beginner-grade unless you request advanced (extra).</p>",
      "<p><strong>How to book:</strong> share body weights for rafting and any medical notes. Nothing is charged until the activity calendar is confirmed.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 16999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Which activities are included vs paid locally?",
      "When is rafting open on the Lidder?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "What should I wear for rafting?",
        content:
          "Quick-dry clothes, secure footwear that can get wet, and a spare outfit in the cab. Operators provide buoyancy aids — cotton heavy layers are not ideal.",
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
      "Guided Lidder rafting stretch (seasonal)",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Gulmarg Gondola tickets",
      "ATV hire charges",
      "Pahalgam union sightseeing cabs",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Adventure fitness",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Hill Stations", "Adventure Sports", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Rafting safety briefing",
      "ATV hire coordination",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/kashmir-adventure-activity-package-cover.jpg",
    cover: "tours/kashmir-adventure-activity-package-cover.jpg",
    gallery: [
      "tours/kashmir-adventure-activity-package-g1.jpg",
      "tours/kashmir-adventure-activity-package-g2.jpg",
      "tours/kashmir-adventure-activity-package-g3.jpg",
      "tours/kashmir-adventure-activity-package-g4.jpg",
    ],
    seoImage: "tours/kashmir-adventure-activity-package-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Kashmir Adventure Activity Package | 4N/5D Raft Gondola ATV",
    seoDescription:
      "Request Kashmir adventure — Lidder rafting, Gulmarg Gondola day, ATV slot, triangle cab. MAP meals, from ₹16,999 pp.",
    facebookTitle: "Kashmir Adventure Activity Package — raft, ride, gondola",
    facebookDescription:
      "Triangle pacing with headline activities. Rafting included when river is open.",
    twitterTitle: "Kashmir Adventure | 4N/5D",
    twitterDescription:
      "Rafting · Gondola · ATV triangle. From ₹16,999 pp.",
    published: true,
  },
};
