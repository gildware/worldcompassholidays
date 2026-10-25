import { cache } from "react";
import { prisma } from "@/lib/db";
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

export const getSiteBrand = cache(async (): Promise<SiteBrandView> => {
  try {
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
  } catch {
    return empty;
  }
});
