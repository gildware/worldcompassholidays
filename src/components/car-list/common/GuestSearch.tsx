"use client";

import type { GuestCounts } from "@/components/hotel-list/common/GuestSearch";

const counters = [
  { name: "Adults" },
  { name: "Children" },
  { name: "Rooms" },
] as const;

function Counter({
  name,
  count,
  onChange,
}: {
  name: keyof GuestCounts;
  count: number;
  onChange: (name: keyof GuestCounts, value: number) => void;
}) {
  return (
    <>
      <div className="row y-gap-10 justify-between items-center">
        <div className="col-auto">
          <div className="text-15 lh-12 fw-500">{name}</div>
          {name === "Children" && (
            <div className="text-14 lh-12 text-light-1 mt-5">Ages 0 - 17</div>
          )}
        </div>
        <div className="col-auto">
          <div className="d-flex items-center js-counter">
            <button
              type="button"
              className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
              onClick={() => onChange(name, Math.max(0, count - 1))}
            >
              <i className="icon-minus text-12" />
            </button>
            <div className="flex-center size-20 ml-15 mr-15">
              <div className="text-15 js-count">{count}</div>
            </div>
            <button
              type="button"
              className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up"
              onClick={() => onChange(name, count + 1)}
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

export function GuestSearch({
  guestCounts,
  onChange,
}: {
  guestCounts: GuestCounts;
  onChange: (counts: GuestCounts) => void;
}) {
  return (
    <div className="searchMenu-guests px-30 lg:py-20 lg:px-0 js-form-dd js-form-counters">
      <div
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
        data-bs-offset="0,22"
      >
        <h4 className="text-15 fw-500 ls-2 lh-16">Passenger (optional)</h4>
        <div className="text-15 text-light-1 ls-2 lh-16">
          <span className="js-count-adult">{guestCounts.Adults}</span> adults -{" "}
          <span className="js-count-child">{guestCounts.Children}</span> childeren -{" "}
          <span className="js-count-room">{guestCounts.Rooms}</span> room
        </div>
      </div>

      <div className="shadow-2 dropdown-menu min-width-400">
        <div className="bg-white px-30 py-30 rounded-4 counter-box">
          {counters.map((counter) => (
            <Counter
              key={counter.name}
              name={counter.name}
              count={guestCounts[counter.name]}
              onChange={(name, value) => onChange({ ...guestCounts, [name]: value })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
