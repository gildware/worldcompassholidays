"use client";

import { useState } from "react";
import {
  addRentalCharge,
  recordRentalPayment,
  reviewCustomerDocument,
  updateRentalBookingStatus,
  verifyAllCustomerDocuments,
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
  primaryRentalAction,
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

type DeskProps = {
  bookingId: string;
  status: string;
  documents: DocumentRow[];
  payments: PaymentRow[];
  canCharge: boolean;
  /** `rail` = next step + status; `stack` = docs + payments + charges */
  section?: "rail" | "stack" | "all";
};

export function BookingDesk({
  bookingId,
  status,
  documents,
  payments,
  canCharge,
  section = "all",
}: DeskProps) {
  const nextStatuses = bookingTransitions[status] ?? [];
  const primary = primaryRentalAction(status);
  const docsBlockingConfirm =
    status === "documents_under_review" &&
    documents.length > 0 &&
    documents.some((document) => document.status !== "verified");
  const [paymentId, setPaymentId] = useState(payments[0]?.id ?? "");
  const selected = payments.find((payment) => payment.id === paymentId) ?? payments[0];
  const pendingDocs = documents.filter((d) => d.status !== "verified").length;

  const showRail = section === "rail" || section === "all";
  const showStack = section === "stack" || section === "all";

  return (
    <div className="grid gap-3">
      {showRail && primary ? (
        <section className="bk-panel bk-panel--accent">
          <h2>Next step</h2>
          <p className="bk-panel__hint">Current: {rentalStatusLabel(status)}</p>
          {docsBlockingConfirm ? (
            <>
              <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Verify documents in the left column before confirming. {pendingDocs} still
                pending.
              </p>
              {pendingDocs > 0 ? (
                <ActionForm action={verifyAllCustomerDocuments} className="m-0">
                  <input type="hidden" name="bookingId" value={bookingId} />
                  <SubmitButton pendingLabel="Verifying" className="bk-primary-cta w-full !h-11">
                    Verify all documents
                  </SubmitButton>
                </ActionForm>
              ) : null}
            </>
          ) : (
            <ActionForm action={updateRentalBookingStatus} className="grid gap-2">
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="status" value={primary.status} />
              <input type="hidden" name="note" value="" />
              <SubmitButton pendingLabel="Updating" className="bk-primary-cta w-full !h-11">
                {primary.label}
              </SubmitButton>
            </ActionForm>
          )}
        </section>
      ) : null}

      {showRail ? (
        <details className="bk-more">
          <summary>Other status</summary>
          <div className="bk-more__body">
            <section className="bk-panel bk-panel--compact">
              <h2>Change status</h2>
              <p className="bk-panel__hint">Current: {rentalStatusLabel(status)}</p>
              {nextStatuses.length === 0 ? (
                <p className="text-sm text-muted">No further status changes.</p>
              ) : (
                <ActionForm action={updateRentalBookingStatus} className="grid gap-2">
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
                  <SubmitButton pendingLabel="Updating" variant="secondary">
                    Update status
                  </SubmitButton>
                </ActionForm>
              )}
            </section>
          </div>
        </details>
      ) : null}

      {showStack ? (
        <section className="bk-panel">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 style={{ margin: 0 }}>Customer documents</h2>
            {pendingDocs > 0 ? (
              <ActionForm action={verifyAllCustomerDocuments} className="m-0">
                <input type="hidden" name="bookingId" value={bookingId} />
                <SubmitButton pendingLabel="Verifying" variant="secondary">
                  Verify all
                </SubmitButton>
              </ActionForm>
            ) : null}
          </div>
          {documents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-4 text-sm text-muted">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-lg border border-line bg-surface px-3 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-navy">{document.typeName}</p>
                    <StatusPill
                      status={document.status}
                      label={documentStatusLabels[document.status]}
                    />
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
                    <a
                      href={document.fileUrl}
                      className="mt-2 inline-flex text-brand"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open file
                    </a>
                  ) : null}
                  <ActionForm action={reviewCustomerDocument} className="mt-3 grid gap-2">
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
                    <SubmitButton pendingLabel="Saving" variant="secondary">
                      Save review
                    </SubmitButton>
                  </ActionForm>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {showStack ? (
        <section className="bk-panel">
          <h2>Payments</h2>
          <p className="bk-panel__hint">
            Record cash, UPI, bank, or card. A future gateway can update these same rows.
          </p>
          <ul className="divide-y divide-line text-sm">
            {payments.length === 0 ? (
              <li className="py-3 text-muted">No payment rows.</li>
            ) : (
              payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {paymentKindLabels[payment.kind] ?? payment.kind} ·{" "}
                      {formatMoney(payment.amount, payment.currency)}
                    </p>
                    <p className="text-muted">
                      {paymentStatusLabels[payment.status] ?? payment.status} ·{" "}
                      {paymentMethodLabels[payment.method] ?? payment.method}
                      {payment.note ? ` · ${payment.note}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-brand"
                    onClick={() => setPaymentId(payment.id)}
                  >
                    Update
                  </button>
                </li>
              ))
            )}
          </ul>
          {selected ? (
            <ActionForm
              key={selected.id}
              action={recordRentalPayment}
              className="mt-3 grid gap-3 sm:grid-cols-2"
            >
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
              <div className="sm:col-span-2">
                <SubmitButton pendingLabel="Saving" variant="secondary">
                  Save payment
                </SubmitButton>
              </div>
            </ActionForm>
          ) : null}
        </section>
      ) : null}

      {showStack && canCharge ? (
        <ActionForm action={addRentalCharge} className="bk-panel grid gap-3 sm:grid-cols-2">
          <h2 className="!mb-0 sm:col-span-2">Extra kilometres and late return</h2>
          <p className="bk-panel__hint sm:col-span-2">
            Charges use the rates saved on this booking, not the vehicle’s current prices.
          </p>
          <input type="hidden" name="bookingId" value={bookingId} />
          <Field label="Kilometres driven">
            <input name="drivenKm" type="number" min={0} defaultValue={0} />
          </Field>
          <Field label="Late hours">
            <input name="lateHours" type="number" min={0} defaultValue={0} />
          </Field>
          <div className="sm:col-span-2">
            <SubmitButton pendingLabel="Adding" variant="secondary">
              Add extra charges
            </SubmitButton>
          </div>
        </ActionForm>
      ) : null}
    </div>
  );
}
