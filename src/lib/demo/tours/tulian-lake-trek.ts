/**
 * Locked-format tour — Tulian Lake Trek (Batch Kashmir #5).
 * Pahalgam alpine lake camping trek — 3N/4D moderate.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const tulianLakeTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  {
    kind: "style",
    title: "Trekking & Camping",
  },
  {
    kind: "faq",
    title: "How long is the trek to Tulian Lake?",
    content:
      "Usually one long day up from Pahalgam side and a shorter descent next day — roughly 11–13 km each way depending on the trailhead. Ponies can be hired locally for baggage or riding (extra).",
  },
  {
    kind: "faq",
    title: "What camping gear is provided?",
    content:
      "We include tents, sleeping bags, mats, and a cook crew for the overnight camp near Tulian. Bring your own torch, blister kit, and a warm layer rated to about 0 °C at altitude.",
  },
  {
    kind: "before_you_go",
    title: "Trek kit list",
    content:
      "Broken-in shoes with ankle support, rain layer, two-litre water capacity, and sunscreen. No cotton base layers for the climb day.",
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
    title: "Trek guide and camp meals on trail",
  },
];

export const tourTulianLakeTrek: TourFormat = {
  slug: "tulian-lake-trek",
  general: {
    title: "Tulian Lake Trek",
    summary:
      "Alpine lake above Pahalgam — guided trek, one camp night at Tulian, hotel bookends. Private transfers, twin share trek rate, from ₹9,999 a person (min. 2).",
    category: "Trekking",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 7,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "pahalgam"],
    primaryDestinationSlug: "pahalgam",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0159",
    mapLng: "75.3140",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · Pahalgam trek briefing",
        morning:
          "Airport pickup and drive to Pahalgam. Meet your trek guide; gear check and route brief.",
        afternoon:
          "Acclimatisation walk along the Lidder; early dinner and sleep before climb day.",
        evening: "Overnight hotel in Pahalgam.",
        imageKey: "tours/tulian-lake-trek-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Trek to Tulian Lake · camp",
        morning:
          "Early start with packed breakfast. Climb through pine and meadow to Tulian Lake (moderate grade, steady pace).",
        afternoon:
          "Lake shore lunch. Set camp nearby; hot tea and simple trek dinner with the crew.",
        evening: "Overnight camp at Tulian.",
        imageKey: "tours/tulian-lake-trek-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Descend to Pahalgam · recovery night",
        morning:
          "Break camp after sunrise photos. Descend to Pahalgam with lunch en route.",
        afternoon:
          "Hot shower at the hotel. Free evening — no long drives.",
        evening: "Dinner and overnight Pahalgam.",
        imageKey: "tours/tulian-lake-trek-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Airport transfer",
        morning:
          "Breakfast and checkout. Drive to Srinagar Airport with 3-hour buffer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/tulian-lake-trek-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Tulian:</strong> a true alpine lake above Pahalgam without the week-long Great Lakes commitment — ideal if you have four days and want camp under stars.</p>",
      "<p><strong>Stays:</strong> 2N hotel in Pahalgam (pre/post trek) · 1N trek camp at Tulian with crew. Twin share in hotel; tents are two-person unless you request single tent (extra).</p>",
      "<p><strong>What you get:</strong> Srinagar transfers, MAP hotel meals, trek guide, cook, camping kit, and trail meals on Days 2–3.</p>",
      "<p><strong>Moderate grade:</strong> full-day climb with packs — reasonable fitness required. Ponies for hire can lighten loads (local pay).</p>",
      "<p><strong>How to book:</strong> share fitness level and shoe size. Nothing is charged until the trek window and crew are confirmed.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 9999,
    currency: "INR",
    discounts: [{ name: "Group of 6 trekkers", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "How long is the trek to Tulian Lake?",
      "What camping gear is provided?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Can the trek run in winter?",
        content:
          "No — camp is summer / early autumn only when the trail is snow-free. Winter requests shift to a hotel-only Pahalgam plan or another trek.",
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
      "Camping equipment (tent, sleeping bag, mat)",
      "Trek guide and camp meals on trail",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Pony hire for baggage or riding",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Trek kit list",
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
    banner: "tours/tulian-lake-trek-cover.jpg",
    cover: "tours/tulian-lake-trek-cover.jpg",
    gallery: [
      "tours/tulian-lake-trek-g1.jpg",
      "tours/tulian-lake-trek-g2.jpg",
      "tours/tulian-lake-trek-g3.jpg",
      "tours/tulian-lake-trek-g4.jpg",
    ],
    seoImage: "tours/tulian-lake-trek-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Tulian Lake Trek | 3N/4D Pahalgam Alpine Camp",
    seoDescription:
      "Request the Tulian Lake trek — guided climb, camp night, Pahalgam hotels. Gear and trail meals included, from ₹9,999 pp.",
    facebookTitle: "Tulian Lake Trek — alpine camp above Pahalgam",
    facebookDescription:
      "Moderate 3N/4D trek with crew and camping kit. Airport transfers included.",
    twitterTitle: "Tulian Lake Trek | 3N/4D",
    twitterDescription:
      "Pahalgam · Tulian camp · guide included. From ₹9,999 pp.",
    published: true,
  },
};
