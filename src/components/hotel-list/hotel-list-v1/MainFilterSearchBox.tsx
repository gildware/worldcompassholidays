"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "rc-slider/assets/index.css";
import { LocationSearch } from "@/components/hotel-list/common/LocationSearch";
import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import {
  FilterChoiceChips,
  FilterLocationField,
  FilterPriceField,
  FilterSheet,
  FilterSheetClear,
} from "@/components/listing/FilterSheet";
import type { HotelListFilters } from "@/components/hotel-list/hotel-list-v1/query";
import type { HotelListLocation } from "@/components/hotel-list/types";
import { formatMoney } from "@/lib/format";

type FilterOption = {
  value: string;
  label: string;
};

function summarize(values: string[], options: FilterOption[], empty: string) {
  const labels = values
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter((label): label is string => Boolean(label));
  return labels.length > 0 ? labels.join(", ") : empty;
}

function FilterMenu({
  label,
  summary,
  wide,
  children,
}: {
  label: string;
  summary: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="searchMenu-guests tour-mast-field px-30 lg:py-20 lg:px-0" ref={rootRef}>
      <button
        type="button"
        className="tour-mast-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-15 fw-500 ls-2 lh-16">{label}</span>
        <span className="text-15 text-light-1 ls-2 lh-16 tour-mast-value">{summary}</span>
      </button>
      {open ? <div className={`tour-mast-menu${wide ? " tour-mast-menu--wide" : ""}`}>{children}</div> : null}
    </div>
  );
}

function ChoiceList({
  options,
  values,
  onChange,
}: {
  options: FilterOption[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  if (options.length === 0) {
    return <p className="text-14 text-light-1 mb-0">No options</p>;
  }

  return (
    <ul className="tour-mast-choices">
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <li key={option.value}>
            <button type="button" aria-pressed={selected} onClick={() => toggle(option.value)}>
              <span className="tour-mast-check" data-checked={selected ? "true" : "false"} />
              {option.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function clampPrice(next: [number, number], min: number, max: number): [number, number] {
  const low = Math.min(Math.max(Math.round(next[0]), min), max);
  const high = Math.min(Math.max(Math.round(next[1]), min), max);
  return low <= high ? [low, high] : [high, low];
}

export function MainFilterSearchBox({
  locations,
  location,
  onLocation,
  types,
  stars,
  filters,
  onFilters,
  priceMin,
  priceMax,
  priceStep,
  currency,
  onClear,
  sheet = false,
}: {
  locations: HotelListLocation[];
  location: string;
  onLocation: (value: string) => void;
  types: FilterOption[];
  stars: FilterOption[];
  filters: HotelListFilters;
  onFilters: (next: HotelListFilters) => void;
  priceMin: number;
  priceMax: number;
  priceStep: number;
  currency: string;
  onClear: () => void;
  sheet?: boolean;
}) {
  const setPrice = (next: [number, number]) => onFilters({ ...filters, price: clampPrice(next, priceMin, priceMax) });
  const low = Math.min(filters.price[0], filters.price[1]);
  const high = Math.max(filters.price[0], filters.price[1]);
  const filtered =
    location.trim().length > 0 ||
    filters.query.trim().length > 0 ||
    filters.types.length > 0 ||
    filters.stars.length > 0 ||
    low > priceMin ||
    high < priceMax;

  if (sheet) {
    return (
      <FilterSheet>
        <FilterLocationField locations={locations} value={location} onChange={onLocation} />
        <FilterChoiceChips
          label="Property type"
          anyLabel="All types"
          options={types}
          values={filters.types}
          onChange={(next) => onFilters({ ...filters, types: next })}
        />
        <FilterPriceField
          low={low}
          high={high}
          min={priceMin}
          max={priceMax}
          step={priceStep}
          currency={currency}
          onChange={setPrice}
        />
        <FilterChoiceChips
          label="Stars"
          anyLabel="Any stars"
          options={stars}
          values={filters.stars}
          onChange={(next) => onFilters({ ...filters, stars: next })}
        />
        {filtered ? <FilterSheetClear onClick={onClear} /> : null}
      </FilterSheet>
    );
  }

  return (
    <div
      className={`mainSearch tour-search -fields-4 bg-white px-10 lg:px-20 rounded-100${
        filtered ? " -has-clear" : ""
      }`}
    >
      <div className="button-grid items-center">
        <LocationSearch locations={locations} value={location} onChange={onLocation} />

        <FilterMenu label="Property type" summary={summarize(filters.types, types, "All property types")}>
          <ChoiceList
            options={types}
            values={filters.types}
            onChange={(next) => onFilters({ ...filters, types: next })}
          />
        </FilterMenu>

        <FilterMenu label="Price" wide summary={`${formatMoney(low, currency)} – ${formatMoney(high, currency)}`}>
          <div className="tour-price-range">
            <label className="tour-price-range__field">
              <span>Min</span>
              <input
                type="number"
                inputMode="numeric"
                min={priceMin}
                max={high}
                value={low}
                aria-label="Minimum price"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  setPrice([next, high]);
                }}
              />
            </label>
            <label className="tour-price-range__field">
              <span>Max</span>
              <input
                type="number"
                inputMode="numeric"
                min={low}
                max={priceMax}
                value={high}
                aria-label="Maximum price"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  setPrice([low, next]);
                }}
              />
            </label>
          </div>
          <PriceSlider
            price={filters.price}
            min={priceMin}
            max={priceMax}
            step={priceStep}
            currency={currency}
            showReadout={false}
            onChange={setPrice}
          />
        </FilterMenu>

        <FilterMenu label="Stars" summary={summarize(filters.stars, stars, "Any stars")}>
          <ChoiceList
            options={stars}
            values={filters.stars}
            onChange={(next) => onFilters({ ...filters, stars: next })}
          />
        </FilterMenu>

        {filtered ? (
          <div className="button-item">
            <button type="button" className="tour-mast-clear" onClick={onClear}>
              Clear
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
