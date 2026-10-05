"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { canGrantRole } from "@/lib/auth/roles";
import { destroyUserSessions } from "@/lib/auth/session";
import { emailField, nameField, passwordField, phoneField } from "@/lib/validation";

const createStaffSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  password: passwordField,
  roleId: z.string().min(1, "Choose a role"),
});

const updateStaffSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1, "Choose a role"),
  isActive: z.boolean(),
  password: z.union([z.literal(""), passwordField]),
});

async function loadGrantableRole(roleId: string) {
  return prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });
}

export async function createStaff(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("staff.manage");

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const role = await loadGrantableRole(parsed.data.roleId);
  if (!role || !canGrantRole(actor, role)) {
    return { error: "You cannot assign that role." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) return { error: "Someone already uses this email." };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: await hashPassword(parsed.data.password),
      roleId: role.id,
    },
  });

  revalidatePath("/admin/staff");
  return { error: null, success: `${parsed.data.name} can now sign in.` };
}

export async function updateStaff(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("staff.manage");

  const parsed = updateStaffSchema.safeParse({
    userId: formData.get("userId"),
    roleId: formData.get("roleId"),
    isActive: formData.get("isActive") === "on",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (parsed.data.userId === actor.id) {
    return { error: "You cannot change your own role or access." };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    include: { role: { include: { permissions: true } } },
  });
  if (!target || target.role.scope !== "staff") {
    return { error: "Staff member not found." };
  }
  if (!canGrantRole(actor, target.role)) {
    return { error: "You cannot edit someone with more access than you." };
  }

  const role = await loadGrantableRole(parsed.data.roleId);
  if (!role || !canGrantRole(actor, role)) {
    return { error: "You cannot assign that role." };
  }

  const roleChanged = role.id !== target.roleId;
  const deactivated = target.isActive && !parsed.data.isActive;
  const passwordChanged = parsed.data.password !== "";

  await prisma.user.update({
    where: { id: target.id },
    data: {
      roleId: role.id,
      isActive: parsed.data.isActive,
      ...(passwordChanged
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    },
  });

  if (roleChanged || deactivated || passwordChanged) {
    await destroyUserSessions(target.id);
  }

  revalidatePath("/admin/staff");
  return { error: null, success: "Saved." };
}
