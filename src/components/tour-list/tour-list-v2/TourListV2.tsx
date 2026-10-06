"use client";

import { useMemo, useState } from "react";
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
import { MainFilterSearchBox } from "@/components/tour-list/tour-list-v2/MainFilterSearchBox";
import { Sidebar, type TourListFilters } from "@/components/tour-list/tour-list-v2/Sidebar";
import { TopHeaderFilter } from "@/components/tour-list/tour-list-v2/TopHeaderFilter";
import { TourProperties } from "@/components/tour-list/tour-list-v2/TourProperties";
import type { TourListCard, TourListLocation, TourSort } from "@/components/tour-list/types";

const PAGE_SIZE = 9;

const languageNames = ["English", "Spanish", "French", "Turkish"];
const durationNames = ["Up to 1 hour", "1 to 4 hours", "4 hours to 1 day", "1 to 3 days", "3 days or more"];

function counts(labels: string[], tours: TourListCard[], match: (tour: TourListCard, label: string) => boolean) {
  return labels.map((label) => ({
    label,
    count: tours.filter((tour) => match(tour, label)).length,
  }));
}

export function TourListV2({
  tours,
  locations,
  initialLocation = "",
}: {
  tours: TourListCard[];
  locations: TourListLocation[];
  initialLocation?: string;
}) {
  const currency = tours[0]?.currency || "INR";
  const priceMax = Math.max(1000, ...tours.map((tour) => tour.price), 0);
  const [location, setLocation] = useState(initialLocation);
  const [dates, setDates] = useState<DateObject[]>(() => [
    new DateObject().setDay(15),
    new DateObject().setDay(14).add(1, "month"),
  ]);
  const [guests, setGuests] = useState<GuestCounts>({ Adults: 2, Children: 1, Rooms: 1 });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<TourSort>("recommended");
  const [filters, setFilters] = useState<TourListFilters>({
    query: "",
    categories: [],
    other: [],
    price: [0, priceMax],
    durations: [],
    languages: [],
  });

  const categoryLabels = useMemo(() => {
    return [...new Set(tours.map((tour) => tour.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [tours]);

  const visibleDurations = durationNames.filter(
    (label) =>
      label === "Up to 1 hour" ||
      label === "1 to 4 hours" ||
      label === "4 hours to 1 day" ||
      tours.some((tour) => tour.durationBucket === label),
  );

  const categories = counts(categoryLabels, tours, (tour, label) => tour.category === label);
  const others = counts(["Free Cancellation"], tours, (tour) => tour.freeCancellation);
  const durations = counts(visibleDurations, tours, (tour, label) => tour.durationBucket === label);
  const languages = counts(languageNames, tours, (tour, label) => tour.languages.includes(label));

  const filtered = useMemo(() => {
    const place = location.trim().toLowerCase();
    const query = filters.query.trim().toLowerCase();
    const matched = tours.filter((tour) => {
      if (place && !`${tour.location} ${tour.address}`.toLowerCase().includes(place)) return false;
      if (query && !tour.title.toLowerCase().includes(query)) return false;
      if (tour.price < filters.price[0] || tour.price > filters.price[1]) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(tour.category)) return false;
      if (filters.other.includes("Free Cancellation") && !tour.freeCancellation) return false;
      if (filters.durations.length > 0 && !filters.durations.includes(tour.durationBucket)) return false;
      if (filters.languages.length > 0 && !filters.languages.some((language) => tour.languages.includes(language))) {
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

  const updateFilters = (next: TourListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const sidebarProps = {
    filters,
    onChange: updateFilters,
    priceMax,
    currency,
    categories,
    others,
    durations,
    languages,
  };

  return (
    <GoTripFrame>
      <div className="tour-list-v2">
        <section className="pt-40 pb-40 bg-light-2">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="text-center">
                  <h1 className="text-30 fw-600">Find Your Dream Tour</h1>
                </div>
                <MainFilterSearchBox
                  locations={locations}
                  location={location}
                  onLocation={(value) => {
                    setLocation(value);
                    setPage(1);
                  }}
                  dates={dates}
                  onDates={setDates}
                  guests={guests}
                  onGuests={setGuests}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="layout-pt-md layout-pb-lg">
          <div className="container">
            <div className="row y-gap-30">
              <div className="col-xl-3">
                <aside className="sidebar y-gap-40 xl:d-none">
                  <Sidebar {...sidebarProps} />
                </aside>

                <div className="offcanvas offcanvas-start" tabIndex={-1} id="listingSidebar">
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasLabel">
                      Filter Tours
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
                  place={location.trim()}
                  sort={sort}
                  onSort={(next) => {
                    setSort(next);
                    setPage(1);
                  }}
                />
                <div className="mt-30" />
                <div className="row y-gap-30">
                  <TourProperties tours={visible} />
                </div>
                <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
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
