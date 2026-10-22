"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "rc-slider/assets/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CallToActions from "@/components/common/CallToActions";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLazySlice } from "@/hooks/useLazySlice";
import { MainFilterSearchBox } from "@/components/tour-list/tour-list-v2/MainFilterSearchBox";
import { ListFilterDrawer } from "@/components/listing/ListFilterDrawer";
import { durationChoices, readTourQuery, tourOwnedKeys, tourQueryString, type TourListQueryInput } from "@/components/tour-list/tour-list-v2/query";
import { replaceOwnedQuery } from "@/lib/list-url";
import type { TourListFilters } from "@/components/tour-list/tour-list-v2/Sidebar";
import { TopHeaderFilter } from "@/components/tour-list/tour-list-v2/TopHeaderFilter";
import { TourProperties } from "@/components/tour-list/tour-list-v2/TourProperties";
import type { TourListCard, TourListLocation, TourSort } from "@/components/tour-list/types";

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
  const pathname = usePathname();
  const currency = tours[0]?.currency || "INR";
  const prices = tours.map((tour) => tour.price);
  const priceMin = Math.min(catalogMin, ...(prices.length ? prices : [catalogMin]));
  const priceMax = Math.max(catalogMax, priceMin, ...(prices.length ? prices : [catalogMax]));
  const priceStep = 1;
  const initialQuery = readTourQuery(query, { priceMin, priceMax });
  const [location, setLocation] = useState(initialQuery.location);
  const [sort, setSort] = useState<TourSort>(initialQuery.sort);
  const [nameQuery, setNameQuery] = useState(initialQuery.name);
  const debouncedName = useDebouncedValue(nameQuery, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TourListFilters>({
    query: initialQuery.name,
    categories: initialQuery.types,
    price: initialQuery.price,
    durations: initialQuery.days,
  });
  const seenName = useRef<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const incomingKey = tourQueryString(initialQuery, { priceMin, priceMax });
  const appliedQuery = useRef(incomingKey);

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
      const low = Math.min(filters.price[0], filters.price[1]);
      const high = Math.max(filters.price[0], filters.price[1]);
      const fullRange = low <= priceMin && high >= priceMax;
      if (!fullRange && (tour.price < low || tour.price > high)) return false;
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
  }, [filters, location, priceMax, priceMin, sort, tours]);

  const windowKey = [
    location,
    sort,
    filters.query,
    filters.categories.join("\u0000"),
    filters.durations.join("\u0000"),
    filters.price.join("\u0000"),
  ].join("|");
  const { visible, sentinelRef, hasMore } = useLazySlice(filtered, windowKey);
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
  }) => {
    const next = tourQueryString(state, { priceMin, priceMax });
    appliedQuery.current = next;
    replaceOwnedQuery(router, pathname, tourOwnedKeys, new URLSearchParams(next));
  };

  useEffect(() => {
    if (appliedQuery.current === incomingKey) return;
    appliedQuery.current = incomingKey;
    const next = readTourQuery(query, { priceMin, priceMax });
    setLocation(next.location);
    setNameQuery(next.name);
    setSort(next.sort);
    setFilters({
      query: next.name,
      categories: next.types,
      price: next.price,
      durations: next.days,
    });
  }, [incomingKey, priceMax, priceMin, query]);

  useEffect(() => {
    if (seenName.current === null || seenName.current === debouncedName) {
      seenName.current = debouncedName;
      return;
    }
    seenName.current = debouncedName;
    if (filtersRef.current.query === debouncedName) return;
    const nextFilters = { ...filtersRef.current, query: debouncedName };
    setFilters(nextFilters);
    writeQuery({
      location: locationRef.current,
      name: debouncedName,
      types: nextFilters.categories,
      days: nextFilters.durations,
      price: nextFilters.price,
      sort: sortRef.current,
    });
  }, [debouncedName, priceMax, priceMin, router]);

  useEffect(() => {
    toursScrollRef.current?.scrollTo({ top: 0 });
  }, [filters, location, sort]);

  const updateFilters = (next: TourListFilters) => {
    setFilters(next);
    writeQuery({
      location,
      name: next.query,
      types: next.categories,
      days: next.durations,
      price: next.price,
      sort,
    });
  };

  const categories = categoryLabels.map((label) => ({ value: label, label }));
  const durations = durationChoices.map(({ value, label }) => ({ value, label }));
  const priceLow = Math.min(filters.price[0], filters.price[1]);
  const priceHigh = Math.max(filters.price[0], filters.price[1]);
  const filtersActive =
    location.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.durations.length > 0 ||
    priceLow > priceMin ||
    priceHigh < priceMax;
  const renderFilters = (sheet = false) => (
    <MainFilterSearchBox
      sheet={sheet}
      locations={locations}
      location={location}
      onLocation={(value) => {
        setLocation(value);
        writeQuery({
          location: value,
          name: filters.query,
          types: filters.categories,
          days: filters.durations,
          price: filters.price,
          sort,
        });
      }}
      categories={categories}
      durations={durations}
      filters={filters}
      onFilters={updateFilters}
      priceMin={priceMin}
      priceMax={priceMax}
      priceStep={priceStep}
      currency={currency}
      onClear={() => {
        const next: TourListFilters = {
          query: "",
          categories: [],
          price: [priceMin, priceMax],
          durations: [],
        };
        setLocation("");
        setNameQuery("");
        setFilters(next);
        writeQuery({
          location: "",
          name: "",
          types: [],
          days: [],
          price: next.price,
          sort,
        });
      }}
    />
  );

  return (
    <WorldCompassHolidayFrame>
      <div className="tour-list-v2 tour-workspace">
        <div className="tour-workspace__stage">
          <section className="tour-workspace__mast">
            <h1 className="tour-workspace__title">Tours and treks</h1>
            <div className="list-filters-inline">{renderFilters()}</div>
          </section>
          <ListFilterDrawer open={filtersOpen} title="Filters" onClose={() => setFiltersOpen(false)}>
            {renderFilters(true)}
          </ListFilterDrawer>

          <section className="tour-workspace__panes">
          <div className="tour-workspace__results">
            <div className="tour-workspace__toolbar">
              <TopHeaderFilter
                name={nameQuery}
                onName={setNameQuery}
                sort={sort}
                filtersActive={filtersActive}
                onOpenFilters={() => setFiltersOpen(true)}
                onSort={(next) => {
                  setSort(next);
                  writeQuery({
                    location,
                    name: filters.query,
                    types: filters.categories,
                    days: filters.durations,
                    price: filters.price,
                    sort: next,
                  });
                }}
              />
            </div>
            <div className="tour-workspace__tours" ref={toursScrollRef}>
              <div className="tour-workspace__grid">
                <TourProperties tours={visible} />
              </div>
              {hasMore ? <div ref={sentinelRef} className="tour-workspace__more" /> : null}
            </div>
          </div>
          </section>
        </div>

        <div className="tour-workspace__footer">
          <CallToActions />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
