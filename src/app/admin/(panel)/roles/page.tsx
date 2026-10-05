import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Roles" };

export default async function AdminRolesPage() {
  await requirePermission("roles.manage");

  const roles = await prisma.role.findMany({
    orderBy: [{ scope: "desc" }, { name: "asc" }],
    include: { _count: { select: { users: true, permissions: true } } },
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">Roles</h1>
          <p className="mt-0.5 text-xs text-muted">
            Built-in roles stay fixed. Create staff roles, then assign them on Staff.
          </p>
        </div>
        <ButtonLink href="/admin/roles/new" size="sm" className="w-full sm:w-auto">
          New role
        </ButtonLink>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {roles.map((role) => {
          const meta = [
            role.scope === "customer" ? "Customers" : "Staff",
            role.allAccess
              ? "All access"
              : `${role._count.permissions} permission${role._count.permissions === 1 ? "" : "s"}`,
            `${role._count.users} ${role._count.users === 1 ? "person" : "people"}`,
          ].join(" · ");

          return (
            <li
              key={role.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3.5 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-navy">{role.name}</p>
                  {role.isSystem ? <Badge>Built in</Badge> : null}
                </div>
                <p className="mt-0.5 text-xs text-muted">{meta}</p>
              </div>
              {role.isSystem ? (
                <span className="shrink-0 text-xs text-muted">System</span>
              ) : (
                <Link
                  href={`/admin/roles/${role.id}`}
                  className="shrink-0 text-xs font-medium text-brand hover:underline"
                >
                  Edit
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
