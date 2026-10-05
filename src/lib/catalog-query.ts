import {
  isLocalFaq,
  localFaqs,
  packFaqs,
  selectionKeys,
  type CatalogKind,
  type CatalogOption,
} from "@/lib/catalog";
import { prisma } from "@/lib/db";
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
  await adoptLegacyTourLists();
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
}

/** Turn older free-typed FAQ, include, and exclude rows into shared catalog items. */
async function adoptLegacyTourLists() {
  const tours = await prisma.tour.findMany({
    select: { id: true, faqsJson: true, includesJson: true, excludesJson: true },
  });

  for (const tour of tours) {
    const faqs = await adoptList("faq", tour.faqsJson);
    const includes = await adoptList("include", tour.includesJson);
    const excludes = await adoptList("exclude", tour.excludesJson);
    const data: { faqsJson?: string; includesJson?: string; excludesJson?: string } = {};
    if (faqs) data.faqsJson = JSON.stringify(faqs);
    if (includes) data.includesJson = JSON.stringify(includes);
    if (excludes) data.excludesJson = JSON.stringify(excludes);
    if (Object.keys(data).length > 0) {
      await prisma.tour.update({ where: { id: tour.id }, data });
    }
  }
}

async function adoptList(kind: CatalogKind, raw: string) {
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

  const existing = await prisma.catalogItem.findMany({
    where: { kind },
    select: { id: true, title: true },
  });
  const byId = new Set(existing.map((row) => row.id));
  if (rest.every((item) => typeof item === "string" && byId.has(item))) return null;

  const ids: string[] = [];
  for (const item of rest) {
    if (typeof item === "string" && byId.has(item)) {
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
    const found = existing.find((row) => row.title.toLowerCase() === title.toLowerCase());
    if (found) {
      ids.push(found.id);
      continue;
    }
    const created = await prisma.catalogItem.create({
      data: {
        kind,
        title,
        content,
        sortOrder: existing.length,
      },
      select: { id: true, title: true },
    });
    existing.push(created);
    byId.add(created.id);
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

/** Shared FAQ ids plus questions that belong only to this tour. */
export async function keepFaqEntries(raw: string) {
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return [];
  const ids = await keepIds("faq", selectionKeys(parsed));
  return packFaqs(ids, localFaqs(parsed));
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
