export type DemoHotel = {
  slug: string;
  name: string;
  destinationSlug: string;
  propertyType: string;
  starRating: number;
  summary: string;
  description: string;
  address: string;
  mapLat: string;
  mapLng: string;
  isFeatured: boolean;
  coverPrompt: string;
  rooms: Array<{
    name: string;
    summary: string;
    occupancy: number;
    bedType: string;
    sizeSqm: number;
    quantity: number;
    pricePerNight: number;
    extraGuestPrice: number;
    mealPlan: string;
    features: string[];
    amenities: string[];
  }>;
  cancellationPolicy: string;
  houseRules: string;
  amenities: string[];
};

const wifiRestDesk = [
  "catalog_hotel_amenity_wifi",
  "catalog_hotel_amenity_restaurant",
  "catalog_hotel_amenity_desk",
] as const;

const wifiRestPark = [
  "catalog_hotel_amenity_wifi",
  "catalog_hotel_amenity_restaurant",
  "catalog_hotel_amenity_parking",
] as const;

const wifiRestParkDesk = [
  "catalog_hotel_amenity_wifi",
  "catalog_hotel_amenity_restaurant",
  "catalog_hotel_amenity_parking",
  "catalog_hotel_amenity_desk",
] as const;

const roomAcWifiTv = [
  "catalog_room_amenity_ac",
  "catalog_room_amenity_wifi",
  "catalog_room_amenity_tv",
] as const;

const roomWifiHeater = [
  "catalog_room_amenity_wifi",
  "catalog_room_amenity_kettle",
  "catalog_room_amenity_tv",
] as const;

const cancel3 =
  "Free cancellation until 3 days before check-in. Later cancellations may attract one-night charges.";
const cancel2 =
  "Free cancellation until 2 days before check-in. No-shows are charged for the first night.";
const rulesStd =
  "Government photo ID is required at check-in. Outside food may be restricted. Quiet hours after 10 pm.";

function deluxeStandard(opts: {
  deluxePrice: number;
  standardPrice: number;
  deluxeSummary: string;
  standardSummary: string;
  mountain?: boolean;
}) {
  const deluxeFeatures = opts.mountain
    ? ["catalog_room_feature_mountain", "catalog_room_feature_balcony"]
    : ["catalog_room_feature_balcony"];
  const standardFeatures = opts.mountain
    ? ["catalog_room_feature_mountain"]
    : ["catalog_room_feature_city"];
  return [
    {
      name: "Deluxe Room",
      summary: opts.deluxeSummary,
      occupancy: 2,
      bedType: "King",
      sizeSqm: 28,
      quantity: 10,
      pricePerNight: opts.deluxePrice,
      extraGuestPrice: Math.round(opts.deluxePrice * 0.18),
      mealPlan: "breakfast",
      features: deluxeFeatures,
      amenities: [...roomAcWifiTv],
    },
    {
      name: "Standard Room",
      summary: opts.standardSummary,
      occupancy: 2,
      bedType: "Queen",
      sizeSqm: 22,
      quantity: 12,
      pricePerNight: opts.standardPrice,
      extraGuestPrice: Math.round(opts.standardPrice * 0.18),
      mealPlan: "breakfast",
      features: standardFeatures,
      amenities: [...roomAcWifiTv],
    },
  ];
}

/** Production Kashmir hotel inventory researched from property websites and major OTAs. */
export const kashmirHotels: DemoHotel[] = [
  // —— Srinagar ——
  {
    slug: "golden-leaf-srinagar",
    name: "Hotel Golden Leaf",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Airport-side luxury hotel in Hyderpora with 41 rooms, Sugar & Spice restaurant, banquet lawns, and free parking.",
    description:
      "<p>Hotel Golden Leaf sits on the Srinagar Bypass at Hyderpora West, about 2 km from Sheikh ul-Alam International Airport. Guests choose it for quick airport access, air-conditioned rooms across Deluxe to Premium categories, 24-hour front desk, and an on-site multi-cuisine restaurant.</p><p>Facilities commonly listed include free Wi-Fi, free parking, airport transfers, laundry, business centre, and banquet space for events. Dal Lake and central Srinagar are a short drive away, making it practical for arrival and departure nights.</p>",
    address: "Srinagar Bypass Road, Hyderpora West, near Jamkash Vehicleads, Srinagar, J&K 190014",
    mapLat: "34.041913",
    mapLng: "74.788586",
    isFeatured: true,
    coverPrompt:
      "Photorealistic modern hotel exterior Hyderpora Srinagar Kashmir evening lights, no text",
    amenities: [...wifiRestParkDesk, "catalog_hotel_amenity_laundry"],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 7500,
      standardPrice: 5500,
      deluxeSummary: "Spacious deluxe room with AC, Wi-Fi, and city/garden outlook.",
      standardSummary: "Comfortable standard room close to airport road access.",
    }),
  },
  {
    slug: "heritage-luxury-srinagar",
    name: "Hotel Heritage Luxury",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Well-reviewed hotel on Airport Road, Hyderpora near J&K Police HQ — about five minutes from Srinagar Airport.",
    description:
      "<p>Hotel Heritage Luxury is on Airport Road, Hyderpora, near J&K Police Headquarters. Listings place it within a short drive of the airport and roughly 40–50 rooms across Standard and Premium categories.</p><p>Guests repeatedly note free parking, free Wi-Fi, breakfast, restaurant service, and helpful front-desk staff. It works well for early flights and first/last nights in Srinagar before continuing to Gulmarg or Pahalgam.</p>",
    address: "Airport Road, near J&K Police HQ, Hyderpora, Srinagar, J&K 190014",
    mapLat: "34.034188",
    mapLng: "74.784238",
    isFeatured: true,
    coverPrompt:
      "Photorealistic midscale hotel facade Hyderpora Srinagar with garden lawn, daylight, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 6800,
      standardPrice: 4800,
      deluxeSummary: "Premium room with AC, flat-screen TV, and tea/coffee tray.",
      standardSummary: "Standard room with attached bath and essentials for airport stays.",
    }),
  },
  {
    slug: "marvilla-srinagar",
    name: "Hotel Marvilla",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Compact Nowgam Bypass hotel near the airport highway with restaurant, parking, and simple family rooms.",
    description:
      "<p>Hotel Marvilla (also listed as Marvilla / Atulya Hotel Marvilla) stands at Nowgam Bypass Chowk on NH-A1. It is useful for travellers who want a quieter highway-side base close to airport and railway approaches.</p><p>Public listings describe around 14–20 rooms, free parking, restaurant or room service, and Wi-Fi. Dal Lake and Lal Chowk are typically a 15–25 minute drive depending on traffic.</p>",
    address: "Nowgam Bypass Chowk, NH-A1, Sheikh-ul-Alam Colony, Nowgam, Srinagar, J&K 190015",
    mapLat: "34.026682",
    mapLng: "74.826562",
    isFeatured: false,
    coverPrompt:
      "Photorealistic small hotel building Nowgam Srinagar roadside pines, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 4500,
      standardPrice: 3200,
      deluxeSummary: "Larger room with seating area and attached bath.",
      standardSummary: "Value room for overnight airport or transit stays.",
    }),
  },
  {
    slug: "asian-park-srinagar",
    name: "Hotel Asian Park",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Munawarabad hotel about a 10-minute walk from Dal Lake, with Super Deluxe rooms, suites, and Gol Mahal banquet hall.",
    description:
      "<p>Hotel Asian Park on Munawar Link Road, Munawarabad, is established as a larger Srinagar property with roughly 74 rooms (mostly Super Deluxe plus suites). The official site highlights walking access to Dal Lake, multi-cuisine dining, and the Gol Mahal banquet for events.</p><p>It suits families and groups who want a city-side base for shikara rides, Mughal gardens, and Old City sightseeing without staying on Boulevard Road itself.</p>",
    address: "Munawar Link Road, Munawarabad, Srinagar, J&K 190001",
    mapLat: "34.083200",
    mapLng: "74.842500",
    isFeatured: true,
    coverPrompt:
      "Photorealistic city hotel near Dal Lake Srinagar Kashmir street facade, daytime, no text",
    amenities: [...wifiRestParkDesk, "catalog_hotel_amenity_laundry"],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Super Deluxe Room",
        summary: "Spacious room category highlighted on the hotel’s official inventory.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 30,
        quantity: 20,
        pricePerNight: 6500,
        extraGuestPrice: 1200,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv],
      },
      {
        name: "Suite",
        summary: "Larger suite option for families or longer Srinagar stays.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 40,
        quantity: 4,
        pricePerNight: 9500,
        extraGuestPrice: 1500,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city", "catalog_room_feature_balcony"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
    ],
  },
  {
    slug: "arison-luxury-srinagar",
    name: "Arison Luxury",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Modern Hyderpora Bypass hotel with Deluxe, Premium, and Suite rooms plus banquet facilities.",
    description:
      "<p>Arison Luxury is on Hyderpora Bypass, Srinagar — a convenient corridor between the airport and the city. The property markets Deluxe, Premium, and Suite categories with modern room amenities and event/banquet space.</p><p>It is a strong fit for travellers who prefer a newer mid-luxury stay near airport road without committing to a Boulevard lakeside hotel for every night.</p>",
    address: "Hyderpora Bypass, Srinagar, J&K 190014",
    mapLat: "34.038500",
    mapLng: "74.790800",
    isFeatured: true,
    coverPrompt:
      "Photorealistic contemporary boutique hotel Hyderpora Srinagar glass facade, dusk, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Premium Room",
        summary: "Stylish premium room with modern finishes and city comforts.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 30,
        quantity: 10,
        pricePerNight: 7200,
        extraGuestPrice: 1300,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv],
      },
      {
        name: "Deluxe Room",
        summary: "Well-appointed deluxe room for couples and short city stays.",
        occupancy: 2,
        bedType: "Queen",
        sizeSqm: 24,
        quantity: 12,
        pricePerNight: 5600,
        extraGuestPrice: 1100,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv],
      },
    ],
  },
  {
    slug: "jhelum-comfort-residency-srinagar",
    name: "Jhelum Comfort Residency",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Comfort stay near Lal Mandi / Wazir Bagh on the Jhelum side — close to Lal Chowk and about 2 km from Dal Lake.",
    description:
      "<p>Listed publicly as Jhelum Comfort Inn / Residency at Lal Mandi Footbridge, Wazir Bagh, this hotel sits along the Jhelum corridor with quick access to Lal Chowk (often under 1 km) and Dal Lake (around 2 km).</p><p>It is practical for travellers who want a central Srinagar base for markets, gardens, and day trips without a premium Boulevard tariff.</p>",
    address: "Lal Mandi Footbridge, Wazir Bagh, Srinagar, J&K 190008",
    mapLat: "34.066409",
    mapLng: "74.808303",
    isFeatured: false,
    coverPrompt:
      "Photorealistic riverside city hotel Jhelum Srinagar Kashmir quiet street, morning light, no text",
    amenities: [...wifiRestDesk, "catalog_hotel_amenity_parking"],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 5200,
      standardPrice: 3800,
      deluxeSummary: "Deluxe room for central Srinagar sightseeing stays.",
      standardSummary: "Compact standard room near Lal Chowk access.",
    }),
  },
  {
    slug: "royal-batoo-srinagar",
    name: "Hotel Royal Batoo",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Refined Dalgate hotel at Khayam Chowk — a short walk from Dal Lake with Super Deluxe and Premium rooms.",
    description:
      "<p>Hotel Royal Batoo’s official location is Khayam Chowk, Dalgate Bridge, near Khyber Hospital. The property emphasises walkable access to Dal Lake, Kashmiri hospitality, multi-cuisine dining at Batoo Darbar, 24-hour room service, Wi-Fi, and parking.</p><p>Room categories highlighted online include Super Deluxe and Premium, making it a strong lakeside-area pick for honeymooners and first-time Srinagar visitors.</p>",
    address: "Khayam Chowk, Dalgate Bridge, near Khyber Hospital, Srinagar, J&K 190001",
    mapLat: "34.083900",
    mapLng: "74.851200",
    isFeatured: true,
    coverPrompt:
      "Photorealistic boutique hotel near Dalgate Srinagar Kashmir warm wood interiors exterior, evening, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Premium Room",
        summary: "Refined premium room with AC, Wi-Fi, LED TV, and room service.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 30,
        quantity: 8,
        pricePerNight: 8500,
        extraGuestPrice: 1500,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
      {
        name: "Super Deluxe Room",
        summary: "Warm deluxe room with Kashmiri textiles and tea tray.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 26,
        quantity: 10,
        pricePerNight: 6800,
        extraGuestPrice: 1300,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv],
      },
    ],
  },
  {
    slug: "milan-srinagar",
    name: "Hotel Milan",
    destinationSlug: "srinagar",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Munawarabad hotel roughly 1.5 km from Dal Lake with restaurant, parking, and 24-hour room service.",
    description:
      "<p>Hotel Milan is listed in Munawarabad / Munawara Abad, Srinagar — a practical city neighbourhood for Dal Lake day access (often quoted around 1.5 km by road). OTA listings mention restaurant dining, free parking, lounge access, and round-the-clock room service.</p><p>It suits value-focused Srinagar stays where guests plan shikara rides and garden sightseeing by short taxi hops.</p>",
    address: "Munawar Link Road / Munawarabad, Srinagar, J&K 190001",
    mapLat: "34.081500",
    mapLng: "74.840800",
    isFeatured: false,
    coverPrompt:
      "Photorealistic modest city hotel Munawarabad Srinagar street view, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 4700,
      standardPrice: 3500,
      deluxeSummary: "Deluxe room with hot/cold AC option as listed on major OTAs.",
      standardSummary: "Standard twin/double for budget Srinagar nights.",
    }),
  },

  // —— Gulmarg ——
  {
    slug: "apple-tree-resorts-gulmarg",
    name: "Apple Tree Resorts",
    destinationSlug: "gulmarg",
    propertyType: "resort",
    starRating: 4,
    summary:
      "Popular 4-star resort on Srinagar–Gulmarg Road at Batpora, Kunzer — lawns, pool, multi-cuisine dining, and mountain-view rooms.",
    description:
      "<p>Apple Tree Resorts is widely listed on Srinagar–Gulmarg Road, Batpora, Kunzer. Guests praise mountain views, polite staff, buffet dining, garden lawns, and a swimming pool. Room stock publicly described includes Deluxe, Super Deluxe, Junior, and Presidential categories.</p><p>Note: the resort is typically 15–22 km from the Gulmarg Gondola, so plan a short drive for ski/gondola days. It is excellent for travellers who want resort facilities on the Gulmarg approach rather than a tiny room inside the meadow bowl.</p>",
    address: "Srinagar–Gulmarg Road, Batpora, Kunzer, Baramulla, J&K 193404",
    mapLat: "34.070500",
    mapLng: "74.450000",
    isFeatured: true,
    coverPrompt:
      "Photorealistic mountain resort lawn and pool Kunzer Gulmarg road Kashmir, summer, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Premium Room",
        summary: "Larger mountain-view room (OTA listings ~450 sq ft class).",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 42,
        quantity: 12,
        pricePerNight: 8500,
        extraGuestPrice: 1500,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac"],
      },
      {
        name: "Deluxe Room",
        summary: "Comfortable deluxe with hill views and heating for cool evenings.",
        occupancy: 2,
        bedType: "Queen",
        sizeSqm: 28,
        quantity: 18,
        pricePerNight: 6200,
        extraGuestPrice: 1200,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
    ],
  },
  {
    slug: "pandit-resort-gulmarg",
    name: "Pandit Resort",
    destinationSlug: "gulmarg",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Roadside stay on Srinagar–Gulmarg Road at Batpora / Kunzer (Pandith Exotics) — practical for Gulmarg day trips.",
    description:
      "<p>Listed as Pandith Exotics Hotel and Restaurant on Srinagar–Gulmarg Road, Batpora Kunzer, this property serves travellers who prefer an affordable stop on the Gulmarg highway with restaurant service on site.</p><p>Use it for simple overnight stays when your sightseeing focus is Gulmarg meadows and gondola, with a short morning drive up to the resort town.</p>",
    address: "Srinagar–Gulmarg Road, near Pandith Kashmir Arts & Emporium, Batpora, Kunzer, J&K 193401",
    mapLat: "34.068000",
    mapLng: "74.455000",
    isFeatured: false,
    coverPrompt:
      "Photorealistic roadside hotel restaurant Kunzer Gulmarg highway Kashmir, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 4200,
      standardPrice: 3000,
      deluxeSummary: "Deluxe double with heater and attached bath.",
      standardSummary: "Standard room for Gulmarg transit nights.",
      mountain: true,
    }),
  },
  {
    slug: "mama-palace-gulmarg",
    name: "Hotel Mama Palace",
    destinationSlug: "gulmarg",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Budget Gulmarg hotel near Grand Mumtaz — about 1 km from the Gondola with heated rooms and in-house restaurant.",
    description:
      "<p>Hotel Mama Palace is listed in Gulmarg near Grand Mumtaz. Travel listings describe a compact two-storey property with around 10 rooms, attached baths with hot water, room heaters, restaurant dining, room service, and free Wi-Fi.</p><p>Gondola access is commonly quoted around 1 km, making it useful for travellers who want to sleep inside Gulmarg without five-star pricing.</p>",
    address: "Near Grand Mumtaz, Gulmarg, Baramulla, J&K 193403",
    mapLat: "34.048800",
    mapLng: "74.384500",
    isFeatured: false,
    coverPrompt:
      "Photorealistic small mountain hotel Gulmarg Kashmir pine surroundings, overcast day, no text",
    amenities: [...wifiRestDesk],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 7500,
      standardPrice: 5500,
      deluxeSummary: "Heated deluxe room close to Gulmarg market and gondola approach.",
      standardSummary: "Compact standard room for ski/meadow day trips.",
      mountain: true,
    }),
  },
  {
    slug: "zahgeer-continental-gulmarg",
    name: "Hotel Zahgeer Continental",
    destinationSlug: "gulmarg",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Landmark Gulmarg hotel on Main Gulmarg Road near the Gondola — rebuilt inventory with deluxe rooms and suites.",
    description:
      "<p>Hotel Zahgeer Continental (often searched as Zahgeer / Zahagir) is on Main Gulmarg Road with contact listings placing it in the 193403 Gulmarg core. Public descriptions highlight proximity to the Gondola, central heating, and a large rebuilt room stock including deluxe rooms and suites with meadow views.</p><p>It remains one of the better-known mid-to-upper Gulmarg names for travellers who want to stay beside the main tourist spine.</p>",
    address: "Main Gulmarg Road, Gulmarg, Baramulla, J&K 193403",
    mapLat: "34.049600",
    mapLng: "74.381800",
    isFeatured: true,
    coverPrompt:
      "Photorealistic Gulmarg Kashmir hotel facade with snow meadow and pines, winter daylight, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Suite",
        summary: "Spacious suite with strong meadow/gondola-area outlook.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 40,
        quantity: 6,
        pricePerNight: 16000,
        extraGuestPrice: 2500,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
      },
      {
        name: "Deluxe Room",
        summary: "Centrally heated deluxe room in the Gulmarg core.",
        occupancy: 2,
        bedType: "Queen",
        sizeSqm: 28,
        quantity: 20,
        pricePerNight: 11000,
        extraGuestPrice: 2000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
    ],
  },
  {
    slug: "gulmarg-palace-tangmarg",
    name: "The Gulmarg Palace",
    destinationSlug: "gulmarg",
    propertyType: "hotel",
    starRating: 3,
    summary:
      "Clean Tangmarg / Gulmarg Road hotel used as a lower-altitude base for Gulmarg sightseeing and snow days.",
    description:
      "<p>The Gulmarg Palace is commonly listed on Gulmarg Road in the Tangmarg belt rather than inside the highest meadow parking zone. Guest comments often praise cleanliness and a calmer base when weather or road conditions make upper Gulmarg stays harder.</p><p>Plan a short drive to the Gondola and golf course; Tangmarg also pairs well with Drung waterfall visits in winter.</p>",
    address: "Gulmarg Road, Tangmarg, Baramulla, J&K 193402",
    mapLat: "34.060000",
    mapLng: "74.430000",
    isFeatured: false,
    coverPrompt:
      "Photorealistic Tangmarg Kashmir hotel roadside pines Gulmarg approach, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 5800,
      standardPrice: 4200,
      deluxeSummary: "Deluxe room on the Gulmarg approach road.",
      standardSummary: "Standard room for Tangmarg overnight stops.",
      mountain: true,
    }),
  },
  {
    slug: "signature-gulmarg",
    name: "Hotel Signature",
    destinationSlug: "gulmarg",
    propertyType: "resort",
    starRating: 3,
    summary:
      "Gulmarg Road hotel at Wahipora / Tangmarg approach with lawn, parking, heated rooms, and solid guest scores.",
    description:
      "<p>Hotel Signature is listed on Gulmarg Road, Wahipora (Tangmarg belt), with public ratings around 4.3/5 on local business listings. Guests mention spacious-enough rooms, hot water, heaters on request, parking, and a pleasant front lawn.</p><p>Like other Tangmarg-side stays, expect roughly 10–12 km to upper Gulmarg attractions — ideal when you want resort-style grounds without meadow-core pricing.</p>",
    address: "Gulmarg Road, Wahipora (Tangmarg), Baramulla, J&K 193402",
    mapLat: "34.055500",
    mapLng: "74.435500",
    isFeatured: true,
    coverPrompt:
      "Photorealistic resort hotel lawn Gulmarg Road Tangmarg Kashmir, soft afternoon light, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 6500,
      standardPrice: 4800,
      deluxeSummary: "Deluxe room with heating support and garden/lawn access.",
      standardSummary: "Standard double for Gulmarg day-trip itineraries.",
      mountain: true,
    }),
  },

  // —— Pahalgam ——
  {
    slug: "white-villa-pahalgam",
    name: "White Villa Resort",
    destinationSlug: "pahalgam",
    propertyType: "resort",
    starRating: 3,
    summary:
      "Newer 17-room resort near Rafting Point, Yanier — balconies, restaurant, free parking, and buffet breakfast.",
    description:
      "<p>White Villa Resort is listed near Rafting Point, Yanier / Yanner, Pahalgam. Trip listings describe about 17 rooms with private balconies, complimentary Wi-Fi, restaurant dining, free self parking, and a daily buffet breakfast window.</p><p>It suits travellers who want a quieter Lidder-side base for rafting, Betaab/Aru day trips, and relaxed valley evenings.</p>",
    address: "BP Road, near Rafting Point, Yanier, Pahalgam, Anantnag, J&K 192126",
    mapLat: "33.925500",
    mapLng: "75.286500",
    isFeatured: false,
    coverPrompt:
      "Photorealistic white villa resort Pahalgam Kashmir pine hills balcony rooms, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 5500,
      standardPrice: 4000,
      deluxeSummary: "Balcony deluxe with valley outlook near rafting point.",
      standardSummary: "Standard room for compact Pahalgam stays.",
      mountain: true,
    }),
  },
  {
    slug: "green-heights-pahalgam",
    name: "Hotel Green Heights",
    destinationSlug: "pahalgam",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Highly rated Srichen / Main Road property with Lidder and Kolahoi Peak views, family rooms, and strong hospitality scores.",
    description:
      "<p>Hotel Green Heights on Main Road, Srichen, Pahalgam markets uninterrupted mountain views, Lidder River ambience, lawn breakfasts, and room categories from Super Deluxe to Premium / family. Tripadvisor ratings commonly sit near 4.6/5 with praise for staff and food.</p><p>It is one of the stronger mid-luxury Pahalgam picks for honeymoon and family packages.</p>",
    address: "Main Road, Srichen, Pahalgam, Anantnag, J&K 192126",
    mapLat: "34.010500",
    mapLng: "75.318500",
    isFeatured: true,
    coverPrompt:
      "Photorealistic hillside hotel Green Heights Pahalgam Lidder valley views, golden hour, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Premium Room",
        summary: "Premium category with strong peak and river-facing outlook.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 32,
        quantity: 10,
        pricePerNight: 9500,
        extraGuestPrice: 1600,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
      },
      {
        name: "Super Deluxe Room",
        summary: "Super deluxe room looking toward pines and Kolahoi peaks.",
        occupancy: 2,
        bedType: "Queen",
        sizeSqm: 26,
        quantity: 16,
        pricePerNight: 7200,
        extraGuestPrice: 1400,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
    ],
  },
  {
    slug: "pahalgam-shore",
    name: "The Pahalgam Shore",
    destinationSlug: "pahalgam",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "4-star Lidder-bank hotel at Rafting Point, Movera with 21 designed rooms and suites.",
    description:
      "<p>The Pahalgam Shore positions itself as a picturesque 4-star hotel on the Lidder at Rafting Point, Movera. The official site highlights 21 meticulously designed rooms and suites aimed at travellers seeking comfort with river-valley scenery.</p><p>It pairs well with Betaab, Aru, and Chandanwari day circuits while keeping evenings on the quieter Movera riverside strip.</p>",
    address: "Rafting Point, Movera, Pahalgam, Anantnag, J&K 192126",
    mapLat: "33.924800",
    mapLng: "75.285500",
    isFeatured: true,
    coverPrompt:
      "Photorealistic luxury riverside hotel Pahalgam Shore Lidder River Kashmir, evening lights, no text",
    amenities: [...wifiRestParkDesk, "catalog_hotel_amenity_laundry"],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Suite",
        summary: "Suite stay with elevated riverside comfort.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 38,
        quantity: 4,
        pricePerNight: 12500,
        extraGuestPrice: 2000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
      },
      {
        name: "Deluxe Room",
        summary: "Deluxe room in the 21-key riverside inventory.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 28,
        quantity: 12,
        pricePerNight: 8800,
        extraGuestPrice: 1600,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
    ],
  },
  {
    slug: "riverside-resort-pahalgam",
    name: "Riverside Resort",
    destinationSlug: "pahalgam",
    propertyType: "resort",
    starRating: 3,
    summary:
      "Lidder-side resort at Rafting Point, Movera — lawns, Kashmiri balconies, and consistently strong guest feedback.",
    description:
      "<p>Riverside Resorts Inn / Riverside Resorts Pahalgam is listed at Rafting Point, Movera beside the Lidder River. Guest reviews frequently mention river soundscape, green campus lawns, wooden swings, carved balconies, and attentive managers/staff.</p><p>A dependable midscale riverside choice for families wanting nature-first Pahalgam nights.</p>",
    address: "Rafting Point, Movera, Pahalgam, Anantnag, J&K 192126",
    mapLat: "33.922384",
    mapLng: "75.284965",
    isFeatured: true,
    coverPrompt:
      "Photorealistic riverside resort lawn Lidder River Pahalgam Kashmir wooden balconies, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 7000,
      standardPrice: 5200,
      deluxeSummary: "River-facing deluxe with balcony character.",
      standardSummary: "Garden/standard room on the Movera campus.",
      mountain: true,
    }),
  },
  {
    slug: "hayat-residency-pahalgam",
    name: "Hotel Hayat Residency",
    destinationSlug: "pahalgam",
    propertyType: "hotel",
    starRating: 4,
    summary:
      "Larger Pahalgam hotel near Botakote Rafting Point with ~40 rooms/suites and 24-hour reception.",
    description:
      "<p>Hotel Hayat Residency lists its address at Botakote Rafting Point, Pahalgam, near the power receiving station. The official site describes around 40 double rooms and suites, restaurant dining, and a reception desk open 24 hours.</p><p>It targets travellers looking for a more polished stay on the rafting-point corridor with enough inventory for groups.</p>",
    address: "Botakote Rafting Point, near Power Receiving Station, Pahalgam, J&K 192129",
    mapLat: "33.928000",
    mapLng: "75.282000",
    isFeatured: true,
    coverPrompt:
      "Photorealistic upscale hotel Hayat Residency Pahalgam Kashmir entrance driveway, dusk, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Suite",
        summary: "Suite category for longer or celebratory Pahalgam stays.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 36,
        quantity: 6,
        pricePerNight: 11000,
        extraGuestPrice: 1800,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
      },
      {
        name: "Deluxe Room",
        summary: "Deluxe double among the ~40-key inventory.",
        occupancy: 2,
        bedType: "Queen",
        sizeSqm: 26,
        quantity: 20,
        pricePerNight: 7800,
        extraGuestPrice: 1400,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
    ],
  },
  {
    slug: "pahalgam-retreat",
    name: "Pahalgam Retreat",
    destinationSlug: "pahalgam",
    propertyType: "resort",
    starRating: 3,
    summary:
      "40-room retreat across four blocks at Yainer / Movera Rafting Point amid pines and valley greenery.",
    description:
      "<p>Pahalgam Retreat is listed at Yainer village / Movera Rafting Point. The property describes four blocks totaling about 40 rooms designed for comfort in a green mountain setting away from the busiest bazaar lanes.</p><p>Good for families and multi-night valley stays with easy access to Lidder activities and south-bound sightseeing.</p>",
    address: "Yainer Village, Movera Rafting Point, Pahalgam, Anantnag, J&K 192126",
    mapLat: "33.926200",
    mapLng: "75.287200",
    isFeatured: false,
    coverPrompt:
      "Photorealistic multi-block mountain retreat Pahalgam Kashmir pine forest campus, daylight, no text",
    amenities: [...wifiRestPark],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: deluxeStandard({
      deluxePrice: 6400,
      standardPrice: 4800,
      deluxeSummary: "Deluxe room in the four-block retreat campus.",
      standardSummary: "Standard room for value Pahalgam nights.",
      mountain: true,
    }),
  },
  {
    slug: "white-water-resort-pahalgam",
    name: "White Water Resort",
    destinationSlug: "pahalgam",
    propertyType: "resort",
    starRating: 4,
    summary:
      "High-rated resort near Rafting Point footbridge, Movera — Wi-Fi, restaurant, parking, and fitness facilities.",
    description:
      "<p>White Water Resorts is listed near the Rafting Point footbridge, Movera, Pahalgam, with strong public ratings (often ~4.6/5). Amenities commonly advertised include free Wi-Fi, restaurant, free parking, room service, laundry, airport shuttle arrangements, and a fitness centre.</p><p>A premium riverside option for travellers who want resort energy beside the Lidder adventure strip.</p>",
    address: "Near Foot Bridge, Rafting Point, Movera, Pahalgam, Anantnag, J&K 192129",
    mapLat: "33.926923",
    mapLng: "75.285978",
    isFeatured: true,
    coverPrompt:
      "Photorealistic White Water Resorts Pahalgam Kashmir river adventure lodge exterior, sunny day, no text",
    amenities: [...wifiRestParkDesk, "catalog_hotel_amenity_laundry"],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Premium Room",
        summary: "Premium riverside category for couples and small families.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 30,
        quantity: 12,
        pricePerNight: 9800,
        extraGuestPrice: 1700,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
      },
      {
        name: "Deluxe Room",
        summary: "Deluxe room close to the rafting-point corridor.",
        occupancy: 2,
        bedType: "Queen",
        sizeSqm: 24,
        quantity: 16,
        pricePerNight: 7400,
        extraGuestPrice: 1400,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
    ],
  },
];
