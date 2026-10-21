"use client";

import { useState, type FormEvent } from "react";
import { saveCustomerRentalDocument } from "@/actions/rental-bookings";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { DocumentField, DocumentPreview } from "@/components/rentals/DocumentField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { expiredDocumentMessage, isExpiredDocumentDate, todayDateInput } from "@/lib/rentals/document-dates";
import type { StoredFile } from "@/lib/storage/documents";
import type { SavedBookingDocument } from "@/components/rentals/BookingCheckout";

export function CustomerDocumentForm({
  bookingId,
  configId,
  label,
  requiresNumber,
  requiresIssueDate,
  requiresExpiry,
  saved = null,
}: {
  bookingId: string;
  configId: string;
  label: string;
  requiresNumber: boolean;
  requiresIssueDate: boolean;
  requiresExpiry: boolean;
  saved?: SavedBookingDocument | null;
}) {
  const savedExpired = Boolean(saved && requiresExpiry && saved.expiryDate && isExpiredDocumentDate(saved.expiryDate));
  const [file, setFile] = useState<StoredFile | null>(null);
  const [useSaved, setUseSaved] = useState(Boolean(saved) && !savedExpired);
  const [expiryError, setExpiryError] = useState(savedExpired ? expiredDocumentMessage : "");
  const chosen = useSaved && saved && !savedExpired
    ? { url: saved.fileUrl, key: saved.fileKey, driver: saved.fileDriver, resourceType: saved.fileResource }
    : file;

  function guardExpiry(event: FormEvent<HTMLFormElement>) {
    if (!requiresExpiry) return;
    const value = String(new FormData(event.currentTarget).get("expiryDate") ?? "");
    if (!value || !isExpiredDocumentDate(value)) return;
    event.preventDefault();
    setExpiryError(expiredDocumentMessage);
  }

  return (
    <ActionForm action={saveCustomerRentalDocument} className="grid gap-3 rounded-xl border border-line bg-white p-4" onSubmit={guardExpiry}>
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="configId" value={configId} />
      <input type="hidden" name="fileJson" value={chosen ? JSON.stringify(chosen) : ""} />
      {savedExpired ? (
        <p className="rental-book__field-error" role="alert">
          The copy on your profile expired{saved?.expiryDate ? ` on ${saved.expiryDate}` : ""}. Upload a current document.
        </p>
      ) : null}
      {useSaved && saved && !savedExpired ? (
        <div className="overflow-hidden rounded-lg border border-line bg-surface text-sm">
          <DocumentPreview
            url={saved.fileUrl}
            name={label}
            kind={saved.fileResource === "raw" ? "pdf" : "image"}
          />
          <div className="px-3 py-2">
            <p className="font-medium text-navy">Saved on your profile</p>
            <p className="mt-1 text-muted">
              {[saved.number, saved.expiryDate && `expires ${saved.expiryDate}`].filter(Boolean).join(" · ") || "Ready to use"}
            </p>
          </div>
        </div>
      ) : (
        <DocumentField folder="rental-documents" onChange={setFile} />
      )}
      {saved && !savedExpired ? (
        <button
          type="button"
          className="justify-self-start text-sm font-semibold text-brand"
          onClick={() => {
            setUseSaved((current) => !current);
            setFile(null);
          }}
        >
          {useSaved ? "Upload a different file" : "Use the saved document"}
        </button>
      ) : null}
      {requiresNumber ? (
        <Field label="Number" required>
          <input name="number" required defaultValue={saved?.number ?? ""} />
        </Field>
      ) : null}
      {requiresIssueDate ? (
        <Field label="Issue date" required>
          <input name="issueDate" type="date" required defaultValue={saved?.issueDate ?? ""} />
        </Field>
      ) : null}
      {requiresExpiry ? (
        <Field label="Expiry date" required error={expiryError}>
          <input
            name="expiryDate"
            type="date"
            required
            min={todayDateInput()}
            defaultValue={saved?.expiryDate ?? ""}
            aria-invalid={expiryError ? true : undefined}
            onChange={(event) => {
              setExpiryError(event.target.value && isExpiredDocumentDate(event.target.value) ? expiredDocumentMessage : "");
            }}
          />
        </Field>
      ) : null}
      <SubmitButton pendingLabel="Saving">{useSaved ? "Use saved document" : "Upload document"}</SubmitButton>
    </ActionForm>
  );
}
