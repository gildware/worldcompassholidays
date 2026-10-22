"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HotelRoomCard } from "@/components/hotel-single/types";
import { formatMoney } from "@/lib/format";

function reserveHref(hotelName: string, location: string, roomName: string, count: number) {
  const params = new URLSearchParams({
    destination: location,
    hotelName,
    rooms: String(count),
    message: `${count} × ${roomName} at ${hotelName}`,
  });
  return `/hotels/request?${params.toString()}`;
}

const featureIcons = ["icon-no-smoke", "icon-wifi", "icon-parking", "icon-kitchen"];

function RoomBlock({
  room,
  hotelName,
  location,
}: {
  room: HotelRoomCard;
  hotelName: string;
  location: string;
}) {
  const [count, setCount] = useState(1);
  const options = Math.max(1, room.quantity);
  const features = room.features.slice(0, 4);

  return (
    <article className="room-card">
      <Image width={240} height={180} src={room.image} alt={room.name} className="room-card__photo" />
      <div className="room-card__info">
        <h4 className="room-card__name">{room.name}</h4>
        <div className="room-card__facts">
          {room.bedLabel ? (
            <span>
              <i className="icon-bed" />
              {room.bedLabel}
            </span>
          ) : null}
          {features.map((feature, index) => (
            <span key={feature}>
              <i className={featureIcons[index % featureIcons.length]} />
              {feature}
            </span>
          ))}
          {room.meal && room.meal !== "Room only" ? (
            <span>
              <i className="icon-juice" />
              {room.meal}
            </span>
          ) : null}
        </div>
        {room.summary ? <p className="room-card__summary">{room.summary}</p> : null}
      </div>
      <div className="room-card__book">
        <div className="room-card__sleeps">
          <div className="room-card__label">Sleeps</div>
          <div className="room-card__people">
            {Array.from({ length: Math.min(4, Math.max(1, room.occupancy)) }, (_, index) => (
              <i key={index} className="icon-man" />
            ))}
          </div>
        </div>
        <label className="room-card__select">
          <span className="room-card__label">Rooms</span>
          <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
            {Array.from({ length: options }, (_, index) => {
              const amount = index + 1;
              return (
                <option key={amount} value={amount}>
                  {amount} ({formatMoney(room.price * amount, room.currency)})
                </option>
              );
            })}
          </select>
        </label>
        <div className="room-card__price">
          <div className="room-card__for">
            {count} room{count === 1 ? "" : "s"} for
          </div>
          <div className="room-card__amount">{formatMoney(room.price * count, room.currency)}</div>
          <Link
            href={reserveHref(hotelName, location, room.name, count)}
            className="button room-card__reserve -dark-1 bg-blue-1 text-white"
          >
            Reserve <span className="icon-arrow-top-right" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AvailableRooms2({
  rooms,
  hotelName,
  location,
}: {
  rooms: HotelRoomCard[];
  hotelName: string;
  location: string;
}) {
  if (rooms.length === 0) {
    return <p className="text-15 text-light-1">No rooms are listed for this hotel yet.</p>;
  }
  return (
    <div className="room-list">
      {rooms.map((room) => (
        <RoomBlock key={room.id} room={room} hotelName={hotelName} location={location} />
      ))}
    </div>
  );
}
