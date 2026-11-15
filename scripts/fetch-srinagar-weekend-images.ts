/**
 * Place-accurate media for Srinagar Weekend Getaway.
 * Sources are exclusive to this tour — never reuse Classic / Tulip / Autumn assets.
 *
 *   npx tsx scripts/fetch-srinagar-weekend-images.ts
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
  "WorldCompassHoliday/1.0 (srinagar-weekend images; hi@worldcompassholiday.com)";
const slug = "srinagar-weekend-getaway";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const uploads = path.join(process.cwd(), "public", "uploads");
mkdirSync(tourDir, { recursive: true });

type Target = {
  file: string;
  dayNumber?: number;
  place: string;
  titles: string[];
  localFallbacks?: string[];
  w: number;
  h: number;
  skipSearch?: boolean;
};

/**
 * City-break Srinagar only — deliberately different Commons files from
 * Classic Kashmir Triangle (Empty shikara / Nishat / Shalimar / Shankaracharya).
 */
const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    place: "Dal Lake shikara evening Srinagar",
    titles: [
      "File:Shikara on Dal Lake, Srinagar, India 2013-08-23 (flickr 9967100954).jpg",
      "File:Dal lake by Ahanger HOBO.jpg",
      "File:Dal Lake Srinagar Jammu and Kashmir India.jpg",
      "File:Shikara Boats on Dal Lake.jpg",
    ],
    localFallbacks: [
      "tours/dal-lake-mughal-gardens-cover.jpg",
      "destinations/srinagar.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Pari Mahal Srinagar terrace garden",
    titles: [
      "File:Pari Mahal Srinagar.jpg",
      "File:Pari Mahal, Srinagar.jpg",
      "File:Pari Mahal.jpg",
      "File:View from Pari Mahal Srinagar.jpg",
    ],
    localFallbacks: ["destinations/srinagar-4.jpg", "destinations/srinagar-2.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Chashme Shahi Mughal garden Srinagar",
    titles: [
      "File:Chashme Shahi Gardens.jpg",
      "File:Chashme Shahi, Srinagar.jpg",
      "File:Chashma Shahi Srinagar.jpg",
      "File:Chashme Shahi.jpg",
    ],
    localFallbacks: ["destinations/srinagar-5.jpg", "tours/dal-lake-mughal-gardens-g2.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Hazratbal shrine Dal Lake",
    titles: [
      "File:Hazratbal Shrine.jpg",
      "File:Hazratbal Mosque.jpg",
      "File:Hazratbal Srinagar.jpg",
      "File:Hazratbal Dargah.jpg",
    ],
    localFallbacks: ["destinations/srinagar-2.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Nigeen Lake houseboats Srinagar",
    titles: [
      "File:Nigeen Lake.jpg",
      "File:Nigeen Lake Srinagar.jpg",
      "File:Nagin Lake Srinagar.jpg",
      "File:Houseboats on Nigeen Lake.jpg",
    ],
    localFallbacks: [
      "tours/dal-lake-mughal-gardens-g2.jpg",
      "destinations/srinagar.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 Chashme Shahi and lake",
    titles: [
      "File:Chashme Shahi Gardens Srinagar.jpg",
      "File:Chashme Shahi fountain.jpg",
      "File:Mughal Gardens Srinagar.jpg",
    ],
    localFallbacks: [
      "tours/dal-lake-mughal-gardens-g2.jpg",
      "destinations/srinagar-4.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 old city crafts Lal Chowk",
    titles: [
      "File:Lal Chowk Srinagar.jpg",
      "File:Jamia Masjid Srinagar.jpg",
      "File:Jamia Masjid, Srinagar.jpg",
      "File:Old city Srinagar.jpg",
    ],
    localFallbacks: [
      "tours/srinagar-old-city-crafts-cover.jpg",
      "tours/srinagar-old-city-crafts-g1.jpg",
      "tours/srinagar-old-city-crafts-g2.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 farewell Dal Boulevard",
    titles: [
      "File:Boulevard Road Srinagar.jpg",
      "File:Dal Lake boulevard.jpg",
      "File:Srinagar Dal Lake panorama.jpg",
    ],
    localFallbacks: ["destinations/srinagar-5.jpg", "destinations/srinagar-2.jpg"],
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
    .filter((title) => !/logo|map|flag|svg|diagram|icon|poster|stamp|sketch/i.test(title));
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveBytes(
  target: Target,
  block: ReturnType<typeof loadOtherTourImageBlocklist>,
) {
  const queue = [...target.titles];
  if (!target.skipSearch) {
    await sleep(500);
    const extras = await searchTitles(target.place.split(/[·—]/)[0].trim());
    for (const t of extras) if (!queue.includes(t)) queue.push(t);
  }
  for (const title of queue) {
    if (isTitleBlocked(title, block)) continue;
    await sleep(650);
    try {
      const meta = await info(title);
      if (!meta) continue;
      const raw = await download(meta.url);
      const hash = hashBuffer(raw);
      if (!claimSource(block, { hash, title })) continue;
      return { buffer: raw, source: `${title} (${meta.license})` };
    } catch {
      continue;
    }
  }
  for (const rel of target.localFallbacks ?? []) {
    const file = path.join(uploads, rel);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file);
    const hash = hashBuffer(raw);
    if (!claimSource(block, { hash })) continue;
    return { buffer: raw, source: `local:${rel}` };
  }
  throw new Error(`No unique image for ${target.file}`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

async function main() {
  const block = loadOtherTourImageBlocklist(tourDir, slug);
  console.log(
    `Blocklist: ${block.hashes.size} other-tour hashes, ${block.titles.size} Commons titles`,
  );
  const attribution: string[] = [`# ${slug} ${new Date().toISOString()}`, ""];

  if (!process.argv.includes("--db-only")) {
    for (const target of TARGETS) {
      console.log(`→ ${target.file}`);
      const { buffer, source } = await resolveBytes(target, block);
      const processed = await sharp(buffer)
        .rotate()
        .resize(target.w, target.h, { fit: "cover", position: "centre" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
      // Also claim processed bytes so resized clones of other tours cannot slip through
      claimSource(block, { hash: hashBuffer(processed) });
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
