import type { Metadata } from "next";
import Link from "next/link";
import { VehicleForm, type VehicleFormValues } from "@/components/admin/rentals/VehicleForm";
import { requirePermission } from "@/lib/auth/guards";
import { fleetKinds } from "@/lib/rentals/labels";
import { configsOf, getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Add vehicle" };

const blank: VehicleFormValues = {
  name: "",
  kind: "car",
  brand: "",
  modelName: "",
  year: "",
  summary: "",
  description: "",
  destinationId: "",
  vehicleTypeId: "",
  fuelTypeId: "",
  transmissionId: "",
  seats: "5",
  doors: "",
  luggage: "",
  includedKmPerDay: "0",
  status: "available",
  published: false,
  allowCounterPickup: true,
  allowHomeDelivery: false,
  pricePerDay: "",
  pricePerWeek: "0",
  pricePerMonth: "0",
  securityDeposit: "0",
  extraKmCharge: "0",
  lateReturnCharge: "0",
  discountType: "none",
  discountValue: "0",
  featureIds: [],
  addonIds: [],
  locationIds: [],
  images: [],
};

export default async function NewVehiclePage() {
  await requirePermission("vehicles.manage");
  const setup = await getRentalSetup();
  const kinds = fleetKinds();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Link href="/admin/rentals/fleet" className="text-xs font-medium text-brand hover:underline">
          ← All vehicles
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Add vehicle</h1>
        <p className="mt-0.5 text-xs text-muted">
          Choose type, fuel, transmission, features, and add-ons from configuration.
        </p>
      </div>
      <VehicleForm
        values={{ ...blank, kind: kinds[0] ?? "car" }}
        kinds={kinds}
        destinations={setup.destinations}
        types={configsOf(setup.configs, "vehicle_type")}
        fuels={configsOf(setup.configs, "fuel")}
        transmissions={configsOf(setup.configs, "transmission")}
        features={configsOf(setup.configs, "feature")}
        addons={configsOf(setup.configs, "addon")}
        locations={setup.locations.filter((location) => location.active)}
        systemPickup={setup.settings.allowCounterPickup}
        systemDelivery={setup.settings.allowHomeDelivery}
      />
    </div>
  );
}
