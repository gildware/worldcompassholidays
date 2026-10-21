import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), "public", "uploads", "vehicles", "photos");
const bannerFile = path.join(process.cwd(), "public", "img", "cars", "car-rental-banner.jpg");
const agent = "WorldCompassHoliday/1.0 (car catalog; local travel site)";

function freeLicense(name = "") {
  const value = name.toLowerCase();
  if (value.includes("non-commercial") || value.includes("noncommercial") || value.includes("-nc")) return false;
  return /cc0|public domain|cc by|cc-by|gfdl|attribution-share|creative commons/.test(value);
}

function banned(title = "") {
  return /logo|icon|diagram|chart|map|flag|poster|advert|drawing|svg|coat of arms|signature|emblem|interior|cockpit|dashboard|engine bay|dtm|racing|wreck|burnt|burned|destroyed/i.test(title);
}

async function search(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");
  url.searchParams.set("iiurlwidth", "1200");
  const response = await fetch(url, { headers: { "User-Agent": agent, "Api-User-Agent": agent } });
  if (!response.ok) return [];
  const data = await response.json();
  return Object.values(data.query?.pages ?? {});
}

function pick(pages, hints, { landscape = false, must = "" } = {}) {
  const words = hints.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const required = must.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const ranked = pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const mime = info.mime || "";
      if (!/jpeg|png|webp/.test(mime)) return null;
      if (banned(page.title || "")) return null;
      const license = info.extmetadata?.LicenseShortName?.value || "";
      if (!freeLicense(license)) return null;
      const width = info.thumbwidth || info.width || 0;
      const height = info.thumbheight || info.height || 0;
      if (width < (landscape ? 1000 : 500)) return null;
      if (landscape && height > 0 && width < height * 1.4) return null;
      const title = (page.title || "").toLowerCase();
      if (required.some((word) => !title.includes(word))) return null;
      const hits = words.reduce((total, word) => total + (title.includes(word) ? 1 : 0), 0);
      if (hits === 0) return null;
      const score = hits * 2 + Math.min(width, 1600) / 800;
      return { score, url: info.thumburl || info.url, title: page.title };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  return ranked[0] ?? null;
}

async function download(url, file) {
  const response = await fetch(url, { headers: { "User-Agent": agent } });
  if (!response.ok) throw new Error(String(response.status));
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 8000) throw new Error("too small");
  await writeFile(file, bytes);
}

await mkdir(path.dirname(bannerFile), { recursive: true });
if (!existsSync(bannerFile)) {
  try {
    const title =
      "File:DZ6 2206 A lively seaside street at dusk with scooters and cars passing parked along the palm-lined road.jpg";
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("titles", title);
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url");
    url.searchParams.set("iiurlwidth", "1800");
    const response = await fetch(url, { headers: { "User-Agent": agent, "Api-User-Agent": agent } });
    const data = await response.json();
    const page = Object.values(data.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (info?.thumburl || info?.url) {
      await download(info.thumburl || info.url, bannerFile);
      console.log("banner", title);
    } else {
      console.log("banner miss");
    }
  } catch (error) {
    console.log("banner fail", error.message);
  }
}

const cars = await prisma.vehicle.findMany({
  where: { kind: "car" },
  select: { id: true, slug: true, name: true, brand: true, modelName: true },
  orderBy: { name: "asc" },
});

await mkdir(outDir, { recursive: true });
const missed = [];

for (const car of cars) {
  const file = path.join(outDir, `${car.slug}.jpg`);
  const queries = [`${car.brand} ${car.modelName}`.trim(), car.name].filter(
    (query, index, all) => query && all.indexOf(query) === index,
  );

  let chosen = null;
  for (const query of queries) {
    const pages = await search(query);
    chosen = pick(pages, query, { must: car.modelName });
    if (chosen) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  try {
    if (chosen?.url?.startsWith("http")) {
      await download(chosen.url, file);
      console.log("ok", car.slug, chosen.title);
    } else {
      missed.push(car.slug);
      console.log("miss", car.slug);
    }
  } catch (error) {
    missed.push(car.slug);
    chosen = null;
    console.log("fail", car.slug, error.message);
  }

  if (chosen) {
    const url = `/uploads/vehicles/photos/${car.slug}.jpg`;
    const image = await prisma.vehicleImage.findFirst({
      where: { vehicleId: car.id },
      orderBy: { sortOrder: "asc" },
    });
    if (image) {
      await prisma.vehicleImage.update({
        where: { id: image.id },
        data: { url, key: `vehicles/photos/${car.slug}.jpg` },
      });
    } else {
      await prisma.vehicleImage.create({
        data: { vehicleId: car.id, url, key: `vehicles/photos/${car.slug}.jpg`, driver: "local", sortOrder: 0 },
      });
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

console.log("missed", missed.join(", ") || "none");
await prisma.$disconnect();
