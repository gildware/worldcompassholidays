"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import type { CarSort } from "@/components/car-list/types";
import type { CarListFilters } from "@/components/car-list/car-list-v1/Sidebar";
import type { CountOption } from "@/components/hotel-list/types";

type MenuKey = "city" | "type" | "sort";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {children}
    </svg>
  );
}

function Chevron() {
  return (
    <Icon>
      <path
        d="M4.25 6.25 8 10l3.75-3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function PinIcon() {
  return (
    <Icon>
      <path
        d="M8 14.2s4.2-3.7 4.2-6.7a4.2 4.2 0 1 0-8.4 0c0 3 4.2 6.7 4.2 6.7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="7.4" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </Icon>
  );
}

function CalendarIcon() {
  return (
    <Icon>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 6.5h11M5.5 2.2v2.2M10.5 2.2v2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Icon>
  );
}

function TypeIcon() {
  return (
    <Icon>
      <circle cx="4.2" cy="11.2" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="11.2" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 11.2h3.4M8 11.2 6.2 6.2h4.2L12 9.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function FuelIcon() {
  return (
    <Icon>
      <path d="M4 13.5V3.8A1.3 1.3 0 0 1 5.3 2.5h3.4A1.3 1.3 0 0 1 10 3.8v9.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.2 13.5h7.6M10 6.2h1.2a1.5 1.5 0 0 1 1.5 1.5v3.2a1 1 0 0 0 2 0V6.4L12.2 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function SortIcon() {
  return (
    <Icon>
      <path d="M5 3.2v9.6M5 3.2 2.8 5.4M5 3.2l2.2 2.2M11 12.8V3.2M11 12.8l-2.2-2.2M11 12.8l2.2-2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

function TransmissionIcon() {
  return (
    <Icon>
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.6v1.5M8 11.9v1.5M2.6 8h1.5M11.9 8h1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Icon>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bike-field">
      <span className="bike-field__label">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

function pickOne(selected: string[], label: string) {
  return selected.length === 1 && selected[0] === label ? [] : [label];
}

function pickMany(selected: string[], label: string) {
  return selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label];
}

function choiceLabel(fallback: string, selected: string[], plural = `${fallback.toLowerCase()}s`) {
  if (selected.length === 0) return fallback;
  if (selected.length === 1) return selected[0];
  return `${selected.length} ${plural}`;
}

export function BikeFilterBar({
  cities,
  types,
  fuels,
  transmissions = [],
  filters,
  sort,
  sorts,
  pickupDate,
  dropoffDate,
  onPickupDate,
  onDropoffDate,
  onChange,
  onSort,
  typeAsMenu = false,
}: {
  cities: CountOption[];
  types: CountOption[];
  fuels: CountOption[];
  transmissions?: CountOption[];
  filters: CarListFilters;
  sort: CarSort;
  sorts: { value: CarSort; label: string }[];
  pickupDate: DateObject | null;
  dropoffDate: DateObject | null;
  onPickupDate: (date: DateObject | null) => void;
  onDropoffDate: (date: DateObject | null) => void;
  onChange: (next: CarListFilters) => void;
  onSort: (next: CarSort) => void;
  typeAsMenu?: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const filtersActive =
    filters.locations.length > 0 ||
    filters.categories.length > 0 ||
    filters.fuelPolicies.length > 0 ||
    filters.transmissions.length > 0;
  const baseId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && barRef.current?.contains(target)) return;
      setOpen(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const toggleMenu = (key: MenuKey) => setOpen((current) => (current === key ? null : key));

  return (
    <div className="bike-bar" ref={barRef}>
      <div className="bike-bar__line" onScroll={() => setOpen(null)}>
        {cities.length > 1 ? (
          <Field icon={<PinIcon />} label="Location">
            <FilterMenu
              id={`${baseId}-city`}
              label={choiceLabel("Location", filters.locations, "locations")}
              active={filters.locations.length > 0}
              open={open === "city"}
              onToggle={() => toggleMenu("city")}
              width={240}
            >
              <OptionList
                anyLabel="Any location"
                options={cities}
                selected={filters.locations}
                onPick={(label) => {
                  onChange({ ...filters, locations: label ? pickMany(filters.locations, label) : [] });
                }}
              />
            </FilterMenu>
          </Field>
        ) : null}

        <Field icon={<CalendarIcon />} label="Dates">
          <DateRange
            pickupDate={pickupDate}
            dropoffDate={dropoffDate}
            onPickupDate={onPickupDate}
            onDropoffDate={onDropoffDate}
          />
        </Field>

        <Field icon={<TypeIcon />} label="Type">
          {typeAsMenu ? (
            <FilterMenu
              id={`${baseId}-type`}
              label={choiceLabel("Type", filters.categories, "types")}
              active={filters.categories.length > 0}
              open={open === "type"}
              onToggle={() => toggleMenu("type")}
              width={220}
            >
              <OptionList
                anyLabel="Any type"
                options={types}
                selected={filters.categories}
                onPick={(label) => {
                  onChange({ ...filters, categories: label ? pickOne(filters.categories, label) : [] });
                }}
              />
            </FilterMenu>
          ) : (
            <div className="bike-seg" role="group" aria-label="Type">
              <button
                type="button"
                className={`bike-seg__btn${filters.categories.length === 0 ? " is-on" : ""}`}
                aria-pressed={filters.categories.length === 0}
                onClick={() => {
                  setOpen(null);
                  onChange({ ...filters, categories: [] });
                }}
              >
                All
              </button>
              {types.map((option) => {
                const on = filters.categories.includes(option.label);
                return (
                  <button
                    type="button"
                    key={option.label}
                    className={`bike-seg__btn${on ? " is-on" : ""}`}
                    aria-pressed={on}
                    onClick={() => {
                      setOpen(null);
                      onChange({ ...filters, categories: pickOne(filters.categories, option.label) });
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </Field>

        {transmissions.length > 0 ? (
          <Field icon={<TransmissionIcon />} label="Gearbox">
            <div className="bike-seg" role="group" aria-label="Gearbox">
              <button
                type="button"
                className={`bike-seg__btn${filters.transmissions.length === 0 ? " is-on" : ""}`}
                aria-pressed={filters.transmissions.length === 0}
                onClick={() => {
                  setOpen(null);
                  onChange({ ...filters, transmissions: [] });
                }}
              >
                All
              </button>
              {transmissions.map((option) => {
                const on = filters.transmissions.includes(option.label);
                const short = /automatic/i.test(option.label) ? "Automatic" : /manual/i.test(option.label) ? "Manual" : option.label;
                return (
                  <button
                    type="button"
                    key={option.label}
                    className={`bike-seg__btn${on ? " is-on" : ""}`}
                    aria-pressed={on}
                    onClick={() => {
                      setOpen(null);
                      onChange({ ...filters, transmissions: pickOne(filters.transmissions, option.label) });
                    }}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </Field>
        ) : null}

        <Field icon={<FuelIcon />} label="Fuel">
        <div className="bike-seg" role="group" aria-label="Fuel">
          <button
            type="button"
            className={`bike-seg__btn${filters.fuelPolicies.length === 0 ? " is-on" : ""}`}
            aria-pressed={filters.fuelPolicies.length === 0}
            onClick={() => {
              setOpen(null);
              onChange({ ...filters, fuelPolicies: [] });
            }}
          >
            All
          </button>
          {fuels.map((option) => {
            const on = filters.fuelPolicies.includes(option.label);
            return (
              <button
                type="button"
                key={option.label}
                className={`bike-seg__btn${on ? " is-on" : ""}`}
                aria-pressed={on}
                onClick={() => {
                  setOpen(null);
                  onChange({ ...filters, fuelPolicies: pickOne(filters.fuelPolicies, option.label) });
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        </Field>

        {filtersActive ? (
          <button
            type="button"
            className="bike-bar__reset"
            onClick={() => {
              setOpen(null);
              onChange({
                ...filters,
                locations: [],
                categories: [],
                fuelPolicies: [],
                transmissions: [],
              });
            }}
          >
            Reset
          </button>
        ) : null}
      </div>

      <Field icon={<SortIcon />} label="Sort">
      <FilterMenu
        id={`${baseId}-sort`}
        label={sorts.find((option) => option.value === sort)?.label ?? "Sort"}
        active={sort !== "recommended"}
        open={open === "sort"}
        onToggle={() => toggleMenu("sort")}
        align="end"
        width={200}
      >
        <div className="bike-menu__list" role="listbox" aria-label="Sort">
          {sorts.map((option) => {
            const on = option.value === sort;
            return (
              <button
                type="button"
                key={option.value}
                className={`bike-menu__option${on ? " is-on" : ""}`}
                role="option"
                aria-selected={on}
                onClick={() => {
                  onSort(option.value);
                  setOpen(null);
                }}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </FilterMenu>
      </Field>
    </div>
  );
}

function DateRange({
  pickupDate,
  dropoffDate,
  onPickupDate,
  onDropoffDate,
}: {
  pickupDate: DateObject | null;
  dropoffDate: DateObject | null;
  onPickupDate: (date: DateObject | null) => void;
  onDropoffDate: (date: DateObject | null) => void;
}) {
  const start = pickupDate?.format("MMM D");
  const end = dropoffDate?.format("MMM D");
  const label = start && end ? `${start} – ${end}` : start || "Dates";
  const value = [pickupDate, dropoffDate].filter((date): date is DateObject => Boolean(date));

  return (
    <div className="bike-date">
      <DatePicker
        value={value}
        range
        rangeHover
        format="MMM D"
        numberOfMonths={2}
        portal
        zIndex={80}
        onChange={(next) => {
          const dates = !next ? [] : Array.isArray(next) ? next : [next];
          onPickupDate(dates[0] ?? null);
          onDropoffDate(dates[1] ?? null);
        }}
        render={(_value, openCalendar) => (
          <button type="button" className="bike-menu__btn" onClick={openCalendar}>
            <span>{label}</span>
          </button>
        )}
      />
    </div>
  );
}

function FilterMenu({
  id,
  label,
  active,
  open,
  onToggle,
  children,
  width = 220,
  align = "start",
}: {
  id: string;
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  width?: number;
  align?: "start" | "end";
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const left =
      align === "end"
        ? Math.max(12, rect.right - width)
        : Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    setBox({ top: rect.bottom + 6, left });
  }, [align, open, width]);

  return (
    <div className="bike-menu">
      <button
        ref={buttonRef}
        type="button"
        className={`bike-menu__btn${active ? " is-on" : ""}${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <span>{label}</span>
        <Chevron />
      </button>
      {open && box ? (
        <div id={id} className="bike-menu__panel" style={{ top: box.top, left: box.left, width }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function OptionList({
  anyLabel,
  options,
  selected,
  onPick,
}: {
  anyLabel: string;
  options: CountOption[];
  selected: string[];
  onPick: (label: string | null) => void;
}) {
  return (
    <div className="bike-menu__list" role="listbox">
      <button
        type="button"
        className={`bike-menu__option${selected.length === 0 ? " is-on" : ""}`}
        role="option"
        aria-selected={selected.length === 0}
        onClick={() => onPick(null)}
      >
        <span>{anyLabel}</span>
      </button>
      {options.map((option) => {
        const on = selected.includes(option.label);
        return (
          <button
            type="button"
            key={option.label}
            className={`bike-menu__option${on ? " is-on" : ""}`}
            role="option"
            aria-selected={on}
            onClick={() => onPick(option.label)}
          >
            <span>{option.label}</span>
            <span className="bike-menu__count">{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}
