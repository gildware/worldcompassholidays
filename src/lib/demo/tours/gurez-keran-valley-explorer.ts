/**
 * Locked-format tour — Gurez & Keran Valley Explorer (Batch Kashmir #3).
 * LOC Kishanganga, Razdan Pass, frontier villages — 4N/5D moderate.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const gurezKeranCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Offbeat" },
  {
    kind: "style",
    title: "Offbeat / Frontier",
  },
  {
    kind: "faq",
    title: "Do I need special permits for Gurez?",
    content:
      "Indian nationals usually travel with a valid photo ID; permits can change with security alerts. We file whatever is current for your travel dates and share the status before you pay.",
  },
  {
    kind: "faq",
    title: "How rough is the road over Razdan Pass?",
    content:
      "Expect a full day of mountain driving — asphalt with occasional rough patches, snow risk in late spring. The cab is high-clearance where possible; carry snacks and motion sickness tabs if sensitive.",
  },
  {
    kind: "before_you_go",
    title: "Frontier connectivity",
    content:
      "Phone data can be patchy beyond Bandipora. Download offline maps and share your hotel numbers with family before Razdan.",
  },
  {
    kind: "include",
    title: "Permit assistance for Gurez sector (as applicable)",
  },
];

export const tourGurezKeranValleyExplorer: TourFormat = {
  slug: "gurez-keran-valley-explorer",
  general: {
    title: "Gurez & Keran Valley Explorer",
    summary:
      "North Kashmir offbeat — Razdan Pass, Gurez on the Kishanganga, Keran LOC viewpoints. Private cab from Srinagar, twin share, from ₹18,999 a person (min. 2).",
    category: "Offbeat",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 7,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "gurez", "keran", "srinagar"],
    primaryDestinationSlug: "gurez",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.5836",
    mapLng: "74.6425",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · briefing for north road",
        morning:
          "Meet your driver at Srinagar Airport. Transfer to a hotel near Dalgate and collect ID copies for permit filing.",
        afternoon:
          "Light Srinagar walk — Boulevard or a garden — to recover from travel before the long drive north.",
        evening: "Dinner and overnight Srinagar.",
        imageKey: "tours/gurez-keran-valley-explorer-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Razdan Pass · enter Gurez",
        morning:
          "Early start for Bandipora and the Razdan Pass climb. Photo stops at high viewpoints.",
        afternoon:
          "Descend into Dawar, Gurez. Check in at a simple valley hotel or guesthouse.",
        evening: "Dinner and overnight Gurez.",
        imageKey: "tours/gurez-keran-valley-explorer-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Kishanganga villages · Habba Khatoon peak views",
        morning:
          "Explore Tulail or nearby hamlets along the Kishanganga — wooden homes and army-secured frontier scenery.",
        afternoon:
          "Return to Dawar; optional walk along the river if weather is clear.",
        evening: "Overnight Gurez.",
        imageKey: "tours/gurez-keran-valley-explorer-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Keran viewpoint · descend toward Srinagar",
        morning:
          "Drive to Keran sector for LOC-facing valley views (security halts possible — patience required).",
        afternoon:
          "Begin descent via Razdan toward Srinagar or Bandipora-side overnight if the road is long.",
        evening: "Dinner en route hotel. Overnight Srinagar or Bandipora area.",
        imageKey: "tours/gurez-keran-valley-explorer-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Srinagar buffer · airport transfer",
        morning:
          "Breakfast. If already in Srinagar, free time; otherwise final transfer into the city.",
        afternoon:
          "Airport drop with 3-hour buffer. Tour ends.",
        evening: "",
        imageKey: "tours/gurez-keran-valley-explorer-d5.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why go north:</strong> Gurez and Keran show a Kashmir most triangle packages skip — Kishanganga blue water, log houses, and Razdan drama without ski-resort crowds.</p>",
      "<p><strong>Stays:</strong> 1N Srinagar (3-star) · 2N Dawar / Gurez guesthouse category · 1N Srinagar or Bandipora buffer before flight. Expect simpler rooms in Gurez — clean, heated where possible.</p>",
      "<p><strong>What you get:</strong> private Innova or Xylo for mountain roads, MAP meals where hotels serve dinner, airport transfers, and permit assistance for the Gurez sector.</p>",
      "<p><strong>Moderate rating:</strong> long drive days and basic frontier amenities — not suited to travellers who need luxury spa pacing.</p>",
      "<p><strong>How to book:</strong> send passport-style ID details early; nothing is charged until permits and hotels are confirmed.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 18999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Do I need special permits for Gurez?",
      "How rough is the road over Razdan Pass?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Can Keran be skipped if the road is closed?",
        content:
          "Yes — we keep Gurez nights and add a Srinagar buffer day or a Lolab / Wular side trip if Keran is closed. No refund for missed viewpoints beyond unused hotel nights already negotiated.",
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
      "Permit assistance for Gurez sector (as applicable)",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Frontier connectivity",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Hill Stations", "Offbeat / Frontier", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/gurez-keran-valley-explorer-cover.jpg",
    cover: "tours/gurez-keran-valley-explorer-cover.jpg",
    gallery: [
      "tours/gurez-keran-valley-explorer-g1.jpg",
      "tours/gurez-keran-valley-explorer-g2.jpg",
      "tours/gurez-keran-valley-explorer-g3.jpg",
      "tours/gurez-keran-valley-explorer-g4.jpg",
    ],
    seoImage: "tours/gurez-keran-valley-explorer-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Gurez & Keran Valley Explorer | 4N/5D Offbeat Kashmir",
    seoDescription:
      "Request Gurez and Keran — Razdan Pass, Kishanganga villages, LOC viewpoints. Private cab, MAP meals, from ₹18,999 pp.",
    facebookTitle: "Gurez & Keran Valley Explorer — north Kashmir",
    facebookDescription:
      "Frontier valleys beyond the triangle. Private mountain cab, permit help.",
    twitterTitle: "Gurez Keran Explorer | 4N/5D",
    twitterDescription:
      "Razdan · Kishanganga · Keran. From ₹18,999 pp.",
    published: true,
  },
};
