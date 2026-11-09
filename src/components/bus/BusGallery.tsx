"use client";

import { useEffect, useRef, useState } from "react";
import { usePhotoSwipe } from "@/hooks/usePhotoSwipe";

export function BusGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const photos = images.filter(Boolean);
  const count = Math.min(photos.length, 3);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((value) => (value === null ? value : Math.min(photos.length - 1, value + 1)));
      if (event.key === "ArrowLeft") setOpen((value) => (value === null ? value : Math.max(0, value - 1)));
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, photos.length]);

  if (!photos.length) return null;

  const onScroll = () => {
    const el = track.current;
    if (!el || el.clientWidth < 1) return;
    const index = Math.min(photos.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)));
    setActive((current) => (current === index ? current : index));
  };

  const go = (index: number) => {
    const el = track.current;
    setActive(index);
    el?.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const lightSwipe = usePhotoSwipe({
    enabled: open !== null && photos.length > 1,
    ignore: "button",
    onStep: (direction) => {
      setOpen((value) => {
        if (value === null) return value;
        const next = value + direction;
        if (next < 0 || next >= photos.length) return value;
        return next;
      });
    },
  });

  return (
    <>
      <div className={`bus-photos bus-photos--${count}`}>
        <div
          className="bus-photos__track"
          ref={track}
          onScroll={onScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${name} photos`}
        >
          {photos.map((src, index) => (
            <button
              type="button"
              className={index < 3 && (index === 2 || photos.length === 1) ? "bus-photos__all" : undefined}
              key={`${src}-${index}`}
              aria-label={`Photo ${index + 1} of ${photos.length}`}
              onClick={() => setOpen(index)}
            >
              <img src={src} alt={index === 0 ? `${name} coach` : ""} />
            </button>
          ))}
        </div>
        {photos.length > 1 ? (
          <>
            <span className="bus-photos__count">
              {active + 1} / {photos.length}
            </span>
            <div className="bus-photos__dots" role="tablist" aria-label={`${name} photos`}>
              {photos.map((src, index) => (
                <button
                  key={`${src}-dot-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={`Photo ${index + 1} of ${photos.length}`}
                  className={index === active ? "is-on" : undefined}
                  onClick={() => go(index)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {open !== null ? (
        <div
          className="bus-light"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          onPointerDown={lightSwipe.onPointerDown}
          onPointerUp={lightSwipe.onPointerUp}
          onPointerCancel={lightSwipe.onPointerCancel}
        >
          <button type="button" className="bus-light__close" onClick={() => setOpen(null)}>
            Close
          </button>
          {photos.length > 1 && open > 0 ? (
            <button type="button" className="bus-light__nav bus-light__prev" aria-label="Previous photo" onClick={() => setOpen(open - 1)}>
              ‹
            </button>
          ) : null}
          {photos.length > 1 && open < photos.length - 1 ? (
            <button type="button" className="bus-light__nav bus-light__next" aria-label="Next photo" onClick={() => setOpen(open + 1)}>
              ›
            </button>
          ) : null}
          <figure>
            <img src={photos[open] ?? photos[0]} alt="" />
            {photos.length > 1 ? (
              <figcaption>
                {open + 1} / {photos.length}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </>
  );
}
