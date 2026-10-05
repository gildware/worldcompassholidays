import type { Metadata } from "next";
import { deleteRentalPolicy, saveRentalPolicy, saveRentalSettings } from "@/actions/rental-admin";
import { ActionForm } from "@/components/rentals/ActionForm";
import { Field } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Rental rules" };

export default async function RentalPoliciesPage() {
  const user = await requirePermission("vehicles.view");
  const setup = await getRentalSetup();
  const manage = can(user, "vehicles.manage");
  const rules = setup.policies.filter((policy) => policy.kind === "rule");
  const cancellations = setup.policies.filter((policy) => policy.kind === "cancellation");

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Rules and cancellation</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pickup and delivery can be allowed for the whole company here, then turned on or off for each vehicle. Tax is applied by the server when a booking is priced.
        </p>
      </div>
      {manage ? (
        <ActionForm action={saveRentalSettings} className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allowCounterPickup" defaultChecked={setup.settings.allowCounterPickup} />
            Allow pickup at a location
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allowHomeDelivery" defaultChecked={setup.settings.allowHomeDelivery} />
            Allow delivery to the customer
          </label>
          <Field label="Tax percent">
            <input name="taxPercent" type="number" min={0} max={100} defaultValue={setup.settings.taxPercent} />
          </Field>
          <SubmitButton pendingLabel="Saving">Save settings</SubmitButton>
        </ActionForm>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-2">
        <PolicyColumn title="Rental rules" kind="rule" policies={rules} manage={manage} />
        <PolicyColumn title="Cancellation windows" kind="cancellation" policies={cancellations} manage={manage} />
      </section>
    </div>
  );
}

function PolicyColumn({
  title,
  kind,
  policies,
  manage,
}: {
  title: string;
  kind: "rule" | "cancellation";
  policies: {
    id: string;
    name: string;
    description: string;
    active: boolean;
    hoursBeforePickup: number | null;
    refundPercent: number;
  }[];
  manage: boolean;
}) {
  return (
    <div className="grid content-start gap-3">
      <h2 className="font-semibold">{title}</h2>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white text-sm">
        {policies.map((policy) => (
          <li key={policy.id} className="px-4 py-3">
            <p className="font-medium">
              {policy.name} {!policy.active ? <span className="text-muted">(inactive)</span> : null}
            </p>
            <p className="text-muted">{policy.description}</p>
            {kind === "cancellation" ? (
              <p className="mt-1 text-muted">
                At least {policy.hoursBeforePickup ?? 0} hours before pickup · {policy.refundPercent}% refund
              </p>
            ) : null}
            {manage ? (
              <ActionForm action={deleteRentalPolicy} className="mt-2">
                <input type="hidden" name="id" value={policy.id} />
                <SubmitButton variant="danger" pendingLabel="Deleting">
                  Delete
                </SubmitButton>
              </ActionForm>
            ) : null}
          </li>
        ))}
      </ul>
      {manage ? (
        <ActionForm action={saveRentalPolicy} className="grid gap-3 rounded-xl border border-line bg-white p-4">
          <input type="hidden" name="kind" value={kind} />
          <Field label="Name" required>
            <input name="name" required />
          </Field>
          <Field label="Description" required>
            <textarea name="description" required className="min-h-20" />
          </Field>
          {kind === "cancellation" ? (
            <>
              <Field label="Hours before pickup" hint="Customers at or beyond this many hours get this refund.">
                <input name="hoursBeforePickup" type="number" min={0} defaultValue={24} />
              </Field>
              <Field label="Refund percent">
                <input name="refundPercent" type="number" min={0} max={100} defaultValue={0} />
              </Field>
            </>
          ) : null}
          <Field label="Sort order">
            <input name="sortOrder" type="number" min={0} defaultValue={0} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            Active
          </label>
          <SubmitButton pendingLabel="Saving">Add</SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
