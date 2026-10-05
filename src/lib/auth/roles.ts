import "server-only";
import type { CurrentUser } from "@/lib/auth/session";

type RoleShape = {
  allAccess: boolean;
  scope: string;
  permissions: { permission: string }[];
};

// A non-admin can only hand out access they already hold.
export function canGrantRole(actor: CurrentUser, role: RoleShape) {
  if (role.scope !== "staff") return false;
  if (actor.allAccess) return true;
  if (role.allAccess) return false;
  return role.permissions.every((item) => actor.permissions.has(item.permission));
}

export function canGrantPermissions(actor: CurrentUser, permissions: string[]) {
  if (actor.allAccess) return true;
  return permissions.every((permission) => actor.permissions.has(permission));
}
