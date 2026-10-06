"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DateObject } from "react-multi-date-picker";
import CallToActions from "@/components/common/CallToActions";
import DefaultFooter from "@/components/footer/default";
import { GoTripFrame } from "@/components/gotrip/GoTripFrame";
import type { GuestCounts } from "@/components/hotel-list/common/GuestSearch";
import { AvailableRooms2 } from "@/components/hotel-single/AvailableRooms2";
import { FilterBox2 } from "@/components/hotel-single/FilterBox2";
import { GalleryTwo } from "@/components/hotel-single/GalleryTwo";
import { SimilarHotels } from "@/components/hotel-single/SimilarHotels";
import type { HotelSingleData } from "@/components/hotel-single/types";

const reviewRows = [
  { label: "Location", rating: "9.4", percent: "90%" },
  { label: "Staff", rating: "8.4", percent: "84%" },
  { label: "Cleanliness", rating: "9.4", percent: "90%" },
  { label: "Value for money", rating: "8", percent: "80%" },
  { label: "Comfort", rating: "9.4", percent: "90%" },
  { label: "Facilities", rating: "8.5", percent: "85%" },
  { label: "Free WiFi", rating: "9.4", percent: "90%" },
];

const replyTopics = ["Location", "Staff", "Cleanliness", "Value for money", "Comfort", "Facilities", "Free WiFi"];

function chunk<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export function HotelSingleV2({ hotel }: { hotel: HotelSingleData }) {
  const [stuck, setStuck] = useState(false);
  const [location, setLocation] = useState(hotel.location);
  const [dates, setDates] = useState<DateObject[]>(() => [
    new DateObject().setDay(15),
    new DateObject().setDay(14).add(1, "month"),
  ]);
  const [guests, setGuests] = useState<GuestCounts>({ Adults: 2, Children: 1, Rooms: 1 });

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY >= 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filter = (
    <FilterBox2
      locations={hotel.locations}
      location={location}
      onLocation={setLocation}
      dates={dates}
      onDates={setDates}
      guests={guests}
      onGuests={setGuests}
    />
  );

  const amenityGroups = chunk(hotel.amenities.length > 0 ? hotel.amenities : ["Free WiFi"], 4);
  const surroundings = [
    { title: "What's nearby", icon: "icon-nearby", rows: [hotel.address || hotel.location].filter(Boolean) },
    { title: "The area", icon: "icon-city-2", rows: [hotel.location, hotel.propertyType].filter(Boolean) },
    { title: "Top attractions", icon: "icon-ticket", rows: hotel.amenities.slice(0, 3) },
  ];

  return (
    <GoTripFrame>
      <div className="hotel-single-v2">
        <div className="py-10 bg-dark-2">
          <div className="container">
            <div className="row">
              <div className="col-12">{filter}</div>
            </div>
          </div>
        </div>

        <div className={`singleMenu js-singleMenu ${stuck ? "-is-active" : ""}`}>
          <div className="col-12">
            <div className="py-10 bg-dark-2">
              <div className="container">
                <div className="row">
                  <div className="col-12">{filter}</div>
                </div>
              </div>
            </div>
            <div className="singleMenu__content">
              <div className="container">
                <div className="row y-gap-20 justify-between items-center">
                  <div className="col-auto">
                    <div className="singleMenu__links row x-gap-30 y-gap-10">
                      <div className="col-auto">
                        <a href="#overview">Overview</a>
                      </div>
                      <div className="col-auto">
                        <a href="#rooms">Rooms</a>
                      </div>
                      <div className="col-auto">
                        <a href="#reviews">Reviews</a>
                      </div>
                      <div className="col-auto">
                        <a href="#facilities">Facilities</a>
                      </div>
                      <div className="col-auto">
                        <a href="#faq">Faq</a>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="row x-gap-15 y-gap-15 items-center">
                      <div className="col-auto">
                        <div className="text-14">
                          From <span className="text-22 text-dark-1 fw-500">{hotel.priceLabel}</span>
                        </div>
                      </div>
                      <div className="col-auto">
                        <a href="#rooms" className="button h-50 px-24 -dark-1 bg-blue-1 text-white">
                          Select Room <div className="icon-arrow-top-right ml-15" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="py-10 d-flex items-center bg-light-2">
          <div className="container">
            <div className="row y-gap-10 items-center justify-between">
              <div className="col-auto">
                <div className="row x-gap-10 y-gap-5 items-center text-14 text-light-1">
                  <div className="col-auto">
                    <Link href="/">Home</Link>
                  </div>
                  <div className="col-auto">&gt;</div>
                  <div className="col-auto">
                    <Link href={hotel.destinationHref || "/hotels"}>
                      {hotel.location ? `${hotel.location} Hotels` : "Hotels"}
                    </Link>
                  </div>
                  <div className="col-auto">&gt;</div>
                  <div className="col-auto">
                    <div className="text-dark-1">{hotel.name}</div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <Link href="/hotels" className="text-14 text-blue-1 underline">
                  All Hotel in {hotel.location || "our list"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <GalleryTwo hotel={hotel} />

        <section className="pt-30">
          <div className="container">
            <div className="row y-gap-30">
              <div className="col-12">
                <div className="px-24 py-20 rounded-4 bg-green-1">
                  <div className="row x-gap-20 y-gap-20 items-center">
                    <div className="col-auto">
                      <div className="flex-center size-60 rounded-full bg-white">
                        <i className="icon-star text-yellow-1 text-30" />
                      </div>
                    </div>
                    <div className="col-auto">
                      <h4 className="text-18 lh-15 fw-500">This property is in high demand!</h4>
                      <div className="text-15 lh-15">7 travelers have booked today.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="rooms" className="pt-30">
          <div className="container">
            <div className="row pb-20">
              <div className="col-auto">
                <h3 className="text-22 fw-500">Available Rooms</h3>
              </div>
            </div>
            <AvailableRooms2 rooms={hotel.rooms} />
          </div>
        </section>

        <section className="mt-40" id="facilities">
          <div className="container">
            <div className="row x-gap-40 y-gap-40">
              <div className="col-12">
                <h3 className="text-22 fw-500">Facilities of this Hotel</h3>
                <div className="row x-gap-40 y-gap-40 pt-20">
                  {amenityGroups.map((group, index) => (
                    <div className="col-xl-4" key={index}>
                      <div className="d-flex items-center text-16 fw-500">
                        <i className="icon-city-2 text-20 mr-10" />
                        General
                      </div>
                      <ul className="text-15 pt-10">
                        {group.map((item) => (
                          <li className="d-flex items-center" key={item}>
                            <i className="icon-check text-10 mr-20" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mt-40 mb-40">
          <div className="border-top-light" />
        </div>

        <section className="pt-40" id="reviews">
          <div className="container">
            <div className="row y-gap-40 justify-between">
              <div className="col-xl-3">
                <h3 className="text-22 fw-500">Guest reviews</h3>
                <div className="d-flex items-center mt-20">
                  <div className="flex-center bg-blue-1 rounded-4 size-70 text-22 fw-600 text-white">
                    {hotel.stars > 0 ? hotel.stars.toFixed(1) : "–"}
                  </div>
                  <div className="ml-20">
                    <div className="text-16 text-dark-1 fw-500 lh-14">{hotel.scoreLabel}</div>
                    <div className="text-15 text-light-1 lh-14 mt-4">{hotel.propertyType}</div>
                  </div>
                </div>
                <div className="row y-gap-20 pt-20">
                  {reviewRows.map((item) => (
                    <div className="col-12" key={item.label}>
                      <div className="d-flex items-center justify-between">
                        <div className="text-15 fw-500">{item.label}</div>
                        <div className="text-15 text-light-1">{item.rating}</div>
                      </div>
                      <div className="progressBar mt-10">
                        <div className="progressBar__bg bg-blue-2" />
                        <div className="progressBar__bar bg-dark-1" style={{ width: item.percent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-xl-8">
                <div className="row y-gap-40">
                  <div className="col-lg-12">
                    <h5 className="fw-500 text-blue-1">{hotel.scoreLabel}</h5>
                    <p className="text-15 text-dark-1 mt-10">{hotel.summary}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mt-40 mb-40">
          <div className="border-top-light" />
        </div>

        <section>
          <div className="container">
            <div className="row y-gap-30 justify-between">
              <div className="col-xl-3">
                <h3 className="text-22 fw-500">Leave a Reply</h3>
                <p className="text-15 text-dark-1 mt-5">Your email address will not be published.</p>
                <div className="row y-gap-30 pt-30">
                  {replyTopics.map((topic) => (
                    <div className="col-sm-6" key={topic}>
                      <div className="text-15 lh-1 fw-500">{topic}</div>
                      <div className="d-flex x-gap-5 items-center pt-10">
                        {Array.from({ length: 5 }, (_, index) => (
                          <div key={index} className="icon-star text-10 text-yellow-1" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-xl-8">
                <form
                  className="row y-gap-30 pt-20"
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                >
                  <div className="col-xl-6">
                    <div className="form-input">
                      <input type="text" required />
                      <label className="lh-1 text-16 text-light-1">Text</label>
                    </div>
                  </div>
                  <div className="col-xl-6">
                    <div className="form-input">
                      <input type="text" required />
                      <label className="lh-1 text-16 text-light-1">Email</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-input">
                      <textarea required rows={4} defaultValue="" />
                      <label className="lh-1 text-16 text-light-1">Write Your Comment</label>
                    </div>
                  </div>
                  <div className="col-auto">
                    <button type="submit" className="button -md -dark-1 bg-blue-1 text-white">
                      Post Comment <div className="icon-arrow-top-right ml-15" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-40">
          <div className="container">
            <div className="px-24 py-20 rounded-4 bg-light-2">
              <div className="row x-gap-20 y-gap-20 items-center">
                <div className="col-auto">
                  <div className="flex-center size-60 rounded-full bg-white">
                    <Image width={30} height={30} src="/img/icons/health.svg" alt="icon" />
                  </div>
                </div>
                <div className="col-auto">
                  <h4 className="text-18 lh-15 fw-500">Extra health &amp; safety measures</h4>
                  <div className="text-15 lh-15">
                    This property has taken extra health and hygiene measures to ensure that your safety is their
                    priority
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-40">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h3 className="text-22 fw-500">Hotel surroundings</h3>
              </div>
            </div>
            <div className="row x-gap-50 y-gap-30 pt-20">
              {surroundings.map((group) => (
                <div className="col-lg-4 col-md-6" key={group.title}>
                  <div className="mb-40 md:mb-30">
                    <div className="d-flex items-center mb-20">
                      <i className={`${group.icon} text-20 mr-10`} />
                      <div className="text-16 fw-500">{group.title}</div>
                    </div>
                    <div className="row y-gap-20 x-gap-0 pt-10">
                      {group.rows.map((row) => (
                        <div className="col-12 border-top-light" key={row}>
                          <div className="text-15">{row}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-40">
          <div className="container">
            <div className="pt-40 border-top-light">
              <div className="row">
                <div className="col-12">
                  <h3 className="text-22 fw-500">Some helpful facts</h3>
                </div>
              </div>
              <div className="row x-gap-50 y-gap-30 pt-20">
                <div className="col-lg-4 col-md-6">
                  <div className="d-flex items-center">
                    <i className="icon-calendar text-20 mr-10" />
                    <div className="text-16 fw-500">Check-in/Check-out</div>
                  </div>
                  <div className="row x-gap-50 y-gap-5 pt-10">
                    <div className="col-12">
                      <div className="text-15">Check-in from: {hotel.checkIn}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-15">Check-out until: {hotel.checkOut}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="d-flex items-center">
                    <i className="icon-plans text-20 mr-10" />
                    <div className="text-16 fw-500">The property</div>
                  </div>
                  <div className="row x-gap-50 y-gap-5 pt-10">
                    <div className="col-12">
                      <div className="text-15">Property type: {hotel.propertyType}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-15">Number of rooms: {hotel.roomCount}</div>
                    </div>
                    {hotel.houseRules ? (
                      <div className="col-12">
                        <div className="text-15">{hotel.houseRules}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="d-flex items-center">
                    <i className="icon-location-pin text-20 mr-10" />
                    <div className="text-16 fw-500">Getting around</div>
                  </div>
                  <div className="row x-gap-50 y-gap-5 pt-10">
                    <div className="col-12">
                      <div className="text-15">{hotel.address || hotel.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="pt-40 layout-pb-md">
          <div className="container">
            <div className="pt-40 border-top-light">
              <div className="row y-gap-20">
                <div className="col-lg-4">
                  <h2 className="text-22 fw-500">
                    FAQs about
                    <br /> {hotel.name}
                  </h2>
                </div>
                <div className="col-lg-8">
                  <div className="accordion -simple row y-gap-20 js-accordion">
                    {hotel.faqs.map((item, index) => (
                      <div className="col-12" key={item.title}>
                        <div className="accordion__item px-20 py-20 border-light rounded-4">
                          <div
                            className="accordion__button d-flex items-center"
                            data-bs-toggle="collapse"
                            data-bs-target={`#hotel-faq-${index}`}
                          >
                            <div className="accordion__icon size-40 flex-center bg-light-2 rounded-full mr-20">
                              <i className="icon-plus" />
                              <i className="icon-minus" />
                            </div>
                            <div className="button text-dark-1 text-start">{item.title}</div>
                          </div>
                          <div className="accordion-collapse collapse" id={`hotel-faq-${index}`}>
                            <div className="pt-15 pl-60">
                              <p className="text-15">{item.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hotel.similar.length > 0 ? (
          <section className="layout-pt-md layout-pb-lg">
            <div className="container">
              <div className="row justify-center text-center">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">Popular properties similar to {hotel.name}</h2>
                    <p className="sectionTitle__text mt-5 sm:mt-0">Other stays you can book</p>
                  </div>
                </div>
              </div>
              <div className="pt-40 sm:pt-20 item_gap-x30">
                <SimilarHotels hotels={hotel.similar} />
              </div>
            </div>
          </section>
        ) : null}

        <CallToActions />
        <DefaultFooter />
      </div>
    </GoTripFrame>
  );
}
