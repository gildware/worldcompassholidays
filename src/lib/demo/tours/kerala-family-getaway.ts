/**
 * Locked-format tour — Kerala Family Getaway (Batch 2 #5).
 * Munnar, Thekkady, Alleppey — gentle family pacing with private cab.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const keralaFamilyGetawayCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Family" },
  { kind: "style", title: "Family" },
  {
    kind: "faq",
    title: "Is the houseboat safe for children?",
    content:
      "Day cruise uses wide canals with life jackets on request. Overnight boat can swap to a lagoon hotel if you prefer — tell us when you book.",
  },
  {
    kind: "faq",
    title: "How long are the drives?",
    content:
      "Kochi–Munnar is about 4–5 hours with one waterfall stop. Munnar–Thekkady is 3–4 hours. We build lunch breaks so kids are not in the car all day.",
  },
  {
    kind: "before_you_go",
    title: "Family pacing",
    content:
      "One driver and one hotel base per region keep packing simple. Pack light day bags for houseboat afternoon — main luggage stays in the cab.",
  },
  {
    kind: "facility",
    title: "Alleppey day houseboat lunch cruise",
  },
  {
    kind: "include",
    title: "Periyar boat ride coordination (Thekkady)",
  },
];

export const tourKeralaFamilyGetaway: TourFormat = {
  slug: "kerala-family-getaway",
  general: {
    title: "Kerala Family Getaway",
    summary:
      "Tea hills, spice forest, and a wide-canal houseboat day — Munnar, Thekkady, and Alleppey with family pacing. Private cab, twin share from ₹22,999 a person (min. 2).",
    category: "Family",
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
    destinationSlugs: ["kerala", "cochin", "munnar", "thekkady", "alleppey"],
    primaryDestinationSlug: "kerala",
    address: "Cochin Airport (COK) pickup",
    mapLat: "9.9312",
    mapLng: "76.2673",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kochi · Fort Kochi stroll",
        morning:
          "Meet your driver at Cochin Airport. Transfer to Fort Kochi or Ernakulam hotel.",
        afternoon:
          "Chinese fishing nets and lane stroll at kid pace. Café lunch on your own.",
        evening: "MAP dinner at the hotel. Overnight Kochi.",
        imageKey: "tours/kerala-family-getaway-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Kochi to Munnar · waterfall stop",
        morning:
          "After breakfast, drive toward Munnar with Cheeyappara or Valara photo stop when flowing.",
        afternoon:
          "Check in at tea-estate resort. Easy lawn time for children.",
        evening: "Family dinner at resort. Overnight Munnar.",
        imageKey: "tours/kerala-family-getaway-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Munnar viewpoints · tea country",
        morning:
          "Tea museum or factory slot when open. Mattupetty Dam viewpoint if skies are clear.",
        afternoon:
          "Echo Point or estate walk. Pool or rest time at the resort.",
        evening: "Second night Munnar.",
        imageKey: "tours/kerala-family-getaway-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Munnar to Thekkady · spice country",
        morning:
          "Scenic descent toward Periyar. Spice plantation visit with guided walk.",
        afternoon:
          "Check in near Thekkady. Kerala Forest boat ride coordination on Periyar Lake.",
        evening: "MAP dinner. Overnight Thekkady.",
        imageKey: "tours/kerala-family-getaway-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Thekkady to Alleppey · houseboat day",
        morning:
          "Drive to Alleppey backwaters (about 3–4 hours).",
        afternoon:
          "Board day houseboat for wide-canal cruise and lunch on board.",
        evening: "Disembark to lagoon-side hotel. Overnight Alleppey.",
        imageKey: "tours/kerala-family-getaway-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Alleppey · Cochin departure",
        morning:
          "Breakfast and checkout. Drive to Cochin Airport (about 1.5 hours). Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/kerala-family-getaway-d6.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Family pacing:</strong> one driver, MAP dinners, and a day houseboat instead of tight city hops — kids get pool time in Munnar and boat novelty without overnight on water unless you ask.</p>",
      "<p><strong>Stays (5 nights):</strong> 1N Kochi · 2N Munnar resort · 1N Thekkady · 1N Alleppey lagoon hotel.</p>",
      "<p><strong>What you get:</strong> private Innova for the full loop, Periyar boat coordination, Alleppey day houseboat with lunch, and driver who knows school-holiday rhythms.</p>",
      "<p><strong>How to book:</strong> share child ages for life-jacket sizing and rooming. Payment after written confirmation.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 22999,
    currency: "INR",
    discounts: [{ name: "Group of 5+ family", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is the houseboat safe for children?",
      "How long are the drives?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can we skip Thekkady for more beach time?",
        content:
          "The circuit is built around Munnar–Thekkady–Alleppey balance. Kovalam extension can be quoted as add-on nights — ask in your request.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin / family rooms)",
      "Breakfast + dinner each night (MAP)",
      "Private vehicle for full circuit",
      "Airport pickup & drop",
      "Periyar boat ride coordination (Thekkady)",
      "Alleppey day houseboat lunch cruise",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights to Kochi",
      "Lunch except houseboat day",
      "Tips & personal expenses",
      "Travel insurance",
      "Park entry above quoted coordination",
      "Elephant rides or paid activities",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Family pacing",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Family", "Hill Stations", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Alleppey day houseboat lunch cruise",
      "Airport transfers",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/kerala-family-getaway-cover.jpg",
    cover: "tours/kerala-family-getaway-cover.jpg",
    gallery: [
      "tours/kerala-family-getaway-g1.jpg",
      "tours/kerala-family-getaway-g2.jpg",
      "tours/kerala-family-getaway-g3.jpg",
      "tours/kerala-family-getaway-g4.jpg",
    ],
    seoImage: "tours/kerala-family-getaway-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Kerala Family Getaway | 5N/6D Munnar Thekkady Alleppey",
    seoDescription:
      "Kerala family holiday — tea hills, Periyar boat, houseboat day. Private cab from ₹22,999 pp.",
    facebookTitle: "Kerala Family Getaway — hills and backwaters",
    facebookDescription:
      "Munnar, Thekkady, and Alleppey with family pacing and day houseboat.",
    twitterTitle: "Kerala Family | 5N/6D",
    twitterDescription:
      "Munnar · Thekkady · Alleppey. From ₹22,999 pp.",
    published: true,
  },
};