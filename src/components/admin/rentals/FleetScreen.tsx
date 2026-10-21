import { FleetWorkspace } from "@/components/admin/rentals/FleetWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { expiryState } from "@/lib/rentals/availability";
import { ensureRentalDefaults } from "@/lib/rentals/defaults";

export async function FleetScreen({
  kind,
  searchParams,
}: {
  kind?: "car" | "bike";
  searchParams: Promise<{ deleted?: string; saved?: string; notice?: string }>;
}) {
  const user = await requirePermission("vehicles.view");
  await ensureRentalDefaults();
  const { deleted, saved, notice } = await searchParams;
  const [vehicles, locations] = await Promise.all([
    prisma.vehicle.findMany({
      where: kind ? { kind } : undefined,
      include: {
        vehicleType: { select: { name: true } },
        fuelType: { select: { name: true } },
        transmission: { select: { name: true } },
        destination: { select: { name: true } },
        locationLinks: { include: { location: { select: { id: true, name: true, fleet: true, active: true } } } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        documents: { select: { expiryDate: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.rentalLocation.findMany({
      where: kind ? { fleet: kind } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <FleetWorkspace
      fleet={kind}
      canManage={can(user, "vehicles.manage")}
      notice={deleted ? "deleted" : saved ? "saved" : null}
      error={notice ? decodeURIComponent(notice) : null}
      destinations={locations}
      vehicles={vehicles.map((vehicle) => {
        const expired = vehicle.documents.some((document) => expiryState(document.expiryDate) === "expired");
        const soon = vehicle.documents.some((document) => expiryState(document.expiryDate) === "soon");
        const places = vehicle.locationLinks
          .map((link) => link.location)
          .filter((location) => location.active && location.fleet === vehicle.kind);
        return {
          id: vehicle.id,
          slug: vehicle.slug,
          name: vehicle.name,
          registrationNumber: vehicle.registrationNumber,
          summary: vehicle.summary,
          imageUrl: vehicle.images[0]?.url ?? "",
          kind: vehicle.kind,
          typeName: vehicle.vehicleType?.name ?? "",
          destinationId: vehicle.destinationId,
          destinationIds: places.map((place) => place.id),
          destinationName: places.map((place) => place.name).join(", ") || vehicle.destination.name,
          seats: vehicle.seats,
          transmission: vehicle.transmission?.name ?? "",
          fuel: vehicle.fuelType?.name ?? "",
          pricePerDay: vehicle.pricePerDay,
          currency: vehicle.currency,
          published: vehicle.published,
          documentWarning: expired ? "expired" : soon ? "soon" : "",
        };
      })}
    />
  );
}
