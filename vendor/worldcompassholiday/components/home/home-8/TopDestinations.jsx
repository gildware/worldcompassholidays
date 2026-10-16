
"use client";

import { destinations8 } from "../../../data/desinations";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Link from "next/link";

const TopDestinations = () => {
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
        1099: { slidesPerView: 6 },
      }}
    >
      {destinations8.map((item) => (
        <SwiperSlide key={item.id}>
          <div data-aos="fade" data-aos-delay={item.delayAnimation}>
            <Link
              href="/destinations"
              className="citiesCard -type-4 d-block text-center"
            >
              <div className="citiesCard__image size-160 rounded-full mx-auto">
                <img
                  className="object-cover js-lazy"
                  src={item.img}
                  alt="image"
                />
              </div>
              <div className="citiesCard__content mt-10">
                <h4 className="text-18 lh-13 fw-500 text-dark-1">
                  {item.location}
                </h4>
                <div className="text-14 text-light-1">
                  From US ${item.price} per day
                </div>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TopDestinations;
