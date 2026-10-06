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
import { HotelProperties } from "@/components/hotel-list/hotel-list-v1/HotelProperties";
import { MainFilterSearchBox } from "@/components/hotel-list/hotel-list-v1/MainFilterSearchBox";
import { Sidebar, type HotelListFilters } from "@/components/hotel-list/hotel-list-v1/Sidebar";
import { TopHeaderFilter } from "@/components/hotel-list/hotel-list-v1/TopHeaderFilter";
import type { CountOption, HotelListCard, HotelListLocation } from "@/components/hotel-list/types";

const PAGE_SIZE = 7;

const dealLabels = ["Free cancellation", "Reserve now, pay at stay", "Properties with special offers"];

function stayNights(dates: DateObject[]) {
  if (dates.length < 2) return 1;
  const ms = dates[1].toDate().getTime() - dates[0].toDate().getTime();
  return Math.max(1, Math.round(Math.abs(ms) / 86400000));
}

function counts(labels: string[], hotels: HotelListCard[], match: (hotel: HotelListCard, label: string) => boolean) {
  return labels.map((label) => ({
    label,
    count: hotels.filter((hotel) => match(hotel, label)).length,
  }));
}

function guestMinimum(value: string) {
  if (value === "4.5") return 5;
  if (value === "4") return 4;
  if (value === "3.5") return 3;
  return 0;
}

export function HotelListV1({
  hotels,
  locations,
  initialLocation = "",
}: {
  hotels: HotelListCard[];
  locations: HotelListLocation[];
  initialLocation?: string;
}) {
  const currency = hotels[0]?.currency || "INR";
  const priceMax = Math.max(1000, ...hotels.map((hotel) => hotel.price), 0);
  const [location, setLocation] = useState(initialLocation);
  const [dates, setDates] = useState<DateObject[]>(() => [
    new DateObject().setDay(15),
    new DateObject().setDay(14).add(1, "month"),
  ]);
  const [guests, setGuests] = useState<GuestCounts>({ Adults: 2, Children: 1, Rooms: 1 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<HotelListFilters>({
    query: "",
    stars: null,
    price: [0, priceMax],
    deals: [],
    popular: [],
    amenities: [],
    guestRating: "",
    styles: [],
    neighborhoods: [],
  });

  const amenityLabels = useMemo(() => {
    const names = new Set<string>();
    hotels.forEach((hotel) => hotel.amenities.forEach((amenity) => names.add(amenity)));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [hotels]);

  const styleLabels = useMemo(() => {
    return [...new Set(hotels.map((hotel) => hotel.propertyType))].sort((a, b) => a.localeCompare(b));
  }, [hotels]);

  const neighborhoodLabels = useMemo(() => {
    return [...new Set(hotels.map((hotel) => hotel.location).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [hotels]);

  const deals = counts(dealLabels, hotels, (hotel, label) =>
    label === "Free cancellation" ? hotel.freeCancellation : false,
  );
  const popular: CountOption[] = counts(amenityLabels, hotels, (hotel, label) =>
    hotel.amenities.includes(label),
  ).slice(0, 5);
  const amenities = counts(amenityLabels, hotels, (hotel, label) => hotel.amenities.includes(label));
  const styles = counts(styleLabels, hotels, (hotel, label) => hotel.propertyType === label);
  const neighborhoods = counts(neighborhoodLabels, hotels, (hotel, label) => hotel.location === label);
  const guestRatings = [
    { label: "Any", value: "", count: hotels.length },
    { label: "Wonderful 4.5+", value: "4.5", count: hotels.filter((hotel) => hotel.stars >= 5).length },
    { label: "Very good 4+", value: "4", count: hotels.filter((hotel) => hotel.stars >= 4).length },
    { label: "Good 3.5+", value: "3.5", count: hotels.filter((hotel) => hotel.stars >= 3).length },
  ];

  const filtered = useMemo(() => {
    const place = location.trim().toLowerCase();
    const query = filters.query.trim().toLowerCase();
    const minimumStars = guestMinimum(filters.guestRating);
    return hotels.filter((hotel) => {
      if (place && !`${hotel.location} ${hotel.address}`.toLowerCase().includes(place)) return false;
      if (query && !hotel.name.toLowerCase().includes(query)) return false;
      if (filters.stars && hotel.stars !== filters.stars) return false;
      if (hotel.price < filters.price[0] || hotel.price > filters.price[1]) return false;
      if (filters.deals.includes("Free cancellation") && !hotel.freeCancellation) return false;
      if (
        filters.deals.some((deal) => deal !== "Free cancellation") &&
        filters.deals.filter((deal) => deal !== "Free cancellation").length > 0
      ) {
        return false;
      }
      const wanted = [...filters.popular, ...filters.amenities];
      if (wanted.some((amenity) => !hotel.amenities.includes(amenity))) return false;
      if (minimumStars && hotel.stars < minimumStars) return false;
      if (filters.styles.length > 0 && !filters.styles.includes(hotel.propertyType)) return false;
      if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(hotel.location)) return false;
      return true;
    });
  }, [filters, hotels, location]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const nights = stayNights(dates);

  const updateFilters = (next: HotelListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const sidebarProps = {
    filters,
    onChange: updateFilters,
    priceMax,
    currency,
    deals,
    popular,
    amenities,
    guestRatings,
    styles,
    neighborhoods,
  };

  return (
    <GoTripFrame>
      <div className="hotel-list-v1">
        <section className="pt-40 pb-40 bg-light-2">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="text-center">
                  <h1 className="text-30 fw-600">Find Your Dream Luxury Hotel</h1>
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
                  <Sidebar {...sidebarProps} group="guest-rating-desktop" />
                </aside>

                <div className="offcanvas offcanvas-start" tabIndex={-1} id="listingSidebar">
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasLabel">
                      Filter Hotels
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
                      <Sidebar {...sidebarProps} group="guest-rating-mobile" />
                    </aside>
                  </div>
                </div>
              </div>

              <div className="col-xl-9">
                <TopHeaderFilter count={filtered.length} place={location.trim()} />
                <div className="mt-30" />
                <div className="row y-gap-30">
                  <HotelProperties hotels={visible} nights={nights} adults={guests.Adults} />
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
