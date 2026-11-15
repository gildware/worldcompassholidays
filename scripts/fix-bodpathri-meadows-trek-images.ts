/**
 * Finish bodpathri-meadows-trek (batch-5 stopped at d3; DB never wired).
 *
 *   npx tsx scripts/fix-bodpathri-meadows-trek-images.ts
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  cover,
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
  type ImageTarget,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

const SLUG = "bodpathri-meadows-trek";

const FULL_JOB: TourImageJob = {
  slug: SLUG,
  targets: [
    cover("bodpathri-meadows-trek-cover.jpg", "Doodhpathri meadow valley Kashmir trek", [
      "File:Meadows and Forests Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:Virgin valley Doud pather.jpg",
      "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
      "File:Trancendent.jpg",
    ], ["destinations/doodhpathri.jpg", "destinations/kashmir.jpg"]),
    gallery("bodpathri-meadows-trek-g1.jpg", "Doodhpathri lush meadows Kashmir", [
      "File:Doodhpathri - A dirt road goes through the many meadows southwest Jammu Kashmir India.jpg",
      "File:Doodh Patthri, Kashmir.jpg",
      "File:A Rural Road towards Doodhpathri from Magam Jammu Kashmir India May 2014.jpg",
    ], ["destinations/doodhpathri.jpg"]),
    gallery("bodpathri-meadows-trek-g2.jpg", "Bodpathri bowl alpine meadow trek", [
      "File:Meadows and Forests Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
    ], ["destinations/doodhpathri.jpg"]),
    gallery("bodpathri-meadows-trek-g3.jpg", "Doodhpathri forest valley Kashmir", [
      "File:Virgin valley Doud pather.jpg",
      "File:Trancendent.jpg",
    ], ["destinations/doodhpathri.jpg", "destinations/kashmir.jpg"]),
    gallery("bodpathri-meadows-trek-g4.jpg", "Srinagar gateway meadow trek", [
      "File:A view of Shalimar Bagh, Srinagar, in 2013.jpg",
      "File:Yellow tree stands out at Shalimar Bagh, Srinagar.jpg",
      "File:Trees in Shalimar Bagh (Srinagar).jpg",
    ], ["destinations/srinagar.jpg"]),
    day("bodpathri-meadows-trek-d1.jpg", 1, "Srinagar drive Doodhpathri trailhead", [
      "File:Dal Lake Hazratbal Srinagar.jpg",
      "File:Mughal era architecture inside of the Shalimar Bagh, Srinagar.jpg",
      "File:A view of Shalimar Bagh in Srinagar.jpg",
    ], ["destinations/srinagar.jpg", "destinations/doodhpathri.jpg"]),
    day("bodpathri-meadows-trek-d2.jpg", 2, "Trek into Bodpathri meadow bowl", [
      "File:Doodhpathri - A dirt road goes through the many meadows southwest Jammu Kashmir India.jpg",
      "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
    ], ["destinations/doodhpathri.jpg"]),
    day("bodpathri-meadows-trek-d3.jpg", 3, "Meadow loop return Doodhpathri", [
      "File:A view of sheep and horses in Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:River stream near Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:Doude pather meadows upper.jpg",
      "File:Doodhpathri southwest Jammu Kashmir India (7).jpg",
      "File:Doude pather upper view.jpg",
    ], ["destinations/doodhpathri.jpg"]),
    day("bodpathri-meadows-trek-d4.jpg", 4, "Depart Srinagar Kashmir", [
      "File:Dal Lake, Srinagar at Dusk.jpg",
      "File:Dal Lake, Srinagar 2.jpg",
      "File:Srinagar International Airport.jpg",
    ], ["destinations/srinagar.jpg", "destinations/kashmir.jpg"]),
  ],
};

function keepStub(file: string, dayNumber?: number): ImageTarget {
  const isCover = file.endsWith("-cover.jpg");
  const isDay = /-d\d+\.jpg$/.test(file);
  return {
    file,
    dayNumber,
    place: "keep",
    titles: [],
    w: isCover ? 1920 : isDay ? 1400 : 1600,
    h: isCover ? 1080 : isDay ? 933 : 1067,
    skipSearch: true,
  };
}

function missingTargets(want: ImageTarget[], tourDir: string): ImageTarget[] {
  return want.filter((t) => !existsSync(path.join(tourDir, t.file)));
}

async function prismaStatus() {
  const prisma = new PrismaClient();
  try {
    const t = await prisma.tour.findUnique({
      where: { slug: SLUG },
      select: {
        imageKey: true,
        galleryJson: true,
        days: { select: { dayNumber: true, imageKey: true }, orderBy: { dayNumber: "asc" } },
      },
    });
    const gallery = t?.galleryJson ? (JSON.parse(t.galleryJson) as unknown[]).length : 0;
    const dayKeys = (t?.days ?? []).filter((d) => d.imageKey).length;
    const ok =
      Boolean(t?.imageKey) && gallery >= 4 && dayKeys === (t?.days.length ?? 0) && dayKeys >= 4;
    console.log(
      `  DB: cover=${t?.imageKey ? "yes" : "NO"} gallery=${gallery} days=${dayKeys}/${t?.days.length ?? 0} => ${ok ? "OK" : "FAIL"}`,
    );
    return ok;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const pending = missingTargets(FULL_JOB.targets, tourDir);

  const shared = createBatchBlocklist(SLUG);
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  if (pending.length) {
    const existing: ImageTarget[] = [];
    for (const t of FULL_JOB.targets) {
      if (pending.some((p) => p.file === t.file)) continue;
      if (existsSync(path.join(tourDir, t.file))) {
        existing.push(keepStub(t.file, t.dayNumber));
      }
    }
    console.log(`Fetching missing: ${pending.map((t) => t.file).join(", ")}`);
    await fetchAndWireTourImages(
      { slug: SLUG, targets: [...existing, ...pending] },
      { sharedBlock: shared },
    );
  }

  const stubs = FULL_JOB.targets.map((t) => keepStub(t.file, t.dayNumber));
  console.log("\nDB wire…");
  await fetchAndWireTourImages({ slug: SLUG, targets: stubs }, { dbOnly: true, sharedBlock: shared });

  const mediaOk =
    ["cover", "g1", "g2", "g3", "g4", "d1", "d2", "d3", "d4"].every((p) =>
      existsSync(path.join(tourDir, `${SLUG}-${p}.jpg`)),
    );
  const dbOk = await prismaStatus();
  process.exitCode = mediaOk && dbOk ? 0 : 1;
  console.log(`\n${SLUG}: ${mediaOk && dbOk ? "OK" : "FAIL"}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
