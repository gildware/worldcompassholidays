/**
 * Download exact car/bike model photos and attach VehicleImage rows.
 * Cars mix exterior + interior; never duplicates the same file.
 *
 *   node scripts/download-exact-vehicle-photos.mjs
 *   node scripts/download-exact-vehicle-photos.mjs --cars-only
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), "public", "uploads", "vehicles", "photos");
mkdirSync(outDir, { recursive: true });
const carsOnly = process.argv.includes("--cars-only");

/** Exact model photos: cover + gallery (verified 200 + image/*). Cars include interiors. */
const sources = {
  "toyota-innova-crysta": [
    "https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Innova-Crysta/9612/1697698611076/front-left-side-47.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/51435/innova-crysta-exterior-right-front-three-quarter-3.jpeg?q=85",
    "https://img.autocarindia.com/model/uploads/modelimages/Toyota-Innova-Crysta-020320231741.jpg?w=1280&q=75",
    "https://stimg.cardekho.com/images/carinteriorimages/930x620/Toyota/Innova-Crysta/8105/1606215327927/dashboard-59.jpg?imwidth=890&impolicy=resize",
    "https://www.motoroids.com/wp-content/uploads/2016/04/New-Toyota-Innova-Crysta-dashboard-2-1200x798.jpg",
  ],
  "toyota-innova": [
    "https://stimg.cardekho.com/images/car-images/large/Toyota/Toyota-Innova/silver-mica-matallic.jpg?imwidth=890&impolicy=resize",
    "https://5.imimg.com/data5/SELLER/Default/2022/11/ZK/DW/DA/13202871/7-1000x1000.jpeg",
    "https://5.imimg.com/data5/SELLER/Default/2022/11/LH/KB/GN/13202871/9-1000x1000.jpeg",
    "https://media.zigcdn.com/media/model/2022/Nov/full-dashboard-center-2099629460_930x620.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/1/575226911/YR/IE/LK/4315774/toyota-innova-console-interiors-1000x1000.jpg",
  ],
  sedan: [
    "https://www.carz4sale.in/pictures/default/maruti-suzuki-dzire-2024/maruti-suzuki-dzire-2024-pic-17.jpg",
    "https://media.zigcdn.com/media/content/2024/Nov/6731f07ff1d3d.jpg?tr=w-930",
    "https://caronphone.com/news/wp-content/uploads/Dzire-7-color-option-img-2-1.jpg",
    "https://www.cartoq.com/wp-content/uploads/2024/11/Maruti-Suzuki-Dzire-dashboard-.jpg",
    "https://www.motoroids.com/wp-content/uploads/2024/11/Maruti-Suzuki-Dzire-Int.jpg",
  ],
  "force-urbania": [
    "https://autohunt.in/wp-content/uploads/2025/03/Force-Urbania.webp",
    "https://newsvibesofindia.com/wp-content/uploads/2022/11/Urbania_2-scaled.jpg",
    "https://drivetrick.com/wp-content/uploads/2022/11/urbania-force.jpg",
    "https://forceurbania.co.in/wp-content/uploads/2022/10/inside-cabin_desktop.jpg",
    "https://media.zigcdn.com/media/model/2024/Jul/cabin-view-86701690_930x620.jpg",
  ],
  "tempo-traveller": [
    "https://images.91trucks.com/wp-content/uploads/2022/09/Force-Traveller-3050-latest-.png",
    "https://www.renttempotraveller.com/images/new-img/exterior1.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/9/340256529/QF/GD/UC/8114104/force-tempo-traveller-26-seat-staff-bus-1000x1000.jpeg",
    "https://www.tempotravellerhire.in/jap/media/uploads/12seaterluxury-tempo-interior2.jpg",
    "https://tempotravellerindia.com/wp-content/uploads/2024/08/5aa3f66a-d819-4084-a267-5cce9f73de9e.jpg",
  ],
  "royal-enfield-classic-350": [
    "https://ic4.maxabout.us/autos/tw_india/2/2021/9/2022-re-classic-350-halcyon-black-r3q-view.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/5/310644461/SV/BB/RC/189378462/classic-350-halycon-black--1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/5/310644377/UN/NL/VP/189378462/classic-350-halycon-black--1000x1000.jpg",
  ],
  "royal-enfield-himalayan-450": [
    "https://cdpcdn.dx1app.com/products/USA/RE/2025/MC/DUALPURP/HIMALAYAN_450/50/KAMET_WHITE_TUBELESS/2000000003.jpg",
    "https://imgcdn.zigwheels.ph/large/gallery/exterior/81/3199/royal-enfield-himalayan-450-left-side-view-full-image-831974.jpg",
    "https://www.royalenfield.com/content/dam/royal-enfield/motorcycles/himalayan/new-himalayan-motorcycle-eu.jpg",
    "https://media.zigcdn.com/media/model/2026/Mar/himalayan-450-right-side-view_930x620.jpg?tr=w-1200,h-630",
    "https://imgcdn.zigwheels.ph/large/gallery/exterior/81/3199/royal-enfield-himalayan-450-right-side-viewfull-image-130329.jpg",
  ],
  "royal-enfield-himalayan-411": [
    "https://www.unitedmotorcycles.be/Uploads/products/occasies/occ-hima-411-rock-red/Royal-Enfield-Himalayan-411-Rock-Red-JRMotorcycles-Vromoto-5.jpeg?maxwidth=1600&maxheight=900&quality=75&format=jpg&mode=max",
    "https://www.unitedmotorcycles.be/Uploads/products/occasies/occ-hima-411-rock-red/Royal-Enfield-Himalayan-411-Rock-Red-JRMotorcycles-Vromoto-6.jpeg?maxwidth=1600&maxheight=900&quality=75&format=jpg&mode=max",
  ],
  "royal-enfield-hunter-350": [
    "https://www.motorede.com.br/wp-content/uploads/2022/08/Royal-Enfield-Hunter-350-rebel-black.jpg",
    "https://storage.googleapis.com/mhimg/p/0778/8220778/6f31_l.jpg",
    "https://storage.googleapis.com/mhimg/p/8696/8148696/00ef_l.jpg",
  ],
  "tvs-ntorq": [
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-12568a8080b61608.jpg",
    "https://gaadiwaadi.com/wp-content/uploads/2021/07/TVS-NTORQ-125-Race-XP-2.jpg",
    "http://motoringworld.in/wp-content/uploads/2021/07/TVS-NTORQ-125-Race-XP-1.jpg",
    "http://motoringworld.in/wp-content/uploads/2021/07/TVS-NTORQ-125-Race-XP-2.jpg",
    "https://tvsgeorgia.ge/wp-content/uploads/2023/02/TVS-Ntorq-125-Race-XP-side-profile-static-1-1024x576.jpg",
  ],
};

function curlDownload(url) {
  const tmp = path.join("/tmp", `veh-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
  const result = spawnSync(
    "curl",
    ["-fsSL", "--max-time", "45", "-A", "Mozilla/5.0", "-e", new URL(url).origin + "/", "-g", "-o", tmp, url],
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

function fileHash(filePath) {
  return createHash("sha1").update(readFileSync(filePath)).digest("hex");
}

async function saveJpeg(url, dest) {
  const tmp = curlDownload(url);
  try {
    await sharp(tmp)
      .rotate()
      .jpeg({ quality: 85, mozjpeg: true })
      .resize({ width: 1600, withoutEnlargement: true })
      .toFile(dest);
  } finally {
    try {
      unlinkSync(tmp);
    } catch {}
  }
}

function clearGallerySlots(slug, keepCount) {
  for (let i = 1; i <= 8; i += 1) {
    const file = i === 1 ? `${slug}.jpg` : `${slug}-${i}.jpg`;
    const dest = path.join(outDir, file);
    if (i > keepCount && existsSync(dest)) {
      try {
        unlinkSync(dest);
      } catch {}
    }
  }
}

async function attachImages(vehicleId, slug, count) {
  await prisma.vehicleImage.deleteMany({ where: { vehicleId } });
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const file = i === 0 ? `${slug}.jpg` : `${slug}-${i + 1}.jpg`;
    const rel = `vehicles/photos/${file}`;
    if (!existsSync(path.join(process.cwd(), "public", "uploads", rel))) continue;
    rows.push({
      vehicleId,
      url: `/uploads/${rel}`,
      key: rel,
      driver: "local",
      sortOrder: i,
    });
  }
  if (rows.length) await prisma.vehicleImage.createMany({ data: rows });
  return rows.length;
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, slug: true, kind: true, name: true, brand: true, modelName: true },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  for (const vehicle of vehicles) {
    if (carsOnly && vehicle.kind !== "car") continue;
    const urls = sources[vehicle.slug] || [];
    console.log(`\n=== ${vehicle.kind} ${vehicle.slug} (${urls.length} urls)`);
    if (!urls.length) {
      console.log("  GAP — add Bing/official URLs");
      continue;
    }

    clearGallerySlots(vehicle.slug, 0);

    let saved = 0;
    const seen = new Set();
    for (const url of urls) {
      if (saved >= 5) break;
      const file = saved === 0 ? `${vehicle.slug}.jpg` : `${vehicle.slug}-${saved + 1}.jpg`;
      const dest = path.join(outDir, file);
      try {
        await saveJpeg(url, dest);
        const hash = fileHash(dest);
        if (seen.has(hash)) {
          unlinkSync(dest);
          console.log(`  skip duplicate ${file}`);
          continue;
        }
        seen.add(hash);
        console.log(`  ok ${file}`);
        saved += 1;
      } catch (error) {
        console.log(`  fail ${error.message}`);
      }
    }

    clearGallerySlots(vehicle.slug, saved);
    const attached = await attachImages(vehicle.id, vehicle.slug, saved);
    console.log(`  db ← ${attached} unique images`);
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
