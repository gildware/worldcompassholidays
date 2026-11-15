/**
 * Locked-format tour — Varanasi Spiritual Tour (Batch 2 #2).
 * Ganga ghats, aarti, and Kashi Vishwanath at an easy pilgrim pace.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const varanasiSpiritualTourCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Religious" },
  { kind: "style", title: "Pilgrimage" },
  {
    kind: "faq",
    title: "Is Kashi Vishwanath darshan slot help included?",
    content:
      "We coordinate your shrine visit window and a local guide for corridor flow and bag deposits. Shrine rules change — we confirm the latest process before you pay.",
  },
  {
    kind: "faq",
    title: "Can we add a Prayagraj Sangam day?",
    content:
      "Yes, as an optional long day (about 3 hours each way) if you extend a night or swap pacing. Triveni boat rides are paid locally.",
  },
  {
    kind: "before_you_go",
    title: "Ghat etiquette",
    content:
      "Modest dress at mandirs and ghats. Avoid leather at shrine entry. Photography is restricted at cremation ghats — follow guide cues.",
  },
  {
    kind: "facility",
    title: "Temple visit coordination",
  },
  {
    kind: "include",
    title: "Evening Ganga aarti vantage (Day 1)",
  },
];

export const tourVaranasiSpiritualTour: TourFormat = {
  slug: "varanasi-spiritual-tour",
  general: {
    title: "Varanasi Spiritual Tour",
    summary:
      "Two nights on the Ganga — Dashashwamedh aarti, Kashi Vishwanath darshan, and Assi promenade at pilgrim pace. Private cab, twin share, from ₹9,999 a person (min. 2).",
    category: "Religious",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["varanasi", "prayagraj"],
    primaryDestinationSlug: "varanasi",
    address: "Lal Bahadur Shastri Airport (VNS) or Varanasi Cantt (BSB) pickup",
    mapLat: "25.3176",
    mapLng: "82.9739",
    mapZoom: 12,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kashi · first Ganga hour",
        morning:
          "Meet your driver at Varanasi airport or railway station. Check in near Assi or Cantonment.",
        afternoon:
          "Gentle ghat orientation with your guide — Dashashwamedh and Manikarnika viewpoints from the promenade.",
        evening:
          "Reserved vantage for Ganga aarti at Dashashwamedh. Pure veg MAP dinner; overnight Varanasi.",
        imageKey: "tours/varanasi-spiritual-tour-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Kashi Vishwanath · boat and lanes",
        morning:
          "Early transfer to Shri Kashi Vishwanath for darshan in your coordinated window.",
        afternoon:
          "Annapurna Temple and Vishwanath lane crafts. Optional silk unit visit on request.",
        evening: "Sunset rowboat on the Ganga for your party segment. Overnight Varanasi.",
        imageKey: "tours/varanasi-spiritual-tour-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Morning prayer · departure",
        morning:
          "Breakfast. Optional subah aarti or riverside prayer before checkout. Transfer to airport or station. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/varanasi-spiritual-tour-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why two nights:</strong> Vishwanath and Dashashwamedh aarti deserve separate mornings — you are not fighting same-day arrival fatigue from Delhi or Mumbai.</p>",
      "<p><strong>Stays (2 nights):</strong> Category 3-star MAP hotel near the ghats — pure vegetarian meals throughout.</p>",
      "<p><strong>What you get:</strong> private sedan or Innova, temple coordination, evening aarti support on Day 1, and a reserved boat segment on Day 2.</p>",
      "<p><strong>Prayagraj optional:</strong> Sangam day trips can be quoted if you add a night — ask in your request.</p>",
      "<p><strong>How to book:</strong> pick dates and party size; we confirm hotel and darshan notes before payment.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 9999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is Kashi Vishwanath darshan slot help included?",
      "Can we add a Prayagraj Sangam day?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Is the boat ride private?",
        content:
          "Evening ride on Day 2 reserves seats on a traditional rowboat for your party — not a large motor launch.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner each night (MAP, pure veg)",
      "Private vehicle for transfers & sightseeing",
      "Airport or railway pickup & drop",
      "Evening Ganga aarti vantage (Day 1)",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights / trains to Varanasi",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Prayagraj extension or Sangam boats",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Ghat etiquette",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Pilgrimage", "Private / Independent", "Culture"],
    facilityTitles: [
      "Private cab",
      "Temple visit coordination",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/varanasi-spiritual-tour-cover.jpg",
    cover: "tours/varanasi-spiritual-tour-cover.jpg",
    gallery: [
      "tours/varanasi-spiritual-tour-g1.jpg",
      "tours/varanasi-spiritual-tour-g2.jpg",
      "tours/varanasi-spiritual-tour-g3.jpg",
      "tours/varanasi-spiritual-tour-g4.jpg",
    ],
    seoImage: "tours/varanasi-spiritual-tour-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Varanasi Spiritual Tour | 2N/3D Ghats & Kashi Vishwanath",
    seoDescription:
      "Varanasi pilgrimage — Ganga aarti, Kashi Vishwanath, private cab, pure veg MAP from ₹9,999 pp.",
    facebookTitle: "Varanasi Spiritual Tour — ghats and aarti",
    facebookDescription:
      "Two nights on the Ganga with coordinated Vishwanath darshan and evening boat.",
    twitterTitle: "Varanasi Spiritual | 2N/3D",
    twitterDescription:
      "Ghats · aarti · Vishwanath. From ₹9,999 pp.",
    published: true,
  },
};