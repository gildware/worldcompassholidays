"use client";

import { useState } from "react";
import {
  addRentalCharge,
  recordRentalPayment,
  reviewCustomerDocument,
  updateRentalBookingStatus,
} from "@/actions/rental-bookings";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  bookingTransitions,
  documentStatusLabels,
  paymentKindLabels,
  paymentMethodLabels,
  paymentMethods,
  paymentStatusLabels,
  rentalStatusLabel,
} from "@/lib/rentals/labels";
import { formatMoney } from "@/lib/format";

type DocumentRow = {
  id: string;
  typeName: string;
  number: string;
  fileUrl: string;
  status: string;
  rejectionReason: string;
  issueDate: string;
  expiryDate: string;
};

type PaymentRow = {
  id: string;
  kind: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  note: string;
  gatewayRef: string;
};

export function BookingDesk({
  bookingId,
  status,
  documents,
  payments,
  canCharge,
}: {
  bookingId: string;
  status: string;
  documents: DocumentRow[];
  payments: PaymentRow[];
  canCharge: boolean;
}) {
  const nextStatuses = bookingTransitions[status] ?? [];
  const [paymentId, setPaymentId] = useState(payments[0]?.id ?? "");
  const selected = payments.find((payment) => payment.id === paymentId) ?? payments[0];

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-line bg-white p-4">
        <h2 className="font-semibold">Status</h2>
        <p className="mt-1 text-sm text-muted">Current: {rentalStatusLabel(status)}</p>
        {nextStatuses.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No further status changes.</p>
        ) : (
          <ActionForm action={updateRentalBookingStatus} className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="bookingId" value={bookingId} />
            <Field label="Move to">
              <SearchableSelect
                name="status"
                defaultValue={nextStatuses[0]}
                ariaLabel="Move to"
                searchPlaceholder="Search statuses"
                className="!h-10"
                options={nextStatuses.map((item) => ({
                  value: item,
                  label: rentalStatusLabel(item),
                }))}
              />
            </Field>
            <Field label="Note" hint="Required when rejecting or cancelling.">
              <input name="note" />
            </Field>
            <SubmitButton pendingLabel="Updating">Update status</SubmitButton>
          </ActionForm>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-semibold">Customer documents</h2>
        {documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-sm text-muted">
            No documents uploaded.
          </p>
        ) : (
          documents.map((document) => (
            <article key={document.id} className="rounded-xl border border-line bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{document.typeName}</p>
                <StatusPill status={document.status} label={documentStatusLabels[document.status]} />
              </div>
              <p className="mt-1 text-muted">
                {document.number || "No number"}
                {document.issueDate ? ` · issued ${document.issueDate}` : ""}
                {document.expiryDate ? ` · expires ${document.expiryDate}` : ""}
              </p>
              {document.rejectionReason ? (
                <p className="mt-1 text-red-700">{document.rejectionReason}</p>
              ) : null}
              {document.fileUrl ? (
                <a href={document.fileUrl} className="mt-2 inline-flex text-brand" target="_blank" rel="noreferrer">
                  Open file
                </a>
              ) : null}
              <ActionForm action={reviewCustomerDocument} className="mt-3 grid gap-3 md:grid-cols-[12rem_1fr_auto]">
                <input type="hidden" name="documentId" value={document.id} />
                <SearchableSelect
                  name="status"
                  defaultValue="verified"
                  ariaLabel="Review status"
                  searchPlaceholder="Search statuses"
                  className="!h-10"
                  options={[
                    { value: "verified", label: "Verified" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
                <input name="rejectionReason" placeholder="Rejection reason" />
                <SubmitButton pendingLabel="Saving">Save review</SubmitButton>
              </ActionForm>
            </article>
          ))
        )}
      </section>

      <section className="rounded-xl border border-line bg-white p-4">
        <h2 className="font-semibold">Payments</h2>
        <p className="mt-1 text-sm text-muted">
          Online checkout is not connected yet. Record cash, UPI, bank, or card here. A future gateway can update these same records.
        </p>
        <ul className="mt-4 divide-y divide-line text-sm">
          {payments.length === 0 ? (
            <li className="py-3 text-muted">No payment rows.</li>
          ) : (
            payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">
                    {paymentKindLabels[payment.kind] ?? payment.kind} · {formatMoney(payment.amount, payment.currency)}
                  </p>
                  <p className="text-muted">
                    {paymentStatusLabels[payment.status] ?? payment.status} · {paymentMethodLabels[payment.method] ?? payment.method}
                    {payment.note ? ` · ${payment.note}` : ""}
                  </p>
                </div>
                <button type="button" className="text-brand" onClick={() => setPaymentId(payment.id)}>
                  Update
                </button>
              </li>
            ))
          )}
        </ul>
        {selected ? (
          <ActionForm key={selected.id} action={recordRentalPayment} className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="paymentId" value={selected.id} />
            <Field label="Status">
              <SearchableSelect
                name="status"
                defaultValue={selected.status}
                ariaLabel="Payment status"
                searchPlaceholder="Search statuses"
                className="!h-10"
                options={[
                  { value: "unpaid", label: "Unpaid" },
                  { value: "paid", label: "Paid" },
                  { value: "failed", label: "Failed" },
                ]}
              />
            </Field>
            <Field label="Method">
              <SearchableSelect
                name="method"
                defaultValue={selected.method}
                ariaLabel="Payment method"
                searchPlaceholder="Search methods"
                className="!h-10"
                options={paymentMethods.map((method) => ({
                  value: method,
                  label: paymentMethodLabels[method] ?? method,
                }))}
              />
            </Field>
            <Field label="Reference">
              <input name="gatewayRef" defaultValue={selected.gatewayRef} />
            </Field>
            <Field label="Note">
              <input name="note" defaultValue={selected.note} />
            </Field>
            <SubmitButton pendingLabel="Saving">Save payment</SubmitButton>
          </ActionForm>
        ) : null}
      </section>

      {canCharge ? (
        <ActionForm action={addRentalCharge} className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-2">
          <h2 className="font-semibold md:col-span-2">Extra kilometres and late return</h2>
          <p className="text-sm text-muted md:col-span-2">
            Charges use the rates saved on this booking, not the vehicle’s current prices.
          </p>
          <input type="hidden" name="bookingId" value={bookingId} />
          <Field label="Kilometres driven">
            <input name="drivenKm" type="number" min={0} defaultValue={0} />
          </Field>
          <Field label="Late hours">
            <input name="lateHours" type="number" min={0} defaultValue={0} />
          </Field>
          <SubmitButton pendingLabel="Adding">Add extra charges</SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
