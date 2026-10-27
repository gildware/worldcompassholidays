import { cache } from "react";
import { theme } from "@/config/theme";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/ttl-cache";
import type { GalleryItem } from "@/lib/tours/json";

export const HOME_SECTION_IDS = [
  "hero",
  "services",
  "destinations",
  "tours",
  "hotels",
  "cars",
  "bikes",
  "buses",
  "why",
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

export type HomeServiceItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Stock or pasted photo, used when no upload is set. */
  imageUrl: string;
  image: GalleryItem | null;
};

export type HomeServiceGroup = {
  id: string;
  title: string;
  subtitle: string;
  items: HomeServiceItem[];
};

export type HomeServicesContent = {
  badge: string;
  title: string;
  subtitle: string;
  groups: HomeServiceGroup[];
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
  services: HomeServicesContent;
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
  services: "Our services",
  destinations: "Popular destinations",
  tours: "Tours and treks",
  hotels: "Hotels and stays",
  cars: "Cars for the trip",
  bikes: "Bikes for the road",
  buses: "Buses between cities",
  why: "Why book with us",
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
  services: {
    badge: "Services",
    title: "Our Services",
    subtitle: "We have the strategy for serving things right, book with us and know the difference",
    groups: [
      {
        id: "all",
        title: "All services",
        subtitle: "Hotels, cars, bikes, buses, visas, and a greeter at the airport.",
        items: [
          {
            id: "hotels",
            title: "Hotels",
            description: "Published stays, and a search when the hotel you want is not on the list.",
            href: "/hotels",
            imageUrl: "/img/company/service-hotels.jpg",
            image: null,
          },
          {
            id: "cars",
            title: "Cars",
            description: "Self-drive and chauffeur cars, priced by the day before you pay.",
            href: "/rentals/cars",
            imageUrl: "/img/cars/car-rental-banner.jpg",
            image: null,
          },
          {
            id: "bikes",
            title: "Bike service",
            description: "Scooters and motorcycles for the hill roads and the coast, helmet included.",
            href: "/rentals/bikes",
            imageUrl: "/img/bikes/bike-rental-banner.jpg",
            image: null,
          },
          {
            id: "buses",
            title: "Buses",
            description: "Coaches between cities, with the time and an indicative fare on the card.",
            href: "/buses",
            imageUrl: "/img/buses/valley-volvo-cover.jpg",
            image: null,
          },
          {
            id: "visa",
            title: "Visa",
            description: "The document list and our fee, with the embassy fee kept on its own line.",
            href: "/visa-services",
            imageUrl: "/img/visa/visa-hero.jpg",
            image: null,
          },
          {
            id: "assist",
            title: "Meet and assist",
            description: "A named greeter at the airport. The fee is in the quote before anyone is booked.",
            href: "/meet-and-assist",
            imageUrl: "/img/assist/assist-arrival.jpg",
            image: null,
          },
        ],
      },
      {
        id: "stays",
        title: "Stays",
        subtitle: "Houseboats, villas, homestays, and hotels.",
        items: [
          {
            id: "houseboats",
            title: "Houseboats",
            description: "A night on the water, quoted with the meals and the boat named before you pay.",
            href: "/hotels?q=houseboat",
            imageUrl: "/img/company/service-holidays.jpg",
            image: null,
          },
          {
            id: "villas",
            title: "Villas",
            description: "A whole house for the family, with the rooms and the price written down first.",
            href: "/hotels?types=Villa",
            imageUrl: "/img/tours/header-bg.jpg",
            image: null,
          },
          {
            id: "homestays",
            title: "Homestays",
            description: "A room in a home, with breakfast and the house rules in the quote.",
            href: "/hotels?types=Homestay",
            imageUrl: "/img/company/service-sightseeing.jpg",
            image: null,
          },
          {
            id: "hotels-stay",
            title: "Hotels",
            description: "City and hill hotels, with the nightly rate on the stay page.",
            href: "/hotels?types=Hotel",
            imageUrl: "/img/company/service-hotels.jpg",
            image: null,
          },
        ],
      },
      {
        id: "tour-types",
        title: "Tours",
        subtitle: "Religious tours, honeymoon tours, family tours, and camping.",
        items: [
          {
            id: "religious",
            title: "Religious tours",
            description: "Shrine and yatra routes, with the days and the stay named in the plan.",
            href: "/tours?q=religious",
            imageUrl: "/img/company/service-sightseeing.jpg",
            image: null,
          },
          {
            id: "honeymoon",
            title: "Honeymoon tours",
            description: "A quieter plan for two, with the hotels and the transfers in one quote.",
            href: "/tours?q=honeymoon",
            imageUrl: "/img/company/service-holidays.jpg",
            image: null,
          },
          {
            id: "family",
            title: "Family tours",
            description: "A pace that suits children and elders, with the rooms counted before you leave.",
            href: "/tours?q=family",
            imageUrl: "/img/company/service-packages.jpg",
            image: null,
          },
          {
            id: "camping",
            title: "Camping",
            description: "Nights in camp, with the tents, meals, and the road written down first.",
            href: "/tours?q=camping",
            imageUrl: "/img/tours/header-bg.jpg",
            image: null,
          },
        ],
      },
      {
        id: "vehicles",
        title: "Vehicles",
        subtitle: "SUVs, adventure bikes, and buses.",
        items: [
          {
            id: "suvs",
            title: "SUVs",
            description: "Higher cars for the mountain roads, priced by the day.",
            href: "/rentals/cars",
            imageUrl: "/img/cars/car-rental-banner.jpg",
            image: null,
          },
          {
            id: "adventure-bikes",
            title: "Adventure bikes",
            description: "Bikes for a long hill day, with the licence rule on the bike page.",
            href: "/rentals/bikes",
            imageUrl: "/img/bikes/bike-rental-banner.jpg",
            image: null,
          },
          {
            id: "coaches",
            title: "Buses",
            description: "Seater and sleeper coaches, with the departure time on the route.",
            href: "/buses",
            imageUrl: "/img/buses/night-sleeper-cover.jpg",
            image: null,
          },
          {
            id: "city-cars",
            title: "Cars",
            description: "A car for the airport, the city, or the whole trip.",
            href: "/rentals/cars",
            imageUrl: "/img/company/service-transfers.jpg",
            image: null,
          },
        ],
      },
    ],
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

function asHref(value: unknown, fallback: string) {
  const raw = asString(value, fallback).trim().slice(0, 200);
  if (!raw) return fallback;
  if (raw.startsWith("/") || raw.startsWith("https://") || raw.startsWith("http://")) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}

function asStockImage(value: unknown, fallback: string) {
  const raw = asString(value, fallback).trim().slice(0, 400);
  if (
    raw.startsWith("/img/") ||
    raw.startsWith("/uploads/") ||
    raw.startsWith("https://")
  ) {
    return raw;
  }
  return fallback;
}

function asServiceCard(entry: unknown, index: number, seen: Set<string>): HomeServiceItem | null {
  const row = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
  const title = asString(row.title, asString(row.label, "")).trim().slice(0, 60);
  if (!title) return null;
  let id = asString(row.id, `card-${index + 1}`).trim().slice(0, 40) || `card-${index + 1}`;
  if (seen.has(id)) id = `${id}-${index + 1}`.slice(0, 40);
  seen.add(id);
  return {
    id,
    title,
    description: asString(row.description, "").trim().slice(0, 220),
    href: asHref(row.href, "/"),
    imageUrl: asStockImage(row.imageUrl, ""),
    image: asImage(row.image),
  };
}

function asServiceGroups(value: unknown): HomeServiceGroup[] {
  const fallback = defaultHomePageContent.services.groups;
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const groups: HomeServiceGroup[] = [];
  const seenGroups = new Set<string>();
  for (const [index, entry] of value.entries()) {
    const row = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const title = asString(row.title, "").trim().slice(0, 80);
    if (!title) continue;
    let id = asString(row.id, `group-${index + 1}`).trim().slice(0, 40) || `group-${index + 1}`;
    if (seenGroups.has(id)) id = `${id}-${index + 1}`.slice(0, 40);
    seenGroups.add(id);
    const seenCards = new Set<string>();
    const items = Array.isArray(row.items)
      ? row.items.flatMap((item, cardIndex) => {
          const card = asServiceCard(item, cardIndex, seenCards);
          return card ? [card] : [];
        }).slice(0, 8)
      : [];
    if (!items.length) continue;
    groups.push({
      id,
      title,
      subtitle: asString(row.subtitle, "").trim().slice(0, 200),
      items,
    });
    if (groups.length >= 6) break;
  }
  return groups.length ? groups : fallback;
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
  const services = parsed.services && typeof parsed.services === "object"
    ? (parsed.services as Record<string, unknown>)
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
    services: {
      badge: asString(services.badge, defaultHomePageContent.services.badge).slice(0, 24),
      title: asString(services.title, defaultHomePageContent.services.title).slice(0, 80),
      subtitle: asString(services.subtitle, defaultHomePageContent.services.subtitle).slice(0, 240),
      groups: asServiceGroups(services.groups),
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
