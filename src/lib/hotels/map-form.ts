import { localFaqs, selectionKeys } from "@/lib/catalog";
import { isMealPlan, isPropertyType, type MealPlan } from "@/lib/hotels/options";
import type { HotelFormValues, HotelRoomValues } from "@/components/admin/HotelTabsForm";
import type { UploadedImage } from "@/lib/storage/types";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

type RoomRow = {
  id: string;
  name: string;
  summary: string;
  occupancy: number;
  bedType: string;
  sizeSqm: number | null;
  quantity: number;
  pricePerNight: number;
  extraGuestPrice: number;
  mealPlan: string;
  featuresJson: string;
  amenitiesJson: string;
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
  active: boolean;
};

type HotelRow = {
  id: string;
  name: string;
  summary: string;
  description: string;
  propertyType: string;
  starRating: number;
  checkIn: string;
  checkOut: string;
  currency: string;
  destinationId: string | null;
  address: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  amenitiesJson: string;
  faqsJson: string;
  cancellationPolicy: string;
  houseRules: string;
  isFeatured: boolean;
  seoIndex: boolean;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
  featuredImageUrl: string;
  featuredImageKey: string;
  featuredImageDriver: string;
  seoImageUrl: string;
  seoImageKey: string;
  seoImageDriver: string;
  galleryJson: string;
  rooms: RoomRow[];
};

function storedImage(url: string, key: string, driver: string): UploadedImage | null {
  if (!url || !key) return null;
  if (driver !== "local" && driver !== "cloudinary") return null;
  return { url, key, driver };
}

function idList(raw: string) {
  return selectionKeys(parseJsonArray<unknown>(raw));
}

export function mapHotelToFormValues(hotel: HotelRow): HotelFormValues {
  const faqs = parseJsonArray<unknown>(hotel.faqsJson);
  return {
    id: hotel.id,
    name: hotel.name,
    summary: hotel.summary,
    description: hotel.description,
    propertyType: isPropertyType(hotel.propertyType) ? hotel.propertyType : "hotel",
    starRating: hotel.starRating,
    checkIn: hotel.checkIn || "14:00",
    checkOut: hotel.checkOut || "11:00",
    currency: hotel.currency || "INR",
    destinationId: hotel.destinationId ?? "",
    address: hotel.address,
    mapLat: hotel.mapLat,
    mapLng: hotel.mapLng,
    mapZoom: hotel.mapZoom || 14,
    amenities: idList(hotel.amenitiesJson),
    faqs: selectionKeys(faqs),
    extraFaqs: localFaqs(faqs),
    cancellationPolicy: hotel.cancellationPolicy,
    houseRules: hotel.houseRules,
    isFeatured: hotel.isFeatured,
    seoIndex: hotel.seoIndex,
    seoTitle: hotel.seoTitle,
    seoDescription: hotel.seoDescription,
    published: hotel.published,
    cover: storedImage(hotel.imageUrl, hotel.imageKey, hotel.imageDriver),
    banner: storedImage(
      hotel.featuredImageUrl,
      hotel.featuredImageKey,
      hotel.featuredImageDriver,
    ),
    seoImage: storedImage(hotel.seoImageUrl, hotel.seoImageKey, hotel.seoImageDriver),
    gallery: parseJsonArray<GalleryItem>(hotel.galleryJson).flatMap((item) => {
      if (!item?.url || !item.key) return [];
      if (item.driver !== "local" && item.driver !== "cloudinary") return [];
      return [item];
    }),
    rooms: hotel.rooms.map(
      (room): HotelRoomValues => ({
        id: room.id,
        name: room.name,
        summary: room.summary,
        occupancy: room.occupancy,
        bedType: room.bedType,
        sizeSqm: room.sizeSqm,
        quantity: room.quantity,
        pricePerNight: room.pricePerNight,
        extraGuestPrice: room.extraGuestPrice,
        mealPlan: (isMealPlan(room.mealPlan) ? room.mealPlan : "room_only") as MealPlan,
        features: idList(room.featuresJson),
        amenities: idList(room.amenitiesJson),
        image: storedImage(room.imageUrl, room.imageKey, room.imageDriver),
        active: room.active,
      }),
    ),
  };
}
