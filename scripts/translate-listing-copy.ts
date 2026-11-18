/**
 * Fill ContentTranslation for hotels, rooms, cars, bikes, rental labels, and buses.
 *
 *   npx tsx scripts/translate-listing-copy.ts
 */
import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const locales = ["fr", "hi", "he", "ar", "ur"] as const;
type TargetLocale = (typeof locales)[number];
const prisma = new PrismaClient();
const cachePath = path.join(process.cwd(), "scripts", ".tour-i18n-cache.json");
const cache = new Map<string, string>(
  existsSync(cachePath) ? Object.entries(JSON.parse(readFileSync(cachePath, "utf8")) as Record<string, string>) : [],
);

function cacheKey(locale: string, text: string) {
  return `${locale}\u0000${text}`;
}

function remember(locale: string, text: string, translated: string) {
  cache.set(cacheKey(locale, text), translated);
}

function flushCache() {
  const data: Record<string, string> = {};
  for (const [key, value] of cache) data[key] = value;
  writeFileSync(cachePath, JSON.stringify(data));
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextRequest = Promise.resolve();

function google(text: string, locale: string) {
  const run = nextRequest.then(async () => {
    await pause(80);
    return new Promise<string>((resolve, reject) => {
      const child = execFile(
        "python3",
        [
          "-c",
          `import json,sys,urllib.parse,urllib.request
locale=sys.argv[1]
text=sys.stdin.read()
url="https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl="+urllib.parse.quote(locale)+"&dt=t&q="+urllib.parse.quote(text)
req=urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=40) as res:
    data=json.load(res)
sys.stdout.write("".join(part[0] or "" for part in data[0]))
`,
          locale,
        ],
        { maxBuffer: 8_000_000 },
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        },
      );
      child.stdin?.end(text);
    });
  });
  nextRequest = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function translateOne(text: string, locale: string) {
  const stored = cache.get(cacheKey(locale, text));
  if (stored) return stored;
  const chunks = pieces(text);
  const out: string[] = [];
  for (const chunk of chunks) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        out.push(await google(chunk, locale));
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        await pause(1200 * (attempt + 1));
      }
    }
    if (lastError) {
      console.error("kept English", lastError);
      remember(locale, text, text);
      return text;
    }
  }
  const translated = out.join("").trim() || text;
  remember(locale, text, translated);
  return translated;
}

async function translateBatch(texts: string[], locale: string) {
  const missing = texts.filter((text) => !cache.has(cacheKey(locale, text)));
  const groups: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const text of missing) {
    if (text.includes("§§§") || text.length > 700) {
      if (current.length) groups.push(current);
      current = [];
      size = 0;
      groups.push([text]);
      continue;
    }
    if (current.length && size + text.length > 1100) {
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += text.length + 5;
  }
  if (current.length) groups.push(current);

  let cursor = 0;
  async function worker() {
    while (cursor < groups.length) {
      const group = groups[cursor];
      cursor += 1;
      if (!group) return;
      if (group.length === 1) {
        await translateOne(group[0], locale);
        continue;
      }
      const joined = group.join("\n§§§\n");
      try {
        const translated = await translateOne(joined, locale);
        const parts = translated.split("§§§").map((part) => part.trim());
        if (parts.length !== group.length) {
          cache.delete(cacheKey(locale, joined));
          for (const text of group) await translateOne(text, locale);
          continue;
        }
        group.forEach((text, index) => remember(locale, text, parts[index] || text));
      } catch (error) {
        console.error("batch fallback", error);
        cache.delete(cacheKey(locale, joined));
        for (const text of group) await translateOne(text, locale);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, () => worker()));
  flushCache();
  console.log(`  ${locale} cached ${texts.filter((text) => cache.has(cacheKey(locale, text))).length}/${texts.length}`);
}

function pieces(text: string) {
  if (text.length <= 1400) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 1400) {
    let cut = rest.lastIndexOf("</p>", 1400);
    if (cut < 400) cut = rest.lastIndexOf(". ", 1400);
    if (cut < 400) cut = 1400;
    else if (rest[cut] === ".") cut += 1;
    else if (rest.startsWith("</p>", cut)) cut += 4;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) parts.push(rest);
  return parts;
}

function put(copy: Record<string, unknown>, key: string, value: string | null | undefined) {
  if (value && value.trim()) copy[key] = value;
}

function collect(value: unknown, bag: Set<string>) {
  if (typeof value === "string") {
    if (value.trim()) bag.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collect(item, bag));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "clientId") continue;
      collect(item, bag);
    }
  }
}

function apply(value: unknown, locale: TargetLocale): unknown {
  if (typeof value === "string") {
    if (!value.trim()) return value;
    return cache.get(cacheKey(locale, value)) ?? value;
  }
  if (Array.isArray(value)) return value.map((item) => apply(item, locale));
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) next[key] = apply(item, locale);
    return next;
  }
  return value;
}

async function saveCopy(ownerType: string, ownerId: string, locale: string, value: unknown) {
  const json = JSON.stringify(value);
  await prisma.contentTranslation.upsert({
    where: { ownerType_ownerId_locale_field: { ownerType, ownerId, locale, field: "copy" } },
    create: { ownerType, ownerId, locale, field: "copy", value: json },
    update: { value: json },
  });
}

async function main() {
  const [hotels, vehicles, configs, locations, catalog, buses, routes] = await Promise.all([
    prisma.hotel.findMany({ include: { rooms: true } }),
    prisma.vehicle.findMany({ select: { id: true, name: true, summary: true, description: true } }),
    prisma.rentalConfig.findMany({ select: { id: true, name: true, description: true } }),
    prisma.rentalLocation.findMany({ select: { id: true, name: true, address: true } }),
    prisma.catalogItem.findMany({
      where: {
        kind: {
          in: ["hotel_amenity", "room_feature", "room_amenity", "hotel_faq", "bus_facility", "bus_location"],
        },
      },
      select: { id: true, title: true, content: true },
    }),
    prisma.bus.findMany({ select: { id: true, name: true, operator: true, summary: true, about: true } }),
    prisma.busRoute.findMany({
      select: {
        id: true,
        name: true,
        fromCity: true,
        toCity: true,
        summary: true,
        operator: true,
        pickup: true,
        dropoff: true,
        about: true,
      },
    }),
  ]);

  const jobs: { ownerType: string; ownerId: string; copy: Record<string, unknown> }[] = [];

  for (const hotel of hotels) {
    const copy: Record<string, unknown> = {};
    put(copy, "name", hotel.name);
    put(copy, "summary", hotel.summary);
    put(copy, "description", hotel.description);
    put(copy, "address", hotel.address);
    put(copy, "cancellationPolicy", hotel.cancellationPolicy);
    put(copy, "houseRules", hotel.houseRules);
    put(copy, "seoTitle", hotel.seoTitle);
    put(copy, "seoDescription", hotel.seoDescription);
    const rooms = hotel.rooms.flatMap((room) => {
      const row: Record<string, unknown> = { clientId: room.id };
      if (room.name.trim()) row.name = room.name;
      if (room.summary.trim()) row.summary = room.summary;
      return Object.keys(row).length > 1 ? [row] : [];
    });
    if (rooms.length) copy.rooms = rooms;
    if (Object.keys(copy).length) jobs.push({ ownerType: "hotel", ownerId: hotel.id, copy });
  }

  for (const vehicle of vehicles) {
    const copy: Record<string, unknown> = {};
    put(copy, "name", vehicle.name);
    put(copy, "summary", vehicle.summary);
    put(copy, "description", vehicle.description);
    if (Object.keys(copy).length) jobs.push({ ownerType: "vehicle", ownerId: vehicle.id, copy });
  }
  for (const config of configs) {
    const copy: Record<string, unknown> = {};
    put(copy, "name", config.name);
    put(copy, "description", config.description);
    if (Object.keys(copy).length) jobs.push({ ownerType: "rentalConfig", ownerId: config.id, copy });
  }
  for (const location of locations) {
    const copy: Record<string, unknown> = {};
    put(copy, "name", location.name);
    put(copy, "address", location.address);
    if (Object.keys(copy).length) jobs.push({ ownerType: "rentalLocation", ownerId: location.id, copy });
  }
  for (const item of catalog) {
    const copy: Record<string, unknown> = {};
    put(copy, "title", item.title);
    put(copy, "content", item.content);
    if (Object.keys(copy).length) jobs.push({ ownerType: "catalog", ownerId: item.id, copy });
  }
  for (const bus of buses) {
    const copy: Record<string, unknown> = {};
    put(copy, "name", bus.name);
    put(copy, "operator", bus.operator);
    put(copy, "summary", bus.summary);
    put(copy, "about", bus.about);
    if (Object.keys(copy).length) jobs.push({ ownerType: "bus", ownerId: bus.id, copy });
  }
  for (const route of routes) {
    const copy: Record<string, unknown> = {};
    put(copy, "name", route.name);
    put(copy, "fromCity", route.fromCity);
    put(copy, "toCity", route.toCity);
    put(copy, "summary", route.summary);
    put(copy, "operator", route.operator);
    put(copy, "pickup", route.pickup);
    put(copy, "dropoff", route.dropoff);
    put(copy, "about", route.about);
    if (Object.keys(copy).length) jobs.push({ ownerType: "busRoute", ownerId: route.id, copy });
  }

  const strings = new Set<string>();
  for (const job of jobs) collect(job.copy, strings);
  const missing = [...strings].filter((text) => locales.some((locale) => !cache.has(cacheKey(locale, text))));
  console.log(`records=${jobs.length} strings=${strings.size} uncached=${missing.length}`);

  const list = [...strings];
  for (const locale of locales) {
    const pending = list.filter((text) => !cache.has(cacheKey(locale, text))).length;
    console.log(`translating ${locale} (${pending} left)`);
    await translateBatch(list, locale);
  }

  let saved = 0;
  for (const locale of locales) {
    for (const job of jobs) {
      await saveCopy(job.ownerType, job.ownerId, locale, apply(job.copy, locale));
      saved += 1;
      if (saved % 100 === 0) console.log(`saved ${saved}/${jobs.length * locales.length}`);
    }
  }
  console.log(`saved ${saved} translations`);
}

main()
  .catch((error) => {
    console.error(error);
    flushCache();
    process.exitCode = 1;
  })
  .finally(async () => {
    flushCache();
    await prisma.$disconnect();
  });
