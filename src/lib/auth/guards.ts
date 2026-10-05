import "server-only";
import { redirect } from "next/navigation";
import type {
  CustomerPermission,
  StaffPermission,
} from "@/lib/auth/permissions";
import { can, getCurrentUser } from "@/lib/auth/session";

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || user.scope !== "staff") redirect("/admin/login");
  return user;
}

export async function requirePermission(permission: StaffPermission) {
  const user = await requireStaff();
  if (!can(user, permission)) redirect("/admin/no-access");
  return user;
}

export async function requireCustomer(permission: CustomerPermission) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.scope !== "customer") redirect("/admin");
  if (!can(user, permission)) redirect("/login");
  return user;
}
