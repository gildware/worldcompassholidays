import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";

export type CloudAsset = {
  url: string;
  key: string;
  driver: "cloudinary";
};

export type CloudinaryManifest = {
  files: Record<string, CloudAsset>;
  brand: {
    logo: CloudAsset | null;
    covers: CloudAsset[];
  };
};

export function manifestPath() {
  return path.join(process.cwd(), "prisma", "cloudinary-manifest.json");
}

export async function readCloudinaryManifest(): Promise<CloudinaryManifest | null> {
  try {
    const raw = await readFile(manifestPath(), "utf8");
    const parsed = JSON.parse(raw) as CloudinaryManifest;
    if (!parsed || typeof parsed.files !== "object" || parsed.files === null) return null;
    return {
      files: parsed.files,
      brand: {
        logo: parsed.brand?.logo ?? null,
        covers: Array.isArray(parsed.brand?.covers) ? parsed.brand.covers : [],
      },
    };
  } catch {
    return null;
  }
}

function lookup(
  files: Record<string, CloudAsset>,
  key: string,
  url: string,
): CloudAsset | null {
  if (key && files[key]) return files[key];
  if (url.startsWith("/uploads/")) {
    const rel = url.slice("/uploads/".length);
    if (files[rel]) return files[rel];
  }
  return null;
}

function same(asset: CloudAsset, key: string, url: string) {
  return key === asset.key && url === asset.url;
}

function rewriteGallery(json: string, files: Record<string, CloudAsset>) {
  let items: { url?: string; key?: string; driver?: string }[];
  try {
    const parsed = JSON.parse(json) as unknown;
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    return { json, changed: false };
  }
  let changed = false;
  const next = items.map((item) => {
    const hit = lookup(files, item?.key ?? "", item?.url ?? "");
    if (!hit || same(hit, item?.key ?? "", item?.url ?? "")) return item;
    changed = true;
    return { url: hit.url, key: hit.key, driver: "cloudinary" as const };
  });
  return { json: changed ? JSON.stringify(next) : json, changed };
}

/** Point stored local files at the Cloudinary copies listed in the manifest. */
export async function applyCloudinaryManifest(prisma: PrismaClient) {
  const manifest = await readCloudinaryManifest();
  if (!manifest) {
    console.log("No Cloudinary manifest found. Image paths were left unchanged.");
    return;
  }
  const files = manifest.files;
  let updated = 0;

  const destinations = await prisma.destination.findMany({
    select: { id: true, imageKey: true, imageUrl: true },
  });
  for (const row of destinations) {
    const hit = lookup(files, row.imageKey, row.imageUrl);
    if (!hit || same(hit, row.imageKey, row.imageUrl)) continue;
    await prisma.destination.update({
      where: { id: row.id },
      data: { imageUrl: hit.url, imageKey: hit.key, imageDriver: "cloudinary" },
    });
    updated += 1;
  }

  const tours = await prisma.tour.findMany({
    select: {
      id: true,
      imageKey: true,
      imageUrl: true,
      featuredImageKey: true,
      featuredImageUrl: true,
      seoImageKey: true,
      seoImageUrl: true,
      galleryJson: true,
    },
  });
  for (const row of tours) {
    const cover = lookup(files, row.imageKey, row.imageUrl);
    const banner = lookup(files, row.featuredImageKey, row.featuredImageUrl);
    const seo = lookup(files, row.seoImageKey, row.seoImageUrl);
    const gallery = rewriteGallery(row.galleryJson, files);
    const data: Record<string, string> = {};
    if (cover && !same(cover, row.imageKey, row.imageUrl)) {
      data.imageUrl = cover.url;
      data.imageKey = cover.key;
      data.imageDriver = "cloudinary";
    }
    if (banner && !same(banner, row.featuredImageKey, row.featuredImageUrl)) {
      data.featuredImageUrl = banner.url;
      data.featuredImageKey = banner.key;
      data.featuredImageDriver = "cloudinary";
    }
    if (seo && !same(seo, row.seoImageKey, row.seoImageUrl)) {
      data.seoImageUrl = seo.url;
      data.seoImageKey = seo.key;
      data.seoImageDriver = "cloudinary";
    }
    if (gallery.changed) data.galleryJson = gallery.json;
    if (Object.keys(data).length === 0) continue;
    await prisma.tour.update({ where: { id: row.id }, data });
    updated += 1;
  }

  const days = await prisma.itineraryDay.findMany({
    select: { id: true, imageKey: true, imageUrl: true },
  });
  for (const row of days) {
    const hit = lookup(files, row.imageKey, row.imageUrl);
    if (!hit || same(hit, row.imageKey, row.imageUrl)) continue;
    await prisma.itineraryDay.update({
      where: { id: row.id },
      data: { imageUrl: hit.url, imageKey: hit.key, imageDriver: "cloudinary" },
    });
    updated += 1;
  }

  const hotels = await prisma.hotel.findMany({
    select: {
      id: true,
      imageKey: true,
      imageUrl: true,
      featuredImageKey: true,
      featuredImageUrl: true,
      seoImageKey: true,
      seoImageUrl: true,
      galleryJson: true,
    },
  });
  for (const row of hotels) {
    const cover = lookup(files, row.imageKey, row.imageUrl);
    const banner = lookup(files, row.featuredImageKey, row.featuredImageUrl);
    const seo = lookup(files, row.seoImageKey, row.seoImageUrl);
    const gallery = rewriteGallery(row.galleryJson, files);
    const data: Record<string, string> = {};
    if (cover && !same(cover, row.imageKey, row.imageUrl)) {
      data.imageUrl = cover.url;
      data.imageKey = cover.key;
      data.imageDriver = "cloudinary";
    }
    if (banner && !same(banner, row.featuredImageKey, row.featuredImageUrl)) {
      data.featuredImageUrl = banner.url;
      data.featuredImageKey = banner.key;
      data.featuredImageDriver = "cloudinary";
    }
    if (seo && !same(seo, row.seoImageKey, row.seoImageUrl)) {
      data.seoImageUrl = seo.url;
      data.seoImageKey = seo.key;
      data.seoImageDriver = "cloudinary";
    }
    if (gallery.changed) data.galleryJson = gallery.json;
    if (Object.keys(data).length === 0) continue;
    await prisma.hotel.update({ where: { id: row.id }, data });
    updated += 1;
  }

  const rooms = await prisma.room.findMany({
    select: { id: true, imageKey: true, imageUrl: true },
  });
  for (const row of rooms) {
    const hit = lookup(files, row.imageKey, row.imageUrl);
    if (!hit || same(hit, row.imageKey, row.imageUrl)) continue;
    await prisma.room.update({
      where: { id: row.id },
      data: { imageUrl: hit.url, imageKey: hit.key, imageDriver: "cloudinary" },
    });
    updated += 1;
  }

  const locations = await prisma.rentalLocation.findMany({
    select: { id: true, imageKey: true, imageUrl: true },
  });
  for (const row of locations) {
    const hit = lookup(files, row.imageKey, row.imageUrl);
    if (!hit || same(hit, row.imageKey, row.imageUrl)) continue;
    await prisma.rentalLocation.update({
      where: { id: row.id },
      data: { imageUrl: hit.url, imageKey: hit.key, imageDriver: "cloudinary" },
    });
    updated += 1;
  }

  const vehicles = await prisma.vehicleImage.findMany({
    select: { id: true, key: true, url: true },
  });
  for (const row of vehicles) {
    const hit = lookup(files, row.key, row.url);
    if (!hit || same(hit, row.key, row.url)) continue;
    await prisma.vehicleImage.update({
      where: { id: row.id },
      data: { url: hit.url, key: hit.key, driver: "cloudinary" },
    });
    updated += 1;
  }

  const icons = await prisma.catalogItem.findMany({
    select: { id: true, iconKey: true, iconUrl: true },
  });
  for (const row of icons) {
    const hit = lookup(files, row.iconKey, row.iconUrl);
    if (!hit || same(hit, row.iconKey, row.iconUrl)) continue;
    await prisma.catalogItem.update({
      where: { id: row.id },
      data: { iconUrl: hit.url, iconKey: hit.key, iconDriver: "cloudinary" },
    });
    updated += 1;
  }

  if (manifest.brand.logo || manifest.brand.covers.length > 0) {
    const current = await prisma.siteBrand.findUnique({ where: { id: "default" } });
    const coversEmpty = !current || current.coversJson === "" || current.coversJson === "[]";
    const logoEmpty = !current?.logoUrl;
    const data: {
      logoUrl?: string;
      logoKey?: string;
      logoDriver?: string;
      coversJson?: string;
    } = {};
    if (logoEmpty && manifest.brand.logo) {
      data.logoUrl = manifest.brand.logo.url;
      data.logoKey = manifest.brand.logo.key;
      data.logoDriver = "cloudinary";
    }
    if (coversEmpty && manifest.brand.covers.length > 0) {
      data.coversJson = JSON.stringify(manifest.brand.covers);
    }
    if (Object.keys(data).length > 0) {
      await prisma.siteBrand.upsert({
        where: { id: "default" },
        update: data,
        create: { id: "default", ...data },
      });
      updated += 1;
    }
  }

  console.log(`Cloudinary image links updated: ${updated}`);
}
