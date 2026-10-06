"use client";

import { DateSearch } from "@/components/car-list/common/DateSearch";
import { GuestSearch } from "@/components/car-list/common/GuestSearch";
import type { CarListLocation } from "@/components/car-list/types";
import type { GuestCounts } from "@/components/hotel-list/common/GuestSearch";
import { LocationSearch } from "@/components/hotel-list/common/LocationSearch";
import type { DateObject } from "react-multi-date-picker";

export function MainFilterSearchBox({
  locations,
  pickup,
  dropoff,
  onPickup,
  onDropoff,
  pickupDate,
  dropoffDate,
  onPickupDate,
  onDropoffDate,
  guests,
  onGuests,
}: {
  locations: CarListLocation[];
  pickup: string;
  dropoff: string;
  onPickup: (value: string) => void;
  onDropoff: (value: string) => void;
  pickupDate: DateObject | null;
  dropoffDate: DateObject | null;
  onPickupDate: (date: DateObject | null) => void;
  onDropoffDate: (date: DateObject | null) => void;
  guests: GuestCounts;
  onGuests: (counts: GuestCounts) => void;
}) {
  return (
    <div className="mainSearch -col-5 border-light bg-white px-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 rounded-4 mt-30">
      <div className="button-grid items-center">
        <LocationSearch
          locations={locations}
          value={pickup}
          onChange={onPickup}
          placeholder="City or Airport"
        />

        <LocationSearch
          locations={locations}
          value={dropoff}
          onChange={onDropoff}
          placeholder="City or Airport"
        />

        <div className="searchMenu-date px-30 lg:py-20 lg:px-0 js-form-dd js-calendar">
          <div>
            <h4 className="text-15 fw-500 ls-2 lh-16">Pick up</h4>
            <DateSearch date={pickupDate} onChange={onPickupDate} />
          </div>
        </div>

        <div className="searchMenu-date px-30 lg:py-20 lg:px-0 js-form-dd js-calendar">
          <div>
            <h4 className="text-15 fw-500 ls-2 lh-16">Drop off</h4>
            <DateSearch date={dropoffDate} onChange={onDropoffDate} />
          </div>
        </div>

        <GuestSearch guestCounts={guests} onChange={onGuests} />

        <div className="button-item">
          <button
            type="button"
            className="mainSearch__submit button -dark-1 py-20 px-35 col-12 rounded-4 bg-yellow-1 text-dark-1"
            onClick={() => {
              document.getElementById("car-list-results")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <i className="icon-search text-20 mr-10" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
