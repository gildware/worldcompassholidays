/**
 * Locked-format tour — Jaisalmer Sam Sand Dunes Desert Camp (Batch 1 India Set B #2).
 * Golden Fort city time plus overnight Thar camp at Sam with camel sunset.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const jaisalmerSamDesertCampCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Camping" },
  { kind: "style", title: "Adventure" },
  {
    kind: "faq",
    title: "What type of desert camp is used at Sam?",
    content:
      "Swiss-style tented camp with attached or shared bath (category confirmed in writing). Camp is in the Sam dunes belt — not inside the fort. Generator hours and hot water windows are shared before you pay.",
  },
  {
    kind: "faq",
    title: "Is the camel ride at sunset included?",
    content:
      "Yes — one short camel ride toward the dunes for sunset (about 45–60 minutes return) is included on camp night. Longer safari rides or dune buggy extras are quoted separately.",
  },
  {
    kind: "before_you_go",
    title: "Desert heat & sand",
    content:
      "March–April and October evenings are pleasant; May–June afternoons are harsh — we plan fort walks for morning. Bring a scarf, closed shoes, and lip balm. Camp nights can be breezy.",
  },
  {
    kind: "include",
    title: "One sunset camel ride at Sam dunes",
  },
  {
    kind: "include",
    title: "Desert camp stay with dinner & breakfast",
  },
  { kind: "facility", title: "Desert camp stay" },
  { kind: "facility", title: "Camel ride" },
  { kind: "include", title: "Accommodation as per itinerary (hotel + desert camp)" },
  { kind: "include", title: "Breakfast at hotel; dinner & breakfast at camp" },
  { kind: "include", title: "Station / airport pickup & drop" },
  { kind: "include", title: "One sunset camel ride at Sam dunes" },
  { kind: "include", title: "Kuldhara photo stop en route to camp" },
  { kind: "exclude", title: "Jeep dune bashing or long camel safari extras" },
];

export const tourJaisalmerSamSandDunesDesertCamp: TourFormat = {
  slug: "jaisalmer-sam-sand-dunes-desert-camp",
  general: {
    title: "Jaisalmer Sam Sand Dunes Desert Camp",
    summary:
      "Jaisalmer fort and havelis, then a Sam dunes camp — sunset camel, folk music, and starlit desert. Private cab, twin share, from ₹9,999 a person (min. 2).",
    category: "Camping",
    availability: "always",
    durationDays: 3,
    durationNights: 2,
    durationUnit: "days",
    durationLabel: "2 nights / 3 days",
    difficulty: "easy",
    minPeople: 2,
    maxGroupSize: 10,
    minDayBeforeBooking: 3,
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["jaisalmer", "rajasthan"],
    primaryDestinationSlug: "jaisalmer",
    address: "Jaisalmer railway station or Jaisalmer Airport (JSA) pickup",
    mapLat: "26.9157",
    mapLng: "70.9083",
    mapZoom: 11,
    days: [
      {
        dayNumber: 1,
        title: "Arrive Jaisalmer · Golden Fort & Patwon ki Haveli",
        morning:
          "Pickup at Jaisalmer station or airport. Check in at a haveli-style hotel inside or below the fort ridge.",
        afternoon:
          "Guided walk through Jaisalmer Fort lanes, Jain temples, and Patwon ki Haveli courtyard screens. Stop for masala chai with a rooftop fort view.",
        evening:
          "Stroll Gadisar Lake at dusk if time allows. Dinner at the hotel; overnight Jaisalmer.",
        imageKey: "tours/jaisalmer-sam-sand-dunes-desert-camp-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Kuldhara · Sam dunes camp · camel sunset",
        morning:
          "After breakfast, drive via the abandoned Kuldhara village for photos and Rajasthan desert context (short stop).",
        afternoon:
          "Reach Sam sand dunes camp, freshen up, and rest in shade. Camp crew sets out for the evening ride.",
        evening:
          "Sunset camel ride on the dunes, Rajasthani folk performance and campfire, desert dinner, and overnight in Swiss tents.",
        imageKey: "tours/jaisalmer-sam-sand-dunes-desert-camp-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Dawn dunes · return Jaisalmer · departure",
        morning:
          "Optional sunrise walk on the dunes. Breakfast at camp, pack, and drive back to Jaisalmer.",
        afternoon:
          "Free time for last-minute fort bazaar shopping or lac bangles. Drop at station or airport — tour ends.",
        evening: "",
        imageKey: "tours/jaisalmer-sam-sand-dunes-desert-camp-d3.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why this trip:</strong> you pair living fort heritage with a proper Thar night — not a rushed day trip from Jaisalmer. Sam camp, camel sunset, and music are the payoff after fort walking.</p>",
      "<p><strong>Stays (2 nights):</strong> Night 1 heritage hotel or haveli near the fort · Night 2 Swiss tented camp at Sam dunes (twin-share).</p>",
      "<p><strong>What you get:</strong> private vehicle for all transfers, fort and haveli sightseeing, Kuldhara stop, camp dinner and breakfast, one sunset camel ride, and folk program when the camp schedules it.</p>",
      "<p><strong>How to book:</strong> pick dates and party size; tell us your train or flight arrival. Balance details and camp category are confirmed before payment.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 9999,
    currency: "INR",
    discounts: [{ name: "Group of 6+", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "What type of desert camp is used at Sam?",
      "Is the camel ride at sunset included?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Can we upgrade to a luxury desert camp?",
        content:
          "Yes — premium camps with private baths and sit-out decks are quoted on request. Swap the standard Sam camp night without changing the fort day.",
      },
      {
        title: "Is alcohol served at camp?",
        content:
          "Most desert camps do not serve alcohol. Carry your own only if the camp policy allows — confirm when you book.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (hotel + desert camp)",
      "Breakfast at hotel; dinner & breakfast at camp",
      "Private vehicle for transfers & sightseeing",
      "Station / airport pickup & drop",
      "One sunset camel ride at Sam dunes",
      "Kuldhara photo stop en route to camp",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights / trains to starting point",
      "Lunch (unless listed)",
      "Jeep dune bashing or long camel safari extras",
      "Tips & personal expenses",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Desert heat & sand",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Adventure", "Family Friendly", "Private / Independent"],
    facilityTitles: ["Private cab", "Desert camp stay", "Camel ride", "24×7 helpline"],
  },
  images: {
    banner: "tours/jaisalmer-sam-sand-dunes-desert-camp-cover.jpg",
    cover: "tours/jaisalmer-sam-sand-dunes-desert-camp-cover.jpg",
    gallery: [
      "tours/jaisalmer-sam-sand-dunes-desert-camp-g1.jpg",
      "tours/jaisalmer-sam-sand-dunes-desert-camp-g2.jpg",
      "tours/jaisalmer-sam-sand-dunes-desert-camp-g3.jpg",
      "tours/jaisalmer-sam-sand-dunes-desert-camp-g4.jpg",
    ],
    seoImage: "tours/jaisalmer-sam-sand-dunes-desert-camp-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Jaisalmer Sam Desert Camp | 2N/3D Fort & Dunes",
    seoDescription:
      "Request Jaisalmer fort time plus Sam sand dunes camp — sunset camel, folk night, private cab. From ₹9,999 pp.",
    facebookTitle: "Jaisalmer Sam Sand Dunes — fort & desert camp",
    facebookDescription:
      "Golden Fort, Kuldhara, and Sam camel sunset in one short break.",
    twitterTitle: "Jaisalmer Desert Camp | 2N/3D",
    twitterDescription:
      "Fort · Sam dunes · camel sunset. From ₹9,999 pp.",
    published: true,
  },
};
