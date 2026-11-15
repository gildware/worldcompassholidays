import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { phase1Destinations } from "../src/lib/demo/india-phase1-destinations";
import { phase2Destinations } from "../src/lib/demo/india-phase2-destinations";
import { phase3Destinations } from "../src/lib/demo/india-phase3-destinations";
import { demoDestinations } from "../src/lib/demo/north-india-catalog";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const extraDestinations = [...phase1Destinations, ...phase2Destinations, ...phase3Destinations];
const demoSlugs = new Set(demoDestinations.map((row) => row.slug as string));
const allDestinations = [
  ...demoDestinations,
  ...extraDestinations.filter((destination) => !demoSlugs.has(destination.slug)),
];

const popularSlugs = new Set([
  "gulmarg",
  "pahalgam",
  "sonamarg",
  "gurez",
  "doodhpathri",
  "srinagar",
  "kedarnath",
  "haridwar",
  "manali",
  "chopta",
  "leh",
  "kasol",
  "katra",
  "spiti",
  "varanasi",
  "tirupati",
  "alleppey",
  "shillong",
  "jim-corbett",
]);
const parentOf: Record<string, string> = {
  gulmarg: "kashmir",
  pahalgam: "kashmir",
  sonamarg: "kashmir",
  haridwar: "uttarakhand",
  rishikesh: "uttarakhand",
  dehradun: "uttarakhand",
  guptkashi: "uttarakhand",
  kedarnath: "uttarakhand",
  badrinath: "uttarakhand",
  yamunotri: "uttarakhand",
  gangotri: "uttarakhand",
  chopta: "uttarakhand",
  sankri: "uttarakhand",
  joshimath: "uttarakhand",
  "jim-corbett": "uttarakhand",
  manali: "himachal",
  kasol: "himachal",
  mcleodganj: "himachal",
  kaza: "spiti",
  spiti: "himachal",
  katra: "jammu",
  leh: "ladakh",
  nubra: "ladakh",
  pangong: "ladakh",
  kargil: "ladakh",
  alleppey: "kerala",
  cochin: "kerala",
  munnar: "kerala",
  shillong: "meghalaya",
  cherrapunji: "meghalaya",
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

  await prisma.$transaction(
    async (tx) => {
    for (const destination of allDestinations) {
      const existing = await tx.destination.findUnique({
        where: { slug: destination.slug },
        select: { imageUrl: true, imageKey: true, imageDriver: true },
      });
      const localJpg = `destinations/${destination.slug}.jpg`;
      const hasLocalJpg = existsSync(path.join(process.cwd(), "public", "uploads", localJpg));
      const fallbackImage = hasLocalJpg
        ? `/uploads/${localJpg}`
        : "/uploads/destinations/seed-kashmir.svg";
      const fallbackKey = hasLocalJpg ? localJpg : "destinations/seed-kashmir.svg";
      const hideParents = new Set([
        "kashmir",
        "uttarakhand",
        "himachal",
        "ladakh",
        "jammu",
        "spiti",
        "kerala",
        "meghalaya",
      ]);
      const data = {
        name: destination.name,
        region: destination.region,
        country: destination.country,
        summary: destination.summary,
        mapLat: destination.mapLat,
        mapLng: destination.mapLng,
        mapZoom: destination.mapZoom,
        imageUrl: existing?.imageUrl && !existing.imageUrl.includes("seed-kashmir")
          ? existing.imageUrl
          : fallbackImage,
        imageKey: existing?.imageKey && !existing.imageKey.includes("seed-kashmir")
          ? existing.imageKey
          : fallbackKey,
        imageDriver: existing?.imageDriver || "local",
        // Keep region parent cards hidden; city destinations stay published.
        published: !hideParents.has(destination.slug),
        popular: !hideParents.has(destination.slug) && popularSlugs.has(destination.slug),
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
      where: { slug: { notIn: allDestinations.map((destination) => destination.slug) } },
      data: { published: false },
    });
    },
    { timeout: 120_000, maxWait: 20_000 },
  );

  const saved = await prisma.destination.findMany({
    where: { slug: { in: allDestinations.map((destination) => destination.slug) } },
    select: { slug: true },
  });
  if (saved.length !== allDestinations.length) {
    throw new Error(`Expected ${allDestinations.length} destinations; found ${saved.length}.`);
  }
  console.log(
    `Verified ${saved.length} destinations (Kashmir + Phase-1) and unpublished out-of-scope destinations.`,
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
