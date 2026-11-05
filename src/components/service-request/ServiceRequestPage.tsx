import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ServiceRequestForm, type ServiceDefaults, type ServiceKind } from "@/components/service-request/ServiceRequestForm";
import { TourRequestForm } from "@/components/service-request/TourRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { getCurrentUser } from "@/lib/auth/session";
import {
  bikeBudgetBands,
  bikeTypes,
  carBudgetBands,
  carTypes,
  driveOptions,
  isBudgetValue,
  riderOptions,
  tourCarPreferences,
  tourBudgetBands,
  tourDietaryPreferences,
  tourFoodPreferences,
  tourHotelPreferences,
  tourLengths,
  tourStyles,
  tourTypes,
  transmissionOptions,
  yesNoOptions,
  type BudgetBand,
} from "@/lib/custom-request";
import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import "@/styles/hotel-request.css";

const titles: Record<ServiceKind, { title: string; description: string; path: string }> = {
  tour: {
    title: "Request a tour",
    description: "Can't find the tour you want? Send where it starts, how long it runs, and who is travelling. Nothing is booked until you accept it.",
    path: "/tours/request",
  },
  car: {
    title: "Request a car",
    description: "Can't find the car you want? Send the city, the dates, and whether you need a driver. Nothing is booked until you accept it.",
    path: "/rentals/cars/request",
  },
  bike: {
    title: "Request a bike",
    description: "Can't find the bike you want? Send the city, dates, and whether you need a driver. Nothing is booked until you accept it.",
    path: "/rentals/bikes/request",
  },
};

const bands: Record<ServiceKind, readonly BudgetBand[]> = {
  tour: tourBudgetBands,
  car: carBudgetBands,
  bike: bikeBudgetBands,
};

export function serviceRequestMetadata(kind: ServiceKind): Metadata {
  const page = titles[kind];
  return pageMetadata({ title: page.title, description: page.description, path: page.path });
}

function clip(value: string | undefined, max: number) {
  return (value ?? "").trim().slice(0, max);
}

function dateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function timeParam(value: string | undefined) {
  return value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "";
}

function countParam(value: string | undefined, fallback: string, min: number, max: number) {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  if (parsed < min || parsed > max) return fallback;
  return String(parsed);
}

function oneOf(value: string | undefined, allowed: readonly string[], fallback = "") {
  return value && allowed.includes(value) ? value : fallback;
}

function selectionParam(value: string | undefined, allowed: readonly string[], fallback: string[]) {
  try {
    const parsed: unknown = JSON.parse(value ?? "");
    if (Array.isArray(parsed)) {
      const selected = [...new Set(parsed.filter((item): item is string => typeof item === "string" && allowed.includes(item)))];
      return JSON.stringify(selected.includes("any") ? ["any"] : selected);
    }
  } catch {
    if (value && allowed.includes(value)) return JSON.stringify([value]);
  }
  return JSON.stringify(fallback);
}

export async function ServiceRequestPage({
  kind,
  searchParams,
}: {
  kind: ServiceKind;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, user, destinationRows] = await Promise.all([
    searchParams,
    getCurrentUser(),
    prisma.destination.findMany({
      where: { published: true },
      select: { name: true, region: true, country: true },
      orderBy: [{ popular: "desc" }, { name: "asc" }],
    }),
  ]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const budget = clip(params.budget, 12);
  const defaults: ServiceDefaults = {
    destination: kind === "tour" ? "" : clip(params.destination, 120),
    startCity: kind === "tour" ? clip(params.startCity || params.destination, 120) : "",
    places: clip(params.places, 200),
    itemName: clip(params.itemName, 120),
    pickupPoint: clip(params.pickupPoint, 160),
    dropoffCity: clip(params.dropoffCity, 120),
    start: dateParam(params.start),
    end: dateParam(params.end),
    pickupTime: timeParam(params.pickupTime),
    length: oneOf(params.length, tourLengths.map((option) => option.value)),
    style: oneOf(params.style, tourStyles.map((option) => option.value), "any"),
    tourType: oneOf(params.tourType, tourTypes.map((option) => option.value), "any"),
    needFood: oneOf(params.needFood, yesNoOptions.map((option) => option.value), "no"),
    foodPreference: selectionParam(params.foodPreference, tourFoodPreferences.map((option) => option.value), []),
    dietaryPreferences: selectionParam(params.dietaryPreferences, tourDietaryPreferences.map((option) => option.value), ["any"]),
    needCar: oneOf(params.needCar, yesNoOptions.map((option) => option.value), "no"),
    carPreference: oneOf(params.carPreference, tourCarPreferences.map((option) => option.value), "any"),
    needHotel: oneOf(params.needHotel, yesNoOptions.map((option) => option.value), "no"),
    hotelPreference: selectionParam(params.hotelPreference, tourHotelPreferences.map((option) => option.value), ["any"]),
    adults: countParam(params.adults, "2", 1, 20),
    children: countParam(params.children, "0", 0, 12),
    hotelPickup: oneOf(params.hotelPickup, yesNoOptions.map((option) => option.value)),
    pickupHotel: clip(params.pickupHotel, 120),
    datesFlexible: oneOf(params.datesFlexible, yesNoOptions.map((option) => option.value), "no"),
    vehicleType: oneOf(params.vehicleType, carTypes.map((option) => option.value), "any"),
    passengers: countParam(params.passengers, "2", 1, 12),
    drive: oneOf(params.drive, driveOptions.map((option) => option.value)),
    transmission: oneOf(params.transmission, transmissionOptions.map((option) => option.value), "either"),
    childSeats: countParam(params.childSeats, "0", 0, 4),
    bikeType: oneOf(params.bikeType, bikeTypes.map((option) => option.value), "any"),
    riders: oneOf(params.riders, riderOptions.map((option) => option.value), "1"),
    needDriver: oneOf(params.needDriver, yesNoOptions.map((option) => option.value)),
    licence: oneOf(params.licence, yesNoOptions.map((option) => option.value)),
    budget: isBudgetValue(bands[kind], budget) ? budget : "",
    message: clip(params.message, 500),
  };
  const nextQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(defaults)) {
    if (!value) continue;
    if (kind === "tour" && ["destination", "pickupPoint", "dropoffCity", "end", "pickupTime", "vehicleType", "passengers", "drive", "transmission", "childSeats", "bikeType", "riders", "needDriver", "licence", "hotelPickup", "pickupHotel"].includes(key)) continue;
    if (kind !== "tour" && ["startCity", "places", "length", "style", "tourType", "needFood", "foodPreference", "dietaryPreferences", "needCar", "carPreference", "needHotel", "hotelPreference", "adults", "children", "hotelPickup", "pickupHotel", "datesFlexible"].includes(key)) continue;
    if (kind === "car" && ["bikeType", "riders", "needDriver", "licence"].includes(key)) continue;
    if (kind === "bike" && ["pickupTime", "vehicleType", "passengers", "drive", "transmission", "childSeats"].includes(key)) continue;
    if (key === "adults" && !params.adults) continue;
    if (key === "children" && !params.children) continue;
    if (key === "passengers" && !params.passengers) continue;
    if (key === "datesFlexible" && value === "no" && !params.datesFlexible) continue;
    if (kind === "tour" && ["style", "tourType", "carPreference"].includes(key) && value === "any" && !params[key]) continue;
    if (kind === "tour" && key === "foodPreference" && value === "[]" && !params.foodPreference) continue;
    if (kind === "tour" && key === "dietaryPreferences" && value === '["any"]' && !params.dietaryPreferences) continue;
    if (kind === "tour" && key === "hotelPreference" && value === '["any"]' && !params.hotelPreference) continue;
    if (kind === "tour" && ["needFood", "needCar", "needHotel"].includes(key) && value === "no" && !params[key]) continue;
    if (key === "vehicleType" && value === "any" && !params.vehicleType) continue;
    if (key === "transmission" && value === "either" && !params.transmission) continue;
    if (key === "bikeType" && value === "any" && !params.bikeType) continue;
    if (key === "riders" && value === "1" && !params.riders) continue;
    if (key === "childSeats" && value === "0" && !params.childSeats) continue;
    nextQuery.set(key, value);
  }
  const path = titles[kind].path;
  const returnPath = nextQuery.size ? `${path}?${nextQuery}` : path;
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  if (!customer) redirect(loginHref);
  const locations = [...new Set(destinationRows.flatMap((place) => [
    place.name,
    [place.name, place.region].filter(Boolean).join(", "),
    [place.name, place.region, place.country].filter(Boolean).join(", "),
    [place.region, place.country].filter(Boolean).join(", "),
  ]).map((value) => value.trim()).filter(Boolean))];
  const startingLocations = locations.length > 0
    ? locations
    : ["Srinagar", "Gulmarg, Kashmir", "Pahalgam, Kashmir", "Manali, Himachal Pradesh", "Delhi"];

  return (
    <WorldCompassHolidayFrame className="is-hotel-request">
      <div className="hotel-brief">
        <div className="container hotel-brief-layout is-solo">
          {kind === "tour" ? (
            <TourRequestForm customer={customer} defaults={defaults} loginHref={loginHref} locations={startingLocations} />
          ) : (
            <ServiceRequestForm kind={kind} customer={customer} defaults={defaults} loginHref={loginHref} locations={startingLocations} />
          )}
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
