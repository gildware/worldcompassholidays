/**
 * Seeds Kashmir / Himachal / Leh demo catalog with generated JPG assets.
 * Run: npx tsx scripts/seed-demo-catalog.ts
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  demoBikes,
  demoCars,
  demoDestinations,
  demoHotels,
  demoTours,
} from "../src/lib/demo/north-india-catalog";

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");

function asset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) {
    console.warn(`Missing asset: ${rel}`);
    return null;
  }
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

const parentOf: Record<string, string | undefined> = {
  katra: "jammu",
  gulmarg: "kashmir",
  pahalgam: "kashmir",
  sonamarg: "kashmir",
  shimla: "himachal",
  nubra: "ladakh",
};

async function seedDestinations() {
  for (const dest of demoDestinations) {
    const img = asset(`destinations/${dest.slug}.jpg`);
    const data = {
      name: dest.name,
      region: dest.region,
      country: dest.country,
      summary: dest.summary,
      mapLat: dest.mapLat,
      mapLng: dest.mapLng,
      mapZoom: dest.mapZoom,
      published: true,
      popular: ["kashmir", "gulmarg", "pahalgam", "ladakh", "himachal"].includes(dest.slug),
      imageUrl: img?.url ?? "",
      imageKey: img?.key ?? "",
      imageDriver: img?.driver ?? "local",
    };
    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: data,
      create: { slug: dest.slug, ...data },
    });
  }

  for (const [child, parentSlug] of Object.entries(parentOf)) {
    if (!parentSlug) continue;
    const parent = await prisma.destination.findUnique({ where: { slug: parentSlug } });
    if (!parent) continue;
    await prisma.destination.update({
      where: { slug: child },
      data: { parentId: parent.id },
    });
  }

  // Hide out-of-scope destinations from the demo.
  await prisma.destination.updateMany({
    where: {
      slug: { notIn: demoDestinations.map((d) => d.slug) },
    },
    data: { published: false },
  });
}

async function seedTours() {
  for (const tour of demoTours) {
    const destination = await prisma.destination.findUnique({
      where: { slug: tour.destinationSlug },
    });
    if (!destination) {
      console.warn(`Skip tour ${tour.slug}: missing destination ${tour.destinationSlug}`);
      continue;
    }

    const cover = asset(`tours/${tour.slug}-cover.jpg`);
    const galleryItems = [`g1`, `g2`, `g3`, `g4`]
      .map((suffix) => asset(`tours/${tour.slug}-${suffix}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({ url: item.url, key: item.key, driver: item.driver }));

    const data = {
      title: tour.title,
      summary: tour.summary,
      description: tour.description,
      category: tour.category,
      durationDays: tour.durationDays,
      durationUnit: "days",
      durationLabel: `${tour.durationDays} days`,
      difficulty: tour.difficulty,
      maxGroupSize: tour.maxGroupSize,
      minPeople: 1,
      priceFrom: tour.priceFrom,
      currency: "INR",
      published: true,
      isFeatured: Boolean(tour.isFeatured),
      destinationId: destination.id,
      imageUrl: cover?.url ?? "",
      imageKey: cover?.key ?? "",
      imageDriver: "local",
      featuredImageUrl: cover?.url ?? "",
      featuredImageKey: cover?.key ?? "",
      featuredImageDriver: "local",
      galleryJson: JSON.stringify(galleryItems),
      includesJson: JSON.stringify([
        "Accommodation as per itinerary",
        "Local guide support",
        "Airport / station transfers where listed",
      ]),
      excludesJson: JSON.stringify([
        "Flights",
        "Personal expenses",
        "Travel insurance",
      ]),
      seoTitle: tour.title,
      seoDescription: tour.summary,
    };

    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: data,
      create: { slug: tour.slug, ...data },
    });
  }

  await prisma.tour.updateMany({
    where: { slug: { notIn: demoTours.map((t) => t.slug) } },
    data: { published: false, isFeatured: false },
  });
}

async function seedHotels() {
  for (const hotel of demoHotels) {
    const destination = await prisma.destination.findUnique({
      where: { slug: hotel.destinationSlug },
    });
    if (!destination) continue;

    const cover = asset(`hotels/${hotel.slug}-cover.jpg`);
    const galleryItems = [`g1`, `g2`, `g3`, `g4`]
      .map((suffix) => asset(`hotels/${hotel.slug}-${suffix}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({ url: item.url, key: item.key, driver: item.driver }));
    const priceFrom = Math.min(...hotel.rooms.map((r) => r.pricePerNight));

    const data = {
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
      cancellationPolicy: hotel.cancellationPolicy,
      houseRules: hotel.houseRules,
      isFeatured: hotel.isFeatured,
      seoIndex: true,
      seoTitle: hotel.name,
      seoDescription: hotel.summary,
      published: true,
      destinationId: destination.id,
      imageUrl: cover?.url ?? "",
      imageKey: cover?.key ?? "",
      imageDriver: "local",
      featuredImageUrl: cover?.url ?? "",
      featuredImageKey: cover?.key ?? "",
      featuredImageDriver: "local",
      galleryJson: JSON.stringify(galleryItems),
    };

    const saved = await prisma.hotel.upsert({
      where: { slug: hotel.slug },
      update: data,
      create: { slug: hotel.slug, ...data },
      select: { id: true },
    });

    const roomCount = await prisma.room.count({ where: { hotelId: saved.id } });
    if (roomCount === 0) {
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

  await prisma.hotel.updateMany({
    where: { slug: { notIn: demoHotels.map((h) => h.slug) } },
    data: { published: false, isFeatured: false },
  });
}

async function syncVehicles() {
  const keep = new Set([...demoCars.map((c) => c.slug), ...demoBikes.map((b) => b.slug)]);

  await prisma.vehicle.updateMany({
    where: { slug: { notIn: [...keep] } },
    data: { published: false, status: "unavailable" },
  });

  const fleet = [
    ...demoCars.map((c) => ({ ...c, kind: "car" as const })),
    ...demoBikes.map((b) => ({
      ...b,
      kind: "bike" as const,
      seats: 2,
      doors: null as number | null,
      luggage: b.type === "Adventure" || b.type === "Cruiser" ? 1 : 0,
    })),
  ];

  for (const item of fleet) {
    const destination = await prisma.destination.findUnique({
      where: { slug: item.destination },
      select: { id: true },
    });
    if (!destination) continue;

    const photos = ["", "-2", "-3", "-4", "-5"]
      .map((suffix) => asset(`vehicles/photos/${item.slug}${suffix}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    const existing = await prisma.vehicle.findUnique({
      where: { slug: item.slug },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!existing) continue;

    await prisma.vehicle.update({
      where: { id: existing.id },
      data: {
        name: item.name,
        brand: item.brand,
        modelName: item.modelName,
        year: item.year,
        summary: item.summary,
        pricePerDay: item.pricePerDay,
        seats: item.seats,
        doors: item.doors ?? undefined,
        luggage: item.luggage,
        published: true,
        status: "available",
        destinationId: destination.id,
      },
    });

    if (photos.length === 0) continue;

    await prisma.vehicleImage.deleteMany({ where: { vehicleId: existing.id } });
    await prisma.vehicleImage.createMany({
      data: photos.map((photo, index) => ({
        vehicleId: existing.id,
        url: photo.url,
        key: photo.key,
        driver: "local",
        sortOrder: index,
      })),
    });
  }
}

export async function runDemoCatalogSeed() {
  console.log("Seeding destinations…");
  await seedDestinations();
  console.log("Seeding tours…");
  await seedTours();
  console.log("Seeding hotels…");
  await seedHotels();
  console.log("Syncing vehicle images…");
  await syncVehicles();
  console.log("Demo catalog ready.");
}

const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("seed-demo-catalog.ts") ||
    process.argv[1].endsWith("seed-demo-catalog.js"));

if (isDirectRun) {
  runDemoCatalogSeed()
    .then(async () => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
