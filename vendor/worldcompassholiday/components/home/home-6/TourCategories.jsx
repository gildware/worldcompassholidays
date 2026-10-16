
"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { tourCategories1 } from "../../../data/tourCategories";

const TourCategories = () => {
  return (
    <Swiper
      modules={[Pagination]}
      pagination={{ clickable: true }}
      speed={500}
      spaceBetween={20}
      breakpoints={{
        0: { slidesPerView: 2 },
        520: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1200: { slidesPerView: 5 },
      }}
    >
      {tourCategories1.slice(8, 13).map((item) => (
        <SwiperSlide key={item.id}>
          <div data-aos="fade" data-aos-delay={item.dealyAimation}>
            <Link
              href="/activity-list-v3"
              className="tourTypeCard -type-1 d-block rounded-4 bg-blue-1-05 rounded-4"
            >
              <div className="tourTypeCard__content text-center pt-60 pb-24 px-30">
                <i className={`${item.icon} text-60 sm:text-40 text-blue-1`}></i>
                <h4 className="text-dark-1 text-18 fw-500 mt-50 md:mt-30">
                  {item.name}
                </h4>
                <p className="text-light-1 lh-14 text-14 mt-5">
                  {item.tourNumber} Tours From ${item.price}
                </p>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TourCategories;
