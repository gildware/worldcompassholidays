"use client";

import { CountFilter, DealsFilter, GuestRatingFilters, RatingsFilter } from "@/components/hotel-list/sidebar/Filters";
import { Map } from "@/components/hotel-list/sidebar/Map";
import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import { SearchBox } from "@/components/hotel-list/sidebar/SearchBox";
import type { CountOption } from "@/components/hotel-list/types";

export type HotelListFilters = {
  query: string;
  stars: number | null;
  price: [number, number];
  deals: string[];
  popular: string[];
  amenities: string[];
  guestRating: string;
  styles: string[];
  neighborhoods: string[];
};

export function Sidebar({
  filters,
  onChange,
  priceMax,
  currency,
  group,
  deals,
  popular,
  amenities,
  guestRatings,
  styles,
  neighborhoods,
}: {
  filters: HotelListFilters;
  onChange: (next: HotelListFilters) => void;
  priceMax: number;
  currency: string;
  group: string;
  deals: CountOption[];
  popular: CountOption[];
  amenities: CountOption[];
  guestRatings: { label: string; value: string; count: number }[];
  styles: CountOption[];
  neighborhoods: CountOption[];
}) {
  const patch = (next: Partial<HotelListFilters>) => onChange({ ...filters, ...next });

  return (
    <>
      <div className="sidebar__item -no-border position-relative">
        <Map />
      </div>

      <div className="sidebar__item -no-border">
        <h5 className="text-18 fw-500 mb-10">Search by property name</h5>
        <SearchBox value={filters.query} onChange={(query) => patch({ query })} />
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Deals</h5>
        <div className="sidebar-checkbox">
          <div className="row y-gap-5 items-center">
            <DealsFilter options={deals} selected={filters.deals} onChange={(deals) => patch({ deals })} />
          </div>
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Popular Filters</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={popular}
            selected={filters.popular}
            onChange={(popular) => patch({ popular })}
          />
        </div>
      </div>

      <div className="sidebar__item pb-30">
        <h5 className="text-18 fw-500 mb-10">Nightly Price</h5>
        <div className="row x-gap-10 y-gap-30">
          <div className="col-12">
            <PriceSlider
              price={filters.price}
              max={priceMax}
              currency={currency}
              onChange={(price) => patch({ price })}
            />
          </div>
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Aminities</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={amenities}
            selected={filters.amenities}
            onChange={(amenities) => patch({ amenities })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Star Rating</h5>
        <div className="row x-gap-10 y-gap-10 pt-10">
          <RatingsFilter active={filters.stars} onChange={(stars) => patch({ stars })} />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Guest Rating</h5>
        <div className="sidebar-checkbox">
          <GuestRatingFilters
            options={guestRatings}
            value={filters.guestRating}
            group={group}
            onChange={(guestRating) => patch({ guestRating })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Style</h5>
        <div className="sidebar-checkbox">
          <CountFilter options={styles} selected={filters.styles} onChange={(styles) => patch({ styles })} />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Neighborhood</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={neighborhoods}
            selected={filters.neighborhoods}
            onChange={(neighborhoods) => patch({ neighborhoods })}
          />
        </div>
      </div>
    </>
  );
}
