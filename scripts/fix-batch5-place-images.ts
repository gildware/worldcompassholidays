/**
 * Finish failed batch-5 slots (probed Commons + destination fallbacks).
 *
 *   npx tsx scripts/fix-batch5-place-images.ts
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  type ImageTarget,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

const SLUGS = ["bodpathri-meadows-trek"] as const;

const FULL_JOBS: TourImageJob[] = [
  {
    slug: "bodpathri-meadows-trek",
    targets: [
      day(
        "bodpathri-meadows-trek-d3.jpg",
        3,
        "Meadow loop Doodhpathri Kashmir return trail",
        [
          "File:A Rural Road towards Doodhpathri from Magam Jammu Kashmir India May 2014.jpg",
          "File:Doodh Patthri, Kashmir.jpg",
        ],
        ["destinations/doodhpathri-3.jpg", "destinations/doodhpathri-4.jpg", "destinations/doodhpathri-5.jpg"],
      ),
    ],
  },
];

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

function missingTargets(slug: string, want: ImageTarget[], tourDir: string): ImageTarget[] {
  return want.filter((t) => !existsSync(path.join(tourDir, t.file)));
}

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const shared = createBatchBlocklist("__fix_batch5__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  for (const slug of SLUGS) {
    const job = FULL_JOBS.find((j) => j.slug === slug)!;
    const pending = missingTargets(slug, job.targets, tourDir);
    if (!pending.length) {
      console.log(`${slug}: no missing files`);
      continue;
    }
    const existing: ImageTarget[] = [];
    for (const name of readdirSync(tourDir)) {
      if (!name.startsWith(`${slug}-`) || !name.endsWith(".jpg")) continue;
      if (pending.some((t) => t.file === name)) continue;
      const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
      existing.push(keepStub(name, dayNumber));
    }
    console.log(`Fixing ${slug}: ${pending.map((t) => t.file).join(", ")}`);
    await fetchAndWireTourImages({ slug, targets: [...existing, ...pending] }, { sharedBlock: shared });
  }

  console.log("\nDB wire (keep stubs)…");
  const sharedDb = createBatchBlocklist("__fix_batch5_db__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(sharedDb, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }
  for (const slug of SLUGS) {
    const stubs: ImageTarget[] = [];
    for (const name of readdirSync(tourDir)) {
      if (!name.startsWith(`${slug}-`) || !name.endsWith(".jpg")) continue;
      const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
      stubs.push(keepStub(name, dayNumber));
    }
    await fetchAndWireTourImages({ slug, targets: stubs }, { dbOnly: true, sharedBlock: sharedDb });
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
