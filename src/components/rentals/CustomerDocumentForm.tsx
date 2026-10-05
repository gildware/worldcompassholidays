"use client";

import { useState } from "react";
import { saveCustomerRentalDocument } from "@/actions/rental-bookings";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { DocumentField } from "@/components/rentals/DocumentField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import type { StoredFile } from "@/lib/storage/documents";

export function CustomerDocumentForm({
  bookingId,
  configId,
  label,
  requiresNumber,
  requiresIssueDate,
  requiresExpiry,
}: {
  bookingId: string;
  configId: string;
  label: string;
  requiresNumber: boolean;
  requiresIssueDate: boolean;
  requiresExpiry: boolean;
}) {
  const [file, setFile] = useState<StoredFile | null>(null);

  return (
    <ActionForm action={saveCustomerRentalDocument} className="grid gap-3 rounded-xl border border-line bg-white p-4">
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="configId" value={configId} />
      <input type="hidden" name="fileJson" value={file ? JSON.stringify(file) : ""} />
      <DocumentField folder="rental-documents" onChange={setFile} />
      {requiresNumber ? (
        <Field label="Number" required>
          <input name="number" required />
        </Field>
      ) : null}
      {requiresIssueDate ? (
        <Field label="Issue date" required>
          <input name="issueDate" type="date" required />
        </Field>
      ) : null}
      {requiresExpiry ? (
        <Field label="Expiry date" required>
          <input name="expiryDate" type="date" required />
        </Field>
      ) : null}
      <SubmitButton pendingLabel="Saving">Upload document</SubmitButton>
    </ActionForm>
  );
}
