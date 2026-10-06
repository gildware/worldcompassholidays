"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import toursData from "../../data/tours";
import isTextMatched from "../../utils/isTextMatched";
import { useRef } from "react";

const Tours3 = () => {
  const outerSwiperRef = useRef(null);

  return (
    <>
      <Swiper
        spaceBetween={30}
        modules={[Pagination]}
        onSwiper={(swiper) => (outerSwiperRef.current = swiper)}
        pagination={{
          el: ".js-tour-discount-pagination",
          clickable: true,
        }}
        breakpoints={{
          500: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 22 },
          1024: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        }}
      >
        {toursData.slice(0, 5).map((item) => (
          <SwiperSlide key={item.id}>
            <div data-aos="fade" data-aos-delay={item?.delayAnimation}>
              <Link
                href={`/tour-single/${item.id}`}
                className="tourCard -type-1 rounded-4 hover-inside-slider"
              >
                <div className="tourCard__image">
                  <div className="cardImage ratio ratio-1:1">
                    <div className="cardImage__content">
                      {/* ✅ INNER SWIPER */}
                      <div className="cardImage-slider rounded-4 overflow-hidden custom_inside-slider">
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
                        isTextMatched(item?.tag, "likely to sell out*")
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
                      {item.tag}
                    </div>
                  </div>
                </div>

                {/* content */}
                <div className="tourCard__content mt-10">
                  <div className="d-flex items-center lh-14 mb-5">
                    <div className="text-14 text-light-1">
                      {item?.duration}+ hours
                    </div>
                    <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                    <div className="text-14 text-light-1">{item?.tourType}</div>
                  </div>

                  <h4 className="tourCard__title text-dark-1 text-18 lh-16 fw-500">
                    <span>{item?.title}</span>
                  </h4>

                  <p className="text-light-1 lh-14 text-14 mt-5">
                    {item?.location}
                  </p>

                  <div className="row justify-between items-center pt-15">
                    <div className="col-auto">
                      <div className="d-flex items-center">
                        <div className="d-flex items-center x-gap-5">
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                        </div>
                        <div className="text-14 text-light-1 ml-10">
                          {item?.numberOfReviews} reviews
                        </div>
                      </div>
                    </div>

                    <div className="col-auto">
                      <div className="text-14 text-light-1">
                        From{" "}
                        <span className="text-16 fw-500 text-dark-1">
                          US${item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ OUTER NAV */}
      <div className="d-flex x-gap-15 items-center justify-center pt-40 sm:pt-20">
        <button onClick={() => outerSwiperRef.current?.slidePrev()}>
          Prev
        </button>

        <div className="pagination -dots js-tour-discount-pagination" />

        <button onClick={() => outerSwiperRef.current?.slideNext()}>
          Next
        </button>
      </div>
    </>
  );
};

export default Tours3;
