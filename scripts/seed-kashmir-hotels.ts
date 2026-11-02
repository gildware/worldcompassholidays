/**
 * Delete all hotels and load the production Kashmir hotel set.
 *
 *   npx tsx scripts/seed-kashmir-hotels.ts
 *   npx tsx scripts/seed-kashmir-hotels.ts --allow-remote
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { kashmirHotels } from "../src/lib/demo/kashmir-hotels";

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

  console.log(`Seeding hotels on ${hostname || "unknown-host"}…`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function main() {
  assertDatabaseTarget();

  if (kashmirHotels.length === 0) {
    throw new Error("Kashmir hotel catalog is empty.");
  }

  const destinations = await prisma.destination.findMany({
    where: {
      slug: { in: [...new Set(kashmirHotels.map((hotel) => hotel.destinationSlug))] },
    },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((row) => [row.slug, row.id]));
  for (const hotel of kashmirHotels) {
    if (!destinationBySlug.has(hotel.destinationSlug)) {
      throw new Error(`Missing destination for hotel ${hotel.slug}: ${hotel.destinationSlug}`);
    }
  }

  const deletedRooms = await prisma.room.deleteMany({});
  const deletedHotels = await prisma.hotel.deleteMany({});
  console.log(`Deleted ${deletedHotels.count} hotels and ${deletedRooms.count} rooms.`);

  for (const hotel of kashmirHotels) {
    const cover =
      localAsset(`hotels/${hotel.slug}-cover.jpg`) ??
      localAsset(`hotels/${hotel.slug}.jpg`);
    const galleryItems = ["g1", "g2", "g3", "g4"]
      .map((suffix) => localAsset(`hotels/${hotel.slug}-${suffix}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({ url: item.url, key: item.key, driver: item.driver }));

    const priceFrom = Math.min(...hotel.rooms.map((room) => room.pricePerNight));
    const imageUrl = cover?.url ?? fallbackImage;
    const imageKey = cover?.key ?? fallbackKey;
    const imageDriver = cover?.driver ?? "local";

    const saved = await prisma.hotel.create({
      data: {
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
        faqsJson: "[]",
        cancellationPolicy: hotel.cancellationPolicy,
        houseRules: hotel.houseRules,
        isFeatured: hotel.isFeatured,
        seoIndex: true,
        seoTitle: `${hotel.name} | ${hotel.destinationSlug.replace(/-/g, " ")} hotels`,
        seoDescription: hotel.summary,
        published: true,
        destinationId: destinationBySlug.get(hotel.destinationSlug)!,
        imageUrl,
        imageKey,
        imageDriver,
        featuredImageUrl: imageUrl,
        featuredImageKey: imageKey,
        featuredImageDriver: imageDriver,
        galleryJson: JSON.stringify(galleryItems),
        rooms: {
          create: hotel.rooms.map((room, index) => ({
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
        },
      },
      select: { slug: true, name: true, destination: { select: { slug: true } } },
    });

    console.log(`  + ${saved.slug} (${saved.destination?.slug})`);
  }

  const counts = await prisma.hotel.groupBy({
    by: ["destinationId"],
    _count: { _all: true },
  });
  const total = await prisma.hotel.count();
  const rooms = await prisma.room.count();
  if (total !== kashmirHotels.length) {
    throw new Error(`Expected ${kashmirHotels.length} hotels; found ${total}.`);
  }

  console.log(`Verified ${total} hotels / ${rooms} rooms across ${counts.length} destinations.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Hotel seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
