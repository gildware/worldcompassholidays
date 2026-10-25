/**
 * Uploads catalog files, logos, and the homepage cover to Cloudinary.
 *
 * Folders:
 *   worldcompass/destinations/{slug}
 *   worldcompass/tours/{slug}/cover|banner|gallery-n
 *   worldcompass/hotels/{slug}/cover|banner|gallery-n
 *   worldcompass/vehicles/{slug}/cover
 *   worldcompass/brand/logos/{name}
 *   worldcompass/brand/covers/home
 *
 * Writes prisma/cloudinary-manifest.json and points the local database at those files.
 * Run from the travel directory: npm run media:publish
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

function loadEnv(file: string) {
  const text = readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
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

type Asset = { url: string; key: string; driver: "cloudinary" };

function walk(dir: string, root: string, out: { rel: string; file: string }[]) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, root, out);
      continue;
    }
    if (!/\.(jpe?g|png|webp|gif|svg)$/i.test(name)) continue;
    out.push({
      rel: path.relative(root, full).split(path.sep).join("/"),
      file: full,
    });
  }
}

function publicIdFor(rel: string) {
  const noExt = rel.replace(/\.[a-z0-9]+$/i, "");
  const patterned = noExt.match(/^(tours|hotels)\/(.+)-(cover|banner|g\d+)$/);
  if (patterned) {
    const kind = patterned[3].startsWith("g")
      ? `gallery-${patterned[3].slice(1)}`
      : patterned[3];
    return `worldcompass/${patterned[1]}/${patterned[2]}/${kind}`;
  }
  const destination = noExt.match(/^destinations\/(.+)$/);
  if (destination) return `worldcompass/destinations/${destination[1]}`;
  const photo = noExt.match(/^vehicles\/photos\/(.+)$/);
  if (photo) return `worldcompass/vehicles/${photo[1]}/cover`;
  const seeded = noExt.match(/^vehicles\/seed-(.+)$/);
  if (seeded) return `worldcompass/vehicles/${seeded[1]}/cover`;
  const hotel = noExt.match(/^hotels\/(.+)$/);
  if (hotel) return `worldcompass/hotels/${hotel[1]}/cover`;
  const tour = noExt.match(/^tours\/(.+)$/);
  if (tour) return `worldcompass/tours/${tour[1]}/image`;
  const vehicle = noExt.match(/^vehicles\/(.+)$/);
  if (vehicle) return `worldcompass/vehicles/${vehicle[1]}/image`;
  return `worldcompass/library/${noExt}`;
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
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
}

async function main() {
  const { uploadCloudinaryBuffer } = await import("../src/lib/storage/cloudinary");
  const { PrismaClient } = await import("@prisma/client");
  const { applyCloudinaryManifest, manifestPath } = await import(
    "../src/lib/storage/manifest"
  );

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const vendorImg = path.join(
    process.cwd(),
    "vendor",
    "worldcompassholiday",
    "public",
    "img",
  );
  const queued: { rel: string; file: string; publicId: string }[] = [];
  const discovered: { rel: string; file: string }[] = [];
  walk(uploadsRoot, uploadsRoot, discovered);
  for (const item of discovered) {
    queued.push({ ...item, publicId: publicIdFor(item.rel) });
  }

  const extras: { rel: string; file: string; publicId: string }[] = [
    {
      rel: "brand/covers/home",
      file: path.join(vendorImg, "masthead", "1", "bg.webp"),
      publicId: "worldcompass/brand/covers/home",
    },
    {
      rel: "brand/logos/logo-light",
      file: path.join(vendorImg, "general", "logo-light.svg"),
      publicId: "worldcompass/brand/logos/logo-light",
    },
    {
      rel: "brand/logos/logo-dark",
      file: path.join(vendorImg, "general", "logo-dark.svg"),
      publicId: "worldcompass/brand/logos/logo-dark",
    },
    {
      rel: "brand/favicon",
      file: path.join(process.cwd(), "public", "favicon.gif"),
      publicId: "worldcompass/brand/favicon",
    },
  ];
  for (const extra of extras) {
    if (statSync(extra.file, { throwIfNoEntry: false })?.isFile()) queued.push(extra);
  }

  const files: Record<string, Asset> = {};
  let done = 0;
  let failed = 0;
  await mapPool(queued, 4, async (item) => {
    try {
      const uploaded = await uploadCloudinaryBuffer({
        buffer: readFileSync(item.file),
        publicId: item.publicId,
      });
      files[item.rel] = {
        url: uploaded.url,
        key: uploaded.key,
        driver: "cloudinary",
      };
      done += 1;
      if (done % 25 === 0 || done === queued.length) {
        console.log(`Uploaded ${done}/${queued.length}`);
      }
    } catch (error) {
      failed += 1;
      console.error(
        `Failed ${item.rel}:`,
        error instanceof Error ? error.message : "upload failed",
      );
    }
  });

  const cover = files["brand/covers/home"] ?? null;
  const manifest = {
    files,
    brand: {
      logo: null,
      covers: cover ? [cover] : [],
    },
  };
  writeFileSync(manifestPath(), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Manifest written (${done} uploaded, ${failed} failed).`);

  const prisma = new PrismaClient();
  try {
    await applyCloudinaryManifest(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
