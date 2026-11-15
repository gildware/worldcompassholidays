/**
 * Force true autumn foliage onto Photography & Autumn Chinar Tour.
 * Builds a verified autumn pool, assigns unique cover/gallery, then
 * day shots as alternate crops from the same autumn pool.
 *
 *   npx tsx scripts/fix-autumn-chinar-images.ts
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp, { type Gravity } from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (autumn-chinar foliage fix; hi@worldcompassholiday.com)";
const slug = "photography-autumn-chinar-tour";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
mkdirSync(tourDir, { recursive: true });

const AUTUMN_TITLES = [
  "File:Fall in kashmir.JPG",
  "File:Dal lake in Autumn.jpg",
  "File:A view of fallen chinar leaves (Kashmir).jpg",
  "File:Autumn leaves on the way to Pari Mahal ,Srinagar ,Kashmir - panoramio.jpg",
  "File:Forget (49600148331).jpg",
  "File:Houseboat @ Chinar Bagh Garden, Srinagar, Kashmir - panoramio.jpg",
  "File:Chinar Bagh Garden @ Srinagar,Kashmir - panoramio.jpg",
  "File:Chinar bagh.jpg",
  "File:Nigeen Lake pano (edited).jpg",
  "File:Kashmir-Kayhan.jpg",
];

const SAFFRON_TITLES = [
  "File:Bunch of blooming saffron flowers.jpg",
  "File:Saffron flowers.jpg",
  "File:Crocus sativus 002.JPG",
];

type Picked = {
  title: string;
  license: string;
  buf: Buffer;
  hash: string;
  score: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function imageInfo(title: string) {
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

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function autumnScore(buf: Buffer) {
  const { data } = await sharp(buf)
    .resize(160, 100, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let warm = 0;
  let green = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    total += 1;
    if (r > 85 && r >= g - 5 && g > b + 8 && r - b > 20) warm += 1;
    if (g > r + 18 && g > b + 18 && g > 65) green += 1;
  }
  return warm / total - green / total;
}

async function collect(titles: string[], minScore: number): Promise<Picked[]> {
  const out: Picked[] = [];
  const seen = new Set<string>();
  for (const title of titles) {
    await sleep(650);
    const meta = await imageInfo(title);
    if (!meta) {
      console.log(`  miss ${title}`);
      continue;
    }
    try {
      const buf = await download(meta.url);
      const hash = createHash("sha1").update(buf).digest("hex");
      if (seen.has(hash)) continue;
      const score = await autumnScore(buf);
      if (score < minScore) {
        console.log(`  skip ${title} score=${score.toFixed(3)}`);
        continue;
      }
      seen.add(hash);
      out.push({ title, license: meta.license, buf, hash, score });
      console.log(`  pool + ${title} score=${score.toFixed(3)}`);
    } catch (error) {
      console.log(`  err ${title}`, error instanceof Error ? error.message : error);
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

async function writeCrop(
  pick: Picked,
  file: string,
  w: number,
  h: number,
  gravity: Gravity,
  note: string,
) {
  const processed = await sharp(pick.buf)
    .rotate()
    .resize(w, h, { fit: "cover", position: gravity })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  writeFileSync(path.join(tourDir, file), processed);
  console.log(`  ok  ${file} ← ${pick.title} (${note})`);
  return `${file}  ←  ${pick.title} (${pick.license}) ${note}`;
}

async function main() {
  console.log("Collecting autumn pool…");
  const autumn = await collect(AUTUMN_TITLES, 0.02);
  if (autumn.length < 3) throw new Error(`Need ≥3 autumn photos; got ${autumn.length}`);

  console.log("Collecting saffron pool…");
  const saffron = await collect(SAFFRON_TITLES, -1);

  const attribution: string[] = [
    `# ${slug} AUTUMN fix ${new Date().toISOString()}`,
    "",
  ];

  // Unique best for cover + gallery
  const unique = [...autumn];
  const take = () => {
    const next = unique.shift();
    if (!next) throw new Error("Autumn pool exhausted");
    return next;
  };

  attribution.push(
    await writeCrop(take(), `${slug}-cover.jpg`, 1920, 1080, "centre", "cover"),
  );
  attribution.push(await writeCrop(take(), `${slug}-g1.jpg`, 1600, 1067, "centre", "gallery"));
  attribution.push(await writeCrop(take(), `${slug}-g2.jpg`, 1600, 1067, "centre", "gallery"));
  attribution.push(
    await writeCrop(
      unique[0] ?? autumn[0],
      `${slug}-g3.jpg`,
      1600,
      1067,
      "north",
      "gallery-crop-north",
    ),
  );
  if (unique[0]) unique.shift();
  attribution.push(
    await writeCrop(
      unique[0] ?? autumn[1] ?? autumn[0],
      `${slug}-g4.jpg`,
      1600,
      1067,
      "east",
      "gallery-crop-east",
    ),
  );

  // Day images: rotate crops across autumn pool (+ saffron for day 3)
  const dayPlan: { n: number; gravity: Gravity; pick: Picked }[] = [
    { n: 1, gravity: "west", pick: autumn[0] },
    { n: 2, gravity: "south", pick: autumn[1] ?? autumn[0] },
    {
      n: 3,
      gravity: "centre",
      pick: saffron[0] ?? autumn[2] ?? autumn[0],
    },
    { n: 4, gravity: "north", pick: autumn[2] ?? autumn[0] },
    { n: 5, gravity: "east", pick: autumn[3] ?? autumn[1] ?? autumn[0] },
    { n: 6, gravity: "centre", pick: autumn[0] },
  ];

  for (const day of dayPlan) {
    attribution.push(
      await writeCrop(
        day.pick,
        `${slug}-d${day.n}.jpg`,
        1400,
        933,
        day.gravity,
        `day${day.n}-${day.gravity}`,
      ),
    );
  }

  writeFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), attribution.join("\n") + "\n");

  const prisma = new PrismaClient();
  try {
    const coverRel = `tours/${slug}-cover.jpg`;
    const gallery = ["g1", "g2", "g3", "g4"].map((s) => ({
      url: `/uploads/tours/${slug}-${s}.jpg`,
      key: `tours/${slug}-${s}.jpg`,
      driver: "local",
    }));
    const tour = await prisma.tour.update({
      where: { slug },
      data: {
        imageUrl: `/uploads/${coverRel}`,
        imageKey: coverRel,
        imageDriver: "local",
        featuredImageUrl: `/uploads/${coverRel}`,
        featuredImageKey: coverRel,
        featuredImageDriver: "local",
        galleryJson: JSON.stringify(gallery),
        seoImageUrl: `/uploads/${coverRel}`,
        seoImageKey: coverRel,
        seoImageDriver: "local",
      },
      select: { id: true },
    });
    for (let n = 1; n <= 6; n += 1) {
      const key = `tours/${slug}-d${n}.jpg`;
      await prisma.itineraryDay.updateMany({
        where: { tourId: tour.id, dayNumber: n },
        data: {
          imageUrl: `/uploads/${key}`,
          imageKey: key,
          imageDriver: "local",
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Done. Hard-refresh http://localhost:3000/tours/${slug}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
