"use client";

import { useActionState } from "react";
import { updateBookingStatus } from "@/actions/bookings";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { bookingStatuses, bookingStatusLabels } from "@/lib/bookings";
import { initialFormState } from "@/lib/forms";

export function BookingStatusForm({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [state, action] = useActionState(updateBookingStatus, initialFormState);

  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <label className="sr-only" htmlFor={`status-${bookingId}`}>
        Status
      </label>
      <FieldHelp label="Booking status" help="booking.status" />
      <SearchableSelect
        id={`status-${bookingId}`}
        name="status"
        defaultValue={status}
        searchPlaceholder="Search statuses"
        className="max-w-48"
        options={bookingStatuses.map((value) => ({
          value,
          label: bookingStatusLabels[value],
        }))}
      />
      <SubmitButton pendingLabel="Saving" variant="secondary">
        Update status
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
