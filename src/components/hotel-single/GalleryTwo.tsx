"use client";

import { type MouseEvent } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import GooglePlaceMap from "@/components/common/GooglePlaceMap";
import type { HotelSingleData } from "@/components/hotel-single/types";

function selectRoom(event: MouseEvent<HTMLAnchorElement>) {
  const section = document.getElementById("rooms");
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  const field = section.querySelector("select");
  if (field instanceof HTMLElement) window.setTimeout(() => field.focus(), 350);
}

export function amenityIcon(name: string) {
  const value = name.toLowerCase();
  if (value.includes("wi")) return "icon-wifi";
  if (value.includes("park")) return "icon-parking";
  if (value.includes("restaurant") || value.includes("dining") || value.includes("breakfast")) return "icon-food";
  if (value.includes("kitchen")) return "icon-kitchen";
  if (value.includes("pool") || value.includes("swim")) return "icon-living-room";
  if (value.includes("desk") || value.includes("service") || value.includes("laundry")) return "icon-bell-ring";
  if (value.includes("transfer") || value.includes("airport")) return "icon-destination";
  return "icon-check";
}

function padImages(images: string[]) {
  const source = images.length > 0 ? images : ["/img/general/map.svg"];
  const next = [...source];
  while (next.length < 4) next.push(source[next.length % source.length]);
  return next.slice(0, 4);
}

export function GalleryTwo({ hotel, mapApiKey }: { hotel: HotelSingleData; mapApiKey: string }) {
  const photos = padImages(hotel.images);
  const overview = hotel.description && hotel.description !== hotel.summary ? hotel.description : "";

  return (
    <section className="hotel-hero">
      <div className="container">
        <div className="hotelSingleGrid">
          <div>
            <Gallery>
              <div className="galleryGrid -type-2">
                <div className="galleryGrid__item relative d-flex justify-end">
                  <Item original={photos[0]} thumbnail={photos[0]} width={660} height={660}>
                    {({ ref, open: openPhoto }) => (
                      <img
                        src={photos[0]}
                        ref={ref}
                        onClick={openPhoto}
                        alt={hotel.name}
                        role="button"
                        className="rounded-4"
                      />
                    )}
                  </Item>
                  <div className="absolute px-20 py-20">
                    <button type="button" className="button -blue-1 size-40 rounded-full bg-white">
                      <i className="icon-heart text-16" />
                    </button>
                  </div>
                </div>

                {photos.slice(1, 3).map((photo, index) => (
                  <div className="galleryGrid__item" key={`${photo}-${index}`}>
                    <Item original={photo} thumbnail={photo} width={450} height={375}>
                      {({ ref, open: openPhoto }) => (
                        <img
                          ref={ref}
                          onClick={openPhoto}
                          src={photo}
                          alt={hotel.name}
                          className="rounded-4"
                          role="button"
                        />
                      )}
                    </Item>
                  </div>
                ))}

                <div className="galleryGrid__item relative d-flex justify-end items-end">
                  <img src={photos[3]} alt={hotel.name} className="rounded-4" />
                  <div className="absolute px-10 py-10 col-12 h-full d-flex justify-end items-end">
                    <Item original={photos[3]} thumbnail={photos[3]} width={362} height={302}>
                      {({ ref, open: openPhoto }) => (
                        <div
                          className="button -blue-1 px-24 py-15 bg-white text-dark-1 js-gallery"
                          ref={ref}
                          onClick={openPhoto}
                          role="button"
                        >
                          See All Photos
                        </div>
                      )}
                    </Item>
                  </div>
                </div>
              </div>
            </Gallery>

            <div className="row justify-between items-end pt-20">
              <div className="col-auto">
                <div className="row x-gap-20 items-center">
                  <div className="col-auto">
                    <h1 className="text-30 sm:text-25 fw-600">{hotel.name}</h1>
                  </div>
                  {hotel.stars > 0 ? (
                    <div className="col-auto">
                      {Array.from({ length: hotel.stars }, (_, index) => (
                        <i key={index} className="icon-star text-10 text-yellow-1" />
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="row x-gap-20 y-gap-5 items-center pt-5">
                  <div className="col-auto">
                    <div className="d-flex items-center text-15 text-light-1">
                      <i className="icon-location-2 text-16 mr-5" />
                      {hotel.address || hotel.location}
                    </div>
                  </div>
                  {hotel.mapUrl ? (
                    <div className="col-auto">
                      <a href={hotel.mapUrl} target="_blank" rel="noreferrer" className="text-blue-1 text-15 underline">
                        Show on map
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="col-auto">
                <div className="text-14 text-md-end">
                  From <span className="text-22 text-dark-1 fw-500">{hotel.priceLabel}</span>
                </div>
                <a href="#rooms" className="button h-50 px-24 -dark-1 bg-blue-1 text-white" onClick={selectRoom}>
                  Select Room <div className="icon-arrow-top-right ml-15" />
                </a>
              </div>
            </div>

            <div id="overview" className="hotel-overview-block">
              <h3>Overview</h3>
              {hotel.summary ? <p>{hotel.summary}</p> : null}
              {overview ? <div className="hotel-overview-block__more" dangerouslySetInnerHTML={{ __html: overview }} /> : null}
            </div>
          </div>

          <aside className="hotel-side">
            <div className="hotel-side__card">
              {hotel.stars > 0 ? (
                <div className="hotel-side__score">
                  <div className="hotel-side__score-badge">{hotel.stars.toFixed(1)}</div>
                  <div>
                    <div className="hotel-side__score-label">{hotel.scoreLabel}</div>
                    <div className="hotel-side__score-type">{hotel.propertyType}</div>
                  </div>
                </div>
              ) : null}
              <div className="hotel-side__map">
                {hotel.mapLat && hotel.mapLng && mapApiKey ? (
                  <GooglePlaceMap
                    apiKey={mapApiKey}
                    lat={Number(hotel.mapLat)}
                    lng={Number(hotel.mapLng)}
                    zoom={hotel.mapZoom || 14}
                    minHeight={168}
                  />
                ) : (
                  <span className="hotel-side__pin">
                    <i className="icon-location-pin" />
                  </span>
                )}
              </div>
              {hotel.address || hotel.location ? (
                <p className="hotel-side__address">{hotel.address || hotel.location}</p>
              ) : null}
              {hotel.mapUrl ? (
                <a href={hotel.mapUrl} target="_blank" rel="noreferrer" className="hotel-side__open">
                  Open in Google Maps
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
