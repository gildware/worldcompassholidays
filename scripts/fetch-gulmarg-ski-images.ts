/**
 * Winter / ski place-accurate media for Gulmarg Beginner Ski Package.
 * Prefers snow scenes; rejects lush-green summer meadow shots via cold-pixel score.
 *
 *   npx tsx scripts/fetch-gulmarg-ski-images.ts
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (gulmarg-ski images; hi@worldcompassholiday.com)";
const slug = "gulmarg-beginner-ski-package";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const uploads = path.join(process.cwd(), "public", "uploads");
mkdirSync(tourDir, { recursive: true });

type Target = {
  file: string;
  dayNumber?: number;
  place: string;
  titles: string[];
  queries?: string[];
  localFallbacks?: string[];
  w: number;
  h: number;
  /** Require snow/winter look (default true). */
  requireSnow?: boolean;
};

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    place: "Gulmarg snow skiing cover",
    titles: [
      "File:Gulmarg skiing.jpg",
      "File:Skiing in Gulmarg.jpg",
      "File:Gulmarg ski resort snow.jpg",
      "File:Gulmarg in winter.jpg",
      "File:Gulmarg snow.jpg",
    ],
    queries: ["Gulmarg skiing snow", "Gulmarg winter snow ski"],
    localFallbacks: [
      "tours/gulmarg-gondola-meadows-g1.jpg",
      "destinations/gulmarg-2.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Gulmarg gondola winter",
    titles: [
      "File:Gulmarg Gondola winter.jpg",
      "File:Gulmarg Cable Car snow.jpg",
      "File:Gulmarg Gondola.jpg",
    ],
    queries: ["Gulmarg gondola snow", "Gulmarg cable car winter"],
    localFallbacks: ["tours/gulmarg-gondola-meadows-cover.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Gulmarg meadow snow",
    titles: [
      "File:Gulmarg snow meadow.jpg",
      "File:Gulmarg in January.jpg",
      "File:Snow at Gulmarg.jpg",
    ],
    queries: ["Gulmarg snow landscape", "Gulmarg winter meadow"],
    localFallbacks: ["destinations/gulmarg-5.jpg", "destinations/gulmarg-3.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Skiers on Gulmarg slope",
    titles: [
      "File:Skiers Gulmarg.jpg",
      "File:Skiing Gulmarg Kashmir.jpg",
      "File:Beginner ski Gulmarg.jpg",
    ],
    queries: ["skiing Gulmarg Kashmir", "ski slope Gulmarg"],
    localFallbacks: ["destinations/gulmarg-4.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Apharwat or Kongdori snow",
    titles: [
      "File:Apharwat Peak Gulmarg.jpg",
      "File:Kongdori Gulmarg.jpg",
      "File:Gulmarg Phase 2 gondola.jpg",
    ],
    queries: ["Apharwat Gulmarg snow", "Kongdori Gulmarg"],
    localFallbacks: ["destinations/gulmarg.jpg"],
    requireSnow: false,
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 drive Tangmarg Gulmarg snow",
    titles: [
      "File:Tangmarg snow.jpg",
      "File:Road to Gulmarg winter.jpg",
      "File:Gulmarg in winter.jpg",
    ],
    queries: ["Tangmarg Kashmir snow", "road to Gulmarg winter"],
    localFallbacks: ["destinations/tangmarg.jpg", "destinations/gulmarg-2.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 beginner ski lesson",
    titles: [
      "File:Skiing in Gulmarg.jpg",
      "File:Gulmarg skiing.jpg",
      "File:Ski school Gulmarg.jpg",
    ],
    queries: ["Gulmarg ski lesson", "skiing beginners Gulmarg"],
    localFallbacks: ["destinations/gulmarg-5.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 gondola snow views",
    titles: [
      "File:Gulmarg Gondola.jpg",
      "File:Gulmarg Cable Car.JPG",
      "File:Gulmarg gondola snow.jpg",
    ],
    queries: ["Gulmarg gondola winter snow"],
    localFallbacks: ["tours/gulmarg-gondola-meadows-g1.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Day 4 departure snow road",
    titles: [
      "File:Gulmarg snow.jpg",
      "File:Leaving Gulmarg winter.jpg",
    ],
    queries: ["Gulmarg winter road snow"],
    localFallbacks: ["destinations/tangmarg-2.jpg", "destinations/srinagar-3.jpg"],
    requireSnow: false,
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
  u.searchParams.set("srlimit", "12");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter(
      (title) =>
        !/logo|map|flag|svg|diagram|icon|poster|stamp|sketch|summer.?meadow|green.?golf/i.test(
          title,
        ),
    );
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Positive when snow/white-cold dominates lush green. */
async function snowScore(buf: Buffer) {
  const { data } = await sharp(buf)
    .resize(160, 100, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let snow = 0;
  let green = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    total += 1;
    if (r > 180 && g > 180 && b > 180 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) snow += 1;
    if (g > r + 18 && g > b + 18 && g > 70) green += 1;
  }
  return snow / total - green / total;
}

async function resolveBytes(target: Target, used: Set<string>) {
  const queue = [...target.titles];
  for (const q of target.queries ?? []) {
    await sleep(600);
    for (const t of await searchTitles(q)) if (!queue.includes(t)) queue.push(t);
  }

  const requireSnow = target.requireSnow !== false;
  let best: { buffer: Buffer; source: string; score: number } | null = null;

  for (const title of queue) {
    await sleep(650);
    try {
      const meta = await info(title);
      if (!meta) continue;
      const raw = await download(meta.url);
      const hash = createHash("sha1").update(raw).digest("hex");
      if (used.has(hash)) continue;
      const score = await snowScore(raw);
      if (requireSnow && score < 0.0) {
        console.log(`  skip green ${title} score=${score.toFixed(3)}`);
        continue;
      }
      if (!best || score > best.score) {
        best = {
          buffer: raw,
          source: `${title} (${meta.license}) score=${score.toFixed(3)}`,
          score,
        };
      }
      if (score >= 0.05 || (!requireSnow && score > -0.2)) {
        used.add(hash);
        return best;
      }
    } catch {
      continue;
    }
  }

  if (best && (!requireSnow || best.score >= -0.02)) {
    used.add(createHash("sha1").update(best.buffer).digest("hex"));
    return best;
  }

  for (const rel of target.localFallbacks ?? []) {
    const file = path.join(uploads, rel);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file);
    const hash = createHash("sha1").update(raw).digest("hex");
    if (used.has(hash)) continue;
    const score = await snowScore(raw);
    if (requireSnow && score < -0.05) continue;
    used.add(hash);
    return { buffer: raw, source: `local:${rel} score=${score.toFixed(3)}`, score };
  }
  throw new Error(`No winter image for ${target.file}`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function main() {
  const used = new Set<string>();
  const attribution: string[] = [`# ${slug} ${new Date().toISOString()}`, ""];

  if (!process.argv.includes("--db-only")) {
    for (const target of TARGETS) {
      console.log(`→ ${target.file}`);
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
      select: { id: true },
    });
    for (const target of TARGETS.filter((t) => t.dayNumber)) {
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
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Live: http://localhost:3000/tours/${slug}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
