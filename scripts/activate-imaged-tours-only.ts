/**
 * Live DB: publish only tours that have cover + 4 gallery images on disk.
 * Wires cover/gallery/day image URLs from public/uploads/tours.
 * Unpublishes everything else.
 *
 *   npx tsx scripts/activate-imaged-tours-only.ts
 *   npx tsx scripts/activate-imaged-tours-only.ts --dry
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const dry = process.argv.includes("--dry");
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

function localAsset(rel: string) {
  const file = path.join(process.cwd(), "public", "uploads", rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

function diskStatus(slug: string) {
  const cover = existsSync(path.join(tourDir, `${slug}-cover.jpg`));
  const gallery = [1, 2, 3, 4]
    .map((i) => existsSync(path.join(tourDir, `${slug}-g${i}.jpg`)))
    .filter(Boolean).length;
  const days = [...Array(30)]
    .map((_, i) => i + 1)
    .filter((d) => existsSync(path.join(tourDir, `${slug}-d${d}.jpg`)));
  return {
    cover,
    gallery,
    days,
    hasImages: cover && gallery >= 4,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const prisma = new PrismaClient();
  try {
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        slug: true,
        published: true,
        imageUrl: true,
        days: { select: { dayNumber: true } },
      },
      orderBy: { slug: "asc" },
    });

    const keep: string[] = [];
    const drop: string[] = [];
    let wired = 0;

    for (const tour of tours) {
      const status = diskStatus(tour.slug);
      if (!status.hasImages) {
        drop.push(tour.slug);
        if (!dry && tour.published) {
          await prisma.tour.update({
            where: { id: tour.id },
            data: { published: false, isFeatured: false },
          });
        }
        continue;
      }

      keep.push(tour.slug);
      const cover = localAsset(`tours/${tour.slug}-cover.jpg`)!;
      const galleryAssets = [1, 2, 3, 4]
        .map((i) => localAsset(`tours/${tour.slug}-g${i}.jpg`)!)
        .map((item) => ({
          url: item.url,
          key: item.key,
          driver: item.driver,
        }));

      if (!dry) {
        await prisma.tour.update({
          where: { id: tour.id },
          data: {
            published: true,
            imageUrl: cover.url,
            imageKey: cover.key,
            imageDriver: cover.driver,
            featuredImageUrl: cover.url,
            featuredImageKey: cover.key,
            featuredImageDriver: cover.driver,
            galleryJson: JSON.stringify(galleryAssets),
            seoImageUrl: cover.url,
            seoImageKey: cover.key,
            seoImageDriver: cover.driver,
          },
        });

        for (const dayNumber of status.days) {
          const asset = localAsset(`tours/${tour.slug}-d${dayNumber}.jpg`);
          if (!asset) continue;
          await prisma.itineraryDay.updateMany({
            where: { tourId: tour.id, dayNumber },
            data: {
              imageUrl: asset.url,
              imageKey: asset.key,
              imageDriver: asset.driver,
            },
          });
        }
        wired++;
      }
    }

    // Disk-only inventory (not in DB yet)
    const dbSlugs = new Set(tours.map((t) => t.slug));
    const diskOnly: string[] = [];
    for (const name of readdirSync(tourDir)) {
      const m = name.match(/^(.+)-cover\.jpg$/);
      if (!m) continue;
      const slug = m[1];
      if (dbSlugs.has(slug)) continue;
      if (diskStatus(slug).hasImages) diskOnly.push(slug);
    }

    console.log(`\nDB tours: ${tours.length}`);
    console.log(`KEEP published (have cover+4g): ${keep.length}`);
    console.log(`UNPUBLISH (no/incomplete images): ${drop.length}`);
    console.log(`Wired image URLs: ${dry ? "(dry)" : wired}`);
    console.log(`Disk FULL but not in DB (skipped seed): ${diskOnly.length}`);
    if (diskOnly.length) {
      console.log(
        "  " +
          diskOnly
            .slice(0, 40)
            .join(", ") +
          (diskOnly.length > 40 ? ` …+${diskOnly.length - 40}` : ""),
      );
    }
    if (dry) console.log("\n(dry run — no DB writes)");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
