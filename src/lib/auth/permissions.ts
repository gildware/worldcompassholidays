import type { ModuleKey } from "@/config/modules";
import { modules } from "@/config/modules";

export const staffPermissions = [
  "destinations.view",
  "destinations.manage",
  "tours.view",
  "tours.manage",
  "hotels.view",
  "hotels.manage",
  "vehicles.view",
  "vehicles.manage",
  "buses.view",
  "buses.manage",
  "bookings.view",
  "bookings.manage",
  "customers.view",
  "staff.view",
  "staff.manage",
  "roles.manage",
] as const;

export const customerPermissions = [
  "account.bookings.view",
  "account.bookings.update",
  "account.profile.update",
] as const;

export type StaffPermission = (typeof staffPermissions)[number];
export type CustomerPermission = (typeof customerPermissions)[number];
export type Permission = StaffPermission | CustomerPermission;

export type RoleScope = "staff" | "customer";

type PermissionGroup = {
  label: string;
  modules?: ModuleKey[];
  items: { key: StaffPermission; label: string }[];
};

const permissionGroups: PermissionGroup[] = [
  {
    label: "Destinations",
    items: [
      { key: "destinations.view", label: "View destinations" },
      { key: "destinations.manage", label: "Add and edit destinations" },
    ],
  },
  {
    label: "Tours and treks",
    modules: ["tours"],
    items: [
      { key: "tours.view", label: "View tours" },
      { key: "tours.manage", label: "Add and edit tours" },
    ],
  },
  {
    label: "Hotels",
    modules: ["hotels"],
    items: [
      { key: "hotels.view", label: "View hotels" },
      { key: "hotels.manage", label: "Add and edit hotels" },
    ],
  },
  {
    label: "Vehicles",
    modules: ["cars", "bikes"],
    items: [
      { key: "vehicles.view", label: "View cars and bikes" },
      { key: "vehicles.manage", label: "Add and edit cars and bikes" },
    ],
  },
  {
    label: "Buses",
    modules: ["buses"],
    items: [
      { key: "buses.view", label: "View bus routes" },
      { key: "buses.manage", label: "Add and edit bus routes" },
    ],
  },
  {
    label: "Bookings",
    items: [
      { key: "bookings.view", label: "View bookings and enquiries" },
      { key: "bookings.manage", label: "Change booking status" },
    ],
  },
  {
    label: "Customers",
    items: [{ key: "customers.view", label: "View customer accounts" }],
  },
  {
    label: "Team",
    items: [
      { key: "staff.view", label: "View staff" },
      { key: "staff.manage", label: "Add staff, change roles, reset passwords" },
      { key: "roles.manage", label: "Create and edit roles" },
    ],
  },
];

export function getPermissionGroups() {
  return permissionGroups.filter(
    (group) => !group.modules || group.modules.some((key) => modules[key]),
  );
}

export function isStaffPermission(value: string): value is StaffPermission {
  return (staffPermissions as readonly string[]).includes(value);
}
