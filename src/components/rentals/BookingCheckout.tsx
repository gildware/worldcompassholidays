"use client";

import { useState } from "react";
import Link from "next/link";
import { confirmRentalBooking } from "@/actions/rental-bookings";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { DocumentField } from "@/components/rentals/DocumentField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import type { StoredFile } from "@/lib/storage/documents";

type DocType = {
  id: string;
  name: string;
  description: string;
  requiresNumber: boolean;
  requiresIssueDate: boolean;
  requiresExpiry: boolean;
};

type Uploaded = StoredFile & {
  configId: string;
  number: string;
  issueDate: string;
  expiryDate: string;
};

export function BookingCheckout({
  signedIn,
  returnPath,
  vehicleId,
  pickupAt,
  returnAt,
  pickupMode,
  returnMode,
  pickupLocationId,
  returnLocationId,
  deliveryAddress,
  returnAddress,
  sameReturn,
  addonIds,
  documents,
}: {
  signedIn: boolean;
  returnPath: string;
  vehicleId: string;
  pickupAt: string;
  returnAt: string;
  pickupMode: string;
  returnMode: string;
  pickupLocationId: string;
  returnLocationId: string;
  deliveryAddress: string;
  returnAddress: string;
  sameReturn: boolean;
  addonIds: string[];
  documents: DocType[];
}) {
  const [files, setFiles] = useState<Record<string, Uploaded>>({});

  if (!signedIn) {
    const next = encodeURIComponent(returnPath);
    return (
      <div className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">Create an account to continue</h2>
        <p className="mt-2 text-sm text-muted">
          Your dates stay on this page. Sign in or create an account before uploading documents and confirming.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href={`/login?next=${next}`} className="inline-flex h-11 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white">
            Sign in
          </Link>
          <Link href={`/signup?next=${next}`} className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm font-medium">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const payload = Object.values(files).map((file) => ({
    configId: file.configId,
    fileUrl: file.url,
    fileKey: file.key,
    fileDriver: file.driver,
    fileResource: file.resourceType,
    number: file.number,
    issueDate: file.issueDate,
    expiryDate: file.expiryDate,
  }));

  return (
    <ActionForm action={confirmRentalBooking} className="grid gap-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Documents and confirmation</h2>
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="pickupAt" value={pickupAt} />
      <input type="hidden" name="returnAt" value={returnAt} />
      <input type="hidden" name="pickupMode" value={pickupMode} />
      <input type="hidden" name="returnMode" value={returnMode} />
      <input type="hidden" name="pickupLocationId" value={pickupLocationId} />
      <input type="hidden" name="returnLocationId" value={returnLocationId} />
      <input type="hidden" name="deliveryAddress" value={deliveryAddress} />
      <input type="hidden" name="returnAddress" value={returnAddress} />
      {sameReturn ? <input type="hidden" name="sameReturn" value="on" /> : null}
      <Field label="Notes">
        <textarea name="notes" className="min-h-24" placeholder="Pickup instructions or special requests" />
      </Field>
      <input type="hidden" name="documentsJson" value={JSON.stringify(payload)} />
      {addonIds.map((id) => (
        <input key={id} type="hidden" name="addonIds" value={id} />
      ))}

      {documents.length === 0 ? (
        <p className="text-sm text-muted">No customer documents are required right now.</p>
      ) : (
        documents.map((document) => {
          const current = files[document.id];
          return (
            <fieldset key={document.id} className="grid gap-3 rounded-lg border border-line p-3">
              <legend className="px-1 text-sm font-medium">{document.name}</legend>
              {document.description ? <p className="text-xs text-muted">{document.description}</p> : null}
              <DocumentField
                folder="rental-documents"
                onChange={(file) => {
                  setFiles((prev) => {
                    const next = { ...prev };
                    if (!file) {
                      delete next[document.id];
                      return next;
                    }
                    next[document.id] = {
                      ...file,
                      configId: document.id,
                      number: prev[document.id]?.number ?? "",
                      issueDate: prev[document.id]?.issueDate ?? "",
                      expiryDate: prev[document.id]?.expiryDate ?? "",
                    };
                    return next;
                  });
                }}
              />
              {document.requiresNumber ? (
                <Field label="Number" required>
                  <input
                    value={current?.number ?? ""}
                    onChange={(event) =>
                      setFiles((prev) => ({
                        ...prev,
                        [document.id]: {
                          ...(prev[document.id] ?? {
                            url: "",
                            key: "",
                            driver: "local",
                            resourceType: "image",
                            configId: document.id,
                            issueDate: "",
                            expiryDate: "",
                          }),
                          number: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              ) : null}
              {document.requiresIssueDate ? (
                <Field label="Issue date" required>
                  <input
                    type="date"
                    value={current?.issueDate ?? ""}
                    onChange={(event) =>
                      setFiles((prev) => ({
                        ...prev,
                        [document.id]: {
                          url: "",
                          key: "",
                          driver: "local",
                          resourceType: "image",
                          number: "",
                          expiryDate: "",
                          ...prev[document.id],
                          configId: document.id,
                          issueDate: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              ) : null}
              {document.requiresExpiry ? (
                <Field label="Expiry date" required>
                  <input
                    type="date"
                    value={current?.expiryDate ?? ""}
                    onChange={(event) =>
                      setFiles((prev) => ({
                        ...prev,
                        [document.id]: {
                          url: "",
                          key: "",
                          driver: "local",
                          resourceType: "image",
                          number: "",
                          issueDate: "",
                          ...prev[document.id],
                          configId: document.id,
                          expiryDate: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              ) : null}
            </fieldset>
          );
        })
      )}

      <p className="text-sm text-muted">
        Confirming saves this price with the booking. Payment stays unpaid until checkout is connected or staff record it.
      </p>
      <SubmitButton pendingLabel="Confirming">Confirm booking</SubmitButton>
    </ActionForm>
  );
}
