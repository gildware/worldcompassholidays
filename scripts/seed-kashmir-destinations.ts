/**
 * Replace destination catalog with the production Kashmir set.
 *
 * Local/default guard: refuses remote DATABASE_URL unless --allow-remote is passed.
 *
 *   npx tsx scripts/seed-kashmir-destinations.ts
 *   npx tsx scripts/seed-kashmir-destinations.ts --allow-remote
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { demoDestinations } from "../src/lib/demo/north-india-catalog";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const KEEP_SLUGS = demoDestinations.map((destination) => destination.slug);
const KEEP_SET = new Set(KEEP_SLUGS);

/** Historical slug aliases to migrate onto the new production set. */
const SLUG_MIGRATIONS: Record<string, string> = {
  // Old catalog used slug `kashmir` for Srinagar city inventory.
  // After split, city products move to `srinagar`; `kashmir` stays the region hub.
  bandipora: "wular-lake",
};

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

  console.log(`Seeding destinations on ${hostname || "unknown-host"}…`);
}

async function migrateCompositeLinks(
  model: "tourDestination" | "vehicleDestination",
  fromId: string,
  toId: string,
  ownerField: "tourId" | "vehicleId",
) {
  const rows =
    model === "tourDestination"
      ? await prisma.tourDestination.findMany({
          where: { destinationId: fromId },
          select: { tourId: true },
        })
      : await prisma.vehicleDestination.findMany({
          where: { destinationId: fromId },
          select: { vehicleId: true },
        });

  let moved = 0;
  let dropped = 0;

  for (const row of rows) {
    const ownerId = ownerField === "tourId" ? (row as { tourId: string }).tourId : (row as { vehicleId: string }).vehicleId;
    const existing =
      model === "tourDestination"
        ? await prisma.tourDestination.findUnique({
            where: { tourId_destinationId: { tourId: ownerId, destinationId: toId } },
            select: { tourId: true },
          })
        : await prisma.vehicleDestination.findUnique({
            where: { vehicleId_destinationId: { vehicleId: ownerId, destinationId: toId } },
            select: { vehicleId: true },
          });

    if (existing) {
      if (model === "tourDestination") {
        await prisma.tourDestination.delete({
          where: { tourId_destinationId: { tourId: ownerId, destinationId: fromId } },
        });
      } else {
        await prisma.vehicleDestination.delete({
          where: { vehicleId_destinationId: { vehicleId: ownerId, destinationId: fromId } },
        });
      }
      dropped += 1;
      continue;
    }

    if (model === "tourDestination") {
      await prisma.tourDestination.update({
        where: { tourId_destinationId: { tourId: ownerId, destinationId: fromId } },
        data: { destinationId: toId },
      });
    } else {
      await prisma.vehicleDestination.update({
        where: { vehicleId_destinationId: { vehicleId: ownerId, destinationId: fromId } },
        data: { destinationId: toId },
      });
    }
    moved += 1;
  }

  return { moved, dropped };
}

async function remappointDestination(
  fromId: string,
  toId: string,
  label: string,
) {
  if (fromId === toId) return;

  const [tours, hotels, vehicles, pages, rentalLocations, busRoutes] = await Promise.all([
    prisma.tour.updateMany({ where: { destinationId: fromId }, data: { destinationId: toId } }),
    prisma.hotel.updateMany({ where: { destinationId: fromId }, data: { destinationId: toId } }),
    prisma.vehicle.updateMany({ where: { destinationId: fromId }, data: { destinationId: toId } }),
    prisma.page.updateMany({ where: { destinationId: fromId }, data: { destinationId: toId } }),
    prisma.rentalLocation.updateMany({
      where: { destinationId: fromId },
      data: { destinationId: toId },
    }),
    prisma.busRoute.updateMany({ where: { destinationId: fromId }, data: { destinationId: toId } }),
  ]);

  const tourLinks = await migrateCompositeLinks("tourDestination", fromId, toId, "tourId");
  const vehicleLinks = await migrateCompositeLinks(
    "vehicleDestination",
    fromId,
    toId,
    "vehicleId",
  );

  console.log(
    `Migrated links ${label}: tours=${tours.count} hotels=${hotels.count} vehicles=${vehicles.count} pages=${pages.count} rentals=${rentalLocations.count} buses=${busRoutes.count} tourLinks=${tourLinks.moved}/${tourLinks.dropped} vehicleLinks=${vehicleLinks.moved}/${vehicleLinks.dropped}`,
  );
}

async function deleteDestinationTree(ids: string[], fallbackDestinationId: string) {
  if (!ids.length) return;

  await prisma.vehicleDestination.deleteMany({ where: { destinationId: { in: ids } } });
  await prisma.tourDestination.deleteMany({ where: { destinationId: { in: ids } } });

  // Reassign leftovers to Srinagar so required FKs (vehicles) stay valid.
  await prisma.tour.updateMany({
    where: { destinationId: { in: ids } },
    data: { destinationId: fallbackDestinationId },
  });
  await prisma.hotel.updateMany({
    where: { destinationId: { in: ids } },
    data: { destinationId: fallbackDestinationId },
  });
  await prisma.vehicle.updateMany({
    where: { destinationId: { in: ids } },
    data: { destinationId: fallbackDestinationId },
  });
  await prisma.page.updateMany({
    where: { destinationId: { in: ids } },
    data: { destinationId: null },
  });
  await prisma.rentalLocation.updateMany({
    where: { destinationId: { in: ids } },
    data: { destinationId: null },
  });
  await prisma.busRoute.updateMany({
    where: { destinationId: { in: ids } },
    data: { destinationId: null },
  });

  // Clear parent pointers first (self-relation is Restrict).
  await prisma.destination.updateMany({
    where: { parentId: { in: ids } },
    data: { parentId: null },
  });
  await prisma.destination.updateMany({
    where: { id: { in: ids } },
    data: { parentId: null },
  });

  const deleted = await prisma.destination.deleteMany({ where: { id: { in: ids } } });
  console.log(`Deleted ${deleted.count} out-of-scope destinations.`);
}

async function main() {
  assertDatabaseTarget();

  const fallbackImage = "/uploads/destinations/seed-kashmir.svg";
  const fallbackKey = "destinations/seed-kashmir.svg";

  // 1) Upsert the production set.
  for (const destination of demoDestinations) {
    const existing = await prisma.destination.findUnique({
      where: { slug: destination.slug },
      select: { imageUrl: true, imageKey: true, imageDriver: true },
    });

    const data = {
      name: destination.name,
      region: destination.region,
      country: destination.country,
      summary: destination.summary,
      mapLat: destination.mapLat,
      mapLng: destination.mapLng,
      mapZoom: destination.mapZoom,
      published: true,
      popular: Boolean(destination.popular),
      imageUrl: existing?.imageUrl || fallbackImage,
      imageKey: existing?.imageKey || fallbackKey,
      imageDriver: existing?.imageDriver || "local",
      parentId: null as string | null,
    };

    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: data,
      create: { slug: destination.slug, ...data },
    });
  }

  // 2) Wire parent hierarchy (parents first already ensured by upsert of full set).
  for (const destination of demoDestinations) {
    if (!destination.parentSlug) continue;
    const parent = await prisma.destination.findUnique({
      where: { slug: destination.parentSlug },
      select: { id: true },
    });
    if (!parent) {
      throw new Error(`Missing parent ${destination.parentSlug} for ${destination.slug}`);
    }
    await prisma.destination.update({
      where: { slug: destination.slug },
      data: { parentId: parent.id },
    });
  }

  // 3) Split legacy `kashmir` city inventory onto `srinagar`.
  const kashmir = await prisma.destination.findUnique({
    where: { slug: "kashmir" },
    select: { id: true },
  });
  const srinagar = await prisma.destination.findUnique({
    where: { slug: "srinagar" },
    select: { id: true },
  });
  if (kashmir && srinagar) {
    await remappointDestination(kashmir.id, srinagar.id, "kashmir → srinagar");
  }

  // 4) Migrate renamed aliases, then delete everything outside the keep set.
  const obsolete = await prisma.destination.findMany({
    where: { slug: { notIn: KEEP_SLUGS } },
    select: { id: true, slug: true },
  });

  for (const row of obsolete) {
    const targetSlug = SLUG_MIGRATIONS[row.slug];
    if (!targetSlug || !KEEP_SET.has(targetSlug)) continue;
    const target = await prisma.destination.findUnique({
      where: { slug: targetSlug },
      select: { id: true },
    });
    if (!target) continue;
    await remappointDestination(row.id, target.id, `${row.slug} → ${targetSlug}`);
  }

  if (!srinagar) {
    throw new Error("Srinagar destination missing after upsert; cannot finish cleanup.");
  }

  await deleteDestinationTree(
    obsolete.map((row) => row.id),
    srinagar.id,
  );

  // Ensure nothing outside the production set remains.
  const leftovers = await prisma.destination.findMany({
    where: { slug: { notIn: KEEP_SLUGS } },
    select: { slug: true },
  });
  if (leftovers.length) {
    throw new Error(
      `Cleanup incomplete; still present: ${leftovers.map((row) => row.slug).join(", ")}`,
    );
  }

  await prisma.destination.updateMany({
    where: { slug: { in: KEEP_SLUGS } },
    data: { published: true },
  });

  const saved = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      popular: true,
      published: true,
      parent: { select: { slug: true } },
    },
  });

  if (saved.length !== demoDestinations.length) {
    throw new Error(
      `Expected ${demoDestinations.length} destinations; found ${saved.length}.`,
    );
  }

  console.log(`Verified ${saved.length} Kashmir destinations:`);
  for (const row of saved) {
    const parent = row.parent?.slug ? ` ← ${row.parent.slug}` : "";
    const popular = row.popular ? " ★" : "";
    console.log(`  - ${row.slug} (${row.name})${parent}${popular}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Destination seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
