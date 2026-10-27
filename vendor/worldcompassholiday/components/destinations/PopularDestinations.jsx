"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./popular-destinations.css";

const PopularDestinations = ({ destinations = /** @type {any[]} */ ([]) }) => {
  const scroller = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [edge, setEdge] = useState({ start: true, end: true });
  const [thumb, setThumb] = useState({ width: 100, left: 0 });

  function measure() {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const width = el.scrollWidth > 0 ? (el.clientWidth / el.scrollWidth) * 100 : 100;
    setThumb({
      width,
      left: max > 0 ? (el.scrollLeft / max) * (100 - width) : 0,
    });
    setEdge({
      start: el.scrollLeft <= 4,
      end: max <= 4 || el.scrollLeft >= max - 4,
    });
  }

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return undefined;
    const onScroll = () => measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [destinations.length]);

  function move(direction) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector(".pop-dest__slide");
    const styles = getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 22;
    const step = (card?.getBoundingClientRect().width || el.clientWidth) + gap;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  }

  if (destinations.length === 0) {
    return (
      <p className="rounded-4 bg-light-2 px-6 py-10 text-center text-15 text-light-1">
        No popular destinations yet.
      </p>
    );
  }

  return (
    <div className="pop-dest">
      <div className="pop-dest__frame">
        <div className="pop-dest__track" ref={scroller}>
          {destinations.map((item) => (
            <Link
              prefetch={false}
              key={item.id || item.slug}
              href={`/destinations/${item.slug}`}
              className="pop-dest__slide citiesCard -type-1 d-block rounded-4"
            >
              <div className="citiesCard__image ratio ratio-3:4">
                <Image
                  width={300}
                  height={400}
                  src={item.imageUrl}
                  alt={item.name}
                  className="js-lazy"
                />
              </div>
              <div className="citiesCard__content d-flex flex-column justify-between text-center pt-30 pb-20 px-20">
                <div className="citiesCard__bg" />
                <div className="citiesCard__top">
                  <div className="text-14 text-white">{item.hoverText}</div>
                </div>
                <div className="citiesCard__bottom">
                  <h4 className="text-26 md:text-20 lh-13 text-white mb-20">{item.name}</h4>
                  <span className="button col-12 h-60 -blue-1 bg-white text-dark-1">Discover</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button
          type="button"
          className="section-slider-nav -prev flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none"
          aria-label="Previous destinations"
          disabled={edge.start}
          onClick={() => move(-1)}
        >
          <i className="icon icon-chevron-left text-12" />
        </button>
        <button
          type="button"
          className="section-slider-nav -next flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none"
          aria-label="Next destinations"
          disabled={edge.end}
          onClick={() => move(1)}
        >
          <i className="icon icon-chevron-right text-12" />
        </button>
      </div>
      <div className="pop-dest__scroll" aria-hidden="true">
        <span style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }} />
      </div>
    </div>
  );
};

export default PopularDestinations;
