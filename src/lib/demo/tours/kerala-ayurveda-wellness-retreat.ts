/**
 * Locked-format tour — Kerala Ayurveda Wellness Retreat (India Batch 1 #5).
 * Gentle pace: consultation-led therapies near the Kerala coast / backwaters.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const keralaAyurvedaWellnessCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Wellness" },
  { kind: "style", title: "Slow Travel" },
  {
    kind: "faq",
    title: "Are ayurveda treatments included?",
    content:
      "The package includes a doctor consultation on arrival and one therapy session daily (abhyanga or equivalent as prescribed). Extended panchakarma programmes, extra massages, and medicines are optional add-ons quoted after consultation.",
  },
  {
    kind: "faq",
    title: "Can non-partners stay as companions?",
    content:
      "Yes — companions can share the room and enjoy meals; therapy slots apply only to guests who book the wellness plan. Sightseeing drives stay optional and light.",
  },
  {
    kind: "before_you_go",
    title: "Therapy days",
    content:
      "Treatment mornings need gaps with no heavy travel. Expect herbal diet notes, light yoga slots, and early nights — plan work calls off those days.",
  },
  {
    kind: "facility",
    title: "Licensed ayurveda centre on-site",
  },
  {
    kind: "include",
    title: "Daily doctor consultation (stay duration)",
  },
  {
    kind: "include",
    title: "One ayurveda therapy session per day (as prescribed)",
  },
  {
    kind: "exclude",
    title: "Extended panchakarma packages & extra therapies",
  },
];

export const tourKeralaAyurvedaWellnessRetreat: TourFormat = {
  slug: "kerala-ayurveda-wellness-retreat",
  general: {
    title: "Kerala Ayurveda Wellness Retreat",
    summary:
      "Reset by the Kerala coast — five nights at a licensed ayurveda retreat, daily consultation, and unhurried wellness rhythm. From ₹29,999 a person (min. 2).",
    category: "Wellness",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 7,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kerala", "cochin", "munnar"],
    primaryDestinationSlug: "kerala",
    address: "Cochin Airport (COK) pickup",
    mapLat: "9.6010",
    mapLng: "76.2000",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · resort settle-in",
        morning:
          "Meet your driver at Cochin Airport. Drive to the ayurveda retreat near Mararikulam / Alleppey backwater belt (about 1.5 hours).",
        afternoon:
          "Doctor consultation and dosha briefing. Settle into villa or garden cottage.",
        evening:
          "Satvik dinner. Lights-out encouraged for therapy prep. Overnight retreat.",
        imageKey: "tours/kerala-ayurveda-wellness-retreat-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Therapy rhythm begins",
        morning:
          "Herbal tea and gentle yoga. First prescribed therapy (e.g. abhyanga) in the treatment wing.",
        afternoon:
          "Rest in room or library. Light walk in the garden — no strenuous outings.",
        evening: "Dinner as per doctor notes. Overnight retreat.",
        imageKey: "tours/kerala-ayurveda-wellness-retreat-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Daily rituals",
        morning:
          "Repeat consultation check-in. Second therapy block as scheduled.",
        afternoon:
          "Optional meditation session. Pool time if therapies allow.",
        evening: "Unhurried evening; overnight retreat.",
        imageKey: "tours/kerala-ayurveda-wellness-retreat-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Backwater breeze",
        morning:
          "Therapy morning. Doctor may adjust oils based on response.",
        afternoon:
          "Short sunset shikara or canoe float near the property (when tides allow) — no long drives.",
        evening: "Overnight retreat.",
        imageKey: "tours/kerala-ayurveda-wellness-retreat-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Soft checkout from therapies",
        morning:
          "Final therapy and closing consultation with take-home routine notes.",
        afternoon:
          "Free rest. Optional pop-up Kerala cooking demo at the resort.",
        evening: "Celebratory but light dinner. Overnight retreat.",
        imageKey: "tours/kerala-ayurveda-wellness-retreat-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Cochin departure",
        morning:
          "Breakfast. Checkout and private transfer to Cochin Airport (about 1.5 hours). Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/kerala-ayurveda-wellness-retreat-d6.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Kerala for wellness:</strong> licensed retreats pair daily doctor oversight with coastal calm — you get therapy mornings without a punishing sightseeing checklist.</p>",
      "<p><strong>Stay (5 nights):</strong> Mararikulam / Alleppey belt ayurveda resort (CGH / Carnoustie category) in a garden villa, twin or single occupancy. Satvik meal plan included.</p>",
      "<p><strong>What you get:</strong> airport transfers, daily doctor consult, one therapy per day in the base plan, yoga and pool access as prescribed, and written diet guidance for home.</p>",
      "<p><strong>Add-ons:</strong> panchakarma courses, extra massages, and medicines are quoted after consultation — tell us your health goals when you request.</p>",
      "<p><strong>How to book:</strong> share allergies and medical notes seven days ahead; nothing is charged until the retreat confirms doctor availability on your dates.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 29999,
    currency: "INR",
    discounts: [{ name: "Group of 4+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Are ayurveda treatments included?",
      "Can non-partners stay as companions?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "What should I tell the doctor beforehand?",
        content:
          "Share ongoing medications, surgeries, pregnancy status, and allergies. The retreat may adapt oils or postpone detox steps accordingly.",
      },
      {
        title: "Is alcohol allowed?",
        content:
          "Wellness stays are alcohol-free during therapy days. Ask us if you need a dry-day buffer before flying home.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Satvik meal plan as prescribed",
      "Daily doctor consultation (stay duration)",
      "One ayurveda therapy session per day (as prescribed)",
      "Gentle yoga / meditation slots",
      "Airport pickup & drop at COK",
      "Short backwater float near resort (Day 4)",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights to Kochi",
      "Extended panchakarma packages & extra therapies",
      "Ayurvedic medicines beyond starter kit",
      "Sightseeing drives to Munnar / Fort Kochi",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Therapy days",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Slow Travel", "Private / Independent"],
    facilityTitles: [
      "Licensed ayurveda centre on-site",
      "Airport transfers",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/kerala-ayurveda-wellness-retreat-cover.jpg",
    cover: "tours/kerala-ayurveda-wellness-retreat-cover.jpg",
    gallery: [
      "tours/kerala-ayurveda-wellness-retreat-g1.jpg",
      "tours/kerala-ayurveda-wellness-retreat-g2.jpg",
      "tours/kerala-ayurveda-wellness-retreat-g3.jpg",
      "tours/kerala-ayurveda-wellness-retreat-g4.jpg",
    ],
    seoImage: "tours/kerala-ayurveda-wellness-retreat-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Kerala Ayurveda Wellness Retreat | 5N/6D",
    seoDescription:
      "Request a Kerala ayurveda retreat — daily consultation, therapies, satvik meals, airport transfers, from ₹29,999 pp.",
    facebookTitle: "Kerala Ayurveda Wellness — five slow nights",
    facebookDescription:
      "Doctor-led therapies by the backwaters. Add-on panchakarma available.",
    twitterTitle: "Kerala Ayurveda Retreat | 5N/6D",
    twitterDescription:
      "Consultation-led wellness near Alleppey. From ₹29,999 pp.",
    published: true,
  },
};
