/**
 * Download copyright-free HD destination covers from Wikimedia Commons
 * and update Destination.imageUrl / imageKey.
 *
 *   node scripts/download-destination-photos.mjs
 *   node scripts/download-destination-photos.mjs --force
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();
const force = process.argv.includes("--force");
const outDir = path.join(process.cwd(), "public", "uploads", "destinations");
mkdirSync(outDir, { recursive: true });

const agent = "WorldCompassHoliday/1.0 (destination catalog; local travel site)";
const usedUrls = new Set();
const usedHashes = new Set();

/** Place-specific Commons search queries (bitmap photos only). */
const queriesBySlug = {
  srinagar: ["Dal Lake Srinagar", "Srinagar Kashmir shikara", "Nishat Bagh Srinagar", "Hazratbal Srinagar"],
  gulmarg: ["Gulmarg Kashmir", "Gulmarg meadow snow", "Gulmarg gondola", "Gulmarg ski"],
  pahalgam: ["Pahalgam Kashmir", "Pahalgam Lidder river", "Pahalgam valley", "Betaab Valley Pahalgam"],
  sonamarg: ["Sonamarg Kashmir", "Sonamarg Thajiwas glacier", "Sonamarg Sind river"],
  kashmir: ["Kashmir valley landscape", "Dal Lake Kashmir", "Kashmir Himalaya meadow"],
  doodhpathri: ["Doodhpathri Kashmir", "Doodhpathri meadow", "Budgam Kashmir meadow"],
  yusmarg: ["Yusmarg Kashmir", "Yusmarg meadow", "Yousmarg Kashmir"],
  "aru-valley": ["Aru Valley Kashmir", "Aru Pahalgam", "Aru village Kashmir"],
  "betaab-valley": ["Betaab Valley Kashmir", "Betaab Valley Pahalgam", "Baisaran Pahalgam"],
  chandanwari: ["Chandanwari Kashmir", "Chandanwari Amarnath", "Chandanwari Pahalgam"],
  gurez: ["Gurez Valley Kashmir", "Gurez Bandipora", "Kishanganga Gurez"],
  kokernag: ["Kokernag Kashmir", "Kokernag garden", "Kokernag Anantnag"],
  achabal: ["Achabal Kashmir", "Achabal Mughal garden", "Achabal Anantnag"],
  aharbal: ["Aharbal waterfall Kashmir", "Aharbal Kulgam", "Aharbal falls"],
  daksum: ["Daksum Kashmir", "Daksum Anantnag", "Bringhi valley Kashmir"],
  "sinthan-top": ["Sinthan Top Kashmir", "Sinthan Pass Kashmir", "Anantnag mountain pass"],
  verinag: ["Verinag Kashmir", "Verinag spring Mughal", "Verinag Anantnag"],
  manasbal: ["Manasbal Lake Kashmir", "Manasbal Ganderbal", "Manasbal lotus"],
  naranag: ["Naranag Kashmir", "Naranag temple", "Wangath Naranag"],
  "wular-lake": ["Wular Lake Kashmir", "Wular Bandipora", "Wular Lake boat"],
  tangmarg: ["Tangmarg Kashmir", "Tangmarg Gulmarg road", "Tangmarg Baramulla"],
  pampore: ["Pampore saffron Kashmir", "Pampore fields", "saffron fields Kashmir"],
  bangus: ["Bangus Valley Kashmir", "Bangus Kupwara", "Kupwara meadow Kashmir"],
  lolab: ["Lolab Valley Kashmir", "Lolab Kupwara", "Kupwara valley Kashmir"],
};

function freeLicense(name = "") {
  const value = name.toLowerCase();
  if (value.includes("non-commercial") || value.includes("noncommercial") || value.includes("-nc")) {
    return false;
  }
  return /cc0|public domain|cc by|cc-by|gfdl|attribution-sharealike|creative commons|pd-/.test(value);
}

function banned(title = "") {
  return /logo|icon|diagram|chart|map|flag|poster|advert|drawing|svg|coat of arms|signature|emblem|passport|stamp|qr code|screenshot/i.test(
    title,
  );
}

function curlJson(url) {
  const tmp = path.join("/tmp", `commons-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
  const result = spawnSync(
    "curl",
    ["-fsSL", "--max-time", "40", "-A", agent, "-H", `Api-User-Agent: ${agent}`, "-o", tmp, url],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    try {
      unlinkSync(tmp);
    } catch {}
    return null;
  }
  try {
    const data = JSON.parse(readFileSync(tmp, "utf8"));
    unlinkSync(tmp);
    return data;
  } catch {
    try {
      unlinkSync(tmp);
    } catch {}
    return null;
  }
}

function curlDownload(url) {
  const tmp = path.join("/tmp", `dest-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
  const result = spawnSync(
    "curl",
    ["-fsSL", "--max-time", "60", "-A", agent, "-e", "https://commons.wikimedia.org/", "-g", "-o", tmp, url],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    try {
      unlinkSync(tmp);
    } catch {}
    throw new Error((result.stderr || "curl failed").slice(0, 120));
  }
  return tmp;
}

function search(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrlimit", "16");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  const data = curlJson(url.toString());
  return Object.values(data?.query?.pages || {});
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
      if (!/jpeg|png|webp|tiff/.test(info.mime || "")) return null;
      if (banned(page.title || "")) return null;
      const license = info.extmetadata?.LicenseShortName?.value || info.extmetadata?.License?.value || "";
      if (!freeLicense(license) && !freeLicense(page.title || "")) return null;
      const imageUrl = info.thumburl || info.url;
      if (!imageUrl || usedUrls.has(imageUrl)) return null;
      const width = info.thumbwidth || info.width || 0;
      if (width < 1000 && (info.width || 0) < 1000) return null;
      const title = (page.title || "").toLowerCase();
      const hits = words.reduce((total, word) => total + (title.includes(word) ? 1 : 0), 0);
      const score = hits * 3 + Math.min(width || info.width || 0, 2000) / 500;
      return { score, url: imageUrl, title: page.title || "", license };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  return ranked[0] || null;
}

async function saveJpeg(url, dest) {
  const tmp = curlDownload(url);
  try {
    await sharp(tmp)
      .rotate()
      .jpeg({ quality: 88, mozjpeg: true })
      .resize({ width: 1920, height: 1280, fit: "inside", withoutEnlargement: true })
      .toFile(dest);
  } finally {
    try {
      unlinkSync(tmp);
    } catch {}
  }
  const hash = createHash("sha1").update(readFileSync(dest)).digest("hex");
  if (usedHashes.has(hash)) {
    unlinkSync(dest);
    throw new Error("duplicate image content");
  }
  usedHashes.add(hash);
  return hash;
}

async function findCover(slug, name) {
  const queries = queriesBySlug[slug] || [`${name} Kashmir`];
  const hints = `${name} ${slug} Kashmir India landscape`;
  for (const query of queries) {
    const pages = search(query);
    const chosen = pick(pages, hints) || pick(pages, query);
    if (chosen) return chosen;
  }
  for (const query of ["Kashmir valley India landscape", "Himalaya Kashmir meadow", "Dal Lake Srinagar"]) {
    const pages = search(query);
    const chosen = pick(pages, `${name} Kashmir`);
    if (chosen) return chosen;
  }
  return null;
}

async function main() {
  const destinations = await prisma.destination.findMany({
    select: { id: true, slug: true, name: true, imageUrl: true },
    orderBy: { name: "asc" },
  });

  const missed = [];
  for (const destination of destinations) {
    const rel = `destinations/${destination.slug}.jpg`;
    const dest = path.join(outDir, `${destination.slug}.jpg`);
    console.log(`\n=== ${destination.slug}`);

    if (existsSync(dest) && !force && !/seed-kashmir|cloudinary/i.test(destination.imageUrl || "")) {
      // Keep existing local HD file if DB already points at it
      if ((destination.imageUrl || "").includes(`/uploads/${rel}`)) {
        console.log(`  skip existing ${rel}`);
        usedHashes.add(createHash("sha1").update(readFileSync(dest)).digest("hex"));
        continue;
      }
    }

    try {
      const chosen = await findCover(destination.slug, destination.name);
      if (!chosen) {
        console.log("  miss — no free Commons match");
        missed.push(destination.slug);
        continue;
      }
      await saveJpeg(chosen.url, dest);
      usedUrls.add(chosen.url);
      await prisma.destination.update({
        where: { id: destination.id },
        data: {
          imageUrl: `/uploads/${rel}`,
          imageKey: rel,
          imageDriver: "local",
        },
      });
      console.log(`  ok ← ${chosen.title} (${chosen.license || "free"})`);
    } catch (error) {
      console.log(`  fail ${error.message || error}`);
      missed.push(destination.slug);
    }
  }

  // Credits sidecar for attribution
  writeFileSync(
    path.join(outDir, "ATTRIBUTION.txt"),
    "Destination photos sourced from Wikimedia Commons under free licenses (CC BY / CC BY-SA / CC0 / Public Domain).\nSee each file page on commons.wikimedia.org for author and license details.\n",
  );

  console.log(`\nDone. Missed ${missed.length}: ${missed.join(", ") || "none"}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
