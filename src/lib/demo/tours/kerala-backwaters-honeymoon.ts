/**
 * Locked-format tour — Kerala Backwaters Honeymoon (India Batch 1 #2).
 * Munnar hills + Alleppey houseboat — classic romantic circuit.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const keralaBackwatersHoneymoonCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Honeymoon" },
  { kind: "style", title: "Romantic" },
  {
    kind: "faq",
    title: "Is the houseboat a full overnight?",
    content:
      "Yes — one night on a deluxe air-conditioned houseboat with attached bathroom, candlelight dinner on board, and a slow cruise through Alleppey’s inner canals. Checkout is the next morning before you drive to Kochi.",
  },
  {
    kind: "faq",
    title: "Can we request flower bed or cake on arrival?",
    content:
      "Honeymoon décor (flowers, cake, fruit basket) can be pre-ordered in Munnar and on the houseboat at extra cost — tell us in the request and we confirm rates.",
  },
  {
    kind: "before_you_go",
    title: "Houseboat rhythm",
    content:
      "The boat moves slowly and moors at night — perfect for unwinding, not for tight sightseeing schedules. Pack light for the overnight bag; main luggage stays in the vehicle.",
  },
  {
    kind: "facility",
    title: "Deluxe AC houseboat (1 night)",
  },
  {
    kind: "include",
    title: "One night deluxe AC houseboat with attached bath",
  },
  {
    kind: "include",
    title: "Candlelight dinner on houseboat",
  },
];

export const tourKeralaBackwatersHoneymoon: TourFormat = {
  slug: "kerala-backwaters-honeymoon",
  general: {
    title: "Kerala Backwaters Honeymoon",
    summary:
      "Tea hills and backwater calm — Cochin, Munnar, and a romantic Alleppey houseboat night. Private cab, twin share, from ₹24,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 5,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kerala", "cochin", "munnar", "alleppey"],
    primaryDestinationSlug: "kerala",
    address: "Cochin Airport (COK) pickup",
    mapLat: "9.9312",
    mapLng: "76.2673",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kochi · Fort Kochi evening",
        morning:
          "Meet your driver at Cochin Airport. Transfer to Fort Kochi or Marine Drive hotel. Settle in.",
        afternoon:
          "Stroll Chinese fishing nets and Bastion Bungalow area. Café stop for a relaxed lunch (on your own).",
        evening:
          "Kathakali or cultural show optional (tickets extra). Dinner at the hotel; overnight Kochi.",
        imageKey: "tours/kerala-backwaters-honeymoon-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Kochi to Munnar · spice and tea country",
        morning:
          "After breakfast, drive toward Munnar (about 4–5 hours with photo stops). Pause at Cheeyappara or Valara falls in season.",
        afternoon:
          "Check in at a valley-view resort. Easy walk in the estate surroundings.",
        evening: "Couples dinner at the resort; overnight Munnar.",
        imageKey: "tours/kerala-backwaters-honeymoon-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Munnar · tea gardens and viewpoints",
        morning:
          "Visit a tea museum or factory slot when open. Photo stop at Mattupetty or Echo Point if weather is clear.",
        afternoon:
          "Return to the resort for downtime — spa or ayurveda on request (paid locally).",
        evening: "Second night Munnar with a quiet hillside evening.",
        imageKey: "tours/kerala-backwaters-honeymoon-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Munnar to Alleppey · houseboat cruise",
        morning:
          "Checkout and descend to the coast (about 4–5 hours). Board your deluxe AC houseboat by early afternoon.",
        afternoon:
          "Cruise narrow canals past paddy fields and village life. Crew serves lunch on board.",
        evening:
          "Moor at dusk; candlelight dinner on the deck. Overnight on the houseboat.",
        imageKey: "tours/kerala-backwaters-honeymoon-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Disembark · Kochi departure",
        morning:
          "Breakfast on the boat. Disembark by late morning. Drive to Cochin Airport (about 1.5 hours). Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/kerala-backwaters-honeymoon-d5.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why couples pick this route:</strong> Munnar’s misty mornings and Alleppey’s unhurried waterways balance each other — you get both hill romance and backwater intimacy in one neat arc from Cochin.</p>",
      "<p><strong>Stays (4 nights):</strong> 1N Fort Kochi harbour hotel · 2N Munnar valley resort (e.g. Amber Dale / similar) · 1N deluxe AC houseboat Alleppey with attached bath.</p>",
      "<p><strong>What you get:</strong> private cab for the full circuit, MAP meals at hotels, lunch and dinner on the houseboat night, and driver who knows honeymoon pacing.</p>",
      "<p><strong>How to book:</strong> pick dates at least five days out, share flight times, and request any décor add-ons. Payment only after written confirmation.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 24999,
    currency: "INR",
    discounts: [{ name: "Off-season (Jun–Sep)", type: "percent", value: 8 }],
  },
  details: {
    sharedFaqTitles: [
      "Is the houseboat a full overnight?",
      "Can we request flower bed or cake on arrival?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Is alcohol allowed on the houseboat?",
        content:
          "Policies vary by operator. We book boats that allow beer/wine on request where legal — confirm when you send your request.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at hotels (MAP)",
      "One night deluxe AC houseboat with attached bath",
      "Lunch + dinner on houseboat day",
      "Candlelight dinner on houseboat",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop at COK",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights / trains to Kochi",
      "Lunches on non-houseboat days (unless listed)",
      "Kathakali / spa / optional activities",
      "Honeymoon décor add-ons unless quoted",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Houseboat rhythm",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Romantic", "Family Friendly", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Deluxe AC houseboat (1 night)",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/kerala-backwaters-honeymoon-cover.jpg",
    cover: "tours/kerala-backwaters-honeymoon-cover.jpg",
    gallery: [
      "tours/kerala-backwaters-honeymoon-g1.jpg",
      "tours/kerala-backwaters-honeymoon-g2.jpg",
      "tours/kerala-backwaters-honeymoon-g3.jpg",
      "tours/kerala-backwaters-honeymoon-g4.jpg",
    ],
    seoImage: "tours/kerala-backwaters-honeymoon-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Kerala Backwaters Honeymoon | 4N/5D Munnar & Alleppey",
    seoDescription:
      "Request a Kerala honeymoon — Munnar tea hills, Alleppey houseboat night, private cab, from ₹24,999 pp.",
    facebookTitle: "Kerala Backwaters Honeymoon — tea hills & houseboat",
    facebookDescription:
      "Munnar mornings and an Alleppey night on the water. Private cab, MAP meals.",
    twitterTitle: "Kerala Honeymoon | 4N/5D",
    twitterDescription:
      "Cochin · Munnar · Alleppey houseboat. From ₹24,999 pp twin share.",
    published: true,
  },
};
