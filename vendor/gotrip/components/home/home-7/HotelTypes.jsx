
"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

const HotelTypes = () => {
  const hotelTypeContent = [
    {
      id: 1,
      img: "/img/stays/1/1.png",
      type: "Apartments",
      numberOfProperties: "4090",
      delayAnimation: "100",
    },
    {
      id: 2,
      img: "/img/stays/1/2.png",
      type: "Resort",
      numberOfProperties: "4090",
      delayAnimation: "200",
    },
    {
      id: 3,
      img: "/img/stays/1/3.png",
      type: "Villas",
      numberOfProperties: "4090",
      delayAnimation: "300",
    },
    {
      id: 4,
      img: "/img/stays/1/4.png",
      type: "Cabins",
      numberOfProperties: "4090",
      delayAnimation: "400",
    },
    {
      id: 5,
      img: "/img/stays/1/5.png",
      type: "Tiny Houses",
      numberOfProperties: "4090",
      delayAnimation: "500",
    },
  ];

  return (
    <>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        speed={500}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 2 },
          520: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          992: { slidesPerView: 5 },
        }}
      >
        {hotelTypeContent.map((item) => (
          <SwiperSlide key={item.id}>
            <div data-aos="fade" data-aos-delay={item.delayAnimation}>
              <Link href="/rental-list-v2" className="citiesCard -type-2 ">
                <div className="citiesCard__image rounded-4 ratio ratio-23:18">
                  <Image
                    className="img-ratio rounded-4 js-lazy"
                    src={item.img}
                    alt="image"
                    width={236}
                    height={185}
                  />
                </div>
                <div className="citiesCard__content mt-10">
                  <h4 className="text-18 lh-13 fw-500 text-dark-1">
                    {item.type}
                  </h4>
                  <div className="text-14 text-light-1">
                    {item.numberOfProperties} properties
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

export default HotelTypes;
