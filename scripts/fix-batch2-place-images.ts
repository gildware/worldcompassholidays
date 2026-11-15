/**
 * Replace mismatched batch-2 slots with curated, place-matched Commons files.
 * Deletes bad jpgs first; probes titles on Commons (width ≥800) before fetch.
 *
 *   npx tsx scripts/fix-batch2-place-images.ts
 */
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
  type ImageTarget,
  type TourImageJob,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());

/** Slots to delete and refetch (cover kept unless listed). */
const REFETCH: { slug: string; files: string[] }[] = [
  {
    slug: "shirdi-sai-baba-darshan",
    files: [
      "shirdi-sai-baba-darshan-g1.jpg",
      "shirdi-sai-baba-darshan-g3.jpg",
      "shirdi-sai-baba-darshan-g4.jpg",
      "shirdi-sai-baba-darshan-d1.jpg",
      "shirdi-sai-baba-darshan-d2.jpg",
      "shirdi-sai-baba-darshan-d3.jpg",
    ],
  },
  {
    slug: "goa-beach-honeymoon",
    files: [
      "goa-beach-honeymoon-g2.jpg",
      "goa-beach-honeymoon-d1.jpg",
      "goa-beach-honeymoon-d2.jpg",
      "goa-beach-honeymoon-d3.jpg",
      "goa-beach-honeymoon-d4.jpg",
      "goa-beach-honeymoon-d5.jpg",
    ],
  },
  {
    slug: "gir-asiatic-lion-safari",
    files: [
      "gir-asiatic-lion-safari-g2.jpg",
      "gir-asiatic-lion-safari-g4.jpg",
      "gir-asiatic-lion-safari-d2.jpg",
      "gir-asiatic-lion-safari-d3.jpg",
    ],
  },
  {
    slug: "udaipur-lakes-weekend",
    files: ["udaipur-lakes-weekend-d1.jpg", "udaipur-lakes-weekend-d2.jpg"],
  },
  {
    slug: "kanha-jungle-book-safari",
    files: [
      "kanha-jungle-book-safari-g1.jpg",
      "kanha-jungle-book-safari-d1.jpg",
      "kanha-jungle-book-safari-d2.jpg",
      "kanha-jungle-book-safari-d3.jpg",
    ],
  },
  {
    slug: "varanasi-spiritual-tour",
    files: ["varanasi-spiritual-tour-d2.jpg"],
  },
];

const FIX_TARGETS: TourImageJob[] = [
  {
    slug: "shirdi-sai-baba-darshan",
    targets: [
      gallery("shirdi-sai-baba-darshan-g1.jpg", "Gurusthan Shirdi Maharashtra", [
        "File:Gurusthan.JPG",
        "File:Shirdi Sai Statue at Shirdi, Maharastra (2).jpg",
      ]),
      gallery("shirdi-sai-baba-darshan-g3.jpg", "Chavadi Shirdi Sai pilgrimage", [
        "File:Chawadi in Shirdi.jpg",
      ]),
      gallery("shirdi-sai-baba-darshan-g4.jpg", "Shirdi Samadhi temple complex", [
        "File:Shirdi Sai baba Statue at Shri Saibaba Prasadalaya, Shirdi, Maharastra (1).jpg",
      ]),
      day("shirdi-sai-baba-darshan-d1.jpg", 1, "Evening Shirdi Sai temple", [
        "File:Shirdi Saibaba Selfi Point.jpg",
      ]),
      day("shirdi-sai-baba-darshan-d2.jpg", 2, "Morning darshan Shirdi Sai", [
        "File:Shirdi Sai Baba reading.jpg",
      ]),
      day("shirdi-sai-baba-darshan-d3.jpg", 3, "Departure Shirdi Maharashtra town", [
        "File:Shirdi sai2.jpg",
      ]),
    ],
  },
  {
    slug: "goa-beach-honeymoon",
    targets: [
      gallery("goa-beach-honeymoon-g2.jpg", "Querim beach North Goa coast", [
        "File:Querim Beach, Goa, India.jpg",
        "File:The Terekhol River and Querim Beach, panoramic view, Goa, India.jpg",
        "File:Goa-Vasco 03-2016 11 beach in Vaddem.jpg",
      ]),
      day("goa-beach-honeymoon-d1.jpg", 1, "Arrive Goa beach coast check-in", [
        "File:Goa-Vasco 03-2016 10 beach in Vaddem.jpg",
        "File:Goa-Vasco 03-2016 09 beach in Vaddem.jpg",
        "File:Querim Beach, Goa, India.jpg",
      ]),
      day("goa-beach-honeymoon-d2.jpg", 2, "Couples beach day Goa sands", [
        "File:Goa-Vasco 03-2016 09 beach in Vaddem.jpg",
        "File:Goa-Vasco 03-2016 11 beach in Vaddem.jpg",
        "File:Goa-Vasco 03-2016 10 beach in Vaddem.jpg",
      ]),
      day("goa-beach-honeymoon-d3.jpg", 3, "Old Goa Basilica heritage", [
        "File:Basilica of Bom Jesus Goa.jpg",
        "File:Basilica of Bom Jesus - old goa.JPG",
      ]),
      day("goa-beach-honeymoon-d4.jpg", 4, "Romantic sunset Goa coastline", [
        "File:The Terekhol River and Querim Beach, panoramic view, Goa, India.jpg",
        "File:Querim Beach, Goa, India.jpg",
        "File:Goa-Vasco 03-2016 11 beach in Vaddem.jpg",
      ]),
      day("goa-beach-honeymoon-d5.jpg", 5, "Departure Goa Dabolim airport", [
        "File:Goa International Airport.jpg",
      ]),
    ],
  },
  {
    slug: "gir-asiatic-lion-safari",
    targets: [
      gallery("gir-asiatic-lion-safari-g2.jpg", "Asiatic lion Gir National Park", [
        "File:Lion sleeping in Gir National Park, Gujarat.jpg",
        "File:Portrait of an Asiatic lion at Gir National Park 01.jpg",
        "File:Asiatic Lion Royal Walk at Gir National Park, Gujrat, India.jpg",
      ]),
      gallery("gir-asiatic-lion-safari-g4.jpg", "Gir forest lion habitat Gujarat", [
        "File:A lion at Gir Forest National Park, India 03.jpg",
        "File:Asiatic Lion at Gir National Park, Gujrat, India 01.jpg",
        "File:A lion at Gir Forest National Park, India 02.jpg",
      ]),
      day("gir-asiatic-lion-safari-d2.jpg", 2, "Dawn lion safari Gir forest", [
        "File:Portrait of an Asiatic lion at Gir National Park 02.jpg",
        "File:Asiatic Lion at Gir National Park, Gujrat, India 02.jpg",
        "File:Lion sleeping in Gir National Park, Gujarat.jpg",
      ]),
      day("gir-asiatic-lion-safari-d3.jpg", 3, "Departure Gir Gujarat lion land", [
        "File:Asiatic Lion at Gir National Park, Gujrat, India 02.jpg",
        "File:Asiatic Lion Royal Walk at Gir National Park, Gujrat, India.jpg",
        "File:Asiatic Lion at Gir National Park, Gujrat, India 01.jpg",
      ]),
    ],
  },
  {
    slug: "udaipur-lakes-weekend",
    targets: [
      day("udaipur-lakes-weekend-d1.jpg", 1, "Arrive Udaipur City Palace lake", [
        "File:20191207 Lake Pichola, City Palace, Udaipur, 1516 7254.jpg",
        "File:20191207 Lake Pichola, Udaipur, 1652 7315.jpg",
        "File:City Palace Udaipur.jpg",
      ]),
      day("udaipur-lakes-weekend-d2.jpg", 2, "Sunset boat Lake Pichola Udaipur", [
        "File:Lake Pichola at sunset, Udaipur, Rajasthan, India.jpg",
        "File:20191207 Lake Pichola, Udaipur, 1531 7276.jpg",
        "File:Taj Lake Palace Udaipur from City Palace.jpg",
      ]),
    ],
  },
  {
    slug: "kanha-jungle-book-safari",
    targets: [
      gallery("kanha-jungle-book-safari-g1.jpg", "Kanha National Park sal forest", [
        "File:An Indian Roller (Coracias benghalensis) in the Kanha National Park.jpg",
        "File:Sambar in Kanha National Park.jpg",
        "File:Roads in Kanha National Park (India, 2012).jpg",
      ]),
      day("kanha-jungle-book-safari-d1.jpg", 1, "Evening jeep Kanha buffer", [
        "File:A mud road in Kanha National Park, Madhya Pradesh, India (2012).jpg",
        "File:Roads in Kanha National Park (India, 2012).jpg",
        "File:Morning view in buffer zone of Kanha National Park.jpg",
      ]),
      day("kanha-jungle-book-safari-d2.jpg", 2, "Twin drives Kanha tiger land", [
        "File:Road to heaven, Kanha National Park, India.jpg",
        "File:Tiger Kanha National Park.jpg",
        "File:Bengal tiger in Kanha National Park 02.jpg",
      ]),
      day("kanha-jungle-book-safari-d3.jpg", 3, "Departure Kanha Madhya Pradesh", [
        "File:People walking in a road at Kanha National Park, Madhya Pradesh, India (2012).jpg",
        "File:Roads in Kanha National Park (India, 2012).jpg",
        "File:Barasingha in Kanha National Park 03.jpg",
      ]),
    ],
  },
  {
    slug: "varanasi-spiritual-tour",
    targets: [
      day("varanasi-spiritual-tour-d2.jpg", 2, "Varanasi old city ghat lanes", [
        "File:Varanasi Munshi Ghat3.jpg",
        "File:Varanasi Munshi Ghat.jpg",
        "File:Scindia Ghat Varanasi.jpg",
      ]),
    ],
  },
];

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

/** Probe Commons via python script (width ≥800, bitmap). */
function probeTitles(titles: string[]): Map<string, boolean> {
  const pyPath = path.join(tmpdir(), "probe-batch2-commons.py");
  const titlesPath = path.join(tmpdir(), "probe-batch2-titles.json");
  writeFileSync(titlesPath, JSON.stringify(titles));
  writeFileSync(
    pyPath,
    `import json, urllib.parse, urllib.request, time, sys
agent = "WorldCompassHoliday/1.0 (batch2-fix-probe)"
titles = json.load(open(sys.argv[1]))
out = {}
for t in titles:
    time.sleep(0.55)
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

function filterProbed(target: ImageTarget, probed: Map<string, boolean>): ImageTarget {
  const verified = target.titles.filter((t) => probed.get(t));
  if (!verified.length) {
    throw new Error(`No probed Commons titles for ${target.file} (${target.place})`);
  }
  console.log(`  probe ${target.file}: ${verified.length}/${target.titles.length} titles ok`);
  return { ...target, titles: verified, skipSearch: true };
}

const replaced: string[] = [];

/** Wrong-place signals still present in ATTRIBUTION for a slot. */
const BAD_SOURCE =
  /Coimbatore|Muxima|Angola|Mississauga|Mutha River|Pune\.jpg|Shishkin|South Australia|ONION RINGS|South Beach Memorial|Eppington Plantation|Canada, the empire|prohibition in Indian|Rani ki vav|Table Mountain|Katihar|Ganga Ghat|Southern Song dynasty|Jeep Pick-Up \(8762314836\)|Barringtonia|Achatina achatina|Elevation of Kashi Vishwanath|Dabolim airport terminal expansion plan|Somnath Temple Gujarat/i;

function attributionLine(slug: string, file: string, tourDir: string): string {
  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  if (!existsSync(attrPath)) return "";
  return (
    readFileSync(attrPath, "utf8")
      .split("\n")
      .find((line) => line.startsWith(`${file}  ←`)) ?? ""
  );
}

function pruneAttributionSlot(slug: string, file: string, tourDir: string) {
  const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
  if (!existsSync(attrPath)) return;
  const lines = readFileSync(attrPath, "utf8").split("\n");
  const kept = lines.filter((line) => !line.startsWith(`${file}  ←`));
  writeFileSync(attrPath, kept.join("\n").replace(/\n+$/, "\n"));
}

function slotNeedsReplace(slug: string, file: string, tourDir: string): boolean {
  const lines = (() => {
    const attrPath = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
    if (!existsSync(attrPath)) return [] as string[];
    return readFileSync(attrPath, "utf8")
      .split("\n")
      .filter((line) => line.startsWith(`${file}  ←`));
  })();
  const full = path.join(tourDir, file);
  if (!lines.length) return !existsSync(full) ? true : false;
  return lines.some((line) => BAD_SOURCE.test(line));
}

async function main() {
  const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
  const allTitles = [
    ...new Set(FIX_TARGETS.flatMap((j) => j.targets.flatMap((t) => t.titles))),
  ];
  console.log(`Probing ${allTitles.length} curated File: titles on Wikimedia Commons…`);
  const probed = probeTitles(allTitles);

  const pendingFiles = new Set<string>();
  for (const row of REFETCH) {
    for (const file of row.files) {
      if (!slotNeedsReplace(row.slug, file, tourDir)) continue;
      pendingFiles.add(file);
      pruneAttributionSlot(row.slug, file, tourDir);
      const full = path.join(tourDir, file);
      if (existsSync(full)) {
        unlinkSync(full);
        console.log(`deleted ${file}`);
      }
    }
  }

  const shared = createBatchBlocklist("__fix_batch2__");
  for (const name of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(name)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, name))) });
  }

  for (const fix of FIX_TARGETS) {
    const targetsToFix = fix.targets.filter((t) => pendingFiles.has(t.file));
    if (!targetsToFix.length) {
      console.log(`\nSkip ${fix.slug}: all refetch slots already place-matched`);
      continue;
    }
    const existing: ImageTarget[] = [];
    for (const name of readdirSync(tourDir)) {
      if (!name.startsWith(`${fix.slug}-`) || !name.endsWith(".jpg")) continue;
      if (targetsToFix.some((t) => t.file === name)) continue;
      const dayNumber = Number(name.match(/-d(\d+)\.jpg$/)?.[1] ?? 0) || undefined;
      existing.push(keepStub(name, dayNumber));
    }
    const targets = targetsToFix.map((t) => filterProbed(t, probed));
    const job: TourImageJob = {
      slug: fix.slug,
      targets: [...existing, ...targets],
    };
    console.log(`\nFixing ${fix.slug}: ${targets.map((t) => t.file).join(", ")}`);
    await fetchAndWireTourImages(job, { sharedBlock: shared });
    for (const t of targets) replaced.push(`${fix.slug} · ${t.file}`);
  }

  console.log("\n=== Batch 2 place-image fix summary ===");
  for (const line of replaced) console.log(`  replaced ${line}`);
  console.log(`\nDone: ${replaced.length} slots refetched.`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
