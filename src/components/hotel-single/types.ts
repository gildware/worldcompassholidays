import type { HotelListLocation } from "@/components/hotel-list/types";

export type HotelRoomCard = {
  id: string;
  name: string;
  image: string;
  images: string[];
  occupancy: number;
  sizeSqm: number | null;
  bedLabel: string;
  summary: string;
  price: number;
  currency: string;
  quantity: number;
  meal: string;
  features: string[];
  freeCancellation: boolean;
  cancellation: string;
};

export type SimilarHotelCard = {
  id: string;
  slug: string;
  name: string;
  location: string;
  image: string;
  priceLabel: string;
  score: string;
  scoreLabel: string;
};

export type HotelSingleData = {
  id: string;
  name: string;
  slug: string;
  location: string;
  destinationHref: string;
  address: string;
  summary: string;
  description: string;
  stars: number;
  scoreLabel: string;
  priceLabel: string;
  images: string[];
  mapUrl: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  amenities: string[];
  checkIn: string;
  checkOut: string;
  cancellation: string;
  houseRules: string;
  propertyType: string;
  roomCount: number;
  faqs: { title: string; content: string }[];
  rooms: HotelRoomCard[];
  similar: SimilarHotelCard[];
  locations: HotelListLocation[];
};
