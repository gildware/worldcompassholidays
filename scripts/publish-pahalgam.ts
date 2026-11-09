/**
 * Upload approved Pahalgam destination photos to Cloudinary and point the DB at them.
 *   npx tsx scripts/publish-pahalgam.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { uploadCloudinaryBuffer } from "../src/lib/storage/cloudinary";

function loadEnv(file: string) {
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(path.join(process.cwd(), ".env"));

async function main() {
  const uploads = path.join(process.cwd(), "public", "uploads", "destinations");
  const files = [
    { file: "pahalgam-cover.jpg", publicId: "worldcompass/destinations/pahalgam" },
    { file: "pahalgam-cover.jpg", publicId: "worldcompass/destinations/pahalgam-cover" },
    { file: "pahalgam-2.jpg", publicId: "worldcompass/destinations/pahalgam-2" },
    { file: "pahalgam-3.jpg", publicId: "worldcompass/destinations/pahalgam-3" },
    { file: "pahalgam-4.jpg", publicId: "worldcompass/destinations/pahalgam-4" },
    { file: "pahalgam-5.jpg", publicId: "worldcompass/destinations/pahalgam-5" },
  ] as const;

  const uploaded: Record<string, { url: string; key: string; driver: "cloudinary" }> = {};
  for (const item of files) {
    const buffer = readFileSync(path.join(uploads, item.file));
    console.log(`Uploading ${item.file} → ${item.publicId} (${buffer.length} bytes)...`);
    const result = await uploadCloudinaryBuffer({ buffer, publicId: item.publicId });
    uploaded[item.publicId] = result;
    console.log(`  ok ${result.url}`);
  }

  const cover = uploaded["worldcompass/destinations/pahalgam"];
  const gallery = [
    cover,
    uploaded["worldcompass/destinations/pahalgam-2"],
    uploaded["worldcompass/destinations/pahalgam-3"],
    uploaded["worldcompass/destinations/pahalgam-4"],
    uploaded["worldcompass/destinations/pahalgam-5"],
  ].map((item) => ({ url: item.url, key: item.key, driver: "cloudinary" as const }));

  const prisma = new PrismaClient();
  try {
    const updated = await prisma.destination.update({
      where: { slug: "pahalgam" },
      data: {
        imageUrl: cover.url,
        imageKey: cover.key,
        imageDriver: "cloudinary",
        galleryJson: JSON.stringify(gallery),
      },
      select: {
        imageUrl: true,
        imageKey: true,
        imageDriver: true,
        galleryJson: true,
        updatedAt: true,
      },
    });
    console.log("\nDB updated:");
    console.log(JSON.stringify(updated, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
