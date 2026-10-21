import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CarListCard } from "@/components/car-list/types";
import { formatMoney } from "@/lib/format";

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

export function BikeCards({
  bikes,
  noun = "bikes",
  showSeats = false,
}: {
  bikes: CarListCard[];
  noun?: string;
  showSeats?: boolean;
}) {
  if (bikes.length === 0) {
    return (
      <div className="bike-empty">
        <h3 className="text-16 fw-500">No {noun} match these filters</h3>
        <p className="text-14 text-light-1 mt-5">Try another type or fuel.</p>
      </div>
    );
  }

  return (
    <>
      {bikes.map((item, index) => {
        const href = `/rentals/${item.slug}`;
        const photo = item.images[0] ?? "";
        const drawing = photo.includes(".svg");

        return (
          <Link href={href} className="bike-card" key={item.id}>
            <div className={`bike-card__media${drawing ? " is-drawing" : " is-photo"}`}>
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  width={640}
                  height={400}
                  loading={index < 8 ? "eager" : "lazy"}
                  sizes="(max-width: 575px) 50vw, (max-width: 1199px) 33vw, 20vw"
                />
              ) : (
                <div className="bike-card__fallback" />
              )}
              {item.fuel ? (
                <span className="bike-card__fuel">
                  <DropIcon />
                  {item.fuel}
                </span>
              ) : null}
            </div>
            <div className="bike-card__body">
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
            </div>
          </Link>
        );
      })}
    </>
  );
}
