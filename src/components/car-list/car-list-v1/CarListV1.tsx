"use client";

import { useMemo, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import "rc-slider/assets/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { CarProperties } from "@/components/car-list/car-list-v1/CarProperties";
import { MainFilterSearchBox } from "@/components/car-list/car-list-v1/MainFilterSearchBox";
import { Sidebar, type CarListFilters } from "@/components/car-list/car-list-v1/Sidebar";
import { TopHeaderFilter } from "@/components/car-list/car-list-v1/TopHeaderFilter";
import type { CarListCard, CarListLocation, CarSort } from "@/components/car-list/types";
import CallToActions from "@/components/common/CallToActions";
import DefaultFooter from "@/components/footer/default";
import { GoTripFrame } from "@/components/gotrip/GoTripFrame";
import type { GuestCounts } from "@/components/hotel-list/common/GuestSearch";
import { Pagination } from "@/components/hotel-list/common/Pagination";

const PAGE_SIZE = 5;

const specOrder = [
  "With air conditioning",
  "Automatic transmission",
  "Manual transmission",
  "2 doors",
  "4 doors",
];

function counts(labels: string[], cars: CarListCard[], match: (car: CarListCard, label: string) => boolean) {
  return labels.map((label) => ({
    label,
    count: cars.filter((car) => match(car, label)).length,
  }));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function matchesPlace(car: CarListCard, place: string) {
  if (!place) return true;
  const haystack = `${car.location} ${car.locations.join(" ")}`.toLowerCase();
  return haystack.includes(place);
}

function dateParam(date: DateObject | null) {
  if (!date) return "";
  const value = date.toDate();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T10:00`;
}

function initialDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new DateObject(date);
}

export function CarListV1({
  cars,
  locations,
  initialPickup = "",
  initialDropoff = "",
  initialPickupDate = "",
  initialDropoffDate = "",
  initialSeats = 0,
  fleet = "car",
}: {
  cars: CarListCard[];
  locations: CarListLocation[];
  initialPickup?: string;
  initialDropoff?: string;
  initialPickupDate?: string;
  initialDropoffDate?: string;
  initialSeats?: number;
  fleet?: "car" | "bike" | "mixed";
}) {
  const currency = cars[0]?.currency || "INR";
  const priceMax = Math.max(1000, ...cars.map((car) => car.price), 0);
  const [pickup, setPickup] = useState(initialPickup);
  const [dropoff, setDropoff] = useState(initialDropoff);
  const [pickupDate, setPickupDate] = useState<DateObject | null>(
    () => initialDate(initialPickupDate) ?? new DateObject().setDay(15),
  );
  const [dropoffDate, setDropoffDate] = useState<DateObject | null>(
    () => initialDate(initialDropoffDate) ?? new DateObject().setDay(14).add(1, "month"),
  );
  const [guests, setGuests] = useState<GuestCounts>(() =>
    initialSeats > 0
      ? { Adults: initialSeats, Children: 0, Rooms: 1 }
      : { Adults: 2, Children: 1, Rooms: 1 },
  );
  const [passengersActive, setPassengersActive] = useState(initialSeats > 0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<CarSort>("recommended");
  const [filters, setFilters] = useState<CarListFilters>({
    locations: [],
    categories: [],
    suppliers: [],
    specifications: [],
    mileage: [],
    transmissions: [],
    fuelPolicies: [],
    price: [0, priceMax],
  });

  const locationLabels = useMemo(
    () => unique(cars.flatMap((car) => car.locations)),
    [cars],
  );
  const categoryLabels = useMemo(() => unique(cars.map((car) => car.category)), [cars]);
  const supplierLabels = useMemo(() => unique(cars.map((car) => car.brand)), [cars]);
  const specificationLabels = useMemo(() => {
    const present = unique(cars.flatMap((car) => car.specs));
    const preferred = specOrder.filter((label) => present.includes(label));
    const rest = present.filter((label) => !specOrder.includes(label));
    return [...preferred, ...rest];
  }, [cars]);
  const mileageLabels = useMemo(() => {
    const present = unique(cars.map((car) => car.mileage));
    return ["Limited", "Unlimited"].filter((label) => present.includes(label));
  }, [cars]);
  const transmissionLabels = useMemo(() => unique(cars.map((car) => car.transmission)), [cars]);
  const fuelLabels = useMemo(() => unique(cars.map((car) => car.fuel)), [cars]);

  const locationOptions = counts(locationLabels, cars, (car, label) => car.locations.includes(label));
  const categories = counts(categoryLabels, cars, (car, label) => car.category === label);
  const suppliers = counts(supplierLabels, cars, (car, label) => car.brand === label);
  const specifications = counts(specificationLabels, cars, (car, label) => car.specs.includes(label));
  const mileage = counts(mileageLabels, cars, (car, label) => car.mileage === label);
  const transmissions = counts(transmissionLabels, cars, (car, label) => car.transmission === label);
  const fuelPolicies = counts(fuelLabels, cars, (car, label) => car.fuel === label);

  const filtered = useMemo(() => {
    const pickupPlace = pickup.trim().toLowerCase();
    const dropoffPlace = dropoff.trim().toLowerCase();
    const passengers = guests.Adults + guests.Children;
    const matched = cars.filter((car) => {
      if (!matchesPlace(car, pickupPlace)) return false;
      if (dropoffPlace && dropoffPlace !== pickupPlace && !matchesPlace(car, dropoffPlace)) return false;
      if (filters.locations.length > 0 && !filters.locations.some((label) => car.locations.includes(label))) {
        return false;
      }
      if (car.price < filters.price[0] || car.price > filters.price[1]) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(car.category)) return false;
      if (filters.suppliers.length > 0 && !filters.suppliers.includes(car.brand)) return false;
      if (filters.specifications.some((label) => !car.specs.includes(label))) return false;
      if (filters.mileage.length > 0 && !filters.mileage.includes(car.mileage)) return false;
      if (filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) return false;
      if (filters.fuelPolicies.length > 0 && !filters.fuelPolicies.includes(car.fuel)) return false;
      if (passengersActive && passengers > 0 && car.seats < passengers) return false;
      return true;
    });

    const next = [...matched];
    if (sort === "price-asc") next.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    if (sort === "price-desc") next.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
    if (sort === "name") next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [cars, dropoff, filters, guests.Adults, guests.Children, passengersActive, pickup, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const place = pickup.trim();
  const fleetTitle = fleet === "bike" ? "Rental Bikes" : "Rental Cars";
  const heading = place ? `${place} ${fleetTitle}` : fleet === "bike" ? fleetTitle : "London Rental Cars";
  const locationLabel = place || locationLabels[0] || "";

  const detailParams = new URLSearchParams();
  const pickupValue = dateParam(pickupDate);
  const dropoffValue = dateParam(dropoffDate);
  if (pickupValue) detailParams.set("pickup", pickupValue);
  if (dropoffValue) detailParams.set("return", dropoffValue);
  if (place) detailParams.set("q", place);

  const updateFilters = (next: CarListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const sidebarProps = {
    filters,
    onChange: updateFilters,
    priceMax,
    currency,
    locationLabel,
    locations: locationOptions,
    categories,
    suppliers,
    specifications,
    mileage,
    transmissions,
    fuelPolicies,
  };

  return (
    <GoTripFrame>
      <div className="car-list-v1">
        <section className="pt-60">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="text-center">
                  <h1 className="text-30 fw-600">{heading}</h1>
                </div>
                <MainFilterSearchBox
                  locations={locations}
                  pickup={pickup}
                  dropoff={dropoff}
                  onPickup={(value) => {
                    setPickup(value);
                    setPage(1);
                  }}
                  onDropoff={(value) => {
                    setDropoff(value);
                    setPage(1);
                  }}
                  pickupDate={pickupDate}
                  dropoffDate={dropoffDate}
                  onPickupDate={setPickupDate}
                  onDropoffDate={setDropoffDate}
                  guests={guests}
                  onGuests={(next) => {
                    setGuests(next);
                    setPassengersActive(true);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="layout-pt-md layout-pb-lg" id="car-list-results">
          <div className="container">
            <div className="row y-gap-30">
              <div className="col-xl-3">
                <aside className="sidebar y-gap-40 xl:d-none">
                  <Sidebar {...sidebarProps} />
                </aside>

                <div className="offcanvas offcanvas-start" tabIndex={-1} id="listingSidebar">
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasLabel">
                      Filter Cars
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    />
                  </div>
                  <div className="offcanvas-body">
                    <aside className="sidebar y-gap-40 xl:d-block">
                      <Sidebar {...sidebarProps} />
                    </aside>
                  </div>
                </div>
              </div>

              <div className="col-xl-9">
                <TopHeaderFilter
                  count={filtered.length}
                  place={place}
                  sort={sort}
                  onSort={(next) => {
                    setSort(next);
                    setPage(1);
                  }}
                />
                <div className="mt-30" />
                <div className="row y-gap-30">
                  <CarProperties cars={visible} detailQuery={detailParams.toString()} />
                </div>
                <Pagination
                  page={currentPage}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onPage={setPage}
                />
              </div>
            </div>
          </div>
        </section>

        <CallToActions />
        <DefaultFooter />
      </div>
    </GoTripFrame>
  );
}
