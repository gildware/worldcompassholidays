/**
 * Replace a few Phase-1 images that failed or matched the wrong place.
 *   npx tsx scripts/fix-phase1-bad-images.ts --upload
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (phase1 image fix; hi@worldcompassholiday.com)";
const uploads = path.join(process.cwd(), "public", "uploads");
const logDir = path.join(process.cwd(), "tmp", "phase1-images");
mkdirSync(logDir, { recursive: true });

type Spec = { rel: string; queries: string[]; preferTitle: RegExp; reject?: RegExp };

const FIXES: Spec[] = [
  {
    rel: "tours/hampta-pass-chandratal-trek-g2.jpg",
    queries: [
      "Hampta Pass Himachal landscape",
      "Hampta Pass trek meadow",
      "Balu ka Ghera Hampta",
    ],
    preferTitle: /hampta|hamtah|chika|jobra|lahaul|manali/i,
    reject: /logo|map|flag|nepal|tribeni/i,
  },
  {
    rel: "tours/char-dham-yatra-by-helicopter-cover.jpg",
    queries: [
      "Kedarnath Temple Uttarakhand snow",
      "Kedarnath Temple frontal Himalaya",
      "Kedarnath shrine amphitheatre",
    ],
    preferTitle: /kedarnath/i,
    reject: /nepal|tribeni|logo|map|flag|relief|truck/i,
  },
  {
    rel: "destinations/guptkashi.jpg",
    queries: [
      "Guptakashi Vishwanath temple",
      "Guptkashi temple Uttarakhand",
      "Ancient temple Guptakashi",
    ],
    preferTitle: /gupt/i,
    reject: /relief|truck|army|logo|map|flag/i,
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikiJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": agent } });
  if (res.status === 429) {
    await sleep(10000);
    const retry = await fetch(url, { headers: { "User-Agent": agent } });
    if (!retry.ok) throw new Error(`HTTP ${retry.status}`);
    return retry.json();
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function search(query: string) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("list", "search");
  api.searchParams.set("srsearch", `${query} filetype:bitmap`);
  api.searchParams.set("srnamespace", "6");
  api.searchParams.set("srlimit", "15");
  api.searchParams.set("format", "json");
  const data = (await wikiJson(api.toString())) as {
    query?: { search?: { title: string }[] };
  };
  return (data.query?.search ?? []).map((x) => x.title);
}

async function imageUrl(title: string) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("titles", title);
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url|mime|size|extmetadata");
  api.searchParams.set("iiurlwidth", "1920");
  api.searchParams.set("format", "json");
  const data = (await wikiJson(api.toString())) as {
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
  const info = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!info?.url) return null;
  if (!String(info.mime || "").startsWith("image/") || String(info.mime).includes("svg")) {
    return null;
  }
  const lic = (info.extmetadata?.LicenseShortName?.value || "").toLowerCase();
  if (lic.includes("nc") || lic.includes("noncommercial")) return null;
  return (info.thumburl || info.url).split("?")[0];
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function collectUsedHashes() {
  const used = new Set<string>();
  for (const folder of ["tours", "destinations"] as const) {
    const dir = path.join(uploads, folder);
    if (!existsSync(dir)) continue;
    for (const name of require("node:fs").readdirSync(dir) as string[]) {
      if (!/\.jpe?g$/i.test(name)) continue;
      const buf = readFileSync(path.join(dir, name));
      used.add(createHash("sha1").update(buf).digest("hex"));
    }
  }
  return used;
}

async function main() {
  const upload = process.argv.includes("--upload");
  const used = collectUsedHashes();

  for (const spec of FIXES) {
    console.log(`\n→ ${spec.rel}`);
    const titles: string[] = [];
    for (const q of spec.queries) {
      await sleep(2000);
      try {
        for (const t of await search(q)) {
          if (!titles.includes(t)) titles.push(t);
        }
      } catch (e) {
        console.warn("  search", e instanceof Error ? e.message : e);
      }
    }
    const ordered = [
      ...titles.filter((t) => spec.preferTitle.test(t)),
      ...titles.filter((t) => !spec.preferTitle.test(t)),
    ];

    let saved = false;
    for (const title of ordered) {
      if (spec.reject?.test(title)) continue;
      if (!spec.preferTitle.test(title) && titles.filter((t) => spec.preferTitle.test(t)).length) {
        // Prefer regex matches; only fall through after those fail.
      }
      await sleep(1000);
      try {
        const url = await imageUrl(title);
        if (!url) continue;
        const raw = await download(url);
        const hash = createHash("sha1").update(raw).digest("hex");
        if (used.has(hash)) {
          console.log(`  dup ${title}`);
          continue;
        }
        if (!spec.preferTitle.test(title)) continue;

        const out = path.join(uploads, spec.rel);
        mkdirSync(path.dirname(out), { recursive: true });
        const processed = await sharp(raw)
          .rotate()
          .resize(1600, 1067, { fit: "cover", position: "centre" })
          .jpeg({ quality: 86, mozjpeg: true })
          .toBuffer();
        writeFileSync(out, processed);
        used.add(createHash("sha1").update(processed).digest("hex"));
        writeFileSync(
          path.join(logDir, "fix-attribution.txt"),
          `${spec.rel} ← ${title}\n`,
          { flag: "a" },
        );
        console.log(`  ok ${title}`);
        saved = true;

        if (upload) {
          const { uploadCloudinaryBuffer } = await import("../src/lib/storage/cloudinary");
          const noExt = spec.rel.replace(/\.[a-z0-9]+$/i, "");
          const tourMatch = noExt.match(/^tours\/(.+)-(cover|g\d+)$/);
          let publicId: string;
          if (tourMatch) {
            const kind = tourMatch[2].startsWith("g")
              ? `gallery-${tourMatch[2].slice(1)}`
              : tourMatch[2];
            publicId = `worldcompass/tours/${tourMatch[1]}/${kind}`;
          } else {
            publicId = `worldcompass/${noExt}`;
          }
          const uploaded = await uploadCloudinaryBuffer({
            buffer: processed,
            publicId,
          });
          console.log(`  cloudinary ${uploaded.key}`);
          if (noExt.startsWith("destinations/")) {
            const { PrismaClient } = await import("@prisma/client");
            const prisma = new PrismaClient();
            const slug = noExt.replace("destinations/", "");
            await prisma.destination.updateMany({
              where: { slug },
              data: {
                imageUrl: uploaded.url,
                imageKey: uploaded.key,
                imageDriver: "cloudinary",
              },
            });
            await prisma.$disconnect();
          }
        }
        break;
      } catch (e) {
        console.warn(`  err ${title}:`, e instanceof Error ? e.message : e);
      }
    }
    if (!saved) console.error("  FAIL");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
