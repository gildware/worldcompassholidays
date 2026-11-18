import type { TourFormValues } from "@/components/admin/TourForm";
import { localFaqs, selectionKeys } from "@/lib/catalog";
import {
  parseDurationUnit,
  parseJsonArray,
  parseSurroundings,
  type GalleryItem,
  type PriceDiscount,
} from "@/lib/tours/json";

function normalizeDiscount(row: unknown): PriceDiscount | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;
  const value = Number(item.value);
  if (!Number.isFinite(value) || value < 0) return null;
  if (item.kind === "single" || item.kind === "group") {
    const mode = item.mode === "amount" ? "amount" : "percent";
    const minPeople = Number(item.minPeople);
    return {
      kind: item.kind,
      minPeople: item.kind === "group" ? Math.max(2, Number.isFinite(minPeople) ? minPeople : 2) : 1,
      mode,
      value,
    };
  }
  if (item.type !== "percent" && item.type !== "amount") return null;
  const name = typeof item.name === "string" ? item.name : "";
  const people = Number(name.match(/(\d+)/)?.[1] ?? 0);
  const group = /group/i.test(name) || people >= 2;
  return {
    kind: group ? "group" : "single",
    minPeople: group ? Math.max(2, people || 2) : 1,
    mode: item.type === "amount" ? "amount" : "percent",
    value,
  };
}

type TourRecord = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  categoryId?: string;
  youtubeUrl: string;
  minDayBeforeBooking: number | null;
  durationDays: number;
  durationUnit: string;
  durationLabel: string;
  discountsJson: string;
  destinationIdsJson: string;
  difficulty: string;
  minPeople: number;
  maxGroupSize: number;
  priceFrom: number;
  currency: string;
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
  featuredImageUrl: string;
  featuredImageKey: string;
  featuredImageDriver: string;
  galleryJson: string;
  faqsJson: string;
  includesJson: string;
  excludesJson: string;
  beforeYouGoJson: string;
  surroundingsJson: string;
  address: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  isFeatured: boolean;
  defaultState: string;
  availabilityFrom: Date | null;
  availabilityTo: Date | null;
  travelStylesJson: string;
  facilitiesJson: string;
  icalImportUrl: string;
  seoIndex: boolean;
  seoTitle: string;
  seoDescription: string;
  seoImageUrl: string;
  seoImageKey: string;
  seoImageDriver: string;
  facebookTitle: string;
  facebookDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  published: boolean;
  destinationId: string | null;
  days: {
    dayNumber: number;
    title: string;
    description: string;
    morning?: string;
    afternoon?: string;
    evening?: string;
    imageUrl: string;
    imageKey: string;
    imageDriver: string;
  }[];
};

function itineraryTitle(title: string) {
  return /^(Day|Week) \d+$|^Itinerary$/.test(title.trim()) ? "" : title;
}

export function mapTourToFormValues(tour: TourRecord): TourFormValues {
  const durationUnit = parseDurationUnit(tour.durationUnit);
  const storedIds = parseJsonArray<string>(tour.destinationIdsJson).filter(
    (id) => id.trim(),
  );
  const destinationIds =
    storedIds.length > 0
      ? storedIds
      : tour.destinationId
        ? [tour.destinationId]
        : [];
  const itinerary = tour.days.map((day) => ({
    dayNumber: day.dayNumber,
    title: itineraryTitle(day.title),
    description: day.description,
    morning: day.morning ?? "",
    afternoon: day.afternoon ?? "",
    evening: day.evening ?? "",
    imageUrl: day.imageUrl,
    imageKey: day.imageKey,
    imageDriver:
      day.imageDriver === "cloudinary" ? ("cloudinary" as const) : ("local" as const),
  }));

  return {
    id: tour.id,
    title: tour.title,
    summary: tour.summary,
    description: tour.description,
    category: tour.category,
    categoryId: tour.categoryId ?? "",
    youtubeUrl: tour.youtubeUrl,
    minDayBeforeBooking: tour.minDayBeforeBooking,
    durationDays: tour.durationDays,
    durationUnit,
    durationLabel: tour.durationLabel,
    discounts: parseJsonArray<unknown>(tour.discountsJson).flatMap((row) => {
      const discount = normalizeDiscount(row);
      return discount ? [discount] : [];
    }),
    destinationIds,
    difficulty: tour.difficulty,
    minPeople: tour.minPeople,
    maxGroupSize: tour.maxGroupSize,
    priceFrom: tour.priceFrom,
    currency: tour.currency,
    imageUrl: tour.imageUrl,
    imageKey: tour.imageKey,
    imageDriver: tour.imageDriver,
    featuredImageUrl: tour.featuredImageUrl,
    featuredImageKey: tour.featuredImageKey,
    featuredImageDriver: tour.featuredImageDriver,
    gallery: parseJsonArray<GalleryItem>(tour.galleryJson),
    faqs: selectionKeys(parseJsonArray<unknown>(tour.faqsJson)),
    extraFaqs: localFaqs(parseJsonArray<unknown>(tour.faqsJson)),
    includes: selectionKeys(parseJsonArray<unknown>(tour.includesJson)),
    excludes: selectionKeys(parseJsonArray<unknown>(tour.excludesJson)),
    beforeYouGo: selectionKeys(parseJsonArray<unknown>(tour.beforeYouGoJson)),
    itinerary,
    destinationId: destinationIds[0] ?? tour.destinationId ?? "",
    surroundings: parseSurroundings(tour.surroundingsJson),
    address: tour.address,
    mapLat: tour.mapLat,
    mapLng: tour.mapLng,
    mapZoom: tour.mapZoom,
    isFeatured: tour.isFeatured,
    defaultState: tour.defaultState,
    availabilityFrom: tour.availabilityFrom?.toISOString().slice(0, 10) ?? "",
    availabilityTo: tour.availabilityTo?.toISOString().slice(0, 10) ?? "",
    travelStyles: parseJsonArray<string>(tour.travelStylesJson),
    facilities: parseJsonArray<string>(tour.facilitiesJson),
    icalImportUrl: tour.icalImportUrl,
    seoIndex: tour.seoIndex,
    seoTitle: tour.seoTitle,
    seoDescription: tour.seoDescription,
    seoImageUrl: tour.seoImageUrl,
    seoImageKey: tour.seoImageKey,
    seoImageDriver: tour.seoImageDriver,
    facebookTitle: tour.facebookTitle,
    facebookDescription: tour.facebookDescription,
    twitterTitle: tour.twitterTitle,
    twitterDescription: tour.twitterDescription,
    published: tour.published,
  };
}
