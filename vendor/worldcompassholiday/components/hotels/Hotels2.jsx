"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { hotelsData } from "../../data/hotels";
import isTextMatched from "../../utils/isTextMatched";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Hotels2 = () => {
  return (
    <>
      <Swiper
        modules={[Navigation, Pagination]}
        pagination={{ clickable: true }}
        navigation={true}
        speed={500}
        slidesPerView={4}
        spaceBetween={20}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          520: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 2,
          },
          1200: {
            slidesPerView: 4,
          },
        }}
      >
        {hotelsData.slice(0, 4).map((item) => (
          <SwiperSlide key={item?.id}>
            <div data-aos="fade" data-aos-delay={item.delayAnimation}>
              <Link
                href={`/hotel-single-v1/${item.id}`}
                className="hotelsCard -type-1 hover-inside-slider"
              >
                <div className="hotelsCard__image">
                  <div className="cardImage inside-slider">
                    {/* Inner image slider */}
                    <Swiper
                      modules={[Navigation, Pagination]}
                      pagination={{ clickable: true }}
                      navigation={{
                        nextEl: `.next-${item.id}`,
                        prevEl: `.prev-${item.id}`,
                      }}
                      slidesPerView={1}
                      speed={500}
                      loop={item?.slideImg?.length > 1}
                    >
                      {item?.slideImg?.map((slide, i) => (
                        <SwiperSlide key={i}>
                          <div className="cardImage ratio ratio-1:1">
                            <div className="cardImage__content">
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

                    {/* Custom nav arrows for inner slider */}
                    {item?.slideImg?.length > 1 && (
                      <div className="custom_inside-slider">
                        <button
                          className={`slick_arrow-between slick_arrow -prev arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none prev-${item.id}`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <span className="icon icon-chevron-left text-12"></span>
                        </button>
                        <button
                          className={`slick_arrow-between slick_arrow -next arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none next-${item.id}`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <i className="icon icon-chevron-right text-12"></i>
                        </button>
                      </div>
                    )}

                    <div className="cardImage__wishlist">
                      <button className="button -blue-1 bg-white size-30 rounded-full shadow-2">
                        <i className="icon-heart text-12" />
                      </button>
                    </div>

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
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default Hotels2;
