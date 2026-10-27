import type { RequestOption } from "@/lib/custom-request";

export const busCoachTypes: readonly RequestOption[] = [
  { value: "any", label: "Any coach" },
  { value: "seater", label: "Seater" },
  { value: "volvo", label: "Volvo AC" },
  { value: "sleeper", label: "Sleeper" },
];

export const busTimeWindows: readonly RequestOption[] = [
  { value: "any", label: "Any time" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
];

export function parseStringList(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return [];
  }
}

export function coachLabel(value: string) {
  return busCoachTypes.find((option) => option.value === value)?.label ?? value;
}

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseClock(value: string) {
  const match = CLOCK.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatClock(totalMinutes: number) {
  const mins = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = String(Math.floor(mins / 60)).padStart(2, "0");
  const minutes = String(mins % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatBusDuration(hours: number, minutes: number) {
  const h = Math.max(0, Math.floor(hours));
  const m = Math.max(0, Math.floor(minutes));
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(" ");
}

export function parseBusDuration(value: string) {
  const hours = /(\d+)\s*h/i.exec(value);
  const minutes = /(\d+)\s*m/i.exec(value);
  return {
    hours: hours ? Number(hours[1]) : 0,
    minutes: minutes ? Number(minutes[1]) : 0,
  };
}

/** Arrival clock from a departure and a travel time. `days` is 0 on the same day. */
export function arriveFromDepart(depart: string, hours: number, minutes: number) {
  const start = parseClock(depart);
  const span = Math.max(0, Math.floor(hours)) * 60 + Math.max(0, Math.floor(minutes));
  if (start === null || span <= 0) return { time: "", days: 0 };
  const total = start + span;
  return {
    time: formatClock(total),
    days: Math.floor(total / (24 * 60)),
  };
}

/** Travel time from two clocks. `dayOffset` is 0, 1, or 2. */
export function durationFromClocks(depart: string, arrive: string, dayOffset: number) {
  const start = parseClock(depart);
  const end = parseClock(arrive);
  if (start === null || end === null) return null;
  const span = end - start + Math.max(0, Math.floor(dayOffset)) * 24 * 60;
  if (span <= 0 || span > 48 * 60) return null;
  return { hours: Math.floor(span / 60), minutes: span % 60 };
}

export function arrivesNextDay(depart: string, arrive: string) {
  const start = parseClock(depart);
  const end = parseClock(arrive);
  if (start === null || end === null) return false;
  return end <= start;
}

export function arrivalDayLabel(days: number) {
  if (days <= 0) return "same day";
  if (days === 1) return "next day";
  return `${days} days later`;
}

/** Catalog ids, catalog titles, or older plain amenity strings. */
export function busAmenityLabels(
  stored: string,
  options: { id: string; title: string }[],
) {
  const byId = new Map(options.map((item) => [item.id, item.title]));
  const byTitle = new Map(options.map((item) => [item.title.toLowerCase(), item.title]));
  return parseStringList(stored).map(
    (value) => byId.get(value) ?? byTitle.get(value.toLowerCase()) ?? value,
  );
}

export type BusGalleryItem = {
  url: string;
  key: string;
  driver: "local" | "cloudinary";
};

export function parseGallery(value: string): BusGalleryItem[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item === "string" && item.trim()) {
        return [{ url: item.trim(), key: "", driver: "local" as const }];
      }
      if (!item || typeof item !== "object" || !("url" in item)) return [];
      const url = typeof item.url === "string" ? item.url.trim() : "";
      if (!url) return [];
      const key = "key" in item && typeof item.key === "string" ? item.key : "";
      const driver =
        "driver" in item && item.driver === "cloudinary" ? "cloudinary" : "local";
      return [{ url, key, driver }];
    });
  } catch {
    return [];
  }
}

export function timeWindowLabel(value: string) {
  return busTimeWindows.find((option) => option.value === value)?.label ?? value;
}

export function operatorCode(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  return letters || "BUS";
}

export function inTimeWindow(departTime: string, window: string) {
  if (!window || window === "any") return true;
  const hour = Number(departTime.slice(0, 2));
  if (!Number.isFinite(hour)) return true;
  if (window === "morning") return hour >= 5 && hour < 12;
  if (window === "afternoon") return hour >= 12 && hour < 18;
  if (window === "night") return hour >= 18 || hour < 5;
  return true;
}

export function requestBusHref(input: {
  slug?: string;
  from?: string;
  to?: string;
  date?: string;
  passengers?: string | number;
  coach?: string;
  time?: string;
  busName?: string;
}) {
  const params = new URLSearchParams();
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  if (input.date) params.set("date", input.date);
  if (input.passengers) params.set("passengers", String(input.passengers));
  if (input.coach && input.coach !== "any") params.set("coach", input.coach);
  if (input.time && input.time !== "any") params.set("time", input.time);
  if (input.busName) params.set("busName", input.busName);
  if (input.slug) params.set("slug", input.slug);
  const query = params.toString();
  return query ? `/buses/request?${query}` : "/buses/request";
}
