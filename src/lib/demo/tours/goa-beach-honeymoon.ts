/**
 * Locked-format tour — Goa Beach Honeymoon (Batch 3).
 * South Goa sands, Old Goa heritage morning, unhurried couple pace.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const goaBeachHoneymoonCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Honeymoon" },
  { kind: "style", title: "Romantic" },
  {
    kind: "faq",
    title: "North or South Goa?",
    content:
      "This honeymoon bases South Goa. North Goa party nights can be quoted as a swap.",
  },
  {
    kind: "before_you_go",
    title: "Beach couple safety",
    content:
      "Swim only in flagged zones. Reef-friendly sunscreen and hydration — afternoon sun is strong even in winter.",
  },
  {
    kind: "facility",
    title: "South Goa beach resort",
  },
  {
    kind: "include",
    title: "Spice plantation entry & lunch (Day 3)",
  },
  {
    kind: "include",
    title: "Candlelit dinner (Day 3 evening)",
  },
];

export const tourGoaBeachHoneymoon: TourFormat = {
  slug: "goa-beach-honeymoon",
  general: {
    title: "Goa Beach Honeymoon",
    summary:
      "Sunset sails and sand between palms — three nights in South Goa with heritage and spice morning. Private cab, twin share, from ₹15,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 3,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["goa"],
    primaryDestinationSlug: "goa",
    address: "Goa Airport (GOI) or Mopa (GOX) pickup",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · South Goa check-in",
        morning: "Pickup at Dabolim or Mopa. Transfer to a South Goa beach resort.",
        afternoon: "Pool and first walk to Palolem or Agonda — your pick within drive range.",
        evening: "Beach shack dinner or hotel MAP meal. Overnight South Goa.",
        imageKey: "tours/goa-beach-honeymoon-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Beach day · no agenda",
        morning: "Sleep late; swim when lifeguards flag the zone green.",
        afternoon: "Couples kayak or dolphin watch cruise optional (paid locally).",
        evening: "Sunset from the shack. Overnight South Goa.",
        imageKey: "tours/goa-beach-honeymoon-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Old Goa · spice plantation",
        morning:
          "Drive north early — Basilica of Bom Jesus and Sé Cathedral before crowds.",
        afternoon: "Ponda spice plantation walk and lunch on tour.",
        evening: "Candlelit dinner arrangement. Return south for overnight.",
        imageKey: "tours/goa-beach-honeymoon-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast. Transfer to airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/goa-beach-honeymoon-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why South Goa:</strong> Quieter sands than the north party strip — you get palm shade, long sunsets, and still one cultured morning in Old Goa.</p>",
      "<p><strong>Stays:</strong> 3N South Goa beach resort, MAP. King bed on request.</p>",
      "<p><strong>Includes:</strong> spice plantation visit with lunch, one candlelit dinner, private Innova or sedan.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 15999,
    currency: "INR",
    discounts: [{ name: "Weekday check-in", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "North or South Goa?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can we add a sunset cruise?",
        content:
          "River or sea sunset cruises from South Goa are popular add-ons — we quote operator rates before you confirm.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop (GOI or GOX)",
      "Spice plantation entry & lunch (Day 3)",
      "Candlelit dinner (Day 3 evening)",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights to Goa",
      "Lunch (unless listed)",
      "Water sports & sunset cruise tickets",
      "Couples massage or sailing (optional extras)",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Beach couple safety",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Romantic", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "South Goa beach resort",
      "MAP meals (B/D)",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/goa-beach-honeymoon-cover.jpg",
    cover: "tours/goa-beach-honeymoon-cover.jpg",
    gallery: [
      "tours/goa-beach-honeymoon-g1.jpg",
      "tours/goa-beach-honeymoon-g2.jpg",
      "tours/goa-beach-honeymoon-g3.jpg",
      "tours/goa-beach-honeymoon-g4.jpg",
    ],
    seoImage: "tours/goa-beach-honeymoon-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Goa Beach Honeymoon | 3N/4D South Goa",
    seoDescription:
      "Goa honeymoon — South Goa beaches, Old Goa, spice lunch, from ₹15,999 pp.",
    facebookTitle: "Goa Beach Honeymoon — South Goa sands",
    facebookDescription: "Palolem pace with heritage morning and candlelit dinner.",
    twitterTitle: "Goa Honeymoon | 3N/4D",
    twitterDescription: "South Goa · Old Goa · spice. From ₹15,999 pp.",
    published: true,
  },
};