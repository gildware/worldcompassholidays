
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

const Categories = () => {
  const catContent = [
    { id: 1, icon: "icon-bed", catName: "Hotel" },
    { id: 2, icon: "icon-destination", catName: "Tour" },
    { id: 3, icon: "icon-ski", catName: "Activity" },
    { id: 4, icon: "icon-home", catName: "Holiday Rentals" },
    { id: 5, icon: "icon-car", catName: "Car" },
    { id: 6, icon: "icon-yatch", catName: " Cruise" },
    { id: 7, icon: "icon-tickets", catName: " Flights" },
  ];
  return (
    <Swiper
      modules={[Pagination]}
      pagination={{ clickable: true }}
      speed={500}
      breakpoints={{
        0: { slidesPerView: 2 },
        520: { slidesPerView: 4 },
        768: { slidesPerView: 4 },
        992: { slidesPerView: 5 },
        1200: { slidesPerView: 7 },
      }}
    >
      {catContent.map((item) => (
        <SwiperSlide key={item.id}>
          <button className="d-flex flex-column justify-center px-20 py-15 rounded-4 border-light text-16 lh-14 fw-500 col-12">
            <i className={`${item.icon} text-25 mb-10`} />
            {item.catName}
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Categories;
