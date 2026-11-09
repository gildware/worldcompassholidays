/**
 * Replace destination covers with place-specific Wikimedia Commons photos,
 * upload to Cloudinary, and update the database.
 *
 *   npx tsx scripts/replace-destination-covers.ts
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

function loadEnv(file: string) {
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(path.join(process.cwd(), ".env"));

const agent =
  "WorldCompassHoliday/1.0 (destination covers; hi@worldcompassholiday.com)";
const outDir = path.join(process.cwd(), "public", "uploads", "destinations");
const candDir = path.join(process.cwd(), "tmp", "dest-candidates");
mkdirSync(outDir, { recursive: true });
mkdirSync(candDir, { recursive: true });

type Pick = { title: string; url: string; thumb?: string };

async function searchBest(query: string): Promise<Pick | null> {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("list", "search");
  api.searchParams.set("srsearch", `${query} filetype:bitmap`);
  api.searchParams.set("srnamespace", "6");
  api.searchParams.set("srlimit", "12");
  api.searchParams.set("format", "json");
  const res = await fetch(api, { headers: { "User-Agent": agent } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { search?: { title: string }[] };
  };
  for (const item of data.query?.search ?? []) {
    if (/logo|map|flag|svg|diagram|icon|poster|army|minister|chief/i.test(item.title)) {
      continue;
    }
    const infoApi = new URL("https://commons.wikimedia.org/w/api.php");
    infoApi.searchParams.set("action", "query");
    infoApi.searchParams.set("titles", item.title);
    infoApi.searchParams.set("prop", "imageinfo");
    infoApi.searchParams.set("iiprop", "url|size|mime|extmetadata");
    infoApi.searchParams.set("iiurlwidth", "1920");
    infoApi.searchParams.set("format", "json");
    const infoRes = await fetch(infoApi, { headers: { "User-Agent": agent } });
    if (!infoRes.ok) continue;
    const infoData = (await infoRes.json()) as {
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
    const page = Object.values(infoData.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (!info?.url) continue;
    if (!String(info.mime || "").startsWith("image/")) continue;
    const lic = (info.extmetadata?.LicenseShortName?.value || "").toLowerCase();
    if (lic.includes("nc") || lic.includes("noncommercial")) continue;
    return {
      title: item.title,
      url: (info.thumburl || info.url).split("?")[0],
      thumb: info.thumburl?.split("?")[0],
    };
  }
  return null;
}

async function download(url: string): Promise<Buffer> {
  const clean = url.split("?")[0];
  const res = await fetch(clean, {
    headers: {
      "User-Agent": agent,
      Referer: "https://commons.wikimedia.org/",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${clean}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const picksPath = path.join(candDir, "picks.json");
  const picks = JSON.parse(readFileSync(picksPath, "utf8")) as Record<
    string,
    Pick
  >;

  if (!picks.daksum) {
    const daksum =
      (await searchBest("Daksum Kashmir valley pine")) ||
      (await searchBest("Daksum Anantnag")) ||
      (await searchBest("Bringhi valley Kashmir"));
    if (daksum) {
      picks.daksum = daksum;
      console.log(`daksum pick: ${daksum.title}`);
    }
  }

  // Better Tangmarg if we can find a titled match
  const tang =
    (await searchBest("Tangmarg Kashmir")) ||
    (await searchBest("Tangmarg Gulmarg road pine"));
  if (tang && /tangmarg/i.test(tang.title)) {
    picks.tangmarg = tang;
    console.log(`tangmarg pick: ${tang.title}`);
  }

  const { uploadCloudinaryBuffer } = await import("../src/lib/storage/cloudinary");
  const prisma = new PrismaClient();
  const usedHashes = new Set<string>();
  let ok = 0;
  let failed = 0;

  try {
    for (const [slug, pick] of Object.entries(picks)) {
      try {
        console.log(`\n→ ${slug}  (${pick.title})`);
        let raw: Buffer;
        try {
          raw = await download(pick.url);
        } catch {
          if (pick.thumb && pick.thumb !== pick.url) {
            raw = await download(pick.thumb);
          } else {
            throw new Error("download failed");
          }
        }
        const hash = createHash("sha1").update(raw).digest("hex");
        if (usedHashes.has(hash)) {
          console.warn("  duplicate image hash — searching alternate");
          const alt = await searchBest(
            `${slug.replace(/-/g, " ")} Kashmir landscape landmark`,
          );
          if (!alt) throw new Error("duplicate and no alternate");
          raw = await download(alt.url);
          const hash2 = createHash("sha1").update(raw).digest("hex");
          if (usedHashes.has(hash2)) throw new Error("alternate also duplicate");
          usedHashes.add(hash2);
          console.log(`  alt: ${alt.title}`);
        } else {
          usedHashes.add(hash);
        }

        const processed = await sharp(raw)
          .rotate()
          .resize(1600, 1067, { fit: "cover", position: "centre" })
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
        writeFileSync(path.join(outDir, `${slug}.jpg`), processed);
        writeFileSync(path.join(candDir, `${slug}-final.jpg`), processed);

        const uploaded = await uploadCloudinaryBuffer({
          buffer: processed,
          publicId: `worldcompass/destinations/${slug}`,
        });

        const row = await prisma.destination.findUnique({ where: { slug } });
        if (!row) {
          console.warn("  no DB row — file + Cloudinary only");
        } else {
          let galleryJson = row.galleryJson;
          try {
            const gallery = JSON.parse(galleryJson || "[]") as {
              url?: string;
              key?: string;
              driver?: string;
            }[];
            if (Array.isArray(gallery) && gallery.length > 0) {
              gallery[0] = {
                url: uploaded.url,
                key: uploaded.key,
                driver: "cloudinary",
              };
              galleryJson = JSON.stringify(gallery);
            }
          } catch {
            /* keep */
          }
          await prisma.destination.update({
            where: { slug },
            data: {
              imageUrl: uploaded.url,
              imageKey: uploaded.key,
              imageDriver: "cloudinary",
              galleryJson,
            },
          });
        }
        console.log(`  ok ${uploaded.url}`);
        ok += 1;
      } catch (error) {
        failed += 1;
        console.error(
          `  FAIL ${slug}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\nDone. ${ok} updated, ${failed} failed.`);
  const attr = path.join(outDir, "ATTRIBUTION.txt");
  const note = `Destination covers refreshed ${new Date().toISOString()} from Wikimedia Commons (CC BY-SA / free licenses). See Commons file pages for photographer credits.\n`;
  writeFileSync(
    attr,
    existsSync(attr) ? `${readFileSync(attr, "utf8")}\n${note}` : note,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
