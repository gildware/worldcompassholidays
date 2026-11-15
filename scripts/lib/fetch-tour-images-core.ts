/**
 * Shared Wikimedia fetch + uniqueness + DB wire for locked-format tour images.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import {
  claimSource,
  hashBuffer,
  isTitleBlocked,
  loadOtherTourImageBlocklist,
  type TourImageBlocklist,
} from "./tour-image-uniqueness";

export type ImageTarget = {
  file: string;
  dayNumber?: number;
  place: string;
  titles: string[];
  localFallbacks?: string[];
  w: number;
  h: number;
  skipSearch?: boolean;
};

export type TourImageJob = {
  slug: string;
  targets: ImageTarget[];
};

const agent =
  "WorldCompassHoliday/1.0 (tour images; hi@worldcompassholiday.com)";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function info(title: string) {
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

async function searchTitles(query: string): Promise<string[]> {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("list", "search");
  u.searchParams.set("srsearch", `${query} filetype:bitmap`);
  u.searchParams.set("srnamespace", "6");
  u.searchParams.set("srlimit", "24");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  const placeTokens = query
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase())
    .filter((w) => w.length >= 4)
    .filter(
      (w) =>
        !/india|indian|tour|trek|lake|river|fort|temple|park|national|safari|view|from|with|near|over|into|hill|hills|mountain|valley|forest|meadow|grass|snow|peak|road|town|city|village|camp|beach|cover|gallery|site|place|area|south|north|east|west|quiet|resort|hotel|arrival|depart|circuit|complex|morning|evening|afternoon|sunrise|sunset|capital|province|district|state/i.test(
          w,
        ),
    );
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter(
      (title) =>
        !/logo|map|flag|svg|diagram|icon|poster|stamp|sketch|coin|medal|gps|coordinate|collage|montage|screenshot|chart|graph|british airmen|raf |wwii|world war|postcard template|lane departure|tuileries|tegelberg|aerostatic|balloon|wheat harvest|harvesting wheat/i.test(
          title,
        ),
    )
    .filter((title) => {
      if (!placeTokens.length) return true;
      const hay = title.toLowerCase();
      // At least one distinctive place token must appear in the Commons title
      return placeTokens.some((token) => hay.includes(token));
    });
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveBytes(
  target: ImageTarget,
  block: TourImageBlocklist,
  uploads: string,
) {
  async function tryTitles(titles: string[]) {
    for (const title of titles) {
      if (isTitleBlocked(title, block)) continue;
      await sleep(500);
      try {
        const meta = await info(title);
        if (!meta) continue;
        const raw = await download(meta.url);
        const hash = hashBuffer(raw);
        if (!claimSource(block, { hash, title })) continue;
        return { buffer: raw, source: `${title} (${meta.license})` };
      } catch {
        continue;
      }
    }
    return null;
  }

  // 1) Curated titles first
  const curated = await tryTitles(target.titles);
  if (curated) return curated;

  // 2) Strict place search — every result must contain a distinctive place token
  if (!target.skipSearch) {
    const placeRoot = target.place.split(/[·—|,]/)[0].trim();
    const strict = await searchTitles(placeRoot);
    const found = await tryTitles(strict.filter((t) => !target.titles.includes(t)));
    if (found) return found;
  }

  // 3) Local destination fallbacks last
  for (const rel of target.localFallbacks ?? []) {
    const file = path.join(uploads, rel);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file);
    const hash = hashBuffer(raw);
    if (!claimSource(block, { hash })) continue;
    return { buffer: raw, source: `local:${rel}` };
  }
  throw new Error(`No unique image for ${target.file}`);
}

function localAsset(uploads: string, rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

/** Cover 16:10-ish, gallery 4:3, day 3:2 — matching prior scripts. */
export function cover(file: string, place: string, titles: string[], localFallbacks?: string[]): ImageTarget {
  return { file, place, titles, localFallbacks, w: 1920, h: 1080 };
}
export function gallery(file: string, place: string, titles: string[], localFallbacks?: string[]): ImageTarget {
  return { file, place, titles, localFallbacks, w: 1600, h: 1067 };
}
export function day(
  file: string,
  dayNumber: number,
  place: string,
  titles: string[],
  localFallbacks?: string[],
): ImageTarget {
  return { file, dayNumber, place, titles, localFallbacks, w: 1400, h: 933 };
}

export async function fetchAndWireTourImages(
  job: TourImageJob,
  opts: { dbOnly?: boolean; sharedBlock?: TourImageBlocklist } = {},
) {
  const uploads = path.join(process.cwd(), "public", "uploads");
  const tourDir = path.join(uploads, "tours");
  mkdirSync(tourDir, { recursive: true });

  const block =
    opts.sharedBlock ?? loadOtherTourImageBlocklist(tourDir, job.slug);
  console.log(
    `\n[${job.slug}] blocklist hashes=${block.hashes.size} titles=${block.titles.size}`,
  );

  if (!opts.dbOnly) {
    const attrPath = path.join(tourDir, `${job.slug}-ATTRIBUTION.txt`);
    const attribution: string[] = existsSync(attrPath)
      ? readFileSync(attrPath, "utf8").trimEnd().split("\n")
      : [`# ${job.slug} ${new Date().toISOString()}`, ""];
    for (const target of job.targets) {
      const outFile = path.join(tourDir, target.file);
      if (existsSync(outFile)) {
        claimSource(block, { hash: hashBuffer(readFileSync(outFile)) });
        console.log(`· keep ${target.file}`);
        continue;
      }
      console.log(`→ ${target.file}  (${target.place})`);
      const { buffer, source } = await resolveBytes(target, block, uploads);
      const processed = await sharp(buffer)
        .rotate()
        .resize(target.w, target.h, { fit: "cover", position: "centre" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
      claimSource(block, { hash: hashBuffer(processed) });
      writeFileSync(outFile, processed);
      attribution.push(`${target.file}  ←  ${source}`);
      console.log(`  ok  ${source}`);
    }
    writeFileSync(attrPath, attribution.join("\n") + "\n");
  }

  const prisma = new PrismaClient();
  try {
    const coverAsset = localAsset(uploads, `tours/${job.slug}-cover.jpg`);
    if (!coverAsset) throw new Error(`Missing cover for ${job.slug}`);
    const galleryAssets = ["g1", "g2", "g3", "g4"]
      .map((s) => localAsset(uploads, `tours/${job.slug}-${s}.jpg`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (galleryAssets.length < 4) {
      throw new Error(`${job.slug}: need ≥4 gallery, got ${galleryAssets.length}`);
    }
    const tour = await prisma.tour.update({
      where: { slug: job.slug },
      data: {
        imageUrl: coverAsset.url,
        imageKey: coverAsset.key,
        imageDriver: coverAsset.driver,
        featuredImageUrl: coverAsset.url,
        featuredImageKey: coverAsset.key,
        featuredImageDriver: coverAsset.driver,
        galleryJson: JSON.stringify(
          galleryAssets.map((item) => ({
            url: item.url,
            key: item.key,
            driver: item.driver,
          })),
        ),
        seoImageUrl: coverAsset.url,
        seoImageKey: coverAsset.key,
        seoImageDriver: coverAsset.driver,
      },
      select: { id: true },
    });
    for (const target of job.targets.filter((t) => t.dayNumber)) {
      const asset = localAsset(uploads, `tours/${target.file}`);
      if (!asset) continue;
      await prisma.itineraryDay.updateMany({
        where: { tourId: tour.id, dayNumber: target.dayNumber },
        data: {
          imageUrl: asset.url,
          imageKey: asset.key,
          imageDriver: asset.driver,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Live: http://localhost:3000/tours/${job.slug}`);
}

/** Shared blocklist that accumulates claims across a multi-tour batch run. */
export function createBatchBlocklist(firstSlug: string) {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  return loadOtherTourImageBlocklist(tourDir, firstSlug);
}
