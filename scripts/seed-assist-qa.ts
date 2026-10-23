import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.booking.findFirst({ where: { module: "assist" } });
  if (existing) {
    console.log("assist exists", existing.reference);
    return;
  }
  const booking = await prisma.booking.create({
    data: {
      reference: "BK-ASSIST-QA",
      module: "assist",
      status: "enquiry",
      title: "Meet & assist · DEL T3",
      guests: 2,
      amount: 0,
      currency: "INR",
      notes: "Arrival meet for two adults.",
      details: JSON.stringify({ airport: "DEL T3", flightNumber: "AI101" }),
      contactName: "QA Assist Guest",
      contactEmail: "assist.qa@example.com",
      contactPhone: "+919876543210",
    },
  });
  console.log("created", booking.reference, booking.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
