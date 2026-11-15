/**
 * Download place-accurate Wikimedia Commons photos for Phase-1 destinations + tours.
 * Saves local JPGs under public/uploads/{destinations,tours}/ then optionally uploads to Cloudinary.
 *
 *   npx tsx scripts/fetch-phase1-tour-images.ts
 *   npx tsx scripts/fetch-phase1-tour-images.ts --upload
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent =
  "WorldCompassHoliday/1.0 (phase1 tour covers; hi@worldcompassholiday.com)";
const uploads = path.join(process.cwd(), "public", "uploads");
const destDir = path.join(uploads, "destinations");
const tourDir = path.join(uploads, "tours");
const logDir = path.join(process.cwd(), "tmp", "phase1-images");
mkdirSync(destDir, { recursive: true });
mkdirSync(tourDir, { recursive: true });
mkdirSync(logDir, { recursive: true });

type AssetSpec = {
  rel: string; // destinations/foo.jpg or tours/foo-cover.jpg
  queries: string[];
  /** Prefer Commons file titles that must match (optional). */
  preferTitle?: RegExp;
};

/** One unique photo per destination + dedicated cover/gallery per Phase-1 tour. */
const ASSETS: AssetSpec[] = [
  // Destinations
  {
    rel: "destinations/haridwar.jpg",
    queries: ["Har Ki Pauri Haridwar Ganga aarti", "Haridwar Har Ki Pauri"],
    preferTitle: /har.?ki.?pauri|haridwar/i,
  },
  {
    rel: "destinations/rishikesh.jpg",
    queries: ["Laxman Jhula Rishikesh", "Rishikesh Ganga bridge"],
    preferTitle: /rishikesh|laxman|lakshman/i,
  },
  {
    rel: "destinations/dehradun.jpg",
    queries: ["Dehradun city Uttarakhand", "Dehradun valley hills India"],
    preferTitle: /dehradun|doon/i,
  },
  {
    rel: "destinations/kedarnath.jpg",
    queries: ["Kedarnath Temple Uttarakhand", "Kedarnath shrine Himalaya"],
    preferTitle: /kedarnath/i,
  },
  {
    rel: "destinations/badrinath.jpg",
    queries: ["Badrinath Temple Uttarakhand", "Badrinath shrine Alaknanda"],
    preferTitle: /badrinath/i,
  },
  {
    rel: "destinations/yamunotri.jpg",
    queries: ["Yamunotri Temple Uttarakhand", "Yamunotri hot spring temple"],
    preferTitle: /yamunotri/i,
  },
  {
    rel: "destinations/gangotri.jpg",
    queries: ["Gangotri Temple Uttarakhand", "Gangotri Bhagirathi shrine"],
    preferTitle: /gangotri/i,
  },
  {
    rel: "destinations/guptkashi.jpg",
    queries: ["Guptkashi Vishwanath temple", "Guptkashi Uttarakhand"],
    preferTitle: /guptkashi|guptakashi/i,
  },
  {
    rel: "destinations/chopta.jpg",
    queries: ["Chopta Tungnath meadow Uttarakhand", "Chopta Chandrashila"],
    preferTitle: /chopta|tungnath|chandrashila/i,
  },
  {
    rel: "destinations/manali.jpg",
    queries: ["Manali Himachal Pradesh mountains", "Manali Beas valley"],
    preferTitle: /manali/i,
  },
  {
    rel: "destinations/uttarakhand.jpg",
    queries: ["Garhwal Himalaya panorama Uttarakhand", "Uttarakhand Himalaya peaks"],
    preferTitle: /garhwal|uttarakhand|himalaya/i,
  },
  {
    rel: "destinations/himachal.jpg",
    queries: ["Himachal Pradesh Himalaya mountains", "Rohtang Pass Himachal"],
    preferTitle: /himachal|rohtang|manali|spiti/i,
  },

  // Kedarnath Yatra
  {
    rel: "tours/kedarnath-yatra-package-cover.jpg",
    queries: ["Kedarnath Temple snow peak", "Kedarnath Temple frontal view"],
    preferTitle: /kedarnath/i,
  },
  {
    rel: "tours/kedarnath-yatra-package-g1.jpg",
    queries: ["Kedarnath trek path pilgrims", "Gaurikund Kedarnath trail"],
    preferTitle: /kedarnath|gaurikund|gauri kund/i,
  },
  {
    rel: "tours/kedarnath-yatra-package-g2.jpg",
    queries: ["Mandakini river Kedarnath", "Kedarnath valley mountains"],
    preferTitle: /kedarnath|mandakini/i,
  },

  // Do Dham
  {
    rel: "tours/do-dham-yatra-kedarnath-badrinath-cover.jpg",
    queries: ["Badrinath Temple Neelkanth", "Badrinath Temple colorful facade"],
    preferTitle: /badrinath/i,
  },
  {
    rel: "tours/do-dham-yatra-kedarnath-badrinath-g1.jpg",
    queries: ["Kedarnath Temple Uttarakhand daylight", "Kedarnath shrine"],
    preferTitle: /kedarnath/i,
  },
  {
    rel: "tours/do-dham-yatra-kedarnath-badrinath-g2.jpg",
    queries: ["Mana village Badrinath", "Alaknanda river Badrinath"],
    preferTitle: /mana|badrinath|alaknanda/i,
  },

  // Char Dham road
  {
    rel: "tours/char-dham-yatra-from-haridwar-cover.jpg",
    queries: ["Char Dham Uttarakhand pilgrimage mountains", "Yamunotri Gangotri Himalaya"],
    preferTitle: /yamunotri|gangotri|kedarnath|badrinath|chardham|char dham/i,
  },
  {
    rel: "tours/char-dham-yatra-from-haridwar-g1.jpg",
    queries: ["Yamunotri Temple Uttarakhand", "Yamunotri shrine"],
    preferTitle: /yamunotri/i,
  },
  {
    rel: "tours/char-dham-yatra-from-haridwar-g2.jpg",
    queries: ["Gangotri Temple Bhagirathi", "Gangotri dham"],
    preferTitle: /gangotri/i,
  },
  {
    rel: "tours/char-dham-yatra-from-haridwar-g3.jpg",
    queries: ["Har Ki Pauri Haridwar evening", "Haridwar Ganga aarti lamps"],
    preferTitle: /haridwar|har.?ki.?pauri/i,
  },

  // Char Dham heli
  {
    rel: "tours/char-dham-yatra-by-helicopter-cover.jpg",
    queries: ["Helicopter Himalaya Kedarnath", "Helicopter mountain pilgrimage India"],
    preferTitle: /helicopter|heli|kedarnath|himalaya/i,
  },
  {
    rel: "tours/char-dham-yatra-by-helicopter-g1.jpg",
    queries: ["Kedarnath Temple aerial view", "Kedarnath from above"],
    preferTitle: /kedarnath/i,
  },
  {
    rel: "tours/char-dham-yatra-by-helicopter-g2.jpg",
    queries: ["Dehradun airport or Doon valley", "Dehradun Uttarakhand landscape"],
    preferTitle: /dehradun|doon/i,
  },

  // Kashmir Great Lakes
  {
    rel: "tours/kashmir-great-lakes-trek-cover.jpg",
    queries: ["Gangabal Lake Kashmir", "Vishansar Lake Kashmir trek"],
    preferTitle: /gangabal|vishansar|kishansar|gadsar|great lakes|kashmir lake/i,
  },
  {
    rel: "tours/kashmir-great-lakes-trek-g1.jpg",
    queries: ["Vishansar Lake Kashmir", "Kishansar Lake Kashmir"],
    preferTitle: /vishansar|kishansar|gangabal/i,
  },
  {
    rel: "tours/kashmir-great-lakes-trek-g2.jpg",
    queries: ["Gadsar Lake Kashmir", "Satsar lakes Kashmir trek"],
    preferTitle: /gadsar|satsar|gangabal|naranag/i,
  },
  {
    rel: "tours/kashmir-great-lakes-trek-g3.jpg",
    queries: ["Naranag temple Kashmir", "Sonamarg Thajiwas Kashmir meadow"],
    preferTitle: /naranag|sonamarg|sonmarg/i,
  },

  // Tarsar Marsar
  {
    rel: "tours/tarsar-marsar-trek-cover.jpg",
    queries: ["Tarsar Lake Kashmir", "Tarsar Marsar trek lake"],
    preferTitle: /tarsar|marsar/i,
  },
  {
    rel: "tours/tarsar-marsar-trek-g1.jpg",
    queries: ["Aru Valley Pahalgam Kashmir", "Aru village Kashmir"],
    preferTitle: /aru|pahalgam|lidder/i,
  },
  {
    rel: "tours/tarsar-marsar-trek-g2.jpg",
    queries: ["Marsar Lake Kashmir", "Lidderwat Kashmir trek"],
    preferTitle: /marsar|lidderwat|tarsar|pahalgam/i,
  },

  // Hampta Pass
  {
    rel: "tours/hampta-pass-chandratal-trek-cover.jpg",
    queries: ["Hampta Pass trek Himachal", "Hampta Pass crossing"],
    preferTitle: /hampta|hamtah/i,
  },
  {
    rel: "tours/hampta-pass-chandratal-trek-g1.jpg",
    queries: ["Chandratal Lake Himachal", "Chandra Tal Spiti"],
    preferTitle: /chandratal|chandra tal|chandra\s*tal/i,
  },
  {
    rel: "tours/hampta-pass-chandratal-trek-g2.jpg",
    queries: ["Manali Jobra trek Himachal", "Hampta valley meadow camp"],
    preferTitle: /hampta|manali|jobra|chika|lahaul/i,
  },

  // Chopta Chandrashila
  {
    rel: "tours/chopta-chandrashila-deoriatal-trek-cover.jpg",
    queries: ["Chandrashila peak sunrise Uttarakhand", "Chandrashila summit Chaukhamba"],
    preferTitle: /chandrashila|chopta|tungnath/i,
  },
  {
    rel: "tours/chopta-chandrashila-deoriatal-trek-g1.jpg",
    queries: ["Deoriatal lake Chopta", "Deoria Tal Chaukhamba reflection"],
    preferTitle: /deoria|deoriatal|chopta/i,
  },
  {
    rel: "tours/chopta-chandrashila-deoriatal-trek-g2.jpg",
    queries: ["Tungnath Temple Chopta", "Tungnath highest Shiva temple"],
    preferTitle: /tungnath|chopta/i,
  },

  // Valley of Flowers + Hemkund
  {
    rel: "tours/valley-of-flowers-hemkund-trek-cover.jpg",
    queries: ["Valley of Flowers National Park Uttarakhand", "Valley of Flowers bloom Himalaya"],
    preferTitle: /valley of flowers|valley-of-flowers|pushpawati/i,
  },
  {
    rel: "tours/valley-of-flowers-hemkund-trek-g1.jpg",
    queries: ["Hemkund Sahib Gurudwara lake", "Hemkund Sahib alpine lake"],
    preferTitle: /hemkund|hemkund/i,
  },
  {
    rel: "tours/valley-of-flowers-hemkund-trek-g2.jpg",
    queries: ["Ghangaria village trek", "Valley of Flowers trail wildflowers"],
    preferTitle: /ghangaria|valley of flowers|hemkund/i,
  },
];

type Pick = { title: string; url: string; thumb?: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wikiJson(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Accept: "application/json" },
  });
  if (res.status === 429) {
    await sleep(8000);
    const retry = await fetch(url, {
      headers: { "User-Agent": agent, Accept: "application/json" },
    });
    if (!retry.ok) throw new Error(`HTTP ${retry.status}`);
    return retry.json();
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchCandidates(query: string): Promise<string[]> {
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
  return (data.query?.search ?? [])
    .map((row) => row.title)
    .filter(
      (title) =>
        !/logo|map|flag|svg|diagram|icon|poster|army|minister|chief|coin|stamp|sketch|drawing|cartoon/i.test(
          title,
        ),
    );
}

async function imageInfo(title: string): Promise<Pick | null> {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("titles", title);
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url|size|mime|extmetadata");
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
            size?: number;
            width?: number;
            height?: number;
            extmetadata?: { LicenseShortName?: { value?: string } };
          }[];
        }
      >;
    };
  };
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  if (!String(info.mime || "").startsWith("image/")) return null;
  if (String(info.mime).includes("svg")) return null;
  const lic = (info.extmetadata?.LicenseShortName?.value || "").toLowerCase();
  if (lic.includes("nc") || lic.includes("noncommercial")) return null;
  const w = info.width || 0;
  const h = info.height || 0;
  if (w && h && w < 800) return null;
  return {
    title,
    url: (info.thumburl || info.url).split("?")[0],
    thumb: info.thumburl?.split("?")[0],
  };
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
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function pickFor(spec: AssetSpec, usedHashes: Set<string>): Promise<Pick> {
  const titles: string[] = [];
  for (const query of spec.queries) {
    await sleep(1500);
    try {
      const found = await searchCandidates(query);
      for (const title of found) {
        if (!titles.includes(title)) titles.push(title);
      }
    } catch (error) {
      console.warn(`  search failed (${query}):`, error instanceof Error ? error.message : error);
    }
  }

  // Prefer title regex matches first
  const ordered = [
    ...titles.filter((t) => (spec.preferTitle ? spec.preferTitle.test(t) : false)),
    ...titles.filter((t) => !(spec.preferTitle ? spec.preferTitle.test(t) : false)),
  ];

  for (const title of ordered) {
    await sleep(900);
    try {
      const pick = await imageInfo(title);
      if (!pick) continue;
      if (spec.preferTitle && !spec.preferTitle.test(title)) {
        // still allow as fallback later
      }
      let raw: Buffer;
      try {
        raw = await download(pick.url);
      } catch {
        if (pick.thumb) raw = await download(pick.thumb);
        else continue;
      }
      const hash = createHash("sha1").update(raw).digest("hex");
      if (usedHashes.has(hash)) continue;
      // stash bytes on the pick via side channel file for this run
      const cache = path.join(logDir, `${hash}.bin`);
      writeFileSync(cache, raw);
      (pick as Pick & { hash: string; cache: string }).hash = hash;
      (pick as Pick & { hash: string; cache: string }).cache = cache;
      return pick;
    } catch {
      continue;
    }
  }
  throw new Error(`No unique image for ${spec.rel}`);
}

async function main() {
  const upload = process.argv.includes("--upload");
  const usedHashes = new Set<string>();
  const attribution: string[] = [
    `# Phase-1 tour/destination images ${new Date().toISOString()}`,
    `# Source: Wikimedia Commons (free licenses). See each Commons file page for photographer credit.`,
    "",
  ];
  const manifest: Record<string, { title: string; url: string; hash: string }> = {};

  let ok = 0;
  let failed = 0;

  for (const spec of ASSETS) {
    const outFile = path.join(uploads, spec.rel);
    console.log(`\n→ ${spec.rel}`);

    try {
      const pick = (await pickFor(spec, usedHashes)) as Pick & {
        hash: string;
        cache: string;
      };
      const raw = readFileSync(pick.cache);
      usedHashes.add(pick.hash);

      const processed = await sharp(raw)
        .rotate()
        .resize(1600, 1067, { fit: "cover", position: "centre" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();

      writeFileSync(outFile, processed);
      attribution.push(`${spec.rel}  ←  ${pick.title}`);
      manifest[spec.rel] = { title: pick.title, url: pick.url, hash: pick.hash };
      ok += 1;
      console.log(`  ok  ${pick.title}`);
    } catch (error) {
      failed += 1;
      console.error(`  FAIL ${error instanceof Error ? error.message : error}`);
    }
  }

  writeFileSync(path.join(logDir, "attribution.txt"), `${attribution.join("\n")}\n`);
  writeFileSync(path.join(logDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nDone. ok=${ok} failed=${failed}`);
  console.log(`Attribution: ${path.join(logDir, "attribution.txt")}`);

  if (upload) {
    const { uploadCloudinaryBuffer } = await import("../src/lib/storage/cloudinary");
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    let uploaded = 0;
    for (const rel of Object.keys(manifest)) {
      const file = path.join(uploads, rel);
      if (!existsSync(file)) continue;
      const noExt = rel.replace(/\.[a-z0-9]+$/i, "");
      const tourMatch = noExt.match(/^tours\/(.+)-(cover|g\d+)$/);
      let publicId: string;
      if (tourMatch) {
        const kind = tourMatch[2].startsWith("g")
          ? `gallery-${tourMatch[2].slice(1)}`
          : tourMatch[2];
        publicId = `worldcompass/tours/${tourMatch[1]}/${kind}`;
      } else if (noExt.startsWith("destinations/")) {
        publicId = `worldcompass/${noExt}`;
      } else {
        publicId = `worldcompass/library/${noExt}`;
      }
      try {
        const result = await uploadCloudinaryBuffer({
          buffer: readFileSync(file),
          publicId,
        });
        uploaded += 1;
        console.log(`  cloudinary ${publicId}`);

        // Point destination rows at Cloudinary when this is a destination cover.
        const destSlug = noExt.match(/^destinations\/(.+)$/)?.[1];
        if (destSlug) {
          await prisma.destination.updateMany({
            where: { slug: destSlug },
            data: {
              imageUrl: result.url,
              imageKey: result.key,
              imageDriver: "cloudinary",
            },
          });
        }
      } catch (error) {
        console.error(
          `  upload fail ${rel}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
    await prisma.$disconnect();
    console.log(`Cloudinary uploaded: ${uploaded}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
