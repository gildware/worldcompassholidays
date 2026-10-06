export type DestinationListCard = {
  id: string;
  slug: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  imageUrl: string;
  parentName: string;
  placeNames: string[];
  popular: boolean;
  lat: number | null;
  lng: number | null;
  tourCount: number;
  hotelCount: number;
  rentalCount: number;
  href: string;
};

export type DestinationListLocation = {
  id: string;
  name: string;
  address: string;
};

export type DestinationSort = "recommended" | "name" | "country";
