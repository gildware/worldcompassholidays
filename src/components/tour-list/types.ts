export type TourListCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  location: string;
  address: string;
  durationLabel: string;
  durationDays: number;
  category: string;
  images: string[];
  price: number;
  currency: string;
  tag: string;
  freeCancellation: boolean;
  languages: string[];
  href: string;
};

export type TourListLocation = {
  id: string;
  name: string;
  address: string;
};

export type TourSort = "recommended" | "price-asc" | "price-desc" | "title";
