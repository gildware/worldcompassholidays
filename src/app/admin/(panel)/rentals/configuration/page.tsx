import type { Metadata } from "next";
import { ConfigWorkspace, type ConfigRow } from "@/components/admin/rentals/ConfigWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { isRentalConfigKind } from "@/lib/rentals/labels";
import { getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Rental configuration" };

export default async function RentalConfigurationPage() {
  await requirePermission("vehicles.manage");
  const setup = await getRentalSetup();
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
        <h1 className="text-2xl font-semibold">Rental configuration</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          These lists are shared. Add a feature or document type once, then select it on each vehicle. Deactivate an item to hide it from new vehicles without erasing history.
        </p>
      </div>
      <ConfigWorkspace items={items} />
    </div>
  );
}
