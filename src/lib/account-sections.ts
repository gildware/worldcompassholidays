import { modules } from "@/config/modules";

export const accountSectionKeys = ["tour", "hotel", "visa", "assist", "car", "bike"] as const;

export type AccountSectionKey = (typeof accountSectionKeys)[number];

export type AccountSection = {
  key: AccountSectionKey;
  href: string;
  label: string;
  serviceLabel: string;
  description: string;
  empty: string;
  actionHref: string;
  actionLabel: string;
  module: string;
  fleet: "car" | "bike" | null;
};

export const accountSections: AccountSection[] = [
  {
    key: "tour",
    href: "/account/tours",
    label: "Tour booking",
    serviceLabel: "Tour",
    description: "Tours and treks",
    empty: "No tour bookings yet.",
    actionHref: "/tours",
    actionLabel: "Browse tours",
    module: "tour",
    fleet: null,
  },
  {
    key: "hotel",
    href: "/account/hotels",
    label: "Hotel booking",
    serviceLabel: "Hotel",
    description: "Hotel requests",
    empty: "No hotel bookings yet.",
    actionHref: "/hotels/request",
    actionLabel: "Request a hotel",
    module: "hotel",
    fleet: null,
  },
  {
    key: "visa",
    href: "/account/visa",
    label: "Visa",
    serviceLabel: "Visa",
    description: "Visa requests",
    empty: "No visa requests yet.",
    actionHref: "/visa-services",
    actionLabel: "Start a visa request",
    module: "visa",
    fleet: null,
  },
  {
    key: "assist",
    href: "/account/assist",
    label: "Meet & assist",
    serviceLabel: "Meet and assist",
    description: "Airport meet and assist",
    empty: "No meet and assist requests yet.",
    actionHref: "/meet-and-assist",
    actionLabel: "Request meet and assist",
    module: "assist",
    fleet: null,
  },
  {
    key: "car",
    href: "/account/cars",
    label: "Car",
    serviceLabel: "Car",
    description: "Car rentals",
    empty: "No car bookings yet.",
    actionHref: "/rentals/cars",
    actionLabel: "Browse cars",
    module: "car",
    fleet: "car",
  },
  {
    key: "bike",
    href: "/account/bikes",
    label: "Bike",
    serviceLabel: "Bike",
    description: "Bike rentals",
    empty: "No bike bookings yet.",
    actionHref: "/rentals/bikes",
    actionLabel: "Browse bikes",
    module: "bike",
    fleet: "bike",
  },
];

export function visibleAccountSections() {
  return accountSections.filter((section) => {
    if (section.key === "tour") return modules.tours;
    if (section.key === "hotel") return modules.hotels;
    if (section.key === "car") return modules.cars;
    if (section.key === "bike") return modules.bikes;
    return true;
  });
}

export function accountSectionForModule(module: string) {
  return accountSections.find((section) => section.module === module) ?? null;
}

export function accountSectionForFleet(kind: string) {
  return accountSections.find((section) => section.fleet === kind) ?? null;
}
