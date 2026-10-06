"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DateObject } from "react-multi-date-picker";
import "rc-slider/assets/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CallToActions from "@/components/common/CallToActions";
import DefaultFooter from "@/components/footer/default";
import { GoTripFrame } from "@/components/gotrip/GoTripFrame";
import type { GuestCounts } from "@/components/hotel-list/common/GuestSearch";
import { Pagination } from "@/components/hotel-list/common/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MainFilterSearchBox } from "@/components/tour-list/tour-list-v2/MainFilterSearchBox";
import { durationChoices, readTourQuery, tourQueryString, type TourListQueryInput } from "@/components/tour-list/tour-list-v2/query";
import { Sidebar, type TourListFilters } from "@/components/tour-list/tour-list-v2/Sidebar";
import { TopHeaderFilter } from "@/components/tour-list/tour-list-v2/TopHeaderFilter";
import { TourProperties } from "@/components/tour-list/tour-list-v2/TourProperties";
import type { TourListCard, TourListLocation, TourSort } from "@/components/tour-list/types";

const PAGE_SIZE = 12;

export function TourListV2({
  tours,
  locations,
  query = {},
  priceMin: catalogMin,
  priceMax: catalogMax,
}: {
  tours: TourListCard[];
  locations: TourListLocation[];
  query?: TourListQueryInput;
  priceMin: number;
  priceMax: number;
}) {
  const router = useRouter();
  const currency = tours[0]?.currency || "INR";
  const priceMin = catalogMin;
  const priceMax = Math.max(catalogMin, catalogMax);
  const priceStep = 1;
  const initialQuery = readTourQuery(query, { priceMin, priceMax });
  const [location, setLocation] = useState(initialQuery.location);
  const [dates, setDates] = useState<DateObject[]>(() => [
    new DateObject().setDay(15),
    new DateObject().setDay(14).add(1, "month"),
  ]);
  const [guests, setGuests] = useState<GuestCounts>({ Adults: 2, Children: 1, Rooms: 1 });
  const [page, setPage] = useState(initialQuery.page);
  const [sort, setSort] = useState<TourSort>(initialQuery.sort);
  const [nameQuery, setNameQuery] = useState(initialQuery.name);
  const debouncedName = useDebouncedValue(nameQuery, 300);
  const [filters, setFilters] = useState<TourListFilters>({
    query: initialQuery.name,
    categories: initialQuery.types,
    price: initialQuery.price,
    durations: initialQuery.days,
  });
  const nameReady = useRef(false);
  const appliedQuery = useRef<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const incomingKey = tourQueryString(initialQuery, { priceMin, priceMax });

  const categoryLabels = useMemo(() => {
    return [...new Set(tours.map((tour) => tour.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [tours]);

  const filtered = useMemo(() => {
    const place = location.trim().toLowerCase();
    const queryText = filters.query.trim().toLowerCase();
    const matched = tours.filter((tour) => {
      if (place && !`${tour.location} ${tour.address}`.toLowerCase().includes(place)) return false;
      if (queryText && !tour.title.toLowerCase().includes(queryText)) return false;
      if (tour.price < filters.price[0] || tour.price > filters.price[1]) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(tour.category)) return false;
      if (
        filters.durations.length > 0 &&
        !durationChoices.some((choice) => filters.durations.includes(choice.value) && choice.match(tour.durationDays))
      ) {
        return false;
      }
      return true;
    });

    const next = [...matched];
    if (sort === "price-asc") next.sort((a, b) => a.price - b.price || a.title.localeCompare(b.title));
    if (sort === "price-desc") next.sort((a, b) => b.price - a.price || a.title.localeCompare(b.title));
    if (sort === "title") next.sort((a, b) => a.title.localeCompare(b.title));
    return next;
  }, [filters, location, sort, tours]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const toursScrollRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef(location);
  const sortRef = useRef(sort);
  locationRef.current = location;
  sortRef.current = sort;

  const writeQuery = (state: {
    location: string;
    name: string;
    types: string[];
    days: string[];
    price: [number, number];
    sort: TourSort;
    page: number;
  }) => {
    const next = tourQueryString(state, { priceMin, priceMax });
    appliedQuery.current = next;
    const current = new URLSearchParams(window.location.search).toString();
    if (current === next) return;
    router.replace(next ? `/tours?${next}` : "/tours", { scroll: false });
  };

  useEffect(() => {
    if (appliedQuery.current === incomingKey) return;
    appliedQuery.current = incomingKey;
    const next = readTourQuery(query, { priceMin, priceMax });
    setLocation(next.location);
    setNameQuery(next.name);
    setSort(next.sort);
    setPage(next.page);
    setFilters({
      query: next.name,
      categories: next.types,
      price: next.price,
      durations: next.days,
    });
  }, [incomingKey, priceMax, priceMin, query]);

  useEffect(() => {
    if (!nameReady.current) {
      nameReady.current = true;
      return;
    }
    if (filtersRef.current.query === debouncedName) return;
    const nextFilters = { ...filtersRef.current, query: debouncedName };
    setFilters(nextFilters);
    setPage(1);
    writeQuery({
      location: locationRef.current,
      name: debouncedName,
      types: nextFilters.categories,
      days: nextFilters.durations,
      price: nextFilters.price,
      sort: sortRef.current,
      page: 1,
    });
  }, [debouncedName, priceMax, priceMin, router]);

  useEffect(() => {
    toursScrollRef.current?.scrollTo({ top: 0 });
  }, [currentPage, filters, location, sort]);

  const updateFilters = (next: TourListFilters) => {
    setFilters(next);
    setPage(1);
    writeQuery({
      location,
      name: next.query,
      types: next.categories,
      days: next.durations,
      price: next.price,
      sort,
      page: 1,
    });
  };

  const sidebarProps = {
    filters,
    onChange: updateFilters,
    priceMin,
    priceMax,
    priceStep,
    currency,
    categories: categoryLabels.map((label) => ({ value: label, label })),
    durations: durationChoices.map(({ value, label }) => ({ value, label })),
  };

  return (
    <GoTripFrame>
      <div className="tour-list-v2 tour-workspace">
        <div className="tour-workspace__stage">
          <section className="tour-workspace__mast">
            <h1 className="tour-workspace__title">Find Your Dream Tour</h1>
            <MainFilterSearchBox
              locations={locations}
              location={location}
              onLocation={(value) => {
                setLocation(value);
                setPage(1);
                writeQuery({
                  location: value,
                  name: filters.query,
                  types: filters.categories,
                  days: filters.durations,
                  price: filters.price,
                  sort,
                  page: 1,
                });
              }}
              dates={dates}
              onDates={setDates}
              guests={guests}
              onGuests={setGuests}
            />
          </section>

          <section className="tour-workspace__panes">
          <aside className="tour-workspace__filters xl:d-none">
            <div className="tour-workspace__filters-scroll sidebar">
              <Sidebar {...sidebarProps} />
            </div>
          </aside>

          <div className="tour-workspace__results">
            <div className="tour-workspace__toolbar">
              <TopHeaderFilter
                count={filtered.length}
                place={location.trim()}
                name={nameQuery}
                onName={setNameQuery}
                sort={sort}
                onSort={(next) => {
                  setSort(next);
                  setPage(1);
                  writeQuery({
                    location,
                    name: filters.query,
                    types: filters.categories,
                    days: filters.durations,
                    price: filters.price,
                    sort: next,
                    page: 1,
                  });
                }}
              />
            </div>
            <div className="tour-workspace__tours" ref={toursScrollRef}>
              <div className="tour-workspace__grid">
                <TourProperties tours={visible} />
              </div>
              <Pagination
                page={currentPage}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onPage={(next) => {
                  setPage(next);
                  writeQuery({
                    location,
                    name: filters.query,
                    types: filters.categories,
                    days: filters.durations,
                    price: filters.price,
                    sort,
                    page: next,
                  });
                }}
                itemLabel="tours"
              />
            </div>
          </div>
          </section>
        </div>

        <div className="tour-workspace__footer">
          <CallToActions />
          <DefaultFooter />
        </div>

        <div className="offcanvas offcanvas-start" tabIndex={-1} id="listingSidebar">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasLabel">
              Filter Tours
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
          </div>
          <div className="offcanvas-body">
            <aside className="sidebar y-gap-20">
              <Sidebar {...sidebarProps} />
            </aside>
          </div>
        </div>
      </div>
    </GoTripFrame>
  );
}
