/**
 * Pending India wildlife, wellness, and festival tours — locked format, media deferred.
 * Skips ranthambore-tiger-safari and kerala-ayurveda-wellness-retreat (already seeded).
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

const NO_IMAGES: TourFormat["images"] = {
  banner: null,
  cover: null,
  gallery: [],
  seoImage: null,
};

const SAFARI_SHARED_FAQ = [
  "Are jungle safari permits included?",
  "How many safaris are in this package?",
  "Is this a private or group tour?",
  "Are flights included?",
] as const;

const LEISURE_SHARED_FAQ = [
  "What is the best time for this tour?",
  "Is this a private or group tour?",
  "Are flights included?",
  "What extras are paid locally?",
] as const;

const SAFARI_BEFORE = [
  "Safari etiquette",
  "Fitness",
  "Documents",
  "Weather & kit",
  "Arrival",
  "Rooms",
  "Money on the road",
] as const;

const SAFARI_INCLUDES_BASE = [
  "Accommodation as per itinerary (lodge, twin sharing)",
  "Breakfast + dinner at lodge (MAP)",
  "Safari jeep coordination & lodge–gate transfers",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Meet-and-greet at arrival point",
] as const;

const SAFARI_EXCLUDES_BASE = [
  "National park jeep / boat permit fees (pay locally at official rates)",
  "Flights / trains to starting point",
  "Lunch (unless listed)",
  "Camera / video fees inside park if levied",
  "Tips to naturalist, driver, and lodge staff",
  "Travel insurance",
  "Anything not mentioned in includes",
] as const;

const MAP_HOTEL_INCLUDES = [
  "Accommodation as per itinerary (twin sharing)",
  "Breakfast + dinner at the hotel each night (MAP)",
  "Private vehicle for transfers & sightseeing",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Meet-and-greet at arrival point",
] as const;

const MAP_HOTEL_EXCLUDES = [
  "Flights / trains to starting point",
  "Lunch (unless listed)",
  "Tips & personal expenses",
  "Travel insurance",
  "Anything not mentioned in includes",
] as const;

const MAP_BEFORE = [
  "Fitness",
  "Documents",
  "Weather & kit",
  "Arrival",
  "Rooms",
  "Money on the road",
] as const;

function safariDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[],
  excludeExtras: string[] = [],
  safariCountNote?: string,
): TourFormat["details"] {
  const faqs = [
    ...extraFaqs,
    ...(safariCountNote
      ? [
          {
            title: "How many safaris are in this package?",
            content: safariCountNote,
          },
        ]
      : []),
  ];
  return {
    sharedFaqTitles: [...SAFARI_SHARED_FAQ],
    extraFaqs: faqs,
    includeTitles: [...SAFARI_INCLUDES_BASE, ...includeExtras],
    excludeTitles: [...SAFARI_EXCLUDES_BASE, ...excludeExtras],
    beforeYouGoTitles: [...SAFARI_BEFORE],
    travelStyleTitles: ["Family Friendly", "Private / Independent", "Adventure"],
    facilityTitles: ["Private cab", "Wildlife lodge", "Jeep safaris", "24×7 helpline"],
  };
}

function leisureDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
  styles: string[] = ["Family Friendly", "Private / Independent"],
  facilities: string[] = ["Private cab", "MAP meals (B/D)", "24×7 helpline"],
): TourFormat["details"] {
  return {
    sharedFaqTitles: [...LEISURE_SHARED_FAQ],
    extraFaqs,
    includeTitles: [...MAP_HOTEL_INCLUDES, ...includeExtras],
    excludeTitles: [...MAP_HOTEL_EXCLUDES, ...excludeExtras],
    beforeYouGoTitles: [...MAP_BEFORE],
    travelStyleTitles: styles,
    facilityTitles: facilities,
  };
}

export const indiaWildlifeWellnessCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Ecotourism" },
  { kind: "style", title: "Wildlife & Nature" },
  { kind: "style", title: "Wellness & Yoga" },
  { kind: "style", title: "Festivals & Fairs" },
  { kind: "facility", title: "Boat safari" },
  {
    kind: "faq",
    title: "Are jungle safari permits included?",
    content:
      "We reserve your jeep or boat slots and coordinate lodge transfers, but government park entry and seat fees are billed separately and paid locally at official rates (amounts change by park, zone, and season). We quote the current figure before you confirm — never a surprise at the gate.",
  },
  {
    kind: "faq",
    title: "How many safaris are in this package?",
    content:
      "Each itinerary states the planned rides. Actual zones depend on permit inventory on your dates. We check availability before you pay; if slots are full, we suggest alternate dates — no phantom bookings.",
  },
  {
    kind: "before_you_go",
    title: "Safari etiquette",
    content:
      "Wear muted colours, keep voices low, and phones on silent. Wildlife sightings are never guaranteed — enjoy birds, landscapes, and interpretation from your naturalist.",
  },
  {
    kind: "exclude",
    title: "Bandhavgarh National Park jeep permit fees (pay locally)",
  },
  {
    kind: "exclude",
    title: "Kaziranga National Park jeep / elephant safari fees (pay locally)",
  },
  {
    kind: "exclude",
    title: "Kanha National Park jeep permit fees (pay locally)",
  },
  {
    kind: "exclude",
    title: "Gir National Park safari permit fees (pay locally)",
  },
  {
    kind: "exclude",
    title: "Sundarbans Tiger Reserve boat permit & forest fees (pay locally)",
  },
  {
    kind: "exclude",
    title: "Periyar Lake boat / ecotourism entry fees (pay locally)",
  },
  {
    kind: "include",
    title: "Jeep safari coordination (permit fees paid locally)",
  },
  {
    kind: "include",
    title: "Boat safari coordination in Sundarbans (permit fees paid locally)",
  },
  {
    kind: "include",
    title: "Daily yoga sessions with certified instructor (Rishikesh)",
  },
  {
    kind: "include",
    title: "Tented / festival-stay coordination at Rann Utsav (Dhordo)",
  },
  {
    kind: "faq",
    title: "When does Rann Utsav run?",
    content:
      "Gujarat Tourism’s White Rann festival typically operates November through February with peak weekends in winter. Tent city category and dates shift annually — we confirm live inventory before balance payment.",
  },
  {
    kind: "faq",
    title: "When is the Pushkar Camel Fair?",
    content:
      "The fair builds around Kartik Purnima (usually late October–November). Synchronising with bathing day needs early hotel booking — we only quote dates when rooms and fairground access are realistic.",
  },
  {
    kind: "faq",
    title: "When is Holi in Mathura–Vrindavan?",
    content:
      "Holi falls on the full-moon day in Phalgun (February–March). Lathmar Holi in Barsana and Nandgaon runs days before; we publish fixed departure windows once the Hindu calendar date is firm.",
  },
  {
    kind: "before_you_go",
    title: "Festival crowds & colour",
    content:
      "Holi and fair days are crowded and loud. Wear clothes you can discard, protect cameras, and use organic gulal only where permitted by local coordinators.",
  },
  {
    kind: "before_you_go",
    title: "Yoga retreat pace",
    content:
      "Morning and evening sessions are gentle hatha suitable for beginners. Tell us about injuries so teachers can suggest modifications.",
  },
];

const bandhavgarhTigerSafari: TourFormat = {
  slug: "bandhavgarh-tiger-safari",
  general: {
    title: "Bandhavgarh Tiger Safari",
    summary:
      "High tiger-density sal forest — three jeep slots across two lodge nights near Tala or Magadhi gates. Twin share from ₹15,999 pp (min. 2). Park permit fees paid locally.",
    category: "Ecotourism",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 21,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["bandhavgarh", "madhya-pradesh"],
    primaryDestinationSlug: "bandhavgarh",
    address: "Umaria railway station (UMR) or Jabalpur airport (JLR) pickup",
    mapLat: "23.6980",
    mapLng: "81.0240",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Umaria · afternoon jeep",
        morning:
          "Meet your driver at Umaria station or Jabalpur airport (longer drive). Check in at a lodge near the park buffer.",
        afternoon:
          "Lunch, rest, then afternoon jeep safari in an assigned zone if permits allow for your arrival day.",
        evening: "Naturalist briefing on cat movements; dinner and overnight at lodge.",
      },
      {
        dayNumber: 2,
        title: "Twin safari day · meadows and fort ridge",
        morning:
          "Pre-dawn jeep into sal–bamboo country around meadows where tigers are often spotted. Return for breakfast.",
        afternoon: "Quiet hours at lodge — pool or nature trail if offered.",
        evening: "Second jeep toward dusk on a different zone if permits permit. Dinner and overnight.",
      },
      {
        dayNumber: 3,
        title: "Bandhavgarh Fort viewpoint · departure",
        morning:
          "After breakfast, optional short visit to Bandhavgarh fort overlook (outside core zone timing). Drive to Umaria or Jabalpur drop.",
        afternoon: "Tour ends at station or airport.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Bandhavgarh:</strong> compact core with legendary tiger encounters — still no guarantees. We book lodge rooms and jeep coordination; you pay government permit fees at the desk at current rates.</p>",
      "<p><strong>Stays:</strong> 2 nights at a mid-range wildlife lodge (twin MAP).</p>",
      "<p><strong>Permits:</strong> entry and jeep seat charges are <em>not</em> in the package price. We chase Tala / Magadhi / Khitauli slots as inventory allows.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 15999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 3 }] },
  details: safariDetails(
    [
      {
        title: "Which gate do we use?",
        content:
          "Your lodge proximity and live permit map decide Tala versus Magadhi versus Khitauli. We do not promise a single gate all three rides.",
      },
    ],
  [
      "Private transfers Umaria or Jabalpur ↔ lodge",
      "Three jeep safari rides (zones per permit availability)",
    ],
    ["Bandhavgarh National Park jeep permit fees (pay locally)"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Bandhavgarh Tiger Safari | 2N/3D Jeep Lodge",
    seoDescription:
      "Bandhavgarh tiger safari — three jeep rides, MAP lodge, honest permit wording. From ₹15,999 pp.",
    facebookTitle: "Bandhavgarh Tiger Safari — 2 nights",
    facebookDescription: "Sal forest jeep safaris. Permits paid locally at gate rates.",
    twitterTitle: "Bandhavgarh Safari | 2N/3D",
    twitterDescription: "Tiger park · 3 rides · lodge MAP. From ₹15,999 pp.",
    published: true,
  },
};

const kazirangaRhinoSafari: TourFormat = {
  slug: "kaziranga-rhino-safari",
  general: {
    title: "Kaziranga Rhino Safari",
    summary:
      "Two nights on the Brahmaputra floodplain — jeep circuits for one-horned rhino, wild buffalo, and swamp deer, plus optional central-zone elephant ride if offered. From ₹16,999 pp. Permits local.",
    category: "Ecotourism",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 21,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kaziranga", "assam"],
    primaryDestinationSlug: "kaziranga",
    address: "Jorhat airport (JRH) or Guwahati (GAU) pickup",
    mapLat: "26.5775",
    mapLng: "93.1711",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kohora · western range jeep",
        morning:
          "Long drive from Guwahati or shorter hop from Jorhat to Kaziranga Kohora range. Lodge check-in.",
        afternoon: "Jeep safari in Bagori / western range — tall elephant grass and rhino wallows.",
        evening: "Dinner; optional cultural dance show in town (ticket extra). Overnight lodge.",
      },
      {
        dayNumber: 2,
        title: "Central & eastern circuits",
        morning:
          "Early jeep in central range. If park offers morning elephant ride in season, we help you book (elephant fee local).",
        afternoon: "Rest; birding from lodge garden.",
        evening: "Evening jeep toward Agoratoli (eastern) if permits open. Dinner and overnight.",
      },
      {
        dayNumber: 3,
        title: "Orchid park · departure",
        morning:
          "Breakfast, optional Kaziranga Orchid park stop, then drive to Jorhat or Guwahati airport.",
        afternoon: "Drop — tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Rhino country:</strong> Kaziranga is UNESCO-listed floodplain — jeeps are the workhorse; elephant rides operate only when the forest department schedules them.</p>",
      "<p><strong>Season:</strong> park closes annually for monsoon (typically mid-May to October). We do not sell dates inside the closure notice.</p>",
      "<p><strong>Permits:</strong> jeep and any elephant fees are paid locally at the current Assam Forest rate card.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 16999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 4 }] },
  details: safariDetails(
    [
      {
        title: "Is the elephant safari included?",
        content:
          "No. Elephant rides are short, government-run slots when available — we assist booking but you pay the forest fee on the spot.",
      },
    ],
    [
      "Private transfers Guwahati or Jorhat ↔ lodge",
      "Three jeep safaris (ranges per permit map)",
    ],
    ["Kaziranga National Park jeep / elephant safari fees (pay locally)"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Kaziranga Rhino Safari | 2N/3D Assam Wildlife",
    seoDescription: "Kaziranga rhino jeep safaris, lodge MAP, permits local. From ₹16,999 pp.",
    facebookTitle: "Kaziranga Rhino Safari",
    facebookDescription: "Jeep circuits for one-horned rhino. Honest permit wording.",
    twitterTitle: "Kaziranga Safari | 2N/3D",
    twitterDescription: "Rhino floodplain · 3 jeep rides. From ₹16,999 pp.",
    published: true,
  },
};

const kanhaJungleBookSafari: TourFormat = {
  slug: "kanha-jungle-book-safari",
  general: {
    title: "Kanha Jungle Book Safari",
    summary:
      "Sal and bamboo ridges that inspired the Jungle Book — three jeep safaris from a Kisli or Mukki lodge base. Barasingha meadow bonus. From ₹15,499 pp. Permits local.",
    category: "Ecotourism",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 21,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kanha", "madhya-pradesh"],
    primaryDestinationSlug: "kanha",
    address: "Gondia (G) or Jabalpur (JLR) railway / airport pickup",
    mapLat: "22.3345",
    mapLng: "80.6125",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kanha buffer · evening jeep",
        morning: "Drive into Mandla / Kisli buffer zone. Lodge check-in and lunch.",
        afternoon: "Rest, then evening jeep if your arrival permits allow a same-day slot.",
        evening: "Dinner; overview of Kanha–Kisli–Mukki zones. Overnight.",
      },
      {
        dayNumber: 2,
        title: "Morning & evening drives",
        morning: "Sunrise jeep into meadows for barasingha and tiger track reading.",
        afternoon: "Midday break; optional village craft stop outside core.",
        evening: "Second full jeep safari. Dinner and overnight.",
      },
      {
        dayNumber: 3,
        title: "Departure via tiger land",
        morning: "Breakfast and transfer to Gondia or Jabalpur for onward trains or flights.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Kanha’s appeal:</strong> wide meadows, successful barasingha comeback, and classic Jungle Book landscapes — sightings still require luck and patience.</p>",
      "<p><strong>Permits:</strong> MP Forest jeep fees are paid locally; we allocate zones from the live quota when you confirm.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 15499, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 3 }] },
  details: safariDetails(
    [
      {
        title: "Kisli or Mukki — which zone?",
        content:
          "We match lodge location and permit chart. Mukki is farther west; Kisli is the traditional hub — both are productive when cats move.",
      },
    ],
    [
      "Private transfers Gondia or Jabalpur ↔ lodge",
      "Three jeep safari rides (zones per permit availability)",
    ],
    ["Kanha National Park jeep permit fees (pay locally)"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Kanha Jungle Book Safari | 2N/3D",
    seoDescription: "Kanha tiger and barasingha safaris — lodge, jeep coordination. Permits local. From ₹15,499 pp.",
    facebookTitle: "Kanha Jungle Book Safari",
    facebookDescription: "Three jeep rides in MP sal forest. Permits at gate rates.",
    twitterTitle: "Kanha Safari | 2N/3D",
    twitterDescription: "Jungle Book landscapes · 3 safaris. From ₹15,499 pp.",
    published: true,
  },
};

const girAsiaticLionSafari: TourFormat = {
  slug: "gir-asiatic-lion-safari",
  general: {
    title: "Gir Asiatic Lion Safari",
    summary:
      "The world’s only wild Asiatic lion habitat — licensed gypsy safaris from Sasan Gir with two lodge nights. From ₹14,999 pp. Gujarat Forest permit fees local.",
    category: "Ecotourism",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 6,
    minDayBeforeBooking: 21,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["gir", "gujarat"],
    primaryDestinationSlug: "gir",
    address: "Rajkot airport (RAJ) or Junagadh railway pickup",
    mapLat: "21.1240",
    mapLng: "70.8242",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Sasan Gir · debut safari",
        morning: "Drive from Rajkot or Junagadh to Sasan. Check in at lodge near the permit centre.",
        afternoon: "Lunch, then afternoon gypsy safari in an assigned lion territory route.",
        evening: "Dinner and overnight.",
      },
      {
        dayNumber: 2,
        title: "Dawn & dusk lion circuits",
        morning: "Morning gypsy in teak–acacia scrub — lions often on the move early.",
        afternoon: "Optional visit to Devalia interpretation zone (ticket local) if you want a fenced backup sighting.",
        evening: "Evening gypsy. Dinner and overnight.",
      },
      {
        dayNumber: 3,
        title: "Somnath option · departure",
        morning:
          "Breakfast. Drive toward Junagadh or Rajkot; short Somnath temple photo stop if your departure time allows.",
        afternoon: "Drop at station or airport.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Asiatic lions:</strong> Gujarat’s flagship species — gypsy safaris are the only legal core-zone access. Lion sightings are common but never contractual.</p>",
      "<p><strong>Permits:</strong> booked through the official portal quota; fees paid locally. We verify seat availability before you pay us.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 14999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 3 }] },
  details: safariDetails(
    [
      {
        title: "What vehicle is used?",
        content:
          "Open gypsy (max 6 guests plus driver and guide) as mandated by Gujarat Forest. Canter seats exist on some routes — jeep is default on this package.",
      },
    ],
    [
      "Private transfers Rajkot or Junagadh ↔ lodge",
      "Three gypsy safari rides (routes per permit availability)",
    ],
    ["Gir National Park safari permit fees (pay locally)", "Devalia interpretation zone entry (optional)"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Gir Asiatic Lion Safari | 2N/3D Gujarat",
    seoDescription: "Gir lion gypsy safaris, lodge MAP, permits paid locally. From ₹14,999 pp.",
    facebookTitle: "Gir Lion Safari — 2 nights",
    facebookDescription: "Licensed gypsy rides in Sasan Gir. Forest fees at official rates.",
    twitterTitle: "Gir Lion Safari | 2N/3D",
    twitterDescription: "Asiatic lions · 3 gypsy safaris. From ₹14,999 pp.",
    published: true,
  },
};

const sundarbansBoatSafari: TourFormat = {
  slug: "sundarbans-boat-safari",
  general: {
    title: "Sundarbans Boat Safari",
    summary:
      "Mangrove channels by private boat from Godkhali — two nights on a simple launch with forest guides, village walks, and mud-bank birding. From ₹18,999 pp. Forest fees local.",
    category: "Ecotourism",
    availability: "always",
    durationDays: 4,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 4 days (incl. travel)",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 14,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["sundarbans", "west-bengal"],
    primaryDestinationSlug: "sundarbans",
    address: "Kolkata airport (CCU) pickup · Godkhali jetty",
    mapLat: "21.9498",
    mapLng: "88.7300",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Kolkata · drive to Godkhali",
        morning: "Pickup from Kolkata. Drive about 3 hours to Godkhali jetty via Basanti.",
        afternoon: "Board your chartered boat. Cruising introduction through smaller creeks.",
        evening: "Dinner on board; overnight anchored in a safe mooring.",
      },
      {
        dayNumber: 2,
        title: "Core-zone cruise · watch towers",
        morning:
          "Dawn cruise with guide — kingfishers, mudskippers, chital on mudflats. Forest permit check at Sajnekhali if scheduled.",
        afternoon: "Village walk on an inhabited island (respect private homes). Midday rest in shade on deck.",
        evening: "Night anchored; optional folk tales from crew. Dinner on board.",
      },
      {
        dayNumber: 3,
        title: "Tiger territory margins",
        morning: "Continue licensed routes where tiger pugmarks are often read on mud banks — cats are shy here.",
        afternoon: "Return toward Godkhali; disembark and drive to Kolkata or Gosaba hotel.",
        evening: "Overnight near jetty or en route Kolkata.",
      },
      {
        dayNumber: 4,
        title: "Return Kolkata",
        morning: "Breakfast and transfer to Kolkata airport or station.",
        afternoon: "Tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Boat, not jeep:</strong> Sundarbans core access is tidal water. You travel on a simple launch with cabin fans — not a luxury cruise ship.</p>",
      "<p><strong>Tiger reality:</strong> tigers swim between islands but are rarely seen. Treat kingfishers, estuarine crocodiles, and dolphins as the main prizes.</p>",
      "<p><strong>Permits:</strong> West Bengal Forest boat entry and guide fees are paid locally per sailing day.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 18999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: {
    sharedFaqTitles: [...SAFARI_SHARED_FAQ],
    extraFaqs: [
      {
        title: "What is the boat standard?",
        content:
          "Chartered tourist launch with sleeping berths, Indian-style toilet, and crew cook. AC is not standard — fans and open deck breezes.",
      },
      {
        title: "Does seasickness happen?",
        content:
          "Creeks are sheltered; open estuary segments can be choppy. Carry basic motion tablets if you are prone.",
      },
    ],
    includeTitles: [
      ...SAFARI_INCLUDES_BASE,
      "Private Kolkata ↔ Godkhali transfers",
      "Two nights aboard chartered boat (twin berths)",
      "All meals on board during cruise",
      "Boat safari coordination in Sundarbans (permit fees paid locally)",
      "Licensed forest guide on cruise days",
    ],
    excludeTitles: [
      ...SAFARI_EXCLUDES_BASE,
      "Sundarbans Tiger Reserve boat permit & forest fees (pay locally)",
    ],
    beforeYouGoTitles: [...SAFARI_BEFORE],
    travelStyleTitles: ["Adventure", "Wildlife & Nature", "Private / Independent"],
    facilityTitles: ["Private cab", "Boat safari", "24×7 helpline"],
  },
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Sundarbans Boat Safari | 2N Mangrove Cruise",
    seoDescription: "Sundarbans boat safari from Godkhali — forest guide, meals on board. Permits local. From ₹18,999 pp.",
    facebookTitle: "Sundarbans Boat Safari",
    facebookDescription: "Mangrove creeks by private launch. Honest tiger wording.",
    twitterTitle: "Sundarbans Boat Safari",
    twitterDescription: "Boat cruise · 2 nights. From ₹18,999 pp.",
    published: true,
  },
};

const periyarThekkadyWildlifeTour: TourFormat = {
  slug: "periyar-thekkady-wildlife-tour",
  general: {
    title: "Periyar / Thekkady Wildlife Tour",
    summary:
      "Lake Periyar at easy pace — Kerala Forest boat ride, spice plantation walk, and Cardamom Hills views without strenuous trekking. From ₹12,999 pp. Boat fees local.",
    category: "Ecotourism",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 7,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["thekkady", "kerala"],
    primaryDestinationSlug: "thekkady",
    address: "Cochin airport (COK) or Madurai (IXM) pickup",
    mapLat: "9.5997",
    mapLng: "77.1613",
    mapZoom: 12,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Thekkady",
        morning: "Scenic drive from Cochin or Madurai into Cardamom Hills.",
        afternoon: "Check in near Kumily. Orientation walk in the spice market.",
        evening: "Kathakali or martial arts show (ticket extra) or quiet evening. Overnight hotel.",
      },
      {
        dayNumber: 2,
        title: "Periyar Lake boat",
        morning:
          "Breakfast. Kerala Forest boat ride on Periyar Lake — elephants, gaur, and hornbills from the waterline (sightings vary).",
        afternoon: "Spice plantation tour with guide — pepper, cardamom, vanilla.",
        evening: "Dinner at hotel; overnight Thekkady.",
      },
      {
        dayNumber: 3,
        title: "Nature walk or bamboo raft option",
        morning:
          "Guided nature walk in buffer forest if available on your dates (separate forest fee local).",
        afternoon: "Free time for café hopping in Kumily or optional elephant junction visit (we do not book unethical rides).",
        evening: "Overnight hotel.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        morning: "Breakfast and drive to Cochin airport or Madurai.",
        afternoon: "Drop — tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Gentle ecotourism:</strong> Periyar suits families who want wildlife without MP jeep obsession — the lake boat is the signature experience.</p>",
      "<p><strong>Ethics:</strong> we do not package captive elephant bathing; optional forest walks use official Kerala Forest guides only.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 12999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 4 }] },
  details: leisureDetails(
    [
      {
        title: "Is the lake boat included?",
        content:
          "We coordinate timing and tickets — Kerala Forest boat fee is paid locally (typically a few hundred rupees per person).",
      },
    ],
    ["Spice plantation guided walk", "Periyar Lake boat ride coordination"],
    ["Periyar Lake boat / ecotourism entry fees (pay locally)", "Kerala Forest nature walk fees if booked"],
    ["Family Friendly", "Wildlife & Nature", "Private / Independent"],
    ["Private cab", "MAP meals (B/D)", "Boat safari", "24×7 helpline"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Periyar Thekkady Wildlife Tour | 3N Kerala",
    seoDescription: "Thekkady lake boat, spice gardens, easy Cardamom Hills stay. From ₹12,999 pp.",
    facebookTitle: "Periyar Wildlife Tour — Thekkady",
    facebookDescription: "Lake boat and spice plantation at an easy pace.",
    twitterTitle: "Thekkady Wildlife | 3N/4D",
    twitterDescription: "Periyar lake · spice walk. From ₹12,999 pp.",
    published: true,
  },
};

const ranthamboreJaipurCombo: TourFormat = {
  slug: "ranthambore-jaipur-combo",
  general: {
    title: "Ranthambore + Jaipur Combo",
    summary:
      "Wildlife first, pink city second — two Ranthambore jeep days then Jaipur forts and bazaars. Five nights, twin share from ₹28,999 pp. Park permit fees local.",
    category: "Leisure",
    availability: "always",
    durationDays: 6,
    durationNights: 5,
    durationUnit: "days",
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 21,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["ranthambore", "jaipur", "rajasthan"],
    primaryDestinationSlug: "ranthambore",
    address: "Jaipur airport (JAI) or Sawai Madhopur (SWM) railway pickup",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Jaipur · arrive pink city",
        morning: "Pickup at Jaipur airport or station. Check in central hotel.",
        afternoon: "Easy start: Hawa Mahal photo stop and Johari Bazaar stroll.",
        evening: "Dinner at hotel; overnight Jaipur.",
      },
      {
        dayNumber: 2,
        title: "Amer & old city",
        morning: "Amer Fort with elephant or jeep ride up (ride ticket local).",
        afternoon: "Jantar Mantar and City Palace courtyards.",
        evening: "Optional Chokhi Dhani or rest. Overnight Jaipur.",
      },
      {
        dayNumber: 3,
        title: "Drive to Ranthambore",
        morning: "After breakfast, drive about 3.5 hours to Sawai Madhopur wildlife lodge.",
        afternoon: "Lunch and rest; afternoon jeep safari if permits allow same-day entry.",
        evening: "Dinner and overnight lodge.",
      },
      {
        dayNumber: 4,
        title: "Twin tiger safaris",
        morning: "Morning jeep in assigned zone.",
        afternoon: "Midday rest at lodge.",
        evening: "Evening jeep. Dinner and overnight.",
      },
      {
        dayNumber: 5,
        title: "Fort morning · return Jaipur",
        morning: "Ranthambore Fort overlook, then drive back to Jaipur.",
        afternoon: "Free shopping time — block print or lac bangles.",
        evening: "Overnight Jaipur.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        morning: "Breakfast and airport or station drop.",
        afternoon: "",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Best of both:</strong> pairs Rajasthan’s headline city with a focused tiger park stop — not a rushed golden triangle.</p>",
      "<p><strong>Ranthambore permits:</strong> three jeep slots where inventory allows; fees paid locally like our standalone Ranthambore product.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 28999, currency: "INR", discounts: [{ name: "Group of 4+", type: "percent", value: 5 }] },
  details: {
    sharedFaqTitles: [...SAFARI_SHARED_FAQ, "What extras are paid locally?"],
    extraFaqs: [
      {
        title: "Can we start from Sawai Madhopur instead?",
        content: "Yes — tell us if you are arriving by train at SWM; we invert the road order and still end in Jaipur.",
      },
    ],
    includeTitles: [
      ...MAP_HOTEL_INCLUDES,
      "Jaipur city sightseeing as per itinerary",
      "Two nights wildlife lodge near Ranthambore (MAP)",
      "Three jeep safari rides (Ranthambore, zones per permits)",
      "Ranthambore Fort visit",
    ],
    excludeTitles: [
      ...MAP_HOTEL_EXCLUDES,
      "Ranthambore National Park jeep permit fees (pay locally)",
      "Amer Fort elephant or jeep ride fees",
      "Monument tickets in Jaipur",
    ],
    beforeYouGoTitles: [...SAFARI_BEFORE],
    travelStyleTitles: ["Family Friendly", "Wildlife & Nature", "Private / Independent"],
    facilityTitles: ["Private cab", "Wildlife lodge", "Jeep safaris", "MAP meals (B/D)", "24×7 helpline"],
  },
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Ranthambore Jaipur Combo | 5N Wildlife & Culture",
    seoDescription: "Ranthambore safaris plus Jaipur forts — private cab, MAP stays. Permits local. From ₹28,999 pp.",
    facebookTitle: "Ranthambore + Jaipur Combo",
    facebookDescription: "Tiger park then pink city forts.",
    twitterTitle: "Ranthambore Jaipur | 5N/6D",
    twitterDescription: "Safari + Jaipur. From ₹28,999 pp.",
    published: true,
  },
};

const rishikeshYogaGangaRetreat: TourFormat = {
  slug: "rishikesh-yoga-ganga-retreat",
  general: {
    title: "Rishikesh Yoga & Ganga Retreat",
    summary:
      "Three nights on the Ganga — daily hatha yoga, pranayama, evening aarti at Parmarth or Triveni, and easy cliff walk to Beatles Ashram. From ₹11,999 pp.",
    category: "Leisure",
    availability: "always",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 5,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["rishikesh", "uttarakhand"],
    primaryDestinationSlug: "rishikesh",
    address: "Dehradun airport (DED) or Haridwar railway pickup",
    mapLat: "30.0869",
    mapLng: "78.2676",
    mapZoom: 13,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Rishikesh · Ganga introduction",
        morning: "Pickup and check in at a yoga-friendly hotel near Ram Jhula or Tapovan.",
        afternoon: "Orientation: walking only on lakshman Jhula / Ram Jhula routes (no vehicles on bridges).",
        evening: "Ganga aarti at Parmarth or Triveni Ghat. Dinner; overnight.",
      },
      {
        dayNumber: 2,
        title: "Morning practice · gentle adventure",
        morning: "Yoga and pranayama session with certified instructor (about 90 minutes).",
        afternoon: "Walk to Beatles Ashram graffiti trail or optional short rafting stretch (rafting extra, seasonal).",
        evening: "Gentle yin or meditation hour. Dinner and overnight.",
      },
      {
        dayNumber: 3,
        title: "Neelkanth or waterfall option",
        morning: "Yoga on the terrace. Optional drive to Neelkanth Mahadev temple or Neer Garh waterfall.",
        afternoon: "Ayurvedic café lunch (own account) and spa slot if booked.",
        evening: "Free ghat time; overnight Rishikesh.",
      },
      {
        dayNumber: 4,
        title: "Closing practice · departure",
        morning: "Final yoga and breakfast. Checkout and drive to Dehradun or Haridwar.",
        afternoon: "Drop — tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Wellness without ashram lock-in:</strong> hotel comfort with structured yoga — not a silent vipassana retreat.</p>",
      "<p><strong>River caution:</strong> do not swim in the Ganga during monsoon swell; rafting runs only when outfitters and disaster management clear the stretch.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 11999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: leisureDetails(
    [
      {
        title: "Is rafting included?",
        content: "No. Short Shivpuri–Lakshman Jhula runs are optional add-ons when the river is open and you want the adrenaline.",
      },
    ],
    ["Daily yoga sessions with certified instructor (Rishikesh)", "Evening Ganga aarti coordination"],
    ["River rafting or spa therapies", "Beatles Ashram entry ticket"],
    ["Wellness & Yoga", "Family Friendly", "Private / Independent"],
    ["Private cab", "MAP meals (B/D)", "Airport transfers", "24×7 helpline"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Rishikesh Yoga & Ganga Retreat | 3N",
    seoDescription: "Daily yoga, Ganga aarti, easy Rishikesh wellness break. From ₹11,999 pp.",
    facebookTitle: "Rishikesh Yoga Retreat",
    facebookDescription: "Morning yoga and evening aarti on the Ganga.",
    twitterTitle: "Rishikesh Yoga | 3N/4D",
    twitterDescription: "Yoga · Ganga · easy pace. From ₹11,999 pp.",
    published: true,
  },
};

const rannUtsavPackage: TourFormat = {
  slug: "rann-utsav-package",
  general: {
    title: "Rann Utsav Package",
    summary:
      "White Rann under full moon — three nights in a tented cluster at Dhordo with handicraft bazaar time and Kalo Dungar sunset. Seasonal Nov–Feb from ₹22,999 pp.",
    category: "Cultural",
    availability: "dates",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days (winter festival window)",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 12,
    minDayBeforeBooking: 30,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["rann-of-kutch", "gujarat"],
    primaryDestinationSlug: "rann-of-kutch",
    address: "Bhuj airport (BHJ) pickup",
    mapLat: "23.8837",
    mapLng: "69.7228",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Bhuj · crafts & drive to Dhordo",
        morning: "Arrive Bhuj, meet driver. Optional Aina Mahal / Swaminarayan temple if time.",
        afternoon: "Drive to Rann Utsav tent city at Dhordo. Check in to pre-booked tent category.",
        evening: "Festival grounds walk — folk dance and snack stalls (meals per tent package). Overnight tent.",
      },
      {
        dayNumber: 2,
        title: "White Rann day",
        morning:
          "Shuttle to White Rann salt desert for sunrise photography (permits via festival pass).",
        afternoon: "Handicraft village interactions — embroidery, bell metal, lac work.",
        evening: "Full-moon Rann session when dates align; otherwise sunset sound-and-light. Overnight tent.",
      },
      {
        dayNumber: 3,
        title: "Kalo Dungar & Hodka",
        morning: "Drive to Kalo Dungar (black hill) viewpoint over the Great Rann.",
        afternoon: "Hodka or Dhordo artisan lunch (own) and camel cart photo stop.",
        evening: "Second festival evening program. Overnight tent.",
      },
      {
        dayNumber: 4,
        title: "Return Bhuj · fly out",
        morning: "Breakfast, pack, and drive to Bhuj airport.",
        afternoon: "Tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Seasonal only:</strong> we sell fixed departure windows when Gujarat Tourism opens tent inventory — not year-round desert camping.</p>",
      "<p><strong>Tent tier:</strong> price assumes standard Swiss cottage category; premium dome upgrades quoted separately.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 22999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 4 }] },
  details: leisureDetails(
    [
      {
        title: "When does Rann Utsav run?",
        content:
          "Typically November–February. We align your dates with confirmed tent vouchers — not speculative bookings.",
      },
    ],
    [
      "Tented / festival-stay coordination at Rann Utsav (Dhordo)",
      "Bhuj ↔ Dhordo private transfers",
      "Festival entry coordination per official pass rules",
    ],
    ["Flights to Bhuj", "Premium tent upgrades", "Camel cart rides", "Lunch on road days"],
    ["Festivals & Fairs", "Family Friendly", "Private / Independent"],
    ["Private cab", "Airport transfers", "24×7 helpline"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Rann Utsav Package | 3N White Rann Tents",
    seoDescription: "Rann Utsav Dhordo tents, White Rann moonrise, Kalo Dungar. Winter dates. From ₹22,999 pp.",
    facebookTitle: "Rann Utsav Package — 3 nights",
    facebookDescription: "White Rann festival tents Nov–Feb window.",
    twitterTitle: "Rann Utsav | 3N/4D",
    twitterDescription: "Salt desert festival stay. From ₹22,999 pp.",
    published: true,
  },
};

const pushkarCamelFairTour: TourFormat = {
  slug: "pushkar-camel-fair-tour",
  general: {
    title: "Pushkar Camel Fair Tour",
    summary:
      "Kartik Purnima week — camping meadows, camel trading colour, Brahma temple darshan, and ghats at sunrise. Seasonal Oct–Nov from ₹14,999 pp.",
    category: "Cultural",
    availability: "dates",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days (fair window)",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 14,
    minDayBeforeBooking: 30,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["pushkar", "rajasthan"],
    primaryDestinationSlug: "pushkar",
    address: "Jaipur airport (JAI) pickup",
    mapLat: "26.4896",
    mapLng: "74.5511",
    mapZoom: 13,
    days: [
      {
        dayNumber: 1,
        title: "Jaipur · drive to Pushkar",
        morning: "Pickup Jaipur airport. Optional quick lunch stop at Ajmer dargah outer area (no long halt).",
        afternoon: "Reach Pushkar, check in near ghats. Walk the fair periphery as stalls assemble.",
        evening: "Sunset at Pushkar Lake; dinner. Overnight hotel.",
      },
      {
        dayNumber: 2,
        title: "Fairground immersion",
        morning: "Sunrise on the ghats, then camel trading fields and ferris wheels on the sand.",
        afternoon: "Brahma Temple darshan in your coordinated queue window.",
        evening: "Folk music on the maidan or hotel rest. Overnight Pushkar.",
      },
      {
        dayNumber: 3,
        title: "Bathing day buffer",
        morning:
          "Kartik Purnima bathing day crowds — your coordinator keeps realistic timings for lake and temple.",
        afternoon: "Free time for fair shopping — leather, silver, camel-hair textiles.",
        evening: "Overnight Pushkar.",
      },
      {
        dayNumber: 4,
        title: "Return Jaipur",
        morning: "Breakfast and drive to Jaipur airport.",
        afternoon: "Tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Fair reality:</strong> hotels sell out months ahead for Purnima week. We only open departures once rooms are blocked in writing.</p>",
      "<p><strong>Animals:</strong> observe trading and races from respectful distances — we do not promote cruel ride operators.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 14999, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
  details: leisureDetails(
    [
      {
        title: "When is the Pushkar Camel Fair?",
        content:
          "Centre date is Kartik Purnima (usually late Oct–Nov). We sync 3-night plans with the bathing day and peak livestock trading.",
      },
    ],
    ["Pushkar fair coordination", "Jaipur ↔ Pushkar private cab", "Brahma Temple visit coordination"],
    ["Fair ride tickets", "Camel / horse joy rides", "Special pujas"],
    ["Festivals & Fairs", "Family Friendly", "Private / Independent"],
    ["Private cab", "MAP meals (B/D)", "24×7 helpline"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Pushkar Camel Fair Tour | 3N Kartik Purnima",
    seoDescription: "Pushkar fair, lake ghats, Brahma temple — seasonal departures. From ₹14,999 pp.",
    facebookTitle: "Pushkar Camel Fair Tour",
    facebookDescription: "Kartik Purnima week with honest crowd wording.",
    twitterTitle: "Pushkar Fair | 3N/4D",
    twitterDescription: "Camel fair · ghats. From ₹14,999 pp.",
    published: true,
  },
};

const holiMathuraVrindavanSpecial: TourFormat = {
  slug: "holi-mathura-vrindavan-special",
  general: {
    title: "Holi Mathura–Vrindavan Special",
    summary:
      "Phalgun Holi long weekend — Lathmar colour in Barsana, temple processions in Vrindavan, and gulal on the ghats with a local coordinator. Seasonal March from ₹9,999 pp.",
    category: "Cultural",
    availability: "dates",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days (Holi window)",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 16,
    minDayBeforeBooking: 21,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["mathura", "vrindavan", "uttar-pradesh"],
    primaryDestinationSlug: "vrindavan",
    address: "Delhi airport (DEL) or Mathura Cantt (MTJ) pickup",
    mapLat: "27.5700",
    mapLng: "77.7000",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Barsana Lathmar preview",
        morning: "Drive from Delhi or Mathura to Barsana base hotel.",
        afternoon:
          "Coordinator briefing on safe zones for Lathmar Holi (day before main Holi when calendar allows). Organic gulal only.",
        evening: "Temple bells in Barsana; early night before colour day.",
      },
      {
        dayNumber: 2,
        title: "Holi peak · Vrindavan & Mathura",
        morning: "Colour play in Vrindavan lanes near Banke Bihari (follow coordinator routes).",
        afternoon: "Mathura ghats and Dwarkadhish temple vicinity — intense crowds.",
        evening: "Wash up, dinner, overnight near Vrindavan.",
      },
      {
        dayNumber: 3,
        title: "Post-Holi calm · departure",
        morning: "Breakfast and optional Nidhivan walk. Drive to Delhi airport or Mathura station.",
        afternoon: "Tour ends.",
        evening: "",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Not a gentle festival:</strong> Holi here is physical, loud, and dye-heavy. We provide coordination and timing, not VIP immunity from colour.</p>",
      "<p><strong>Dates:</strong> fixed departures only once the Hindu calendar Holi date is published for that year.</p>",
    ].join(""),
  },
  pricing: { priceFrom: 9999, currency: "INR", discounts: [{ name: "Group of 8+", type: "percent", value: 5 }] },
  details: leisureDetails(
    [
      {
        title: "When is Holi in Mathura–Vrindavan?",
        content:
          "Main Holi is Phalgun Purnima (Feb–Mar). Lathmar events in Barsana/Nandgaon happen days earlier — our package targets the full long weekend.",
      },
      {
        title: "Is colour play safe for women travellers?",
        content:
          "We use licensed coordinators and stick to agreed temple lanes. Crowds are still chaotic — travel in your party and avoid isolated alleys.",
      },
    ],
    ["Local Holi coordinator", "Delhi or Mathura ↔ Vrindavan transfers"],
    ["Personal gulal kits (available locally)", "Monument tickets"],
    ["Festivals & Fairs", "Private / Independent"],
    ["Private cab", "MAP meals (B/D)", "24×7 helpline"],
  ),
  images: NO_IMAGES,
  seo: {
    seoIndex: true,
    seoTitle: "Holi Mathura Vrindavan Special | 2N",
    seoDescription: "Lathmar and Banke Bihari Holi with coordinator — seasonal March. From ₹9,999 pp.",
    facebookTitle: "Holi Mathura–Vrindavan Special",
    facebookDescription: "Honest crowd and colour wording for Phalgun Holi.",
    twitterTitle: "Mathura Holi | 2N/3D",
    twitterDescription: "Barsana · Vrindavan Holi. From ₹9,999 pp.",
    published: true,
  },
};

export const indiaWildlifeWellnessPendingTours: TourFormat[] = [
  bandhavgarhTigerSafari,
  kazirangaRhinoSafari,
  kanhaJungleBookSafari,
  girAsiaticLionSafari,
  sundarbansBoatSafari,
  periyarThekkadyWildlifeTour,
  ranthamboreJaipurCombo,
  rishikeshYogaGangaRetreat,
  rannUtsavPackage,
  pushkarCamelFairTour,
  holiMathuraVrindavanSpecial,
];
