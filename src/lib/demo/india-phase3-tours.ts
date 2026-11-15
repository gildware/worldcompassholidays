/**
 * Phase-3 pan-India bestsellers — Kailash, South pilgrimage, Kerala, Corbett, Kuari, Meghalaya.
 * Researched structures, rewritten operator voice. Images deferred.
 */
import type { KashmirTour } from "./kashmir-tours";

function prompt(place: string, scene: string) {
  return `Photorealistic ${place}, ${scene}, natural daylight, editorial travel photography, no readable text, 16:9 landscape`;
}

function faq(bestTime: string, extras: { title: string; content: string }[] = []) {
  return [
    { title: "Best time to travel?", content: bestTime },
    {
      title: "Group or private?",
      content:
        "Fixed departures run in small groups. Private cars and custom pacing are available on request.",
    },
    ...extras,
  ];
}

export const indiaPhase3Tours: KashmirTour[] = [
  {
    slug: "kailash-mansarovar-helicopter-yatra",
    title: "Kailash Mansarovar Yatra by Helicopter",
    category: "Religious",
    destinationSlug: "kathmandu",
    destinationSlugs: ["kathmandu"],
    imageSlugs: ["kathmandu"],
    stays: [
      "Kathmandu hotel nights as itinerary",
      "Nepalgunj / Simikot staging as operator plan",
      "Tibet side hotels / guest houses near Mansarovar & Darchen",
    ],
    openDepartures: 3,
    summary:
      "9 nights / 10 days heli-assisted Kailash yatra via Kathmandu — Mansarovar, Darchen, and Kailash parikrama support. From ₹2,85,000 pp.",
    description:
      "<p><strong>Why this version:</strong> the Nepal heli corridor shortens the hardest approach days while keeping Mansarovar and the outer kora in the plan. Exact hop sequence follows that season’s DGCA / Chinese permit window — we publish the live day plan before balance payment.</p><p>This is a high-altitude pilgrimage, not a sightseeing holiday. Fitness disclosure and travel insurance are mandatory.</p>",
    durationDays: 10,
    durationNights: 9,
    durationLabel: "9 nights / 10 days",
    difficulty: "challenging",
    maxGroupSize: 16,
    priceFrom: 285000,
    isFeatured: true,
    mapLat: "27.7172",
    mapLng: "85.3240",
    seoTitle: "Kailash Mansarovar Yatra by Helicopter from Kathmandu | 9 Nights 10 Days",
    seoDescription:
      "Helicopter Kailash Mansarovar yatra via Kathmandu with Mansarovar stay, Darchen staging, and parikrama support. Seasonal departures.",
    includes: [
      "Kathmandu hotels as itinerary",
      "Helicopter sectors as per operator plan",
      "Tibet-side hotels / guest houses on the circuit",
      "Vegetarian meals on most yatra days",
      "Permits and liaison support arranged by the operator",
      "Trip manager on group departures",
    ],
    excludes: [
      "International / domestic flights to Kathmandu",
      "Nepal / China visa fees where applicable",
      "Personal pony / porter on the kora",
      "Travel insurance and emergency evacuation",
      "Tips, laundry, and personal expenses",
    ],
    faqs: faq(
      "Typical operating window is May–September, subject to Tibet permits and weather. Heli days can reshuffle without notice.",
      [
        {
          title: "Do I walk the full parikrama?",
          content:
            "Most packages include the outer kora with pony/porter options. Aerial-only darshan variants are quoted separately if you cannot walk.",
        },
        {
          title: "What fitness level is required?",
          content:
            "You should be comfortable with multi-day altitude above 4,500 m. Cardiac, severe asthma, and recent surgeries usually need a doctor’s written clearance.",
        },
      ],
    ),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kathmandu · briefing",
        description:
          "Hotel check-in. Passport/permit document check and altitude briefing. Overnight Kathmandu.",
      },
      {
        dayNumber: 2,
        title: "Kathmandu preparations",
        description:
          "Temple visits if time allows, gear check, early night. Overnight Kathmandu.",
      },
      {
        dayNumber: 3,
        title: "Fly / drive to Nepalgunj or Simikot sector",
        description:
          "Move to the heli staging town as per that year’s plan. Overnight staging hotel.",
      },
      {
        dayNumber: 4,
        title: "Helicopter into Tibet corridor",
        description:
          "Heli hops toward Hilsa / Purang sector when weather opens. Immigration and road transfer toward Mansarovar belt. Overnight as allotted.",
      },
      {
        dayNumber: 5,
        title: "Mansarovar · holy bath / puja",
        description:
          "Lake rituals as permitted. Rest and hydrate. Overnight Mansarovar / nearby.",
      },
      {
        dayNumber: 6,
        title: "Drive to Darchen · kora briefing",
        description:
          "Transfer to Darchen at the foot of Kailash. Pony booking and medical check. Overnight Darchen.",
      },
      {
        dayNumber: 7,
        title: "Kailash parikrama day 1",
        description:
          "Start the outer kora toward Dirapuk / equivalent camp. Overnight trek lodge or camp.",
      },
      {
        dayNumber: 8,
        title: "Parikrama day 2 · Dolma La sector",
        description:
          "High pass day on the kora, then descend toward Zuthulphuk side. Overnight as itinerary.",
      },
      {
        dayNumber: 9,
        title: "Complete kora · return toward heli sector",
        description:
          "Finish walking days and reconnect to the heli / road exit plan. Overnight staging.",
      },
      {
        dayNumber: 10,
        title: "Return Kathmandu · buffer / depart",
        description:
          "Fly back toward Kathmandu. Buffer for weather delays; onward flights best kept flexible.",
      },
    ],
    coverPrompt: prompt("Mount Kailash", "pyramidal snow peak above arid plateau"),
    galleryPrompts: [
      prompt("Lake Mansarovar", "high altitude turquoise lake under Kailash"),
      prompt("Kailash parikrama trail", "pilgrims on rocky path"),
      prompt("Darchen village", "plateau town beneath sacred peak"),
      prompt("Kathmandu stupa", "Boudhanath prayer flags"),
    ],
  },
  {
    slug: "tirupati-balaji-darshan-package",
    title: "Tirupati Balaji Darshan Package",
    category: "Religious",
    destinationSlug: "tirupati",
    destinationSlugs: ["tirupati"],
    imageSlugs: ["tirupati"],
    stays: ["2N Tirupati / Tirumala category hotel as quoted"],
    openDepartures: 8,
    summary:
      "2 nights / 3 days Sri Venkateswara darshan — airport/station pickup, Tirumala visit, Padmavathi temple. From ₹8,999 pp.",
    description:
      "<p>Built around queue reality, not brochure fantasy. We stage you close enough for an early Tirumala push, keep Padmavathi Ammavari temple on the plains day, and spell out which darshan type is included before you pay.</p>",
    durationDays: 3,
    durationNights: 2,
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    maxGroupSize: 20,
    priceFrom: 8999,
    isFeatured: true,
    mapLat: "13.6288",
    mapLng: "79.4192",
    seoTitle: "Tirupati Balaji Package | 2 Nights 3 Days Darshan from Tirupati",
    seoDescription:
      "Tirupati Balaji 2N/3D with hotel, transfers, Tirumala darshan assistance, and Padmavathi temple visit.",
    includes: [
      "Airport / railway pickup and drop in Tirupati belt",
      "2 nights hotel with breakfast",
      "Transfers for Tirumala and local temples as itinerary",
      "Darshan assistance for the ticket type quoted",
    ],
    excludes: [
      "Special entry / VIP darshan fees unless listed in the quote",
      "Lunch and dinner unless MAP is selected",
      "Hair tonsure and personal pooja materials",
      "Flights / trains to Tirupati",
    ],
    faqs: faq("Year-round; Brahmotsavam and weekends mean longer waits — book mid-week when you can.", [
      {
        title: "Is VIP darshan guaranteed?",
        content:
          "Only if your voucher says so. Standard packages assist with available online slots; VIP is a paid upgrade subject to temple rules.",
      },
    ]),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Tirupati · settle",
        description:
          "Pickup from Renigunta / Tirupati airport or station. Hotel check-in, rest, optional local temple if arrival is early. Overnight Tirupati.",
      },
      {
        dayNumber: 2,
        title: "Tirumala darshan day",
        description:
          "Early transfer up the ghat to Tirumala. Darshan as per booked slot, time at the temple complex, return to plains. Overnight Tirupati.",
      },
      {
        dayNumber: 3,
        title: "Padmavathi temple · departure",
        description:
          "Morning visit to Sri Padmavathi Ammavari temple in Tiruchanur when scheduled, then drop to airport / station.",
      },
    ],
    coverPrompt: prompt("Tirumala temple", "gilded temple towers on green hill"),
    galleryPrompts: [
      prompt("Tirupati ghat road", "hill highway to Tirumala"),
      prompt("Padmavathi temple", "South Indian temple courtyard"),
      prompt("Tirupati town", "pilgrim town evening lights"),
      prompt("Temple queue hall", "devotees distant no readable text"),
    ],
  },
  {
    slug: "varanasi-ayodhya-spiritual-circuit",
    title: "Varanasi & Ayodhya Spiritual Circuit",
    category: "Religious",
    destinationSlug: "varanasi",
    destinationSlugs: ["varanasi", "ayodhya", "prayagraj"],
    imageSlugs: ["varanasi", "ayodhya", "prayagraj"],
    stays: ["2N Varanasi", "1–2N Ayodhya", "Optional Prayagraj night"],
    openDepartures: 6,
    summary:
      "4 nights / 5 days Kashi + Ram Mandir — Ganga aarti, Vishwanath corridor, Ayodhya darshan, optional Sangam. From ₹16,999 pp.",
    description:
      "<p>Two sacred cities without treating them like a checklist. Varanasi gets a real morning boat and an evening aarti; Ayodhya gets a paced Ram Mandir day instead of a same-evening turnaround.</p>",
    durationDays: 5,
    durationNights: 4,
    durationLabel: "4 nights / 5 days",
    difficulty: "easy",
    maxGroupSize: 16,
    priceFrom: 16999,
    isFeatured: true,
    mapLat: "25.3176",
    mapLng: "82.9739",
    seoTitle: "Varanasi Ayodhya Package | 4 Nights 5 Days Spiritual Circuit",
    seoDescription:
      "Varanasi and Ayodhya 4N/5D with Ganga aarti, temple darshan, hotels, and private transfers. Optional Prayagraj Sangam.",
    includes: [
      "Hotels with breakfast as itinerary",
      "Private vehicle for intercity and local transfers",
      "Assisted temple visits as listed",
      "Boat ride on the Ganga (shared / private as quoted)",
    ],
    excludes: [
      "Flights / trains",
      "Special darshan tickets unless listed",
      "Lunch, dinner, and personal pooja expenses",
      "Guide fees beyond inclusions",
    ],
    faqs: faq("October–March is most comfortable. Summers are harsh on ghat walks — start early."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Varanasi · evening aarti",
        description:
          "Hotel check-in. Sunset visit to Dashashwamedh for Ganga aarti. Overnight Varanasi.",
      },
      {
        dayNumber: 2,
        title: "Ghats · Vishwanath · Sarnath option",
        description:
          "Sunrise boat on the ghats, Kashi Vishwanath corridor darshan as permitted, optional Sarnath. Overnight Varanasi.",
      },
      {
        dayNumber: 3,
        title: "Drive to Ayodhya",
        description:
          "Road transfer to Ayodhya (timing depends on route and stops). Evening Sarayu side / temple lights. Overnight Ayodhya.",
      },
      {
        dayNumber: 4,
        title: "Ram Mandir darshan day",
        description:
          "Morning darshan window at Ram Janmabhoomi as per access rules, other local temples. Overnight Ayodhya or begin return.",
      },
      {
        dayNumber: 5,
        title: "Optional Prayagraj · departure",
        description:
          "Sangam stop if quoted, then drop to Varanasi / Ayodhya / Lucknow airport or station as booked.",
      },
    ],
    coverPrompt: prompt("Varanasi Ganga aarti", "lamps on Dashashwamedh ghat at dusk"),
    galleryPrompts: [
      prompt("Ayodhya Ram Mandir", "temple complex morning light"),
      prompt("Varanasi sunrise boat", "ghats from river mist"),
      prompt("Prayagraj Sangam", "river confluence boats"),
      prompt("Kashi alley", "old city lane toward temple"),
    ],
  },
  {
    slug: "kerala-backwaters-munnar-escape",
    title: "Kerala Backwaters & Munnar Escape",
    category: "Leisure",
    destinationSlug: "alleppey",
    destinationSlugs: ["alleppey", "munnar", "cochin", "kerala"],
    imageSlugs: ["alleppey", "munnar", "cochin", "kerala"],
    stays: ["1N Kochi / arrival", "2N Munnar", "1N Alleppey houseboat or resort", "Buffer as quoted"],
    openDepartures: 6,
    summary:
      "5 nights / 6 days Kerala classic — Fort Kochi, Munnar tea hills, overnight Alleppey houseboat. From ₹22,999 pp.",
    description:
      "<p>The South India reset that still feels unhurried: one heritage evening in Kochi, two nights in the tea line so you are not day-tripping Munnar, and a proper overnight houseboat — not a two-hour tourist canoe sold as “backwaters.”</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 22999,
    isFeatured: true,
    mapLat: "9.4981",
    mapLng: "76.3388",
    seoTitle: "Kerala Backwaters & Munnar Package | 5 Nights 6 Days from Kochi",
    seoDescription:
      "Kerala 5N/6D with Kochi, Munnar tea estates, and Alleppey overnight houseboat. Private cab and hotels.",
    includes: [
      "Hotels / houseboat as itinerary (twin sharing)",
      "Daily breakfast; houseboat meals as per boat plan",
      "Private AC vehicle for transfers and sightseeing",
      "Kochi airport pickup and drop",
    ],
    excludes: [
      "Flights to Kochi",
      "Lunch / dinner on hotel days unless listed",
      "Elephant rides, boating upgrades, and entry tickets",
      "Personal expenses and tips",
    ],
    faqs: faq("September–March is peak comfort. April–May is hotter; houseboat AC helps."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Kochi · Fort Kochi evening",
        description:
          "Airport pickup. Optional Chinese fishing nets / Jew Town stroll if you land early. Overnight Kochi / Ernakulam.",
      },
      {
        dayNumber: 2,
        title: "Kochi to Munnar",
        description:
          "Drive into the hills with spice / waterfall stops as open. Check in to a tea-estate belt hotel. Overnight Munnar.",
      },
      {
        dayNumber: 3,
        title: "Munnar full day",
        description:
          "Tea museum / estate views, Eravikulam National Park if tickets allow, photo points. Overnight Munnar.",
      },
      {
        dayNumber: 4,
        title: "Munnar to Alleppey houseboat",
        description:
          "Descend to the backwaters. Board overnight houseboat for canals and lagoon sunset. Overnight on boat (or lakeside resort if boat sold out).",
      },
      {
        dayNumber: 5,
        title: "Disembark · Kochi buffer",
        description:
          "Morning houseboat breakfast, checkout around noon, transfer toward Kochi. Soft evening. Overnight Kochi.",
      },
      {
        dayNumber: 6,
        title: "Departure",
        description: "Airport drop with flight buffer.",
      },
    ],
    coverPrompt: prompt("Alleppey houseboat", "traditional kettuvallam on green backwater canal"),
    galleryPrompts: [
      prompt("Munnar tea plantations", "rolling green tea bushes mist"),
      prompt("Fort Kochi", "Chinese fishing nets at sunset"),
      prompt("Vembanad lagoon", "wide backwater evening light"),
      prompt("Kerala toddy shop landscape", "palm-lined canal village"),
    ],
  },
  {
    slug: "manali-leh-highway-expedition",
    title: "Manali to Leh Highway Expedition",
    category: "Adventure",
    destinationSlug: "manali",
    destinationSlugs: ["manali", "leh", "ladakh", "himachal"],
    imageSlugs: ["manali", "leh", "ladakh", "himachal"],
    stays: ["1N Manali", "1N Jispa / Keylong belt", "1N Sarchu or temporary camp", "2–3N Leh"],
    openDepartures: 5,
    summary:
      "6 nights / 7 days Manali–Leh classic — Atal Tunnel, Baralacha, More Plains, Tanglang La, then Leh buffer. From ₹29,999 pp.",
    description:
      "<p>The other great Ladakh approach. We refuse the 18-hour single-day torture some operators sell — Jispa/Keylong and a high-camp night keep AMS risk and driver fatigue in check.</p>",
    durationDays: 7,
    durationNights: 6,
    durationLabel: "6 nights / 7 days",
    difficulty: "challenging",
    maxGroupSize: 10,
    priceFrom: 29999,
    isFeatured: true,
    mapLat: "32.2396",
    mapLng: "77.1887",
    seoTitle: "Manali to Leh Highway Package | 6 Nights 7 Days via Baralacha & Tanglang La",
    seoDescription:
      "Manali–Leh road trip 6N/7D with paced high passes, overnight breaks, and Leh acclimatisation nights.",
    includes: [
      "Hotels / camps as itinerary",
      "Breakfast and dinner on most nights",
      "Private vehicle Manali to Leh",
      "Driver allowance, tolls, and permits guidance",
    ],
    excludes: [
      "Flights from Leh",
      "Lunch and adventure add-ons",
      "Oxygen cans and personal medication",
      "Travel insurance",
    ],
    faqs: faq("July–September is the reliable window. June and October need landslide / snow buffers."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Manali",
        description: "Rest, briefing, early sleep. Overnight Manali.",
      },
      {
        dayNumber: 2,
        title: "Manali to Jispa / Keylong",
        description:
          "Atal Tunnel into Lahaul. Overnight Jispa or Keylong belt.",
      },
      {
        dayNumber: 3,
        title: "Toward Sarchu / high camp",
        description:
          "Baralacha La and the plateau camps. Overnight Sarchu or temporary high camp as open.",
      },
      {
        dayNumber: 4,
        title: "Sarchu to Leh via More Plains & Tanglang La",
        description:
          "Long desert highway day into Leh. Overnight Leh.",
      },
      {
        dayNumber: 5,
        title: "Leh rest / soft local",
        description: "Mandatory easy day after the highway. Overnight Leh.",
      },
      {
        dayNumber: 6,
        title: "Leh monasteries or Nubra day option",
        description:
          "Shey–Thiksey–Hemis circuit, or a paid Nubra day if the group is strong. Overnight Leh.",
      },
      {
        dayNumber: 7,
        title: "Fly out Leh",
        description: "Airport transfer. Trip ends.",
      },
    ],
    coverPrompt: prompt("Manali Leh highway", "hairpin mountain road high Himalayas"),
    galleryPrompts: [
      prompt("Baralacha La", "snow pass Himachal Ladakh border"),
      prompt("More Plains", "wide high desert plateau road"),
      prompt("Tanglang La", "prayer flags high pass"),
      prompt("Leh arrival", "Indus valley town evening"),
    ],
  },
  {
    slug: "jim-corbett-safari-getaway",
    title: "Jim Corbett Safari Getaway",
    category: "Adventure",
    destinationSlug: "jim-corbett",
    destinationSlugs: ["jim-corbett", "uttarakhand"],
    imageSlugs: ["jim-corbett", "uttarakhand"],
    stays: ["2N jungle resort / lodge near Ramnagar or Bijrani / Jhirna access"],
    openDepartures: 8,
    summary:
      "2 nights / 3 days Corbett — resort stay, jeep safari zones as allotted, Kosi river evening. From ₹9,999 pp.",
    description:
      "<p>A short wildlife break done properly: we do not promise a tiger on every drive, but we do book safari permits early, pick resorts with sensible gate access, and keep a second safari where the zone allows.</p>",
    durationDays: 3,
    durationNights: 2,
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    maxGroupSize: 12,
    priceFrom: 9999,
    isFeatured: true,
    mapLat: "29.5300",
    mapLng: "78.7747",
    seoTitle: "Jim Corbett Package | 2 Nights 3 Days Safari from Ramnagar",
    seoDescription:
      "Jim Corbett 2N/3D with jungle resort, jeep safari permits, and meals. Open wildlife season departures.",
    includes: [
      "2 nights resort stay with breakfast and dinner",
      "Jeep safari as per permit (usually 1–2 drives)",
      "Ramnagar pickup / drop assistance on group dates",
    ],
    excludes: [
      "Safari camera fees and zone upgrades",
      "Lunch unless listed",
      "Transport from Delhi / Kathgodam unless quoted",
      "Personal expenses",
    ],
    faqs: faq("Mid-November to June for most tourism zones. Monsoon closes several core areas."),
    days: [
      {
        dayNumber: 1,
        title: "Arrive Corbett · evening at leisure",
        description:
          "Check in to the resort. Nature walk or river-side time if the property allows. Overnight Corbett.",
      },
      {
        dayNumber: 2,
        title: "Safari day",
        description:
          "Morning jeep safari in the allotted zone. Afternoon second safari or spa / pool downtime. Overnight resort.",
      },
      {
        dayNumber: 3,
        title: "Optional morning safari · depart",
        description:
          "Early drive if a second morning permit is included, then checkout and onward drop.",
      },
    ],
    coverPrompt: prompt("Jim Corbett forest", "sal forest jeep track morning mist"),
    galleryPrompts: [
      prompt("Corbett jeep safari", "open jeep on jungle road"),
      prompt("Kosi river Corbett", "river belted forest"),
      prompt("Corbett resort", "cottage in forest garden"),
      prompt("Tiger habitat grassland", "tall grass clearing wildlife landscape"),
    ],
  },
  {
    slug: "kuari-pass-trek",
    title: "Kuari Pass Trek",
    category: "Trekking",
    destinationSlug: "joshimath",
    destinationSlugs: ["joshimath", "uttarakhand", "rishikesh"],
    imageSlugs: ["joshimath", "uttarakhand", "rishikesh"],
    stays: ["Joshimath / Auli belt staging", "Forest and meadow camps toward Kuari Pass"],
    openDepartures: 6,
    summary:
      "5 nights / 6 days Curzon Trail classic — Joshimath to Kuari Pass with Chaukhamba and Nanda Devi views. From ₹9,499 pp.",
    description:
      "<p>Lord Curzon’s old approach still earns its fame: oak forests, bugyal camps, and a pass morning that can show half the Garhwal skyline when clouds behave. We keep walking days honest — no 12-hour ‘easy’ marketing.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 9499,
    isFeatured: true,
    mapLat: "30.5550",
    mapLng: "79.5640",
    seoTitle: "Kuari Pass Trek | 5 Nights 6 Days from Joshimath | Uttarakhand",
    seoDescription:
      "Kuari Pass trek 5N/6D with camping, meals, and Chaukhamba viewpoint days. Open spring and autumn departures.",
    includes: [
      "Camping / guest-house nights as itinerary",
      "Trek meals on trail days",
      "Certified trek leader",
      "Permits and camping support",
      "Rishikesh / Haridwar to Joshimath transport on group dates",
    ],
    excludes: [
      "Personal trekking gear",
      "Porter for personal bags (add-on)",
      "Travel insurance",
      "Tips and personal snacks",
    ],
    faqs: faq("April–June and September–November. Winter needs snow gear and flexible camps."),
    days: [
      {
        dayNumber: 1,
        title: "Drive to Joshimath",
        description: "Long transfer from Rishikesh / Haridwar. Briefing. Overnight Joshimath belt.",
      },
      {
        dayNumber: 2,
        title: "Joshimath to trailhead · first camp",
        description: "Drive to Dhak / Tugasi sector and trek to the first forest camp. Overnight tents.",
      },
      {
        dayNumber: 3,
        title: "Forest to meadow camp",
        description: "Climb into open bugyals with peak glimpses. Overnight tents.",
      },
      {
        dayNumber: 4,
        title: "Kuari Pass day",
        description:
          "Push to Kuari Pass for Chaukhamba / Nanda Devi views when clear, return to high camp. Overnight tents.",
      },
      {
        dayNumber: 5,
        title: "Descend to roadhead · Joshimath",
        description: "Downhill to the vehicle point. Overnight Joshimath.",
      },
      {
        dayNumber: 6,
        title: "Return plains",
        description: "Drive toward Rishikesh / Haridwar. Trek ends.",
      },
    ],
    coverPrompt: prompt("Kuari Pass", "alpine pass panorama Chaukhamba peaks"),
    galleryPrompts: [
      prompt("Garhwal bugyal", "meadow camp with snow peaks"),
      prompt("Joshimath hills", "mountain town valley"),
      prompt("Oak forest trail", "trek path Uttarakhand"),
      prompt("Auli meadow view", "ski meadow near Joshimath"),
    ],
  },
  {
    slug: "meghalaya-living-root-circuit",
    title: "Meghalaya Living Root Circuit",
    category: "Leisure",
    destinationSlug: "shillong",
    destinationSlugs: ["shillong", "cherrapunji", "meghalaya"],
    imageSlugs: ["shillong", "cherrapunji", "meghalaya"],
    stays: ["2N Shillong", "2N Cherrapunji / Sohra", "1N Dawki / Shnongpdeng optional"],
    openDepartures: 5,
    summary:
      "5 nights / 6 days Meghalaya — Shillong, Sohra waterfalls, double-decker root bridge trek, Dawki river. From ₹19,999 pp.",
    description:
      "<p>Northeast humidity, clean rivers, and the root-bridge walk people actually come for. We stage two nights in Sohra so the double-decker day is not a brutal same-day rush from Shillong.</p>",
    durationDays: 6,
    durationNights: 5,
    durationLabel: "5 nights / 6 days",
    difficulty: "moderate",
    maxGroupSize: 14,
    priceFrom: 19999,
    isFeatured: true,
    mapLat: "25.5788",
    mapLng: "91.8933",
    seoTitle: "Meghalaya Package | 5 Nights 6 Days Shillong Cherrapunji Dawki",
    seoDescription:
      "Meghalaya 5N/6D with Shillong, Cherrapunji waterfalls, living root bridge trek, and Dawki boating. Group and private options.",
    includes: [
      "Hotels as itinerary with breakfast",
      "Private vehicle from Guwahati / Shillong as quoted",
      "Local guide for root-bridge trek day",
      "Sightseeing as listed",
    ],
    excludes: [
      "Flights to Guwahati",
      "Lunch, dinner, and Dawki boat fees unless listed",
      "Permit fees if rules change",
      "Personal expenses",
    ],
    faqs: faq("October–April for clearer skies. June–September is waterfall season but trails are wet and leechy."),
    days: [
      {
        dayNumber: 1,
        title: "Guwahati to Shillong",
        description:
          "Pickup and drive to Shillong (about 3–4 hours). Ward’s Lake / local market if time. Overnight Shillong.",
      },
      {
        dayNumber: 2,
        title: "Shillong soft day · toward Sohra",
        description:
          "Elephant Falls or Shillong Peak, then transfer to Cherrapunji / Sohra. Overnight Sohra.",
      },
      {
        dayNumber: 3,
        title: "Root bridge trek day",
        description:
          "Guided trek to the double-decker living root bridge (Nongriat) with stair fitness required. Return Sohra. Overnight Sohra.",
      },
      {
        dayNumber: 4,
        title: "Sohra waterfalls · Dawki",
        description:
          "Nohkalikai / Seven Sisters viewpoints as open, then drive to Dawki–Shnongpdeng for the Umngot river. Overnight Dawki belt or return Shillong as quoted.",
      },
      {
        dayNumber: 5,
        title: "Dawki morning · Shillong",
        description:
          "Optional boat on clear water days, transfer back to Shillong. Overnight Shillong.",
      },
      {
        dayNumber: 6,
        title: "Depart Guwahati",
        description: "Drive to Guwahati airport / station with buffer.",
      },
    ],
    coverPrompt: prompt("Living root bridge Meghalaya", "double decker root bridge in jungle gorge"),
    galleryPrompts: [
      prompt("Dawki Umngot river", "crystal clear river boats"),
      prompt("Nohkalikai falls", "waterfall into green gorge"),
      prompt("Shillong city", "hill town pine roads"),
      prompt("Sohra cliffs", "monsoon clouds over plateau"),
    ],
  },
];
