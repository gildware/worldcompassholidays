"use client";

import { useState } from "react";
import type { TourListLocation } from "@/components/tour-list/types";

export function LocationSearch({
  locations,
  value,
  onChange,
}: {
  locations: TourListLocation[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = value.trim().toLowerCase();
  const visible = query
    ? locations.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.address.toLowerCase().includes(query),
      )
    : locations;

  return (
    <div className="searchMenu-loc px-30 lg:py-20 lg:px-0 js-form-dd js-liverSearch">
      <div data-bs-toggle="dropdown" data-bs-auto-close="true" data-bs-offset="0,22">
        <h4 className="text-15 fw-500 ls-2 lh-16">Location</h4>
        <div className="text-15 text-light-1 ls-2 lh-16">
          <input
            autoComplete="off"
            type="search"
            placeholder="Where are you going?"
            className="js-search js-dd-focus"
            value={value}
            onChange={(event) => {
              setSelectedId(null);
              onChange(event.target.value);
            }}
          />
        </div>
      </div>

      <div className="shadow-2 dropdown-menu min-width-400">
        <div className="bg-white px-20 py-20 sm:px-0 sm:py-15 rounded-4">
          <ul className="y-gap-5 js-results">
            {visible.map((item) => (
              <li
                className={`-link d-block col-12 text-left rounded-4 px-20 py-15 js-search-option mb-1 ${
                  selectedId === item.id ? "active" : ""
                }`}
                key={item.id}
                role="button"
                onClick={() => {
                  setSelectedId(item.id);
                  onChange(item.name);
                }}
              >
                <div className="d-flex">
                  <div className="icon-location-2 text-light-1 text-20 pt-4" />
                  <div className="ml-10">
                    <div className="text-15 lh-12 fw-500 js-search-option-target">{item.name}</div>
                    <div className="text-14 lh-12 text-light-1 mt-5">{item.address}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
