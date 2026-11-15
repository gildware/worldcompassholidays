/**
 * Phase-2 bestsellers — Ladakh/Spiti circuits, more yatras, winter & weekend treks.
 * Original operator-style copy (researched structures, rewritten voice). Images deferred.
 */
import type { KashmirTour } from "./kashmir-tours";

function prompt(place: string, scene: string) {
  return `Photorealistic ${place}, ${scene}, natural daylight, editorial travel photography, no readable text, 16:9 landscape`;
}

function faq(bestTime: string, extras: { title: string; content: string }[] = []) {
  return [
    { title: "When should I book this?", content: bestTime },
    {
      title: "Private vs group?",
      content:
        "Open departures run as small groups. Ask for a private departure if you want your own vehicle or a quieter pace.",
    },
    ...extras,
  ];
}

const trekKit = [
  "Trail camping or guest-house nights as listed",
  "Trek meals on walking days (veg + egg; Jain with notice)",
  "Certified trek leader + local support staff",
  "Forest / inner-line permits where the operator handles paperwork",
  "Shared first-aid kit; oxygen on high-altitude routes",
];

const trekOut = [
  "City hotels before / after the trek dates",
  "Personal gear (boots, poles, down jacket)",
  "Porter / mule for your rucksack (add-on)",
  "Travel insurance (strongly recommended)",
  "Tips, laundry, and personal snacks",
];

const roadKit = [
  "Hotels / camps as itinerary (twin sharing)",
  "Breakfast and dinner on most nights",
  "Private vehicle or bike logistics as package type",
  "Inner-line permits for Nubra / Pangong when included",
  "Driver allowance, tolls, and parking as quoted",
];

const roadOut = [
  "Flights to Leh / Manali / Srinagar unless listed",
  "Lunch, adventure activities, camel rides",
  "Monument and monastery entry tickets unless listed",
  "Oxygen cans, tips, and personal expenses",
  "Travel insurance",
];

export const indiaPhase2Tours: KashmirTour[] = [
  {
    slug: "vaishno-devi-katra-package",
    title: "Vaishno Devi Katra Darshan",
    category: "Religious",
    destinationSlug: "katra",
    destinationSlugs: ["katra", "jammu"],
    imageSlugs: ["katra", "jammu"],
    stays: ["2N Katra hotel near bus stand / track (or similar)"],
    openDepartures: 8,
    summary:
      "2 nights / 3 days Mata Vaishno Devi — Jammu pickup, Katra hotel, trek or optional heli to Sanjhichhat. From ₹9,999 pp.",
    description:
      "<p><strong>Built for a clean weekend yatra:</strong> we stage you in Katra the night before, so the Bhawan day starts early without a same-day Jammu rush. Walk the track, take a battery car stretch, or add the Katra–Sanjhichhat helicopter when slots open.</p><p>Pure veg meals on hotel nights. Helicopter, pony, and palki stay optional so seniors and families can mix-and-match comfort.</p>",
    durationDays: 3,
    durationNights: 2,
    durationLabel: "2 nights / 3 days",
    difficulty: "moderate",
    maxGroupSize: 20,
    priceFrom: 9999,
    isFeatured: true,
    mapLat: "32.9910",
    mapLng: "74.9320",
    seoTitle: "Vaishno Devi Package from Jammu | 2 Nights 3 Days Katra Darshan",
    seoDescription:
      "Book Vaishno Devi 2N/3D from Jammu with Katra hotel, veg meals, and optional helicopter to Sanjhichhat. Open group departures.",
    includes: [
      "Jammu airport / station pickup and drop",
      "2 nights Katra hotel with breakfast and dinner",
      "Katra local assistance for yatra registration tips",
    ],
    excludes: [
      "Helicopter tickets Katra–Sanjhichhat",
      "Pony / palki / battery car on the track",
      "Lunch and personal expenses",
      "Special / VIP darshan fees",
    ],
    faqs: faq("Year-round; Navratri is busiest — book hotels early. Winter mornings on the track are cold but clear.", [
      {
        title: "How long is the walk?",
        content:
          "Roughly 12–14 km one way from the Katra gate to the Bhawan. Many pilgrims split effort with battery car segments. Helicopter lands at Sanjhichhat — you still walk the last stretch.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Jammu to Katra · settle in",
        description:
          "Meet at Jammu airport or railway station and drive to Katra (about 1.5–2 hours depending on traffic).\nHotel check-in, rest, and a short market walk for walking sticks or dry snacks. Briefing on yatra timings and baggage rules. Overnight Katra.",
      },
      {
        dayNumber: 2,
        title: "Bhawan darshan day",
        description:
          "Pre-dawn start. Trek, battery car, or helicopter to Sanjhichhat as booked, then complete darshan at the Bhawan.\nReturn to Katra the same day. Evening free for a second attempt if queues ran long, or simply rest. Overnight Katra.",
      },
      {
        dayNumber: 3,
        title: "Return Jammu",
        description:
          "Breakfast and checkout. Transfer to Jammu station or airport with a buffer for trains and flights. Yatra ends.",
      },
    ],
    coverPrompt: prompt("Vaishno Devi track", "Trikuta hills pilgrimage path at sunrise"),
    galleryPrompts: [
      prompt("Katra town", "evening lights against Trikuta hills"),
      prompt("Bhawan approach", "mountain shrine path stone steps"),
      prompt("Jammu foothills", "highway toward Katra"),
      prompt("Trikuta ridge", "morning mist pilgrimage landscape"),
    ],
  },
  {
    slug: "amarnath-yatra-helicopter",
    title: "Amarnath Yatra by Helicopter",
    category: "Religious",
    destinationSlug: "sonamarg",
    destinationSlugs: ["sonamarg", "pahalgam", "srinagar", "kashmir"],
    imageSlugs: ["sonamarg", "pahalgam", "chandanwari"],
    stays: ["Srinagar or Sonamarg staging nights", "Base near Baltal / Neelgrath as allotted"],
    openDepartures: 4,
    summary:
      "3 nights / 4 days Amarnath by heli — Neelgrath / Baltal sector, short Panjtarni trek to the Holy Cave. From ₹42,999 pp (heli tickets extra or bundled as quoted).",
    description:
      "<p>Designed for pilgrims who want the cave darshan without the full Baltal or Pahalgam foot march. We stage near Sonamarg / Neelgrath, fly to Panjtarni when the board opens the window, then cover the remaining few kilometres on foot, pony, or palki.</p><p>Registration, medical certificate, and daily weather holds are non-negotiable — we share the live checklist before you pay the balance.</p>",
    durationDays: 4,
    durationNights: 3,
    durationLabel: "3 nights / 4 days",
    difficulty: "challenging",
    maxGroupSize: 12,
    priceFrom: 42999,
    isFeatured: true,
    mapLat: "34.3032",
    mapLng: "75.2990",
    seoTitle: "Amarnath Yatra by Helicopter | 3 Nights 4 Days from Srinagar / Sonamarg",
    seoDescription:
      "Amarnath helicopter yatra with staging hotels, Panjtarni trek support, and registration guidance. Seasonal fixed departures.",
    includes: [
      "Staging hotels as itinerary",
      "Transfers to Neelgrath / Baltal helipad sector",
      "Registration guidance and document checklist",
      "Breakfast and dinner on hotel nights",
    ],
    excludes: [
      "Helicopter tickets (quoted separately when bundled)",
      "Pony / palki from Panjtarni",
      "Yatra board fees and medical certificate costs",
      "Flights to Srinagar",
    ],
    faqs: faq("Only during the official Amarnath Yatra window (typically July–August). Heli flying depends on weather every morning.", [
      {
        title: "Is the medical form mandatory?",
        content:
          "Yes. Carry a doctor-signed fitness certificate as per that year’s Yatra board format. Heart, BP, and asthma cases need extra caution at altitude.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · move toward Sonamarg belt",
        description:
          "Airport pickup and document check. Drive toward Sonamarg / Neelgrath staging. Rest, hydrate, light dinner. Overnight staging hotel.",
      },
      {
        dayNumber: 2,
        title: "Helicopter day · Holy Cave",
        description:
          "Early report at the helipad. Fly to Panjtarni when your slot clears, then walk or pony to the cave for darshan.\nReturn flight the same day if weather holds; otherwise follow operator contingency. Overnight staging.",
      },
      {
        dayNumber: 3,
        title: "Weather buffer / Srinagar",
        description:
          "Buffer for delayed slots. If darshan is complete, return to Srinagar for a soft lake evening. Overnight Srinagar or staging as scheduled.",
      },
      {
        dayNumber: 4,
        title: "Departure",
        description: "Breakfast and airport transfer. Trip ends.",
      },
    ],
    coverPrompt: prompt("Amarnath cave approach", "snowy pilgrimage trail toward holy cave"),
    galleryPrompts: [
      prompt("Panjtarni meadow", "high camp landscape Amarnath route"),
      prompt("Neelgrath helipad area", "mountain heli staging"),
      prompt("Sonamarg valley", "Sindh river meadow"),
      prompt("Amarnath ice formation", "cave interior glow distant pilgrims"),
    ],
  },
  {
    slug: "kedarkantha-winter-trek",
    title: "Kedarkantha Winter Trek",
    category: "Trekking",
    destinationSlug: "sankri",
    destinationSlugs: ["sankri", "dehradun", "uttarakhand"],
    imageSlugs: ["sankri", "uttarakhand", "dehradun"],
    stays: ["Sankri guest house night", "Alpine tents Juda ka Talab / base / summit camp"],
    openDepartures: 8,
    summary:
      "5 nights / 6 days India’s favourite snow summit — Dehradun to Sankri, Juda ka Talab, Kedarkantha top (~12,500 ft). From ₹7,999 pp.",
    description:
      "<p>A winter classic that still feels achievable for first-timers who can hike 5–6 hours a day. Summit morning usually delivers a 360° ring of Swargarohant peaks if the sky is clean.</p><p>We keep bag weight sane, pitch early, and brief cold-weather layering properly — frostbite and wet gloves are the real enemies, not the altitude alone.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 15,
    priceFrom: 7999,
    isFeatured: true,
    mapLat: "31.0750",
    mapLng: "78.1850",
    seoTitle: "Kedarkantha Trek | 5 Nights 6 Days from Dehradun | Winter Snow Summit",
    seoDescription:
      "Kedarkantha winter trek 5N/6D with camping, meals, permits, and summit attempt from Sankri. Open December–April departures.",
    includes: [...trekKit, "Dehradun to Sankri shared transport on group dates"],
    excludes: trekOut,
    faqs: faq("Best snow: late December–February. March still works with patchy snow. Avoid monsoon.", [
      {
        title: "Do I need microspikes?",
        content:
          "In hard ice weeks the leader may issue microspikes for the summit push. Waterproof boots with good grip are still mandatory.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Dehradun to Sankri",
        description:
          "Morning departure from Dehradun toward Sankri (8–10 hours with tea stops). Village guest house, trek briefing, gear check. Overnight Sankri.",
      },
      {
        dayNumber: 2,
        title: "Sankri to Juda ka Talab",
        description:
          "Enter the trail through pine and oak. Steady climb to Juda ka Talab camp. Hot drinks, early dinner, overnight tents.",
      },
      {
        dayNumber: 3,
        title: "Juda ka Talab to Kedarkantha base",
        description:
          "Ascend to the base camp below the summit ridge. Shorter walking day so you sleep higher with daylight left to rest. Overnight tents.",
      },
      {
        dayNumber: 4,
        title: "Summit push · return base / Juda",
        description:
          "Alpine start for Kedarkantha top. Photos, descend carefully on snow. Camp at base or Juda depending on snow and group pace.",
      },
      {
        dayNumber: 5,
        title: "Descend to Sankri",
        description: "Long downhill to Sankri. Celebrate with a hot meal. Overnight guest house.",
      },
      {
        dayNumber: 6,
        title: "Drive to Dehradun",
        description: "Morning departure toward Dehradun. Trek ends late afternoon / evening.",
      },
    ],
    coverPrompt: prompt("Kedarkantha summit", "snow peak sunrise with trekkers distant"),
    galleryPrompts: [
      prompt("Juda ka Talab", "frozen lake camp in pine forest"),
      prompt("Kedarkantha ridge", "snow trail toward summit"),
      prompt("Sankri village", "wooden Himalayan houses"),
      prompt("Winter oak forest", "snow-laden trail Uttarakhand"),
    ],
  },
  {
    slug: "leh-nubra-pangong-circuit",
    title: "Leh Nubra Pangong Circuit",
    category: "Leisure",
    destinationSlug: "leh",
    destinationSlugs: ["leh", "nubra", "pangong", "ladakh"],
    imageSlugs: ["leh", "nubra", "pangong", "ladakh"],
    stays: ["2–3N Leh hotel", "1N Nubra camp / hotel", "1N Pangong lakeside camp"],
    openDepartures: 6,
    summary:
      "5 nights / 6 days classic Ladakh loop — acclimatise in Leh, Khardung La to Nubra, overnight at Pangong. From ₹24,999 pp.",
    description:
      "<p>The itinerary every first-timer actually needs: a real rest day in Leh before the passes, Diskit–Hunder time without a tourist stampede briefing, and a full night by Pangong so sunrise is not a rushed photo stop.</p><p>Inner-line permits are arranged on group dates. Diamox is your call with a doctor — we do not play physician on WhatsApp.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 12,
    priceFrom: 24999,
    isFeatured: true,
    mapLat: "34.1526",
    mapLng: "77.5771",
    seoTitle: "Leh Nubra Pangong Package | 5 Nights 6 Days Ladakh Circuit",
    seoDescription:
      "Leh–Nubra–Pangong 5N/6D with hotels/camps, permits, and paced acclimatisation. Open summer departures.",
    includes: [...roadKit, "Khardung La and Chang La / Shyok routing as open"],
    excludes: roadOut,
    faqs: faq("May–September for open passes. October can close early after snow on Chang La.", [
      {
        title: "What if I land and feel sick?",
        content:
          "Day 1–2 are soft on purpose. Tell the trip lead early. We can swap a pass day for a monastery day rather than force altitude.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Leh · rest",
        description:
          "Airport pickup. Hotel check-in and strict rest — no sightseeing runs. Hydrate, light dinner, early sleep. Overnight Leh.",
      },
      {
        dayNumber: 2,
        title: "Leh soft local day",
        description:
          "Shanti Stupa, Leh Palace viewpoint, market stroll at an easy pace. Optional Hall of Fame if energy allows. Overnight Leh.",
      },
      {
        dayNumber: 3,
        title: "Khardung La to Nubra",
        description:
          "Cross Khardung La into Nubra. Diskit monastery and Hunder dunes (camel ride extra). Overnight Nubra camp / hotel.",
      },
      {
        dayNumber: 4,
        title: "Nubra to Pangong",
        description:
          "Drive via Shyok or Wari La routing as open. Arrive Pangong for lake colour changes at dusk. Overnight lakeside camp.",
      },
      {
        dayNumber: 5,
        title: "Pangong to Leh via Chang La",
        description:
          "Sunrise by the water, then return to Leh over Chang La with tea stops. Buffer evening in town. Overnight Leh.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description: "Airport drop. Keep a morning flight buffer after high-altitude days.",
      },
    ],
    coverPrompt: prompt("Pangong lake", "vivid blue high altitude lake arid mountains"),
    galleryPrompts: [
      prompt("Khardung La", "high pass prayer flags snow patches"),
      prompt("Hunder dunes", "Bactrian camel on sand Ladakh"),
      prompt("Diskit monastery", "giant Buddha overlooking Nubra"),
      prompt("Leh palace", "mud fortress above old town"),
    ],
  },
  {
    slug: "srinagar-leh-highway-trip",
    title: "Srinagar to Leh Highway Trip",
    category: "Adventure",
    destinationSlug: "sonamarg",
    destinationSlugs: ["sonamarg", "kargil", "leh", "ladakh", "kashmir"],
    imageSlugs: ["sonamarg", "kargil", "leh"],
    stays: ["1N Sonamarg or Srinagar", "1N Kargil", "2–3N Leh"],
    openDepartures: 5,
    summary:
      "6 nights / 7 days Zoji La to Leh — Sonamarg, Drass, Kargil, Magnetic Hill, then Nubra or Pangong add-on day. From ₹32,999 pp.",
    description:
      "<p>The road trip that still beats flying if you care about the story between valleys. We break Zoji La and the Kargil night properly so you are not sleeping at 3,500 m on night one after a 14-hour push.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "moderate",
    maxGroupSize: 10,
    priceFrom: 32999,
    isFeatured: true,
    mapLat: "34.3032",
    mapLng: "75.2990",
    seoTitle: "Srinagar to Leh Road Trip | 6 Nights 7 Days via Zoji La & Kargil",
    seoDescription:
      "Srinagar–Leh highway package with Sonamarg, Kargil overnight, Leh sightseeing, and paced altitude gain.",
    includes: [...roadKit, "Srinagar airport pickup on group dates"],
    excludes: [...roadOut, "Optional Nubra / Pangong extension vehicle"],
    faqs: faq("June–October when Zoji La is reliably open. Shoulder weeks need flexible buffers."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · toward Sonamarg",
        description: "Pickup and drive to Sonamarg (or overnight Srinagar if arrival is late). Overnight Sonamarg / Srinagar.",
      },
      {
        dayNumber: 2,
        title: "Zoji La to Kargil",
        description:
          "Cross Zoji La into Drass and the Kargil war landscape. Evening in Kargil town. Overnight Kargil.",
      },
      {
        dayNumber: 3,
        title: "Kargil to Leh",
        description:
          "Long scenic day via Fotu La, Lamayuru views, Magnetic Hill, and Sangam. Overnight Leh.",
      },
      {
        dayNumber: 4,
        title: "Leh acclimatisation / monasteries",
        description: "Shey–Thiksey–Hemis or a softer local day based on how the group feels. Overnight Leh.",
      },
      {
        dayNumber: 5,
        title: "Nubra or Pangong day circuit",
        description:
          "Choose the open pass day: Nubra via Khardung La or Pangong via Chang La, returning Leh unless an overnight add-on is booked.",
      },
      {
        dayNumber: 6,
        title: "Leh buffer",
        description: "Market time, cafe recovery, or optional rafting / ATV extras. Overnight Leh.",
      },
      {
        dayNumber: 7,
        title: "Fly out Leh",
        description: "Airport transfer. Trip ends.",
      },
    ],
    coverPrompt: prompt("Zoji La highway", "winding mountain road between Kashmir and Ladakh"),
    galleryPrompts: [
      prompt("Drass valley", "arid mountains war memorial landscape"),
      prompt("Magnetic Hill Ladakh", "desert highway illusion stretch"),
      prompt("Leh bazaar", "mountain town street evening"),
      prompt("Sonamarg meadow", "Sindh river golden grass"),
    ],
  },
  {
    slug: "spiti-valley-circuit",
    title: "Spiti Valley Circuit",
    category: "Adventure",
    destinationSlug: "kaza",
    destinationSlugs: ["kaza", "spiti", "manali", "himachal"],
    imageSlugs: ["kaza", "spiti", "manali", "himachal"],
    stays: ["Manali start/end as listed", "Kalpa or Sangla optional", "Kaza nights", "Chandratal camp when open"],
    openDepartures: 5,
    summary:
      "8 nights / 9 days Spiti from Manali — Kunzum, Kaza, Key–Komic–Hikkim, Chandratal night when the road allows. From ₹18,999 pp.",
    description:
      "<p>Not a checklist dash. We keep two Kaza nights so Key Monastery, the fossil villages, and Hikkim post office are not crushed into one breathless afternoon.</p><p>Chandratal is weather and landslide dependent — if the lake road is shut we swap a Pin Valley or Dhankar morning without pretending nothing changed.</p>",
    durationDays: 9,
    durationNights: 8,
    durationLabel: "8 nights / 9 days",
    difficulty: "moderate",
    maxGroupSize: 12,
    priceFrom: 18999,
    isFeatured: true,
    mapLat: "32.2250",
    mapLng: "78.0720",
    seoTitle: "Spiti Valley Circuit from Manali | 8 Nights 9 Days Kaza & Chandratal",
    seoDescription:
      "Spiti Valley group trip 8N/9D with Kaza stays, Key Monastery loop, and Chandratal when accessible.",
    includes: [...roadKit, "Manali pickup on fixed departures"],
    excludes: roadOut,
    faqs: faq("July–September for the Manali–Kaza axis. June and October need extra landslide buffers."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Manali",
        description: "Meet the group, altitude chat, early night. Overnight Manali.",
      },
      {
        dayNumber: 2,
        title: "Manali to Kaza via Atal Tunnel / Kunzum",
        description: "Long high-desert transfer into Spiti. Overnight Kaza.",
      },
      {
        dayNumber: 3,
        title: "Key · Kibber · Chicham",
        description: "Monastery morning and cliff villages. Overnight Kaza.",
      },
      {
        dayNumber: 4,
        title: "Komic · Hikkim · Langza",
        description: "Highest villages and fossil belt. Overnight Kaza.",
      },
      {
        dayNumber: 5,
        title: "Pin Valley or Dhankar",
        description: "Quieter Spiti side-trip depending on road reports. Overnight Kaza / Tabo belt.",
      },
      {
        dayNumber: 6,
        title: "Toward Chandratal",
        description: "Drive to the lake roadhead and camp when open. Overnight Chandratal / nearby.",
      },
      {
        dayNumber: 7,
        title: "Chandratal to Manali",
        description: "Lake morning, then long return toward Manali. Overnight Manali.",
      },
      {
        dayNumber: 8,
        title: "Manali buffer",
        description: "Soft day — cafes, Solang optional, laundry. Overnight Manali.",
      },
      {
        dayNumber: 9,
        title: "Departure",
        description: "Drop toward Volvo point / Chandigarh / Kullu airport as booked.",
      },
    ],
    coverPrompt: prompt("Key Monastery Spiti", "whitewashed gompa on cliff above river"),
    galleryPrompts: [
      prompt("Chandratal lake", "crescent blue lake under barren peaks"),
      prompt("Kaza town", "Spiti valley settlement"),
      prompt("Kunzum pass", "prayer flags high desert saddle"),
      prompt("Langza Buddha", "statue overlooking fossil village"),
    ],
  },
  {
    slug: "ladakh-bike-expedition",
    title: "Ladakh Bike Expedition",
    category: "Adventure",
    destinationSlug: "leh",
    destinationSlugs: ["leh", "nubra", "pangong", "ladakh"],
    imageSlugs: ["leh", "nubra", "pangong"],
    stays: ["Leh hotel nights", "Nubra overnight", "Pangong camp"],
    openDepartures: 6,
    summary:
      "6 nights / 7 days Royal Enfield loop from Leh — Khardung La, Nubra, Pangong, with mechanic support. From ₹28,999 pp (bike rental variants).",
    description:
      "<p>Built for riders who want the classic passes without a Manali–Leh baptism on day one. You fly into Leh, acclimatise, then ride the circuit with a backup vehicle and a spare bike policy on group departures.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "challenging",
    maxGroupSize: 14,
    priceFrom: 28999,
    isFeatured: true,
    mapLat: "34.1526",
    mapLng: "77.5771",
    seoTitle: "Ladakh Bike Trip from Leh | 6 Nights 7 Days Nubra & Pangong",
    seoDescription:
      "Leh-based Ladakh bike expedition 6N/7D with RE rentals options, mechanic support, and paced riding days.",
    includes: [
      ...roadKit,
      "Backup traveller / mechanic on group bike dates",
      "Riding briefing and basic tool support",
    ],
    excludes: [
      ...roadOut,
      "Fuel (unless a fuel-inclusive quote is selected)",
      "Bike security deposit",
      "Riding gear beyond helmet on basic plans",
    ],
    faqs: faq("June–September. Carry a valid Indian driving licence with motorcycle authorisation."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Leh · rest",
        description: "No riding. Bike allotment and fitting only if you feel well. Overnight Leh.",
      },
      {
        dayNumber: 2,
        title: "Local Leh shake-down ride",
        description: "Short local ride to Magnetic Hill / Sangam belt to test the bike. Overnight Leh.",
      },
      {
        dayNumber: 3,
        title: "Ride to Nubra via Khardung La",
        description: "Full pass day into Diskit–Hunder. Overnight Nubra.",
      },
      {
        dayNumber: 4,
        title: "Nubra to Pangong",
        description: "Shyok-side riding when open. Lakeside camp. Overnight Pangong.",
      },
      {
        dayNumber: 5,
        title: "Pangong to Leh via Chang La",
        description: "Return ride with photo stops. Overnight Leh.",
      },
      {
        dayNumber: 6,
        title: "Leh buffer / monastery ride",
        description: "Optional Hemis loop or rest day for sore shoulders. Overnight Leh.",
      },
      {
        dayNumber: 7,
        title: "Bike return · fly out",
        description: "Hand over bikes, deposit formalities, airport drop.",
      },
    ],
    coverPrompt: prompt("Ladakh motorcycle", "Royal Enfield on high desert highway"),
    galleryPrompts: [
      prompt("Khardung La riders", "motorcycles at high pass"),
      prompt("Pangong lakeside", "camp and bikes by blue water"),
      prompt("Nubra dunes", "bike parked near sand dunes"),
      prompt("Leh workshop", "mechanic checking Enfield"),
    ],
  },
  {
    slug: "kheerganga-camping-trek",
    title: "Kheerganga Trek with Camping",
    category: "Trekking",
    destinationSlug: "kasol",
    destinationSlugs: ["kasol", "manali", "himachal"],
    imageSlugs: ["kasol", "himachal"],
    stays: ["Camp below Kheerganga meadow (top camping restricted)", "Optional Kasol guest house add-on"],
    openDepartures: 10,
    summary:
      "1 night / 2 days Parvati Valley classic — Barshaini to Kheerganga hot spring, camp lower meadow, descend via Kalga. From ₹1,999 pp.",
    description:
      "<p>Short enough for a long weekend from Delhi, hard enough that sneakers will punish you. We camp in the permitted zone below the spring — not on the fragile top meadow — and still make time for a soak at Parvati Kund.</p>",
    durationDays: 2,
    durationNights: 1,
    durationLabel: "1 night / 2 days",
    difficulty: "easy",
    maxGroupSize: 18,
    priceFrom: 1999,
    isFeatured: true,
    mapLat: "32.0090",
    mapLng: "77.3150",
    seoTitle: "Kheerganga Trek with Camping | 1 Night 2 Days from Kasol",
    seoDescription:
      "Kheerganga camping trek 1N/2D from Kasol / Barshaini with guide, meals, and hot-spring time.",
    includes: [...trekKit, "Kasol to Barshaini shared cab on group dates"],
    excludes: trekOut,
    faqs: faq("March–June and September–November. Monsoon trails get slippery and landslide-prone."),
    days: [
      {
        dayNumber: 1,
        title: "Kasol · Barshaini · climb to camp",
        description:
          "Transfer to Barshaini, trek past Nakthan / Rudranag toward Kheerganga (4–6 hours). Camp check-in, hot spring visit, dinner under the stars.",
      },
      {
        dayNumber: 2,
        title: "Spring morning · descend to Kasol",
        description:
          "Optional second soak, breakfast, descend via Kalga forest trail. Reach Kasol by afternoon. Trek ends.",
      },
    ],
    coverPrompt: prompt("Kheerganga meadow", "Parvati valley hot spring steam mountain camp"),
    galleryPrompts: [
      prompt("Rudranag waterfall", "trek trail waterfall Himachal"),
      prompt("Kasol riverside", "Parvati river cafe town"),
      prompt("Kalga forest", "pine trail descent"),
      prompt("Barshaini dam", "trek start bridge"),
    ],
  },
  {
    slug: "triund-trek-camping",
    title: "Triund Trek & Camping",
    category: "Trekking",
    destinationSlug: "mcleodganj",
    destinationSlugs: ["mcleodganj", "himachal"],
    imageSlugs: ["mcleodganj", "himachal"],
    stays: ["Triund ridge camp", "Optional McLeod Ganj hotel pre-night"],
    openDepartures: 10,
    summary:
      "1 night / 2 days Dhauladhar ridge camp above McLeod Ganj — Gallu Devi trail, sunset on the grass saddle. From ₹1,499 pp.",
    description:
      "<p>The Himachal weekend that still delivers a proper mountain night without a week off work. We start from Gallu, take the oak–rhododendron climb seriously, and pitch on the Triund ridge with Kangra lights below.</p>",
    durationDays: 2,
    durationNights: 1,
    durationLabel: "1 night / 2 days",
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 1499,
    isFeatured: true,
    mapLat: "32.2426",
    mapLng: "76.3213",
    seoTitle: "Triund Trek & Camping | 1 Night 2 Days from McLeod Ganj",
    seoDescription:
      "Triund camping trek 1N/2D from McLeod Ganj with guide, tents, and meals. Beginner friendly.",
    includes: trekKit,
    excludes: trekOut,
    faqs: faq("April–June and October–December. Winter ice on the last kilometre needs good boots."),
    days: [
      {
        dayNumber: 1,
        title: "McLeod Ganj to Triund",
        description:
          "Trek ~9 km via Gallu Devi (4–5 hours). Ridge camp, sunset tea, early dinner. Overnight tents.",
      },
      {
        dayNumber: 2,
        title: "Sunrise · descend",
        description:
          "Optional Snowline cafe extension if conditions allow, then descend to McLeod / Bhagsu. Trek ends by lunch.",
      },
    ],
    coverPrompt: prompt("Triund ridge", "Dhauladhar peaks above grassy camping saddle"),
    galleryPrompts: [
      prompt("McLeod Ganj prayer flags", "Tibetan hill town"),
      prompt("Gallu forest trail", "oak rhododendron path"),
      prompt("Triund sunrise", "pink light on Dhauladhar"),
      prompt("Bhagsu waterfall", "descent waterfall stop"),
    ],
  },
  {
    slug: "markha-valley-trek",
    title: "Markha Valley Trek",
    category: "Trekking",
    destinationSlug: "leh",
    destinationSlugs: ["leh", "ladakh"],
    imageSlugs: ["leh", "ladakh"],
    stays: ["Leh acclimatisation nights", "Homestays / camps along Markha"],
    openDepartures: 4,
    summary:
      "7 nights / 8 days Ladakh’s classic village trek — Chilling start, Markha homestays, Kongmaru La views of Kang Yatse. From ₹28,999 pp.",
    description:
      "<p>More culture than a pure alpine circuit: irrigation fields, whitewashed chortens, and evenings in family kitchens when homestays are open. We insist on two Leh nights before Chilling so AMS does not end your holiday at Skiu.</p>",
    durationDays: 8,
    durationNights: 7,
    durationLabel: "7 nights / 8 days",
    difficulty: "challenging",
    maxGroupSize: 12,
    priceFrom: 28999,
    isFeatured: true,
    mapLat: "34.1526",
    mapLng: "77.5771",
    seoTitle: "Markha Valley Trek | 7 Nights 8 Days from Leh | Ladakh",
    seoDescription:
      "Markha Valley trek 7N/8D with Leh acclimatisation, homestay/camp nights, and Kongmaru La crossing.",
    includes: [...trekKit, "Leh hotel nights as listed", "Chilling drop and Sumdo pickup"],
    excludes: trekOut,
    faqs: faq("July–mid-September. June can still hold high snow on Kongmaru La."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Leh",
        description: "Rest day. Overnight Leh.",
      },
      {
        dayNumber: 2,
        title: "Leh buffer / gear",
        description: "Soft local day and trek briefing. Overnight Leh.",
      },
      {
        dayNumber: 3,
        title: "Drive to Chilling · trek to Skiu / Markha approach",
        description: "Enter the valley. Overnight camp or homestay.",
      },
      {
        dayNumber: 4,
        title: "Toward Markha village",
        description: "River-side walking, village life. Overnight Markha.",
      },
      {
        dayNumber: 5,
        title: "Markha to Hankar / Thochungtse",
        description: "Deeper valley toward Kang Yatse views. Overnight camp/homestay.",
      },
      {
        dayNumber: 6,
        title: "Toward Nimaling",
        description: "High camp under the peaks. Overnight Nimaling.",
      },
      {
        dayNumber: 7,
        title: "Kongmaru La · descend to roadhead",
        description: "Pass day and long descent to Sumdo / Shang. Transfer toward Leh. Overnight Leh.",
      },
      {
        dayNumber: 8,
        title: "Departure",
        description: "Buffer morning and airport drop.",
      },
    ],
    coverPrompt: prompt("Markha Valley", "Ladakh canyon river trail village"),
    galleryPrompts: [
      prompt("Kongmaru La", "high pass prayer flags Ladakh"),
      prompt("Markha village", "mud houses barley fields"),
      prompt("Kang Yatse", "snow peak above Nimaling"),
      prompt("Chortens Markha", "white stupas on trail"),
    ],
  },
  {
    slug: "brahmatal-winter-trek",
    title: "Brahmatal Winter Trek",
    category: "Trekking",
    destinationSlug: "uttarakhand",
    destinationSlugs: ["uttarakhand", "rishikesh", "haridwar"],
    imageSlugs: ["uttarakhand", "rishikesh"],
    stays: ["Lohajung guest house", "Tents Bekaltal / Brahmatal ridge camps"],
    openDepartures: 6,
    summary:
      "5 nights / 6 days winter lakes under Trishul — Lohajung base, Bekaltal, Brahmatal ridge. From ₹8,999 pp.",
    description:
      "<p>Choose this when Kedarkantha feels too crowded. Frozen lakes, oak forests, and a summit ridge that stares at Trishul and Nanda Ghunti without the Sankri traffic jam.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 8999,
    isFeatured: true,
    mapLat: "30.0500",
    mapLng: "79.4500",
    seoTitle: "Brahmatal Trek | 5 Nights 6 Days Winter Lakes | Uttarakhand",
    seoDescription:
      "Brahmatal winter trek 5N/6D from Rishikesh / Lohajung with camping, meals, and ridge summit.",
    includes: [...trekKit, "Rishikesh / Kathgodam to Lohajung transport on group dates"],
    excludes: trekOut,
    faqs: faq("December–March for reliable snow. Carry gaiters in deep powder weeks."),
    days: [
      {
        dayNumber: 1,
        title: "Drive to Lohajung",
        description: "Long transfer into Chamoli. Briefing. Overnight Lohajung.",
      },
      {
        dayNumber: 2,
        title: "Lohajung to Bekaltal",
        description: "Forest climb to the first lake camp. Overnight tents.",
      },
      {
        dayNumber: 3,
        title: "Bekaltal to Brahmatal",
        description: "Ridge walking toward Brahmatal camp. Overnight tents.",
      },
      {
        dayNumber: 4,
        title: "Summit ridge · return camp",
        description: "Morning push for Trishul views, return to camp. Overnight tents.",
      },
      {
        dayNumber: 5,
        title: "Descend to Lohajung",
        description: "Downhill day. Overnight guest house.",
      },
      {
        dayNumber: 6,
        title: "Return plains",
        description: "Drive toward Rishikesh / Kathgodam. Trek ends.",
      },
    ],
    coverPrompt: prompt("Brahmatal lake", "frozen alpine lake Trishul peak backdrop"),
    galleryPrompts: [
      prompt("Bekaltal", "winter lake oak forest"),
      prompt("Brahmatal ridge", "snow ridge sunrise"),
      prompt("Lohajung village", "Garhwal hill hamlet"),
      prompt("Trishul massif", "sharp Himalayan peaks winter"),
    ],
  },
  {
    slug: "dayara-bugyal-trek",
    title: "Dayara Bugyal Trek",
    category: "Trekking",
    destinationSlug: "uttarakhand",
    destinationSlugs: ["uttarakhand", "dehradun"],
    imageSlugs: ["uttarakhand", "dehradun"],
    stays: ["Raithal / Barsu village stays", "Bugyal camping nights"],
    openDepartures: 6,
    summary:
      "3 nights / 4 days easy meadow trek from Raithal — Dayara Bugyal pastures with Bandarpoonch views. From ₹6,499 pp.",
    description:
      "<p>Green carpets in summer, soft snow in winter, and short walking days that suit families who still want a real alpine camp. Raithal hospitality is half the reason people rebook.</p>",
    durationDays: 4,
    durationNights: 3,
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 6499,
    isFeatured: true,
    mapLat: "30.8200",
    mapLng: "78.4500",
    seoTitle: "Dayara Bugyal Trek | 3 Nights 4 Days from Dehradun | Uttarakhand",
    seoDescription:
      "Dayara Bugyal trek 3N/4D with village stays, meadow camping, and beginner-friendly walking days.",
    includes: [...trekKit, "Dehradun to Raithal transport on group dates"],
    excludes: trekOut,
    faqs: faq("April–June for green meadows; December–February for snow; monsoon is lush but slippery."),
    days: [
      {
        dayNumber: 1,
        title: "Dehradun to Raithal",
        description: "Drive into Uttarkashi hills. Village stay and briefing. Overnight Raithal.",
      },
      {
        dayNumber: 2,
        title: "Raithal to Dayara Bugyal",
        description: "Gradual climb into the meadow. Camp with peak views. Overnight tents.",
      },
      {
        dayNumber: 3,
        title: "Bugyal exploration · descend",
        description: "Morning meadow walk / snow play, then descend to village. Overnight Raithal.",
      },
      {
        dayNumber: 4,
        title: "Return Dehradun",
        description: "Drive out. Trek ends.",
      },
    ],
    coverPrompt: prompt("Dayara Bugyal", "vast green alpine meadow Himalayan peaks"),
    galleryPrompts: [
      prompt("Raithal village", "wooden Himalayan homes"),
      prompt("Dayara snow", "winter meadow camp"),
      prompt("Bandarpoonch view", "snow peaks from bugyal"),
      prompt("Oak trail Dayara", "forest path to meadow"),
    ],
  },
  {
    slug: "sar-pass-trek",
    title: "Sar Pass Trek",
    category: "Trekking",
    destinationSlug: "kasol",
    destinationSlugs: ["kasol", "himachal"],
    imageSlugs: ["kasol", "himachal"],
    stays: ["Kasol / Grahan staging", "Forest and snow camps to Biskeri"],
    openDepartures: 5,
    summary:
      "4 nights / 5 days Parvati Valley crossover — Grahan, Tila Lotni, Sar Pass, pine descent to Biskeri. From ₹7,499 pp.",
    description:
      "<p>A step up from Kheerganga: longer days, a proper pass crossing, and that satisfying drop into a different valley. We keep groups small on the snowfield day.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 7499,
    isFeatured: true,
    mapLat: "32.0090",
    mapLng: "77.3150",
    seoTitle: "Sar Pass Trek from Kasol | 4 Nights 5 Days | Himachal",
    seoDescription:
      "Sar Pass trek 4N/5D from Kasol with camping, meals, and guided pass crossing.",
    includes: trekKit,
    excludes: trekOut,
    faqs: faq("May–June for snow excitement; September–October for clearer skies."),
    days: [
      {
        dayNumber: 1,
        title: "Kasol to Grahan",
        description: "Trek into Grahan village. Overnight camp / homestay style.",
      },
      {
        dayNumber: 2,
        title: "Grahan to Padri / forest camp",
        description: "Climb through dense forest. Overnight tents.",
      },
      {
        dayNumber: 3,
        title: "Toward Tila Lotni",
        description: "High camp before the pass. Overnight tents.",
      },
      {
        dayNumber: 4,
        title: "Cross Sar Pass · Biskeri",
        description: "Pass day and long descent to Biskeri meadows. Overnight tents.",
      },
      {
        dayNumber: 5,
        title: "Biskeri to Barshaini · Kasol",
        description: "Final descent and transfer to Kasol. Trek ends.",
      },
    ],
    coverPrompt: prompt("Sar Pass", "snow pass Himachal trekkers distant"),
    galleryPrompts: [
      prompt("Grahan village", "Parvati valley wooden village"),
      prompt("Tila Lotni camp", "high snow camp"),
      prompt("Biskeri meadow", "green camping meadow"),
      prompt("Kasol evening", "riverside cafes"),
    ],
  },
  {
    slug: "chadar-frozen-river-trek",
    title: "Chadar Frozen River Trek",
    category: "Trekking",
    destinationSlug: "leh",
    destinationSlugs: ["leh", "ladakh"],
    imageSlugs: ["leh", "ladakh"],
    stays: ["Leh buffer nights", "Camps on the Zanskar ice corridor"],
    openDepartures: 3,
    summary:
      "8 nights / 9 days seasonal Zanskar ice trek — only when the Chadar is officially open and stable. From ₹24,999 pp.",
    description:
      "<p>This is not a casual winter holiday. Night temperatures can plunge below −20°C, and the administration can cancel walking days if the ice is unsafe. We only run departures after local clearance and keep Leh buffers honest.</p>",
    durationDays: 9,
    durationNights: 8,
    durationLabel: "8 nights / 9 days",
    difficulty: "challenging",
    maxGroupSize: 12,
    priceFrom: 24999,
    isFeatured: true,
    mapLat: "34.1526",
    mapLng: "77.5771",
    seoTitle: "Chadar Trek Ladakh | 8 Nights 9 Days Frozen Zanskar River",
    seoDescription:
      "Chadar frozen river trek 8N/9D from Leh with camping, guides, and weather-dependent ice corridor days.",
    includes: [...trekKit, "Leh hotels as listed", "Technical briefing and cold-weather checks"],
    excludes: [...trekOut, "Flights that cannot be moved if the Chadar is closed"],
    faqs: faq("Typically mid-January to February only — and only when ice reports allow.", [
      {
        title: "What if the ice is unsafe?",
        content:
          "Walking days can be shortened or cancelled. We rebook what we can locally; flight change fees stay with the traveller unless a flex fare was bought.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Leh",
        description: "Strict rest. Overnight Leh.",
      },
      {
        dayNumber: 2,
        title: "Leh acclimatisation",
        description: "Soft local day and gear check. Overnight Leh.",
      },
      {
        dayNumber: 3,
        title: "Drive to roadhead · first ice camp",
        description: "Enter the Chadar corridor if open. Overnight ice camp.",
      },
      {
        dayNumber: 4,
        title: "Ice walking day",
        description: "Move camp deeper along the frozen river. Overnight camp.",
      },
      {
        dayNumber: 5,
        title: "Toward Nerak / deep Chadar",
        description: "Long ice day with waterfall walls. Overnight camp.",
      },
      {
        dayNumber: 6,
        title: "Explore / buffer on ice",
        description: "Weather and ice-quality buffer. Overnight camp.",
      },
      {
        dayNumber: 7,
        title: "Return toward roadhead",
        description: "Retrace on ice. Overnight camp or roadhead.",
      },
      {
        dayNumber: 8,
        title: "Return Leh",
        description: "Drive to Leh, hot shower, recovery. Overnight Leh.",
      },
      {
        dayNumber: 9,
        title: "Departure",
        description: "Airport drop. Trip ends.",
      },
    ],
    coverPrompt: prompt("Chadar trek", "frozen Zanskar river canyon winter trekkers"),
    galleryPrompts: [
      prompt("Zanskar ice sheet", "blue ice corridor cliffs"),
      prompt("Chadar camp", "tents on frozen river bank"),
      prompt("Ice waterfall wall", "frozen cascade beside trail"),
      prompt("Leh winter", "snow dusted Himalayan town"),
    ],
  },
];
