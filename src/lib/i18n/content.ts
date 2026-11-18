import { prisma } from "@/lib/db";
import { isLocale, locales, type Locale } from "@/i18n/locales";

export const contentLocales = locales.filter((locale) => locale !== "en");

export type CopyMap = Partial<Record<Locale, Record<string, unknown>>>;

function compactValue(value: unknown): unknown {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => compactValue(item))
      .filter((item) => {
        if (typeof item === "string") return item.length > 0;
        if (item && typeof item === "object") return Object.keys(item).length > 0;
        return false;
      });
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const packed = compactValue(item);
      if (typeof packed === "string" && packed) next[key] = packed;
      else if (Array.isArray(packed) && packed.length > 0) next[key] = packed;
      else if (packed && typeof packed === "object" && Object.keys(packed).length > 0) next[key] = packed;
    }
    return next;
  }
  return "";
}

export function parseCopyMap(raw: string): CopyMap {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const copies: CopyMap = {};
    for (const [locale, value] of Object.entries(parsed)) {
      if (!isLocale(locale) || locale === "en" || !value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }
      const packed = compactValue(value);
      if (packed && typeof packed === "object" && !Array.isArray(packed) && Object.keys(packed).length > 0) {
        copies[locale] = packed as Record<string, unknown>;
      }
    }
    return copies;
  } catch {
    return {};
  }
}

export function translated(english: string, value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : english;
}

function matchingRow(list: unknown, dayNumber: number) {
  if (!Array.isArray(list)) return undefined;
  return list.find((item) => {
    return Boolean(item && typeof item === "object" && "dayNumber" in item && item.dayNumber === dayNumber);
  }) as { title?: unknown; description?: unknown; morning?: unknown; afternoon?: unknown; evening?: unknown } | undefined;
}

export function withTourCopy<
  T extends {
    title: string;
    summary: string;
    description: string;
    address?: string;
    seoTitle?: string;
    seoDescription?: string;
    facebookTitle?: string;
    facebookDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    durationLabel?: string;
    category?: string;
    difficulty?: string;
    days?: {
      dayNumber: number;
      title: string;
      description?: string;
      morning?: string;
      afternoon?: string;
      evening?: string;
    }[];
  },
>(tour: T, copy?: Record<string, unknown>): T {
  if (!copy) return tour;
  return {
    ...tour,
    title: translated(tour.title, copy.title),
    summary: translated(tour.summary, copy.summary),
    description: translated(tour.description, copy.description),
    address: tour.address === undefined ? undefined : translated(tour.address, copy.address),
    seoTitle: tour.seoTitle === undefined ? undefined : translated(tour.seoTitle, copy.seoTitle),
    seoDescription:
      tour.seoDescription === undefined ? undefined : translated(tour.seoDescription, copy.seoDescription),
    facebookTitle: tour.facebookTitle === undefined ? undefined : translated(tour.facebookTitle, copy.facebookTitle),
    facebookDescription:
      tour.facebookDescription === undefined
        ? undefined
        : translated(tour.facebookDescription, copy.facebookDescription),
    twitterTitle: tour.twitterTitle === undefined ? undefined : translated(tour.twitterTitle, copy.twitterTitle),
    twitterDescription:
      tour.twitterDescription === undefined
        ? undefined
        : translated(tour.twitterDescription, copy.twitterDescription),
    durationLabel:
      tour.durationLabel === undefined ? undefined : translated(tour.durationLabel, copy.durationLabel),
    category: tour.category === undefined ? undefined : translated(tour.category, copy.category),
    difficulty: tour.difficulty === undefined ? undefined : translated(tour.difficulty, copy.difficulty),
    days: tour.days?.map((day) => {
      const match = matchingRow(copy.itinerary, day.dayNumber);
      if (!match) return day;
      return {
        ...day,
        title: translated(day.title, match.title),
        description: day.description === undefined ? undefined : translated(day.description, match.description),
        morning: day.morning === undefined ? undefined : translated(day.morning, match.morning),
        afternoon: day.afternoon === undefined ? undefined : translated(day.afternoon, match.afternoon),
        evening: day.evening === undefined ? undefined : translated(day.evening, match.evening),
      };
    }),
  };
}

export function withHotelCopy<
  T extends {
    name: string;
    summary: string;
    description: string;
    address?: string;
    cancellationPolicy?: string;
    houseRules?: string;
    seoTitle?: string;
    seoDescription?: string;
    rooms?: { id: string; name: string; summary?: string }[];
  },
>(hotel: T, copy?: Record<string, unknown>): T {
  if (!copy) return hotel;
  const rooms = Array.isArray(copy.rooms)
    ? (copy.rooms as { clientId?: string; name?: unknown; summary?: unknown }[])
    : [];
  return {
    ...hotel,
    name: translated(hotel.name, copy.name),
    summary: translated(hotel.summary, copy.summary),
    description: translated(hotel.description, copy.description),
    address: hotel.address === undefined ? undefined : translated(hotel.address, copy.address),
    cancellationPolicy:
      hotel.cancellationPolicy === undefined
        ? undefined
        : translated(hotel.cancellationPolicy, copy.cancellationPolicy),
    houseRules: hotel.houseRules === undefined ? undefined : translated(hotel.houseRules, copy.houseRules),
    seoTitle: hotel.seoTitle === undefined ? undefined : translated(hotel.seoTitle, copy.seoTitle),
    seoDescription:
      hotel.seoDescription === undefined ? undefined : translated(hotel.seoDescription, copy.seoDescription),
    rooms: hotel.rooms?.map((room) => {
      const match = rooms.find((item) => item.clientId === room.id);
      if (!match) return room;
      return {
        ...room,
        name: translated(room.name, match.name),
        summary: room.summary === undefined ? undefined : translated(room.summary, match.summary),
      };
    }),
  };
}

export function withVehicleCopy<
  T extends { name: string; summary?: string; description?: string },
>(vehicle: T, copy?: Record<string, unknown>): T {
  if (!copy) return vehicle;
  return {
    ...vehicle,
    name: translated(vehicle.name, copy.name),
    ...(vehicle.summary !== undefined ? { summary: translated(vehicle.summary, copy.summary) } : {}),
    ...(vehicle.description !== undefined
      ? { description: translated(vehicle.description, copy.description) }
      : {}),
  };
}

export function withNameCopy<T extends { name: string }>(item: T, copy?: Record<string, unknown>): T {
  if (!copy) return item;
  return { ...item, name: translated(item.name, copy.name) };
}

export function withPlaceCopy<
  T extends { name: string; summary: string; region?: string; country?: string },
>(place: T, copy?: Record<string, unknown>): T {
  if (!copy) return place;
  return {
    ...place,
    name: translated(place.name, copy.name),
    summary: translated(place.summary, copy.summary),
    ...(place.region !== undefined ? { region: translated(place.region, copy.region) } : {}),
    ...(place.country !== undefined ? { country: translated(place.country, copy.country) } : {}),
  };
}

export function withCatalogCopy<T extends { id: string; title: string; content?: string }>(
  items: T[],
  copies: Map<string, Record<string, unknown>>,
): T[] {
  if (copies.size === 0) return items;
  return items.map((item) => {
    const copy = copies.get(item.id);
    if (!copy) return item;
    return {
      ...item,
      title: translated(item.title, copy.title),
      ...(item.content !== undefined ? { content: translated(item.content, copy.content) } : {}),
    };
  });
}

export function applyLocalFaqCopy<T extends { title: string; content: string }>(
  faqs: T[],
  localCount: number,
  copy?: Record<string, unknown>,
): T[] {
  const extra = Array.isArray(copy?.extraFaqs)
    ? (copy.extraFaqs as { title?: unknown; content?: unknown }[])
    : [];
  if (!localCount || extra.length === 0) return faqs;
  const shared = Math.max(0, faqs.length - localCount);
  return faqs.map((faq, index) => {
    if (index < shared) return faq;
    const match = extra[index - shared];
    if (!match) return faq;
    return {
      ...faq,
      title: translated(faq.title, match.title),
      content: translated(faq.content, match.content),
    };
  });
}

export async function loadOwnerCopies(ownerType: string, ownerId: string): Promise<CopyMap> {
  const rows = await prisma.contentTranslation.findMany({
    where: { ownerType, ownerId, field: "copy" },
  });
  const copies: CopyMap = {};
  for (const row of rows) {
    if (!isLocale(row.locale) || row.locale === "en") continue;
    const packed = compactValue(safeJson(row.value));
    if (packed && typeof packed === "object" && !Array.isArray(packed) && Object.keys(packed).length > 0) {
      copies[row.locale] = packed as Record<string, unknown>;
    }
  }
  return copies;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export async function loadCopyMap(ownerType: string, ownerIds: string[], locale: string) {
  const map = new Map<string, Record<string, unknown>>();
  if (!isLocale(locale) || locale === "en" || ownerIds.length === 0) return map;
  const rows = await prisma.contentTranslation.findMany({
    where: { ownerType, ownerId: { in: ownerIds }, locale, field: "copy" },
  });
  for (const row of rows) {
    const value = safeJson(row.value);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      map.set(row.ownerId, value as Record<string, unknown>);
    }
  }
  return map;
}

export async function saveOwnerCopies(ownerType: string, ownerId: string, raw: string) {
  const copies = parseCopyMap(raw);
  await prisma.$transaction(
    contentLocales.map((locale) => {
      const packed = copies[locale];
      if (!packed) {
        return prisma.contentTranslation.deleteMany({
          where: { ownerType, ownerId, locale, field: "copy" },
        });
      }
      const value = JSON.stringify(packed);
      return prisma.contentTranslation.upsert({
        where: {
          ownerType_ownerId_locale_field: { ownerType, ownerId, locale, field: "copy" },
        },
        create: { ownerType, ownerId, locale, field: "copy", value },
        update: { value },
      });
    }),
  );
}

export async function deleteOwnerCopies(ownerType: string, ownerId: string) {
  await prisma.contentTranslation.deleteMany({ where: { ownerType, ownerId } });
}

export function copyFilled(copy: Record<string, unknown> | undefined) {
  return Boolean(copy && Object.keys(copy).length > 0);
}
