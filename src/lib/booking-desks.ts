import { modules } from "@/config/modules";
import { moduleLabel } from "@/lib/bookings";

/** Enquiry modules that share the Booking table. */
export const bookingDeskKeys = ["tour", "hotel", "visa", "assist"] as const;

export type BookingDeskKey = (typeof bookingDeskKeys)[number];

export type FleetDeskKey = "car" | "bike";

export type BookingDesk = {
  key: BookingDeskKey;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  enabled: boolean;
};

export type FleetDesk = {
  key: FleetDeskKey;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  enabled: boolean;
  rentalHref: string;
};

export const bookingDesks: BookingDesk[] = [
  {
    key: "tour",
    href: "/admin/bookings/tours",
    label: "Tour bookings",
    shortLabel: "Tours",
    description: "Trek and package enquiries",
    enabled: modules.tours,
  },
  {
    key: "hotel",
    href: "/admin/bookings/hotels",
    label: "Hotel bookings",
    shortLabel: "Hotels",
    description: "Stay requests and quotes",
    enabled: modules.hotels,
  },
  {
    key: "visa",
    href: "/admin/bookings/visa",
    label: "Visa requests",
    shortLabel: "Visa",
    description: "Visa applications",
    enabled: true,
  },
  {
    key: "assist",
    href: "/admin/bookings/assist",
    label: "Meet & assist",
    shortLabel: "Meet & assist",
    description: "Airport meet requests",
    enabled: true,
  },
];

export const fleetDesks: FleetDesk[] = [
  {
    key: "car",
    href: "/admin/bookings/cars",
    rentalHref: "/admin/rentals/cars/bookings",
    label: "Car bookings",
    shortLabel: "Cars",
    description: "Fleet car rentals",
    enabled: modules.cars,
  },
  {
    key: "bike",
    href: "/admin/bookings/bikes",
    rentalHref: "/admin/rentals/bikes/bookings",
    label: "Bike bookings",
    shortLabel: "Bikes",
    description: "Fleet bike rentals",
    enabled: modules.bikes,
  },
];

export function deskForModule(module: string): BookingDesk | undefined {
  return bookingDesks.find((desk) => desk.key === module);
}

/** Nav/query segment for a booking module (`tours`, `hotels`, `visa`, …). */
export function deskSegmentForModule(module: string): string | null {
  const enquiry = deskForModule(module);
  if (enquiry) return enquiry.href.split("/").pop() ?? null;
  if (module === "car") return "cars";
  if (module === "bike") return "bikes";
  return null;
}

export function deskLabel(module: string) {
  return deskForModule(module)?.shortLabel ?? moduleLabel(module);
}

export const actionBookingStatuses = ["enquiry", "quoted"] as const;

export const actionRentalStatuses = [
  "pending",
  "documents_required",
  "documents_under_review",
] as const;

export function isBookingDeskSegment(segment: string) {
  return (
    bookingDesks.some((desk) => desk.href.endsWith(`/${segment}`)) ||
    fleetDesks.some((desk) => desk.href.endsWith(`/${segment}`))
  );
}
