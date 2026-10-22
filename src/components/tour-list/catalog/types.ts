export type CatalogDeparture = {
  id: string;
  iso: string;
  seats: number;
  price: number;
  status: string;
};

export type CatalogTour = {
  id: string;
  slug: string;
  title: string;
  place: string;
  region: string;
  category: string;
  days: number;
  hours: number;
  when: "morning" | "afternoon" | "evening" | "multi";
  style: "private" | "small" | "shared";
  groupMax: number;
  minPeople: number;
  level: "easy" | "moderate" | "hard";
  price: number;
  currency: string;
  langs: string[];
  pickup: boolean;
  cancelDays: number;
  rating: number;
  reviews: number;
  weekdays: number[] | null;
  img: string;
  alt: string;
  mention: string;
  includes: string[];
  excludes: string[];
  story: string;
  timeline: string[];
  meet: string;
  meetShort: string;
  href: string;
  levelNote: string;
  featured: boolean;
  departures: CatalogDeparture[];
};

export type CatalogSort = "match" | "price" | "value" | "rating" | "reviews" | "short" | "long";

export type CatalogQuery = {
  q: string;
  date: string;
  adults: number;
  children: number;
  min: number | null;
  max: number | null;
  dur: string[];
  region: string[];
  cat: string[];
  when: string[];
  style: string[];
  lang: string[];
  level: string[];
  cancel: boolean;
  pickup: boolean;
  rating: number;
  sort: CatalogSort;
  view: "list" | "grid";
  page: number;
  showOff: boolean;
  showSold: boolean;
  savedOnly: boolean;
  compare: string[];
};

export type CatalogGuest = {
  name: string;
  email: string;
  phone: string;
};
