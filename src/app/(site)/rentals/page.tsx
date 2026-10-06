import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarListV1 } from "@/components/car-list/car-list-v1/CarListV1";
import type { CarListCard, CarListLocation } from "@/components/car-list/types";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { fleetKinds } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Rentals" };

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isAirConditioning(feature: string) {
  return /air|a\/c|climate|^ac$/i.test(feature.trim());
}

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!modules.cars && !modules.bikes) notFound();
  const params = await searchParams;
  const kinds = fleetKinds();
  const requestedKind = one(params.kind);
  const kind = kinds.includes(requestedKind as "car" | "bike")
    ? (requestedKind as "car" | "bike")
    : "";
  const locationId = one(params.location);
  const seats = Number(one(params.seats) || 0);

  const [vehicles, destinations, rentalLocations, freeCancellation] = await Promise.all([
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
        destination: { select: { id: true, name: true, region: true, country: true } },
        locationLinks: { include: { location: true } },
      },
      orderBy: [{ pricePerDay: "asc" }, { name: "asc" }],
    }),
    prisma.destination.findMany({
      where: { published: true, vehicles: { some: { published: true } } },
      select: { id: true, name: true, region: true, country: true },
      orderBy: { name: "asc" },
    }),
    prisma.rentalLocation.findMany({
      where: { active: true },
      select: { id: true, name: true, address: true },
      orderBy: { name: "asc" },
    }),
    prisma.rentalPolicy.findFirst({
      where: { kind: "cancellation", active: true, refundPercent: 100 },
      select: { id: true },
    }),
  ]);

  const cars: CarListCard[] = vehicles.map((vehicle) => {
    const features = vehicle.features
      .map((feature) => feature.config)
      .filter((feature) => feature.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((feature) => feature.name);
    const transmission = vehicle.transmission?.name ?? "";
    const pickupNames = vehicle.locationLinks
      .map((link) => link.location)
      .filter((location) => location.active)
      .map((location) => location.name);
    const locations = [...new Set([vehicle.destination?.name ?? "", ...pickupNames].filter(Boolean))];
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
      location: vehicle.destination?.name || pickupNames[0] || "",
      locations,
      category: vehicle.vehicleType?.name || (vehicle.kind === "bike" ? "Bike" : "Car"),
      brand: vehicle.brand,
      seats: vehicle.seats,
      luggage: vehicle.luggage ?? 0,
      transmission,
      mileage: vehicle.includedKmPerDay > 0 ? "Limited" : "Unlimited",
      mileageLabel: vehicle.includedKmPerDay > 0 ? `${vehicle.includedKmPerDay} km` : "Unlimited",
      fuel: vehicle.fuelType?.name ?? "",
      specs,
      images: vehicle.images.map((image) => image.url).filter(Boolean),
      price: vehicle.pricePerDay,
      currency: vehicle.currency || "INR",
      freeCancellation: Boolean(freeCancellation),
    };
  });

  const locationNames = new Set<string>();
  const locations: CarListLocation[] = [];
  destinations.forEach((destination) => {
    if (locationNames.has(destination.name)) return;
    locationNames.add(destination.name);
    locations.push({
      id: destination.id,
      name: destination.name,
      address: [destination.region, destination.country].filter(Boolean).join(", "),
    });
  });
  rentalLocations.forEach((location) => {
    if (locationNames.has(location.name)) return;
    locationNames.add(location.name);
    locations.push({
      id: location.id,
      name: location.name,
      address: location.address,
    });
  });

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
      initialSeats={Number.isFinite(seats) ? seats : 0}
      fleet={fleet === "bike" ? "bike" : fleet === "car" ? "car" : "mixed"}
    />
  );
}
