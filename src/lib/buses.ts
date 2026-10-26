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
