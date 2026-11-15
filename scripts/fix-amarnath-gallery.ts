/**
 * Replace Amarnath Yatra gallery with Holy Cave / route-only Wikimedia photos.
 * Writes slug-matched files so seed resolveTourMedia does not fall back to Srinagar etc.
 *
 *   npx tsx scripts/fix-amarnath-gallery.ts
 */
import { createHash } from "node:crypto";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (amarnath gallery fix; hi@worldcompassholiday.com)";
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

const TARGETS: { file: string; titles: string[]; w: number; h: number }[] = [
  {
    file: "amarnath-yatra-group-g1.jpg",
    titles: [
      "File:Sheshnag Lake-Amarnath Yatra Series.jpg",
      "File:Sheshnag Lake J&K.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: "amarnath-yatra-group-g2.jpg",
    titles: [
      "File:Panjatarani - amarnath yatra.jpg",
      "File:Place to Be.jpg",
      "File:Amaranth Cave.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: "amarnath-yatra-group-g3.jpg",
    titles: [
      "File:Amarnath cave view.jpg",
      "File:Amarnath Yatra -Jammu & Kashmir.jpg",
      "File:Amarnath Cave Temple.jpg",
    ],
    w: 1600,
    h: 1067,
  },
  {
    file: "amarnath-yatra-group-g4.jpg",
    titles: [
      "File:Shri Amarnath Ji Holy Cave(GUFA).jpg",
      "File:Amarnath Cave Temple.jpg",
      "File:Cave Temple of Lord Amarnath.jpg",
    ],
    w: 1600,
    h: 1067,
  },
];

async function info(title: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime|extmetadata|size");
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
  const ii = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!ii?.url || !String(ii.mime || "").startsWith("image/") || String(ii.mime).includes("svg")) {
    return null;
  }
  if (String(ii.extmetadata?.LicenseShortName?.value || "").toLowerCase().includes("nc")) {
    return null;
  }
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
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const used = new Set<string>();
  const coverPath = path.join(tourDir, "amarnath-yatra-cover.jpg");
  if (existsSync(coverPath)) {
    used.add(createHash("sha1").update(readFileSync(coverPath)).digest("hex"));
  }

  const attribution: string[] = [
    `# Amarnath Yatra gallery ${new Date().toISOString()}`,
    "# Source: Wikimedia Commons (free licenses).",
  ];

  for (const target of TARGETS) {
    let saved = false;
    for (const title of target.titles) {
      await new Promise((r) => setTimeout(r, 800));
      const meta = await info(title);
      if (!meta) {
        console.log("skip", title);
        continue;
      }
      const raw = await download(meta.url);
      const hash = createHash("sha1").update(raw).digest("hex");
      if (used.has(hash)) {
        console.log("dup", title);
        continue;
      }
      const processed = await sharp(raw)
        .rotate()
        .resize(target.w, target.h, { fit: "cover", position: "centre" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
      const out = path.join(tourDir, target.file);
      writeFileSync(out, processed);
      used.add(hash);
      attribution.push(`${target.file}  ←  ${title} (${meta.license})`);
      console.log("ok", target.file, "←", title);
      saved = true;
      break;
    }
    if (!saved) throw new Error(`failed ${target.file}`);
  }

  // Keep legacy short names in sync for older cover-key maps / manifests.
  const aliases: [string, string][] = [
    ["amarnath-yatra-group-g1.jpg", "amarnath-yatra-g1.jpg"],
    ["amarnath-yatra-group-g2.jpg", "amarnath-yatra-g2.jpg"],
    ["amarnath-yatra-group-g3.jpg", "amarnath-yatra-g3.jpg"],
    ["amarnath-yatra-group-g4.jpg", "amarnath-yatra-g4.jpg"],
  ];
  for (const [src, dest] of aliases) {
    writeFileSync(path.join(tourDir, dest), readFileSync(path.join(tourDir, src)));
  }

  writeFileSync(
    path.join(process.cwd(), "tmp", "amarnath-gallery-attribution.txt"),
    attribution.join("\n") + "\n",
  );
  console.log("done");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
