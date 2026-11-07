"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { customerReturnPath } from "@/lib/forms";
import { hashPassword } from "@/lib/auth/password";
import { phoneLookup } from "@/lib/auth/phone";
import { clearLoginFailures, isLoginBlocked, recordLoginFailure } from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import { phoneFromFirebaseToken } from "@/lib/firebase/verify-id-token";

export type PhoneLoginResult = {
  error: string | null;
  phone: string;
};

export type EstablishPhoneResult = {
  error: string | null;
  phone: string;
  needsName: boolean;
};

async function findCustomer(phone: string) {
  return prisma.user.findFirst({
    where: {
      isActive: true,
      phone: { in: phoneLookup(phone) },
      role: { scope: "customer" },
    },
    select: { id: true },
  });
}

async function limitKey() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `phone-firebase:${ip}`;
}

async function resolvePhoneSession(idToken: string, name?: string): Promise<EstablishPhoneResult> {
  const key = await limitKey();
  if (await isLoginBlocked(key)) {
    return { error: "Too many attempts. Wait 15 minutes and try again.", phone: "", needsName: false };
  }

  const phone = await phoneFromFirebaseToken(idToken).catch(() => "");
  if (!phone) {
    await recordLoginFailure(key);
    return { error: "That verification could not be confirmed. Send a new code.", phone: "", needsName: false };
  }

  await clearLoginFailures(key);
  const existing = await findCustomer(phone);
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { lastLoginAt: new Date() } });
    await createSession(existing.id, "customer");
    return { error: null, phone, needsName: false };
  }

  const trimmed = (name ?? "").trim();
  if (trimmed.length < 2) {
    return { error: null, phone, needsName: true };
  }

  const customerRole = await prisma.role.findUnique({ where: { key: "customer" } });
  if (!customerRole) {
    return { error: "Customer accounts are not set up yet.", phone, needsName: false };
  }

  const user = await prisma.user.create({
    data: {
      name: trimmed.slice(0, 80),
      email: `${phone}@riders.worldcompass.local`,
      phone,
      passwordHash: await hashPassword(randomBytes(24).toString("hex")),
      roleId: customerRole.id,
    },
    select: { id: true },
  });
  await createSession(user.id, "customer");
  return { error: null, phone, needsName: false };
}

/** Creates a customer session after Firebase verification without navigating away. */
export async function establishPhoneSession(idToken: string, name?: string): Promise<EstablishPhoneResult> {
  return resolvePhoneSession(idToken, name);
}

export async function finishPhoneLogin(
  idToken: string,
  nextPath: string,
  name?: string,
): Promise<PhoneLoginResult> {
  const next = customerReturnPath(nextPath, "/account");
  const result = await resolvePhoneSession(idToken, name);
  if (result.error || result.needsName) {
    return { error: result.error, phone: result.phone };
  }
  redirect(next);
}
