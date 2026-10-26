"use client";

import { useState } from "react";

export function BusGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const photos = images.filter(Boolean);
  if (!photos.length) return null;
  const count = Math.min(photos.length, 3);

  return (
    <>
      <div className={`bus-photos bus-photos--${count}`}>
        {photos.slice(0, 3).map((src, index) => (
          <button
            type="button"
            className={index === 2 || photos.length === 1 ? "bus-photos__all" : undefined}
            key={src}
            onClick={() => setOpen(index)}
          >
            <img src={src} alt={index === 0 ? `${name} coach` : ""} />
          </button>
        ))}
      </div>
      {open !== null ? (
        <div className="bus-light" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
          <button type="button" onClick={() => setOpen(null)}>
            Close
          </button>
          <figure>
            <img src={photos[open] ?? photos[0]} alt="" />
          </figure>
        </div>
      ) : null}
    </>
  );
}
