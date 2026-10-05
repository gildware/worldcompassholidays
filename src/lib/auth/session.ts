import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Permission, RoleScope } from "@/lib/auth/permissions";

export const SESSION_COOKIE = "session";

const sessionLength = {
  staff: 12 * 60 * 60 * 1000,
  customer: 30 * 24 * 60 * 60 * 1000,
} satisfies Record<RoleScope, number>;

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  scope: RoleScope;
  roleId: string;
  roleName: string;
  allAccess: boolean;
  permissions: ReadonlySet<string>;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, scope: RoleScope) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLength[scope]);

  await prisma.session.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });
  await prisma.session.create({
    data: { id: hashToken(token), userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    include: {
      user: {
        include: { role: { include: { permissions: true } } },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  const { user } = session;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    scope: user.role.scope as RoleScope,
    roleId: user.role.id,
    roleName: user.role.name,
    allAccess: user.role.allAccess,
    permissions: new Set(user.role.permissions.map((item) => item.permission)),
  };
});

export function can(user: CurrentUser | null, permission: Permission) {
  if (!user) return false;
  if (user.allAccess) return true;
  return user.permissions.has(permission);
}
