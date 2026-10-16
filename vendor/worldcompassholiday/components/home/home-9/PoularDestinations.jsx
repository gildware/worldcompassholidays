"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { destinations9 } from "../../../data/desinations";

const PoularDestinations = () => {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      pagination={false}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      speed={500}
      spaceBetween={10}
      loop={true}
      breakpoints={{
        0: { slidesPerView: 2 },
        520: { slidesPerView: 3 },
        768: { slidesPerView: 5 },
        1200: { slidesPerView: 7 },
      }}
    >
      {destinations9.map((item) => (
        <SwiperSlide key={item.id}>
          <div data-aos="fade-up" data-aos-delay={item.delayAnimation}>
            <Link
              href="/cruise-list-v2"
              className="citiesCard -type-5 d-flex items-center sm:flex-column sm:items-start px-20 py-20 sm:px-15 sm:py-20 bg-light-2 rounded-4"
            >
              <i className="icon-destination text-24" />
              <div className="ml-10 sm:ml-0 sm:mt-10">
                <h4 className="text-16 fw-500">{item.location}</h4>
                <p className="text-14">{item.numberOfProperties} properties</p>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PoularDestinations;
