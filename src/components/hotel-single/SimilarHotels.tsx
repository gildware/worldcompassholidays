"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import type { SimilarHotelCard } from "@/components/hotel-single/types";

export function SimilarHotels({ hotels, title }: { hotels: SimilarHotelCard[]; title: string }) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (hotels.length === 0) return null;

  function bindNavigation(swiper: SwiperInstance) {
    const navigation = swiper.params.navigation;
    if (!navigation || typeof navigation === "boolean") return;
    navigation.prevEl = prevRef.current;
    navigation.nextEl = nextRef.current;
    swiper.navigation.destroy();
    swiper.navigation.init();
    swiper.navigation.update();
  }

  return (
    <>
      <div className="similar-stays__head">
        <div>
          <h2>Popular properties similar to {title}</h2>
          <p>Other stays you can book</p>
        </div>
        <div className="similar-stays__nav">
          <button ref={prevRef} type="button" className="similar-stays__arrow" aria-label="Previous stays">
            <i className="icon-arrow-left" />
          </button>
          <button ref={nextRef} type="button" className="similar-stays__arrow" aria-label="Next stays">
            <i className="icon-arrow-right" />
          </button>
        </div>
      </div>
      <Swiper
        className="similar-stays__swiper"
        modules={[Navigation]}
        navigation
        speed={500}
        slidesPerView={4}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 4 },
        }}
        onBeforeInit={bindNavigation}
        onSwiper={bindNavigation}
      >
        {hotels.map((item) => (
          <SwiperSlide key={item.id}>
            <Link href={`/hotels/${item.slug}`} className="hotelsCard -type-1">
              <div className="hotelsCard__image">
                <div className="cardImage similar-stays__photo rounded-4">
                  <div className="cardImage__content">
                    <Image
                      width={300}
                      height={180}
                      className="rounded-4 col-12"
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
              <div className="hotelsCard__content mt-10">
                <h4 className="hotelsCard__title text-dark-1 text-16 lh-16 fw-500">
                  <span>{item.name}</span>
                </h4>
                <p className="text-light-1 lh-14 text-14 mt-5">{item.location}</p>
                <div className="d-flex items-center mt-10">
                  <div className="flex-center bg-blue-1 rounded-4 size-30 text-12 fw-600 text-white">{item.score}</div>
                  <div className="text-14 text-dark-1 fw-500 ml-10">{item.scoreLabel}</div>
                </div>
                <div className="mt-5">
                  <div className="text-14 fw-500">
                    From <span className="text-blue-1">{item.priceLabel}</span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
