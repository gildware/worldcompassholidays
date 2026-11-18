/**
 * Fill ContentTranslation for every tour, tour catalog list, and destination.
 *
 *   npx tsx scripts/translate-tour-copy.ts
 */
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { localFaqs } from "../src/lib/catalog";
import { formatTourDuration, parseDurationUnit, parseJsonArray } from "../src/lib/tours/json";

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

let pendingWrites = 0;
function flushCache() {
  const data: Record<string, string> = {};
  for (const [key, value] of cache) data[key] = value;
  writeFileSync(cachePath, JSON.stringify(data));
  pendingWrites = 0;
}

function pieces(text: string) {
  if (text.length <= 1400) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 1400) {
    let cut = rest.lastIndexOf("</p>", 1400);
    if (cut < 400) cut = rest.lastIndexOf("\n", 1400);
    if (cut < 400) cut = rest.lastIndexOf(". ", 1400);
    if (cut < 400) cut = 1400;
    else if (rest.startsWith("</p>", cut)) cut += 4;
    else if (rest[cut] === ".") cut += 1;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) parts.push(rest);
  return parts;
}

let nextRequest = Promise.resolve();

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function google(text: string, locale: string) {
  const run = nextRequest.then(async () => {
    await pause(120);
    const translated = await new Promise<string>((resolve, reject) => {
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
    return translated;
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
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        out.push(await google(chunk, locale));
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        await pause(1500 * (attempt + 1));
      }
    }
    if (lastError) throw lastError;
  }
  const translated = out.join("");
  remember(locale, text, translated.trim() ? translated : text);
  if (cache.size % 80 === 0) console.log(`cache ${cache.size}`);
  pendingWrites += 1;
  if (pendingWrites >= 40) flushCache();
  return cache.get(cacheKey(locale, text)) ?? text;
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
      const index = cursor;
      cursor += 1;
      const group = groups[index];
      if (group.length === 1) {
        try {
          await translateOne(group[0], locale);
        } catch (error) {
          console.error("kept English for one line", error);
          remember(locale, group[0], group[0]);
        }
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
        group.forEach((text, partIndex) => remember(locale, text, parts[partIndex] || text));
      } catch (error) {
        console.error("batch fallback", error);
        cache.delete(cacheKey(locale, joined));
        for (const text of group) {
          try {
            await translateOne(text, locale);
          } catch (lineError) {
            console.error("kept English for one line", lineError);
            remember(locale, text, text);
          }
        }
      }
    }
  }

  await Promise.all(Array.from({ length: 2 }, () => worker()));
  flushCache();
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
      if (key === "dayNumber") continue;
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
    for (const [key, item] of Object.entries(value)) {
      next[key] = key === "dayNumber" ? item : apply(item, locale);
    }
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
  const [tours, catalog, destinations] = await Promise.all([
    prisma.tour.findMany({
      include: { days: { orderBy: { dayNumber: "asc" } } },
    }),
    prisma.catalogItem.findMany({
      where: {
        kind: { in: ["category", "style", "facility", "faq", "include", "exclude", "before_you_go"] },
      },
      select: { id: true, title: true, content: true },
    }),
    prisma.destination.findMany({
      select: { id: true, name: true, summary: true, region: true, country: true },
    }),
  ]);

  const tourCopies = new Map<string, Record<string, unknown>>();
  for (const tour of tours) {
    const copy: Record<string, unknown> = {};
    const put = (key: string, value: string) => {
      if (value.trim()) copy[key] = value;
    };
    put("title", tour.title);
    put("summary", tour.summary);
    put("description", tour.description);
    put("address", tour.address);
    put("seoTitle", tour.seoTitle);
    put("seoDescription", tour.seoDescription);
    put("facebookTitle", tour.facebookTitle);
    put("facebookDescription", tour.facebookDescription);
    put("twitterTitle", tour.twitterTitle);
    put("twitterDescription", tour.twitterDescription);
    put("durationLabel", tour.durationLabel || formatTourDuration(tour.durationDays, parseDurationUnit(tour.durationUnit)));
    put("category", tour.category);
    put("difficulty", tour.difficulty);
    const itinerary = tour.days.flatMap((day) => {
      const row: Record<string, unknown> = { dayNumber: day.dayNumber };
      if (day.title.trim()) row.title = day.title;
      if (day.description.trim()) row.description = day.description;
      if (day.morning.trim()) row.morning = day.morning;
      if (day.afternoon.trim()) row.afternoon = day.afternoon;
      if (day.evening.trim()) row.evening = day.evening;
      return Object.keys(row).length > 1 ? [row] : [];
    });
    if (itinerary.length) copy.itinerary = itinerary;
    const faqs = localFaqs(parseJsonArray(tour.faqsJson));
    if (faqs.length) copy.extraFaqs = faqs;
    tourCopies.set(tour.id, copy);
  }

  const catalogCopies = new Map<string, Record<string, unknown>>();
  for (const item of catalog) {
    const copy: Record<string, unknown> = {};
    if (item.title.trim()) copy.title = item.title;
    if (item.content.trim()) copy.content = item.content;
    if (Object.keys(copy).length) catalogCopies.set(item.id, copy);
  }

  const placeCopies = new Map<string, Record<string, unknown>>();
  for (const place of destinations) {
    const copy: Record<string, unknown> = {};
    if (place.name.trim()) copy.name = place.name;
    if (place.summary.trim()) copy.summary = place.summary;
    if (place.region.trim()) copy.region = place.region;
    if (place.country.trim()) copy.country = place.country;
    if (Object.keys(copy).length) placeCopies.set(place.id, copy);
  }

  const strings = new Set<string>();
  for (const copy of tourCopies.values()) collect(copy, strings);
  for (const copy of catalogCopies.values()) collect(copy, strings);
  for (const copy of placeCopies.values()) collect(copy, strings);
  const list = [...strings];
  console.log(
    `records tours=${tourCopies.size} catalog=${catalogCopies.size} places=${placeCopies.size} strings=${list.length} cached=${cache.size}`,
  );

  for (const locale of locales) {
    const started = Date.now();
    console.log(`translating ${locale}…`);
    await translateBatch(list, locale);
    console.log(`translated ${locale} in ${Math.round((Date.now() - started) / 1000)}s`);
  }

  const jobs: { ownerType: string; ownerId: string; locale: string; value: unknown }[] = [];
  for (const locale of locales) {
    for (const [ownerId, copy] of tourCopies) {
      jobs.push({ ownerType: "tour", ownerId, locale, value: apply(copy, locale) });
    }
    for (const [ownerId, copy] of catalogCopies) {
      jobs.push({ ownerType: "catalog", ownerId, locale, value: apply(copy, locale) });
    }
    for (const [ownerId, copy] of placeCopies) {
      jobs.push({ ownerType: "destination", ownerId, locale, value: apply(copy, locale) });
    }
  }

  let saved = 0;
  let cursor = 0;
  async function saveWorker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor];
      cursor += 1;
      await saveCopy(job.ownerType, job.ownerId, job.locale, job.value);
      saved += 1;
      if (saved % 200 === 0) console.log(`saved ${saved}/${jobs.length}`);
    }
  }
  await Promise.all(Array.from({ length: 8 }, () => saveWorker()));
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
