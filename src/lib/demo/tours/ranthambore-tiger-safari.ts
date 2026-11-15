/**
 * Locked-format tour — Ranthambore Tiger Safari (Batch 1 India Set B #4).
 * Dual safari window with honest permit wording; fort morning on departure day.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const ranthamboreTigerSafariCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Wildlife" },
  { kind: "style", title: "Adventure" },
  { kind: "style", title: "Family Friendly" },
  {
    kind: "faq",
    title: "Are jungle safari permits included?",
    content:
      "We arrange your jeep safaris and lodge coordination, but Ranthambore park permit fees are often billed separately and paid locally (current government rates — typically ₹1,500–₹2,500+ per jeep per ride depending on zone and season). We share the exact figure before you confirm so there is no surprise at the gate.",
  },
  {
    kind: "faq",
    title: "How many safaris are in this package?",
    content:
      "The standard plan is three jeep safaris — one on arrival afternoon (if time and permit allow), and morning plus evening on the full park day. Extra rides can be added if permits are available.",
  },
  {
    kind: "before_you_go",
    title: "Safari etiquette",
    content:
      "Wear neutral colours, carry binoculars if you have them, and keep phones on silent. Tiger sightings are never guaranteed — enjoy the lake birds, sambar, and fort views too.",
  },
  {
    kind: "exclude",
    title: "Ranthambore National Park jeep permit fees (pay locally)",
  },
  {
    kind: "include",
    title: "Safari jeep coordination & lodge transfers",
  },
  { kind: "facility", title: "Wildlife lodge" },
  { kind: "facility", title: "Jeep safaris" },
  { kind: "include", title: "Accommodation as per itinerary (lodge, twin sharing)" },
  { kind: "include", title: "Breakfast + dinner at lodge (MAP)" },
  { kind: "include", title: "Private transfers Sawai Madhopur ↔ lodge" },
  { kind: "include", title: "Safari jeep coordination & lodge–gate transfers" },
  { kind: "include", title: "Three jeep safari rides (zones per permit availability)" },
  { kind: "include", title: "Ranthambore Fort visit on departure day" },
  { kind: "exclude", title: "Lunch at lodge" },
  { kind: "exclude", title: "Camera / video fees inside park if levied" },
  { kind: "exclude", title: "Tips to naturalist, driver, and lodge staff" },
];

export const tourRanthamboreTigerSafari: TourFormat = {
  slug: "ranthambore-tiger-safari",
  general: {
    title: "Ranthambore Tiger Safari",
    summary:
      "Two nights at Ranthambore — three jeep safari slots, lodge stay, and Ranthambore Fort on departure morning. Private transfers, twin share, from ₹14,999 a person (min. 2). Park permit fees paid locally.",
    category: "Wildlife",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 14,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["ranthambore", "rajasthan"],
    primaryDestinationSlug: "ranthambore",
    address: "Sawai Madhopur railway station pickup",
    mapLat: "26.0173",
    mapLng: "76.5026",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Sawai Madhopur · afternoon safari",
        morning:
          "Meet your driver at Sawai Madhopur railway station (common arrival on Kota–Delhi lines). Transfer to your lodge near the park gate.",
        afternoon:
          "Lunch at the lodge, rest, then afternoon jeep safari in an assigned zone (permit permitting — we chase the best available slot).",
        evening:
          "Dinner, tiger-tracker briefing for tomorrow’s zones, and overnight at the lodge.",
        imageKey: "tours/ranthambore-tiger-safari-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Twin safari day · lakes and ridges",
        morning:
          "Early morning jeep safari when cats move on the paths near Padam Talao and Rajbagh ruins. Return for breakfast.",
        afternoon:
          "Midday rest away from the heat; optional lodge nature walk or pool time.",
        evening:
          "Second jeep safari toward dusk — silhouettes on the ridges and birdlife at the waterholes. Dinner and overnight.",
        imageKey: "tours/ranthambore-tiger-safari-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Ranthambore Fort · departure",
        morning:
          "After breakfast, visit Ranthambore Fort for wide park views and Trinetra Ganesh temple. Descend and drive to Sawai Madhopur station.",
        afternoon:
          "Drop at the railway station — tour ends. We book trains that leave after lunch when possible.",
        evening: "",
        imageKey: "tours/ranthambore-tiger-safari-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this safari:</strong> three rides across two nights give you real odds at a tiger encounter without a long Rajasthan circuit. We use reliable lodges and honest permit wording — you pay government jeep fees locally.</p>",
      "<p><strong>Stays (2 nights):</strong> Mid-range wildlife lodge near the park (twin-share; air-conditioning where the property offers it).</p>",
      "<p><strong>What you get:</strong> Sawai Madhopur transfers, lodge on MAP plan, jeep coordination for three safaris, naturalist tips briefing, and fort visit on Day 3.</p>",
      "<p><strong>Permits:</strong> park entry and jeep seat charges are <em>not</em> in the package price — paid at booking desk or gate at official rates. We quote the current amount before you confirm.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 14999,
    currency: "INR",
    discounts: [{ name: "Group of 4+", type: "percent", value: 3 }],
  },
  details: {
    sharedFaqTitles: [
      "Are jungle safari permits included?",
      "How many safaris are in this package?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can we book a canter instead of a jeep?",
        content:
          "Jeep (6-seat) is default for this package. Canter seats are cheaper but shared with up to 20 guests — ask if you want a canter quote instead.",
      },
      {
        title: "What if permits are sold out for my dates?",
        content:
          "We check permit inventory before you pay. If zones are full, we suggest alternate dates or nearby parks — no phantom bookings.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (lodge, twin sharing)",
      "Breakfast + dinner at lodge (MAP)",
      "Private transfers Sawai Madhopur ↔ lodge",
      "Safari jeep coordination & lodge–gate transfers",
      "Three jeep safari rides (zones per permit availability)",
      "Ranthambore Fort visit on departure day",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Ranthambore National Park jeep permit fees (pay locally)",
      "Flights / trains to starting point",
      "Lunch at lodge",
      "Camera / video fees inside park if levied",
      "Tips to naturalist, driver, and lodge staff",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Safari etiquette",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Family Friendly", "Private / Independent", "Adventure"],
    facilityTitles: ["Private cab", "Wildlife lodge", "Jeep safaris", "24×7 helpline"],
  },
  images: {
    banner: "tours/ranthambore-tiger-safari-cover.jpg",
    cover: "tours/ranthambore-tiger-safari-cover.jpg",
    gallery: [
      "tours/ranthambore-tiger-safari-g1.jpg",
      "tours/ranthambore-tiger-safari-g2.jpg",
      "tours/ranthambore-tiger-safari-g3.jpg",
      "tours/ranthambore-tiger-safari-g4.jpg",
    ],
    seoImage: "tours/ranthambore-tiger-safari-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Ranthambore Tiger Safari | 2N/3D Wildlife Lodge",
    seoDescription:
      "Book Ranthambore — three jeep safaris, lodge MAP, fort morning. Permits paid locally. From ₹14,999 pp.",
    facebookTitle: "Ranthambore Tiger Safari — 2 nights, 3 rides",
    facebookDescription:
      "Honest permit wording, lodge stay, and fort views. Jeep fees at gate rates.",
    twitterTitle: "Ranthambore Safari | 2N/3D",
    twitterDescription:
      "Tiger park · 3 safaris · fort morning. From ₹14,999 pp.",
    published: true,
  },
};
