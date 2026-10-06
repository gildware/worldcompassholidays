import type { Metadata } from "next";
import { AvailabilityWorkspace } from "@/components/admin/rentals/AvailabilityWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { blockingBookingStatuses, bookingStatusLabels } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Fleet availability" };

export default async function AvailabilityPage() {
  await requirePermission("vehicles.view");
  const [vehicles, types] = await Promise.all([
    prisma.vehicle.findMany({
      include: {
        vehicleType: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        rentalBookings: {
          where: { status: { in: [...blockingBookingStatuses] } },
          select: { id: true, reference: true, status: true, pickupAt: true, returnAt: true },
        },
        blocks: { select: { id: true, kind: true, reason: true, startAt: true, endAt: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.rentalConfig.findMany({
      where: { kind: "vehicle_type", active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AvailabilityWorkspace
      types={types}
      vehicles={vehicles.map((vehicle) => ({
        id: vehicle.id,
        name: vehicle.name,
        registrationNumber: vehicle.registrationNumber,
        kind: vehicle.kind,
        typeId: vehicle.vehicleType?.id ?? "",
        typeName: vehicle.vehicleType?.name ?? "",
        imageUrl: vehicle.images[0]?.url ?? "",
        status: vehicle.status,
        spans: [
          ...vehicle.rentalBookings.map((booking) => ({
            id: booking.id,
            kind: "booking" as const,
            label: booking.reference,
            detail: bookingStatusLabels[booking.status] ?? booking.status,
            start: booking.pickupAt.toISOString(),
            end: booking.returnAt.toISOString(),
          })),
          ...vehicle.blocks.map((block) => ({
            id: block.id,
            kind: block.kind === "maintenance" ? ("maintenance" as const) : ("hold" as const),
            label: block.reason || (block.kind === "maintenance" ? "Maintenance" : "Hold"),
            detail: block.kind === "maintenance" ? "Maintenance" : "Hold",
            start: block.startAt.toISOString(),
            end: block.endAt.toISOString(),
          })),
        ],
      }))}
    />
  );
}
