import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingCheckout } from "@/components/rentals/BookingCheckout";
import { NamedMultiSelect, SearchableSelect } from "@/components/ui/SearchableSelect";
import { PriceBreakdown } from "@/components/rentals/PriceBreakdown";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { handoverModes, unavailableReason } from "@/lib/rentals/availability";
import { findAvailabilityConflicts } from "@/lib/rentals/availability";
import { parseDateTimeLocal } from "@/lib/rentals/dates";
import { fleetKinds } from "@/lib/rentals/labels";
import { quoteRental } from "@/lib/rentals/pricing";
import { getRentalSetup } from "@/lib/rentals/setup";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function many(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export const metadata: Metadata = { title: "Book a rental" };

export default async function BookRentalPage({ params, searchParams }: Props) {
  if (!modules.cars && !modules.bikes) notFound();
  const { slug } = await params;
  const query = await searchParams;
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    include: {
      addonLinks: { include: { config: true } },
      locationLinks: { include: { location: true } },
    },
  });
  if (!vehicle || !vehicle.published || !fleetKinds().includes(vehicle.kind as "car" | "bike")) {
    notFound();
  }

  const setup = await getRentalSetup();
  const user = await getCurrentUser();
  const modes = handoverModes({
    systemPickup: setup.settings.allowCounterPickup,
    systemDelivery: setup.settings.allowHomeDelivery,
    vehiclePickup: vehicle.allowCounterPickup,
    vehicleDelivery: vehicle.allowHomeDelivery,
  });
  const locations =
    vehicle.locationLinks.length > 0
      ? vehicle.locationLinks.map((link) => link.location).filter((location) => location.active)
      : setup.locations.filter((location) => location.active);
  const addons = vehicle.addonLinks.map((link) => link.config).filter((addon) => addon.active);
  const pickup = one(query.pickup);
  const ret = one(query.return);
  const mode = one(query.mode) || (modes.counter ? "counter" : "delivery");
  const returnMode = one(query.returnMode) || mode;
  const location = one(query.location);
  const returnLocation = one(query.returnLocation);
  const address = one(query.address);
  const returnAddress = one(query.returnAddress);
  const same = one(query.same) !== "0";
  const selectedAddons = many(query.addon);
  const pickupAt = parseDateTimeLocal(pickup);
  const returnAt = parseDateTimeLocal(ret);

  let quoteError = "";
  let availabilityError = "";
  let quote = null as ReturnType<typeof quoteRental> | null;
  if (pickup && ret) {
    if (!pickupAt || !returnAt) quoteError = "Enter a valid pickup and return time.";
    else {
      try {
        quote = quoteRental({
          pickupAt,
          returnAt,
          pricePerDay: vehicle.pricePerDay,
          pricePerWeek: vehicle.pricePerWeek,
          pricePerMonth: vehicle.pricePerMonth,
          securityDeposit: vehicle.securityDeposit,
          extraKmCharge: vehicle.extraKmCharge,
          lateReturnCharge: vehicle.lateReturnCharge,
          includedKmPerDay: vehicle.includedKmPerDay,
          discountType: vehicle.discountType,
          discountValue: vehicle.discountValue,
          taxPercent: setup.settings.taxPercent,
          currency: vehicle.currency,
          addons: addons
            .filter((addon) => selectedAddons.includes(addon.id))
            .map((addon) => ({
              configId: addon.id,
              name: addon.name,
              price: addon.price,
              priceUnit: addon.priceUnit,
              quantity: 1,
            })),
        });
      } catch (error) {
        quoteError = error instanceof Error ? error.message : "Could not price this rental.";
      }
      if (quote) {
        const conflicts = await findAvailabilityConflicts({
          vehicleId: vehicle.id,
          pickupAt,
          returnAt,
        });
        availabilityError =
          unavailableReason({
            status: vehicle.status,
            bookings: conflicts.bookings,
            blocks: conflicts.blocks,
          }) ?? "";
      }
    }
  }

  const path = `/rentals/${vehicle.slug}/book?${new URLSearchParams({
    pickup,
    return: ret,
    mode,
    returnMode: same ? mode : returnMode,
    location,
    returnLocation: same ? location : returnLocation,
    address,
    returnAddress: same ? address : returnAddress,
    same: same ? "1" : "0",
    ...Object.fromEntries(selectedAddons.map((id, index) => [`addon${index}`, id])),
  }).toString()}`;
  const returnPath = `/rentals/${slug}/book?${new URLSearchParams(
    Object.entries({
      pickup,
      return: ret,
      mode,
      returnMode,
      location,
      returnLocation,
      address,
      returnAddress,
      same: same ? "1" : "0",
    }).filter((entry) => entry[1]),
  ).toString()}${selectedAddons.map((id) => `&addon=${encodeURIComponent(id)}`).join("")}`;

  const docTypes = setup.configs.filter(
    (item) =>
      item.kind === "customer_document" &&
      item.active &&
      (item.appliesTo === "all" || item.appliesTo === vehicle.kind),
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6">
        <div>
          <p className="text-sm text-brand">Book {vehicle.name}</p>
          <h1 className="mt-2 text-3xl font-semibold">Trip details</h1>
        </div>
        <form method="get" className="grid gap-4 rounded-2xl border border-line bg-white p-5">
          <label className="grid gap-1 text-sm">
            Pickup
            <input name="pickup" type="datetime-local" defaultValue={pickup} required />
          </label>
          <label className="grid gap-1 text-sm">
            Return
            <input name="return" type="datetime-local" defaultValue={ret} required />
          </label>
          <label className="grid gap-1 text-sm">
            Receive the vehicle
            <SearchableSelect
              name="mode"
              defaultValue={mode}
              ariaLabel="Receive the vehicle"
              searchPlaceholder="Search"
              className="!h-10"
              options={[
                ...(modes.counter ? [{ value: "counter", label: "Pick up at a location" }] : []),
                ...(modes.delivery ? [{ value: "delivery", label: "Deliver to my address" }] : []),
              ]}
            />
          </label>
          {modes.counter ? (
            <label className="grid gap-1 text-sm">
              Pickup location
              <SearchableSelect
                name="location"
                defaultValue={location}
                emptyLabel="Choose"
                ariaLabel="Pickup location"
                searchPlaceholder="Search locations"
                className="!h-10"
                options={locations.map((item) => ({ value: item.id, label: item.name }))}
              />
            </label>
          ) : null}
          {modes.delivery ? (
            <label className="grid gap-1 text-sm">
              Delivery address
              <textarea name="address" defaultValue={address} className="min-h-20" />
            </label>
          ) : null}
          <label className="grid gap-1 text-sm">
            Return
            <SearchableSelect
              name="same"
              defaultValue={same ? "1" : "0"}
              ariaLabel="Return"
              searchPlaceholder="Search"
              className="!h-10"
              options={[
                { value: "1", label: "Same place as pickup" },
                { value: "0", label: "A different place" },
              ]}
            />
          </label>
          {!same && modes.counter ? (
            <label className="grid gap-1 text-sm">
              Return location
              <SearchableSelect
                name="returnLocation"
                defaultValue={returnLocation}
                emptyLabel="Choose"
                ariaLabel="Return location"
                searchPlaceholder="Search locations"
                className="!h-10"
                options={locations.map((item) => ({ value: item.id, label: item.name }))}
              />
            </label>
          ) : null}
          {!same && modes.delivery ? (
            <label className="grid gap-1 text-sm">
              Return address
              <textarea name="returnAddress" defaultValue={returnAddress} className="min-h-20" />
            </label>
          ) : null}
          {addons.length > 0 ? (
            <label className="grid gap-1 text-sm">
              Add-ons
              <NamedMultiSelect
                name="addon"
                defaultValues={selectedAddons}
                placeholder="Choose add-ons"
                searchPlaceholder="Search add-ons"
                ariaLabel="Add-ons"
                options={addons.map((addon) => ({ value: addon.id, label: addon.name }))}
              />
            </label>
          ) : null}
          <button type="submit" className="h-11 rounded-lg border border-line text-sm font-medium">
            Update price
          </button>
        </form>
        <p className="text-xs text-muted">
          <Link href={`/rentals/${vehicle.slug}`} className="text-brand">
            Vehicle details
          </Link>
        </p>
      </div>
      <div className="grid content-start gap-4">
        {quoteError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{quoteError}</p> : null}
        {availabilityError ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{availabilityError}</p>
        ) : null}
        {quote ? <PriceBreakdown quote={quote} /> : <p className="text-sm text-muted">Choose dates to see the price.</p>}
        {quote && !availabilityError ? (
          <BookingCheckout
            signedIn={user?.scope === "customer"}
            returnPath={returnPath || path}
            vehicleId={vehicle.id}
            pickupAt={pickup}
            returnAt={ret}
            pickupMode={mode}
            returnMode={same ? mode : returnMode}
            pickupLocationId={location}
            returnLocationId={same ? location : returnLocation}
            deliveryAddress={address}
            returnAddress={same ? address : returnAddress}
            sameReturn={same}
            addonIds={selectedAddons}
            documents={docTypes.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              requiresNumber: item.requiresNumber,
              requiresIssueDate: item.requiresIssueDate,
              requiresExpiry: item.requiresExpiry,
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}
