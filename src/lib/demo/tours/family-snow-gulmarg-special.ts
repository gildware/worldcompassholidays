/**
 * Locked-format tour — Family Snow Gulmarg Special (Batch Kashmir #2).
 * Winter snow play for kids, easy meadow days, short Srinagar finish — 3N/4D.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const familySnowGulmargCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Family" },
  {
    kind: "faq",
    title: "Is this safe for young children in snow?",
    content:
      "Yes at easy pace. Days stay on the Gulmarg meadow and nursery slopes — no steep skiing required. Sleds and snow play are optional and paid locally. Dress kids in waterproof layers; we suggest age 5+ for full days outside.",
  },
  {
    kind: "faq",
    title: "Which months run this package?",
    content:
      "Typically 15 December through 15 March when meadow snow is reliable. Shoulder weeks depend on snowfall — we confirm road and snow reports before you lock flights.",
  },
  {
    kind: "before_you_go",
    title: "Kids winter kit",
    content:
      "Waterproof gloves, extra socks, sunscreen on snow, and snacks for the meadow. Hire sleds locally — no need to pack bulky gear.",
  },
  {
    kind: "include",
    title: "Family snow play time on Gulmarg meadow",
  },
  {
    kind: "include",
    title: "Kid-friendly hotel rooms (twin + extra bed on request)",
  },
];

export const tourFamilySnowGulmargSpecial: TourFormat = {
  slug: "family-snow-gulmarg-special",
  general: {
    title: "Family Snow Gulmarg Special",
    summary:
      "Winter wonderland for families — two nights Gulmarg meadow snow play, one Srinagar garden and Shikara night. Private cab, twin share, from ₹14,999 a person (min. 2).",
    category: "Family",
    availability: "dates",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "tangmarg"],
    primaryDestinationSlug: "gulmarg",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0484",
    mapLng: "74.3805",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · transfer to Gulmarg",
        morning:
          "Meet your driver at Srinagar Airport. Scenic drive via Tangmarg — allow extra time if roads are snowy.",
        afternoon:
          "Check in at a family-friendly hotel near the meadow. Short orientation walk; hot chocolate and rest.",
        evening: "Dinner at the hotel. Overnight Gulmarg.",
        imageKey: "tours/family-snow-gulmarg-special-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Meadow snow day · sleds and photos",
        morning:
          "After breakfast, head to the meadow for snowman building, gentle slopes, and optional sled hire (local pay).",
        afternoon:
          "Warm up at the hotel. Optional short Gondola Phase I ride for views if weather and queues suit families (tickets extra).",
        evening: "Dinner and overnight Gulmarg.",
        imageKey: "tours/family-snow-gulmarg-special-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Second snow morning · drive to Srinagar",
        morning:
          "Free snow play or souvenir shop time. Checkout and descend to Srinagar.",
        afternoon:
          "Mughal garden stroll (Nishat or Shalimar) at kid pace. One-hour Shikara on Dal Lake.",
        evening: "Dinner at the hotel. Overnight Srinagar.",
        imageKey: "tours/family-snow-gulmarg-special-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Departure transfer",
        morning:
          "Breakfast and transfer to Srinagar Airport with a 3-hour buffer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/family-snow-gulmarg-special-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why families like this:</strong> two full snow days in Gulmarg without a long valley circuit. Srinagar gardens and Shikara close the trip on a softer note before the flight home.</p>",
      "<p><strong>Stays:</strong> 2N Apple Tree Resorts or similar (Gulmarg) · 1N Hotel Royal Batoo or similar (Srinagar). Extra beds for children confirmed in your quote.</p>",
      "<p><strong>What you get:</strong> private Innova for luggage and car seats you bring, MAP meals, airport transfers, Shikara ride, and dedicated meadow time on the itinerary.</p>",
      "<p><strong>Winter note:</strong> book inside the Dec–Mar snow window. Gondola and sleds remain optional local extras.</p>",
      "<p><strong>How to book:</strong> pick a start date in season and tell us childrens’ ages in the request.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 14999,
    currency: "INR",
    discounts: [{ name: "Family of 5+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is this safe for young children in snow?",
      "Which months run this package?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Are ski lessons included?",
        content:
          "No — this is snow play, not ski school. Beginner lessons can be quoted as an add-on if teens want them.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "One-hour Shikara on Dal Lake (Day 3)",
      "Meet-and-greet at Srinagar Airport",
      "Family snow play time on Gulmarg meadow",
      "Kid-friendly hotel rooms (twin + extra bed on request)",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Gulmarg Gondola tickets",
      "Sled / pony hire on meadow",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Kids winter kit",
      "Winter kit",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
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
    banner: "tours/family-snow-gulmarg-special-cover.jpg",
    cover: "tours/family-snow-gulmarg-special-cover.jpg",
    gallery: [
      "tours/family-snow-gulmarg-special-g1.jpg",
      "tours/family-snow-gulmarg-special-g2.jpg",
      "tours/family-snow-gulmarg-special-g3.jpg",
      "tours/family-snow-gulmarg-special-g4.jpg",
    ],
    seoImage: "tours/family-snow-gulmarg-special-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Family Snow Gulmarg Special | 3N/4D Winter Kids",
    seoDescription:
      "Request a family Gulmarg snow break — meadow play, Srinagar gardens and Shikara. Private cab, MAP meals, from ₹14,999 pp.",
    facebookTitle: "Family Snow Gulmarg Special — easy winter for kids",
    facebookDescription:
      "Two meadow snow days plus Srinagar lake finish. Private Innova, hotel MAP.",
    twitterTitle: "Family Snow Gulmarg | 3N/4D",
    twitterDescription:
      "Kids snow play · Shikara · gardens. From ₹14,999 pp.",
    published: true,
  },
};
