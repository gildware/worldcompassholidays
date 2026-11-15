import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

const SLUGS = [
  "sandakphu-phalut-trek",
  "kerala-family-getaway",
  "andaman-island-family-adventure",
  "golden-triangle-family",
  "darjeeling-gangtok-family-hills",
  "chandratal-lake-camping",
  "andaman-island-hopping",
  "golden-triangle-classic",
] as const;

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const prisma = new PrismaClient();

  console.log("slug\tstatus");
  for (const slug of SLUGS) {
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: {
        imageKey: true,
        galleryJson: true,
        days: { select: { dayNumber: true, imageKey: true }, orderBy: { dayNumber: "asc" } },
      },
    });
    const dayCount = tour?.days.length ?? 0;
    const need = [
      `${slug}-cover.jpg`,
      ...["g1", "g2", "g3", "g4"].map((s) => `${slug}-${s}.jpg`),
      ...Array.from({ length: dayCount }, (_, i) => `${slug}-d${i + 1}.jpg`),
    ];
    const missingFs = need.filter((f) => !existsSync(path.join(tourDir, f)));
    const gal = JSON.parse(tour?.galleryJson || "[]") as unknown[];
    const daysWithKey = tour?.days.filter((d) => d.imageKey).length ?? 0;
    const dbOk =
      Boolean(tour?.imageKey) &&
      gal.length >= 4 &&
      dayCount >= 1 &&
      daysWithKey === dayCount;
    const fsOk = missingFs.length === 0;
    console.log(`${slug}\t${fsOk && dbOk ? "OK" : "FAIL"}`);
    if (!fsOk) console.error(`  missing fs: ${missingFs.join(", ")}`);
    if (!dbOk) {
      console.error(
        `  db: cover=${!!tour?.imageKey} gal=${gal.length} days=${daysWithKey}/${dayCount}`,
      );
    }
  }

  await prisma.$disconnect();
}

main();