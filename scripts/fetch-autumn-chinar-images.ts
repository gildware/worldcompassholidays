/**
 * Place-accurate media for Photography & Autumn Chinar Tour.
 *
 *   npx tsx scripts/fetch-autumn-chinar-images.ts
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (autumn-chinar images; hi@worldcompassholiday.com)";
const slug = "photography-autumn-chinar-tour";
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
  skipSearch?: boolean;
};

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    role: "cover",
    place: "Chinar trees autumn Kashmir Srinagar",
    titles: [
      "File:Chinar trees in autumn, Kashmir.jpg",
      "File:Autumn in Kashmir.jpg",
      "File:Chinar Tree Kashmir.jpg",
      "File:Platanus orientalis Kashmir.jpg",
      "File:Nishat Bagh autumn.jpg",
    ],
    localFallbacks: [
      "tours/dal-lake-mughal-gardens-g1.jpg",
      "destinations/srinagar-4.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    role: "gallery",
    place: "Dal Lake autumn reflection",
    titles: [
      "File:Empty shikara on Dal Lake, Srinagar, India 2013-08-23 (flickr 9967093983).jpg",
      "File:Dal Lake Srinagar Jammu and Kashmir India.jpg",
    ],
    localFallbacks: ["tours/dal-lake-mughal-gardens-cover.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    role: "gallery",
    place: "Gulmarg meadow autumn clear views",
    titles: ["File:Gulmarg Meadows.jpg", "File:Gulmarg Gondola.jpg"],
    localFallbacks: ["destinations/gulmarg.jpg", "tours/gulmarg-gondola-meadows-cover.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    role: "gallery",
    place: "Pahalgam Lidder autumn",
    titles: ["File:Pahalgam Valley.jpg", "File:Lidder River Pahalgam.jpg"],
    localFallbacks: ["destinations/pahalgam.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    role: "gallery",
    place: "Nishat Bagh chinar garden",
    titles: ["File:Nishat Bagh, Srinagar.jpg", "File:Nishat Bagh Srinagar.jpg"],
    localFallbacks: ["tours/dal-lake-mughal-gardens-g1.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    role: "day",
    dayNumber: 1,
    place: "Day 1 Mughal garden chinars",
    titles: ["File:Shalimar Bagh, Srinagar.jpg", "File:Nishat Bagh, Srinagar.jpg"],
    localFallbacks: ["tours/dal-lake-mughal-gardens-g1.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    role: "day",
    dayNumber: 2,
    place: "Day 2 Gulmarg",
    titles: ["File:Gulmarg Gondola.jpg", "File:Gulmarg Cable Car.jpg"],
    localFallbacks: ["tours/gulmarg-gondola-meadows-g1.jpg", "destinations/gulmarg-2.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    role: "day",
    dayNumber: 3,
    place: "Day 3 Pampore saffron or Pahalgam road",
    titles: [
      "File:Saffron fields Pampore.jpg",
      "File:Pampore saffron.jpg",
      "File:Saffron flower Kashmir.jpg",
      "File:Pahalgam Valley.jpg",
    ],
    localFallbacks: ["destinations/pampore.jpg", "destinations/pahalgam-2.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    role: "day",
    dayNumber: 4,
    place: "Day 4 Betaab Aru",
    titles: ["File:Betaab Valley.jpg", "File:Aru Valley.jpg"],
    localFallbacks: ["destinations/betaab-valley.jpg", "destinations/aru-valley.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    role: "day",
    dayNumber: 5,
    place: "Day 5 Srinagar boulevard chinars",
    titles: [
      "File:Boulevard Road Srinagar.jpg",
      "File:Houseboats on Dal Lake.jpg",
      "File:Shankaracharya Temple.jpg",
    ],
    localFallbacks: ["destinations/srinagar.jpg", "destinations/srinagar-5.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d6.jpg`,
    role: "day",
    dayNumber: 6,
    place: "Day 6 farewell lake",
    titles: [],
    localFallbacks: ["destinations/srinagar-3.jpg", "destinations/srinagar-2.jpg"],
    skipSearch: true,
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
  if (!target.skipSearch) {
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
    if (!cover) throw new Error("Missing cover");
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
    console.log(`DB updated for ${tour.slug}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (!process.argv.includes("--db-only")) await writeAssets();
  await applyToDb();
  console.log(`Live: http://localhost:3000/tours/${slug}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
