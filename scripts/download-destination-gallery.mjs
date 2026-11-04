/**
 * Add unique copyright-free gallery photos for each destination (up to 4 extras).
 * Keeps existing cover; writes destinations/{slug}-2.jpg … -5.jpg and galleryJson.
 *
 *   node scripts/download-destination-gallery.mjs
 *   node scripts/download-destination-gallery.mjs --force
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();
const force = process.argv.includes("--force");
const outDir = path.join(process.cwd(), "public", "uploads", "destinations");
mkdirSync(outDir, { recursive: true });
const agent = "WorldCompassHoliday/1.0 (destination gallery; local travel site)";
const EXTRA = 4;

const queriesBySlug = {
  srinagar: [
    "Dal Lake Srinagar shikara",
    "Nishat Bagh Srinagar",
    "Shalimar Bagh Srinagar",
    "Hazratbal Srinagar",
    "Srinagar old city Kashmir",
    "Dal Lake houseboat Srinagar",
  ],
  gulmarg: [
    "Gulmarg gondola Kashmir",
    "Gulmarg meadow snow",
    "Gulmarg ski resort",
    "Gulmarg pine forest",
    "Kongdoori Gulmarg",
  ],
  pahalgam: [
    "Pahalgam Lidder river",
    "Pahalgam valley Kashmir",
    "Pahalgam pine forest",
    "Baisaran Pahalgam",
    "Pahalgam pony trail",
  ],
  sonamarg: [
    "Sonamarg Thajiwas glacier",
    "Sonamarg Kashmir meadow",
    "Sonamarg Sind river",
    "Zero Point Sonamarg",
  ],
  kashmir: [
    "Kashmir Himalaya meadow",
    "Kashmir valley landscape",
    "Dal Lake Kashmir",
    "Kashmir mountains snow",
  ],
  doodhpathri: ["Doodhpathri meadow Kashmir", "Doodhpathri Budgam", "Doodhpathri stream"],
  yusmarg: ["Yusmarg meadow Kashmir", "Yusmarg Nilnag", "Yousmarg Kashmir pine"],
  "aru-valley": ["Aru Valley Kashmir mountains", "Aru Pahalgam village", "Aru valley trek Kashmir"],
  "betaab-valley": ["Betaab Valley Kashmir river", "Betaab Valley Pahalgam", "Betaab valley bridge"],
  chandanwari: ["Chandanwari Kashmir snow", "Chandanwari Amarnath", "Chandanwari Pahalgam"],
  gurez: ["Gurez Valley Kashmir", "Gurez Bandipora mountains", "Kishanganga Gurez", "Markoot Gurez"],
  kokernag: ["Kokernag botanical garden", "Kokernag Kashmir springs", "Kokernag Anantnag"],
  achabal: ["Achabal Mughal garden", "Achabal Kashmir garden", "Achabal Anantnag"],
  aharbal: ["Aharbal waterfall Kashmir", "Aharbal falls Kulgam", "Aharbal river Kashmir"],
  daksum: ["Daksum Kashmir forest", "Daksum Anantnag valley", "Bringhi valley Kashmir"],
  "sinthan-top": ["Sinthan Top Kashmir", "Sinthan Pass snow", "Sinthan Top mountains"],
  verinag: ["Verinag spring Kashmir", "Verinag Mughal garden", "Verinag octagonal spring"],
  manasbal: ["Manasbal Lake Kashmir", "Manasbal lotus", "Manasbal Ganderbal shore"],
  naranag: ["Naranag temple Kashmir", "Naranag Wangath", "Naranag ruins"],
  "wular-lake": ["Wular Lake Kashmir boats", "Wular Lake Bandipora", "Wular Lake birds"],
  tangmarg: ["Tangmarg Kashmir", "Tangmarg Gulmarg road", "Tangmarg pine"],
  pampore: ["Pampore saffron fields", "saffron Kashmir Pampore", "Pampore Pulwama"],
  bangus: ["Bangus Valley Kashmir", "Bangus Kupwara meadow", "Kupwara valley Kashmir"],
  lolab: ["Lolab Valley Kashmir", "Lolab Kupwara", "Kupwara orchard Kashmir"],
};

function freeLicense(name = "") {
  const value = name.toLowerCase();
  if (value.includes("non-commercial") || value.includes("noncommercial") || value.includes("-nc")) {
    return false;
  }
  return /cc0|public domain|cc by|cc-by|gfdl|attribution-sharealike|creative commons|pd-/.test(value);
}

function banned(title = "") {
  return /logo|icon|diagram|chart|map|flag|poster|advert|drawing|svg|coat of arms|signature|emblem|passport|stamp|qr code|screenshot|portrait of|self.?portrait/i.test(
    title,
  );
}

function curlJson(url) {
  const tmp = path.join("/tmp", `commons-g-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
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
  const tmp = path.join("/tmp", `dest-g-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
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
  url.searchParams.set("gsrlimit", "20");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  const data = curlJson(url.toString());
  return Object.values(data?.query?.pages || {});
}

function pickAll(pages, hints, usedUrls) {
  const words = hints
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
  return pages
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
      if (width < 900 && (info.width || 0) < 900) return null;
      const title = (page.title || "").toLowerCase();
      const hits = words.reduce((total, word) => total + (title.includes(word) ? 1 : 0), 0);
      const score = hits * 3 + Math.min(width || info.width || 0, 2000) / 500;
      return { score, url: imageUrl, title: page.title || "", license };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

async function saveJpeg(url, dest, usedHashes) {
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
    throw new Error("duplicate");
  }
  usedHashes.add(hash);
  return hash;
}

function collectCandidates(slug, name, usedUrls) {
  const queries = [
    ...(queriesBySlug[slug] || []),
    `${name} Kashmir`,
    `${name} Jammu and Kashmir landscape`,
  ];
  const seen = new Set();
  const ranked = [];
  for (const query of queries) {
    const pages = search(query);
    for (const item of pickAll(pages, `${name} ${slug} Kashmir`, usedUrls)) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      ranked.push(item);
    }
  }
  return ranked.sort((a, b) => b.score - a.score);
}

async function main() {
  const destinations = await prisma.destination.findMany({
    select: { id: true, slug: true, name: true, imageUrl: true },
    orderBy: { name: "asc" },
  });

  for (const destination of destinations) {
    console.log(`\n=== ${destination.slug}`);
    const usedUrls = new Set();
    const usedHashes = new Set();
    const gallery = [];

    const coverPath = path.join(outDir, `${destination.slug}.jpg`);
    if (existsSync(coverPath)) {
      usedHashes.add(createHash("sha1").update(readFileSync(coverPath)).digest("hex"));
      gallery.push({
        url: `/uploads/destinations/${destination.slug}.jpg`,
        key: `destinations/${destination.slug}.jpg`,
        driver: "local",
      });
    }

    let need = EXTRA;
    if (!force) {
      for (let i = 2; i <= 1 + EXTRA; i += 1) {
        const file = path.join(outDir, `${destination.slug}-${i}.jpg`);
        if (existsSync(file)) {
          usedHashes.add(createHash("sha1").update(readFileSync(file)).digest("hex"));
          gallery.push({
            url: `/uploads/destinations/${destination.slug}-${i}.jpg`,
            key: `destinations/${destination.slug}-${i}.jpg`,
            driver: "local",
          });
          need -= 1;
        }
      }
    }

    if (need <= 0) {
      await prisma.destination.update({
        where: { id: destination.id },
        data: { galleryJson: JSON.stringify(gallery) },
      });
      console.log(`  skip — already has ${EXTRA} gallery extras`);
      continue;
    }

    const candidates = collectCandidates(destination.slug, destination.name, usedUrls);
    let saved = EXTRA - need;
    for (const candidate of candidates) {
      if (saved >= EXTRA) break;
      const index = saved + 2;
      const file = `${destination.slug}-${index}.jpg`;
      const dest = path.join(outDir, file);
      try {
        await saveJpeg(candidate.url, dest, usedHashes);
        usedUrls.add(candidate.url);
        gallery.push({
          url: `/uploads/destinations/${file}`,
          key: `destinations/${file}`,
          driver: "local",
        });
        saved += 1;
        console.log(`  ok ${file} ← ${candidate.title}`);
      } catch (error) {
        console.log(`  skip ${candidate.title.slice(0, 60)} (${error.message})`);
      }
    }

    // Keep only cover + extras that exist; trim missing slots
    const finalGallery = gallery.filter((item) =>
      existsSync(path.join(process.cwd(), "public", "uploads", item.key)),
    );

    await prisma.destination.update({
      where: { id: destination.id },
      data: { galleryJson: JSON.stringify(finalGallery) },
    });
    console.log(`  db ← ${finalGallery.length} photos`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
