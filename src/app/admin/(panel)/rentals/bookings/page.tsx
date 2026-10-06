import type { Metadata } from "next";
import { BookingsWorkspace } from "@/components/admin/rentals/BookingsWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Rental bookings" };

export default async function RentalBookingsPage() {
  await requirePermission("vehicles.view");
  const [vehicles, types] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: { name: "asc" },
      include: {
        vehicleType: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        rentalBookings: {
          orderBy: { pickupAt: "desc" },
          select: {
            id: true,
            reference: true,
            status: true,
            contactName: true,
            pickupAt: true,
            returnAt: true,
            amountDue: true,
            currency: true,
            vehicleId: true,
          },
        },
      },
    }),
    prisma.rentalConfig.findMany({
      where: { kind: "vehicle_type", active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <BookingsWorkspace
      types={types}
      vehicles={vehicles.map((vehicle) => ({
        id: vehicle.id,
        name: vehicle.name,
        registrationNumber: vehicle.registrationNumber,
        kind: vehicle.kind,
        typeId: vehicle.vehicleType?.id ?? "",
        typeName: vehicle.vehicleType?.name ?? "",
        imageUrl: vehicle.images[0]?.url ?? "",
      }))}
      bookings={vehicles.flatMap((vehicle) =>
        vehicle.rentalBookings.map((booking) => ({
          id: booking.id,
          reference: booking.reference,
          status: booking.status,
          contactName: booking.contactName,
          pickupAt: booking.pickupAt.toISOString(),
          returnAt: booking.returnAt.toISOString(),
          amountDue: booking.amountDue,
          currency: booking.currency,
          vehicleId: booking.vehicleId,
        })),
      )}
    />
  );
}
