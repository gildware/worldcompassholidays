"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { testimonial1 } from "../../data/testimonialData";

const Testimonial = () => {
  return (
    <>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        speed={500}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1 },
          520: { slidesPerView: 2 },
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
        }}
      >
        {testimonial1.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              className="testimonials -type-1 bg-white rounded-4 pt-40 pb-30 px-40"
              data-aos="fade"
              data-aos-delay={item.dealyAnimation}
            >
              <h4 className="text-16 fw-500 text-blue-1 mb-20">{item.meta}</h4>
              <p className="testimonials__text lh-18 fw-500 text-dark-1">
                {item.text}
              </p>
              <div className="pt-20 mt-28 border-top-light">
                <div className="row x-gap-20 y-gap-20 items-center">
                  <div className="col-auto">
                    <Image
                      width={60}
                      height={60}
                      src={item.avatar}
                      alt="image"
                      className="size-60 rounded-circle"
                    />
                  </div>
                  <div className="col-auto">
                    <div className="text-15 fw-500 lh-14">{item.name}</div>
                    <div className="text-14 lh-14 text-light-1 mt-5">
                      {item.designation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default Testimonial;
