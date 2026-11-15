/**
 * Locked-format tour — Gulmarg Beginner Ski Package (Batch B #1).
 * Winter snow focus: lessons + gondola, overnight on the meadow.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const gulmargSkiCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Adventure" },
  { kind: "style", title: "Winter Sports" },
  {
    kind: "faq",
    title: "Do I need prior skiing experience?",
    content:
      "No. This package is built for first-timers: hire kit, a beginner lesson block, and gentle slopes near the meadow. Intermediate guests can upgrade lesson level when booking.",
  },
  {
    kind: "faq",
    title: "Are ski kit and lessons included?",
    content:
      "One beginner group lesson and standard ski/snowboard kit hire for the lesson day are included as quoted. Gondola tickets, extra lesson hours, and guide tips are paid locally — ranges shared before you confirm.",
  },
  {
    kind: "faq",
    title: "When is the best ski window?",
    content:
      "Typically late December through February for reliable snow on the meadow and Phase I. Early December and March depend on snowfall. We confirm snow reports before you lock flights.",
  },
  {
    kind: "before_you_go",
    title: "Winter kit",
    content:
      "Pack waterproof gloves, warm layers, sunglasses or goggles, and lip balm. Hire boots should fit snug — say your shoe size in the request so the shop is ready.",
  },
  {
    kind: "before_you_go",
    title: "Altitude & fitness",
    content:
      "Gulmarg sits around 2,650 m. Pace is easy off-snow, but skiing uses new muscles — expect mild soreness Day 2. Tell us if you have knee or heart concerns.",
  },
  {
    kind: "facility",
    title: "Ski lesson arrangement",
  },
  {
    kind: "facility",
    title: "Ski kit hire desk",
  },
  {
    kind: "include",
    title: "1 beginner ski/snowboard lesson (group)",
  },
  {
    kind: "include",
    title: "Standard ski/snowboard kit hire for lesson day",
  },
  {
    kind: "exclude",
    title: "Extra ski lesson hours / private coach",
  },
  {
    kind: "exclude",
    title: "Ski lift / Gondola tickets beyond quoted lesson access",
  },
];

export const tourGulmargBeginnerSki: TourFormat = {
  slug: "gulmarg-beginner-ski-package",
  general: {
    title: "Gulmarg Beginner Ski Package",
    summary:
      "Learn on the meadow — overnight Gulmarg, beginner lesson, kit hire, and Gondola views when weather allows. Private cab from Srinagar, twin share, from ₹12,999 a person (min. 2).",
    category: "Adventure",
    availability: "dates",
    durationDays: 4,
    durationNights: 3,
    durationUnit: "days",
    durationLabel: "3 nights / 4 days",
    difficulty: "moderate",
    minPeople: 2,
    maxGroupSize: 8,
    minDayBeforeBooking: 7,
    isFeatured: true,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["kashmir", "srinagar", "gulmarg", "tangmarg"],
    primaryDestinationSlug: "gulmarg",
    address: "Srinagar Airport (SXR) pickup",
    mapLat: "34.0484",
    mapLng: "74.3805",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Srinagar · transfer to Gulmarg",
        morning:
          "Meet your driver at Srinagar Airport. Drive via Tangmarg into Gulmarg (about 1.5–2 hours, longer in snow). Roads can be slow — keep warm layers in the cabin bag.",
        afternoon:
          "Check in at a meadow-side hotel. Short orientation walk; visit the ski hire desk to confirm boot size for tomorrow’s lesson.",
        evening: "Dinner at the hotel; overnight Gulmarg.",
        imageKey: "tours/gulmarg-beginner-ski-package-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Beginner lesson day on the meadow",
        morning:
          "After breakfast, collect kit and join your beginner group lesson on gentle slopes near the meadow. Instructors pace for first-timers.",
        afternoon:
          "Free practice on the nursery area or a short Gondola Phase I ride for views (tickets extra unless your lesson package includes lift access that day).",
        evening: "Hot kahwa, stretch, dinner. Overnight Gulmarg.",
        imageKey: "tours/gulmarg-beginner-ski-package-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Second snow day · Gondola or more practice",
        morning:
          "Optional second practice block or private add-on lesson (extra). Clear mornings are best for photos of the Pir Panjal snow line.",
        afternoon:
          "Gondola Phase I to Kongdori when tickets and weather allow; Phase II only if conditions and queues permit. Or a quiet meadow walk if lifts are closed.",
        evening: "Dinner and overnight Gulmarg.",
        imageKey: "tours/gulmarg-beginner-ski-package-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Return to Srinagar Airport",
        morning:
          "Breakfast, checkout, and drive down to Srinagar Airport. Keep a generous buffer in snow season (we recommend 4 hours before domestic flights). Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/gulmarg-beginner-ski-package-d4.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this package:</strong> Gulmarg is India’s best-known beginner ski base. You sleep on the meadow, get a proper first lesson with kit, and still see the Gondola when weather cooperates — without a long leisure circuit.</p>",
      "<p><strong>Stays (3 nights):</strong> Apple Tree Resorts or similar in Gulmarg (or same 3-star snow-season category). All nights on or near the meadow so you are ready early for lessons.</p>",
      "<p><strong>What you get:</strong> private Innova/Dzire Srinagar Airport ↔ Gulmarg, breakfast and dinner at the hotel each night (MAP), one beginner group lesson, and standard kit hire for the lesson day. Gondola tickets and extra lesson hours are listed before you confirm.</p>",
      "<p><strong>Season note:</strong> snow and lift status change daily. If lessons are cancelled for weather, we rearrange practice time or a scenic day and note any unused lesson credit with the operator.</p>",
      "<p><strong>How to book:</strong> pick a winter start date and send a request with shoe sizes. Nothing is charged until you accept the confirmed trip.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 12999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Do I need prior skiing experience?",
      "Are ski kit and lessons included?",
      "When is the best ski window?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Which hotel is used in Gulmarg?",
        content:
          "Apple Tree Resorts or similar meadow-side 3-star category. Exact name is confirmed in writing before payment; snow-season sell-outs may mean a same-category substitute closer to Tangmarg with transfers included.",
      },
      {
        title: "How much should I budget for extras?",
        content:
          "Gondola Phase I often ₹1,500–2,500 pp; Phase II more. Extra private lesson hours vary by coach. Lunch about ₹400–800 pp. We send typical ranges with your quote.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (twin sharing)",
      "Breakfast + dinner at the hotel each night (MAP)",
      "Private vehicle for transfers & sightseeing",
      "Airport pickup & drop",
      "Driver allowance, tolls & parking",
      "GST as quoted",
      "1 beginner ski/snowboard lesson (group)",
      "Standard ski/snowboard kit hire for lesson day",
      "Meet-and-greet at Srinagar Airport",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Tips & personal expenses",
      "Travel insurance",
      "Extra ski lesson hours / private coach",
      "Ski lift / Gondola tickets beyond quoted lesson access",
      "Gulmarg Gondola tickets",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Winter kit",
      "Altitude & fitness",
      "Documents",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Winter Sports", "Private / Independent", "Family Friendly"],
    facilityTitles: [
      "Private cab",
      "Airport transfers",
      "MAP meals (B/D)",
      "Ski lesson arrangement",
      "Ski kit hire desk",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/gulmarg-beginner-ski-package-cover.jpg",
    cover: "tours/gulmarg-beginner-ski-package-cover.jpg",
    gallery: [
      "tours/gulmarg-beginner-ski-package-g1.jpg",
      "tours/gulmarg-beginner-ski-package-g2.jpg",
      "tours/gulmarg-beginner-ski-package-g3.jpg",
      "tours/gulmarg-beginner-ski-package-g4.jpg",
    ],
    seoImage: "tours/gulmarg-beginner-ski-package-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Gulmarg Beginner Ski Package | 3N/4D Lessons & Kit",
    seoDescription:
      "Request a Gulmarg beginner ski break — meadow hotel, group lesson, kit hire, Gondola views. Own cab from SXR, MAP meals, from ₹12,999 pp.",
    facebookTitle: "Gulmarg Beginner Ski — learn on the meadow",
    facebookDescription:
      "First-timer lesson, kit, and snow nights in Gulmarg with a private cab from Srinagar.",
    twitterTitle: "Gulmarg Beginner Ski | 3N/4D",
    twitterDescription:
      "Lesson + kit + meadow stay. From ₹12,999 pp twin share.",
    published: true,
  },
};
