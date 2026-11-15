/**
 * Locked-format tour — Har Ki Dun Trek (Batch 2 #4).
 * Govind Pashu Vihar valley — Sankri trail, Osla nights, Har Ki Dun bowl.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";

export const harKiDunTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Trekking & Camping" },
  {
    kind: "faq",
    title: "Is Har Ki Dun good for first multi-day treks?",
    content:
      "Yes, with preparation. Gradients are moderate but days are long — expect 5–7 hours on trail with one village homestay night and two camp or tent nights.",
  },
  {
    kind: "faq",
    title: "What gear does the operator provide?",
    content:
      "Shared tents, sleeping bags, mats, and kitchen crew on camp nights. You carry a day pack with layers, rain shell, and water.",
  },
  {
    kind: "before_you_go",
    title: "Sankri fitness",
    content:
      "Train with sustained uphill walks for two weeks before travel. Monsoon trail is slippery; winter needs micro-spikes near the bowl.",
  },
  {
    kind: "facility",
    title: "Licensed trek guide & camp crew",
  },
  {
    kind: "include",
    title: "Shared camping equipment on trek nights",
  },
];

export const tourHarKiDunTrek: TourFormat = {
  slug: "har-ki-dun-trek",
  general: {
    title: "Har Ki Dun Trek",
    summary:
      "Swargarohini amphitheatre in Govind National Park — Sankri start, Osla village, Har Ki Dun meadow camp. Guided trek from ₹14,999 a person (min. 2).",
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
    isFeatured: false,
    youtubeUrl: "",
  },
  itinerary: {
    destinationSlugs: ["sankri", "uttarakhand", "dehradun"],
    primaryDestinationSlug: "sankri",
    address: "Dehradun railway station or Jolly Grant (DED) pickup",
    mapLat: "31.1400",
    mapLng: "78.2500",
    mapZoom: 10,
    days: [
      {
        dayNumber: 1,
        title: "Dehradun · drive to Sankri",
        morning:
          "Pickup at Dehradun station or Jolly Grant. Scenic drive via Mussoorie bypass toward Sankri.",
        afternoon:
          "Check-in at guesthouse. Trek briefing with guide; distribute shared camping kit.",
        evening: "Early dinner and overnight Sankri.",
        imageKey: "tours/har-ki-dun-trek-d1.jpg",
      },
      {
        dayNumber: 2,
        title: "Sankri · Taluka · trek toward Osla",
        morning:
          "Jeep to Taluka roadhead. Walk along the Supin through pine toward Osla village.",
        afternoon:
          "Reach Osla or riverside camp. Hot tea and village-style dinner.",
        evening: "Overnight guesthouse or camp near Osla.",
        imageKey: "tours/har-ki-dun-trek-d2.jpg",
      },
      {
        dayNumber: 3,
        title: "Osla · Har Ki Dun meadow camp",
        morning:
          "Breakfast and steady climb into the Har Ki Dun valley floor.",
        afternoon:
          "Set camp in the meadow bowl. Explore the stream and snow peaks if clear.",
        evening: "Camp dinner with crew. Overnight tents in Har Ki Dun.",
        imageKey: "tours/har-ki-dun-trek-d3.jpg",
      },
      {
        dayNumber: 4,
        title: "Har Ki Dun exploration day",
        morning:
          "Optional hike toward Jaundhar Glacier viewpoint for photographers (weather permitting).",
        afternoon:
          "Return to camp for lunch. Rest or short meadow walks.",
        evening: "Second camp night in Har Ki Dun.",
        imageKey: "tours/har-ki-dun-trek-d4.jpg",
      },
      {
        dayNumber: 5,
        title: "Descend toward Osla",
        morning:
          "Break camp after sunrise. Descend to Osla at measured pace.",
        afternoon:
          "Late lunch in the village. Free time to see the temple woodwork.",
        evening: "Overnight Osla or Taluka side camp.",
        imageKey: "tours/har-ki-dun-trek-d5.jpg",
      },
      {
        dayNumber: 6,
        title: "Taluka · Sankri recovery",
        morning:
          "Final trail section to Taluka jeep point. Drive to Sankri.",
        afternoon:
          "Hot shower at guesthouse. Celebrate completion with simple Garhwali meal.",
        evening: "Overnight Sankri.",
        imageKey: "tours/har-ki-dun-trek-d6.jpg",
      },
      {
        dayNumber: 7,
        title: "Sankri · Dehradun departure",
        morning:
          "Breakfast and checkout. Drive to Dehradun station or airport. Tour ends.",
        afternoon: "",
        evening: "",
        imageKey: "tours/har-ki-dun-trek-d7.jpg",
      },
    ],
  },
  content: {
    descriptionHtml: [
      "<p><strong>Why Har Ki Dun:</strong> a classic Uttarakhand valley with living village culture at Osla and postcard Swargarohini walls — deeper than a weekend Nag Tibba bump without technical climbing.</p>",
      "<p><strong>Stays:</strong> 2N Sankri guesthouse · 1N Osla homestay or lodge · 2N trek camp in Har Ki Dun · 1N Sankri recovery.</p>",
      "<p><strong>What you get:</strong> Dehradun transfers, Taluka jeep, licensed guide, cook team, shared tents and bags, and trail meals on trek days.</p>",
      "<p><strong>How to book:</strong> share fitness level and preferred May–June or September window. Crew confirmation before payment.</p>",
    ].join(""),
  },
  pricing: {
    priceFrom: 14999,
    currency: "INR",
    discounts: [{ name: "Group of 8 trekkers", type: "percent", value: 5 }],
  },
  details: {
    sharedFaqTitles: [
      "Is Har Ki Dun good for first multi-day treks?",
      "What gear does the operator provide?",
      "Is this a private or group tour?",
      "Are flights included?",
    ],
    extraFaqs: [
      {
        title: "Are permits included?",
        content:
          "Govind sanctuary entry and forest fees are included in the quoted trek rate unless government tariffs change — we confirm in writing.",
      },
    ],
    includeTitles: [
      "Accommodation as per itinerary (lodge, homestay, camp)",
      "Meals on trek and at lodge as per plan",
      "Private vehicle Dehradun ↔ Sankri",
      "Jeep Sankri ↔ Taluka",
      "Licensed trek guide & camp support crew",
      "Shared camping equipment on trek nights",
      "Forest entry / trek permits as quoted",
      "Driver allowance, tolls & parking",
      "GST as quoted",
    ],
    excludeTitles: [
      "Flights / trains to Dehradun",
      "Personal trekking poles or boots",
      "Porter for private backpack (optional hire)",
      "Tips for guide and crew",
      "Travel insurance",
      "Anything not mentioned in includes",
    ],
    beforeYouGoTitles: [
      "Sankri fitness",
      "Fitness",
      "Documents",
      "Weather & kit",
      "Arrival",
      "Rooms",
      "Money on the road",
    ],
    travelStyleTitles: ["Adventure", "Trekking & Camping", "Private / Independent"],
    facilityTitles: [
      "Licensed trek guide & camp crew",
      "Private cab",
      "Camping equipment",
      "24×7 helpline",
    ],
  },
  images: {
    banner: "tours/har-ki-dun-trek-cover.jpg",
    cover: "tours/har-ki-dun-trek-cover.jpg",
    gallery: [
      "tours/har-ki-dun-trek-g1.jpg",
      "tours/har-ki-dun-trek-g2.jpg",
      "tours/har-ki-dun-trek-g3.jpg",
      "tours/har-ki-dun-trek-g4.jpg",
    ],
    seoImage: "tours/har-ki-dun-trek-cover.jpg",
  },
  seo: {
    seoIndex: true,
    seoTitle: "Har Ki Dun Trek | 6N/7D Sankri Valley Camp",
    seoDescription:
      "Har Ki Dun trek — Osla village, meadow camp, Swargarohini views. Guided crew from ₹14,999 pp.",
    facebookTitle: "Har Ki Dun Trek — Govind National Park",
    facebookDescription:
      "Seven-day valley trek with Sankri guesthouse and Har Ki Dun camp nights.",
    twitterTitle: "Har Ki Dun Trek | 6N/7D",
    twitterDescription:
      "Sankri · Osla · Har Ki Dun bowl. From ₹14,999 pp.",
    published: true,
  },
};