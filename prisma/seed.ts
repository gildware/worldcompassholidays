import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/hash";
import {
  customerPermissions,
  type StaffPermission,
} from "../src/lib/auth/permissions";

const prisma = new PrismaClient();

const destinations = [
  {
    slug: "jammu",
    name: "Jammu",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Temple city and the gateway into the mountains.",
    mapLat: "32.7266",
    mapLng: "74.8570",
    mapZoom: 11,
    imageUrl: "/uploads/destinations/seed-jammu.svg",
    imageKey: "destinations/seed-jammu.svg",
    imageDriver: "local",
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Lakes, gardens, and valley stays around Srinagar.",
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 9,
    imageUrl: "/uploads/destinations/seed-kashmir.svg",
    imageKey: "destinations/seed-kashmir.svg",
    imageDriver: "local",
  },
  {
    slug: "ladakh",
    name: "Ladakh",
    region: "Ladakh",
    country: "India",
    summary: "High-altitude roads, monasteries, and trekking routes.",
    mapLat: "34.1526",
    mapLng: "77.5771",
    mapZoom: 8,
    imageUrl: "/uploads/destinations/seed-ladakh.svg",
    imageKey: "destinations/seed-ladakh.svg",
    imageDriver: "local",
  },
  {
    slug: "himachal",
    name: "Himachal Pradesh",
    region: "Himachal Pradesh",
    country: "India",
    summary: "Hill stations, passes, and multi-day treks.",
    mapLat: "31.1048",
    mapLng: "77.1734",
    mapZoom: 8,
    imageUrl: "/uploads/destinations/seed-himachal.svg",
    imageKey: "destinations/seed-himachal.svg",
    imageDriver: "local",
  },
  {
    slug: "goa",
    name: "Goa",
    region: "Goa",
    country: "India",
    summary: "Coastal stays, rides, and short escapes.",
    mapLat: "15.2993",
    mapLng: "74.1240",
    mapZoom: 9,
    imageUrl: "/uploads/destinations/seed-goa.svg",
    imageKey: "destinations/seed-goa.svg",
    imageDriver: "local",
  },
  {
    slug: "kerala",
    name: "Kerala",
    region: "Kerala",
    country: "India",
    summary: "Backwaters, hills, and slow travel in the south.",
    mapLat: "9.9312",
    mapLng: "76.2673",
    mapZoom: 8,
    imageUrl: "/uploads/destinations/seed-kerala.svg",
    imageKey: "destinations/seed-kerala.svg",
    imageDriver: "local",
  },
  {
    slug: "thailand",
    name: "Thailand",
    region: "Thailand",
    country: "Thailand",
    summary: "City breaks, islands, and overland routes.",
    mapLat: "13.7563",
    mapLng: "100.5018",
    mapZoom: 6,
    imageUrl: "/uploads/destinations/seed-thailand.svg",
    imageKey: "destinations/seed-thailand.svg",
    imageDriver: "local",
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    region: "Vietnam",
    country: "Vietnam",
    summary: "Coast, highlands, and north-to-south journeys.",
    mapLat: "21.0278",
    mapLng: "105.8342",
    mapZoom: 6,
    imageUrl: "/uploads/destinations/seed-vietnam.svg",
    imageKey: "destinations/seed-vietnam.svg",
    imageDriver: "local",
  },
];

const places = [
  {
    slug: "pahalgam",
    name: "Pahalgam",
    parentSlug: "kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Meadows and river valleys south of Srinagar.",
    mapLat: "34.0161",
    mapLng: "75.3150",
    mapZoom: 12,
    imageUrl: "/uploads/destinations/seed-pahalgam.svg",
    imageKey: "destinations/seed-pahalgam.svg",
    imageDriver: "local",
  },
  {
    slug: "gulmarg",
    name: "Gulmarg",
    parentSlug: "kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary: "Meadows and the gondola above the Kashmir valley.",
    mapLat: "34.0484",
    mapLng: "74.3805",
    mapZoom: 12,
    imageUrl: "/uploads/destinations/seed-gulmarg.svg",
    imageKey: "destinations/seed-gulmarg.svg",
    imageDriver: "local",
  },
];

const operationsPermissions: StaffPermission[] = [
  "destinations.view",
  "tours.view",
  "tours.manage",
  "bookings.view",
  "bookings.manage",
  "customers.view",
];

const testUsers = [
  {
    email: "admin@travel.test",
    password: "Admin@12345",
    name: "Asha Admin",
    roleKey: "admin",
  },
  {
    email: "staff@travel.test",
    password: "Staff@12345",
    name: "Sameer Staff",
    roleKey: "operations",
  },
  {
    email: "customer@travel.test",
    password: "Customer@12345",
    name: "Kiran Customer",
    roleKey: "customer",
  },
];

async function seedDestinations() {
  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: destination,
      create: destination,
    });
  }

  for (const place of places) {
    const { parentSlug, ...data } = place;
    const parent = await prisma.destination.findUnique({
      where: { slug: parentSlug },
      select: { id: true },
    });
    if (!parent) continue;
    await prisma.destination.upsert({
      where: { slug: place.slug },
      update: { ...data, parentId: parent.id },
      create: { ...data, parentId: parent.id },
    });
  }
}

async function seedTours() {
  const kashmir = await prisma.destination.findUnique({ where: { slug: "kashmir" } });
  const ladakh = await prisma.destination.findUnique({ where: { slug: "ladakh" } });
  if (!kashmir || !ladakh) return;

  const tours = [
    {
      slug: "kashmir-valley-trek",
      title: "Kashmir Valley trek",
      summary: "Meadows, alpine lakes, and village stays above Srinagar.",
      description: "A guided trek through the Kashmir valley with camping nights and local support.",
      durationDays: 6,
      difficulty: "moderate",
      maxGroupSize: 12,
      priceFrom: 28500,
      imageUrl: "/uploads/tours/seed-kashmir-trek.svg",
      imageKey: "tours/seed-kashmir-trek.svg",
      imageDriver: "local",
      published: true,
      destinationId: kashmir.id,
    },
    {
      slug: "ladakh-monastery-ride",
      title: "Ladakh monastery ride",
      summary: "High passes, monasteries, and desert valleys around Leh.",
      description: "A paced road trip covering Leh, Hemis, and Pangong with acclimatization days.",
      durationDays: 8,
      difficulty: "challenging",
      maxGroupSize: 10,
      priceFrom: 42000,
      imageUrl: "/uploads/tours/seed-ladakh-ride.svg",
      imageKey: "tours/seed-ladakh-ride.svg",
      imageDriver: "local",
      published: true,
      destinationId: ladakh.id,
    },
  ];

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: tour,
      create: tour,
    });
  }
}

async function seedRoles() {
  await prisma.role.upsert({
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

  const customer = await prisma.role.upsert({
    where: { key: "customer" },
    update: { name: "Customer", scope: "customer", isSystem: true },
    create: {
      key: "customer",
      name: "Customer",
      scope: "customer",
      isSystem: true,
    },
  });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: customer.id } }),
    prisma.rolePermission.createMany({
      data: customerPermissions.map((permission) => ({
        roleId: customer.id,
        permission,
      })),
    }),
  ]);

  const operations = await prisma.role.findUnique({
    where: { key: "operations" },
  });
  if (!operations) {
    await prisma.role.create({
      data: {
        key: "operations",
        name: "Operations staff",
        scope: "staff",
        permissions: {
          create: operationsPermissions.map((permission) => ({ permission })),
        },
      },
    });
  }
}

async function seedAdminFromEnv() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  const name =
    (process.env.SEED_ADMIN_NAME ?? "Administrator").trim() || "Administrator";

  if (!email || !password) {
    console.log(
      "No production admin created. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, then run seed again.",
    );
    return;
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const role = await prisma.role.findUniqueOrThrow({
    where: { key: "admin" },
  });

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await hashPassword(password);

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
    return;
  }

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

async function seedTestUsers() {
  for (const testUser of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existing) continue;

    const role = await prisma.role.findUniqueOrThrow({
      where: { key: testUser.roleKey },
    });
    await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        passwordHash: await hashPassword(testUser.password),
        roleId: role.id,
      },
    });
  }

  const customer = await prisma.user.findUniqueOrThrow({
    where: { email: "customer@travel.test" },
  });

  const sampleBookings = [
    {
      reference: "BK-SAMPLE-ENQ",
      module: "tour",
      status: "enquiry",
      title: "Markha Valley trek enquiry",
      guests: 2,
      notes: "Two people, prefer the second half of June.",
    },
    {
      reference: "BK-SAMPLE-CNF",
      module: "hotel",
      status: "confirmed",
      title: "Houseboat stay in Srinagar",
      guests: 2,
      amount: 18000,
      notes: "Two nights on Dal Lake.",
    },
  ];

  for (const booking of sampleBookings) {
    await prisma.booking.upsert({
      where: { reference: booking.reference },
      update: {},
      create: {
        ...booking,
        contactName: customer.name,
        contactEmail: customer.email,
        userId: customer.id,
      },
    });
  }
}

async function main() {
  await seedDestinations();
  await seedTours();
  await seedRoles();
  const { ensureRentalDefaults } = await import("../src/lib/rentals/defaults");
  await ensureRentalDefaults();

  if (process.env.NODE_ENV === "production") {
    await seedAdminFromEnv();
    return;
  }

  await seedTestUsers();
  console.log("Test accounts:");
  for (const user of testUsers) {
    console.log(`  ${user.roleKey.padEnd(10)} ${user.email} / ${user.password}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
