"use client";

import type { ReactNode } from "react";
import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import { formatMoney } from "@/lib/format";

type Choice = { value: string; label: string };
type Place = { id: string; name: string; address: string };

export function FilterSheet({ children }: { children: ReactNode }) {
  return <div className="filter-sheet">{children}</div>;
}

export function FilterSheetSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="filter-sheet__section">
      <h3 className="filter-sheet__label">{label}</h3>
      {children}
    </section>
  );
}

export function FilterLocationField({
  locations,
  value,
  onChange,
}: {
  locations: Place[];
  value: string;
  onChange: (value: string) => void;
}) {
  const query = value.trim().toLowerCase();
  const exact = locations.some((item) => item.name.toLowerCase() === query);
  const visible =
    query && !exact
      ? locations.filter(
          (item) => item.name.toLowerCase().includes(query) || item.address.toLowerCase().includes(query),
        )
      : locations;

  return (
    <FilterSheetSection label="Location">
      <input
        type="search"
        className="filter-sheet__search"
        placeholder="Where are you going?"
        aria-label="Location"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="filter-sheet__chips" role="listbox" aria-label="Locations">
        <button
          type="button"
          className={`filter-sheet__chip${!value.trim() ? " is-on" : ""}`}
          aria-pressed={!value.trim()}
          onClick={() => onChange("")}
        >
          Anywhere
        </button>
        {visible.map((item) => {
          const on = value.trim().toLowerCase() === item.name.toLowerCase();
          return (
            <button
              type="button"
              key={item.id}
              className={`filter-sheet__chip${on ? " is-on" : ""}`}
              aria-pressed={on}
              onClick={() => onChange(on ? "" : item.name)}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </FilterSheetSection>
  );
}

export function FilterChoiceChips({
  label,
  anyLabel,
  options,
  values,
  onChange,
}: {
  label: string;
  anyLabel: string;
  options: Choice[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  return (
    <FilterSheetSection label={label}>
      <div className="filter-sheet__chips" role="group" aria-label={label}>
        <button
          type="button"
          className={`filter-sheet__chip${values.length === 0 ? " is-on" : ""}`}
          aria-pressed={values.length === 0}
          onClick={() => onChange([])}
        >
          {anyLabel}
        </button>
        {options.map((option) => {
          const on = values.includes(option.value);
          return (
            <button
              type="button"
              key={option.value}
              className={`filter-sheet__chip${on ? " is-on" : ""}`}
              aria-pressed={on}
              onClick={() => toggle(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </FilterSheetSection>
  );
}

export function FilterPriceField({
  low,
  high,
  min,
  max,
  step,
  currency,
  onChange,
}: {
  low: number;
  high: number;
  min: number;
  max: number;
  step: number;
  currency: string;
  onChange: (next: [number, number]) => void;
}) {
  return (
    <FilterSheetSection label="Price">
      <div className="filter-sheet__price">
        <span>{formatMoney(low, currency)}</span>
        <span>{formatMoney(high, currency)}</span>
      </div>
      <PriceSlider
        price={[low, high]}
        min={min}
        max={max}
        step={step}
        currency={currency}
        showReadout={false}
        onChange={onChange}
      />
    </FilterSheetSection>
  );
}

export function FilterSheetClear({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="filter-sheet__clear" onClick={onClick}>
      Clear filters
    </button>
  );
}
