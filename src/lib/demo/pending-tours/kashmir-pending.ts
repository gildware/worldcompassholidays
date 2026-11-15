/**
 * Pending Kashmir trekking tours — locked format, media deferred.
 * Batch: Nafran, Bodpathri, Warwan, Gurez trek, Gangabal, Kolahoi, Kounsarnag,
 * Thajiwas, Lidderwat, Alpather, Marchoi.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

const noImages = {
  banner: null,
  cover: null,
  gallery: [] as string[],
  seoImage: null,
};

export const kashmirPendingCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Adventure" },
  { kind: "style", title: "Trekking & Camping" },
  { kind: "style", title: "Offbeat / Frontier" },
  { kind: "facility", title: "Trek guide and cook team" },
  { kind: "facility", title: "Licensed trek guide" },
  { kind: "facility", title: "Camping equipment" },
  {
    kind: "include",
    title: "Camping equipment (tent, sleeping bag, mat)",
  },
  {
    kind: "include",
    title: "Trek guide and camp meals on trail",
  },
  {
    kind: "include",
    title: "Licensed trek guide & camp support crew",
  },
  {
    kind: "include",
    title: "Meals on trek days (B/L/D as per itinerary)",
  },
  {
    kind: "include",
    title: "Pony for communal kitchen & camp gear",
  },
  {
    kind: "include",
    title: "Inner-line permit assistance (Gurez / Warwan sector)",
  },
  {
    kind: "exclude",
    title: "Personal trekking poles, gaiters, or mountaineering kit",
  },
  { kind: "exclude", title: "Pony hire for personal baggage" },
  { kind: "exclude", title: "Gulmarg Gondola tickets (Alpather add-on)" },
  {
    kind: "exclude",
    title: "Tips for trek guide, cook, and pony handler",
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
    title: "Winter snow travel",
    content:
      "Microspikes or crampons may be needed on hard snow. We advise what to rent locally for Marchoi or late-season walks — never borrow ill-fitting crampons.",
  },
  {
    kind: "faq",
    title: "What camping gear is provided?",
    content:
      "Tents, sleeping bags with liners, foam mats, and a cook tent on multi-night departures are included. Bring your own torch, blister kit, and a bag rated to about 0 °C on pass nights.",
  },
  {
    kind: "before_you_go",
    title: "Frontier connectivity",
    content:
      "Phone data can be patchy beyond Bandipora. Download offline maps and share your hotel numbers with family before Razdan or Warwan road days.",
  },
  {
    kind: "faq",
    title: "How does this compare to the Kashmir Great Lakes trek?",
    content:
      "Nafran crosses similar alpine country east of Sonamarg with fewer crowds. It is shorter than the full KGL loop but still a multi-camp itinerary — not a weekend stroll.",
  },
  {
    kind: "faq",
    title: "Where is Bodpathri and how long do we camp?",
    content:
      "Bodpathri sits in the meadow–lake belt behind Doodhpathri. Most departures use one trailhead camp and one high meadow camp before looping back — exact nights depend on snowmelt.",
  },
  {
    kind: "faq",
    title: "Is Warwan Valley open year-round?",
    content:
      "No. Warwan is a summer–early autumn trek when the pass trails are snow-free. We confirm road and village access with our Ganderbal crew before you pay.",
  },
  {
    kind: "faq",
    title: "Do I need permits for trekking in Gurez?",
    content:
      "Indian nationals usually need valid photo ID; additional permits can apply for certain ridges. We file whatever is current for your dates and share status before payment.",
  },
  {
    kind: "faq",
    title: "What is the Gangabal–Naranag trek grade?",
    content:
      "Classic moderate: steady climbs, one camp at Trunkhol or Gangabal side, and a long descent day on stone steps to Naranag. Reasonable cardio fitness is enough — no climbing skills required.",
  },
  {
    kind: "faq",
    title: "How close does Kolahoi Glacier trek go to the ice?",
    content:
      "You reach the snout moraine and ice apron with your guide — not technical glacier travel. Crampons are not standard; the hard days are distance and altitude, not ropes.",
  },
  {
    kind: "faq",
    title: "Where is Kounsarnag Lake and how remote is the camp?",
    content:
      "Kounsarnag sits in south Kashmir’s Pir Panjal grasslands above Reasi / Aharbal approaches. Expect two camp nights away from mains electricity.",
  },
  {
    kind: "faq",
    title: "Can Thajiwas Glacier be done as a day trip from Srinagar?",
    content:
      "Yes on a long summer day, but we recommend one Sonamarg night for weather buffer. Pony to the glacier tongue is optional and paid locally.",
  },
  {
    kind: "faq",
    title: "Is Aru–Lidderwat suitable for families?",
    content:
      "Fit older children and teens manage the meadow walk; it is not a stroller path. Horses can shorten the return if little legs tire.",
  },
  {
    kind: "faq",
    title: "Do I need the Gulmarg Gondola for Alpather Lake?",
    content:
      "Most hikers ride Phase 1 (and often Phase 2) to save legs, then walk the ridge bowl to Alpather. Gondola tickets are excluded so you can choose one-way or walk-up options.",
  },
  {
    kind: "faq",
    title: "When does Marchoi Valley winter trek run?",
    content:
      "Typically January–March when the Naranag road is open and snow is firm enough for a snow-shoe day. Dates shift with avalanche risk — we confirm a week before start.",
  },
];

const treksSharedIncludes = [
  "Airport pickup & drop",
  "Driver allowance, tolls & parking",
  "GST as quoted",
  "Meet-and-greet at Srinagar Airport",
  "Camping equipment (tent, sleeping bag, mat)",
  "Trek guide and camp meals on trail",
];

const treksSharedExcludes = [
  "Flights / trains to starting point",
  "Lunch (unless listed)",
  "Tips & personal expenses",
  "Travel insurance",
  "Pony hire for personal baggage",
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

export const kashmirPendingTours: TourFormat[] = [
  {
    slug: "nafran-valley-trek",
    general: {
      title: "Nafran Valley Trek",
      summary:
        "Sonamarg-side alternative to the Great Lakes — alpine passes, trout streams, and meadow camps without the KGL crowds. Guided multi-camp trek from ₹24,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 7,
      durationNights: 6,
      durationUnit: "days",
      durationLabel: "6 nights / 7 days",
      difficulty: "difficult",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 14,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "sonamarg", "srinagar"],
      primaryDestinationSlug: "sonamarg",
      address: "Srinagar Airport (SXR) pickup",
      mapLat: "34.3032",
      mapLng: "75.2920",
      mapZoom: 10,
      days: [
        {
          dayNumber: 1,
          title: "Arrive · Sonamarg acclimatisation",
          morning:
            "Airport pickup and drive to Sonamarg. Meet trek lead; distribute shared kit and review Nafran route map.",
          afternoon:
            "Short walk along the Sindh for altitude pacing. Gear check — no cotton for trail days.",
          evening: "MAP dinner and hotel night in Sonamarg.",
        },
        {
          dayNumber: 2,
          title: "Drive trailhead · first camp",
          morning:
            "Jeep to the last motorable point toward Nafran. Porter and pony load commences; trekkers walk with day packs.",
          afternoon:
            "Ascent through birch and boulder field to the first meadow camp. Camp kitchen sets hot tea and dinner.",
          evening: "Overnight tents at lower Nafran meadow.",
        },
        {
          dayNumber: 3,
          title: "Cross high ridge · lake bowl camp",
          morning:
            "Early start for the pass approach — steady switchbacks with views back to Thajiwas range.",
          afternoon:
            "Drop into the inner valley and camp near a snow-fed lake. Photography hour before dinner.",
          evening: "Camp night — cold possible even in July; sleep with hat ready.",
        },
        {
          dayNumber: 4,
          title: "Exploration day · optional summit walk",
          morning:
            "Half-day walk to a viewpoint knoll above camp. Those feeling strong can push higher with the guide.",
          afternoon:
            "Return to camp for rest, laundry in stream if weather allows, and card games in the dining tent.",
          evening: "Second night at lake bowl camp.",
        },
        {
          dayNumber: 5,
          title: "Descent line · riverside camp",
          morning:
            "Break camp and descend along the Nafran stream, crossing side brooks with guide assistance.",
          afternoon:
            "New camp on grassy benches above the river — shorter day to spare legs for the exit.",
          evening: "Campfire rules per forest advisory; overnight riverside.",
        },
        {
          dayNumber: 6,
          title: "Exit to road · Sonamarg recovery",
          morning:
            "Final trek to the pickup point. Jeep to Sonamarg; hot shower at hotel.",
          afternoon:
            "Free time — no long drives. Celebrate with kahwa on the market strip.",
          evening: "MAP dinner and soft bed in Sonamarg.",
        },
        {
          dayNumber: 7,
          title: "Airport transfer",
          morning:
            "Breakfast and checkout. Srinagar Airport drop with three-hour buffer.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Nafran:</strong> photographers and repeat Kashmir visitors use it when KGL permits are full — raw alpine scenery with a tighter footprint.</p>",
        "<p><strong>Stays:</strong> 2N Sonamarg hotel · 4N trek camps · 1N Sonamarg. Twin share in hotels; two-person tents unless single tent requested (extra).</p>",
        "<p><strong>What you get:</strong> Airport transfers, MAP hotel meals, licensed guide, cook crew, ponies for kitchen loads, and all trail meals.</p>",
        "<p><strong>Grade:</strong> difficult — long pass days and camp chores. Prior multi-day trekking helps.</p>",
        "<p><strong>How to book:</strong> share your last trek and medical notes. Departure dates lock when the Sonamarg crew confirms pony hire.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 24999,
      currency: "INR",
      discounts: [{ name: "Group of 8 trekkers", type: "percent", value: 6 }],
    },
    details: {
      sharedFaqTitles: [
        "How does this compare to the Kashmir Great Lakes trek?",
        "What camping gear is provided?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [
        {
          title: "Can beginners join Nafran?",
          content:
            "Only if they have trained with loaded day hikes. We can suggest Bodpathri or Lidderwat for a gentler first Kashmir trek.",
        },
      ],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Licensed trek guide & camp support crew",
        "Meals on trek days (B/L/D as per itinerary)",
        "Pony for communal kitchen & camp gear",
      ],
      excludeTitles: [
        ...treksSharedExcludes,
        "Personal trekking poles, gaiters, or mountaineering kit",
        "Tips for trek guide, cook, and pony handler",
      ],
      beforeYouGoTitles: treksBeforeYouGo,
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Nafran Valley Trek | Sonamarg Alpine Alternative to KGL",
      seoDescription:
        "Request Nafran Valley — guided camp trek east of Sonamarg, meadows and lakes. Crew and kit included, from ₹24,999 pp.",
      facebookTitle: "Nafran Valley Trek — KGL-style meadows without the queue",
      facebookDescription:
        "6N/7D guided camp itinerary from Sonamarg. Airport transfers and trek meals included.",
      twitterTitle: "Nafran Valley Trek | 6N/7D",
      twitterDescription: "Sonamarg · multi-camp · guide included. From ₹24,999 pp.",
      published: true,
    },
  },
  {
    slug: "bodpathri-meadows-trek",
    general: {
      title: "Bodpathri Meadows Trek",
      summary:
        "Grass bowls and tarn lakes behind Doodhpathri — a mellow meadow trek with one high camp. Srinagar transfers and twin-share rate from ₹11,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
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
      destinationSlugs: ["kashmir", "doodhpathri", "srinagar"],
      primaryDestinationSlug: "doodhpathri",
      address: "Srinagar city / airport pickup",
      mapLat: "33.8536",
      mapLng: "74.5748",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · drive Doodhpathri",
          morning:
            "Pickup from airport or Boulevard hotel. Scenic drive via Khan Sahib into the Doodhpathri picnic belt.",
          afternoon:
            "Gentle meadow stroll; meet pony men and distribute shared camping kit.",
          evening: "Guesthouse or camp near Doodhpathri — MAP dinner.",
        },
        {
          dayNumber: 2,
          title: "Trek into Bodpathri bowl",
          morning:
            "After breakfast, foot trail climbs through pine to open grass. Packed lunch on the ridge.",
          afternoon:
            "Camp setup beside a shallow lake — time for barefoot wade if sun is warm.",
          evening: "Camp dinner and stargazing away from city glow.",
        },
        {
          dayNumber: 3,
          title: "Meadow loop · return to Doodhpathri",
          morning:
            "Sunrise photo walk around the tarn. Begin descent after brunch.",
          afternoon:
            "Reach Doodhpathri base; hot tea and vehicle to Srinagar.",
          evening: "Overnight Srinagar hotel — MAP meals.",
        },
        {
          dayNumber: 4,
          title: "Depart",
          morning: "Breakfast and airport transfer or city drop.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Bodpathri:</strong> pairs well with a Srinagar long weekend — green lakes without boarding a flight to Leh.</p>",
        "<p><strong>Stays:</strong> 1N Doodhpathri area · 1N trek camp · 1N Srinagar.</p>",
        "<p><strong>What you get:</strong> Transfers, MAP meals on hotel nights, guide, cook, tents, and trail food.</p>",
        "<p><strong>How to book:</strong> tell us if you want a Srinagar shikara add-on — we quote it separately.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 11999,
      currency: "INR",
      discounts: [{ name: "Monsoon shoulder", type: "percent", value: 4 }],
    },
    details: {
      sharedFaqTitles: [
        "Where is Bodpathri and how long do we camp?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Meals on trek days (B/L/D as per itinerary)",
      ],
      excludeTitles: treksSharedExcludes,
      beforeYouGoTitles: treksBeforeYouGo,
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Bodpathri Meadows Trek | Doodhpathri Lake Camp",
      seoDescription:
        "Bodpathri grassland trek behind Doodhpathri — 3N/4D with camp night and Srinagar transfers, from ₹11,999 pp.",
      facebookTitle: "Bodpathri Meadows Trek — lakes behind Doodhpathri",
      facebookDescription: "Moderate meadow trek with one camp night. Guide and kit included.",
      twitterTitle: "Bodpathri Meadows Trek | 3N/4D",
      twitterDescription: "Doodhpathri · meadow camp · from ₹11,999 pp.",
      published: true,
    },
  },
  {
    slug: "warwan-valley-trek",
    general: {
      title: "Warwan Valley Trek",
      summary:
        "Frontier trek from Kishtwar–Warwan into high Kashmir meadows — remote villages, long passes, small groups only. From ₹32,999 a person (min. 4).",
      category: "Trekking",
      availability: "dates",
      durationDays: 8,
      durationNights: 7,
      durationUnit: "days",
      durationLabel: "7 nights / 8 days",
      difficulty: "difficult",
      minPeople: 4,
      maxGroupSize: 8,
      minDayBeforeBooking: 21,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "srinagar"],
      primaryDestinationSlug: "kashmir",
      address: "Srinagar briefing · Warwan road entry as per season",
      mapLat: "33.9167",
      mapLng: "75.7500",
      mapZoom: 9,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · expedition briefing",
          morning:
            "Airport pickup. Permit copies, contingency numbers, and weight limits for ponies.",
          afternoon:
            "Stock trail snacks; optional Dal walk if arrival is early.",
          evening: "Srinagar hotel — early sleep before long road days.",
        },
        {
          dayNumber: 2,
          title: "Long drive toward Warwan belt",
          morning:
            "Pre-dawn departure on the Anantnag–Kishtwar axis. Multiple security and forest checks.",
          afternoon:
            "Reach a Warwan-side village guesthouse. Meet local pony contractors.",
          evening: "Village meal and bunk-style stay.",
        },
        {
          dayNumber: 3,
          title: "River trail · first high camp",
          morning:
            "Follow the Warwan nallah on a narrow path — sheer drops in places, guide sets pace.",
          afternoon:
            "Camp on a pasture used by Gujjar herders. Respect grazing boundaries.",
          evening: "Camp night — no fires if grass is dry.",
        },
        {
          dayNumber: 4,
          title: "Pass crossing day",
          morning:
            "Steep grind to the saddle; snow patches possible until August.",
          afternoon:
            "Descent to inner valley camp with snow peaks on the skyline.",
          evening: "Hot soup and early bed.",
        },
        {
          dayNumber: 5,
          title: "Valley traverse",
          morning:
            "Side-valley exploration or rest day depending on group energy.",
          afternoon:
            "Shift camp downstream to shorten the exit march.",
          evening: "Second camp in the inner Warwan bowl.",
        },
        {
          dayNumber: 6,
          title: "Exit march · roadhead",
          morning:
            "Long downhill to reconnect with the jeep track.",
          afternoon:
            "Bump out to Srinagar-direction road; overnight simple lodge.",
          evening: "Hot meal and debrief.",
        },
        {
          dayNumber: 7,
          title: "Return Srinagar",
          morning:
            "Full-day drive with photo stops at river gorges.",
          afternoon:
            "Check in Srinagar hotel; laundry and chai.",
          evening: "MAP dinner.",
        },
        {
          dayNumber: 8,
          title: "Airport",
          morning: "Transfer to SXR.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Warwan:</strong> for trekkers who have done Gangabal or Tarsar and want silence — not cable cars or market strips.</p>",
        "<p><strong>Logistics:</strong> minimum four guests so pony costs split fairly. Dates run mid-June–September when villages are stocked.</p>",
        "<p><strong>What you get:</strong> Srinagar bookends, village lodging, full camp crew, and Inner-line style permit filing where required.</p>",
        "<p><strong>How to book:</strong> we need passport-style ID scans two weeks ahead — routes can pause on security advisory.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 32999,
      currency: "INR",
      discounts: [],
    },
    details: {
      sharedFaqTitles: [
        "Is Warwan Valley open year-round?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [
        {
          title: "What if the pass is snow-blocked?",
          content:
            "We pivot to a lower valley loop with the same camp nights. No refund for weather, but we never push an unsafe pass.",
        },
      ],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Licensed trek guide & camp support crew",
        "Meals on trek days (B/L/D as per itinerary)",
        "Pony for communal kitchen & camp gear",
        "Inner-line permit assistance (Gurez / Warwan sector)",
      ],
      excludeTitles: [
        ...treksSharedExcludes,
        "Personal trekking poles, gaiters, or mountaineering kit",
        "Tips for trek guide, cook, and pony handler",
      ],
      beforeYouGoTitles: treksBeforeYouGo,
      travelStyleTitles: ["Adventure", "Trekking & Camping", "Offbeat / Frontier"],
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Warwan Valley Trek | Remote Kashmir Frontier Trek",
      seoDescription:
        "Warwan Valley guided trek — difficult 7N/8D itinerary with camp crew. From ₹32,999 pp, min. 4 guests.",
      facebookTitle: "Warwan Valley Trek — difficult frontier itinerary",
      facebookDescription: "Remote Warwan camps with licensed guides and ponies.",
      twitterTitle: "Warwan Valley Trek | 7N/8D",
      twitterDescription: "Frontier Kashmir trek · from ₹32,999 pp.",
      published: true,
    },
  },
  {
    slug: "gurez-valley-trek",
    general: {
      title: "Gurez Valley Trek",
      summary:
        "Short trek in the Kishanganga bowl — Razdan side paths, shepherd camps, and Dawar village nights. Easy–moderate 2–3 days on trail, from ₹13,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 5,
      durationNights: 4,
      durationUnit: "days",
      durationLabel: "4 nights / 5 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 10,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "gurez", "srinagar"],
      primaryDestinationSlug: "gurez",
      address: "Srinagar Airport pickup",
      mapLat: "34.5836",
      mapLng: "74.6425",
      mapZoom: 10,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · north road briefing",
          morning: "Airport meet. ID copies for Gurez sector filing.",
          afternoon: "Optional Mughal garden stop before early dinner.",
          evening: "Srinagar hotel.",
        },
        {
          dayNumber: 2,
          title: "Razdan Pass · Dawar",
          morning: "Climb Razdan with panorama halts.",
          afternoon: "Check in Dawar guesthouse; short stroll by the Kishanganga.",
          evening: "Village dinner.",
        },
        {
          dayNumber: 3,
          title: "Shepherd trail trek",
          morning:
            "Footpath above Dawar through potato fields into open ridge.",
          afternoon:
            "Packed lunch; optional camp or return to Dawar based on group.",
          evening: "Guesthouse or light camp.",
        },
        {
          dayNumber: 4,
          title: "Second ridge walk · descend to Bandipora road",
          morning: "Gentle summit for LOC-facing views (weather permitting).",
          afternoon: "Jeep toward Srinagar; stop Bandipora for kahwa.",
          evening: "Srinagar hotel.",
        },
        {
          dayNumber: 5,
          title: "Departure",
          morning: "Airport transfer.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why this trek:</strong> see Gurez on foot, not only from a cab window — suited to fit beginners with two walking days.</p>",
        "<p><strong>Stays:</strong> Srinagar and Dawar guesthouses; one optional camp night.</p>",
        "<p><strong>Permits:</strong> we track Gurez paperwork and tell you before payment if extra forms apply.</p>",
        "<p><strong>How to book:</strong> not the same as our Gurez–Keran driving explorer — this is trail-first.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 13999,
      currency: "INR",
      discounts: [{ name: "Couple trek", type: "percent", value: 3 }],
    },
    details: {
      sharedFaqTitles: [
        "Do I need permits for trekking in Gurez?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Licensed trek guide & camp support crew",
        "Inner-line permit assistance (Gurez / Warwan sector)",
      ],
      excludeTitles: treksSharedExcludes,
      beforeYouGoTitles: [...treksBeforeYouGo, "Frontier connectivity"],
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Gurez Valley Trek | 2–3 Day Kishanganga Walk",
      seoDescription:
        "Easy–moderate Gurez trekking with Dawar stays and ridge walks. From ₹13,999 pp with guide and permits help.",
      facebookTitle: "Gurez Valley Trek — walk the Kishanganga bowl",
      facebookDescription: "4N/5D Gurez trek with Razdan drive and shepherd trails.",
      twitterTitle: "Gurez Valley Trek | Easy–Mod",
      twitterDescription: "Gurez · ridge walks · from ₹13,999 pp.",
      published: true,
    },
  },
  {
    slug: "naranag-gangabal-trek",
    general: {
      title: "Naranag to Gangabal Trek",
      summary:
        "The classic Harmukh lake pilgrimage route — stone-step descent, Trunkhol camp, Gangabal shore. 4N/5D moderate trek from ₹14,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 5,
      durationNights: 4,
      durationUnit: "days",
      durationLabel: "4 nights / 5 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 10,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "naranag", "srinagar"],
      primaryDestinationSlug: "naranag",
      address: "Srinagar · Naranag road trailhead",
      mapLat: "34.4364",
      mapLng: "74.8817",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · drive Naranag",
          morning: "Pickup; drive via Kangan to ancient Naranag temple.",
          afternoon: "Acclimatisation walk; dinner with trek crew.",
          evening: "Guesthouse near trailhead.",
        },
        {
          dayNumber: 2,
          title: "Climb to Trunkhol camp",
          morning:
            "Steady ascent through meadow and birch. Horses available for bags (extra).",
          afternoon: "Camp beside Trunkhol with Harmukh views.",
          evening: "Camp night.",
        },
        {
          dayNumber: 3,
          title: "Gangabal Lake day",
          morning:
            "Walk to Gangabal and twin Nundkol shoreline; photography and packed lunch.",
          afternoon: "Return to Trunkhol for second camp night.",
          evening: "Stargaze if skies clear.",
        },
        {
          dayNumber: 4,
          title: "Long descent · Srinagar",
          morning:
            "Early start down the granite steps to Naranag — knees feel this day.",
          afternoon: "Jeep to Srinagar; hot shower.",
          evening: "MAP dinner in city.",
        },
        {
          dayNumber: 5,
          title: "Airport",
          morning: "Drop to SXR.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Gangabal:</strong> Kashmir’s most booked moderate trek — sacred lake, big mountain backdrop, doable in under a week.</p>",
        "<p><strong>Stays:</strong> 1N Naranag · 2N camp · 1N Srinagar.</p>",
        "<p><strong>What you get:</strong> Guide, cook, camping kit, MAP at hotels, transfers.</p>",
        "<p><strong>Tip:</strong> train calves before Day 4 descent — poles help on wet stone.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 14999,
      currency: "INR",
      discounts: [{ name: "September slot", type: "percent", value: 5 }],
    },
    details: {
      sharedFaqTitles: [
        "What is the Gangabal–Naranag trek grade?",
        "What camping gear is provided?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Meals on trek days (B/L/D as per itinerary)",
      ],
      excludeTitles: treksSharedExcludes,
      beforeYouGoTitles: treksBeforeYouGo,
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Naranag to Gangabal Trek | Classic Harmukh Lakes",
      seoDescription:
        "Gangabal trek from Naranag — 4N/5D with Trunkhol camp. Guide and gear from ₹14,999 pp.",
      facebookTitle: "Naranag–Gangabal Trek — Harmukh lake classic",
      facebookDescription: "Moderate 5-day trek with camp crew and Srinagar transfers.",
      twitterTitle: "Naranag Gangabal Trek | 4N/5D",
      twitterDescription: "Harmukh lakes · moderate trek · ₹14,999 pp.",
      published: true,
    },
  },
  {
    slug: "kolahoi-glacier-trek",
    general: {
      title: "Kolahoi Glacier Trek",
      summary:
        "Pahalgam–Aru approach to the Kolahoi ice snout — long valley days, high camp, and moraine walk. Hard 5N/6D trek from ₹19,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 6,
      durationNights: 5,
      durationUnit: "days",
      durationLabel: "5 nights / 6 days",
      difficulty: "difficult",
      minPeople: 2,
      maxGroupSize: 8,
      minDayBeforeBooking: 12,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "pahalgam", "aru-valley"],
      primaryDestinationSlug: "pahalgam",
      address: "Srinagar Airport · Pahalgam · Aru trailhead",
      mapLat: "34.0486",
      mapLng: "75.3145",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Arrive Pahalgam",
          morning: "SXR to Pahalgam via Bijbehara.",
          afternoon: "Trek briefing; rent poles locally if needed.",
          evening: "Hotel MAP.",
        },
        {
          dayNumber: 2,
          title: "Aru · Lidderwat",
          morning: "Drive Aru; trek into Lidderwat meadow.",
          afternoon: "Camp or hut stay with shepherd huts nearby.",
          evening: "Camp night.",
        },
        {
          dayNumber: 3,
          title: "Base camp below Kolahoi",
          morning: "Long climb along the Lidder branch.",
          afternoon: "High camp on moraine benches — cold air drainage.",
          evening: "Early sleep for glacier day.",
        },
        {
          dayNumber: 4,
          title: "Kolahoi Glacier approach",
          morning:
            "Guided walk to the ice snout viewpoint; no roped glacier travel.",
          afternoon: "Return to high camp; celebrate with ginger tea.",
          evening: "Camp.",
        },
        {
          dayNumber: 5,
          title: "Descend to Pahalgam",
          morning: "Fast downhill via Aru.",
          afternoon: "Hotel hot shower.",
          evening: "MAP dinner Pahalgam.",
        },
        {
          dayNumber: 6,
          title: "Airport",
          morning: "Srinagar drop.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Kolahoi:</strong> see the glacier that feeds the Lidder without mountaineering visas — hard trekking only.</p>",
        "<p><strong>Fitness:</strong> prior camp trekking recommended; days 3–4 are full daylight efforts.</p>",
        "<p><strong>What you get:</strong> Pahalgam hotel bookends, full camp service, ponies for kitchen.</p>",
        "<p><strong>How to book:</strong> disclose knee or ankle history — descent is relentless.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 19999,
      currency: "INR",
      discounts: [],
    },
    details: {
      sharedFaqTitles: [
        "How close does Kolahoi Glacier trek go to the ice?",
        "What camping gear is provided?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Licensed trek guide & camp support crew",
        "Meals on trek days (B/L/D as per itinerary)",
        "Pony for communal kitchen & camp gear",
      ],
      excludeTitles: [
        ...treksSharedExcludes,
        "Personal trekking poles, gaiters, or mountaineering kit",
      ],
      beforeYouGoTitles: treksBeforeYouGo,
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Kolahoi Glacier Trek | Hard Pahalgam Aru Route",
      seoDescription:
        "Kolahoi Glacier trek — 5N/6D from Aru with glacier snout day. From ₹19,999 pp, guide and camp included.",
      facebookTitle: "Kolahoi Glacier Trek — Lidder valley hard trek",
      facebookDescription: "Aru base · high camp · glacier viewpoint with crew.",
      twitterTitle: "Kolahoi Glacier Trek | 5N/6D",
      twitterDescription: "Pahalgam · Kolahoi · from ₹19,999 pp.",
      published: true,
    },
  },
  {
    slug: "kounsarnag-lake-trek",
    general: {
      title: "Kounsarnag Lake Trek",
      summary:
        "South Kashmir’s sacred alpine lake — meadow approaches, twin camp nights, Aharbal-side scenery. Moderate 5N/6D from ₹16,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 6,
      durationNights: 5,
      durationUnit: "days",
      durationLabel: "5 nights / 6 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 10,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "srinagar"],
      primaryDestinationSlug: "kashmir",
      address: "Srinagar pickup · Reasi / Aharbal approach road",
      mapLat: "33.5800",
      mapLng: "74.8500",
      mapZoom: 10,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · south road",
          morning: "Drive toward the Pir Panjal foothills with permit check.",
          afternoon: "Base village guesthouse; meet pony team.",
          evening: "Early dinner.",
        },
        {
          dayNumber: 2,
          title: "Forest belt · first camp",
          morning: "Climb through pine and rhododendron.",
          afternoon: "Meadow camp with stream nearby.",
          evening: "Camp night.",
        },
        {
          dayNumber: 3,
          title: "Kounsarnag Lake",
          morning: "Steady climb to the oval lake rim.",
          afternoon: "Circumambulate shore respectfully; lunch at lake.",
          evening: "Camp near lake or drop to lower camp.",
        },
        {
          dayNumber: 4,
          title: "Descent buffer day",
          morning: "Weather spare or ridge walk.",
          afternoon: "Trek to roadhead village.",
          evening: "Village stay.",
        },
        {
          dayNumber: 5,
          title: "Return Srinagar",
          morning: "Jeep via Aharbal waterfall viewpoint if road open.",
          afternoon: "Srinagar hotel.",
          evening: "MAP meal.",
        },
        {
          dayNumber: 6,
          title: "Airport",
          morning: "SXR transfer.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Kounsarnag:</strong> pilgrims and trekkers share this cobalt lake — fewer Pahalgam buses, more grassland quiet.</p>",
        "<p><strong>Respect:</strong> no swimming; follow guide cues at the shore.</p>",
        "<p><strong>What you get:</strong> South Kashmir approach logistics, camp crew, and Srinagar transfers.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 16999,
      currency: "INR",
      discounts: [{ name: "Group of 6", type: "percent", value: 5 }],
    },
    details: {
      sharedFaqTitles: [
        "Where is Kounsarnag Lake and how remote is the camp?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        ...treksSharedIncludes,
        "Meals on trek days (B/L/D as per itinerary)",
      ],
      excludeTitles: treksSharedExcludes,
      beforeYouGoTitles: treksBeforeYouGo,
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Kounsarnag Lake Trek | South Kashmir Alpine Lake",
      seoDescription:
        "Kounsarnag Lake trek with meadow camps — 5N/6D moderate. From ₹16,999 pp with guide and meals.",
      facebookTitle: "Kounsarnag Lake Trek — south Kashmir pilgrimage trail",
      facebookDescription: "Twin camp nights and lake day with full crew.",
      twitterTitle: "Kounsarnag Lake Trek | 5N/6D",
      twitterDescription: "South Kashmir lake trek · ₹16,999 pp.",
      published: true,
    },
  },
  {
    slug: "thajiwas-glacier-day-walk",
    general: {
      title: "Thajiwas Glacier Day Walk",
      summary:
        "Sonamarg’s easy glacier stroll — Sindh valley drive, optional pony, and Thajiwas ice tongue. 1N/2D or same-day from Srinagar from ₹4,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 2,
      durationNights: 1,
      durationUnit: "days",
      durationLabel: "1 night / 2 days",
      difficulty: "easy",
      minPeople: 2,
      maxGroupSize: 15,
      minDayBeforeBooking: 3,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "sonamarg", "srinagar"],
      primaryDestinationSlug: "sonamarg",
      address: "Srinagar pickup · Sonamarg Thajiwas road",
      mapLat: "34.3032",
      mapLng: "75.2920",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · Sonamarg · Thajiwas",
          morning:
            "Drive Sonamarg. Walk or pony toward Thajiwas glacier meadows — gentle grade.",
          afternoon:
            "Picnic lunch near ice tongue; return to Sonamarg market.",
          evening: "MAP dinner and overnight Sonamarg (or Srinagar if same-day variant requested).",
        },
        {
          dayNumber: 2,
          title: "Return",
          morning:
            "Breakfast; optional Sindh riverside photo stop. Airport or Srinagar drop.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Thajiwas:</strong> families and first-timers get glacier views without camping.</p>",
        "<p><strong>Optional:</strong> compress to a long day trip from Srinagar — we adjust price and meals.</p>",
        "<p><strong>Extras:</strong> pony to glacier paid locally; sled rides in shoulder snow at your cost.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 4999,
      currency: "INR",
      discounts: [{ name: "Same-day Srinagar return", type: "amount", value: 800 }],
    },
    details: {
      sharedFaqTitles: [
        "Can Thajiwas Glacier be done as a day trip from Srinagar?",
        "Is this a private or group tour?",
        "Are flights included?",
        "What extras are paid locally?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        "Airport pickup & drop",
        "Driver allowance, tolls & parking",
        "GST as quoted",
        "Licensed trek guide",
      ],
      excludeTitles: [
        "Flights / trains to starting point",
        "Lunch (unless listed)",
        "Tips & personal expenses",
        "Travel insurance",
        "Pony hire for personal baggage",
        "Anything not mentioned in includes",
      ],
      beforeYouGoTitles: [
        "Fitness",
        "Documents",
        "Weather & kit",
        "Arrival",
        "Rooms",
        "Money on the road",
      ],
      travelStyleTitles: ["Adventure", "Family Friendly", "Private / Independent"],
      facilityTitles: ["Private cab", "Airport transfers", "MAP meals (B/D)", "Licensed trek guide", "24×7 helpline"],
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Thajiwas Glacier Day Walk | Easy Sonamarg Trek",
      seoDescription:
        "Thajiwas Glacier walk from Sonamarg — 1N/2D easy trek with guide and cab, from ₹4,999 pp.",
      facebookTitle: "Thajiwas Glacier — easy Sonamarg day walk",
      facebookDescription: "Glacier meadow stroll with optional pony. Hotel night included.",
      twitterTitle: "Thajiwas Glacier Walk | 1N/2D",
      twitterDescription: "Sonamarg easy glacier walk · ₹4,999 pp.",
      published: true,
    },
  },
  {
    slug: "aru-lidderwat-day-trek",
    general: {
      title: "Aru to Lidderwat Day Trek",
      summary:
        "Pahalgam’s favourite day hike — Aru village start, Lidderwat shepherd meadows, back by evening. Guided 2D/1N from ₹6,499 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 2,
      durationNights: 1,
      durationUnit: "days",
      durationLabel: "1 night / 2 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 12,
      minDayBeforeBooking: 4,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "pahalgam", "aru-valley"],
      primaryDestinationSlug: "aru-valley",
      address: "Srinagar · Pahalgam · Aru gate",
      mapLat: "34.0700",
      mapLng: "75.2100",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Aru · Lidderwat · return Pahalgam",
          morning:
            "Drive Aru after brief Pahalgam stop. Trek into Lidderwat with packed lunch.",
          afternoon:
            "Meadow time; descend to Aru and jeep to Pahalgam hotel.",
          evening: "MAP dinner Pahalgam.",
        },
        {
          dayNumber: 2,
          title: "Departure",
          morning: "Breakfast; Srinagar airport drop.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Lidderwat:</strong> taste the Kolahoi valley without committing to glacier nights.</p>",
        "<p><strong>Pace:</strong> moderate — about 22 km round trip; horses on call for tired hikers.</p>",
        "<p><strong>What you get:</strong> Guide, packed trail lunch, Pahalgam hotel, transfers.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 6499,
      currency: "INR",
      discounts: [],
    },
    details: {
      sharedFaqTitles: [
        "Is Aru–Lidderwat suitable for families?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        "Airport pickup & drop",
        "Driver allowance, tolls & parking",
        "GST as quoted",
        "Licensed trek guide",
        "Meals on trek days (B/L/D as per itinerary)",
      ],
      excludeTitles: [
        "Flights / trains to starting point",
        "Tips & personal expenses",
        "Travel insurance",
        "Pony hire for personal baggage",
        "Anything not mentioned in includes",
      ],
      beforeYouGoTitles: ["Trek kit list", "Fitness", "Documents", "Weather & kit", "Money on the road"],
      travelStyleTitles: trekStyles,
      facilityTitles: ["Private cab", "Airport transfers", "MAP meals (B/D)", "Licensed trek guide", "24×7 helpline"],
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Aru to Lidderwat Day Trek | Pahalgam Meadow Hike",
      seoDescription:
        "Guided Aru–Lidderwat day trek with Pahalgam night — from ₹6,499 pp, min. 2.",
      facebookTitle: "Aru–Lidderwat day trek — Pahalgam meadows",
      facebookDescription: "Moderate day hike with guide and hotel bookend.",
      twitterTitle: "Aru Lidderwat Trek | 1N/2D",
      twitterDescription: "Pahalgam meadow day trek · ₹6,499 pp.",
      published: true,
    },
  },
  {
    slug: "alpather-lake-trek",
    general: {
      title: "Alpather Lake Trek (Gulmarg)",
      summary:
        "Frozen bowl above Gulmarg — gondola-assisted ridge walk to Alpather Lake. Summer day trek or 2D with Gulmarg night from ₹7,999 a person (min. 2).",
      category: "Trekking",
      availability: "always",
      durationDays: 3,
      durationNights: 2,
      durationUnit: "days",
      durationLabel: "2 nights / 3 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 10,
      minDayBeforeBooking: 5,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "gulmarg", "srinagar"],
      primaryDestinationSlug: "gulmarg",
      address: "Srinagar · Gulmarg Gondola base",
      mapLat: "34.0484",
      mapLng: "74.3805",
      mapZoom: 12,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · Gulmarg",
          morning: "Drive to Gulmarg; acclimatise on golf course walk.",
          afternoon: "Gear check for ridge day; gondola timings explained.",
          evening: "MAP dinner Gulmarg hotel.",
        },
        {
          dayNumber: 2,
          title: "Apharwat · Alpather Lake",
          morning:
            "Gondola to Kongdoori / Apharwat (tickets locally). Trek ridge trail to Alpather bowl.",
          afternoon:
            "Lake shore lunch; descend to Gulmarg on foot or gondola.",
          evening: "Second night Gulmarg.",
        },
        {
          dayNumber: 3,
          title: "Airport",
          morning: "Breakfast; Srinagar airport via Tangmarg.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Alpather:</strong> iconic Gulmarg day walk when lake is thawed — winter versions are snow-shoe specials (ask us).</p>",
        "<p><strong>Gondola:</strong> excluded so you can buy Phase 1 only or walk up if fit.</p>",
        "<p><strong>What you get:</strong> Guide for ridge navigation, Gulmarg MAP hotel, transfers.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 7999,
      currency: "INR",
      discounts: [{ name: "July monsoon slot", type: "percent", value: 4 }],
    },
    details: {
      sharedFaqTitles: [
        "Do I need the Gulmarg Gondola for Alpather Lake?",
        "What extras are paid locally?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        "Airport pickup & drop",
        "Driver allowance, tolls & parking",
        "GST as quoted",
        "Licensed trek guide",
      ],
      excludeTitles: [
        "Flights / trains to starting point",
        "Lunch (unless listed)",
        "Tips & personal expenses",
        "Travel insurance",
        "Gulmarg Gondola tickets (Alpather add-on)",
        "Anything not mentioned in includes",
      ],
      beforeYouGoTitles: ["Trek kit list", "Fitness", "Documents", "Weather & kit", "Arrival", "Rooms", "Money on the road"],
      travelStyleTitles: ["Adventure", "Hill Stations", "Private / Independent"],
      facilityTitles: ["Private cab", "Airport transfers", "MAP meals (B/D)", "Licensed trek guide", "24×7 helpline"],
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Alpather Lake Trek Gulmarg | Above Apharwat Ridge",
      seoDescription:
        "Alpather Lake trek from Gulmarg gondola — 2N/3D with guide. Gondola extra; package from ₹7,999 pp.",
      facebookTitle: "Alpather Lake Trek — Gulmarg ridge walk",
      facebookDescription: "Moderate lake day with Gulmarg hotel nights.",
      twitterTitle: "Alpather Lake Trek | 2N/3D",
      twitterDescription: "Gulmarg · Alpather · from ₹7,999 pp.",
      published: true,
    },
  },
  {
    slug: "marchoi-valley-winter-trek",
    general: {
      title: "Marchoi Valley Winter Trek",
      summary:
        "Snow-shoe day above Naranag — Marchoi meadows in white, bonfire hotel night. Seasonal Jan–Mar departure from ₹8,999 a person (min. 2).",
      category: "Trekking",
      availability: "dates",
      durationDays: 3,
      durationNights: 2,
      durationUnit: "days",
      durationLabel: "2 nights / 3 days",
      difficulty: "moderate",
      minPeople: 2,
      maxGroupSize: 8,
      minDayBeforeBooking: 7,
      isFeatured: false,
      youtubeUrl: "",
    },
    itinerary: {
      destinationSlugs: ["kashmir", "naranag", "srinagar"],
      primaryDestinationSlug: "naranag",
      address: "Srinagar · Naranag winter road",
      mapLat: "34.4364",
      mapLng: "74.8817",
      mapZoom: 11,
      days: [
        {
          dayNumber: 1,
          title: "Srinagar · Naranag",
          morning: "Drive Kangan–Naranag; check snow depth with guide.",
          afternoon: "Temple visit; issue snow gaiters and poles if rented.",
          evening: "Guesthouse with bukhari heat.",
        },
        {
          dayNumber: 2,
          title: "Marchoi Valley snow trek",
          morning:
            "Snow-shoe into Marchoi clearing — gentle ups and downs on powder.",
          afternoon:
            "Hot lunch in valley; return before light fades.",
          evening: "Celebration dinner Naranag.",
        },
        {
          dayNumber: 3,
          title: "Return Srinagar / airport",
          morning: "Jeep out; optional SXR drop same day.",
          afternoon: "",
          evening: "",
        },
      ],
    },
    content: {
      descriptionHtml: [
        "<p><strong>Why Marchoi:</strong> winter Kashmir without ski school prices — quiet snow fields above Naranag.</p>",
        "<p><strong>Season:</strong> fixed departures when avalanche bulletin is green; we may postpone with full reschedule offer.</p>",
        "<p><strong>Kit:</strong> layered clothing mandatory; microspike rental quoted separately if ice crust forms.</p>",
      ].join(""),
    },
    pricing: {
      priceFrom: 8999,
      currency: "INR",
      discounts: [],
    },
    details: {
      sharedFaqTitles: [
        "When does Marchoi Valley winter trek run?",
        "Is this a private or group tour?",
        "Are flights included?",
      ],
      extraFaqs: [
        {
          title: "Are snow shoes included?",
          content:
            "Yes for standard departures — tell us your boot size when booking. Damaged equipment is charged at cost.",
        },
      ],
      includeTitles: [
        "Accommodation as per itinerary (twin sharing)",
        "Breakfast + dinner at the hotel each night (MAP)",
        "Private vehicle for transfers & sightseeing",
        "Airport pickup & drop",
        "Driver allowance, tolls & parking",
        "GST as quoted",
        "Licensed trek guide",
        "Meals on trek days (B/L/D as per itinerary)",
      ],
      excludeTitles: [
        "Flights / trains to starting point",
        "Lunch (unless listed)",
        "Tips & personal expenses",
        "Travel insurance",
        "Personal trekking poles, gaiters, or mountaineering kit",
        "Anything not mentioned in includes",
      ],
      beforeYouGoTitles: [
        "Winter snow travel",
        "Trek kit list",
        "Fitness",
        "Documents",
        "Weather & kit",
        "Money on the road",
      ],
      travelStyleTitles: trekStyles,
      facilityTitles: trekFacilities,
    },
    images: noImages,
    seo: {
      seoIndex: true,
      seoTitle: "Marchoi Valley Winter Trek | Snow-Shoe Naranag",
      seoDescription:
        "Marchoi Valley winter snow trek from Naranag — 2N/3D seasonal. Guide and snow-shoe day from ₹8,999 pp.",
      facebookTitle: "Marchoi Valley winter trek — Naranag snow fields",
      facebookDescription: "Moderate snow-shoe day with heated guesthouse nights.",
      twitterTitle: "Marchoi Winter Trek | 2N/3D",
      twitterDescription: "Naranag snow trek · from ₹8,999 pp.",
      published: true,
    },
  },
];
