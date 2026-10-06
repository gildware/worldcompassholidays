"use client";

import { useState } from "react";
import Image from "next/image";
import type { HotelRoomCard } from "@/components/hotel-single/types";
import { formatMoney } from "@/lib/format";

const featureIcons = ["icon-no-smoke", "icon-wifi", "icon-parking", "icon-kitchen"];

function RoomBlock({ room }: { room: HotelRoomCard }) {
  const [count, setCount] = useState(1);
  const options = Math.max(1, room.quantity);
  const features = room.features.slice(0, 4);

  return (
    <div className="bg-blue-2 rounded-4 px-30 py-30 sm:px-20 sm:py-20 mt-30">
      <div className="row y-gap-30">
        <div className="col-xl-auto">
          <div className="ratio ratio-1:1 col-12 col-md-4 col-xl-12">
            <Image
              width={180}
              height={180}
              src={room.image}
              alt={room.name}
              className="img-ratio rounded-4"
            />
          </div>
          <div>
            <div className="text-18 fw-500 mt-10">{room.name}</div>
            <div className="y-gap-5 pt-5">
              {room.bedLabel ? (
                <div className="d-flex items-center">
                  <i className="icon-bed text-20 mr-10" />
                  <div className="text-15">{room.bedLabel}</div>
                </div>
              ) : null}
              {features.map((feature, index) => (
                <div className="d-flex items-center" key={feature}>
                  <i className={`${featureIcons[index % featureIcons.length]} text-20 mr-10`} />
                  <div className="text-15">{feature}</div>
                </div>
              ))}
              {room.meal && room.meal !== "Room only" ? (
                <div className="d-flex items-center">
                  <i className="icon-juice text-20 mr-10" />
                  <div className="text-15">{room.meal}</div>
                </div>
              ) : null}
            </div>
            {room.summary ? <div className="text-15 text-light-1 mt-15">{room.summary}</div> : null}
          </div>
        </div>

        <div className="col-xl">
          <div className="bg-white rounded-4 px-30 py-30">
            <div className="row y-gap-30">
              <div className="col-lg col-md-6">
                <div className="text-15 fw-500 mb-10">Your price includes:</div>
                <div className="y-gap-5">
                  <div className="d-flex items-center text-green-2">
                    <i className="icon-check text-12 mr-10" />
                    <div className="text-15">Pay at the hotel</div>
                  </div>
                  {room.freeCancellation ? (
                    <div className="d-flex items-center text-green-2">
                      <i className="icon-check text-12 mr-10" />
                      <div className="text-15">Free cancellation</div>
                    </div>
                  ) : null}
                  {room.cancellation ? (
                    <div className="d-flex items-center text-green-2">
                      <i className="icon-check text-12 mr-10" />
                      <div className="text-15">{room.cancellation}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="col-lg-auto col-md-6 border-left-light lg:border-none">
                <div className="px-40 lg:px-0">
                  <div className="text-15 fw-500 mb-20">Sleeps</div>
                  <div className="d-flex items-center text-light-1">
                    {Array.from({ length: Math.min(4, Math.max(1, room.occupancy)) }, (_, index) => (
                      <div key={index} className="icon-man text-24" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-auto col-md-6 border-left-light lg:border-none">
                <div className="px-40 lg:px-0">
                  <div className="text-15 fw-500 mb-20">Select Rooms</div>
                  <div className="dropdown js-dropdown js-price-1-active">
                    <select
                      style={{ minWidth: "160px" }}
                      className="form-select dropdown__button d-flex items-center rounded-4 border-light px-15 h-50 text-14"
                      value={count}
                      onChange={(event) => setCount(Number(event.target.value))}
                    >
                      {Array.from({ length: options }, (_, index) => {
                        const amount = index + 1;
                        return (
                          <option key={amount} value={amount}>
                            {amount} ({formatMoney(room.price * amount, room.currency)})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-lg-auto col-md-6 border-left-light lg:border-none text-right lg:text-left">
                <div className="pl-40 lg:pl-0">
                  <div className="text-14 lh-14 text-light-1 mb-5">
                    {count} room{count === 1 ? "" : "s"} for
                  </div>
                  <div className="text-20 lh-14 fw-500">{formatMoney(room.price * count, room.currency)}</div>
                  <a href="#rooms" className="button h-50 px-35 -dark-1 bg-blue-1 text-white mt-10">
                    Reserve <div className="icon-arrow-top-right ml-15" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AvailableRooms2({ rooms }: { rooms: HotelRoomCard[] }) {
  if (rooms.length === 0) {
    return <p className="text-15 text-light-1">No rooms are listed for this hotel yet.</p>;
  }
  return (
    <>
      {rooms.map((room) => (
        <RoomBlock key={room.id} room={room} />
      ))}
    </>
  );
}
