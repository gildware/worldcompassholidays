"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { FieldHelp } from "@/components/forms/FieldHelp";
import type { ImageFolder } from "@/lib/storage/folders";
import type { UploadedImage } from "@/lib/storage/types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

function validateClientFile(file: File | null | undefined): string | null {
  if (!file || file.size === 0) return "Choose an image.";
  if (!ACCEPT.split(",").includes(file.type)) {
    return "Use a JPG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

function uploadWithProgress(
  file: File,
  folder: ImageFolder,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.set("folder", folder);
    body.set("file", file);

    const onAbort = () => {
      xhr.abort();
      reject(new Error("Upload cancelled."));
    };
    signal.addEventListener("abort", onAbort);

    xhr.open("POST", "/api/admin/uploads");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      signal.removeEventListener("abort", onAbort);
      const payload = xhr.response as
        | (UploadedImage & { error?: string })
        | null;
      if (xhr.status >= 200 && xhr.status < 300 && payload?.url && payload.key) {
        resolve({
          url: payload.url,
          key: payload.key,
          driver: payload.driver === "cloudinary" ? "cloudinary" : "local",
        });
        return;
      }
      reject(
        new Error(
          payload?.error || `Upload failed (${xhr.status || "network"}).`,
        ),
      );
    };

    xhr.onerror = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Network error while uploading."));
    };

    xhr.onabort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Upload cancelled."));
    };

    xhr.send(body);
  });
}

export function ImageUploader({
  folder,
  label = "Image",
  required = false,
  value,
  initialValue = null,
  onChange,
  onBusyChange,
  hint,
  help,
  withHiddenFields = true,
}: {
  folder: ImageFolder;
  label?: string;
  required?: boolean;
  /** Controlled value. When omitted, the uploader manages its own state. */
  value?: UploadedImage | null;
  initialValue?: UploadedImage | null;
  onChange?: (value: UploadedImage | null) => void;
  onBusyChange?: (busy: boolean) => void;
  hint?: string;
  /** Catalog key when this label is shared with another image field. */
  help?: string;
  /** Write imageUrl / imageKey / imageDriver inputs for server actions. */
  withHiddenFields?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [uncontrolled, setUncontrolled] = useState<UploadedImage | null>(
    initialValue,
  );
  const current = value !== undefined ? value : uncontrolled;
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const previewUrl = localPreview || current?.url || null;
  const uploading = progress !== null;

  useEffect(() => {
    onBusyChange?.(uploading);
  }, [onBusyChange, uploading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = useCallback(
    (next: UploadedImage | null) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    },
    [onChange, value],
  );

  const startUpload = useCallback(
    async (file: File) => {
      const validationError = validateClientFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (localPreview) URL.revokeObjectURL(localPreview);
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      setError(null);
      setProgress(0);

      try {
        const uploaded = await uploadWithProgress(
          file,
          folder,
          setProgress,
          controller.signal,
        );
        setValue(uploaded);
        setProgress(null);
        URL.revokeObjectURL(preview);
        setLocalPreview(null);
      } catch (uploadError) {
        if (controller.signal.aborted) return;
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Could not upload the image.",
        );
        setProgress(null);
        URL.revokeObjectURL(preview);
        setLocalPreview(null);
      }
    },
    [folder, localPreview, setValue],
  );

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void startUpload(file);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!uploading) setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (uploading) return;
    onFiles(event.dataTransfer.files);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-navy">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
        <FieldHelp label={label} help={help} />
      </div>

      {withHiddenFields ? (
        <>
          <input type="hidden" name="imageUrl" value={current?.url ?? ""} />
          <input type="hidden" name="imageKey" value={current?.key ?? ""} />
          <input
            type="hidden"
            name="imageDriver"
            value={current?.driver ?? ""}
          />
        </>
      ) : null}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label={
          previewUrl
            ? "Change image. Click or drop a new file to replace."
            : "Upload image. Click or drop a file."
        }
        onClick={() => {
          if (!uploading) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!uploading) inputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative overflow-hidden rounded-xl border border-dashed transition-colors",
          dragging
            ? "border-brand bg-brand-soft"
            : "border-line bg-surface hover:border-brand/50",
          uploading ? "cursor-wait" : "cursor-pointer",
        ].join(" ")}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col justify-end bg-navy/55 p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-white">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-150"
                    style={{ width: `${progress ?? 0}%` }}
                  />
                </div>
              </div>
            ) : dragging ? (
              <div className="absolute inset-0 flex items-center justify-center bg-brand/20">
                <p className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-navy shadow-sm">
                  Drop to replace
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-line">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16V4m0 0 4 4m-4-4-4 4M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"
                />
              </svg>
            </span>
            <p className="text-sm font-medium text-navy">
              {dragging ? "Drop image to upload" : "Drag & drop an image here"}
            </p>
            <p className="text-xs text-muted">or click to browse · max 5 MB</p>
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
