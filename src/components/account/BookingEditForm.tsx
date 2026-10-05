"use client";

import { useActionState } from "react";
import { updateMyBooking } from "@/actions/account";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";

export function BookingEditForm({
  reference,
  guests,
  startDate,
  notes,
}: {
  reference: string;
  guests: number;
  startDate: string;
  notes: string;
}) {
  const [state, action] = useActionState(updateMyBooking, initialFormState);

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Update request</h2>
      <FormMessage state={state} />
      <input type="hidden" name="reference" value={reference} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Guests">
          <input name="guests" type="number" min={1} max={50} defaultValue={guests} required />
        </Field>
        <Field label="Preferred start date">
          <input name="startDate" type="date" defaultValue={startDate} />
        </Field>
      </div>
      <Field label="Notes for the team">
        <textarea name="notes" defaultValue={notes} />
      </Field>
      <div>
        <SubmitButton pendingLabel="Saving">Save changes</SubmitButton>
      </div>
    </form>
  );
}
