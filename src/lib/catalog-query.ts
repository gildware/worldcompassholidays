import {
  isLocalFaq,
  localFaqs,
  packFaqs,
  selectionKeys,
  type CatalogKind,
  type CatalogOption,
} from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/ttl-cache";
import { parseJsonArray } from "@/lib/tours/json";

export type TourCatalog = {
  categories: CatalogOption[];
  styles: CatalogOption[];
  facilities: CatalogOption[];
  faqs: CatalogOption[];
  includes: CatalogOption[];
  excludes: CatalogOption[];
};

export async function loadTourCatalog(): Promise<TourCatalog> {
  await ensureLegacyTourLists();
  return cached("tour-catalog", 30_000, async () => {
    const rows = await prisma.catalogItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, kind: true, title: true, iconUrl: true, content: true },
    });

    function pick(kind: string): CatalogOption[] {
      return rows
        .filter((row) => row.kind === kind)
        .map((row) => ({
          id: row.id,
          title: row.title,
          iconUrl: row.iconUrl,
          content: row.content,
        }));
    }

    return {
      categories: pick("category"),
      styles: pick("style"),
      facilities: pick("facility"),
      faqs: pick("faq"),
      includes: pick("include"),
      excludes: pick("exclude"),
    };
  });
}

type CatalogBucket = { byId: Set<string>; byTitle: Map<string, string> };

let legacyTourListsReady: Promise<void> | null = null;

/** One pass per server process. Page views must not rewrite every tour. */
function ensureLegacyTourLists() {
  legacyTourListsReady ??= adoptLegacyTourLists().catch((error: unknown) => {
    legacyTourListsReady = null;
    console.error(error);
  });
  return legacyTourListsReady;
}

/** Turn older free-typed FAQ, include, and exclude rows into shared catalog items. */
async function adoptLegacyTourLists() {
  const [tours, items] = await Promise.all([
    prisma.tour.findMany({
      select: { id: true, faqsJson: true, includesJson: true, excludesJson: true },
    }),
    prisma.catalogItem.findMany({ select: { id: true, kind: true, title: true } }),
  ]);

  const buckets = new Map<string, CatalogBucket>();
  for (const item of items) {
    const bucket = buckets.get(item.kind) ?? { byId: new Set<string>(), byTitle: new Map<string, string>() };
    bucket.byId.add(item.id);
    bucket.byTitle.set(item.title.toLowerCase(), item.id);
    buckets.set(item.kind, bucket);
  }

  for (const tour of tours) {
    const faqs = await adoptList("faq", tour.faqsJson, buckets);
    const includes = await adoptList("include", tour.includesJson, buckets);
    const excludes = await adoptList("exclude", tour.excludesJson, buckets);
    const data: { faqsJson?: string; includesJson?: string; excludesJson?: string } = {};
    if (faqs) data.faqsJson = JSON.stringify(faqs);
    if (includes) data.includesJson = JSON.stringify(includes);
    if (excludes) data.excludesJson = JSON.stringify(excludes);
    if (Object.keys(data).length > 0) {
      await prisma.tour.update({ where: { id: tour.id }, data });
    }
  }
}

async function adoptList(kind: CatalogKind, raw: string, buckets: Map<string, CatalogBucket>) {
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const locals = localFaqs(parsed).map((item) => ({
    local: true as const,
    title: item.title,
    content: item.content,
  }));
  const rest = parsed.filter((item) => !isLocalFaq(item));
  const keys = selectionKeys(rest);
  if (keys.length === 0) return null;

  const bucket = buckets.get(kind) ?? { byId: new Set<string>(), byTitle: new Map<string, string>() };
  buckets.set(kind, bucket);
  if (rest.every((item) => typeof item === "string" && bucket.byId.has(item))) return null;

  const ids: string[] = [];
  for (const item of rest) {
    if (typeof item === "string" && bucket.byId.has(item)) {
      ids.push(item);
      continue;
    }
    const title =
      typeof item === "string"
        ? item.trim()
        : item && typeof item === "object" && "title" in item && typeof item.title === "string"
          ? item.title.trim()
          : "";
    if (title.length < 2) continue;
    const content =
      item && typeof item === "object" && "content" in item && typeof item.content === "string"
        ? item.content.trim()
        : "";
    const foundId = bucket.byTitle.get(title.toLowerCase());
    if (foundId) {
      ids.push(foundId);
      continue;
    }
    const created = await prisma.catalogItem.create({
      data: {
        kind,
        title,
        content,
        sortOrder: bucket.byId.size,
      },
      select: { id: true, title: true },
    });
    bucket.byId.add(created.id);
    bucket.byTitle.set(created.title.toLowerCase(), created.id);
    ids.push(created.id);
  }

  const unique = [...new Set(ids)];
  return locals.length > 0 ? [...unique, ...locals] : unique;
}

export async function keepCatalogIds(kind: CatalogKind, raw: string) {
  const requested = parseJsonArray<unknown>(raw).flatMap((value) =>
    typeof value === "string" && value.trim() ? [value.trim()] : [],
  );
  return keepIds(kind, requested);
}

/** Shared FAQ ids plus questions that belong only to this listing. */
export async function keepFaqEntries(raw: string, kind: CatalogKind = "faq") {
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return [];
  const ids = await keepIds(kind, selectionKeys(parsed));
  return packFaqs(ids, localFaqs(parsed));
}

export type HotelCatalog = {
  amenities: CatalogOption[];
  features: CatalogOption[];
  roomAmenities: CatalogOption[];
  faqs: CatalogOption[];
};

export function loadHotelCatalog(): Promise<HotelCatalog> {
  return cached("hotel-catalog", 30_000, async () => {
    const rows = await prisma.catalogItem.findMany({
      where: {
        kind: { in: ["hotel_amenity", "room_feature", "room_amenity", "hotel_faq"] },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, kind: true, title: true, iconUrl: true, content: true },
    });

  function pick(kind: string): CatalogOption[] {
    return rows
      .filter((row) => row.kind === kind)
      .map((row) => ({
        id: row.id,
        title: row.title,
        iconUrl: row.iconUrl,
        content: row.content,
      }));
  }

    return {
      amenities: pick("hotel_amenity"),
      features: pick("room_feature"),
      roomAmenities: pick("room_amenity"),
      faqs: pick("hotel_faq"),
    };
  });
}

async function keepIds(kind: CatalogKind, requested: string[]) {
  if (requested.length === 0) return [];
  const rows = await prisma.catalogItem.findMany({
    where: { kind, id: { in: requested } },
    select: { id: true },
  });
  const allowed = new Set(rows.map((row) => row.id));
  return requested.filter((id) => allowed.has(id));
}
