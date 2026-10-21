import { ConfigWorkspace, type ConfigRow } from "@/components/admin/rentals/ConfigWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { isRentalConfigKind } from "@/lib/rentals/labels";
import { getRentalSetup } from "@/lib/rentals/setup";

const sharedKinds = ["vehicle_type", "fuel", "transmission", "included", "excluded", "feature"] as const;

export async function FleetConfigScreen({ fleet }: { fleet: "car" | "bike" }) {
  await requirePermission("vehicles.manage");
  const setup = await getRentalSetup(fleet);
  const noun = fleet === "bike" ? "bike" : "car";
  const kinds = fleet === "bike" ? ([...sharedKinds, "customer_document"] as const) : sharedKinds;
  const items: ConfigRow[] = setup.configs.flatMap((item) =>
    isRentalConfigKind(item.kind)
      ? [
          {
            id: item.id,
            kind: item.kind,
            name: item.name,
            description: item.description,
            appliesTo: item.appliesTo,
            active: item.active,
            sortOrder: item.sortOrder,
            price: item.price,
            priceUnit: item.priceUnit,
            requiresNumber: item.requiresNumber,
            requiresIssueDate: item.requiresIssueDate,
            requiresExpiry: item.requiresExpiry,
          },
        ]
      : [],
  );

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-navy">
          {noun === "bike" ? "Bike" : "Car"} configuration
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {`Add ${noun} types, fuel, transmission, included items, excluded items${
            fleet === "bike" ? ", features, and the documents a customer must upload" : ", and features"
          } here. Then choose them on each ${noun}.`}
        </p>
      </div>
      <ConfigWorkspace items={items} kinds={kinds} fleet={fleet} />
    </div>
  );
}
