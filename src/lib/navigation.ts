import { moduleLabels, modules, type ModuleKey } from "@/config/modules";
import type { StaffPermission } from "@/lib/auth/permissions";

export type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const moduleHrefs: Record<ModuleKey, string> = {
  tours: "/tours",
  hotels: "/hotels",
  cars: "/rentals/cars",
  bikes: "/rentals/bikes",
  buses: "/buses",
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
    items.push({ href, label: moduleLabels[key] });
  });

  items.push({ href: "/visa-services", label: "Visa Services" });
  items.push({ href: "/meet-and-assist", label: "Meet & assist" });
  items.push({ href: "/contact", label: "Contact" });
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
    },
    {
      href: "/admin/configuration",
      label: "Configuration",
      anyOf: [
        ...(modules.tours ? (["tours.manage"] as const) : []),
        ...(modules.hotels ? (["hotels.manage"] as const) : []),
        ...(modules.cars || modules.bikes ? (["vehicles.manage"] as const) : []),
      ],
      enabled: modules.tours || modules.hotels || modules.cars || modules.bikes,
    },
    {
      href: "/admin/hotels",
      label: "Hotels",
      permission: "hotels.view",
      enabled: modules.hotels,
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
        { href: "/admin/rentals/cars/bookings", label: "Bookings" },
        { href: "/admin/rentals/cars/locations", label: "Locations" },
        { href: "/admin/rentals/cars/rules", label: "Rules" },
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
        { href: "/admin/rentals/bikes/bookings", label: "Bookings" },
        { href: "/admin/rentals/bikes/locations", label: "Locations" },
        { href: "/admin/rentals/bikes/rules", label: "Rules" },
      ],
    },
    {
      href: "/admin/buses",
      label: "Buses",
      permission: "buses.view",
      enabled: modules.buses,
    },
    {
      href: "/admin/bookings",
      label: "Bookings",
      permission: "bookings.view",
      enabled: true,
    },
    {
      href: "/admin/visa",
      label: "Visa requests",
      permission: "bookings.view",
      enabled: true,
    },
    {
      href: "/admin/meet-and-assist",
      label: "Meet and assist",
      permission: "bookings.view",
      enabled: true,
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
