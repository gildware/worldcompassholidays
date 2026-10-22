import { resolveTitles } from "@/lib/hotels/labels";
import type { CatalogOption } from "@/lib/catalog";
import { plainText } from "@/lib/seo";
import type { CatalogTour } from "@/components/tour-list/catalog/types";
import { parseDurationUnit, parseJsonArray, type GalleryItem } from "@/lib/tours/json";

const languageNames = [
  "English",
  "Hindi",
  "Kashmiri",
  "French",
  "Spanish",
  "Turkish",
  "German",
  "Chinese",
  "Portuguese",
  "Japanese",
  "Italian",
];

export function catalogIso(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

type TourRow = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  durationDays: number;
  durationUnit: string;
  durationLabel: string;
  difficulty: string;
  minPeople: number;
  maxGroupSize: number;
  priceFrom: number;
  currency: string;
  imageUrl: string;
  featuredImageUrl: string;
  galleryJson: string;
  includesJson: string;
  excludesJson: string;
  address: string;
  isFeatured: boolean;
  minDayBeforeBooking: number | null;
  destination: { name: string; region: string; country: string } | null;
  days: { dayNumber: number; title: string; description: string }[];
  departures: { id: string; startDate: Date; seatsTotal: number; price: number; status: string }[];
};

function levelOf(difficulty: string): CatalogTour["level"] {
  const value = difficulty.toLowerCase();
  if (value.includes("easy")) return "easy";
  if (value.includes("hard") || value.includes("challeng") || value.includes("demand")) return "hard";
  return "moderate";
}

function styleOf(title: string, category: string, maxGroupSize: number): CatalogTour["style"] {
  if (/private/i.test(`${title} ${category}`)) return "private";
  if (maxGroupSize > 0 && maxGroupSize <= 10) return "small";
  return "shared";
}

export function toCatalogTour(
  tour: TourRow,
  includes: CatalogOption[],
  excludes: CatalogOption[],
): CatalogTour {
  const place = tour.destination;
  const placeName = place?.name ?? "";
  const region = place?.region || place?.country || placeName || "Other";
  const unit = parseDurationUnit(tour.durationUnit);
  const count = Number.isFinite(tour.durationDays) && tour.durationDays > 0 ? tour.durationDays : 1;
  const days = unit === "weeks" ? count * 7 : unit === "hours" ? Math.max(1, Math.ceil(count / 24)) : count;
  const hours = unit === "hours" ? count : days <= 1 ? 8 : days * 24;
  const gallery = parseJsonArray<GalleryItem>(tour.galleryJson).flatMap((item) => (item?.url ? [item.url] : []));
  const images = [...new Set([tour.imageUrl, tour.featuredImageUrl, ...gallery].filter(Boolean))];
  const included = resolveTitles(tour.includesJson, includes);
  const excluded = resolveTitles(tour.excludesJson, excludes);
  const langs = languageNames.filter((name) =>
    new RegExp(`(?:^|\\b)(?:in|speaks?) ${name}\\b`, "i").test(`${tour.summary} ${plainText(tour.description)}`),
  );
  const story = plainText(tour.description) || tour.summary.trim();
  const timeline = tour.days
    .filter((day) => day.title.trim())
    .map((day) => `Day ${day.dayNumber}: ${day.title.trim()}`);
  const level = levelOf(tour.difficulty);
  const pickup = included.some((item) => /pickup/i.test(item));
  const meetShort = tour.address.trim() || (pickup ? "Hotel pickup" : placeName ? `Meet in ${placeName}` : "Meeting point on request");

  return {
    id: tour.slug,
    slug: tour.slug,
    title: tour.title,
    place: placeName || region,
    region,
    category: tour.category.trim() || "Tours",
    days,
    hours,
    when: days > 1 ? "multi" : "morning",
    style: styleOf(tour.title, tour.category, tour.maxGroupSize),
    groupMax: tour.maxGroupSize > 0 ? tour.maxGroupSize : 12,
    minPeople: tour.minPeople > 0 ? tour.minPeople : 1,
    level,
    price: tour.priceFrom,
    currency: tour.currency || "INR",
    langs: langs.length ? langs : ["English"],
    pickup,
    cancelDays: tour.minDayBeforeBooking && tour.minDayBeforeBooking > 0 ? tour.minDayBeforeBooking : 7,
    rating: 0,
    reviews: 0,
    weekdays: null,
    img: images[0] ?? "",
    alt: tour.title,
    mention: tour.summary.trim(),
    includes: included,
    excludes: excluded,
    story,
    timeline: timeline.length ? timeline : story ? [story] : [],
    meet: tour.address.trim() || meetShort,
    meetShort,
    href: `/tours/${tour.slug}`,
    levelNote:
      level === "hard"
        ? "Demanding. The desk confirms the pace before you go."
        : "",
    featured: tour.isFeatured,
    departures: tour.departures.map((item) => ({
      id: item.id,
      iso: catalogIso(item.startDate),
      seats: item.seatsTotal,
      price: item.price,
      status: item.status,
    })),
  };
}
