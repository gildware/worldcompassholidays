"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addCurrentTab } from "../../../features/hero/findPlaceSlice";

function searchPath(path, params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function Field({ label, children }) {
  return (
    <label className="searchMenu-loc px-30 lg:py-20 lg:px-0">
      <h4 className="text-15 fw-500 ls-2 lh-16">{label}</h4>
      <div className="text-15 text-light-1 ls-2 lh-16">{children}</div>
    </label>
  );
}

function TextField({ label, name, value, onChange, placeholder, type = "text", min }) {
  return (
    <Field label={label}>
      <input
        name={name}
        type={type}
        min={min}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function SearchButton() {
  return (
    <div className="button-item">
      <button
        type="submit"
        className="mainSearch__submit button -dark-1 h-60 px-35 col-12 rounded-100 bg-blue-1 text-white"
      >
        <i className="icon-search text-20 mr-10" />
        Search
      </button>
    </div>
  );
}

function SearchShell({ wide, children, onSubmit }) {
  return (
    <form
      className={`mainSearch ${wide ? "-fields-4 -w-1070" : "-fields-3 -w-900"} bg-white px-10 py-10 lg:px-20 lg:pt-5 lg:pb-20 rounded-100`}
      onSubmit={onSubmit}
    >
      <div className="button-grid items-center">
        {children}
        <SearchButton />
      </div>
    </form>
  );
}

function TourForm({ onSearch }) {
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("2");

  return (
    <SearchShell
      onSubmit={(event) => {
        event.preventDefault();
        onSearch("/tours", { q: place, date, travelers });
      }}
    >
      <TextField
        label="Destination"
        name="q"
        value={place}
        onChange={setPlace}
        placeholder="Where are you going?"
      />
      <TextField label="Travel date" name="date" type="date" value={date} onChange={setDate} />
      <TextField
        label="Travelers"
        name="travelers"
        type="number"
        min="1"
        value={travelers}
        onChange={setTravelers}
      />
    </SearchShell>
  );
}

function HotelForm({ onSearch }) {
  const [place, setPlace] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <SearchShell
      wide
      onSubmit={(event) => {
        event.preventDefault();
        onSearch("/hotels", { q: place, checkin: checkIn, checkout: checkOut, guests });
      }}
    >
      <TextField
        label="Location"
        name="q"
        value={place}
        onChange={setPlace}
        placeholder="City or hotel"
      />
      <TextField label="Check in" name="checkin" type="date" value={checkIn} onChange={setCheckIn} />
      <TextField label="Check out" name="checkout" type="date" value={checkOut} onChange={setCheckOut} />
      <TextField label="Guests" name="guests" type="number" min="1" value={guests} onChange={setGuests} />
    </SearchShell>
  );
}

function BusForm({ onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  return (
    <SearchShell
      wide
      onSubmit={(event) => {
        event.preventDefault();
        onSearch("/buses", { from, to, date, passengers });
      }}
    >
      <TextField label="From" name="from" value={from} onChange={setFrom} placeholder="Departure city" />
      <TextField label="To" name="to" value={to} onChange={setTo} placeholder="Arrival city" />
      <TextField label="Travel date" name="date" type="date" value={date} onChange={setDate} />
      <TextField
        label="Passengers"
        name="passengers"
        type="number"
        min="1"
        value={passengers}
        onChange={setPassengers}
      />
    </SearchShell>
  );
}

function RentalForm({ onSearch }) {
  const [kind, setKind] = useState("car");
  const [place, setPlace] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  return (
    <SearchShell
      wide
      onSubmit={(event) => {
        event.preventDefault();
        onSearch("/rentals", { kind, q: place, pickup, return: dropoff });
      }}
    >
      <Field label="Type">
        <select name="kind" value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>
      </Field>
      <TextField
        label="Pickup location"
        name="q"
        value={place}
        onChange={setPlace}
        placeholder={kind === "bike" ? "Where do you need a bike?" : "Where do you need a car?"}
      />
      <TextField label="Pickup" name="pickup" type="datetime-local" value={pickup} onChange={setPickup} />
      <TextField label="Return" name="return" type="datetime-local" value={dropoff} onChange={setDropoff} />
    </SearchShell>
  );
}

const forms = {
  Tour: TourForm,
  Hotel: HotelForm,
  Bus: BusForm,
  "Car bike rental": RentalForm,
};

const MainFilterSearchBox = () => {
  const { tabs, currentTab } = useSelector((state) => state.hero) || {};
  const dispatch = useDispatch();
  const router = useRouter();
  const activeTab = forms[currentTab] ? currentTab : "Tour";
  const ActiveForm = forms[activeTab];

  return (
    <>
      <div className="tabs__controls d-flex x-gap-30 y-gap-20 justify-center sm:justify-start js-tabs-controls">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            type="button"
            className={`tabs__button text-15 fw-500 text-white pb-4 js-tabs-button ${
              tab?.name === activeTab ? "is-tab-el-active" : ""
            }`}
            onClick={() => dispatch(addCurrentTab(tab?.name))}
          >
            {tab?.name}
          </button>
        ))}
      </div>

      <div className="position-relative mt-30 md:mt-20 js-tabs-content">
        <ActiveForm
          key={activeTab}
          onSearch={(path, params) => router.push(searchPath(path, params))}
        />
      </div>
    </>
  );
};

export default MainFilterSearchBox;
