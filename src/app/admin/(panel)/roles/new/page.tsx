import type { Metadata } from "next";
import Link from "next/link";
import { RoleForm } from "@/components/admin/RoleForm";
import { requirePermission } from "@/lib/auth/guards";
import { buildPermissionMatrix } from "@/lib/auth/permission-matrix";

export const metadata: Metadata = { title: "New role" };

export default async function NewRolePage() {
  const user = await requirePermission("roles.manage");

  const rows = buildPermissionMatrix(
    (key) => user.allAccess || user.permissions.has(key),
  );

  return (
    <div className="grid gap-3">
      <div>
        <Link
          href="/admin/roles"
          className="text-xs font-medium text-brand hover:underline"
        >
          ← All roles
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">
          New role
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          You can only grant permissions you already have.
        </p>
      </div>
      <RoleForm rows={rows} />
    </div>
  );
}
