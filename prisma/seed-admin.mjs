import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@travel.test")
  .trim()
  .toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
const name = (process.env.SEED_ADMIN_NAME ?? "Administrator").trim() || "Administrator";

async function hashPassword(value) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(value, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return [
    "scrypt",
    16384,
    8,
    1,
    salt.toString("base64"),
    hash.toString("base64"),
  ].join("$");
}

async function main() {
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const role = await prisma.role.upsert({
    where: { key: "admin" },
    update: {
      name: "Administrator",
      scope: "staff",
      allAccess: true,
      isSystem: true,
    },
    create: {
      key: "admin",
      name: "Administrator",
      scope: "staff",
      allAccess: true,
      isSystem: true,
    },
  });

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        passwordHash,
        roleId: role.id,
        isActive: true,
      },
    });
    console.log(`Updated admin: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: role.id,
        isActive: true,
      },
    });
    console.log(`Created admin: ${email}`);
  }

  console.log("Sign in at /admin/login");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
