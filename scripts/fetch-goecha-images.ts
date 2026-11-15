/**
 * Place-accurate media for Goecha La Trek (Yuksom · Dzongri · Samiti).
 * Uses known Commons File: titles + skipSearch to avoid API 429s.
 *
 *   npx tsx scripts/fetch-goecha-images.ts
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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

const agent = "WorldCompassHoliday/1.0 (goecha-la images; hi@worldcompassholiday.com)";
const slug = "goecha-la-trek";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const uploads = path.join(process.cwd(), "public", "uploads");
mkdirSync(tourDir, { recursive: true });

type Target = {
  file: string;
  dayNumber?: number;
  place: string;
  titles: string[];
  w: number;
  h: number;
};

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    place: "Kanchenjunga from Goecha La",
    titles: [
      "File:Peaks of the Kanchenjunga as seen from the West Sikkim district of Sikkim.jpg",
      "File:Kangch-Goechala.jpg",
      "File:Golden Kanchenjunga - Copy.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Yuksom panorama",
    titles: [
      "File:Panoramic view of Yuksom, West Sikkim, in India.jpg",
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 04.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Mount Pandim from Thansing",
    titles: [
      "File:Mount Pandim from Thansing DSC04063.jpg",
      "File:Pandim from Thangshing.jpg",
      "File:Mount Pandim south face.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Goechala pass",
    titles: [
      "File:Goechala pass - panoramio.jpg",
      "File:Goechala.jpg",
      "File:Abhishek532 Goechala1.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Goechala trek landscape",
    titles: [
      "File:Goechala Trek.jpg",
      "File:The burning mountain.jpg",
      "File:Abhishek532 NatureHues.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Dubdi Monastery Yuksom",
    titles: [
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 08.jpg",
      "File:Dubde alias Dubdi Monastery in Yuksom, West Sikkim 05.jpg",
      "File:Narbugong Coronation Throne near Yuksom (Gyalshing), West Sikkim 32.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "West Sikkim trail landscape",
    titles: [
      "File:West Sikkim, Sikkim, India - panoramio.jpg",
      "File:Abhishek532 NatureHues.jpg",
      "File:Goechala Trek.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Mount Pandim",
    titles: [
      "File:Mt. Pandim, Sikkim.jpg",
      "File:Mont Pandim.JPG",
      "File:Mount Pandim.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Kanchenjunga morning West Sikkim",
    titles: [
      "File:Kangchenjunga (Kanchenjunga) on morning.jpg",
      "File:Kanchenjunga Himalayas 2.jpg",
      "File:Kanchenjunga.JPG",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d5.jpg`,
    dayNumber: 5,
    place: "Kanchenjunga Pelling view",
    titles: [
      "File:Lower Pelling, West Sikkim...A Living Monument to Kanchenjunga.jpg",
      "File:Golden Kanchenjunga - Copy.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d6.jpg`,
    dayNumber: 6,
    place: "Pandim south face",
    titles: [
      "File:Mount Pandim south face.jpg",
      "File:Mount Pandim WLB IMG 1738.jpg",
      "File:Mt pandim.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d7.jpg`,
    dayNumber: 7,
    place: "Goecha La trek high section",
    titles: [
      "File:An Indian hiker at the Goecha La Trek, in West Sikkim district of Sikkim, photographed by Yogabrata Chakraborty, on October 18, 2021.jpg",
      "File:Kangch-Goechala.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d8.jpg`,
    dayNumber: 8,
    place: "Goecha La viewpoint hikers",
    titles: [
      "File:Indian hikers with country flag on hills of Goecha La Trek, in West Sikkim district of Sikkim, photographed by Yogabrata Chakraborty, on October 18, 2021.jpg",
      "File:Goechala.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d9.jpg`,
    dayNumber: 9,
    place: "Rimbi waterfall West Sikkim descent area",
    titles: [
      "File:Rimbi Waterfall Sikkim.jpg",
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 06.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d10.jpg`,
    dayNumber: 10,
    place: "Yuksom Dubdi return",
    titles: [
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 07.jpg",
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 05.jpg",
      "File:Dubde alias Dubdi Monastery in Yuksom, West Sikkim 01.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d11.jpg`,
    dayNumber: 11,
    place: "Yuksom Norbugang coronation site",
    titles: [
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 06.jpg",
      "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 05.jpg",
      "File:Norbugang Park Yuksom.jpg",
    ],
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
  if (res.status === 429) {
    await sleep(15000);
    return info(title);
  }
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

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (res.status === 429) {
    await sleep(15000);
    return download(url);
  }
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveBytes(
  target: Target,
  block: ReturnType<typeof loadOtherTourImageBlocklist>,
) {
  for (const title of target.titles) {
    if (isTitleBlocked(title, block)) continue;
    await sleep(2200);
    try {
      const meta = await info(title);
      if (!meta) continue;
      const raw = await download(meta.url);
      const hash = hashBuffer(raw);
      if (!claimSource(block, { hash, title: meta.title })) continue;
      return { buffer: raw, source: `${meta.title} (${meta.license})` };
    } catch {
      continue;
    }
  }
  throw new Error(`No unique Commons image for ${target.file} (${target.place})`);
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
      const outPath = path.join(tourDir, target.file);
      if (existsSync(outPath) && !process.argv.includes("--refresh")) {
        console.log(`→ ${target.file} (existing, skip)`);
        continue;
      }
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
    const existing = await prisma.tour.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      console.log(`(no DB row yet for ${slug} — files written; seed later)`);
      return;
    }
    const cover = localAsset(`tours/${slug}-cover.jpg`);
    if (!cover) throw new Error("Missing cover");
    const gallery = ["g1", "g2", "g3", "g4"]
      .map((s) => localAsset(`tours/${slug}-${s}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    await prisma.tour.update({
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
    });
    for (const target of TARGETS.filter((t) => t.dayNumber)) {
      const asset = localAsset(`tours/${target.file}`);
      if (!asset) continue;
      await prisma.itineraryDay.updateMany({
        where: { tourId: existing.id, dayNumber: target.dayNumber },
        data: {
          imageUrl: asset.url,
          imageKey: asset.key,
          imageDriver: asset.driver,
        },
      });
    }
    console.log(`Live: http://localhost:3000/tours/${slug}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
