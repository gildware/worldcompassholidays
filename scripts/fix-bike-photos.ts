/**
 * Replace bike VehicleImage rows with unique local photos uploaded to Cloudinary.
 *   npx tsx scripts/fix-bike-photos.ts
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { uploadCloudinaryBuffer } from "../src/lib/storage/cloudinary";

const prisma = new PrismaClient();
const photosDir = path.join(process.cwd(), "public", "uploads", "vehicles", "photos");

function hashOf(file: string) {
  return createHash("sha1").update(readFileSync(file)).digest("hex");
}

function galleryIndex(name: string, slug: string) {
  const base = name.replace(/\.[^.]+$/, "");
  if (base === slug) return 0;
  if (base.startsWith(`${slug}-`)) {
    const tail = base.slice(slug.length + 1);
    if (/^\d+$/.test(tail)) return Number(tail);
  }
  return Number.POSITIVE_INFINITY;
}

function photoFilesFor(slug: string) {
  const names = readdirSync(photosDir)
    .filter((name) => {
      if (!/\.jpe?g$/i.test(name)) return false;
      const base = name.replace(/\.[^.]+$/, "");
      return base === slug || /^[0-9]+$/.test(base.slice(slug.length + 1)) && base.startsWith(`${slug}-`);
    })
    .sort((a, b) => galleryIndex(a, slug) - galleryIndex(b, slug) || a.localeCompare(b));

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const full = path.join(photosDir, name);
    const digest = hashOf(full);
    if (seen.has(digest)) continue;
    seen.add(digest);
    unique.push(name);
    if (unique.length >= 5) break;
  }
  return unique;
}

async function main() {
  const bikes = await prisma.vehicle.findMany({
    where: { kind: "bike", published: true },
    select: { id: true, slug: true, name: true },
    orderBy: { name: "asc" },
  });

  for (const bike of bikes) {
    const files = photoFilesFor(bike.slug);
    console.log(`\n${bike.slug}: ${files.length} unique local photos`);
    if (!files.length) {
      console.log("  SKIP — no local photos");
      continue;
    }

    await prisma.vehicleImage.deleteMany({ where: { vehicleId: bike.id } });

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const full = path.join(photosDir, file);
      const publicId = `worldcompass/vehicles/${file.replace(/\.[^.]+$/, "")}/cover`;
      const uploaded = await uploadCloudinaryBuffer({
        buffer: readFileSync(full),
        publicId,
      });
      await prisma.vehicleImage.create({
        data: {
          vehicleId: bike.id,
          url: uploaded.url,
          key: uploaded.key,
          driver: "cloudinary",
          sortOrder: index,
        },
      });
      console.log(`  ok ${file} → ${uploaded.url}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
