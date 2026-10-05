import "server-only";
import { prisma } from "@/lib/db";

const windowMs = 15 * 60 * 1000;
const maxFailures = 5;

export async function isLoginBlocked(key: string) {
  const failures = await prisma.loginAttempt.count({
    where: { key, createdAt: { gt: new Date(Date.now() - windowMs) } },
  });
  return failures >= maxFailures;
}

export async function recordLoginFailure(key: string) {
  await prisma.loginAttempt.create({ data: { key } });
  await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - windowMs) } },
  });
}

export async function clearLoginFailures(key: string) {
  await prisma.loginAttempt.deleteMany({ where: { key } });
}
