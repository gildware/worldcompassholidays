/**
 * Pending locked-format India religious / pilgrimage tours (no images yet).
 * Ayodhya Ram Mandir is seeded separately — not included here.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

const NO_IMAGES: TourFormat["images"] = {
  banner: null,
  cover: null,
  gallery: [],
  seoImage: null,
};

const BASE_INCLUDE = [
  "Accommodation as per itinerary (twin sharing)",
  "Breakfast + dinner at the hotel each night (MAP, pure veg)",
  "Private vehicle for transfers & sightseeing",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Temple visit coordination",
  "Local temple guide / coordinator (as per shrine rules)",
  "Meet-and-greet at arrival point",
] as const;

const BASE_EXCLUDE = [
  "Flights / trains to starting point",
  "Lunch (unless listed)",
  "Tips & personal expenses",
  "Travel insurance",
  "VIP / special darshan tickets unless listed",
  "Anything not mentioned in includes",
] as const;

const BASE_BEFORE = [
  "Temple etiquette",
  "Pure veg on pilgrimage",
  "Fitness",
  "Documents",
  "Weather & kit",
  "Arrival",
  "Rooms",
  "Money on the road",
] as const;

const BASE_STYLES = ["Family Friendly", "Private / Independent", "Pilgrimage"] as const;

const BASE_FACILITIES = [
  "Private cab",
  "Airport transfers",
  "MAP meals (B/D)",
  "Temple visit coordination",
  "24×7 helpline",
] as const;

const SHARED_FAQ = [
  "Is darshan coordination included?",
  "Are meals pure vegetarian?",
  "Is this a private or group tour?",
  "Are flights included?",
] as const;

function details(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
  pickupInclude = "Airport / railway pickup & drop as quoted",
): TourFormat["details"] {
  return {
    sharedFaqTitles: [...SHARED_FAQ],
    extraFaqs,
    includeTitles: [...BASE_INCLUDE, pickupInclude, ...includeExtras],
    excludeTitles: [...BASE_EXCLUDE, ...excludeExtras],
    beforeYouGoTitles: [...BASE_BEFORE],
    travelStyleTitles: [...BASE_STYLES],
    facilityTitles: [...BASE_FACILITIES],
  };
}

export const indiaReligiousCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Religious" },
  { kind: "style", title: "Pilgrimage" },
  {
    kind: "faq",
    title: "Is darshan coordination included?",
    content:
      "We align your temple visit windows with current shrine protocols, queue norms, and local guide hand-off. Administration rules change — we confirm the live process in writing before you pay.",
  },
  {
    kind: "faq",
    title: "Are meals pure vegetarian?",
    content:
      "MAP stays on this circuit are pure vegetarian by default. Tell us if anyone needs Jain-style (no onion–garlic) meals so we can brief the hotel.",
  },
  {
    kind: "before_you_go",
    title: "Temple etiquette",
    content:
      "Modest dress at mandirs and dargahs. Remove shoes where required; leather articles may be restricted in some shrines. Follow mobile-phone rules inside sanctums.",
  },
  {
    kind: "before_you_go",
    title: "Pure veg on pilgrimage",
    content:
      "Avoid carrying non-vegetarian food in the vehicle. Many temple towns are dry or restrict alcohol — plan accordingly.",
  },
  {
    kind: "facility",
    title: "Temple visit coordination",
  },
  {
    kind: "include",
    title: "Local temple guide / coordinator (as per shrine rules)",
  },
];

const varanasiSpiritualTour: TourFormat = {
  slug: "varanasi-spiritual-tour",
  general: {
    title: "Varanasi Spiritual Tour",
    summary:
      "Ghats, Ganga aarti, and Kashi Vishwanath darshan at an unhurried pilgrim pace — three nights on the holy river. Private cab, twin share, from ₹11,499 a person (min. 2).",
    category: "Religious",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 3,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["varanasi"],
    primaryDestinationSlug: "varanasi",
    address: "Lal Bahadur Shastri Airport (VNS) or Varanasi Cantt (BSB) pickup",
    mapLat: "25.3176",
    mapLng: "82.9739",
    mapZoom: 12,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kashi · first glimpse of the Ganga",
        morning:
          "Meet your driver at Varanasi airport or railway station. Check in near Assi or Cantt — rest after travel.",
        afternoon:
          "Orientation walk along the ghats with your guide: Dashashwamedh, Manikarnika viewpoints from the promenade (no photography where restricted).",
        evening:
          "Reserved vantage for Ganga aarti at Dashashwamedh Ghat. Dinner at hotel; overnight Varanasi.",
      },
      {
        dayNumber: 2,
        title: "Kashi Vishwanath · old city lanes",
        morning:
          "Early transfer to Shri Kashi Vishwanath corridor for darshan in your coordinated window. Deposit bags and phones as per shrine rules.",
        afternoon:
          "Visit Annapurna Temple and Vishwanath lane crafts. Optional silk weaving unit by prior request.",
        evening: "Sunset boat ride on the Ganga (shared rowboat). Overnight Varanasi.",
      },
      {
        dayNumber: 3,
        title: "Sarnath · Buddhist heritage",
        morning:
          "Drive to Sarnath (about 45 minutes). Dhamek Stupa, main temple, and archaeology museum at easy pace.",
        afternoon:
          "Return to Varanasi. Free time for Sankat Mochan Hanuman or Durga Temple.",
        evening: "Quiet ghat stroll or hotel evening. Overnight Varanasi.",
      },
      {
        dayNumber: 4,
        title: "Morning prayer · departure",
        morning:
          "Breakfast. Optional subah aarti or riverside prayer before checkout. Transfer to airport or station. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why three nights:</strong> Vishwanath darshan and Dashashwamedh aarti deserve separate mornings — you are not fighting same-day arrival fatigue.</p>",
      "<p><strong>Stays:</strong> 3-star MAP hotel near the ghats (Radisson Varadia or similar category). Pure vegetarian meals.</p>",
      "<p><strong>Includes:</strong> private Innova or sedan, temple coordination, boat ride on Day 3 evening, and all road transfers.</p>",
      "<p><strong>Book:</strong> pick dates and party size; we confirm hotel and darshan notes before payment.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 11499, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details(
    [
      {
        title: "Is the boat ride private?",
        content: "Evening ride is a reserved seat on a traditional rowboat for your party segment — not a large motor launch.",
      },
    ],
    ["Evening Ganga boat ride (Day 3)"],
    ["Sarnath monument tickets"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Varanasi Spiritual Tour | 3N/4D Ghats & Kashi Vishwanath",
    seoDescription:
      "Varanasi pilgrimage — Ganga aarti, Kashi Vishwanath, Sarnath, private cab, pure veg MAP from ₹11,499 pp.",
    facebookTitle: "Varanasi Spiritual Tour — ghats & aarti",
    facebookDescription: "Three nights on the Ganga with coordinated Vishwanath darshan.",
    twitterTitle: "Varanasi Spiritual | 3N/4D",
    twitterDescription: "Ghats · aarti · Vishwanath. From ₹11,499 pp twin share.",
    published: true,
  },
};

const shirdiSaiBabaDarshan: TourFormat = {
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
      },
      {
        dayNumber: 2,
        title: "Morning aarti circuit",
        morning:
          "Attend Kakad or afternoon aarti as per season schedule. Darshan in the main sanctum.",
        afternoon: "Dwarkamai, Chavadi, and Gurusthan. Lendi Baug walk.",
        evening: "Second darshan window or quiet hotel evening. Overnight Shirdi.",
      },
      {
        dayNumber: 3,
        title: "Prayer & departure",
        morning: "Breakfast. Optional final darshan before checkout. Transfer to airport or station.",
        afternoon: "",
        evening: "",
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
  pricing: { priceFrom: 7999, currency: "INR", discounts: [{ name: "Group of 8+", type: "percent", value: 5 }] },
  details: details(
    [
      {
        title: "Which airport is closest?",
        content:
          "Shirdi (SAG) is ideal. Many guests fly Pune or Aurangabad — we quote the drive time accordingly.",
      },
    ],
    [],
    ["Pune / Aurangabad gateway transfers unless quoted"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Shirdi Sai Baba Darshan | 2N/3D Pilgrimage Package",
    seoDescription: "Shirdi Sai Samadhi darshan — Dwarkamai, Chavadi, MAP veg meals, from ₹7,999 pp.",
    facebookTitle: "Shirdi Sai Baba Darshan — 2 nights",
    facebookDescription: "Focused Samadhi darshan with private transfers.",
    twitterTitle: "Shirdi Darshan | 2N/3D",
    twitterDescription: "Sai Samadhi · Dwarkamai · from ₹7,999 pp.",
    published: true,
  },
};

const twelveJyotirlingaHighlightsCircuit: TourFormat = {
  slug: "twelve-jyotirlinga-highlights-circuit",
  general: {
    title: "Twelve Jyotirlinga Highlights Circuit",
    summary:
      "Honest 13-night pan-India circuit covering nine major Jyotirlingas (Somnath, Nageshwar, Mahakaleshwar, Omkareshwar, Trimbakeshwar, Grishneshwar, Kashi Vishwanath, Baidyanath, Rameswaram) with strategic flights — from ₹94,999 pp twin share.",
    category: "Religious",
    availability: "always",
    durationDays: 14,
    durationNights: 13,
    durationUnit: "days",
    durationLabel: "13 nights / 14 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 14,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: [
      "gujarat",
      "somnath",
      "dwarka",
      "ujjain",
      "varanasi",
      "delhi",
      "rameswaram",
    ],
    primaryDestinationSlug: "gujarat",
    address: "Rajkot (RAJ) or Ahmedabad (AMD) arrival; Madurai (IXM) or Chennai departure",
    mapLat: "22.3039",
    mapLng: "70.8022",
    mapZoom: 5,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Saurashtra · Somnath",
        morning: "Land Rajkot or Ahmedabad. Drive to Somnath via Veraval (about 4–5 hours).",
        afternoon: "Check in near Somnath temple. Rest before evening aarti.",
        evening: "Somnath seaside aarti. Overnight Somnath.",
      },
      {
        dayNumber: 2,
        title: "Somnath & Nageshwar",
        morning: "Morning darshan at Somnath Jyotirlinga.",
        afternoon: "Drive to Dwarka via Nageshwar Jyotirlinga darshan.",
        evening: "Reach Dwarka. Dinner; overnight.",
      },
      {
        dayNumber: 3,
        title: "Dwarka · Bet Dwarka",
        morning: "Dwarkadhish darshan and temple precinct walk.",
        afternoon: "Ferry to Bet Dwarka for darshan (timings permitting).",
        evening: "Overnight Dwarka.",
      },
      {
        dayNumber: 4,
        title: "Fly west India → Ujjain",
        morning: "Transfer to Rajkot or Ahmedabad airport. Flight to Indore (quoted separately or self-booked).",
        afternoon: "Drive to Ujjain. Evening rest.",
        evening: "Optional Sandhya aarti at Mahakaleshwar if slot allows. Overnight Ujjain.",
      },
      {
        dayNumber: 5,
        title: "Mahakaleshwar Bhasma aarti",
        morning: "Coordinated Bhasma aarti or morning darshan at Mahakaleshwar Jyotirlinga.",
        afternoon: "Harsiddhi and Kal Bhairav shrines. Free time.",
        evening: "Overnight Ujjain.",
      },
      {
        dayNumber: 6,
        title: "Omkareshwar island",
        morning: "Drive to Omkareshwar (about 4 hours). Cross to Mandhata island for Jyotirlinga darshan.",
        afternoon: "Parikrama viewpoints. Return toward Indore belt.",
        evening: "Overnight near Omkareshwar or Indore.",
      },
      {
        dayNumber: 7,
        title: "Trimbakeshwar · Nashik",
        morning: "Fly or drive to Nashik region (routing confirmed per season).",
        afternoon: "Trimbakeshwar Jyotirlinga darshan near Brahmagiri hills.",
        evening: "Overnight Nashik.",
      },
      {
        dayNumber: 8,
        title: "Grishneshwar & Ellora",
        morning: "Grishneshwar Jyotirlinga darshan.",
        afternoon: "Ellora cave visit (UNESCO) at moderate pace.",
        evening: "Overnight Aurangabad.",
      },
      {
        dayNumber: 9,
        title: "Fly to Varanasi",
        morning: "Flight to Varanasi. Hotel check-in.",
        afternoon: "Rest or ghat walk.",
        evening: "Ganga aarti. Overnight Varanasi.",
      },
      {
        dayNumber: 10,
        title: "Kashi Vishwanath",
        morning: "Kashi Vishwanath Jyotirlinga darshan in coordinated window.",
        afternoon: "Sarnath optional if energy permits.",
        evening: "Overnight Varanasi.",
      },
      {
        dayNumber: 11,
        title: "East India · Baidyanath",
        morning: "Fly Kolkata/Patna/Ranchi corridor (as booked). Drive to Deoghar.",
        afternoon: "Baba Baidyanath Jyotirlinga darshan at Deoghar.",
        evening: "Overnight Deoghar.",
      },
      {
        dayNumber: 12,
        title: "Southbound to Rameswaram",
        morning: "Flight to Madurai or Chennai (self/quoted).",
        afternoon: "Drive Rameswaram (about 3 hours from Madurai).",
        evening: "Overnight Rameswaram.",
      },
      {
        dayNumber: 13,
        title: "Rameswaram Ramanathaswamy",
        morning: "Rameswaram Jyotirlinga darshan. Setu coast viewpoints.",
        afternoon: "Dhanushkodi optional excursion.",
        evening: "Overnight Rameswaram.",
      },
      {
        dayNumber: 14,
        title: "Departure",
        morning: "Breakfast. Transfer Madurai airport or Chennai as booked. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Honest scope:</strong> all twelve Jyotirlingas in one road trip need 21+ days. This <em>highlights</em> circuit covers nine canonical sites plus Dwarka Krishna pilgrimage — Kedarnath, Bhimashankar, Aundha Nagnath, and Parli Vaijnath are best as add-on modules we can quote.</p>",
      "<p><strong>Routing:</strong> mix of AC road days and domestic flights you book (or we arrange at cost). Pure veg MAP throughout.</p>",
      "<p><strong>Who it suits:</strong> devotees with 2 weeks and appetite for long travel days — not suited to travellers needing wheelchair-only access on ghats.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 94999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 3 }] },
  details: details(
    [
      {
        title: "Why only nine Jyotirlingas?",
        content:
          "Geography and Himalaya/Konkan legs make all twelve in 13 nights unrealistic without sacrificing darshan quality. We name every shrine visited and can extend for Kedarnath or Maharashtra remainder.",
      },
      {
        title: "Are domestic flights included?",
        content: "Land package excludes flights unless explicitly added. Typical need: 4–5 sectors — budget ₹25,000–40,000 pp extra in economy.",
      },
    ],
    ["All hotel nights per itinerary"],
    [
      "Domestic flights between sectors",
      "Ellora monument tickets",
      "Ferry / special darshan charges",
    ],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Jyotirlinga Highlights Circuit | 13N/14D Pilgrimage",
    seoDescription:
      "Nine Jyotirlingas in 13 nights — Somnath to Rameswaram with flights. Honest pan-India darshan from ₹94,999 pp.",
    facebookTitle: "Twelve Jyotirlinga Highlights — 13 nights",
    facebookDescription: "Pan-India darshan circuit with named shrines and realistic pacing.",
    twitterTitle: "Jyotirlinga Circuit | 13N",
    twitterDescription: "Nine shrines · veg MAP · from ₹94,999 pp.",
    published: true,
  },
};

const dwarkaSomnathGujaratTempleTour: TourFormat = {
  slug: "dwarka-somnath-gujarat-temple-tour",
  general: {
    title: "Dwarka–Somnath Gujarat Temple Tour",
    summary:
      "Saurashtra’s twin pilgrimage — Dwarkadhish, Bet Dwarka, Somnath Jyotirlinga, and Nageshwar in four nights. From ₹14,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["gujarat", "dwarka", "somnath"],
    primaryDestinationSlug: "dwarka",
    address: "Rajkot Airport (RAJ) or Ahmedabad (AMD) pickup",
    mapLat: "22.2394",
    mapLng: "68.9678",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · drive to Dwarka",
        morning: "Pickup Rajkot/Ahmedabad airport. Scenic drive to Dwarka.",
        afternoon: "Check in. Brief rest.",
        evening: "Dwarkadhish evening darshan. Overnight Dwarka.",
      },
      {
        dayNumber: 2,
        title: "Bet Dwarka · Nageshwar",
        morning: "Ferry to Bet Dwarka temple.",
        afternoon: "Nageshwar Jyotirlinga en route planning toward Somnath.",
        evening: "Overnight Somnath or en-route Veraval.",
      },
      {
        dayNumber: 3,
        title: "Somnath Jyotirlinga",
        morning: "Somnath temple darshan and sea-facing pradakshina.",
        afternoon: "Triveni Sangam viewpoint or Bhalka Tirth.",
        evening: "Somnath evening aarti. Overnight Somnath.",
      },
      {
        dayNumber: 4,
        title: "Coastal temples · return leg",
        morning: "Optional Porbandar or Sudama temple if routing via Porbandar.",
        afternoon: "Drive toward Rajkot / Ahmedabad belt.",
        evening: "Overnight hub city for departure.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning: "Breakfast. Airport drop. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Classic Saurashtra loop</strong> without rushing Bet Dwarka tides or Somnath aarti into one afternoon.</p>",
      "<p>MAP pure veg hotels. Ferry tickets and monument entries paid locally where applicable.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 14999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details(
    [{ title: "Is alcohol allowed?", content: "Dwarka and Somnath are dry temple towns — no alcohol on the itinerary." }],
    [],
    ["Bet Dwarka ferry tickets"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Dwarka Somnath Tour | 4N/5D Gujarat Temples",
    seoDescription: "Dwarka, Bet Dwarka, Somnath & Nageshwar — private cab from ₹14,999 pp.",
    facebookTitle: "Dwarka–Somnath Gujarat temples",
    facebookDescription: "Four nights, two Jyotirlingas, Krishna coast.",
    twitterTitle: "Dwarka Somnath | 4N/5D",
    twitterDescription: "Saurashtra pilgrimage from ₹14,999 pp.",
    published: true,
  },
};

const goldenTempleAmritsarDarshan: TourFormat = {
  slug: "golden-temple-amritsar-darshan",
  general: {
    title: "Golden Temple Amritsar Darshan",
    summary:
      "Two nights at Harimandir Sahib — morning Asa di Var, langar experience, and old-city heritage walk. From ₹7,499 pp.",
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
    destinationSlugs: ["amritsar"],
    primaryDestinationSlug: "amritsar",
    address: "Sri Guru Ram Dass Jee International Airport (ATQ) pickup",
    mapLat: "31.6200",
    mapLng: "74.8765",
    mapZoom: 13,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Amritsar · first darshan",
        morning: "Airport pickup. Check in near Golden Temple precinct.",
        afternoon: "Rest. Cover head and modest dress for Harmandir.",
        evening: "Evening darshan and Palki Sahib ceremony. Overnight Amritsar.",
      },
      {
        dayNumber: 2,
        title: "Golden Temple dawn · langar",
        morning: "Early Asa di Var / morning darshan. Participate in Guru ka Langar (community kitchen).",
        afternoon: "Jallianwala Bagh and Partition Museum optional.",
        evening: "Second evening at sarovar parikrama. Overnight.",
      },
      {
        dayNumber: 3,
        title: "Departure",
        morning: "Breakfast. Optional quick darshan. Airport transfer.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Respectful visit:</strong> we brief turban/headscarf norms, shoe deposit, and no tobacco/alcohol on this trip.</p>",
      "<p>Vegetarian MAP hotel — many guests eat langar for lunch.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 7499, currency: "INR", discounts: [{ name: "Group of 8+", type: "percent", value: 5 }] },
  details: details(
    [
      {
        title: "Can we stay inside the temple complex?",
        content: "Default quote uses a hotel nearby. Niwas rooms inside the complex are subject to availability — ask when requesting.",
      },
    ],
    [],
    ["Partition Museum tickets"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Golden Temple Amritsar Darshan | 2N/3D",
    seoDescription: "Harmandir Sahib darshan, langar, heritage walk — from ₹7,499 pp twin share.",
    facebookTitle: "Golden Temple Amritsar — 2 nights",
    facebookDescription: "Dawn darshan and evening Palki at Harimandir Sahib.",
    twitterTitle: "Amritsar Golden Temple | 2N",
    twitterDescription: "From ₹7,499 pp · private transfers.",
    published: true,
  },
};

const amritsarHeritageWagahBorder: TourFormat = {
  slug: "amritsar-heritage-wagah-border",
  general: {
    title: "Amritsar Heritage + Wagah Border",
    summary:
      "Golden Temple, Wagah Beating Retreat, and Punjab heritage in three nights — culture with your pilgrimage. From ₹9,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["amritsar"],
    primaryDestinationSlug: "amritsar",
    address: "Amritsar Airport (ATQ) or Amritsar Junction pickup",
    mapLat: "31.6340",
    mapLng: "74.8723",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive · Golden Temple evening",
        morning: "Pickup and hotel check-in.",
        afternoon: "Old city bazaar walk: kada, juttis, papad-wadi.",
        evening: "Golden Temple evening darshan. Overnight.",
      },
      {
        dayNumber: 2,
        title: "Dawn darshan · city heritage",
        morning: "Morning Harmandir darshan. Langar optional.",
        afternoon: "Jallianwala Bagh, Gobindgarh Fort or Partition Museum.",
        evening: "Rest before early Wagah next day.",
      },
      {
        dayNumber: 3,
        title: "Wagah border ceremony",
        morning: "Late morning rest (early night recommended).",
        afternoon: "Drive to Wagah border (about 45 minutes). Seats for Beating Retreat — timing varies by season.",
        evening: "Return Amritsar. Overnight.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast. Transfer airport or railway. Tour ends.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Combines spiritual time at the sarovar with Wagah — carry photo ID for border area entry.</p>",
      "<p>Wagah seating is subject to security rules; we use registered local desk where required.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 9999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details(
    [{ title: "Is Wagah VIP seating included?", content: "Standard visitor gallery — not VIP grandstand unless we add that tier at cost." }],
    ["Wagah border transfer & coordinator"],
    ["Museum and fort entry fees", "Wagah VIP gallery upgrades"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Amritsar Heritage & Wagah Border | 3N/4D",
    seoDescription: "Golden Temple plus Wagah ceremony — 3 nights from ₹9,999 pp.",
    facebookTitle: "Amritsar + Wagah — 3 nights",
    facebookDescription: "Temple darshan and border retreat with private cab.",
    twitterTitle: "Amritsar Wagah | 3N/4D",
    twitterDescription: "From ₹9,999 pp.",
    published: true,
  },
};

const bodhGayaEnlightenmentTour: TourFormat = {
  slug: "bodh-gaya-enlightenment-tour",
  general: {
    title: "Bodh Gaya Enlightenment Tour",
    summary:
      "Mahabodhi Temple, Bodhi tree meditation, and monasteries of the Buddhist circuit — three calm nights. From ₹11,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 4,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["bodh-gaya"],
    primaryDestinationSlug: "bodh-gaya",
    address: "Gaya Airport (GAY) or Gaya Junction pickup",
    mapLat: "24.6961",
    mapLng: "84.9869",
    mapZoom: 13,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Bodh Gaya",
        morning: "Pickup Gaya airport or station. Check in near temple zone.",
        afternoon: "Quiet orientation of the Mahabodhi complex from outside if closed window.",
        evening: "Evening circumambulation of inner precinct when open. Overnight.",
      },
      {
        dayNumber: 2,
        title: "Mahabodhi Temple",
        morning: "Meditation hour under the Bodhi tree (silent phone etiquette). Temple sanctum visit.",
        afternoon: "Great Buddha statue and monastery row (Thai, Japanese, Bhutanese).",
        evening: "Optional chanting session. Overnight Bodh Gaya.",
      },
      {
        dayNumber: 3,
        title: "Rajgir · Nalanda",
        morning: "Day trip to Rajgir — Vulture Peak viewpoint, hot springs area.",
        afternoon: "Nalanda ruins museum.",
        evening: "Return Bodh Gaya.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast. Optional sutra offering. Transfer Gaya.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Vegetarian MAP throughout. Shoes off in temple; modest shoulders and knees.</p>",
      "<p>Nalanda adds archaeological depth without rushing darshan morning.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 11999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 5 }] },
  details: details([], ["Rajgir–Nalanda day excursion"], ["Nalanda museum tickets"]),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Bodh Gaya Enlightenment Tour | 3N/4D",
    seoDescription: "Mahabodhi Temple, Rajgir, Nalanda — pilgrimage from ₹11,999 pp.",
    facebookTitle: "Bodh Gaya — 3 nights",
    facebookDescription: "Bodhi tree, monasteries, Nalanda day trip.",
    twitterTitle: "Bodh Gaya Tour | 3N/4D",
    twitterDescription: "From ₹11,999 pp.",
    published: true,
  },
};

const puriJagannathDarshan: TourFormat = {
  slug: "puri-jagannath-darshan",
  general: {
    title: "Puri Jagannath Darshan",
    summary:
      "Jagannath Temple darshan, Gundicha vibe, and Konark Sun Temple — coastal Odisha pilgrimage. From ₹12,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["puri"],
    primaryDestinationSlug: "puri",
    address: "Biju Patnaik Airport Bhubaneswar (BBI) pickup",
    mapLat: "19.8048",
    mapLng: "85.8181",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Bhubaneswar → Puri",
        morning: "Pickup Bhubaneswar. Optional Lingaraj darshan en route if timing fits.",
        afternoon: "Reach Puri. Check in near Swargadwar belt.",
        evening: "Evening darshan attempt per shrine access rules (non-Hindus view from Raghunandan Library roof if applicable). Overnight Puri.",
      },
      {
        dayNumber: 2,
        title: "Jagannath darshan morning",
        morning: "Coordinated darshan window. Guide explains annakshetra and temple customs.",
        afternoon: "Beach walk — respect local dress codes away from temple lane.",
        evening: "Aarti vantage if open to visitors. Overnight.",
      },
      {
        dayNumber: 3,
        title: "Konark Sun Temple",
        morning: "Drive to Konark Sun Temple (about 1.5 hours).",
        afternoon: "Chandrabhaga beach pause. Return Puri.",
        evening: "Free evening for mahaprasad.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Checkout. Drop Bhubaneswar airport.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>We coordinate with local pandas per your community tradition on request.</p>",
      "<p>Konark UNESCO visit balances temple-only trip with Odisha heritage.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 12999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details(
    [
      {
        title: "Who may enter Jagannath sanctum?",
        content: "Shrine rules limit entry to practising Hindus — others enjoy heritage interpretation and coastal sites on the same package.",
      },
    ],
    [],
    ["Konark monument tickets"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Puri Jagannath Darshan | 3N/4D Odisha",
    seoDescription: "Jagannath Temple & Konark — from ₹12,999 pp with private cab.",
    facebookTitle: "Puri Jagannath darshan",
    facebookDescription: "Three nights, Konark day, veg MAP.",
    twitterTitle: "Puri Jagannath | 3N/4D",
    twitterDescription: "From ₹12,999 pp.",
    published: true,
  },
};

const rameswaramTempleTour: TourFormat = {
  slug: "rameswaram-temple-tour",
  general: {
    title: "Rameswaram Temple Tour",
    summary:
      "Ramanathaswamy Jyotirlinga, temple tanks, and Dhanushkodi coast — four nights from Madurai gateway. From ₹16,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["rameswaram"],
    primaryDestinationSlug: "rameswaram",
    address: "Madurai Airport (IXM) pickup",
    mapLat: "9.2881",
    mapLng: "79.3127",
    mapZoom: 12,
    days: [
      {
        dayNumber: 1,
        title: "Madurai · drive Rameswaram",
        morning: "Land Madurai. Optional Meenakshi darshan if early arrival.",
        afternoon: "Scenic drive across Pamban bridge to Rameswaram.",
        evening: "Evening temple precinct walk. Overnight Rameswaram.",
      },
      {
        dayNumber: 2,
        title: "Ramanathaswamy darshan",
        morning: "Main Jyotirlinga darshan. Agni Theertham holy dip optional.",
        afternoon: "Twenty-two theertham corridor tour on foot (easy pace).",
        evening: "Rest. Overnight.",
      },
      {
        dayNumber: 3,
        title: "Dhanushkodi",
        morning: "Jeep / van to Dhanushkodi ghost town tip.",
        afternoon: "Return. Gandhamadhana Parvatham viewpoint.",
        evening: "Overnight Rameswaram.",
      },
      {
        dayNumber: 4,
        title: "Return toward Madurai",
        morning: "Checkout. Drive Madurai.",
        afternoon: "Check in Madurai. Evening Meenakshi temple if missed Day 1.",
        evening: "Overnight Madurai.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning: "Airport drop Madurai.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Vegetarian MAP. Carry modest swimwear cover for theertham dips.</p>",
      "<p>Dhanushkodi road conditions vary — we use authorised local jeeps.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 16999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 5 }] },
  details: details([], ["Dhanushkodi jeep excursion"], ["Meenakshi special darshan tickets", "Dhanushkodi jeep fee if paid direct"]),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Rameswaram Temple Tour | 4N/5D Jyotirlinga",
    seoDescription: "Ramanathaswamy, Dhanushkodi, Madurai — from ₹16,999 pp.",
    facebookTitle: "Rameswaram temple tour",
    facebookDescription: "Jyotirlinga darshan and Pamban bridge drive.",
    twitterTitle: "Rameswaram | 4N/5D",
    twitterDescription: "From ₹16,999 pp.",
    published: true,
  },
};

const mathuraVrindavanAgraCircuit: TourFormat = {
  slug: "mathura-vrindavan-agra-circuit",
  general: {
    title: "Mathura–Vrindavan–Agra Circuit",
    summary:
      "Krishna janmbhoomi, Vrindavan kunds, and Taj Mahal — Braj bhumi with one Agra night. From ₹13,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 4,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["mathura", "vrindavan", "agra", "delhi"],
    primaryDestinationSlug: "mathura",
    address: "Delhi IGI (DEL) or Agra Cantt pickup",
    mapLat: "27.4924",
    mapLng: "77.6737",
    mapZoom: 9,
    days: [
      {
        dayNumber: 1,
        title: "Delhi · Mathura",
        morning: "Pickup Delhi or Agra. Drive Mathura.",
        afternoon: "Shri Krishna Janmabhoomi darshan. Vishram Ghat.",
        evening: "Overnight Mathura.",
      },
      {
        dayNumber: 2,
        title: "Vrindavan temples",
        morning: "Banke Bihari, ISKCON, and Prem Mandir (exterior/light show evening).",
        afternoon: "Nidhivan / Seva Kunj outer visit per shrine timings.",
        evening: "Overnight Vrindavan.",
      },
      {
        dayNumber: 3,
        title: "Gokul · Govardhan",
        morning: "Gokul and Raman Reti.",
        afternoon: "Govardhan parikrama start point (partial parikrama by vehicle for seniors).",
        evening: "Return Vrindavan or Mathura.",
      },
      {
        dayNumber: 4,
        title: "Agra · Taj Mahal",
        morning: "Drive Agra. Taj Mahal sunrise or morning slot.",
        afternoon: "Agra Fort.",
        evening: "Overnight Agra.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning: "Breakfast. Drop Delhi or Agra station/airport.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Pure veg MAP. Banke Bihari has crowding — we time slots realistically.</p>",
      "<p>Taj entry tickets booked in your name at cost unless pre-purchased in package add-on.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 13999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details([], [], ["Taj Mahal & Agra Fort monument tickets"]),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Mathura Vrindavan Agra Circuit | 4N/5D",
    seoDescription: "Braj darshan and Taj Mahal — from ₹13,999 pp.",
    facebookTitle: "Mathura Vrindavan + Taj",
    facebookDescription: "Krishna pilgrimage with Agra heritage.",
    twitterTitle: "Braj Agra Circuit | 4N",
    twitterDescription: "From ₹13,999 pp.",
    published: true,
  },
};

const ajmerSharifPushkar: TourFormat = {
  slug: "ajmer-sharif-pushkar-darshan",
  general: {
    title: "Ajmer Sharif + Pushkar",
    summary:
      "Khwaja Gharib Nawaz ziarat, Ana Sagar, and Pushkar Brahma temple — Rajasthan twin holy towns. From ₹10,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["ajmer", "pushkar", "rajasthan"],
    primaryDestinationSlug: "ajmer",
    address: "Jaipur Airport (JAI) or Ajmer Junction pickup",
    mapLat: "26.4499",
    mapLng: "74.6399",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Ajmer",
        morning: "Pickup Jaipur or Ajmer. Hotel check-in.",
        afternoon: "Dargah Sharif outer courtyard orientation. Headscarf for all genders inside.",
        evening: "Qawwali ambience near dargah (public). Overnight Ajmer.",
      },
      {
        dayNumber: 2,
        title: "Dargah ziarat",
        morning: "Main ziarat with local khadim coordination as per your tradition.",
        afternoon: "Adhai Din Ka Jhonpra and Ana Sagar.",
        evening: "Overnight Ajmer.",
      },
      {
        dayNumber: 3,
        title: "Pushkar",
        morning: "Drive Pushkar (30 minutes). Brahma Temple and ghats.",
        afternoon: "Pushkar lake parikrama. No meat/alcohol in town.",
        evening: "Return Ajmer or overnight Pushkar.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast. Drop Jaipur airport or Ajmer station.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Respectful dress at dargah and temples. Chadar offerings paid locally if you wish.</p>",
      "<p>Pushkar is strictly vegetarian — plan meals accordingly.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 10999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details([], ["Pushkar day excursion"], ["Chadar / floral offerings"]),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Ajmer Sharif & Pushkar | 3N/4D",
    seoDescription: "Dargah ziarat and Brahma temple — from ₹10,999 pp.",
    facebookTitle: "Ajmer Sharif + Pushkar",
    facebookDescription: "Three nights, veg MAP, private cab.",
    twitterTitle: "Ajmer Pushkar | 3N/4D",
    twitterDescription: "From ₹10,999 pp.",
    published: true,
  },
};

const ujjainMahakaleshwarDarshan: TourFormat = {
  slug: "ujjain-mahakaleshwar-darshan",
  general: {
    title: "Ujjain Mahakaleshwar Darshan",
    summary:
      "Mahakaleshwar Jyotirlinga, Bhasma aarti coordination, and Shipra aarti — two focused nights. From ₹8,499 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 5,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["ujjain"],
    primaryDestinationSlug: "ujjain",
    address: "Devi Ahilya Bai Holkar Airport Indore (IDR) pickup",
    mapLat: "23.1828",
    mapLng: "75.7772",
    mapZoom: 13,
    days: [
      {
        dayNumber: 1,
        title: "Indore · Ujjain",
        morning: "Pickup Indore airport. Drive Ujjain (about 1 hour).",
        afternoon: "Check in. Rest before evening Shipra aarti at Ram Ghat.",
        evening: "Overnight Ujjain.",
      },
      {
        dayNumber: 2,
        title: "Mahakaleshwar",
        morning: "Bhasma aarti or morning darshan slot (registration rules apply).",
        afternoon: "Harsiddhi, Kal Bhairav, and Mangalnath optional.",
        evening: "Second temple visit or relaxed evening.",
      },
      {
        dayNumber: 3,
        title: "Departure",
        morning: "Breakfast. Return Indore airport.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Bhasma aarti passes are competitive — we apply per current temple portal and confirm odds before you pay.</p>",
      "<p>Vegetarian MAP hotel near temple zone.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 8499, currency: "INR", discounts: [{ name: "Group of 8+", type: "percent", value: 5 }] },
  details: details(
    [
      {
        title: "Is Bhasma aarti guaranteed?",
        content: "No — shrine lottery/queue rules decide. We assist registration and offer morning darshan backup.",
      },
    ],
    [],
    ["Bhasma aarti registration fee if applicable"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Ujjain Mahakaleshwar Darshan | 2N/3D",
    seoDescription: "Jyotirlinga Bhasma aarti coordination — from ₹8,499 pp.",
    facebookTitle: "Ujjain Mahakaleshwar darshan",
    facebookDescription: "Shipra aarti and Mahakal morning.",
    twitterTitle: "Ujjain Darshan | 2N/3D",
    twitterDescription: "From ₹8,499 pp.",
    published: true,
  },
};

const haridwarRishikeshSpiritualEscape: TourFormat = {
  slug: "haridwar-rishikesh-spiritual-escape",
  general: {
    title: "Haridwar–Rishikesh Spiritual Escape",
    summary:
      "Har Ki Pauri Ganga aarti, Rishikesh ghats, and Himalayan foothill ashram vibe — four nights Uttarakhand. From ₹11,999 pp.",
    category: "Religious",
    availability: "always",
    durationDays: 5,
    durationNights: 4,
    durationUnit: "days",
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["haridwar", "rishikesh"],
    primaryDestinationSlug: "haridwar",
    address: "Dehradun Airport (DED) or Haridwar Junction pickup",
    mapLat: "29.9457",
    mapLng: "78.1642",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Haridwar",
        morning: "Pickup Dehradun or Haridwar station.",
        afternoon: "Mansa Devi cable car optional. Walk Har Ki Pauri.",
        evening: "Ganga aarti at Har Ki Pauri. Overnight Haridwar.",
      },
      {
        dayNumber: 2,
        title: "Temple belt",
        morning: "Chandi Devi or Daksha Mahadev per interest.",
        afternoon: "Drive Rishikesh. Check in Tapovan or Laxman Jhula side.",
        evening: "Ganga aarti at Parmarth or Triveni Ghat.",
      },
      {
        dayNumber: 3,
        title: "Rishikesh ashram walk",
        morning: "Beatles Ashram / Sivananda area quiet walk.",
        afternoon: "Laxman Jhula, Ram Jhula bridges. Pure veg lunch cafes.",
        evening: "Yoga or meditation optional add-on.",
      },
      {
        dayNumber: 4,
        title: "Neelkanth or leisure",
        morning: "Neelkanth Mahadev day trip OR free Rishikesh morning.",
        afternoon: "Return or spa time on request.",
        evening: "Overnight Rishikesh.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        morning: "Breakfast. Drop Dehradun airport or Haridwar.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p>Alcohol-free Rishikesh; Haridwar is pilgrimage-first. MAP veg meals.</p>",
      "<p>Monsoon brings Ganga swell — we adjust ghat access for safety.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 11999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: details([], ["Neelkanth day excursion vehicle"], ["Cable car tickets", "Yoga class fees"]),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Haridwar Rishikesh Spiritual Escape | 4N/5D",
    seoDescription: "Ganga aarti both towns — from ₹11,999 pp twin share.",
    facebookTitle: "Haridwar & Rishikesh — 4 nights",
    facebookDescription: "Aarti, ghats, Neelkanth optional day.",
    twitterTitle: "Haridwar Rishikesh | 4N/5D",
    twitterDescription: "From ₹11,999 pp.",
    published: true,
  },
};

export const indiaReligiousPendingTours: TourFormat[] = [
  varanasiSpiritualTour,
  shirdiSaiBabaDarshan,
  twelveJyotirlingaHighlightsCircuit,
  dwarkaSomnathGujaratTempleTour,
  goldenTempleAmritsarDarshan,
  amritsarHeritageWagahBorder,
  bodhGayaEnlightenmentTour,
  puriJagannathDarshan,
  rameswaramTempleTour,
  mathuraVrindavanAgraCircuit,
  ajmerSharifPushkar,
  ujjainMahakaleshwarDarshan,
  haridwarRishikeshSpiritualEscape,
];
