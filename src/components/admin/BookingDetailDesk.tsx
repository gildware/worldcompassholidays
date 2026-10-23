"use client";

import { useActionState } from "react";
import {
  updateBookingAssignee,
  updateBookingQuote,
  updateBookingStaffNote,
  updateBookingStatus,
} from "@/actions/bookings";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  bookingStatusLabels,
  bookingTransitions,
  primaryBookingAction,
  statusLabel,
  type BookingStatus,
} from "@/lib/bookings";
import { initialFormState } from "@/lib/forms";

function QuickStatusForm({
  bookingId,
  next,
  label,
}: {
  bookingId: string;
  next: BookingStatus;
  label: string;
}) {
  const [state, action] = useActionState(updateBookingStatus, initialFormState);

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={next} />
      <SubmitButton pendingLabel="Updating" className="bk-primary-cta w-full !h-11">
        {label}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function BookingDetailDesk({
  bookingId,
  status,
  amount,
  currency,
  staffNote,
  assigneeId,
  assigneeName,
  staffOptions,
}: {
  bookingId: string;
  status: string;
  amount: number;
  currency: string;
  staffNote: string;
  assigneeId: string | null;
  assigneeName?: string | null;
  staffOptions: { id: string; name: string }[];
}) {
  const nextStatuses = bookingTransitions[status] ?? [];
  const primary = primaryBookingAction(status);
  const [statusState, statusAction] = useActionState(updateBookingStatus, initialFormState);
  const [noteState, noteAction] = useActionState(updateBookingStaffNote, initialFormState);
  const [quoteState, quoteAction] = useActionState(updateBookingQuote, initialFormState);
  const [assigneeState, assigneeAction] = useActionState(updateBookingAssignee, initialFormState);

  const ownerLabel = assigneeName || staffOptions.find((p) => p.id === assigneeId)?.name;

  return (
    <div className="grid gap-3">
      {primary ? (
        <section className="bk-panel bk-panel--accent">
          <h2>Next step</h2>
          <p className="bk-panel__hint">Current: {statusLabel(status)}</p>
          <QuickStatusForm bookingId={bookingId} next={primary.status} label={primary.label} />
        </section>
      ) : null}

      <section className="bk-panel bk-panel--compact">
        <h2>Desk owner</h2>
        <p className="bk-guest-name" style={{ marginBottom: 8 }}>
          {ownerLabel || "Unassigned"}
        </p>
        <form action={assigneeAction} className="grid gap-2">
          <input type="hidden" name="bookingId" value={bookingId} />
          <SearchableSelect
            name="assigneeId"
            defaultValue={assigneeId ?? ""}
            ariaLabel="Assign owner"
            searchPlaceholder="Search staff"
            className="!h-10"
            options={[
              { value: "", label: "Unassigned" },
              ...staffOptions.map((person) => ({
                value: person.id,
                label: person.name,
              })),
            ]}
          />
          <SubmitButton pendingLabel="Saving" variant="secondary">
            Save owner
          </SubmitButton>
          <FormMessage state={assigneeState} />
        </form>
      </section>

      <section className="bk-panel bk-panel--compact">
        <h2>Staff note</h2>
        <form action={noteAction} className="grid gap-2">
          <input type="hidden" name="bookingId" value={bookingId} />
          <textarea
            name="note"
            rows={3}
            defaultValue={staffNote}
            maxLength={1000}
            placeholder="Internal only"
            className="min-h-[4.5rem]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton pendingLabel="Saving" variant="secondary">
              Save note
            </SubmitButton>
            <FormMessage state={noteState} />
          </div>
        </form>
      </section>

      <details className="bk-more">
        <summary>Quote &amp; other status</summary>
        <div className="bk-more__body">
          <section className="bk-panel bk-panel--compact">
            <h2>Quote amount</h2>
            <p className="bk-panel__hint">Shown on the guest account.</p>
            <form action={quoteAction} className="grid gap-2">
              <input type="hidden" name="bookingId" value={bookingId} />
              <Field label="Amount" showHelp={false}>
                <input
                  name="amount"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={amount}
                  className="!h-10"
                />
              </Field>
              <Field label="Currency" showHelp={false}>
                <input
                  name="currency"
                  defaultValue={currency || "INR"}
                  maxLength={3}
                  className="!h-10 uppercase"
                />
              </Field>
              <SubmitButton pendingLabel="Saving" variant="secondary">
                Save quote
              </SubmitButton>
              <FormMessage state={quoteState} />
            </form>
          </section>

          <section className="bk-panel bk-panel--compact">
            <h2>Change status</h2>
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-muted">No further status changes from here.</p>
            ) : (
              <form action={statusAction} className="grid gap-2">
                <input type="hidden" name="bookingId" value={bookingId} />
                <Field label="Move to" showHelp={false}>
                  <SearchableSelect
                    name="status"
                    defaultValue={nextStatuses[0]}
                    ariaLabel="Move to status"
                    searchPlaceholder="Search statuses"
                    className="!h-10"
                    options={nextStatuses.map((value) => ({
                      value,
                      label: bookingStatusLabels[value],
                    }))}
                  />
                </Field>
                <SubmitButton pendingLabel="Saving" variant="secondary">
                  Update status
                </SubmitButton>
                <FormMessage state={statusState} />
              </form>
            )}
          </section>
        </div>
      </details>
    </div>
  );
}
