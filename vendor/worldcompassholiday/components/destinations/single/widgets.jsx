"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import isTextMatched from "@/utils/isTextMatched";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const cover = { width: "100%", height: "100%", objectFit: "cover" };

const listingSwiper = {
  modules: [Navigation, Pagination],
  pagination: { clickable: true },
  navigation: true,
  speed: 500,
  slidesPerView: 4,
  spaceBetween: 20,
  breakpoints: {
    0: { slidesPerView: 1 },
    520: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    992: { slidesPerView: 2 },
    1200: { slidesPerView: 4 },
  },
};

function CoverImage({ src, alt, className }) {
  if (!src) return null;
  return (
    <Image
      width={300}
      height={300}
      className={className}
      style={cover}
      src={src}
      alt={alt || "image"}
    />
  );
}

export function CategoryPills({ items }) {
  if (!items?.length) return null;

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
      {items.map((item) => (
        <SwiperSlide key={item.href}>
          <Link
            href={item.href}
            className="d-flex flex-column justify-center px-20 py-15 rounded-4 border-light text-16 lh-14 fw-500 col-12"
          >
            <i className={`${item.icon} text-25 mb-10`} />
            {item.name}
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function HotelCards({ hotels }) {
  if (!hotels?.length) return null;

  return (
    <Swiper {...listingSwiper}>
      {hotels.map((item) => (
        <SwiperSlide key={item.id}>
          <div data-aos="fade">
            <Link href={item.href} className="hotelsCard -type-1 hover-inside-slider">
              <div className="hotelsCard__image">
                <div className="cardImage inside-slider">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    pagination={{ clickable: true }}
                    navigation={{
                      nextEl: `.next-${item.id}`,
                      prevEl: `.prev-${item.id}`,
                    }}
                    slidesPerView={1}
                    speed={500}
                    loop={item.slideImg.length > 1}
                  >
                    {item.slideImg.map((slide, index) => (
                      <SwiperSlide key={`${item.id}-${index}`}>
                        <div className="cardImage ratio ratio-1:1">
                          <div className="cardImage__content">
                            <CoverImage
                              src={slide}
                              alt={item.title}
                              className="rounded-4 col-12 js-lazy"
                            />
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {item.slideImg.length > 1 ? (
                    <div className="custom_inside-slider">
                      <button
                        className={`slick_arrow-between slick_arrow -prev arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none prev-${item.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <span className="icon icon-chevron-left text-12" />
                      </button>
                      <button
                        className={`slick_arrow-between slick_arrow -next arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none next-${item.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <i className="icon icon-chevron-right text-12" />
                      </button>
                    </div>
                  ) : null}

                  <div className="cardImage__wishlist">
                    <button
                      className="button -blue-1 bg-white size-30 rounded-full shadow-2"
                      onClick={(event) => event.preventDefault()}
                    >
                      <i className="icon-heart text-12" />
                    </button>
                  </div>

                  {item.tag ? (
                    <div className="cardImage__leftBadge">
                      <div
                        className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${
                          isTextMatched(item.tag, "breakfast included")
                            ? "bg-dark-1 text-white"
                            : ""
                        } ${
                          isTextMatched(item.tag, "best seller") ? "bg-blue-1 text-white" : ""
                        } ${
                          isTextMatched(item.tag, "top rated")
                            ? "bg-yellow-1 text-dark-1"
                            : ""
                        }`}
                      >
                        {item.tag}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="hotelsCard__content mt-10">
                <h4 className="hotelsCard__title text-dark-1 text-18 lh-16 fw-500">
                  <span>{item.title}</span>
                </h4>
                <p className="text-light-1 lh-14 text-14 mt-5">{item.location}</p>
                {item.ratings ? (
                  <div className="d-flex items-center mt-20">
                    <div className="flex-center bg-blue-1 rounded-4 size-30 text-12 fw-600 text-white">
                      {item.ratings}
                    </div>
                    <div className="text-14 text-dark-1 fw-500 ml-10">Exceptional</div>
                    {item.reviews ? (
                      <div className="text-14 text-light-1 ml-10">{item.reviews} reviews</div>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-5">
                  <div className="fw-500">
                    Starting from <span className="text-blue-1">{item.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function TourCards({ tours }) {
  if (!tours?.length) return null;

  return (
    <Swiper {...listingSwiper}>
      {tours.map((item) => (
        <SwiperSlide key={item.id}>
          <div data-aos="fade">
            <Link href={item.href} className="tourCard -type-1 rounded-4 hover-inside-slider">
              <div className="tourCard__image position-relative">
                <div className="inside-slider">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    pagination={{ clickable: true }}
                    navigation={{
                      nextEl: `.tour-next-${item.id}`,
                      prevEl: `.tour-prev-${item.id}`,
                    }}
                    slidesPerView={1}
                    speed={500}
                    loop={item.slideImg.length > 1}
                  >
                    {item.slideImg.map((slide, index) => (
                      <SwiperSlide key={`${item.id}-${index}`}>
                        <div className="cardImage ratio ratio-1:1">
                          <div className="cardImage__content">
                            <CoverImage src={slide} alt={item.title} className="col-12 js-lazy" />
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {item.slideImg.length > 1 ? (
                    <div className="custom_inside-slider">
                      <button
                        className={`slick_arrow-between slick_arrow -prev arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none tour-prev-${item.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <span className="icon icon-chevron-left text-12" />
                      </button>
                      <button
                        className={`slick_arrow-between slick_arrow -next arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none tour-next-${item.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <i className="icon icon-chevron-right text-12" />
                      </button>
                    </div>
                  ) : null}

                  <div className="cardImage__wishlist">
                    <button
                      className="button -blue-1 bg-white size-30 rounded-full shadow-2"
                      onClick={(event) => event.preventDefault()}
                    >
                      <i className="icon-heart text-12" />
                    </button>
                  </div>

                  {item.tag ? (
                    <div className="cardImage__leftBadge">
                      <div
                        className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${
                          isTextMatched(item.tag, "likely to sell out*")
                            ? "bg-dark-1 text-white"
                            : ""
                        } ${
                          isTextMatched(item.tag, "best seller") ? "bg-blue-1 text-white" : ""
                        } ${
                          isTextMatched(item.tag, "top rated")
                            ? "bg-yellow-1 text-dark-1"
                            : ""
                        }`}
                      >
                        {item.tag}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="tourCard__content mt-10">
                <div className="d-flex items-center lh-14 mb-5">
                  <div className="text-14 text-light-1">{item.duration}</div>
                  {item.tourType ? (
                    <>
                      <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                      <div className="text-14 text-light-1">{item.tourType}</div>
                    </>
                  ) : null}
                </div>
                <h4 className="tourCard__title text-dark-1 text-18 lh-16 fw-500">
                  <span>{item.title}</span>
                </h4>
                <p className="text-light-1 lh-14 text-14 mt-5">{item.location}</p>
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
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="text-14 text-light-1">
                      From
                      <span className="text-16 fw-500 text-dark-1"> {item.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function CarCards({ cars }) {
  if (!cars?.length) return null;

  return (
    <Swiper {...listingSwiper}>
      {cars.map((item) => (
        <SwiperSlide key={item.id}>
          <div data-aos="fade">
            <Link href={item.href} className="carCard -type-1 d-block rounded-4 hover-inside-slider">
              <div className="carCard__image">
                <div className="cardImage inside-slider">
                  <div className="border-light rounded-4 overflow-hidden">
                    <Swiper
                      modules={[Navigation]}
                      navigation={{
                        nextEl: `.js-next-${item.id}`,
                        prevEl: `.js-prev-${item.id}`,
                      }}
                      loop={item.slideImg.length > 1}
                    >
                      {item.slideImg.map((slide, index) => (
                        <SwiperSlide key={`${item.id}-${index}`}>
                          <div className="cardImage ratio ratio-6:5">
                            <div className="cardImage__content">
                              <CoverImage src={slide} alt={item.title} className="col-12 js-lazy" />
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {item.slideImg.length > 1 ? (
                    <div className="custom_inside-slider">
                      <button
                        className={`slick_arrow-between slick_arrow -prev arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none js-prev-${item.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <span className="icon icon-chevron-left text-12" />
                      </button>
                      <button
                        className={`slick_arrow-between slick_arrow -next arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none js-next-${item.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <i className="icon icon-chevron-right text-12" />
                      </button>
                    </div>
                  ) : null}

                  <div className="cardImage__wishlist">
                    <button
                      className="button -blue-1 bg-white size-30 rounded-full shadow-2"
                      onClick={(event) => event.preventDefault()}
                    >
                      <i className="icon-heart text-12" />
                    </button>
                  </div>

                  {item.tag ? (
                    <div className="cardImage__leftBadge">
                      <div
                        className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${
                          isTextMatched(item.tag, "best seller") ? "bg-blue-1 text-white" : ""
                        }`}
                      >
                        {item.tag}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="carCard__content mt-10">
                <div className="d-flex items-center lh-14 mb-5">
                  <div className="text-14 text-light-1">{item.location}</div>
                  <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" />
                  <div className="text-14 text-light-1 uppercase">{item.type}</div>
                </div>
                <h4 className="text-dark-1 text-18 lh-16 fw-500">
                  {item.title}{" "}
                  <span className="text-15 text-light-1 fw-400">or similar</span>
                </h4>
                <div className="row x-gap-20 y-gap-10 items-center pt-5">
                  {item.seat ? (
                    <div className="col-auto">
                      <div className="d-flex items-center text-14 text-dark-1">
                        <i className="icon-user-2 mr-10" />
                        <div className="lh-14">{item.seat}</div>
                      </div>
                    </div>
                  ) : null}
                  {item.luggage ? (
                    <div className="col-auto">
                      <div className="d-flex items-center text-14 text-dark-1">
                        <i className="icon-luggage mr-10" />
                        <div className="lh-14">{item.luggage}</div>
                      </div>
                    </div>
                  ) : null}
                  {item.transmission ? (
                    <div className="col-auto">
                      <div className="d-flex items-center text-14 text-dark-1">
                        <i className="icon-transmission mr-10" />
                        <div className="lh-14">{item.transmission}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="mt-5">
                  <div className="text-light-1">
                    <span className="fw-500 text-dark-1">{item.price}</span> / day
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function NearbyDestinations({ destinations }) {
  if (!destinations?.length) return null;

  return (
    <>
      <Swiper
        spaceBetween={30}
        className="overflow-visible"
        modules={[Navigation]}
        navigation={{
          nextEl: ".js-top-desti2-next_active",
          prevEl: ".js-top-desti2-prev_active",
        }}
        breakpoints={{
          540: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 22 },
          1024: { slidesPerView: 3 },
          1200: { slidesPerView: 6 },
        }}
      >
        {destinations.map((item) => (
          <SwiperSlide key={item.slug}>
            <Link href={`/destinations/${item.slug}`} className="citiesCard -type-2" data-aos="fade">
              <div className="citiesCard__image rounded-4 ratio ratio-1:1">
                <Image
                  width={191}
                  height={191}
                  className="img-ratio rounded-4 js-lazy"
                  style={cover}
                  src={item.imageUrl}
                  alt={item.name}
                />
              </div>
              <div className="citiesCard__content mt-10">
                <h4 className="text-18 lh-13 fw-500 text-dark-1 text-capitalize">{item.name}</h4>
                <div className="text-14 text-light-1">{item.meta}</div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="section-slider-nav -prev flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none js-top-desti2-prev_active">
        <i className="icon icon-chevron-left text-12" />
      </button>
      <button className="section-slider-nav -next flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none js-top-desti2-next_active">
        <i className="icon icon-chevron-right text-12" />
      </button>
    </>
  );
}
