import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRoleButton } from "@/components/admin/DeleteRoleButton";
import { RoleForm } from "@/components/admin/RoleForm";
import { requirePermission } from "@/lib/auth/guards";
import { buildPermissionMatrix } from "@/lib/auth/permission-matrix";
import { canGrantRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Edit role" };

export default async function EditRolePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requirePermission("roles.manage");
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);

  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true, _count: { select: { users: true } } },
  });
  if (!role || role.isSystem || role.scope !== "staff") notFound();

  const editable = canGrantRole(user, role);
  const rows = buildPermissionMatrix((key) => {
    if (!editable) return false;
    return user.allAccess || user.permissions.has(key);
  });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Link
            href="/admin/roles"
            className="text-xs font-medium text-brand hover:underline"
          >
            ← All roles
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">
            {role.name}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {role._count.users}{" "}
            {role._count.users === 1 ? "person has" : "people have"} this role
          </p>
        </div>
      </div>

      {saved ? (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800"
        >
          Role created. Assign it on the Staff page when ready.
        </p>
      ) : null}

      {editable ? null : (
        <p className="rounded-lg border border-line bg-white px-3 py-2 text-xs text-muted">
          This role has permissions you do not have, so you can view it but not
          change it.
        </p>
      )}

      <RoleForm
        role={{
          id: role.id,
          name: role.name,
          permissions: role.permissions.map((item) => item.permission),
        }}
        rows={rows}
      />

      {editable ? (
        <DeleteRoleButton
          roleId={role.id}
          roleName={role.name}
          disabledReason={
            role._count.users > 0
              ? `${role._count.users} ${
                  role._count.users === 1 ? "person has" : "people have"
                } this role. Move them to another role before deleting it.`
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
