"use client";

import Image from "next/image";
import Link from "next/link";
import type { DestinationListCard } from "@/components/destination-list/types";

function listingLine(item: DestinationListCard) {
  const parts = [
    item.tourCount > 0 ? `${item.tourCount} tour${item.tourCount === 1 ? "" : "s"}` : "",
    item.hotelCount > 0 ? `${item.hotelCount} stay${item.hotelCount === 1 ? "" : "s"}` : "",
    item.rentalCount > 0 ? `${item.rentalCount} rental${item.rentalCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return parts;
}

export function DestinationProperties({
  destinations,
  selectedId,
  onSelect,
}: {
  destinations: DestinationListCard[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (destinations.length === 0) {
    return (
      <div className="col-12">
        <h3 className="text-18 lh-16 fw-500">No destinations match these filters</h3>
        <p className="text-15 text-light-1 mt-10">Try another place, country, or region.</p>
      </div>
    );
  }

  return (
    <>
      {destinations.map((item, index) => {
        const listings = listingLine(item);
        return (
          <div
            className="col-12"
            key={item.id}
            id={`destination-${item.id}`}
            data-aos="fade"
            data-aos-delay={(index % 6) * 100}
          >
            <div
              className={`destination-card border-top-light pt-20 ${selectedId === item.id ? "is-selected" : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedId === item.id}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest("a, button")) return;
                onSelect(item.id);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect(item.id);
              }}
            >
              <div className="row x-gap-20 y-gap-20">
                <div className="col-md-auto">
                  <div className="cardImage ratio ratio-1:1 w-200 md:w-1/1 rounded-4">
                    <div className="cardImage__content">
                      {item.imageUrl ? (
                        <Image
                          width={200}
                          height={200}
                          className="rounded-4 col-12"
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div className="rounded-4 bg-light-2 w-100 h-100" />
                      )}
                    </div>
                    <div className="cardImage__wishlist">
                      <button
                        type="button"
                        className="button -blue-1 bg-white size-30 rounded-full shadow-2"
                        aria-label="Save"
                        onClick={(event) => event.preventDefault()}
                      >
                        <i className="icon-heart text-12" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md">
                  <div className="row x-gap-10 items-center">
                    <div className="col-auto">
                      <p className="text-14 lh-14 mb-5">{item.country}</p>
                    </div>
                    {item.region ? (
                      <>
                        <div className="col-auto">
                          <div className="size-3 rounded-full bg-light-1 mb-5" />
                        </div>
                        <div className="col-auto">
                          <p className="text-14 lh-14 mb-5">{item.region}</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <h3 className="text-16 lh-16 fw-500">{item.name}</h3>
                  <p className="text-14 lh-14 mt-5">
                    {item.parentName ? `In ${item.parentName}` : item.summary}
                  </p>
                  {item.parentName && item.summary ? (
                    <div className="text-14 lh-15 fw-500 mt-20">{item.summary}</div>
                  ) : null}
                  {item.placeNames.length > 0 ? (
                    <div className="text-14 text-green-2 fw-500 lh-15 mt-5">
                      Places: {item.placeNames.join(", ")}
                    </div>
                  ) : item.popular ? (
                    <div className="text-14 text-green-2 fw-500 lh-15 mt-5">Popular destination</div>
                  ) : null}
                </div>

                <div className="col-md-auto text-right md:text-left">
                  {listings.map((line) => (
                    <div className="text-14 lh-14 text-light-1 mt-5" key={line}>
                      {line}
                    </div>
                  ))}
                  <Link
                    href={item.href}
                    className="button py-10 px-24 -dark-1 bg-blue-1 text-white mt-15"
                  >
                    View Detail <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
