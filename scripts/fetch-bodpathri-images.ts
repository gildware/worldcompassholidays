/**
 * Place-accurate media for Bodpathri Meadows Trek (Doodhpathri / Yusmarg).
 *
 *   npx tsx scripts/fetch-bodpathri-images.ts
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

const agent =
  "WorldCompassHoliday/1.0 (bodpathri-meadows images; hi@worldcompassholiday.com)";
const slug = "bodpathri-meadows-trek";
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
  skipSearch?: boolean;
};

const TITLE_REJECT =
  /logo|map|flag|svg|diagram|icon|poster|stamp|sketch|california|MODIS|modis|1846|locator|district\.png/i;

const TARGETS: Target[] = [
  {
    file: `${slug}-cover.jpg`,
    place: "Doodhpathri meadow valley Kashmir",
    titles: [
      "File:Meadows and Forests Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:Virgin valley Doud pather.jpg",
      "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
    ],
    w: 1920,
    h: 1080,
  },
  {
    file: `${slug}-g1.jpg`,
    place: "Yusmarg meadow Kashmir grassland",
    titles: [
      "File:Yousmarg.jpg",
      "File:Nilnag Lake.jpg",
      "File:Yusmarg - the magnificent Doodh Ganga.jpg",
      "File:Doodh Ganga river Yusmarg.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g2.jpg`,
    place: "Doodhpathri lush meadows Budgam",
    titles: [
      "File:Doodhpathri - A dirt road goes through the many meadows southwest Jammu Kashmir India.jpg",
      "File:Doodh Patthri, Kashmir.jpg",
      "File:A Rural Road towards Doodhpathri from Magam Jammu Kashmir India May 2014.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g3.jpg`,
    place: "Doodhpathri forest stream Kashmir",
    titles: [
      "File:River stream near Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:Doude pather meadows upper.jpg",
      "File:Doodhpathri southwest Jammu Kashmir India (7).jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-g4.jpg`,
    place: "Sheep horses Doodhpathri meadow",
    titles: [
      "File:A view of sheep and horses in Doodhpathri southwest Jammu Kashmir India.jpg",
      "File:Trancendent.jpg",
      "File:Doude pather upper view.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: `${slug}-d1.jpg`,
    dayNumber: 1,
    place: "Day 1 Srinagar drive Doodhpathri",
    titles: [
      "File:Dal Lake Hazratbal Srinagar.jpg",
      "File:Mughal era architecture inside of the Shalimar Bagh, Srinagar.jpg",
      "File:Zabarwan Range from Shalimar Bagh.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d2.jpg`,
    dayNumber: 2,
    place: "Day 2 Bodpathri meadow camp bowl",
    titles: [
      "File:Doodhpathri - pony riding across the meadows southwest Jammu Kashmir India.jpg",
      "File:Meadows and Forests Doodhpathri southwest Jammu Kashmir India.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d3.jpg`,
    dayNumber: 3,
    place: "Day 3 meadow loop Doodhpathri return",
    titles: [
      "File:Doude pather upper view.jpg",
      "File:Doude pather meadows upper.jpg",
      "File:Doodh Patthri, Kashmir.jpg",
      "File:Trancendent.jpg",
      "File:A Rural Road towards Doodhpathri from Magam Jammu Kashmir India May 2014.jpg",
    ],
    w: 1400,
    h: 933,
  },
  {
    file: `${slug}-d4.jpg`,
    dayNumber: 4,
    place: "Day 4 Srinagar departure airport",
    titles: [
      "File:Srinagar International Airport.jpg",
      "File:Sheikh ul Alam International Airport Srinagar.jpg",
      "File:Dal Lake, Srinagar at Dusk.jpg",
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
  throw new Error(`No unique Commons image for ${target.file}`);
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