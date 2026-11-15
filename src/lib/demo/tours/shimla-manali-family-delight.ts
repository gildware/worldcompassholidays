/**
 * Locked-format tour — Shimla–Manali Family Delight (India Batch 1 #3).
 * Himachal staple: ridge walks, Kufri, Manali valleys, easy family pacing.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const shimlaManaliFamilyCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Family" },
  { kind: "style", title: "Hill Stations" },
  {
    kind: "faq",
    title: "Is this suitable for young children?",
    content:
      "Yes — drives are broken with photo stops, hotels are family rooms on request, and Day 4 keeps Solang optional so toddlers can stay at the hotel pool.",
  },
  {
    kind: "faq",
    title: "Do we start from Chandigarh or Delhi?",
    content:
      "Standard quote is Chandigarh pickup (airport or railway station). Delhi start adds one long transfer day — we price it separately if you prefer.",
  },
  {
    kind: "before_you_go",
    title: "Mountain roads",
    content:
      "Shimla–Manali involves winding ghat roads. Carry motion-sickness tablets if anyone needs them, and keep snacks for kids between meal stops.",
  },
  {
    kind: "include",
    title: "Kufri fun-ride stop (family hour)",
  },
];

export const tourShimlaManaliFamilyDelight: TourFormat = {
  slug: "shimla-manali-family-delight",
  general: {
    title: "Shimla–Manali Family Delight",
    summary:
      "Himachal’s family favourite — Shimla ridge, Kufri, and Manali meadows with gentle sightseeing. Private cab, twin share, from ₹19,999 a person (min. 2).",
    category: "Family",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 4,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["himachal", "shimla", "manali"],
    primaryDestinationSlug: "himachal",
    address: "Chandigarh Airport (IXC) or railway station pickup",
    mapLat: "31.1048",
    mapLng: "77.1734",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Chandigarh to Shimla · ridge welcome",
        morning:
          "Meet your driver at Chandigarh airport or station. Climb to Shimla (about 3.5–4 hours).",
        afternoon:
          "Check in on or near Mall Road. Easy walk on the traffic-free ridge.",
        evening: "Dinner at the hotel; overnight Shimla.",
        imageKey: "tours/shimla-manali-family-delight-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Shimla · Kufri and Jakhu views",
        morning:
          "Drive to Kufri for pony rides or the Himalayan Nature Park (entry paid locally).",
        afternoon:
          "Return via scandal point photo stop. Free Mall Road time for ice cream and souvenirs.",
        evening: "Second night Shimla.",
        imageKey: "tours/shimla-manali-family-delight-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Shimla to Manali · Beas valley",
        morning:
          "After breakfast, descend toward Mandi and climb into Manali (about 7–8 hours with breaks).",
        afternoon:
          "Photo halt at Pandoh Dam or Kullu shawl shops if children need a stretch.",
        evening: "Check in riverside. Dinner and overnight Manali.",
        imageKey: "tours/shimla-manali-family-delight-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Manali · Hadimba and old Manali",
        morning:
          "Visit Hadimba Devi Temple cedar grove and the Manu temple lane.",
        afternoon:
          "Stroll Old Manali cafés. Optional Solang Valley ropeway or zorbing (tickets extra) if weather is clear.",
        evening: "Family dinner; overnight Manali.",
        imageKey: "tours/shimla-manali-family-delight-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Naggar castle or relaxed Manali",
        morning:
          "Easy outing to Naggar Castle and Roerich art gallery, or a pool morning at the hotel if you prefer rest.",
        afternoon:
          "Pack for departure. Last-minute Mall Road Manali shopping.",
        evening: "Overnight Manali.",
        imageKey: "tours/shimla-manali-family-delight-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Manali to Chandigarh · departure",
        morning:
          "Breakfast and checkout. Drive to Chandigarh airport or station (about 7–8 hours — plan evening flights). Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/shimla-manali-family-delight-d6.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why families like this loop:</strong> you cover Himachal’s two most recognisable towns without high-altitude trekking. Drivers know kid-friendly stop timings and hotels accept adjoining rooms when available.</p>",
      "<p><strong>Stays (5 nights):</strong> 2N Shimla Mall Road hotel · 3N Manali Beas-side property (e.g. Snow Peak / similar category).</p>",
      "<p><strong>What you get:</strong> private Innova or equivalent, MAP meals, tolls, and a Kufri family stop baked into Day 2.</p>",
      "<p><strong>How to book:</strong> share children’s ages for rooming, pick a Chandigarh-friendly flight on Day 6, and send a request — we confirm hotels before payment.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 19999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is this suitable for young children?",
      "Do we start from Chandigarh or Delhi?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Are Solang activities included?",
        content:
          "Ropeway, skiing, and adventure sports in Solang are paid on the spot. We only include transfer and waiting time unless you preorder a bundle.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Chandigarh pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Kufri fun-ride stop (family hour)",
    ],
    excludeTitles: [
      "Flights / trains to Chandigarh",
      "Lunch (unless listed)",
      "Solang ropeway & adventure tickets",
      "Pony rides & park entry fees",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Mountain roads",
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
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/shimla-manali-family-delight-cover.jpg",
    cover: "tours/shimla-manali-family-delight-cover.jpg",
    gallery: [
      "tours/shimla-manali-family-delight-g1.jpg",
      "tours/shimla-manali-family-delight-g2.jpg",
      "tours/shimla-manali-family-delight-g3.jpg",
      "tours/shimla-manali-family-delight-g4.jpg",
    ],
    seoImage: "tours/shimla-manali-family-delight-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Shimla Manali Family Package | 5N/6D Himachal",
    seoDescription:
      "Request Shimla–Manali family tour — Kufri, Hadimba, private cab, MAP meals, from ₹19,999 pp.",
    facebookTitle: "Shimla–Manali Family Delight — ridges & meadows",
    facebookDescription:
      "Easy Himachal pacing for families. Own cab, hotel breakfast & dinner.",
    twitterTitle: "Shimla Manali Family | 5N/6D",
    twitterDescription:
      "Shimla · Kufri · Manali. From ₹19,999 pp twin share.",
    published: true,
  },
};
