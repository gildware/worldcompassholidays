"use client";

import type { CountOption } from "@/components/hotel-list/types";

function toggle(selected: string[], label: string) {
  return selected.includes(label)
    ? selected.filter((item) => item !== label)
    : [...selected, label];
}

export function DealsFilter({
  options,
  selected,
  onChange,
}: {
  options: CountOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <>
      {options.map((deal) => (
        <div className="col-auto" key={deal.label}>
          <div className="form-checkbox d-flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(deal.label)}
              onChange={() => onChange(toggle(selected, deal.label))}
            />
            <div className="form-checkbox__mark">
              <div className="form-checkbox__icon icon-check" />
            </div>
            <div className="text-15 ml-10">{deal.label}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export function CountFilter({
  options,
  selected,
  onChange,
}: {
  options: CountOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <>
      {options.map((filter) => (
        <div key={filter.label} className="row y-gap-10 items-center justify-between">
          <div className="col-auto">
            <div className="form-checkbox d-flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(filter.label)}
                onChange={() => onChange(toggle(selected, filter.label))}
              />
              <div className="form-checkbox__mark">
                <div className="form-checkbox__icon icon-check" />
              </div>
              <div className="text-15 ml-10">{filter.label}</div>
            </div>
          </div>
          <div className="col-auto">
            <div className="text-15 text-light-1">{filter.count}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export function RatingsFilter({
  active,
  onChange,
}: {
  active: number | null;
  onChange: (rating: number | null) => void;
}) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((rating) => (
        <div className="col-auto" key={rating}>
          <button
            type="button"
            className={`button -blue-1 bg-blue-1-05 text-blue-1 py-5 px-20 rounded-100 ${
              rating === active ? "active" : ""
            }`}
            onClick={() => onChange(rating === active ? null : rating)}
          >
            {rating}
          </button>
        </div>
      ))}
    </>
  );
}

export function GuestRatingFilters({
  options,
  value,
  group,
  onChange,
}: {
  options: { label: string; value: string; count: number }[];
  value: string;
  group: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      {options.map((option) => (
        <div className="row y-gap-10 items-center justify-between" key={option.label}>
          <div className="col-auto">
            <div className="form-radio">
              <div className="radio d-flex items-center">
                <input
                  type="radio"
                  name={group}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                />
                <div className="radio__mark">
                  <div className="radio__icon" />
                </div>
                <div className="ml-10">{option.label}</div>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="text-15 text-light-1">{option.count}</div>
          </div>
        </div>
      ))}
    </>
  );
}
