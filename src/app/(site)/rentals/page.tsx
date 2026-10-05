import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleCard, type VehicleCardData } from "@/components/rentals/VehicleCard";
import { NamedMultiSelect, SearchableSelect } from "@/components/ui/SearchableSelect";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { parseDateTimeLocal } from "@/lib/rentals/dates";
import { fleetKinds, fleetLabel } from "@/lib/rentals/labels";
import { configsOf, getRentalSetup } from "@/lib/rentals/setup";
import { handoverModes, unavailableReason } from "@/lib/rentals/availability";
import { blockingBookingStatuses } from "@/lib/rentals/labels";

export const metadata: Metadata = { title: "Rentals" };

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function many(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!modules.cars && !modules.bikes) notFound();
  const params = await searchParams;
  const setup = await getRentalSetup();
  const kinds = fleetKinds();
  const requestedKind = one(params.kind);
  const kind = kinds.includes(requestedKind as "car" | "bike")
    ? (requestedKind as "car" | "bike")
    : "";
  const typeId = one(params.type);
  const fuelId = one(params.fuel);
  const transmissionId = one(params.transmission);
  const seats = Number(one(params.seats) || 0);
  const featureIds = many(params.feature);
  const query = one(params.q).trim();
  const pickupRaw = one(params.pickup);
  const returnRaw = one(params.return);
  const mode = one(params.mode);
  const locationId = one(params.location);
  const sort = one(params.sort) || "price_asc";
  const pickupAt = parseDateTimeLocal(pickupRaw);
  const returnAt = parseDateTimeLocal(returnRaw);
  const hasWindow = Boolean(pickupAt && returnAt && returnAt > pickupAt);

  const vehicles = await prisma.vehicle.findMany({
    where: {
      published: true,
      kind: kind ? kind : { in: kinds },
      status: { not: "inactive" },
      vehicleTypeId: typeId || undefined,
      fuelTypeId: fuelId || undefined,
      transmissionId: transmissionId || undefined,
      seats: seats > 0 ? { gte: seats } : undefined,
      AND: [
        ...featureIds.map((id) => ({ features: { some: { configId: id } } })),
        query
          ? {
              OR: [
                { name: { contains: query } },
                { brand: { contains: query } },
                { modelName: { contains: query } },
              ],
            }
          : {},
      ],
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      vehicleType: true,
      fuelType: true,
      transmission: true,
      features: { include: { config: true } },
      locationLinks: true,
    },
    orderBy: sort === "name" ? { name: "asc" } : { pricePerDay: sort === "price_desc" ? "desc" : "asc" },
  });

  const ids = vehicles.map((vehicle) => vehicle.id);
  const [bookings, blocks] = hasWindow
    ? await Promise.all([
        prisma.rentalBooking.findMany({
          where: {
            vehicleId: { in: ids },
            status: { in: [...blockingBookingStatuses] },
            pickupAt: { lt: returnAt! },
            returnAt: { gt: pickupAt! },
          },
          select: { vehicleId: true, reference: true },
        }),
        prisma.vehicleBlock.findMany({
          where: {
            vehicleId: { in: ids },
            startAt: { lt: returnAt! },
            endAt: { gt: pickupAt! },
          },
          select: { vehicleId: true, kind: true },
        }),
      ])
    : [[], []];

  const bookParams = new URLSearchParams();
  if (pickupRaw) bookParams.set("pickup", pickupRaw);
  if (returnRaw) bookParams.set("return", returnRaw);
  if (mode) bookParams.set("mode", mode);
  if (locationId) bookParams.set("location", locationId);

  const cards: VehicleCardData[] = vehicles.flatMap((vehicle) => {
    const modes = handoverModes({
      systemPickup: setup.settings.allowCounterPickup,
      systemDelivery: setup.settings.allowHomeDelivery,
      vehiclePickup: vehicle.allowCounterPickup,
      vehicleDelivery: vehicle.allowHomeDelivery,
    });
    if (mode === "counter" && !modes.counter) return [];
    if (mode === "delivery" && !modes.delivery) return [];
    if (mode === "counter" && locationId && vehicle.locationLinks.length > 0) {
      if (!vehicle.locationLinks.some((link) => link.locationId === locationId)) return [];
    }
    const reason = hasWindow
      ? unavailableReason({
          status: vehicle.status,
          bookings: bookings.filter((booking) => booking.vehicleId === vehicle.id),
          blocks: blocks.filter((block) => block.vehicleId === vehicle.id),
        })
      : vehicle.status === "available"
        ? null
        : unavailableReason({ status: vehicle.status, bookings: [], blocks: [] });
    const bookable = hasWindow ? !reason && vehicle.status === "available" : vehicle.status === "available";
    return [
      {
        slug: vehicle.slug,
        name: vehicle.name,
        kind: vehicle.kind,
        typeName: vehicle.vehicleType?.name ?? "",
        seats: vehicle.seats,
        transmission: vehicle.transmission?.name ?? "",
        fuel: vehicle.fuelType?.name ?? "",
        features: vehicle.features
          .map((feature) => feature.config)
          .filter((feature) => feature.active)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((feature) => feature.name),
        pricePerDay: vehicle.pricePerDay,
        currency: vehicle.currency,
        imageUrl: vehicle.images[0]?.url ?? "",
        availability: hasWindow
          ? reason ?? "Available for these dates"
          : vehicle.status === "available"
            ? "Add dates to confirm availability"
            : reason ?? "Unavailable",
        bookable: Boolean(bookable && (hasWindow || vehicle.status === "available")),
        bookHref: `/rentals/${vehicle.slug}/book${bookParams.toString() ? `?${bookParams}` : ""}`,
      },
    ];
  });

  const types = configsOf(setup.configs, "vehicle_type", true);
  const fuels = configsOf(setup.configs, "fuel", true);
  const transmissions = configsOf(setup.configs, "transmission", true);
  const features = configsOf(setup.configs, "feature", true);
  const locations = setup.locations.filter((location) => location.active);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm font-medium tracking-wide text-brand uppercase">Rentals</p>
      <h1 className="mt-2 text-3xl font-semibold">Find a car or bike</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Choose pickup and return times, then filter the fleet. The price you confirm is saved with the booking.
      </p>

      <form method="get" className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm md:col-span-2">
          Search
          <input name="q" defaultValue={query} placeholder="Name, brand, or model" />
        </label>
        <label className="grid gap-1 text-sm">
          Fleet
          <SearchableSelect
            name="kind"
            defaultValue={kind}
            emptyLabel="All"
            ariaLabel="Fleet"
            searchPlaceholder="Search fleet"
            className="!h-10"
            options={kinds.map((item) => ({ value: item, label: `${fleetLabel(item)}s` }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Sort
          <SearchableSelect
            name="sort"
            defaultValue={sort || "price_asc"}
            ariaLabel="Sort"
            searchPlaceholder="Search sort"
            className="!h-10"
            options={[
              { value: "price_asc", label: "Price, low to high" },
              { value: "price_desc", label: "Price, high to low" },
              { value: "name", label: "Name" },
            ]}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Pickup
          <input name="pickup" type="datetime-local" defaultValue={pickupRaw} />
        </label>
        <label className="grid gap-1 text-sm">
          Return
          <input name="return" type="datetime-local" defaultValue={returnRaw} />
        </label>
        <label className="grid gap-1 text-sm">
          Handover
          <SearchableSelect
            name="mode"
            defaultValue={mode}
            emptyLabel="Any"
            ariaLabel="Handover"
            searchPlaceholder="Search handover"
            className="!h-10"
            options={[
              ...(setup.settings.allowCounterPickup
                ? [{ value: "counter", label: "Pick up at a location" }]
                : []),
              ...(setup.settings.allowHomeDelivery
                ? [{ value: "delivery", label: "Deliver to me" }]
                : []),
            ]}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Location
          <SearchableSelect
            name="location"
            defaultValue={locationId}
            emptyLabel="Any location"
            ariaLabel="Location"
            searchPlaceholder="Search locations"
            className="!h-10"
            options={locations.map((location) => ({
              value: location.id,
              label: location.name,
            }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Type
          <SearchableSelect
            name="type"
            defaultValue={typeId}
            emptyLabel="Any"
            ariaLabel="Vehicle type"
            searchPlaceholder="Search vehicle types"
            className="!h-10"
            options={types.map((item) => ({ value: item.id, label: item.name }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Fuel
          <SearchableSelect
            name="fuel"
            defaultValue={fuelId}
            emptyLabel="Any"
            ariaLabel="Fuel"
            searchPlaceholder="Search fuel types"
            className="!h-10"
            options={fuels.map((item) => ({ value: item.id, label: item.name }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Transmission
          <SearchableSelect
            name="transmission"
            defaultValue={transmissionId}
            emptyLabel="Any"
            ariaLabel="Transmission"
            searchPlaceholder="Search transmissions"
            className="!h-10"
            options={transmissions.map((item) => ({ value: item.id, label: item.name }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Minimum seats
          <input name="seats" type="number" min={1} defaultValue={seats || ""} />
        </label>
        <label className="grid gap-1 text-sm md:col-span-4">
          Features
          <NamedMultiSelect
            name="feature"
            defaultValues={featureIds}
            placeholder="Any features"
            searchPlaceholder="Search features"
            ariaLabel="Features"
            options={features.map((feature) => ({ value: feature.id, label: feature.name }))}
          />
        </label>
        <div className="md:col-span-4">
          <button type="submit" className="h-11 rounded-lg bg-brand px-5 text-sm font-medium text-white">
            Search rentals
          </button>
        </div>
      </form>

      {cards.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-white px-5 py-10 text-sm text-muted">
          No vehicles match this search.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((vehicle) => (
            <li key={vehicle.slug}>
              <VehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
