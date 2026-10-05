import type { Metadata } from "next";
import { StaffWorkspace } from "@/components/admin/StaffWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { canGrantRole } from "@/lib/auth/roles";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  const user = await requirePermission("staff.view");
  const canManage = can(user, "staff.manage");

  const [members, roles] = await Promise.all([
    prisma.user.findMany({
      where: { role: { scope: "staff" } },
      orderBy: { createdAt: "asc" },
      include: { role: { include: { permissions: true } } },
    }),
    prisma.role.findMany({
      where: { scope: "staff" },
      orderBy: { name: "asc" },
      include: { permissions: true },
    }),
  ]);

  const grantableRoles = roles
    .filter((role) => canGrantRole(user, role))
    .map((role) => ({ id: role.id, name: role.name }));

  return (
    <StaffWorkspace
      canManage={canManage}
      roles={grantableRoles}
      members={members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        roleId: member.roleId,
        roleName: member.role.name,
        isActive: member.isActive,
        isSelf: member.id === user.id,
        editable:
          canManage &&
          member.id !== user.id &&
          canGrantRole(user, member.role),
        lastLoginLabel: member.lastLoginAt
          ? formatDate(member.lastLoginAt)
          : null,
      }))}
    />
  );
}
