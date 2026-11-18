import { notFound } from "next/navigation";
import { CarListV1 } from "@/components/car-list/car-list-v1/CarListV1";
import type { CarListCard, CarListLocation } from "@/components/car-list/types";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { favoriteIds } from "@/lib/favorites";
import type { FavoriteKind } from "@/lib/favorite-kinds";
import { getUserLocale } from "@/i18n/get-locale";
import { loadCopyMap, translated, withNameCopy, withPlaceCopy, withVehicleCopy } from "@/lib/i18n/content";
import { fleetPhotoUrl, isCatalogPlaceholder, resolveRideCover } from "@/lib/catalog-media";
import { fleetKinds } from "@/lib/rentals/labels";
import { logListingSearch } from "@/lib/search/log";
import { cached } from "@/lib/ttl-cache";

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

  const params = await searchParams;
  const kinds = fleetKinds();
  const requestedKind = one(params.kind);
  const kind =
    lockedKind ??
    (kinds.includes(requestedKind as "car" | "bike") ? (requestedKind as "car" | "bike") : "");
  const [vehicles, rentalLocations, freeCancellation, user] = await Promise.all([
    cached(`rentals:${kind || "all"}`, 20_000, () =>
      prisma.vehicle.findMany({
        where: {
          published: true,
          kind: kind ? kind : { in: kinds },
          status: { not: "inactive" },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          kind: true,
          brand: true,
          seats: true,
          luggage: true,
          doors: true,
          includedKmPerDay: true,
          pricePerDay: true,
          currency: true,
          securityDeposit: true,
          vehicleType: { select: { id: true, name: true } },
          fuelType: { select: { id: true, name: true } },
          transmission: { select: { id: true, name: true } },
          destination: { select: { id: true, name: true, summary: true } },
          images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
          features: {
            select: { config: { select: { id: true, name: true, kind: true, active: true, sortOrder: true } } },
          },
          locationLinks: {
            select: { location: { select: { id: true, name: true, active: true, fleet: true } } },
          },
        },
        orderBy: [{ pricePerDay: "asc" }, { name: "asc" }],
      }),
    ),
    cached(`rental-locations:${kind || "all"}`, 20_000, () =>
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
    ),
    cached(`rental-free-cancel:${kind || "all"}`, 20_000, () =>
      prisma.rentalPolicy.findFirst({
        where: { kind: "cancellation", active: true, refundPercent: 100, ...(kind ? { fleet: kind } : {}) },
        select: { id: true },
      }),
    ),
    getCurrentUser(),
  ]);
  const favoriteKind: FavoriteKind | FavoriteKind[] = kind === "bike" ? "bike" : kind === "car" ? "car" : ["car", "bike"];
  const savedIds = user?.scope === "customer" ? await favoriteIds(user.id, favoriteKind) : [];
  const locale = await getUserLocale();
  const configIds = [
    ...new Set(
      vehicles.flatMap((vehicle) => [
        vehicle.vehicleType?.id,
        vehicle.fuelType?.id,
        vehicle.transmission?.id,
        ...vehicle.features.map((feature) => feature.config.id),
      ]),
    ),
  ].filter((id): id is string => Boolean(id));
  const locationIds = [
    ...new Set([
      ...vehicles.flatMap((vehicle) => vehicle.locationLinks.map((link) => link.location.id)),
      ...rentalLocations.map((location) => location.id),
    ]),
  ];
  const [vehicleCopies, placeCopies, configCopies, locationCopies] = await Promise.all([
    loadCopyMap("vehicle", vehicles.map((vehicle) => vehicle.id), locale),
    loadCopyMap(
      "destination",
      vehicles.flatMap((vehicle) => (vehicle.destination ? [vehicle.destination.id] : [])),
      locale,
    ),
    loadCopyMap("rentalConfig", configIds, locale),
    loadCopyMap("rentalLocation", locationIds, locale),
  ]);

  const cars: CarListCard[] = vehicles.map((row) => {
    const vehicle = withVehicleCopy(row, vehicleCopies.get(row.id));
    const place = row.destination ? withPlaceCopy(row.destination, placeCopies.get(row.destination.id)) : null;
    const typeName = row.vehicleType
      ? withNameCopy(row.vehicleType, configCopies.get(row.vehicleType.id)).name
      : "";
    const fuelName = row.fuelType ? withNameCopy(row.fuelType, configCopies.get(row.fuelType.id)).name : "";
    const transmissionName = row.transmission
      ? withNameCopy(row.transmission, configCopies.get(row.transmission.id)).name
      : "";
    const linked = vehicle.features
      .map((feature) => feature.config)
      .filter((feature) => feature.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const features = linked
      .filter((feature) => feature.kind === "feature")
      .map((feature) => withNameCopy(feature, configCopies.get(feature.id)).name);
    const transmission = transmissionName;
    const pickupNames = vehicle.locationLinks
      .map((link) => link.location)
      .filter((location) => location.active && (!kind || location.fleet === vehicle.kind))
      .map((location) => translated(location.name, locationCopies.get(location.id)?.name));
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
      location: pickupNames[0] || place?.name || "",
      locations,
      category: typeName || (vehicle.kind === "bike" ? "Bike" : "Car"),
      brand: vehicle.brand,
      seats: vehicle.seats,
      luggage: vehicle.luggage ?? 0,
      transmission,
      mileage: vehicle.includedKmPerDay > 0 ? "Limited" : "Unlimited",
      mileageLabel: vehicle.includedKmPerDay > 0 ? `${vehicle.includedKmPerDay} km included` : "Unlimited km",
      fuel: fuelName,
      tags: linked
        .filter((feature) => feature.kind === "tag")
        .map((feature) => withNameCopy(feature, configCopies.get(feature.id)).name),
      specs,
      images: (() => {
        const live = [
          ...new Set(
            vehicle.images
              .map((image) => fleetPhotoUrl(image.url.trim()))
              .filter((url) => {
                if (!url || isCatalogPlaceholder(url)) return false;
                if (url.endsWith(".svg") || url.includes("/seed-")) return false;
                // Local seed drawings 404 in Docker; real studio photos under /vehicles/photos are fine locally.
                if (url.startsWith("/uploads/") && !url.includes("/vehicles/photos/")) return false;
                return true;
              }),
          ),
        ];
        if (live.length > 0) return live;
        const fallback = resolveRideCover({
          url: vehicle.images[0]?.url,
          slug: vehicle.slug,
          kind: vehicle.kind,
        });
        return fallback && !isCatalogPlaceholder(fallback) ? [fallback] : [];
      })(),
      price: vehicle.pricePerDay,
      currency: vehicle.currency || "INR",
      deposit: vehicle.securityDeposit,
      helmet: vehicle.kind === "bike" || linked.some((feature) => /helmet/i.test(feature.name)),
      freeCancellation: Boolean(freeCancellation),
    };
  });

  const locations: CarListLocation[] = rentalLocations.map((location) => ({
    id: location.id,
    name: translated(location.name, locationCopies.get(location.id)?.name),
    address: translated(location.address, locationCopies.get(location.id)?.address),
    lat: coord(location.mapLat),
    lng: coord(location.mapLng),
  }));

  const fleet = kind || (kinds.length === 1 ? kinds[0] : "mixed");
  logListingSearch(kind === "bike" ? "bikes" : "cars", params, {
    queryOverride: [one(params.q), one(params.name)].filter(Boolean).join(" · ") || undefined,
  });

  return (
    <CarListV1
      cars={cars}
      locations={locations}
      params={params}
      fleet={fleet === "bike" ? "bike" : fleet === "car" ? "car" : "mixed"}
      savedIds={savedIds}
      signedIn={user?.scope === "customer"}
    />
  );
}
