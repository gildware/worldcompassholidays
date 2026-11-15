/**
 * Locked-format tour — Ayodhya Ram Mandir Darshan (India Batch 1 #1).
 * Short spiritual break: Ram Mandir, Saryu ghats, temple-town pacing.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const ayodhyaRamMandirCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Religious" },
  { kind: "style", title: "Pilgrimage" },
  {
    kind: "faq",
    title: "Is darshan slot booking included?",
    content:
      "We coordinate your temple visit window and local guide hand-off as per current Ram Mandir protocols. Final slot rules change with shrine administration — we confirm the process in writing before you pay.",
  },
  {
    kind: "faq",
    title: "Can we add Prayagraj Sangam?",
    content:
      "Yes — a Prayagraj day trip (about 3 hours each way) can be quoted as an add-on if you extend a night or swap Day 2 pacing. Triveni Sangam boat rides are paid locally.",
  },
  {
    kind: "before_you_go",
    title: "Temple etiquette",
    content:
      "Modest dress is expected at the mandir and ghats. Leave leather belts and large bags at the hotel when possible. Phones may be restricted inside the main shrine — follow on-site staff.",
  },
  {
    kind: "facility",
    title: "Temple visit coordination",
  },
  {
    kind: "include",
    title: "Local guide for Ram Mandir circuit (as per shrine rules)",
  },
];

export const tourAyodhyaRamMandirDarshan: TourFormat = {
  slug: "ayodhya-ram-mandir-darshan",
  general: {
    title: "Ayodhya Ram Mandir Darshan",
    summary:
      "Two focused nights in Ayodhya — Ram Mandir darshan, Saryu aarti, and hanuman shrines at an easy pilgrim pace. Private cab, twin share, from ₹8,999 a person (min. 2).",
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
    destinationSlugs: ["ayodhya", "prayagraj"],
    primaryDestinationSlug: "ayodhya",
    address: "Ayodhya Airport (AYJ) or Lucknow (LKO) pickup",
    mapLat: "26.7922",
    mapLng: "82.1998",
    mapZoom: 12,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Ayodhya · settle by the Saryu",
        morning:
          "Meet your driver at Ayodhya Airport or Lucknow Airport (as booked). Drive into Ayodhya (about 30 minutes from AYJ, 2–2.5 hours from LKO). Check in near Ram Path.",
        afternoon:
          "Rest and freshen up. Short walk along the Saryu promenade when crowds are lighter.",
        evening:
          "Attend Saryu ghat aarti at an easy vantage point. Dinner at the hotel; overnight Ayodhya.",
        imageKey: "tours/ayodhya-ram-mandir-darshan-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Ram Mandir · heritage shrines",
        morning:
          "Early transfer to the Ram Janmabhoomi / Shri Ram Mandir complex for darshan in your coordinated window. Local guide assists with queue flow and shoe/deposit norms.",
        afternoon:
          "Visit Hanuman Garhi and Kanak Bhawan at a calm pace. Free time for prasad shopping on Ram Path.",
        evening: "Optional second ghat visit or quiet hotel evening. Overnight Ayodhya.",
        imageKey: "tours/ayodhya-ram-mandir-darshan-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Morning prayer · departure",
        morning:
          "Breakfast at the hotel. Optional brief stop at Nageshwarnath or a riverside prayer before checkout. Private transfer to Ayodhya or Lucknow airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/ayodhya-ram-mandir-darshan-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this short darshan trip:</strong> two full nights give you a real temple morning without racing from Lucknow the same day. Ideal for families, first-time pilgrims, or a long-weekend spiritual break.</p>",
      "<p><strong>Stays (2 nights):</strong> Hotel Ramprastha or similar near Ram Path · Category 3-star with breakfast and dinner (MAP). Dates near festivals may use an equivalent property — confirmed before payment.</p>",
      "<p><strong>What you get:</strong> private sedan or Innova for your party, MAP meals, airport pickup and drop, and coordinated Ram Mandir visit support as per current shrine guidelines.</p>",
      "<p><strong>How to book:</strong> choose a start date and party size, then send a request. Nothing is charged until you accept the confirmed itinerary and hotel names.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 8999,
    currency: "INR",
    discounts: [{ name: "Group of 8+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is darshan slot booking included?",
      "Can we add Prayagraj Sangam?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Which airport should I fly into?",
        content:
          "Ayodhya (AYJ) is closest. Lucknow (LKO) has more daily flights — we quote the drive accordingly. Tell us your landing time when you request.",
      },
      {
        title: "Is lunch included?",
        content:
          "MAP covers breakfast and dinner. Lunches are flexible near the temple quarter — budget ₹300–600 per person per meal.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop (AYJ or LKO as quoted)",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Local guide for Ram Mandir circuit (as per shrine rules)",
      "Temple visit coordination",
      "Meet-and-greet at airport",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Prayagraj add-on transport & boat",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Temple etiquette",
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
    banner: "tours/ayodhya-ram-mandir-darshan-cover.jpg",
    cover: "tours/ayodhya-ram-mandir-darshan-cover.jpg",
    gallery: [
      "tours/ayodhya-ram-mandir-darshan-g1.jpg",
      "tours/ayodhya-ram-mandir-darshan-g2.jpg",
      "tours/ayodhya-ram-mandir-darshan-g3.jpg",
      "tours/ayodhya-ram-mandir-darshan-g4.jpg",
    ],
    seoImage: "tours/ayodhya-ram-mandir-darshan-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Ayodhya Ram Mandir Darshan | 2N/3D Pilgrimage Package",
    seoDescription:
      "Request Ayodhya Ram Mandir darshan — Saryu aarti, Hanuman Garhi, private cab, MAP meals, from ₹8,999 pp twin share.",
    facebookTitle: "Ayodhya Ram Mandir Darshan — 2 nights by the Saryu",
    facebookDescription:
      "Focused temple time with private transfers and coordinated darshan support.",
    twitterTitle: "Ayodhya Ram Mandir | 2N/3D",
    twitterDescription:
      "Ram Mandir · Saryu aarti · easy pilgrim pace. From ₹8,999 pp.",
    published: true,
  },
};
