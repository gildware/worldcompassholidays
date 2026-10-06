"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { HotelListCard } from "@/components/hotel-list/types";
import { formatMoney } from "@/lib/format";

const ratingLabels = ["", "Pleasant", "Good", "Very good", "Excellent", "Exceptional"];

export function HotelProperties({
  hotels,
  nights,
  adults,
}: {
  hotels: HotelListCard[];
  nights: number;
  adults: number;
}) {
  if (hotels.length === 0) {
    return (
      <div className="col-12">
        <div className="border-top-light pt-30">
          <h3 className="text-18 lh-16 fw-500">No hotels match these filters</h3>
          <p className="text-15 text-light-1 mt-10">
            Try another destination, price, or star rating.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {hotels.map((item) => {
        const stayTotal = item.price * nights;
        return (
          <div className="col-12" key={item.id}>
            <div className="border-top-light pt-30">
              <div className="row x-gap-20 y-gap-20">
                <div className="col-md-auto">
                  <div className="cardImage ratio ratio-1:1 w-250 md:w-1/1 rounded-4">
                    <div className="cardImage__content">
                      <div className="cardImage-slider rounded-4 custom_inside-slider h-full">
                        <Swiper
                          className="mySwiper h-full"
                          modules={[Pagination, Navigation]}
                          pagination={{ clickable: true }}
                          navigation={true}
                        >
                          {(item.images.length > 0 ? item.images : [""]).map((slide, index) => (
                            <SwiperSlide key={`${item.id}-${index}`} className="h-full">
                              {slide ? (
                                <Image
                                  width={250}
                                  height={250}
                                  className="rounded-4 col-12 js-lazy h-full w-100 object-fit-cover"
                                  src={slide}
                                  alt={item.name}
                                />
                              ) : (
                                <div className="rounded-4 bg-light-2 h-full" />
                              )}
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                    <div className="cardImage__wishlist">
                      <button
                        type="button"
                        className="button -blue-1 bg-white size-30 rounded-full shadow-2"
                      >
                        <i className="icon-heart text-12" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md">
                  <h3 className="text-18 lh-16 fw-500">
                    {item.name}
                    {item.location ? (
                      <>
                        <br className="lg:d-none" /> {item.location}
                      </>
                    ) : null}
                    {item.stars > 0 ? (
                      <div className="d-inline-block ml-10">
                        {Array.from({ length: item.stars }, (_, index) => (
                          <i key={index} className="icon-star text-10 text-yellow-2" />
                        ))}
                      </div>
                    ) : null}
                  </h3>

                  <div className="row x-gap-10 y-gap-10 items-center pt-10">
                    {item.location ? (
                      <div className="col-auto">
                        <p className="text-14">{item.location}</p>
                      </div>
                    ) : null}
                    {item.mapUrl ? (
                      <div className="col-auto">
                        <a
                          href={item.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="d-block text-14 text-blue-1 underline"
                        >
                          Show on map
                        </a>
                      </div>
                    ) : null}
                    {item.address ? (
                      <>
                        <div className="col-auto">
                          <div className="size-3 rounded-full bg-light-1" />
                        </div>
                        <div className="col-auto">
                          <p className="text-14">{item.address}</p>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {item.roomName ? (
                    <div className="text-14 lh-15 mt-20">
                      <div className="fw-500">{item.roomName}</div>
                      {item.bedLabel ? <div className="text-light-1">{item.bedLabel}</div> : null}
                    </div>
                  ) : null}

                  {item.cancellationTitle ? (
                    <div className="text-14 text-green-2 lh-15 mt-10">
                      <div className="fw-500">{item.cancellationTitle}</div>
                      {item.cancellationDetail ? <div>{item.cancellationDetail}</div> : null}
                    </div>
                  ) : null}

                  {item.amenities.length > 0 ? (
                    <div className="row x-gap-10 y-gap-10 pt-20">
                      {item.amenities.map((amenity) => (
                        <div className="col-auto" key={amenity}>
                          <div className="border-light rounded-100 py-5 px-20 text-14 lh-14">
                            {amenity}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="col-md-auto text-right md:text-left">
                  {item.stars > 0 ? (
                    <div className="row x-gap-10 y-gap-10 justify-end items-center md:justify-start">
                      <div className="col-auto">
                        <div className="text-14 lh-14 fw-500">
                          {ratingLabels[item.stars] ?? "Guest rating"}
                        </div>
                        <div className="text-14 lh-14 text-light-1">{item.propertyType}</div>
                      </div>
                      <div className="col-auto">
                        <div className="flex-center text-white fw-600 text-14 size-40 rounded-4 bg-blue-1">
                          {item.stars.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div className="text-14 text-light-1 mt-50 md:mt-20">
                      {nights} nights, {adults} adult
                    </div>
                    <div className="text-22 lh-12 fw-600 mt-5">
                      {formatMoney(stayTotal, item.currency)}
                    </div>
                    <div className="text-14 text-light-1 mt-5">
                      {formatMoney(item.price, item.currency)} per night
                    </div>
                    <Link
                      href={`/hotels/${item.slug}`}
                      className="button -md -dark-1 bg-blue-1 text-white mt-24"
                    >
                      See Availability <div className="icon-arrow-top-right ml-15" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
