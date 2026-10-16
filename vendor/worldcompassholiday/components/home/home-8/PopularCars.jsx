"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import carsData from "../../../data/cars";
import isTextMatched from "../../../utils/isTextMatched";
import { useRef } from "react";

const PopularCars = () => {
  const outerSwiperRef = useRef(null);

  return (
    <>
      <Swiper
        spaceBetween={30}
        modules={[Pagination]}
        onSwiper={(swiper) => (outerSwiperRef.current = swiper)}
        pagination={{ el: ".js-car-pag_active", clickable: true }}
        breakpoints={{
          500: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 22 },
          1024: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
      >
        {carsData.slice(0, 8).map((item) => (
          <SwiperSlide key={item.id}>
            <div data-aos="fade" data-aos-delay={item?.delayAnimation}>
              <Link
                href={`/car-single/${item.id}`}
                className="carCard -type-1 d-block rounded-4 hover-inside-slider"
              >
                <div className="carCard__image">
                  <div className="cardImage ratio border-light ratio-6:5">
                    <div className="cardImage__content">
                      {/* ✅ INNER SWIPER (like Cruise3) */}
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
                            <Image
                              width={300}
                              height={300}
                              className="rounded-4 col-12 js-lazy"
                              src={slide}
                              alt="image"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* ✅ SHOW ONLY IF MULTIPLE IMAGES */}
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
                              <span className="icon icon-chevron-right text-12"></span>
                            </button>
                          </div>

                          <div
                            className="text-center"
                            onClick={(e) => e.preventDefault()}
                          >
                            <div className={`js-pagination-${item.id}`}></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* wishlist */}
                  <div className="cardImage__wishlist">
                    <button className="button -blue-1 bg-white size-30 rounded-full shadow-2">
                      <i className="icon-heart text-12" />
                    </button>
                  </div>

                  {/* badge */}
                  <div className="cardImage__leftBadge">
                    <div
                      className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${
                        isTextMatched(item?.tag, "best seller")
                          ? "bg-blue-1 text-white"
                          : ""
                      }`}
                    >
                      {item?.tag}
                    </div>
                  </div>
                </div>

                {/* content */}
                <div className="carCard__content mt-10">
                  <div className="d-flex items-center lh-14 mb-5">
                    <div className="text-14 text-light-1">{item?.location}</div>
                    <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                    <div className="text-14 text-light-1 uppercase">
                      {item?.type}
                    </div>
                  </div>

                  <h4 className="text-dark-1 text-18 lh-16 fw-500">
                    {item?.title}
                    <span className="text-15 text-light-1 fw-400">
                      {" "}
                      or similar
                    </span>
                  </h4>

                  <div className="row x-gap-20 y-gap-10 items-center pt-5">
                    <div className="col-auto">
                      <i className="icon-user-2 mr-10" />
                      {item?.seat}
                    </div>
                    <div className="col-auto">
                      <i className="icon-luggage mr-10" />
                      {item?.luggage}
                    </div>
                    <div className="col-auto">
                      <i className="icon-transmission mr-10" />
                      {item?.transmission}
                    </div>
                    <div className="col-auto">
                      <i className="icon-speedometer mr-10" />
                      {item?.speed}
                    </div>
                  </div>

                  <div className="d-flex items-center mt-20">
                    <div className="flex-center bg-yellow-1 rounded-4 size-30 text-12 fw-600 text-dark-1">
                      {item.ratings}
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
                      <span className="fw-500 text-dark-1">
                        US${item?.price}
                      </span>{" "}
                      total
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ OUTER NAVIGATION (same as Cruise3) */}
      <div className="d-flex x-gap-15 items-center justify-center pt-40 sm:pt-20">
        <div className="col-auto">
          <button
            className="d-flex items-center text-24 arrow-left-hover"
            onClick={() => outerSwiperRef.current?.slidePrev()}
          >
            <i className="icon icon-arrow-left" />
          </button>
        </div>

        <div className="col-auto">
          <div className="pagination -dots text-border js-car-pag_active" />
        </div>

        <div className="col-auto">
          <button
            className="d-flex items-center text-24 arrow-right-hover"
            onClick={() => outerSwiperRef.current?.slideNext()}
          >
            <i className="icon icon-arrow-right" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PopularCars;
