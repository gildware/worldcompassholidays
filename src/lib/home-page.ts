import { cache } from "react";
import { theme } from "@/config/theme";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/ttl-cache";
import type { GalleryItem } from "@/lib/tours/json";

export const HOME_SECTION_IDS = [
  "hero",
  "destinations",
  "tours",
  "hotels",
  "cars",
  "bikes",
  "buses",
  "why",
  "visa",
  "assist",
  "cta",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export type HomeRailMode = "auto" | "manual";

export type HomeRailConfig = {
  title: string;
  subtitle: string;
  linkLabel: string;
  mode: HomeRailMode;
  ids: string[];
};

export type HomeSectionMeta = {
  id: HomeSectionId;
  enabled: boolean;
};

export type HomeWhyItem = {
  id: string;
  title: string;
  text: string;
};

export type HomePageContent = {
  hero: {
    title: string;
    description: string;
    image: GalleryItem | null;
  };
  sections: HomeSectionMeta[];
  destinations: HomeRailConfig;
  tours: HomeRailConfig;
  hotels: HomeRailConfig;
  cars: HomeRailConfig;
  bikes: HomeRailConfig;
  buses: HomeRailConfig;
  visa: {
    title: string;
    subtitle: string;
    meta: string;
    moreLabel: string;
    ctaLabel: string;
  };
  assist: {
    title: string;
    subtitle: string;
    moreLabel: string;
    ctaLabel: string;
  };
  cta: {
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
  why: {
    items: HomeWhyItem[];
  };
};

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "Hero",
  destinations: "Popular destinations",
  tours: "Tours and treks",
  hotels: "Hotels and stays",
  cars: "Cars for the trip",
  bikes: "Bikes for the road",
  buses: "Buses between cities",
  why: "Why book with us",
  visa: "Visa help",
  assist: "Meet and assist",
  cta: "Contact banner",
};

export const defaultHomePageContent: HomePageContent = {
  hero: {
    title: theme.headline,
    description: theme.tagline,
    image: null,
  },
  sections: HOME_SECTION_IDS.map((id) => ({ id, enabled: true })),
  destinations: {
    title: "Popular Destinations",
    subtitle:
      "Places marked popular, with the tours, hotels, and rentals published for each.",
    linkLabel: "View All Destinations",
    mode: "auto",
    ids: [],
  },
  tours: {
    title: "Tours and treks",
    subtitle: "Published routes, with duration and a starting price on each page.",
    linkLabel: "All tours",
    mode: "auto",
    ids: [],
  },
  hotels: {
    title: "Hotels and stays",
    subtitle: "Published stays. If the hotel you want is not listed, ask us to search.",
    linkLabel: "All hotels",
    mode: "auto",
    ids: [],
  },
  cars: {
    title: "Cars for the trip",
    subtitle: "Self-drive and chauffeur, priced by the day.",
    linkLabel: "All cars",
    mode: "auto",
    ids: [],
  },
  bikes: {
    title: "Bikes for the road",
    subtitle: "Scooters and motorcycles, with a helmet on the hire.",
    linkLabel: "All bikes",
    mode: "auto",
    ids: [],
  },
  buses: {
    title: "Buses between cities",
    subtitle: "Listed coaches, with times and an indicative fare. Nothing is booked until you accept a quote.",
    linkLabel: "All buses",
    mode: "auto",
    ids: [],
  },
  visa: {
    title: "Visa help",
    subtitle:
      "We list every document, quote our fee, and keep the embassy fee on its own line. Nothing is filed until you accept.",
    meta: "14 destinations · Reply within 24 hours · Embassy fee kept separate",
    moreLabel: "View more details",
    ctaLabel: "Get a visa quote",
  },
  assist: {
    title: "Meet and assist",
    subtitle:
      "A greeter at the airport on the day you fly. Send the flight number and we name who meets you, and the fee, before anyone is booked.",
    moreLabel: "View more details",
    ctaLabel: "Book a greeter",
  },
  cta: {
    title: "Tell us the trip. We quote it before you pay.",
    subtitle: "Tours, hotels, buses, visas, airport meet and assist, and car or bike rental.",
    buttonLabel: "Contact us",
  },
  why: {
    items: [
      {
        id: "price",
        title: "A price before you pay",
        text: "The quote names the fee. You accept it before anyone is booked.",
      },
      {
        id: "request",
        title: "One request for the trip",
        text: "Tours, stays, visas, and rentals start from the same enquiry.",
      },
      {
        id: "reply",
        title: "A person replies",
        text: `Call or WhatsApp ${theme.contact.phone}. We answer from India.`,
      },
    ],
  },
};

function isSectionId(value: unknown): value is HomeSectionId {
  return HOME_SECTION_IDS.includes(value as HomeSectionId);
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function asMode(value: unknown): HomeRailMode {
  return value === "manual" ? "manual" : "auto";
}

function asIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item || seen.has(item)) continue;
    seen.add(item);
    ids.push(item);
    if (ids.length >= 24) break;
  }
  return ids;
}

function asImage(value: unknown): GalleryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.url !== "string" || typeof item.key !== "string") return null;
  if (item.driver !== "local" && item.driver !== "cloudinary") return null;
  if (!item.url.trim() || !item.key.trim()) return null;
  return { url: item.url, key: item.key, driver: item.driver };
}

function asRail(
  value: unknown,
  fallback: HomeRailConfig,
): HomeRailConfig {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    title: asString(row.title, fallback.title).slice(0, 80),
    subtitle: asString(row.subtitle, fallback.subtitle).slice(0, 240),
    linkLabel: asString(row.linkLabel, fallback.linkLabel).slice(0, 40),
    mode: asMode(row.mode),
    ids: asIds(row.ids),
  };
}

function asWhyItems(value: unknown): HomeWhyItem[] {
  const fallback = defaultHomePageContent.why.items;
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const items: HomeWhyItem[] = [];
  for (const [index, entry] of value.entries()) {
    const row = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const title = asString(row.title, "").trim().slice(0, 80);
    const text = asString(row.text, "").trim().slice(0, 240);
    if (!title && !text) continue;
    items.push({
      id: asString(row.id, `why-${index + 1}`).slice(0, 40) || `why-${index + 1}`,
      title: title || fallback[index]?.title || `Point ${index + 1}`,
      text: text || fallback[index]?.text || "",
    });
    if (items.length >= 4) break;
  }
  return items.length ? items : fallback;
}

function asSections(value: unknown): HomeSectionMeta[] {
  const used = new Set<HomeSectionId>();
  const next: HomeSectionMeta[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      if (!isSectionId(row.id) || used.has(row.id)) continue;
      used.add(row.id);
      next.push({ id: row.id, enabled: row.enabled !== false });
    }
  }
  for (const id of HOME_SECTION_IDS) {
    if (used.has(id)) continue;
    const later = HOME_SECTION_IDS.slice(HOME_SECTION_IDS.indexOf(id) + 1);
    const insertAt = next.findIndex((section) => later.includes(section.id));
    const meta = { id, enabled: true };
    if (insertAt === -1) next.push(meta);
    else next.splice(insertAt, 0, meta);
    used.add(id);
  }
  return next;
}

export function parseHomePageContent(raw: string | null | undefined): HomePageContent {
  let parsed: Record<string, unknown> = {};
  if (raw) {
    try {
      const value = JSON.parse(raw) as unknown;
      if (value && typeof value === "object") parsed = value as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }

  const hero = parsed.hero && typeof parsed.hero === "object"
    ? (parsed.hero as Record<string, unknown>)
    : {};
  const visa = parsed.visa && typeof parsed.visa === "object"
    ? (parsed.visa as Record<string, unknown>)
    : {};
  const assist = parsed.assist && typeof parsed.assist === "object"
    ? (parsed.assist as Record<string, unknown>)
    : {};
  const cta = parsed.cta && typeof parsed.cta === "object"
    ? (parsed.cta as Record<string, unknown>)
    : {};
  const why = parsed.why && typeof parsed.why === "object"
    ? (parsed.why as Record<string, unknown>)
    : {};

  return {
    hero: {
      title: asString(hero.title, defaultHomePageContent.hero.title).slice(0, 90),
      description: asString(hero.description, defaultHomePageContent.hero.description).slice(0, 240),
      image: asImage(hero.image),
    },
    sections: asSections(parsed.sections),
    destinations: asRail(parsed.destinations, defaultHomePageContent.destinations),
    tours: asRail(parsed.tours, defaultHomePageContent.tours),
    hotels: asRail(parsed.hotels, defaultHomePageContent.hotels),
    cars: asRail(parsed.cars, defaultHomePageContent.cars),
    bikes: asRail(parsed.bikes, defaultHomePageContent.bikes),
    buses: asRail(parsed.buses, defaultHomePageContent.buses),
    visa: {
      title: asString(visa.title, defaultHomePageContent.visa.title).slice(0, 80),
      subtitle: asString(visa.subtitle, defaultHomePageContent.visa.subtitle).slice(0, 320),
      meta: asString(visa.meta, defaultHomePageContent.visa.meta).slice(0, 160),
      moreLabel: asString(visa.moreLabel, defaultHomePageContent.visa.moreLabel).slice(0, 40),
      ctaLabel: asString(visa.ctaLabel, defaultHomePageContent.visa.ctaLabel).slice(0, 40),
    },
    assist: {
      title: asString(assist.title, defaultHomePageContent.assist.title).slice(0, 80),
      subtitle: asString(assist.subtitle, defaultHomePageContent.assist.subtitle).slice(0, 320),
      moreLabel: asString(assist.moreLabel, defaultHomePageContent.assist.moreLabel).slice(0, 40),
      ctaLabel: asString(assist.ctaLabel, defaultHomePageContent.assist.ctaLabel).slice(0, 40),
    },
    cta: {
      title: asString(cta.title, defaultHomePageContent.cta.title).slice(0, 90),
      subtitle: asString(cta.subtitle, defaultHomePageContent.cta.subtitle).slice(0, 240),
      buttonLabel: asString(cta.buttonLabel, defaultHomePageContent.cta.buttonLabel).slice(0, 40),
    },
    why: {
      items: asWhyItems(why.items),
    },
  };
}

export function orderByIds<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const map = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = map.get(id);
    return item ? [item] : [];
  });
}

async function readHomePageContent(): Promise<HomePageContent> {
  const row = await prisma.siteHome.findUnique({ where: { id: "default" } });
  return parseHomePageContent(row?.contentJson);
}

export const getHomePageContent = cache(async (): Promise<HomePageContent> => {
  try {
    return await cached("site-home", 20_000, readHomePageContent);
  } catch {
    return defaultHomePageContent;
  }
});

/** Fill empty rails with the lists currently on the public homepage. */
export function withLiveHomeLists(
  content: HomePageContent,
  live: {
    destinations: string[];
    tours: string[];
    hotels: string[];
    cars: string[];
    bikes: string[];
    buses: string[];
  },
): HomePageContent {
  const fill = (rail: HomeRailConfig, ids: string[]): HomeRailConfig => {
    if (rail.ids.length > 0) return rail;
    return { ...rail, ids };
  };
  return {
    ...content,
    destinations: fill(content.destinations, live.destinations),
    tours: fill(content.tours, live.tours),
    hotels: fill(content.hotels, live.hotels),
    cars: fill(content.cars, live.cars),
    bikes: fill(content.bikes, live.bikes),
    buses: fill(content.buses, live.buses),
  };
}
