import type { Metadata } from "next";
import Link from "next/link";
import { VehicleForm, type VehicleFormValues } from "@/components/admin/rentals/VehicleForm";
import { requirePermission } from "@/lib/auth/guards";
import { fleetKinds } from "@/lib/rentals/labels";
import { modules } from "@/config/modules";
import { configsOf, getRentalSetup } from "@/lib/rentals/setup";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}): Promise<Metadata> {
  const { kind } = await searchParams;
  return { title: kind === "bike" ? "Add bike" : "Add car" };
}

type Kind = "car" | "bike";

function requestedKind(value: string | undefined): Kind | null {
  if (value === "car" && modules.cars) return "car";
  if (value === "bike" && modules.bikes) return "bike";
  return null;
}

const blank: VehicleFormValues = {
  name: "",
  registrationNumber: "",
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

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requirePermission("vehicles.manage");
  const { kind: requested } = await searchParams;
  const kinds = fleetKinds();
  const kind = requestedKind(requested) ?? kinds[0] ?? "car";
  const setup = await getRentalSetup(kind);
  const listHref = kind === "bike" ? "/admin/rentals/bikes" : "/admin/rentals/cars";
  const noun = kind === "bike" ? "bike" : "car";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Link href={listHref} className="text-xs font-medium text-brand hover:underline">
          ← All {noun}s
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Add {noun}</h1>
        <p className="mt-0.5 text-xs text-muted">
          Choose type, fuel, transmission, features, and add-ons from configuration.
        </p>
      </div>
      <VehicleForm
        lockKind
        values={{ ...blank, kind, seats: kind === "bike" ? "1" : "5" }}
        kinds={[kind]}
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
