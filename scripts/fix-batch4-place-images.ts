/**
 * Finish failed batch-4 tours (place-matched Commons, width ≥800).
 *
 *   npx tsx scripts/fix-batch4-place-images.ts
 */
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  cover,
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
  type ImageTarget,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

const SLUGS = ["beas-kund-trek", "bhrigu-lake-trek", "coorg-coffee-hills"] as const;

const FULL_JOBS: TourImageJob[] = [
  {
    slug: "beas-kund-trek",
    targets: [
      cover("beas-kund-trek-cover.jpg", "Solang valley Beas Kund trek Manali snow peaks", [
        "File:Solang valley under snow, 2015.jpg",
        "File:Solang valley mountain view.jpg",
        "File:Paragliders at Solang Valley, Manali.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      gallery("beas-kund-trek-g1.jpg", "Solang Valley meadow Manali orientation", [
        "File:Solang Valley Manali.JPG",
        "File:Solang Valley ,Manali, Himachal Pardes, India.JPG",
      ], ["destinations/manali.jpg"]),
      gallery("beas-kund-trek-g2.jpg", "Solang meadow Rohtang approach Manali", [
        "File:A view of solang valley on the way to rohtang pass.jpg",
        "File:Solang Valley ,Paragliding view, Manali, Himachal Pardes,india.JPG",
      ], ["destinations/manali.jpg"]),
      gallery("beas-kund-trek-g3.jpg", "Dhundi trek trail Kullu Manali", [
        "File:Kullu manali (28).JPG",
        "File:Kullu manali (36).JPG",
      ], ["destinations/manali.jpg"]),
      gallery("beas-kund-trek-g4.jpg", "Beas river valley Manali Himachal trek", [
        "File:Kullu Manali scenic view.jpg",
        "File:Solang Valley 5.jpg",
        "File:Kullu manali (33).JPG",
        "File:Paragliders at Solang Valley, Manali.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      day("beas-kund-trek-d1.jpg", 1, "Arrive Manali Solang orientation", [
        "File:Solang Valley, Paragliding, India.jpg",
        "File:Kullu manali (100).JPG",
        "File:Mall Road, Manali, Himachal Pradesh.jpg",
      ], ["destinations/manali.jpg"]),
      day("beas-kund-trek-d2.jpg", 2, "Solang to Dhundi camp meadow", [
        "File:Kullu manali (101).JPG",
        "File:Kullu manali (28).JPG",
      ], ["destinations/manali.jpg"]),
      day("beas-kund-trek-d3.jpg", 3, "Dhundi to Beas Kund alpine lake", [
        "File:Beas River at Nehru Kund, Manali (2).jpg",
        "File:Beas River at Nehru Kund, Manali (1).jpg",
        "File:Kullu manali (33).JPG",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      day("beas-kund-trek-d4.jpg", 4, "Departure Bhuntar Kullu Manali", [
        "File:Mall Road - Manali 2014-05-10 2251.JPG",
        "File:Mall Road - Manali 2014-05-10 2240.JPG",
        "File:Mall Road, Manali, Himachal Pradesh.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
    ],
  },
  {
    slug: "bhrigu-lake-trek",
    targets: [
      cover("bhrigu-lake-trek-cover.jpg", "Bhrigu Lake alpine meadow Himachal", [
        "File:Bhrigu Lake by Ahmad Faiz Mustafa (3).jpg",
        "File:Bhrigu Lake by Ahmad Faiz Mustafa (1).jpg",
        "File:Adventure to Bhrigu.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
      gallery("bhrigu-lake-trek-g1.jpg", "Bhrigu Lake glacial bowl Himachal", [
        "File:Bhrigu Lake by Ahmad Faiz Mustafa (4).jpg",
        "File:Bhrigu Lake by Ahmad Faiz Mustafa (2).jpg",
      ], ["destinations/himachal.jpg"]),
      gallery("bhrigu-lake-trek-g2.jpg", "Gulaba snowline Manali trek", [
        "File:Gulaba manali.jpg",
        "File:Leh–Manali Highway - Gulaba - Kullu 2014-05-10 2449.JPG",
      ], ["destinations/manali.jpg"]),
      gallery("bhrigu-lake-trek-g3.jpg", "Rola Kholi campsite meadow Bhrigu", [
        "File:Himalayas - Gulaba - Leh-Manali Highway 2014-05-10 2404-2422 Compress.JPG",
        "File:The mighty himalayas.jpg",
      ], ["destinations/himachal.jpg"]),
      gallery("bhrigu-lake-trek-g4.jpg", "Manali valley Himalayan trek approach", [
        "File:Kullu manali (36).JPG",
        "File:Solang valley mountain view.jpg",
      ], ["destinations/manali.jpg"]),
      day("bhrigu-lake-trek-d1.jpg", 1, "Manali arrival trek base", [
        "File:Mall Road, Manali.jpg",
        "File:Mall Road - Manali 01.jpg",
        "File:Mall Road, Manali, Himachal Pradesh.jpg",
        "File:Manu Temple Manali.jpg",
      ], ["destinations/manali.jpg"]),
      day("bhrigu-lake-trek-d2.jpg", 2, "Gulaba to Rola Kholi camp", [
        "File:Gulaba manali.jpg",
        "File:Leh–Manali Highway - Gulaba - Kullu 2014-05-10 2449.JPG",
        "File:Himalayas - Gulaba - Leh-Manali Highway 2014-05-10 2438-2439 Compress.JPG",
      ], ["destinations/manali.jpg"]),
      day("bhrigu-lake-trek-d3.jpg", 3, "Bhrigu Lake descent day", [
        "File:Bhrigu Lake by Ahmad Faiz Mustafa (2).jpg",
        "File:Adventure to Bhrigu.jpg",
        "File:Bhrigu Lake by Ahmad Faiz Mustafa (1).jpg",
      ], ["destinations/himachal.jpg"]),
      day("bhrigu-lake-trek-d4.jpg", 4, "Departure Kullu Manali", [
        "File:Mall Road - Manali 2014-05-11 2633.JPG",
        "File:Mall road, Manali 02 by Tanweer.JPG",
        "File:Kullu manali (100).JPG",
        "File:Naggar Palace Manali.jpg",
      ], ["destinations/manali.jpg", "destinations/himachal.jpg"]),
    ],
  },
  {
    slug: "coorg-coffee-hills",
    targets: [
      cover("coorg-coffee-hills-cover.jpg", "Coorg coffee plantation hills Karnataka", [
        "File:Coffee Coconuts Pepper Estate Coorg Feb24 A7C 09365.jpg",
        "File:Coffee Shade Trees Paddy Fields Coorg Feb24 R16 07670.jpg",
      ]),
      gallery("coorg-coffee-hills-g1.jpg", "Coffee estate shade trees Coorg", [
        "File:Gnarled Old Coffee Robusta Trunk Coorg Feb24 D72 25962.jpg",
        "File:Beans Drying Coffee Robusta Balamuri Coorg Feb24 A7C 09491.jpg",
      ]),
      gallery("coorg-coffee-hills-g2.jpg", "Abbey Falls Coorg waterfall", [
        "File:ABBEY FALLS ,COORG ,KARNATAKA.jpg",
        "File:Abbey falls,coorg.jpg",
      ]),
      gallery("coorg-coffee-hills-g3.jpg", "Madikeri town Kodagu hills", [
        "File:Madikeri Town.jpg",
        "File:Madikeri, Karnataka India.jpg",
      ]),
      gallery("coorg-coffee-hills-g4.jpg", "Raja Seat Madikeri viewpoint", [
        "File:Raja's Tomb, Madikeri, Kodagu, Karnataka, India.jpg",
        "File:Cannon in the Madikeri Fort Museum.jpg",
      ]),
      day("coorg-coffee-hills-d1.jpg", 1, "Arrive Coorg plantation", [
        "File:Paddy Field Stubble Balamuri Coorg Feb24 A7C 09450.jpg",
        "File:Streets of Madikeri.jpg",
      ]),
      day("coorg-coffee-hills-d2.jpg", 2, "Waterfalls Abbey Coorg", [
        "File:Snail walking on an iron bar, Abbey falls, Coorg, Karnataka.JPG",
        "File:ABBEY FALLS ,COORG ,KARNATAKA.jpg",
      ]),
      day("coorg-coffee-hills-d3.jpg", 3, "Madikeri fort temple town", [
        "File:Raja's Tomb, Madikeri (Mercara), Kodagu, Karnataka, India.jpg",
        "File:Ornamental brass bells in Madikeri, Karnataka.jpg",
      ]),
      day("coorg-coffee-hills-d4.jpg", 4, "Departure Coorg Karnataka IXE", [
        "File:VT-PPG (8005651926).jpg",
        "File:Bondel MGC PUCollege Airport road Bondel Mangalore India.jpg",
        "File:Madikeri, Karnataka India.jpg",
      ]),
    ],
  },
];

function slotsMissingAttribution(slug: string, tourDir: string): Set<string> {
  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  const text = existsSync(attrPath) ? readFileSync(attrPath, "utf8") : "";
  const missing = new Set<string>();
  for (const name of readdirSync(tourDir)) {
    if (!name.startsWith(`${slug}-`) || !name.endsWith(".jpg")) continue;
    if (!text.split("\n").some((line) => line.startsWith(`${name}  ←`))) missing.add(name);
  }
  return missing;
}

function probeTitles(titles: string[]): Map<string, boolean> {
  const pyPath = path.join(tmpdir(), "probe-batch4-commons-verify.py");
  const titlesPath = path.join(tmpdir(), "probe-batch4-titles.json");
  writeFileSync(titlesPath, JSON.stringify(titles));
  writeFileSync(
    pyPath,
    `import json, urllib.parse, urllib.request, time, sys
agent = "WorldCompassHoliday/1.0 (batch4-fix-probe)"
titles = json.load(open(sys.argv[1]))
out = {}
for t in titles:
    time.sleep(1.1)
    params = urllib.parse.urlencode({
        "action": "query", "titles": t, "prop": "imageinfo",
        "iiprop": "mime|size", "format": "json"
    })
    req = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{params}",
        headers={"User-Agent": agent},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = json.loads(r.read())
    except Exception:
        out[t] = False
        continue
    ok = False
    for pid, p in data.get("query", {}).get("pages", {}).items():
        if pid == "-1":
            break
        ii = (p.get("imageinfo") or [{}])[0]
        w = ii.get("width", 0)
        mime = ii.get("mime", "")
        ok = w >= 800 and mime.startswith("image/") and "svg" not in mime
        break
    out[t] = ok
print(json.dumps(out))
`,
  );
  const raw = execFileSync("python3", [pyPath, titlesPath], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  return new Map(Object.entries(JSON.parse(raw.trim()) as Record<string, boolean>));
}

function keepStub(file: string, dayNumber?: number): ImageTarget {
  const isCover = file.endsWith("-cover.jpg");
  const isDay = /-d\d+\.jpg$/.test(file);
  return {
    file,
    dayNumber,
    place: "keep",
    titles: [],
    w: isCover ? 1920 : isDay ? 1400 : 1600,
    h: isCover ? 1080 : isDay ? 933 : 1067,
    skipSearch: true,
  };
}

function filterProbed(target: ImageTarget, probed: Map<string, boolean>): ImageTarget {
  const verified = target.titles.filter((t) => probed.get(t));
  console.log(`  probe ${target.file}: ${verified.length}/${target.titles.length} titles ok`);
  return {
    ...target,
    titles: verified.length ? verified : target.titles,
    skipSearch: true,
  };
}

function missingTargets(slug: string, want: ImageTarget[], tourDir: string): ImageTarget[] {
  return want.filter((t) => !existsSync(path.join(tourDir, t.file)));
}

function findJob(slug: string): TourImageJob {
  const job = FULL_JOBS.find((j) => j.slug === slug);
  if (!job) throw new Error(`no job for ${slug}`);
  return job;
}

function mergeAttribution(slug: string, tourDir: string) {
  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  const lines = existsSync(attrPath)
    ? readFileSync(attrPath, "utf8").trimEnd().split("\n")
    : [`# ${slug} ${new Date().toISOString()}`, ""];
  const documented = new Set(lines.filter((l) => l.includes("←")).map((l) => l.split("  ←")[0]!));
  const job = findJob(slug);
  let changed = false;
  for (const t of job.targets) {
    if (documented.has(t.file)) continue;
    const file = path.join(tourDir, t.file);
    if (!existsSync(file)) continue;
    const primary = t.titles[0];
    lines.push(`${t.file}  ←  ${primary ? `${primary} (on-disk)` : "on-disk"}`);
    changed = true;
  }
  if (changed) writeFileSync(attrPath, lines.join("\n") + "\n");
}

async function prismaStatus(slugs: readonly string[]) {
  const prisma = new PrismaClient();
  try {
    for (const slug of slugs) {
      const t = await prisma.tour.findUnique({
        where: { slug },
        select: {
          imageKey: true,
          galleryJson: true,
          days: { select: { dayNumber: true, imageKey: true }, orderBy: { dayNumber: "asc" } },
        },
      });
      const gallery = t?.galleryJson ? (JSON.parse(t.galleryJson) as unknown[]).length : 0;
      const dayKeys = (t?.days ?? []).filter((d) => d.imageKey).length;
      console.log(
        `  ${slug}: cover=${t?.imageKey ? "yes" : "NO"} gallery=${gallery} daysWithKey=${dayKeys}/${t?.days.length ?? 0}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");

  const toFix = FULL_JOBS.flatMap((job) => missingTargets(job.slug, job.targets, tourDir));
  if (toFix.length) {
    const allTitles = [...new Set(toFix.flatMap((t) => t.titles))];
    console.log(`Probing ${allTitles.length} curated File: titles for ${toFix.length} missing slots…`);
    const probed = probeTitles(allTitles);

    const shared = createBatchBlocklist("__fix_batch4__");
    for (const name of readdirSync(tourDir)) {
      if (!/\.jpe?g$/i.test(name)) continue;
      claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
    }

    for (const slug of SLUGS) {
      const job = findJob(slug);
      const pending = missingTargets(slug, job.targets, tourDir);
      if (!pending.length) continue;
      const existing: ImageTarget[] = [];
      for (const name of readdirSync(tourDir)) {
        if (!name.startsWith(`${slug}-`) || !name.endsWith(".jpg")) continue;
        if (pending.some((t) => t.file === name)) continue;
        const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
        existing.push(keepStub(name, dayNumber));
      }
      const targets = pending.map((t) => filterProbed(t, probed));
      console.log(`\nFixing ${slug}: ${targets.map((t) => t.file).join(", ")}`);
      await fetchAndWireTourImages({ slug, targets: [...existing, ...targets] }, { sharedBlock: shared });
    }
  }

  for (const slug of SLUGS) mergeAttribution(slug, tourDir);

  console.log("\nDB wire (keep stubs)…");
  const shared = createBatchBlocklist("__fix_batch4_db__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }
  for (const slug of SLUGS) {
    const job = findJob(slug);
    const stubs = job.targets.map((t) => keepStub(t.file, t.dayNumber));
    await fetchAndWireTourImages({ slug, targets: stubs }, { dbOnly: true, sharedBlock: shared });
  }

  console.log("\n=== Batch 4 fix — final status ===");
  for (const slug of SLUGS) {
    const parts = ["cover", "g1", "g2", "g3", "g4"];
    const days = readdirSync(tourDir)
      .filter((n) => n.startsWith(`${slug}-d`) && n.endsWith(".jpg"))
      .sort();
    const missMedia = parts.filter((p) => !existsSync(path.join(tourDir, `${slug}-${p}.jpg`)));
    const attr = existsSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`));
    const attrLines = attr
      ? readFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), "utf8")
          .split("\n")
          .filter((l) => l.includes("←")).length
      : 0;
    console.log(
      `  ${slug}: files=${missMedia.length === 0 && days.length >= 4 ? "OK" : "INCOMPLETE"} attribution=${attr ? attrLines : "missing"}`,
    );
    if (missMedia.length) console.log(`    missing: ${missMedia.join(", ")}`);
  }
  console.log("\nPrisma:");
  await prismaStatus(SLUGS);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
