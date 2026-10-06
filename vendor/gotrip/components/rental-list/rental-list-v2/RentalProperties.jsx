
"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import rentalsData from "../../../data/rentals";
import isTextMatched from "../../../utils/isTextMatched";

const RentalProperties = () => {
  return (
    <>
      {rentalsData.map((item) => (
        <div
          className="col-lg-4 col-sm-6"
          key={item.id}
          data-aos="fade"
          data-aos-delay={item.delayAnimation}
        >
          <Link
            href={`/rental-single/${item.id}`}
            className="rentalCard -type-1 rounded-4 hover-inside-slider"
          >
            <div className="rentalCard__image">
              <div className="cardImage inside-slider">
                <Swiper
                  modules={[Navigation, Pagination]}
                  pagination={{
                    el: `.js-pagination-${item.id}`,
                    clickable: true,
                  }}
                  navigation={{
                    nextEl: `.js-next-${item.id}`,
                    prevEl: `.js-prev-${item.id}`,
                  }}
                  loop={item?.slideImg?.length > 1}
                >
                  {item?.slideImg?.map((slide, i) => (
                    <SwiperSlide key={i}>
                      <div className="cardImage ratio ratio-1:1">
                        <div className="cardImage__content ">
                          <Image
                            width={300}
                            height={300}
                            className="rounded-4 col-12 js-lazy"
                            src={slide}
                            alt="image"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {item?.slideImg?.length > 1 && (
                  <>
                    <div className="custom_inside-slider">
                      <button
                        className={`slick_arrow-between slick_arrow -prev arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none js-prev-${item.id}`}
                        onClick={(e) => e.preventDefault()}
                      >
                        <span className="icon icon-chevron-left text-12"></span>
                      </button>
                      <button
                        className={`slick_arrow-between slick_arrow -next arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none js-next-${item.id}`}
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="icon icon-chevron-right text-12"></i>
                      </button>
                    </div>
                    <div className="text-center" onClick={(e) => e.preventDefault()}>
                      <div className={`js-pagination-${item.id}`}></div>
                    </div>
                  </>
                )}

                <div className="cardImage__wishlist">
                  <button className="button -blue-1 bg-white size-30 rounded-full shadow-2">
                    <i className="icon-heart text-12" />
                  </button>
                </div>

                <div className="cardImage__leftBadge">
                  <div
                    className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase  ${
                      isTextMatched(item?.tag, "best seller")
                        ? "bg-blue-1 text-white"
                        : ""
                    }  ${
                      isTextMatched(item?.tag, "top rated")
                        ? "bg-yellow-1 text-dark-1"
                        : ""
                    }`}
                  >
                    {item?.tag}
                  </div>
                </div>
              </div>
            </div>
            {/* End image card */}

            <div className="rentalCard__content mt-10">
              <div className="text-14 text-light-1 lh-14 mb-5">
                {item?.location}
              </div>
              <h4 className="rentalCard__title text-dark-1 text-18 lh-16 fw-500">
                <span>{item?.title}</span>
              </h4>
              <p className="text-light-1 lh-14 text-14 mt-5" />
              <div className="d-flex items-center mt-5">
                <div className="text-14 text-light-1">{item?.guest} guests</div>
                <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                <div className="text-14 text-light-1">
                  {item?.bedroom} bedroom
                </div>
                <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                <div className="text-14 text-light-1">{item?.bed} bed</div>
              </div>
              <div className="d-flex items-center mt-20">
                <div className="flex-center bg-blue-1 rounded-4 size-30 text-12 fw-600 text-white">
                  {item?.ratings}
                </div>
                <div className="text-14 text-dark-1 fw-500 ml-10">
                  Exceptional
                </div>
                <div className="text-14 text-light-1 ml-10">
                  {item?.numberOfReviews} reviews
                </div>
              </div>
              <div className="mt-5">
                <div className="text-light-1">
                  <span className="fw-500 text-dark-1">US${item?.price}</span> /
                  per night
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
};

export default RentalProperties;
