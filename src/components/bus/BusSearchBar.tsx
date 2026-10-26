"use client";

import { useEffect, useMemo, useState } from "react";
import { busCoachTypes, coachLabel } from "@/lib/buses";

type Menu = "from" | "to" | "date" | "coach" | "who" | null;

function toISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return startOfDay(new Date());
  return new Date(year, month - 1, day);
}

function prettyDate(iso: string) {
  if (!iso) return "Add date";
  return parseDay(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function BusSearchBar({
  from,
  to,
  date,
  coach,
  passengers,
  time,
  citiesFrom,
  citiesTo,
}: {
  from: string;
  to: string;
  date: string;
  coach: string;
  passengers: string;
  time: string;
  citiesFrom: string[];
  citiesTo: string[];
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayIso = toISO(today);
  const [fromCity, setFromCity] = useState(from);
  const [toCity, setToCity] = useState(to);
  const [travelDate, setTravelDate] = useState(date);
  const [coachType, setCoachType] = useState(coach || "any");
  const [party, setParty] = useState(Math.min(20, Math.max(1, Number(passengers) || 1)));
  const [menu, setMenu] = useState<Menu>(null);

  useEffect(() => {
    if (!menu) return;
    function close(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-picker]")) return;
      setMenu(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  function toggle(next: Menu) {
    setMenu((current) => (current === next ? null : next));
  }

  return (
    <form className="bus-search" action="/buses" method="get">
      {fromCity ? <input type="hidden" name="from" value={fromCity} /> : null}
      {toCity ? <input type="hidden" name="to" value={toCity} /> : null}
      {travelDate ? <input type="hidden" name="date" value={travelDate} /> : null}
      {coachType && coachType !== "any" ? <input type="hidden" name="coach" value={coachType} /> : null}
      {party !== 1 ? <input type="hidden" name="passengers" value={String(party)} /> : null}
      {time && time !== "any" ? <input type="hidden" name="time" value={time} /> : null}

      <div className="bus-search__field" data-picker>
        <button className="bus-search__who" type="button" aria-haspopup="listbox" aria-expanded={menu === "from"} onClick={() => toggle("from")}>
          <span>From</span>
          <strong>{fromCity || "Any city"}</strong>
        </button>
        {menu === "from" ? (
          <CityMenu
            label="From"
            value={fromCity}
            cities={citiesFrom}
            onPick={(city) => {
              setFromCity(city);
              setMenu(null);
            }}
          />
        ) : null}
      </div>

      <div className="bus-search__field" data-picker>
        <button className="bus-search__who" type="button" aria-haspopup="listbox" aria-expanded={menu === "to"} onClick={() => toggle("to")}>
          <span>To</span>
          <strong>{toCity || "Any city"}</strong>
        </button>
        {menu === "to" ? (
          <CityMenu
            label="To"
            value={toCity}
            cities={citiesTo}
            onPick={(city) => {
              setToCity(city);
              setMenu(null);
            }}
          />
        ) : null}
      </div>

      <div className="bus-search__field" data-picker>
        <button className="bus-search__who" type="button" aria-haspopup="dialog" aria-expanded={menu === "date"} onClick={() => toggle("date")}>
          <span>Date</span>
          <strong>{prettyDate(travelDate)}</strong>
        </button>
        {menu === "date" ? (
          <DateMenu
            value={travelDate}
            min={todayIso}
            onPick={(next) => {
              setTravelDate(next);
              setMenu(null);
            }}
          />
        ) : null}
      </div>

      <div className="bus-search__field" data-picker>
        <button className="bus-search__who" type="button" aria-haspopup="listbox" aria-expanded={menu === "coach"} onClick={() => toggle("coach")}>
          <span>Coach</span>
          <strong>{coachLabel(coachType)}</strong>
        </button>
        {menu === "coach" ? (
          <div className="bus-search__menu" role="listbox" aria-label="Coach">
            {busCoachTypes.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={coachType === option.value}
                className={coachType === option.value ? "is-on" : undefined}
                onClick={() => {
                  setCoachType(option.value);
                  setMenu(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bus-search__field bus-search__field--end" data-picker>
        <button className="bus-search__who" type="button" aria-expanded={menu === "who"} onClick={() => toggle("who")}>
          <span>Travelers</span>
          <strong>
            {party} {party === 1 ? "passenger" : "passengers"}
          </strong>
        </button>
        {menu === "who" ? (
          <div className="bus-search__who-panel">
            <div className="bus-search__guest">
              <span>Passengers</span>
              <span className="bus-search__step">
                <button type="button" aria-label="Fewer passengers" disabled={party <= 1} onClick={() => setParty((count) => Math.max(1, count - 1))}>
                  −
                </button>
                <b>{party}</b>
                <button type="button" aria-label="More passengers" disabled={party >= 20} onClick={() => setParty((count) => Math.min(20, count + 1))}>
                  +
                </button>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <button className="bus-search__go" type="submit">
        Search
      </button>
    </form>
  );
}

function CityMenu({
  label,
  value,
  cities,
  onPick,
}: {
  label: string;
  value: string;
  cities: string[];
  onPick: (city: string) => void;
}) {
  return (
    <div className="bus-search__menu" role="listbox" aria-label={label}>
      <button type="button" role="option" aria-selected={!value} className={!value ? "is-on" : undefined} onClick={() => onPick("")}>
        Any city
      </button>
      {cities.map((city) => (
        <button
          key={city}
          type="button"
          role="option"
          aria-selected={value === city}
          className={value === city ? "is-on" : undefined}
          onClick={() => onPick(city)}
        >
          {city}
        </button>
      ))}
    </div>
  );
}

function DateMenu({ value, min, onPick }: { value: string; min: string; onPick: (iso: string) => void }) {
  const selected = parseDay(value || min);
  const earliest = parseDay(min);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lead + count }, (_, index) => (index < lead ? null : index - lead + 1));
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const previousBlocked = new Date(year, month, 0) < earliest;

  return (
    <div className="bus-search__menu bus-search__cal" role="dialog" aria-label="Travel date" data-picker>
      <div className="bus-search__cal-head">
        <button type="button" aria-label="Previous month" disabled={previousBlocked} onClick={() => setCursor(new Date(year, month - 1, 1))}>
          ‹
        </button>
        <strong>{title}</strong>
        <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          ›
        </button>
      </div>
      <div className="bus-search__cal-grid" role="grid">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <span key={day}>{day}</span>
        ))}
        {days.map((day, index) => {
          if (day == null) return <span key={`empty-${index}`} />;
          const date = new Date(year, month, day);
          const iso = toISO(date);
          const disabled = date < earliest;
          return (
            <button key={iso} type="button" disabled={disabled} className={iso === value ? "is-on" : undefined} aria-pressed={iso === value} onClick={() => onPick(iso)}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
