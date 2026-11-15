/**
 * Locked-format tour — Bodpathri Meadows Trek (Batch 3).
 * Grass bowls and tarn lakes behind Doodhpathri — mellow meadow trek with one high camp.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const bodpathriMeadowsTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Trekking & Camping" },
  {
    kind: "faq",
    title: "Where is Bodpathri and how long do we camp?",
    content:
      "Bodpathri is a grass bowl above the Doodhpathri picnic belt west of Srinagar. Expect one camp night at the tarn and hotel or guesthouse nights at Doodhpathri and Srinagar.",
  },
  {
    kind: "before_you_go",
    title: "Meadow trek kit",
    content:
      "Broken-in shoes, rain shell, and a warm layer for camp — nights cool even in summer. Avoid cotton base layers on climb day.",
  },
  {
    kind: "facility",
    title: "Trek guide and cook team",
  },
  {
    kind: "include",
    title: "Camping equipment (tent, sleeping bag, mat)",
  },
  {
    kind: "include",
    title: "Meals on trek days (B/L/D as per itinerary)",
  },
];

export const tourBodpathriMeadowsTrek: TourFormat = {
  slug: "bodpathri-meadows-trek",
  general: {
    title: "Bodpathri Meadows Trek",
    summary:
      "Grass bowls and tarn lakes behind Doodhpathri — a mellow meadow trek with one high camp. Srinagar transfers and twin-share rate from ₹9,999 a person (min. 2).",
    category: "Trekking",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 7,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "doodhpathri", "yusmarg"],
    primaryDestinationSlug: "doodhpathri",
    address: "Srinagar city / airport pickup",
    mapLat: "33.8536",
    mapLng: "74.5748",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Srinagar · drive Doodhpathri",
        morning:
          "Pickup from airport or Boulevard hotel. Scenic drive via Khan Sahib into the Doodhpathri picnic belt.",
        afternoon:
          "Gentle meadow stroll; meet pony men and distribute shared camping kit.",
        evening: "Guesthouse or camp near Doodhpathri — MAP dinner.",
        imageKey: "tours/bodpathri-meadows-trek-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Trek into Bodpathri bowl",
        morning:
          "After breakfast, foot trail climbs through pine to open grass. Packed lunch on the ridge.",
        afternoon:
          "Camp setup beside a shallow lake — time for barefoot wade if sun is warm.",
        evening: "Camp dinner and stargazing away from city glow.",
        imageKey: "tours/bodpathri-meadows-trek-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Meadow loop · return to Doodhpathri",
        morning: "Sunrise photo walk around the tarn. Begin descent after brunch.",
        afternoon: "Reach Doodhpathri base; hot tea and vehicle to Srinagar.",
        evening: "Overnight Srinagar hotel — MAP meals.",
        imageKey: "tours/bodpathri-meadows-trek-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Depart",
        morning: "Breakfast and airport transfer or city drop.",
        afternoon: "",
        evening: "",
        imageKey: "tours/bodpathri-meadows-trek-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Bodpathri:</strong> pairs well with a Srinagar long weekend — green lakes without boarding a flight to Leh.</p>",
      "<p><strong>Stays:</strong> 1N Doodhpathri area · 1N trek camp · 1N Srinagar.</p>",
      "<p><strong>What you get:</strong> Transfers, MAP meals on hotel nights, guide, cook, tents, and trail food.</p>",
      "<p><strong>How to book:</strong> tell us if you want a Srinagar shikara add-on — we quote it separately.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 9999,
    currency: "INR",
    discounts: [{ name: "Monsoon shoulder", type: "percent", value: 4 }],
  },
  details: {
    sharedFaqTitles: [
      "Where is Bodpathri and how long do we camp?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Can ponies carry our bags?",
        content:
          "Yes — pony hire on the meadow day is paid locally to the union rate. We help negotiate at the trailhead.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Trek guide and cook team",
      "Camping equipment (tent, sleeping bag, mat)",
      "Meals on trek days (B/L/D as per itinerary)",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Pony hire for baggage",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Meadow trek kit",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Hill Stations", "Trekking & Camping", "Private / Independent"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Trek guide and cook team",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/bodpathri-meadows-trek-cover.jpg",
    cover: "tours/bodpathri-meadows-trek-cover.jpg",
    gallery: [
      "tours/bodpathri-meadows-trek-g1.jpg",
      "tours/bodpathri-meadows-trek-g2.jpg",
      "tours/bodpathri-meadows-trek-g3.jpg",
      "tours/bodpathri-meadows-trek-g4.jpg",
    ],
    seoImage: "tours/bodpathri-meadows-trek-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Bodpathri Meadows Trek | Doodhpathri Lake Camp",
    seoDescription:
      "Bodpathri grassland trek behind Doodhpathri — 3N/4D with camp night and Srinagar transfers, from ₹9,999 pp.",
    facebookTitle: "Bodpathri Meadows Trek — lakes behind Doodhpathri",
    facebookDescription: "Moderate meadow trek with one camp night. Guide and kit included.",
    twitterTitle: "Bodpathri Meadows Trek | 3N/4D",
    twitterDescription: "Doodhpathri · meadow camp · from ₹9,999 pp.",
    published: true,
  },
};