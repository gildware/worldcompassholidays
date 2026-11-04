/**
 * Download CC-licensed destination / hotel-style photos from Wikimedia Commons
 * into public/uploads/hotels/{slug}-cover.jpg and -g1…-g4.jpg, then point DB rows.
 *
 *   node scripts/fetch-hotel-photos.mjs
 *   node scripts/fetch-hotel-photos.mjs --force
 *
 * Official hotel website galleries are copyrighted — this script only uses
 * freely licensed Commons media that match each property’s place and vibe.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const { kashmirHotels } = require("../src/lib/demo/kashmir-hotels.ts");

const prisma = new PrismaClient();
const force = process.argv.includes("--force");
const outDir = path.join(process.cwd(), "public", "uploads", "hotels");
const agent = "WorldCompassHoliday/1.0 (hotel catalog; local travel site)";
const usedUrls = new Set();

const placeQueries = {
  srinagar: [
    "Dal Lake Srinagar hotel",
    "Srinagar hotel exterior",
    "Srinagar Kashmir hotel lobby",
    "hotel bedroom Kashmir",
    "Srinagar restaurant dining",
    "Hyderpora Srinagar",
    "Dalgate Srinagar",
  ],
  gulmarg: [
    "Gulmarg hotel",
    "Gulmarg resort Kashmir",
    "Gulmarg meadow hotel snow",
    "mountain hotel Kashmir pines",
    "Gulmarg gondola hotel",
    "Tangmarg Kashmir",
    "hotel room mountain view Kashmir",
  ],
  pahalgam: [
    "Pahalgam hotel",
    "Pahalgam Lidder river resort",
    "Pahalgam Kashmir hotel exterior",
    "mountain resort Pahalgam",
    "hotel balcony Kashmir valley",
    "Pahalgam pine forest hotel",
    "riverside hotel Kashmir",
  ],
};

function freeLicense(name = "") {
  const value = name.toLowerCase();
  if (value.includes("non-commercial") || value.includes("noncommercial") || value.includes("-nc")) {
    return false;
  }
  return /cc0|public domain|cc by|cc-by|gfdl|attribution-share|creative commons/.test(value);
}

function banned(title = "") {
  return /logo|icon|diagram|chart|map|flag|poster|advert|drawing|svg|coat of arms|signature|emblem|passport|stamp/i.test(
    title,
  );
}

async function search(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrlimit", "12");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");
  url.searchParams.set("iiurlwidth", "1400");
  const response = await fetch(url, { headers: { "User-Agent": agent, "Api-User-Agent": agent } });
  if (!response.ok) return [];
  const data = await response.json();
  return Object.values(data.query?.pages ?? {});
}

function pick(pages, hints) {
  const words = hints
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
  const ranked = pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const mime = info.mime || "";
      if (!/jpeg|png|webp/.test(mime)) return null;
      if (banned(page.title || "")) return null;
      const license = info.extmetadata?.LicenseShortName?.value || "";
      if (!freeLicense(license)) return null;
      const url = info.thumburl || info.url;
      if (!url || usedUrls.has(url)) return null;
      const width = info.thumbwidth || info.width || 0;
      if (width < 800) return null;
      const title = (page.title || "").toLowerCase();
      const hits = words.reduce((total, word) => total + (title.includes(word) ? 1 : 0), 0);
      const score = hits * 2 + Math.min(width, 1600) / 800;
      return { score, url, title: page.title };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  return ranked[0] ?? null;
}

async function download(url, file) {
  const response = await fetch(url, { headers: { "User-Agent": agent } });
  if (!response.ok) throw new Error(String(response.status));
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 12000) throw new Error("too small");
  await writeFile(file, bytes);
}

async function findShot(hotel, shotIndex) {
  const queries = placeQueries[hotel.destinationSlug] || placeQueries.srinagar;
  const rotated = [...queries.slice(shotIndex), ...queries.slice(0, shotIndex)];
  const hints = `${hotel.name} ${hotel.destinationSlug} Kashmir hotel resort room lobby restaurant`;
  for (const query of rotated) {
    const pages = await search(query);
    const chosen = pick(pages, hints) || pick(pages, query);
    if (chosen) return chosen;
  }
  // Broader Kashmir fallbacks
  for (const query of ["Kashmir hotel", "Kashmir resort", "hotel room India mountains", "Dal Lake"]) {
    const pages = await search(query);
    const chosen = pick(pages, query);
    if (chosen) return chosen;
  }
  return null;
}

await mkdir(outDir, { recursive: true });
const missed = [];

for (const hotel of kashmirHotels) {
  const suffixes = ["cover", "g1", "g2", "g3", "g4"];
  console.log(`\n${hotel.slug}`);
  for (let i = 0; i < suffixes.length; i += 1) {
    const rel = `${hotel.slug}-${suffixes[i]}.jpg`;
    const file = path.join(outDir, rel);
    if (existsSync(file) && !force) {
      console.log(`  skip ${rel}`);
      continue;
    }
    try {
      const chosen = await findShot(hotel, i);
      if (!chosen) {
        console.log(`  miss ${rel}`);
        missed.push(rel);
        continue;
      }
      await download(chosen.url, file);
      usedUrls.add(chosen.url);
      console.log(`  ok ${rel} ← ${chosen.title}`);
    } catch (error) {
      console.log(`  fail ${rel}`, error.message);
      missed.push(rel);
    }
  }
}

// Point hotel rows at local assets when present
const hotels = await prisma.hotel.findMany({ select: { id: true, slug: true } });
for (const row of hotels) {
  const coverRel = `hotels/${row.slug}-cover.jpg`;
  const coverFile = path.join(process.cwd(), "public", "uploads", coverRel);
  if (!existsSync(coverFile)) continue;
  const gallery = ["g1", "g2", "g3", "g4"]
    .map((suffix) => {
      const rel = `hotels/${row.slug}-${suffix}.jpg`;
      if (!existsSync(path.join(process.cwd(), "public", "uploads", rel))) return null;
      return { url: `/uploads/${rel}`, key: rel, driver: "local" };
    })
    .filter(Boolean);
  const imageUrl = `/uploads/${coverRel}`;
  await prisma.hotel.update({
    where: { id: row.id },
    data: {
      imageUrl,
      imageKey: coverRel,
      imageDriver: "local",
      featuredImageUrl: imageUrl,
      featuredImageKey: coverRel,
      featuredImageDriver: "local",
      galleryJson: JSON.stringify(gallery),
    },
  });
  console.log(`db ← ${row.slug}`);
}

console.log(`\nDone. Missed ${missed.length} files.`);
if (missed.length) console.log(missed.join("\n"));

await prisma.$disconnect();
