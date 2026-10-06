"use client";

import { CountFilter } from "@/components/hotel-list/sidebar/Filters";
import { Map } from "@/components/hotel-list/sidebar/Map";
import { PriceSlider } from "@/components/hotel-list/sidebar/PriceSlider";
import type { CountOption } from "@/components/hotel-list/types";

export type CarListFilters = {
  locations: string[];
  categories: string[];
  suppliers: string[];
  specifications: string[];
  mileage: string[];
  transmissions: string[];
  fuelPolicies: string[];
  price: [number, number];
};

export function Sidebar({
  filters,
  onChange,
  priceMax,
  currency,
  locationLabel,
  locations,
  categories,
  suppliers,
  specifications,
  mileage,
  transmissions,
  fuelPolicies,
}: {
  filters: CarListFilters;
  onChange: (next: CarListFilters) => void;
  priceMax: number;
  currency: string;
  locationLabel: string;
  locations: CountOption[];
  categories: CountOption[];
  suppliers: CountOption[];
  specifications: CountOption[];
  mileage: CountOption[];
  transmissions: CountOption[];
  fuelPolicies: CountOption[];
}) {
  const patch = (next: Partial<CarListFilters>) => onChange({ ...filters, ...next });

  return (
    <>
      <div className="sidebar__item -no-border position-relative">
        <Map />
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">
          Location{locationLabel ? ` (${locationLabel})` : ""}
        </h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={locations}
            selected={filters.locations}
            onChange={(locations) => patch({ locations })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Car Category</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={categories}
            selected={filters.categories}
            onChange={(categories) => patch({ categories })}
          />
        </div>
      </div>

      <div className="sidebar__item pb-30">
        <h5 className="text-18 fw-500 mb-10">Price</h5>
        <div className="row x-gap-10 y-gap-30">
          <div className="col-12">
            <PriceSlider
              title="Price Range"
              price={filters.price}
              max={priceMax}
              currency={currency}
              onChange={(price) => patch({ price })}
            />
          </div>
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Supplier</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={suppliers}
            selected={filters.suppliers}
            onChange={(suppliers) => patch({ suppliers })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Car Specifications</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={specifications}
            selected={filters.specifications}
            onChange={(specifications) => patch({ specifications })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Mileage/Kilometres</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={mileage}
            selected={filters.mileage}
            onChange={(mileage) => patch({ mileage })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Transmission</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={transmissions}
            selected={filters.transmissions}
            onChange={(transmissions) => patch({ transmissions })}
          />
        </div>
      </div>

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Fuel Policy</h5>
        <div className="sidebar-checkbox">
          <CountFilter
            options={fuelPolicies}
            selected={filters.fuelPolicies}
            onChange={(fuelPolicies) => patch({ fuelPolicies })}
          />
        </div>
      </div>
    </>
  );
}
