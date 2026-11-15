import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

const SLUGS = [
  "puri-jagannath-darshan",
  "udaipur-romantic-palace-honeymoon",
  "ooty-coonoor-family-hills",
  "pangong-lake-shore-camping",
  "darjeeling-tea-hills",
  "ooty-coonoor-nilgiris",
  "pondicherry-french-escape",
  "rishikesh-yoga-ganga-retreat",
] as const;

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const prisma = new PrismaClient();

  for (const slug of SLUGS) {
    const need = [
      `${slug}-cover.jpg`,
      `${slug}-g1.jpg`,
      `${slug}-g2.jpg`,
      `${slug}-g3.jpg`,
      `${slug}-g4.jpg`,
      `${slug}-d1.jpg`,
      `${slug}-d2.jpg`,
      `${slug}-d3.jpg`,
      `${slug}-d4.jpg`,
    ];
    const missingFs = need.filter((f) => !existsSync(path.join(tourDir, f)));
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: {
        imageUrl: true,
        galleryJson: true,
        days: { select: { imageUrl: true }, orderBy: { dayNumber: "asc" } },
      },
    });
    const gal = JSON.parse(tour?.galleryJson || "[]") as unknown[];
    const daysWith = tour?.days.filter((d) => d.imageUrl).length ?? 0;
    const dayTotal = tour?.days.length ?? 0;
    const dbOk =
      Boolean(tour?.imageUrl) && gal.length >= 4 && dayTotal >= 4 && daysWith === dayTotal;
    const fsOk = missingFs.length === 0;
    const status = fsOk && dbOk ? "OK" : "FAIL";
    console.log(
      `${status}\t${slug}\tfs=${need.length - missingFs.length}/${need.length}\tdb=${dbOk ? "wired" : `cover=${!!tour?.imageUrl} gal=${gal.length} days=${daysWith}/${dayTotal}`}`,
    );
    if (missingFs.length) console.log(`  missing: ${missingFs.join(", ")}`);
  }

  await prisma.$disconnect();
}

main();
