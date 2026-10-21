"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import type { StoredFile } from "@/lib/storage/documents";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export function DocumentPreview({
  url,
  name,
  kind,
}: {
  url: string;
  name: string;
  kind: "image" | "pdf";
}) {
  if (kind === "pdf") {
    return (
      <iframe
        src={url}
        title={`Preview of ${name}`}
        className="h-64 w-full bg-white"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`Preview of ${name}`} className="h-56 w-full bg-white object-contain" />
  );
}

export function DocumentField({
  folder,
  invalidMessage,
  existing = null,
  onChange,
}: {
  folder: "vehicles" | "rental-documents";
  invalidMessage?: string;
  existing?: { url: string; kind: "image" | "pdf"; name?: string } | null;
  onChange: (file: StoredFile | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"image" | "pdf" | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function rememberPreview(url: string | null, kind: "image" | "pdf" | null) {
    if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreviewUrl(url);
    setPreviewKind(kind);
  }

  function clearFile() {
    rememberPreview(null, null);
    setName("");
    setError(null);
    onChange(null);
  }

  async function upload(file: File | null) {
    if (!file || pending) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      clearFile();
      setError("Use a JPG, PNG, WebP, or PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      clearFile();
      setError("File must be 5 MB or smaller.");
      return;
    }
    const url = URL.createObjectURL(file);
    rememberPreview(url, file.type === "application/pdf" ? "pdf" : "image");
    setName(file.name);
    setPending(true);
    setError(null);
    const body = new FormData();
    body.set("folder", folder);
    body.set("file", file);
    const response = await fetch("/api/uploads/document", { method: "POST", body });
    const payload = (await response.json()) as StoredFile & { error?: string };
    setPending(false);
    if (!response.ok) {
      rememberPreview(null, null);
      setName("");
      setError(payload.error ?? "Could not upload the file.");
      onChange(null);
      return;
    }
    onChange(payload);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files?.[0] ?? null);
  }

  const message = error || invalidMessage || "";
  const shownUrl = previewUrl || existing?.url || null;
  const shownKind = previewUrl ? previewKind : existing?.url ? existing.kind : null;
  const shownName = name || existing?.name || "Uploaded document";

  return (
    <div className="grid gap-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!pending) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "rental-book__upload relative overflow-hidden rounded-xl border border-dashed bg-surface",
          message ? "is-invalid" : dragging ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50",
          pending ? "cursor-wait" : "",
        ].join(" ")}
      >
        {shownUrl && shownKind ? (
          <div data-document-preview={shownKind}>
            <DocumentPreview url={shownUrl} name={shownName} kind={shownKind} />
            {pending ? (
              <div className="absolute inset-0 flex items-center justify-center bg-navy/55 text-sm font-medium text-white">
                Uploading…
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t border-line bg-white px-3 py-2">
              <p className="min-w-0 truncate text-sm font-medium text-navy">{pending ? "Uploading…" : shownName}</p>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  className="text-sm font-semibold text-brand disabled:opacity-50"
                  disabled={pending}
                  onClick={() => inputRef.current?.click()}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-navy disabled:opacity-50"
                  disabled={pending}
                  onClick={clearFile}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Upload a document"
            aria-invalid={message ? true : undefined}
            onClick={() => inputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-1 px-3 py-8 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-line">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
              </svg>
            </span>
            <p className="text-sm font-medium text-navy">{dragging ? "Drop file" : "Drag and drop a file here"}</p>
            <p className="text-xs text-muted">JPG, PNG, WebP, or PDF · max 5 MB</p>
          </button>
        )}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            void upload(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>
      {message ? (
        <p className="rental-book__field-error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
