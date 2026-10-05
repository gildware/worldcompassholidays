import { modules } from "@/config/modules";

export const rentalConfigKinds = [
  "vehicle_type",
  "fuel",
  "transmission",
  "feature",
  "vehicle_document",
  "customer_document",
  "addon",
] as const;

export type RentalConfigKind = (typeof rentalConfigKinds)[number];

export const rentalConfigKindLabels: Record<RentalConfigKind, string> = {
  vehicle_type: "Vehicle types",
  fuel: "Fuel types",
  transmission: "Transmission",
  feature: "Features",
  vehicle_document: "Vehicle documents",
  customer_document: "Customer documents",
  addon: "Add-ons",
};

export const vehicleBaseStatuses = [
  "available",
  "maintenance",
  "on_hold",
  "inactive",
] as const;

export type VehicleBaseStatus = (typeof vehicleBaseStatuses)[number];

export const vehicleStatusLabels: Record<string, string> = {
  available: "Available",
  booked: "Booked",
  active: "Active",
  maintenance: "Maintenance",
  on_hold: "On hold",
  inactive: "Inactive",
};

export const bookingStatuses = [
  "pending",
  "documents_required",
  "documents_under_review",
  "confirmed",
  "ready_for_pickup",
  "active",
  "return_pending",
  "completed",
  "cancelled",
  "rejected",
] as const;

export type RentalBookingStatus = (typeof bookingStatuses)[number];

export const bookingStatusLabels: Record<string, string> = {
  pending: "Pending",
  documents_required: "Documents required",
  documents_under_review: "Documents under review",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
  active: "Active",
  return_pending: "Return pending",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export const blockingBookingStatuses = [
  "pending",
  "documents_required",
  "documents_under_review",
  "confirmed",
  "ready_for_pickup",
  "active",
  "return_pending",
] as const;

export const customerCancelStatuses = [
  "pending",
  "documents_required",
  "documents_under_review",
  "confirmed",
  "ready_for_pickup",
] as const;

export const bookingTransitions: Record<string, readonly string[]> = {
  pending: ["documents_required", "documents_under_review", "confirmed", "rejected", "cancelled"],
  documents_required: ["documents_under_review", "rejected", "cancelled"],
  documents_under_review: ["confirmed", "documents_required", "rejected", "cancelled"],
  confirmed: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["active", "cancelled"],
  active: ["return_pending"],
  return_pending: ["completed"],
  completed: [],
  cancelled: [],
  rejected: [],
};

export const documentStatuses = ["pending", "verified", "rejected"] as const;

export const documentStatusLabels: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export const maintenanceStatuses = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const maintenanceStatusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const paymentKinds = ["rental", "deposit", "extra", "refund"] as const;

export const paymentKindLabels: Record<string, string> = {
  rental: "Rental",
  deposit: "Security deposit",
  extra: "Extra charges",
  refund: "Refund",
};

export const paymentStatuses = ["unpaid", "paid", "failed"] as const;

export const paymentStatusLabels: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Failed",
};

export const paymentMethods = [
  "pending_gateway",
  "cash",
  "upi",
  "bank",
  "card",
] as const;

export const paymentMethodLabels: Record<string, string> = {
  pending_gateway: "Waiting for payment gateway",
  cash: "Cash",
  upi: "UPI",
  bank: "Bank transfer",
  card: "Card",
};

export function fleetKinds() {
  const kinds: Array<"car" | "bike"> = [];
  if (modules.cars) kinds.push("car");
  if (modules.bikes) kinds.push("bike");
  return kinds;
}

export function fleetLabel(kind: string) {
  if (kind === "car") return "Car";
  if (kind === "bike") return "Bike";
  return kind;
}

export function appliesToFleet(appliesTo: string, kind: string) {
  return appliesTo === "all" || appliesTo === kind;
}

export function rentalStatusLabel(status: string) {
  return bookingStatusLabels[status] ?? status;
}

export function vehicleStatusLabel(status: string) {
  return vehicleStatusLabels[status] ?? status;
}

export function rentalListGroup(status: string) {
  if (status === "active" || status === "return_pending") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "rejected") return "cancelled";
  return "upcoming";
}

export function isRentalConfigKind(value: string): value is RentalConfigKind {
  return (rentalConfigKinds as readonly string[]).includes(value);
}
