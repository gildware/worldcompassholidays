"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "rc-slider/assets/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CallToActions from "@/components/common/CallToActions";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { HotelProperties } from "@/components/hotel-list/hotel-list-v1/HotelProperties";
import { MainFilterSearchBox } from "@/components/hotel-list/hotel-list-v1/MainFilterSearchBox";
import { ListFilterDrawer } from "@/components/listing/ListFilterDrawer";
import {
  hotelOwnedKeys,
  hotelQueryString,
  readHotelQuery,
  starChoices,
  type HotelListFilters,
  type HotelListQueryInput,
} from "@/components/hotel-list/hotel-list-v1/query";
import { TopHeaderFilter } from "@/components/hotel-list/hotel-list-v1/TopHeaderFilter";
import type { HotelListCard, HotelListLocation, HotelSort } from "@/components/hotel-list/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLazySlice } from "@/hooks/useLazySlice";
import { hotelRequestHref } from "@/lib/hotels/request-link";
import { replaceOwnedQuery } from "@/lib/list-url";

export function HotelListV1({
  hotels,
  locations,
  query = {},
  priceMin: catalogMin,
  priceMax: catalogMax,
}: {
  hotels: HotelListCard[];
  locations: HotelListLocation[];
  query?: HotelListQueryInput;
  priceMin: number;
  priceMax: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currency = hotels[0]?.currency || "INR";
  const prices = hotels.map((hotel) => hotel.price);
  const priceMin = Math.min(catalogMin, ...(prices.length ? prices : [catalogMin]));
  const priceMax = Math.max(catalogMax, priceMin, ...(prices.length ? prices : [catalogMax]));
  const priceStep = 1;
  const initialQuery = readHotelQuery(query, { priceMin, priceMax });
  const [location, setLocation] = useState(initialQuery.location);
  const [sort, setSort] = useState<HotelSort>(initialQuery.sort);
  const [nameQuery, setNameQuery] = useState(initialQuery.name);
  const debouncedName = useDebouncedValue(nameQuery, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<HotelListFilters>({
    query: initialQuery.name,
    types: initialQuery.types,
    price: initialQuery.price,
    stars: initialQuery.stars,
  });
  const seenName = useRef<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const incomingKey = hotelQueryString(initialQuery, { priceMin, priceMax });
  const appliedQuery = useRef(incomingKey);

  const typeLabels = useMemo(() => {
    return [...new Set(hotels.map((hotel) => hotel.propertyType).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [hotels]);

  const filtered = useMemo(() => {
    const place = location.trim().toLowerCase();
    const queryText = filters.query.trim().toLowerCase();
    const matched = hotels.filter((hotel) => {
      if (place && !`${hotel.location} ${hotel.address}`.toLowerCase().includes(place)) return false;
      if (queryText && !hotel.name.toLowerCase().includes(queryText)) return false;
      const low = Math.min(filters.price[0], filters.price[1]);
      const high = Math.max(filters.price[0], filters.price[1]);
      const fullRange = low <= priceMin && high >= priceMax;
      if (!fullRange && (hotel.price < low || hotel.price > high)) return false;
      if (filters.types.length > 0 && !filters.types.includes(hotel.propertyType)) return false;
      if (
        filters.stars.length > 0 &&
        !starChoices.some((choice) => filters.stars.includes(choice.value) && choice.match(hotel.stars))
      ) {
        return false;
      }
      return true;
    });

    const next = [...matched];
    if (sort === "price-asc") next.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    if (sort === "price-desc") next.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
    if (sort === "name") next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [filters, hotels, location, priceMax, priceMin, sort]);

  const windowKey = [
    location,
    sort,
    filters.query,
    filters.types.join("\u0000"),
    filters.stars.join("\u0000"),
    filters.price.join("\u0000"),
  ].join("|");
  const { visible, sentinelRef, hasMore } = useLazySlice(filtered, windowKey);
  const hotelsScrollRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef(location);
  const sortRef = useRef(sort);
  locationRef.current = location;
  sortRef.current = sort;
  const requestHref = hotelRequestHref({ destination: location });

  const writeQuery = (state: {
    location: string;
    name: string;
    types: string[];
    stars: string[];
    price: [number, number];
    sort: HotelSort;
  }) => {
    const next = hotelQueryString(state, { priceMin, priceMax });
    appliedQuery.current = next;
    replaceOwnedQuery(router, pathname, hotelOwnedKeys, new URLSearchParams(next));
  };

  useEffect(() => {
    if (appliedQuery.current === incomingKey) return;
    appliedQuery.current = incomingKey;
    const next = readHotelQuery(query, { priceMin, priceMax });
    setLocation(next.location);
    setNameQuery(next.name);
    setSort(next.sort);
    setFilters({
      query: next.name,
      types: next.types,
      price: next.price,
      stars: next.stars,
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
      types: nextFilters.types,
      stars: nextFilters.stars,
      price: nextFilters.price,
      sort: sortRef.current,
    });
  }, [debouncedName, priceMax, priceMin, router]);

  useEffect(() => {
    hotelsScrollRef.current?.scrollTo({ top: 0 });
  }, [filters, location, sort]);

  const updateFilters = (next: HotelListFilters) => {
    setFilters(next);
    writeQuery({
      location,
      name: next.query,
      types: next.types,
      stars: next.stars,
      price: next.price,
      sort,
    });
  };

  const types = typeLabels.map((label) => ({ value: label, label }));
  const stars = starChoices.map(({ value, label }) => ({ value, label }));
  const priceLow = Math.min(filters.price[0], filters.price[1]);
  const priceHigh = Math.max(filters.price[0], filters.price[1]);
  const filtersActive =
    location.trim().length > 0 ||
    filters.types.length > 0 ||
    filters.stars.length > 0 ||
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
          types: filters.types,
          stars: filters.stars,
          price: filters.price,
          sort,
        });
      }}
      types={types}
      stars={stars}
      filters={filters}
      onFilters={updateFilters}
      priceMin={priceMin}
      priceMax={priceMax}
      priceStep={priceStep}
      currency={currency}
      onClear={() => {
        const next: HotelListFilters = {
          query: "",
          types: [],
          price: [priceMin, priceMax],
          stars: [],
        };
        setLocation("");
        setNameQuery("");
        setFilters(next);
        writeQuery({
          location: "",
          name: "",
          types: [],
          stars: [],
          price: next.price,
          sort,
        });
      }}
    />
  );

  return (
    <WorldCompassHolidayFrame>
      <div className="hotel-list-v1 tour-list-v2 tour-workspace">
        <div className="tour-workspace__stage">
          <section className="tour-workspace__mast">
            <h1 className="tour-workspace__title">Hotels and stays</h1>
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
                  onSort={(next) => {
                    setSort(next);
                    writeQuery({
                      location,
                      name: filters.query,
                      types: filters.types,
                      stars: filters.stars,
                      price: filters.price,
                      sort: next,
                    });
                  }}
                  requestHref={requestHref}
                  filtersActive={filtersActive}
                  onOpenFilters={() => setFiltersOpen(true)}
                />
              </div>
              <div className="tour-workspace__tours" ref={hotelsScrollRef}>
                <div className="tour-workspace__grid">
                  <HotelProperties hotels={visible} requestHref={requestHref} />
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
