"use client";

import { CountFilter } from "@/components/hotel-list/sidebar/Filters";
import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import { MainFilterSearchBox } from "@/components/tour-list/tour-list-v2/MainFilterSearchBox";
import type { TourListLocation } from "@/components/tour-list/types";
import type { DateObject } from "react-multi-date-picker";

export type TourListFilters = {
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
  locations,
  location,
  onLocation,
  dates,
  onDates,
  categories,
  others,
  durations,
  languages,
}: {
  filters: TourListFilters;
  onChange: (next: TourListFilters) => void;
  priceMax: number;
  currency: string;
  locations: TourListLocation[];
  location: string;
  onLocation: (value: string) => void;
  dates: DateObject[];
  onDates: (dates: DateObject[]) => void;
  categories: { label: string; count: number }[];
  others: { label: string; count: number }[];
  durations: { label: string; count: number }[];
  languages: { label: string; count: number }[];
}) {
  const patch = (next: Partial<TourListFilters>) => onChange({ ...filters, ...next });

  return (
    <>
      <div className="sidebar__item -no-border">
        <div className="px-20 py-20 bg-light-2 rounded-4">
          <h5 className="text-18 fw-500 mb-10">Search Tours</h5>
          <div className="row y-gap-20 pt-20">
            <MainFilterSearchBox
              locations={locations}
              location={location}
              onLocation={onLocation}
              dates={dates}
              onDates={onDates}
            />
          </div>
        </div>
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
