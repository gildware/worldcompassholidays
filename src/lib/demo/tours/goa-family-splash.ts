/**
 * Locked-format tour — Goa Family Splash (Batch 3).
 * North Goa beaches, heritage morning, kid-friendly pacing.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const goaFamilySplashCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Family" },
  { kind: "style", title: "Family Friendly" },
  {
    kind: "faq",
    title: "Is a water park day available?",
    content:
      "Yes — Splashdown or city water parks near North Goa can be slotted on Day 2 afternoon as an optional extra (tickets paid locally). Standard quote keeps beach time unless you request the add-on.",
  },
  {
    kind: "before_you_go",
    title: "Beach safety",
    content:
      "Swim only in flagged zones and watch monsoon surf (June–September). Life jackets for boat days; reef-friendly sunscreen for kids.",
  },
  {
    kind: "facility",
    title: "Beach-side hotel (North Goa)",
  },
  {
    kind: "include",
    title: "Spice plantation lunch tour (Day 3)",
  },
];

export const tourGoaFamilySplash: TourFormat = {
  slug: "goa-family-splash",
  general: {
    title: "Goa Family Splash",
    summary:
      "North Goa beaches, splash time, and one heritage morning — kid-friendly private holiday from ₹14,999 pp (min. 2).",
    category: "Family",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 2,
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
        title: "Arrive · beach sundown",
        morning: "Airport pickup to North Goa hotel.",
        afternoon: "Pool or Candolim beach splash.",
        evening: "Beach dinner option; overnight North Goa.",
        imageKey: "tours/goa-family-splash-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Baga–Calangute coast",
        morning: "Morning swim in flagged zone.",
        afternoon: "Water sports optional (paid locally).",
        evening: "Family stroll; overnight North Goa.",
        imageKey: "tours/goa-family-splash-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Old Goa heritage",
        morning: "Basilica and Sé Cathedral.",
        afternoon: "Spice plantation lunch tour.",
        evening: "Last beach evening; overnight North Goa.",
        imageKey: "tours/goa-family-splash-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Checkout",
        morning: "Breakfast; airport drop. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/goa-family-splash-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>One base hotel keeps packing stress low. MAP available on request.</p>",
      "<p>Monsoon surf is strong — we adjust beach time seasonally.</p>",
      "<p><strong>Water park optional:</strong> Splashdown or similar can replace part of Day 2 — quoted as an extra, not in the base price.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 14999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is a water park day available?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Are water sports safe for children?",
        content:
          "Operators issue life jackets on banana boats and jet-skis. We recommend morning slots and parental supervision — tickets are always paid locally.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin / family rooms)",
      "Daily breakfast at hotel",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop (GOI or GOX)",
      "Spice plantation lunch tour (Day 3)",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Beach-side hotel (North Goa)",
    ],
    excludeTitles: [
      "Flights to Goa",
      "Dinner (unless MAP upgrade)",
      "Water sports & water park tickets",
      "Splashdown or city water park entry (optional extra)",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Beach safety",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Family Friendly", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "Beach-side hotel (North Goa)",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/goa-family-splash-cover.jpg",
    cover: "tours/goa-family-splash-cover.jpg",
    gallery: [
      "tours/goa-family-splash-g1.jpg",
      "tours/goa-family-splash-g2.jpg",
      "tours/goa-family-splash-g3.jpg",
      "tours/goa-family-splash-g4.jpg",
    ],
    seoImage: "tours/goa-family-splash-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Goa Family Splash | 3N/4D North Goa",
    seoDescription:
      "Goa family holiday — North Goa beaches, Old Goa morning, spice lunch, from ₹14,999 pp.",
    facebookTitle: "Goa Family Splash — beaches for all ages",
    facebookDescription: "One North Goa base with heritage day and private cab.",
    twitterTitle: "Goa Family Splash | 3N/4D",
    twitterDescription: "Beaches · Old Goa · kid pace. From ₹14,999 pp.",
    published: true,
  },
};