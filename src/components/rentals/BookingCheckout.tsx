"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { confirmRentalBooking } from "@/actions/rental-bookings";
import { Field } from "@/components/forms/Field";
import { ActionForm } from "@/components/rentals/ActionForm";
import { DocumentField, DocumentPreview } from "@/components/rentals/DocumentField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { expiredDocumentMessage, isExpiredDocumentDate, todayDateInput } from "@/lib/rentals/document-dates";
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

type DocFieldError = {
  file?: string;
  number?: string;
  issueDate?: string;
  expiryDate?: string;
};

function documentFieldErrors(
  documents: DocType[],
  files: Record<string, Uploaded>,
  usingSaved: Record<string, boolean>,
) {
  const next: Record<string, DocFieldError> = {};
  for (const document of documents) {
    const current = files[document.id];
    const item: DocFieldError = {};
    if (!current?.url) {
      item.file = usingSaved[document.id] ? "Choose the saved document." : "Upload this document.";
    }
    if (document.requiresNumber && !current?.number.trim()) item.number = "Enter the document number.";
    if (document.requiresIssueDate && !current?.issueDate) item.issueDate = "Choose the issue date.";
    if (document.requiresExpiry && !current?.expiryDate) item.expiryDate = "Choose the expiry date.";
    else if (current?.expiryDate && isExpiredDocumentDate(current.expiryDate)) item.expiryDate = expiredDocumentMessage;
    if (item.file || item.number || item.issueDate || item.expiryDate) next[document.id] = item;
  }
  return next;
}

export type SavedBookingDocument = {
  configId: string;
  typeName: string;
  fileUrl: string;
  fileKey: string;
  fileDriver: "local" | "cloudinary";
  fileResource: "image" | "raw";
  number: string;
  issueDate: string;
  expiryDate: string;
};

function fromSaved(saved: SavedBookingDocument, keepFile = true): Uploaded {
  return {
    url: keepFile ? saved.fileUrl : "",
    key: keepFile ? saved.fileKey : "",
    driver: saved.fileDriver,
    resourceType: saved.fileResource,
    configId: saved.configId,
    number: saved.number,
    issueDate: saved.issueDate,
    expiryDate: saved.expiryDate,
  };
}

function uploadedPreview(file: Uploaded | undefined) {
  if (!file?.url) return null;
  const leaf = file.url.split("/").pop()?.split("?")[0] ?? "";
  let name = "Uploaded document";
  try {
    const decoded = decodeURIComponent(leaf);
    if (/\.(png|jpe?g|webp|pdf)$/i.test(decoded)) name = decoded;
  } catch {
    name = "Uploaded document";
  }
  return {
    url: file.url,
    kind: file.resourceType === "raw" ? ("pdf" as const) : ("image" as const),
    name,
  };
}

function savedDocumentCurrent(saved: SavedBookingDocument, requiresExpiry: boolean) {
  return !(requiresExpiry && saved.expiryDate && isExpiredDocumentDate(saved.expiryDate));
}

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
  deliveryLat = "",
  deliveryLng = "",
  sameReturn,
  addonIds,
  documents,
  savedDocuments = [],
  section = "all",
  onBack,
  onContinue,
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
  deliveryLat?: string;
  deliveryLng?: string;
  sameReturn: boolean;
  addonIds: string[];
  documents: DocType[];
  savedDocuments?: SavedBookingDocument[];
  section?: "all" | "documents" | "notes";
  onBack?: () => void;
  onContinue?: () => void;
}) {
  const [usingSaved, setUsingSaved] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      savedDocuments.map((item) => [
        item.configId,
        savedDocumentCurrent(item, documents.find((document) => document.id === item.configId)?.requiresExpiry ?? false),
      ]),
    ),
  );
  const [files, setFiles] = useState<Record<string, Uploaded>>(() =>
    Object.fromEntries(
      savedDocuments.map((item) => {
        const requiresExpiry = documents.find((document) => document.id === item.configId)?.requiresExpiry ?? false;
        return [item.configId, fromSaved(item, savedDocumentCurrent(item, requiresExpiry))];
      }),
    ),
  );
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, DocFieldError>>({});
  const [formError, setFormError] = useState("");

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
            Login to book now
          </Link>
        </div>
      </div>
    );
  }

  function clearFieldError(id: string, key: keyof DocFieldError) {
    setFieldErrors((current) => {
      const item = current[id];
      if (!item?.[key]) return current;
      return { ...current, [id]: { ...item, [key]: undefined } };
    });
  }

  function continueDocuments() {
    const next = documentFieldErrors(documents, files, usingSaved);
    setFieldErrors(next);
    setFormError("");
    if (Object.keys(next).length === 0) onContinue?.();
  }

  function guardSubmit(event: FormEvent<HTMLFormElement>) {
    if (section === "documents") {
      event.preventDefault();
      return;
    }
    const next = documentFieldErrors(documents, files, usingSaved);
    if (Object.keys(next).length > 0) {
      event.preventDefault();
      setFieldErrors(next);
      setFormError(section === "notes" ? "Go back and finish the required documents." : "");
    } else {
      setFormError("");
    }
  }

  const showDocuments = section === "all" || section === "documents";
  const showNotes = section === "all" || section === "notes";
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
    <ActionForm
      action={confirmRentalBooking}
      className={section === "all" ? "grid gap-4 rounded-xl border border-line bg-white p-5" : "grid gap-4"}
      noValidate
      onSubmit={guardSubmit}
    >
      {section === "all" ? <h2 className="text-lg font-semibold">Documents and confirmation</h2> : null}
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="pickupAt" value={pickupAt} />
      <input type="hidden" name="returnAt" value={returnAt} />
      <input type="hidden" name="pickupMode" value={pickupMode} />
      <input type="hidden" name="returnMode" value={returnMode} />
      <input type="hidden" name="pickupLocationId" value={pickupLocationId} />
      <input type="hidden" name="returnLocationId" value={returnLocationId} />
      <input type="hidden" name="deliveryAddress" value={deliveryAddress} />
      <input type="hidden" name="returnAddress" value={returnAddress} />
      <input type="hidden" name="deliveryLat" value={deliveryLat} />
      <input type="hidden" name="deliveryLng" value={deliveryLng} />
      {sameReturn ? <input type="hidden" name="sameReturn" value="on" /> : null}
      {showNotes ? null : <input type="hidden" name="notes" value={notes} />}
      <input type="hidden" name="documentsJson" value={JSON.stringify(payload)} />
      {addonIds.map((id) => (
        <input key={id} type="hidden" name="addonIds" value={id} />
      ))}

      {showDocuments && documents.length === 0 ? (
        <p className="text-sm text-muted">No documents are required for this booking.</p>
      ) : null}
      {showDocuments && documents.length > 0
        ? documents.map((document) => {
          const current = files[document.id];
          const itemError = fieldErrors[document.id];
          return (
            <fieldset key={document.id} className="rental-book__doc">
              <legend>{document.name}</legend>
              {document.description ? <p className="rental-book__doc-note">{document.description}</p> : null}
              {(() => {
                const saved = savedDocuments.find((item) => item.configId === document.id);
                const savedExpired = Boolean(
                  saved && document.requiresExpiry && saved.expiryDate && isExpiredDocumentDate(saved.expiryDate),
                );
                const chosen = Boolean(saved && !savedExpired && usingSaved[document.id] && current?.url);
                if (!saved) {
                  return (
                    <>
                      <DocumentField
                        folder="rental-documents"
                        invalidMessage={itemError?.file}
                        existing={uploadedPreview(current)}
                        onChange={(file) => {
                          clearFieldError(document.id, "file");
                          setFiles((prev) => {
                            const next = { ...prev };
                            const currentFile = prev[document.id];
                            if (!file) {
                              if (!currentFile) {
                                delete next[document.id];
                                return next;
                              }
                              next[document.id] = { ...currentFile, url: "", key: "" };
                              return next;
                            }
                            next[document.id] = {
                              ...file,
                              configId: document.id,
                              number: currentFile?.number ?? "",
                              issueDate: currentFile?.issueDate ?? "",
                              expiryDate: currentFile?.expiryDate ?? "",
                            };
                            return next;
                          });
                        }}
                      />
                      <p className="text-xs text-muted">This file is kept on your profile for the next booking.</p>
                    </>
                  );
                }
                return (
                  <div className="grid gap-2">
                    {savedExpired ? (
                      <p className="rental-book__field-error" role="alert">
                        The copy on your profile expired{saved.expiryDate ? ` on ${saved.expiryDate}` : ""}. Upload a current document.
                      </p>
                    ) : null}
                    {chosen ? (
                      <div className="overflow-hidden rounded-lg border border-line bg-surface text-sm">
                        <DocumentPreview
                          url={saved.fileUrl}
                          name={saved.typeName || document.name}
                          kind={saved.fileResource === "raw" ? "pdf" : "image"}
                        />
                        <div className="px-3 py-2">
                          <p className="font-medium text-navy">Saved on your profile</p>
                          <p className="mt-1 text-muted">
                            {[saved.number, saved.issueDate && `issued ${saved.issueDate}`, saved.expiryDate && `expires ${saved.expiryDate}`]
                              .filter(Boolean)
                              .join(" · ") || "Ready to use on this booking"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <DocumentField
                        folder="rental-documents"
                        invalidMessage={itemError?.file}
                        existing={uploadedPreview(current)}
                        onChange={(file) => {
                          clearFieldError(document.id, "file");
                          setUsingSaved((prev) => ({ ...prev, [document.id]: false }));
                          setFiles((prev) => {
                            const next = { ...prev };
                            const currentFile = prev[document.id];
                            if (!file) {
                              next[document.id] = {
                                ...(currentFile ?? fromSaved(saved, false)),
                                url: "",
                                key: "",
                              };
                              return next;
                            }
                            next[document.id] = {
                              ...file,
                              configId: document.id,
                              number: currentFile?.number ?? saved.number,
                              issueDate: currentFile?.issueDate ?? saved.issueDate,
                              expiryDate: currentFile?.expiryDate ?? saved.expiryDate,
                            };
                            return next;
                          });
                        }}
                      />
                    )}
                    {savedExpired ? null : (
                      <button
                        type="button"
                        className="justify-self-start text-sm font-semibold text-brand"
                        onClick={() => {
                          clearFieldError(document.id, "file");
                          if (chosen) {
                            setUsingSaved((prev) => ({ ...prev, [document.id]: false }));
                            setFiles((prev) => ({
                              ...prev,
                              [document.id]: { ...(prev[document.id] ?? fromSaved(saved, false)), url: "", key: "" },
                            }));
                            return;
                          }
                          setUsingSaved((prev) => ({ ...prev, [document.id]: true }));
                          setFiles((prev) => ({ ...prev, [document.id]: fromSaved(saved) }));
                        }}
                      >
                        {chosen ? "Upload a different file" : "Use the saved document"}
                      </button>
                    )}
                  </div>
                );
              })()}
              {document.requiresNumber ? (
                <Field label="Number" required error={itemError?.number}>
                  <input
                    value={current?.number ?? ""}
                    aria-invalid={itemError?.number ? true : undefined}
                    onChange={(event) => {
                      clearFieldError(document.id, "number");
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
                      }));
                    }}
                  />
                </Field>
              ) : null}
              {document.requiresIssueDate ? (
                <Field label="Issue date" required error={itemError?.issueDate}>
                  <input
                    type="date"
                    value={current?.issueDate ?? ""}
                    aria-invalid={itemError?.issueDate ? true : undefined}
                    onChange={(event) => {
                      clearFieldError(document.id, "issueDate");
                      setFiles((prev) => ({
                        ...prev,
                        [document.id]: {
                          ...(prev[document.id] ?? {
                            url: "",
                            key: "",
                            driver: "local",
                            resourceType: "image",
                            configId: document.id,
                            number: "",
                            expiryDate: "",
                          }),
                          issueDate: event.target.value,
                        },
                      }));
                    }}
                  />
                </Field>
              ) : null}
              {document.requiresExpiry ? (
                <Field
                  label="Expiry date"
                  required
                  error={
                    itemError?.expiryDate ||
                    (current?.expiryDate && isExpiredDocumentDate(current.expiryDate) ? expiredDocumentMessage : "")
                  }
                >
                  <input
                    type="date"
                    min={todayDateInput()}
                    value={current?.expiryDate ?? ""}
                    aria-invalid={
                      itemError?.expiryDate || (current?.expiryDate && isExpiredDocumentDate(current.expiryDate))
                        ? true
                        : undefined
                    }
                    onChange={(event) => {
                      clearFieldError(document.id, "expiryDate");
                      setFiles((prev) => ({
                        ...prev,
                        [document.id]: {
                          ...(prev[document.id] ?? {
                            url: "",
                            key: "",
                            driver: "local",
                            resourceType: "image",
                            configId: document.id,
                            number: "",
                            issueDate: "",
                          }),
                          expiryDate: event.target.value,
                        },
                      }));
                    }}
                  />
                </Field>
              ) : null}
            </fieldset>
          );
        })
        : null}

      {showNotes ? (
        <Field label="Notes">
          <textarea
            name="notes"
            className="min-h-24"
            placeholder="Pickup instructions or special requests"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>
      ) : null}

      {formError ? <p className="rental-book__field-error">{formError}</p> : null}
      {section === "all" ? (
        <>
          <p className="text-sm text-muted">
            Confirming saves this price with the booking. Payment stays unpaid until checkout is connected or staff record it.
          </p>
          <SubmitButton pendingLabel="Confirming">Confirm booking</SubmitButton>
        </>
      ) : (
        <div className="rental-book__actions">
          <button type="button" className="rental-book__back" onClick={onBack}>
            Back
          </button>
          {section === "documents" ? (
            <button type="button" className="rental-detail__book" onClick={continueDocuments}>
              Continue
            </button>
          ) : (
            <SubmitButton pendingLabel="Confirming" className="rental-book__submit">
              Confirm booking
            </SubmitButton>
          )}
        </div>
      )}
    </ActionForm>
  );
}
