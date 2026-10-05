import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../src/lib/auth/hash";
import type { StaffPermission } from "../src/lib/auth/permissions";

const prisma = new PrismaClient();

const accounts = [
  {
    email: "admin@travel.test",
    password: "Admin@12345",
    scope: "staff",
    expectAllAccess: true,
    expectPermissions: [] as StaffPermission[],
  },
  {
    email: "staff@travel.test",
    password: "Staff@12345",
    scope: "staff",
    expectAllAccess: false,
    expectPermissions: [
      "destinations.view",
      "tours.view",
      "tours.manage",
      "bookings.view",
      "bookings.manage",
      "customers.view",
    ] as StaffPermission[],
    denyPermissions: ["staff.manage", "roles.manage", "hotels.view"] as StaffPermission[],
  },
  {
    email: "customer@travel.test",
    password: "Customer@12345",
    scope: "customer",
    expectAllAccess: false,
    expectPermissions: [
      "account.bookings.view",
      "account.bookings.update",
      "account.profile.update",
    ],
  },
];

function can(
  allAccess: boolean,
  permissions: Set<string>,
  permission: string,
) {
  return allAccess || permissions.has(permission);
}

async function main() {
  let failed = 0;

  for (const account of accounts) {
    const user = await prisma.user.findUnique({
      where: { email: account.email },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      console.error(`FAIL ${account.email}: user missing`);
      failed += 1;
      continue;
    }

    const passwordOk = await verifyPassword(account.password, user.passwordHash);
    if (!passwordOk) {
      console.error(`FAIL ${account.email}: password mismatch`);
      failed += 1;
      continue;
    }

    if (user.role.scope !== account.scope) {
      console.error(
        `FAIL ${account.email}: scope ${user.role.scope}, expected ${account.scope}`,
      );
      failed += 1;
      continue;
    }

    if (user.role.allAccess !== account.expectAllAccess) {
      console.error(`FAIL ${account.email}: allAccess mismatch`);
      failed += 1;
      continue;
    }

    const permissions = new Set(user.role.permissions.map((p) => p.permission));
    for (const permission of account.expectPermissions) {
      if (!can(user.role.allAccess, permissions, permission)) {
        console.error(`FAIL ${account.email}: missing ${permission}`);
        failed += 1;
      }
    }

    for (const permission of account.denyPermissions ?? []) {
      if (can(user.role.allAccess, permissions, permission)) {
        console.error(`FAIL ${account.email}: should not have ${permission}`);
        failed += 1;
      }
    }

    console.log(
      `OK   ${account.email} (${user.role.name}) password+role+permissions`,
    );
  }

  const bookings = await prisma.booking.count({
    where: { contactEmail: "customer@travel.test" },
  });
  console.log(`OK   customer sample bookings: ${bookings}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
