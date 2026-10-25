import { modules } from "@/config/modules";

export const accountSectionKeys = ["tour", "hotel", "visa", "assist", "car", "bike"] as const;

export type AccountSectionKey = (typeof accountSectionKeys)[number];

export type AccountSection = {
  key: AccountSectionKey;
  href: string;
  label: string;
  tabLabel: string;
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
    tabLabel: "Tour booking",
    serviceLabel: "Tour",
    description: "Tours and treks",
    empty: "No tour bookings yet.",
    actionHref: "/tours/request",
    actionLabel: "Request a tour",
    module: "tour",
    fleet: null,
  },
  {
    key: "hotel",
    href: "/account/hotels",
    label: "Hotel booking",
    tabLabel: "Hotel booking",
    serviceLabel: "Hotel",
    description: "Hotel stays",
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
    tabLabel: "Visa",
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
    tabLabel: "Assist",
    serviceLabel: "Meet and assist",
    description: "Airport meet and assist",
    empty: "No meet and assist requests yet.",
    actionHref: "/meet-and-assist/request",
    actionLabel: "Request meet and assist",
    module: "assist",
    fleet: null,
  },
  {
    key: "car",
    href: "/account/cars",
    label: "Car",
    tabLabel: "Car booking",
    serviceLabel: "Car",
    description: "Car rentals",
    empty: "No car bookings yet.",
    actionHref: "/rentals/cars/request",
    actionLabel: "Request a car",
    module: "car",
    fleet: "car",
  },
  {
    key: "bike",
    href: "/account/bikes",
    label: "Bike",
    tabLabel: "Bike booking",
    serviceLabel: "Bike",
    description: "Bike rentals",
    empty: "No bike bookings yet.",
    actionHref: "/rentals/bikes/request",
    actionLabel: "Request a bike",
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
