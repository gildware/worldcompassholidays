/**
 * Delete all bikes and load the production Kashmir bike fleet.
 *
 *   npx tsx scripts/seed-kashmir-bikes.ts
 *   npx tsx scripts/seed-kashmir-bikes.ts --allow-remote
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { demoBikes } from "../src/lib/demo/north-india-catalog";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");
const fallbackImage = "/uploads/destinations/seed-kashmir.svg";
const fallbackKey = "destinations/seed-kashmir.svg";

function assertDatabaseTarget() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured; refusing to seed.");
  }

  let hostname: string;
  try {
    hostname = new URL(connectionString).hostname;
  } catch {
    throw new Error("DATABASE_URL is not a valid URL; refusing to seed.");
  }

  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  if (!isLocal && !process.argv.includes("--allow-remote")) {
    throw new Error(
      `DATABASE_URL points to remote host "${hostname}". Re-run with --allow-remote only if this target is intended.`,
    );
  }

  console.log(`Seeding bikes on ${hostname || "unknown-host"}…`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function configId(kind: string, name: string, appliesTo = "bike") {
  const row = await prisma.rentalConfig.findFirst({
    where: { kind, name, appliesTo, active: true },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function deleteAllBikes() {
  const bikes = await prisma.vehicle.findMany({
    where: { kind: "bike" },
    select: { id: true, slug: true },
  });
  if (!bikes.length) {
    console.log("No existing bikes to delete.");
    return;
  }

  const ids = bikes.map((bike) => bike.id);

  // RentalBooking.vehicle has onDelete: Restrict — clear bike bookings first.
  const bookings = await prisma.rentalBooking.findMany({
    where: { vehicleId: { in: ids } },
    select: { id: true },
  });
  const bookingIds = bookings.map((booking) => booking.id);
  if (bookingIds.length) {
    await prisma.rentalBookingEvent.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.rentalPayment.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.rentalBookingAddon.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.rentalBookingDocument.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.rentalBooking.deleteMany({ where: { id: { in: bookingIds } } });
  }

  await prisma.vehicleRelated.deleteMany({
    where: { OR: [{ vehicleId: { in: ids } }, { relatedId: { in: ids } }] },
  });
  await prisma.vehicleFeature.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.vehicleAddon.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.vehicleDestination.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.vehicleLocation.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.vehicleDocument.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.vehicleImage.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.vehicleBlock.deleteMany({ where: { vehicleId: { in: ids } } });
  await prisma.maintenanceRecord.deleteMany({ where: { vehicleId: { in: ids } } });

  const deleted = await prisma.vehicle.deleteMany({ where: { id: { in: ids } } });
  console.log(
    `Deleted ${deleted.count} bikes (and ${bookingIds.length} related rental bookings).`,
  );
}

async function main() {
  assertDatabaseTarget();

  if (demoBikes.length === 0) {
    throw new Error("Bike catalog is empty.");
  }

  const destinationSlugs = [
    ...new Set(demoBikes.flatMap((bike) => [bike.destination, ...bike.availability])),
  ];
  const destinations = await prisma.destination.findMany({
    where: { slug: { in: destinationSlugs } },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((row) => [row.slug, row.id]));

  for (const bike of demoBikes) {
    if (!destinationBySlug.has(bike.destination)) {
      throw new Error(`Missing destination for bike ${bike.slug}: ${bike.destination}`);
    }
  }

  const [types, fuels, gears, helmet] = await Promise.all([
    prisma.rentalConfig.findMany({
      where: { kind: "vehicle_type", appliesTo: "bike", active: true },
      select: { id: true, name: true },
    }),
    prisma.rentalConfig.findMany({
      where: { kind: "fuel", active: true },
      select: { id: true, name: true },
    }),
    prisma.rentalConfig.findMany({
      where: { kind: "transmission", active: true },
      select: { id: true, name: true },
    }),
    configId("included", "Helmet included"),
  ]);

  // Ensure common bike config rows exist if defaults were never seeded.
  async function ensureConfig(kind: string, name: string, sortOrder: number) {
    const existing = await prisma.rentalConfig.findFirst({
      where: { kind, name, appliesTo: "bike" },
      select: { id: true },
    });
    if (existing) return existing.id;
    const created = await prisma.rentalConfig.create({
      data: {
        kind,
        name,
        slug: `${kind}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        appliesTo: "bike",
        active: true,
        sortOrder,
      },
      select: { id: true },
    });
    return created.id;
  }

  for (const [name, order] of [
    ["Scooter", 70],
    ["Cruiser", 90],
    ["Adventure", 100],
    ["Motorcycle", 80],
  ] as const) {
    if (!types.some((row) => row.name === name)) {
      const id = await ensureConfig("vehicle_type", name, order);
      types.push({ id, name });
    }
  }
  if (!fuels.some((row) => row.name === "Petrol")) {
    const existing = await prisma.rentalConfig.findFirst({
      where: { kind: "fuel", name: "Petrol" },
      select: { id: true },
    });
    fuels.push({
      id:
        existing?.id ??
        (
          await prisma.rentalConfig.create({
            data: {
              kind: "fuel",
              name: "Petrol",
              slug: "fuel-petrol",
              appliesTo: "all",
              active: true,
              sortOrder: 10,
            },
            select: { id: true },
          })
        ).id,
      name: "Petrol",
    });
  }
  for (const [name, order] of [
    ["Automatic", 10],
    ["Manual", 20],
  ] as const) {
    if (!gears.some((row) => row.name === name)) {
      gears.push({ id: await ensureConfig("transmission", name, order), name });
    }
  }

  const bikeLocations = await prisma.rentalLocation.findMany({
    where: { fleet: "bike", active: true },
    select: { id: true },
    take: 3,
  });

  await deleteAllBikes();

  for (const bike of demoBikes) {
    const cover =
      localAsset(`vehicles/photos/${bike.slug}.jpg`) ??
      localAsset(`vehicles/seed-${bike.slug}.svg`);
    const imageUrl = cover?.url ?? fallbackImage;
    const imageKey = cover?.key ?? fallbackKey;
    const imageDriver = cover?.driver ?? "local";

    const vehicleTypeId = types.find((row) => row.name === bike.type)?.id;
    const fuelTypeId = fuels.find((row) => row.name === bike.fuel)?.id;
    const transmissionId = gears.find((row) => row.name === bike.transmission)?.id;
    const primaryDestinationId = destinationBySlug.get(bike.destination)!;
    const availabilityIds = bike.availability
      .map((slug) => destinationBySlug.get(slug))
      .filter((id): id is string => Boolean(id));

    const created = await prisma.vehicle.create({
      data: {
        slug: bike.slug,
        kind: "bike",
        name: bike.name,
        registrationNumber: bike.registrationNumber,
        brand: bike.brand,
        modelName: bike.modelName,
        year: bike.year,
        summary: bike.summary,
        description: bike.description,
        seats: 2,
        doors: null,
        luggage: bike.type === "Adventure" || bike.type === "Cruiser" ? 1 : 0,
        includedKmPerDay: bike.type === "Scooter" ? 80 : bike.type === "Adventure" ? 160 : 120,
        pricePerDay: bike.pricePerDay,
        pricePerWeek: bike.pricePerDay * 6,
        pricePerMonth: bike.pricePerDay * 22,
        securityDeposit: bike.pricePerDay >= 2000 ? 5000 : 2000,
        extraKmCharge: 8,
        lateReturnCharge: Math.round(bike.pricePerDay * 0.25),
        currency: "INR",
        status: "available",
        published: true,
        allowCounterPickup: true,
        allowHomeDelivery: false,
        destinationId: primaryDestinationId,
        vehicleTypeId: vehicleTypeId ?? undefined,
        fuelTypeId: fuelTypeId ?? undefined,
        transmissionId: transmissionId ?? undefined,
        images: {
          create: [{ url: imageUrl, key: imageKey, driver: imageDriver, sortOrder: 0 }],
        },
        ...(helmet
          ? { features: { create: [{ configId: helmet }] } }
          : {}),
        ...(availabilityIds.length
          ? {
              availability: {
                create: availabilityIds.map((destinationId) => ({ destinationId })),
              },
            }
          : {}),
        ...(bikeLocations.length
          ? {
              locationLinks: {
                create: bikeLocations.map((location) => ({ locationId: location.id })),
              },
            }
          : {}),
      },
      select: { slug: true, name: true, pricePerDay: true },
    });

    console.log(`  + ${created.name} — ₹${created.pricePerDay}/day`);
  }

  const total = await prisma.vehicle.count({ where: { kind: "bike", published: true } });
  if (total !== demoBikes.length) {
    throw new Error(`Expected ${demoBikes.length} published bikes; found ${total}.`);
  }
  console.log(`Verified ${total} Kashmir bikes.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Bike seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
