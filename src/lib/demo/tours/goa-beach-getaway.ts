/**
 * Locked-format tour — Goa Beach Getaway (India Batch 1 #4).
 * Year-round leisure: north beaches, Old Goa heritage, easy coastal pace.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const goaBeachGetawayCatalogExtras: SampleCatalogRef[] = [
  {
    kind: "faq",
    title: "North or South Goa focus?",
    content:
      "This package bases you in North Goa (Candolim–Calangute band) for beach access, with one heritage morning in Old Goa. South Goa resort nights can be quoted as a swap.",
  },
  {
    kind: "before_you_go",
    title: "Beach safety",
    content:
      "Swim only in flagged zones and watch monsoon surf (June–September). Carry reef-friendly sunscreen and keep hydrated — afternoon sun is strong even in winter.",
  },
  {
    kind: "facility",
    title: "Beach-side hotel (North Goa)",
  },
];

export const tourGoaBeachGetaway: TourFormat = {
  slug: "goa-beach-getaway",
  general: {
    title: "Goa Beach Getaway",
    summary:
      "Sun, sand, and spice — three nights in North Goa with an Old Goa heritage morning. Private cab, twin share, from ₹12,999 a person (min. 2).",
    category: "Leisure",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 2,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["goa"],
    primaryDestinationSlug: "goa",
    address: "Goa Airport (GOI) Dabolim or Mopa (GOX) pickup",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Goa · first beach sunset",
        morning:
          "Meet your driver at Dabolim (GOI) or Manohar International (GOX). Transfer to your North Goa hotel.",
        afternoon:
          "Unwind by the pool or a short walk to Candolim beach.",
        evening:
          "Sunset on the sand and dinner at a beach shack or hotel — your choice. Overnight North Goa.",
        imageKey: "tours/goa-beach-getaway-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "North beaches · Baga and Anjuna",
        morning:
          "Relaxed morning swim or yoga on the beach.",
        afternoon:
          "Drive the coastal strip — Baga, Calangute, and Anjuna flea market (Wednesday best). Water sports optional (paid locally).",
        evening: "Free evening for live music lanes. Overnight North Goa.",
        imageKey: "tours/goa-beach-getaway-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Old Goa · spice and heritage",
        morning:
          "Visit Basilica of Bom Jesus and Sé Cathedral in Old Goa before heat builds.",
        afternoon:
          "Stop at a Ponda-area spice plantation with guided walk and lunch on tour.",
        evening:
          "Return north for a final beach stroll. Overnight North Goa.",
        imageKey: "tours/goa-beach-getaway-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Checkout · airport drop",
        morning:
          "Breakfast at the hotel. Last-minute feni or cashew shopping if time allows. Private transfer to GOI or GOX. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/goa-beach-getaway-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this short Goa break works:</strong> you stay put in one beach belt instead of packing every night — perfect for long weekends, friend groups, or couples who want downtime with one heritage day mixed in.</p>",
      "<p><strong>Stays (3 nights):</strong> North Goa 3-star beach walk hotel (e.g. Riviera / similar Candolim category) with breakfast included; dinner on your own or upgraded MAP on request.</p>",
      "<p><strong>What you get:</strong> private sedan for airport hops and the Old Goa / spice circuit, plantation lunch on Day 3, and a driver who knows beach parking timings.</p>",
      "<p><strong>How to book:</strong> tell us which airport you land at, pick MAP if you want dinners included, and send a request — hotels confirm before payment.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 12999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "North or South Goa focus?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What is the best time for this tour?",
    ],
    extraFaqs: [
      {
        title: "Is breakfast only or MAP?",
        content:
          "Standard quote is CP (breakfast). MAP with dinner is available — mention it in your request for a revised rate.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Daily breakfast at hotel",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop (GOI or GOX)",
      "Spice plantation visit with guided tour",
      "Plantation lunch on Day 3",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights to Goa",
      "Dinner (unless MAP upgrade)",
      "Water sports & beach shack meals",
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
    banner: "tours/goa-beach-getaway-cover.jpg",
    cover: "tours/goa-beach-getaway-cover.jpg",
    gallery: [
      "tours/goa-beach-getaway-g1.jpg",
      "tours/goa-beach-getaway-g2.jpg",
      "tours/goa-beach-getaway-g3.jpg",
      "tours/goa-beach-getaway-g4.jpg",
    ],
    seoImage: "tours/goa-beach-getaway-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Goa Beach Getaway | 3N/4D North Goa Holiday",
    seoDescription:
      "Request a Goa beach break — Candolim base, Old Goa churches, spice farm lunch, private cab, from ₹12,999 pp.",
    facebookTitle: "Goa Beach Getaway — sand, spice & Old Goa",
    facebookDescription:
      "Three easy nights in North Goa with a heritage morning. Private transfers.",
    twitterTitle: "Goa Beach Getaway | 3N/4D",
    twitterDescription:
      "Beaches · Old Goa · spice plantation. From ₹12,999 pp.",
    published: true,
  },
};
