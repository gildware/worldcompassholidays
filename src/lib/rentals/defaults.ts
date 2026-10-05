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
      select: { id: true, slug: true, name: true },
    });
    if (destinations.length > 0) {
      await prisma.rentalLocation.createMany({
        data: destinations.map((destination) => ({
          name: `${destination.name} desk`,
          slug: `${destination.slug}-desk`,
          address: `${destination.name} city pickup desk`,
          destinationId: destination.id,
          active: true,
        })),
      });
    }
  }
}

export function ensureRentalDefaults() {
  ready ??= seedRentalDefaults().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
