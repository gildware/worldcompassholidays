import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.tour.count({
    where: {
      OR: [
        { imageUrl: { not: "" } },
        { featuredImageUrl: { not: "" } },
        { galleryJson: { not: "[]" } },
        { seoImageUrl: { not: "" } },
      ],
    },
  });
  const daysBefore = await prisma.itineraryDay.count({
    where: { OR: [{ imageUrl: { not: "" } }, { imageKey: { not: "" } }] },
  });
  console.log(`tours with images: ${before}`);
  console.log(`itinerary days with images: ${daysBefore}`);

  const tours = await prisma.tour.updateMany({
    data: {
      imageUrl: "",
      imageKey: "",
      imageDriver: "local",
      featuredImageUrl: "",
      featuredImageKey: "",
      featuredImageDriver: "local",
      galleryJson: "[]",
      seoImageUrl: "",
      seoImageKey: "",
      seoImageDriver: "local",
    },
  });

  const days = await prisma.itineraryDay.updateMany({
    data: {
      imageUrl: "",
      imageKey: "",
      imageDriver: "local",
    },
  });

  const after = await prisma.tour.count({
    where: {
      OR: [
        { imageUrl: { not: "" } },
        { featuredImageUrl: { not: "" } },
        { galleryJson: { not: "[]" } },
        { seoImageUrl: { not: "" } },
      ],
    },
  });
  const daysAfter = await prisma.itineraryDay.count({
    where: { OR: [{ imageUrl: { not: "" } }, { imageKey: { not: "" } }] },
  });

  console.log(`updated tours: ${tours.count}`);
  console.log(`updated itinerary days: ${days.count}`);
  console.log(`tours still with images: ${after}`);
  console.log(`days still with images: ${daysAfter}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
