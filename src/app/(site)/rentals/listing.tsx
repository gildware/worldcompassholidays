import { notFound } from "next/navigation";
import { CarListV1 } from "@/components/car-list/car-list-v1/CarListV1";
import type { CarListCard, CarListLocation } from "@/components/car-list/types";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { ensureRentalDefaults } from "@/lib/rentals/defaults";
import { fleetKinds } from "@/lib/rentals/labels";

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function coord(value: string) {
  const number = Number(value);
  return value.trim() && Number.isFinite(number) ? number : undefined;
}

function isAirConditioning(feature: string) {
  return /air|a\/c|climate|^ac$/i.test(feature.trim());
}

export async function RentalListing({
  searchParams,
  lockedKind,
}: {
  searchParams: Promise<Search>;
  lockedKind?: "car" | "bike";
}) {
  if (lockedKind === "car" && !modules.cars) notFound();
  if (lockedKind === "bike" && !modules.bikes) notFound();
  if (!lockedKind && !modules.cars && !modules.bikes) notFound();

  await ensureRentalDefaults();
  const params = await searchParams;
  const kinds = fleetKinds();
  const requestedKind = one(params.kind);
  const kind =
    lockedKind ??
    (kinds.includes(requestedKind as "car" | "bike") ? (requestedKind as "car" | "bike") : "");
  const locationId = one(params.location);
  const seats = Number(one(params.seats) || 0);

  const [vehicles, rentalLocations, freeCancellation] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        published: true,
        kind: kind ? kind : { in: kinds },
        status: { not: "inactive" },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        vehicleType: true,
        fuelType: true,
        transmission: true,
        features: { include: { config: true } },
        destination: { select: { id: true, name: true } },
        locationLinks: { include: { location: true } },
      },
      orderBy: [{ pricePerDay: "asc" }, { name: "asc" }],
    }),
    prisma.rentalLocation.findMany({
      where: {
        active: true,
        ...(kind ? { fleet: kind } : {}),
        vehicleLinks: {
          some: {
            vehicle: { published: true, status: { not: "inactive" }, ...(kind ? { kind } : {}) },
          },
        },
      },
      select: { id: true, name: true, address: true, mapLat: true, mapLng: true },
      orderBy: { name: "asc" },
    }),
    prisma.rentalPolicy.findFirst({
      where: { kind: "cancellation", active: true, refundPercent: 100, ...(kind ? { fleet: kind } : {}) },
      select: { id: true },
    }),
  ]);

  const cars: CarListCard[] = vehicles.map((vehicle) => {
    const linked = vehicle.features
      .map((feature) => feature.config)
      .filter((feature) => feature.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const features = linked.filter((feature) => feature.kind === "feature").map((feature) => feature.name);
    const transmission = vehicle.transmission?.name ?? "";
    const pickupNames = vehicle.locationLinks
      .map((link) => link.location)
      .filter((location) => location.active && (!kind || location.fleet === vehicle.kind))
      .map((location) => location.name);
    const locations = [...new Set(pickupNames)];
    const specs = [
      ...(features.some(isAirConditioning) ? ["With air conditioning"] : []),
      ...(/automatic/i.test(transmission) ? ["Automatic transmission"] : []),
      ...(/manual/i.test(transmission) ? ["Manual transmission"] : []),
      ...(vehicle.doors ? [`${vehicle.doors} doors`] : []),
      ...features.filter((feature) => !isAirConditioning(feature)),
    ];

    return {
      id: vehicle.id,
      slug: vehicle.slug,
      name: vehicle.name,
      kind: vehicle.kind,
      location: pickupNames[0] || vehicle.destination?.name || "",
      locations,
      category: vehicle.vehicleType?.name || (vehicle.kind === "bike" ? "Bike" : "Car"),
      brand: vehicle.brand,
      seats: vehicle.seats,
      luggage: vehicle.luggage ?? 0,
      transmission,
      mileage: vehicle.includedKmPerDay > 0 ? "Limited" : "Unlimited",
      mileageLabel: vehicle.includedKmPerDay > 0 ? `${vehicle.includedKmPerDay} km included` : "Unlimited km",
      fuel: vehicle.fuelType?.name ?? "",
      specs,
      images: vehicle.images.map((image) => image.url).filter(Boolean),
      price: vehicle.pricePerDay,
      currency: vehicle.currency || "INR",
      deposit: vehicle.securityDeposit,
      helmet: vehicle.kind === "bike" || linked.some((feature) => /helmet/i.test(feature.name)),
      freeCancellation: Boolean(freeCancellation),
    };
  });

  const locations: CarListLocation[] = rentalLocations.map((location) => ({
    id: location.id,
    name: location.name,
    address: location.address,
    lat: coord(location.mapLat),
    lng: coord(location.mapLng),
  }));

  const selectedLocation = rentalLocations.find((location) => location.id === locationId);
  const initialPickup = one(params.q).trim() || selectedLocation?.name || "";
  const fleet = kind || (kinds.length === 1 ? kinds[0] : "mixed");

  return (
    <CarListV1
      cars={cars}
      locations={locations}
      initialPickup={initialPickup}
      initialDropoff={one(params.dropoff)}
      initialPickupDate={one(params.pickup)}
      initialDropoffDate={one(params.return)}
      initialSeats={kind === "bike" ? 0 : Number.isFinite(seats) ? seats : 0}
      fleet={fleet === "bike" ? "bike" : fleet === "car" ? "car" : "mixed"}
    />
  );
}
