"use client";

import Image from "next/image";
import Link from "next/link";
import { Gallery, Item, useGallery } from "react-photoswipe-gallery";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import { useSectionTabs } from "@/hooks/useSectionTabs";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "photoswipe/dist/photoswipe.css";

const cover = { width: "100%", height: "100%", objectFit: "cover" };

const listingSwiper = {
  modules: [FreeMode],
  freeMode: { enabled: true, sticky: false, momentumRatio: 0.85, momentumVelocityRatio: 0.85 },
  speed: 420,
  slidesPerView: "auto",
  spaceBetween: 16,
  watchOverflow: true,
  grabCursor: true,
  resistanceRatio: 0.65,
  breakpoints: {
    0: { slidesPerView: "auto", spaceBetween: 16 },
    768: { slidesPerView: "auto", spaceBetween: 16 },
    1200: { slidesPerView: "auto", spaceBetween: 18 },
  },
};

const railSlideStyle = { width: 240 };

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

function HeroChrome({ name, cover, summary, count }) {
  const { open } = useGallery();
  return (
    <div className="destination-page__hero-media">
      <img
        src={cover}
        alt={name}
        onClick={() => open(0)}
        role="button"
        style={{ cursor: "zoom-in" }}
      />
      <div className="destination-page__hero-scrim" aria-hidden="true" />
      <div className="destination-page__hero-copy">
        <h1>Explore {name}</h1>
        {summary ? <p>{summary}</p> : null}
      </div>
      {count > 1 ? (
        <div className="destination-page__photos">
          <button
            type="button"
            className="button -md -blue-1 bg-white text-dark-1 text-14 fw-500"
            onClick={() => open(0)}
          >
            See All Photos ({count})
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DestinationHeroGallery({ name, images, summary }) {
  const photos = [...new Set((images || []).filter(Boolean))];
  if (!photos.length) return null;

  return (
    <Gallery>
      <div className="destination-page__hero">
        <HeroChrome name={name} cover={photos[0]} summary={summary} count={photos.length} />
        <div
          className={photos.length > 1 ? "destination-page__gallery-strip" : "sr-only"}
          aria-label={`${name} photo gallery`}
        >
          {photos.map((photo, index) => (
            <Item key={`${photo}-${index}`} original={photo} thumbnail={photo} width={1600} height={900}>
              {({ ref, open }) =>
                photos.length > 1 ? (
                  <button type="button" className="destination-page__gallery-thumb" ref={ref} onClick={open}>
                    <img src={photo} alt={`${name} photo ${index + 1}`} />
                  </button>
                ) : (
                  <img ref={ref} src={photo} alt="" />
                )
              }
            </Item>
          ))}
        </div>
      </div>
    </Gallery>
  );
}

export function CategoryPills({ items }) {
  const keys = (items || []).map((item) => item.href).join("|");
  const { isActive, selectHref } = useSectionTabs(".destination-page__chip", [keys]);

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
          <Link
            href={item.href}
            className={`destination-page__chip${isActive(item.href) ? " is-on" : ""}`}
            aria-current={isActive(item.href) ? "true" : undefined}
            onClick={() => selectHref(item.href)}
          >
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
        <SwiperSlide key={item.id} style={railSlideStyle}>
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
          <SwiperSlide key={item.id} style={railSlideStyle}>
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
          <SwiperSlide key={item.id} style={railSlideStyle}>
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
      slidesPerView="auto"
      spaceBetween={14}
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
    <div className="destination-page__listing-row">
      <Swiper {...listingSwiper} className="dest-card-rail">
        {destinations.map((item) => (
          <SwiperSlide key={item.slug} style={railSlideStyle}>
            <DestCard
              href={`/destinations/${item.slug}`}
              image={item.imageUrl}
              title={item.name}
              meta={item.meta}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
