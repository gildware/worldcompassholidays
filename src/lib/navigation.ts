import { modules, type ModuleKey } from "@/config/modules";
import type { StaffPermission } from "@/lib/auth/permissions";

export type NavChild = {
  href: string;
  label: string;
  /** Needs-action count shown as a nav badge. */
  badge?: number;
};

export type NavItem = {
  href: string;
  label: string;
  badge?: number;
  children?: NavChild[];
};

const moduleHrefs: Record<ModuleKey, string> = {
  tours: "/tours",
  hotels: "/hotels",
  cars: "/rentals/cars",
  bikes: "/rentals/bikes",
  buses: "/buses",
};

const publicModuleLabels: Record<ModuleKey, string> = {
  tours: "Plan a tour",
  hotels: "Find a stay",
  cars: "Rent a car",
  bikes: "Rent a bike",
  buses: "Find a bus",
};

export function getPublicNav(): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/destinations", label: "Destinations" },
  ];

  (Object.keys(modules) as ModuleKey[]).forEach((key) => {
    if (!modules[key]) return;
    const href = moduleHrefs[key];
    if (items.some((item) => item.href === href)) return;
    items.push({ href, label: publicModuleLabels[key] });
  });

  items.push({ href: "/visa-services", label: "Apply for a visa" });
  items.push({ href: "/meet-and-assist", label: "Request a greeter" });
  items.push({ href: "/contact", label: "Send an enquiry" });
  return items;
}

const adminNav: (NavItem & {
  permission?: StaffPermission;
  anyOf?: StaffPermission[];
  enabled: boolean;
})[] =
  [
    { href: "/admin", label: "Overview", enabled: true },
    {
      href: "/admin/destinations",
      label: "Destinations",
      permission: "destinations.view",
      enabled: true,
    },
    {
      href: "/admin/tours",
      label: "Tours & treks",
      permission: "tours.view",
      enabled: modules.tours,
      children: [
        { href: "/admin/tours", label: "Tours" },
        { href: "/admin/tours/configuration", label: "Configuration" },
      ],
    },
    {
      href: "/admin/hotels",
      label: "Hotels",
      permission: "hotels.view",
      enabled: modules.hotels,
      children: [
        { href: "/admin/hotels", label: "Hotels" },
        { href: "/admin/hotels/configuration", label: "Configuration" },
      ],
    },
    {
      href: "/admin/rentals/cars",
      label: "Car rental",
      permission: "vehicles.view",
      enabled: modules.cars,
      children: [
        { href: "/admin/rentals/cars/overview", label: "Overview" },
        { href: "/admin/rentals/cars", label: "Cars" },
        { href: "/admin/rentals/cars/availability", label: "Availability" },
        { href: "/admin/rentals/cars/locations", label: "Locations" },
        { href: "/admin/rentals/cars/rules", label: "Rules" },
        { href: "/admin/rentals/cars/configuration", label: "Configuration" },
      ],
    },
    {
      href: "/admin/rentals/bikes",
      label: "Bike rental",
      permission: "vehicles.view",
      enabled: modules.bikes,
      children: [
        { href: "/admin/rentals/bikes/overview", label: "Overview" },
        { href: "/admin/rentals/bikes", label: "Bikes" },
        { href: "/admin/rentals/bikes/availability", label: "Availability" },
        { href: "/admin/rentals/bikes/locations", label: "Locations" },
        { href: "/admin/rentals/bikes/rules", label: "Rules" },
        { href: "/admin/rentals/bikes/configuration", label: "Configuration" },
      ],
    },
    {
      href: "/admin/buses",
      label: "Buses",
      permission: "buses.view",
      enabled: modules.buses,
    },
    {
      href: "/admin/enquiries",
      label: "Enquiries",
      permission: "bookings.view",
      enabled: true,
    },
    {
      href: "/admin/bookings",
      label: "Bookings",
      permission: "bookings.view",
      enabled: true,
      children: [
        { href: "/admin/bookings", label: "Overview" },
        ...(modules.tours ? [{ href: "/admin/bookings/tours", label: "Tours" }] : []),
        ...(modules.hotels ? [{ href: "/admin/bookings/hotels", label: "Hotels" }] : []),
        ...(modules.cars ? [{ href: "/admin/bookings/cars", label: "Cars" }] : []),
        ...(modules.bikes ? [{ href: "/admin/bookings/bikes", label: "Bikes" }] : []),
        { href: "/admin/bookings/visa", label: "Visa" },
        { href: "/admin/bookings/assist", label: "Meet & assist" },
      ],
    },
    {
      href: "/admin/customers",
      label: "Customers",
      permission: "customers.view",
      enabled: true,
    },
    {
      href: "/admin/staff",
      label: "Staff",
      permission: "staff.view",
      enabled: true,
    },
    {
      href: "/admin/roles",
      label: "Roles",
      permission: "roles.manage",
      enabled: true,
    },
    {
      href: "/admin/home",
      label: "Homepage",
      permission: "staff.manage",
      enabled: true,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      permission: "staff.manage",
      enabled: true,
    },
  ];

export function getAdminNav(
  allowed: (permission: StaffPermission) => boolean,
): NavItem[] {
  return adminNav
    .filter((item) => {
      if (!item.enabled) return false;
      if (item.anyOf?.length) return item.anyOf.some((permission) => allowed(permission));
      return !item.permission || allowed(item.permission);
    })
    .map(({ href, label, children }) => ({ href, label, children }));
}

export function enquiryInterests() {
  const interests: { value: string; label: string }[] = [];

  if (modules.tours) interests.push({ value: "tour", label: "Tour or trek" });
  if (modules.hotels) interests.push({ value: "hotel", label: "Hotel" });
  if (modules.cars) interests.push({ value: "car", label: "Car rental" });
  if (modules.bikes) interests.push({ value: "bike", label: "Bike rental" });
  if (modules.buses) interests.push({ value: "bus", label: "Bus" });

  interests.push({ value: "general", label: "Something else" });
  return interests;
}
