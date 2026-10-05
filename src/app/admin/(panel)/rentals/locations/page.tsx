import type { Metadata } from "next";
import { deleteRentalLocation, saveRentalLocation } from "@/actions/rental-admin";
import { ActionForm } from "@/components/rentals/ActionForm";
import { Field } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Rental locations" };

export default async function RentalLocationsPage() {
  const user = await requirePermission("vehicles.view");
  const setup = await getRentalSetup();
  const manage = can(user, "vehicles.manage");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div>
        <h1 className="text-2xl font-semibold">Pickup locations</h1>
        <p className="mt-2 text-sm text-muted">
          Customers who visit a desk choose from these locations. Home delivery uses the address they type, and each vehicle can turn either option on or off.
        </p>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white text-sm">
          {setup.locations.map((location) => (
            <li key={location.id} className="px-4 py-3">
              <p className="font-medium">
                {location.name} {!location.active ? <span className="text-muted">(inactive)</span> : null}
              </p>
              <p className="text-muted">
                {location.address || "No address"}
                {location.destination ? ` · ${location.destination.name}` : ""}
              </p>
              {manage ? (
                <ActionForm action={deleteRentalLocation} className="mt-2">
                  <input type="hidden" name="id" value={location.id} />
                  <SubmitButton variant="danger" pendingLabel="Deleting">
                    Delete
                  </SubmitButton>
                </ActionForm>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {manage ? (
        <ActionForm action={saveRentalLocation} className="grid h-fit gap-3 rounded-xl border border-line bg-white p-4">
          <Field label="Name" required>
            <input name="name" required />
          </Field>
          <Field label="Address">
            <textarea name="address" className="min-h-20" />
          </Field>
          <Field label="Destination">
            <SearchableSelect
              name="destinationId"
              emptyLabel="None"
              ariaLabel="Destination"
              searchPlaceholder="Search destinations"
              className="!h-10"
              options={setup.destinations.map((destination) => ({
                value: destination.id,
                label: destination.name,
              }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            Active
          </label>
          <SubmitButton pendingLabel="Saving">Add location</SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
