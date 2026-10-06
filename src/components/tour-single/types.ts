export type TourDay = {
  dayNumber: number;
  title: string;
  description: string;
  imageUrl: string;
};

export type TourFaq = {
  title: string;
  content: string;
};

export type PopularTourCard = {
  id: string;
  href: string;
  title: string;
  location: string;
  duration: string;
  tourType: string;
  price: string;
  tag: string;
  slideImg: string[];
};

export type TourSingleData = {
  title: string;
  slug: string;
  location: string;
  destinationHref: string;
  address: string;
  category: string;
  durationLabel: string;
  groupSize: number;
  priceLabel: string;
  images: string[];
  summary: string;
  descriptionHtml: string;
  includes: string[];
  excludes: string[];
  languages: string[];
  highlights: string[];
  faqs: TourFaq[];
  days: TourDay[];
  map: { lat: number; lng: number; zoom: number } | null;
  mapUrl: string;
  departureText: string;
  extraNotes: string[];
  similar: PopularTourCard[];
  freeCancellation: boolean;
};
