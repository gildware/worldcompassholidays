export type HotelListCard = {
  id: string;
  slug: string;
  name: string;
  location: string;
  address: string;
  stars: number;
  images: string[];
  roomName: string;
  bedLabel: string;
  cancellationTitle: string;
  cancellationDetail: string;
  freeCancellation: boolean;
  amenities: string[];
  price: number;
  currency: string;
  propertyType: string;
  mapUrl: string;
};

export type HotelListLocation = {
  id: string;
  name: string;
  address: string;
};

export type CountOption = {
  label: string;
  count: number;
};
