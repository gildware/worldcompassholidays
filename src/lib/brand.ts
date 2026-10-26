import { cache } from "react";
import { theme } from "@/config/theme";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/ttl-cache";
import type { GalleryItem } from "@/lib/tours/json";
import { whatsAppHref } from "@/lib/visa";

export type SiteBrandView = {
  logoUrl: string;
  logoKey: string;
  logoDriver: "local" | "cloudinary" | "";
  covers: GalleryItem[];
};

export type SiteSocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
};

export type SiteSettings = SiteBrandView & {
  primaryColor: string;
  primarySoft: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  social: SiteSocialLinks;
};

const HEX = /^#([0-9a-fA-F]{6})$/;

const emptyBrand: SiteBrandView = {
  logoUrl: "",
  logoKey: "",
  logoDriver: "",
  covers: [],
};

function parseCovers(raw: string): GalleryItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GalleryItem =>
        Boolean(item) &&
        typeof item.url === "string" &&
        typeof item.key === "string" &&
        (item.driver === "local" || item.driver === "cloudinary"),
    );
  } catch {
    return [];
  }
}

export function isHexColor(value: string) {
  return HEX.test(value.trim());
}

export function normalizeHex(value: string, fallback: string = theme.colors.blue) {
  const v = value.trim();
  return HEX.test(v) ? `#${v.slice(1).toLowerCase()}` : fallback;
}

function hexToRgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function mixHex(hex: string, toward: string, amount: number) {
  const a = hexToRgb(normalizeHex(hex));
  const b = hexToRgb(normalizeHex(toward, "#ffffff"));
  const mix = (x: number, y: number) => Math.round(x + (y - x) * amount);
  return `#${[mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function colorSoft(hex: string) {
  return mixHex(hex, "#ffffff", 0.88);
}

function pick(value: string | null | undefined, fallback: string) {
  const next = value?.trim() ?? "";
  return next || fallback;
}

async function readSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteBrand.findUnique({ where: { id: "default" } });
  const primaryColor = normalizeHex(row?.primaryColor ?? "", theme.colors.blue);
  return {
    logoUrl: row?.logoUrl ?? "",
    logoKey: row?.logoKey ?? "",
    logoDriver: row?.logoDriver === "cloudinary" ? "cloudinary" : row?.logoUrl ? "local" : "",
    covers: row ? parseCovers(row.coversJson) : [],
    primaryColor,
    primarySoft: colorSoft(primaryColor),
    phone: pick(row?.phone, theme.contact.phone),
    whatsapp: pick(row?.whatsapp, theme.contact.whatsapp),
    email: pick(row?.email, theme.contact.email),
    address: pick(row?.address, theme.contact.city),
    social: {
      facebook: pick(row?.facebookUrl, theme.social.facebook),
      instagram: pick(row?.instagramUrl, theme.social.instagram),
      twitter: pick(row?.twitterUrl, theme.social.twitter),
      linkedin: pick(row?.linkedinUrl, theme.social.linkedin),
      youtube: pick(row?.youtubeUrl, theme.social.youtube),
    },
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await cached("site-settings", 60_000, readSiteSettings);
  } catch {
    const primaryColor = theme.colors.blue;
    return {
      ...emptyBrand,
      primaryColor,
      primarySoft: colorSoft(primaryColor),
      phone: theme.contact.phone,
      whatsapp: theme.contact.whatsapp,
      email: theme.contact.email,
      address: theme.contact.city,
      social: { ...theme.social },
    };
  }
});

export const getSiteBrand = cache(async (): Promise<SiteBrandView> => {
  const settings = await getSiteSettings();
  return {
    logoUrl: settings.logoUrl,
    logoKey: settings.logoKey,
    logoDriver: settings.logoDriver,
    covers: settings.covers,
  };
});

export async function deskWhatsAppHref() {
  const settings = await getSiteSettings();
  return whatsAppHref(settings.whatsapp);
}
