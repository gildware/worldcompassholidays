/**
 * Attach Lucide icons (lucide-static) to tour catalog items.
 * Does not hand-draw icons — copies library SVGs and brands them for <img> use.
 *
 *   node --import tsx scripts/seed-catalog-icons.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const lucideDir = path.join(process.cwd(), "node_modules", "lucide-static", "icons");
const outDir = path.join(process.cwd(), "public", "uploads", "catalog", "icons");

/** Catalog title → Lucide icon file name (without .svg) */
const MAP: Record<string, string> = {
  // category
  Leisure: "palmtree",

  // styles
  "Hill Stations": "mountain-snow",
  "Family Friendly": "users",
  "Private / Independent": "lock-keyhole",

  // facilities
  "Private cab": "car-front",
  "Airport transfers": "plane-takeoff",
  "MAP meals (B/D)": "utensils",
  "Shikara ride": "sailboat",
  "24×7 helpline": "headset",

  // faqs
  "What is the best time for this tour?": "calendar-clock",
  "Is this a private or group tour?": "users-round",
  "Are flights included?": "plane",
  "What extras are paid locally?": "wallet",

  // includes
  "Accommodation as per itinerary (twin sharing)": "hotel",
  "Breakfast + dinner (MAP)": "cooking-pot",
  "Private vehicle for transfers & sightseeing": "car",
  "Airport pickup & drop": "plane-landing",
  "Driver allowance, tolls & parking": "user-round",
  "GST as quoted": "receipt-indian-rupee",
  "Shikara ride (where listed)": "sailboat",
  "Meet-and-greet at Srinagar Airport": "handshake",

  // excludes
  "Flights / trains to starting point": "plane",
  "Lunch (unless listed)": "salad",
  "Tips & personal expenses": "banknote",
  "Travel insurance": "shield",
  "Gulmarg Gondola tickets": "cable-car",
  "Pahalgam union sightseeing cabs": "car-taxi-front",
  "Anything not mentioned in includes": "circle-help",

  // before you go
  Fitness: "mountain-snow",
  Documents: "lock-keyhole",
  "Weather & kit": "palmtree",
  Arrival: "plane-landing",
  Rooms: "hotel",
  "Money on the road": "wallet",
};

function brandLucideSvg(raw: string) {
  const inner = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>[\s\S]*$/i, "")
    .trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <rect width="64" height="64" rx="14" fill="#E6F2EF"/>
  <g transform="translate(12 12) scale(1.6667)" fill="none" stroke="#0F5C4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${inner}
  </g>
</svg>
`;
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  let updated = 0;
  let missingRows = 0;

  for (const [title, lucideName] of Object.entries(MAP)) {
    const source = path.join(lucideDir, `${lucideName}.svg`);
    let raw: string;
    try {
      raw = readFileSync(source, "utf8");
    } catch {
      throw new Error(`Lucide icon missing: ${lucideName}.svg`);
    }

    const file = `${lucideName}.svg`;
    const abs = path.join(outDir, file);
    writeFileSync(abs, brandLucideSvg(raw), "utf8");

    const key = `catalog/icons/${file}`;
    const url = `/uploads/${key}`;

    const result = await prisma.catalogItem.updateMany({
      where: { title },
      data: {
        iconUrl: url,
        iconKey: key,
        iconDriver: "local",
      },
    });

    if (result.count === 0) {
      missingRows += 1;
      console.warn(`No catalog row for: ${title}`);
    } else {
      updated += result.count;
      console.log(`+ ${title} ← lucide:${lucideName}`);
    }
  }

  console.log(`Done. Updated ${updated} rows. Missing catalog titles: ${missingRows}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
