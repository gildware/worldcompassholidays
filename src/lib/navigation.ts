import { moduleLabels, modules, type ModuleKey } from "@/config/modules";
import type { StaffPermission } from "@/lib/auth/permissions";

export type NavItem = {
  href: string;
  label: string;
};

const moduleHrefs: Record<ModuleKey, string> = {
  tours: "/tours",
  hotels: "/hotels",
  cars: "/rentals",
  bikes: "/rentals",
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
    const label =
      key === "cars" || key === "bikes" ? "Rentals" : moduleLabels[key];
    items.push({ href, label });
  });

  items.push({ href: "/contact", label: "Contact" });
  return items;
}

const adminNav: (NavItem & { permission?: StaffPermission; enabled: boolean })[] =
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
      href: "/admin/hotels",
      label: "Hotels",
      permission: "hotels.view",
      enabled: modules.hotels,
    },
    {
      href: "/admin/vehicles",
      label: "Vehicles",
      permission: "vehicles.view",
      enabled: modules.cars || modules.bikes,
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
    .filter((item) => item.enabled && (!item.permission || allowed(item.permission)))
    .map(({ href, label }) => ({ href, label }));
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
