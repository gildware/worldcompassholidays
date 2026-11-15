/**
 * Pass 2 — kill remaining maps / wrong-place / off-season slots.
 * Commons photos only; reject maps, historical charts, unrelated valleys.
 *
 *   npx tsx scripts/fix-batch1-place-images-pass2.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import {
  claimSource,
  hashBuffer,
  isTitleBlocked,
  loadOtherTourImageBlocklist,
} from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (batch1 place-image pass2; hi@worldcompassholiday.com)";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const uploads = path.join(process.cwd(), "public", "uploads");
mkdirSync(tourDir, { recursive: true });

type Slot = {
  slug: string;
  file: string;
  dayNumber?: number;
  place: string;
  queries: string[];
  titles: string[];
  requireAll?: string[];
  requireAny: string[];
  reject: RegExp;
  w: number;
  h: number;
};

const SLOTS: Slot[] = [
  {
    slug: "family-snow-gulmarg-special",
    file: "family-snow-gulmarg-special-d1.jpg",
    dayNumber: 1,
    place: "Srinagar winter snowfall city photo",
    queries: [
      "Srinagar snowfall photograph",
      "Snow covered Srinagar Kashmir",
      "Dal Lake snow photograph",
      "Srinagar winter landscape photo",
    ],
    titles: [
      "File:Snowfall in Srinagar.jpg",
      "File:Srinagar snowfall.jpg",
      "File:Heavy snowfall in Srinagar.jpg",
      "File:Dal Lake covered with snow.jpg",
      "File:Winter in Srinagar.jpg",
    ],
    requireAny: ["srinagar", "dal lake", "snowfall"],
    reject: /\bmap\b|1846|british|district|locator|painting|chart|sketch|\.png$/i,
    w: 1400,
    h: 933,
  },
  {
    slug: "family-snow-gulmarg-special",
    file: "family-snow-gulmarg-special-g2.jpg",
    place: "Gulmarg snow covered ski slope winter",
    queries: [
      "Gulmarg snow covered",
      "Gulmarg skiing snow photo",
      "Gulmarg winter snow meadow",
      "Skiers Gulmarg Kashmir",
      "Gulmarg white snow",
    ],
    titles: [
      "File:Skiing Gulmarg.jpg",
      "File:Gulmarg ski slopes.jpg",
      "File:Snow at Gulmarg.jpg",
      "File:Gulmarg under snow.jpg",
      "File:Winter sports Gulmarg.jpg",
      "File:Gulmarg January snow.jpg",
    ],
    requireAny: ["gulmarg"],
    requireAll: [],
    reject: /\bmap\b|green meadow|summer|1846|\.png$/i,
    w: 1600,
    h: 1067,
  },
  {
    slug: "gurez-keran-valley-explorer",
    file: "gurez-keran-valley-explorer-d5.jpg",
    dayNumber: 5,
    place: "Gurez valley landscape photograph Kashmir",
    queries: [
      "Gurez Valley landscape photograph",
      "Dawar Gurez village photo",
      "Habba Khatoon Gurez photo",
      "Kishanganga river Gurez photo",
      "Gurez mountains Kashmir photo",
    ],
    titles: [
      "File:Gurez Valley 02.jpg",
      "File:Gurez Valley 03.jpg",
      "File:Gurez Valley 05.jpg",
      "File:Dawar village Gurez.jpg",
      "File:Habba Khatoon Gurez.jpg",
      "File:Kishanganga in Gurez.jpg",
    ],
    requireAny: ["gurez", "dawar", "habba khatoon", "kishanganga"],
    reject: /\bmap\b|district|locator|kupwara|bandipora district|\.png$|1846/i,
    w: 1400,
    h: 933,
  },
  {
    slug: "tulian-lake-trek",
    file: "tulian-lake-trek-g4.jpg",
    place: "Pahalgam Baisaran meadow Kashmir photograph",
    queries: [
      "Baisaran meadow Pahalgam",
      "Mini Switzerland Pahalgam",
      "Aru Valley Pahalgam meadow",
      "Pahalgam highland meadow photo",
    ],
    titles: [
      "File:Baisaran.jpg",
      "File:Baisaran Pahalgam.jpg",
      "File:Baisaran Meadow.jpg",
      "File:Mini Switzerland of India Pahalgam.jpg",
      "File:Aru Pahalgam.jpg",
    ],
    requireAny: ["baisaran", "pahalgam", "aru"],
    reject: /sonamarg|thajiwas|gulmarg|daksum|california|nepal|\.png$|\bmap\b/i,
    w: 1600,
    h: 1067,
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function titleOk(title: string, slot: Slot) {
  if (slot.reject.test(title)) return false;
  const lower = title.toLowerCase();
  if (slot.requireAll?.length && !slot.requireAll.every((k) => lower.includes(k.toLowerCase()))) {
    return false;
  }
  return slot.requireAny.some((k) => lower.includes(k.toLowerCase()));
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
  const mime = String(ii?.mime || "");
  if (!ii?.url || !mime.startsWith("image/") || mime.includes("svg") || mime.includes("png")) {
    return null;
  }
  if (String(ii.extmetadata?.LicenseShortName?.value || "").toLowerCase().includes("nc")) {
    return null;
  }
  if ((ii.width || 0) > 0 && (ii.width || 0) < 700) return null;
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
  u.searchParams.set("srlimit", "20");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter(
      (title) =>
        !/logo|\bmap\b|flag|svg|diagram|icon|poster|stamp|sketch|modis|satellite|1846|locator|district\.png|\.png$/i.test(
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

async function resolveSlot(
  slot: Slot,
  block: ReturnType<typeof loadOtherTourImageBlocklist>,
) {
  const queue = [...slot.titles];
  for (const q of [slot.place, ...slot.queries]) {
    await sleep(350);
    for (const t of await searchTitles(q)) {
      if (!queue.includes(t)) queue.push(t);
    }
  }
  for (const title of queue) {
    if (!titleOk(title, slot)) continue;
    if (isTitleBlocked(title, block)) continue;
    await sleep(500);
    try {
      const meta = await info(title);
      if (!meta || !titleOk(meta.title, slot)) continue;
      const raw = await download(meta.url);
      const hash = hashBuffer(raw);
      if (!claimSource(block, { hash, title: meta.title })) continue;
      return { buffer: raw, source: `${meta.title} (${meta.license})` };
    } catch {
      continue;
    }
  }
  throw new Error(`No place photo for ${slot.file}`);
}

function patchAttribution(slug: string, file: string, source: string) {
  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  const lines = existsSync(attrPath)
    ? readFileSync(attrPath, "utf8").split("\n")
    : [`# ${slug} ${new Date().toISOString()}`, ""];
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(`${file}  ←`)) {
      found = true;
      return `${file}  ←  ${source}`;
    }
    return line;
  });
  if (!found) next.push(`${file}  ←  ${source}`);
  writeFileSync(attrPath, next.join("\n").replace(/\n+$/, "\n"));
}

async function main() {
  const bySlug = new Map<string, Slot[]>();
  for (const slot of SLOTS) {
    const list = bySlug.get(slot.slug) ?? [];
    list.push(slot);
    bySlug.set(slot.slug, list);
  }

  for (const [slug, slots] of bySlug) {
    console.log(`\n==== ${slug} ====`);
    const block = loadOtherTourImageBlocklist(tourDir, slug);
    for (const slot of slots) {
      console.log(`→ ${slot.file}`);
      const { buffer, source } = await resolveSlot(slot, block);
      const processed = await sharp(buffer)
        .rotate()
        .resize(slot.w, slot.h, { fit: "cover", position: "centre" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
      claimSource(block, { hash: hashBuffer(processed) });
      writeFileSync(path.join(tourDir, slot.file), processed);
      patchAttribution(slug, slot.file, source);
      console.log(`  ok  ${source}`);
    }

    const prisma = new PrismaClient();
    try {
      const tour = await prisma.tour.findUnique({ where: { slug }, select: { id: true } });
      if (!tour) continue;
      for (const slot of slots.filter((s) => s.dayNumber)) {
        const key = `tours/${slot.file}`;
        const file = path.join(uploads, key);
        if (!existsSync(file)) continue;
        await prisma.itineraryDay.updateMany({
          where: { tourId: tour.id, dayNumber: slot.dayNumber },
          data: {
            imageUrl: `/uploads/${key}`,
            imageKey: key,
            imageDriver: "local",
          },
        });
      }
      // refresh gallery if g2 fixed
      if (slots.some((s) => s.file.includes("-g"))) {
        const coverKey = `tours/${slug}-cover.jpg`;
        const coverPath = path.join(uploads, coverKey);
        if (existsSync(coverPath)) {
          const gallery = ["g1", "g2", "g3", "g4"]
            .map((s) => {
              const key = `tours/${slug}-${s}.jpg`;
              if (!existsSync(path.join(uploads, key))) return null;
              return { url: `/uploads/${key}`, key, driver: "local" as const };
            })
            .filter((x): x is NonNullable<typeof x> => Boolean(x));
          await prisma.tour.update({
            where: { slug },
            data: {
              galleryJson: JSON.stringify(gallery),
            },
          });
        }
      }
      console.log(`  DB · http://localhost:3000/tours/${slug}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
