"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";

const cover = { width: "100%", height: "100%", objectFit: "cover" };

const listingSwiper = {
  modules: [FreeMode],
  freeMode: { enabled: true, sticky: false },
  speed: 450,
  slidesPerView: 4.1,
  spaceBetween: 12,
  breakpoints: {
    0: { slidesPerView: 2, spaceBetween: 10 },
    520: { slidesPerView: 2.15, spaceBetween: 10 },
    768: { slidesPerView: 3.1, spaceBetween: 12 },
    992: { slidesPerView: 3.5, spaceBetween: 12 },
    1200: { slidesPerView: 4.1, spaceBetween: 12 },
  },
};

function firstImage(images) {
  if (!Array.isArray(images) || !images.length) return "";
  return images.find(Boolean) || "";
}

function DestCard({
  href,
  image,
  title,
  meta,
  price,
  priceNote,
  badge,
  rating,
}) {
  return (
    <Link href={href} className="dest-card">
      <div className="dest-card__media">
        {image ? (
          <Image
            width={360}
            height={224}
            src={image}
            alt={title}
            className="dest-card__img"
            style={cover}
          />
        ) : (
          <div className="dest-card__fallback" aria-hidden="true" />
        )}
        {rating ? <span className="dest-card__rating">{rating}</span> : null}
      </div>
      <div className="dest-card__body">
        {badge ? <p className="dest-card__kicker">{badge}</p> : null}
        <p className="dest-card__title">{title}</p>
        {meta ? <p className="dest-card__meta">{meta}</p> : null}
        {price ? (
          <p className="dest-card__price">
            {priceNote === "from" ? <span>from </span> : null}
            <strong>{price}</strong>
            {priceNote && priceNote !== "from" ? <span> {priceNote}</span> : null}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function CategoryPills({ items }) {
  if (!items?.length) return null;

  return (
    <Swiper
      modules={[FreeMode]}
      speed={500}
      slidesPerView="auto"
      spaceBetween={10}
      freeMode
      breakpoints={{
        0: { slidesPerView: "auto", spaceBetween: 8 },
        768: { slidesPerView: "auto", spaceBetween: 12 },
        1200: { slidesPerView: Math.min(items.length, 7), spaceBetween: 16 },
      }}
    >
      {items.map((item) => (
        <SwiperSlide key={item.href} style={{ width: "auto" }}>
          <Link href={item.href} className="destination-page__chip">
            <i className={item.icon} />
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
    <Swiper {...listingSwiper} className="dest-card-rail">
      {hotels.map((item) => (
        <SwiperSlide key={item.id}>
          <DestCard
            href={item.href}
            image={firstImage(item.slideImg)}
            title={item.title}
            meta={item.location}
            price={item.price}
            priceNote="from"
            badge={item.tag || ""}
            rating={item.ratings || ""}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function TourCards({ tours }) {
  if (!tours?.length) return null;

  return (
    <Swiper {...listingSwiper} className="dest-card-rail">
      {tours.map((item) => {
        const meta = [item.duration, item.tourType].filter(Boolean).join(" · ");
        return (
          <SwiperSlide key={item.id}>
            <DestCard
              href={item.href}
              image={firstImage(item.slideImg)}
              title={item.title}
              meta={meta || item.location}
              price={item.price}
              priceNote="from"
              badge={item.tag || ""}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export function CarCards({ cars }) {
  if (!cars?.length) return null;

  return (
    <Swiper {...listingSwiper} className="dest-card-rail">
      {cars.map((item) => {
        const facts = [item.seat && `${item.seat} seats`, item.transmission]
          .filter(Boolean)
          .join(" · ");
        return (
          <SwiperSlide key={item.id}>
            <DestCard
              href={item.href}
              image={firstImage(item.slideImg)}
              title={item.title}
              meta={facts || item.type || item.location}
              price={item.price}
              priceNote="/ day"
              badge={item.tag || item.type || ""}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export function TopSights({ places }) {
  if (!places?.length) return null;

  return (
    <Swiper
      {...listingSwiper}
      className="dest-card-rail destination-page__sights-rail"
      breakpoints={{
        0: { slidesPerView: 1.15, spaceBetween: 12 },
        520: { slidesPerView: 1.35, spaceBetween: 12 },
        768: { slidesPerView: 1.8, spaceBetween: 14 },
        992: { slidesPerView: 2.15, spaceBetween: 16 },
        1200: { slidesPerView: 2.35, spaceBetween: 16 },
      }}
    >
      {places.map((place) => {
        const summary =
          place.summary && place.summary.length > 140
            ? `${place.summary.slice(0, 137).trimEnd()}…`
            : place.summary || "";
        return (
          <SwiperSlide key={place.id}>
            <div className="destination-page__sight">
              <div className="destination-page__sight-inner">
                <div className="destination-page__sight-media">
                  <div className="ratio ratio-1:1">
                    <Image
                      width={200}
                      height={200}
                      src={place.imageUrl}
                      alt={place.name}
                      className="img-ratio"
                      style={cover}
                    />
                  </div>
                </div>
                <div className="destination-page__sight-body d-flex flex-column justify-center h-full px-30 py-20">
                  <h3 className="text-18 fw-500">{place.name}</h3>
                  {summary ? <p className="text-15 mt-5">{summary}</p> : null}
                  <Link
                    href={`/destinations/${place.slug}`}
                    className="d-block text-14 text-blue-1 fw-500 underline mt-5"
                  >
                    See More
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export function NearbyDestinations({ destinations }) {
  if (!destinations?.length) return null;

  return (
    <>
      <Swiper
        className="dest-card-rail"
        modules={[FreeMode, Navigation]}
        freeMode
        navigation={{
          nextEl: ".js-top-desti2-next_active",
          prevEl: ".js-top-desti2-prev_active",
        }}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 10 },
          540: { slidesPerView: 2.15, spaceBetween: 10 },
          768: { slidesPerView: 3.1, spaceBetween: 12 },
          1024: { slidesPerView: 4.1, spaceBetween: 12 },
          1200: { slidesPerView: 5.1, spaceBetween: 12 },
        }}
      >
        {destinations.map((item) => (
          <SwiperSlide key={item.slug}>
            <DestCard
              href={`/destinations/${item.slug}`}
              image={item.imageUrl}
              title={item.name}
              meta={item.meta}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        type="button"
        className="section-slider-nav -prev flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none js-top-desti2-prev_active"
        aria-label="Previous destinations"
      >
        <i className="icon icon-chevron-left text-12" />
      </button>
      <button
        type="button"
        className="section-slider-nav -next flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none js-top-desti2-next_active"
        aria-label="Next destinations"
      >
        <i className="icon icon-chevron-right text-12" />
      </button>
    </>
  );
}
