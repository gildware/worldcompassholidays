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
import { ImageCropDialog } from "@/components/ui/ImageCropDialog";
import type { ImageFolder } from "@/lib/storage/folders";
import type { UploadedImage } from "@/lib/storage/types";
import type { ImageFrame } from "@/lib/tours/image-frames";

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

function uploadOnce(
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

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      signal.removeEventListener("abort", onAbort);
      let payload: (UploadedImage & { error?: string }) | null = null;
      try {
        payload = JSON.parse(xhr.responseText) as UploadedImage & {
          error?: string;
        };
      } catch {
        payload = null;
      }
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
          payload?.error ||
            (xhr.status
              ? `Upload failed (${xhr.status}).`
              : "The upload did not reach the server. Try again."),
        ),
      );
    };

    xhr.onerror = () => {
      signal.removeEventListener("abort", onAbort);
      if (signal.aborted) {
        reject(new Error("Upload cancelled."));
        return;
      }
      reject(
        new Error(
          "The upload did not reach the server. Check your connection and try again.",
        ),
      );
    };

    xhr.onabort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Upload cancelled."));
    };

    xhr.send(body);
  });
}

function uploadWithProgress(
  file: File,
  folder: ImageFolder,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<UploadedImage> {
  return uploadOnce(file, folder, onProgress, signal).catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    if (signal.aborted || !message.includes("did not reach the server")) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (signal.aborted) throw new Error("Upload cancelled.");
    return uploadOnce(file, folder, onProgress, signal);
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
  error: externalError = null,
  fieldName,
  withHiddenFields = true,
  compact = false,
  tile = false,
  multiple = false,
  frame,
  className,
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
  /** Parent form validation message (shown below the drop zone). */
  error?: string | null;
  /** Stable key for scroll-to-error targeting (`data-field`). */
  fieldName?: string;
  /** Write imageUrl / imageKey / imageDriver inputs for server actions. */
  withHiddenFields?: boolean;
  /** Square drop zone for a side-by-side row. */
  compact?: boolean;
  /** Smaller empty state, for a tile inside a gallery grid. */
  tile?: boolean;
  /** Let the file picker accept more than one image. Each one is uploaded in order. */
  multiple?: boolean;
  /**
   * Shape this photo is shown in. Turns on cropping to that ratio and
   * sizes the drop zone to match.
   */
  frame?: ImageFrame;
  className?: string;
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
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const batchId = useRef(0);
  const batch = useRef({ total: 0, done: 0 });

  const previewUrl = localPreview || current?.url || null;
  const aspectRatio = frame?.aspect ?? 16 / 10;
  const uploading = progress !== null;
  const shownError = externalError || error;

  useEffect(() => {
    onBusyChange?.(uploading || cropQueue.length > 0);
  }, [onBusyChange, uploading, cropQueue.length]);

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

  const acceptFile = useCallback(
    async (file: File) => {
      const id = batchId.current;
      const rest = cropQueue.slice(1);
      batch.current.done += 1;
      setCropQueue([]);
      await startUpload(file);
      if (batchId.current !== id) return;
      if (rest.length > 0) setCropQueue(rest);
    },
    [cropQueue, startUpload],
  );

  function cancelCrop() {
    batchId.current += 1;
    batch.current = { total: 0, done: 0 };
    setCropQueue([]);
  }

  async function onFiles(files: FileList | null) {
    const chosen = Array.from(files ?? []);
    if (chosen.length === 0 || uploading || cropQueue.length > 0) return;
    const list = multiple ? chosen : chosen.slice(0, 1);
    const croppable: File[] = [];

    for (const file of list) {
      const validationError = validateClientFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      if (!frame || file.type === "image/gif") {
        await startUpload(file);
      } else {
        croppable.push(file);
      }
    }

    if (croppable.length === 0) return;
    batchId.current += 1;
    batch.current = { total: croppable.length, done: 0 };
    setCropQueue(croppable);
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
    <div
      className={[
        "flex flex-col gap-2",
        compact ? "w-44 self-start" : "w-full",
        className ?? "",
      ].join(" ")}
      data-field={fieldName}
    >
      {label ? (
        <div className="flex items-center gap-1.5">
          <label htmlFor={inputId} className="text-sm font-medium text-navy">
            {label}
            {required ? (
              <span className="ml-0.5 text-red-600" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          <FieldHelp label={label} help={help} />
        </div>
      ) : null}

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
        multiple={multiple}
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
          if (!uploading && cropQueue.length === 0) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!uploading && cropQueue.length === 0) inputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative overflow-hidden rounded-xl border border-dashed transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          dragging
            ? "border-brand bg-brand-soft focus-visible:outline-brand"
            : shownError
              ? "border-red-500 bg-surface !outline-none focus:!outline-none focus-visible:!outline-none focus:!shadow-[0_0_0_2px_#ef4444] focus-visible:!shadow-[0_0_0_2px_#ef4444]"
              : "border-line bg-surface hover:border-brand/50 focus-visible:outline-brand",
          uploading ? "cursor-wait" : "cursor-pointer",
          compact ? "size-44" : "w-full",
        ].join(" ")}
      >
        {compact ? null : (
          <div aria-hidden className="w-full" style={{ aspectRatio: String(aspectRatio) }} />
        )}
        <div className="absolute inset-0">
        {frame && !tile ? (
          <span className="absolute top-2 left-2 z-10 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-navy">
            {frame.label}
          </span>
        ) : null}
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
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
          <div
            className={[
              "absolute inset-0 flex flex-col items-center overflow-hidden px-2 text-center",
              compact || tile ? "justify-center gap-1" : "justify-start gap-2 px-3 pt-8",
            ].join(" ")}
          >
            <span
              className={[
                "flex items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-line",
                tile ? "h-6 w-6" : "h-10 w-10",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                className={tile ? "h-3.5 w-3.5" : "h-5 w-5"}
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
            <p className={compact || tile ? "text-xs font-medium text-navy" : "text-sm font-medium text-navy"}>
              {dragging
                ? "Drop image"
                : tile
                  ? "Add"
                  : compact
                    ? "Add image"
                    : "Drag & drop an image here"}
            </p>
            {compact || tile ? null : (
              <p className="text-xs text-muted">
                {tile
                  ? frame
                    ? `Crop to ${frame.label} · max 5 MB`
                    : "Click or drop · max 5 MB"
                  : frame
                    ? `or click to browse · crop to ${frame.label} · max 5 MB`
                    : "or click to browse · max 5 MB"}
              </p>
            )}
          </div>
        )}
        </div>
      </div>

      {shownError ? (
        <p role="alert" className="text-xs text-red-700">
          {shownError}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}

      {frame && cropQueue[0] ? (
        <ImageCropDialog
          file={cropQueue[0]}
          aspect={frame.aspect}
          outputWidth={frame.outputWidth}
          ratioLabel={frame.label}
          positionLabel={
            batch.current.total > 1
              ? `Photo ${batch.current.done + 1} of ${batch.current.total}`
              : undefined
          }
          onConfirm={(file) => void acceptFile(file)}
          onUseOriginal={() => {
            const original = cropQueue[0];
            if (original) void acceptFile(original);
          }}
          onCancel={cancelCrop}
        />
      ) : null}
    </div>
  );
}
