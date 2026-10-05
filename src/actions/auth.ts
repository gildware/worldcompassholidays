"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, safeRedirectPath, type FormState } from "@/lib/forms";
import { getDummyHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import type { RoleScope } from "@/lib/auth/permissions";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import { createSession, destroySession } from "@/lib/auth/session";
import { emailField, nameField, passwordField, phoneField } from "@/lib/validation";

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  password: passwordField,
});

const genericLoginError = "Email or password is incorrect.";

async function signIn(
  scope: RoleScope,
  formData: FormData,
): Promise<FormState | null> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { email, password } = parsed.data;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limitKey = `${scope}:${email}:${ip}`;

  if (await isLoginBlocked(limitKey)) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  const passwordOk = await verifyPassword(
    password,
    user?.passwordHash ?? (await getDummyHash()),
  );

  if (!user || !passwordOk || !user.isActive || user.role.scope !== scope) {
    await recordLoginFailure(limitKey);
    return { error: genericLoginError };
  }

  await clearLoginFailures(limitKey);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(user.id, scope);
  return null;
}

export async function staffLogin(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await signIn("staff", formData);
  if (result) return result;
  redirect(safeRedirectPath(formData.get("next"), "/admin", "/admin"));
}

export async function customerLogin(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await signIn("customer", formData);
  if (result) return result;
  redirect(safeRedirectPath(formData.get("next"), "/account", "/account"));
}

export async function customerSignup(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists. Sign in instead." };
  }

  const customerRole = await prisma.role.findUnique({ where: { key: "customer" } });
  if (!customerRole) {
    return { error: "Customer accounts are not set up yet. Run the database seed." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: await hashPassword(parsed.data.password),
      roleId: customerRole.id,
    },
  });

  await createSession(user.id, "customer");
  redirect("/account");
}

export async function logout(formData: FormData) {
  await destroySession();
  redirect(formData.get("to") === "admin" ? "/admin/login" : "/");
}
