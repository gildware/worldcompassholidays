import { mkdir, writeFile } from "fs/promises";
import path from "path";
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
  { kind: "fuel", name: "Petrol", sortOrder: 10 },
  { kind: "fuel", name: "Diesel", sortOrder: 20 },
  { kind: "fuel", name: "CNG", sortOrder: 30 },
  { kind: "fuel", name: "Electric", sortOrder: 40 },
  { kind: "transmission", name: "Manual", sortOrder: 10 },
  { kind: "transmission", name: "Automatic", sortOrder: 20 },
  { kind: "feature", name: "AC", sortOrder: 10 },
  { kind: "feature", name: "Bluetooth", sortOrder: 20 },
  { kind: "feature", name: "GPS", sortOrder: 30 },
  { kind: "feature", name: "USB", sortOrder: 40 },
  { kind: "feature", name: "Rear Camera", sortOrder: 50 },
  { kind: "feature", name: "Parking Sensors", sortOrder: 60 },
  { kind: "feature", name: "Sunroof", sortOrder: 70 },
  { kind: "feature", name: "Android Auto", sortOrder: 80 },
  { kind: "feature", name: "Apple CarPlay", sortOrder: 90 },
  { kind: "feature", name: "Helmet included", appliesTo: "bike", sortOrder: 100 },
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
}

export function ensureRentalDefaults() {
  ready ??= seedRentalDefaults().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
