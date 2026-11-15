/**
 * Phase-1 pan-India bestsellers — religious yatras + Himalayan treks/camping.
 * Same production shape as KashmirTour (full itinerary, includes, FAQs, departures).
 */
import type { KashmirTour } from "./kashmir-tours";

function prompt(place: string, scene: string) {
  return `Photorealistic ${place}, ${scene}, natural daylight, editorial travel photography, no readable text, 16:9 landscape`;
}

function faq(bestTime: string, extras?: { title: string; content: string }[]) {
  return [
    { title: "What is the best time for this tour?", content: bestTime },
    {
      title: "Is this a private or group tour?",
      content:
        "Group fixed departures are listed with open seats. Private family departures can be quoted on the same itinerary.",
    },
    ...(extras ?? []),
  ];
}

const yatraIncludes = [
  "Hotel / dharamshala nights as per itinerary (twin sharing)",
  "Daily breakfast and dinner (pure veg MAP on most nights)",
  "Private vehicle for road transfers (Innova / similar for smaller groups; tempo for larger)",
  "Driver allowance, tolls, parking, and GST as quoted",
  "Local guide / trip manager on group departures",
];

const yatraExcludes = [
  "Flights / trains to Haridwar or Dehradun",
  "Helicopter tickets (unless the heli package is booked)",
  "Pony / palki / porter for Kedarnath trek segment",
  "Lunch, tips, laundry, and personal expenses",
  "Temple special darshan / VIP tickets unless listed",
  "Travel insurance and medical expenses",
];

const trekIncludes = [
  "All camping / guest-house nights as per itinerary",
  "Nutritious trek meals (breakfast, lunch, dinner) on trail days",
  "Certified trek leader and local guides",
  "Camping equipment (tents, sleeping bags, mats) on camping nights",
  "Forest / trek permits arranged by the operator",
  "First-aid kit and oxygen cylinder support on high routes",
];

const trekExcludes = [
  "Transport to trek base (unless listed)",
  "Personal trekking gear (shoes, poles, down jacket)",
  "Porter / mule for personal bags (available as add-on)",
  "Any hotel stay before / after the trek dates",
  "Travel insurance (mandatory for high-altitude treks)",
  "Tips, personal snacks, and emergency evacuation",
];

export const indiaPhase1Tours: KashmirTour[] = [
  {
    slug: "kedarnath-yatra-package",
    title: "Kedarnath Yatra Package",
    category: "Religious",
    destinationSlug: "kedarnath",
    destinationSlugs: ["kedarnath", "guptkashi", "haridwar", "rishikesh", "uttarakhand"],
    imageSlugs: ["kedarnath", "guptkashi", "haridwar", "rishikesh"],
    stays: [
      "1N Haridwar hotel (or similar)",
      "2N Guptkashi / Sonprayag belt hotel (or similar)",
      "1N post-darshan Guptkashi",
      "1N Rishikesh / Haridwar buffer",
    ],
    openDepartures: 8,
    summary:
      "5 nights / 6 days Kedarnath darshan from Haridwar — Guptkashi base, trek or heli option to the Jyotirlinga, Ganga aarti buffer. From ₹26,999 pp.",
    description:
      "<p><strong>Why travellers book this:</strong> a paced Kedarnath Yatra with proper Guptkashi nights so you are not rushing the 16–18 km trek (or heli slot) on the same day you leave Haridwar.</p><p><strong>Stays in this quote:</strong> Haridwar hotel on arrival; Guptkashi / Sonprayag belt for the shrine days; Rishikesh or Haridwar buffer on return. Pure veg MAP meals on hotel nights.</p><p>Pony, palki, and helicopter tickets are optional extras — we confirm availability before you pay the balance.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 18,
    priceFrom: 26999,
    isFeatured: true,
    mapLat: "30.7352",
    mapLng: "79.0669",
    seoTitle: "Kedarnath Yatra Package | 5 Nights 6 Days from Haridwar | Uttarakhand",
    seoDescription:
      "Book Kedarnath Yatra 5N/6D from Haridwar with Guptkashi stays, veg meals, and trek or helicopter darshan options. Open group departures.",
    includes: [
      ...yatraIncludes,
      "Haridwar pickup for group departures",
      "Kedarnath temple visit day support",
    ],
    excludes: yatraExcludes,
    faqs: faq("May–June and September–October for milder weather; July–August monsoon roads can delay.", [
      {
        title: "Do I need to trek the full way?",
        content:
          "Most yatris trek Gaurikund–Kedarnath (about 16–18 km). Pony / palki and helicopter from Phata / Sersi / Guptkashi are bookable extras subject to weather and slot availability.",
      },
      {
        title: "Is medical fitness required?",
        content:
          "Yes — Kedarnath sits above 3,500 m. Carry regular medicines, walk slowly, and declare heart / BP / asthma conditions when booking.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Haridwar · Ganga aarti",
        description:
          "Arrive Haridwar by train or flight+transfer. Check in to your hotel.\nEvening: attend the Ganga aarti at Har Ki Pauri. Briefing for the yatra. Dinner and overnight Haridwar.",
      },
      {
        dayNumber: 2,
        title: "Haridwar to Guptkashi",
        description:
          "After breakfast, drive into the Garhwal hills via Devprayag / Rudraprayag (about 7–9 hours depending on traffic and road works).\nCheck in at Guptkashi / Sonprayag belt hotel. Rest, hydrate, and optional visit to ancient Vishwanath temple. Overnight Guptkashi.",
      },
      {
        dayNumber: 3,
        title: "Kedarnath darshan day",
        description:
          "Early start to Sonprayag / Gaurikund. Trek, pony, or helicopter toward Kedarnath as booked.\nDarshan at the Jyotirlinga shrine. Descend to base the same day if fitness / heli slots allow, or overnight near the shrine when arranged. Most packages return to Guptkashi for dinner.",
      },
      {
        dayNumber: 4,
        title: "Buffer / second attempt · Guptkashi",
        description:
          "Weather buffer day. If darshan was missed due to weather, retry. Otherwise rest, local sightseeing (Ukhimath optional), or short walks. Overnight Guptkashi.",
      },
      {
        dayNumber: 5,
        title: "Return toward Rishikesh / Haridwar",
        description:
          "Drive down to Rishikesh or Haridwar (full day on the road). Evening free for Ganga aarti or cafes if you reach Rishikesh in time. Overnight plains.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description:
          "Breakfast. Transfer to Haridwar railway station or Dehradun / Jolly Grant Airport as quoted. Trip ends.",
      },
    ],
    coverPrompt: prompt("Kedarnath temple", "stone shrine beneath snow peak with pilgrims distant at dawn"),
    galleryPrompts: [
      prompt("Gaurikund trail", "mountain pilgrimage path toward Kedarnath"),
      prompt("Guptkashi town", "hill town hotels with valley views"),
      prompt("Har Ki Pauri Haridwar", "Ganga aarti lamps at dusk"),
      prompt("Mandakini river", "glacial river gorge near Kedarnath route"),
    ],
  },
  {
    slug: "do-dham-yatra-kedarnath-badrinath",
    title: "Do Dham Yatra — Kedarnath & Badrinath",
    category: "Religious",
    destinationSlug: "kedarnath",
    destinationSlugs: ["kedarnath", "badrinath", "guptkashi", "haridwar", "rishikesh", "uttarakhand"],
    imageSlugs: ["kedarnath", "badrinath", "haridwar", "guptkashi"],
    stays: [
      "1N Haridwar",
      "2N Guptkashi belt for Kedarnath",
      "2N Badrinath / Joshimath belt",
      "1N Rishikesh / Haridwar return",
    ],
    openDepartures: 6,
    summary:
      "7 nights / 8 days Do Dham — Kedarnath and Badrinath darshan from Haridwar with paced mountain nights. From ₹42,999 pp.",
    description:
      "<p><strong>Why travellers book this:</strong> the two most sought Char Dham shrines in one circuit without committing to the full 11-day Char Dham.</p><p><strong>Stays in this quote:</strong> Haridwar start; Guptkashi for Kedarnath; Badrinath or Joshimath for Vishnu dham; plains buffer on return.</p>",
    durationDays: 8,
    durationNights: 7,
    durationLabel: "7 nights / 8 days",
    difficulty: "moderate",
    maxGroupSize: 16,
    priceFrom: 42999,
    isFeatured: true,
    mapLat: "30.7352",
    mapLng: "79.0669",
    seoTitle: "Do Dham Yatra Package | Kedarnath & Badrinath | 7 Nights 8 Days",
    seoDescription:
      "Do Dham Yatra 7N/8D covering Kedarnath and Badrinath from Haridwar with hotels, veg meals, and open group departures.",
    includes: [...yatraIncludes, "Kedarnath and Badrinath darshan days as itinerary"],
    excludes: yatraExcludes,
    faqs: faq("May–June and September–October preferred; monsoon landslides can add buffer days.", [
      {
        title: "Can seniors do this trip?",
        content:
          "Yes with slower pacing and optional heli for Kedarnath. Badrinath is road-accessible; carry a doctor’s note for altitude.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Haridwar",
        description: "Hotel check-in. Evening Har Ki Pauri aarti. Overnight Haridwar.",
      },
      {
        dayNumber: 2,
        title: "Drive to Guptkashi",
        description: "Long hill drive via the prayags. Overnight Guptkashi.",
      },
      {
        dayNumber: 3,
        title: "Kedarnath darshan",
        description: "Trek / pony / heli to Kedarnath. Return to Guptkashi (or shrine overnight if arranged).",
      },
      {
        dayNumber: 4,
        title: "Guptkashi to Badrinath / Joshimath",
        description: "Scenic transfer toward Badrinath via Chopta belt / Joshimath as route allows. Overnight Badrinath or Joshimath.",
      },
      {
        dayNumber: 5,
        title: "Badrinath darshan",
        description: "Morning darshan at Badrinath temple. Optional Mana village / Tapt Kund. Overnight same belt.",
      },
      {
        dayNumber: 6,
        title: "Descend toward plains",
        description: "Drive down toward Rudraprayag / Rishikesh corridor. Overnight plains or mid-hill hotel.",
      },
      {
        dayNumber: 7,
        title: "Rishikesh / Haridwar buffer",
        description: "Soft day — Ganga aarti, cafes, or rest after the mountains. Overnight Haridwar / Rishikesh.",
      },
      {
        dayNumber: 8,
        title: "Departure",
        description: "Station / airport transfer. Trip ends.",
      },
    ],
    coverPrompt: prompt("Badrinath temple", "colourful facade with Neelkanth peak behind"),
    galleryPrompts: [
      prompt("Kedarnath shrine", "pilgrims at stone temple morning light"),
      prompt("Alaknanda valley", "river road toward Badrinath"),
      prompt("Mana village", "last Indian village near Badrinath"),
      prompt("Haridwar ghat", "evening lamps on Ganga"),
    ],
  },
  {
    slug: "char-dham-yatra-from-haridwar",
    title: "Char Dham Yatra from Haridwar",
    category: "Religious",
    destinationSlug: "uttarakhand",
    destinationSlugs: [
      "uttarakhand",
      "haridwar",
      "yamunotri",
      "gangotri",
      "kedarnath",
      "badrinath",
      "rishikesh",
      "guptkashi",
    ],
    imageSlugs: ["haridwar", "kedarnath", "badrinath", "yamunotri", "gangotri"],
    stays: [
      "Barkot / Janki Chatti belt for Yamunotri",
      "Uttarkashi belt for Gangotri",
      "Guptkashi belt for Kedarnath",
      "Badrinath / Joshimath for Badrinath",
      "Haridwar / Rishikesh start and end",
    ],
    openDepartures: 5,
    summary:
      "10 nights / 11 days classic Char Dham — Yamunotri, Gangotri, Kedarnath, Badrinath from Haridwar. Group yatra from ₹48,999 pp.",
    description:
      "<p><strong>Why travellers book this:</strong> the complete Uttarakhand Char Dham circuit in the pacing used by major OTAs — Barkot, Uttarkashi, Guptkashi, and Badrinath nights with veg meals and a trip manager.</p><p>Helicopter upgrades for Kedarnath can be added when slots open. Senior-friendly seat arrangements on request.</p>",
    durationDays: 11,
    durationNights: 10,
    durationLabel: "10 nights / 11 days",
    difficulty: "moderate",
    maxGroupSize: 20,
    priceFrom: 48999,
    isFeatured: true,
    mapLat: "30.3165",
    mapLng: "78.0322",
    seoTitle: "Char Dham Yatra Package from Haridwar | 10 Nights 11 Days | Yamunotri Gangotri Kedarnath Badrinath",
    seoDescription:
      "Char Dham Yatra 10N/11D from Haridwar covering Yamunotri, Gangotri, Kedarnath and Badrinath with hotels, veg meals, and fixed departures.",
    includes: [
      ...yatraIncludes,
      "All four dham darshan days as itinerary",
      "Group trip manager on fixed departures",
    ],
    excludes: yatraExcludes,
    faqs: faq("Official Char Dham season is typically May–October; exact temple opening dates vary each year.", [
      {
        title: "How difficult is the walking?",
        content:
          "Yamunotri and Kedarnath involve significant walks (or pony / heli). Gangotri and Badrinath are largely road-accessible. Declare mobility limits when booking.",
      },
      {
        title: "What documents are needed?",
        content:
          "Government photo ID for all travellers. Some years require online Char Dham registration — we share the current process before departure.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Haridwar",
        description: "Meet the group. Hotel check-in. Ganga aarti. Overnight Haridwar.",
      },
      {
        dayNumber: 2,
        title: "Haridwar to Barkot",
        description: "Drive via Mussoorie / Purola belt toward Barkot. Overnight Barkot region.",
      },
      {
        dayNumber: 3,
        title: "Yamunotri darshan",
        description:
          "Drive to Janki Chatti. Trek or pony to Yamunotri temple. Return to Barkot overnight.",
      },
      {
        dayNumber: 4,
        title: "Barkot to Uttarkashi",
        description: "Transfer toward Uttarkashi. Evening free. Overnight Uttarkashi.",
      },
      {
        dayNumber: 5,
        title: "Gangotri darshan",
        description: "Day trip to Gangotri temple on the Bhagirathi. Return Uttarkashi overnight.",
      },
      {
        dayNumber: 6,
        title: "Uttarkashi to Guptkashi",
        description: "Long transfer into Kedarnath belt. Overnight Guptkashi.",
      },
      {
        dayNumber: 7,
        title: "Kedarnath darshan",
        description: "Trek / pony / heli to Kedarnath. Return Guptkashi (buffer overnight).",
      },
      {
        dayNumber: 8,
        title: "Guptkashi to Badrinath",
        description: "Drive via Chopta / Joshimath corridor to Badrinath. Overnight Badrinath.",
      },
      {
        dayNumber: 9,
        title: "Badrinath darshan · start descent",
        description: "Morning darshan and optional Mana. Begin descent; overnight Joshimath or Rudraprayag belt.",
      },
      {
        dayNumber: 10,
        title: "Return Rishikesh / Haridwar",
        description: "Full-day drive to the plains. Overnight Rishikesh or Haridwar.",
      },
      {
        dayNumber: 11,
        title: "Departure",
        description: "Breakfast and drop to station / airport. Char Dham yatra ends.",
      },
    ],
    coverPrompt: prompt("Char Dham Himalaya", "four sacred mountain valleys collage feel single wide landscape pilgrimage"),
    galleryPrompts: [
      prompt("Yamunotri trail", "forest path to Yamuna source shrine"),
      prompt("Gangotri temple", "Bhagirathi riverside shrine"),
      prompt("Kedarnath", "stone temple under snow peak"),
      prompt("Badrinath", "Alaknanda town with temple lights"),
    ],
  },
  {
    slug: "char-dham-yatra-by-helicopter",
    title: "Char Dham Yatra by Helicopter",
    category: "Religious",
    destinationSlug: "dehradun",
    destinationSlugs: ["dehradun", "yamunotri", "gangotri", "kedarnath", "badrinath", "uttarakhand"],
    imageSlugs: ["dehradun", "kedarnath", "badrinath"],
    stays: [
      "Same-day or 1–2N Dehradun / Sahastradhara belt hotels depending on operator slots",
      "Optional luxury hotel upgrade in Dehradun",
    ],
    openDepartures: 4,
    summary:
      "4 nights / 5 days Char Dham by helicopter from Dehradun — all four dhams with minimal trekking. From ₹1,85,000 pp.",
    description:
      "<p><strong>Why travellers book this:</strong> seniors and time-poor families complete Yamunotri, Gangotri, Kedarnath, and Badrinath with heli hops instead of 10+ road days.</p><p>Exact flight sequence depends on DGCA / operator weather windows. A road backup day is built into the quote.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    maxGroupSize: 6,
    priceFrom: 185000,
    isFeatured: true,
    mapLat: "30.3165",
    mapLng: "78.0322",
    seoTitle: "Char Dham Yatra by Helicopter from Dehradun | 4 Nights 5 Days",
    seoDescription:
      "Helicopter Char Dham package from Dehradun covering Yamunotri, Gangotri, Kedarnath and Badrinath with hotel nights and weather buffer.",
    includes: [
      "Helicopter sectors for all four dhams as per operator plan",
      "Dehradun hotel nights as itinerary",
      "Breakfast and dinner on hotel nights",
      "Airport / hotel transfers in Dehradun",
      "Temple visit coordination on ground",
    ],
    excludes: [
      "Flights to Dehradun",
      "VIP darshan fees",
      "Lunch and personal expenses",
      "Extra hotel nights if weather grounds flights",
      "Travel insurance",
    ],
    faqs: faq("May–June and September–October have the best heli windows; monsoon has higher cancellation risk.", [
      {
        title: "What if weather cancels a sector?",
        content:
          "Operators reshuffle the sequence or offer a buffer day. Full refund policies vary by operator — we share the live T&Cs before you pay.",
      },
      {
        title: "Weight limit?",
        content:
          "Typical heli passenger + bag limit is around 80 kg combined per person. Excess may need a separate flight or reduction of luggage.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Dehradun · briefing",
        description: "Check in. Weight check and yatra briefing. Overnight Dehradun.",
      },
      {
        dayNumber: 2,
        title: "Heli day — Yamunotri & Gangotri sector",
        description: "Fly the western dhams as sequenced by the operator. Return Dehradun overnight (or as slotted).",
      },
      {
        dayNumber: 3,
        title: "Heli day — Kedarnath & Badrinath sector",
        description: "Fly the eastern dhams. Darshan windows are short — follow ground staff instructions.",
      },
      {
        dayNumber: 4,
        title: "Weather buffer / pending sector",
        description: "Complete any pending dham or rest day in Dehradun if all four are done.",
      },
      {
        dayNumber: 5,
        title: "Departure",
        description: "Breakfast and airport / station drop. Trip ends.",
      },
    ],
    coverPrompt: prompt("Himalayan helicopter", "chopper approaching snow peaks near Kedarnath"),
    galleryPrompts: [
      prompt("Dehradun valley", "Doons foothills morning haze"),
      prompt("Kedarnath from air", "aerial shrine and amphitheatre peaks"),
      prompt("Badrinath valley", "aerial Alaknanda settlement"),
      prompt("Gangotri peaks", "Bhagirathi massif from air"),
    ],
  },
  {
    slug: "kashmir-great-lakes-trek",
    title: "Kashmir Great Lakes Trek",
    category: "Trekking",
    destinationSlug: "sonamarg",
    destinationSlugs: ["sonamarg", "naranag", "kashmir"],
    imageSlugs: ["sonamarg", "naranag", "gurez", "kashmir"],
    stays: [
      "Alpine tents on trail (twin sharing)",
      "Sleeping bag + foam mat provided",
      "Optional pre-trek night in Srinagar / Sonamarg on request",
    ],
    openDepartures: 8,
    summary:
      "7 nights / 8 days | Sonamarg to Naranag | Kashmir, India — alpine lakes, meadows, and high camps. From ₹17,999 pp.",
    description:
      "<p><strong>Why travellers book this:</strong> India’s most photogenic alpine-lake trek — Vishansar, Kishansar, Gadsar, Satsar, and Gangabal — with fully supported camping.</p><p><strong>Route:</strong> Sonamarg → Nichnai → lakes → Mahsaagundu → Naranag. Max altitude about 4,200 m. Moderate–difficult; prior weekend treks recommended.</p>",
    durationDays: 8,
    durationNights: 7,
    durationLabel: "7 nights / 8 days",
    difficulty: "challenging",
    maxGroupSize: 12,
    priceFrom: 17999,
    isFeatured: true,
    mapLat: "34.3032",
    mapLng: "75.2990",
    seoTitle: "Kashmir Great Lakes Trek | 7 Nights / 8 Days | Sonamarg to Naranag | Kashmir, India",
    seoDescription:
      "Book Kashmir Great Lakes Trek 7N/8D from Sonamarg to Naranag with camping, meals, permits, and certified trek leaders. Open departures.",
    includes: [
      ...trekIncludes,
      "Sonamarg to trailhead and Naranag exit transfers as listed",
      "Vegetarian + egg meals on trail (Jain on request with notice)",
    ],
    excludes: [
      ...trekExcludes,
      "Srinagar hotel before / after trek",
      "Any pony for personal rucksack (optional)",
    ],
    faqs: faq("July–early September is the classic window; snow patches linger early season.", [
      {
        title: "How fit do I need to be?",
        content:
          "You should be able to walk 5–6 hours with a daypack on consecutive days. Train with 4–5 km jogs / stair climbs for 3–4 weeks before the trek.",
      },
      {
        title: "Are toilets available?",
        content:
          "Trail camps use dig-and-cover or toilet tents. Carry biodegradable wet wipes and a small sanitizer.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Sonamarg base · brief & gear",
        description:
          "Arrive Sonamarg (from Srinagar, about 2.5–3 hours). Trek briefing, gear check, short acclimatization walk. Overnight Sonamarg camp / guest house.",
      },
      {
        dayNumber: 2,
        title: "Sonamarg to Nichnai",
        description:
          "Enter the trail past Shekdur meadows. Steady climb to Nichnai camp. Overnight alpine tents.",
      },
      {
        dayNumber: 3,
        title: "Nichnai to Vishansar / Kishansar",
        description:
          "Cross Nichnai Pass views and descend toward the twin lakes Vishansar and Kishansar. Camp by the lakes.",
      },
      {
        dayNumber: 4,
        title: "Vishansar to Gadsar via Gadsar Pass",
        description:
          "High pass day with dramatic ridgelines into the Gadsar valley. Camp near Gadsar Lake.",
      },
      {
        dayNumber: 5,
        title: "Gadsar to Satsar / Mentok",
        description:
          "Walk a chain of smaller lakes (Satsar). Meadow camping with mountain amphitheatre views.",
      },
      {
        dayNumber: 6,
        title: "Satsar to Gangabal / Nundkol",
        description:
          "Arrive at the iconic Gangabal–Nundkol lakes beneath Mt Harmukh. Camp at the lakes.",
      },
      {
        dayNumber: 7,
        title: "Gangabal to Naranag",
        description:
          "Long descent through pine forest to Naranag temple village. Celebrate the finish. Overnight Naranag / transfer toward Srinagar if listed.",
      },
      {
        dayNumber: 8,
        title: "Buffer / departure",
        description:
          "Morning buffer for weather delays or early transfer to Srinagar. Trek ends.",
      },
    ],
    coverPrompt: prompt("Kashmir Great Lakes", "alpine turquoise lake with snow peaks and meadow camp"),
    galleryPrompts: [
      prompt("Vishansar lake", "twin alpine lakes Kashmir trek"),
      prompt("Gadsar pass", "rocky high pass with trekkers distant"),
      prompt("Gangabal lake", "Harmukh peak reflecting in lake"),
      prompt("Naranag", "ancient temple village pine forest exit"),
    ],
  },
  {
    slug: "tarsar-marsar-trek",
    title: "Tarsar Marsar Trek",
    category: "Trekking",
    destinationSlug: "pahalgam",
    destinationSlugs: ["pahalgam", "aru-valley", "kashmir"],
    imageSlugs: ["pahalgam", "aru-valley", "betaab-valley", "sonamarg"],
    stays: ["Alpine tents on trail", "Aru / Pahalgam staging night as itinerary"],
    openDepartures: 6,
    summary:
      "5 nights / 6 days twin-lake trek from Aru Valley near Pahalgam — Tarsar and Marsar. From ₹14,999 pp.",
    description:
      "<p>A shorter Kashmir alpine classic than Great Lakes — twin high lakes, shepherd meadows, and pine approaches from Aru. Ideal first high-altitude camping trek in Kashmir.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 12,
    priceFrom: 14999,
    isFeatured: true,
    mapLat: "34.0910",
    mapLng: "75.2630",
    seoTitle: "Tarsar Marsar Trek | 5 Nights 6 Days from Aru Valley | Kashmir",
    seoDescription:
      "Tarsar Marsar Trek 5N/6D from Pahalgam / Aru with camping, meals, permits, and guided lake days.",
    includes: trekIncludes,
    excludes: trekExcludes,
    faqs: faq("July–September. Early July may still hold snow on the ridge between the lakes."),
    days: [
      {
        dayNumber: 1,
        title: "Pahalgam / Aru staging",
        description: "Reach Aru via Pahalgam. Briefing and overnight Aru camp / guest house.",
      },
      {
        dayNumber: 2,
        title: "Aru to Lidderwat",
        description: "Forest and meadow walk along the Lidder. Camp at Lidderwat.",
      },
      {
        dayNumber: 3,
        title: "Lidderwat to Tarsar",
        description: "Climb to Tarsar Lake amphitheatre. Camp beside the lake.",
      },
      {
        dayNumber: 4,
        title: "Tarsar to Marsar viewpoint · return camp",
        description: "Day hike toward Marsar views (camping rules near Marsar vary by season). Return toward Tarsar / Sundarsar belt camp.",
      },
      {
        dayNumber: 5,
        title: "Descend to Aru",
        description: "Long descent to Aru. Celebrate. Overnight Aru / Pahalgam.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description: "Transfer toward Srinagar or onward. Trek ends.",
      },
    ],
    coverPrompt: prompt("Tarsar lake Kashmir", "oval alpine lake ringed by peaks"),
    galleryPrompts: [
      prompt("Aru valley", "village meadow trailhead"),
      prompt("Lidderwat camp", "river meadow tents"),
      prompt("Marsar viewpoint", "high ridge lake vista"),
      prompt("Pahalgam pines", "forest descent path"),
    ],
  },
  {
    slug: "hampta-pass-chandratal-trek",
    title: "Hampta Pass Trek with Chandratal",
    category: "Trekking",
    destinationSlug: "manali",
    destinationSlugs: ["manali", "himachal"],
    imageSlugs: ["manali", "himachal"],
    stays: ["Camping on trail", "Optional Chandratal campsite night", "Manali pre/post on request"],
    openDepartures: 8,
    summary:
      "4 nights / 5 days Manali classic — cross Hampta Pass into Lahaul and visit Chandratal. From ₹8,999 pp.",
    description:
      "<p>India’s favourite crossover trek: green Kullu valleys to barren Lahaul in one pass day, with a Chandratal lake visit when roads / weather allow.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 8999,
    isFeatured: true,
    mapLat: "32.2396",
    mapLng: "77.1887",
    seoTitle: "Hampta Pass Trek with Chandratal | 4 Nights 5 Days from Manali | Himachal",
    seoDescription:
      "Hampta Pass trek 4N/5D from Manali with camping, trek meals, and Chandratal visit. Open summer departures.",
    includes: [...trekIncludes, "Manali to Jobra trailhead transfers as listed", "Chandratal visit when accessible"],
    excludes: trekExcludes,
    faqs: faq("Mid-June to mid-October. Chandratal road access is weather and landslide dependent."),
    days: [
      {
        dayNumber: 1,
        title: "Manali to Jobra · trek to Chika",
        description: "Drive to Jobra. Short trek to Chika camp beside the river. Overnight tents.",
      },
      {
        dayNumber: 2,
        title: "Chika to Balu ka Ghera",
        description: "Ascend through meadows and boulder fields to Balu ka Ghera. Overnight camp.",
      },
      {
        dayNumber: 3,
        title: "Cross Hampta Pass · Shea Goru",
        description: "Pass day (~4,270 m). Descend into Spiti-side landscapes to Shea Goru camp.",
      },
      {
        dayNumber: 4,
        title: "Shea Goru to Chatru · Chandratal",
        description: "Trek to Chatru roadhead. Drive toward Chandratal for lake time / camp when open; else overnight Chatru belt.",
      },
      {
        dayNumber: 5,
        title: "Return Manali",
        description: "Drive back to Manali via Rohtang / Atal Tunnel as open. Trek ends.",
      },
    ],
    coverPrompt: prompt("Hampta Pass", "rocky alpine saddle Himachal with trekkers distant"),
    galleryPrompts: [
      prompt("Chika meadows", "green Himachal river camp"),
      prompt("Hampta crossing", "snow patch on pass"),
      prompt("Chandratal lake", "crescent blue lake under moonlit peaks feel daylight"),
      prompt("Manali hills", "Beas valley pine slopes"),
    ],
  },
  {
    slug: "chopta-chandrashila-deoriatal-trek",
    title: "Chopta Chandrashila Trek with Deoriatal",
    category: "Trekking",
    destinationSlug: "chopta",
    destinationSlugs: ["chopta", "uttarakhand", "rishikesh", "haridwar"],
    imageSlugs: ["chopta", "uttarakhand", "rishikesh"],
    stays: ["Chopta / Makku camps or guest houses", "Deoriatal camping night", "Optional Rishikesh buffer"],
    openDepartures: 8,
    summary:
      "3 nights / 4 days easy Himalayan trek — Deoriatal lake, Tungnath temple, Chandrashila summit. From ₹6,999 pp.",
    description:
      "<p>Perfect first Himalayan trek: short days, huge Chaukhamba views, and India’s highest Shiva temple at Tungnath. Camping plus simple guest-house nights.</p>",
    durationDays: 4,
    durationNights: 3,
    durationLabel: "3 nights / 4 days",
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 6999,
    isFeatured: true,
    mapLat: "30.4550",
    mapLng: "79.1600",
    seoTitle: "Chopta Chandrashila Trek with Deoriatal | 3 Nights 4 Days | Uttarakhand",
    seoDescription:
      "Chopta Chandrashila and Deoriatal trek 3N/4D with camping, meals, and summit sunrise option. Beginner friendly.",
    includes: [...trekIncludes, "Rishikesh / Haridwar pickup on group departures when listed"],
    excludes: trekExcludes,
    faqs: faq("Year-round except heavy monsoon / deep winter snow on Chandrashila; best Mar–Jun and Sep–Nov."),
    days: [
      {
        dayNumber: 1,
        title: "Rishikesh / Haridwar to Sari · Deoriatal",
        description: "Drive to Sari village. Short trek to Deoriatal lake camp. Overnight tents by the lake.",
      },
      {
        dayNumber: 2,
        title: "Deoriatal to Chopta",
        description: "Descend and drive / trek toward Chopta meadows. Overnight Chopta camp or guest house.",
      },
      {
        dayNumber: 3,
        title: "Tungnath & Chandrashila summit",
        description:
          "Early climb to Tungnath temple, then Chandrashila peak for 360° Himalayan views. Return Chopta overnight.",
      },
      {
        dayNumber: 4,
        title: "Return plains",
        description: "Drive back to Rishikesh / Haridwar. Trek ends.",
      },
    ],
    coverPrompt: prompt("Chandrashila summit", "sunrise over Chaukhamba peaks from summit ridge"),
    galleryPrompts: [
      prompt("Deoriatal lake", "still lake reflecting Chaukhamba"),
      prompt("Tungnath temple", "stone shrine on meadow ridge"),
      prompt("Chopta meadows", "green bugyal with rhododendron"),
      prompt("Trek camp Chopta", "tents on meadow at dusk"),
    ],
  },
  {
    slug: "valley-of-flowers-hemkund-trek",
    title: "Valley of Flowers & Hemkund Sahib Trek",
    category: "Trekking",
    destinationSlug: "uttarakhand",
    destinationSlugs: ["uttarakhand", "haridwar", "rishikesh"],
    imageSlugs: ["uttarakhand", "haridwar", "rishikesh"],
    stays: ["Govindghat / Ghangaria guest houses", "Camping not inside the national park core"],
    openDepartures: 6,
    summary:
      "5 nights / 6 days monsoon classic — Valley of Flowers National Park plus Hemkund Sahib. From ₹10,999 pp.",
    description:
      "<p>UNESCO Valley of Flowers bloom walk combined with the sacred Hemkund Sahib climb. Guest-house based at Ghangaria with packed trail lunches.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 10999,
    isFeatured: true,
    mapLat: "30.7280",
    mapLng: "79.6050",
    seoTitle: "Valley of Flowers & Hemkund Sahib Trek | 5 Nights 6 Days | Uttarakhand",
    seoDescription:
      "Valley of Flowers and Hemkund Sahib trek 5N/6D from Haridwar with permits, stays, meals, and guided bloom walks.",
    includes: [
      ...trekIncludes,
      "National park entry facilitation",
      "Ghangaria guest-house nights",
    ],
    excludes: [
      ...trekExcludes,
      "Pony to Ghangaria / Hemkund (optional)",
    ],
    faqs: faq("Peak bloom mid-July to mid-August; park typically open June–October.", [
      {
        title: "Is this a camping trek?",
        content:
          "Nights are in Ghangaria guest houses. Day packs into the valley; camping inside the core park is not permitted.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Haridwar / Rishikesh to Govindghat / Joshimath belt",
        description: "Drive into the hills. Overnight Govindghat / Joshimath region.",
      },
      {
        dayNumber: 2,
        title: "Trek to Ghangaria",
        description: "Trek or pony ~10–13 km to Ghangaria base. Overnight guest house.",
      },
      {
        dayNumber: 3,
        title: "Valley of Flowers day",
        description: "Full-day guided walk into the valley for blooms and meadows. Return Ghangaria.",
      },
      {
        dayNumber: 4,
        title: "Hemkund Sahib",
        description: "Steep climb to Hemkund Sahib gurudwara and alpine lake. Return Ghangaria.",
      },
      {
        dayNumber: 5,
        title: "Descend to Govindghat · drive down",
        description: "Descend and drive toward Rishikesh / Haridwar corridor. Overnight plains or mid-hill.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description: "Buffer morning and drop. Trek ends.",
      },
    ],
    coverPrompt: prompt("Valley of Flowers", "Himalayan alpine meadow dense with wildflowers"),
    galleryPrompts: [
      prompt("Hemkund Sahib", "gurudwara beside high altitude lake"),
      prompt("Ghangaria village", "trek base town in valley"),
      prompt("Pushpawati river", "glacial stream through flower meadows"),
      prompt("Monsoon Himalaya", "misty green valley trail"),
    ],
  },
];
