/**
 * Locked-format tour — Nag Tibba Trek (Batch 1 India Set B #1).
 * Weekend trek from Mussoorie base: Pantwari trail, summit camp, Dehradun return.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const nagTibbaTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Adventure" },
  {
    kind: "faq",
    title: "Is this suitable for first-time trekkers?",
    content:
      "Yes, with reasonable fitness. Nag Tibba is a moderate short trek with one summit day and one camping night. We carry shared camping kit; you only need a day pack on the trail.",
  },
  {
    kind: "faq",
    title: "What camping and trek gear is provided?",
    content:
      "Tents, sleeping bags with liners, mats, and shared trek toilet tent on the camp night are included. Rent trekking poles if you want them — tell us in the request. Personal boots, warm layers, and a headlamp are your responsibility.",
  },
  {
    kind: "before_you_go",
    title: "Trail fitness",
    content:
      "Expect 4–6 hours of walking on Day 2 with steady uphill. Jog or brisk-walk in the two weeks before you travel. Skip if you have untreated knee or heart issues.",
  },
  {
    kind: "include",
    title: "Shared camping equipment (tent, bag, mat) on trek night",
  },
  {
    kind: "include",
    title: "Licensed trek guide & support crew on trail",
  },
  {
    kind: "exclude",
    title: "Porter for personal backpack (optional hire)",
  },
  { kind: "facility", title: "Licensed trek guide" },
  { kind: "facility", title: "Camping equipment" },
  { kind: "include", title: "Accommodation as per itinerary (lodge + shared camp)" },
  { kind: "include", title: "Meals on trek and at lodge as per plan (B/L/D on trail days)" },
  { kind: "include", title: "Private vehicle Dehradun ↔ Pantwari & Mussoorie stops" },
  { kind: "include", title: "Licensed trek guide & camp support crew" },
  { kind: "include", title: "Shared camping equipment (tent, bag, mat) on trek night" },
  { kind: "exclude", title: "Personal trekking poles, boots, or jackets" },
  { kind: "exclude", title: "Tips for guide and camp crew" },
];

export const tourNagTibbaTrek: TourFormat = {
  slug: "nag-tibba-trek",
  general: {
    title: "Nag Tibba Trek",
    summary:
      "A Mussoorie weekend on Nag Tibba — Pantwari trail, summit sunrise camp, and Dehradun pickup. Guided trek with shared camping kit, from ₹6,999 a person (min. 2).",
    category: "Trekking",
    availability: "dates",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["mussoorie", "uttarakhand", "dehradun"],
    primaryDestinationSlug: "mussoorie",
    address: "Dehradun railway station or Jolly Grant (DED) pickup",
    mapLat: "30.4598",
    mapLng: "78.0644",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Dehradun · Mussoorie buffer · drive to Pantwari",
        morning:
          "Meet your driver at Dehradun railway station or Jolly Grant Airport (timing on your ticket). Drive toward Mussoorie for a tea stop and gear check.",
        afternoon:
          "Continue to Pantwari village on the Nag Tibba road. Short acclimatisation walk; pack lunch or simple village meal. Briefing with your trek guide on trail pace and camp rules.",
        evening:
          "Dinner at a village lodge or campsite near the trailhead. Early night — trail starts after breakfast tomorrow.",
        imageKey: "tours/nag-tibba-trek-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Trek to summit meadow · Nag Tibba top",
        morning:
          "After breakfast, start the climb through oak and rhododendron toward the Nag Tibba ridge. Steady pace with rest stops; reach the summit meadow camp by early afternoon.",
        afternoon:
          "Hike to Nag Tibba top (3,022 m) for Garhwal snow peaks on a clear day. Descend to camp, hot tea, and time to dry socks.",
        evening:
          "Camp dinner under the stars. Overnight in shared tents (sleeping bags provided).",
        imageKey: "tours/nag-tibba-trek-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Descend Pantwari · Mussoorie · departure",
        morning:
          "Breakfast at camp, break tents, and descend the same trail to Pantwari. Meet your vehicle and transfer toward Dehradun.",
        afternoon:
          "Optional short Mall Road stop in Mussoorie if your train or flight allows. Drop at Dehradun station or airport — tour ends.",
        evening: "",
        imageKey: "tours/nag-tibba-trek-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this trek:</strong> Nag Tibba is the closest real summit weekend from Delhi and Dehradun — big views without a week off work. You get a proper camp night and a guided trail, not a self-planned cab drop.</p>",
      "<p><strong>Stays (2 nights):</strong> Night 1 lodge or fixed camp near Pantwari · Night 2 alpine camp on the Nag Tibba meadow (twin-share tents).</p>",
      "<p><strong>What you get:</strong> Dehradun pickup and drop, transfers to Pantwari, licensed trek guide, cook and camp crew, shared tents and sleeping bags on trek night, and meals as listed on the trail and at the lodge.</p>",
      "<p><strong>How to book:</strong> choose a start date and party size, note your arrival time in Dehradun, and send a request. Nothing is charged until you accept the confirmed departure.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 6999,
    currency: "INR",
    discounts: [{ name: "Group of 8+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is this suitable for first-time trekkers?",
      "What camping and trek gear is provided?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can we start from Mussoorie instead of Dehradun?",
        content:
          "Yes — if you are already in Mussoorie, we pick you up there and adjust Day 1 driving. Tell us in the request so the guide meets you at the right hotel.",
      },
      {
        title: "What about rain or snow on the trail?",
        content:
          "June–September needs a light rain shell; December–February may have snow near the top — micro-spikes recommended, which we can arrange locally. Unsafe weather may shorten the summit push; safety calls are final.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (lodge + shared camp)",
      "Meals on trek and at lodge as per plan (B/L/D on trail days)",
      "Private vehicle Dehradun ↔ Pantwari & Mussoorie stops",
      "Licensed trek guide & camp support crew",
      "Shared camping equipment (tent, bag, mat) on trek night",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Personal trekking poles, boots, or jackets",
      "Porter for personal backpack (optional hire)",
      "Tips for guide and camp crew",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Trail fitness",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Adventure", "Private / Independent", "Hill Stations"],
    facilityTitles: ["Private cab", "Licensed trek guide", "Camping equipment", "24×7 helpline"],
  },
  images: {
    banner: "tours/nag-tibba-trek-cover.jpg",
    cover: "tours/nag-tibba-trek-cover.jpg",
    gallery: [
      "tours/nag-tibba-trek-g1.jpg",
      "tours/nag-tibba-trek-g2.jpg",
      "tours/nag-tibba-trek-g3.jpg",
      "tours/nag-tibba-trek-g4.jpg",
    ],
    seoImage: "tours/nag-tibba-trek-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Nag Tibba Trek | 2N/3D Weekend from Mussoorie",
    seoDescription:
      "Request a Nag Tibba weekend trek — Pantwari trail, summit camp, guided crew. From ₹6,999 pp with shared camping kit.",
    facebookTitle: "Nag Tibba Trek — Mussoorie weekend summit",
    facebookDescription:
      "Short Garhwal trek with camp night and Dehradun transfers. Moderate pace, small groups.",
    twitterTitle: "Nag Tibba Trek | 2N/3D",
    twitterDescription:
      "Pantwari · summit meadow · Mussoorie buffer. From ₹6,999 pp.",
    published: true,
  },
};
