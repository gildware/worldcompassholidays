/**
 * Place-accurate media for Manali–Leh Bike Trip.
 *
 *   npx tsx scripts/fetch-manali-leh-bike-images.ts
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
  "WorldCompassHoliday/1.0 (manali-leh-bike images; hi@worldcompassholiday.com)";
const slug = "manali-leh-bike-trip";
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
    place: "intitle:motorcycle Ladakh",
    titles: [
      "File:Ladakh motorcycling.jpg",
      "File:Royal Enfield Bullet 350 Classic, Leh-Manali Highway.jpg",
      "File:Man on a motorcycle in Ladakh.jpg",
      "File:A ride to roof of the world.jpg",
      "File:Bike riding In Ladakh, India.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg", "destinations/manali.jpg"],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: 'motorcycle "Leh-Manali"',
    titles: [
      "File:Royal Enfield Bullet 500, Leh-Manali Highway.jpg",
      "File:Royal Enfield Bullet 350 Classic, Leh-Manali Highway.jpg",
      "File:Highway To Thrill (233024297).jpeg",
      "File:Easyrider. - Flickr - Simon Berger - austria.jpg",
      "File:Zingzing Bar.jpg",
    ],
    localFallbacks: ["destinations/manali.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "intitle:bike Ladakh",
    titles: [
      "File:Bike riding In Ladakh, India.jpg",
      "File:Pangong biking.jpg",
      "File:Bikers Shingo La Ri Zanskar Lahaul Oct22 A7C 03541.jpg",
      "File:Bikers Gonbo Rangjon Zanskar Oct22 A7C 03594.jpg",
      "File:Bike trip.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "intitle:motorcycle Ladakh",
    titles: [
      "File:Man on a motorcycle in Ladakh.jpg",
      "File:Ladakh motorcycling.jpg",
      "File:A ride to roof of the world.jpg",
      "File:Pangong biking.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "bikers Ladakh motorcycle highway",
    titles: [
      "File:Bikers Shingo La Ri Zanskar Lahaul Oct22 A7C 03541.jpg",
      "File:Bikers Gonbo Rangjon Zanskar Oct22 A7C 03594.jpg",
      "File:Bikers Snow Clearance Shinko La Lungnak Jun24 A7CR 00325.jpg",
      "File:Highway To Thrill (233024297).jpeg",
      "File:Easyrider. - Flickr - Simon Berger - austria.jpg",
    ],
    localFallbacks: ["destinations/nubra.jpg", "destinations/ladakh.jpg"],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 Manali Solang valley motorcycle",
    titles: [
      "File:Royal Enfield Bullet 350 Classic, Leh-Manali Highway.jpg",
      "File:Solang Valley Manali.jpg",
      "File:Solang valley.jpg",
      "File:Solang Nullah Manali.jpg",
    ],
    localFallbacks: ["destinations/manali.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 Rohtang Lahaul motorcycle road",
    titles: [
      "File:A ride to roof of the world.jpg",
      "File:Zingzing Bar.jpg",
      "File:Lahaul valley.jpg",
      "File:Keylong Lahaul.jpg",
    ],
    localFallbacks: ["destinations/himachal.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 Baralacha Sarchu motorcycle plateau",
    titles: [
      "File:Highway To Thrill (233024297).jpeg",
      "File:Easyrider. - Flickr - Simon Berger - austria.jpg",
      "File:Sarchu Ladakh.jpg",
      "File:Baralacha La landscape.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Day 4 Tanglang La motorcycle Leh",
    titles: [
      "File:Royal Enfield Bullet 500, Leh-Manali Highway.jpg",
      "File:Tanglang La.jpg",
      "File:Tanglangla pass.jpg",
      "File:Leh Ladakh market.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    dayNumber: 5,
    place: "Day 5 Thiksey monastery Leh",
    titles: [
      "File:Thiksey Monastery.jpg",
      "File:Thiksey monastery Ladakh.jpg",
      "File:Shanti Stupa Leh.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d6.jpg`,
    dayNumber: 6,
    place: "Day 6 Nubra motorcycle dunes",
    titles: [
      "File:Bike riding In Ladakh, India.jpg",
      "File:Man on a motorcycle in Ladakh.jpg",
      "File:Hunder sand dunes.jpg",
      "File:Hunder Nubra Valley.jpg",
    ],
    localFallbacks: ["destinations/nubra.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d7.jpg`,
    dayNumber: 7,
    place: "Pangong biking shore camp",
    titles: [
      "File:Pangong biking.jpg",
      "File:Pangong Lake in Ladakh at Sunrise.jpg",
      "File:Spangmik Pangong Lake.jpg",
      "File:Lukung Pangong Tso.jpg",
    ],
    localFallbacks: ["destinations/sinthan-top.jpg", "destinations/nubra.jpg"],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d8.jpg`,
    dayNumber: 8,
    place: "Day 8 Leh palace departure",
    titles: [
      "File:Leh Palace.jpg",
      "File:Leh Palace Ladakh.jpg",
      "File:Leh airport Ladakh.jpg",
    ],
    localFallbacks: ["destinations/ladakh.jpg"],
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
