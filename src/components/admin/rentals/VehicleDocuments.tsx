"use client";

import { useState } from "react";
import { deleteVehicleDocument, saveVehicleDocument } from "@/actions/rental-admin";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { DocumentField } from "@/components/rentals/DocumentField";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { documentStatusLabels } from "@/lib/rentals/labels";
import type { StoredFile } from "@/lib/storage/documents";

type Doc = {
  id: string;
  typeName: string;
  number: string;
  fileUrl: string;
  status: string;
  issueDate: string;
  expiryDate: string;
  expiry: "ok" | "soon" | "expired" | "none";
  note: string;
};

export function VehicleDocuments({
  vehicleId,
  documents,
  types,
}: {
  vehicleId: string;
  documents: Doc[];
  types: {
    id: string;
    name: string;
    requiresNumber: boolean;
    requiresIssueDate: boolean;
    requiresExpiry: boolean;
  }[];
}) {
  const [file, setFile] = useState<StoredFile | null>(null);

  return (
    <div className="grid gap-6">
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {documents.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted">No vehicle documents yet.</li>
        ) : (
          documents.map((document) => (
            <li key={document.id} className="grid gap-2 px-4 py-4 text-sm md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">{document.typeName}</p>
                <p className="text-muted">
                  {document.number || "No number"}
                  {document.expiryDate ? ` · expires ${document.expiryDate}` : ""}
                  {document.issueDate ? ` · issued ${document.issueDate}` : ""}
                </p>
                {document.note ? <p className="mt-1">{document.note}</p> : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusPill status={document.status} label={documentStatusLabels[document.status]} />
                  {document.expiry === "expired" ? <StatusPill status="expired" label="Expired" /> : null}
                  {document.expiry === "soon" ? <StatusPill status="pending" label="Expires soon" /> : null}
                  {document.fileUrl ? (
                    <a href={document.fileUrl} className="text-brand" target="_blank" rel="noreferrer">
                      Open file
                    </a>
                  ) : null}
                </div>
              </div>
              <ActionForm action={deleteVehicleDocument}>
                <input type="hidden" name="id" value={document.id} />
                <SubmitButton variant="danger" pendingLabel="Removing">
                  Remove
                </SubmitButton>
              </ActionForm>
            </li>
          ))
        )}
      </ul>

      <ActionForm action={saveVehicleDocument} className="grid gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-2">
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <input type="hidden" name="fileJson" value={file ? JSON.stringify(file) : ""} />
        <Field label="Document type" required>
          <SearchableSelect
            name="configId"
            required
            emptyLabel="Choose"
            ariaLabel="Document type"
            searchPlaceholder="Search document types"
            className="!h-10"
            options={types.map((type) => ({ value: type.id, label: type.name }))}
          />
        </Field>
        <Field label="Status">
          <SearchableSelect
            name="status"
            defaultValue="pending"
            ariaLabel="Document status"
            searchPlaceholder="Search statuses"
            className="!h-10"
            options={[
              { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </Field>
        <Field label="Number">
          <input name="number" />
        </Field>
        <Field label="Issue date">
          <input name="issueDate" type="date" />
        </Field>
        <Field label="Expiry date">
          <input name="expiryDate" type="date" />
        </Field>
        <Field label="Note">
          <input name="note" />
        </Field>
        <div className="md:col-span-2">
          <Field label="File" required>
            <DocumentField folder="vehicles" onChange={setFile} />
          </Field>
        </div>
        <SubmitButton pendingLabel="Saving">Add document</SubmitButton>
      </ActionForm>
    </div>
  );
}
