/**
 * Place-accurate media for Kerala Family Getaway.
 *
 *   npx tsx scripts/fetch-kerala-family-images.ts
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

const agent = "WorldCompassHoliday/1.0 (kerala-family images; hi@worldcompassholiday.com)";
const slug = "kerala-family-getaway";
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

const TITLE_REJECT = /logo|map|flag|svg|diagram|icon|poster|stamp|sketch|california|MODIS|modis|nepal/i;

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    place: "Cheeyappara waterfall Munnar Kerala",
    titles: [
      "File:Cheeyappara Waterfalls, Kerala (2017).jpg",
      "File:Cheeyappara Waterfalls 04.jpg",
      "File:Cheeyappara Waterfalls Adimaly kerala.jpg",
      "File:Cheeyappara Falls in 2021.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Panoramic Mattupetty Dam Munnar",
    titles: [
      "File:Panoramic View of Mattupetty Dam, Munnar, Kerala, India.jpg",
      "File:Mattupetty Dam reservoir, Munnar (19).jpg",
      "File:Mattupetty Dam Munnar Idukki (259373420).jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Tata Tea Museum Munnar plantation",
    titles: [
      "File:Tata Tea Museum Munnar.jpg",
      "File:Kanan Devan Hills Plantation Munnar.jpg",
      "File:Tea plantations in Munnar (2).jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Periyar National Park boat Thekkady",
    titles: [
      "File:Periyar National Park-Thekkady Lake - Jalakanyaka-WUS07796.jpg",
      "File:Periyar National Park 2019.jpg",
      "File:Herd of bisons in Thekkady, Kerala.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Alleppey houseboat day cruise family",
    titles: [
      "File:Houseboat on Alleppey backwaters (Kerala, India 2023) (52703799667).jpg",
      "File:Houseboat on Alleppey backwaters (Kerala, India 2023) (52704323376).jpg",
      "File:House Boat in morning, Alappuzha, Kerala.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 Fort Kochi fishing nets",
    titles: [
      "File:Fort Kochi - St. Francis Church.jpg",
      "File:Fort Kochi - Fisher - 1.jpg",
      "File:St. Francis Church, Fort Kochi, Kerala.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 Cheeyappara drive Munnar",
    titles: [
      "File:Cheeyappara Waterfalls 01.jpg",
      "File:Cheeyappara Waterfalls down Adimaly kerala.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 Munnar Mattupetty viewpoints",
    titles: [
      "File:Mattupetty Dam, Munnar views (35).jpg",
      "File:Top Station Munnar view.jpg",
      "File:Munnar - Tea plantations (21273017559).jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Day 4 Thekkady spice Periyar",
    titles: [
      "File:Spice plantation Thekkady Kerala.jpg",
      "File:Periyar National Park-WUS07729.jpg",
      "File:Thekkady Forest Trek.JPG",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    dayNumber: 5,
    place: "Day 5 Alleppey houseboat lagoon",
    titles: [
      "File:Sunset at Alleppey backwaters.3.jpg",
      "File:Alleppey kerala.jpg",
      "File:Alleppey backwaters view , Kerala , India 11.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d6.jpg`,
    dayNumber: 6,
    place: "Day 6 Cochin airport departure",
    titles: [
      "File:Cochin international airport terminal.jpg",
      "File:Cochin International Airport Gate.jpg",
    ],
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
  u.searchParams.set("srlimit", "12");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter((title) => !TITLE_REJECT.test(title));
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
    if (TITLE_REJECT.test(title) || isTitleBlocked(title, block)) continue;
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
      claimSource(block, { hash: hashBuffer(processed) });
      writeFileSync(path.join(tourDir, target.file), processed);
      attribution.push(`${target.file}  ←  ${source}`);
      console.log(`  ok  ${source}`);
    }
    writeFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), attribution.join("\n") + "\n");
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.tour.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) {
      console.log("Skip DB: tour not seeded yet");
      console.log(`Media ready: /uploads/tours/${slug}-cover.jpg`);
      return;
    }
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