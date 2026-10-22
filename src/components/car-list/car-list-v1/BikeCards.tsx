"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { CarListCard } from "@/components/car-list/types";
import { formatMoney } from "@/lib/format";
import { tagColor } from "@/lib/rentals/tag-colors";

function Mini({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {children}
    </svg>
  );
}

function PinIcon() {
  return (
    <Mini>
      <path d="M8 14.2s4.2-3.7 4.2-6.7a4.2 4.2 0 1 0-8.4 0c0 3 4.2 6.7 4.2 6.7Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="7.4" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </Mini>
  );
}

function GearIcon() {
  return (
    <Mini>
      <circle cx="8" cy="8" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.4v1.6M8 12v1.6M2.4 8h1.6M12 8h1.6M4 4l1.1 1.1M10.9 10.9 12 12M12 4l-1.1 1.1M5.1 10.9 4 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Mini>
  );
}

function RoadIcon() {
  return (
    <Mini>
      <path d="M5.2 2.2 3.2 13.8M10.8 2.2l2 11.6M8 4.2v1.6M8 8v1.6M8 11.8v1.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Mini>
  );
}

function DropIcon() {
  return (
    <Mini>
      <path d="M8 2.4s3.6 3.5 3.6 6.1a3.6 3.6 0 0 1-7.2 0C4.4 5.9 8 2.4 8 2.4Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </Mini>
  );
}

function TypeIcon() {
  return (
    <Mini>
      <circle cx="4.2" cy="11.2" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="11.2" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 11.2h3.6M8 11.2 6.2 6.4h4.1L12 9.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Mini>
  );
}

function SeatIcon() {
  return (
    <Mini>
      <path d="M5 13.2V8.4A1.6 1.6 0 0 1 6.6 6.8h.4A1.8 1.8 0 0 1 8.8 8.6V10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.8 10h2.2a2 2 0 0 1 2 2v1.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.2 13.2h8.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Mini>
  );
}

function gear(value: string) {
  if (/automatic/i.test(value)) return "Automatic";
  if (/manual/i.test(value)) return "Manual";
  return value;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <Mini>
      <path
        d={direction === "left" ? "M9.5 3.5 5.2 8l4.3 4.5" : "M6.5 3.5 10.8 8 6.5 12.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Mini>
  );
}

function CardPhotos({
  images,
  href,
  name,
  eager,
  fuel,
  tags,
}: {
  images: string[];
  href: string;
  name: string;
  eager: boolean;
  fuel: string;
  tags: string[];
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const dragged = useRef(false);
  const count = images.length;
  const current = Math.min(index, Math.max(count - 1, 0));

  const step = (delta: number) => {
    if (count < 2) return;
    setIndex((value) => (value + delta + count) % count);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    dragged.current = false;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (count < 2) return;
    const delta = event.clientX - startX.current;
    if (Math.abs(delta) < 28) return;
    dragged.current = true;
    step(delta < 0 ? 1 : -1);
  };

  return (
    <div className="bike-card__media" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {count > 0 ? (
        <Link
          href={href}
          className="bike-card__shot"
          aria-label={name}
          onClick={(event) => {
            if (!dragged.current) return;
            event.preventDefault();
            dragged.current = false;
          }}
        >
          <span className="bike-card__track" style={{ transform: `translateX(-${current * 100}%)` }}>
            {images.map((src, slide) => (
              <span
                className={`bike-card__frame${src.includes(".svg") ? " is-drawing" : " is-photo"}`}
                key={`${src}-${slide}`}
              >
                <Image
                  src={src}
                  alt={slide === 0 ? name : ""}
                  fill
                  loading={eager && slide === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 575px) 50vw, (max-width: 1199px) 33vw, 20vw"
                />
              </span>
            ))}
          </span>
        </Link>
      ) : (
        <div className="bike-card__fallback" />
      )}
      {count > 1 ? (
        <>
          <button
            type="button"
            className="bike-card__nav is-prev"
            aria-label="Previous photo"
            onClick={() => step(-1)}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className="bike-card__nav is-next"
            aria-label="Next photo"
            onClick={() => step(1)}
          >
            <Chevron direction="right" />
          </button>
          <div className="bike-card__dots" role="tablist" aria-label={`${name} photos`}>
            {images.map((src, slide) => (
              <button
                type="button"
                key={`${src}-dot-${slide}`}
                className={slide === current ? "is-on" : ""}
                role="tab"
                aria-selected={slide === current}
                aria-label={`Photo ${slide + 1}`}
                onClick={() => setIndex(slide)}
              />
            ))}
          </div>
        </>
      ) : null}
      {fuel ? (
        <span className="bike-card__fuel">
          <DropIcon />
          {fuel}
        </span>
      ) : null}
      {tags.length > 0 ? (
        <span className="bike-card__tags">
          {tags.map((tag) => (
            <span className="bike-card__tag" key={tag} style={{ background: tagColor(tag) }}>
              {tag}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

export function BikeCards({
  bikes,
  noun = "bikes",
  showSeats = false,
  detailQuery = "",
}: {
  bikes: CarListCard[];
  noun?: string;
  showSeats?: boolean;
  detailQuery?: string;
}) {
  if (bikes.length === 0) {
    return (
      <div className="bike-empty">
        <h3 className="text-16 fw-500">No {noun} match these filters</h3>
        <p className="text-14 text-light-1 mt-5">Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <>
      {bikes.map((item, index) => {
        const query = detailQuery ? `?${detailQuery}` : "";
        const href = `/rentals/${item.slug}${query}`;

        return (
          <article className="bike-card" key={item.id}>
            <CardPhotos
              images={item.images}
              href={href}
              name={item.name}
              eager={index < 8}
              fuel={item.fuel}
              tags={item.tags}
            />
            <Link href={href} className="bike-card__body">
              <div className="bike-card__topline">
                {item.category ? (
                  <p className="bike-card__kicker">
                    <TypeIcon />
                    {item.category}
                  </p>
                ) : (
                  <span />
                )}
                {item.location ? (
                  <p className="bike-card__place">
                    <PinIcon />
                    {item.location}
                  </p>
                ) : null}
              </div>
              <h3 className="bike-card__title">{item.name}</h3>
              <p className="bike-card__specs">
                {showSeats && item.seats > 0 ? (
                  <span>
                    <SeatIcon />
                    {item.seats} seats
                  </span>
                ) : null}
                {item.transmission ? (
                  <span>
                    <GearIcon />
                    {gear(item.transmission)}
                  </span>
                ) : null}
                {item.mileageLabel ? (
                  <span>
                    <RoadIcon />
                    {item.mileageLabel}
                  </span>
                ) : null}
              </p>
              <p className="bike-card__price">
                <strong>{formatMoney(item.price, item.currency)}</strong>
                <span>/ day</span>
              </p>
            </Link>
            <Link href={href} className="bike-card__book">
              View more
            </Link>
          </article>
        );
      })}
    </>
  );
}
