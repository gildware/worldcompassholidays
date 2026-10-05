"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { isStaffPermission } from "@/lib/auth/permissions";
import { canGrantPermissions, canGrantRole } from "@/lib/auth/roles";
import { uniqueSlug } from "@/lib/slug";

const roleSchema = z.object({
  name: z.string().trim().min(2, "Enter a role name").max(60),
  permissions: z
    .array(z.string())
    .refine((values) => values.every(isStaffPermission), "Unknown permission"),
});

function readRoleForm(formData: FormData) {
  return roleSchema.safeParse({
    name: formData.get("name"),
    permissions: formData.getAll("permissions").map(String),
  });
}

export async function createRole(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("roles.manage");
  const parsed = readRoleForm(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (!canGrantPermissions(actor, parsed.data.permissions)) {
    return { error: "You can only grant permissions you have yourself." };
  }

  const key = await uniqueSlug(parsed.data.name, async (candidate) =>
    Boolean(await prisma.role.findUnique({ where: { key: candidate } })),
  );

  const role = await prisma.role.create({
    data: {
      key,
      name: parsed.data.name,
      scope: "staff",
      permissions: {
        create: [...new Set(parsed.data.permissions)].map((permission) => ({
          permission,
        })),
      },
    },
  });

  revalidatePath("/admin/roles");
  redirect(`/admin/roles/${role.id}?saved=1`);
}

export async function updateRole(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("roles.manage");
  const roleId = String(formData.get("roleId") ?? "");
  const parsed = readRoleForm(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });
  if (!role || role.isSystem || role.scope !== "staff") {
    return { error: "This role cannot be edited." };
  }
  if (!canGrantRole(actor, role)) {
    return { error: "You cannot edit a role with more access than you." };
  }
  if (!canGrantPermissions(actor, parsed.data.permissions)) {
    return { error: "You can only grant permissions you have yourself." };
  }

  const permissions = [...new Set(parsed.data.permissions)];

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.role.update({
      where: { id: roleId },
      data: {
        name: parsed.data.name,
        permissions: { create: permissions.map((permission) => ({ permission })) },
      },
    }),
  ]);

  revalidatePath("/admin/roles");
  revalidatePath(`/admin/roles/${roleId}`);
  return { error: null, success: "Role saved. Staff with this role get the change on their next page load." };
}

export async function deleteRole(formData: FormData) {
  const actor = await requirePermission("roles.manage");
  const roleId = String(formData.get("roleId") ?? "");

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true, _count: { select: { users: true } } },
  });

  if (
    !role ||
    role.isSystem ||
    role._count.users > 0 ||
    !canGrantRole(actor, role)
  ) {
    redirect(`/admin/roles/${roleId}`);
  }

  await prisma.role.delete({ where: { id: roleId } });
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}
