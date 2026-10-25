import {
  bikeBudgetBands,
  bikeTypes,
  budgetNote,
  carBudgetBands,
  carTypes,
  driveOptions,
  hotelBudgetBands,
  hotelMeals,
  hotelRoomTypes,
  optionLabel,
  tourBudgetBands,
  tourLengths,
  tourStyles,
  transmissionOptions,
} from "@/lib/custom-request";
import { formatDate } from "@/lib/format";

export const customEnquiryKinds = ["custom_tour", "custom_hotel", "custom_car", "custom_bike"] as const;

export type EnquiryModule = "tour" | "hotel" | "car" | "bike";

export const enquiryFilters = [
  { value: "all", label: "All" },
  { value: "tour", label: "Tours" },
  { value: "hotel", label: "Hotels" },
  { value: "car", label: "Cars" },
  { value: "bike", label: "Bikes" },
] as const;

export const enquiryStatuses = ["pending", "under_review", "review", "closed"] as const;

export type EnquiryStatus = (typeof enquiryStatuses)[number];

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  review: "Review",
  closed: "Closed",
};

export function enquiryStatusValue(status: string): EnquiryStatus {
  if (status === "pending" || status === "enquiry") return "pending";
  if ((enquiryStatuses as readonly string[]).includes(status)) return status as EnquiryStatus;
  return "pending";
}

export function enquiryStatusLabel(status: string) {
  return enquiryStatusLabels[enquiryStatusValue(status)];
}

export function enquiryStatusTone(status: string): "ok" | "warn" | "info" | "neutral" {
  switch (enquiryStatusValue(status)) {
    case "under_review":
      return "info";
    case "review":
      return "ok";
    case "closed":
      return "neutral";
    default:
      return "warn";
  }
}

export function enquiryIsOpen(status: string) {
  return enquiryStatusValue(status) !== "closed";
}

export function customEnquiryWhere() {
  return {
    OR: customEnquiryKinds.map((kind) => ({
      details: { contains: `"kind":"${kind}"` },
    })),
  };
}

export function notCustomEnquiryWhere() {
  return { NOT: customEnquiryWhere() };
}

export function isCustomEnquiry(details: Record<string, unknown>) {
  return typeof details.kind === "string" && (customEnquiryKinds as readonly string[]).includes(details.kind);
}

export function enquiryModule(kind: string): EnquiryModule | null {
  if (kind === "custom_tour") return "tour";
  if (kind === "custom_hotel") return "hotel";
  if (kind === "custom_car") return "car";
  if (kind === "custom_bike") return "bike";
  return null;
}

export type EnquiryFact = { label: string; value: string };

export type EnquiryView = {
  id: string;
  reference: string;
  module: EnquiryModule;
  kindLabel: string;
  title: string;
  status: string;
  summary: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  facts: EnquiryFact[];
  note: string;
  image: string;
};

function text(details: Record<string, unknown>, key: string) {
  const value = details[key];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function showDate(iso: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? formatDate(new Date(`${iso}T00:00:00`)) : iso;
}

function budgetLabel(module: EnquiryModule, details: Record<string, unknown>) {
  const band = text(details, "budgetBand");
  const amount = text(details, "budget");
  const value = band || amount;
  if (!value) return "";
  if (module === "tour") return budgetNote(tourBudgetBands, value, "per person");
  if (module === "hotel") return budgetNote(hotelBudgetBands, value, "per night");
  if (module === "car") return budgetNote(carBudgetBands, value, "per day");
  return budgetNote(bikeBudgetBands, value, "per day");
}

function push(facts: EnquiryFact[], label: string, value: string) {
  if (value) facts.push({ label, value });
}

function factsFor(module: EnquiryModule, details: Record<string, unknown>) {
  const facts: EnquiryFact[] = [];
  if (module === "tour") {
    push(facts, "From", text(details, "startCity") || text(details, "destination"));
    push(facts, "Places", text(details, "places"));
    push(facts, "Tour", text(details, "itemName"));
    push(facts, "Date", showDate(text(details, "start")));
    const length = text(details, "length");
    if (length) push(facts, "Length", optionLabel(tourLengths, length));
    const style = text(details, "style");
    if (style) push(facts, "Style", optionLabel(tourStyles, style));
    const adults = text(details, "adults");
    const children = text(details, "children");
    if (adults) push(facts, "Party", `${adults} adult${adults === "1" ? "" : "s"}, ${children || "0"} child${children === "1" ? "" : "ren"}`);
    if (text(details, "hotelPickup") === "yes") push(facts, "Pickup", text(details, "pickupHotel"));
    if (details.datesFlexible === true) push(facts, "Dates", "Can move");
  } else if (module === "hotel") {
    push(facts, "City", text(details, "destination"));
    push(facts, "Area", text(details, "area"));
    push(facts, "Hotel", text(details, "hotelName"));
    const checkIn = text(details, "checkIn");
    const checkOut = text(details, "checkOut");
    if (checkIn && checkOut) push(facts, "Stay", `${showDate(checkIn)} – ${showDate(checkOut)}`);
    const adults = text(details, "adults");
    const children = text(details, "children");
    const rooms = text(details, "rooms");
    if (adults) {
      push(facts, "Party", `${adults} adult${adults === "1" ? "" : "s"}, ${children || "0"} child${children === "1" ? "" : "ren"}, ${rooms || "1"} room${rooms === "1" ? "" : "s"}`);
    }
    const ages = Array.isArray(details.childAges) ? details.childAges.filter((age) => typeof age === "number") : [];
    if (ages.length) push(facts, "Ages", ages.join(", "));
    const stars = text(details, "stars");
    if (stars && stars !== "any") push(facts, "Stars", `${stars}+`);
    const room = text(details, "roomType");
    if (room && room !== "any") push(facts, "Room", optionLabel(hotelRoomTypes, room));
    const meals = text(details, "meals");
    if (meals && meals !== "any") push(facts, "Meals", optionLabel(hotelMeals, meals));
  } else if (module === "car") {
    push(facts, "Pickup", text(details, "destination"));
    push(facts, "Point", text(details, "pickupPoint"));
    push(facts, "Drop-off", text(details, "dropoffCity") || "Same city");
    push(facts, "Model", text(details, "itemName"));
    const when = [showDate(text(details, "start")), text(details, "pickupTime")].filter(Boolean).join(", ");
    push(facts, "When", when);
    push(facts, "Return", showDate(text(details, "end")));
    const type = text(details, "vehicleType");
    if (type && type !== "any") push(facts, "Type", optionLabel(carTypes, type));
    push(facts, "Passengers", text(details, "passengers"));
    const drive = text(details, "drive");
    if (drive) push(facts, "Driver", optionLabel(driveOptions, drive));
    const transmission = text(details, "transmission");
    if (transmission && transmission !== "either") push(facts, "Transmission", optionLabel(transmissionOptions, transmission));
    const seats = text(details, "childSeats");
    if (seats && seats !== "0") push(facts, "Child seats", seats);
  } else {
    push(facts, "Pickup", text(details, "destination"));
    push(facts, "Point", text(details, "pickupPoint"));
    push(facts, "Drop-off", text(details, "dropoffCity") || "Same city");
    push(facts, "Model", text(details, "itemName"));
    const start = text(details, "start");
    const end = text(details, "end");
    if (start && end) push(facts, "Dates", `${showDate(start)} – ${showDate(end)}`);
    const type = text(details, "bikeType");
    if (type && type !== "any") push(facts, "Type", optionLabel(bikeTypes, type));
    const riders = text(details, "riders");
    if (riders) push(facts, "Riders", riders === "2" ? "With a pillion" : "Solo");
    if (text(details, "licence")) push(facts, "Licence", text(details, "licence") === "yes" ? "Yes" : "No");
    push(facts, "Helmets", text(details, "helmets"));
  }
  push(facts, "Budget", budgetLabel(module, details).replace(/^not set$/, ""));
  return facts;
}

const kindLabels: Record<EnquiryModule, string> = {
  tour: "Tour",
  hotel: "Hotel",
  car: "Car",
  bike: "Bike",
};

export function toEnquiryView(booking: {
  id: string;
  reference: string;
  module: string;
  status: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  details: string;
}): EnquiryView | null {
  let parsed: Record<string, unknown> = {};
  try {
    const value = JSON.parse(booking.details) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) parsed = value as Record<string, unknown>;
  } catch {
    return null;
  }
  const module = enquiryModule(typeof parsed.kind === "string" ? parsed.kind : "") ?? (["tour", "hotel", "car", "bike"].includes(booking.module) ? (booking.module as EnquiryModule) : null);
  if (!module || !isCustomEnquiry(parsed)) return null;
  const facts = factsFor(module, parsed);
  const summary = facts
    .filter((fact) => fact.label !== "Budget")
    .slice(0, 3)
    .map((fact) => fact.value)
    .join(" · ");
  return {
    id: booking.id,
    reference: booking.reference,
    module,
    kindLabel: kindLabels[module],
    title: booking.title,
    status: booking.status,
    summary,
    contactName: booking.contactName,
    contactPhone: booking.contactPhone,
    contactEmail: booking.contactEmail,
    createdAt: booking.createdAt,
    facts,
    note: text(parsed, "message"),
    image: "",
  };
}
