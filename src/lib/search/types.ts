export const searchKinds = ["tour", "car", "bike", "hotel"] as const;

export type SearchKind = (typeof searchKinds)[number];

export type SearchReason = "" | "place" | "type" | "description";

export type SearchHit = {
  kind: SearchKind;
  slug: string;
  title: string;
  place: string;
  style: string;
  detail: string;
  blurb: string;
  image: string;
  price: number;
  currency: string;
  href: string;
  reason: SearchReason;
};
