/**
 * Upload local tour cover/gallery/day JPGs to Cloudinary and point live DB at them.
 * Fixes production when imageDriver was left as "local" (/uploads/... 404 on server).
 *
 *   npx tsx scripts/publish-tour-images-cloudinary.ts --allow-remote
 *   npx tsx scripts/publish-tour-images-cloudinary.ts --allow-remote --covers-only
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { uploadCloudinaryBuffer } from "../src/lib/storage/cloudinary";

loadEnvConfig(process.cwd());

const coversOnly = process.argv.includes("--covers-only");
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

function assertRemoteOk() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");
  const hostname = new URL(connectionString).hostname;
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  if (!isLocal && !process.argv.includes("--allow-remote")) {
    throw new Error(`Remote DB ${hostname}. Re-run with --allow-remote.`);
  }
  console.log(`Publishing tour images to Cloudinary; DB host ${hostname}`);
}

function publicId(slug: string, kind: string) {
  return `worldcompass/tours/${slug}/${kind}`;
}

async function uploadLocal(file: string, id: string) {
  const uploaded = await uploadCloudinaryBuffer({
    buffer: readFileSync(file),
    publicId: id,
  });
  return {
    url: uploaded.url,
    key: uploaded.key,
    driver: "cloudinary" as const,
  };
}

async function mapPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  let cursor = 0;
  async function next(): Promise<void> {
    const index = cursor;
    cursor += 1;
    if (index >= items.length) return;
    await worker(items[index]);
    await next();
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => next()),
  );
}

async function main() {
  assertRemoteOk();
  const prisma = new PrismaClient();
  try {
    const tours = await prisma.tour.findMany({
      where: { published: true },
      select: { id: true, slug: true },
      orderBy: { slug: "asc" },
    });

    let ok = 0;
    let fail = 0;
    let skipped = 0;

    await mapPool(tours, 3, async (tour) => {
      const coverPath = path.join(tourDir, `${tour.slug}-cover.jpg`);
      if (!existsSync(coverPath)) {
        skipped += 1;
        console.warn(`skip ${tour.slug} — no local cover`);
        return;
      }
      try {
        const cover = await uploadLocal(
          coverPath,
          publicId(tour.slug, "cover"),
        );
        const gallery: { url: string; key: string; driver: "cloudinary" }[] =
          [];
        for (const n of [1, 2, 3, 4]) {
          const gPath = path.join(tourDir, `${tour.slug}-g${n}.jpg`);
          if (!existsSync(gPath)) continue;
          gallery.push(
            await uploadLocal(gPath, publicId(tour.slug, `gallery-${n}`)),
          );
        }
        if (gallery.length < 4) {
          console.warn(
            `  ${tour.slug} gallery ${gallery.length}/4 — still publishing cover`,
          );
        }

        await prisma.tour.update({
          where: { id: tour.id },
          data: {
            imageUrl: cover.url,
            imageKey: cover.key,
            imageDriver: "cloudinary",
            featuredImageUrl: cover.url,
            featuredImageKey: cover.key,
            featuredImageDriver: "cloudinary",
            galleryJson: JSON.stringify(gallery),
            seoImageUrl: cover.url,
            seoImageKey: cover.key,
            seoImageDriver: "cloudinary",
          },
        });

        if (!coversOnly) {
          for (let day = 1; day <= 30; day += 1) {
            const dPath = path.join(tourDir, `${tour.slug}-d${day}.jpg`);
            if (!existsSync(dPath)) continue;
            const dayAsset = await uploadLocal(
              dPath,
              publicId(tour.slug, `day-${day}`),
            );
            await prisma.itineraryDay.updateMany({
              where: { tourId: tour.id, dayNumber: day },
              data: {
                imageUrl: dayAsset.url,
                imageKey: dayAsset.key,
                imageDriver: "cloudinary",
              },
            });
          }
        }

        ok += 1;
        console.log(`ok ${tour.slug} (${gallery.length}g)`);
      } catch (error) {
        fail += 1;
        console.error(
          `fail ${tour.slug}:`,
          error instanceof Error ? error.message : error,
        );
      }
    });

    console.log(
      `\nDone. ok=${ok} fail=${fail} skipped=${skipped} of ${tours.length} published`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
