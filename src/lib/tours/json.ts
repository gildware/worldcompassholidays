export type DurationUnit = "hours" | "days" | "weeks";

export type PriceDiscount = {
  kind: "single" | "group";
  minPeople: number;
  mode: "percent" | "amount";
  value: number;
};

export type FaqItem = { title: string; content: string };
export type TitleItem = { title: string };
export type ItineraryPeriod = "morning" | "afternoon" | "evening";

export type ItineraryItem = {
  dayNumber: number;
  title: string;
  description: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  imageUrl?: string;
  imageKey?: string;
  imageDriver?: "local" | "cloudinary" | "";
  /** Stable row key in the form. Not stored. */
  clientId?: string;
};

export const ITINERARY_PERIODS: { key: ItineraryPeriod; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

export function itineraryPeriods(item: {
  morning?: string | null;
  afternoon?: string | null;
  evening?: string | null;
  description?: string | null;
}) {
  const periods = ITINERARY_PERIODS.map(({ key, label }) => ({
    when: label,
    text: (item[key] ?? "").trim(),
  })).filter((period) => period.text);

  if (periods.length > 0) return periods;

  const fallback = (item.description ?? "").trim();
  return fallback ? [{ when: "The day", text: fallback }] : [];
}

export function composeItineraryDescription(item: {
  morning?: string | null;
  afternoon?: string | null;
  evening?: string | null;
  description?: string | null;
}) {
  const periods = itineraryPeriods(item);
  if (periods.length === 0) return "";
  if (periods.length === 1 && periods[0].when === "The day") return periods[0].text;
  return periods.map((period) => `${period.when}: ${period.text}`).join("\n\n");
}
export type SurroundingItem = { name: string; content: string; distance: string };
export type Surroundings = {
  education: SurroundingItem[];
  health: SurroundingItem[];
  transportation: SurroundingItem[];
};
export type GalleryItem = { url: string; key: string; driver: "local" | "cloudinary" };

export function parseDurationUnit(value: string | null | undefined): DurationUnit {
  if (value === "hours" || value === "weeks" || value === "days") return value;
  return "days";
}

export function formatTourDuration(count: number, unit: DurationUnit) {
  const noun = unit === "hours" ? "hour" : unit === "weeks" ? "week" : "day";
  const amount = Number.isFinite(count) ? count : 0;
  return `${amount} ${noun}${amount === 1 ? "" : "s"}`;
}

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
