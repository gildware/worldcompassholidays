"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import CallToActions from "@/components/common/CallToActions";
import { TourCards } from "@/components/destinations/single/widgets";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import type { TourSingleData } from "@/components/tour-single/types";

const TourMap = dynamic(() => import("@/components/tour-single/TourMap"), {
  ssr: false,
  loading: () => <div className="d-flex items-center justify-center h-full">Loading map...</div>,
});

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function groupLabel(size: number) {
  if (size <= 1) return "Small group";
  return `Up to ${size} travelers`;
}

function TourPhotos({ images, title }: { images: string[]; title: string }) {
  const visibleCount = images.length <= 1 ? 1 : images.length === 2 ? 2 : 3;
  const layout = images.length <= 1 ? "is-single" : images.length === 2 ? "is-pair" : "is-mosaic";

  return (
    <Gallery>
      <div className={`tour-detail__photos ${layout}`}>
        {images.map((src, index) => (
          <Item key={`${src}-${index}`} original={src} thumbnail={src} width={1200} height={800}>
            {({ ref, open }) => (
              <button
                type="button"
                className={`tour-detail__photo${index >= visibleCount ? " is-extra" : ""}`}
                ref={ref}
                onClick={open}
                aria-label={index === 0 ? `View photos of ${title}` : `Photo ${index + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 991px) 100vw, 720px"
                  className="tour-detail__img"
                  priority={index === 0}
                />
                {index === 0 && images.length > 1 ? (
                  <span className="tour-detail__photo-count">See all {images.length} photos</span>
                ) : null}
              </button>
            )}
          </Item>
        ))}
      </div>
    </Gallery>
  );
}

function FaqList({ items }: { items: { title: string; content: string }[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div className="tour-detail__faq" key={item.title}>
            <button
              type="button"
              className="tour-detail__faq-q"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? -1 : index)}
            >
              <span>{item.title}</span>
              <i className={open ? "icon-minus" : "icon-plus"} />
            </button>
            {open ? <p className="tour-detail__faq-a">{plainText(item.content)}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function TourSingle({ tour, mapApiKey }: { tour: TourSingleData; mapApiKey: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);

  const images = tour.images.length > 0 ? tour.images : ["/img/tours/5.png"];
  const overview = tour.descriptionHtml || "";
  const overviewPlain = plainText(overview);
  const summary = tour.summary.trim();
  const showSummary = Boolean(summary) && summary !== overviewPlain;
  const longOverview = overviewPlain.length > 220;
  const placeLabel = tour.location || "Tours";
  const bookHref = `/contact?tour=${encodeURIComponent(tour.slug)}`;
  const days =
    tour.days.length > 0
      ? tour.days
      : [
          {
            dayNumber: 1,
            title: tour.title,
            description: overviewPlain || summary,
            imageUrl: "",
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
            content: groupLabel(tour.groupSize) + ".",
          },
          {
            title: "What should I know before I book?",
            content: tour.freeCancellation
              ? "For a full refund, cancel at least 24 hours before the start date."
              : "We confirm the date and the price before you pay.",
          },
        ];

  const meeting = tour.address.trim();
  const departure = tour.departureText.trim();
  const showDeparture = Boolean(departure) && departure !== meeting;
  const taken = new Set(
    [summary, tour.category.trim(), ...tour.highlights.map((item) => item.trim())].filter(Boolean),
  );
  const notes = tour.extraNotes
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || taken.has(item)) return false;
      if (meeting && item === `Meeting point: ${meeting}`) return false;
      return true;
    });
  const tags = [...tour.highlights.map((item) => item.trim()), ...notes.filter((item) => item.length <= 40)].filter(
    (item, index, all) => item && all.indexOf(item) === index,
  );
  const longNotes = notes.filter((item) => item.length > 40);
  const practical = [
    showDeparture ? { label: "Departures", value: departure } : null,
    meeting ? { label: "Meeting point", value: meeting } : null,
    tour.languages.length > 0 ? { label: "Languages", value: tour.languages.join(", ") } : null,
    longNotes.length > 0 ? { label: "Good to know", value: longNotes.join(" ") } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  const jumps = [
    { href: "#overview", label: "Overview" },
    ...(tour.includes.length > 0 || tour.excludes.length > 0 ? [{ href: "#included", label: "Included" }] : []),
    { href: "#itinerary", label: "Itinerary" },
    ...(tour.map ? [{ href: "#map", label: "Map" }] : []),
    ...(practical.length > 0 ? [{ href: "#practical", label: "Good to know" }] : []),
    { href: "#faq", label: "FAQ" },
  ];

  async function shareTour() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: tour.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <WorldCompassHolidayFrame>
      <div className="tour-detail">
        <div className="container">
          <nav aria-label="Breadcrumb" className="tour-detail__crumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={tour.destinationHref}>{placeLabel} tours</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{tour.title}</li>
            </ol>
            <Link href={tour.destinationHref} className="tour-detail__all">
              All tours in {placeLabel}
            </Link>
          </nav>

          <header className="tour-detail__head">
            <div className="tour-detail__copy">
              {tour.category ? <p className="tour-detail__kicker">{tour.category}</p> : null}
              <h1 className="tour-detail__title">{tour.title}</h1>
              <p className="tour-detail__where">
                <i className="icon-placeholder" />
                <span>{meeting || tour.location || "Location shared when you book"}</span>
                {tour.map ? (
                  <a href="#map">Show on map</a>
                ) : tour.mapUrl ? (
                  <a href={tour.mapUrl} target="_blank" rel="noreferrer">
                    Show on map
                  </a>
                ) : null}
              </p>
              <div className="tour-detail__chips">
                <span className="tour-detail__chip">
                  <i className="icon-clock" />
                  {tour.durationLabel}
                </span>
                <span className="tour-detail__chip">
                  <i className="icon-customer" />
                  {groupLabel(tour.groupSize)}
                </span>
                {tour.freeCancellation ? (
                  <span className="tour-detail__chip">Free cancellation</span>
                ) : null}
              </div>
              {tags.length > 0 ? (
                <div className="tour-detail__chips">
                  {tags.map((tag) => (
                    <span className="tour-detail__chip is-soft" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="tour-detail__tools">
              <button type="button" className="tour-detail__tool" onClick={() => void shareTour()}>
                <i className="icon-share" />
                {copied ? "Copied" : "Share"}
              </button>
              <button
                type="button"
                className={`tour-detail__tool${saved ? " is-on" : ""}`}
                aria-pressed={saved}
                onClick={() => setSaved((value) => !value)}
              >
                <i className="icon-heart" />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </header>

          <div className="tour-detail__layout">
            <div className="tour-detail__gallery">
              <TourPhotos images={images} title={tour.title} />
            </div>

            <aside className="tour-detail__book" id="book">
              <div className="tour-detail__card">
                <p className="tour-detail__from">From</p>
                <p className="tour-detail__price">{tour.priceLabel}</p>
                <p className="tour-detail__price-meta">
                  {tour.durationLabel} · {groupLabel(tour.groupSize)}
                </p>
                <Link href={bookHref} className="button -dark-1 bg-blue-1 text-white tour-detail__book-btn">
                  Book now
                </Link>
                <p className="tour-detail__reassure">
                  Tell us your dates. We confirm the price before you pay.
                  {tour.freeCancellation ? " Free cancellation up to 24 hours before the start." : ""}
                </p>
              </div>
            </aside>

            <div className="tour-detail__content">
              <nav className="tour-detail__jumps" aria-label="On this page">
                {jumps.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>

              <section id="overview" className="tour-detail__section">
                <h2>Overview</h2>
                <div className="tour-detail__prose">
                  {showSummary ? <p>{summary}</p> : null}
                  {overview ? (
                    <div
                      className={`tour-detail__overview${longOverview && !overviewOpen ? " is-clamped" : ""}`}
                      dangerouslySetInnerHTML={{ __html: overview }}
                    />
                  ) : null}
                </div>
                {longOverview ? (
                  <button type="button" className="tour-detail__more" onClick={() => setOverviewOpen((value) => !value)}>
                    {overviewOpen ? "Show less" : "Show more"}
                  </button>
                ) : null}
              </section>

              {tour.includes.length > 0 || tour.excludes.length > 0 ? (
                <section id="included" className="tour-detail__section">
                  <h2>What&apos;s included</h2>
                  <div className="tour-detail__split">
                    {tour.includes.length > 0 ? (
                      <div>
                        <h3>Included</h3>
                        {tour.includes.map((item) => (
                          <div className="tour-detail__line tour-detail__yes" key={item}>
                            <i className="icon-check" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {tour.excludes.length > 0 ? (
                      <div>
                        <h3>Not included</h3>
                        {tour.excludes.map((item) => (
                          <div className="tour-detail__line tour-detail__no" key={item}>
                            <i className="icon-close" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section id="itinerary" className="tour-detail__section">
                <h2>Itinerary</h2>
                <ol className="tour-detail__days">
                  {days.map((day) => (
                    <li className="tour-detail__day" key={`${day.dayNumber}-${day.title}`}>
                      <div className="tour-detail__day-num">{day.dayNumber}</div>
                      <div className={`tour-detail__day-body${day.imageUrl ? " has-photo" : ""}`}>
                        <div>
                          <h3>{day.title}</h3>
                          {day.description ? <p>{plainText(day.description)}</p> : null}
                        </div>
                        {day.imageUrl ? (
                          <Image
                            src={day.imageUrl}
                            alt=""
                            width={264}
                            height={176}
                            className="tour-detail__day-img"
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {tour.map ? (
                <section id="map" className="tour-detail__section">
                  <h2>Where you&apos;ll be</h2>
                  <div className="tour-detail__map">
                    <TourMap apiKey={mapApiKey} lat={tour.map.lat} lng={tour.map.lng} zoom={tour.map.zoom} minHeight={220} />
                    {tour.mapUrl ? (
                      <a className="tour-detail__map-link" href={tour.mapUrl} target="_blank" rel="noreferrer">
                        Open in Google Maps
                      </a>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {practical.length > 0 ? (
                <section id="practical" className="tour-detail__section">
                  <h2>Good to know</h2>
                  <dl className="tour-detail__facts">
                    {practical.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              <section id="faq" className="tour-detail__section">
                <h2>Questions</h2>
                <FaqList items={faqs} />
              </section>
            </div>
          </div>

          {tour.similar.length > 0 ? (
            <section className="tour-detail__similar">
              <div className="tour-detail__similar-head">
                <h2>Other tours</h2>
                <Link href="/tours">See all tours</Link>
              </div>
              <TourCards tours={tour.similar} />
            </section>
          ) : null}
        </div>

        <div className="mt-30">
          <CallToActions />
        </div>

        <div className="tour-detail__dock">
          <div>
            <span>From</span>
            <strong>{tour.priceLabel}</strong>
          </div>
          <Link href={bookHref}>Book now</Link>
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
