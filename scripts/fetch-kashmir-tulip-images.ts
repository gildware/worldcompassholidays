/**
 * Place-accurate media for Kashmir in Tulip Season.
 *
 *   npx tsx scripts/fetch-kashmir-tulip-images.ts
 *   npx tsx scripts/fetch-kashmir-tulip-images.ts --db-only
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (kashmir-tulip-season images; hi@worldcompassholiday.com)";
const slug = "kashmir-in-tulip-season";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const uploads = path.join(process.cwd(), "public", "uploads");
mkdirSync(tourDir, { recursive: true });

type Target = {
  file: string;
  role: "cover" | "gallery" | "day";
  dayNumber?: number;
  place: string;
  titles: string[];
  localFallbacks?: string[];
  w: number;
  h: number;
};

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    role: "cover",
    place: "Indira Gandhi Memorial Tulip Garden Srinagar",
    titles: [
      "File:Indira Gandhi Memorial Tulip Garden, Srinagar.jpg",
      "File:Tulip Garden Srinagar.jpg",
      "File:Asia's largest tulip garden.jpg",
      "File:Tulips in Srinagar.jpg",
      "File:Indira Gandhi Memorial Tulip Garden.jpg",
    ],
    localFallbacks: ["destinations/srinagar-4.jpg", "destinations/srinagar.jpg"],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    role: "gallery",
    place: "Tulip garden rows Srinagar",
    titles: [
      "File:Tulip Garden of Srinagar.jpg",
      "File:Colourful tulips Srinagar.jpg",
      "File:IGM Tulip Garden.jpg",
    ],
    localFallbacks: ["destinations/srinagar-5.jpg", "destinations/srinagar-2.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    role: "gallery",
    place: "Gulmarg spring meadow gondola",
    titles: ["File:Gulmarg Gondola.jpg", "File:Gulmarg Meadows.jpg"],
    localFallbacks: [
      "tours/gulmarg-gondola-meadows-cover.jpg",
      "destinations/gulmarg.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    role: "gallery",
    place: "Pahalgam Lidder spring valley",
    titles: ["File:Pahalgam Valley.jpg", "File:Lidder River Pahalgam.jpg"],
    localFallbacks: ["destinations/pahalgam.jpg", "destinations/pahalgam-3.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    role: "gallery",
    place: "Dal Lake Shikara Srinagar",
    titles: [
      "File:Empty shikara on Dal Lake, Srinagar, India 2013-08-23 (flickr 9967093983).jpg",
      "File:Shikara Boats on Dal Lake.jpg",
    ],
    localFallbacks: ["tours/dal-lake-mughal-gardens-cover.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    role: "day",
    dayNumber: 1,
    place: "Day 1 Tulip Garden",
    titles: [
      "File:Indira Gandhi Memorial Tulip Garden, Srinagar.jpg",
      "File:Tulip Garden Srinagar.jpg",
    ],
    localFallbacks: ["destinations/srinagar-4.jpg", "destinations/srinagar-3.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    role: "day",
    dayNumber: 2,
    place: "Day 2 Gulmarg Gondola",
    titles: ["File:Gulmarg Cable Car.jpg", "File:Gondola Gulmarg.jpg"],
    localFallbacks: [
      "tours/gulmarg-gondola-meadows-g1.jpg",
      "destinations/gulmarg-2.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    role: "day",
    dayNumber: 3,
    place: "Day 3 Pahalgam Lidder",
    titles: ["File:Pahalgam Kashmir.jpg", "File:Lidder River at Pahalgam.jpg"],
    localFallbacks: ["destinations/pahalgam.jpg", "destinations/pahalgam-4.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    role: "day",
    dayNumber: 4,
    place: "Day 4 Betaab Aru",
    titles: ["File:Betaab Valley.jpg", "File:Aru Valley.jpg"],
    localFallbacks: [
      "destinations/betaab-valley.jpg",
      "tours/pahalgam-betaab-valley-cover.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    role: "day",
    dayNumber: 5,
    place: "Day 5 Srinagar return",
    titles: [
      "File:Nishat Bagh, Srinagar.jpg",
      "File:Shankaracharya Temple.jpg",
    ],
    localFallbacks: [
      "tours/dal-lake-mughal-gardens-g1.jpg",
      "destinations/srinagar.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d6.jpg`,
    role: "day",
    dayNumber: 6,
    place: "Day 6 farewell Dal Lake",
    titles: ["File:Houseboats on Dal Lake.jpg"],
    localFallbacks: ["destinations/srinagar-3.jpg", "destinations/srinagar.jpg"],
    w: 1400,
    h: 933,
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function info(title: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime|extmetadata|size");
  u.searchParams.set("iiurlwidth", "1920");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          imageinfo?: {
            url?: string;
            thumburl?: string;
            mime?: string;
            width?: number;
            extmetadata?: { LicenseShortName?: { value?: string } };
          }[];
        }
      >;
    };
  };
  const ii = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!ii?.url || !String(ii.mime || "").startsWith("image/") || String(ii.mime).includes("svg")) {
    return null;
  }
  if (String(ii.extmetadata?.LicenseShortName?.value || "").toLowerCase().includes("nc")) {
    return null;
  }
  if ((ii.width || 0) > 0 && (ii.width || 0) < 800) return null;
  return {
    title,
    url: (ii.thumburl || ii.url).split("?")[0],
    license: ii.extmetadata?.LicenseShortName?.value ?? "",
  };
}

async function searchTitles(query: string): Promise<string[]> {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("list", "search");
  u.searchParams.set("srsearch", `${query} filetype:bitmap`);
  u.searchParams.set("srnamespace", "6");
  u.searchParams.set("srlimit", "10");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter((title) => !/logo|map|flag|svg|diagram|icon|poster|stamp|sketch/i.test(title));
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveBytes(target: Target, used: Set<string>) {
  const queue = [...target.titles];
  if (target.role !== "day" || (target.dayNumber ?? 0) < 6) {
    await sleep(500);
    const extras = await searchTitles(
      target.place.replace(/Day \d+ /, "").split(/[·—]/)[0].trim(),
    );
    for (const t of extras) if (!queue.includes(t)) queue.push(t);
  }

  for (const title of queue) {
    await sleep(700);
    try {
      const meta = await info(title);
      if (!meta) continue;
      const raw = await download(meta.url);
      const hash = createHash("sha1").update(raw).digest("hex");
      if (used.has(hash)) continue;
      used.add(hash);
      return { buffer: raw, source: `${title} (${meta.license})` };
    } catch {
      continue;
    }
  }

  for (const rel of target.localFallbacks ?? []) {
    const file = path.join(uploads, rel);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file);
    const hash = createHash("sha1").update(raw).digest("hex");
    if (used.has(hash)) continue;
    used.add(hash);
    return { buffer: raw, source: `local:${rel}` };
  }
  throw new Error(`No image for ${target.file}`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function writeAssets() {
  const used = new Set<string>();
  const attribution: string[] = [
    `# ${slug} images ${new Date().toISOString()}`,
    "# Wikimedia Commons or curated local place photos.",
    "",
  ];
  for (const target of TARGETS) {
    console.log(`→ ${target.file}  (${target.place})`);
    const { buffer, source } = await resolveBytes(target, used);
    const processed = await sharp(buffer)
      .rotate()
      .resize(target.w, target.h, { fit: "cover", position: "centre" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    writeFileSync(path.join(tourDir, target.file), processed);
    attribution.push(`${target.file}  ←  ${source}`);
    console.log(`  ok  ${source}`);
  }
  writeFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), attribution.join("\n") + "\n");
}

async function applyToDb() {
  const prisma = new PrismaClient();
  try {
    const cover = localAsset(`tours/${slug}-cover.jpg`);
    if (!cover) throw new Error("Missing cover — run without --db-only first.");
    const gallery = ["g1", "g2", "g3", "g4"]
      .map((s) => localAsset(`tours/${slug}-${s}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const tour = await prisma.tour.update({
      where: { slug },
      data: {
        imageUrl: cover.url,
        imageKey: cover.key,
        imageDriver: cover.driver,
        featuredImageUrl: cover.url,
        featuredImageKey: cover.key,
        featuredImageDriver: cover.driver,
        galleryJson: JSON.stringify(
          gallery.map((item) => ({
            url: item.url,
            key: item.key,
            driver: item.driver,
          })),
        ),
        seoImageUrl: cover.url,
        seoImageKey: cover.key,
        seoImageDriver: cover.driver,
      },
      select: { id: true, slug: true },
    });

    for (const target of TARGETS.filter((t) => t.role === "day" && t.dayNumber)) {
      const asset = localAsset(`tours/${target.file}`);
      if (!asset) continue;
      await prisma.itineraryDay.updateMany({
        where: { tourId: tour.id, dayNumber: target.dayNumber },
        data: {
          imageUrl: asset.url,
          imageKey: asset.key,
          imageDriver: asset.driver,
        },
      });
    }
    console.log(`DB updated for ${tour.slug} (${gallery.length} gallery + day photos)`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dbOnly = process.argv.includes("--db-only");
  if (!dbOnly) await writeAssets();
  await applyToDb();
  console.log(`Live: http://localhost:3000/tours/${slug}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
