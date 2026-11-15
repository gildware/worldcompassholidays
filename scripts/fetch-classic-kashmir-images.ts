/**
 * Place-accurate cover, gallery, and per-day photos for Classic Kashmir Triangle.
 * Sources: Wikimedia Commons (free licenses). Writes tours/classic-kashmir-triangle-*.jpg
 * then updates the tour + itinerary day rows in the DB.
 *
 *   npx tsx scripts/fetch-classic-kashmir-images.ts
 *   npx tsx scripts/fetch-classic-kashmir-images.ts --db-only
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (classic-kashmir-triangle images; hi@worldcompassholiday.com)";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const uploads = path.join(process.cwd(), "public", "uploads");
mkdirSync(tourDir, { recursive: true });

type Target = {
  file: string;
  role: "cover" | "gallery" | "day";
  dayNumber?: number;
  place: string;
  titles: string[];
  /** Local fallbacks already verified as the same place (relative to public/uploads). */
  localFallbacks?: string[];
  w: number;
  h: number;
};

/**
 * Mapping follows the 6-day itinerary:
 * 1 Srinagar gardens + Shikara · 2 Gulmarg Gondola · 3 drive to Pahalgam ·
 * 4 Betaab & Aru · 5 return Srinagar · 6 departure
 */
const TARGETS: Target[] = [
  {
    file: "classic-kashmir-triangle-cover.jpg",
    role: "cover",
    place: "Dal Lake Shikara — iconic Kashmir hero",
    titles: [
      "File:Shikara on Dal Lake, Srinagar, India 2013-08-23 (flickr 9967100954).jpg",
      "File:Empty shikara on Dal Lake, Srinagar, India 2013-08-23 (flickr 9967093983).jpg",
      "File:Dal Lake Srinagar Jammu and Kashmir India.jpg",
      "File:Dal lake by Ahanger HOBO.jpg",
      "File:Shikara Boats on Dal Lake.jpg",
    ],
    localFallbacks: ["tours/dal-lake-mughal-gardens-cover.jpg"],
    w: 1920,
    h: 1080,
  },
  {
    file: "classic-kashmir-triangle-g1.jpg",
    role: "gallery",
    place: "Gulmarg meadow + Gondola",
    titles: [
      "File:Gulmarg Gondola.jpg",
      "File:Gulmarg gondola cable car.jpg",
      "File:Gulmarg Meadows.jpg",
      "File:Gulmarg, Jammu and Kashmir.jpg",
      "File:View of Gulmarg.jpg",
    ],
    localFallbacks: ["tours/gulmarg-gondola-meadows-cover.jpg", "destinations/gulmarg.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: "classic-kashmir-triangle-g2.jpg",
    role: "gallery",
    place: "Pahalgam Lidder valley",
    titles: [
      "File:Pahalgam Valley.jpg",
      "File:Lidder River Pahalgam.jpg",
      "File:Pahalgam, Jammu and Kashmir.jpg",
      "File:Lidder River in Pahalgam.jpg",
      "File:Pahalgam Landscape.jpg",
    ],
    localFallbacks: ["destinations/pahalgam.jpg", "destinations/pahalgam-3.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: "classic-kashmir-triangle-g3.jpg",
    role: "gallery",
    place: "Betaab Valley meadow",
    titles: [
      "File:Betaab Valley.jpg",
      "File:Betaab Valley Pahalgam.jpg",
      "File:Betab Valley.jpg",
      "File:Betaab Valley, Pahalgam, Jammu and Kashmir.jpg",
      "File:Baisaran Valley Pahalgam.jpg",
    ],
    localFallbacks: [
      "tours/pahalgam-betaab-valley-cover.jpg",
      "destinations/betaab-valley.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: "classic-kashmir-triangle-g4.jpg",
    role: "gallery",
    place: "Nishat Bagh Mughal garden",
    titles: [
      "File:Nishat Bagh Srinagar.jpg",
      "File:Nishat Bagh, Srinagar.jpg",
      "File:Nishat Garden Srinagar.jpg",
      "File:Mughal Gardens Srinagar.jpg",
      "File:Shalimar Bagh Srinagar.jpg",
    ],
    localFallbacks: ["tours/dal-lake-mughal-gardens-g1.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: "classic-kashmir-triangle-d1.jpg",
    role: "day",
    dayNumber: 1,
    place: "Day 1 — Mughal gardens / Dal Shikara",
    titles: [
      "File:Nishat Bagh from above.jpg",
      "File:Nishat Bagh Srinagar Kashmir.jpg",
      "File:Chashme Shahi Garden.jpg",
      "File:Shalimar Bagh, Srinagar.jpg",
      "File:Nishat Bagh Srinagar.jpg",
    ],
    localFallbacks: [
      "tours/dal-lake-mughal-gardens-g1.jpg",
      "destinations/srinagar-3.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: "classic-kashmir-triangle-d2.jpg",
    role: "day",
    dayNumber: 2,
    place: "Day 2 — Gulmarg Gondola meadows",
    titles: [
      "File:Gulmarg Cable Car.jpg",
      "File:Gondola Gulmarg.jpg",
      "File:Gulmarg Ski Resort.jpg",
      "File:Gulmarg in summer.jpg",
      "File:Gulmarg Meadows Jammu and Kashmir.jpg",
    ],
    localFallbacks: [
      "tours/gulmarg-gondola-meadows-g1.jpg",
      "destinations/gulmarg.jpg",
      "destinations/gulmarg-2.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: "classic-kashmir-triangle-d3.jpg",
    role: "day",
    dayNumber: 3,
    place: "Day 3 — Pahalgam Lidder riverside arrival",
    titles: [
      "File:Lidder River at Pahalgam.jpg",
      "File:Pahalgam Lidder.jpg",
      "File:Pahalgam town.jpg",
      "File:Pahalgam Kashmir.jpg",
      "File:Pahalgam Valley Jammu and Kashmir.jpg",
    ],
    localFallbacks: ["destinations/pahalgam.jpg", "destinations/pahalgam-4.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: "classic-kashmir-triangle-d4.jpg",
    role: "day",
    dayNumber: 4,
    place: "Day 4 — Betaab / Aru valleys",
    titles: [
      "File:Aru Valley.jpg",
      "File:Aru Valley Pahalgam.jpg",
      "File:Betaab Valley Pahalgam Kashmir.jpg",
      "File:Betaab Valley.jpg",
      "File:Aru, Jammu and Kashmir.jpg",
    ],
    localFallbacks: [
      "destinations/betaab-valley.jpg",
      "destinations/aru-valley.jpg",
      "tours/pahalgam-betaab-valley-g1.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: "classic-kashmir-triangle-d5.jpg",
    role: "day",
    dayNumber: 5,
    place: "Day 5 — Srinagar lake views / crafts return",
    titles: [
      "File:Shankaracharya Temple Srinagar.jpg",
      "File:Shankaracharya Temple.jpg",
      "File:Dal Lake houseboats Srinagar.jpg",
      "File:Houseboats on Dal Lake.jpg",
      "File:Boulevard Road Srinagar.jpg",
    ],
    localFallbacks: ["destinations/srinagar.jpg", "destinations/srinagar-5.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: "classic-kashmir-triangle-d6.jpg",
    role: "day",
    dayNumber: 6,
    place: "Day 6 — farewell Dal Lake Shikara",
    titles: [
      "File:Floating vegetable market on Dal Lake.jpg",
      "File:Vegetable seller on Dal Lake.jpg",
      "File:Dal Lake Srinagar houseboats.jpg",
      "File:Houseboat on Dal Lake Srinagar.jpg",
    ],
    // Prefer known-good Dal Lake locals — airport Commons hits are sparse / noisy.
    localFallbacks: ["destinations/srinagar-3.jpg", "destinations/srinagar.jpg", "destinations/srinagar-4.jpg"],
    w: 1400,
    h: 933,
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  u.searchParams.set("srlimit", "12");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter(
      (title) =>
        !/logo|map|flag|svg|diagram|icon|poster|army|minister|coin|stamp|sketch|drawing|cartoon|passport|visa/i.test(
          title,
        ),
    );
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveBytes(
  target: Target,
  usedHashes: Set<string>,
): Promise<{ buffer: Buffer; source: string }> {
  const tried = new Set<string>();
  const queue = [...target.titles];

  // Expand with a tight place search (skip day-6 style farewell phrasing — too noisy).
  if (target.role !== "day" || (target.dayNumber ?? 0) < 6) {
    await sleep(600);
    const query = target.place
      .replace(/Day \d+ — /, "")
      .split(/[·—]/)[0]
      .trim();
    const extras = await searchTitles(query);
    for (const title of extras) {
      if (!queue.includes(title)) queue.push(title);
    }
  }

  for (const title of queue) {
    if (tried.has(title)) continue;
    tried.add(title);
    await sleep(700);
    try {
      const meta = await info(title);
      if (!meta) continue;
      const raw = await download(meta.url);
      const hash = createHash("sha1").update(raw).digest("hex");
      if (usedHashes.has(hash)) continue;
      usedHashes.add(hash);
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
    if (usedHashes.has(hash)) continue;
    usedHashes.add(hash);
    return { buffer: raw, source: `local:${rel}` };
  }

  throw new Error(`No image for ${target.file} (${target.place})`);
}

async function writeAssets() {
  const usedHashes = new Set<string>();
  const attribution: string[] = [
    `# Classic Kashmir Triangle images ${new Date().toISOString()}`,
    "# Source: Wikimedia Commons (free licenses) or curated local place photos.",
    "",
  ];

  for (const target of TARGETS) {
    console.log(`→ ${target.file}  (${target.place})`);
    const { buffer, source } = await resolveBytes(target, usedHashes);
    const processed = await sharp(buffer)
      .rotate()
      .resize(target.w, target.h, { fit: "cover", position: "centre" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    writeFileSync(path.join(tourDir, target.file), processed);
    attribution.push(`${target.file}  ←  ${source}`);
    console.log(`  ok  ${source}`);
  }

  writeFileSync(path.join(tourDir, "classic-kashmir-triangle-ATTRIBUTION.txt"), attribution.join("\n") + "\n");
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function applyToDb() {
  const prisma = new PrismaClient();
  try {
    const cover = localAsset("tours/classic-kashmir-triangle-cover.jpg");
    if (!cover) throw new Error("Missing cover file — run without --db-only first.");

    const gallery = ["g1", "g2", "g3", "g4"]
      .map((suffix) => localAsset(`tours/classic-kashmir-triangle-${suffix}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const tour = await prisma.tour.update({
      where: { slug: "classic-kashmir-triangle" },
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

    const days = await prisma.itineraryDay.findMany({
      where: { tourId: tour.id },
      orderBy: { dayNumber: "asc" },
      select: { dayNumber: true, title: true, imageUrl: true },
    });
    console.log(JSON.stringify({ tour: tour.slug, gallery: gallery.length, days }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dbOnly = process.argv.includes("--db-only");
  if (!dbOnly) {
    await writeAssets();
  } else {
    // Ensure cover exists even in db-only by copying best local if missing.
    const cover = path.join(tourDir, "classic-kashmir-triangle-cover.jpg");
    if (!existsSync(cover)) {
      const fallback = path.join(uploads, "tours/dal-lake-mughal-gardens-cover.jpg");
      if (existsSync(fallback)) copyFileSync(fallback, cover);
    }
  }
  await applyToDb();
  console.log("Live: http://localhost:3000/tours/classic-kashmir-triangle");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
