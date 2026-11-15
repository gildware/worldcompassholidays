/**
 * Publish the format-pilot tour on the public website.
 * Uses existing destination photos as temporary cover/banner (not final tour images).
 *
 *   node --import tsx scripts/publish-sample-tour.ts
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function main() {
  const cover =
    localAsset("destinations/gulmarg.jpg") ??
    localAsset("destinations/srinagar.jpg") ??
    localAsset("destinations/kashmir.jpg");
  const banner =
    localAsset("destinations/pahalgam.jpg") ??
    localAsset("destinations/srinagar-2.jpg") ??
    cover;
  const gallery = [
    localAsset("destinations/srinagar.jpg"),
    localAsset("destinations/gulmarg.jpg"),
    localAsset("destinations/pahalgam.jpg"),
    localAsset("destinations/betaab-valley.jpg"),
  ].filter(Boolean);

  const data: Record<string, unknown> = {
    published: true,
    isFeatured: true,
  };

  if (cover) {
    data.imageUrl = cover.url;
    data.imageKey = cover.key;
    data.imageDriver = cover.driver;
  }
  if (banner) {
    data.featuredImageUrl = banner.url;
    data.featuredImageKey = banner.key;
    data.featuredImageDriver = banner.driver;
  }
  if (gallery.length) {
    data.galleryJson = JSON.stringify(
      gallery.map((item) => ({
        url: item!.url,
        key: item!.key,
        driver: item!.driver,
      })),
    );
  }

  const saved = await prisma.tour.update({
    where: { slug: "classic-kashmir-triangle" },
    data,
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      imageUrl: true,
      featuredImageUrl: true,
    },
  });

  console.log(JSON.stringify(saved, null, 2));
  console.log(`Live: http://localhost:3000/tours/${saved.slug}`);
  console.log(`List: http://localhost:3000/tours`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
