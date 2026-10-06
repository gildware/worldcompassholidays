"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { DateObject } from "react-multi-date-picker";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "photoswipe/dist/photoswipe.css";
import "swiper/css";
import "swiper/css/navigation";
import CallToActions from "@/components/common/CallToActions";
import { TourCards } from "@/components/destinations/single/widgets";
import DefaultFooter from "@/components/footer/default";
import { GoTripFrame } from "@/components/gotrip/GoTripFrame";
import { DateSearch } from "@/components/hotel-list/common/DateSearch";
import type { TourSingleData } from "@/components/tour-single/types";

const TourMap = dynamic(() => import("@/components/tour-single/TourMap"), {
  ssr: false,
  loading: () => (
    <div className="d-flex items-center justify-center h-full">Loading Map...</div>
  ),
});

const reviewRows = [
  { label: "Location", rating: "9.4", percent: "90%" },
  { label: "Staff", rating: "8.4", percent: "84%" },
  { label: "Cleanliness", rating: "9.4", percent: "90%" },
  { label: "Value for money", rating: "8", percent: "80%" },
  { label: "Comfort", rating: "9.4", percent: "90%" },
  { label: "Facilities", rating: "8.5", percent: "85%" },
  { label: "Free WiFi", rating: "9.4", percent: "90%" },
];

const replyTopics = ["Location", "Staff", "Cleanliness", "Value for money", "Comfort", "Facilities", "Free WiFi"];

const reviewGallery = [
  "/img/testimonials/1/1.png",
  "/img/testimonials/1/2.png",
  "/img/testimonials/1/3.png",
  "/img/testimonials/1/4.png",
];

const travelerCounters = [
  { name: "Adults", defaultValue: 2 },
  { name: "Children", defaultValue: 1 },
  { name: "Rooms", defaultValue: 1 },
] as const;

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function TravelerSearch() {
  const [counts, setCounts] = useState({ Adults: 2, Children: 1, Rooms: 1 });

  return (
    <div className="searchMenu-guests px-20 py-10 border-light rounded-4 js-form-dd js-form-counters">
      <div
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
        data-bs-offset="0,22"
      >
        <h4 className="text-15 fw-500 ls-2 lh-16">Number of travelers</h4>
        <div className="text-15 text-light-1 ls-2 lh-16">
          <span className="js-count-adult">{counts.Adults}</span> adults -{" "}
          <span className="js-count-child">{counts.Children}</span> childeren -{" "}
          <span className="js-count-room">{counts.Rooms}</span> room
        </div>
      </div>
      <div className="shadow-2 dropdown-menu min-width-400">
        <div className="bg-white px-30 py-30 rounded-4 counter-box">
          {travelerCounters.map((counter) => (
            <TravelerCounter
              key={counter.name}
              name={counter.name}
              value={counts[counter.name]}
              onChange={(value) => setCounts((current) => ({ ...current, [counter.name]: value }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TravelerCounter({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <>
      <div className="row y-gap-10 justify-between items-center">
        <div className="col-auto">
          <div className="text-15 lh-12 fw-500">{name}</div>
          {name === "Children" ? (
            <div className="text-14 lh-12 text-light-1 mt-5">Ages 0 - 17</div>
          ) : null}
        </div>
        <div className="col-auto">
          <div className="d-flex items-center js-counter">
            <button
              type="button"
              className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
              onClick={() => onChange(Math.max(0, value - 1))}
            >
              <i className="icon-minus text-12" />
            </button>
            <div className="flex-center size-20 ml-15 mr-15">
              <div className="text-15 js-count">{value}</div>
            </div>
            <button
              type="button"
              className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up"
              onClick={() => onChange(value + 1)}
            >
              <i className="icon-plus text-12" />
            </button>
          </div>
        </div>
      </div>
      <div className="border-top-light mt-24 mb-24" />
    </>
  );
}

function ReviewCard({ withGallery }: { withGallery?: boolean }) {
  return (
    <div className="col-lg-12">
      <div className="row x-gap-20 y-gap-20 items-center">
        <div className="col-auto">
          <Image width={60} height={60} src="/img/avatars/2.png" alt="Tonko" />
        </div>
        <div className="col-auto">
          <div className="fw-500 lh-15">Tonko</div>
          <div className="text-14 text-light-1 lh-15">March 2022</div>
        </div>
      </div>
      <h5 className="fw-500 text-blue-1 mt-20">9.2 Superb</h5>
      <p className="text-15 text-dark-1 mt-10">
        Nice two level apartment in great London location. Located in quiet small street, but just 50 meters from
        main street and bus stop. Tube station is short walk, just like two grocery stores.
      </p>
      {withGallery ? (
        <Gallery>
          <div className="row x-gap-30 y-gap-30 pt-20">
            {reviewGallery.map((img) => (
              <div className="col-auto" key={img}>
                <Item original={img} thumbnail={img} width={110} height={110}>
                  {({ ref, open }) => (
                    <Image
                      width={110}
                      height={110}
                      src={img}
                      ref={ref}
                      onClick={open}
                      alt="Review"
                      role="button"
                      className="rounded-4"
                    />
                  )}
                </Item>
              </div>
            ))}
          </div>
        </Gallery>
      ) : null}
      <div className="d-flex x-gap-30 items-center pt-20">
        <button type="button" className="d-flex items-center text-blue-1">
          <i className="icon-like text-16 mr-10" />
          Helpful
        </button>
        <button type="button" className="d-flex items-center text-light-1">
          <i className="icon-dislike text-16 mr-10" />
          Not helpful
        </button>
      </div>
    </div>
  );
}

export function TourSingle({ tour, mapApiKey }: { tour: TourSingleData; mapApiKey: string }) {
  const [openOverview, setOpenOverview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dates, setDates] = useState<DateObject[]>(() => [
    new DateObject().setDay(5),
    new DateObject().setDay(14).add(1, "month"),
  ]);

  const images = tour.images.length > 0 ? tour.images : ["/img/tours/5.png"];
  const overview = tour.descriptionHtml || "";
  const days =
    tour.days.length > 0
      ? tour.days
      : [
          {
            dayNumber: 1,
            title: tour.title,
            description: plainText(tour.summary || tour.descriptionHtml),
            imageUrl: images[0],
          },
        ];
  const faqs =
    tour.faqs.length > 0
      ? tour.faqs
      : [
          {
            title: "How long is this tour?",
            content: `This experience runs for ${tour.durationLabel}.`,
          },
          {
            title: "How many people can join?",
            content: `The group size is ${tour.groupSize}.`,
          },
          {
            title: "What should I know before I book?",
            content: tour.freeCancellation
              ? "For a full refund, cancel at least 24 hours in advance of the start date of the experience."
              : "Confirmation is sent when the booking is received.",
          },
        ];
  const highlights =
    tour.highlights.length > 0
      ? tour.highlights
      : tour.includes.slice(0, 3);
  const placeLabel = tour.location || "Tours";

  async function shareTour() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: tour.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url);
  }

  return (
    <GoTripFrame>
      <div className="tour-single">
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
                    <Link href={tour.destinationHref}>{placeLabel} Tours</Link>
                  </div>
                  <div className="col-auto">&gt;</div>
                  <div className="col-auto">
                    <div className="text-dark-1">{tour.title}</div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <Link href={tour.destinationHref} className="text-14 text-blue-1 underline">
                  All tours in {placeLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-40">
          <div className="container">
            <div className="row y-gap-20 justify-between items-end">
              <div className="col-auto">
                <h1 className="text-30 fw-600">{tour.title}</h1>
                <div className="row x-gap-20 y-gap-20 items-center pt-10">
                  <div className="col-auto">
                    <div className="d-flex items-center">
                      <div className="d-flex x-gap-5 items-center">
                        <i className="icon-star text-10 text-yellow-1" />
                        <i className="icon-star text-10 text-yellow-1" />
                        <i className="icon-star text-10 text-yellow-1" />
                        <i className="icon-star text-10 text-yellow-1" />
                        <i className="icon-star text-10 text-yellow-1" />
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="row x-gap-10 items-center">
                      <div className="col-auto">
                        <div className="d-flex x-gap-5 items-center">
                          <i className="icon-placeholder text-16 text-light-1" />
                          <div className="text-15 text-light-1">{tour.address || tour.location}</div>
                        </div>
                      </div>
                      {tour.mapUrl ? (
                        <div className="col-auto">
                          <a href={tour.mapUrl} target="_blank" rel="noreferrer" className="text-blue-1 text-15 underline">
                            Show on map
                          </a>
                        </div>
                      ) : (
                        <div className="col-auto">
                          <a href="#itinerary" className="text-blue-1 text-15 underline">
                            Show on map
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="row x-gap-10 y-gap-10">
                  <div className="col-auto">
                    <button type="button" className="button px-15 py-10 -blue-1" onClick={() => void shareTour()}>
                      <i className="icon-share mr-10" />
                      Share
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      type="button"
                      className={`button px-15 py-10 -blue-1 ${saved ? "" : "bg-light-2"}`}
                      onClick={() => setSaved((value) => !value)}
                    >
                      <i className="icon-heart mr-10" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-40 js-pin-container">
          <div className="container">
            <div className="row y-gap-30">
              <div className="col-xl-8">
                <div className="relative d-flex justify-center overflow-hidden js-section-slider">
                  <Swiper
                    modules={[Navigation]}
                    loop={images.length > 1}
                    navigation={{
                      nextEl: ".js-img-next",
                      prevEl: ".js-img-prev",
                    }}
                  >
                    {images.map((slide, index) => (
                      <SwiperSlide key={`${slide}-${index}`}>
                        <Image
                          width={451}
                          height={450}
                          priority={index === 0}
                          src={slide}
                          alt={tour.title}
                          className="rounded-4 col-12 cover object-cover tour-hero-slide"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <Gallery>
                    {images.map((slide, index) => (
                      <Item key={`${slide}-photo-${index}`} original={slide} thumbnail={slide} width={1200} height={800}>
                        {({ ref, open }) =>
                          index === 0 ? (
                            <div
                              className="absolute px-10 py-10 col-12 h-full d-flex justify-end items-end z-2 bottom-0 end-0"
                              ref={ref}
                              onClick={open}
                              role="button"
                            >
                              <div className="button -blue-1 px-24 py-15 bg-white text-dark-1 js-gallery">
                                See All Photos
                              </div>
                            </div>
                          ) : (
                            <span ref={ref} hidden />
                          )
                        }
                      </Item>
                    ))}
                  </Gallery>

                  <div className="absolute h-full col-11">
                    <button
                      type="button"
                      className="section-slider-nav -prev flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none js-img-prev"
                    >
                      <i className="icon icon-chevron-left text-12" />
                    </button>
                    <button
                      type="button"
                      className="section-slider-nav -next flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none js-img-next"
                    >
                      <i className="icon icon-chevron-right text-12" />
                    </button>
                  </div>
                </div>

                <h3 className="text-22 fw-500 mt-40">Tour snapshot</h3>
                <div className="row y-gap-30 justify-between pt-20">
                  <div className="col-md-auto col-6">
                    <div className="d-flex">
                      <i className="icon-clock text-22 text-blue-1 mr-10" />
                      <div className="text-15 lh-15">
                        Duration:
                        <br /> {tour.durationLabel}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-auto col-6">
                    <div className="d-flex">
                      <i className="icon-customer text-22 text-blue-1 mr-10" />
                      <div className="text-15 lh-15">
                        Group size:
                        <br /> {tour.groupSize}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-auto col-6">
                    <div className="d-flex">
                      <i className="icon-route text-22 text-blue-1 mr-10" />
                      <div className="text-15 lh-15">
                        Near public
                        <br /> transportation
                      </div>
                    </div>
                  </div>
                  <div className="col-md-auto col-6">
                    <div className="d-flex">
                      <i className="icon-access-denied text-22 text-blue-1 mr-10" />
                      <div className="text-15 lh-15">
                        {tour.freeCancellation ? "Free cancellation" : "Instant confirmation"}
                        <br />
                        <a href="#info" className="text-blue-1 underline">
                          Learn more
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-top-light mt-40 mb-40" />

                <div className="row x-gap-40 y-gap-40">
                  <div className="col-12">
                    <h3 className="text-22 fw-500">Overview</h3>
                    {tour.summary ? <p className="text-dark-1 text-15 mt-20">{tour.summary}</p> : null}
                    {overview ? (
                      <div
                        className={`text-dark-1 text-15 mt-20 tour-overview ${openOverview ? "is-open" : ""}`}
                        dangerouslySetInnerHTML={{ __html: overview }}
                      />
                    ) : null}
                    {overview ? (
                      <button
                        type="button"
                        className="d-block text-14 text-blue-1 fw-500 underline mt-10"
                        onClick={() => setOpenOverview((value) => !value)}
                      >
                        {openOverview ? "Show Less" : "Show More"}
                      </button>
                    ) : null}
                  </div>

                  {tour.languages.length > 0 ? (
                    <div className="col-md-6">
                      <h5 className="text-16 fw-500">Available languages</h5>
                      <div className="text-15 mt-10">{tour.languages.join(", ")}</div>
                    </div>
                  ) : null}

                  <div className={tour.languages.length > 0 ? "col-md-6" : "col-12"}>
                    <h5 className="text-16 fw-500">Cancellation policy</h5>
                    <div className="text-15 mt-10">
                      {tour.freeCancellation
                        ? "For a full refund, cancel at least 24 hours in advance of the start date of the experience."
                        : "Cancellation terms are confirmed when you book."}
                    </div>
                  </div>

                  {highlights.length > 0 ? (
                    <div className="col-12">
                      <h5 className="text-16 fw-500">Highlights</h5>
                      <ul className="list-disc text-15 mt-10">
                        {highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                {tour.includes.length > 0 || tour.excludes.length > 0 ? (
                  <div className="mt-40 border-top-light">
                    <div className="row x-gap-40 y-gap-40 pt-40">
                      <div className="col-12">
                        <h3 className="text-22 fw-500">What&apos;s Included</h3>
                        <div className="row x-gap-40 y-gap-40 pt-20">
                          {tour.includes.length > 0 ? (
                            <div className="col-md-6">
                              {tour.includes.map((item) => (
                                <div className="text-dark-1 text-15" key={item}>
                                  <i className="icon-check text-10 mr-10" /> {item}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {tour.excludes.length > 0 ? (
                            <div className="col-md-6">
                              {tour.excludes.map((item) => (
                                <div className="text-dark-1 text-15" key={item}>
                                  <i className="icon-close text-green-2 text-10 mr-10" /> {item}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="col-xl-4">
                <div className="d-flex justify-end js-pin-content">
                  <div className="w-360 lg:w-full d-flex flex-column items-center">
                    <div className="px-30 py-30 rounded-4 border-light bg-white shadow-4">
                      <div className="text-14 text-light-1">
                        From <span className="text-20 fw-500 text-dark-1 ml-5">{tour.priceLabel}</span>
                      </div>
                      <div className="row y-gap-20 pt-30">
                        <div className="col-12">
                          <div className="searchMenu-date px-20 py-10 border-light rounded-4 -right js-form-dd js-calendar">
                            <div>
                              <h4 className="text-15 fw-500 ls-2 lh-16">Date</h4>
                              <DateSearch dates={dates} onChange={setDates} />
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <TravelerSearch />
                        </div>
                        <div className="col-12">
                          <Link
                            href={`/contact?tour=${encodeURIComponent(tour.slug)}`}
                            className="button -dark-1 py-15 px-35 h-60 col-12 rounded-4 bg-blue-1 text-white"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                      <div className="d-flex items-center pt-20">
                        <div className="size-40 flex-center bg-light-2 rounded-full">
                          <i className="icon-heart text-16 text-green-2" />
                        </div>
                        <div className="text-14 lh-16 ml-10">94% of travelers recommend this experience</div>
                      </div>
                    </div>
                    <div className="px-30">
                      <div className="text-14 text-light-1 mt-30">
                        Not sure? You can cancel this reservation up to 24 hours in advance for a full refund.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="info" className="pt-40">
          <div className="container">
            <div className="pt-40 border-top-light">
              <div className="row x-gap-40 y-gap-40">
                <div className="col-auto">
                  <h3 className="text-22 fw-500">Important information</h3>
                </div>
              </div>
              <div className="row x-gap-40 y-gap-40 justify-between pt-20">
                {tour.includes.length > 0 ? (
                  <div className="col-lg-4 col-md-6">
                    <div className="fw-500 mb-10">Inclusions</div>
                    <ul className="list-disc">
                      {tour.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="col-lg-4 col-md-6">
                  <div className="fw-500 mb-10">Departure details</div>
                  <div className="text-15">{tour.departureText || tour.address || tour.location}</div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="fw-500 mb-10">Know before you go</div>
                  <ul className="list-disc">
                    <li>Duration: {tour.durationLabel}</li>
                    <li>Group size: {tour.groupSize}</li>
                    {tour.category ? <li>{tour.category}</li> : null}
                  </ul>
                </div>
                {tour.excludes.length > 0 ? (
                  <div className="col-lg-4 col-md-6">
                    <div className="fw-500 mb-10">Exclusions</div>
                    <ul className="list-disc">
                      {tour.excludes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {tour.extraNotes.length > 0 ? (
                  <div className="col-12">
                    <div className="fw-500 mb-10">Additional information</div>
                    <ul className="list-disc">
                      {tour.extraNotes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="itinerary" className="border-top-light mt-40 pt-40">
          <div className="container">
            <h3 className="text-22 fw-500 mb-20">Itinerary</h3>
            <div className="row y-gap-30">
              <div className="col-lg-4">
                <div className="relative">
                  <div className="border-test" />
                  <div className="accordion -map row y-gap-20" id="itineraryContent">
                    {days.map((day, index) => (
                      <div className="col-12" key={`${day.dayNumber}-${day.title}`}>
                        <div className="accordion__item">
                          <div className="d-flex">
                            <div className="accordion__icon size-40 flex-center bg-blue-2 text-blue-1 rounded-full">
                              <div className="text-14 fw-500">{day.dayNumber}</div>
                            </div>
                            <div className="ml-20">
                              <div className="text-16 lh-15 fw-500">{day.title}</div>
                              <div className="text-14 lh-15 text-light-1 mt-5">Stop: 60 minutes - Admission included</div>
                              <div
                                className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                id={`itinerary-${tour.slug}-${index}`}
                                data-bs-parent="#itineraryContent"
                              >
                                <div className="pt-15 pb-15">
                                  <Image
                                    width={350}
                                    height={160}
                                    src={day.imageUrl || images[0]}
                                    alt={day.title}
                                    className="rounded-4 mt-15"
                                  />
                                  {day.description ? (
                                    <div className="text-14 lh-17 mt-15">{plainText(day.description)}</div>
                                  ) : null}
                                </div>
                              </div>
                              <div
                                className="accordion__button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#itinerary-${tour.slug}-${index}`}
                              >
                                <button type="button" className="d-block lh-15 text-14 text-blue-1 underline fw-500 mt-5">
                                  See details &amp; photo
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="map rounded-4 overflow-hidden itinerary-map">
                  {tour.map ? (
                    <TourMap apiKey={mapApiKey} lat={tour.map.lat} lng={tour.map.lng} zoom={tour.map.zoom} />
                  ) : (
                    <div
                      className="d-flex items-center justify-center"
                      style={{
                        minHeight: 450,
                        backgroundImage: "url(/img/general/map.svg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-40">
          <div className="container">
            <div className="pt-40 border-top-light">
              <div className="row y-gap-20">
                <div className="col-lg-4">
                  <h2 className="text-22 fw-500">
                    FAQs about
                    <br /> {tour.title}
                  </h2>
                </div>
                <div className="col-lg-8">
                  <div className="accordion -simple row y-gap-20 js-accordion" id="Faq1">
                    {faqs.map((item, index) => (
                      <div className="col-12" key={item.title}>
                        <div className="accordion__item px-20 py-20 border-light rounded-4">
                          <div
                            className="accordion__button d-flex items-center"
                            data-bs-toggle="collapse"
                            data-bs-target={`#tour-faq-${index}`}
                          >
                            <div className="accordion__icon size-40 flex-center bg-light-2 rounded-full mr-20">
                              <i className="icon-plus" />
                              <i className="icon-minus" />
                            </div>
                            <div className="button text-dark-1 text-start">{item.title}</div>
                          </div>
                          <div
                            className="accordion-collapse collapse"
                            id={`tour-faq-${index}`}
                            data-bs-parent="#Faq1"
                          >
                            <div className="pt-15 pl-60">
                              <p className="text-15">{item.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-40 border-top-light pt-40">
          <div className="container">
            <div className="row y-gap-40 justify-between">
              <div className="col-xl-3">
                <h3 className="text-22 fw-500">Guest reviews</h3>
                <div className="d-flex items-center mt-20">
                  <div className="flex-center bg-blue-1 rounded-4 size-70 text-22 fw-600 text-white">4.8</div>
                  <div className="ml-20">
                    <div className="text-16 text-dark-1 fw-500 lh-14">Exceptional</div>
                    <div className="text-15 text-light-1 lh-14 mt-4">3,014 reviews</div>
                  </div>
                </div>
                <div className="row y-gap-20 pt-20">
                  {reviewRows.map((item) => (
                    <div className="col-12" key={item.label}>
                      <div className="d-flex items-center justify-between">
                        <div className="text-15 fw-500">{item.label}</div>
                        <div className="text-15 text-light-1">{item.rating}</div>
                      </div>
                      <div className="progressBar mt-10">
                        <div className="progressBar__bg bg-blue-2" />
                        <div className="progressBar__bar bg-dark-1" style={{ width: item.percent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-xl-8">
                <div className="row y-gap-40">
                  <ReviewCard withGallery />
                  <ReviewCard withGallery />
                  <ReviewCard />
                  <ReviewCard />
                  <div className="col-auto">
                    <button type="button" className="button -md -outline-blue-1 text-blue-1">
                      Show all 116 reviews <div className="icon-arrow-top-right ml-15" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-40 border-top-light pt-40">
          <div className="container">
            <div className="row y-gap-30 justify-between">
              <div className="col-xl-3">
                <div className="row">
                  <div className="col-auto">
                    <h3 className="text-22 fw-500">Leave a Reply</h3>
                    <p className="text-15 text-dark-1 mt-5">Your email address will not be published.</p>
                  </div>
                </div>
                <div className="row y-gap-30 pt-30">
                  {replyTopics.map((topic) => (
                    <div className="col-sm-6" key={topic}>
                      <div className="text-15 lh-1 fw-500">{topic}</div>
                      <div className="d-flex x-gap-5 items-center pt-10">
                        <div className="icon-star text-10 text-yellow-1" />
                        <div className="icon-star text-10 text-yellow-1" />
                        <div className="icon-star text-10 text-yellow-1" />
                        <div className="icon-star text-10 text-yellow-1" />
                        <div className="icon-star text-10 text-yellow-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-xl-8">
                <form
                  className="row y-gap-30 pt-20"
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                >
                  <div className="col-xl-6">
                    <div className="form-input">
                      <input type="text" required />
                      <label className="lh-1 text-16 text-light-1">Text</label>
                    </div>
                  </div>
                  <div className="col-xl-6">
                    <div className="form-input">
                      <input type="email" required />
                      <label className="lh-1 text-16 text-light-1">Email</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-input">
                      <textarea required rows={4} defaultValue="" />
                      <label className="lh-1 text-16 text-light-1">Write Your Comment</label>
                    </div>
                  </div>
                  <div className="col-auto">
                    <button type="submit" className="button -md -dark-1 bg-blue-1 text-white">
                      Post Comment <div className="icon-arrow-top-right ml-15" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {tour.similar.length > 0 ? (
          <section className="layout-pt-lg layout-pb-lg mt-50 border-top-light">
            <div className="container">
              <div className="row y-gap-20 justify-between items-end">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">Most Popular Tours</h2>
                    <p className="sectionTitle__text mt-5 sm:mt-0">Interdum et malesuada fames ac ante ipsum</p>
                  </div>
                </div>
                <div className="col-auto">
                  <Link href="/tours" className="button -md -blue-1 bg-blue-1-05 text-blue-1">
                    More <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
              <div className="row y-gap-30 pt-40 sm:pt-20 item_gap-x30">
                <TourCards tours={tour.similar} />
              </div>
            </div>
          </section>
        ) : null}

        <CallToActions />
        <DefaultFooter />
      </div>
    </GoTripFrame>
  );
}
