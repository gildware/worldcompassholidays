
"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import teamData from "../../data/teamData";

const Team1 = () => {
  return (
    <div className="position-relative">
      <Swiper
        modules={[Navigation, Pagination]}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".js-next-team",
          prevEl: ".js-prev-team",
        }}
        loop={true}
        speed={500}
        spaceBetween={30}
        breakpoints={{
          0: { slidesPerView: 1 },
          520: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          992: { slidesPerView: 4 },
          1400: { slidesPerView: 5 },
        }}
      >
        {teamData.map((item) => (
          <SwiperSlide key={item.id}>
            <div>
              <Image
                width={234}
                height={300}
                src={item.img}
                alt="image"
                className="rounded-4 col-12"
              />
              <div className="mt-10">
                <div className="text-18 lh-15 fw-500">{item.name}</div>
                <div className="text-14 lh-15">{item.designation}</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom navigation arrows */}
      <button className="arrow-top-right d-flex items-center text-24 arrow-left-hover arro-prev js-prev-team slick-prev" style={{zIndex: 1, top: '40%', position: 'absolute', left: '-50px'}}>
        <span className="icon icon-arrow-left"></span>
      </button>
      <button className="arrow-top-right d-flex items-center text-24 arrow-right-hover arrow-next js-next-team slick-next" style={{zIndex: 1, top: '40%', position: 'absolute', right: '-50px'}}>
        <i className="icon icon-arrow-right"></i>
      </button>
    </div>
  );
};

export default Team1;
