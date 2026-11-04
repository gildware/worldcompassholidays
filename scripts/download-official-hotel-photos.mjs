/**
 * Download exact official hotel photos via curl + sharp.
 *   node scripts/download-official-hotel-photos.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), "public", "uploads", "hotels");
mkdirSync(outDir, { recursive: true });

const sources = {
  "golden-leaf-srinagar": [
    "https://goldenleafkashmir.com/wp-content/uploads/2024/02/Hotel-Golden-leaf-kashmir21-copy-2.webp",
    "https://goldenleafkashmir.com/wp-content/uploads/2024/02/Hotel-Golden-leaf-kashmir36-copy-2.webp",
    "https://goldenleafkashmir.com/wp-content/uploads/2024/02/Hotel-Golden-leaf-kashmir28-copy-2.webp",
    "https://goldenleafkashmir.com/wp-content/uploads/2024/02/Hotel-Golden-leaf-kashmir10-copy-2.webp",
    "https://goldenleafkashmir.com/wp-content/uploads/2024/02/Hotel-Golden-leaf-kashmir40-copy-2.jpg",
  ],
  "royal-batoo-srinagar": [
    "https://hotelroyalbatoo.com/images/exterior/facade-1.webp",
    "https://hotelroyalbatoo.com/images/lobby/lobby-reception.webp",
    "https://hotelroyalbatoo.com/images/rooms/super-deluxe/super-deluxe-1.webp",
    "https://hotelroyalbatoo.com/images/rooms/premium/premium-1.webp",
    "https://hotelroyalbatoo.com/images/dining/restaurant-2.webp",
  ],
  "jhelum-comfort-residency-srinagar": [
    "https://jhelumcomfortinn.com/wp-content/uploads/2026/06/Jhelum-Comfort-Inn-1.webp",
    "https://jhelumcomfortinn.com/wp-content/uploads/2026/06/Jhelum-Comfort-Inn-3.webp",
    "https://jhelumcomfortinn.com/wp-content/uploads/2026/06/Jhelum-Comfort-Inn-15.webp",
    "https://jhelumcomfortinn.com/wp-content/uploads/2026/06/Jhelum-Comfort-Inn-19.webp",
    "https://jhelumcomfortinn.com/wp-content/uploads/2026/06/Jhelum-Comfort-Inn-4.webp",
  ],
  "milan-srinagar": [
    "https://hotelmilan.in/wp-content/uploads/2022/09/Highend-36011.webp",
    "https://hotelmilan.in/wp-content/uploads/2022/09/Highend-36020.webp",
    "https://hotelmilan.in/wp-content/uploads/2022/09/Highend-36022.webp",
    "https://hotelmilan.in/wp-content/uploads/2022/09/Highend-36026.webp",
    "https://hotelmilan.in/wp-content/uploads/2022/09/Highend-3605.webp",
  ],
  "apple-tree-resorts-gulmarg": [
    "https://appletreeresorts.com/wp-content/uploads/2024/08/p2.png",
    "https://appletreeresorts.com/wp-content/uploads/2024/08/p3.png",
    "https://appletreeresorts.com/wp-content/uploads/2024/08/p5.png",
    "https://appletreeresorts.com/wp-content/uploads/2024/08/x3.png",
    "https://appletreeresorts.com/wp-content/uploads/2024/08/appache-2.png",
  ],
  "zahgeer-continental-gulmarg": [
    "https://hotelzahgeergulmarg.com/HotelZahgeer/2.jpeg",
    "https://hotelzahgeergulmarg.com/HotelZahgeer/23.jpeg",
    "https://hotelzahgeergulmarg.com/Zahger/12.png",
    "https://hotelzahgeergulmarg.com/Zahger/13.png",
    "https://hotelzahgeergulmarg.com/Zahger/15.png",
  ],
  "white-villa-pahalgam": [
    "https://whitevillaresort.com/wp-content/uploads/2025/04/DSC_2220-1.webp",
    "https://whitevillaresort.com/wp-content/uploads/2025/04/DSC_2211-1.webp",
    "https://whitevillaresort.com/wp-content/uploads/2025/04/DSC_2210-1.webp",
    "https://whitevillaresort.com/wp-content/uploads/2025/04/DSC_2195-1.webp",
    "https://whitevillaresort.com/wp-content/uploads/2025/04/DSC_2176-1.webp",
  ],
  "green-heights-pahalgam": [
    "https://hotelgreenheights.com/wp-content/uploads/2024/02/Green-Heights-20-copy.webp",
    "https://hotelgreenheights.com/wp-content/uploads/2024/02/Green-Heights-19-copy.webp",
    "https://hotelgreenheights.com/wp-content/uploads/2024/02/Green-Heights-17-copy.webp",
    "https://hotelgreenheights.com/wp-content/uploads/2024/02/Green-Heights-16-copy.webp",
    "https://hotelgreenheights.com/wp-content/uploads/2024/02/Green-Heights-8-copy.webp",
  ],
  "pahalgam-shore": [
    "https://thepahalgamshore.com/wp-content/uploads/2024/04/Highend-3609-1.webp",
    "https://thepahalgamshore.com/wp-content/uploads/2024/04/Highend-3608.webp",
    "https://thepahalgamshore.com/wp-content/uploads/2024/04/WhatsApp-Image-2024-04-19-at-3.20.44-PM.jpeg",
    "https://thepahalgamshore.com/wp-content/uploads/2024/04/WhatsApp-Image-2024-04-06-at-11.07.35-AM.jpeg",
    "https://thepahalgamshore.com/wp-content/uploads/2024/04/g20-website.webp",
  ],
  "pahalgam-retreat": [
    "https://pahalgamretreat.com/wp-content/uploads/2024/02/Pahalgam-Retreat-3-copy-2.webp",
    "https://pahalgamretreat.com/wp-content/uploads/2024/02/Pahalgam-Retreat-18-copy-2.webp",
    "https://pahalgamretreat.com/wp-content/uploads/2024/02/Pahalgam-Retreat-15-copy-2.webp",
    "https://pahalgamretreat.com/wp-content/uploads/2024/03/Highend-360-13-copy-2.webp",
    "https://pahalgamretreat.com/wp-content/uploads/2024/03/Highend-360-14-copy-2.webp",
  ],
};

const suffixes = ["cover", "g1", "g2", "g3", "g4"];

function curlDownload(url) {
  const tmp = path.join("/tmp", `hotel-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
  const result = spawnSync(
    "curl",
    ["-fsSL", "--max-time", "45", "-A", "Mozilla/5.0", "-e", new URL(url).origin + "/", "-o", tmp, url],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    try {
      unlinkSync(tmp);
    } catch {}
    throw new Error(result.stderr || "curl failed");
  }
  return tmp;
}

async function saveJpeg(url, dest) {
  const tmp = curlDownload(url);
  try {
    await sharp(tmp).rotate().jpeg({ quality: 85, mozjpeg: true }).resize({ width: 1600, withoutEnlargement: true }).toFile(dest);
  } finally {
    try {
      unlinkSync(tmp);
    } catch {}
  }
}

async function updateDb(slug) {
  const coverRel = `hotels/${slug}-cover.jpg`;
  if (!existsSync(path.join(process.cwd(), "public", "uploads", coverRel))) return;
  const gallery = suffixes
    .slice(1)
    .map((suffix) => {
      const rel = `hotels/${slug}-${suffix}.jpg`;
      if (!existsSync(path.join(process.cwd(), "public", "uploads", rel))) return null;
      return { url: `/uploads/${rel}`, key: rel, driver: "local" };
    })
    .filter(Boolean);
  const imageUrl = `/uploads/${coverRel}`;
  await prisma.hotel.updateMany({
    where: { slug },
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
  console.log(`db ← ${slug}`);
}

const report = { ok: [], fail: [] };

for (const [slug, urls] of Object.entries(sources)) {
  console.log(`\n=== ${slug}`);
  // remove accidental empty-suffix files from zsh bug
  const bad = path.join(outDir, `${slug}-.jpg`);
  if (existsSync(bad)) unlinkSync(bad);

  let saved = 0;
  for (const url of urls) {
    if (saved >= 5) break;
    const dest = path.join(outDir, `${slug}-${suffixes[saved]}.jpg`);
    try {
      await saveJpeg(url, dest);
      console.log(`  ok ${suffixes[saved]}`);
      saved += 1;
    } catch (error) {
      console.log(`  fail ${url} (${error.message})`);
    }
  }
  if (saved >= 5) report.ok.push(slug);
  else report.fail.push(`${slug} (${saved}/5)`);
  await updateDb(slug);
}

console.log("\nOK:", report.ok.join(", "));
console.log("PARTIAL/FAIL:", report.fail.join(", ") || "none");
await prisma.$disconnect();
