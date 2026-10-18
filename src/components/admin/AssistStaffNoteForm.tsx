"use client";

import { useActionState } from "react";
import { updateAssistStaffNote } from "@/actions/assist";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";

export function AssistStaffNoteForm({ bookingId, note }: { bookingId: string; note: string }) {
  const [state, action] = useActionState(updateAssistStaffNote, initialFormState);

  return (
    <form action={action} className="mt-4 grid gap-2">
      <label className="text-xs text-muted" htmlFor={`staff-note-${bookingId}`}>
        Staff note
      </label>
      <textarea
        id={`staff-note-${bookingId}`}
        name="note"
        rows={2}
        defaultValue={note}
        maxLength={1000}
        placeholder="Who is meeting them, or when you will call"
        className="min-h-16"
      />
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Saving" variant="secondary">
          Save note
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
