import type { Metadata } from "next";
import { RulesWorkspace } from "@/components/admin/rentals/RulesWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Rental rules" };

export default async function RentalPoliciesPage() {
  const user = await requirePermission("vehicles.view");
  const setup = await getRentalSetup();
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
      manage={can(user, "vehicles.manage")}
      allowCounterPickup={setup.settings.allowCounterPickup}
      allowHomeDelivery={setup.settings.allowHomeDelivery}
      rules={policies.filter((policy) => policy.kind === "rule")}
      cancellations={policies.filter((policy) => policy.kind === "cancellation")}
    />
  );
}
