import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), "public", "uploads", "vehicles", "photos");
const agent = "WorldCompassHoliday/1.0 (bike catalog; local travel site)";

function freeLicense(name = "") {
  const value = name.toLowerCase();
  if (value.includes("non-commercial") || value.includes("noncommercial") || value.includes("-nc")) return false;
  return /cc0|public domain|cc by|cc-by|gfdl|attribution-share|creative commons/.test(value);
}

function banned(title = "") {
  return /logo|icon|diagram|chart|map|flag|poster|advert|drawing|svg|coat of arms|signature|emblem/i.test(title);
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
  url.searchParams.set("iiurlwidth", "1000");
  const response = await fetch(url, { headers: { "User-Agent": agent, "Api-User-Agent": agent } });
  if (!response.ok) return [];
  const data = await response.json();
  return Object.values(data.query?.pages ?? {});
}

function pick(pages, hints) {
  const words = hints.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
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
      if (width < 500) return null;
      const title = (page.title || "").toLowerCase();
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

const bikes = await prisma.vehicle.findMany({
  where: { kind: "bike" },
  select: { id: true, slug: true, name: true, brand: true, modelName: true },
  orderBy: { name: "asc" },
});

await mkdir(outDir, { recursive: true });
const saved = new Map();
const missed = [];

for (const bike of bikes) {
  const file = path.join(outDir, `${bike.slug}.jpg`);
  const queries = [
    `${bike.brand} ${bike.modelName}`.trim(),
    bike.name.replace(/\s+(Leh|Manali|Kochi)$/i, ""),
    bike.brand,
  ].filter((query, index, all) => query && all.indexOf(query) === index);

  let chosen = null;
  for (const query of queries) {
    const pages = await search(query);
    chosen = pick(pages, query);
    if (chosen) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  if (!chosen && saved.has(bike.brand)) {
    const source = saved.get(bike.brand);
    await writeFile(file, await (await import("node:fs/promises")).readFile(source));
    chosen = { title: `copy ${bike.brand}`, url: source };
  }

  try {
    if (chosen?.url?.startsWith("http")) {
      await download(chosen.url, file);
      saved.set(bike.brand, file);
      console.log("ok", bike.slug, chosen.title);
    } else if (chosen) {
      saved.set(bike.brand, file);
      console.log("copy", bike.slug, chosen.title);
    } else {
      missed.push(bike.slug);
      console.log("miss", bike.slug);
    }
  } catch (error) {
    missed.push(bike.slug);
    console.log("fail", bike.slug, error.message);
  }

  if (chosen) {
    const url = `/uploads/vehicles/photos/${bike.slug}.jpg`;
    const image = await prisma.vehicleImage.findFirst({ where: { vehicleId: bike.id }, orderBy: { sortOrder: "asc" } });
    if (image) {
      await prisma.vehicleImage.update({ where: { id: image.id }, data: { url, key: `vehicles/photos/${bike.slug}.jpg` } });
    } else {
      await prisma.vehicleImage.create({
        data: { vehicleId: bike.id, url, key: `vehicles/photos/${bike.slug}.jpg`, driver: "local", sortOrder: 0 },
      });
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

console.log("missed", missed.join(", ") || "none");
await prisma.$disconnect();
