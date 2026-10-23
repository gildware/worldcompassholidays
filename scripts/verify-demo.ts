import { PrismaClient } from "@prisma/client";
import { ensureRentalDefaults } from "../src/lib/rentals/defaults";
import { runDemoCatalogSeed } from "./seed-demo-catalog";

async function main() {
  await ensureRentalDefaults();
  await runDemoCatalogSeed();

  const p = new PrismaClient();
  const tours = await p.tour.count({ where: { published: true } });
  const hotels = await p.hotel.count({ where: { published: true } });
  const cars = await p.vehicle.count({ where: { kind: "car", published: true } });
  const bikes = await p.vehicle.count({ where: { kind: "bike", published: true } });
  const dests = await p.destination.count({ where: { published: true } });
  const sampleTour = await p.tour.findFirst({
    where: { slug: "amarnath-yatra" },
    select: { title: true, imageUrl: true, galleryJson: true, category: true },
  });
  const sampleCar = await p.vehicle.findFirst({
    where: { slug: "toyota-fortuner" },
    include: { images: true },
  });
  console.log({
    tours,
    hotels,
    cars,
    bikes,
    dests,
    sampleTour,
    carImg: sampleCar?.images[0]?.url,
  });
  await p.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
