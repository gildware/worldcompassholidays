import type { TourFormValues } from "@/components/admin/TourForm";
import { localFaqs, selectionKeys } from "@/lib/catalog";
import {
  parseDurationUnit,
  parseJsonArray,
  parseSurroundings,
  type GalleryItem,
  type PriceDiscount,
} from "@/lib/tours/json";

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
  surroundingsJson: string;
  address: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  isFeatured: boolean;
  defaultState: string;
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
    discounts: parseJsonArray<PriceDiscount>(tour.discountsJson),
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
    itinerary,
    destinationId: destinationIds[0] ?? tour.destinationId ?? "",
    surroundings: parseSurroundings(tour.surroundingsJson),
    address: tour.address,
    mapLat: tour.mapLat,
    mapLng: tour.mapLng,
    mapZoom: tour.mapZoom,
    isFeatured: tour.isFeatured,
    defaultState: tour.defaultState,
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
