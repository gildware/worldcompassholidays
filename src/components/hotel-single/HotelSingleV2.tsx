"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import CallToActions from "@/components/common/CallToActions";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { AvailableRooms2 } from "@/components/hotel-single/AvailableRooms2";
import { amenityIcon, GalleryTwo } from "@/components/hotel-single/GalleryTwo";
import { SimilarHotels } from "@/components/hotel-single/SimilarHotels";
import type { HotelSingleData } from "@/components/hotel-single/types";

function selectRoom(event: MouseEvent<HTMLAnchorElement>) {
  const section = document.getElementById("rooms");
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  const field = section.querySelector("select");
  if (field instanceof HTMLElement) window.setTimeout(() => field.focus(), 350);
}

const reviewRows = [
  { label: "Location", rating: "9.4", percent: "90%" },
  { label: "Staff", rating: "8.4", percent: "84%" },
  { label: "Cleanliness", rating: "9.4", percent: "90%" },
  { label: "Value for money", rating: "8", percent: "80%" },
  { label: "Comfort", rating: "9.4", percent: "90%" },
  { label: "Facilities", rating: "8.5", percent: "85%" },
  { label: "Free WiFi", rating: "9.4", percent: "90%" },
];

export function HotelSingleV2({ hotel, mapApiKey }: { hotel: HotelSingleData; mapApiKey: string }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY >= 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const amenities = hotel.amenities.length > 0 ? hotel.amenities : ["Free WiFi"];
  const facts = [
    { icon: "icon-calendar", title: "Check-in", text: hotel.checkIn },
    { icon: "icon-clock", title: "Check-out", text: hotel.checkOut },
    {
      icon: "icon-bed",
      title: "Stay",
      text: `${hotel.roomCount} ${hotel.roomCount === 1 ? "room" : "rooms"} · ${hotel.propertyType}`,
    },
    { icon: "icon-check", title: "Payment", text: "Pay at the hotel" },
  ];
  const notes = [
    hotel.houseRules ? { icon: "icon-shield", text: hotel.houseRules } : null,
    hotel.cancellation ? { icon: "icon-check", text: hotel.cancellation } : null,
  ].filter((item): item is { icon: string; text: string } => Boolean(item));
  const surroundings = [
    { title: "What's nearby", icon: "icon-nearby", text: hotel.address || hotel.location },
    { title: "The area", icon: "icon-city-2", text: hotel.location },
  ].filter((item) => item.text);

  return (
    <WorldCompassHolidayFrame>
      <div className="hotel-single-v2">
        <div className={`singleMenu js-singleMenu ${stuck ? "-is-active" : ""}`}>
          <div className="col-12">
            <div className="singleMenu__content">
              <div className="container">
                <div className="row y-gap-20 justify-between items-center">
                  <div className="col-auto">
                    <div className="singleMenu__links row x-gap-30 y-gap-10">
                      <div className="col-auto">
                        <a href="#overview">Overview</a>
                      </div>
                      <div className="col-auto">
                        <a href="#rooms">Rooms</a>
                      </div>
                      <div className="col-auto">
                        <a href="#facilities">Facilities</a>
                      </div>
                      <div className="col-auto">
                        <a href="#faq">Faq</a>
                      </div>
                      <div className="col-auto">
                        <a href="#reviews">Reviews</a>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="row x-gap-15 y-gap-15 items-center">
                      <div className="col-auto">
                        <div className="text-14">
                          From <span className="text-22 text-dark-1 fw-500">{hotel.priceLabel}</span>
                        </div>
                      </div>
                      <div className="col-auto">
                        <a href="#rooms" className="button h-50 px-24 -dark-1 bg-blue-1 text-white" onClick={selectRoom}>
                          Select Room <div className="icon-arrow-top-right ml-15" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="py-10 d-flex items-center bg-light-2">
          <div className="container">
            <div className="row y-gap-10 items-center justify-between">
              <div className="col-auto">
                <div className="row x-gap-10 y-gap-5 items-center text-14 text-light-1">
                  <div className="col-auto">
                    <Link href="/">Home</Link>
                  </div>
                  <div className="col-auto">&gt;</div>
                  <div className="col-auto">
                    <Link href={hotel.destinationHref || "/hotels"}>
                      {hotel.location ? `${hotel.location} Hotels` : "Hotels"}
                    </Link>
                  </div>
                  <div className="col-auto">&gt;</div>
                  <div className="col-auto">
                    <div className="text-dark-1">{hotel.name}</div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <Link href="/hotels" className="text-14 text-blue-1 underline">
                  All Hotel in {hotel.location || "our list"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <GalleryTwo hotel={hotel} mapApiKey={mapApiKey} />

        <section id="rooms" className="pt-30">
          <div className="container">
            <div className="pb-10">
              <h3 className="text-22 fw-500">Available Rooms</h3>
            </div>
            <AvailableRooms2 rooms={hotel.rooms} hotelName={hotel.name} location={hotel.location} />
          </div>
        </section>

        <section id="facilities" className="hotel-facts">
          <div className="container">
            <div className="hotel-facts__grid">
              <article className="hotel-info-card">
                <div className="hotel-info-card__head">
                  <span className="hotel-info-card__badge">
                    <i className="icon-wifi" />
                  </span>
                  <h3>Most Popular Facilities</h3>
                </div>
                <div className="hotel-info-card__chips">
                  {amenities.map((item) => (
                    <span key={item}>
                      <i className={amenityIcon(item)} />
                      {item}
                    </span>
                  ))}
                </div>
              </article>
              <article className="hotel-info-card">
                <div className="hotel-info-card__head">
                  <span className="hotel-info-card__badge">
                    <i className="icon-nearby" />
                  </span>
                  <h3>Hotel surroundings</h3>
                </div>
                <ul className="hotel-info-card__list">
                  {surroundings.map((group) => (
                    <li className="hotel-info-card__row" key={group.title}>
                      <span className="hotel-info-card__icon">
                        <i className={group.icon} />
                      </span>
                      <span>
                        <strong>{group.title}</strong>
                        <em>{group.text}</em>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="hotel-info-card">
                <div className="hotel-info-card__head">
                  <span className="hotel-info-card__badge">
                    <i className="icon-calendar" />
                  </span>
                  <h3>Some helpful facts</h3>
                </div>
                <ul className="hotel-info-card__list hotel-info-card__list--facts">
                  {facts.map((item) => (
                    <li className="hotel-info-card__row" key={item.title}>
                      <span className="hotel-info-card__icon">
                        <i className={item.icon} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <em>{item.text}</em>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            {notes.length > 0 ? (
              <div className="hotel-facts__notes">
                {notes.map((item) => (
                  <p key={item.text}>
                    <i className={item.icon} />
                    {item.text}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section id="faq" className="hotel-faq">
          <div className="container">
            <h3 className="text-22 fw-500">FAQs about {hotel.name}</h3>
            <div className="accordion -simple hotel-faq__list js-accordion">
              {hotel.faqs.map((item, index) => (
                <div className="accordion__item" key={item.title}>
                  <div
                    className="accordion__button d-flex items-center"
                    data-bs-toggle="collapse"
                    data-bs-target={`#hotel-faq-${index}`}
                  >
                    <div className="accordion__icon hotel-faq__icon flex-center bg-light-2 rounded-full">
                      <i className="icon-plus" />
                      <i className="icon-minus" />
                    </div>
                    <div className="button text-dark-1 text-start">{item.title}</div>
                  </div>
                  <div className="accordion-collapse collapse" id={`hotel-faq-${index}`}>
                    <div className="hotel-faq__answer">
                      <p className="text-15">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hotel-reviews" id="reviews">
          <div className="container">
            <div className="hotel-reviews__head">
              <h3 className="text-22 fw-500">Guest reviews</h3>
              <div className="hotel-reviews__score">{hotel.stars > 0 ? hotel.stars.toFixed(1) : "–"}</div>
              <div>
                <div className="text-15 text-dark-1 fw-500 lh-14">{hotel.scoreLabel}</div>
                <div className="text-13 text-light-1 lh-14 mt-4">{hotel.propertyType}</div>
              </div>
            </div>
            <div className="hotel-reviews__grid">
              {reviewRows.map((item) => (
                <div className="hotel-reviews__row" key={item.label}>
                  <div className="text-14 fw-500">{item.label}</div>
                  <div className="text-13 text-light-1">{item.rating}</div>
                  <div className="progressBar">
                    <div className="progressBar__bg bg-blue-2" />
                    <div className="progressBar__bar bg-dark-1" style={{ width: item.percent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hotel-health">
          <div className="container">
            <div className="hotel-health__bar">
              <Image width={22} height={22} src="/img/icons/health.svg" alt="" />
              <p>
                <strong>Extra health &amp; safety measures.</strong> This property has taken extra health and hygiene
                measures to keep your stay safe.
              </p>
            </div>
          </div>
        </section>

        {hotel.similar.length > 0 ? (
          <section className="similar-stays">
            <div className="container">
              <SimilarHotels hotels={hotel.similar} title={hotel.name} />
            </div>
          </section>
        ) : null}

        <CallToActions />
      </div>
    </WorldCompassHolidayFrame>
  );
}
