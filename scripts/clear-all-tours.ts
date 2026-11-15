import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = {
    tours: await prisma.tour.count(),
    days: await prisma.itineraryDay.count(),
    departures: await prisma.tourDeparture.count(),
    links: await prisma.tourDestination.count(),
  };
  console.log("before", before);

  const deleted = await prisma.tour.deleteMany({});

  const after = {
    tours: await prisma.tour.count(),
    days: await prisma.itineraryDay.count(),
    departures: await prisma.tourDeparture.count(),
    links: await prisma.tourDestination.count(),
  };
  console.log(`deleted tours: ${deleted.count}`);
  console.log("after", after);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
