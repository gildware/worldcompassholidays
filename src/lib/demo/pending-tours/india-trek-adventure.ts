/**
 * Pending India trek & adventure tours — locked format, media deferred.
 * Excludes nag-tibba-trek and manali-leh-bike-trip (seeded separately).
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

const noImages = {
  banner: null,
  cover: null,
  gallery: [] as string[],
  seoImage: null,
};

export const indiaTrekAdventureCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "category", title: "Adventure" },
  { kind: "style", title: "Adventure" },
  { kind: "style", title: "Trekking & Camping" },
  { kind: "style", title: "Winter Sports" },
  { kind: "style", title: "Private / Independent" },
  { kind: "facility", title: "Trek guide and cook team" },
  { kind: "facility", title: "Licensed trek guide" },
  { kind: "facility", title: "Camping equipment" },
  { kind: "facility", title: "Motorcycle rental" },
  { kind: "facility", title: "Backup support vehicle" },
  { kind: "facility", title: "Rafting operator coordination" },
  { kind: "facility", title: "Paragliding slot coordination" },
  { kind: "facility", title: "Ski lesson arrangement" },
  { kind: "facility", title: "Ski kit hire desk" },
  { kind: "facility", title: "Dive centre coordination" },
  { kind: "include", title: "Camping equipment (tent, sleeping bag, mat)" },
  { kind: "include", title: "Trek guide and camp meals on trail" },
  { kind: "include", title: "Licensed trek guide & camp support crew" },
  { kind: "include", title: "Meals on trek days (B/L/D as per itinerary)" },
  {
    kind: "include",
    title: "Forest / trek permit assistance (Uttarakhand & Sikkim sectors)",
  },
  {
    kind: "include",
    title: "Motorcycle rental with fuel on Spiti riding days",
  },
  {
    kind: "include",
    title: "Backup SUV with mechanic on Spiti highway days",
  },
  {
    kind: "include",
    title: "Ganga rafting stretch (grade II–III) with safety crew",
  },
  {
    kind: "include",
    title: "Tandem paragliding flight from Billing take-off",
  },
  {
    kind: "include",
    title: "Ski/snowboard kit hire for lesson days",
  },
  {
    kind: "include",
    title: "1 beginner ski lesson (group) per quoted ski day",
  },
  {
    kind: "include",
    title: "Open-water scuba dives with instructor (certified centre)",
  },
  {
    kind: "exclude",
    title: "Personal trekking poles, gaiters, or mountaineering kit",
  },
  { kind: "exclude", title: "Pony / porter for personal baggage" },
  { kind: "exclude", title: "Bike damage deposit & riding insurance" },
  { kind: "exclude", title: "Gulmarg Gondola tickets beyond quoted access" },
  { kind: "exclude", title: "Auli chairlift / GMVN lift tickets" },
  { kind: "exclude", title: "Scuba medical form & marine park fees (paid locally)" },
  {
    kind: "exclude",
    title: "Tips for trek guide, cook, raft crew, or dive staff",
  },
  {
    kind: "before_you_go",
    title: "Trek kit list",
    content:
      "Broken-in waterproof boots, wool socks, rain shell, headlamp with spare cells, two-litre bottle, and a dry bag for electronics. No jeans on trail days.",
  },
  {
    kind: "before_you_go",
    title: "Altitude readiness",
    content:
      "Sleep low the night before a big climb. Hydrate steadily; tell your guide immediately if you have headache, nausea, or unusual breathlessness.",
  },
  {
    kind: "before_you_go",
    title: "Winter kit (ski / snow treks)",
    content:
      "Waterproof gloves, goggles or sunglasses, lip balm, and a down or synthetic mid-layer. Rental boots should fit snug — share your shoe size in the request.",
  },
  {
    kind: "before_you_go",
    title: "Rafting & water safety",
    content:
      "Wear quick-dry clothing; leave valuables in the hotel safe. Non-swimmers must declare it — life jackets are mandatory and guides assign boat positions.",
  },
  {
    kind: "before_you_go",
    title: "Paragliding weight & weather",
    content:
      "Tandem flights depend on wind at Billing. Typical weight limits apply (share yours in the request). Flights may roll to the next clear morning without penalty when weather is unsafe.",
  },
  {
    kind: "before_you_go",
    title: "Scuba medical clearance",
    content:
      "Complete the dive centre medical form honestly. Asthma, recent surgery, or pregnancy usually disqualify — ask before you book flights.",
  },
  {
    kind: "faq",
    title: "What camping gear is provided?",
    content:
      "Tents, sleeping bags with liners, foam mats, and a cook tent on multi-night departures are included. Bring your own torch, blister kit, and a bag rated to about 0 °C on pass nights.",
  },
  {
    kind: "faq",
    title: "Is motorcycle rental included on the Spiti bike circuit?",
    content:
      "Yes for the quoted package — one Royal Enfield 350cc or Himalayan (or similar) per rider, with fuel on listed riding days. Damage deposit, riding gear, and personal insurance are separate; we list deposit amounts before payment.",
  },
  {
    kind: "faq",
    title: "Do I need prior high-altitude riding experience?",
    content:
      "You should be comfortable on a geared motorcycle and have ridden in mountains before. Long days above 3,500 m, gravel patches, and cold wind are normal — pillion riders can use the backup SUV on the toughest days.",
  },
  {
    kind: "faq",
    title: "Which Ganga stretch do we raft near Rishikesh?",
    content:
      "We use operator-approved Grade II–III sections (often Marine Drive to Rishikesh or similar) depending on water level and age mix in your party. The exact put-in is confirmed the evening before.",
  },
  {
    kind: "faq",
    title: "Is Bir Billing paragliding weather-dependent?",
    content:
      "Yes. Billing needs stable thermals; Kharua and monsoon months are poor. We hold your tandem slot across the stay and fly on the first safe window.",
  },
  {
    kind: "faq",
    title: "When is Gulmarg skiing season?",
    content:
      "Late December through February for reliable meadow snow. Gondola Phase II opens only in firm snow years. We check daily snow reports before you fly in.",
  },
  {
    kind: "faq",
    title: "How is Auli different from Gulmarg for skiing?",
    content:
      "Auli is a GMVN-led slope above Joshimath with chairlift access and gentler nursery runs — better for families learning basics. Gulmarg has deeper powder culture and higher gondola terrain.",
  },
  {
    kind: "faq",
    title: "Do I need PADI certification for Andaman scuba?",
    content:
      "No for the introductory package — you get a Discover Scuba-style supervised dive with an instructor. Certified divers can swap in fun dives on request (price adjusted).",
  },
  {
    kind: "faq",
    title: "How hard is Har Ki Dun compared to Kedarkantha?",
    content:
      "Har Ki Dun is longer and gentler in grade — more valley walking and one snow peak optional. Kedarkantha is steeper in a shorter window. Both need reasonable cardio fitness.",
  },
  {
    kind: "faq",
    title: "Does Goecha La need prior high-altitude trekking?",
    content:
      "Yes. You sleep around 4,700 m near Samiti Lake before the pass viewpoint. Prior multi-day trekking above 3,500 m is strongly recommended.",
  },
];

const treksSharedIncludes = [
  "Airport / rail pickup & drop as quoted",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Camping equipment (tent, sleeping bag, mat)",
  "Trek guide and camp meals on trail",
  "Licensed trek guide & camp support crew",
  "Meals on trek days (B/L/D as per itinerary)",
  "Forest / trek permit assistance (Uttarakhand & Sikkim sectors)",
];

const treksSharedExcludes = [
  "Flights / trains to starting point",
  "Lunch on non-trek hotel days (unless listed)",
  "Tips & personal expenses",
  "Travel insurance",
  "Pony / porter for personal baggage",
  "Personal trekking poles, gaiters, or mountaineering kit",
  "Anything not mentioned in includes",
];

const treksBeforeYouGo = [
  "Trek kit list",
  "Altitude readiness",
  "Fitness",
  "Documents",
  "Weather & kit",
  "Arrival",
  "Rooms",
  "Money on the road",
];

const trekFacilities = [
  "Private cab",
  "Airport transfers",
  "Trek guide and cook team",
  "Camping equipment",
  "24×7 helpline",
];

const trekStyles = ["Adventure", "Trekking & Camping", "Private / Independent"];

const adventureRoadIncludes = [
  "Accommodation as per itinerary (twin sharing)",
  "Breakfast + dinner at hotels (MAP; camp meals where listed)",
  "Private vehicle or bike logistics as quoted",
  "Driver & crew allowances, tolls & parking",
  "GST as quoted",
  "Meet-and-greet at arrival point",
];

const adventureRoadExcludes = [
  "Flights / trains to starting point",
  "Lunch en route (unless listed)",
  "Tips & personal expenses",
  "Travel insurance",
  "Anything not mentioned in includes",
];

const adventureBeforeYouGo = [
  "Altitude readiness",
  "Fitness",
  "Documents",
  "Weather & kit",
  "Arrival",
  "Rooms",
  "Money on the road",
];

const adventureFacilitiesBase = [
  "Private cab",
  "Airport transfers",
  "24×7 helpline",
];

function trekDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[] = [],
  excludeExtras: string[] = [],
  sharedFaqs: string[] = [
    "What camping gear is provided?",
    "Is this a private or group tour?",
    "Are flights included?",
  ],
): TourFormat["details"] {
  return {
    sharedFaqTitles: sharedFaqs,
    extraFaqs,
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      ...treksSharedIncludes,
      ...includeExtras,
    ],
    excludeTitles: [...treksSharedExcludes, ...excludeExtras],
    beforeYouGoTitles: treksBeforeYouGo,
    travelStyleTitles: trekStyles,
    facilityTitles: trekFacilities,
  };
}

function adventureDetails(
  extraFaqs: { title: string; content: string }[],
  includeExtras: string[],
  excludeExtras: string[],
  facilities: string[],
  sharedFaqs: string[],
  beforeYouGo: string[] = adventureBeforeYouGo,
  styles: string[] = ["Adventure", "Private / Independent"],
): TourFormat["details"] {
  return {
    sharedFaqTitles: sharedFaqs,
    extraFaqs,
    includeTitles: [...adventureRoadIncludes, ...includeExtras],
    excludeTitles: [...adventureRoadExcludes, ...excludeExtras],
    beforeYouGoTitles: beforeYouGo,
    travelStyleTitles: styles,
    facilityTitles: [...adventureFacilitiesBase, ...facilities],
  };
}

export const indiaTrekAdventurePendingTours: TourFormat[] = [
  {
    slug: "har-ki-dun-trek",
    general: {
      title: "Har Ki Dun Trek",
      summary:
        "Govind Pashu Vihar’s cradle valley — pine forests, Osla village, and Swargarohini views from Sankri. Guided camp trek from ₹17,999 a person (min. 2).",
      category: "Trekking",
      availability: "dates",
      durationDays: 7,
      durationNights: 6,
      durationUnit: "days",
      durationLabel: "6 nights / 7 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 12,
      minDayBeforeBooking: 10,
      isFeatured: true,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["sankri", "uttarakhand", "dehradun"],
      primaryDestinationSlug: "sankri",
      address: "Dehradun railway station or Jolly Grant (DED) pickup",
      mapLat: "31.0750",
      mapLng: "78.1850",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Dehradun · drive to Sankri",
          morning:
            "Meet your driver at Dehradun station or airport. Scenic drive toward the Tons valley with tea stops.",
          afternoon:
            "Reach Sankri village, check in at a guest house. Gear check with trek lead; distribute shared camping kit list.",
          evening: "Briefing on trail etiquette in Govind sanctuary. MAP dinner; overnight Sankri.",
        },
        {
          dayNumber: 2,
          title: "Sankri to Taluka · trek toward Osla",
          morning:
            "Jeep to Taluka roadhead where permitted. Start walking on the wide trail beside the Supin river.",
          afternoon:
            "Gradual climb through cedar; cross wooden bridges. Reach camp near Osla or Seema village.",
          evening: "Hot dinner in the dining tent. First camp night.",
        },
        {
          dayNumber: 3,
          title: "Osla · Har Ki Dun meadow",
          morning:
            "Village stroll past traditional houses. Continue up-valley with views opening to snow peaks.",
          afternoon:
            "Enter the Har Ki Dun bowl — famous amphitheatre beneath Swargarohini. Camp on the meadow fringe.",
          evening: "Photography hour; overnight tents at Har Ki Dun.",
        },
        {
          dayNumber: 4,
          title: "Exploration day · Maninda or Jaundhar viewpoint",
          morning:
            "Optional half-day walk to Maninda lake or a ridge knoll for wider panorama (guide decides on snow).",
          afternoon:
            "Return to camp; rest, card games, or journal time in the meadow.",
          evening: "Second night at Har Ki Dun camp.",
        },
        {
          dayNumber: 5,
          title: "Descend to Seema · riverside camp",
          morning:
            "Break camp and retrace toward Osla/Seema at an easy pace — knees friendly on the descent.",
          afternoon: "Camp lower in the valley near the river crossing.",
          evening: "Camp dinner; overnight riverside.",
        },
        {
          dayNumber: 6,
          title: "Exit trail · Sankri recovery",
          morning:
            "Final trek to Taluka pickup. Jeep to Sankri; hot shower at guest house.",
          afternoon: "Free time in the market strip for souvenirs. Celebrate with local rajma.",
          evening: "MAP dinner; soft bed in Sankri.",
        },
        {
          dayNumber: 7,
          title: "Return Dehradun",
          morning: "Breakfast and checkout. Drive to Dehradun station or airport — tour ends.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Har Ki Dun:</strong> a full Himalayan valley without technical climbing — perfect when you want KGL-style scenery with a moderate grade.</p>",
        "<p><strong>Stays:</strong> 2N Sankri guest house · 4N trek camps · 1N Sankri. Twin share in lodges; two-person tents on trail.</p>",
        "<p><strong>Season:</strong> May–June and September–October; winter is for experienced snow trekkers only.</p>",
        "<p><strong>How to book:</strong> share last trek experience and shoe size. Departures lock when Sankri permits and pony hire confirm.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 17999,
      currency: "INR",
      discounts: [{ name: "Group of 8 trekkers", type: "percent", value: 5 }],
    },
    details: trekDetails(
      [
        {
          title: "How hard is Har Ki Dun compared to Kedarkantha?",
          content:
            "Har Ki Dun is longer and gentler in grade — more valley walking and one snow peak optional. Kedarkantha is steeper in a shorter window. Both need reasonable cardio fitness.",
        },
      ],
      ["Pony for communal kitchen loads on trail"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Har Ki Dun Trek | 6N/7D from Sankri | Swargarohini Valley",
      seoDescription:
        "Har Ki Dun guided trek — Osla village, meadow camp, Govind sanctuary permits. From ₹17,999 pp with crew and kit.",
      facebookTitle: "Har Ki Dun Trek — cradle valley from Sankri",
      facebookDescription: "6N/7D camp itinerary with licensed guide and trail meals.",
      twitterTitle: "Har Ki Dun Trek | 6N/7D",
      twitterDescription: "Sankri · Osla · meadow camp. From ₹17,999 pp.",
      published: true,
    },
  },
  {
    slug: "goecha-la-trek",
    general: {
      title: "Goecha La Trek",
      summary:
        "Sikkim’s Kanchenjunga balcony — rhododendron forests, Samiti Lake, and the Goecha viewpoint at 4,940 m. Fixed departure trek from ₹34,999 a person (min. 2).",
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
      destinationSlugs: ["sikkim"],
      primaryDestinationSlug: "sikkim",
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
        },
        {
          dayNumber: 2,
          title: "Yuksom to Sachen",
          morning:
            "Trail enters Kanchenjunga National Park. Steady climb through lush forest.",
          afternoon: "Reach Sachen camp beside the Prek Chu. Early bedtime.",
          evening: "Camp night Sachen.",
        },
        {
          dayNumber: 3,
          title: "Sachen to Tshoka",
          morning: "Rhododendron tunnels and mossy bridges on the climb.",
          afternoon:
            "First views of Pandim. Tshoka village tea houses; camp above the hamlet.",
          evening: "Acclimatisation walk optional. Overnight Tshoka camp.",
        },
        {
          dayNumber: 4,
          title: "Tshoka to Dzongri",
          morning: "Steady ascent through yak pastures.",
          afternoon:
            "Arrive Dzongri meadow — classic Kanchenjunga panorama if clouds lift.",
          evening: "Camp at Dzongri; cold night prep briefing.",
        },
        {
          dayNumber: 5,
          title: "Dzongri rest · acclimatisation",
          morning: "Short hike to Dzongri Top for sunrise (weather permitting).",
          afternoon: "Hydration, laundry, gear repair time in camp.",
          evening: "Second night Dzongri.",
        },
        {
          dayNumber: 6,
          title: "Dzongri to Thansing",
          morning: "Descend and contour toward the Prek Chu gorge.",
          afternoon: "Climb to Thansing meadows below Mount Pandim.",
          evening: "Camp Thansing.",
        },
        {
          dayNumber: 7,
          title: "Thansing to Samiti Lake",
          morning: "Morbid rhythm day — slow steps above 4,000 m.",
          afternoon:
            "Reach sacred Samiti Lake; optional walk toward Goecha viewpoint base.",
          evening: "Highest camp — oxygen mindset briefing.",
        },
        {
          dayNumber: 8,
          title: "Goecha La viewpoint day",
          morning:
            "Pre-dawn start for the Goecha La viewpoint ridge (weather and group fitness decide turnaround).",
          afternoon: "Return to Samiti or Thansing depending on energy.",
          evening: "Camp night lower if possible.",
        },
        {
          dayNumber: 9,
          title: "Descent to Tshoka",
          morning: "Long downhill; poles recommended.",
          afternoon: "Forest camp near Tshoka.",
          evening: "Overnight Tshoka.",
        },
        {
          dayNumber: 10,
          title: "Tshoka to Yuksom",
          morning: "Exit trail through Sachen.",
          afternoon: "Yuksom hotel; hot shower and celebratory dinner.",
          evening: "Overnight Yuksom.",
        },
        {
          dayNumber: 11,
          title: "Drive to Bagdogra / NJP",
          morning: "Breakfast and return transfer. Tour ends.",
          afternoon: "",
          evening: "",
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
      priceFrom: 34999,
      currency: "INR",
      discounts: [{ name: "Early bird 60 days", type: "percent", value: 4 }],
    },
    details: trekDetails(
      [
        {
          title: "Does Goecha La need prior high-altitude trekking?",
          content:
            "Yes. You sleep around 4,700 m near Samiti Lake before the pass viewpoint. Prior multi-day trekking above 3,500 m is strongly recommended.",
        },
      ],
      ["Sikkim Kanchenjunga National Park entry as quoted", "Pony for kitchen loads"],
      ["Personal oxygen cans"],
      ["Does Goecha La need prior high-altitude trekking?", "What camping gear is provided?", "Are flights included?"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Goecha La Trek Sikkim | 10N/11D Kanchenjunga View Trek",
      seoDescription:
        "Goecha La trek from Yuksom — Dzongri, Samiti Lake, guided camps. Difficult grade from ₹34,999 pp.",
      facebookTitle: "Goecha La Trek — Kanchenjunga balcony",
      facebookDescription: "11-day Sikkim trek with permits and camp crew.",
      twitterTitle: "Goecha La Trek | 10N/11D",
      twitterDescription: "Yuksom · Dzongri · Samiti. From ₹34,999 pp.",
      published: true,
    },
  },
  {
    slug: "sandakphu-phalut-trek",
    general: {
      title: "Sandakphu–Phalut Trek",
      summary:
        "Walk the Singalila skyline — four of the world’s tallest peaks on one ridge, tea-house nights and one camp. From ₹13,999 a person (min. 2).",
      category: "Trekking",
      availability: "dates",
      durationDays: 6,
      durationNights: 5,
      durationUnit: "days",
      durationLabel: "5 nights / 6 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 14,
      minDayBeforeBooking: 7,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["sikkim"],
      primaryDestinationSlug: "sikkim",
      address: "Bagdogra (IXB) pickup · transfer to Manebhanjang",
      mapLat: "27.0360",
      mapLng: "88.1200",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Bagdogra · Manebhanjang",
          morning: "Drive to the Singalila trailhead town. Permit check.",
          afternoon: "Short acclimatisation walk on the ridge road.",
          evening: "Tea-house night; early dinner.",
        },
        {
          dayNumber: 2,
          title: "Trek to Tumling",
          morning: "Climb through misty forest; Nepal border trails merge.",
          afternoon: "Tumling village views on clear days.",
          evening: "Overnight Tumling lodge.",
        },
        {
          dayNumber: 3,
          title: "Tumling to Kalapokhri",
          morning: "Rhododendron bloom in spring; snow patches in winter.",
          afternoon: "Sacred black lake at Kalapokhri.",
          evening: "Lodge night.",
        },
        {
          dayNumber: 4,
          title: "Kalapokhri to Sandakphu",
          morning: "Steady climb to the highest ridge hut.",
          afternoon:
            "Panorama of Everest, Kanchenjunga, Lhotse, and Makalu on a clear afternoon.",
          evening: "Sunset ridge walk. Overnight Sandakphu.",
        },
        {
          dayNumber: 5,
          title: "Sandakphu to Phalut · return",
          morning:
            "Long day to Phalut summit hut for wider Kanchenjunga face views.",
          afternoon: "Descend to Gorkey or Sandakphu for night.",
          evening: "Lodge or camp as weather dictates.",
        },
        {
          dayNumber: 6,
          title: "Descend · Bagdogra",
          morning: "Trek down to Manebhanjang; vehicle to Bagdogra.",
          afternoon: "Tour ends at airport or station.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why this ridge:</strong> teahouse comfort with real summit views — no alpine climbing skills required.</p>",
        "<p><strong>Stays:</strong> basic Singalila lodges (shared bathrooms). One camp night only if snow blocks huts.</p>",
        "<p><strong>Best window:</strong> October–November and March–April for visibility.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 13999, currency: "INR", discounts: [] },
    details: trekDetails(
      [
        {
          title: "Are Singalila lodges comfortable?",
          content:
            "They are clean trekker lodges, not hotels — thin walls, shared toilets, hearty meals. That is the charm of the skyline walk.",
        },
      ],
      ["Singalila National Park entry", "Lodge bed nights on ridge as listed"],
      ["Personal sleeping bag liner (recommended)"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Sandakphu Phalut Trek | 5N/6D Singalila Ridge",
      seoDescription:
        "Sandakphu–Phalut trek — Everest and Kanchenjunga views, teahouse nights. From ₹13,999 pp.",
      facebookTitle: "Sandakphu–Phalut — Singalila skyline",
      facebookDescription: "Moderate ridge trek with lodge nights.",
      twitterTitle: "Sandakphu Trek | 5N/6D",
      twitterDescription: "Singalila ridge · four giants. From ₹13,999 pp.",
      published: true,
    },
  },
  {
    slug: "beas-kund-trek",
    general: {
      title: "Beas Kund Trek",
      summary:
        "Short alpine trek above Solang — glacier source of the Beas, Dhundi meadows, and Manali buffer nights. From ₹8,499 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 4,
      durationNights: 3,
      durationUnit: "days",
      durationLabel: "3 nights / 4 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 12,
      minDayBeforeBooking: 5,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["manali", "himachal"],
      primaryDestinationSlug: "manali",
      address: "Manali bus stand or Bhuntar (KUU) airport pickup",
      mapLat: "32.2396",
      mapLng: "77.1887",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Arrive Manali · Solang orientation",
          morning: "Hotel check-in; slow walk in Old Manali or mall road.",
          afternoon: "Drive to Solang meadow for gear check and altitude chat.",
          evening: "MAP dinner; overnight Manali.",
        },
        {
          dayNumber: 2,
          title: "Solang to Dhundi · camp",
          morning: "Trek begins via the ATU road shoulder and shepherd trails.",
          afternoon: "Camp at Dhundi with Pir Panjal views.",
          evening: "Camp dinner under stars.",
        },
        {
          dayNumber: 3,
          title: "Dhundi to Beas Kund · return Solang",
          morning:
            "Early push to the glacial lake basin; turnaround time fixed by guide.",
          afternoon: "Descend to Solang; transfer to Manali hotel.",
          evening: "Overnight Manali.",
        },
        {
          dayNumber: 4,
          title: "Departure",
          morning: "Breakfast and drop Bhuntar airport or Volvo point.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Beas Kund:</strong> Manali’s classic weekend trek — big mountains without a week off work.</p>",
        "<p><strong>Stays:</strong> 2N Manali hotel · 1N alpine camp.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 8499, currency: "INR", discounts: [{ name: "Group of 6+", type: "percent", value: 5 }] },
    details: trekDetails(
      [
        {
          title: "Can beginners join Beas Kund?",
          content:
            "Yes with training hikes. Day 3 is long — we keep pace conservative and can shorten turnaround if monsoon clouds build.",
        },
      ],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Beas Kund Trek | 3N/4D from Manali",
      seoDescription: "Beas Kund glacier lake trek with Solang start, camp night, guide. From ₹8,499 pp.",
      facebookTitle: "Beas Kund Trek — Manali weekend",
      facebookDescription: "Short Pir Panjal trek with camp crew.",
      twitterTitle: "Beas Kund Trek | 3N/4D",
      twitterDescription: "Manali · Solang · glacial lake. From ₹8,499 pp.",
      published: true,
    },
  },
  {
    slug: "bhrigu-lake-trek",
    general: {
      title: "Bhrigu Lake Trek",
      summary:
        "High meadow lake at 4,300 m above Gulaba — two camp nights, Manali acclimatisation, and a summit ridge sunrise. From ₹9,499 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 4,
      durationNights: 3,
      durationUnit: "days",
      durationLabel: "3 nights / 4 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 12,
      minDayBeforeBooking: 5,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["manali", "himachal"],
      primaryDestinationSlug: "manali",
      mapLat: "32.2800",
      mapLng: "77.2100",
      mapZoom: 12,
      address: "Manali bus stand or Bhuntar (KUU) airport pickup",
      days: [
        {
          dayNumber: 1,
          title: "Manali arrival",
          morning: "Check in and rest after travel.",
          afternoon: "Visit Hadimba or Vashisht hot springs at easy pace.",
          evening: "Briefing; overnight Manali.",
        },
        {
          dayNumber: 2,
          title: "Gulaba to Rola Kholi camp",
          morning: "Drive to Gulaba trailhead; climb through birch to Rola Kholi.",
          afternoon: "Camp setup; hydration focus.",
          evening: "Camp night Rola Kholi.",
        },
        {
          dayNumber: 3,
          title: "Bhrigu Lake · descent",
          morning:
            "Sunrise start to the emerald lake; 360° view of Lahaul peaks when clear.",
          afternoon: "Descend to Gulaba; Manali hotel.",
          evening: "Overnight Manali.",
        },
        {
          dayNumber: 4,
          title: "Departure",
          morning: "Breakfast and airport/station drop.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Bhrigu:</strong> shorter than Hampta but still a real 4,300 m lake — ideal first high-altitude camp near Manali.</p>",
        "<p><strong>Monsoon note:</strong> we do not run mid-July to August — lightning risk on the ridge.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 9499, currency: "INR", discounts: [] },
    details: trekDetails(
      [
        {
          title: "Is Bhrigu harder than Beas Kund?",
          content: "Slightly — you sleep higher at Rola Kholi. Cardio fitness matters more than technical skill.",
        },
      ],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Bhrigu Lake Trek | 3N/4D Manali High-Altitude Lake",
      seoDescription: "Bhrigu Lake trek from Gulaba — camp nights, guide, meals. From ₹9,499 pp.",
      facebookTitle: "Bhrigu Lake Trek — Manali meadows",
      facebookDescription: "Moderate lake trek with sunrise ridge.",
      twitterTitle: "Bhrigu Lake Trek | 3N/4D",
      twitterDescription: "Gulaba · 4,300 m lake. From ₹9,499 pp.",
      published: true,
    },
  },
  {
    slug: "rupin-pass-trek",
    general: {
      title: "Rupin Pass Trek",
      summary:
        "Uttarakhand–Himachal crossover — hanging villages, snow bridges, and a 4,650 m pass exit into Sangla. From ₹22,999 a person (min. 2).",
      category: "Trekking",
      availability: "dates",
      durationDays: 8,
      durationNights: 7,
      durationUnit: "days",
      durationLabel: "7 nights / 8 days",
      difficulty: "difficult",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 14,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["uttarakhand", "himachal", "dehradun"],
      primaryDestinationSlug: "uttarakhand",
      address: "Dehradun pickup · drive toward Dhaula / Sewa village trailhead",
      mapLat: "31.0500",
      mapLng: "78.2500",
      mapZoom: 9,
      days: [
        {
          dayNumber: 1,
          title: "Dehradun · trailhead village",
          morning: "Long drive toward the Tons–Rupin confluence belt.",
          afternoon: "Village homestay; permit and ration sorting.",
          evening: "Overnight homestay.",
        },
        {
          dayNumber: 2,
          title: "Jhaka village · hanging trail",
          morning: "Enter the famed cliff-side village approach.",
          afternoon: "Camp below the Rupin gorge waterfalls.",
          evening: "Camp night.",
        },
        {
          dayNumber: 3,
          title: "Waterfall camp to upper meadows",
          morning: "Ladder and rope sections with guide assistance.",
          afternoon: "Snow patches possible even in June.",
          evening: "High meadow camp.",
        },
        {
          dayNumber: 4,
          title: "Acclimatisation at Dhanderas",
          morning: "Half-day explore or rest.",
          afternoon: "Skill check for pass day.",
          evening: "Overnight Dhanderas camp.",
        },
        {
          dayNumber: 5,
          title: "Rupin Pass crossing",
          morning: "Pre-dawn start; crampons may be issued on hard snow.",
          afternoon: "Descent into Sangla valley; camp on Himachal side.",
          evening: "Celebration dinner.",
        },
        {
          dayNumber: 6,
          title: "Sangla · roadhead",
          morning: "Trek to road; jeep toward Sangla town.",
          afternoon: "Hotel check-in; laundry.",
          evening: "MAP dinner Sangla.",
        },
        {
          dayNumber: 7,
          title: "Sangla buffer · Shimla belt",
          morning: "Scenic drive toward Shimla or Chandigarh drop belt.",
          afternoon: "Overnight transit hotel as quoted.",
          evening: "Rest.",
        },
        {
          dayNumber: 8,
          title: "Departure",
          morning: "Transfer to Chandigarh or Shimla station/airport.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Rupin:</strong> dramatic daily scenery changes — jungles, meadows, waterfalls, then a sharp pass day.</p>",
        "<p><strong>Grade:</strong> difficult; prior trek experience required. Exit in Himachal — plan flights from Chandigarh or Delhi.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 22999,
      currency: "INR",
      discounts: [{ name: "Group of 8", type: "percent", value: 6 }],
    },
    details: trekDetails(
      [
        {
          title: "Which side do we start Rupin Pass?",
          content:
            "We stage from the Uttarakhand approach (Dhaula/Sewa belt) and exit Sangla unless a reverse departure is advertised.",
        },
      ],
      ["Homestay night before trek", "Pony for kitchen loads"],
      ["Microspikes rental if leader advises"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Rupin Pass Trek | 7N/8D Crossover to Sangla",
      seoDescription:
        "Rupin Pass guided trek — waterfall camps, 4,650 m pass, Sangla exit. From ₹22,999 pp.",
      facebookTitle: "Rupin Pass Trek — Uttarakhand to Himachal",
      facebookDescription: "Difficult crossover with full camp crew.",
      twitterTitle: "Rupin Pass Trek | 7N/8D",
      twitterDescription: "Jhaka · pass · Sangla. From ₹22,999 pp.",
      published: true,
    },
  },
  {
    slug: "gaumukh-tapovan-trek",
    general: {
      title: "Gaumukh Tapovan Trek",
      summary:
        "Gangotri glacier snout and Tapovan meadows beneath Shivling — pilgrim road meets alpine camp trek. From ₹18,999 a person (min. 2).",
      category: "Trekking",
      availability: "dates",
      durationDays: 8,
      durationNights: 7,
      durationUnit: "days",
      durationLabel: "7 nights / 8 days",
      difficulty: "difficult",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 14,
      isFeatured: true,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["gangotri", "uttarakhand", "dehradun"],
      primaryDestinationSlug: "gangotri",
      address: "Dehradun / Haridwar pickup · drive toward Gangotri",
      mapLat: "30.9940",
      mapLng: "78.9390",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Haridwar · Uttarkashi",
          morning: "Drive along the Bhagirathi gorge with temple stops optional.",
          afternoon: "Uttarkashi hotel; permit briefing.",
          evening: "MAP dinner.",
        },
        {
          dayNumber: 2,
          title: "Uttarkashi to Gangotri",
          morning: "Scenic road day; check Gangotri temple timing.",
          afternoon: "Gangotri hotel or ashram-category stay.",
          evening: "Evening aarti optional.",
        },
        {
          dayNumber: 3,
          title: "Gangotri to Chirbasa",
          morning: "Trek beside the Bhagirathi; pine gives way to birch.",
          afternoon: "Camp Chirbasa.",
          evening: "Camp night.",
        },
        {
          dayNumber: 4,
          title: "Chirbasa to Bhojbasa",
          morning: "Gradual climb; Gaumukh permit checkpoint.",
          afternoon: "Bhojbasa GMVN belt camp.",
          evening: "Cold night prep.",
        },
        {
          dayNumber: 5,
          title: "Gaumukh snout · Tapovan",
          morning: "Walk to glacier terminus with guide (no unroped ice travel).",
          afternoon: "Ascent to Tapovan meadows — Shivling and Meru views.",
          evening: "Highest camp.",
        },
        {
          dayNumber: 6,
          title: "Tapovan rest or short explore",
          morning: "Meditation time or optional ridge stroll.",
          afternoon: "Begin descent to Bhojbasa if weather packed in.",
          evening: "Bhojbasa or Chirbasa camp.",
        },
        {
          dayNumber: 7,
          title: "Exit to Gangotri · Uttarkashi",
          morning: "Trek down; drive toward Uttarkashi.",
          afternoon: "Hotel recovery night.",
          evening: "Overnight Uttarkashi.",
        },
        {
          dayNumber: 8,
          title: "Return Haridwar / Dehradun",
          morning: "Breakfast and long drive to drop point.",
          afternoon: "Tour ends.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Tapovan:</strong> classic Garhwal spirituality plus serious mountain scenery — the meadow facing Shivling is a rite of passage.</p>",
        "<p><strong>Regulations:</strong> Gaumukh visits follow Forest Department daily caps; we file your slot before you pay balance.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 18999, currency: "INR", discounts: [] },
    details: trekDetails(
      [
        {
          title: "How close do we go to the Gaumukh ice?",
          content:
            "To the moraline and snout viewpoint with your guide — not technical glacier travel. Ice axe and crampons are not standard.",
        },
      ],
      ["Gaumukh permit and Gangotri entry coordination"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Gaumukh Tapovan Trek | 7N/8D Gangotri Glacier",
      seoDescription:
        "Gaumukh and Tapovan trek — Shivling views, glacier snout, camp crew. From ₹18,999 pp.",
      facebookTitle: "Gaumukh Tapovan — Gangotri glacier trek",
      facebookDescription: "Garhwal pilgrim trail with alpine camps.",
      twitterTitle: "Gaumukh Tapovan | 7N/8D",
      twitterDescription: "Gangotri · glacier · Tapovan. From ₹18,999 pp.",
      published: true,
    },
  },
  {
    slug: "spiti-bike-circuit",
    general: {
      title: "Spiti Bike Circuit",
      summary:
        "Manali loop — Kunzum, Kaza monasteries, Chandratal camp, and fossil villages on your own bike with backup SUV. From ₹27,999 a rider (min. 2 bikes).",
      category: "Adventure",
      availability: "dates",
      durationDays: 8,
      durationNights: 7,
      durationUnit: "days",
      durationLabel: "7 nights / 8 days",
      difficulty: "difficult",
      minPeople: 2,
      maxGroupSize: 8,
      minDayBeforeBooking: 21,
      isFeatured: true,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["manali", "spiti", "kaza", "himachal"],
      primaryDestinationSlug: "spiti",
      address: "Manali bus stand or Bhuntar (KUU) pickup",
      mapLat: "32.2250",
      mapLng: "78.0720",
      mapZoom: 9,
      days: [
        {
          dayNumber: 1,
          title: "Manali · bike handover",
          morning: "Meet trip captain; paperwork and bike allotment.",
          afternoon: "Short orientation ride; luggage to backup SUV.",
          evening: "Riding briefing; overnight Manali.",
        },
        {
          dayNumber: 2,
          title: "Manali to Kaza",
          morning:
            "Ride over Rohtang / Atal Tunnel approach and Kunzum axis (route per road status).",
          afternoon: "Kaza hotel check-in; slow walk in market.",
          evening: "MAP dinner; overnight Kaza.",
        },
        {
          dayNumber: 3,
          title: "Key · Kibber · Chicham loop",
          morning: "Ride to Key Monastery viewpoint.",
          afternoon: "Kibber and Chicham suspension bridge photo stops.",
          evening: "Overnight Kaza.",
        },
        {
          dayNumber: 4,
          title: "Komic · Hikkim · Langza",
          morning: "Highest village roads and fossil hunting.",
          afternoon: "Return Kaza; bike maintenance check.",
          evening: "Overnight Kaza.",
        },
        {
          dayNumber: 5,
          title: "Toward Chandratal",
          morning: "Ride toward the lake roadhead when open.",
          afternoon: "Camp near Chandratal or Batal fallback if lake road shut.",
          evening: "Camp meals; cold night.",
        },
        {
          dayNumber: 6,
          title: "Chandratal · Manali",
          morning: "Lake sunrise; long ride back over Kunzum.",
          afternoon: "Manali hotel; celebratory dinner.",
          evening: "Overnight Manali.",
        },
        {
          dayNumber: 7,
          title: "Manali buffer",
          morning: "Optional Solang ride or rest day.",
          afternoon: "Bike return inspection.",
          evening: "Overnight Manali.",
        },
        {
          dayNumber: 8,
          title: "Departure",
          morning: "Drop Bhuntar airport or Volvo point.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Spiti bike:</strong> monastery loops and high desert roads without riding all the way to Leh — tighter circuit, same hero highways.</p>",
        "<p><strong>Includes:</strong> bike, fuel on riding days, mechanic-equipped backup SUV, MAP hotels, Chandratal camp when road allows.</p>",
        "<p><strong>Season:</strong> July–September core window; June and October need extra landslide buffers.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 27999,
      currency: "INR",
      discounts: [{ name: "Solo pillion in SUV", type: "amount", value: 3000 }],
    },
    details: adventureDetails(
      [
        {
          title: "What if Chandratal road is closed?",
          content:
            "We pivot to Pin Valley or Dhankar morning and an extra Kaza night — no pretending the lake happened.",
        },
      ],
      [
        "Motorcycle rental with fuel on Spiti riding days",
        "Backup SUV with mechanic on Spiti highway days",
        "Trip captain / route lead",
      ],
      [
        "Bike damage deposit & riding insurance",
        "Gloves, jackets, or riding boots (rental on request)",
        "Chandratal camping if road closed (alternate day quoted)",
      ],
      ["Motorcycle rental", "Backup support vehicle"],
      [
        "Is motorcycle rental included on the Spiti bike circuit?",
        "Do I need prior high-altitude riding experience?",
        "Are flights included?",
      ],
      ["Altitude readiness", "Fitness", "Documents", "Weather & kit", "Arrival", "Rooms", "Money on the road"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Spiti Bike Circuit | 7N/8D Manali–Kaza Loop",
      seoDescription:
        "Spiti Valley motorcycle tour — Kunzum, Kaza, Chandratal, backup SUV. From ₹27,999 per rider.",
      facebookTitle: "Spiti Bike Circuit — high desert loop",
      facebookDescription: "Royal Enfield Spiti circuit with support crew.",
      twitterTitle: "Spiti Bike Circuit | 7N/8D",
      twitterDescription: "Manali · Kaza · Chandratal. From ₹27,999/rider.",
      published: true,
    },
  },
  {
    slug: "rishikesh-white-water-rafting-package",
    general: {
      title: "Rishikesh White Water Rafting Package",
      summary:
        "Two rafting days on the Ganga (Grade II–III), riverside camp or hotel, and Rishikesh aarti — adventure without a long trek. From ₹6,999 a person (min. 2).",
      category: "Adventure",
      availability: "always",
      durationDays: 3,
      durationNights: 2,
      durationUnit: "days",
      durationLabel: "2 nights / 3 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 16,
      minDayBeforeBooking: 3,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["rishikesh", "haridwar", "uttarakhand"],
      primaryDestinationSlug: "rishikesh",
      address: "Haridwar / Dehradun / Rishikesh railway or Jolly Grant (DED) pickup",
      mapLat: "30.0869",
      mapLng: "78.2676",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Arrive Rishikesh · safety briefing",
          morning: "Pickup and hotel or camp check-in near Shivpuri belt.",
          afternoon: "Rafting safety classroom — paddle commands, swim position, rescue drill.",
          evening: "Ganga aarti at Parmarth or Triveni (timing seasonal). Overnight Rishikesh.",
        },
        {
          dayNumber: 2,
          title: "Full rafting day",
          morning:
            "Put-in at operator-approved stretch (Marine Drive to Rishikesh or Shivpuri sector per water level).",
          afternoon: "Riverside lunch; optional cliff jump where guide allows.",
          evening: "Campfire rules per forest notice; overnight camp or hotel.",
        },
        {
          dayNumber: 3,
          title: "Short raft or leisure · departure",
          morning:
            "Second shorter paddle or kayaking add-on (if booked). Checkout.",
          afternoon: "Drop Haridwar station, Dehradun, or Jolly Grant airport.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why this package:</strong> licensed operator, vetted gear, and two water days — not a single one-hour joyride tacked onto a yoga retreat.</p>",
        "<p><strong>Monsoon:</strong> we pause departures when the river board suspends commercial rafting.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 6999, currency: "INR", discounts: [{ name: "Family of 5+", type: "percent", value: 5 }] },
    details: adventureDetails(
      [
        {
          title: "Can children raft?",
          content:
            "Usually ages 12+ on Grade II–III with a parent in the raft. Younger kids can sit out for a riverside day — tell us ages upfront.",
        },
      ],
      [
        "Ganga rafting stretch (grade II–III) with safety crew",
        "Rafting equipment (helmet, life jacket, paddle)",
      ],
      ["GoPro or video packages", "Kayaking private lessons"],
      ["Rafting operator coordination"],
      [
        "Which Ganga stretch do we raft near Rishikesh?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      [...adventureBeforeYouGo, "Rafting & water safety"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Rishikesh Rafting Package | 2N/3D Ganga Rapids",
      seoDescription:
        "Rishikesh white water rafting — Grade II–III, safety crew, camp night. From ₹6,999 pp.",
      facebookTitle: "Rishikesh Rafting — two-day Ganga package",
      facebookDescription: "Rafting, briefing, and aarti evening.",
      twitterTitle: "Rishikesh Rafting | 2N/3D",
      twitterDescription: "Ganga rapids · camp. From ₹6,999 pp.",
      published: true,
    },
  },
  {
    slug: "bir-billing-paragliding-tour",
    general: {
      title: "Bir Billing Paragliding Tour",
      summary:
        "Tandem flight from Asia’s famous take-off, monastery afternoons in Bir, and billing ridge sunsets. From ₹11,999 a person (min. 2).",
      category: "Adventure",
      availability: "dates",
      durationDays: 3,
      durationNights: 2,
      durationUnit: "days",
      durationLabel: "2 nights / 3 days",
      difficulty: "easy",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 5,
      isFeatured: true,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["bir-billing", "himachal"],
      primaryDestinationSlug: "bir-billing",
      address: "Pathankot / Dharamshala airport (DHM) pickup · transfer to Bir",
      mapLat: "32.0450",
      mapLng: "76.7210",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Arrive Bir · Tibetan colony",
          morning: "Drive into Kangra valley; check in at Bir guest house.",
          afternoon: "Walk the monastery lane; chai at colonie cafes.",
          evening: "Weather briefing for Billing. Overnight Bir.",
        },
        {
          dayNumber: 2,
          title: "Billing tandem flight day",
          morning:
            "Jeep to Billing take-off (1,600+ m). Tandem flight with licensed pilot when thermals stable.",
          afternoon: "Landing at Chaugan; optional cafe hops or tea estate walk.",
          evening: "Backup slot held tomorrow if today is grounded.",
        },
        {
          dayNumber: 3,
          title: "Departure or second flight buffer",
          morning: "Unused tandem slot window or departure drive toward Dharamshala / Pathankot.",
          afternoon: "Drop airport or station.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Bir Billing:</strong> reliable tandem infrastructure and long ridge flights when weather cooperates.</p>",
        "<p><strong>Weight & health:</strong> share body weight and cardiac history in the request — pilots assign equipment accordingly.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 11999, currency: "INR", discounts: [] },
    details: adventureDetails(
      [
        {
          title: "Is video of the flight included?",
          content: "GoPro wrist or pilot camera is an optional add-on paid to the operator — not in base price.",
        },
      ],
      [
        "Tandem paragliding flight from Billing take-off",
        "Jeep Billing ↔ landing site",
      ],
      ["Second tandem flight (if first day weathered out counts as your slot)", "GoPro footage"],
      ["Paragliding slot coordination"],
      [
        "Is Bir Billing paragliding weather-dependent?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      [...adventureBeforeYouGo, "Paragliding weight & weather"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Bir Billing Paragliding Tour | 2N/3D Tandem Flight",
      seoDescription:
        "Bir Billing paragliding package — tandem flight, Bir stay, jeep to Billing. From ₹11,999 pp.",
      facebookTitle: "Bir Billing Paragliding — tandem package",
      facebookDescription: "Kangra valley stay with Billing flight slot.",
      twitterTitle: "Bir Billing Paragliding | 2N/3D",
      twitterDescription: "Tandem flight · Bir colony. From ₹11,999 pp.",
      published: true,
    },
  },
  {
    slug: "gulmarg-skiing-holiday",
    general: {
      title: "Gulmarg Skiing Holiday",
      summary:
        "Four snow days on the meadow and gondola — lessons, kit hire, Srinagar transfers, and apres-kahwa. From ₹16,499 a person (min. 2).",
      category: "Adventure",
      availability: "dates",
      durationDays: 5,
      durationNights: 4,
      durationUnit: "days",
      durationLabel: "4 nights / 5 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 10,
      isFeatured: true,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "srinagar", "gulmarg"],
      primaryDestinationSlug: "gulmarg",
      address: "Srinagar Airport (SXR) pickup",
      mapLat: "34.0484",
      mapLng: "74.3805",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · Gulmarg",
          morning: "Airport pickup via Tangmarg.",
          afternoon: "Ski hire fitting; gondola status check.",
          evening: "MAP dinner Gulmarg.",
        },
        {
          dayNumber: 2,
          title: "Lesson day 1",
          morning: "Beginner or refresher group lesson on nursery slopes.",
          afternoon: "Free practice or Phase I gondola sighting ride (tickets extra).",
          evening: "Overnight Gulmarg.",
        },
        {
          dayNumber: 3,
          title: "Lesson day 2 · meadow practice",
          morning: "Second lesson block or skills consolidation.",
          afternoon: "Optional Kongdori ridge walk if lifts closed.",
          evening: "Overnight Gulmarg.",
        },
        {
          dayNumber: 4,
          title: "Free ski day",
          morning: "Self-paced runs with guide on call for orientation.",
          afternoon: "Hot chocolate break; shopping for woolens.",
          evening: "Overnight Gulmarg.",
        },
        {
          dayNumber: 5,
          title: "Return Srinagar Airport",
          morning: "Breakfast; checkout with snow buffer for flights.",
          afternoon: "Tour ends at airport.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why this holiday:</strong> more snow time than a beginner weekender — four nights on the meadow for real muscle memory.</p>",
        "<p><strong>Not included:</strong> gondola tickets beyond lesson access; we quote live rates before you pay.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 16499,
      currency: "INR",
      discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
    },
    details: adventureDetails(
      [
        {
          title: "How does this differ from the Gulmarg Beginner Ski Package?",
          content:
            "This holiday adds a free ski day and longer stay — better if you want practice after lessons, not just one lesson block.",
        },
      ],
      [
        "Ski/snowboard kit hire for lesson days",
        "1 beginner ski lesson (group) per quoted ski day",
        "Airport pickup & drop Srinagar",
      ],
      [
        "Gulmarg Gondola tickets beyond quoted access",
        "Extra private ski coach hours",
      ],
      ["Ski lesson arrangement", "Ski kit hire desk"],
      [
        "When is Gulmarg skiing season?",
        "Do I need prior skiing experience?",
        "Are flights included?",
      ],
      [...adventureBeforeYouGo, "Winter kit (ski / snow treks)"],
      ["Adventure", "Winter Sports", "Private / Independent"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Gulmarg Skiing Holiday | 4N/5D Winter Snow Package",
      seoDescription:
        "Gulmarg ski holiday — lessons, kit hire, Srinagar transfers. From ₹16,499 pp.",
      facebookTitle: "Gulmarg Skiing Holiday — 4 snow days",
      facebookDescription: "Meadow lessons and free ski day.",
      twitterTitle: "Gulmarg Ski Holiday | 4N/5D",
      twitterDescription: "Lessons · gondola views. From ₹16,499 pp.",
      published: true,
    },
  },
  {
    slug: "auli-skiing-winter-package",
    general: {
      title: "Auli Skiing Winter Package",
      summary:
        "Joshimath gateway, GMVN slopes, chairlift mornings, and beginner lessons facing Nanda Devi. From ₹13,999 a person (min. 2).",
      category: "Adventure",
      availability: "dates",
      durationDays: 4,
      durationNights: 3,
      durationUnit: "days",
      durationLabel: "3 nights / 4 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 12,
      minDayBeforeBooking: 7,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["auli", "joshimath", "uttarakhand"],
      primaryDestinationSlug: "auli",
      address: "Haridwar / Rishikesh / Dehradun pickup · drive to Joshimath",
      mapLat: "30.5360",
      mapLng: "79.5690",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Haridwar belt · Joshimath",
          morning: "Scenic drive along Alaknanda.",
          afternoon: "Joshimath hotel; ski hire sizing.",
          evening: "MAP dinner.",
        },
        {
          dayNumber: 2,
          title: "Joshimath to Auli · lesson",
          morning: "Cable car or road to Auli slopes.",
          afternoon: "Beginner lesson on nursery runs.",
          evening: "Return Joshimath or cliff-top property if booked upgrade.",
        },
        {
          dayNumber: 3,
          title: "Second ski day",
          morning: "Lesson or practice on groomed runs.",
          afternoon: "Panoramic Nanda Devi view walk if whiteout.",
          evening: "Overnight Joshimath/Auli belt.",
        },
        {
          dayNumber: 4,
          title: "Return Haridwar / Dehradun",
          morning: "Breakfast; long drive to drop.",
          afternoon: "Tour ends.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Auli:</strong> gentler learning curve than Gulmarg — chairlift nursery and family-friendly GMVN culture.</p>",
        "<p><strong>Lift tickets:</strong> GMVN gondola/chair charges are excluded so you can buy single-day passes as needed.</p>",
      ].join(""),
    },
    pricing: { priceFrom: 13999, currency: "INR", discounts: [] },
    details: adventureDetails(
      [
        {
          title: "How is Auli different from Gulmarg for skiing?",
          content:
            "Auli is a GMVN-led slope above Joshimath with chairlift access and gentler nursery runs — better for families learning basics. Gulmarg has deeper powder culture and higher gondola terrain.",
        },
      ],
      [
        "Ski/snowboard kit hire for lesson days",
        "1 beginner ski lesson (group) per quoted ski day",
        "Joshimath–Auli transfers on ski days",
      ],
      ["Auli chairlift / GMVN lift tickets", "Cliff-top Auli resort upgrade"],
      ["Ski lesson arrangement", "Ski kit hire desk"],
      [
        "How is Auli different from Gulmarg for skiing?",
        "Do I need prior skiing experience?",
        "Are flights included?",
      ],
      [...adventureBeforeYouGo, "Winter kit (ski / snow treks)"],
      ["Adventure", "Winter Sports", "Family Friendly", "Private / Independent"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Auli Skiing Package | 3N/4D Joshimath Winter",
      seoDescription:
        "Auli ski package — GMVN slopes, lessons, Joshimath stay. From ₹13,999 pp.",
      facebookTitle: "Auli Skiing Winter Package",
      facebookDescription: "Beginner slopes with Nanda Devi views.",
      twitterTitle: "Auli Skiing | 3N/4D",
      twitterDescription: "Joshimath · Auli lessons. From ₹13,999 pp.",
      published: true,
    },
  },
  {
    slug: "scuba-diving-andaman-package",
    general: {
      title: "Scuba Diving Andaman Package",
      summary:
        "Port Blair arrival, Havelock base, two supervised dives with a certified centre, and Radhanagar beach downtime. From ₹24,999 a person (min. 2).",
      category: "Adventure",
      availability: "always",
      durationDays: 5,
      durationNights: 4,
      durationUnit: "days",
      durationLabel: "4 nights / 5 days",
      difficulty: "easy",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 7,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["andaman"],
      primaryDestinationSlug: "andaman",
      address: "Veer Savarkar International Airport (IXZ) Port Blair pickup",
      mapLat: "11.6234",
      mapLng: "92.7265",
      mapZoom: 10,
      days: [
        {
          dayNumber: 1,
          title: "Port Blair arrival",
          morning: "Airport meet; cellular SIM and ferry briefing.",
          afternoon: "Cellular Jail or Corbyn’s Cove optional at easy pace.",
          evening: "Overnight Port Blair.",
        },
        {
          dayNumber: 2,
          title: "Ferry to Havelock",
          morning: "Government or private ferry to Swaraj Dweep.",
          afternoon: "Beach walk; dive centre paperwork and medical form.",
          evening: "Overnight Havelock.",
        },
        {
          dayNumber: 3,
          title: "Dive day 1",
          morning: "Pool/confined water skills refresh.",
          afternoon: "Boat dive #1 with instructor (Discover Scuba or fun dive).",
          evening: "Debrief and logbook entry.",
        },
        {
          dayNumber: 4,
          title: "Dive day 2 · Radhanagar",
          morning: "Boat dive #2 at approved reef site.",
          afternoon: "Radhanagar beach swim; return ferry planning.",
          evening: "Overnight Havelock or Port Blair per ferry.",
        },
        {
          dayNumber: 5,
          title: "Return Port Blair · departure",
          morning: "Ferry if overnighted Havelock; airport buffer.",
          afternoon: "Tour ends IXZ.",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Andaman:</strong> warm water, visible reef fish, and regulated dive centres — easier first ocean dive than many mainland options.</p>",
        "<p><strong>Medical:</strong> asthma, pregnancy, or recent surgery usually disqualifies — confirm before flights.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 24999,
      currency: "INR",
      discounts: [{ name: "Certified diver fun-dive swap", type: "amount", value: 2000 }],
    },
    details: adventureDetails(
      [
        {
          title: "Do I need PADI certification for Andaman scuba?",
          content:
            "No for the introductory package — you get a Discover Scuba-style supervised dive with an instructor. Certified divers can swap in fun dives on request (price adjusted).",
        },
      ],
      [
        "Open-water scuba dives with instructor (certified centre)",
        "Ferry Port Blair ↔ Havelock (standard class as quoted)",
        "Dive equipment rental on dive days",
      ],
      ["Scuba medical form & marine park fees (paid locally)", "Camera rental underwater"],
      ["Dive centre coordination"],
      [
        "Do I need PADI certification for Andaman scuba?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      [...adventureBeforeYouGo, "Scuba medical clearance"],
    ),
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Scuba Diving Andaman Package | 4N/5D Havelock",
      seoDescription:
        "Andaman scuba package — two instructor dives, Havelock stay, ferries. From ₹24,999 pp.",
      facebookTitle: "Andaman Scuba Diving Package",
      facebookDescription: "Havelock dives with certified centre.",
      twitterTitle: "Andaman Scuba | 4N/5D",
      twitterDescription: "Port Blair · Havelock · 2 dives. From ₹24,999 pp.",
      published: true,
    },
  },
];
