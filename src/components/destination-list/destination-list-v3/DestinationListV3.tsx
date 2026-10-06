"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { GoTripFrame } from "@/components/gotrip/GoTripFrame";
import { Pagination } from "@/components/hotel-list/common/Pagination";
import { DestinationProperties } from "@/components/destination-list/destination-list-v3/DestinationProperties";
import { DropdownSelectBar } from "@/components/destination-list/destination-list-v3/DropdownSelectBar";
import { MainFilterSearchBox } from "@/components/destination-list/destination-list-v3/MainFilterSearchBox";
import { TopHeaderFilter } from "@/components/destination-list/destination-list-v3/TopHeaderFilter";
import type {
  DestinationListCard,
  DestinationListLocation,
  DestinationSort,
} from "@/components/destination-list/types";

const PAGE_SIZE = 5;

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
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
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
    setPage(1);
  };

  const selectDestination = (id: string) => {
    setSelectedId(id);
    if (!id) return;
    const index = filtered.findIndex((item) => item.id === id);
    if (index >= 0) setPage(Math.floor(index / PAGE_SIZE) + 1);
  };

  useEffect(() => {
    if (selectedId && !filtered.some((item) => item.id === selectedId)) {
      setSelectedId("");
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`destination-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId, currentPage]);

  return (
    <GoTripFrame>
      <section className="halfMap destination-list-v3">
        <div className="halfMap__content">
          <MainFilterSearchBox
            locations={locations}
            location={location}
            onLocation={(value) => {
              setLocation(value);
              setPage(1);
            }}
            countries={countries}
            country={country}
            onCountry={changeCountry}
            regions={regions}
            region={region}
            onRegion={(value) => {
              setRegion(value);
              setPage(1);
            }}
          />

          <div className="row x-gap-10 y-gap-10 pt-20">
            <DropdownSelectBar
              countries={countries}
              country={country}
              onCountry={changeCountry}
              regions={regions}
              region={region}
              onRegion={(value) => {
                setRegion(value);
                setPage(1);
              }}
              popular={popular}
              onPopular={(value) => {
                setPopular(value);
                setPage(1);
              }}
            />
          </div>

          <div className="row y-gap-10 justify-between items-center pt-20">
            <TopHeaderFilter
              count={filtered.length}
              place={placeLabel}
              sort={sort}
              onSort={(next) => {
                setSort(next);
                setPage(1);
              }}
            />
          </div>

          <div className="row y-gap-20 pt-20">
            <DestinationProperties
              destinations={visible}
              selectedId={selectedId}
              onSelect={selectDestination}
            />
          </div>

          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPage={setPage}
            itemLabel="destinations"
          />
        </div>

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
      </section>
    </GoTripFrame>
  );
}
