import { busCoachTypes, busTimeWindows } from "@/lib/buses";

export type BusListItem = {
  id: string;
  slug: string;
  name: string;
  fromCity: string;
  toCity: string;
  operator: string;
  coachType: string;
  pickup: string;
  dropoff: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  fareFrom: number;
  imageUrl: string;
  amenities: string[];
};

export type BusSort = "depart" | "fare" | "short" | "name";

export type BusQuery = {
  q: string;
  from: string;
  to: string;
  date: string;
  passengers: number;
  coach: string[];
  time: string[];
  min: number | null;
  max: number | null;
  sort: BusSort;
};

const COACHES = busCoachTypes.filter((option) => option.value !== "any");
const TIMES = busTimeWindows.filter((option) => option.value !== "any");

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function listParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return raw.flatMap((item) => item.split(",")).map((item) => item.trim()).filter((item) => item && item !== "any");
}

export function readBusQuery(params: Record<string, string | string[] | undefined>): BusQuery {
  const sort = one(params.sort);
  const minRaw = one(params.min);
  const maxRaw = one(params.max);
  const min = minRaw === "" ? null : Number(minRaw);
  const max = maxRaw === "" ? null : Number(maxRaw);
  const passengers = Math.min(20, Math.max(1, Number(one(params.passengers)) || 1));
  return {
    q: one(params.q).trim().slice(0, 80),
    from: one(params.from).trim(),
    to: one(params.to).trim(),
    date: one(params.date).trim(),
    passengers,
    coach: listParam(params.coach).filter((value) => COACHES.some((option) => option.value === value)),
    time: listParam(params.time).filter((value) => TIMES.some((option) => option.value === value)),
    min: min != null && Number.isFinite(min) ? min : null,
    max: max != null && Number.isFinite(max) ? max : null,
    sort: sort === "fare" || sort === "short" || sort === "name" ? sort : "depart",
  };
}
