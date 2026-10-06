"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { SimilarHotelCard } from "@/components/hotel-single/types";

export function SimilarHotels({ hotels }: { hotels: SimilarHotelCard[] }) {
  if (hotels.length === 0) return null;

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      pagination={{ clickable: true }}
      navigation={true}
      speed={500}
      slidesPerView={4}
      spaceBetween={20}
      breakpoints={{
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 4 },
      }}
    >
      {hotels.map((item) => (
        <SwiperSlide key={item.id}>
          <Link href={`/hotels/${item.slug}`} className="hotelsCard -type-1">
            <div className="hotelsCard__image">
              <div className="cardImage ratio ratio-1:1 rounded-4">
                <div className="cardImage__content">
                  <Image
                    width={300}
                    height={300}
                    className="rounded-4 col-12"
                    src={item.image}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="cardImage__wishlist">
                  <button type="button" className="button -blue-1 bg-white size-30 rounded-full shadow-2">
                    <i className="icon-heart text-12" />
                  </button>
                </div>
              </div>
            </div>
            <div className="hotelsCard__content mt-10">
              <h4 className="hotelsCard__title text-dark-1 text-18 lh-16 fw-500">
                <span>{item.name}</span>
              </h4>
              <p className="text-light-1 lh-14 text-14 mt-5">{item.location}</p>
              <div className="d-flex items-center mt-20">
                <div className="flex-center bg-blue-1 rounded-4 size-30 text-12 fw-600 text-white">{item.score}</div>
                <div className="text-14 text-dark-1 fw-500 ml-10">{item.scoreLabel}</div>
              </div>
              <div className="mt-5">
                <div className="fw-500">
                  Starting from <span className="text-blue-1">{item.priceLabel}</span>
                </div>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
