/**
 * Locked-format tour — Srinagar Weekend Getaway (Batch A #3).
 * Short 2N/3D city break: gardens, Shikara, old city / crafts.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const srinagarWeekendCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "City trips" },
  {
    kind: "faq",
    title: "Is this only Srinagar — no Gulmarg or Pahalgam?",
    content:
      "Yes. This is a short city break focused on Dal Lake, Mughal gardens, and Srinagar crafts. Gulmarg or Pahalgam day trips can be quoted as add-ons if you extend a night.",
  },
  {
    kind: "faq",
    title: "Can I arrive on a Friday evening flight?",
    content:
      "Yes — Day 1 is flexible. Late arrivals get hotel check-in and a short lake stroll; gardens and Shikara shift to Day 2. Tell us your flight time in the request.",
  },
  {
    kind: "before_you_go",
    title: "Short-break pacing",
    content:
      "Two nights go quickly. Keep Day 3 departure with a 3-hour airport buffer. If you want a houseboat night, say so when you request — we swap one hotel night.",
  },
  {
    kind: "include",
    title: "Half-day old city / Boulevard craft stop",
  },
];

export const tourSrinagarWeekendGetaway: TourFormat = {
  slug: "srinagar-weekend-getaway",
  general: {
    title: "Srinagar Weekend Getaway",
    summary:
      "A compact 2 nights in Srinagar — Mughal gardens, Dal Lake Shikara, and Boulevard crafts. Private cab, twin share, from ₹7,999 a person (min. 2).",
    category: "City trips",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 2,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "srinagar"],
    primaryDestinationSlug: "srinagar",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · gardens and lake hour",
        morning:
          "Meet your driver at Srinagar Airport and transfer to a centrally located hotel near Dalgate (or a deluxe houseboat if you upgraded). Settle in.",
        afternoon:
          "Visit Nishat and Shalimar (or Chashme Shahi if time is short) at an easy pace.",
        evening:
          "Private one-hour Shikara on Dal Lake. Dinner at the hotel; overnight Srinagar.",
        imageKey: "tours/srinagar-weekend-getaway-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Lake views, old city colour, crafts",
        morning:
          "Optional Shankaracharya Temple for the wide lake panorama (steps involved — skip if you prefer a gentler morning).",
        afternoon:
          "Boulevard / Lal Chowk for dry fruit, papier-mâché, and pashmina with vetted shop suggestions on request. Free time for kahwa or a second lake stroll.",
        evening: "Dinner and overnight Srinagar.",
        imageKey: "tours/srinagar-weekend-getaway-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Departure transfer",
        morning:
          "Breakfast at the hotel. Keep a 3-hour buffer before domestic flights. Private transfer to Srinagar Airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/srinagar-weekend-getaway-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this short break:</strong> you get Kashmir’s signature lake and garden moments without a long valley circuit. Ideal for a long weekend, a stopover, or couples who want Srinagar only.</p>",
      "<p><strong>Stays (2 nights):</strong> Hotel Royal Batoo or similar near Dalgate · or Hotel Asian Park category. Optional deluxe houseboat upgrade for one or both nights.</p>",
      "<p><strong>What you get:</strong> private Innova or Dzire for transfers and sightseeing, breakfast and dinner at the hotel each night (MAP), airport pickup and drop, and a one-hour Shikara on Day 1.</p>",
      "<p><strong>How to book:</strong> pick a start date and party size, then send a request. Nothing is charged until you accept the confirmed trip.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 7999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is this only Srinagar — no Gulmarg or Pahalgam?",
      "Can I arrive on a Friday evening flight?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Which hotels are used?",
        content:
          "Hotel Royal Batoo or Hotel Asian Park category near Dalgate, or the same 3-star band if a date is sold out. Houseboat upgrades are confirmed in writing before payment.",
      },
      {
        title: "Can we add Gulmarg as a day trip?",
        content:
          "Yes — a Gulmarg day excursion (Gondola tickets extra) can be quoted if you stay a third night or replace Day 2 crafts. Ask in your request.",
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
      "Half-day old city / Boulevard craft stop",
      "Meet-and-greet at Srinagar Airport",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Gulmarg Gondola tickets",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Short-break pacing",
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
    banner: "tours/srinagar-weekend-getaway-cover.jpg",
    cover: "tours/srinagar-weekend-getaway-cover.jpg",
    gallery: [
      "tours/srinagar-weekend-getaway-g1.jpg",
      "tours/srinagar-weekend-getaway-g2.jpg",
      "tours/srinagar-weekend-getaway-g3.jpg",
      "tours/srinagar-weekend-getaway-g4.jpg",
    ],
    seoImage: "tours/srinagar-weekend-getaway-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Srinagar Weekend Getaway | 2N/3D Dal Lake & Gardens",
    seoDescription:
      "Request a Srinagar weekend — Mughal gardens, Shikara, Boulevard crafts. Own cab, hotel breakfast & dinner, from ₹7,999 pp.",
    facebookTitle: "Srinagar Weekend Getaway — 2 nights by the lake",
    facebookDescription:
      "Gardens, Shikara, and crafts without the long valley drives. Private cab, MAP meals.",
    twitterTitle: "Srinagar Weekend | 2N/3D",
    twitterDescription:
      "Dal Lake · Mughal gardens · crafts. From ₹7,999 pp twin share.",
    published: true,
  },
};
