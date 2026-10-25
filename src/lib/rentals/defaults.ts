import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { bikeCatalog, type BikeSeed } from "@/lib/rentals/bike-catalog";
import { carCatalog, type CarSeed } from "@/lib/rentals/car-catalog";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const configs: Array<{
  kind: string;
  name: string;
  appliesTo?: string;
  sortOrder: number;
  price?: number;
  priceUnit?: string;
  requiresNumber?: boolean;
  requiresIssueDate?: boolean;
  requiresExpiry?: boolean;
  description?: string;
}> = [
  { kind: "vehicle_type", name: "Hatchback", appliesTo: "car", sortOrder: 10 },
  { kind: "vehicle_type", name: "Sedan", appliesTo: "car", sortOrder: 20 },
  { kind: "vehicle_type", name: "SUV", appliesTo: "car", sortOrder: 30 },
  { kind: "vehicle_type", name: "MUV", appliesTo: "car", sortOrder: 40 },
  { kind: "vehicle_type", name: "Luxury", appliesTo: "car", sortOrder: 50 },
  { kind: "vehicle_type", name: "EV", appliesTo: "car", sortOrder: 60 },
  { kind: "vehicle_type", name: "Scooter", appliesTo: "bike", sortOrder: 70 },
  { kind: "vehicle_type", name: "Motorcycle", appliesTo: "bike", sortOrder: 80 },
  { kind: "vehicle_type", name: "Cruiser", appliesTo: "bike", sortOrder: 90 },
  { kind: "vehicle_type", name: "Adventure", appliesTo: "bike", sortOrder: 100 },
  { kind: "fuel", name: "Petrol", sortOrder: 10 },
  { kind: "fuel", name: "Diesel", sortOrder: 20 },
  { kind: "fuel", name: "CNG", sortOrder: 30 },
  { kind: "fuel", name: "Electric", sortOrder: 40 },
  { kind: "transmission", name: "Manual", sortOrder: 10 },
  { kind: "transmission", name: "Automatic", sortOrder: 20 },
  { kind: "tag", name: "Mostly rented", sortOrder: 10 },
  { kind: "tag", name: "Popular", sortOrder: 20 },
  { kind: "tag", name: "Best for comfort", sortOrder: 30 },
  { kind: "tag", name: "Best for spacing", sortOrder: 40 },
  { kind: "feature", name: "AC", sortOrder: 10 },
  { kind: "feature", name: "Bluetooth", sortOrder: 20 },
  { kind: "feature", name: "GPS", sortOrder: 30 },
  { kind: "feature", name: "USB", sortOrder: 40 },
  { kind: "feature", name: "Rear Camera", sortOrder: 50 },
  { kind: "feature", name: "Parking Sensors", sortOrder: 60 },
  { kind: "feature", name: "Sunroof", sortOrder: 70 },
  { kind: "feature", name: "Android Auto", sortOrder: 80 },
  { kind: "feature", name: "Apple CarPlay", sortOrder: 90 },
  { kind: "included", name: "Helmet included", appliesTo: "bike", sortOrder: 10 },
  {
    kind: "vehicle_document",
    name: "Registration",
    sortOrder: 10,
    requiresNumber: true,
    requiresExpiry: true,
  },
  {
    kind: "vehicle_document",
    name: "Insurance",
    sortOrder: 20,
    requiresNumber: true,
    requiresIssueDate: true,
    requiresExpiry: true,
  },
  {
    kind: "vehicle_document",
    name: "Pollution Certificate",
    sortOrder: 30,
    requiresNumber: true,
    requiresExpiry: true,
  },
  {
    kind: "vehicle_document",
    name: "Fitness Certificate",
    sortOrder: 40,
    requiresNumber: true,
    requiresExpiry: true,
  },
  {
    kind: "customer_document",
    name: "Driving Licence",
    sortOrder: 10,
    requiresNumber: true,
    requiresIssueDate: true,
    requiresExpiry: true,
  },
  {
    kind: "customer_document",
    name: "ID Proof",
    sortOrder: 20,
    requiresNumber: true,
  },
  {
    kind: "customer_document",
    name: "Address Proof",
    sortOrder: 30,
    requiresNumber: true,
  },
  {
    kind: "addon",
    name: "Additional Driver",
    sortOrder: 10,
    price: 500,
    priceUnit: "flat",
    description: "A second named driver for this rental.",
  },
  {
    kind: "addon",
    name: "Child Seat",
    appliesTo: "car",
    sortOrder: 20,
    price: 200,
    priceUnit: "per_day",
  },
  {
    kind: "addon",
    name: "GPS",
    sortOrder: 30,
    price: 150,
    priceUnit: "per_day",
  },
];

const policies = [
  {
    kind: "rule",
    name: "Valid driving licence",
    slug: "valid-driving-licence",
    description: "The driver must carry a valid driving licence for this vehicle class.",
    sortOrder: 10,
  },
  {
    kind: "rule",
    name: "Fuel policy",
    slug: "fuel-policy",
    description: "The vehicle is handed over with the fuel noted at pickup and should be returned the same way.",
    sortOrder: 20,
  },
  {
    kind: "rule",
    name: "Included distance",
    slug: "included-distance",
    description: "Distance above the included kilometres is charged at the extra-km rate on the booking.",
    sortOrder: 30,
  },
  {
    kind: "cancellation",
    name: "Free cancellation",
    slug: "cancel-48h",
    description: "Cancel at least 48 hours before pickup for a full refund of rental charges.",
    sortOrder: 10,
    hoursBeforePickup: 48,
    refundPercent: 100,
  },
  {
    kind: "cancellation",
    name: "Late cancellation",
    slug: "cancel-24h",
    description: "Cancel at least 24 hours before pickup for a 50% refund of rental charges.",
    sortOrder: 20,
    hoursBeforePickup: 24,
    refundPercent: 50,
  },
];

const demoFleet: Array<{
  slug: string;
  kind: "car" | "bike";
  name: string;
  brand: string;
  modelName: string;
  year: number;
  seats: number;
  doors: number | null;
  luggage: number;
  type: string;
  fuel: string;
  transmission: string;
  pricePerDay: number;
  destination: string;
  summary: string;
  color: string;
  registrationNumber: string;
}> = [
  {
    slug: "toyota-innova-crysta",
    kind: "car",
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    modelName: "Innova Crysta",
    year: 2023,
    seats: 7,
    doors: 5,
    luggage: 3,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Automatic",
    pricePerDay: 4500,
    destination: "kashmir",
    summary: "Seven-seat diesel MUV for family trips through the valley.",
    color: "#1d4ed8",
    registrationNumber: "JK01C4521",
  },
  {
    slug: "honda-city",
    kind: "car",
    name: "Honda City",
    brand: "Honda",
    modelName: "City",
    year: 2024,
    seats: 5,
    doors: 4,
    luggage: 2,
    type: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    pricePerDay: 2800,
    destination: "goa",
    summary: "Comfortable sedan for the coast and town.",
    color: "#0f766e",
    registrationNumber: "GA03H2284",
  },
  {
    slug: "maruti-swift",
    kind: "car",
    name: "Maruti Swift",
    brand: "Maruti",
    modelName: "Swift",
    year: 2022,
    seats: 5,
    doors: 4,
    luggage: 1,
    type: "Hatchback",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1800,
    destination: "goa",
    summary: "Compact hatchback that is easy to park.",
    color: "#b45309",
    registrationNumber: "GA07S9012",
  },
  {
    slug: "mahindra-thar",
    kind: "car",
    name: "Mahindra Thar",
    brand: "Mahindra",
    modelName: "Thar",
    year: 2023,
    seats: 4,
    doors: 3,
    luggage: 1,
    type: "SUV",
    fuel: "Diesel",
    transmission: "Manual",
    pricePerDay: 4000,
    destination: "ladakh",
    summary: "Open-top SUV for mountain roads.",
    color: "#9f1239",
    registrationNumber: "LA01T3456",
  },
  {
    slug: "royal-enfield-himalayan",
    kind: "bike",
    name: "Royal Enfield Himalayan",
    brand: "Royal Enfield",
    modelName: "Himalayan",
    year: 2023,
    seats: 2,
    doors: null,
    luggage: 1,
    type: "Motorcycle",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1800,
    destination: "ladakh",
    summary: "Adventure motorcycle for high passes.",
    color: "#1e3a8a",
    registrationNumber: "LA02H7890",
  },
  {
    slug: "honda-activa",
    kind: "bike",
    name: "Honda Activa",
    brand: "Honda",
    modelName: "Activa",
    year: 2024,
    seats: 2,
    doors: null,
    luggage: 0,
    type: "Scooter",
    fuel: "Petrol",
    transmission: "Automatic",
    pricePerDay: 600,
    destination: "goa",
    summary: "Easy scooter for town rides.",
    color: "#0369a1",
    registrationNumber: "GA05A1122",
  },
  {
    slug: "royal-enfield-classic-350",
    kind: "bike",
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    modelName: "Classic 350",
    year: 2022,
    seats: 2,
    doors: null,
    luggage: 0,
    type: "Cruiser",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1500,
    destination: "kashmir",
    summary: "Cruiser for valley roads.",
    color: "#44403c",
    registrationNumber: "JK02E3344",
  },
];

async function fleetImage(slug: string, title: string, color: string) {
  const key = `vehicles/seed-${slug}.svg`;
  const file = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(file), { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="${color}"/>
  <text x="60" y="700" fill="white" font-family="Arial, sans-serif" font-size="54" font-weight="700">${title}</text>
</svg>`;
  await writeFile(file, svg);
  return { url: `/uploads/${key}`, key };
}

async function fillLocationPins() {
  const locations = await prisma.rentalLocation.findMany({
    include: {
      destination: {
        select: { mapLat: true, mapLng: true, mapZoom: true, imageUrl: true, imageKey: true, imageDriver: true },
      },
    },
  });
  for (const location of locations) {
    const destination = location.destination;
    if (!destination) continue;
    if (location.mapLat && location.imageUrl) continue;
    await prisma.rentalLocation.update({
      where: { id: location.id },
      data: {
        mapLat: location.mapLat || destination.mapLat,
        mapLng: location.mapLng || destination.mapLng,
        mapZoom: location.mapZoom || destination.mapZoom || 12,
        imageUrl: location.imageUrl || destination.imageUrl,
        imageKey: location.imageKey || destination.imageKey,
        imageDriver: location.imageDriver || destination.imageDriver || "local",
      },
    });
  }
}

async function seedDemoFleet() {
  const [destinations, types, fuels, gears, locations] = await Promise.all([
    prisma.destination.findMany({
      where: { slug: { in: ["kashmir", "goa", "ladakh"] } },
      select: { id: true, slug: true },
    }),
    prisma.rentalConfig.findMany({ where: { kind: "vehicle_type" } }),
    prisma.rentalConfig.findMany({ where: { kind: "fuel" } }),
    prisma.rentalConfig.findMany({ where: { kind: "transmission" } }),
    prisma.rentalLocation.findMany({ select: { id: true, destinationId: true } }),
  ]);
  const destinationBySlug = new Map(destinations.map((item) => [item.slug, item.id]));

  for (const item of demoFleet) {
    const existing = await prisma.vehicle.findUnique({ where: { slug: item.slug } });
    if (existing) {
      if (!existing.registrationNumber || existing.registrationNumber.startsWith("REG")) {
        await prisma.vehicle.update({
          where: { id: existing.id },
          data: { registrationNumber: item.registrationNumber },
        });
      }
      continue;
    }
    const destinationId = destinationBySlug.get(item.destination);
    if (!destinationId) continue;
    const image = await fleetImage(item.slug, item.name, item.color);
    const location = locations.find((row) => row.destinationId === destinationId);
    const vehicleTypeId = types.find((row) => row.name === item.type)?.id;
    const fuelTypeId = fuels.find((row) => row.name === item.fuel)?.id;
    const transmissionId = gears.find((row) => row.name === item.transmission)?.id;
    await prisma.vehicle.create({
      data: {
        slug: item.slug,
        kind: item.kind,
        name: item.name,
        registrationNumber: item.registrationNumber,
        brand: item.brand,
        modelName: item.modelName,
        year: item.year,
        summary: item.summary,
        seats: item.seats,
        doors: item.doors,
        luggage: item.luggage,
        includedKmPerDay: item.kind === "car" ? 200 : 120,
        pricePerDay: item.pricePerDay,
        securityDeposit: item.kind === "car" ? 5000 : 2000,
        currency: "INR",
        status: "available",
        published: true,
        allowCounterPickup: true,
        destinationId,
        ...(vehicleTypeId ? { vehicleTypeId } : {}),
        ...(fuelTypeId ? { fuelTypeId } : {}),
        ...(transmissionId ? { transmissionId } : {}),
        images: { create: [{ url: image.url, key: image.key, driver: "local", sortOrder: 0 }] },
        ...(location ? { locationLinks: { create: [{ locationId: location.id }] } } : {}),
      },
    });
  }

  const fortuner = await prisma.vehicle.findUnique({ where: { slug: "toyota-fortuner" } });
  if (fortuner && (!fortuner.registrationNumber || fortuner.registrationNumber.startsWith("REG"))) {
    await prisma.vehicle.update({
      where: { id: fortuner.id },
      data: { registrationNumber: "JK01F7781" },
    });
  }
}

function bikeMark(type: BikeSeed["type"]) {
  const wheels = `<circle cx="248" cy="318" r="40"/>
    <circle cx="248" cy="318" r="7" fill="#142033" stroke="none"/>
    <circle cx="552" cy="318" r="40"/>
    <circle cx="552" cy="318" r="7" fill="#142033" stroke="none"/>`;
  if (type === "Scooter") {
    return `${wheels}
      <path d="M284 318h48"/>
      <path d="M332 318l48-78h86"/>
      <path d="M466 240l48 78"/>
      <path d="M360 238c28-22 70-18 92 4"/>
      <path d="M430 214l28-52"/>
      <path d="M438 176h58"/>
      <path d="M468 168v-16"/>`;
  }
  if (type === "Cruiser") {
    return `${wheels}
      <path d="M288 318c28-18 70-28 118-22"/>
      <path d="M390 292c36-8 78 2 108 22"/>
      <path d="M430 286c22-26 58-30 86-8"/>
      <path d="M500 250c18-22 48-18 58 4"/>
      <path d="M548 236h42"/>
      <path d="M300 300h34"/>`;
  }
  if (type === "Adventure") {
    return `${wheels}
      <path d="M286 318l52-88h70"/>
      <path d="M408 230l46-62"/>
      <path d="M454 168h48"/>
      <path d="M470 168l28 46"/>
      <path d="M498 214l54 104"/>
      <path d="M360 228c24-16 58-12 78 8"/>
      <path d="M430 188h22l10 22h-18z" fill="#142033" stroke="none"/>`;
  }
  return `${wheels}
    <path d="M286 318l58-86h54"/>
    <path d="M398 232l40-58"/>
    <path d="M420 186h52"/>
    <path d="M448 174l36 58"/>
    <path d="M484 232l68 86"/>
    <path d="M352 230c26-18 64-14 86 8"/>`;
}

export function bikeStudioSvg(type: BikeSeed["type"]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#f3f1ec"/>
  <ellipse cx="400" cy="378" rx="180" ry="10" fill="#e6e1d8"/>
  <g fill="none" stroke="#142033" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    ${bikeMark(type)}
  </g>
</svg>`;
}

function carMark(type: CarSeed["type"]) {
  const wheels = `<circle cx="250" cy="318" r="34"/>
    <circle cx="250" cy="318" r="7" fill="#0e4b48" stroke="none"/>
    <circle cx="530" cy="318" r="34"/>
    <circle cx="530" cy="318" r="7" fill="#0e4b48" stroke="none"/>`;
  if (type === "SUV" || type === "MUV") {
    return `${wheels}
      <path d="M188 318h28"/>
      <path d="M284 318h212"/>
      <path d="M564 318h48"/>
      <path d="M210 318v-28c0-22 16-36 36-36h86l28-48h92c28 0 48 14 62 36l28 48h28c16 0 28 12 28 28"/>
      <path d="M360 206h78"/>
      <path d="M250 254h70"/>`;
  }
  if (type === "Luxury" || type === "Sedan") {
    return `${wheels}
      <path d="M176 318h40"/>
      <path d="M284 318h212"/>
      <path d="M564 318h70"/>
      <path d="M200 318c8-34 28-52 62-58h70l78-46h86c22 0 40 10 52 28l36 48h36c18 0 30 14 30 28"/>
      <path d="M410 214h70"/>
      <path d="M248 260h64"/>`;
  }
  return `${wheels}
    <path d="M196 318h20"/>
    <path d="M284 318h212"/>
    <path d="M564 318h36"/>
    <path d="M214 318c6-30 24-48 54-54h78l36-42h70c18 0 34 10 46 26l28 40h28c14 0 24 12 24 26"/>
    <path d="M382 222h62"/>
    <path d="M246 264h58"/>`;
}

export function carStudioSvg(type: CarSeed["type"]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#eef6f4"/>
  <ellipse cx="400" cy="372" rx="190" ry="10" fill="#d5e6e2"/>
  <g fill="none" stroke="#0e4b48" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    ${carMark(type)}
  </g>
</svg>`;
}

function keepsRemotePhoto(image: { url: string; driver: string } | undefined) {
  if (!image) return false;
  return image.driver === "cloudinary" || image.url.startsWith("https://");
}

async function carImage(item: CarSeed) {
  const key = `vehicles/seed-${item.slug}.svg`;
  const file = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, carStudioSvg(item.type));
  return { url: `/uploads/${key}`, key };
}

async function bikeImage(item: BikeSeed) {
  const key = `vehicles/seed-${item.slug}.svg`;
  const file = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bikeStudioSvg(item.type));
  return { url: `/uploads/${key}`, key };
}

const bikeTypes = [
  ["Scooter", 70],
  ["Motorcycle", 80],
  ["Cruiser", 90],
  ["Adventure", 100],
  ["Sports", 110],
  ["Touring", 120],
  ["Commuter", 130],
  ["Moped", 140],
  ["Cafe Racer", 150],
  ["Off-road", 160],
  ["Electric", 170],
] as const;

async function ensureBikeTypes() {
  for (const [name, sortOrder] of bikeTypes) {
    await ensureNamedConfig("vehicle_type", name, "bike", sortOrder);
  }
}

async function ensureTags() {
  const tags: Array<[string, number]> = [
    ["Mostly rented", 10],
    ["Popular", 20],
    ["Best for comfort", 30],
    ["Best for spacing", 40],
  ];
  for (const [name, sortOrder] of tags) {
    const slug = slugify(name);
    const existing = await prisma.rentalConfig.findUnique({
      where: { kind_slug: { kind: "tag", slug } },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.rentalConfig.create({
      data: { kind: "tag", name, slug, appliesTo: "all", sortOrder, active: true },
    });
  }
}

async function ensureCoverLists() {
  const helmet = await prisma.rentalConfig.findFirst({
    where: { kind: "feature", slug: "helmet-included" },
    select: { id: true },
  });
  const includedHelmet = await prisma.rentalConfig.findFirst({
    where: { kind: "included", slug: "helmet-included" },
    select: { id: true },
  });
  if (helmet && !includedHelmet) {
    await prisma.rentalConfig.update({
      where: { id: helmet.id },
      data: { kind: "included", appliesTo: "bike" },
    });
  } else if (!helmet && !includedHelmet) {
    await ensureNamedConfig("included", "Helmet included", "bike", 10);
  }
}

async function ensureNamedConfig(kind: string, name: string, appliesTo: string, sortOrder: number) {
  const slug = slugify(name);
  await prisma.rentalConfig.upsert({
    where: { kind_slug: { kind, slug } },
    update: { appliesTo, active: true },
    create: {
      kind,
      name,
      slug,
      appliesTo,
      sortOrder,
      active: true,
    },
  });
}

async function ensureSrinagarCarDesk() {
  const existing = await prisma.rentalLocation.findFirst({
    where: { fleet: "car", slug: { in: ["srinagar-desk", "calangute"] } },
  });
  if (existing) {
    if (existing.slug === "calangute") {
      const kashmir = await prisma.destination.findUnique({
        where: { slug: "kashmir" },
        select: { id: true, imageUrl: true, imageKey: true, imageDriver: true },
      });
      return prisma.rentalLocation.update({
        where: { id: existing.id },
        data: {
          name: "Srinagar desk",
          slug: "srinagar-desk",
          address: "Boulevard Road, Srinagar",
          destinationId: kashmir?.id,
          mapLat: "34.0837",
          mapLng: "74.7973",
          mapZoom: 13,
          imageUrl: kashmir?.imageUrl ?? existing.imageUrl,
          imageKey: kashmir?.imageKey ?? existing.imageKey,
          imageDriver: kashmir?.imageDriver || existing.imageDriver,
          active: true,
          fleet: "car",
        },
      });
    }
    return existing;
  }
  const kashmir = await prisma.destination.findUnique({
    where: { slug: "kashmir" },
    select: { id: true, imageUrl: true, imageKey: true, imageDriver: true },
  });
  return prisma.rentalLocation.create({
    data: {
      name: "Srinagar desk",
      slug: "srinagar-desk",
      address: "Boulevard Road, Srinagar",
      destinationId: kashmir?.id,
      mapLat: "34.0837",
      mapLng: "74.7973",
      mapZoom: 13,
      imageUrl: kashmir?.imageUrl ?? "",
      imageKey: kashmir?.imageKey ?? "",
      imageDriver: kashmir?.imageDriver || "local",
      active: true,
      fleet: "car",
    },
  });
}

async function seedCarCatalog() {
  for (const [name, sortOrder] of [
    ["Hatchback", 10],
    ["Sedan", 20],
    ["SUV", 30],
    ["MUV", 40],
    ["Luxury", 50],
    ["EV", 60],
  ] as const) {
    await ensureNamedConfig("vehicle_type", name, "car", sortOrder);
  }
  await ensureSrinagarCarDesk();

  const [types, fuels, gears, features, locations, takenRegs] = await Promise.all([
    prisma.rentalConfig.findMany({ where: { kind: "vehicle_type", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "fuel", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "transmission", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "feature", active: true } }),
    prisma.rentalLocation.findMany({
      where: { fleet: "car", active: true, slug: "srinagar-desk" },
      select: { id: true },
    }),
    prisma.vehicle.findMany({ select: { registrationNumber: true } }),
  ]);
  const usedRegs = new Set(takenRegs.map((row) => row.registrationNumber));
  const prefix: Record<string, string> = {
    goa: "GA",
    kashmir: "JK",
    ladakh: "LA",
    himachal: "HP",
    kerala: "KL",
    gulmarg: "JK",
    pahalgam: "JK",
    jammu: "JK",
  };
  let serial = 5100;

  for (const item of carCatalog) {
    const destination = await prisma.destination.findUnique({
      where: { slug: item.destination },
      select: { id: true },
    });
    if (!destination) continue;

    const photoFile = path.join(process.cwd(), "public", "uploads", "vehicles", "photos", `${item.slug}.jpg`);
    const image = existsSync(photoFile)
      ? { url: `/uploads/vehicles/photos/${item.slug}.jpg`, key: `vehicles/photos/${item.slug}.jpg` }
      : await carImage(item);
    const existing = await prisma.vehicle.findUnique({
      where: { slug: item.slug },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });
    if (existing) {
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          brand: item.brand,
          modelName: item.modelName,
          year: item.year,
          summary: item.summary,
          seats: item.seats,
          doors: item.doors,
          luggage: item.luggage,
          pricePerDay: item.pricePerDay,
          status: "available",
          published: true,
          destinationId: destination.id,
          vehicleTypeId: types.find((row) => row.name === item.type)?.id,
          fuelTypeId: fuels.find((row) => row.name === item.fuel)?.id,
          transmissionId: gears.find((row) => row.name === item.transmission)?.id,
        },
      });
      if (!keepsRemotePhoto(existing.images[0])) {
        if (existing.images[0]) {
          await prisma.vehicleImage.update({
            where: { id: existing.images[0].id },
            data: { url: image.url, key: image.key, driver: "local" },
          });
        } else {
          await prisma.vehicleImage.create({
            data: { vehicleId: existing.id, url: image.url, key: image.key, driver: "local", sortOrder: 0 },
          });
        }
      }
      continue;
    }

    let registrationNumber = "";
    do {
      serial += 1;
      registrationNumber = `${prefix[item.destination] ?? "IN"}${serial}C`;
    } while (usedRegs.has(registrationNumber));
    usedRegs.add(registrationNumber);

    const location = locations[0];
    const featureNames = ["AC"];
    if (item.pricePerDay >= 2200) featureNames.push("Bluetooth");
    if (item.type === "SUV" || item.type === "MUV" || item.type === "Luxury" || item.pricePerDay >= 4000) {
      featureNames.push("GPS");
    }
    if (item.type === "SUV" || item.type === "MUV" || item.type === "Luxury" || item.type === "EV") {
      featureNames.push("Rear Camera");
    }
    if (item.type === "Luxury") featureNames.push("Sunroof");
    if (item.fuel === "Electric" || item.pricePerDay >= 3000) featureNames.push("USB");
    const featureIds = featureNames
      .map((name) => features.find((row) => row.name === name)?.id)
      .filter((id): id is string => Boolean(id));
    const includedKm =
      item.type === "Luxury" ? 150 : item.type === "SUV" ? 250 : item.type === "MUV" ? 220 : 200;

    await prisma.vehicle.create({
      data: {
        slug: item.slug,
        kind: "car",
        name: item.name,
        registrationNumber,
        brand: item.brand,
        modelName: item.modelName,
        year: item.year,
        summary: item.summary,
        seats: item.seats,
        doors: item.doors,
        luggage: item.luggage,
        includedKmPerDay: includedKm,
        pricePerDay: item.pricePerDay,
        securityDeposit: item.pricePerDay >= 8000 ? 20000 : item.pricePerDay >= 4000 ? 10000 : 5000,
        extraKmCharge: item.type === "Luxury" ? 25 : 15,
        currency: "INR",
        status: "available",
        published: true,
        allowCounterPickup: true,
        destinationId: destination.id,
        vehicleTypeId: types.find((row) => row.name === item.type)?.id,
        fuelTypeId: fuels.find((row) => row.name === item.fuel)?.id,
        transmissionId: gears.find((row) => row.name === item.transmission)?.id,
        images: { create: [{ url: image.url, key: image.key, driver: "local", sortOrder: 0 }] },
        ...(featureIds.length > 0
          ? { features: { create: featureIds.map((configId) => ({ configId })) } }
          : {}),
        ...(location ? { locationLinks: { create: [{ locationId: location.id }] } } : {}),
      },
    });
  }
}

async function ensureDalLakeLocation() {
  const existing = await prisma.rentalLocation.findFirst({
    where: { fleet: "bike", slug: "dal-lake" },
  });
  if (existing) return existing;
  const kashmir = await prisma.destination.findUnique({
    where: { slug: "kashmir" },
    select: { id: true, imageUrl: true, imageKey: true, imageDriver: true },
  });
  return prisma.rentalLocation.create({
    data: {
      name: "Dal Lake",
      slug: "dal-lake",
      address: "Dal Lake, Srinagar",
      destinationId: kashmir?.id,
      mapLat: "34.1218",
      mapLng: "74.8544",
      mapZoom: 14,
      imageUrl: kashmir?.imageUrl ?? "",
      imageKey: kashmir?.imageKey ?? "",
      imageDriver: kashmir?.imageDriver || "local",
      active: true,
      fleet: "bike",
    },
  });
}

async function seedBikeCatalog() {
  await ensureNamedConfig("vehicle_type", "Adventure", "bike", 100);
  await ensureDalLakeLocation();

  const [types, fuels, gears, features, included, locations, takenRegs] = await Promise.all([
    prisma.rentalConfig.findMany({ where: { kind: "vehicle_type", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "fuel", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "transmission", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "feature", active: true } }),
    prisma.rentalConfig.findMany({ where: { kind: "included", active: true } }),
    prisma.rentalLocation.findMany({
      where: { fleet: "bike", active: true, slug: "dal-lake" },
      select: { id: true },
    }),
    prisma.vehicle.findMany({ select: { registrationNumber: true } }),
  ]);
  const usedRegs = new Set(takenRegs.map((row) => row.registrationNumber));
  const prefix: Record<string, string> = {
    goa: "GA",
    kashmir: "JK",
    ladakh: "LA",
    himachal: "HP",
    kerala: "KL",
    gulmarg: "JK",
    pahalgam: "JK",
    jammu: "JK",
  };
  let serial = 3200;

  for (const item of bikeCatalog) {
    const destination = await prisma.destination.findUnique({
      where: { slug: item.destination },
      select: { id: true },
    });
    if (!destination) continue;

    const photoFile = path.join(process.cwd(), "public", "uploads", "vehicles", "photos", `${item.slug}.jpg`);
    const image = existsSync(photoFile)
      ? { url: `/uploads/vehicles/photos/${item.slug}.jpg`, key: `vehicles/photos/${item.slug}.jpg` }
      : await bikeImage(item);
    const existing = await prisma.vehicle.findUnique({
      where: { slug: item.slug },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });
    if (existing) {
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          brand: item.brand,
          modelName: item.modelName,
          year: item.year,
          summary: item.summary,
          pricePerDay: item.pricePerDay,
          status: "available",
          published: true,
          destinationId: destination.id,
          vehicleTypeId: types.find((row) => row.name === item.type)?.id,
          fuelTypeId: fuels.find((row) => row.name === item.fuel)?.id,
          transmissionId: gears.find((row) => row.name === item.transmission)?.id,
        },
      });
      if (!keepsRemotePhoto(existing.images[0])) {
        if (existing.images[0]) {
          await prisma.vehicleImage.update({
            where: { id: existing.images[0].id },
            data: { url: image.url, key: image.key, driver: "local" },
          });
        } else {
          await prisma.vehicleImage.create({
            data: { vehicleId: existing.id, url: image.url, key: image.key, driver: "local", sortOrder: 0 },
          });
        }
      }
      continue;
    }

    let registrationNumber = "";
    do {
      serial += 1;
      registrationNumber = `${prefix[item.destination] ?? "IN"}${serial}B`;
    } while (usedRegs.has(registrationNumber));
    usedRegs.add(registrationNumber);

    const location = locations[0];
    const featureNames: string[] = [];
    if (item.fuel === "Electric") featureNames.push("USB");
    if (item.pricePerDay >= 2000) featureNames.push("GPS", "Bluetooth");
    const featureIds = [
      ...featureNames.map((name) => features.find((row) => row.name === name)?.id),
      included.find((row) => row.name === "Helmet included")?.id,
    ].filter((id): id is string => Boolean(id));

    await prisma.vehicle.create({
      data: {
        slug: item.slug,
        kind: "bike",
        name: item.name,
        registrationNumber,
        brand: item.brand,
        modelName: item.modelName,
        year: item.year,
        summary: item.summary,
        seats: 2,
        luggage: item.type === "Adventure" || item.type === "Cruiser" ? 1 : 0,
        includedKmPerDay: item.type === "Scooter" ? 80 : item.type === "Adventure" ? 160 : 120,
        pricePerDay: item.pricePerDay,
        securityDeposit: item.pricePerDay >= 2500 ? 5000 : 2000,
        extraKmCharge: 8,
        currency: "INR",
        status: "available",
        published: true,
        allowCounterPickup: true,
        destinationId: destination.id,
        vehicleTypeId: types.find((row) => row.name === item.type)?.id,
        fuelTypeId: fuels.find((row) => row.name === item.fuel)?.id,
        transmissionId: gears.find((row) => row.name === item.transmission)?.id,
        images: { create: [{ url: image.url, key: image.key, driver: "local", sortOrder: 0 }] },
        ...(featureIds.length > 0
          ? { features: { create: featureIds.map((configId) => ({ configId })) } }
          : {}),
        ...(location ? { locationLinks: { create: [{ locationId: location.id }] } } : {}),
      },
    });
  }

  const plates = [
    ...bikeCatalog.map((item) => ({ slug: item.slug, type: item.type })),
    { slug: "honda-activa", type: "Scooter" as const },
    { slug: "royal-enfield-himalayan", type: "Adventure" as const },
    { slug: "royal-enfield-classic-350", type: "Cruiser" as const },
  ];
  for (const item of plates) {
    await bikeImage({
      slug: item.slug,
      name: item.slug,
      brand: "",
      modelName: "",
      year: 2024,
      type: item.type,
      fuel: "Petrol",
      transmission: "Manual",
      pricePerDay: 0,
      destination: "goa",
      summary: "",
    });
  }
}

let ready: Promise<void> | null = null;

async function seedRentalDefaults() {
  await prisma.rentalSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      allowCounterPickup: true,
      allowHomeDelivery: true,
      taxPercent: 0,
      currency: "INR",
    },
  });

  if ((await prisma.rentalConfig.count()) === 0) {
    await prisma.rentalConfig.createMany({
      data: configs.map((item) => ({
        kind: item.kind,
        name: item.name,
        slug: slugify(item.name),
        description: item.description ?? "",
        appliesTo: item.appliesTo ?? "all",
        sortOrder: item.sortOrder,
        price: item.price ?? 0,
        priceUnit: item.priceUnit ?? "flat",
        requiresNumber: item.requiresNumber ?? false,
        requiresIssueDate: item.requiresIssueDate ?? false,
        requiresExpiry: item.requiresExpiry ?? false,
        active: true,
      })),
    });
  }

  await ensureCoverLists();
  await ensureTags();
  await ensureBikeTypes();

  if ((await prisma.rentalPolicy.count()) === 0) {
    await prisma.rentalPolicy.createMany({ data: policies });
  }

  if ((await prisma.rentalLocation.count()) === 0) {
    const destinations = await prisma.destination.findMany({
      where: { slug: { in: ["kashmir", "goa", "ladakh"] } },
      select: { id: true, slug: true, name: true, mapLat: true, mapLng: true, mapZoom: true, imageUrl: true, imageKey: true, imageDriver: true },
    });
    if (destinations.length > 0) {
      await prisma.rentalLocation.createMany({
        data: destinations.map((destination) => ({
          name: `${destination.name} desk`,
          slug: `${destination.slug}-desk`,
          address: `${destination.name} city pickup desk`,
          destinationId: destination.id,
          mapLat: destination.mapLat,
          mapLng: destination.mapLng,
          mapZoom: destination.mapZoom || 12,
          imageUrl: destination.imageUrl,
          imageKey: destination.imageKey,
          imageDriver: destination.imageDriver,
          active: true,
        })),
      });
    }
  }

  await fillLocationPins();
  await seedDemoFleet();
  await separateFleetRecords();
  await seedBikeCatalog();
  await seedCarCatalog();
}

async function separateFleetRecords() {
  const base = await prisma.rentalSettings.findUnique({ where: { id: "default" } });
  const settings = {
    allowCounterPickup: base?.allowCounterPickup ?? true,
    allowHomeDelivery: base?.allowHomeDelivery ?? true,
    taxPercent: base?.taxPercent ?? 0,
    currency: base?.currency ?? "INR",
  };
  for (const id of ["car", "bike"] as const) {
    await prisma.rentalSettings.upsert({
      where: { id },
      update: {},
      create: { id, ...settings },
    });
  }

  if ((await prisma.rentalPolicy.count({ where: { fleet: "bike" } })) === 0) {
    const rows = await prisma.rentalPolicy.findMany({ where: { fleet: "car" } });
    if (rows.length > 0) {
      await prisma.rentalPolicy.createMany({
        data: rows.map(({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...row }) => ({
          ...row,
          fleet: "bike",
        })),
      });
    }
  }

  if ((await prisma.rentalLocation.count({ where: { fleet: "bike" } })) === 0) {
    await ensureDalLakeLocation();
  }
}

export function ensureRentalDefaults() {
  ready ??= seedRentalDefaults().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
