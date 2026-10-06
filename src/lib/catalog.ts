export const catalogKinds = [
  "category",
  "style",
  "facility",
  "faq",
  "include",
  "exclude",
  "hotel_amenity",
  "room_feature",
  "room_amenity",
  "hotel_faq",
] as const;

export type CatalogKind = (typeof catalogKinds)[number];

export type CatalogOption = {
  id: string;
  title: string;
  iconUrl: string;
  content: string;
};

export const catalogGroups = [
  {
    id: "tours",
    label: "Tours",
    description: "Lists used when adding or editing a tour.",
    kinds: ["category", "style", "facility", "faq", "include", "exclude"],
  },
  {
    id: "hotels",
    label: "Hotels",
    description:
      "Lists used when adding a hotel. Property amenities belong to the hotel. Room features and room amenities belong to each room.",
    kinds: ["hotel_amenity", "room_feature", "room_amenity", "hotel_faq"],
  },
] as const;

export function isCatalogKind(value: string): value is CatalogKind {
  return (catalogKinds as readonly string[]).includes(value);
}

export function catalogKindLabel(kind: CatalogKind) {
  if (kind === "category") return "Tour category";
  if (kind === "style") return "Travel style";
  if (kind === "facility") return "Facility";
  if (kind === "faq") return "FAQ";
  if (kind === "include") return "Include";
  if (kind === "exclude") return "Exclude";
  if (kind === "hotel_amenity") return "Hotel amenity";
  if (kind === "room_feature") return "Room feature";
  if (kind === "room_amenity") return "Room amenity";
  return "Hotel FAQ";
}

export function isHotelCatalogKind(kind: CatalogKind) {
  return (
    kind === "hotel_amenity" ||
    kind === "room_feature" ||
    kind === "room_amenity" ||
    kind === "hotel_faq"
  );
}

export function catalogKindHasIcon(kind: CatalogKind) {
  return (
    kind === "category" ||
    kind === "style" ||
    kind === "facility" ||
    kind === "include" ||
    kind === "exclude" ||
    kind === "hotel_amenity" ||
    kind === "room_feature" ||
    kind === "room_amenity"
  );
}

export function catalogKindHasAnswer(kind: CatalogKind) {
  return kind === "faq" || kind === "hotel_faq";
}

/** Question and answer stored on one tour, not in the shared FAQ list. */
export type LocalFaq = { local: true; title: string; content: string };

export function isLocalFaq(item: unknown): item is LocalFaq {
  if (!item || typeof item !== "object") return false;
  const row = item as { local?: unknown; title?: unknown };
  return row.local === true && typeof row.title === "string";
}

export function localFaqs(value: unknown): { title: string; content: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isLocalFaq(item)) return [];
    const title = item.title.trim();
    if (!title) return [];
    const content = typeof item.content === "string" ? item.content.trim() : "";
    return [{ title, content }];
  });
}

export function packFaqs(
  ids: string[],
  extra: { title: string; content: string }[],
) {
  const catalogIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  const locals = extra.flatMap((item) => {
    const title = item.title.trim();
    if (!title) return [];
    return [{ local: true as const, title, content: item.content.trim() }];
  });
  return [...catalogIds, ...locals];
}

/** Ids or legacy `{ title }` rows stored on a tour. Skips tour-only FAQs. */
export function selectionKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (isLocalFaq(item)) return [];
    if (typeof item === "string" && item.trim()) return [item.trim()];
    if (
      item &&
      typeof item === "object" &&
      "title" in item &&
      typeof item.title === "string" &&
      item.title.trim()
    ) {
      return [item.title.trim()];
    }
    return [];
  });
}

/** Rewrite catalog ids in a stored list and keep tour-only FAQs. */
export function mapStoredSelection(
  value: unknown,
  mapKey: (key: string) => string,
): unknown[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const next: unknown[] = [];
  for (const item of value) {
    if (isLocalFaq(item)) {
      const title = item.title.trim();
      if (!title) continue;
      next.push({
        local: true,
        title,
        content: typeof item.content === "string" ? item.content.trim() : "",
      });
      continue;
    }
    const key = selectionKeys([item])[0];
    if (!key) continue;
    const mapped = mapKey(key);
    if (seen.has(mapped)) continue;
    seen.add(mapped);
    next.push(mapped);
  }
  return next;
}

export function resolveCatalogId(stored: string, items: CatalogOption[]) {
  const value = stored.trim();
  if (!value) return "";
  if (items.some((item) => item.id === value)) return value;
  return items.find((item) => item.title === value)?.id ?? "";
}

export function resolveCatalogIds(stored: string[], items: CatalogOption[]) {
  const ids = stored
    .map((value) => resolveCatalogId(value, items))
    .filter((value) => value.length > 0);
  return [...new Set(ids)];
}
