export type FaqItem = { title: string; content: string };
export type TitleItem = { title: string };
export type ItineraryItem = {
  dayNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
};
export type SurroundingItem = { name: string; content: string; distance: string };
export type Surroundings = {
  education: SurroundingItem[];
  health: SurroundingItem[];
  transportation: SurroundingItem[];
};
export type GalleryItem = { url: string; key: string; driver: "local" | "cloudinary" };

export function parseJsonArray<T>(value: string | null | undefined, fallback: T[] = []): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function parseSurroundings(value: string | null | undefined): Surroundings {
  const empty: Surroundings = {
    education: [],
    health: [],
    transportation: [],
  };
  if (!value) return empty;
  try {
    const parsed = JSON.parse(value) as Partial<Surroundings>;
    return {
      education: Array.isArray(parsed.education) ? parsed.education : [],
      health: Array.isArray(parsed.health) ? parsed.health : [],
      transportation: Array.isArray(parsed.transportation)
        ? parsed.transportation
        : [],
    };
  } catch {
    return empty;
  }
}
