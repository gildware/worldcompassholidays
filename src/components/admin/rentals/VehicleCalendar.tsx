"use client";

import { useMemo, useState } from "react";
import { deleteVehicleBlock, saveVehicleBlock } from "@/actions/rental-admin";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

type Event = {
  id: string;
  label: string;
  kind: "booking" | "hold" | "maintenance";
  start: string;
  end: string;
  removable: boolean;
};

export function VehicleCalendar({ vehicleId, events }: { vehicleId: string; events: Event[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lead = start.getDay();
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const grid: Array<{ date: Date | null; marks: Event[] }> = [];
    for (let index = 0; index < lead; index += 1) grid.push({ date: null, marks: [] });
    for (let day = 1; day <= days; day += 1) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      const marks = events.filter((event) => {
        const from = new Date(event.start);
        const to = new Date(event.end);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        return from < dayEnd && to > dayStart;
      });
      grid.push({ date, marks });
    }
    return grid;
  }, [cursor, events]);

  const title = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-brand"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            Previous
          </button>
          <p className="font-medium">{title}</p>
          <button
            type="button"
            className="text-sm text-brand"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, index) => (
            <div
              key={cell.date?.toISOString() ?? `empty-${index}`}
              className="min-h-16 rounded-lg border border-line p-1 text-left"
            >
              {cell.date ? <p className="text-xs">{cell.date.getDate()}</p> : null}
              {cell.marks.slice(0, 2).map((mark) => (
                <p
                  key={mark.id}
                  className={[
                    "mt-1 truncate rounded px-1 text-[10px]",
                    mark.kind === "booking"
                      ? "bg-brand-soft text-brand"
                      : mark.kind === "maintenance"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-red-50 text-red-700",
                  ].join(" ")}
                >
                  {mark.label}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ActionForm action={saveVehicleBlock} className="grid gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-2">
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <Field label="Block type">
          <SearchableSelect
            name="kind"
            defaultValue="hold"
            ariaLabel="Block type"
            searchPlaceholder="Search block types"
            className="!h-10"
            options={[
              { value: "hold", label: "Manual hold" },
              { value: "maintenance", label: "Maintenance" },
            ]}
          />
        </Field>
        <Field label="Reason">
          <input name="reason" />
        </Field>
        <Field label="Starts" required>
          <input name="startAt" type="datetime-local" required />
        </Field>
        <Field label="Ends" required>
          <input name="endAt" type="datetime-local" required />
        </Field>
        <SubmitButton pendingLabel="Saving">Add block</SubmitButton>
      </ActionForm>

      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {events.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted">No bookings or blocks on this vehicle.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{event.label}</p>
                <p className="text-muted">
                  {new Date(event.start).toLocaleString("en-IN")} – {new Date(event.end).toLocaleString("en-IN")}
                </p>
              </div>
              {event.removable ? (
                <ActionForm action={deleteVehicleBlock}>
                  <input type="hidden" name="id" value={event.id} />
                  <SubmitButton variant="danger" pendingLabel="Removing">
                    Remove
                  </SubmitButton>
                </ActionForm>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
