/**
 * Locked-format tour — Shirdi Sai Baba Darshan (Batch 3).
 * Samadhi Mandir, Dwarkamai, and Chavadi at pilgrim pace.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const shirdiSaiBabaDarshanCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Religious" },
  { kind: "style", title: "Pilgrimage" },
  {
    kind: "faq",
    title: "Which airport is closest?",
    content:
      "Shirdi (SAG) is ideal. Many guests fly Pune or Aurangabad — we quote the drive time accordingly.",
  },
  {
    kind: "before_you_go",
    title: "Temple queue rhythm",
    content:
      "Modest dress at Samadhi Mandir. Large bags go to cloak counters — keep valuables light. Festival queues are longer; we brief you on current trust advisories.",
  },
  {
    kind: "facility",
    title: "Temple visit coordination",
  },
  {
    kind: "include",
    title: "Evening Samadhi darshan (Day 1)",
  },
];

export const tourShirdiSaiBabaDarshan: TourFormat = {
  slug: "shirdi-sai-baba-darshan",
  general: {
    title: "Shirdi Sai Baba Darshan",
    summary:
      "Two nights focused on Sai Samadhi Mandir darshan, Dwarkamai, and Chavadi — ideal for families and first-time pilgrims. Twin share from ₹7,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 16,
    minDayBeforeBooking: 2,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["shirdi"],
    primaryDestinationSlug: "shirdi",
    address: "Shirdi Airport (SAG) or Kopargaon (KPG) railway pickup",
    mapLat: "19.7645",
    mapLng: "74.4770",
    mapZoom: 13,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Shirdi · evening darshan",
        morning:
          "Pickup from Shirdi airport or Kopargaon station. Check in walking distance of Samadhi Mandir.",
        afternoon: "Rest and freshen up. Read current queue advisories with your coordinator.",
        evening: "Evening darshan at Sai Samadhi Mandir. Dinner at hotel; overnight Shirdi.",
        imageKey: "tours/shirdi-sai-baba-darshan-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Morning aarti circuit",
        morning:
          "Attend Kakad or afternoon aarti as per season schedule. Darshan in the main sanctum.",
        afternoon: "Dwarkamai, Chavadi, and Gurusthan. Lendi Baug walk.",
        evening: "Second darshan window or quiet hotel evening. Overnight Shirdi.",
        imageKey: "tours/shirdi-sai-baba-darshan-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Prayer & departure",
        morning:
          "Breakfast. Optional final darshan before checkout. Transfer to airport or station.",
        afternoon: "",
        evening: "",
        imageKey: "tours/shirdi-sai-baba-darshan-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Paced darshan:</strong> two nights allow both evening and morning temple time without a midnight arrival rush.</p>",
      "<p><strong>Stays:</strong> MAP pure veg hotel near Temple Road. Festival dates may shift property — names confirmed before payment.</p>",
      "<p><strong>Excludes:</strong> flights to Aurangabad or Pune gateway cities; VIP darshan if offered by trust.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 7999,
    currency: "INR",
    discounts: [{ name: "Group of 8+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Which airport is closest?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can we start from Mumbai?",
        content:
          "Yes — overnight or day drive from Mumbai is quoted separately with realistic traffic buffers on NH160.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport / railway pickup & drop (SAG or KPG)",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Temple visit coordination",
      "Evening Samadhi darshan (Day 1)",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Pune / Aurangabad gateway transfers unless quoted",
      "VIP darshan tokens",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Temple queue rhythm",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Family Friendly", "Private / Independent", "Pilgrimage"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Temple visit coordination",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/shirdi-sai-baba-darshan-cover.jpg",
    cover: "tours/shirdi-sai-baba-darshan-cover.jpg",
    gallery: [
      "tours/shirdi-sai-baba-darshan-g1.jpg",
      "tours/shirdi-sai-baba-darshan-g2.jpg",
      "tours/shirdi-sai-baba-darshan-g3.jpg",
      "tours/shirdi-sai-baba-darshan-g4.jpg",
    ],
    seoImage: "tours/shirdi-sai-baba-darshan-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Shirdi Sai Baba Darshan | 2N/3D Pilgrimage Package",
    seoDescription:
      "Shirdi Sai Samadhi darshan — Dwarkamai, Chavadi, MAP veg meals, from ₹7,999 pp.",
    facebookTitle: "Shirdi Sai Baba Darshan — 2 nights",
    facebookDescription: "Focused Samadhi darshan with private transfers.",
    twitterTitle: "Shirdi Darshan | 2N/3D",
    twitterDescription: "Sai Samadhi · Dwarkamai · from ₹7,999 pp.",
    published: true,
  },
};