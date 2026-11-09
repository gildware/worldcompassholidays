import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hotels = await prisma.hotel.findMany({
    where: { published: true },
    select: {
      slug: true,
      name: true,
      imageUrl: true,
      galleryJson: true,
      destination: { select: { slug: true } },
      rooms: { select: { name: true, imageUrl: true } },
    },
    orderBy: { slug: "asc" },
  });

  for (const hotel of hotels) {
    let gallery: { url?: string }[] = [];
    try {
      gallery = JSON.parse(hotel.galleryJson || "[]") as { url?: string }[];
    } catch {
      gallery = [];
    }
    const urls = [hotel.imageUrl, ...gallery.map((item) => item.url)].filter(Boolean) as string[];
    const unique = new Set(urls);
    const rooms = hotel.rooms
      .map((room) => `${room.name}:${room.imageUrl ? "yes" : "no"}`)
      .join(", ");
    console.log(
      [
        hotel.slug,
        hotel.destination?.slug || "-",
        `g=${gallery.length}`,
        `uniq=${unique.size}/${urls.length}`,
        `rooms=${hotel.rooms.length}`,
        rooms || "-",
      ].join("\t"),
    );
  }
  console.log("TOTAL", hotels.length);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
