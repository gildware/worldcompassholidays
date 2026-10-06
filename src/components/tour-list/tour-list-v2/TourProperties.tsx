"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { TourListCard } from "@/components/tour-list/types";
import { formatMoney } from "@/lib/format";

function tagClass(tag: string) {
  const value = tag.toLowerCase();
  if (value === "likely to sell out*") return "bg-dark-1 text-white";
  if (value === "best seller") return "bg-blue-1 text-white";
  if (value === "top rated") return "bg-yellow-1 text-dark-1";
  return "";
}

export function TourProperties({ tours }: { tours: TourListCard[] }) {
  if (tours.length === 0) {
    return (
      <div className="tour-workspace__empty">
        <h3 className="text-16 lh-16 fw-500">No tours match these filters</h3>
        <p className="text-14 text-light-1 mt-5">Try another destination, price, or category.</p>
      </div>
    );
  }

  return (
    <>
      {tours.map((item) => (
        <div key={item.id}>
          <Link href={item.href} className="tourCard -type-1 rounded-4 position-relative d-block">
            <div className="tourCard__image">
              <div className="cardImage ratio ratio-3:2">
                <div className="cardImage__content">
                  <div className="cardImage-slider rounded-4 overflow-hidden custom_inside-slider">
                    <Swiper
                      className="mySwiper"
                      modules={[Pagination, Navigation]}
                      pagination={{ clickable: true }}
                      navigation={true}
                    >
                      {(item.images.length > 0 ? item.images : [""]).map((slide, slideIndex) => (
                        <SwiperSlide key={`${item.id}-${slideIndex}`}>
                          {slide ? (
                            <Image
                              width={300}
                              height={300}
                              className="rounded-4 col-12 js-lazy"
                              src={slide}
                              alt={item.title}
                            />
                          ) : (
                            <div className="rounded-4 bg-light-2 w-100 h-100" />
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              </div>

              <div className="cardImage__wishlist">
                <button
                  type="button"
                  className="button -blue-1 bg-white size-30 rounded-full shadow-2"
                  aria-label="Save"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <i className="icon-heart text-12" />
                </button>
              </div>

              {item.tag ? (
                <div className="cardImage__leftBadge">
                  <div
                    className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${tagClass(item.tag)}`}
                  >
                    {item.tag}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="tourCard__content mt-5">
              <div className="d-flex items-center lh-14 mb-5">
                <div className="text-13 text-light-1">{item.durationLabel}</div>
                <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                <div className="text-13 text-light-1">{item.category}</div>
              </div>
              <h4 className="tourCard__title text-dark-1 text-16 lh-14 fw-500">
                <span>{item.title}</span>
              </h4>
              <p className="text-light-1 lh-14 text-13 mt-5">{item.location}</p>

              <div className="row justify-between items-center pt-5">
                <div className="col-auto">
                  <div className="d-flex items-center">
                    <div className="d-flex items-center x-gap-5">
                      <div className="icon-star text-yellow-1 text-10" />
                      <div className="icon-star text-yellow-1 text-10" />
                      <div className="icon-star text-yellow-1 text-10" />
                      <div className="icon-star text-yellow-1 text-10" />
                      <div className="icon-star text-yellow-1 text-10" />
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="text-14 text-light-1">
                    From
                    <span className="text-16 fw-500 text-dark-1"> {formatMoney(item.price, item.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
