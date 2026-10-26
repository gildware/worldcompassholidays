import "server-only";
import { prisma } from "@/lib/db";
import type { EnquiryModule, EnquiryView } from "@/lib/enquiries";

const fallback: Record<EnquiryModule, string> = {
  tour: "/img/company/service-holidays.jpg",
  hotel: "/img/company/service-hotels.jpg",
  car: "/img/cars/car-rental-banner.jpg",
  bike: "/img/bikes/bike-rental-banner.jpg",
  bus: "/img/company/service-holidays.jpg",
};

const placeFacts = new Set(["City", "From", "To", "Pickup", "Area", "Places", "Drop-off", "Hotel", "Tour", "Model", "Bus"]);

function cover(...urls: Array<string | null | undefined>) {
  return urls.map((url) => url?.trim() ?? "").find(Boolean) ?? "";
}

function subject(title: string) {
  return title
    .replace(/^(hotel|tour|car|bike|bus)\s+request:?\s*/i, "")
    .replace(/^in\s+/i, "")
    .trim();
}

function rank(name: string, needle: string) {
  const left = name.trim().toLowerCase();
  const right = needle.trim().toLowerCase();
  if (right.length < 3 || !left) return 0;
  if (left === right) return 3;
  if (left.includes(right) || right.includes(left)) return 2;
  return 0;
}

function needles(row: EnquiryView) {
  const values = [subject(row.title), ...row.facts.filter((fact) => placeFacts.has(fact.label)).map((fact) => fact.value)];
  return values.map((value) => value.trim()).filter((value) => value.length >= 3);
}

function best<T>(items: T[], terms: string[], name: (item: T) => string) {
  let winner: T | null = null;
  let score = 0;
  for (const item of items) {
    for (const term of terms) {
      const next = rank(name(item), term);
      if (next > score) {
        score = next;
        winner = item;
      }
    }
  }
  return winner;
}

export async function withEnquiryImages(rows: EnquiryView[]) {
  if (rows.length === 0) return rows;
  const modules = new Set(rows.map((row) => row.module));
  const [tours, hotels, vehicles, destinations, buses] = await Promise.all([
    modules.has("tour")
      ? prisma.tour.findMany({
          where: { published: true },
          select: { title: true, imageUrl: true, featuredImageUrl: true },
        })
      : [],
    modules.has("hotel")
      ? prisma.hotel.findMany({
          where: { published: true },
          select: { name: true, imageUrl: true, featuredImageUrl: true },
        })
      : [],
    modules.has("car") || modules.has("bike")
      ? prisma.vehicle.findMany({
          where: {
            published: true,
            kind: { in: [...modules].filter((module) => module === "car" || module === "bike") },
          },
          select: {
            name: true,
            kind: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
          },
        })
      : [],
    modules.has("hotel") || modules.has("tour") || modules.has("bus")
      ? prisma.destination.findMany({
          where: { published: true },
          select: { name: true, imageUrl: true },
        })
      : [],
    modules.has("bus")
      ? prisma.busRoute.findMany({
          where: { published: true },
          select: { name: true, imageUrl: true, fromCity: true, toCity: true },
        })
      : [],
  ]);

  return rows.map((row) => {
    const terms = needles(row);
    let image = "";
    if (row.module === "hotel") {
      const hotel = best(hotels, terms, (item) => item.name);
      image = hotel ? cover(hotel.featuredImageUrl, hotel.imageUrl) : "";
      if (!image) image = best(destinations, terms, (item) => item.name)?.imageUrl ?? "";
    } else if (row.module === "tour") {
      const tour = best(tours, terms, (item) => item.title);
      image = tour ? cover(tour.featuredImageUrl, tour.imageUrl) : "";
      if (!image) image = best(destinations, terms, (item) => item.name)?.imageUrl ?? "";
    } else if (row.module === "bus") {
      const bus = best(buses, terms, (item) => `${item.name} ${item.fromCity} ${item.toCity}`);
      image = bus?.imageUrl ?? "";
      if (!image) image = best(destinations, terms, (item) => item.name)?.imageUrl ?? "";
    } else {
      const vehicle = best(
        vehicles.filter((item) => item.kind === row.module),
        terms,
        (item) => item.name,
      );
      image = vehicle?.images[0]?.url ?? "";
    }
    return { ...row, image: cover(image) || fallback[row.module] };
  });
}
