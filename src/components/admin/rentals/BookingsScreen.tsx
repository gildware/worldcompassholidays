import { BookingsWorkspace } from "@/components/admin/rentals/BookingsWorkspace";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function BookingsScreen({ kind }: { kind: "car" | "bike" }) {
  const user = await requireStaff();
  if (!can(user, "vehicles.view") && !can(user, "bookings.view")) {
    redirect("/admin/no-access");
  }
  const [vehicles, types] = await Promise.all([
    prisma.vehicle.findMany({
      where: { kind },
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
      where: {
        kind: "vehicle_type",
        active: true,
        OR: [{ appliesTo: "all" }, { appliesTo: kind }],
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <BookingsWorkspace
      title={kind === "bike" ? "Bike bookings" : "Car bookings"}
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
