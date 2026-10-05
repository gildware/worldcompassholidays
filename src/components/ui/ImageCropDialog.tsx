"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const MAX_BYTES = 5 * 1024 * 1024;

type Size = { w: number; h: number };
type Rect = { x: number; y: number; w: number; h: number };
type Corner = "nw" | "ne" | "sw" | "se";
type Drag =
  | { kind: "move"; x: number; y: number; crop: Rect }
  | { kind: Corner; x: number; y: number; crop: Rect };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Largest frame of `aspect` inside the photo, pulled in so the border is visible. */
function initialCrop(imageW: number, imageH: number, aspect: number): Rect {
  const inset = 0.86;
  let w = imageW / imageH > aspect ? imageH * inset * aspect : imageW * inset;
  let h = w / aspect;
  if (w > imageW) {
    w = imageW;
    h = w / aspect;
  }
  if (h > imageH) {
    h = imageH;
    w = h * aspect;
  }
  return { x: (imageW - w) / 2, y: (imageH - h) / 2, w, h };
}

function moveCrop(base: Rect, dx: number, dy: number, image: Size): Rect {
  return {
    ...base,
    x: clamp(base.x + dx, 0, Math.max(0, image.w - base.w)),
    y: clamp(base.y + dy, 0, Math.max(0, image.h - base.h)),
  };
}

function resizeCrop(
  base: Rect,
  corner: Corner,
  dx: number,
  dy: number,
  image: Size,
  aspect: number,
): Rect {
  const min = Math.min(48, image.w, image.h * aspect);
  const right = base.x + base.w;
  const bottom = base.y + base.h;
  const growX = corner === "ne" || corner === "se" ? dx : -dx;
  const growY = corner === "sw" || corner === "se" ? dy : -dy;
  let width =
    Math.abs(growX) >= Math.abs(growY) ? base.w + growX : (base.h + growY) * aspect;
  width = clamp(width, min, image.w);
  let height = width / aspect;
  if (height > image.h) {
    height = image.h;
    width = height * aspect;
  }

  let x = corner === "nw" || corner === "sw" ? right - width : base.x;
  let y = corner === "nw" || corner === "ne" ? bottom - height : base.y;
  x = clamp(x, 0, image.w - width);
  y = clamp(y, 0, image.h - height);
  return { x, y, w: width, h: height };
}

function fileFromBlob(blob: Blob, sourceName: string) {
  const type = blob.type || "image/jpeg";
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  const ext =
    type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${base}.${ext}`, { type, lastModified: Date.now() });
}

const corners: { id: Corner; className: string; cursor: string }[] = [
  { id: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "nwse-resize" },
  { id: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2", cursor: "nesw-resize" },
  { id: "sw", className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2", cursor: "nesw-resize" },
  { id: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2", cursor: "nwse-resize" },
];

export function ImageCropDialog({
  file,
  aspect,
  outputWidth,
  ratioLabel,
  positionLabel,
  onConfirm,
  onUseOriginal,
  onCancel,
}: {
  file: File;
  aspect: number;
  outputWidth: number;
  ratioLabel: string;
  positionLabel?: string;
  onConfirm: (file: File) => void;
  onUseOriginal: () => void;
  onCancel: () => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<Size | null>(null);
  const [shown, setShown] = useState<Size | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    setNatural(null);
    setShown(null);
    setCrop(null);
    setError(null);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const measure = () => {
      const width = image.clientWidth;
      const height = image.clientHeight;
      if (width > 0 && height > 0) setShown({ w: width, h: height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(image);
    return () => observer.disconnect();
  }, [url, natural]);

  function scaleOf() {
    if (!natural || !shown || natural.w === 0) return 1;
    return shown.w / natural.w;
  }

  function onPointerMove(event: ReactPointerEvent) {
    const drag = dragRef.current;
    if (!drag || !natural) return;
    const scale = scaleOf();
    const dx = (event.clientX - drag.x) / scale;
    const dy = (event.clientY - drag.y) / scale;
    const next =
      drag.kind === "move"
        ? moveCrop(drag.crop, dx, dy, natural)
        : resizeCrop(drag.crop, drag.kind, dx, dy, natural, aspect);
    setCrop(next);
  }

  function endDrag() {
    dragRef.current = null;
  }

  function beginDrag(event: ReactPointerEvent, drag: Drag) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = drag;
  }

  async function confirmCrop() {
    const image = imageRef.current;
    if (!image || !natural || !crop) return;

    setExporting(true);
    setError(null);
    try {
      const outW = Math.max(1, Math.round(Math.min(outputWidth, crop.w)));
      const outH = Math.max(1, Math.round(outW / aspect));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not crop this image.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, outW, outH);

      const type =
        file.type === "image/png" || file.type === "image/webp"
          ? file.type
          : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), type, 0.92);
      });
      if (!blob) throw new Error("Could not crop this image.");
      if (blob.size > MAX_BYTES) {
        throw new Error("Cropped image is over 5 MB. Select a smaller area, or upload the original.");
      }
      onConfirm(fileFromBlob(blob, file.name));
    } catch (cropError) {
      setError(
        cropError instanceof Error ? cropError.message : "Could not crop this image.",
      );
      setExporting(false);
    }
  }

  const scale = scaleOf();
  const box =
    crop && scale
      ? {
          left: crop.x * scale,
          top: crop.y * scale,
          width: crop.w * scale,
          height: crop.h * scale,
        }
      : null;

  return (
    <Modal
      open
      onClose={onCancel}
      preventClose={exporting}
      size="lg"
      title="Crop image"
      description={
        positionLabel
          ? `${positionLabel}. Drag the rectangle to choose the ${ratioLabel} area. Drag a corner to resize it.`
          : `Drag the rectangle to choose the ${ratioLabel} area. Drag a corner to resize it.`
      }
    >
      <div className="grid gap-4">
        <div className="flex justify-center rounded-lg bg-navy p-3">
          <div className="relative inline-block max-w-full touch-none select-none">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={url}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  const width = event.currentTarget.naturalWidth;
                  const height = event.currentTarget.naturalHeight;
                  setNatural({ w: width, h: height });
                  setCrop(initialCrop(width, height, aspect));
                }}
                className="block max-h-[52vh] max-w-full"
              />
            ) : null}
            {box ? (
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]"
                  style={{ ...box, cursor: exporting ? "default" : "move" }}
                  onPointerDown={(event) => {
                    if (!crop || exporting) return;
                    beginDrag(event, {
                      kind: "move",
                      x: event.clientX,
                      y: event.clientY,
                      crop,
                    });
                  }}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <div className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/50" />
                  <div className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/50" />
                  <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/50" />
                  <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/50" />
                  {corners.map((corner) => (
                    <span
                      key={corner.id}
                      role="presentation"
                      className={`absolute z-10 size-3.5 rounded-sm border-2 border-navy bg-white ${corner.className}`}
                      style={{ cursor: corner.cursor }}
                      onPointerDown={(event) => {
                        if (!crop || exporting) return;
                        beginDrag(event, {
                          kind: corner.id,
                          x: event.clientX,
                          y: event.clientY,
                          crop,
                        });
                      }}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-xs text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onUseOriginal}
            disabled={exporting}
          >
            Upload original
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void confirmCrop()}
            disabled={exporting || !crop}
          >
            {exporting ? "Cropping…" : "Crop and upload"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
