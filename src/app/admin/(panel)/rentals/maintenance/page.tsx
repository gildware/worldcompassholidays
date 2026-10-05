import type { Metadata } from "next";
import Link from "next/link";
import { deleteMaintenance, saveMaintenance } from "@/actions/rental-admin";
import { ActionForm } from "@/components/rentals/ActionForm";
import { Field } from "@/components/forms/Field";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { maintenanceStatusLabels } from "@/lib/rentals/labels";
import { toDateTimeLocal } from "@/lib/rentals/dates";

export const metadata: Metadata = { title: "Maintenance" };

export default async function MaintenancePage() {
  const user = await requirePermission("vehicles.view");
  const [records, vehicles] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      include: { vehicle: { select: { name: true, id: true } } },
      orderBy: { startAt: "desc" },
    }),
    prisma.vehicle.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const manage = can(user, "vehicles.manage");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Maintenance</h1>
        <p className="mt-2 text-sm text-muted">
          Scheduled and in-progress work blocks those dates so the vehicle cannot be double booked.
        </p>
      </div>
      {manage && vehicles.length > 0 ? (
        <ActionForm action={saveMaintenance} className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-2">
          <Field label="Vehicle" required>
            <SearchableSelect
              name="vehicleId"
              required
              defaultValue={vehicles[0]?.id ?? ""}
              ariaLabel="Vehicle"
              searchPlaceholder="Search vehicles"
              className="!h-10"
              options={vehicles.map((vehicle) => ({
                value: vehicle.id,
                label: vehicle.name,
              }))}
            />
          </Field>
          <Field label="Title" required>
            <input name="title" required />
          </Field>
          <Field label="Starts" required>
            <input name="startAt" type="datetime-local" required />
          </Field>
          <Field label="Ends" required>
            <input name="endAt" type="datetime-local" required />
          </Field>
          <Field label="Status">
            <SearchableSelect
              name="status"
              defaultValue="scheduled"
              ariaLabel="Maintenance status"
              searchPlaceholder="Search statuses"
              className="!h-10"
              options={Object.entries(maintenanceStatusLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Field>
          <Field label="Cost">
            <input name="cost" type="number" min={0} defaultValue={0} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <textarea name="notes" className="min-h-20" />
            </Field>
          </div>
          <SubmitButton pendingLabel="Saving">Add maintenance</SubmitButton>
        </ActionForm>
      ) : null}
      <ul className="divide-y divide-line rounded-xl border border-line bg-white text-sm">
        {records.length === 0 ? <li className="px-4 py-6 text-muted">No maintenance records.</li> : null}
        {records.map((record) => (
          <li key={record.id} className="grid gap-3 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{record.title}</p>
                <p className="text-muted">
                  <Link href={`/admin/rentals/fleet/${record.vehicle.id}`}>{record.vehicle.name}</Link>
                  {" · "}
                  {maintenanceStatusLabels[record.status] ?? record.status}
                  {" · "}
                  {formatDateTime(record.startAt)} – {formatDateTime(record.endAt)}
                  {record.cost ? ` · ${formatMoney(record.cost)}` : ""}
                </p>
              </div>
            </div>
            {manage ? (
              <ActionForm action={saveMaintenance} className="grid gap-2 md:grid-cols-4">
                <input type="hidden" name="id" value={record.id} />
                <input type="hidden" name="vehicleId" value={record.vehicleId} />
                <input type="hidden" name="title" value={record.title} />
                <input type="hidden" name="startAt" value={toDateTimeLocal(record.startAt)} />
                <input type="hidden" name="endAt" value={toDateTimeLocal(record.endAt)} />
                <input type="hidden" name="cost" value={record.cost} />
                <input type="hidden" name="notes" value={record.notes} />
                <SearchableSelect
                  name="status"
                  defaultValue={record.status}
                  ariaLabel="Maintenance status"
                  searchPlaceholder="Search statuses"
                  className="!h-10"
                  options={Object.entries(maintenanceStatusLabels).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
                <SubmitButton pendingLabel="Saving">Update</SubmitButton>
              </ActionForm>
            ) : null}
            {manage ? (
              <ActionForm action={deleteMaintenance}>
                <input type="hidden" name="id" value={record.id} />
                <SubmitButton variant="danger" pendingLabel="Deleting">
                  Delete
                </SubmitButton>
              </ActionForm>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
