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
      "Airport-side luxury hotel in Hyderpora with 41 rooms, Sugar & Spice restaurant, Kings Court banquet, and lawns.",
    description:
      "<p>Hotel Golden Leaf sits on the National Highway in Hyderpora, about 2 km from Sheikh ul-Alam International Airport. The official inventory spans 41 rooms across five floors — Deluxe, Premium, Executive, Super Deluxe, Family interconnected, and Suite categories — with air-conditioning, free Wi-Fi, satellite TV, minibar, safe, and tea/coffee facilities.</p><p>Sugar & Spice serves multi-cuisine dining on the first floor; Kings Court banquet hall seats up to about 300 guests, with open lawns for outdoor gatherings. Confirmed services include 24-hour reception, business centre, laundry, paid airport transfers, and reserved parking. Source: goldenleafkashmir.com.</p>",
    address: "Hyderpora, Srinagar, Jammu and Kashmir 190015",
    mapLat: "34.041913",
    mapLng: "74.788586",
    isFeatured: true,
    coverPrompt:
      "Photorealistic modern hotel exterior Hyderpora Srinagar Kashmir evening lights, no text",
    amenities: [...wifiRestParkDesk, "catalog_hotel_amenity_laundry"],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Deluxe Room",
        summary: "Entry category with king bed, AC, smart TV, safe, and in-room dining.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 14,
        quantity: 12,
        pricePerNight: 5500,
        extraGuestPrice: 1000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
      {
        name: "Super Deluxe Room",
        summary: "About 250 sq ft king room on floors 3–4 with full Golden Leaf room amenities.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 23,
        quantity: 10,
        pricePerNight: 6500,
        extraGuestPrice: 1000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city", "catalog_room_feature_balcony"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
      {
        name: "Executive Room",
        summary: "About 290 sq ft refined king room for business and leisure travellers.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 27,
        quantity: 8,
        pricePerNight: 6000,
        extraGuestPrice: 1000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
      {
        name: "Family Room",
        summary: "Interconnected family layout ~450 sq ft with two king beds for up to four adults.",
        occupancy: 4,
        bedType: "King",
        sizeSqm: 42,
        quantity: 4,
        pricePerNight: 7000,
        extraGuestPrice: 1000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
    ],
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
      "Munawarabad hotel ~10 min walk from Dal Lake — 69 Super Deluxe + 6 Suites, Asian Darbar, and GOL MAHAL banquet.",
    description:
      "<p>Hotel Asian Park (est. 2016) on Munawar Link Road, Munawarabad, publishes 74 rooms: 69 Super Deluxe (~244 sq ft) and 6 Suites (~350 sq ft with living area and minibar). The official site highlights a 10-minute walk to Dal Lake, Asian Darbar multi-cuisine restaurant on the ground floor, and GOL MAHAL banquet for up to about 100 guests with AV support.</p><p>Facilities commonly listed include free parking, fitness centre, terrace/garden, 24-hour room service, business centre, and paid airport shuttle. Source: hotelasianpark.com.</p>",
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
        summary: "Official Super Deluxe (~244 sq ft) with tea/coffee maker — 69 keys in inventory.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 23,
        quantity: 69,
        pricePerNight: 6500,
        extraGuestPrice: 1200,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv],
      },
      {
        name: "Suite",
        summary: "Official Suite (~350 sq ft) with living area, minibar, and tea/coffee maker.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 33,
        quantity: 6,
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
      "Family-run Dalgate hotel since 2012 at Khayam Chowk — ~700 m walk to Dal Lake, Batoo Darbar, Super Deluxe & Premium.",
    description:
      "<p>Hotel Royal Batoo opened in 2012 at Khayam Chowk, Dalgate Bridge, near Khyber Hospital — about 700 m / 10 minutes’ walk from Dal Lake and roughly 12 km from Srinagar Airport. Official rooms are Super Deluxe (wood-panelled, Kashmiri textiles, tea tray) and Premium (AC, tufted headboard, interconnected options for families).</p><p>Batoo Darbar serves Kashmiri, Indian, and continental cuisine with buffet dining, lounge, and rooftop garden/gazebo. Confirmed services: 24-hour room service, Wi-Fi, complimentary parking, laundry, travel assistance, doctor on call, and power backup. Source: hotelroyalbatoo.com.</p>",
    address: "Khayam Chowk, Dalgate Bridge, near Khyber Hospital, Srinagar, J&K 190001",
    mapLat: "34.083900",
    mapLng: "74.851200",
    isFeatured: true,
    coverPrompt:
      "Photorealistic boutique hotel near Dalgate Srinagar Kashmir warm wood interiors exterior, evening, no text",
    amenities: [...wifiRestParkDesk, "catalog_hotel_amenity_laundry"],
    cancellationPolicy: cancel3,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Super Deluxe Room",
        summary: "Warm wood-panelled king room with Kashmiri textiles, LED TV, minibar, safe, and tea tray.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 26,
        quantity: 12,
        pricePerNight: 6800,
        extraGuestPrice: 1300,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe", "catalog_room_amenity_kettle"],
      },
      {
        name: "Premium Room",
        summary: "Most refined category with AC, minibar, safe — interconnected pairs available for families.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 30,
        quantity: 10,
        pricePerNight: 8500,
        extraGuestPrice: 1500,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe", "catalog_room_amenity_kettle"],
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
      "Self-described 4-star Munawarabad hotel — ~48 rooms (Premium + Family Suites), restaurant, parking, near Dal Lake.",
    description:
      "<p>Hotel Milan on Munawar Link Road, Munawarabad, markets itself as a 4-star city hotel with roughly 48 keys (about 42 Premium rooms and 6 Family Suites per TripAdvisor descriptions). Public listings highlight AC rooms, flat-screen TV, minibar, restaurant dining, free breakfast options, free Wi-Fi, free parking, banquet/conference space, elevator, and airport transport.</p><p>A practical base for Dal Lake and Lal Chowk day trips without Boulevard pricing. Source: hotelmilan.in and major OTAs.</p>",
    address: "Munawar Link Road, Munawarabad, Srinagar, J&K 190001",
    mapLat: "34.081500",
    mapLng: "74.840800",
    isFeatured: false,
    coverPrompt:
      "Photorealistic modest city hotel Munawarabad Srinagar street view, daylight, no text",
    amenities: [...wifiRestParkDesk],
    cancellationPolicy: cancel2,
    houseRules: rulesStd,
    rooms: [
      {
        name: "Premium Room",
        summary: "Main inventory category with AC, flat-screen TV, minibar, and walk-in shower.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 24,
        quantity: 42,
        pricePerNight: 5000,
        extraGuestPrice: 1000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv],
      },
      {
        name: "Family Suite",
        summary: "Suite layout with seating area for families — six keys in published inventory.",
        occupancy: 4,
        bedType: "King",
        sizeSqm: 36,
        quantity: 6,
        pricePerNight: 7500,
        extraGuestPrice: 1200,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_city"],
        amenities: [...roomAcWifiTv, "catalog_room_amenity_safe"],
      },
    ],
  },

  // —— Gulmarg ——
  {
    slug: "apple-tree-resorts-gulmarg",
    name: "Apple Tree Resorts",
    destinationSlug: "gulmarg",
    propertyType: "resort",
    starRating: 4,
    summary:
      "4-star resort on Srinagar–Gulmarg Road, Batpora Kunzer — 55 rooms, pool, jacuzzi, sauna, and multi-cuisine dining.",
    description:
      "<p>Apple Tree Resorts is a self-described 4-star property on Srinagar–Gulmarg Road, Batpora, Kunzer, with 55 rooms across two interconnected buildings. Official categories include Deluxe, Super Deluxe, Junior Suite (balcony), and Presidential Suite (jacuzzi). Facilities listed on appletreeresorts.com include a swimming pool, jacuzzi, sauna, Shahjar and Dastarkhwan restaurants, open-air Aab-Shar dining, and Diwan-e-Khana banquet with AV.</p><p>Expect roughly 15–22 km to the Gulmarg Gondola — ideal when you want resort grounds and dining on the approach rather than a compact meadow-core room.</p>",
    address: "Srinagar–Gulmarg Road, Batpora, Kunzer, Baramulla, J&K 193401",
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
        name: "Deluxe Room",
        summary: "Official deluxe category with smart TV, AC, minibar, and Wi-Fi (~300 sq ft on major OTAs).",
        occupancy: 2,
        bedType: "Double",
        sizeSqm: 28,
        quantity: 20,
        pricePerNight: 6200,
        extraGuestPrice: 1200,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac"],
      },
      {
        name: "Super Deluxe Room",
        summary: "Larger category with mountain/hill views and pool access per resort listing.",
        occupancy: 2,
        bedType: "Double",
        sizeSqm: 32,
        quantity: 16,
        pricePerNight: 7500,
        extraGuestPrice: 1400,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac"],
      },
      {
        name: "Junior Suite",
        summary: "Extra space with private balcony — official junior suite category.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 36,
        quantity: 10,
        pricePerNight: 9500,
        extraGuestPrice: 1600,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac", "catalog_room_amenity_safe"],
      },
      {
        name: "Presidential Suite",
        summary: "Top category with expansive layout, strong views, and exclusive jacuzzi.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 45,
        quantity: 2,
        pricePerNight: 14000,
        extraGuestPrice: 2000,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac", "catalog_room_amenity_safe"],
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
      "Compact Gulmarg hotel near Gondola / Grand Mumtaz — ~10 heated rooms, restaurant, and Wi-Fi.",
    description:
      "<p>Hotel Mama Palace is listed behind the Wildlife Hut near the cable car / Gondola area (Hardu Aboora), close to Grand Mumtaz. Travel portals describe about 10 rooms with heaters, electric blankets, attached baths with hot water, kettle, TV, restaurant dining, room service, Wi-Fi, and parking assistance.</p><p>Gondola access is commonly quoted around 1 km — useful for travellers who want to sleep inside Gulmarg without five-star pricing.</p>",
    address: "Behind Wildlife Hut, near Cable Car / Grand Mumtaz, Hardu Aboora, Gulmarg, J&K 193403",
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
      "28-room Srichen Main Road hotel with Kolahoi Peak and Lidder views — Super Deluxe, Premium, and Family rooms.",
    description:
      "<p>Hotel Green Heights on Main Road, Srichen, Pahalgam publishes 28 double rooms and suites with 24-hour reception and restaurant dining. Official Super Deluxe rooms emphasise mountain and pine views with in-room meals; Premium rooms feature a round double bed, 32\" LED TV, mini fridge, locker, and large valley-facing windows.</p><p>Tripadvisor scores commonly sit near 4.6/5 for location, staff, and food. Lawns and Lidder proximity make it a strong mid-luxury pick for honeymoon and family packages. Source: hotelgreenheights.com.</p>",
    address: "Main Road, Srichen (Serchan), Pahalgam, Anantnag, J&K 192126",
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
        name: "Super Deluxe Room",
        summary: "Renovated double with pine and Kolahoi Peak outlook; meals can be served in-room.",
        occupancy: 2,
        bedType: "Double",
        sizeSqm: 26,
        quantity: 16,
        pricePerNight: 7200,
        extraGuestPrice: 1400,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
      {
        name: "Premium Room",
        summary: "Round double bed, 32\" LED, mini fridge, locker, and large valley-view windows.",
        occupancy: 2,
        bedType: "Double",
        sizeSqm: 30,
        quantity: 8,
        pricePerNight: 9500,
        extraGuestPrice: 1600,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
      },
      {
        name: "Family Room",
        summary: "Spacious family layout with mountain views among the 28-key inventory.",
        occupancy: 4,
        bedType: "King",
        sizeSqm: 36,
        quantity: 4,
        pricePerNight: 11000,
        extraGuestPrice: 1800,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
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
      "4-star Lidder-bank hotel at Rafting Point, Movera — 21 rooms: Orchard View, River View, Royal Suite, King Square.",
    description:
      "<p>The Pahalgam Shore is a self-described 4-star hotel on the Lidder at Rafting Point, Movera, with 21 designed rooms and suites. Official categories include Orchard View, River View, Royal Suite, and King Square Suite, plus multi-cuisine restaurant, lounge, fitness centre, and Kolahoi-range views. Published EP rates start around ₹8,500; MAP packages run higher.</p><p>About 15–20 minutes by road to Pahalgam town — pairs well with Betaab, Aru, and Chandanwari day circuits. Source: thepahalgamshore.com.</p>",
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
        name: "Orchard View Room",
        summary: "Entry category with apple-orchard outlook among the 21-key inventory.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 26,
        quantity: 8,
        pricePerNight: 8800,
        extraGuestPrice: 1600,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater],
      },
      {
        name: "River View Room",
        summary: "Lidder-facing room with upgraded furnishings.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 28,
        quantity: 6,
        pricePerNight: 10000,
        extraGuestPrice: 1800,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater],
      },
      {
        name: "Royal Suite",
        summary: "Suite with living area and private balcony for celebratory stays.",
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
        name: "King Square Suite",
        summary: "Largest suite category with living room and balcony.",
        occupancy: 3,
        bedType: "King",
        sizeSqm: 45,
        quantity: 3,
        pricePerNight: 15000,
        extraGuestPrice: 2200,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_safe"],
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
      "Botakote Rafting Point hotel with Deluxe (~160 sq ft), Superior (~256 sq ft), and Studio Suite (~330 sq ft).",
    description:
      "<p>Hotel Hayat Residency at Botakote near Rafting Point (landmark: Power Receiving Station) lists Deluxe (~160 sq ft), Superior (~256 sq ft), and Studio Suite (~330 sq ft) categories with king beds, AC, LED TV, Wi-Fi, safe, and tea/coffee. Public amenities include restaurant, free parking, pickup/drop, 24-hour desk, and mountain-view garden — about 6 km before main Pahalgam town on the highway.</p><p>Polished inventory on the rafting-point corridor with enough keys for groups. Sources: hotelhayatresidency.com and major OTAs.</p>",
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
        name: "Deluxe Room",
        summary: "About 160 sq ft king room with AC, 40\" LED, Wi-Fi, safe, and tea/coffee.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 15,
        quantity: 18,
        pricePerNight: 7800,
        extraGuestPrice: 1400,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac", "catalog_room_amenity_safe"],
      },
      {
        name: "Superior Room",
        summary: "About 256 sq ft upgraded king room with more living space.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 24,
        quantity: 12,
        pricePerNight: 9200,
        extraGuestPrice: 1600,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac", "catalog_room_amenity_safe"],
      },
      {
        name: "Studio Suite",
        summary: "About 330 sq ft living/bedroom suite with premium bath fixtures.",
        occupancy: 2,
        bedType: "King",
        sizeSqm: 31,
        quantity: 6,
        pricePerNight: 11000,
        extraGuestPrice: 1800,
        mealPlan: "breakfast",
        features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"],
        amenities: [...roomWifiHeater, "catalog_room_amenity_ac", "catalog_room_amenity_safe"],
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
