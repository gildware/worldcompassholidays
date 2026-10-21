"use client";

import { useEffect, useState } from "react";

type Photo = { id: string; url: string };

export function RentalGallery({ images, name }: { images: Photo[]; name: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const current = images[Math.min(active, Math.max(count - 1, 0))];

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setActive((index) => (index + 1) % count);
      if (event.key === "ArrowLeft") setActive((index) => (index - 1 + count) % count);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [count, open]);

  if (!current) {
    return <div className="rental-detail__hero rental-detail__hero--empty">No photos yet</div>;
  }

  return (
    <>
      <div className="rental-gallery">
        <button type="button" className="rental-gallery__hero" onClick={() => setOpen(true)}>
          {/* Uploads may be local files or remote URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={name} />
          <span className="rental-gallery__count">
            {active + 1} / {count}
          </span>
        </button>
        {count > 1 ? (
          <div className="rental-gallery__thumbs" role="list">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                role="listitem"
                className={index === active ? "is-on" : ""}
                aria-label={`Photo ${index + 1}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {open ? (
        <div className="rental-lightbox" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
          <button type="button" className="rental-lightbox__close" onClick={() => setOpen(false)} aria-label="Close photos">
            ×
          </button>
          {count > 1 ? (
            <button
              type="button"
              className="rental-lightbox__nav is-prev"
              aria-label="Previous photo"
              onClick={() => setActive((index) => (index - 1 + count) % count)}
            >
              ‹
            </button>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={name} />
          {count > 1 ? (
            <button
              type="button"
              className="rental-lightbox__nav is-next"
              aria-label="Next photo"
              onClick={() => setActive((index) => (index + 1) % count)}
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
