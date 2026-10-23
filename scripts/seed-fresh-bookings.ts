/**
 * Creates one fresh enquiry/booking per desk type linked to customer@travel.test
 * (and a rental for the phone rider when fleet inventory exists).
 *
 * Usage: npx tsx scripts/seed-fresh-bookings.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.findUnique({
    where: { email: "customer@travel.test" },
  });
  if (!customer) throw new Error("customer@travel.test not found — run seed first.");

  const stamp = Date.now().toString(36).toUpperCase();
  const created: string[] = [];

  const tour = await prisma.tour.findFirst({
    where: { published: true },
    select: { slug: true, title: true },
  });
  if (tour) {
    const reference = `BK-QA-TOUR-${stamp}`;
    await prisma.booking.create({
      data: {
        reference,
        module: "tour",
        status: "enquiry",
        title: tour.title,
        startDate: new Date(Date.now() + 14 * 86400000),
        endDate: new Date(Date.now() + 18 * 86400000),
        guests: 2,
        notes: "Fresh QA tour enquiry from seed-fresh-bookings.",
        details: JSON.stringify({
          tourSlug: tour.slug,
          activity: [
            {
              at: new Date().toISOString(),
              status: "enquiry",
              message: "Enquiry received",
            },
          ],
        }),
        contactName: customer.name,
        contactEmail: customer.email,
        contactPhone: customer.phone || "+91 98765 00001",
        userId: customer.id,
      },
    });
    created.push(`tour ${reference}`);
  }

  const hotel = await prisma.hotel.findFirst({
    where: { published: true },
    select: { slug: true, name: true },
  });
  if (hotel) {
    const reference = `BK-QA-HOTEL-${stamp}`;
    await prisma.booking.create({
      data: {
        reference,
        module: "hotel",
        status: "enquiry",
        title: hotel.name,
        startDate: new Date(Date.now() + 21 * 86400000),
        endDate: new Date(Date.now() + 23 * 86400000),
        guests: 2,
        notes: "Fresh QA hotel request from seed-fresh-bookings.",
        details: JSON.stringify({
          hotelSlug: hotel.slug,
          rooms: 1,
          activity: [
            {
              at: new Date().toISOString(),
              status: "enquiry",
              message: "Enquiry received",
            },
          ],
        }),
        contactName: customer.name,
        contactEmail: customer.email,
        contactPhone: customer.phone || "+91 98765 00001",
        userId: customer.id,
      },
    });
    created.push(`hotel ${reference}`);
  }

  {
    const reference = `BK-QA-VISA-${stamp}`;
    await prisma.booking.create({
      data: {
        reference,
        module: "visa",
        status: "enquiry",
        title: "Visa assistance · Singapore",
        startDate: new Date(Date.now() + 30 * 86400000),
        guests: 1,
        notes: "Fresh QA visa enquiry from seed-fresh-bookings.",
        details: JSON.stringify({
          country: "Singapore",
          nationality: "Indian",
          visaType: "tourist",
          activity: [
            {
              at: new Date().toISOString(),
              status: "enquiry",
              message: "Enquiry received",
            },
          ],
        }),
        contactName: customer.name,
        contactEmail: customer.email,
        contactPhone: customer.phone || "+91 98765 00001",
        userId: customer.id,
      },
    });
    created.push(`visa ${reference}`);
  }

  {
    const reference = `BK-QA-ASSIST-${stamp}`;
    await prisma.booking.create({
      data: {
        reference,
        module: "assist",
        status: "enquiry",
        title: "Meet and assist · DEL T3",
        startDate: new Date(Date.now() + 10 * 86400000),
        guests: 2,
        notes: "Fresh QA meet & assist from seed-fresh-bookings.",
        details: JSON.stringify({
          airportCode: "DEL",
          airportName: "Indira Gandhi International",
          flightNumber: "AI101",
          activity: [
            {
              at: new Date().toISOString(),
              status: "enquiry",
              message: "Enquiry received",
            },
          ],
        }),
        contactName: customer.name,
        contactEmail: customer.email,
        contactPhone: customer.phone || "+91 98765 00001",
        userId: customer.id,
      },
    });
    created.push(`assist ${reference}`);
  }

  const rider =
    (await prisma.user.findFirst({
      where: { email: "916505550102@riders.worldcompass.local" },
    })) ?? customer;

  for (const kind of ["car", "bike"] as const) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { kind, published: true, status: "available" },
      select: { id: true, name: true, kind: true },
    });
    if (!vehicle) continue;
    const reference = `RN-QA-${kind.toUpperCase()}-${stamp}`;
    const pickupAt = new Date(Date.now() + 3 * 86400000);
    const returnAt = new Date(Date.now() + 5 * 86400000);
    await prisma.rentalBooking.create({
      data: {
        reference,
        vehicleId: vehicle.id,
        userId: rider.id,
        status: "pending",
        pickupAt,
        returnAt,
        pickupMode: "location",
        returnMode: "location",
        rentalDays: 2,
        baseAmount: kind === "car" ? 8000 : 3000,
        addonsAmount: 0,
        discountAmount: 0,
        taxAmount: 0,
        securityDeposit: kind === "car" ? 5000 : 2000,
        totalAmount: kind === "car" ? 8000 : 3000,
        amountDue: kind === "car" ? 13000 : 5000,
        pricingSnapshot: "{}",
        contactName: rider.name,
        contactEmail: rider.email,
        contactPhone: rider.phone || "",
        notes: `Fresh QA ${kind} rental from seed-fresh-bookings.`,
        events: {
          create: {
            status: "pending",
            message: "Booking request received (QA seed).",
            actorId: rider.id,
          },
        },
      },
    });
    created.push(`${kind} ${reference}`);
  }

  console.log("Created:");
  for (const line of created) console.log(` - ${line}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
