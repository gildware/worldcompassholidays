import { accountSectionForModule } from "@/lib/account-sections";

export const bookingStatuses = [
  "enquiry",
  "quoted",
  "confirmed",
  "paid",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

export const bookingStatusLabels: Record<BookingStatus, string> = {
  enquiry: "Enquiry",
  quoted: "Quoted",
  confirmed: "Confirmed",
  paid: "Paid",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Suggested next steps for ops — mirrors Cloudbeds-style status-aware actions. */
export const bookingTransitions: Record<string, BookingStatus[]> = {
  enquiry: ["quoted", "confirmed", "cancelled"],
  quoted: ["confirmed", "paid", "enquiry", "cancelled"],
  confirmed: ["paid", "completed", "cancelled"],
  paid: ["completed", "cancelled"],
  completed: [],
  cancelled: ["enquiry"],
};

export const customerEditableStatuses: readonly string[] = ["enquiry", "quoted"];

export const bookingModules = [
  "tour",
  "hotel",
  "visa",
  "assist",
  "car",
  "bike",
  "general",
  "bus",
] as const;

export type BookingModule = (typeof bookingModules)[number];

const requestStatusLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "Under review",
  review: "Review",
  closed: "Closed",
};

export function statusLabel(status: string) {
  return bookingStatusLabels[status as BookingStatus] ?? requestStatusLabels[status] ?? status;
}

const extraModuleLabels: Record<string, string> = {
  general: "Something else",
  bus: "Bus",
};

export function moduleLabel(module: string) {
  return accountSectionForModule(module)?.serviceLabel ?? extraModuleLabels[module] ?? module;
}

export function bookingReference() {
  return `BK-${Date.now().toString(36).toUpperCase()}`;
}

export type BookingStatusTone = "ok" | "warn" | "info" | "danger" | "neutral";

export function bookingStatusTone(status: string): BookingStatusTone {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
      return "ok";
    case "quoted":
      return "info";
    case "enquiry":
      return "warn";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function parseBookingDetails(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || "{}") as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore malformed JSON */
  }
  return {};
}

export function staffNoteFromDetails(details: Record<string, unknown>) {
  const note = details.staffNote;
  return typeof note === "string" ? note : "";
}

export function assigneeFromDetails(details: Record<string, unknown>) {
  const id = details.assigneeId;
  const name = details.assigneeName;
  return {
    assigneeId: typeof id === "string" && id ? id : null,
    assigneeName: typeof name === "string" && name ? name : null,
  };
}

/** Human-readable rows from the JSON details blob for the desk. */
export function detailRows(details: Record<string, unknown>): { label: string; value: string }[] {
  const skip = new Set(["staffNote", "kind", "assigneeId", "assigneeName", "activity"]);
  const labels: Record<string, string> = {
    tourSlug: "Tour",
    hotelSlug: "Hotel",
    mode: "Travel mode",
    startDate: "Start",
    endDate: "End",
    departureId: "Departure",
    adults: "Adults",
    children: "Children",
    ownRoom: "Own room",
    singles: "Single rooms",
    season: "Season / rate",
    adultRate: "Adult rate",
    childRate: "Child rate",
    singleFee: "Single supplement",
    total: "Quoted total",
    note: "Customer note",
    interest: "Interest",
    channel: "Channel",
    nationality: "Nationality",
    destination: "Destination",
    visaType: "Visa type",
    flightNumber: "Flight",
    airport: "Airport",
    checkIn: "Check-in",
    checkOut: "Check-out",
    rooms: "Rooms",
  };

  const moneyKeys = new Set(["total", "adultRate", "childRate", "singleFee", "amount"]);

  return Object.entries(details)
    .filter(([key, value]) => !skip.has(key) && value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => {
      let display: string;
      if (typeof value === "boolean") {
        display = value ? "Yes" : "No";
      } else if (typeof value === "number" && moneyKeys.has(key)) {
        display = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(value);
      } else if (value === "1" || value === "0") {
        display = value === "1" ? "Yes" : "No";
      } else {
        display = String(value);
      }
      return {
        label: labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
        value: display,
      };
    });
}

export function primaryBookingAction(status: string): { status: BookingStatus; label: string } | null {
  switch (status) {
    case "enquiry":
      return { status: "quoted", label: "Mark quoted" };
    case "quoted":
      return { status: "confirmed", label: "Confirm booking" };
    case "confirmed":
      return { status: "paid", label: "Mark paid" };
    case "paid":
      return { status: "completed", label: "Mark completed" };
    default:
      return null;
  }
}

/** Journey rail labels for the admin booking desk cards. */
export function deskJourneyLabels(module: string): { from: string; to: string } {
  switch (module) {
    case "hotel":
      return { from: "Check-in", to: "Check-out" };
    case "visa":
      return { from: "Travel", to: "Return" };
    case "assist":
      return { from: "Service", to: "When" };
    case "car":
    case "bike":
      return { from: "Pickup", to: "Return" };
    default:
      return { from: "Start", to: "End" };
  }
}

/** Fallback hero thumb when the booking has no linked catalog image. */
export function deskModuleThumb(module: string): string {
  switch (module) {
    case "hotel":
      return "/img/stays/1/1.png";
    case "visa":
      return "/img/visa/visa-tourist.jpg";
    case "assist":
      return "/img/assist/assist-arrival.jpg";
    case "car":
      return "/img/cars/1.png";
    case "bike":
      return "/img/rentals/1.png";
    default:
      return "/img/tours/header-bg.jpg";
  }
}
