/**
 * Pending locked-format India family, camping & leisure tours (images deferred).
 * Skips products already seeded: shimla-manali-family-delight, jaisalmer-sam-sand-dunes-desert-camp, goa-beach-getaway.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

const NO_IMAGES: TourFormat["images"] = {
  banner: null,
  cover: null,
  gallery: [],
  seoImage: null,
};

type DayBlock = {
  dayNumber: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type MkTourInput = {
  slug: string;
  title: string;
  summary: string;
  category: TourFormat["general"]["category"];
  durationDays: number;
  durationNights: number;
  difficulty: TourFormat["general"]["difficulty"];
  minPeople?: number;
  maxGroupSize?: number;
  minDayBeforeBooking?: number;
  isFeatured?: boolean;
  priceFrom: number;
  destinationSlugs: string[];
  primaryDestinationSlug: string;
  address: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  days: DayBlock[];
  descriptionHtml: string;
  details: TourFormat["details"];
  seoBlurb: string;
};

function mkSeo(title: string, nights: number, days: number, price: number, blurb: string): TourFormat["seo"] {
  const short = title.length > 42 ? title.slice(0, 39) + "…" : title;
  return {
    seoIndex: true,
    seoTitle: `${title} | ${nights}N/${days}D`,
    seoDescription: `${blurb} Twin share from ₹${price.toLocaleString("en-IN")} pp.`,
    facebookTitle: `${title} — ${nights} nights`,
    facebookDescription: blurb,
    twitterTitle: `${short} | ${nights}N/${days}D`,
    twitterDescription: `From ₹${price.toLocaleString("en-IN")} pp twin share.`,
    published: true,
  };
}

function mkTour(t: MkTourInput): TourFormat {
  return {
    slug: t.slug,
    general: {
      title: t.title,
      summary: t.summary,
      category: t.category,
      availability: "always",
      durationDays: t.durationDays,
      durationNights: t.durationNights,
      durationUnit: "days",
      durationLabel: `${t.durationNights} nights / ${t.durationDays} days`,
      difficulty: t.difficulty,
      minPeople: t.minPeople ?? 2,
      maxGroupSize: t.maxGroupSize ?? 12,
      minDayBeforeBooking: t.minDayBeforeBooking ?? 3,
      isFeatured: t.isFeatured ?? false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: t.destinationSlugs,
      primaryDestinationSlug: t.primaryDestinationSlug,
      address: t.address,
      mapLat: t.mapLat,
      mapLng: t.mapLng,
      mapZoom: t.mapZoom,
      days: t.days,
    },
    content: { descriptionHtml: t.descriptionHtml },
    pricing: {
      priceFrom: t.priceFrom,
      currency: "INR",
      discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
    },
    details: t.details,
    images: NO_IMAGES,
    seo: mkSeo(t.title, t.durationNights, t.durationDays, t.priceFrom, t.seoBlurb),
  };
}

const MAP_INCLUDE = [
  "Accommodation as per itinerary (twin sharing)",
  "Breakfast + dinner at the hotel each night (MAP)",
  "Private vehicle for transfers & sightseeing",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Meet-and-greet at arrival point",
];

const MAP_EXCLUDE = [
  "Flights / trains to starting point",
  "Lunch (unless listed)",
  "Tips & personal expenses",
  "Travel insurance",
  "Anything not mentioned in includes",
];

const BEFORE_STD = ["Fitness", "Documents", "Weather & kit", "Arrival", "Rooms", "Money on the road"];

const FAC_MAP = ["Private cab", "Airport transfers", "MAP meals (B/D)", "24×7 helpline"];

function leisureDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
  styles: string[] = ["Family Friendly", "Private / Independent"],
  facilities: string[] = [],
  before: string[] = [],
  sharedFaqs: string[] = [
    "What is the best time for this tour?",
    "Is this a private or group tour?",
    "Are flights included?",
  ],
): TourFormat["details"] {
  return {
    sharedFaqTitles: sharedFaqs,
    extraFaqs,
    includeTitles: [...MAP_INCLUDE, ...includeExtras],
    excludeTitles: [...MAP_EXCLUDE, ...excludeExtras],
    beforeYouGoTitles: [...BEFORE_STD, ...before],
    travelStyleTitles: styles,
    facilityTitles: [...FAC_MAP, ...facilities],
  };
}

function familyDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
): TourFormat["details"] {
  return leisureDetails(
    extraFaqs,
    includeExtras,
    excludeExtras,
    ["Family Friendly", "Private / Independent", "Hill Stations"],
    [],
    [],
    [
      "Is this suitable for young children?",
      "Is this a private or group tour?",
      "Are flights included?",
      "What is the best time for this tour?",
    ],
  );
}

function campingDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
  before: string[] = [],
): TourFormat["details"] {
  return {
    sharedFaqTitles: [
      "What camping gear is provided?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs,
    includeTitles: [
      "Accommodation as per itinerary (hotel + camp nights)",
      "Private vehicle for transfers & sightseeing",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "Camping equipment (tent, sleeping bag, mat) on camp nights",
      "Camp dinner and breakfast on listed camp nights",
      ...includeExtras,
    ],
    excludeTitles: [
      ...MAP_EXCLUDE,
      "Personal trekking poles or gaiters unless trek segment listed",
      ...excludeExtras,
    ],
    beforeYouGoTitles: [...BEFORE_STD, "Trek kit list", ...before],
    travelStyleTitles: ["Adventure", "Trekking & Camping", "Family Friendly", "Private / Independent"],
    facilityTitles: ["Private cab", "Camping equipment", "24×7 helpline"],
  };
}

function cityDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
): TourFormat["details"] {
  return leisureDetails(
    extraFaqs,
    ["Station / airport pickup & drop in city", ...includeExtras],
    excludeExtras,
    ["Cultural", "Private / Independent", "Family Friendly"],
    ["Heritage hotel (city centre band)"],
    ["City walking shoes"],
  );
}

const CHILD_PACE_FAQ = {
  title: "Are sights paced for children?",
  content:
    "Drives include snack and toilet stops. Adjoining rooms on request. Tell us ages upfront so we trim walking blocks.",
};

export const indiaFamilyCampLeisureCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Family" },
  { kind: "category", title: "Camping" },
  { kind: "category", title: "City trips" },
  {
    kind: "faq",
    title: "Is this suitable for young children?",
    content:
      "Most family departures use hotels with pools or gardens and cap driving blocks at about five hours. Stroller-friendly stops are limited in hill stations — we note where carriers work better.",
  },
  {
    kind: "faq",
    title: "What camping gear is provided?",
    content:
      "Tents, sleeping bags with liners, and foam mats on camp nights unless the itinerary notes a fixed safari camp. Bring a torch, power bank, and warm layer for desert or high-altitude camps.",
  },
  {
    kind: "faq",
    title: "Is rafting included on Rishikesh camp packages?",
    content:
      "Standard quote includes one guided rafting section on Grade II–III water in season (September–June). Add-on jumps or extra sections are paid locally.",
  },
  {
    kind: "faq",
    title: "When is Rann of Kutch camping available?",
    content:
      "White desert camps run roughly November–February around Rann Utsav dates. We confirm tent category and festival surcharges before payment.",
  },
  {
    kind: "before_you_go",
    title: "Beach safety",
    content:
      "Swim only in flagged zones on Goa and Andaman days. Reef-safe sunscreen and hydration matter even in winter sun.",
  },
  {
    kind: "before_you_go",
    title: "Desert heat & sand",
    content:
      "Rajasthan and Kutch afternoons can be harsh. Scarves, closed shoes, and lip balm help; plan fort walks for morning.",
  },
  {
    kind: "before_you_go",
    title: "Ladakh altitude with kids",
    content:
      "Children acclimatise differently — we keep Day 1–2 soft in Leh before Nubra or Pangong. Consult your paediatrician about Diamox; we do not prescribe.",
  },
  {
    kind: "include",
    title: "Alleppey day houseboat lunch cruise",
  },
  {
    kind: "include",
    title: "One guided rafting section (Rishikesh season)",
  },
  {
    kind: "include",
    title: "Sunset camel ride at Sam-style dunes (when listed)",
  },
  {
    kind: "facility",
    title: "Beach-side hotel (North Goa)",
  },
  {
    kind: "facility",
    title: "Desert camp stay",
  },
  {
    kind: "facility",
    title: "Lakeside camp (Pangong / Pawna)",
  },
];

// ——— Family (11) ———

const familyTours: TourFormat[] = [
  mkTour({
    slug: "kerala-family-getaway",
    title: "Kerala Family Getaway",
    summary:
      "Munnar tea hills, Thekkady spice forest, and Alleppey backwaters — gentle pacing for families with private cab. Twin share from ₹22,999 pp (min. 2).",
    category: "Family",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 22999,
    destinationSlugs: ["kerala", "cochin", "munnar", "thekkady", "alleppey"],
    primaryDestinationSlug: "kerala",
    address: "Cochin Airport (COK) pickup",
    mapLat: "9.9312",
    mapLng: "76.2673",
    mapZoom: 8,
    days: [
      { dayNumber: 1, title: "Arrive Kochi · Fort Kochi stroll", morning: "Meet driver at COK; hotel check-in.", afternoon: "Fort Kochi nets and lanes at kid pace.", evening: "MAP dinner; overnight Kochi." },
      { dayNumber: 2, title: "Kochi to Munnar", morning: "Drive with Cheeyappara stop.", afternoon: "Tea estate resort check-in.", evening: "Overnight Munnar." },
      { dayNumber: 3, title: "Munnar viewpoints", morning: "Tea museum or factory slot.", afternoon: "Mattupetty / Echo Point if clear.", evening: "Second night Munnar." },
      { dayNumber: 4, title: "Munnar to Thekkady", morning: "Drive to spice country.", afternoon: "Periyar lake boat coordination.", evening: "Overnight Thekkady." },
      { dayNumber: 5, title: "Thekkady to Alleppey", morning: "Scenic drive to backwaters.", afternoon: "Day houseboat lunch cruise.", evening: "Hotel near lagoon; overnight Alleppey." },
      { dayNumber: 6, title: "Departure", morning: "Breakfast; transfer to COK. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml:
      "<p><strong>Family pacing:</strong> one driver, MAP dinners, and a wide-canal houseboat day instead of tight city hops.</p><p><strong>Stays:</strong> 1N Kochi · 2N Munnar · 1N Thekkady · 1N Alleppey.</p>",
    details: familyDetails(
      [
        CHILD_PACE_FAQ,
        {
          title: "Is houseboat safe for kids?",
          content: "Day cruise uses wide canals with life jackets; overnight boat can swap to resort on request.",
        },
      ],
      ["Periyar boat ride coordination (Thekkady)", "Alleppey day houseboat lunch cruise"],
      ["Elephant rides", "Park entry above quoted coordination"],
    ),
    seoBlurb: "Munnar, Thekkady and Alleppey family circuit with private cab.",
  }),
  mkTour({
    slug: "goa-family-splash",
    title: "Goa Family Splash",
    summary:
      "North Goa beaches, splash time, and one heritage morning — kid-friendly private holiday from ₹14,499 pp (min. 2).",
    category: "Family",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 14499,
    destinationSlugs: ["goa"],
    primaryDestinationSlug: "goa",
    address: "Goa Airport (GOI) or Mopa (GOX) pickup",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 10,
    days: [
      { dayNumber: 1, title: "Arrive · beach sundown", morning: "Airport pickup to North Goa hotel.", afternoon: "Pool or Candolim beach splash.", evening: "Beach dinner option; overnight North Goa." },
      { dayNumber: 2, title: "Baga–Calangute coast", morning: "Morning swim in flagged zone.", afternoon: "Water sports optional (paid locally).", evening: "Family stroll; overnight North Goa." },
      { dayNumber: 3, title: "Old Goa heritage", morning: "Basilica and Sé Cathedral.", afternoon: "Spice plantation lunch tour.", evening: "Last beach evening; overnight North Goa." },
      { dayNumber: 4, title: "Checkout", morning: "Breakfast; airport drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml:
      "<p>One base hotel keeps packing stress low. MAP available on request.</p><p>Monsoon surf is strong — we adjust beach time seasonally.</p>",
    details: familyDetails([CHILD_PACE_FAQ], ["Beach-side hotel (North Goa)"], ["Water sports tickets"]),
    seoBlurb: "North Goa family beaches and Old Goa morning with private cab.",
  }),
  mkTour({
    slug: "andaman-island-family-adventure",
    title: "Andaman Island Family Adventure",
    summary:
      "Port Blair, Havelock, and Neil — ferries, beaches, and easy snorkelling for families. From ₹34,999 pp (min. 2).",
    category: "Family",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    priceFrom: 34999,
    destinationSlugs: ["andaman"],
    primaryDestinationSlug: "andaman",
    address: "Veer Savarkar Airport (IXZ) Port Blair pickup",
    mapLat: "11.6234",
    mapLng: "92.7265",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "Arrive Port Blair", morning: "Airport pickup; Cellular Jail timing if open.", afternoon: "Corbyn's Cove walk.", evening: "Light & Sound show optional; overnight Port Blair." },
      { dayNumber: 2, title: "Ferry to Havelock", morning: "Makruzz / Nautika slot to Havelock.", afternoon: "Radhanagar beach family hour.", evening: "Overnight Havelock." },
      { dayNumber: 3, title: "Havelock snorkel day", morning: "Elephant Beach boat (tickets extra).", afternoon: "Pool time at resort.", evening: "Second night Havelock." },
      { dayNumber: 4, title: "Havelock to Neil", morning: "Ferry to Neil.", afternoon: "Bharatpur or Laxmanpur beach.", evening: "Overnight Neil." },
      { dayNumber: 5, title: "Neil to Port Blair", morning: "Return ferry.", afternoon: "Souvenir market.", evening: "Overnight Port Blair." },
      { dayNumber: 6, title: "Departure", morning: "Breakfast; airport drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml:
      "<p>Ferry seats held in advance on busy dates. Life jackets mandatory on boat days.</p><p>Includes inter-island ferry coordination; flights excluded.</p>",
    details: familyDetails(
      [CHILD_PACE_FAQ, { title: "Is snorkelling included?", content: "Guide-led shore snorkel can be added in Havelock — fins and vests provided by operator when booked." }],
      ["Inter-island ferry coordination (standard class)"],
      ["Ferry upgrades", "Elephant Beach boat tickets", "Scuba dives"],
    ),
    seoBlurb: "Andaman family islands loop with ferry coordination.",
  }),
  mkTour({
    slug: "royal-rajasthan-family-trail",
    title: "Royal Rajasthan Family Trail",
    summary:
      "Jaipur, Jaisalmer fort, and Udaipur lakes — camel dunes and palace stories for all ages. From ₹28,999 pp (min. 2).",
    category: "Family",
    durationDays: 8,
    durationNights: 7,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 28999,
    destinationSlugs: ["rajasthan", "jaipur", "jaisalmer", "udaipur"],
    primaryDestinationSlug: "jaipur",
    address: "Jaipur Airport (JAI) pickup",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 7,
    days: [
      { dayNumber: 1, title: "Arrive Jaipur", morning: "Airport pickup.", afternoon: "City Palace outer courtyards.", evening: "MAP dinner; overnight Jaipur." },
      { dayNumber: 2, title: "Jaipur forts", morning: "Amber Fort jeep or walk.", afternoon: "Jantar Mantar and Hawa Mahal photo stop.", evening: "Overnight Jaipur." },
      { dayNumber: 3, title: "Jaipur to Jaisalmer", morning: "Long drive with lunch stop.", afternoon: "Fort lane walk at golden hour.", evening: "Overnight Jaisalmer." },
      { dayNumber: 4, title: "Jaisalmer fort & Gadisar", morning: "Jain temples inside fort.", afternoon: "Gadisar Lake boat optional.", evening: "Second night Jaisalmer." },
      { dayNumber: 5, title: "Sam dunes family sunset", morning: "Kuldhara stop.", afternoon: "Sam dunes camel family ride.", evening: "Return hotel or camp upgrade optional; overnight Jaisalmer." },
      { dayNumber: 6, title: "Jaisalmer to Udaipur", morning: "Scenic drive via Jodhpur bypass.", afternoon: "Lake Pichola promenade.", evening: "Overnight Udaipur." },
      { dayNumber: 7, title: "Udaipur palaces", morning: "City Palace museum.", afternoon: "Boat ride on Lake Pichola (tickets extra).", evening: "Overnight Udaipur." },
      { dayNumber: 8, title: "Departure", morning: "Breakfast; JAI or Udaipur (UDR) drop as quoted. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml:
      "<p><strong>Pacing:</strong> Sam camel ride is short-format for kids; desert camp night is optional add-on.</p><p>Long drives broken with mirages and chai stops.</p>",
    details: familyDetails(
      [CHILD_PACE_FAQ],
      ["Sam dunes family camel sunset ride"],
      ["Monument tickets", "Lake Pichola boat", "Desert camp upgrade"],
    ),
    seoBlurb: "Jaipur–Jaisalmer–Udaipur family heritage trail.",
  }),
  mkTour({
    slug: "golden-triangle-family",
    title: "Golden Triangle Family",
    summary:
      "Delhi, Taj Mahal at Agra, and Jaipur pink city — the classic family introduction to north India. From ₹19,999 pp (min. 2).",
    category: "Family",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    priceFrom: 19999,
    destinationSlugs: ["delhi", "agra", "jaipur", "rajasthan"],
    primaryDestinationSlug: "delhi",
    address: "Delhi Airport (DEL) or railway pickup",
    mapLat: "28.6139",
    mapLng: "77.2090",
    mapZoom: 8,
    days: [
      { dayNumber: 1, title: "Arrive Delhi", morning: "Pickup and hotel rest.", afternoon: "India Gate and Rajpath stroll.", evening: "Overnight Delhi." },
      { dayNumber: 2, title: "Old & New Delhi", morning: "Red Fort exterior and Jama Masjid area.", afternoon: "Qutub Minar and Humayun's Tomb.", evening: "Overnight Delhi." },
      { dayNumber: 3, title: "Delhi to Agra", morning: "Yamuna Expressway drive.", afternoon: "Agra Fort.", evening: "Overnight Agra." },
      { dayNumber: 4, title: "Taj sunrise · Jaipur", morning: "Taj Mahal sunrise slot.", afternoon: "Drive to Jaipur; evening market.", evening: "Overnight Jaipur." },
      { dayNumber: 5, title: "Jaipur highlights", morning: "Amber Fort.", afternoon: "City Palace and artisan stop.", evening: "Overnight Jaipur." },
      { dayNumber: 6, title: "Departure", morning: "Breakfast; DEL drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Taj timed for cooler morning light. Monument tickets mostly paid locally — we share rates.</p>",
    details: familyDetails([CHILD_PACE_FAQ], [], ["Monument entry fees", "Taj Mahal tickets"]),
    seoBlurb: "Delhi–Agra–Jaipur family Golden Triangle.",
  }),
  mkTour({
    slug: "nainital-jim-corbett-family-getaway",
    title: "Nainital–Jim Corbett Family Getaway",
    summary:
      "Lake toy-train vibes in Nainital and a jeep safari window in Corbett — hills plus wildlife for families. From ₹18,999 pp (min. 2).",
    category: "Family",
    durationDays: 5,
    durationNights: 4,
    difficulty: "easy",
    priceFrom: 18999,
    destinationSlugs: ["nainital", "jim-corbett", "uttarakhand"],
    primaryDestinationSlug: "nainital",
    address: "Kathgodam railway or Pantnagar (PGH) pickup",
    mapLat: "29.3800",
    mapLng: "79.4600",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "Arrive Nainital", morning: "Pickup and lake check-in.", afternoon: "Mall Road and boat on Naini Lake.", evening: "Overnight Nainital." },
      { dayNumber: 2, title: "Nainital viewpoints", morning: "Snow View or ropeway optional.", afternoon: "Zoo or cave gardens at easy pace.", evening: "Second night Nainital." },
      { dayNumber: 3, title: "Nainital to Corbett", morning: "Scenic descent to Ramnagar belt.", afternoon: "Resort check-in; nature walk.", evening: "Overnight Corbett fringe." },
      { dayNumber: 4, title: "Corbett safari day", morning: "Jeep safari slot (permits paid locally).", afternoon: "Pool or rest.", evening: "Second night Corbett." },
      { dayNumber: 5, title: "Departure", morning: "Breakfast; Kathgodam or PGH drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Safari permits billed at current forest rates. Early booking helps on holidays.</p>",
    details: familyDetails(
      [CHILD_PACE_FAQ],
      ["Jeep safari coordination (Corbett)"],
      ["Corbett permit fees", "Ropeway tickets"],
    ),
    seoBlurb: "Nainital lake and Jim Corbett safari family break.",
  }),
  mkTour({
    slug: "ladakh-family-expedition",
    title: "Ladakh Family Expedition",
    summary:
      "Leh acclimatisation, Khardung La to Nubra, and Pangong — paced for families with rest days. From ₹29,999 pp (min. 2).",
    category: "Family",
    durationDays: 7,
    durationNights: 6,
    difficulty: "moderate",
    priceFrom: 29999,
    destinationSlugs: ["leh", "nubra", "pangong", "ladakh"],
    primaryDestinationSlug: "leh",
    address: "Leh Airport (IXL) pickup",
    mapLat: "34.1526",
    mapLng: "77.5771",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "Arrive Leh · rest", morning: "Airport pickup.", afternoon: "Strict hotel rest — no passes.", evening: "Light dinner; overnight Leh." },
      { dayNumber: 2, title: "Soft Leh day", morning: "Shanti Stupa short walk.", afternoon: "Leh market.", evening: "Overnight Leh." },
      { dayNumber: 3, title: "Leh to Nubra", morning: "Khardung La crossing.", afternoon: "Diskit monastery and dunes.", evening: "Camp or hotel Nubra." },
      { dayNumber: 4, title: "Nubra to Pangong", morning: "Shyok route if open.", afternoon: "Lake colour hour.", evening: "Lakeside camp Pangong." },
      { dayNumber: 5, title: "Pangong to Leh", morning: "Sunrise by lake.", afternoon: "Chang La return with tea stops.", evening: "Overnight Leh." },
      { dayNumber: 6, title: "Buffer Leh", morning: "Hall of Fame or river walk.", afternoon: "Packing and rest.", evening: "Overnight Leh." },
      { dayNumber: 7, title: "Departure", morning: "Airport drop with morning flight buffer. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Inner-line permits arranged. Oxygen canisters available in vehicle on request.</p>",
    details: familyDetails(
      [
        CHILD_PACE_FAQ,
        { title: "Minimum age for Ladakh?", content: "Many families bring school-age kids; infants need paediatric altitude advice — we slow the schedule on request." },
      ],
      ["Inner-line permit assistance"],
      ["Flights to Leh", "Camel ride Nubra", "Personal oxygen rental"],
    ),
    seoBlurb: "Family Ladakh with Leh rest and Pangong camp night.",
  }),
  mkTour({
    slug: "gangtok-tsomgo-lake-family",
    title: "Gangtok & Tsomgo Lake Family",
    summary:
      "Easy Northeast starter — Gangtok monasteries and a day to Tsomgo Lake with kids. From ₹16,999 pp (min. 2).",
    category: "Family",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    priceFrom: 16999,
    destinationSlugs: ["gangtok", "sikkim"],
    primaryDestinationSlug: "gangtok",
    address: "Bagdogra (IXB) airport pickup",
    mapLat: "27.3389",
    mapLng: "88.6065",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "IXB to Gangtok", morning: "Drive with Teesta views.", afternoon: "Mall Road gentle walk.", evening: "Overnight Gangtok." },
      { dayNumber: 2, title: "Tsomgo & Baba Mandir", morning: "Permitted day trip to lake.", afternoon: "Yak ride photo optional.", evening: "Overnight Gangtok." },
      { dayNumber: 3, title: "Gangtok monasteries", morning: "Rumtek or Enchey.", afternoon: "Flower show or ropeway optional.", evening: "Second night Gangtok." },
      { dayNumber: 4, title: "Departure", morning: "Breakfast; IXB drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Tsomgo requires permit — carry ID copies for all family members.</p>",
    details: familyDetails([CHILD_PACE_FAQ], ["Tsomgo day trip permits"], ["Ropeway tickets", "Yak ride fees"]),
    seoBlurb: "Gangtok family break with Tsomgo Lake day.",
  }),
  mkTour({
    slug: "darjeeling-gangtok-family-hills",
    title: "Darjeeling–Gangtok Family Hills",
    summary:
      "Toy train heritage, tea views, and Gangtok lake day — East Himalaya family combo. From ₹21,999 pp (min. 2).",
    category: "Family",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    priceFrom: 21999,
    destinationSlugs: ["darjeeling", "gangtok", "sikkim"],
    primaryDestinationSlug: "darjeeling",
    address: "Bagdogra (IXB) pickup",
    mapLat: "27.0410",
    mapLng: "88.2663",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "IXB to Darjeeling", morning: "Hill drive with breaks.", afternoon: "Mall and observatory walk.", evening: "Overnight Darjeeling." },
      { dayNumber: 2, title: "Tiger Hill & tea", morning: "Sunrise Tiger Hill optional.", afternoon: "Tea estate visit.", evening: "Overnight Darjeeling." },
      { dayNumber: 3, title: "Darjeeling to Gangtok", morning: "Toy train joy ride or Batasia Loop.", afternoon: "Drive to Gangtok.", evening: "Overnight Gangtok." },
      { dayNumber: 4, title: "Tsomgo day", morning: "Lake excursion.", afternoon: "Return Gangtok.", evening: "Second night Gangtok." },
      { dayNumber: 5, title: "Easy Gangtok", morning: "Monastery morning.", afternoon: "Free Mall time.", evening: "Third night Gangtok." },
      { dayNumber: 6, title: "Departure", morning: "IXB drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Tiger Hill is early — kids can sleep in with one parent while the other goes up.</p>",
    details: familyDetails([CHILD_PACE_FAQ], ["Tsomgo permit day"], ["Toy train tickets", "Tiger Hill vehicle pass"]),
    seoBlurb: "Darjeeling and Gangtok family hills weekender stretch.",
  }),
  mkTour({
    slug: "coorg-mysore-family-circuit",
    title: "Coorg–Mysore Family Circuit",
    summary:
      "Coffee estate walks in Coorg and Mysore palace lights — Karnataka family long weekend. From ₹17,999 pp (min. 2).",
    category: "Family",
    durationDays: 5,
    durationNights: 4,
    difficulty: "easy",
    priceFrom: 17999,
    destinationSlugs: ["coorg", "mysore", "kerala"],
    primaryDestinationSlug: "coorg",
    address: "Mangalore (IXE) or Mysore pickup",
    mapLat: "12.4244",
    mapLng: "75.7382",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "Arrive Coorg", morning: "Pickup to estate resort.", afternoon: "Plantation walk.", evening: "Overnight Coorg." },
      { dayNumber: 2, title: "Coorg waterfalls", morning: "Abbey or Iruppu (seasonal).", afternoon: "Dubare elephant camp view from riverside.", evening: "Second night Coorg." },
      { dayNumber: 3, title: "Coorg to Mysore", morning: "Scenic drive.", afternoon: "Chamundi Hill viewpoint.", evening: "Overnight Mysore." },
      { dayNumber: 4, title: "Mysore palace day", morning: "Palace interiors.", afternoon: "Brindavan Gardens evening fountain.", evening: "Second night Mysore." },
      { dayNumber: 5, title: "Departure", morning: "Breakfast; IXE or Bengaluru drop on quote. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Estate stays include breakfast; MAP dinner in Mysore.</p>",
    details: familyDetails([CHILD_PACE_FAQ], [], ["Elephant bathing participation fees", "Palace camera fee"]),
    seoBlurb: "Coorg coffee hills and Mysore palace family loop.",
  }),
  mkTour({
    slug: "ooty-coonoor-family-hills",
    title: "Ooty–Coonoor Family Hills",
    summary:
      "Nilgiri toy train, botanical gardens, and Coonoor viewpoints — cool weather family escape. From ₹15,499 pp (min. 2).",
    category: "Family",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    priceFrom: 15499,
    destinationSlugs: ["ooty", "coonoor"],
    primaryDestinationSlug: "ooty",
    address: "Coimbatore Airport (CJB) pickup",
    mapLat: "11.4102",
    mapLng: "76.6950",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "CJB to Ooty", morning: "Hill drive.", afternoon: "Botanical Garden stroll.", evening: "Overnight Ooty." },
      { dayNumber: 2, title: "Ooty lake & train", morning: "Boating on Ooty Lake.", afternoon: "Toy train or Doddabetta viewpoint.", evening: "Overnight Ooty." },
      { dayNumber: 3, title: "Coonoor day", morning: "Drive to Sim's Park.", afternoon: "Lamb's Rock and Dolphin's Nose.", evening: "Return Ooty." },
      { dayNumber: 4, title: "Departure", morning: "Breakfast; CJB drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Carry light jackets year-round in the Nilgiris.</p>",
    details: familyDetails([CHILD_PACE_FAQ], [], ["Toy train tickets", "Boat hire"]),
    seoBlurb: "Ooty and Coonoor Nilgiri family hills.",
  }),
];

// ——— Camping (8) ———

const campingTours: TourFormat[] = [
  mkTour({
    slug: "rishikesh-beach-camping-rafting",
    title: "Rishikesh Beach Camping + Rafting",
    summary:
      "Riverside camp on sandy Ganga beaches plus one guided rafting section — weekend classic from ₹6,499 pp (min. 2).",
    category: "Camping",
    durationDays: 2,
    durationNights: 1,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 6499,
    destinationSlugs: ["rishikesh", "uttarakhand"],
    primaryDestinationSlug: "rishikesh",
    address: "Rishikesh bus stand or Haridwar railway pickup",
    mapLat: "30.0869",
    mapLng: "78.2676",
    mapZoom: 12,
    days: [
      { dayNumber: 1, title: "Camp check-in · rafting", morning: "Pickup and drive to beach camp.", afternoon: "Safety briefing and rafting section (seasonal).", evening: "Bonfire rules per forest advisory; dinner at camp." },
      { dayNumber: 2, title: "Sunrise · checkout", morning: "Breakfast; break camp; drop Rishikesh. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Alcohol-free camp belt. Rafting skipped in peak monsoon swell.</p>",
    details: campingDetails(
      [{ title: "Is cliff jumping included?", content: "No — rafting only on quoted section. Cliff jumps are not part of the package." }],
      ["One guided rafting section (Rishikesh season)", "Beach camp dinner and breakfast"],
      ["Adventure cameras", "Extra rafting sections"],
      ["River safety"],
    ),
    seoBlurb: "Rishikesh beach camp with one rafting run.",
  }),
  mkTour({
    slug: "chandratal-lake-camping",
    title: "Chandratal Lake Camping",
    summary:
      "Spiti approach to Moon Lake — high meadow camp night with acclimatised pacing from ₹24,999 pp (min. 2).",
    category: "Camping",
    durationDays: 6,
    durationNights: 5,
    difficulty: "moderate",
    priceFrom: 24999,
    destinationSlugs: ["spiti", "kaza", "himachal"],
    primaryDestinationSlug: "spiti",
    address: "Manali or Chandigarh pickup as quoted",
    mapLat: "32.3972",
    mapLng: "77.6120",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "Manali to Kaza approach", morning: "Cross Rohtang / Atal Tunnel belt.", afternoon: "Tabo or Kaza check-in.", evening: "Hotel night lower Spiti." },
      { dayNumber: 2, title: "Kaza acclimatisation", morning: "Key monastery visit.", afternoon: "Rest and hydrate.", evening: "Overnight Kaza." },
      { dayNumber: 3, title: "Kunzum · Chandratal camp", morning: "Drive toward Chandratal.", afternoon: "Set lakeside camp.", evening: "Camp dinner under stars." },
      { dayNumber: 4, title: "Chandratal morning · return", morning: "Lake walk and photos.", afternoon: "Break camp; return Kaza side.", evening: "Hotel night." },
      { dayNumber: 5, title: "Exit Spiti", morning: "Begin return toward Manali.", afternoon: "Overnight Manali or Chhatru belt.", evening: "Hotel." },
      { dayNumber: 6, title: "Manali drop", morning: "Breakfast; drop Chandigarh / Manali. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Road status confirmed before payment. No camping on loose moraine — fixed camp pads only.</p>",
    details: campingDetails(
      [{ title: "Is Chandratal open in winter?", content: "Lake camp runs roughly June–September when Kunzum is snow-free." }],
      ["Chandratal lakeside camp night"],
      ["Manali–Leh flights", "Inner-line if routing via Leh"],
      ["Altitude readiness"],
    ),
    seoBlurb: "Spiti Chandratal Moon Lake camping with Kaza nights.",
  }),
  mkTour({
    slug: "pangong-lake-shore-camping",
    title: "Pangong Lake Shore Camping",
    summary:
      "Leh acclimatise then one full Pangong shore camp — colour changes at dusk and dawn from ₹21,999 pp (min. 2).",
    category: "Camping",
    durationDays: 4,
    durationNights: 3,
    difficulty: "moderate",
    priceFrom: 21999,
    destinationSlugs: ["pangong", "leh", "ladakh"],
    primaryDestinationSlug: "pangong",
    address: "Leh Airport (IXL) pickup",
    mapLat: "33.9873",
    mapLng: "78.6402",
    mapZoom: 10,
    days: [
      { dayNumber: 1, title: "Arrive Leh", morning: "Airport pickup; rest day.", afternoon: "No pass driving.", evening: "Overnight Leh hotel." },
      { dayNumber: 2, title: "Leh to Pangong", morning: "Chang La or Shyok routing as open.", afternoon: "Check in shore camp.", evening: "Camp dinner lakeside." },
      { dayNumber: 3, title: "Pangong to Leh", morning: "Sunrise colours.", afternoon: "Return Leh with stops.", evening: "Hotel Leh." },
      { dayNumber: 4, title: "Departure", morning: "Airport drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Fixed eco-camp with twin tents; attach-bath upgrades quoted separately.</p>",
    details: campingDetails(
      [{ title: "How cold is Pangong camp?", content: "Even summer nights dip near freezing — liners and jackets essential." }],
      ["Pangong shore camp dinner and breakfast", "Inner-line permits"],
      ["Leh flights"],
      ["Ladakh altitude with kids"],
    ),
    seoBlurb: "Pangong lakeside camp night from acclimatised Leh.",
  }),
  mkTour({
    slug: "rann-of-kutch-white-desert-camping",
    title: "Rann of Kutch White Desert Camping",
    summary:
      "Bhuj gateway, white salt desert sunset, and festival-season tent night from ₹12,999 pp (min. 2).",
    category: "Camping",
    durationDays: 3,
    durationNights: 2,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 12999,
    destinationSlugs: ["rann-of-kutch", "gujarat"],
    primaryDestinationSlug: "rann-of-kutch",
    address: "Bhuj Airport (BHJ) or railway pickup",
    mapLat: "23.8315",
    mapLng: "69.6719",
    mapZoom: 10,
    days: [
      { dayNumber: 1, title: "Arrive Bhuj", morning: "Pickup.", afternoon: "Aina Mahal or local crafts.", evening: "Overnight Bhuj." },
      { dayNumber: 2, title: "White Rann camp", morning: "Drive to Dhordo belt.", afternoon: "Desert photo time before heat.", evening: "Tent dinner and folk program when scheduled." },
      { dayNumber: 3, title: "Dawn Rann · departure", morning: "Sunrise on salt flats; checkout.", afternoon: "Bhuj drop. Tour ends.", evening: "" },
    ],
    descriptionHtml: "<p>Full moon weekends sell early. Pure veg camp meals standard.</p>",
    details: campingDetails(
      [{ title: "Is Rann Utsav mandatory?", content: "Peak dates may carry festival surcharge — we disclose before payment." }],
      ["White desert tent night with dinner and breakfast"],
      ["Festival VIP passes", "Camel cart extras"],
      ["Desert heat & sand"],
    ),
    seoBlurb: "Kutch white desert camping near Bhuj.",
  }),
  mkTour({
    slug: "nubra-valley-desert-camping",
    title: "Nubra Valley Desert Camping",
    summary:
      "Khardung La to Hunder dunes camp — Bactrian camels and starry desert from ₹18,999 pp (min. 2).",
    category: "Camping",
    durationDays: 4,
    durationNights: 3,
    difficulty: "moderate",
    priceFrom: 18999,
    destinationSlugs: ["nubra", "leh", "ladakh"],
    primaryDestinationSlug: "nubra",
    address: "Leh Airport (IXL) pickup",
    mapLat: "34.6869",
    mapLng: "77.5670",
    mapZoom: 10,
    days: [
      { dayNumber: 1, title: "Leh rest", morning: "Pickup and acclimatise.", afternoon: "Soft local walk.", evening: "Overnight Leh." },
      { dayNumber: 2, title: "Khardung La · Nubra camp", morning: "Cross pass to Diskit.", afternoon: "Hunder dunes camp check-in.", evening: "Camp dinner." },
      { dayNumber: 3, title: "Dunes morning · Leh", morning: "Camel photo optional.", afternoon: "Return Leh.", evening: "Hotel Leh." },
      { dayNumber: 4, title: "Departure", morning: "Airport drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Includes one desert camp night; Diskit hotel swap available.</p>",
    details: campingDetails(
      [{ title: "Attached bath at desert camp?", content: "Standard is Swiss tents with common bath; ensuite quoted on request." }],
      ["Nubra Hunder desert camp night"],
      ["Camel ride fees"],
    ),
    seoBlurb: "Nubra Valley Hunder desert camp over Khardung La.",
  }),
  mkTour({
    slug: "bir-billing-paragliding-camp",
    title: "Bir Billing Paragliding Camp",
    summary:
      "Himalayan meadow camp with tandem paragliding slot from Billing — adventure weekend from ₹9,999 pp (min. 2).",
    category: "Camping",
    durationDays: 3,
    durationNights: 2,
    difficulty: "moderate",
    priceFrom: 9999,
    destinationSlugs: ["bir-billing", "himachal", "mcleodganj"],
    primaryDestinationSlug: "bir-billing",
    address: "Pathankot or Dharamshala pickup",
    mapLat: "32.0534",
    mapLng: "76.7266",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "Arrive Bir", morning: "Pickup to camp.", afternoon: "Landing site walk and safety video.", evening: "Camp dinner." },
      { dayNumber: 2, title: "Paraglide day", morning: "Vehicle to Billing launch.", afternoon: "Tandem flight weather permitting.", evening: "Second camp night." },
      { dayNumber: 3, title: "Checkout", morning: "Breakfast; drop Dharamshala or Pathankot. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Flights depend on wind — unused slot moves to morning backup when possible.</p>",
    details: campingDetails(
      [{ title: "Weight limits for tandem?", content: "Most operators cap near 95 kg — share weights when booking." }],
      ["Tandem paragliding slot (weather permitting)", "Camp meals on listed nights"],
      ["Repeat flight fees", "GoPro rental"],
      ["Weather & kit"],
    ),
    seoBlurb: "Bir Billing paragliding camp with meadow stay.",
  }),
  mkTour({
    slug: "pawna-lake-camping",
    title: "Pawna Lake Camping",
    summary:
      "Maharashtra lakeside weekend — stargazing, barbecue, and easy Pune–Mumbai escape from ₹3,999 pp (min. 2).",
    category: "Camping",
    durationDays: 2,
    durationNights: 1,
    difficulty: "easy",
    priceFrom: 3999,
    destinationSlugs: ["pawna", "maharashtra"],
    primaryDestinationSlug: "pawna",
    address: "Lonavala or Pune pickup point",
    mapLat: "18.6734",
    mapLng: "73.4721",
    mapZoom: 12,
    days: [
      { dayNumber: 1, title: "Lake camp", morning: "Meet at Lonavala; jeep to campsite.", afternoon: "Kayaking or zip line optional.", evening: "BBQ dinner and music rules per camp." },
      { dayNumber: 2, title: "Sunrise · return", morning: "Breakfast; pack tents.", afternoon: "Drop Lonavala / Pune. Tour ends.", evening: "" },
    ],
    descriptionHtml: "<p>Monsoon lakeside camps shift uphill if water rises.</p>",
    details: campingDetails(
      [{ title: "Is alcohol allowed?", content: "Most Pawna camps are dry — confirm policy for your date." }],
      ["Lakeside camp dinner and breakfast", "BBQ dinner"],
      ["Kayaking", "Transport from Mumbai unless quoted"],
    ),
    seoBlurb: "Pawna Lake weekend camp from Lonavala.",
  }),
  mkTour({
    slug: "wayanad-forest-camping",
    title: "Wayanad Forest Camping",
    summary:
      "Kerala rainforest fringe — plantation camp, stream walk, and wildlife-edge calm from ₹8,999 pp (min. 2).",
    category: "Camping",
    durationDays: 3,
    durationNights: 2,
    difficulty: "easy",
    priceFrom: 8999,
    destinationSlugs: ["wayanad", "kerala"],
    primaryDestinationSlug: "wayanad",
    address: "Calicut (CCJ) or Mysore pickup",
    mapLat: "11.6854",
    mapLng: "76.1320",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "Arrive Wayanad", morning: "Pickup to forest camp.", afternoon: "Plantation trail.", evening: "Camp dinner." },
      { dayNumber: 2, title: "Stream & viewpoint", morning: "Soochipara or Edakkal optional.", afternoon: "Return camp; bird hour.", evening: "Second camp night." },
      { dayNumber: 3, title: "Checkout", morning: "Breakfast; drop CCJ. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Leech socks advisable in monsoon walks — sold locally.</p>",
    details: campingDetails(
      [{ title: "Wildlife sightings?", content: "Elephants share habitat — follow guide distances; no night walks alone." }],
      ["Forest camp meals on listed nights"],
      ["Park entry tickets", "Jeep safari add-ons"],
    ),
    seoBlurb: "Wayanad forest camp in Kerala hills.",
  }),
];

// ——— Leisure & city (11; skips goa-beach-getaway) ———

const leisureTours: TourFormat[] = [
  mkTour({
    slug: "andaman-island-hopping",
    title: "Andaman Island Hopping",
    summary:
      "Port Blair, Havelock, and Neil — ferries and beaches without safari pace. Leisure from ₹32,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 32999,
    destinationSlugs: ["andaman"],
    primaryDestinationSlug: "andaman",
    address: "Port Blair Airport (IXZ) pickup",
    mapLat: "11.6234",
    mapLng: "92.7265",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "Port Blair", morning: "Arrival and hotel.", afternoon: "Waterfront walk.", evening: "Overnight Port Blair." },
      { dayNumber: 2, title: "Havelock", morning: "Ferry across.", afternoon: "Radhanagar beach.", evening: "Overnight Havelock." },
      { dayNumber: 3, title: "Havelock free", morning: "Beach time.", afternoon: "Cafés and rest.", evening: "Second night Havelock." },
      { dayNumber: 4, title: "Neil Island", morning: "Ferry to Neil.", afternoon: "Snorkel optional.", evening: "Overnight Neil." },
      { dayNumber: 5, title: "Return Port Blair", morning: "Ferry back.", afternoon: "Market stroll.", evening: "Port Blair." },
      { dayNumber: 6, title: "Departure", morning: "Airport drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Same routing as family package with more free afternoons.</p>",
    details: leisureDetails([], ["Inter-island ferry coordination"], ["Scuba", "Ferry upgrades"]),
    seoBlurb: "Andaman Port Blair–Havelock–Neil leisure hop.",
  }),
  mkTour({
    slug: "royal-rajasthan-circuit",
    title: "Royal Rajasthan Circuit",
    summary:
      "Jaipur, Jodhpur, Udaipur heritage loop — forts, bazaars, and lake sunsets from ₹26,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 8,
    durationNights: 7,
    difficulty: "easy",
    priceFrom: 26999,
    destinationSlugs: ["rajasthan", "jaipur", "udaipur"],
    primaryDestinationSlug: "rajasthan",
    address: "Jaipur Airport (JAI) pickup",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 7,
    days: [
      { dayNumber: 1, title: "Jaipur", morning: "Arrive.", afternoon: "City Palace.", evening: "Overnight Jaipur." },
      { dayNumber: 2, title: "Jaipur forts", morning: "Amber.", afternoon: "Handicraft time.", evening: "Jaipur." },
      { dayNumber: 3, title: "Jaipur to Jodhpur", morning: "Drive.", afternoon: "Mehrangarh exterior walk.", evening: "Jodhpur." },
      { dayNumber: 4, title: "Jodhpur blue city", morning: "Clock tower market.", afternoon: "Jaswant Thada.", evening: "Jodhpur." },
      { dayNumber: 5, title: "Jodhpur to Udaipur", morning: "Ranakpur Jain temple stop.", afternoon: "Lake arrival.", evening: "Udaipur." },
      { dayNumber: 6, title: "Udaipur lakes", morning: "City Palace.", afternoon: "Boat optional.", evening: "Udaipur." },
      { dayNumber: 7, title: "Udaipur slow day", morning: "Café morning.", afternoon: "Shopping.", evening: "Udaipur." },
      { dayNumber: 8, title: "Departure", morning: "UDR or JAI drop as quoted. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>MAP heritage hotels mid-category unless you upgrade.</p>",
    details: leisureDetails([], [], ["Monument tickets", "Lake boats"], ["Cultural"]),
    seoBlurb: "Royal Rajasthan Jaipur–Jodhpur–Udaipur circuit.",
  }),
  mkTour({
    slug: "golden-triangle-classic",
    title: "Golden Triangle Classic",
    summary:
      "Delhi, Agra Taj, Jaipur — evergreen leisure circuit from ₹18,499 pp (min. 2).",
    category: "Leisure",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 18499,
    destinationSlugs: ["delhi", "agra", "jaipur"],
    primaryDestinationSlug: "delhi",
    address: "Delhi Airport (DEL) pickup",
    mapLat: "28.6139",
    mapLng: "77.2090",
    mapZoom: 8,
    days: [
      { dayNumber: 1, title: "Delhi arrival", morning: "Pickup.", afternoon: "Connaught and India Gate.", evening: "Overnight Delhi." },
      { dayNumber: 2, title: "Delhi sights", morning: "Humayun's Tomb.", afternoon: "Qutub Minar.", evening: "Delhi." },
      { dayNumber: 3, title: "Delhi to Agra", morning: "Expressway.", afternoon: "Agra Fort.", evening: "Agra." },
      { dayNumber: 4, title: "Taj · Jaipur", morning: "Taj Mahal.", afternoon: "Drive Jaipur.", evening: "Jaipur." },
      { dayNumber: 5, title: "Jaipur", morning: "Amber.", afternoon: "Bazaars.", evening: "Jaipur." },
      { dayNumber: 6, title: "Departure", morning: "DEL drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Private cab throughout — not a seat-in-coach bustle.</p>",
    details: leisureDetails([], [], ["Monument entry"]),
    seoBlurb: "Classic Golden Triangle leisure package.",
  }),
  mkTour({
    slug: "shimla-manali-combo",
    title: "Shimla–Manali Combo",
    summary:
      "Himachal leisure staple — ridge walks, Kufri, and Manali valleys from ₹18,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 6,
    durationNights: 5,
    difficulty: "easy",
    priceFrom: 18999,
    destinationSlugs: ["shimla", "manali", "himachal"],
    primaryDestinationSlug: "himachal",
    address: "Chandigarh Airport (IXC) pickup",
    mapLat: "31.1048",
    mapLng: "77.1734",
    mapZoom: 8,
    days: [
      { dayNumber: 1, title: "IXC to Shimla", morning: "Climb to hills.", afternoon: "Mall walk.", evening: "Shimla." },
      { dayNumber: 2, title: "Kufri", morning: "Kufri outing.", afternoon: "Ridge free time.", evening: "Shimla." },
      { dayNumber: 3, title: "Shimla to Manali", morning: "Long scenic drive.", afternoon: "Beas check-in.", evening: "Manali." },
      { dayNumber: 4, title: "Manali", morning: "Hadimba.", afternoon: "Old Manali.", evening: "Manali." },
      { dayNumber: 5, title: "Solang optional", morning: "Valley transfer optional.", afternoon: "Mall shopping.", evening: "Manali." },
      { dayNumber: 6, title: "Return IXC", morning: "Drop Chandigarh. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Adult-focused pacing vs family delight — more free evenings.</p>",
    details: leisureDetails([], ["Chandigarh pickup & drop"], ["Solang tickets"], ["Hill Stations"]),
    seoBlurb: "Shimla and Manali combo leisure holiday.",
  }),
  mkTour({
    slug: "north-sikkim-lachen-lachung-yumthang",
    title: "North Sikkim (Lachen–Lachung–Yumthang)",
    summary:
      "Zero Point approach, Yumthang valley flowers, and high North Sikkim permits from ₹27,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 7,
    durationNights: 6,
    difficulty: "moderate",
    priceFrom: 27999,
    destinationSlugs: ["sikkim", "gangtok"],
    primaryDestinationSlug: "sikkim",
    address: "Bagdogra (IXB) pickup",
    mapLat: "27.6120",
    mapLng: "88.5500",
    mapZoom: 9,
    days: [
      { dayNumber: 1, title: "IXB to Gangtok", morning: "Hill drive.", afternoon: "Mall.", evening: "Gangtok." },
      { dayNumber: 2, title: "Gangtok to Lachen", morning: "Permit formalities.", afternoon: "Reach Lachen.", evening: "Lachen guesthouse." },
      { dayNumber: 3, title: "Gurudongmar approach", morning: "High lake day if permits allow.", afternoon: "Return Lachen.", evening: "Lachen." },
      { dayNumber: 4, title: "Lachen to Lachung", morning: "Scenic transfer.", afternoon: "Lachung rest.", evening: "Lachung." },
      { dayNumber: 5, title: "Yumthang", morning: "Valley drive.", afternoon: "Zero Point optional.", evening: "Lachung." },
      { dayNumber: 6, title: "Lachung to Gangtok", morning: "Descent.", afternoon: "Free evening.", evening: "Gangtok." },
      { dayNumber: 7, title: "Departure", morning: "IXB drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>North Sikkim permits need photo ID copies for every traveller.</p>",
    details: leisureDetails(
      [{ title: "Is Gurudongmar guaranteed?", content: "Army road closures can block lake day — Yumthang remains the core highlight." }],
      ["North Sikkim permit assistance"],
      ["Zero Point vehicle fee"],
      ["Nature & Adventure"],
    ),
    seoBlurb: "North Sikkim Lachen Lachung Yumthang leisure route.",
  }),
  mkTour({
    slug: "darjeeling-tea-hills",
    title: "Darjeeling Tea Hills",
    summary:
      "Tiger Hill optional, tea estate tasting, and Himalayan Railway heritage from ₹14,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    priceFrom: 14999,
    destinationSlugs: ["darjeeling"],
    primaryDestinationSlug: "darjeeling",
    address: "Bagdogra (IXB) pickup",
    mapLat: "27.0410",
    mapLng: "88.2663",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "IXB to Darjeeling", morning: "Hill drive.", afternoon: "Observatory Hill.", evening: "Darjeeling." },
      { dayNumber: 2, title: "Tea & toy train", morning: "Estate tour with tasting.", afternoon: "Joy ride or Ghoom station.", evening: "Darjeeling." },
      { dayNumber: 3, title: "Tiger Hill option", morning: "Sunrise optional.", afternoon: "Japanese Peace Pagoda.", evening: "Darjeeling." },
      { dayNumber: 4, title: "Departure", morning: "IXB drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Cool-climate packing year-round.</p>",
    details: leisureDetails([], ["Tea estate visit coordination"], ["Toy train tickets"], ["Hill Stations"]),
    seoBlurb: "Darjeeling tea hills leisure break.",
  }),
  mkTour({
    slug: "coorg-coffee-hills",
    title: "Coorg Coffee Hills",
    summary:
      "Plantation stays, Abbey Falls, and Madikeri markets — Karnataka weekend from ₹12,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    priceFrom: 12999,
    destinationSlugs: ["coorg"],
    primaryDestinationSlug: "coorg",
    address: "Mangalore (IXE) pickup",
    mapLat: "12.4244",
    mapLng: "75.7382",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "Arrive Coorg", morning: "Pickup.", afternoon: "Estate walk.", evening: "Resort." },
      { dayNumber: 2, title: "Waterfalls", morning: "Abbey Falls.", afternoon: "Raja's Seat sunset.", evening: "Coorg." },
      { dayNumber: 3, title: "Madikeri", morning: "Fort and museum.", afternoon: "Coffee purchase time.", evening: "Coorg." },
      { dayNumber: 4, title: "Departure", morning: "IXE drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Estate rooms are twin-share with veranda chairs built in.</p>",
    details: leisureDetails([], [], ["River rafting extras"]),
    seoBlurb: "Coorg coffee plantation leisure escape.",
  }),
  mkTour({
    slug: "ooty-coonoor-nilgiris",
    title: "Ooty–Coonoor Nilgiris",
    summary:
      "Nilgiri rail, gardens, and Coonoor ridge views — leisure without family add-ons from ₹13,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    priceFrom: 13999,
    destinationSlugs: ["ooty", "coonoor"],
    primaryDestinationSlug: "ooty",
    address: "Coimbatore Airport (CJB) pickup",
    mapLat: "11.4102",
    mapLng: "76.6950",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "CJB to Ooty", morning: "Hill transfer.", afternoon: "Lake walk.", evening: "Ooty." },
      { dayNumber: 2, title: "Ooty", morning: "Botanical Garden.", afternoon: "Tea factory optional.", evening: "Ooty." },
      { dayNumber: 3, title: "Coonoor", morning: "Toy train segment.", afternoon: "Viewpoints.", evening: "Ooty." },
      { dayNumber: 4, title: "Departure", morning: "CJB drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Rail seats book early in summer — we reserve when you confirm.</p>",
    details: leisureDetails([], [], ["Train tickets", "Boating"], ["Hill Stations"]),
    seoBlurb: "Ooty Coonoor Nilgiris leisure circuit.",
  }),
  mkTour({
    slug: "jaipur-city-break",
    title: "Jaipur City Break",
    summary:
      "Pink City long weekend — forts, bazaars, and rooftop dinners from ₹9,999 pp (min. 2).",
    category: "City trips",
    durationDays: 3,
    durationNights: 2,
    difficulty: "easy",
    priceFrom: 9999,
    destinationSlugs: ["jaipur", "rajasthan"],
    primaryDestinationSlug: "jaipur",
    address: "Jaipur Airport (JAI) or railway pickup",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "Arrive Jaipur", morning: "Pickup.", afternoon: "City Palace and Hawa Mahal area.", evening: "Overnight Jaipur." },
      { dayNumber: 2, title: "Amber & crafts", morning: "Amber Fort.", afternoon: "Block printing or gem museum optional.", evening: "Rooftop dinner option; overnight Jaipur." },
      { dayNumber: 3, title: "Departure", morning: "Breakfast; JAI drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Ideal for long weekends from Delhi/NCR flights.</p>",
    details: cityDetails([], ["Heritage hotel (city centre band)"], ["Monument tickets", "Dinner outside MAP"]),
    seoBlurb: "Jaipur city break heritage weekend.",
  }),
  mkTour({
    slug: "udaipur-lakes-weekend",
    title: "Udaipur Lakes Weekend",
    summary:
      "Lake Pichola promenades, palace museums, and sunset ghats from ₹10,999 pp (min. 2).",
    category: "City trips",
    durationDays: 3,
    durationNights: 2,
    difficulty: "easy",
    priceFrom: 10999,
    destinationSlugs: ["udaipur", "rajasthan"],
    primaryDestinationSlug: "udaipur",
    address: "Udaipur Airport (UDR) pickup",
    mapLat: "24.5854",
    mapLng: "73.7125",
    mapZoom: 11,
    days: [
      { dayNumber: 1, title: "Arrive Udaipur", morning: "Pickup.", afternoon: "City Palace museum.", evening: "Lake walk; overnight Udaipur." },
      { dayNumber: 2, title: "Lakes & sahelion", morning: "Jagdish temple lane.", afternoon: "Boat ride optional.", evening: "Sunset ghat; overnight Udaipur." },
      { dayNumber: 3, title: "Departure", morning: "Breakfast; UDR drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Romantic city break works for couples or friends — twin share quoted.</p>",
    details: cityDetails([], [], ["Boat tickets", "Palace camera fees"]),
    seoBlurb: "Udaipur lakes weekend city break.",
  }),
  mkTour({
    slug: "pondicherry-french-escape",
    title: "Pondicherry French Escape",
    summary:
      "White Town cafes, Auroville visit, and Promenade sea breeze from ₹11,499 pp (min. 2).",
    category: "Leisure",
    durationDays: 4,
    durationNights: 3,
    difficulty: "easy",
    priceFrom: 11499,
    destinationSlugs: ["pondicherry"],
    primaryDestinationSlug: "pondicherry",
    address: "Chennai Airport (MAA) pickup",
    mapLat: "11.9416",
    mapLng: "79.8083",
    mapZoom: 12,
    days: [
      { dayNumber: 1, title: "Chennai to Pondy", morning: "Coastal drive.", afternoon: "White Town walk.", evening: "Pondicherry." },
      { dayNumber: 2, title: "Auroville & beach", morning: "Matrimandir visitor centre.", afternoon: "Paradise Beach ferry optional.", evening: "Pondicherry." },
      { dayNumber: 3, title: "French quarter", morning: "Café hopping.", afternoon: "Promenade cycling optional.", evening: "Pondicherry." },
      { dayNumber: 4, title: "Departure", morning: "MAA drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>Sunday silence in Auroville — plan morning slot accordingly.</p>",
    details: leisureDetails([], [], ["Ferry to beach", "Bicycle rental"], ["Cultural"]),
    seoBlurb: "Pondicherry French quarter leisure mini-cation.",
  }),
  mkTour({
    slug: "best-of-kerala-full-circuit",
    title: "Best of Kerala Full Circuit",
    summary:
      "Cochin, Munnar, Thekkady, Alleppey houseboat, and Kovalam — full-state leisure from ₹34,999 pp (min. 2).",
    category: "Leisure",
    durationDays: 9,
    durationNights: 8,
    difficulty: "easy",
    isFeatured: true,
    priceFrom: 34999,
    destinationSlugs: ["kerala", "cochin", "munnar", "thekkady", "alleppey"],
    primaryDestinationSlug: "kerala",
    address: "Cochin Airport (COK) pickup",
    mapLat: "9.9312",
    mapLng: "76.2673",
    mapZoom: 8,
    days: [
      { dayNumber: 1, title: "Kochi", morning: "Arrive.", afternoon: "Fort Kochi.", evening: "Kochi." },
      { dayNumber: 2, title: "To Munnar", morning: "Hill drive.", afternoon: "Estate check-in.", evening: "Munnar." },
      { dayNumber: 3, title: "Munnar", morning: "Tea trail.", afternoon: "Viewpoints.", evening: "Munnar." },
      { dayNumber: 4, title: "To Thekkady", morning: "Descent.", afternoon: "Spice garden.", evening: "Thekkady." },
      { dayNumber: 5, title: "To Alleppey", morning: "Drive.", afternoon: "Board houseboat.", evening: "On board." },
      { dayNumber: 6, title: "Kovalam", morning: "Disembark; drive south.", afternoon: "Beach time.", evening: "Kovalam." },
      { dayNumber: 7, title: "Trivandrum", morning: "Padmanabhaswamy exterior.", afternoon: "Free beach.", evening: "Kovalam." },
      { dayNumber: 8, title: "Return Kochi belt", morning: "Drive north.", afternoon: "Marari or Cherai optional.", evening: "Near COK." },
      { dayNumber: 9, title: "Departure", morning: "Airport drop. Tour ends.", afternoon: "", evening: "" },
    ],
    descriptionHtml: "<p>One night deluxe AC houseboat included. Kovalam uses beach hotel MAP.</p>",
    details: leisureDetails(
      [{ title: "Houseboat category?", content: "Deluxe AC with attached bath — premium paddy-field routes quoted on request." }],
      ["One night deluxe AC houseboat", "Periyar boat coordination"],
      ["Kathakali tickets"],
      ["Marine"],
    ),
    seoBlurb: "Full Kerala circuit Munnar to Kovalam with houseboat.",
  }),
];

export const indiaFamilyCampLeisurePendingTours: TourFormat[] = [
  ...familyTours,
  ...campingTours,
  ...leisureTours,
];
