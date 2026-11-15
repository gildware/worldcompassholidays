/**
 * Locked-format tour — Goecha La Trek (Batch 3).
 * Kanchenjunga balcony — Yuksom trail through Dzongri and Samiti Lake.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const goechaLaTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Trekking & Camping" },
  {
    kind: "faq",
    title: "Does Goecha La need prior high-altitude trekking?",
    content:
      "Yes. You sleep around 4,700 m near Samiti Lake before the pass viewpoint. Prior multi-day trekking above 3,500 m is strongly recommended.",
  },
  {
    kind: "faq",
    title: "What camping gear is provided?",
    content:
      "Tents, sleeping bags, mats, and kitchen crew on camp nights. You carry a day pack with layers, rain shell, and at least two litres of water capacity.",
  },
  {
    kind: "before_you_go",
    title: "Sikkim permit paperwork",
    content:
      "Indian nationals need photo ID for Kanchenjunga National Park entry. Foreign nationals need additional Sikkim permits — send passport scans 21 days ahead.",
  },
  {
    kind: "facility",
    title: "Licensed trek guide & camp crew",
  },
  {
    kind: "include",
    title: "Sikkim Kanchenjunga National Park entry as quoted",
  },
];

export const tourGoechaLaTrek: TourFormat = {
  slug: "goecha-la-trek",
  general: {
    title: "Goecha La Trek",
    summary:
      "Sikkim’s Kanchenjunga balcony — rhododendron forests, Samiti Lake, and the Goecha viewpoint at 4,940 m. Guided trek from ₹24,999 a person (min. 2).",
    category: "Trekking",
    availability: "dates",
    durationDays: 11,
    durationNights: 10,
    durationUnit: "days",
    durationLabel: "10 nights / 11 days",
    difficulty: "difficult",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 21,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["sikkim", "yuksom", "gangtok"],
    primaryDestinationSlug: "yuksom",
    address: "Bagdogra (IXB) or NJP railway pickup · transfer to Yuksom",
    mapLat: "27.3740",
    mapLng: "88.2450",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Bagdogra / NJP · Yuksom",
        morning:
          "Pickup and long drive into West Sikkim. Permits and trek registration paperwork at Yuksom.",
        afternoon: "Rest walk around the Dubdi monastery approach. Gear weigh-in.",
        evening: "MAP dinner; overnight Yuksom heritage guest house.",
        imageKey: "tours/goecha-la-trek-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Yuksom to Sachen",
        morning:
          "Trail enters Kanchenjunga National Park. Steady climb through lush forest.",
        afternoon: "Reach Sachen camp beside the Prek Chu. Early bedtime.",
        evening: "Camp night Sachen.",
        imageKey: "tours/goecha-la-trek-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Sachen to Tshoka",
        morning: "Rhododendron tunnels and mossy bridges on the climb.",
        afternoon:
          "First views of Pandim. Tshoka village tea houses; camp above the hamlet.",
        evening: "Acclimatisation walk optional. Overnight Tshoka camp.",
        imageKey: "tours/goecha-la-trek-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Tshoka to Dzongri",
        morning: "Steady ascent through yak pastures.",
        afternoon:
          "Arrive Dzongri meadow — classic Kanchenjunga panorama if clouds lift.",
        evening: "Camp at Dzongri; cold night prep briefing.",
        imageKey: "tours/goecha-la-trek-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Dzongri rest · acclimatisation",
        morning: "Short hike to Dzongri Top for sunrise (weather permitting).",
        afternoon: "Hydration, laundry, gear repair time in camp.",
        evening: "Second night Dzongri.",
        imageKey: "tours/goecha-la-trek-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Dzongri to Thansing",
        morning: "Descend and contour toward the Prek Chu gorge.",
        afternoon: "Climb to Thansing meadows below Mount Pandim.",
        evening: "Camp Thansing.",
        imageKey: "tours/goecha-la-trek-d6.jpg",
      },
      {
        dayNumber: 7,
        title: "Thansing to Samiti Lake",
        morning: "Morbid rhythm day — slow steps above 4,000 m.",
        afternoon:
          "Reach sacred Samiti Lake; optional walk toward Goecha viewpoint base.",
        evening: "Highest camp — oxygen mindset briefing.",
        imageKey: "tours/goecha-la-trek-d7.jpg",
      },
      {
        dayNumber: 8,
        title: "Goecha La viewpoint day",
        morning:
          "Pre-dawn start for the Goecha La viewpoint ridge (weather and group fitness decide turnaround).",
        afternoon: "Return to Samiti or Thansing depending on energy.",
        evening: "Camp night lower if possible.",
        imageKey: "tours/goecha-la-trek-d8.jpg",
      },
      {
        dayNumber: 9,
        title: "Descent to Tshoka",
        morning: "Long downhill; poles recommended.",
        afternoon: "Forest camp near Tshoka.",
        evening: "Overnight Tshoka.",
        imageKey: "tours/goecha-la-trek-d9.jpg",
      },
      {
        dayNumber: 10,
        title: "Tshoka to Yuksom",
        morning: "Exit trail through Sachen.",
        afternoon: "Yuksom hotel; hot shower and celebratory dinner.",
        evening: "Overnight Yuksom.",
        imageKey: "tours/goecha-la-trek-d10.jpg",
      },
      {
        dayNumber: 11,
        title: "Drive to Bagdogra / NJP",
        morning: "Breakfast and return transfer. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/goecha-la-trek-d11.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Goecha La:</strong> the closest legal trekkers get to Kanchenjunga’s south face without mountaineering permits.</p>",
      "<p><strong>Grade:</strong> difficult — prior trekking above 3,500 m strongly advised. Guide may turn the group at viewpoint short of the pass lip.</p>",
      "<p><strong>Permits:</strong> Kanchenjunga National Park fees and Sikkim inner-line paperwork handled by our Yuksom crew.</p>",
      "<p><strong>How to book:</strong> send medical history and last high-altitude trek. Spring (April–May) for rhododendron; autumn (October) for clarity.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 24999,
    currency: "INR",
    discounts: [{ name: "Early bird 60 days", type: "percent", value: 4 }],
  },
  details: {
    sharedFaqTitles: [
      "Does Goecha La need prior high-altitude trekking?",
      "What camping gear is provided?",
      "Are flights included?",
      "What extras are paid locally?",
    ],
    extraFaqs: [
      {
        title: "Which season is best?",
        content:
          "April–May for rhododendron bloom; October–November for clearest Kanchenjunga views. Monsoon is closed.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at guesthouse nights (MAP)",
      "Private vehicle Bagdogra / NJP ↔ Yuksom",
      "Licensed trek guide and camp cook crew",
      "Camping equipment on trek nights",
      "Trail meals on trek days",
      "Sikkim Kanchenjunga National Park entry as quoted",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights / trains to Bagdogra or NJP",
      "Lunch on hotel nights",
      "Tips & personal expenses",
      "Travel insurance",
      "Pony for kitchen loads",
      "Personal oxygen cans",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Sikkim permit paperwork",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Trekking & Camping", "Private / Independent"],
    facilityTitles: [
      "Licensed trek guide & camp crew",
      "Airport / station transfers",
      "MAP meals on hotel nights",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/goecha-la-trek-cover.jpg",
    cover: "tours/goecha-la-trek-cover.jpg",
    gallery: [
      "tours/goecha-la-trek-g1.jpg",
      "tours/goecha-la-trek-g2.jpg",
      "tours/goecha-la-trek-g3.jpg",
      "tours/goecha-la-trek-g4.jpg",
    ],
    seoImage: "tours/goecha-la-trek-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Goecha La Trek Sikkim | 10N/11D Kanchenjunga View Trek",
    seoDescription:
      "Goecha La trek from Yuksom — Dzongri, Samiti Lake, guided camps. Difficult grade from ₹24,999 pp.",
    facebookTitle: "Goecha La Trek — Kanchenjunga balcony",
    facebookDescription: "11-day Sikkim trek with permits and camp crew.",
    twitterTitle: "Goecha La Trek | 10N/11D",
    twitterDescription: "Yuksom · Dzongri · Samiti. From ₹24,999 pp.",
    published: true,
  },
};