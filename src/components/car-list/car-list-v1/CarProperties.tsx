"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { CarListCard } from "@/components/car-list/types";
import { formatMoney } from "@/lib/format";

export function CarProperties({
  cars,
  detailQuery,
}: {
  cars: CarListCard[];
  detailQuery: string;
}) {
  if (cars.length === 0) {
    return (
      <div className="col-12">
        <div className="border-top-light pt-30">
          <h3 className="text-18 lh-16 fw-500">No cars match these filters</h3>
          <p className="text-15 text-light-1 mt-10">
            Try another location, category, or price.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {cars.map((item) => {
        const specs = [
          { icon: "icon-user-2", label: String(item.seats) },
          { icon: "icon-luggage", label: String(item.luggage) },
          { icon: "icon-transmission", label: item.transmission || "Automatic" },
          { icon: "icon-speedometer", label: item.mileageLabel },
          ...(item.specs.includes("With air conditioning")
            ? [{ icon: "icon-transmission", label: "Air conditioning" }]
            : []),
          { icon: "icon-speedometer", label: item.fuel || "Full to full" },
        ];
        const href = `/rentals/${item.slug}${detailQuery ? `?${detailQuery}` : ""}`;

        return (
          <div className="col-12" key={item.id}>
            <div className="border-top-light pt-30">
              <div className="row x-gap-20 y-gap-20">
                <div className="col-md-auto">
                  <div className="relative d-flex">
                    <div className="cardImage w-250 md:w-1/1 rounded-4 border-light">
                      <div className="custom_inside-slider">
                        <Swiper
                          className="mySwiper"
                          modules={[Pagination, Navigation]}
                          pagination={{ clickable: true }}
                          navigation={true}
                        >
                          {(item.images.length > 0 ? item.images : [""]).map((slide, index) => (
                            <SwiperSlide key={`${item.id}-${index}`}>
                              <div className="ratio ratio-1:1">
                                <div className="cardImage__content">
                                  {slide ? (
                                    <Image
                                      width={250}
                                      height={250}
                                      className="rounded-4 col-12 js-lazy"
                                      src={slide}
                                      alt={item.name}
                                    />
                                  ) : (
                                    <div className="rounded-4 bg-light-2 h-100 w-100" />
                                  )}
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
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md">
                  <div className="d-flex flex-column h-full justify-between">
                    <div>
                      <div className="row x-gap-5 items-center">
                        <div className="col-auto">
                          <div className="text-14 text-light-1">{item.location}</div>
                        </div>
                        <div className="col-auto">
                          <div className="size-3 rounded-full bg-light-1" />
                        </div>
                        <div className="col-auto">
                          <div className="text-14 text-light-1">{item.category || "SUV"}</div>
                        </div>
                      </div>
                      <h3 className="text-18 lh-16 fw-500 mt-5">
                        {item.name} <span className="text-15 text-light-1">or similar</span>
                      </h3>
                    </div>
                    <div className="col-lg-7 mt-20">
                      <div className="row y-gap-5">
                        {specs.map((spec) => (
                          <div className="col-sm-6" key={`${item.id}-${spec.icon}-${spec.label}`}>
                            <div className="d-flex items-center">
                              <i className={spec.icon} />
                              <div className="text-14 ml-10">{spec.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {item.freeCancellation ? (
                      <div className="mt-20">
                        <div className="d-flex items-center">
                          <i className="icon-check text-10" />
                          <div className="text-14 fw-500 text-green-2 ml-10">Free Cancellation</div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-md-auto text-right md:text-left">
                  <div className="text-22 lh-12 fw-600 mt-70 md:mt-20">
                    {formatMoney(item.price, item.currency)}
                  </div>
                  <div className="text-14 text-light-1 mt-5">Total</div>
                  <Link
                    href={href}
                    className="button h-50 px-24 bg-dark-1 -yellow-1 text-white mt-24"
                  >
                    View Detail <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
