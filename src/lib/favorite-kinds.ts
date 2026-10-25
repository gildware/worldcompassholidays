export const favoriteKinds = ["tour", "hotel", "car", "bike"] as const;

export type FavoriteKind = (typeof favoriteKinds)[number];

export function isFavoriteKind(value: string): value is FavoriteKind {
  return (favoriteKinds as readonly string[]).includes(value);
}

export const favoriteKindLabel: Record<FavoriteKind, string> = {
  tour: "Tour",
  hotel: "Hotel",
  car: "Car",
  bike: "Bike",
};

export type FavoriteCard = {
  id: string;
  kind: FavoriteKind;
  itemId: string;
  title: string;
  href: string;
  image: string;
  meta: string;
  price: string;
};
