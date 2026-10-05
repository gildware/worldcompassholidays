"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import type { StoredFile } from "@/lib/storage/documents";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export function DocumentField({
  folder,
  onChange,
}: {
  folder: "vehicles" | "rental-documents";
  onChange: (file: StoredFile | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File | null) {
    if (!file || pending) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use a JPG, PNG, WebP, or PDF file.");
      onChange(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be 5 MB or smaller.");
      onChange(null);
      return;
    }
    setPending(true);
    setError(null);
    const body = new FormData();
    body.set("folder", folder);
    body.set("file", file);
    const response = await fetch("/api/uploads/document", { method: "POST", body });
    const payload = (await response.json()) as StoredFile & { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not upload the file.");
      onChange(null);
      return;
    }
    setName(file.name);
    onChange(payload);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className="grid gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a document"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "relative cursor-pointer overflow-hidden rounded-xl border border-dashed bg-surface",
          dragging ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50",
          pending ? "cursor-wait" : "",
        ].join(" ")}
      >
        <div aria-hidden className="w-full" style={{ aspectRatio: "16 / 5" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-line">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
            </svg>
          </span>
          <p className="text-sm font-medium text-navy">
            {pending ? "Uploading…" : dragging ? "Drop file" : name ? name : "Drag and drop a file here"}
          </p>
          <p className="text-xs text-muted">JPG, PNG, WebP, or PDF · max 5 MB</p>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => {
            void upload(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
