/**
 * Upsert destinations needed for Batch 1 locked tours.
 *
 *   npx tsx scripts/seed-batch1-destinations.ts
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

const DESTINATIONS = [
  {
    slug: "goa",
    name: "Goa",
    region: "Goa",
    country: "India",
    summary: "West-coast beaches, Portuguese heritage, and year-round leisure.",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 9,
  },
  {
    slug: "jaisalmer",
    name: "Jaisalmer",
    region: "Rajasthan",
    country: "India",
    summary: "Golden fort city and Thar Desert dunes of western Rajasthan.",
    mapLat: "26.9157",
    mapLng: "70.9083",
    mapZoom: 10,
  },
  {
    slug: "ranthambore",
    name: "Ranthambore",
    region: "Rajasthan",
    country: "India",
    summary: "Tiger reserve and fort landscape near Sawai Madhopur.",
    mapLat: "26.0173",
    mapLng: "76.5026",
    mapZoom: 11,
  },
  {
    slug: "shimla",
    name: "Shimla",
    region: "Himachal Pradesh",
    country: "India",
    summary: "Himachal hill capital — Mall Road, ridges, and pine forests.",
    mapLat: "31.1048",
    mapLng: "77.1734",
    mapZoom: 11,
  },
  {
    slug: "mussoorie",
    name: "Mussoorie",
    region: "Uttarakhand",
    country: "India",
    summary: "Queen of Hills gateway for Nag Tibba and weekend treks.",
    mapLat: "30.4598",
    mapLng: "78.0644",
    mapZoom: 11,
  },
  {
    slug: "keran",
    name: "Keran",
    region: "Jammu & Kashmir",
    country: "India",
    summary: "Kishanganga valley village near the LOC, paired with Gurez trips.",
    mapLat: "34.6500",
    mapLng: "73.9667",
    mapZoom: 11,
  },
  {
    slug: "tulian",
    name: "Tulian Lake",
    region: "Jammu & Kashmir",
    country: "India",
    summary: "Alpine lake above Pahalgam reached on a short high-meadow trek.",
    mapLat: "34.0167",
    mapLng: "75.3500",
    mapZoom: 12,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    region: "Rajasthan",
    country: "India",
    summary: "Desert forts, wildlife parks, and heritage circuits of northwest India.",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 6,
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    region: "Rajasthan",
    country: "India",
    summary: "Lake city of Rajasthan — palaces, ghats, and romantic stays.",
    mapLat: "24.5854",
    mapLng: "73.7125",
    mapZoom: 11,
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    region: "Rajasthan",
    country: "India",
    summary: "Pink City capital of Rajasthan — forts, bazaars, and heritage hotels.",
    mapLat: "26.9124",
    mapLng: "75.7873",
    mapZoom: 11,
  },
  {
    slug: "delhi",
    name: "Delhi",
    region: "Delhi",
    country: "India",
    summary: "National capital — gateway for Golden Triangle and north India tours.",
    mapLat: "28.6139",
    mapLng: "77.2090",
    mapZoom: 10,
  },
  {
    slug: "agra",
    name: "Agra",
    region: "Uttar Pradesh",
    country: "India",
    summary: "Taj Mahal city on the Yamuna — core Golden Triangle stop.",
    mapLat: "27.1767",
    mapLng: "78.0081",
    mapZoom: 11,
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
