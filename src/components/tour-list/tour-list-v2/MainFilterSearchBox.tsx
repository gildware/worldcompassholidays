"use client";

import { DateSearch } from "@/components/hotel-list/common/DateSearch";
import { LocationSearch } from "@/components/tour-list/tour-list-v2/LocationSearch";
import type { TourListLocation } from "@/components/tour-list/types";
import type { DateObject } from "react-multi-date-picker";

export function MainFilterSearchBox({
  locations,
  location,
  onLocation,
  dates,
  onDates,
}: {
  locations: TourListLocation[];
  location: string;
  onLocation: (value: string) => void;
  dates: DateObject[];
  onDates: (dates: DateObject[]) => void;
}) {
  return (
    <>
      <div className="col-12">
        <LocationSearch locations={locations} value={location} onChange={onLocation} />
      </div>

      <div className="col-12">
        <div className="searchMenu-date px-20 py-10 bg-white rounded-4 -left js-form-dd js-calendar">
          <div className="d-flex">
            <i className="icon-calendar-2 text-20 text-light-1 mt-5"></i>
            <div className="ml-10 flex-grow-1">
              <h4 className="text-15 fw-500 ls-2 lh-16">Check in - Check out</h4>
              <DateSearch dates={dates} onChange={onDates} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="button-item h-full">
          <button
            type="button"
            className="button -dark-1 py-15 px-40 h-full col-12 rounded-0 bg-blue-1 text-white"
          >
            <i className="icon-search text-20 mr-10" />
            Search
          </button>
        </div>
      </div>
    </>
  );
}
