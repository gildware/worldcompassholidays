"use client";

import { useState } from "react";
import {
  deleteRentalConfig,
  saveRentalConfig,
  setRentalConfigActive,
} from "@/actions/rental-admin";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  rentalConfigKindLabels,
  rentalConfigKinds,
  type RentalConfigKind,
} from "@/lib/rentals/labels";

export type ConfigRow = {
  id: string;
  kind: RentalConfigKind;
  name: string;
  description: string;
  appliesTo: string;
  active: boolean;
  sortOrder: number;
  price: number;
  priceUnit: string;
  requiresNumber: boolean;
  requiresIssueDate: boolean;
  requiresExpiry: boolean;
};

const empty: Omit<ConfigRow, "id" | "kind"> = {
  name: "",
  description: "",
  appliesTo: "all",
  active: true,
  sortOrder: 0,
  price: 0,
  priceUnit: "flat",
  requiresNumber: false,
  requiresIssueDate: false,
  requiresExpiry: false,
};

export function ConfigWorkspace({ items }: { items: ConfigRow[] }) {
  const [kind, setKind] = useState<RentalConfigKind>("vehicle_type");
  const [editing, setEditing] = useState<ConfigRow | null>(null);
  const rows = items.filter((item) => item.kind === kind);
  const value = editing ?? { ...empty, kind };
  const showPrice = kind === "addon";
  const showDocument = kind === "vehicle_document" || kind === "customer_document";

  return (
    <div className="grid gap-5">
      <div className="flex gap-2 overflow-x-auto">
        {rentalConfigKinds.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setKind(item);
              setEditing(null);
            }}
            className={[
              "shrink-0 rounded-full border px-3 py-1.5 text-sm",
              kind === item ? "border-brand bg-brand-soft font-medium text-brand" : "border-line bg-white",
            ].join(" ")}
          >
            {rentalConfigKindLabels[item]}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <ul className="divide-y divide-line rounded-xl border border-line bg-white">
          {rows.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">Nothing in this list yet.</li>
          ) : (
            rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {row.name}{" "}
                    {!row.active ? <span className="text-muted">(inactive)</span> : null}
                  </p>
                  <p className="text-muted">
                    {row.appliesTo === "all" ? "Cars and bikes" : row.appliesTo}
                    {row.kind === "addon" ? ` · ${row.price} ${row.priceUnit}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(row)}>
                    Edit
                  </Button>
                  <form action={setRentalConfigActive}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                    <Button type="submit" variant="secondary" size="sm">
                      {row.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="grid content-start gap-3">
        <ActionForm key={editing?.id ?? kind} action={saveRentalConfig} className="grid gap-3 rounded-xl border border-line bg-white p-4">
          <input type="hidden" name="kind" value={kind} />
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Name" required>
            <input name="name" defaultValue={value.name} required />
          </Field>
          <Field label="Description">
            <textarea name="description" defaultValue={value.description} className="min-h-20" />
          </Field>
          <Field label="Applies to">
            <SearchableSelect
              name="appliesTo"
              defaultValue={value.appliesTo}
              ariaLabel="Applies to"
              searchPlaceholder="Search"
              className="!h-10"
              options={[
                { value: "all", label: "Cars and bikes" },
                { value: "car", label: "Cars" },
                { value: "bike", label: "Bikes" },
              ]}
            />
          </Field>
          <Field label="Sort order">
            <input name="sortOrder" type="number" min={0} defaultValue={value.sortOrder} />
          </Field>
          {showPrice ? (
            <>
              <Field label="Price">
                <input name="price" type="number" min={0} defaultValue={value.price} />
              </Field>
              <Field label="Price unit">
                <SearchableSelect
                  name="priceUnit"
                  defaultValue={value.priceUnit}
                  ariaLabel="Price unit"
                  searchPlaceholder="Search price units"
                  className="!h-10"
                  options={[
                    { value: "flat", label: "Flat per rental" },
                    { value: "per_day", label: "Per day" },
                  ]}
                />
              </Field>
            </>
          ) : (
            <>
              <input type="hidden" name="price" value="0" />
              <input type="hidden" name="priceUnit" value="flat" />
            </>
          )}
          {showDocument ? (
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="requiresNumber" defaultChecked={value.requiresNumber} />
                Requires a number
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="requiresIssueDate" defaultChecked={value.requiresIssueDate} />
                Requires an issue date
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="requiresExpiry" defaultChecked={value.requiresExpiry} />
                Requires an expiry date
              </label>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={value.active} />
            Active
          </label>
          <div className="flex gap-2">
            <SubmitButton pendingLabel="Saving">{editing ? "Update" : "Add"}</SubmitButton>
            {editing ? (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Clear
              </Button>
            ) : null}
          </div>
        </ActionForm>
        {editing ? (
          <ActionForm action={deleteRentalConfig}>
            <input type="hidden" name="id" value={editing.id} />
            <SubmitButton variant="danger" pendingLabel="Deleting">
              Delete
            </SubmitButton>
          </ActionForm>
        ) : null}
        </div>
      </div>
    </div>
  );
}
