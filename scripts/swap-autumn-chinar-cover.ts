/**
 * Replace Photography & Autumn Chinar cover with a stronger scenic autumn hero.
 *
 *   npx tsx scripts/swap-autumn-chinar-cover.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (autumn-chinar cover swap; hi@worldcompassholiday.com)";
const slug = "photography-autumn-chinar-tour";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

const CANDIDATES = [
  "File:Dal lake in Autumn.jpg",
  "File:Fall in kashmir.JPG",
  "File:A view of fallen chinar leaves (Kashmir).jpg",
  "File:Nigeen Lake pano (edited).jpg",
];

async function fetchTitle(title: string) {
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
            extmetadata?: { LicenseShortName?: { value?: string } };
          }[];
        }
      >;
    };
  };
  const ii = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!ii?.url || !String(ii.mime || "").startsWith("image/")) return null;
  const url = (ii.thumburl || ii.url).split("?")[0];
  const img = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!img.ok) return null;
  return {
    title,
    license: ii.extmetadata?.LicenseShortName?.value ?? "",
    buf: Buffer.from(await img.arrayBuffer()),
  };
}

async function main() {
  let pick: { title: string; license: string; buf: Buffer } | null = null;
  for (const title of CANDIDATES) {
    console.log("try", title);
    try {
      pick = await fetchTitle(title);
      if (pick) {
        console.log("got", title, pick.buf.length);
        break;
      }
    } catch (error) {
      console.log("fail", title, error instanceof Error ? error.message : error);
    }
  }

  if (!pick) {
    const fallback = readFileSync(path.join(tourDir, `${slug}-g4.jpg`));
    pick = { title: "gallery-g4-fallback", license: "local", buf: fallback };
    console.log("using local g4 fallback");
  }

  const cover = await sharp(pick.buf)
    .rotate()
    .resize(1920, 1080, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  writeFileSync(path.join(tourDir, `${slug}-cover.jpg`), cover);
  console.log("wrote cover", cover.length, "from", pick.title);

  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  let attr = readFileSync(attrPath, "utf8");
  attr = attr.replace(
    new RegExp(`${slug}-cover\\.jpg.*`),
    `${slug}-cover.jpg  ←  ${pick.title} (${pick.license}) cover-swap`,
  );
  writeFileSync(attrPath, attr);

  const coverRel = `tours/${slug}-cover.jpg`;
  const prisma = new PrismaClient();
  try {
    await prisma.tour.update({
      where: { slug },
      data: {
        imageUrl: `/uploads/${coverRel}`,
        imageKey: coverRel,
        imageDriver: "local",
        featuredImageUrl: `/uploads/${coverRel}`,
        featuredImageKey: coverRel,
        featuredImageDriver: "local",
        seoImageUrl: `/uploads/${coverRel}`,
        seoImageKey: coverRel,
        seoImageDriver: "local",
      },
    });
    console.log("db updated");
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Hard-refresh http://localhost:3000/tours/${slug}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
