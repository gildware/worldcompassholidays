/**
 * Locked-format tour — Nafran Valley Trek (Batch 2 #1).
 * Pahalgam–Aru alpine meadow trek — quieter KGL-style valley in 3N/4D.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const nafranValleyTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Trekking & Camping" },
  {
    kind: "faq",
    title: "How is Nafran different from the Great Lakes trek?",
    content:
      "Nafran sits east of Aru in the same alpine belt but on a tighter 3N/4D loop — one camp night in the meadow bowl instead of a full week of passes. Ideal when you want KGL scenery without seven days off work.",
  },
  {
    kind: "faq",
    title: "Do we camp or use lodges on the trail?",
    content:
      "One night is a proper trek camp in the Nafran meadow with crew tents and cook. Bookend nights are hotels in Pahalgam for hot showers before and after the climb.",
  },
  {
    kind: "before_you_go",
    title: "Aru trail fitness",
    content:
      "Day 2 is a full carry day from Aru toward Nafran — expect 6–8 hours with moderate grade. Break in hiking shoes and add light rain gear; afternoon cloud bursts are common in summer.",
  },
  {
    kind: "facility",
    title: "Trek guide and camp cook crew",
  },
  {
    kind: "include",
    title: "Camping equipment (tent, sleeping bag, mat) on trek night",
  },
  {
    kind: "include",
    title: "Trek guide and trail meals on camp days",
  },
];

export const tourNafranValleyTrek: TourFormat = {
  slug: "nafran-valley-trek",
  general: {
    title: "Nafran Valley Trek",
    summary:
      "Alpine meadows above Aru — guided Nafran valley camp without the full Great Lakes week. Srinagar transfers, Pahalgam hotels, twin-share trek rate, from ₹10,999 a person (min. 2).",
    category: "Trekking",
    availability: "dates",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 7,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "pahalgam"],
    primaryDestinationSlug: "pahalgam",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0795",
    mapLng: "75.3150",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · Pahalgam and Aru briefing",
        morning:
          "Airport pickup and drive to Pahalgam. Short transfer to Aru village; meet trek guide and review Nafran route.",
        afternoon:
          "Gear check and acclimatisation stroll along the Aru stream. Ponies can be reserved for baggage (paid locally).",
        evening: "MAP dinner at the Pahalgam hotel. Early night before trail day.",
        imageKey: "tours/nafran-valley-trek-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Trek Aru toward Nafran · camp",
        morning:
          "Early breakfast and packed lunch. Climb through pine and open meadow toward the Nafran bowl at steady trek pace.",
        afternoon:
          "Reach camp site in the valley floor. Hot tea and camp dinner with the cook crew.",
        evening: "Overnight tents in Nafran meadow.",
        imageKey: "tours/nafran-valley-trek-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Valley hour · descend to Pahalgam",
        morning:
          "Sunrise photos in the amphitheatre of peaks. Optional short ridge walk if weather is clear.",
        afternoon:
          "Break camp and descend the Aru trail. Hot shower at Pahalgam hotel.",
        evening: "Recovery dinner and overnight Pahalgam.",
        imageKey: "tours/nafran-valley-trek-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Srinagar airport transfer",
        morning:
          "Breakfast and checkout. Drive to Srinagar Airport with a 3-hour buffer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/nafran-valley-trek-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Nafran:</strong> repeat Kashmir visitors use it when Great Lakes permits are full — the same alpine pasture energy above Aru in a long weekend footprint.</p>",
      "<p><strong>Stays:</strong> 2N hotel in Pahalgam (twin share) · 1N trek camp in Nafran meadow with crew.</p>",
      "<p><strong>What you get:</strong> Srinagar transfers, MAP hotel meals, licensed trek guide, cook, camping kit, and trail meals on Days 2–3.</p>",
      "<p><strong>Moderate grade:</strong> sustained uphill with day packs — reasonable fitness required. No Sonamarg jeep leg; the trail starts from Aru only.</p>",
      "<p><strong>How to book:</strong> share fitness level and preferred July–September window. Nothing is charged until the crew and camp dates are confirmed.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 10999,
    currency: "INR",
    discounts: [{ name: "Group of 6 trekkers", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "How is Nafran different from the Great Lakes trek?",
      "Do we camp or use lodges on the trail?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Can ponies carry our bags?",
        content:
          "Yes — ponies from Aru can take shared kit or personal duffels for a local fee. Tell us when you request so the guide books numbers.",
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
      "Camping equipment (tent, sleeping bag, mat) on trek night",
      "Trek guide and trail meals on camp days",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed on trail)",
      "Tips & personal expenses",
      "Travel insurance",
      "Pony hire for baggage",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Aru trail fitness",
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
      "Trek guide and camp cook crew",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/nafran-valley-trek-cover.jpg",
    cover: "tours/nafran-valley-trek-cover.jpg",
    gallery: [
      "tours/nafran-valley-trek-g1.jpg",
      "tours/nafran-valley-trek-g2.jpg",
      "tours/nafran-valley-trek-g3.jpg",
      "tours/nafran-valley-trek-g4.jpg",
    ],
    seoImage: "tours/nafran-valley-trek-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Nafran Valley Trek | 3N/4D Aru Alpine Camp",
    seoDescription:
      "Request the Nafran Valley trek — Aru meadow camp, Pahalgam hotels, guided crew. From ₹10,999 pp twin share.",
    facebookTitle: "Nafran Valley Trek — Aru meadows without the KGL week",
    facebookDescription:
      "Moderate 3N/4D Kashmir trek with one camp night and Srinagar transfers.",
    twitterTitle: "Nafran Valley Trek | 3N/4D",
    twitterDescription:
      "Pahalgam · Aru · Nafran camp. From ₹10,999 pp.",
    published: true,
  },
};