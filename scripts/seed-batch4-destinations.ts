/**
 * Destinations required for Batch 4 media-ready treks.
 *
 *   npx tsx scripts/seed-batch4-destinations.ts
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

const DESTINATIONS = [
  {
    slug: "gurez",
    name: "Gurez Valley",
    region: "Jammu & Kashmir",
    country: "India",
    summary: "Kishanganga bowl villages beyond Razdan Pass — Habba Khatoon views and shepherd trails.",
    mapLat: "34.6300",
    mapLng: "74.8300",
    mapZoom: 10,
  },
  {
    slug: "naranag",
    name: "Naranag",
    region: "Jammu & Kashmir",
    country: "India",
    summary: "Ancient temple ruins and trailhead for Gangabal / Marchoi meadow walks.",
    mapLat: "34.3840",
    mapLng: "75.0940",
    mapZoom: 12,
  },
  {
    slug: "srinagar",
    name: "Srinagar",
    region: "Jammu & Kashmir",
    country: "India",
    summary: "Dal Lake capital — airport gateway for Kashmir treks and leisure circuits.",
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 11,
  },
  {
    slug: "aru-valley",
    name: "Aru Valley",
    region: "Jammu & Kashmir",
    country: "India",
    summary: "Pahalgam-side trailhead for Lidderwat meadows and Kolahoi approaches.",
    mapLat: "34.0910",
    mapLng: "75.2630",
    mapZoom: 12,
  },
  {
    slug: "manali",
    name: "Manali",
    region: "Himachal Pradesh",
    country: "India",
    summary: "Kullu valley hub for Beas Kund, Bhrigu Lake, and Solang meadow treks.",
    mapLat: "32.2396",
    mapLng: "77.1887",
    mapZoom: 11,
  },
  {
    slug: "sikkim",
    name: "Sikkim",
    region: "Sikkim",
    country: "India",
    summary: "Eastern Himalaya — Singalila ridge, Kanchenjunga views, and Yuksom trek starts.",
    mapLat: "27.5330",
    mapLng: "88.5122",
    mapZoom: 8,
  },
] as const;

async function main() {
  const fallback = "/uploads/destinations/seed-kashmir.svg";
  for (const dest of DESTINATIONS) {
    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {
        name: dest.name,
        region: dest.region,
        country: dest.country,
        summary: dest.summary,
        mapLat: dest.mapLat,
        mapLng: dest.mapLng,
        mapZoom: dest.mapZoom,
        published: true,
      },
      create: {
        slug: dest.slug,
        name: dest.name,
        region: dest.region,
        country: dest.country,
        summary: dest.summary,
        mapLat: dest.mapLat,
        mapLng: dest.mapLng,
        mapZoom: dest.mapZoom,
        published: true,
        popular: false,
        imageUrl: fallback,
        imageKey: "destinations/seed-kashmir.svg",
        imageDriver: "local",
      },
    });
    console.log("destination ready:", dest.slug);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
