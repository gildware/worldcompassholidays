import type { MetadataRoute } from "next";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";
import { fleetKinds } from "@/lib/rentals/labels";

export const dynamic = "force-dynamic";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function entry(path: string, priority: number, changeFrequency: ChangeFrequency, lastModified?: Date) {
  return {
    url: absoluteUrl(path),
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", 1, "daily"),
    entry("/destinations", 0.9, "weekly"),
    entry("/visa-services", 0.7, "monthly"),
    entry("/visa-services/apply", 0.6, "monthly"),
    entry("/meet-and-assist", 0.7, "monthly"),
    entry("/meet-and-assist/request", 0.6, "monthly"),
    entry("/contact", 0.6, "monthly"),
    entry("/about", 0.7, "monthly"),
    entry("/help", 0.5, "monthly"),
    entry("/terms", 0.4, "yearly"),
    entry("/privacy", 0.4, "yearly"),
    entry("/cancellation", 0.4, "yearly"),
    entry("/cookies", 0.3, "yearly"),
    entry("/sitemap", 0.3, "monthly"),
  ];

  if (modules.tours) staticEntries.push(entry("/tours", 0.9, "daily"));
  if (modules.hotels) {
    staticEntries.push(entry("/hotels", 0.9, "daily"));
    staticEntries.push(entry("/hotels/request", 0.6, "monthly"));
  }
  if (modules.cars || modules.bikes) staticEntries.push(entry("/rentals", 0.8, "daily"));
  if (modules.cars) staticEntries.push(entry("/rentals/cars", 0.8, "daily"));
  if (modules.bikes) staticEntries.push(entry("/rentals/bikes", 0.8, "daily"));
  if (modules.buses) staticEntries.push(entry("/buses", 0.5, "weekly"));

  const kinds = fleetKinds();
  const [destinations, tours, hotels, vehicles] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    modules.tours
      ? prisma.tour.findMany({
          where: { published: true, seoIndex: true },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    modules.hotels
      ? prisma.hotel.findMany({
          where: { published: true, seoIndex: true },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    kinds.length
      ? prisma.vehicle.findMany({
          where: { published: true, kind: { in: kinds } },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
  ]);

  return [
    ...staticEntries,
    ...destinations.map((item) => entry(`/destinations/${item.slug}`, 0.8, "weekly", item.updatedAt)),
    ...tours.map((item) => entry(`/tours/${item.slug}`, 0.8, "weekly", item.updatedAt)),
    ...hotels.map((item) => entry(`/hotels/${item.slug}`, 0.8, "weekly", item.updatedAt)),
    ...vehicles.map((item) => entry(`/rentals/${item.slug}`, 0.7, "weekly", item.updatedAt)),
  ];
}
