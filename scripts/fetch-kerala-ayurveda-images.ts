/**
 * Place-accurate media for Kerala Ayurveda Wellness Retreat.
 *
 *   npx tsx scripts/fetch-kerala-ayurveda-images.ts
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
  "WorldCompassHoliday/1.0 (kerala-ayurveda-wellness images; hi@worldcompassholiday.com)";
const slug = "kerala-ayurveda-wellness-retreat";
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

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    place: "Ayurveda massage Kerala wellness",
    titles: [
      "File:Ayurvedic massage at Kerala.jpg",
      "File:Ayurveda massage Kerala.jpg",
      "File:Ayurvedic Spa Kerala.jpg",
      "File:Shirodhara Ayurveda treatment.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Marari beach Kerala resort",
    titles: [
      "File:Marari Beach Sunset 01.JPG",
      "File:Sunset from Mararikulam beach, Kerala, India.jpg",
      "File:Mararikulam Beach 2.jpg",
      "File:Olappura at Marari beach 03.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Ayurveda herbs Kerala",
    titles: [
      "File:Ayurvedic herbs.jpg",
      "File:Ayurvedic medicinal plants Kerala.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Yoga session Kerala backwaters",
    titles: [
      "File:Elephant pass Yoga and ayurveda retreat kerala.jpg",
      "File:Kerala ayurveda resort and yoga retreat- Elephant Pass Ayurveda.jpg",
      "File:Elephant pass ayurveda and yoga retreat kerala Ayurveda resort kerala.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Kerala backwater canoe sunset",
    titles: [
      "File:Backwater canoe (4225507958).jpg",
      "File:Rowing a backwater canoe (4232215825).jpg",
      "File:Single man backwater canoe (4231302512).jpg",
    ],
    skipSearch: true,
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 wellness resort arrival",
    titles: [
      "File:Ayurveda resort in Kerala.jpg",
      "File:Ayurveda retreat resort in Kerala.jpg",
      "File:Ayurveda resort and health center in kerala - elephant pass ayurveda resort.jpg",
    ],
    skipSearch: true,
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 abhyanga therapy",
    titles: [
      "File:Ayurveda Tips 05.jpg",
      "File:Dhanvantari-at-Ayurveda-expo.jpg",
      "File:Sadananda vaidyasala2.jpg",
      "File:Ayurveda.jpg",
    ],
    skipSearch: true,
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 meditation garden",
    titles: [
      "File:Kerala ayurveda resort and yoga retreat- Elephant Pass Ayurveda.jpg",
      "File:Ayurveda resort kerala- Elephant Pass Ayurveda kerala.jpg",
    ],
    skipSearch: true,
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Day 4 backwater canoe",
    titles: [
      "File:Kerala backwater 20080218-11.jpg",
      "File:Boatman on Backwaters of Kerala - India.JPG",
      "File:Kerala Backwater Fishing.jpg",
    ],
    skipSearch: true,
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    dayNumber: 5,
    place: "Day 5 consultation closing",
    titles: [
      "File:Baskaravilasam ayurvedic Hospital at Nedumangad.jpg",
      "File:Government Ayurvedic College & Hospital,Gauhati.jpg",
      "File:Ayurvedic Research Hospital.jpg",
    ],
    skipSearch: true,
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d6.jpg`,
    dayNumber: 6,
    place: "Day 6 Kochi departure",
    titles: [
      "File:Sun rise view Alleppey backwaters , Kerala 01.jpg",
      "File:Sun rise view Alleppey backwaters , Kerala 02.jpg",
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
