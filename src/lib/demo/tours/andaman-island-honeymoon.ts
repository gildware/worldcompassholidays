/**
 * Locked-format tour — Andaman Island Honeymoon (Batch 2 #3).
 * Port Blair and Havelock beaches — ferry, Radhanagar, slow island pace.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const andamanIslandHoneymoonCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Honeymoon" },
  { kind: "style", title: "Romantic" },
  {
    kind: "faq",
    title: "Are inter-island ferries included?",
    content:
      "Standard-class Makruzz or Nautika seats Port Blair ↔ Havelock are coordinated and held when you confirm dates. Upgrades to premium class are quoted on request.",
  },
  {
    kind: "faq",
    title: "Can we add scuba or a private beach dinner?",
    content:
      "Discover scuba and candle beach dinners in Havelock are popular add-ons — we quote operator rates before you pay the main trip.",
  },
  {
    kind: "before_you_go",
    title: "Island ferry rhythm",
    content:
      "Ferry days need soft bags and 30 minutes early at the jetty. Monsoon months may shuffle sailings — we rebook the next available slot at no agency fee.",
  },
  {
    kind: "facility",
    title: "Beach resort (Havelock)",
  },
  {
    kind: "include",
    title: "Standard ferry Port Blair ↔ Havelock",
  },
];

export const tourAndamanIslandHoneymoon: TourFormat = {
  slug: "andaman-island-honeymoon",
  general: {
    title: "Andaman Island Honeymoon",
    summary:
      "Turquoise Havelock and Port Blair harbour — Radhanagar sunsets, ferry coordination, beach resort nights. Twin share from ₹32,999 a person (min. 2).",
    category: "Honeymoon",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 7,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["andaman", "port-blair", "havelock"],
    primaryDestinationSlug: "andaman",
    address: "Veer Savarkar International Airport (IXZ) Port Blair pickup",
    mapLat: "11.6234",
    mapLng: "92.7265",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Port Blair · harbour light",
        morning:
          "Airport pickup and check-in near Corbyn's Cove or Aberdeen Bazaar.",
        afternoon:
          "Cellular Jail visit when open. Quiet walk at Corbyn's Cove.",
        evening:
          "Optional Light & Sound show (tickets extra). Seafood or hotel dinner; overnight Port Blair.",
        imageKey: "tours/andaman-island-honeymoon-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Ferry to Havelock · first beach",
        morning:
          "Transfer to Phoenix Bay jetty for the Havelock ferry (timing on voucher).",
        afternoon:
          "Resort check-in. Introductory stroll on Vijay Nagar or beach in front of the property.",
        evening: "Couples dinner at the resort. Overnight Havelock.",
        imageKey: "tours/andaman-island-honeymoon-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Radhanagar · sand and reef colours",
        morning:
          "Late morning at Radhanagar Beach (Beach No. 7) when shade is easier.",
        afternoon:
          "Pool or spa time at the resort. Optional snorkel shore session (operator extra).",
        evening: "Sunset at Radhanagar or quiet resort evening. Overnight Havelock.",
        imageKey: "tours/andaman-island-honeymoon-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Slow Havelock · return to Port Blair",
        morning:
          "Unhurried beach hour or kayak when conditions allow.",
        afternoon:
          "Ferry back to Port Blair. Check-in for the final night.",
        evening:
          "Optional Chidiyatapu sunset if ferry timing allows, else harbour stroll. Overnight Port Blair.",
        imageKey: "tours/andaman-island-honeymoon-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning:
          "Breakfast and airport transfer with a 2-hour buffer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/andaman-island-honeymoon-d5.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this arc:</strong> Havelock delivers the postcard Radhanagar sunsets; Port Blair bookends keep flights simple without island-hopping overload.</p>",
      "<p><strong>Stays (4 nights):</strong> 2N Port Blair harbour hotel · 2N Havelock beach resort (premium sea-view category where available).</p>",
      "<p><strong>What you get:</strong> private cab on both islands, standard ferry seats both ways, MAP or CP meals as quoted, and honeymoon pacing notes to the resort.</p>",
      "<p><strong>How to book:</strong> share travel dates at least a week out — ferry inventory moves fast in peak season. Payment only after written confirmation.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 32999,
    currency: "INR",
    discounts: [{ name: "Off-season (May–Sep sailings)", type: "percent", value: 6 }],
  },
  details: {
    sharedFaqTitles: [
      "Are inter-island ferries included?",
      "Can we add scuba or a private beach dinner?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Do we need a Restricted Area Permit?",
        content:
          "Indian nationals only need photo ID for Havelock. Foreign passport holders need RAP on arrival — we assist at the airport counter when you land.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner as per meal plan quoted",
      "Private vehicle on Port Blair and Havelock",
      "Airport pickup & drop",
      "Standard ferry Port Blair ↔ Havelock",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights to Port Blair",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Scuba, snorkel boats, Light & Sound tickets",
      "Ferry class upgrades",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Island ferry rhythm",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Romantic", "Beach", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Beach resort (Havelock)",
      "Airport transfers",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/andaman-island-honeymoon-cover.jpg",
    cover: "tours/andaman-island-honeymoon-cover.jpg",
    gallery: [
      "tours/andaman-island-honeymoon-g1.jpg",
      "tours/andaman-island-honeymoon-g2.jpg",
      "tours/andaman-island-honeymoon-g3.jpg",
      "tours/andaman-island-honeymoon-g4.jpg",
    ],
    seoImage: "tours/andaman-island-honeymoon-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Andaman Island Honeymoon | 4N/5D Havelock & Port Blair",
    seoDescription:
      "Andaman honeymoon — Radhanagar beach, ferries included, twin share from ₹32,999 pp.",
    facebookTitle: "Andaman Island Honeymoon — Havelock sunsets",
    facebookDescription:
      "Port Blair and Havelock with ferry coordination and beach resort nights.",
    twitterTitle: "Andaman Honeymoon | 4N/5D",
    twitterDescription:
      "Radhanagar · ferries · Port Blair. From ₹32,999 pp.",
    published: true,
  },
};