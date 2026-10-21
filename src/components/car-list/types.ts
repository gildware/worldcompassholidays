export type CarListCard = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  location: string;
  locations: string[];
  category: string;
  brand: string;
  seats: number;
  luggage: number;
  transmission: string;
  mileage: string;
  mileageLabel: string;
  fuel: string;
  specs: string[];
  images: string[];
  price: number;
  currency: string;
  deposit: number;
  helmet: boolean;
  freeCancellation: boolean;
};

export type CarListLocation = {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
};

export type CarSort = "recommended" | "price-asc" | "price-desc" | "name";
