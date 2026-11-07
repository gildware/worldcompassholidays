import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleView } from "@/components/admin/rentals/VehicleView";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { fleetKinds } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "View vehicle" };

export default async function AdminVehicleViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("vehicles.view");
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      destination: { include: { parent: { select: { name: true } } } },
      vehicleType: { select: { name: true } },
      fuelType: { select: { name: true } },
      transmission: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      features: {
        include: { config: { select: { kind: true, name: true } } },
      },
      addonLinks: {
        include: {
          config: { select: { name: true, price: true, priceUnit: true } },
        },
      },
      locationLinks: {
        include: {
          location: { select: { name: true, fleet: true, active: true } },
        },
      },
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
        },
      },
    },
  });
  if (!vehicle) notFound();

  const kind = fleetKinds().includes(vehicle.kind as "car" | "bike")
    ? (vehicle.kind as "car" | "bike")
    : "car";
  if (kind === "car" && !modules.cars) notFound();
  if (kind === "bike" && !modules.bikes) notFound();

  const named = (kindName: string) =>
    vehicle.features
      .filter((feature) => feature.config.kind === kindName)
      .map((feature) => feature.config.name);

  const locations = vehicle.locationLinks
    .map((link) => link.location)
    .filter((location) => location.active && location.fleet === vehicle.kind)
    .map((location) => location.name);

  return (
    <VehicleView
      canManage={can(user, "vehicles.manage")}
      vehicle={{
        id: vehicle.id,
        slug: vehicle.slug,
        name: vehicle.name,
        registrationNumber: vehicle.registrationNumber,
        kind,
        brand: vehicle.brand,
        modelName: vehicle.modelName,
        year: vehicle.year,
        summary: vehicle.summary,
        description: vehicle.description,
        typeName: vehicle.vehicleType?.name ?? "",
        transmission: vehicle.transmission?.name ?? "",
        fuel: vehicle.fuelType?.name ?? "",
        seats: vehicle.seats,
        doors: vehicle.doors,
        luggage: vehicle.luggage,
        includedKmPerDay: vehicle.includedKmPerDay,
        pricePerDay: vehicle.pricePerDay,
        pricePerWeek: vehicle.pricePerWeek,
        pricePerMonth: vehicle.pricePerMonth,
        securityDeposit: vehicle.securityDeposit,
        currency: vehicle.currency,
        status: vehicle.status,
        published: vehicle.published,
        allowCounterPickup: vehicle.allowCounterPickup,
        allowHomeDelivery: vehicle.allowHomeDelivery,
        destinationName: destinationChoiceLabel(
          vehicle.destination.name,
          vehicle.destination.parent?.name,
        ),
        locations,
        features: named("feature"),
        tags: named("tag"),
        included: named("included"),
        excluded: named("excluded"),
        addons: vehicle.addonLinks.map((link) => ({
          name: link.config.name,
          price: link.config.price,
          priceUnit: link.config.priceUnit,
        })),
        images: vehicle.images.map((image) => image.url).filter(Boolean),
        bookings: vehicle.rentalBookings.map((booking) => ({
          id: booking.id,
          reference: booking.reference,
          status: booking.status,
          contactName: booking.contactName,
          pickupAt: booking.pickupAt.toISOString(),
          returnAt: booking.returnAt.toISOString(),
          amountDue: booking.amountDue,
          currency: booking.currency,
        })),
      }}
    />
  );
}
