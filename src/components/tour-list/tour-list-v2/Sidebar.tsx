"use client";

import { CountFilter } from "@/components/hotel-list/sidebar/Filters";
import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import { SearchBox } from "@/components/hotel-list/sidebar/SearchBox";
import type { CountOption } from "@/components/hotel-list/types";

export type TourListFilters = {
  query: string;
  categories: string[];
  other: string[];
  price: [number, number];
  durations: string[];
  languages: string[];
};

export function Sidebar({
  filters,
  onChange,
  priceMax,
  currency,
  categories,
  others,
  durations,
  languages,
}: {
  filters: TourListFilters;
  onChange: (next: TourListFilters) => void;
  priceMax: number;
  currency: string;
  categories: CountOption[];
  others: CountOption[];
  durations: CountOption[];
  languages: CountOption[];
}) {
  const patch = (next: Partial<TourListFilters>) => onChange({ ...filters, ...next });

  return (
    <>
      <div className="sidebar__item -no-border">
        <h5 className="text-18 fw-500 mb-10">Search by tour name</h5>
        <SearchBox
          value={filters.query}
          onChange={(query) => patch({ query })}
          placeholder="e.g. Dal Lake"
        />
      </div>

      <div className="sidebar__item -no-border">
        <h5 className="text-18 fw-500 mb-10">Category Types</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={categories}
            selected={filters.categories}
            onChange={(categories) => patch({ categories })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Other</h5>
        <div className="sidebar-checkbox">
          <CountFilter options={others} selected={filters.other} onChange={(other) => patch({ other })} />
        </div>
      </div>

      <div className="sidebar__item pb-30">
        <h5 className="text-18 fw-500 mb-10">Price</h5>
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
        <h5 className="text-18 fw-500 mb-10">Duration</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={durations}
            selected={filters.durations}
            onChange={(durations) => patch({ durations })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Languages</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={languages}
            selected={filters.languages}
            onChange={(languages) => patch({ languages })}
          />
        </div>
      </div>
    </>
  );
}
