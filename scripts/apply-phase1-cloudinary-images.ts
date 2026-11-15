/**
 * Point Phase-1 tour covers/galleries at Cloudinary assets already uploaded.
 * Run after seed-kashmir-tours so listing/detail pages show place-accurate CDN photos.
 *
 *   npx tsx scripts/apply-phase1-cloudinary-images.ts --allow-remote
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryConfig } from "../src/lib/storage/config";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const PHASE1_SLUGS = [
  "kedarnath-yatra-package",
  "do-dham-yatra-kedarnath-badrinath",
  "char-dham-yatra-from-haridwar",
  "char-dham-yatra-by-helicopter",
  "kashmir-great-lakes-trek",
  "tarsar-marsar-trek",
  "hampta-pass-chandratal-trek",
  "chopta-chandrashila-deoriatal-trek",
  "valley-of-flowers-hemkund-trek",
] as const;

function assertRemoteOk() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");
  const hostname = new URL(connectionString).hostname;
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  if (!isLocal && !process.argv.includes("--allow-remote")) {
    throw new Error(`Remote DB ${hostname}. Re-run with --allow-remote.`);
  }
}

function configure() {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  return config.cloudName;
}

function urlFor(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

async function main() {
  assertRemoteOk();
  const cloudName = configure();

  for (const slug of PHASE1_SLUGS) {
    const coverId = `worldcompass/tours/${slug}/cover`;
    const galleryIds = [1, 2, 3, 4]
      .map((n) => `worldcompass/tours/${slug}/gallery-${n}`)
      .filter((id) => {
        // We uploaded g1/g2 (and g3 for some). Probe via explicit list below.
        return true;
      });

    // Discover which gallery public IDs exist by trying known ones.
    const existingGallery: { url: string; key: string; driver: "cloudinary" }[] = [];
    for (const id of galleryIds) {
      try {
        await cloudinary.api.resource(id, { resource_type: "image" });
        existingGallery.push({
          url: urlFor(cloudName, id),
          key: id,
          driver: "cloudinary",
        });
      } catch {
        // not uploaded
      }
    }

    try {
      await cloudinary.api.resource(coverId, { resource_type: "image" });
    } catch {
      console.warn(`  skip ${slug} — cover missing on Cloudinary`);
      continue;
    }

    const coverUrl = urlFor(cloudName, coverId);
    const updated = await prisma.tour.updateMany({
      where: { slug },
      data: {
        imageUrl: coverUrl,
        imageKey: coverId,
        imageDriver: "cloudinary",
        featuredImageUrl: coverUrl,
        featuredImageKey: coverId,
        featuredImageDriver: "cloudinary",
        galleryJson: JSON.stringify(existingGallery.slice(0, 4)),
        seoImageUrl: coverUrl,
        seoImageKey: coverId,
        seoImageDriver: "cloudinary",
      },
    });
    console.log(
      `  ${slug}: cover + ${existingGallery.length} gallery (${updated.count} rows)`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
