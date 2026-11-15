/**
 * Finish the two remaining Phase-1 images (Hampta g2 + Guptkashi).
 *   npx tsx scripts/fix-phase1-remainder.ts
 */
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (phase1 remainder; hi@worldcompassholiday.com)";
const uploads = path.join(process.cwd(), "public", "uploads");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function usedHashes() {
  const used = new Set<string>();
  for (const folder of ["tours", "destinations"] as const) {
    const dir = path.join(uploads, folder);
    for (const name of readdirSync(dir)) {
      if (!/\.jpe?g$/i.test(name)) continue;
      used.add(createHash("sha1").update(readFileSync(path.join(dir, name))).digest("hex"));
    }
  }
  return used;
}

async function wikiSearch(q: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("list", "search");
  u.searchParams.set("srsearch", `${q} filetype:bitmap`);
  u.searchParams.set("srnamespace", "6");
  u.searchParams.set("srlimit", "20");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (res.status === 429) {
    await sleep(12000);
    return wikiSearch(q);
  }
  if (!res.ok) throw new Error(`search ${res.status}`);
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? []).map((x) => x.title);
}

async function wikiInfo(title: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime|extmetadata");
  u.searchParams.set("iiurlwidth", "1920");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
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
  const info = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!info?.url) return null;
  if (!String(info.mime || "").startsWith("image/") || String(info.mime).includes("svg")) {
    return null;
  }
  const lic = (info.extmetadata?.LicenseShortName?.value || "").toLowerCase();
  if (lic.includes("nc")) return null;
  return (info.thumburl || info.url).split("?")[0];
}

async function openverse(q: string) {
  const u = new URL("https://api.openverse.org/v1/images/");
  u.searchParams.set("q", q);
  u.searchParams.set("license_type", "commercial");
  u.searchParams.set("page_size", "25");
  const res = await fetch(u, {
    headers: { "User-Agent": agent, Accept: "application/json" },
  });
  if (!res.ok) return [] as { url: string; title: string }[];
  const data = (await res.json()) as {
    results?: { url?: string; title?: string; id?: string }[];
  };
  return (data.results ?? [])
    .filter((r) => r.url)
    .map((r) => ({ url: r.url!, title: r.title || r.id || q }));
}

async function trySave(
  rel: string,
  title: string,
  url: string,
  used: Set<string>,
) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
    redirect: "follow",
  });
  if (!res.ok) return false;
  const raw = Buffer.from(await res.arrayBuffer());
  const hash = createHash("sha1").update(raw).digest("hex");
  if (used.has(hash)) {
    console.log(`  dup ${title}`);
    return false;
  }
  const out = path.join(uploads, rel);
  mkdirSync(path.dirname(out), { recursive: true });
  const processed = await sharp(raw)
    .rotate()
    .resize(1600, 1067, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  writeFileSync(out, processed);
  used.add(createHash("sha1").update(processed).digest("hex"));
  console.log(`  ok ${title}`);

  const { uploadCloudinaryBuffer } = await import("../src/lib/storage/cloudinary");
  const noExt = rel.replace(/\.[a-z0-9]+$/i, "");
  const m = noExt.match(/^tours\/(.+)-(cover|g\d+)$/);
  const publicId = m
    ? `worldcompass/tours/${m[1]}/${m[2].startsWith("g") ? `gallery-${m[2].slice(1)}` : m[2]}`
    : `worldcompass/${noExt}`;
  const up = await uploadCloudinaryBuffer({ buffer: processed, publicId });
  console.log(`  cloudinary ${up.key}`);

  if (noExt.startsWith("destinations/")) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.destination.updateMany({
      where: { slug: noExt.replace("destinations/", "") },
      data: {
        imageUrl: up.url,
        imageKey: up.key,
        imageDriver: "cloudinary",
      },
    });
    await prisma.$disconnect();
  }
  return true;
}

async function main() {
  const used = usedHashes();
  const jobs = [
    {
      rel: "tours/hampta-pass-chandratal-trek-g2.jpg",
      must: /hampta|hamtah|chandratal|chandra.?tal|lahaul|spiti|manali|rohtang|chika|jobra/i,
      wiki: [
        "Hampta Pass Himachal",
        "Hampta Pass trek mountains",
        "Chandratal Spiti mountains",
        "Lahaul valley Himachal trek",
      ],
      open: ["Hampta Pass Himachal Pradesh", "Chandratal lake Himachal"],
    },
    {
      rel: "destinations/guptkashi.jpg",
      must: /gupt/i,
      wiki: [
        "Guptakashi",
        "Guptkashi",
        "Guptakashi temple",
        "Vishwanath Guptakashi",
      ],
      open: ["Guptkashi Uttarakhand", "Guptakashi temple"],
    },
  ];

  for (const job of jobs) {
    console.log(`\n→ ${job.rel}`);
    let done = false;

    for (const q of job.wiki) {
      await sleep(2500);
      let titles: string[] = [];
      try {
        titles = await wikiSearch(q);
      } catch (e) {
        console.warn("  wiki", e instanceof Error ? e.message : e);
        continue;
      }
      for (const title of titles) {
        if (!job.must.test(title)) continue;
        if (/logo|map|flag|relief|truck|army|svg|poster/i.test(title)) continue;
        await sleep(1200);
        try {
          const url = await wikiInfo(title);
          if (!url) continue;
          if (await trySave(job.rel, title, url, used)) {
            done = true;
            break;
          }
        } catch (e) {
          console.warn(`  err ${title}:`, e instanceof Error ? e.message : e);
        }
      }
      if (done) break;
    }

    if (!done) {
      for (const q of job.open) {
        await sleep(1500);
        const results = await openverse(q);
        for (const r of results) {
          if (!job.must.test(`${r.title} ${r.url} ${q}`)) continue;
          try {
            if (await trySave(job.rel, r.title, r.url, used)) {
              done = true;
              break;
            }
          } catch (e) {
            console.warn("  open err", e instanceof Error ? e.message : e);
          }
        }
        if (done) break;
      }
    }

    if (!done) {
      console.error("  FAIL");
      process.exitCode = 1;
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
