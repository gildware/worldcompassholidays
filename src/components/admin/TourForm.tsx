import type {
  DurationUnit,
  FaqItem,
  GalleryItem,
  ItineraryItem,
  PriceDiscount,
  Surroundings,
} from "@/lib/tours/json";
import type { UploadedImage } from "@/lib/storage/types";

export type TourFormValues = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  categoryId: string;
  youtubeUrl: string;
  minDayBeforeBooking: number | null;
  durationDays: number;
  durationUnit: DurationUnit;
  durationLabel: string;
  discounts: PriceDiscount[];
  destinationIds: string[];
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
  gallery: GalleryItem[];
  faqs: string[];
  extraFaqs: FaqItem[];
  includes: string[];
  excludes: string[];
  itinerary: ItineraryItem[];
  surroundings: Surroundings;
  address: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  isFeatured: boolean;
  defaultState: string;
  travelStyles: string[];
  facilities: string[];
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
};

export function imageFromFields(
  url: string,
  key: string,
  driver: string,
): UploadedImage | null {
  if (!url || !key) return null;
  return {
    url,
    key,
    driver: driver === "cloudinary" ? "cloudinary" : "local",
  };
}
