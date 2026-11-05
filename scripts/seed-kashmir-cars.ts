/**
 * Delete all cars and load the production Kashmir car fleet.
 *
 *   npx tsx scripts/seed-kashmir-cars.ts
 *   npx tsx scripts/seed-kashmir-cars.ts --allow-remote
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { demoCars } from "../src/lib/demo/north-india-catalog";

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

  console.log(`Seeding cars on ${hostname || "unknown-host"}…`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function deleteAllCars() {
  const cars = await prisma.vehicle.findMany({
    where: { kind: "car" },
    select: { id: true, slug: true },
  });
  if (!cars.length) {
    console.log("No existing cars to delete.");
    return;
  }

  const ids = cars.map((car) => car.id);

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
    `Deleted ${deleted.count} cars (and ${bookingIds.length} related rental bookings).`,
  );
}

async function ensureConfig(kind: string, name: string, appliesTo: string, sortOrder: number) {
  const existing = await prisma.rentalConfig.findFirst({
    where: { kind, name, ...(appliesTo === "all" ? {} : { appliesTo }) },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.rentalConfig.create({
    data: {
      kind,
      name,
      slug: `${kind}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      appliesTo,
      active: true,
      sortOrder,
    },
    select: { id: true },
  });
  return created.id;
}

async function main() {
  assertDatabaseTarget();

  if (demoCars.length === 0) {
    throw new Error("Car catalog is empty.");
  }

  const destinationSlugs = [
    ...new Set(demoCars.flatMap((car) => [car.destination, ...(car.availability ?? [])])),
  ];
  const destinations = await prisma.destination.findMany({
    where: { slug: { in: destinationSlugs } },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((row) => [row.slug, row.id]));

  for (const car of demoCars) {
    if (!destinationBySlug.has(car.destination)) {
      throw new Error(`Missing destination for car ${car.slug}: ${car.destination}`);
    }
  }

  const [types, fuels, gears] = await Promise.all([
    prisma.rentalConfig.findMany({
      where: { kind: "vehicle_type", appliesTo: "car", active: true },
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
  ]);

  for (const [name, order] of [
    ["Sedan", 20],
    ["MUV", 40],
    ["SUV", 30],
  ] as const) {
    if (!types.some((row) => row.name === name)) {
      types.push({
        id: await ensureConfig("vehicle_type", name, "car", order),
        name,
      });
    }
  }
  for (const [name, order] of [
    ["Petrol", 10],
    ["Diesel", 20],
  ] as const) {
    if (!fuels.some((row) => row.name === name)) {
      fuels.push({
        id: await ensureConfig("fuel", name, "all", order),
        name,
      });
    }
  }
  for (const [name, order] of [
    ["Manual", 10],
    ["Automatic", 20],
  ] as const) {
    if (!gears.some((row) => row.name === name)) {
      gears.push({
        id: await ensureConfig("transmission", name, "all", order),
        name,
      });
    }
  }

  const carLocations = await prisma.rentalLocation.findMany({
    where: { fleet: "car", active: true },
    select: { id: true },
    take: 3,
  });

  await deleteAllCars();

  for (const car of demoCars) {
    const cover =
      localAsset(`vehicles/photos/${car.slug}.jpg`) ??
      localAsset(`vehicles/seed-${car.slug}.svg`);
    const imageUrl = cover?.url ?? fallbackImage;
    const imageKey = cover?.key ?? fallbackKey;
    const imageDriver = cover?.driver ?? "local";

    const vehicleTypeId = types.find((row) => row.name === car.type)?.id;
    const fuelTypeId = fuels.find((row) => row.name === car.fuel)?.id;
    const transmissionId = gears.find((row) => row.name === car.transmission)?.id;
    const primaryDestinationId = destinationBySlug.get(car.destination)!;
    const availabilityIds = (car.availability ?? [])
      .map((slug) => destinationBySlug.get(slug))
      .filter((id): id is string => Boolean(id));

    const created = await prisma.vehicle.create({
      data: {
        slug: car.slug,
        kind: "car",
        name: car.name,
        registrationNumber: car.registrationNumber ?? `DEMO-CAR-${car.slug.toUpperCase()}`,
        brand: car.brand,
        modelName: car.modelName,
        year: car.year,
        summary: car.summary,
        description: car.description ?? car.summary,
        seats: car.seats,
        doors: car.doors,
        luggage: car.luggage,
        includedKmPerDay: car.seats >= 10 ? 200 : 150,
        pricePerDay: car.pricePerDay,
        pricePerWeek: car.pricePerDay * 6,
        pricePerMonth: car.pricePerDay * 22,
        securityDeposit: car.pricePerDay >= 5000 ? 10000 : 5000,
        extraKmCharge: car.seats >= 10 ? 20 : 12,
        lateReturnCharge: Math.round(car.pricePerDay * 0.25),
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
        ...(availabilityIds.length
          ? {
              availability: {
                create: availabilityIds.map((destinationId) => ({ destinationId })),
              },
            }
          : {}),
        ...(carLocations.length
          ? {
              locationLinks: {
                create: carLocations.map((location) => ({ locationId: location.id })),
              },
            }
          : {}),
      },
      select: { slug: true, name: true, pricePerDay: true, seats: true },
    });

    console.log(
      `  + ${created.name} — ${created.seats} seats — ₹${created.pricePerDay}/day`,
    );
  }

  const total = await prisma.vehicle.count({ where: { kind: "car", published: true } });
  if (total !== demoCars.length) {
    throw new Error(`Expected ${demoCars.length} published cars; found ${total}.`);
  }
  console.log(`Verified ${total} Kashmir cars.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Car seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
