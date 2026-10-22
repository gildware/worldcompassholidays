"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DateObject } from "react-multi-date-picker";
import "rc-slider/assets/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BikeCards } from "@/components/car-list/car-list-v1/BikeCards";
import { BikeFilterBar } from "@/components/car-list/car-list-v1/BikeFilterBar";
import { CarProperties } from "@/components/car-list/car-list-v1/CarProperties";
import { MainFilterSearchBox } from "@/components/car-list/car-list-v1/MainFilterSearchBox";
import { Sidebar, type CarListFilters } from "@/components/car-list/car-list-v1/Sidebar";
import { TopHeaderFilter } from "@/components/car-list/car-list-v1/TopHeaderFilter";
import type { CarListCard, CarListLocation, CarSort } from "@/components/car-list/types";
import CallToActions from "@/components/common/CallToActions";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import type { GuestCounts } from "@/components/hotel-list/common/GuestSearch";
import { Pagination } from "@/components/hotel-list/common/Pagination";
import { replaceOwnedQuery } from "@/lib/list-url";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  formatRentalDate,
  readRentalQuery,
  rentalListPath,
  rentalOwnedKeys,
  rentalQueryParams,
  rentalQueryString,
  type RentalListQuery,
  type RentalQueryInput,
} from "@/components/car-list/car-list-v1/query";

const PAGE_SIZE = 5;
const INITIAL_COUNT = 20;
const BATCH_SIZE = 10;
const bikeSorts: { value: CarSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

const tagOrder = ["Mostly rented", "Popular", "Best for comfort", "Best for spacing"];

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

function matchesQuery(car: CarListCard, query: string) {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  const haystack = [
    car.name,
    car.brand,
    car.category,
    car.location,
    car.locations.join(" "),
    car.fuel,
    car.tags.join(" "),
    car.transmission,
    car.mileageLabel,
  ]
    .join(" ")
    .toLowerCase();
  return text.split(/\s+/).every((word) => haystack.includes(word));
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

function oneParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function withResolvedPlace(params: RentalQueryInput, locations: CarListLocation[]) {
  const named = locations.find((location) => location.id === oneParam(params.location))?.name ?? "";
  if (!oneParam(params.q).trim() && named) return { ...params, q: named };
  return params;
}

function defaultPickupDate() {
  return new DateObject().setDay(15);
}

function defaultReturnDate() {
  return new DateObject().setDay(14).add(1, "month");
}

export function CarListV1({
  cars,
  locations,
  params = {},
  fleet = "car",
}: {
  cars: CarListCard[];
  locations: CarListLocation[];
  params?: RentalQueryInput;
  fleet?: "car" | "bike" | "mixed";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currency = cars[0]?.currency || "INR";
  const priceMax = Math.max(1000, ...cars.map((car) => car.price), 0);
  const locationNames = unique(cars.flatMap((car) => car.locations));
  const initialQueryRef = useRef<RentalListQuery | null>(null);
  if (!initialQueryRef.current) {
    initialQueryRef.current = readRentalQuery(withResolvedPlace(params, locations), { priceMax }, {
      fleet,
      locationNames,
    });
  }
  const initialQuery = initialQueryRef.current;
  const [pickup, setPickup] = useState(initialQuery.pickup);
  const [dropoff, setDropoff] = useState(initialQuery.dropoff);
  const [pickupAt, setPickupAt] = useState(initialQuery.pickupAt);
  const [returnAt, setReturnAt] = useState(initialQuery.returnAt);
  const [pickupDate, setPickupDate] = useState<DateObject | null>(
    () => initialDate(initialQuery.pickupAt) ?? defaultPickupDate(),
  );
  const [dropoffDate, setDropoffDate] = useState<DateObject | null>(
    () => initialDate(initialQuery.returnAt) ?? defaultReturnDate(),
  );
  const [guests, setGuests] = useState<GuestCounts>({
    Adults: initialQuery.adults,
    Children: initialQuery.children,
    Rooms: initialQuery.rooms,
  });
  const [passengersActive, setPassengersActive] = useState(initialQuery.passengersActive);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(initialQuery.search);
  const debouncedSearch = useDebouncedValue(query, 300);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const seenSearch = useRef<string | null>(null);
  const [sort, setSort] = useState<CarSort>(initialQuery.sort);
  const [filters, setFilters] = useState<CarListFilters>(initialQuery.filters);
  const bounds = { priceMax, fleet };
  const appliedQuery = useRef(rentalQueryString(initialQuery, bounds));
  const liveRef = useRef<RentalListQuery>(initialQuery);
  liveRef.current = {
    pickup,
    dropoff,
    pickupAt,
    returnAt,
    adults: guests.Adults,
    children: guests.Children,
    rooms: guests.Rooms,
    passengersActive,
    search: query,
    filters,
    sort,
  };
  const writeUrlRef = useRef<(patch?: Partial<RentalListQuery>) => void>(() => {});
  writeUrlRef.current = (patch = {}) => {
    const next: RentalListQuery = { ...liveRef.current, ...patch };
    liveRef.current = next;
    appliedQuery.current = rentalQueryString(next, bounds);
    replaceOwnedQuery(
      router,
      pathname || rentalListPath(fleet),
      rentalOwnedKeys(fleet),
      rentalQueryParams(next, bounds),
    );
  };
  const pickupDateRef = useRef(pickupDate);
  const dropoffDateRef = useRef(dropoffDate);
  pickupDateRef.current = pickupDate;
  dropoffDateRef.current = dropoffDate;
  const dateWrite = useRef(0);
  const resolvedParams = withResolvedPlace(params, locations);
  const incomingKey = rentalQueryString(
    readRentalQuery(resolvedParams, { priceMax }, { fleet, locationNames }),
    bounds,
  );

  useEffect(() => {
    if (seenSearch.current === null || seenSearch.current === debouncedSearch) {
      seenSearch.current = debouncedSearch;
      return;
    }
    seenSearch.current = debouncedSearch;
    writeUrlRef.current({ search: debouncedSearch });
  }, [debouncedSearch]);

  useEffect(() => {
    if (appliedQuery.current === incomingKey) return;
    appliedQuery.current = incomingKey;
    const next = readRentalQuery(resolvedParams, { priceMax }, { fleet, locationNames });
    setPickup(next.pickup);
    setDropoff(next.dropoff);
    setPickupAt(next.pickupAt);
    setReturnAt(next.returnAt);
    setPickupDate(initialDate(next.pickupAt) ?? defaultPickupDate());
    setDropoffDate(initialDate(next.returnAt) ?? defaultReturnDate());
    setGuests({ Adults: next.adults, Children: next.children, Rooms: next.rooms });
    setPassengersActive(next.passengersActive);
    setQuery(next.search);
    setFilters(next.filters);
    setSort(next.sort);
    setPage(1);
  }, [incomingKey]);

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
  const tagLabels = useMemo(() => {
    const present = unique(cars.flatMap((car) => car.tags));
    const preferred = tagOrder.filter((label) => present.includes(label));
    const rest = present.filter((label) => !tagOrder.includes(label));
    return [...preferred, ...rest];
  }, [cars]);

  const locationOptions = counts(locationLabels, cars, (car, label) => car.locations.includes(label));
  const categories = counts(categoryLabels, cars, (car, label) => car.category === label);
  const suppliers = counts(supplierLabels, cars, (car, label) => car.brand === label);
  const specifications = counts(specificationLabels, cars, (car, label) => car.specs.includes(label));
  const mileage = counts(mileageLabels, cars, (car, label) => car.mileage === label);
  const transmissions = counts(transmissionLabels, cars, (car, label) => car.transmission === label);
  const fuelPolicies = counts(fuelLabels, cars, (car, label) => car.fuel === label);
  const tagOptions = counts(tagLabels, cars, (car, label) => car.tags.includes(label));

  const filtered = useMemo(() => {
    const pickupPlace = pickup.trim().toLowerCase();
    const dropoffPlace = dropoff.trim().toLowerCase();
    const passengers = guests.Adults + guests.Children;
    const matched = cars.filter((car) => {
      if (!matchesQuery(car, query)) return false;
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
      if (filters.tags.length > 0 && !filters.tags.some((label) => car.tags.includes(label))) return false;
      if (passengersActive && passengers > 0 && car.seats < passengers) return false;
      return true;
    });

    const next = [...matched];
    if (sort === "price-asc") next.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    if (sort === "price-desc") next.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
    if (sort === "name") next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [cars, dropoff, filters, guests.Adults, guests.Children, passengersActive, pickup, query, sort]);

  const isBike = fleet === "bike";
  const isCar = fleet === "car";
  const isBoard = isBike || isCar;
  const resultKey = filtered.map((car) => car.id).join("\n");
  const [seenKey, setSeenKey] = useState(resultKey);
  if (seenKey !== resultKey) {
    setSeenKey(resultKey);
    setVisibleCount(INITIAL_COUNT);
  }
  const shownCount = seenKey === resultKey ? visibleCount : INITIAL_COUNT;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = isBoard
    ? filtered.slice(0, shownCount)
    : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasMore = isBoard && visible.length < filtered.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisibleCount((count) => Math.min(count + BATCH_SIZE, filtered.length));
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);
  const solePlace = isBoard && locationLabels.length === 1 ? locationLabels[0] : "";
  const place = solePlace || (isBoard && filters.locations.length === 1 ? filters.locations[0] : pickup.trim());
  const fleetTitle = isBike ? "Bike rental" : fleet === "mixed" ? "Car and bike rental" : "Car rental";
  const heading = place ? `${place} ${fleetTitle}` : fleetTitle;
  const locationLabel = isBoard ? place : place || locationLabels[0] || "";

  const detailParams = new URLSearchParams();
  const pickupValue = pickupAt || dateParam(pickupDate);
  const dropoffValue = returnAt || dateParam(dropoffDate);
  if (pickupValue) detailParams.set("pickup", pickupValue);
  if (dropoffValue) detailParams.set("return", dropoffValue);
  if (place) detailParams.set("q", place);

  const commitDates = (nextPickup: DateObject | null, nextDropoff: DateObject | null) => {
    setPickupDate(nextPickup);
    setDropoffDate(nextDropoff);
    pickupDateRef.current = nextPickup;
    dropoffDateRef.current = nextDropoff;
    const id = ++dateWrite.current;
    queueMicrotask(() => {
      if (dateWrite.current !== id) return;
      const nextPickupAt = nextPickup ? formatRentalDate(nextPickup.toDate(), liveRef.current.pickupAt) : "";
      const nextReturnAt = nextDropoff ? formatRentalDate(nextDropoff.toDate(), liveRef.current.returnAt) : "";
      setPickupAt(nextPickupAt);
      setReturnAt(nextReturnAt);
      writeUrlRef.current({ pickupAt: nextPickupAt, returnAt: nextReturnAt });
    });
  };

  const updateFilters = (next: CarListFilters) => {
    const locationsChanged = next.locations.join("\u0000") !== filters.locations.join("\u0000");
    let nextPickup = pickup;
    if (isBoard && locationsChanged) {
      nextPickup = next.locations.length === 1 ? next.locations[0] : "";
      setPickup(nextPickup);
    }
    setFilters(next);
    setPage(1);
    writeUrlRef.current({ filters: next, pickup: nextPickup });
  };

  const resetBoardFilters = () => {
    const nextFilters: CarListFilters = {
      ...filters,
      locations: [],
      categories: [],
      suppliers: [],
      specifications: [],
      mileage: [],
      transmissions: [],
      fuelPolicies: [],
      tags: [],
      price: [0, priceMax],
    };
    setQuery("");
    setFilters(nextFilters);
    setPickup("");
    setDropoff("");
    setPassengersActive(false);
    setPage(1);
    writeUrlRef.current({
      search: "",
      filters: nextFilters,
      pickup: "",
      dropoff: "",
      passengersActive: false,
    });
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
    fleet,
  };

  return (
    <WorldCompassHolidayFrame>
      <div className={`car-list-v1${isBoard ? " bike-fleet" : ""}${isCar ? " car-fleet" : ""}`}>
        {isBoard ? null : (
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
                    writeUrlRef.current({ pickup: value });
                  }}
                  onDropoff={(value) => {
                    setDropoff(value);
                    setPage(1);
                    writeUrlRef.current({ dropoff: value });
                  }}
                  pickupDate={pickupDate}
                  dropoffDate={dropoffDate}
                  onPickupDate={(date) => commitDates(date, dropoffDateRef.current)}
                  onDropoffDate={(date) => commitDates(pickupDateRef.current, date)}
                  guests={guests}
                  onGuests={(next) => {
                    setGuests(next);
                    setPassengersActive(true);
                    setPage(1);
                    writeUrlRef.current({
                      adults: next.Adults,
                      children: next.Children,
                      rooms: next.Rooms,
                      passengersActive: true,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        )}

        <section className={isBoard ? "bike-results" : "layout-pt-md layout-pb-lg"} id="car-list-results">
          {isBoard ? (
            <section className="bike-banner">
              <img
                src={isCar ? "/img/cars/car-rental-banner.jpg" : "/img/bikes/bike-rental-banner.jpg"}
                alt={isCar ? "Car on a coastal road at dusk" : "Rider on a scooter along a palm-lined coastal road"}
              />
              <div className="bike-banner__copy">
                <div className="container">
                  <h1>{isCar ? "Car rental" : "Bike rental"}</h1>
                  <p>
                    {isCar
                      ? solePlace
                        ? `Self-drive cars at ${solePlace}.`
                        : "Self-drive cars with daily rates."
                      : solePlace
                        ? `Scooters and motorbikes at ${solePlace}.`
                        : "Scooters and motorbikes with daily rates."}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
          <div className="container">
            <div className={isBoard ? "row" : "row y-gap-30"}>
              {isBoard ? null : (
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
              )}

              <div className={isBoard ? "col-12" : "col-xl-9"}>
                {isBoard ? (
                  <BikeFilterBar
                    cities={locationLabels.length > 1 ? locationOptions : []}
                    types={categories}
                    fuels={fuelPolicies}
                    tags={tagOptions}
                    transmissions={isCar ? transmissions : []}
                    typeAsMenu={isCar}
                    query={query}
                    locationQuery={pickup}
                    onQuery={setQuery}
                    searchPlaceholder={isCar ? "Search cars" : "Search bikes"}
                    filters={filters}
                    sort={sort}
                    sorts={bikeSorts}
                    pickupDate={pickupDate}
                    dropoffDate={dropoffDate}
                    onPickupDate={(date) => commitDates(date, dropoffDateRef.current)}
                    onDropoffDate={(date) => commitDates(pickupDateRef.current, date)}
                    onChange={updateFilters}
                    onReset={resetBoardFilters}
                    onSort={(next) => {
                      setSort(next);
                      setPage(1);
                      writeUrlRef.current({ sort: next });
                    }}
                  />
                ) : (
                  <TopHeaderFilter
                    count={filtered.length}
                    place={place}
                    sort={sort}
                    onSort={(next) => {
                      setSort(next);
                      setPage(1);
                      writeUrlRef.current({ sort: next });
                    }}
                  />
                )}
                {isBoard ? null : <div className="mt-30" />}
                {isBoard ? (
                  <div className="bike-grid">
                    <BikeCards
                      bikes={visible}
                      noun={isCar ? "cars" : "bikes"}
                      showSeats={isCar}
                      detailQuery={detailParams.toString()}
                    />
                  </div>
                ) : (
                  <div className="row y-gap-30">
                    <CarProperties cars={visible} detailQuery={detailParams.toString()} />
                  </div>
                )}
                {hasMore ? <div ref={sentinelRef} className="bike-more" aria-hidden="true" /> : null}
                {isBoard ? null : (
                  <Pagination
                    page={currentPage}
                    pageSize={PAGE_SIZE}
                    total={filtered.length}
                    onPage={setPage}
                    itemLabel="properties"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <CallToActions />
      </div>
    </WorldCompassHolidayFrame>
  );
}
