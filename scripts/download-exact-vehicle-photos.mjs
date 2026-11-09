/**
 * Download exact car/bike model photos from BikeDekho / CarDekho / ZigWheels /
 * official brand assets, save locally, upload to Cloudinary, attach VehicleImage.
 *
 *   node scripts/download-exact-vehicle-photos.mjs
 *   node scripts/download-exact-vehicle-photos.mjs --cars-only
 *   node scripts/download-exact-vehicle-photos.mjs --bikes-only
 *   node scripts/download-exact-vehicle-photos.mjs --local-only
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function uploadCloudinaryBuffer({ buffer, publicId }) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        unique_filename: false,
        resource_type: "image",
        invalidate: true,
      },
      (error, uploaded) => {
        if (error || !uploaded) reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(uploaded);
      },
    );
    stream.end(buffer);
  });
  return { url: result.secure_url, key: result.public_id, driver: "cloudinary" };
}

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), "public", "uploads", "vehicles", "photos");
mkdirSync(outDir, { recursive: true });
const carsOnly = process.argv.includes("--cars-only");
const bikesOnly = process.argv.includes("--bikes-only");
const localOnly = process.argv.includes("--local-only");
const onlySlugs = new Set(
  process.argv.filter((arg) => arg.startsWith("--only=")).flatMap((arg) => arg.slice(7).split(",").filter(Boolean)),
);

/** Exact model photos from BikeDekho / CarWale / AEPL / ZigWheels / official sites. */
const sources = {
  "hero-xpulse-200": [
    "https://cdn.bikedekho.com/processedimages/hero/xpulse-210/source/xpulse-21068d230d50ddf9.jpg",
    "https://cdn.bikedekho.com/processedimages/hero/xpulse-210/source/xpulse-210689dbd77267a5.jpg",
    "https://cdn.bikedekho.com/processedimages/hero/xpulse-210/source/xpulse-210689dbd77bbcae.jpg",
    "https://cdn.bikedekho.com/processedimages/hero/xpulse-210/source/xpulse-210689dbdd05994a.jpg",
    "https://cdn.bikedekho.com/processedimages/hero/xpulse-210/source/xpulse-210689dbd93db804.jpg",
    "https://cdn.bikedekho.com/processedimages/hero/xpulse-200/source/xpulse-2006a141202b1991.jpg",
  ],
  "honda-activa": [
    "https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g68a6fb7b20bd3.jpg",
    "https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g690f0e8a7e0ff.jpg",
    "https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g690f0e98d577a.jpg",
    "https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g690f0ea80d0ed.jpg",
    "https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g690f0ebf78305.jpg",
    "https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g690f0ecb45242.jpg",
  ],
  "jawa-42": [
    "https://cdn.bikedekho.com/processedimages/jawa-motorcycles/42/source/4262c41f837bdca.jpg?imwidth=600&impolicy=resize",
    "https://cdn.bikedekho.com/processedimages/jawa-motorcycles/jawa-42/source/jawa-426aa118888490a.jpg",
    "https://cdn.bikedekho.com/processedimages/jawa-motorcycles/42/source/4262c41f84837ae.jpg",
    "https://cdn.bikedekho.com/processedimages/jawa-motorcycles/42/source/4262c41f9f5d6e2.jpg",
    "https://cdn.bikedekho.com/processedimages/jawa-motorcycles/42/source/4262c41f9bdc5d5.jpg",
    "https://cdn.bikedekho.com/processedimages/jawa-motorcycles/42/source/4262c41f9d514c7.jpg",
  ],
  "royal-enfield-classic-350": [
    "https://cdn.bikedekho.com/processedimages/royal-enfield/classic350/source/classic35068b6db31f3948.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/classic350/source/classic350690edadc2b577.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/classic350/source/classic350690edae9e8573.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/classic350/source/classic350690edaf9d035b.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/classic350/source/classic350690edb08f00d4.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/classic350/source/classic350690edb1a1997a.jpg",
  ],
  "royal-enfield-himalayan-411": [
    "https://www.unitedmotorcycles.be/Uploads/products/occasies/occ-hima-411-rock-red/Royal-Enfield-Himalayan-411-Rock-Red-JRMotorcycles-Vromoto-5.jpeg?maxwidth=1600&maxheight=900&quality=75&format=jpg&mode=max",
    "https://www.unitedmotorcycles.be/Uploads/products/occasies/occ-hima-411-rock-red/Royal-Enfield-Himalayan-411-Rock-Red-JRMotorcycles-Vromoto-6.jpeg?maxwidth=1600&maxheight=900&quality=75&format=jpg&mode=max",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/himalayan/source/himalayan65eae9d6d3f1f.jpg",
    "https://imgcdn.zigwheels.ph/large/gallery/exterior/81/1875/royal-enfield-himalayan-left-side-view-full-image-069710.jpg",
    "https://imgcdn.zigwheels.ph/large/gallery/exterior/81/1875/royal-enfield-himalayan-right-side-view-full-image-069711.jpg",
  ],
  "royal-enfield-himalayan-450": [
    "https://cdpcdn.dx1app.com/products/USA/RE/2025/MC/DUALPURP/HIMALAYAN_450/50/KAMET_WHITE_TUBELESS/2000000003.jpg",
    "https://www.royalenfield.com/content/dam/royal-enfield/motorcycles/himalayan/new-himalayan-motorcycle-eu.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/himalayan-450/source/himalayan-45069cba72ab286c.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/himalayan-450/source/himalayan-4506a60ac8be9af6.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/himalayan-450/source/himalayan-4506a60ac8c375f3.jpg",
    "https://cdn.bikedekho.com/processedimages/royal-enfield/himalayan-450/source/himalayan-4506a60ac8c7a507.jpg",
  ],
  // Prefer coloured tanks / light studio backs — avoid black bike on black cutouts.
  "royal-enfield-hunter-350": [
    "https://cdn.bikedekho.com/processedimages/royal-enfield/roadstar/source/roadstar68c28d299fba9.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/201293/hunter-350-2025-right-side-view-2.jpeg?isig=0",
    "https://imgd.aeplcdn.com/1280x720/n/5oer5fb_1830365.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/h3kr5fb_1830373.jpg",
    "https://media.zigcdn.com/media/model/2026/Mar/hunter-right-side-view_930x620.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/oe7r5fb_1830375.jpg",
  ],
  "suzuki-access-125": [
    "https://cdn.bikedekho.com/processedimages/suzuki/2025-access-125/source/2025-access-12568a80430441e1.jpg",
    "https://cdn.bikedekho.com/processedimages/suzuki/2025-access-125/source/2025-access-125690efcd3a02de.jpg",
    "https://cdn.bikedekho.com/processedimages/suzuki/2025-access-125/source/2025-access-125690efce26dc0b.jpg",
    "https://cdn.bikedekho.com/processedimages/suzuki/2025-access-125/source/2025-access-125690efcf2b8331.jpg",
    "https://cdn.bikedekho.com/processedimages/suzuki/2025-access-125/source/2025-access-125690efd017189c.jpg",
    "https://cdn.bikedekho.com/processedimages/suzuki/2025-access-125/source/2025-access-125690efd0e44d7c.jpg",
  ],
  "tvs-ntorq": [
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a3e458edb293.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a424200088c2.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a42420f86753.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a42421e33650.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a424230bc542.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a424240df957.jpg",
  ],
  "tvs-ntorq-125": [
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a3e458edb293.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a424200088c2.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a42420f86753.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a42421e33650.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a424230bc542.jpg",
    "https://cdn.bikedekho.com/processedimages/tvs/ntorq-125/source/ntorq-1256a424240df957.jpg",
  ],
  "force-urbania": [
    "https://newsvibesofindia.com/wp-content/uploads/2022/11/Urbania_2-scaled.jpg",
    "https://drivetrick.com/wp-content/uploads/2022/11/urbania-force.jpg",
    "https://autohunt.in/wp-content/uploads/2025/03/Force-Urbania.webp",
    "https://forceurbania.co.in/wp-content/uploads/2022/10/inside-cabin_desktop.jpg",
    "https://media.zigcdn.com/media/model/2024/Jul/cabin-view-86701690_930x620.jpg",
  ],
  "honda-city": [
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219846/city-exterior-right-front-three-quarter-35.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219846/city-exterior-right-front-three-quarter-32.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219846/city-exterior-right-front-three-quarter-29.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219846/city-exterior-right-front-three-quarter-26.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219846/city-facelift-exterior-right-front-three-quarter-24.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219846/city-facelift-exterior-right-front-three-quarter-2.png?isig=0&q=80&wm=1",
  ],
  "hyundai-creta": [
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/106815/creta-exterior-right-front-three-quarter-43.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/106815/creta-exterior-right-front-three-quarter-40.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/106815/creta-exterior-right-front-three-quarter-32.jpeg?isig=0&wm=1&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/106815/creta-exterior-right-front-three-quarter-26.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/106815/creta-exterior-right-front-three-quarter-18.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/106815/creta-exterior-right-front-three-quarter-14.jpeg?isig=0&q=80&wm=1",
  ],
  "kia-carens": [
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/174325/carens-exterior-right-front-three-quarter-11.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/174325/carens-exterior-right-front-three-quarter-10.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/174325/carens-exterior-right-front-three-quarter-9.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/174325/carens-exterior-right-front-three-quarter-9.png?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/174325/carens-exterior-right-side-view-2.jpeg?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/174325/carens-exterior-right-rear-three-quarter-2.jpeg?isig=0&q=80&wm=1",
  ],
  "mahindra-thar": [
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219824/thar-facelift-exterior-right-front-three-quarter-6.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219824/thar-facelift-exterior-right-front-three-quarter-2.png?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219824/thar-facelift-exterior-right-side-view-5.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219824/thar-facelift-exterior-right-rear-three-quarter-7.png?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219824/thar-facelift-exterior-right-rear-three-quarter-4.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/219824/thar-facelift-exterior-rear-view-6.jpeg?isig=0&q=80",
  ],
  "maruti-swift": [
    "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Swift/10406/1697697295569/front-left-side-47.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/159099/swift-exterior-right-side-view.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/159099/swift-interior-dashboard.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/159099/swift-exterior-right-front-three-quarter-187.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80",
  ],
  "sedan": [
    "https://media.zigcdn.com/media/content/2024/Nov/6731f07ff1d3d.jpg?tr=w-1280",
    "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Dzire/11330/1749104473483/front-left-side-47.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/170299/dzire-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80",
    "https://www.cartoq.com/wp-content/uploads/2024/11/Maruti-Suzuki-Dzire-dashboard-.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/170173/dzire-exterior-right-front-three-quarter-194.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/170173/dzire-exterior-right-front-three-quarter-193.jpeg?isig=0&q=80&wm=1",
  ],
  "tempo-traveller": [
    "https://5.imimg.com/data5/SELLER/Default/2023/9/340256529/QF/GD/UC/8114104/force-tempo-traveller-26-seat-staff-bus-1000x1000.jpeg",
    "https://www.renttempotraveller.com/images/new-img/exterior1.jpg",
    "https://images.91trucks.com/wp-content/uploads/2022/09/Force-Traveller-3050-latest-.png",
    "https://tempotravellerindia.com/wp-content/uploads/2024/08/5aa3f66a-d819-4084-a267-5cce9f73de9e.jpg",
    "https://www.tempotravellerhire.in/jap/media/uploads/12seaterluxury-tempo-interior2.jpg",
  ],
  "toyota-innova": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/2019_Toyota_Innova_2.0_G_%28107%29.jpg/1280px-2019_Toyota_Innova_2.0_G_%28107%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/2019_Toyota_Innova_2.0_G_%2856%29.jpg/1280px-2019_Toyota_Innova_2.0_G_%2856%29.jpg",
    "https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Innova-Crysta/9612/1697698611076/front-left-side-47.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/222736/innova-crysta-2026-exterior-right-front-three-quarter-8.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/222736/innova-crysta-2026-exterior-right-front-three-quarter.png?isig=0&q=80&wm=1",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/222736/innova-crysta-2026-exterior-right-side-view.jpeg?isig=0&q=80&wm=1",
  ],
  "toyota-innova-crysta": [
    "https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Innova-Crysta/9612/1697698611076/front-left-side-47.jpg",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/51435/innova-crysta-exterior-right-front-three-quarter-3.jpeg?q=85",
    "https://img.autocarindia.com/model/uploads/modelimages/Toyota-Innova-Crysta-020320231741.jpg?w=1280&q=75",
    "https://stimg.cardekho.com/images/carinteriorimages/930x620/Toyota/Innova-Crysta/8105/1606215327927/dashboard-59.jpg?imwidth=890&impolicy=resize",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/222736/innova-crysta-2026-exterior-right-front-three-quarter-8.jpeg?isig=0&q=80",
    "https://imgd.aeplcdn.com/1280x720/n/cw/ec/222736/innova-crysta-2026-exterior-right-front-three-quarter.png?isig=0&q=80&wm=1",
  ],
};

function curlDownload(url) {
  const tmp = path.join("/tmp", `veh-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
  const result = spawnSync(
    "curl",
    ["-fsSL", "--max-time", "45", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", "-e", new URL(url).origin + "/", "-g", "-L", "-o", tmp, url],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    try {
      unlinkSync(tmp);
    } catch {}
    throw new Error((result.stderr || "curl failed").slice(0, 160));
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
    const full = path.join(outDir, file);
    if (!existsSync(full)) continue;
    const rel = `vehicles/photos/${file}`;
    let url = `/uploads/${rel}`;
    let key = rel;
    let driver = "local";

    if (!localOnly) {
      const base = file.replace(/\.jpe?g$/i, "");
      const publicId = `worldcompass/vehicles/${base}/cover`;
      const uploaded = await uploadCloudinaryBuffer({
        buffer: readFileSync(full),
        publicId,
      });
      url = uploaded.url;
      key = uploaded.key;
      driver = "cloudinary";
      console.log(`  cloudinary ${file}`);
    }

    rows.push({
      vehicleId,
      url,
      key,
      driver,
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
    if (bikesOnly && vehicle.kind !== "bike") continue;
    if (onlySlugs.size && !onlySlugs.has(vehicle.slug)) continue;
    const urls = sources[vehicle.slug] || [];
    console.log(`\n=== ${vehicle.kind} ${vehicle.slug} (${urls.length} urls)`);
    if (!urls.length) {
      console.log("  GAP — add BikeDekho/official URLs");
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
