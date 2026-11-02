"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { ListFilterDrawer } from "@/components/listing/ListFilterDrawer";
import { DestinationProperties } from "@/components/destination-list/destination-list-v3/DestinationProperties";
import { DropdownSelectBar } from "@/components/destination-list/destination-list-v3/DropdownSelectBar";
import { MainFilterSearchBox } from "@/components/destination-list/destination-list-v3/MainFilterSearchBox";
import { TopHeaderFilter } from "@/components/destination-list/destination-list-v3/TopHeaderFilter";
import { useLazySlice } from "@/hooks/useLazySlice";
import type {
  DestinationListCard,
  DestinationListLocation,
  DestinationSort,
} from "@/components/destination-list/types";

const PAGE_SIZE_MAP = 5;
const PAGE_SIZE_GRID = 12;

const DestinationMap = dynamic(
  () => import("@/components/destination-list/destination-list-v3/DestinationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="d-flex items-center justify-center h-full text-15 text-light-1">Loading map...</div>
    ),
  },
);

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function DestinationListV3({
  destinations,
  locations,
  initialLocation = "",
  mapApiKey,
}: {
  destinations: DestinationListCard[];
  locations: DestinationListLocation[];
  initialLocation?: string;
  mapApiKey: string;
}) {
  const [location, setLocation] = useState(initialLocation);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [popular, setPopular] = useState(false);
  const [sort, setSort] = useState<DestinationSort>("recommended");
  const [selectedId, setSelectedId] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const batch = view === "list" ? PAGE_SIZE_GRID : PAGE_SIZE_MAP;

  const countries = useMemo(
    () => unique(destinations.map((item) => item.country)),
    [destinations],
  );
  const regions = useMemo(() => {
    const source = country
      ? destinations.filter((item) => item.country === country)
      : destinations;
    return unique(source.map((item) => item.region));
  }, [country, destinations]);

  const filtered = useMemo(() => {
    const place = location.trim().toLowerCase();
    const matched = destinations.filter((item) => {
      const haystack = `${item.name} ${item.region} ${item.country} ${item.parentName} ${item.placeNames.join(" ")}`.toLowerCase();
      if (place && !haystack.includes(place)) return false;
      if (country && item.country !== country) return false;
      if (region && item.region !== region) return false;
      if (popular && !item.popular) return false;
      return true;
    });

    const next = [...matched];
    if (sort === "name") next.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "country") {
      next.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
    }
    if (sort === "recommended") {
      next.sort(
        (a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name),
      );
    }
    return next;
  }, [country, destinations, location, popular, region, sort]);

  const windowKey = [location, country, region, String(popular), sort, view].join("|");
  const { visible, sentinelRef } = useLazySlice(filtered, windowKey, batch);
  const selectedIndex = selectedId ? filtered.findIndex((item) => item.id === selectedId) : -1;
  const shown =
    selectedIndex >= visible.length ? filtered.slice(0, selectedIndex + 1) : visible;
  const pins = useMemo(
    () =>
      filtered.flatMap((item) =>
        item.lat != null && item.lng != null
          ? [
              {
                id: item.id,
                name: item.name,
                href: item.href,
                lat: item.lat,
                lng: item.lng,
                imageUrl: item.imageUrl,
                region: item.region,
                country: item.country,
                summary: item.summary,
                popular: item.popular,
                tourCount: item.tourCount,
                hotelCount: item.hotelCount,
                rentalCount: item.rentalCount,
              },
            ]
          : [],
      ),
    [filtered],
  );
  const placeLabel = [region, country, location.trim()].find(Boolean) ?? "";

  const changeCountry = (value: string) => {
    setCountry(value);
    setRegion("");
  };

  const selectDestination = (id: string) => {
    setSelectedId(id);
  };

  useEffect(() => {
    if (selectedId && !filtered.some((item) => item.id === selectedId)) {
      setSelectedId("");
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`destination-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId, shown.length]);

  const filtersActive = Boolean(location.trim() || country || region || popular);
  const filterControls = (
    <>
      <MainFilterSearchBox
        locations={locations}
        location={location}
        onLocation={setLocation}
        countries={countries}
        country={country}
        onCountry={changeCountry}
        regions={regions}
        region={region}
        onRegion={setRegion}
      />
      <div className="row x-gap-10 y-gap-10 pt-20">
        <DropdownSelectBar
          countries={countries}
          country={country}
          onCountry={changeCountry}
          regions={regions}
          region={region}
          onRegion={setRegion}
          popular={popular}
          onPopular={setPopular}
        />
      </div>
    </>
  );

  return (
    <WorldCompassHolidayFrame>
      <section className="tour-workspace__mast destination-mast">
        <h1 className="tour-workspace__title">
          {placeLabel ? `Destinations in ${placeLabel}` : "Travel destinations"}
        </h1>
        <div className="list-filters-inline destination-mast__filters">{filterControls}</div>
      </section>
      <ListFilterDrawer open={filtersOpen} title="Filters" onClose={() => setFiltersOpen(false)}>
        {filterControls}
      </ListFilterDrawer>

      <section className={`halfMap destination-list-v3 ${view === "map" ? "is-map-view" : "is-list-view"}`}>
        <div className="halfMap__content">
          <div className="tour-workspace__toolbar">
            <TopHeaderFilter
              count={filtered.length}
              place={placeLabel}
              search={location}
              onSearch={setLocation}
              sort={sort}
              onSort={setSort}
              filtersActive={filtersActive}
              onOpenFilters={() => setFiltersOpen(true)}
              view={view}
              onView={setView}
            />
          </div>

          <div className="row y-gap-20 pt-20">
            <DestinationProperties
              destinations={shown}
              selectedId={selectedId}
              onSelect={selectDestination}
              grid={view === "list"}
            />
          </div>

          {shown.length < filtered.length ? (
            <div ref={sentinelRef} className="tour-workspace__more" aria-hidden="true" />
          ) : null}
        </div>

        {view === "map" ? (
          <div className="halfMap__map">
            <div className="map">
              <DestinationMap
                pins={pins}
                selectedId={selectedId}
                onSelect={selectDestination}
                apiKey={mapApiKey}
              />
            </div>
          </div>
        ) : null}
      </section>
    </WorldCompassHolidayFrame>
  );
}
