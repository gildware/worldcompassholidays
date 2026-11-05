import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { demoDestinations } from "../src/lib/demo/north-india-catalog";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const popularSlugs = new Set([
  "kashmir",
  "gulmarg",
  "pahalgam",
  "sonamarg",
  "gurez",
  "doodhpathri",
]);
const parentOf: Record<string, string> = {
  gulmarg: "kashmir",
  pahalgam: "kashmir",
  sonamarg: "kashmir",
};

function assertLocalDatabaseTarget() {
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

  if (
    !["localhost", "127.0.0.1", "::1"].includes(hostname) &&
    !process.argv.includes("--allow-remote")
  ) {
    throw new Error(
      "DATABASE_URL points to a remote host. Re-run with --allow-remote only if this target is intended.",
    );
  }
}

async function main() {
  assertLocalDatabaseTarget();

  await prisma.$transaction(async (tx) => {
    for (const destination of demoDestinations) {
      const existing = await tx.destination.findUnique({
        where: { slug: destination.slug },
        select: { imageUrl: true, imageKey: true, imageDriver: true },
      });
      const fallbackImage = "/uploads/destinations/seed-kashmir.svg";
      const data = {
        name: destination.name,
        region: destination.region,
        country: destination.country,
        summary: destination.summary,
        mapLat: destination.mapLat,
        mapLng: destination.mapLng,
        mapZoom: destination.mapZoom,
        imageUrl: existing?.imageUrl || fallbackImage,
        imageKey: existing?.imageKey || "destinations/seed-kashmir.svg",
        imageDriver: existing?.imageDriver || "local",
        published: true,
        popular: popularSlugs.has(destination.slug),
      };

      await tx.destination.upsert({
        where: { slug: destination.slug },
        update: data,
        create: { slug: destination.slug, ...data },
      });
    }

    for (const [childSlug, parentSlug] of Object.entries(parentOf)) {
      const parent = await tx.destination.findUnique({
        where: { slug: parentSlug },
        select: { id: true },
      });
      if (!parent) continue;

      await tx.destination.update({
        where: { slug: childSlug },
        data: { parentId: parent.id },
      });
    }

    await tx.destination.updateMany({
      where: { slug: { notIn: demoDestinations.map((destination) => destination.slug) } },
      data: { published: false },
    });
  });

  const saved = await prisma.destination.findMany({
    where: { slug: { in: demoDestinations.map((destination) => destination.slug) } },
    select: { slug: true },
  });
  if (saved.length !== demoDestinations.length) {
    throw new Error(`Expected ${demoDestinations.length} destinations; found ${saved.length}.`);
  }
  console.log(
    `Verified ${saved.length} Kashmir destinations and unpublished out-of-scope destinations in the configured database.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Destination seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
