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

export const customerEditableStatuses: readonly string[] = ["enquiry", "quoted"];

export function statusLabel(status: string) {
  return bookingStatusLabels[status as BookingStatus] ?? status;
}

export function bookingReference() {
  return `BK-${Date.now().toString(36).toUpperCase()}`;
}
