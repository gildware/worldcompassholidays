"use client";

import { ChoiceSearch } from "@/components/destination-list/destination-list-v3/ChoiceSearch";
import { LocationSearch } from "@/components/destination-list/destination-list-v3/LocationSearch";
import type { DestinationListLocation } from "@/components/destination-list/types";

export function MainFilterSearchBox({
  locations,
  location,
  onLocation,
  countries,
  country,
  onCountry,
  regions,
  region,
  onRegion,
}: {
  locations: DestinationListLocation[];
  location: string;
  onLocation: (value: string) => void;
  countries: string[];
  country: string;
  onCountry: (value: string) => void;
  regions: string[];
  region: string;
  onRegion: (value: string) => void;
}) {
  return (
    <div className="mainSearch bg-white pr-10 py-10 lg:px-20 lg:pt-5 lg:pb-20 bg-light-2 rounded-4">
      <div className="button-grid items-center">
        <LocationSearch locations={locations} value={location} onChange={onLocation} />

        <ChoiceSearch
          className="searchMenu-date -left"
          icon="icon-destination"
          label="Country"
          value={country}
          placeholder="All countries"
          options={countries}
          onChange={onCountry}
        />

        <ChoiceSearch
          className="searchMenu-guests"
          icon="icon-compass"
          label="Region"
          value={region}
          placeholder="All regions"
          options={regions}
          onChange={onRegion}
        />

        <div className="button-item">
          <button
            type="button"
            className="mainSearch__submit button -dark-1 size-60 lg:w-1/1 col-12 rounded-4 bg-blue-1 text-white"
            aria-label="Search destinations"
          >
            <i className="icon-search text-20" />
          </button>
        </div>
      </div>
    </div>
  );
}
