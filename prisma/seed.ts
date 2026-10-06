import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/hash";
import {
  customerPermissions,
  type StaffPermission,
} from "../src/lib/auth/permissions";

const prisma = new PrismaClient();

const destinations = [
  {
    slug: "jammu",
    name: "Jammu",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Temple city and the gateway into the mountains.",
    mapLat: "32.7266",
    mapLng: "74.8570",
    mapZoom: 11,
    imageUrl: "/uploads/destinations/seed-jammu.svg",
    imageKey: "destinations/seed-jammu.svg",
    imageDriver: "local",
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Lakes, gardens, and valley stays around Srinagar.",
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 9,
    imageUrl: "/uploads/destinations/seed-kashmir.svg",
    imageKey: "destinations/seed-kashmir.svg",
    imageDriver: "local",
  },
  {
    slug: "ladakh",
    name: "Ladakh",
    region: "Ladakh",
    country: "India",
    summary: "High-altitude roads, monasteries, and trekking routes.",
    mapLat: "34.1526",
    mapLng: "77.5771",
    mapZoom: 8,
    imageUrl: "/uploads/destinations/seed-ladakh.svg",
    imageKey: "destinations/seed-ladakh.svg",
    imageDriver: "local",
  },
  {
    slug: "himachal",
    name: "Himachal Pradesh",
    region: "Himachal Pradesh",
    country: "India",
    summary: "Hill stations, passes, and multi-day treks.",
    mapLat: "31.1048",
    mapLng: "77.1734",
    mapZoom: 8,
    imageUrl: "/uploads/destinations/seed-himachal.svg",
    imageKey: "destinations/seed-himachal.svg",
    imageDriver: "local",
  },
  {
    slug: "goa",
    name: "Goa",
    region: "Goa",
    country: "India",
    summary: "Coastal stays, rides, and short escapes.",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 9,
    imageUrl: "/uploads/destinations/seed-goa.svg",
    imageKey: "destinations/seed-goa.svg",
    imageDriver: "local",
  },
  {
    slug: "kerala",
    name: "Kerala",
    region: "Kerala",
    country: "India",
    summary: "Backwaters, hills, and slow travel in the south.",
    mapLat: "9.9312",
    mapLng: "76.2673",
    mapZoom: 8,
    imageUrl: "/uploads/destinations/seed-kerala.svg",
    imageKey: "destinations/seed-kerala.svg",
    imageDriver: "local",
  },
  {
    slug: "thailand",
    name: "Thailand",
    region: "Thailand",
    country: "Thailand",
    summary: "City breaks, islands, and overland routes.",
    mapLat: "13.7563",
    mapLng: "100.5018",
    mapZoom: 6,
    imageUrl: "/uploads/destinations/seed-thailand.svg",
    imageKey: "destinations/seed-thailand.svg",
    imageDriver: "local",
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    region: "Vietnam",
    country: "Vietnam",
    summary: "Coast, highlands, and north-to-south journeys.",
    mapLat: "21.0278",
    mapLng: "105.8342",
    mapZoom: 6,
    imageUrl: "/uploads/destinations/seed-vietnam.svg",
    imageKey: "destinations/seed-vietnam.svg",
    imageDriver: "local",
  },
];

const places = [
  {
    slug: "pahalgam",
    name: "Pahalgam",
    parentSlug: "kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Meadows and river valleys south of Srinagar.",
    mapLat: "34.0161",
    mapLng: "75.3150",
    mapZoom: 12,
    imageUrl: "/uploads/destinations/seed-pahalgam.svg",
    imageKey: "destinations/seed-pahalgam.svg",
    imageDriver: "local",
  },
  {
    slug: "gulmarg",
    name: "Gulmarg",
    parentSlug: "kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Meadows and the gondola above the Kashmir valley.",
    mapLat: "34.0484",
    mapLng: "74.3805",
    mapZoom: 12,
    imageUrl: "/uploads/destinations/seed-gulmarg.svg",
    imageKey: "destinations/seed-gulmarg.svg",
    imageDriver: "local",
  },
];

const operationsPermissions: StaffPermission[] = [
  "destinations.view",
  "tours.view",
  "tours.manage",
  "bookings.view",
  "bookings.manage",
  "customers.view",
];

const testUsers = [
  {
    email: "admin@travel.test",
    password: "Admin@12345",
    name: "Asha Admin",
    roleKey: "admin",
  },
  {
    email: "staff@travel.test",
    password: "Staff@12345",
    name: "Sameer Staff",
    roleKey: "operations",
  },
  {
    email: "customer@travel.test",
    password: "Customer@12345",
    name: "Kiran Customer",
    roleKey: "customer",
  },
];

async function seedDestinations() {
  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: destination,
      create: destination,
    });
  }

  for (const place of places) {
    const { parentSlug, ...data } = place;
    const parent = await prisma.destination.findUnique({
      where: { slug: parentSlug },
      select: { id: true },
    });
    if (!parent) continue;
    await prisma.destination.upsert({
      where: { slug: place.slug },
      update: { ...data, parentId: parent.id },
      create: { ...data, parentId: parent.id },
    });
  }
}

async function seedTours() {
  const kashmir = await prisma.destination.findUnique({ where: { slug: "kashmir" } });
  const ladakh = await prisma.destination.findUnique({ where: { slug: "ladakh" } });
  if (!kashmir || !ladakh) return;

  const tours = [
    {
      slug: "kashmir-valley-trek",
      title: "Kashmir Valley trek",
      summary: "Meadows, alpine lakes, and village stays above Srinagar.",
      description: "A guided trek through the Kashmir valley with camping nights and local support.",
      durationDays: 6,
      difficulty: "moderate",
      maxGroupSize: 12,
      priceFrom: 28500,
      imageUrl: "/uploads/tours/seed-kashmir-trek.svg",
      imageKey: "tours/seed-kashmir-trek.svg",
      imageDriver: "local",
      published: true,
      destinationId: kashmir.id,
    },
    {
      slug: "ladakh-monastery-ride",
      title: "Ladakh monastery ride",
      summary: "High passes, monasteries, and desert valleys around Leh.",
      description: "A paced road trip covering Leh, Hemis, and Pangong with acclimatization days.",
      durationDays: 8,
      difficulty: "challenging",
      maxGroupSize: 10,
      priceFrom: 42000,
      imageUrl: "/uploads/tours/seed-ladakh-ride.svg",
      imageKey: "tours/seed-ladakh-ride.svg",
      imageDriver: "local",
      published: true,
      destinationId: ladakh.id,
    },
  ];

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: tour,
      create: tour,
    });
  }
}

function hotelCard(title: string, from: string, to: string, wide: boolean) {
  const width = wide ? 1920 : 1600;
  const height = wide ? 823 : 1000;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <text x="64" y="${height - 80}" fill="white" font-family="Arial, sans-serif" font-size="56" font-weight="700">${title}</text>
</svg>`;
}

const seedHotels = [
  {
    slug: "dal-lake-house-hotel",
    name: "Dal Lake House Hotel",
    destinationSlug: "kashmir",
    propertyType: "hotel",
    starRating: 4,
    summary: "A lakeside hotel in Srinagar with shikara access and garden rooms set back from the water.",
    description:
      "<p>Wake up to the lake, then spend the day in the Mughal gardens or on a quiet shikara ride. Breakfast is served in the dining room overlooking the water.</p>",
    address: "Boulevard Road, Srinagar, Kashmir",
    mapLat: "34.1036",
    mapLng: "74.8606",
    colors: ["#0284c7", "#0f172a"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_desk", "catalog_hotel_amenity_laundry"],
    cancellationPolicy: "Free cancellation until 3 days before check-in. After that, the first night is charged.",
    houseRules: "Quiet hours after 10 pm. Smoking is limited to the garden.",
    isFeatured: true,
    rooms: [
      { name: "Standard garden", summary: "A quieter room facing the inner garden.", occupancy: 2, bedType: "Queen", sizeSqm: 24, quantity: 8, pricePerNight: 6400, extraGuestPrice: 1200, mealPlan: "breakfast", features: ["catalog_room_feature_garden"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_toiletries"] },
      { name: "Deluxe lake view", summary: "A balcony room looking onto Dal Lake.", occupancy: 2, bedType: "King", sizeSqm: 32, quantity: 6, pricePerNight: 9200, extraGuestPrice: 1500, mealPlan: "breakfast", features: ["catalog_room_feature_balcony", "catalog_room_feature_bath"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_tv", "catalog_room_amenity_safe", "catalog_room_amenity_kettle"] },
      { name: "Lake suite", summary: "A larger suite with a separate sitting area.", occupancy: 3, bedType: "King", sizeSqm: 48, quantity: 2, pricePerNight: 14500, extraGuestPrice: 1800, mealPlan: "half_board", features: ["catalog_room_feature_balcony", "catalog_room_feature_bath"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_minibar", "catalog_room_amenity_safe", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "gulmarg-meadow-resort",
    name: "Gulmarg Meadow Resort",
    destinationSlug: "gulmarg",
    propertyType: "resort",
    starRating: 4,
    summary: "A meadow resort below the gondola, with chalets for ski season and summer walks.",
    description: "<p>The resort sits on the meadow with a short walk to the gondola base. Rooms are heated, and the dining room serves early breakfast before the first ride up.</p>",
    address: "Gondola Road, Gulmarg, Kashmir",
    mapLat: "34.0484",
    mapLng: "74.3805",
    colors: ["#059669", "#052e16"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_parking", "catalog_hotel_amenity_desk"],
    cancellationPolicy: "Free cancellation until 5 days before check-in in winter, 2 days in summer.",
    houseRules: "Ski equipment stays in the boot room. Outside shoes come off at the chalet door.",
    isFeatured: true,
    rooms: [
      { name: "Meadow room", summary: "A warm double looking onto the lower meadow.", occupancy: 2, bedType: "Queen", sizeSqm: 28, quantity: 10, pricePerNight: 7800, extraGuestPrice: 1400, mealPlan: "breakfast", features: ["catalog_room_feature_mountain"], amenities: ["catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_tv", "catalog_room_amenity_toiletries"] },
      { name: "Gondola chalet", summary: "A detached chalet with a balcony toward the slopes.", occupancy: 4, bedType: "King", sizeSqm: 46, quantity: 4, pricePerNight: 12800, extraGuestPrice: 1600, mealPlan: "half_board", features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony", "catalog_room_feature_kitchen"], amenities: ["catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_safe", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "pahalgam-river-homestay",
    name: "Pahalgam River Homestay",
    destinationSlug: "pahalgam",
    propertyType: "homestay",
    starRating: 3,
    summary: "A family homestay beside the Lidder, with two cottages and a shared dining table.",
    description: "<p>The family cooks Kashmiri meals if you ask the evening before. Both cottages open toward the river path used by morning walkers.</p>",
    address: "Laripora Road, Pahalgam, Kashmir",
    mapLat: "34.0161",
    mapLng: "75.3150",
    colors: ["#0d9488", "#134e4a"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_parking", "catalog_hotel_amenity_restaurant"],
    cancellationPolicy: "Free cancellation until 48 hours before check-in.",
    houseRules: "Dinner is served at 8 pm. Please tell the family about dietary needs a day ahead.",
    isFeatured: false,
    rooms: [
      { name: "River room", summary: "The smaller room, closest to the water.", occupancy: 2, bedType: "Double", sizeSqm: 18, quantity: 2, pricePerNight: 4200, extraGuestPrice: 800, mealPlan: "breakfast", features: ["catalog_room_feature_garden"], amenities: ["catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_toiletries"] },
      { name: "Family cottage", summary: "A cottage with a small kitchenette for longer stays.", occupancy: 4, bedType: "Queen", sizeSqm: 36, quantity: 2, pricePerNight: 6800, extraGuestPrice: 900, mealPlan: "half_board", features: ["catalog_room_feature_kitchen", "catalog_room_feature_garden"], amenities: ["catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "leh-view-hotel",
    name: "Leh View Hotel",
    destinationSlug: "ladakh",
    propertyType: "hotel",
    starRating: 3,
    summary: "A practical Leh hotel for the first nights of acclimatization, with mountain-facing rooms.",
    description: "<p>Most guests stay here before the high passes. The hotel keeps oxygen on request and serves an early breakfast for Pangong departures.</p>",
    address: "Old Road, Leh, Ladakh",
    mapLat: "34.1642",
    mapLng: "77.5847",
    colors: ["#d97706", "#431407"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_parking", "catalog_hotel_amenity_desk"],
    cancellationPolicy: "Free cancellation until 4 days before check-in.",
    houseRules: "Rest on arrival day. The hotel can arrange a doctor if altitude symptoms start.",
    isFeatured: false,
    rooms: [
      { name: "Mountain double", summary: "A simple heated double with a valley view.", occupancy: 2, bedType: "Double", sizeSqm: 22, quantity: 12, pricePerNight: 5500, extraGuestPrice: 1000, mealPlan: "breakfast", features: ["catalog_room_feature_mountain"], amenities: ["catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_tv"] },
      { name: "Family triple", summary: "Three beds for a small group sharing one room.", occupancy: 3, bedType: "Twin", sizeSqm: 30, quantity: 4, pricePerNight: 7900, extraGuestPrice: 1100, mealPlan: "breakfast", features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"], amenities: ["catalog_room_amenity_wifi", "catalog_room_amenity_kettle", "catalog_room_amenity_safe"] },
    ],
  },
  {
    slug: "manali-cedar-resort",
    name: "Manali Cedar Resort",
    destinationSlug: "himachal",
    propertyType: "resort",
    starRating: 4,
    summary: "A cedar-forest resort above the Beas, used as a base for Solang and Old Manali.",
    description: "<p>The resort is a short drive from Mall Road and quieter at night. The valley suite has a fireplace that the staff lights on request.</p>",
    address: "Aleo, Manali, Himachal Pradesh",
    mapLat: "32.2396",
    mapLng: "77.1887",
    colors: ["#15803d", "#052e16"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_parking", "catalog_hotel_amenity_spa", "catalog_hotel_amenity_gym"],
    cancellationPolicy: "Free cancellation until 3 days before check-in. Peak-week stays need 7 days.",
    houseRules: "Bonfires stay in the marked pit. The spa books out by evening in season.",
    isFeatured: true,
    rooms: [
      { name: "Standard cedar", summary: "A forest-facing room on the lower floor.", occupancy: 2, bedType: "Queen", sizeSqm: 26, quantity: 14, pricePerNight: 6200, extraGuestPrice: 1200, mealPlan: "room_only", features: ["catalog_room_feature_garden"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_tv", "catalog_room_amenity_kettle"] },
      { name: "Pine deluxe", summary: "A balcony room higher up the slope.", occupancy: 2, bedType: "King", sizeSqm: 34, quantity: 8, pricePerNight: 9800, extraGuestPrice: 1500, mealPlan: "breakfast", features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_minibar", "catalog_room_amenity_safe"] },
      { name: "Valley suite", summary: "A suite with a sitting room and fireplace.", occupancy: 3, bedType: "King", sizeSqm: 52, quantity: 3, pricePerNight: 15200, extraGuestPrice: 1800, mealPlan: "breakfast", features: ["catalog_room_feature_mountain", "catalog_room_feature_balcony", "catalog_room_feature_bath"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_minibar", "catalog_room_amenity_safe", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "calangute-beach-hotel",
    name: "Calangute Beach Hotel",
    destinationSlug: "goa",
    propertyType: "hotel",
    starRating: 4,
    summary: "A beach hotel a few minutes from Calangute, with sea-facing rooms and a pool.",
    description: "<p>The pool deck faces the evening wind off the beach. Sea-view rooms are on the top two floors; garden rooms are quieter and closer to the restaurant.</p>",
    address: "Calangute Beach Road, Goa",
    mapLat: "15.5495",
    mapLng: "73.7535",
    colors: ["#0284c7", "#155e75"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_pool", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_parking", "catalog_hotel_amenity_spa"],
    cancellationPolicy: "Free cancellation until 5 days before check-in from December to February.",
    houseRules: "Pool closes at 8 pm. Beach towels are collected at the desk.",
    isFeatured: false,
    rooms: [
      { name: "Garden queen", summary: "A pool-garden room away from the road.", occupancy: 2, bedType: "Queen", sizeSqm: 28, quantity: 16, pricePerNight: 7900, extraGuestPrice: 1500, mealPlan: "breakfast", features: ["catalog_room_feature_garden"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_tv", "catalog_room_amenity_safe"] },
      { name: "Sea-view king", summary: "A balcony room facing the beach.", occupancy: 3, bedType: "King", sizeSqm: 36, quantity: 8, pricePerNight: 12500, extraGuestPrice: 1800, mealPlan: "breakfast", features: ["catalog_room_feature_sea", "catalog_room_feature_balcony"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_minibar", "catalog_room_amenity_safe", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "alleppey-backwater-villa",
    name: "Alleppey Backwater Villa",
    destinationSlug: "kerala",
    propertyType: "villa",
    starRating: 5,
    summary: "Private villas on a quiet canal near Alleppey, with a pool cottage and a larger suite.",
    description: "<p>Each villa has its own sit-out over the canal. The team can arrange a day cruise, or you can stay in and use the pool cottage.</p>",
    address: "Punnamada, Alleppey, Kerala",
    mapLat: "9.5018",
    mapLng: "76.3388",
    colors: ["#047857", "#064e3b"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_pool", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_transfer", "catalog_hotel_amenity_service"],
    cancellationPolicy: "Free cancellation until 7 days before check-in. The villa holds a one-night charge after that.",
    houseRules: "The canal sit-out is shared only within your villa. Drones are not allowed.",
    isFeatured: true,
    rooms: [
      { name: "Pool cottage", summary: "A cottage with a private plunge pool.", occupancy: 2, bedType: "King", sizeSqm: 42, quantity: 3, pricePerNight: 14000, extraGuestPrice: 2000, mealPlan: "breakfast", features: ["catalog_room_feature_pool", "catalog_room_feature_garden"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_safe", "catalog_room_amenity_kettle"] },
      { name: "Canal suite", summary: "The larger suite, with a bathtub and canal sit-out.", occupancy: 3, bedType: "King", sizeSqm: 58, quantity: 2, pricePerNight: 18500, extraGuestPrice: 2200, mealPlan: "half_board", features: ["catalog_room_feature_bath", "catalog_room_feature_balcony"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_minibar", "catalog_room_amenity_safe", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "chao-phraya-riverside-hotel",
    name: "Chao Phraya Riverside Hotel",
    destinationSlug: "thailand",
    propertyType: "hotel",
    starRating: 4,
    summary: "A riverside hotel in Bangkok with ferry access and rooms facing either the river or the city.",
    description: "<p>The hotel pier connects to the river boats. River rooms are worth it at sunset; city rooms are the better price if you are out all day.</p>",
    address: "Charoen Krung, Bangkok, Thailand",
    mapLat: "13.7244",
    mapLng: "100.5140",
    colors: ["#7c3aed", "#1e1b4b"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_pool", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_gym", "catalog_hotel_amenity_desk"],
    cancellationPolicy: "Free cancellation until 2 days before check-in.",
    houseRules: "The pool is open 7 am to 8 pm. River-boat tickets are sold at the desk.",
    isFeatured: false,
    rooms: [
      { name: "City queen", summary: "A compact room facing the street side.", occupancy: 2, bedType: "Queen", sizeSqm: 22, quantity: 20, pricePerNight: 4800, extraGuestPrice: 900, mealPlan: "room_only", features: ["catalog_room_feature_city"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_tv", "catalog_room_amenity_safe"] },
      { name: "River king", summary: "A king room with a river balcony.", occupancy: 2, bedType: "King", sizeSqm: 32, quantity: 10, pricePerNight: 7200, extraGuestPrice: 1100, mealPlan: "breakfast", features: ["catalog_room_feature_balcony", "catalog_room_feature_city"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_minibar", "catalog_room_amenity_safe", "catalog_room_amenity_tv"] },
    ],
  },
  {
    slug: "hoi-an-lantern-guesthouse",
    name: "Hoi An Lantern Guesthouse",
    destinationSlug: "vietnam",
    propertyType: "guesthouse",
    starRating: 3,
    summary: "A small guesthouse in Hoi An’s old streets, with simple doubles and one family room.",
    description: "<p>The guesthouse is inside the walking streets, so taxis stop a lane away. Staff keep bicycles for the rice fields outside town.</p>",
    address: "Nguyen Thai Hoc, Hoi An, Vietnam",
    mapLat: "15.8801",
    mapLng: "108.3380",
    colors: ["#e11d48", "#4c0519"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_laundry", "catalog_hotel_amenity_desk"],
    cancellationPolicy: "Free cancellation until 24 hours before check-in.",
    houseRules: "The old town is quiet after 10 pm. Bicycles are returned to the courtyard.",
    isFeatured: false,
    rooms: [
      { name: "Lantern double", summary: "A double on the lane, with a small balcony.", occupancy: 2, bedType: "Double", sizeSqm: 18, quantity: 6, pricePerNight: 2800, extraGuestPrice: 600, mealPlan: "breakfast", features: ["catalog_room_feature_balcony", "catalog_room_feature_city"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_kettle"] },
      { name: "Family room", summary: "A larger room for parents and one child.", occupancy: 3, bedType: "Queen", sizeSqm: 26, quantity: 2, pricePerNight: 3900, extraGuestPrice: 700, mealPlan: "breakfast", features: ["catalog_room_feature_city"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_tv", "catalog_room_amenity_toiletries"] },
    ],
  },
  {
    slug: "jammu-ridge-hotel",
    name: "Jammu Ridge Hotel",
    destinationSlug: "jammu",
    propertyType: "hotel",
    starRating: 3,
    summary: "A city hotel near the ridge, useful for a night before the drive into Kashmir.",
    description: "<p>Rooms are straightforward and air-conditioned. The hotel can hold a car for an early start toward the Banihal tunnel.</p>",
    address: "Raghunath Bazaar, Jammu",
    mapLat: "32.7303",
    mapLng: "74.8570",
    colors: ["#b45309", "#451a03"],
    amenities: ["catalog_hotel_amenity_wifi", "catalog_hotel_amenity_parking", "catalog_hotel_amenity_restaurant", "catalog_hotel_amenity_desk"],
    cancellationPolicy: "Free cancellation until 24 hours before check-in.",
    houseRules: "Early departures can take a packed breakfast from 5:30 am.",
    isFeatured: false,
    rooms: [
      { name: "City double", summary: "A practical double for a one-night stop.", occupancy: 2, bedType: "Double", sizeSqm: 20, quantity: 18, pricePerNight: 3600, extraGuestPrice: 700, mealPlan: "room_only", features: ["catalog_room_feature_city"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_tv"] },
      { name: "Executive king", summary: "A quieter king room on the upper floor.", occupancy: 2, bedType: "King", sizeSqm: 28, quantity: 6, pricePerNight: 5100, extraGuestPrice: 900, mealPlan: "breakfast", features: ["catalog_room_feature_city", "catalog_room_feature_bath"], amenities: ["catalog_room_amenity_ac", "catalog_room_amenity_wifi", "catalog_room_amenity_safe", "catalog_room_amenity_desk", "catalog_room_amenity_tv"] },
    ],
  },
] as const;

async function seedHotelsData() {
  const folder = path.join(process.cwd(), "public", "uploads", "hotels");
  await mkdir(folder, { recursive: true });

  for (const hotel of seedHotels) {
    const destination = await prisma.destination.findUnique({
      where: { slug: hotel.destinationSlug },
      select: { id: true },
    });
    if (!destination) continue;

    const coverKey = `hotels/seed-${hotel.slug}.svg`;
    const bannerKey = `hotels/seed-${hotel.slug}-banner.svg`;
    await writeFile(
      path.join(process.cwd(), "public", "uploads", coverKey),
      hotelCard(hotel.name, hotel.colors[0], hotel.colors[1], false),
    );
    await writeFile(
      path.join(process.cwd(), "public", "uploads", bannerKey),
      hotelCard(hotel.name, hotel.colors[0], hotel.colors[1], true),
    );

    const priceFrom = Math.min(...hotel.rooms.map((room) => room.pricePerNight));
    const saved = await prisma.hotel.upsert({
      where: { slug: hotel.slug },
      update: {},
      create: {
        slug: hotel.slug,
        name: hotel.name,
        summary: hotel.summary,
        description: hotel.description,
        propertyType: hotel.propertyType,
        starRating: hotel.starRating,
        checkIn: "14:00",
        checkOut: "11:00",
        priceFrom,
        currency: "INR",
        address: hotel.address,
        mapLat: hotel.mapLat,
        mapLng: hotel.mapLng,
        mapZoom: 14,
        amenitiesJson: JSON.stringify(hotel.amenities),
        faqsJson: JSON.stringify([
          {
            local: true,
            title: "What time is check-in?",
            content: "Check-in is from 14:00 and check-out is by 11:00.",
          },
        ]),
        cancellationPolicy: hotel.cancellationPolicy,
        houseRules: hotel.houseRules,
        isFeatured: hotel.isFeatured,
        seoIndex: true,
        seoTitle: hotel.name,
        seoDescription: hotel.summary,
        published: true,
        destinationId: destination.id,
        imageUrl: `/uploads/${coverKey}`,
        imageKey: coverKey,
        imageDriver: "local",
        featuredImageUrl: `/uploads/${bannerKey}`,
        featuredImageKey: bannerKey,
        featuredImageDriver: "local",
      },
      select: { id: true },
    });

    const existingRooms = await prisma.room.count({ where: { hotelId: saved.id } });
    if (existingRooms > 0) continue;

    await prisma.room.createMany({
      data: hotel.rooms.map((room, index) => ({
        hotelId: saved.id,
        name: room.name,
        summary: room.summary,
        occupancy: room.occupancy,
        bedType: room.bedType,
        sizeSqm: room.sizeSqm,
        quantity: room.quantity,
        pricePerNight: room.pricePerNight,
        extraGuestPrice: room.extraGuestPrice,
        mealPlan: room.mealPlan,
        featuresJson: JSON.stringify(room.features),
        amenitiesJson: JSON.stringify(room.amenities),
        active: true,
        sortOrder: index,
      })),
    });
  }
}

async function seedRoles() {
  await prisma.role.upsert({
    where: { key: "admin" },
    update: {
      name: "Administrator",
      scope: "staff",
      allAccess: true,
      isSystem: true,
    },
    create: {
      key: "admin",
      name: "Administrator",
      scope: "staff",
      allAccess: true,
      isSystem: true,
    },
  });

  const customer = await prisma.role.upsert({
    where: { key: "customer" },
    update: { name: "Customer", scope: "customer", isSystem: true },
    create: {
      key: "customer",
      name: "Customer",
      scope: "customer",
      isSystem: true,
    },
  });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: customer.id } }),
    prisma.rolePermission.createMany({
      data: customerPermissions.map((permission) => ({
        roleId: customer.id,
        permission,
      })),
    }),
  ]);

  const operations = await prisma.role.findUnique({
    where: { key: "operations" },
  });
  if (!operations) {
    await prisma.role.create({
      data: {
        key: "operations",
        name: "Operations staff",
        scope: "staff",
        permissions: {
          create: operationsPermissions.map((permission) => ({ permission })),
        },
      },
    });
  }
}

async function seedAdminFromEnv() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  const name =
    (process.env.SEED_ADMIN_NAME ?? "Administrator").trim() || "Administrator";

  if (!email || !password) {
    console.log(
      "No production admin created. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, then run seed again.",
    );
    return;
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const role = await prisma.role.findUniqueOrThrow({
    where: { key: "admin" },
  });

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await hashPassword(password);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        passwordHash,
        roleId: role.id,
        isActive: true,
      },
    });
    console.log(`Updated admin: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleId: role.id,
      isActive: true,
    },
  });
  console.log(`Created admin: ${email}`);
}

async function seedTestUsers() {
  for (const testUser of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existing) continue;

    const role = await prisma.role.findUniqueOrThrow({
      where: { key: testUser.roleKey },
    });
    await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        passwordHash: await hashPassword(testUser.password),
        roleId: role.id,
      },
    });
  }

  const customer = await prisma.user.findUniqueOrThrow({
    where: { email: "customer@travel.test" },
  });

  const sampleBookings = [
    {
      reference: "BK-SAMPLE-ENQ",
      module: "tour",
      status: "enquiry",
      title: "Markha Valley trek enquiry",
      guests: 2,
      notes: "Two people, prefer the second half of June.",
    },
    {
      reference: "BK-SAMPLE-CNF",
      module: "hotel",
      status: "confirmed",
      title: "Houseboat stay in Srinagar",
      guests: 2,
      amount: 18000,
      notes: "Two nights on Dal Lake.",
    },
  ];

  for (const booking of sampleBookings) {
    await prisma.booking.upsert({
      where: { reference: booking.reference },
      update: {},
      create: {
        ...booking,
        contactName: customer.name,
        contactEmail: customer.email,
        userId: customer.id,
      },
    });
  }
}

async function main() {
  await seedDestinations();
  await seedTours();
  await seedHotelsData();
  await seedRoles();
  const { ensureRentalDefaults } = await import("../src/lib/rentals/defaults");
  await ensureRentalDefaults();

  if (process.env.NODE_ENV === "production") {
    await seedAdminFromEnv();
    return;
  }

  await seedTestUsers();
  console.log("Test accounts:");
  for (const user of testUsers) {
    console.log(`  ${user.roleKey.padEnd(10)} ${user.email} / ${user.password}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
