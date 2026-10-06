"use client";

import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import { MultiSearchableSelect } from "@/components/ui/SearchableSelect";

export type TourListFilters = {
  query: string;
  categories: string[];
  price: [number, number];
  durations: string[];
};

type FilterOption = {
  value: string;
  label: string;
};

function SelectedPills({
  values,
  options,
  onRemove,
}: {
  values: string[];
  options: FilterOption[];
  onRemove: (value: string) => void;
}) {
  const chosen = values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is FilterOption => Boolean(option));
  if (chosen.length === 0) return null;

  return (
    <div className="tour-select-pills">
      {chosen.map((option) => (
        <span key={option.value} className="tour-select-pill">
          {option.label}
          <button type="button" aria-label={`Remove ${option.label}`} onClick={() => onRemove(option.value)}>
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function clampPrice(next: [number, number], min: number, max: number): [number, number] {
  const low = Math.min(Math.max(Math.round(next[0]), min), max);
  const high = Math.min(Math.max(Math.round(next[1]), min), max);
  return low <= high ? [low, high] : [high, low];
}

export function Sidebar({
  filters,
  onChange,
  priceMin,
  priceMax,
  priceStep,
  currency,
  categories,
  durations,
}: {
  filters: TourListFilters;
  onChange: (next: TourListFilters) => void;
  priceMin: number;
  priceMax: number;
  priceStep: number;
  currency: string;
  categories: FilterOption[];
  durations: FilterOption[];
}) {
  const patch = (next: Partial<TourListFilters>) => onChange({ ...filters, ...next });
  const setPrice = (next: [number, number]) => patch({ price: clampPrice(next, priceMin, priceMax) });

  return (
    <>
      <div className="sidebar__item -no-border">
        <h5 className="text-15 fw-500 mb-5">Tour Types</h5>
        <SelectedPills
          values={filters.categories}
          options={categories}
          onRemove={(value) => patch({ categories: filters.categories.filter((item) => item !== value) })}
        />
        <MultiSearchableSelect
          values={filters.categories}
          onChange={(categories) => patch({ categories })}
          options={categories}
          placeholder="All tour types"
          searchPlaceholder="Search tour types"
          ariaLabel="Tour types"
          menuClassName="tour-select-menu"
          hideChips
        />
      </div>

      <div className="sidebar__item">
        <h5 className="text-15 fw-500 mb-5">Price</h5>
        <div className="tour-price-range">
          <label className="tour-price-range__field">
            <span>Min</span>
            <input
              type="number"
              inputMode="numeric"
              min={priceMin}
              max={filters.price[1]}
              value={filters.price[0]}
              aria-label="Minimum price"
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                setPrice([next, filters.price[1]]);
              }}
            />
          </label>
          <label className="tour-price-range__field">
            <span>Max</span>
            <input
              type="number"
              inputMode="numeric"
              min={filters.price[0]}
              max={priceMax}
              value={filters.price[1]}
              aria-label="Maximum price"
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                setPrice([filters.price[0], next]);
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
      </div>

      <div className="sidebar__item">
        <h5 className="text-15 fw-500 mb-5">Duration</h5>
        <SelectedPills
          values={filters.durations}
          options={durations}
          onRemove={(value) => patch({ durations: filters.durations.filter((item) => item !== value) })}
        />
        <MultiSearchableSelect
          values={filters.durations}
          onChange={(durations) => patch({ durations })}
          options={durations}
          placeholder="Any duration"
          searchPlaceholder="Search duration"
          ariaLabel="Duration"
          menuClassName="tour-select-menu"
          hideChips
        />
      </div>
    </>
  );
}
