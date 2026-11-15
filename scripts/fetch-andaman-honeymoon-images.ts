/**
 * Place-accurate media for Andaman Island Honeymoon.
 *
 *   npx tsx scripts/fetch-andaman-honeymoon-images.ts
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
  "WorldCompassHoliday/1.0 (andaman-honeymoon images; hi@worldcompassholiday.com)";
const slug = "andaman-island-honeymoon";
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
    place: "Radhanagar Beach Havelock Andaman",
    titles: [
      "File:Havelock Island, Radhanagar Beach before sunset, Andaman Islands.jpg",
      "File:Havelock Island, Radhanagar Beach sunset, Andaman Islands.jpg",
      "File:Radhanagar Beach Havelock vrvbaan042k24 (4).jpg",
      "File:Havelock Island, Radhanagar Beach, tropical bliss, Andaman Islands.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Corbyn Cove Port Blair Andaman",
    titles: [
      "File:Corbyns cove beach-1-port blair-andaman-India.jpg",
      "File:Corbyns cove beach-3-port blair-andaman-India.jpg",
      "File:Corbyn's Cove beach Port Blair.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Port Blair harbour Andaman",
    titles: [
      "File:Port Blair harbour Andaman.jpg",
      "File:Cellular Jail, Andaman, Port Blair, India.jpg",
      "File:Front View of Cellular Jail, Port Blair.JPG",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Elephant Beach Havelock snorkel",
    titles: [
      "File:Elephant beach, Havelock Island.jpg",
      "File:Snorkeling at Elephant beach, Havelock Island,Andaman.jpg",
      "File:Havelock Island, Sandy lagoon, Andaman Islands.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Havelock coral beach Andaman",
    titles: [
      "File:Havelock Island, Mangrove tree on the beach, Andaman Islands.jpg",
      "File:Kala Patthar beach in Havelock. Andaman and Nicobar Islands.jpg",
      "File:Beautiful beach in Havelock Island, Andaman.JPG",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 Port Blair arrive",
    titles: [
      "File:Closer view of a cell of Cellular Jail, Port Blair, India.jpg",
      "File:Cellular Jail, Andaman & Nicobar, Port Blair, India, night view.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 ferry Havelock Vijay Nagar",
    titles: [
      "File:Havelock Island, Vijaynagar Beach, Andaman Islands.jpg",
      "File:Andaman beach Havelock Island 02.jpg",
      "File:Havelock Island, Radhanagar Beach, Andaman Islands.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 Radhanagar Beach No 7",
    titles: [
      "File:Radhanagar Beach Havelock vrvbaan042k24 (11).jpg",
      "File:Radhanagar Beach Havelock vrvbaan042k24 (9).jpg",
      "File:Trees around Radhanagar Beach Havelock vrvbaan042k24 (11).jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Day 4 Chidiyatapu sunset Port Blair",
    titles: [
      "File:Chidiyatapu sunset.jpg",
      "File:Chidiya Tapu Andaman Nicobar.jpg",
      "File:Munda Pahar Beach Chidiyatapu.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    dayNumber: 5,
    place: "Day 5 Port Blair IXZ departure",
    titles: [
      "File:Port Blair Airport runway..JPG",
      "File:Veer Savarkar International Airport – New Terminal.jpg",
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