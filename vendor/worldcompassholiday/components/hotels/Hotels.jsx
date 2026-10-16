"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { hotelsData } from "../../data/hotels";
import isTextMatched from "../../utils/isTextMatched";
import { useRef } from "react";

const Hotels = () => {
  const outerSwiperRef = useRef(null);

  return (
    <>
      <Swiper
        spaceBetween={30}
        modules={[Pagination]}
        onSwiper={(swiper) => (outerSwiperRef.current = swiper)}
        pagination={{
          el: ".js-hotels-pag",
          clickable: true,
        }}
        breakpoints={{
          540: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 22 },
          1024: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
      >
        {hotelsData.slice(0, 8).map((item) => (
          <SwiperSlide key={item?.id}>
            <Link
              href={`/hotel-single-v1/${item.id}`}
              className="hotelsCard -type-1 hover-inside-slider"
              data-aos="fade"
              data-aos-delay={item.delayAnimation}
            >
              <div className="hotelsCard__image">
                <div className="cardImage ratio ratio-1:1">
                  <div className="cardImage__content">
                    {/* ✅ INNER SWIPER */}
                    <div className="cardImage-slider rounded-4 overflow-hidden">
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

                      {/* ✅ CUSTOM NAV + PAGINATION */}
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
                      isTextMatched(item?.tag, "breakfast included")
                        ? "bg-dark-1 text-white"
                        : ""
                    } ${
                      isTextMatched(item?.tag, "best seller")
                        ? "bg-blue-1 text-white"
                        : ""
                    } ${
                      isTextMatched(item?.tag, "-25% today")
                        ? "bg-brown-1 text-white"
                        : ""
                    } ${
                      isTextMatched(item?.tag, "top rated")
                        ? "bg-yellow-1 text-dark-1"
                        : ""
                    }`}
                  >
                    {item?.tag}
                  </div>
                </div>
              </div>

              {/* content */}
              <div className="hotelsCard__content mt-10">
                <h4 className="hotelsCard__title text-dark-1 text-18 lh-16 fw-500">
                  <span>{item?.title}</span>
                </h4>
                <p className="text-light-1 lh-14 text-14 mt-5">
                  {item?.location}
                </p>

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
                  <div className="fw-500">
                    Starting from{" "}
                    <span className="text-blue-1">US${item?.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ OUTER NAVIGATION */}
      <div className="d-flex x-gap-15 items-center justify-center sm:justify-start pt-40 sm:pt-20">
        <div className="col-auto">
          <button
            className="d-flex items-center text-24 arrow-left-hover"
            onClick={() => outerSwiperRef.current?.slidePrev()}
          >
            <i className="icon icon-arrow-left" />
          </button>
        </div>

        <div className="col-auto">
          <div className="pagination -dots text-border js-hotels-pag" />
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

export default Hotels;
