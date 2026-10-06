"use client";

import { DateSearch } from "@/components/hotel-list/common/DateSearch";
import { GuestSearch, type GuestCounts } from "@/components/hotel-list/common/GuestSearch";
import { LocationSearch } from "@/components/hotel-list/common/LocationSearch";
import type { HotelListLocation } from "@/components/hotel-list/types";
import type { DateObject } from "react-multi-date-picker";

export function FilterBox2({
  locations,
  location,
  onLocation,
  dates,
  onDates,
  guests,
  onGuests,
}: {
  locations: HotelListLocation[];
  location: string;
  onLocation: (value: string) => void;
  dates: DateObject[];
  onDates: (dates: DateObject[]) => void;
  guests: GuestCounts;
  onGuests: (counts: GuestCounts) => void;
}) {
  return (
    <div className="mainSearch bg-white px-10 py-10 lg:px-20 lg:pt-5 lg:pb-20 rounded-4">
      <div className="button-grid items-center">
        <LocationSearch locations={locations} value={location} onChange={onLocation} />
        <div className="searchMenu-date px-30 lg:py-20 sm:px-20 js-form-dd js-calendar">
          <div>
            <h4 className="text-15 fw-500 ls-2 lh-16">Check in - Check out</h4>
            <DateSearch dates={dates} onChange={onDates} />
          </div>
        </div>
        <GuestSearch guestCounts={guests} onChange={onGuests} />
        <div className="button-item h-full">
          <button type="button" className="button -dark-1 py-15 px-40 h-full col-12 rounded-0 bg-blue-1 text-white">
            <i className="icon-search text-20 mr-10" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
