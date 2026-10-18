import { RulesWorkspace } from "@/components/admin/rentals/RulesWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { getRentalSetup } from "@/lib/rentals/setup";

export async function RulesScreen({ fleet }: { fleet: "car" | "bike" }) {
  const user = await requirePermission("vehicles.view");
  const setup = await getRentalSetup(fleet);
  const policies = setup.policies.map((policy) => ({
    id: policy.id,
    kind: policy.kind,
    name: policy.name,
    description: policy.description,
    active: policy.active,
    hoursBeforePickup: policy.hoursBeforePickup,
    refundPercent: policy.refundPercent,
  }));

  return (
    <RulesWorkspace
      fleet={fleet}
      manage={can(user, "vehicles.manage")}
      allowCounterPickup={setup.settings.allowCounterPickup}
      allowHomeDelivery={setup.settings.allowHomeDelivery}
      rules={policies.filter((policy) => policy.kind === "rule")}
      cancellations={policies.filter((policy) => policy.kind === "cancellation")}
    />
  );
}
