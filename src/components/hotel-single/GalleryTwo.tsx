"use client";

import { useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import type { HotelSingleData } from "@/components/hotel-single/types";

const facilityIcons = [
  "icon-wifi",
  "icon-parking",
  "icon-kitchen",
  "icon-living-room",
  "icon-shield",
  "icon-bell-ring",
];

function padImages(images: string[]) {
  const source = images.length > 0 ? images : ["/img/general/map.svg"];
  const next = [...source];
  while (next.length < 4) next.push(source[next.length % source.length]);
  return next.slice(0, 4);
}

export function GalleryTwo({ hotel }: { hotel: HotelSingleData }) {
  const [open, setOpen] = useState(false);
  const photos = padImages(hotel.images);
  const facilities = (hotel.amenities.length > 0 ? hotel.amenities : ["Free WiFi", "Parking"]).slice(0, 6);
  const overview = hotel.description || hotel.summary;

  return (
    <section className="pt-40">
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

            <div className="row justify-between items-end pt-40">
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
                <div className="row x-gap-20 y-gap-20 items-center">
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
                <a href="#rooms" className="button h-50 px-24 -dark-1 bg-blue-1 text-white">
                  Select Room <div className="icon-arrow-top-right ml-15" />
                </a>
              </div>
            </div>

            <div id="overview" className="row y-gap-40 pt-40">
              <div className="col-12">
                <h3 className="text-22 fw-500 pt-40 border-top-light">Overview</h3>
                {hotel.summary ? <p className="text-dark-1 text-15 mt-20">{hotel.summary}</p> : null}
                {overview ? (
                  <div
                    className={`text-dark-1 text-15 mt-20 hotel-overview ${open ? "is-open" : ""}`}
                    dangerouslySetInnerHTML={{ __html: overview }}
                  />
                ) : null}
                {overview ? (
                  <button
                    type="button"
                    className="d-block text-14 text-blue-1 fw-500 underline mt-10"
                    onClick={() => setOpen((value) => !value)}
                  >
                    {open ? "Show Less" : "Show More"}
                  </button>
                ) : null}
              </div>
              <div className="col-12">
                <h3 className="text-22 fw-500 pt-40 border-top-light">Most Popular Facilities</h3>
                <div className="row y-gap-10 pt-20">
                  {facilities.map((name, index) => (
                    <div className="col-md-5" key={name}>
                      <div className="d-flex x-gap-15 y-gap-15 items-center">
                        <i className={facilityIcons[index % facilityIcons.length]} />
                        <div className="text-15">{name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="px-30 py-30 border-light rounded-4">
              <div className="mb-15">
                <div
                  className="flex-center"
                  style={{
                    backgroundImage: "url(/img/general/map.svg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "180px",
                  }}
                >
                  {hotel.mapUrl ? (
                    <a
                      href={hotel.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button py-15 px-24 -blue-1 bg-white text-dark-1 absolute"
                    >
                      <i className="icon-destination text-22 mr-10" />
                      Show on map
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="row y-gap-10">
                <div className="col-12">
                  <div className="d-flex items-center">
                    <i className="icon-award text-20 text-blue-1" />
                    <div className="text-14 fw-500 ml-10">
                      {hotel.location ? `In ${hotel.location}` : hotel.propertyType}
                    </div>
                  </div>
                </div>
                {hotel.address ? (
                  <div className="col-12">
                    <div className="d-flex items-center">
                      <i className="icon-pedestrian text-20 text-blue-1" />
                      <div className="text-14 fw-500 ml-10">{hotel.address}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {hotel.stars > 0 ? (
              <div className="px-30 py-30 border-light rounded-4 mt-30">
                <div className="d-flex items-center">
                  <div className="size-40 flex-center bg-blue-1 rounded-4">
                    <div className="text-14 fw-600 text-white">{hotel.stars.toFixed(1)}</div>
                  </div>
                  <div className="text-14 ml-10">
                    <div className="lh-15 fw-500">{hotel.scoreLabel}</div>
                    <div className="lh-15 text-light-1">{hotel.propertyType}</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="px-30 py-30 border-light rounded-4 mt-30">
              <div className="text-18 fw-500 pb-30">Property highlights</div>
              <div className="row x-gap-20 y-gap-20">
                <div className="col-auto">
                  <i className="icon-city text-24 text-blue-1" />
                </div>
                <div className="col-auto">
                  <div className="text-15">{hotel.location ? `In ${hotel.location}` : hotel.propertyType}</div>
                </div>
              </div>
              {hotel.amenities.slice(0, 3).map((item) => (
                <div className="row x-gap-20 y-gap-20 pt-15" key={item}>
                  <div className="col-auto">
                    <i className="icon-bell-ring text-24 text-blue-1" />
                  </div>
                  <div className="col-auto">
                    <div className="text-15">{item}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
