import type { TourFormValues } from "@/components/admin/TourForm";
import {
  parseJsonArray,
  parseSurroundings,
  type FaqItem,
  type GalleryItem,
  type TitleItem,
} from "@/lib/tours/json";

type TourRecord = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  youtubeUrl: string;
  minDayBeforeBooking: number | null;
  durationDays: number;
  durationLabel: string;
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
  destinationId: string;
  days: {
    dayNumber: number;
    title: string;
    description: string;
  }[];
};

export function mapTourToFormValues(tour: TourRecord): TourFormValues {
  return {
    id: tour.id,
    title: tour.title,
    summary: tour.summary,
    description: tour.description,
    category: tour.category,
    youtubeUrl: tour.youtubeUrl,
    minDayBeforeBooking: tour.minDayBeforeBooking,
    durationDays: tour.durationDays,
    durationLabel: tour.durationLabel,
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
    faqs: parseJsonArray<FaqItem>(tour.faqsJson),
    includes: parseJsonArray<TitleItem>(tour.includesJson),
    excludes: parseJsonArray<TitleItem>(tour.excludesJson),
    itinerary: tour.days.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
    })),
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
    destinationId: tour.destinationId,
  };
}
