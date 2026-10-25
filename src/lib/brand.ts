import { cache } from "react";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/ttl-cache";
import type { GalleryItem } from "@/lib/tours/json";

export type SiteBrandView = {
  logoUrl: string;
  logoKey: string;
  logoDriver: "local" | "cloudinary" | "";
  covers: GalleryItem[];
};

const empty: SiteBrandView = {
  logoUrl: "",
  logoKey: "",
  logoDriver: "",
  covers: [],
};

async function readSiteBrand(): Promise<SiteBrandView> {
  const row = await prisma.siteBrand.findUnique({ where: { id: "default" } });
  if (!row) return empty;
  let covers: GalleryItem[] = [];
  try {
    const parsed = JSON.parse(row.coversJson) as unknown;
    if (Array.isArray(parsed)) {
      covers = parsed.filter(
        (item): item is GalleryItem =>
          Boolean(item) &&
          typeof item.url === "string" &&
          typeof item.key === "string" &&
          (item.driver === "local" || item.driver === "cloudinary"),
      );
    }
  } catch {
    covers = [];
  }
  return {
    logoUrl: row.logoUrl,
    logoKey: row.logoKey,
    logoDriver: row.logoDriver === "cloudinary" ? "cloudinary" : row.logoUrl ? "local" : "",
    covers,
  };
}

export const getSiteBrand = cache(async (): Promise<SiteBrandView> => {
  try {
    return await cached("site-brand", 60_000, readSiteBrand);
  } catch {
    return empty;
  }
});
