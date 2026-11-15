/**
 * Locked-format tour — Manali–Leh Bike Trip (Batch 1 India Set B #3).
 * Classic high-altitude self-ride: Rohtang, Baralacha, Nubra, Pangong, twin acclimatisation days.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const manaliLehBikeTripCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Adventure" },
  { kind: "style", title: "Adventure" },
  {
    kind: "faq",
    title: "Is motorcycle rental included in the price?",
    content:
      "Yes for the quoted package — one Royal Enfield 350cc or Himalayan (or similar) per rider, with fuel on riding days between Manali and Leh. Damage security deposit, spare bike days, and personal riding gear are separate; we list deposit amount before you pay.",
  },
  {
    kind: "faq",
    title: "Do I need prior high-altitude riding experience?",
    content:
      "You should be comfortable on a geared motorcycle and have ridden in mountains before. This is rated difficult: long days above 4,000 m, gravel patches, and cold passes. Pillion riders travel in the backup SUV on the toughest pass days if they prefer.",
  },
  {
    kind: "before_you_go",
    title: "Altitude & acclimatisation",
    content:
      "We keep rest time in Manali (Day 1) and Leh (Day 5). Hydrate, avoid alcohol on pass nights, and report headache or nausea early — the backup vehicle can take you down if needed.",
  },
  {
    kind: "include",
    title: "Motorcycle rental with fuel on Manali–Leh riding days",
  },
  {
    kind: "include",
    title: "Backup SUV / luggage vehicle with mechanic support",
  },
  {
    kind: "exclude",
    title: "Bike damage deposit & riding insurance",
  },
  { kind: "facility", title: "Motorcycle rental" },
  { kind: "facility", title: "Backup support vehicle" },
  { kind: "facility", title: "Inner Line permits" },
  {
    kind: "include",
    title: "Breakfast + dinner on most nights (MAP; camp meals on Sarchu/Pangong)",
  },
  { kind: "include", title: "Motorcycle rental with fuel on Manali–Leh riding days" },
  { kind: "include", title: "Backup SUV with driver, mechanic, and luggage" },
  { kind: "include", title: "Inner Line Permit coordination for Ladakh" },
  { kind: "include", title: "Trip captain / route lead on highway" },
  { kind: "include", title: "Driver & crew allowances, tolls & parking" },
  { kind: "exclude", title: "Flights to Manali / from Leh" },
  { kind: "exclude", title: "Lunch en route (unless listed)" },
  { kind: "exclude", title: "Gloves, jackets, or riding boots (rental on request)" },
  {
    kind: "exclude",
    title: "Pillion on bike for full highway (optional SUV seat instead)",
  },
  { kind: "exclude", title: "Travel insurance with adventure sports cover" },
];

export const tourManaliLehBikeTrip: TourFormat = {
  slug: "manali-leh-bike-trip",
  general: {
    title: "Manali–Leh Bike Trip",
    summary:
      "Ride the classic highway — Rohtang, Baralacha, Tanglang La, then Nubra and Pangong from Leh. Bike, fuel, backup SUV, and acclimatisation days from ₹34,999 a rider (min. 2 bikes).",
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
    destinationSlugs: ["manali", "leh", "ladakh", "himachal"],
    primaryDestinationSlug: "manali",
    address: "Manali bus stand or Kullu–Manali airport (KUU) pickup",
    mapLat: "32.2396",
    mapLng: "77.1887",
    mapZoom: 8,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Manali · bike handover · acclimatisation",
        morning:
          "Meet the trip lead in Manali. Paperwork, bike allotment, and a slow walk in Old Manali or the Beas riverfront.",
        afternoon:
          "Short familiarisation ride to Solang meadow roads (no pass crossing). Backup SUV carries luggage from here on highway days.",
        evening:
          "Riding safety briefing, route map, and early dinner. Overnight Manali hotel.",
        imageKey: "tours/manali-leh-bike-trip-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Manali · Rohtang · Keylong / Jispa",
        morning:
          "Early start for Rohtang Pass (permit check). Descend into Lahaul — Gramphu, Khoksar, and Chandra valley views.",
        afternoon:
          "Lunch stop in Keylong; continue to Jispa along the Bhaga river. Bike fuel top-up; mechanic checks chains.",
        evening: "Dinner and overnight Jispa or Keylong guest house.",
        imageKey: "tours/manali-leh-bike-trip-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Jispa · Baralacha La · Sarchu",
        morning:
          "Cross Darcha and climb to Baralacha La (4,890 m). Photo stop at Suraj Tal if snow allows.",
        afternoon:
          "Drop into Sarchu plateau — long straight skyline ride. Settle into tented or basic camp (oxygen available).",
        evening:
          "Light dinner, hydrate, and early sleep — tomorrow’s passes start early.",
        imageKey: "tours/manali-leh-bike-trip-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Sarchu · Naki La · Lachulung · Tanglang La · Leh",
        morning:
          "Ride Gata Loops, Naki La, and Lachulung La through the Pang corridor. Breakfast at a dhaba en route.",
        afternoon:
          "Cross Tanglang La (5,328 m) and descend to Leh market. Hand bikes to hotel parking; walking only tonight.",
        evening: "Celebratory dinner on Leh main bazaar road. Overnight Leh hotel.",
        imageKey: "tours/manali-leh-bike-trip-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Leh acclimatisation · monasteries",
        morning:
          "No riding — sleep in. Optional slow visit to Hall of Fame and Shanti Stupa with the backup cab.",
        afternoon:
          "Thiksey monastery terraces for valley views. Bike service check if needed.",
        evening: "Free market walk; pack layers for cold Nubra morning.",
        imageKey: "tours/manali-leh-bike-trip-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Leh · Khardung La · Nubra Valley",
        morning:
          "Ride over Khardung La into Nubra. Descend to Diskit for lunch.",
        afternoon:
          "Hunder sand dunes and double-hump camels (short walk, not a long camel tour). Check in at camp or guest house.",
        evening: "Dinner under clear Nubra skies. Overnight Hunder / Diskit.",
        imageKey: "tours/manali-leh-bike-trip-d6.jpg",
      },
      {
        dayNumber: 7,
        title: "Nubra · Shyok route · Pangong Tso",
        morning:
          "Ride the Shyok riverside road toward Pangong (route opens seasonally — fallback via Leh–Chang La if closed).",
        afternoon:
          "Reach Pangong lake shore; walk the blue band at Spangmik or Tangtse camp.",
        evening: "Camp or cottage dinner facing the lake. Overnight Pangong.",
        imageKey: "tours/manali-leh-bike-trip-d7.jpg",
      },
      {
        dayNumber: 8,
        title: "Pangong · Leh · fly out or ride handover",
        morning:
          "Sunrise photos, breakfast, and ride or transfer back to Leh (riders who fly today leave bikes for collection).",
        afternoon:
          "Drop at Leh airport or Manali-bound travellers continue with the backup vehicle plan agreed at booking.",
        evening:
          "Tour ends at Leh airport or agreed Manali drop for extended riders.",
        imageKey: "tours/manali-leh-bike-trip-d8.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this ride:</strong> the Manali–Leh highway is still the defining Indian motorcycle pilgrimage — high passes, Lahaul camp nights, and Ladakh lake epilogue without stitching ad-hoc bikes.</p>",
      "<p><strong>Stays (7 nights):</strong> Manali hotel · Jispa/Keylong · Sarchu camp · Leh (2 nights) · Nubra · Pangong. All twin-share; single riders get solo-bike surcharge and room upgrade quote.</p>",
      "<p><strong>Bike & fuel:</strong> rental and fuel on riding days Manali through Leh plus Nubra/Pangong loops are included. Refundable damage deposit, puncture/tow beyond included support, and extra rest days are excluded.</p>",
      "<p><strong>How to book:</strong> share licence scans, rider experience, and whether pillion joins the SUV on pass days. Permits and convoy rules are handled by the trip lead once dates lock.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 34999,
    currency: "INR",
    discounts: [{ name: "4 riders same departure", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is motorcycle rental included in the price?",
      "Do I need prior high-altitude riding experience?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can a non-rider partner join?",
        content:
          "Yes — they travel in the backup SUV with luggage and can swap to the bike on easy Leh days. Same hotel room; pillion supplement not charged unless they ride daily.",
      },
      {
        title: "When is the road typically open?",
        content:
          "Manali–Leh usually mid-June to late September depending on snow and BRO openings. We confirm pass status two weeks before departure and pivot dates if needed.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner on most nights (MAP; camp meals on Sarchu/Pangong)",
      "Motorcycle rental with fuel on Manali–Leh riding days",
      "Backup SUV with driver, mechanic, and luggage",
      "Inner Line Permit coordination for Ladakh",
      "Trip captain / route lead on highway",
      "Driver & crew allowances, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Bike damage deposit & riding insurance",
      "Flights to Manali / from Leh",
      "Lunch en route (unless listed)",
      "Gloves, jackets, or riding boots (rental on request)",
      "Pillion on bike for full highway (optional SUV seat instead)",
      "Tips & personal expenses",
      "Travel insurance with adventure sports cover",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Altitude & acclimatisation",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Adventure", "Private / Independent"],
    facilityTitles: [
      "Motorcycle rental",
      "Backup support vehicle",
      "Inner Line permits",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/manali-leh-bike-trip-cover.jpg",
    cover: "tours/manali-leh-bike-trip-cover.jpg",
    gallery: [
      "tours/manali-leh-bike-trip-g1.jpg",
      "tours/manali-leh-bike-trip-g2.jpg",
      "tours/manali-leh-bike-trip-g3.jpg",
      "tours/manali-leh-bike-trip-g4.jpg",
    ],
    seoImage: "tours/manali-leh-bike-trip-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Manali–Leh Bike Trip | 7N/8D High-Altitude Ride",
    seoDescription:
      "Request the classic Manali–Leh motorcycle trip — bike, fuel, backup SUV, Nubra & Pangong. From ₹34,999 per rider.",
    facebookTitle: "Manali–Leh Bike Trip — passes & lakes",
    facebookDescription:
      "Rohtang to Tanglang La, then Nubra and Pangong with acclimatisation built in.",
    twitterTitle: "Manali–Leh Bike | 7N/8D",
    twitterDescription:
      "Highway ride · backup SUV · Ladakh lakes. From ₹34,999.",
    published: true,
  },
};
