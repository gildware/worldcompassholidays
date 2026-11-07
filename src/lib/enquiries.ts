import { busCoachTypes, busTimeWindows, coachLabel, timeWindowLabel } from "@/lib/buses";
import {
  bikeBudgetBands,
  bikeTypes,
  budgetNote,
  carBudgetBands,
  carTypes,
  driveOptions,
  allHotelBudgetBands,
  hotelAdditionalPreferences,
  hotelMeals,
  hotelRoomTypes,
  hotelStayPreferences,
  legacyHotelRoomTypes,
  optionLabel,
  tourBudgetBands,
  tourCarPreferences,
  tourDietaryPreferences,
  tourFoodPreferences,
  tourHotelPreferences,
  tourLengths,
  tourStyles,
  tourTypes,
  transmissionOptions,
} from "@/lib/custom-request";
import { formatDate } from "@/lib/format";

export const customEnquiryKinds = ["custom_tour", "custom_hotel", "custom_car", "custom_bike", "custom_bus"] as const;

export const websiteEnquiryKind = "website_enquiry" as const;

export type EnquiryModule = "tour" | "hotel" | "car" | "bike" | "bus" | "contact";

export const enquiryFilters = [
  { value: "all", label: "All" },
  { value: "contact", label: "Contact" },
  { value: "tour", label: "Tours" },
  { value: "hotel", label: "Hotels" },
  { value: "car", label: "Cars" },
  { value: "bike", label: "Bikes" },
  { value: "bus", label: "Buses" },
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

export function isCustomEnquiry(details: Record<string, unknown>) {
  return typeof details.kind === "string" && (customEnquiryKinds as readonly string[]).includes(details.kind);
}

/** Contact-page form (and older rows saved as “Website enquiry”). */
export function isWebsiteEnquiry(details: Record<string, unknown>, title = "") {
  if (details.kind === websiteEnquiryKind) return true;
  if (title === "Website enquiry") return true;
  return typeof details.interest === "string" && !details.kind;
}

/** Product request or contact-page enquiry — not a paid booking. */
export function isDeskEnquiry(details: Record<string, unknown>, title = "") {
  return isCustomEnquiry(details) || isWebsiteEnquiry(details, title);
}

export function customEnquiryWhere() {
  return {
    OR: [
      ...customEnquiryKinds.map((kind) => ({
        details: { contains: `"kind":"${kind}"` },
      })),
      { details: { contains: `"kind":"${websiteEnquiryKind}"` } },
      { title: "Website enquiry" },
    ],
  };
}

export function websiteEnquiryWhere() {
  return {
    OR: [
      { details: { contains: `"kind":"${websiteEnquiryKind}"` } },
      { title: "Website enquiry" },
      { module: "general" },
    ],
  };
}

export function notCustomEnquiryWhere() {
  return { NOT: customEnquiryWhere() };
}

export function enquiryModule(kind: string): EnquiryModule | null {
  if (kind === "custom_tour") return "tour";
  if (kind === "custom_hotel") return "hotel";
  if (kind === "custom_car") return "car";
  if (kind === "custom_bike") return "bike";
  if (kind === "custom_bus") return "bus";
  if (kind === websiteEnquiryKind) return "contact";
  return null;
}

function moduleFromBooking(module: string): EnquiryModule | null {
  if (module === "tour" || module === "hotel" || module === "car" || module === "bike" || module === "bus") return module;
  if (module === "general" || module === "contact") return "contact";
  return null;
}

export const enquiryFactGroups = ["Trip", "Travellers", "Preferences", "Budget"] as const;

export type EnquiryFact = { group: (typeof enquiryFactGroups)[number]; label: string; value: string; wide: boolean };

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
  channel: string;
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
  if (module === "hotel") return budgetNote(allHotelBudgetBands, value, "per night");
  if (module === "car") return budgetNote(carBudgetBands, value, "per day");
  if (module === "bus") return "";
  return budgetNote(bikeBudgetBands, value, "per day");
}

function push(facts: EnquiryFact[], group: EnquiryFact["group"], label: string, value: string, wide = false) {
  if (value) facts.push({ group, label, value, wide });
}

function plural(count: string, one: string, many: string) {
  return `${count} ${count === "1" ? one : many}`;
}

function party(details: Record<string, unknown>) {
  const adults = text(details, "adults");
  if (!adults) return "";
  const children = text(details, "children") || "0";
  const rooms = text(details, "rooms");
  return [plural(adults, "adult", "adults"), plural(children, "child", "children"), rooms ? plural(rooms, "room", "rooms") : ""]
    .filter(Boolean)
    .join(", ");
}

function labels(value: unknown, options: readonly { value: string; label: string }[]) {
  if (!Array.isArray(value)) return "";
  return value
    .filter((item): item is string => typeof item === "string" && item !== "any")
    .map((item) => optionLabel(options, item))
    .join(", ");
}

function money(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? `INR ${value.toLocaleString("en-IN")}` : "";
}

function factsFor(module: EnquiryModule, details: Record<string, unknown>) {
  const facts: EnquiryFact[] = [];
  if (module === "tour") {
    push(facts, "Trip", "Tour", text(details, "itemName") || text(details, "tourSlug").replace(/-/g, " "), true);
    push(facts, "Trip", "Starting from", text(details, "startCity") || text(details, "destination"));
    push(facts, "Trip", "Places", text(details, "places"), true);
    push(facts, "Trip", "Start date", showDate(text(details, "start") || text(details, "startDate")));
    push(facts, "Trip", "End date", showDate(text(details, "endDate")));
    const length = text(details, "length");
    if (length) push(facts, "Trip", "Length", optionLabel(tourLengths, length));
    const style = text(details, "style");
    if (style) push(facts, "Trip", "Style", optionLabel(tourStyles, style));
    const type = text(details, "tourType");
    if (type && type !== "any") push(facts, "Trip", "Tour type", optionLabel(tourTypes, type));
    const mode = text(details, "mode");
    if (mode) push(facts, "Trip", "Travel mode", mode === "group" ? "Group departure" : "Private");
    if (typeof details.datesFlexible === "boolean") push(facts, "Trip", "Dates can move", details.datesFlexible ? "Yes" : "No");
    push(facts, "Travellers", "Party", party(details), true);
    if (typeof details.ownRoom === "boolean") push(facts, "Travellers", "Rooms", details.ownRoom ? "Own room for every adult" : "Twin share");
    if (text(details, "hotelPickup") === "yes") push(facts, "Travellers", "Pickup hotel", text(details, "pickupHotel"));
    if (typeof details.needFood === "boolean") {
      push(facts, "Preferences", "Food", details.needFood ? labels(details.foodPreferences, tourFoodPreferences) || "Needed" : "Not needed");
      push(facts, "Preferences", "Diet", labels(details.dietaryPreferences, tourDietaryPreferences));
    }
    if (typeof details.needCar === "boolean") {
      push(facts, "Preferences", "Car", details.needCar ? optionLabel(tourCarPreferences, text(details, "carPreference") || "any") : "Not needed");
    }
    if (typeof details.needHotel === "boolean") {
      push(facts, "Preferences", "Hotel", details.needHotel ? labels(details.hotelPreferences, tourHotelPreferences) || "Needed" : "Not needed", true);
    }
    push(facts, "Budget", "Season", text(details, "season"));
    push(facts, "Budget", "Quoted total", money(details.total));
  } else if (module === "hotel") {
    push(facts, "Trip", "City", text(details, "destination"));
    push(facts, "Trip", "Area", text(details, "area"));
    push(facts, "Trip", "Hotel", text(details, "hotelName"), true);
    const checkIn = text(details, "checkIn");
    const checkOut = text(details, "checkOut");
    push(facts, "Trip", "Check-in", showDate(checkIn));
    push(facts, "Trip", "Check-out", showDate(checkOut));
    if (checkIn && checkOut) {
      const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
      if (nights > 0) push(facts, "Trip", "Nights", String(nights));
    }
    push(facts, "Travellers", "Party", party(details), true);
    const ages = Array.isArray(details.childAges) ? details.childAges.filter((age) => typeof age === "number") : [];
    if (ages.length) push(facts, "Travellers", "Child ages", ages.join(", "));
    const stars = text(details, "stars");
    if (stars && stars !== "any") push(facts, "Preferences", "Stars", `${stars}+`);
    const stay = text(details, "stayPreference");
    if (stay && stay !== "any") push(facts, "Preferences", "Stay style", optionLabel(hotelStayPreferences, stay));
    const room = text(details, "roomType");
    if (room && room !== "any") push(facts, "Preferences", "Room", optionLabel([...hotelRoomTypes, ...legacyHotelRoomTypes], room));
    const meals = text(details, "meals");
    if (meals && meals !== "any") push(facts, "Preferences", "Meals", optionLabel(hotelMeals, meals));
    push(facts, "Preferences", "Extras", labels(details.preferences, hotelAdditionalPreferences), true);
  } else if (module === "car") {
    push(facts, "Trip", "Pickup city", text(details, "destination"));
    push(facts, "Trip", "Pickup point", text(details, "pickupPoint"), true);
    push(facts, "Trip", "Drop-off", text(details, "dropoffCity") || "Same city");
    push(facts, "Trip", "Model", text(details, "itemName"));
    push(facts, "Trip", "Pickup date", showDate(text(details, "start")));
    push(facts, "Trip", "Pickup time", text(details, "pickupTime"));
    push(facts, "Trip", "Return date", showDate(text(details, "end")));
    push(facts, "Travellers", "Passengers", text(details, "passengers"));
    const seats = text(details, "childSeats");
    if (seats && seats !== "0") push(facts, "Travellers", "Child seats", seats);
    const type = text(details, "vehicleType");
    if (type && type !== "any") push(facts, "Preferences", "Type", optionLabel(carTypes, type));
    const drive = text(details, "drive");
    if (drive) push(facts, "Preferences", "Driver", optionLabel(driveOptions, drive));
    const transmission = text(details, "transmission");
    if (transmission && transmission !== "either") push(facts, "Preferences", "Transmission", optionLabel(transmissionOptions, transmission));
  } else if (module === "bus") {
    push(facts, "Trip", "From", text(details, "fromCity"));
    push(facts, "Trip", "To", text(details, "toCity"));
    push(facts, "Trip", "Bus", text(details, "itemName"), true);
    push(facts, "Trip", "Travel date", showDate(text(details, "start")));
    const window = text(details, "timeWindow");
    if (window && window !== "any") push(facts, "Trip", "Time", timeWindowLabel(window) || optionLabel(busTimeWindows, window));
    push(facts, "Travellers", "Adults", text(details, "adults"));
    push(facts, "Travellers", "Children", text(details, "children"));
    push(facts, "Travellers", "Passengers", text(details, "passengers"));
    const luggageQuantity = text(details, "luggageQuantity");
    const luggageWeight = text(details, "luggageWeight");
    if (luggageQuantity || luggageWeight) {
      push(facts, "Travellers", "Luggage", `${plural(luggageQuantity || "0", "piece", "pieces")}, ${luggageWeight || "0"} kg total`);
    }
    const coach = text(details, "coach");
    if (coach && coach !== "any") push(facts, "Preferences", "Coach", coachLabel(coach) || optionLabel(busCoachTypes, coach));
  } else {
    push(facts, "Trip", "Pickup city", text(details, "destination"));
    push(facts, "Trip", "Pickup point", text(details, "pickupPoint"), true);
    push(facts, "Trip", "Drop-off", text(details, "dropoffCity") || "Same city");
    push(facts, "Trip", "Model", text(details, "itemName"));
    push(facts, "Trip", "Pickup date", showDate(text(details, "start")));
    push(facts, "Trip", "Return date", showDate(text(details, "end")));
    const type = text(details, "bikeType");
    if (type && type !== "any") push(facts, "Preferences", "Type", optionLabel(bikeTypes, type));
    if (typeof details.needDriver === "boolean") push(facts, "Travellers", "Driver", details.needDriver ? "Needed" : "Not needed");
    const riders = text(details, "riders");
    if (details.needDriver !== true && riders) push(facts, "Travellers", "Riders", riders === "2" ? "With a pillion" : "Solo");
    if (details.needDriver !== true && text(details, "licence")) push(facts, "Travellers", "Valid licence", text(details, "licence") === "yes" ? "Yes" : "No");
    push(facts, "Travellers", "Helmets", text(details, "helmets"));
  }
  push(facts, "Budget", "Budget", budgetLabel(module, details).replace(/^not set$/, ""));
  return facts;
}

const kindLabels: Record<EnquiryModule, string> = {
  tour: "Tour",
  hotel: "Hotel",
  car: "Car",
  bike: "Bike",
  bus: "Bus",
  contact: "Contact",
};

function websiteFacts(details: Record<string, unknown>) {
  const facts: EnquiryFact[] = [];
  const about = text(details, "interestLabel") || text(details, "interest");
  if (about) push(facts, "Trip", "About", about, true);
  return facts;
}

export function toEnquiryView(booking: {
  id: string;
  reference: string;
  module: string;
  status: string;
  title: string;
  notes?: string;
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
  const website = isWebsiteEnquiry(parsed, booking.title);
  const custom = isCustomEnquiry(parsed);
  if (!website && !custom) return null;

  const module = website
    ? moduleFromBooking(booking.module) ?? "contact"
    : enquiryModule(typeof parsed.kind === "string" ? parsed.kind : "") ?? moduleFromBooking(booking.module);
  if (!module) return null;

  const facts = website || module === "contact" ? websiteFacts(parsed) : factsFor(module, parsed);
  const summary = website
    ? [text(parsed, "interestLabel") || text(parsed, "interest"), booking.contactName].filter(Boolean).join(" · ")
    : facts
        .filter((fact) => fact.label !== "Budget")
        .slice(0, 3)
        .map((fact) => fact.value)
        .join(" · ");
  return {
    id: booking.id,
    reference: booking.reference,
    module: website ? "contact" : module,
    kindLabel: website ? "Contact" : kindLabels[module],
    title: booking.title,
    status: booking.status,
    summary,
    contactName: booking.contactName,
    contactPhone: booking.contactPhone,
    contactEmail: booking.contactEmail,
    createdAt: booking.createdAt,
    facts,
    note: text(parsed, "message") || text(parsed, "note") || (booking.notes ?? "").trim(),
    image: "",
    channel: text(parsed, "channel"),
  };
}
