import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tours = await prisma.tour.findMany({
    where: { published: true },
    select: { slug: true, imageUrl: true, galleryJson: true },
    orderBy: { slug: "asc" },
  });
  const counts = new Map<string, string[]>();
  for (const tour of tours) {
    const gallery = JSON.parse(tour.galleryJson || "[]") as { url: string }[];
    console.log(`${tour.slug}\n  cover: ${tour.imageUrl}\n  gal: ${gallery.map((item) => item.url).join(", ")}`);
    const list = counts.get(tour.imageUrl) ?? [];
    list.push(tour.slug);
    counts.set(tour.imageUrl, list);
  }
  console.log("\n--- cover reuse ---");
  for (const [url, slugs] of [...counts.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${slugs.length}x ${url}`);
    if (slugs.length > 1) console.log("   ", slugs.join(", "));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
