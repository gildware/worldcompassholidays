"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { deleteRentalPolicy, saveRentalPolicy, saveRentalSettings } from "@/actions/rental-admin";
import { ActionForm } from "@/components/rentals/ActionForm";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";

type Policy = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  hoursBeforePickup: number | null;
  refundPercent: number;
};

const tabs = [
  { id: "rules", label: "Rental rules" },
  { id: "cancellation", label: "Cancellation windows" },
  { id: "settings", label: "Other settings" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function RulesWorkspace({
  rules,
  cancellations,
  allowCounterPickup,
  allowHomeDelivery,
  manage,
}: {
  rules: Policy[];
  cancellations: Policy[];
  allowCounterPickup: boolean;
  allowHomeDelivery: boolean;
  manage: boolean;
}) {
  const [tab, setTab] = useState<TabId>("rules");
  const [adding, setAdding] = useState(false);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold tracking-tight text-navy">Rules</h1>
      <div role="tablist" aria-label="Rental rules" className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setAdding(false);
                setTab(item.id);
              }}
              className={`inline-flex h-9 shrink-0 items-center border-b-2 px-3 text-sm font-medium ${
                selected ? "border-brand text-brand" : "border-transparent text-muted hover:text-navy"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {manage && tab !== "settings" ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => setAdding(true)}>
            Add
          </Button>
        </div>
      ) : null}

      {tab === "rules" ? (
        <PolicyPanel kind="rule" policies={rules} manage={manage} adding={adding} onClose={() => setAdding(false)} />
      ) : null}
      {tab === "cancellation" ? (
        <PolicyPanel
          kind="cancellation"
          policies={cancellations}
          manage={manage}
          adding={adding}
          onClose={() => setAdding(false)}
        />
      ) : null}
      {tab === "settings" ? (
        <section className="grid gap-3">
          <p className="max-w-2xl text-sm text-muted">
            Pickup and delivery can be allowed for the whole company here, then turned on or off for each vehicle.
          </p>
          {manage ? (
            <ActionForm action={saveRentalSettings} className="grid max-w-xl gap-3 rounded-xl border border-line bg-white p-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allowCounterPickup" defaultChecked={allowCounterPickup} />
                Allow pickup at a location
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allowHomeDelivery" defaultChecked={allowHomeDelivery} />
                Allow delivery to the customer
              </label>
              <SubmitButton pendingLabel="Saving">Save settings</SubmitButton>
            </ActionForm>
          ) : (
            <ul className="rounded-xl border border-line bg-white text-sm">
              <li className="px-4 py-3">Pickup at a location: {allowCounterPickup ? "Allowed" : "Off"}</li>
              <li className="border-t border-line px-4 py-3">Delivery to the customer: {allowHomeDelivery ? "Allowed" : "Off"}</li>
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

function PolicyPanel({
  kind,
  policies,
  manage,
  adding,
  onClose,
}: {
  kind: "rule" | "cancellation";
  policies: Policy[];
  manage: boolean;
  adding: boolean;
  onClose: () => void;
}) {
  return (
    <div className="grid content-start gap-3">
      <ul className="divide-y divide-line rounded-xl border border-line bg-white text-sm">
        {policies.length === 0 ? <li className="px-4 py-6 text-muted">Nothing here yet.</li> : null}
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
        <Modal
          open={adding}
          onClose={onClose}
          title={kind === "rule" ? "Add rental rule" : "Add cancellation window"}
          size="md"
        >
          {adding ? <AddPolicyForm kind={kind} onSaved={onClose} /> : null}
        </Modal>
      ) : null}
    </div>
  );
}

function AddPolicyForm({ kind, onSaved }: { kind: "rule" | "cancellation"; onSaved: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveRentalPolicy, initialFormState);

  useEffect(() => {
    if (!state.success) return;
    onSaved();
    router.refresh();
  }, [onSaved, router, state.success]);

  return (
    <form action={action} className="grid gap-3">
      <FormMessage state={state} />
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
      <SubmitButton pendingLabel="Saving" disabled={pending}>
        Add
      </SubmitButton>
    </form>
  );
}
