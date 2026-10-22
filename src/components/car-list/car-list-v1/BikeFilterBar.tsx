"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import type { CarSort } from "@/components/car-list/types";
import { tagColor } from "@/lib/rentals/tag-colors";
import type { CarListFilters } from "@/components/car-list/car-list-v1/Sidebar";
import type { CountOption } from "@/components/hotel-list/types";

type MenuKey = "city" | "type" | "tag" | "sort";

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

function FilterIcon() {
  return (
    <Icon>
      <path
        d="M2.4 3.2h11.2L9.4 8.1v3.4l-2.8 1.3V8.1L2.4 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
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

function SearchIcon() {
  return (
    <Icon>
      <circle cx="7" cy="7" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="m9.7 9.7 3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Icon>
  );
}

function TagIcon() {
  return (
    <Icon>
      <path d="M2.8 8.4 8 3.2h4.6v4.6L7.2 13.2a1.2 1.2 0 0 1-1.7 0L2.8 10.1a1.2 1.2 0 0 1 0-1.7Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10.6" cy="5.4" r="0.8" fill="currentColor" />
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
  className,
  children,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`bike-field${className ? ` ${className}` : ""}`}>
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
  tags = [],
  transmissions = [],
  query,
  locationQuery = "",
  onQuery,
  searchPlaceholder,
  filters,
  sort,
  sorts,
  pickupDate,
  dropoffDate,
  onPickupDate,
  onDropoffDate,
  onChange,
  onReset,
  onSort,
  typeAsMenu = false,
}: {
  cities: CountOption[];
  types: CountOption[];
  fuels: CountOption[];
  tags?: CountOption[];
  transmissions?: CountOption[];
  query: string;
  locationQuery?: string;
  onQuery: (value: string) => void;
  searchPlaceholder: string;
  filters: CarListFilters;
  sort: CarSort;
  sorts: { value: CarSort; label: string }[];
  pickupDate: DateObject | null;
  dropoffDate: DateObject | null;
  onPickupDate: (date: DateObject | null) => void;
  onDropoffDate: (date: DateObject | null) => void;
  onChange: (next: CarListFilters) => void;
  onReset?: () => void;
  onSort: (next: CarSort) => void;
  typeAsMenu?: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [drawer, setDrawer] = useState(false);
  const filtersActive =
    query.trim().length > 0 ||
    locationQuery.trim().length > 0 ||
    filters.locations.length > 0 ||
    filters.categories.length > 0 ||
    filters.fuelPolicies.length > 0 ||
    filters.transmissions.length > 0 ||
    filters.tags.length > 0;
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

  useEffect(() => {
    if (!drawer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const toggleMenu = (key: MenuKey) => setOpen((current) => (current === key ? null : key));
  const drawerActive =
    locationQuery.trim().length > 0 ||
    Boolean(pickupDate || dropoffDate) ||
    filters.locations.length > 0 ||
    filters.categories.length > 0 ||
    filters.fuelPolicies.length > 0 ||
    filters.transmissions.length > 0 ||
    filters.tags.length > 0;

  return (
    <div className="bike-bar" ref={barRef}>
      <Field className="bike-field--search" icon={<SearchIcon />} label="Search">
          <label className="bike-search">
            <input
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => onQuery(event.target.value)}
            />
            {query ? (
              <button
                type="button"
                className="bike-search__clear"
                aria-label="Clear search"
                onClick={() => onQuery("")}
              >
                ×
              </button>
            ) : null}
          </label>
        </Field>

        <button
          type="button"
          className={`list-filter-toggle${drawerActive ? " is-on" : ""}`}
          aria-label="Filters"
          aria-expanded={drawer}
          onClick={() => {
            setOpen(null);
            setDrawer(true);
          }}
        >
          <FilterIcon />
        </button>

        <Field className="bike-field--sort" icon={<SortIcon />} label="Sort">
          <FilterMenu
            id={`${baseId}-sort`}
            label={sorts.find((option) => option.value === sort)?.label ?? "Sort"}
            active={sort !== "recommended"}
            open={open === "sort"}
            onToggle={() => toggleMenu("sort")}
            align="end"
            width={200}
            mark={<SortIcon />}
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

        <div className={`bike-bar__filters${drawer ? " is-open" : ""}`} onScroll={() => setOpen(null)}>
          <div className="list-filter-drawer__head">
            <h2>Filters</h2>
            <button type="button" aria-label="Close filters" onClick={() => setDrawer(false)}>
              ×
            </button>
          </div>
        {cities.length > 1 ? (
          <Field icon={<PinIcon />} label="Location">
            <FilterMenu
              id={`${baseId}-city`}
              label={choiceLabel("Location", filters.locations, "locations")}
              active={filters.locations.length > 0}
              open={open === "city"}
              onToggle={() => toggleMenu("city")}
              width={240}
              inline={drawer}
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
              inline={drawer}
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

        {tags.length > 0 ? (
          <Field icon={<TagIcon />} label="Tag">
            <FilterMenu
              id={`${baseId}-tag`}
              label={choiceLabel("Tag", filters.tags, "tags")}
              swatch={filters.tags.length === 1 ? tagColor(filters.tags[0]) : undefined}
              active={filters.tags.length > 0}
              open={open === "tag"}
              onToggle={() => toggleMenu("tag")}
              width={230}
              inline={drawer}
            >
              <OptionList
                anyLabel="Any tag"
                options={tags}
                selected={filters.tags}
                colorFor={tagColor}
                onPick={(label) => {
                  onChange({ ...filters, tags: label ? pickOne(filters.tags, label) : [] });
                  setOpen(null);
                }}
              />
            </FilterMenu>
          </Field>
        ) : null}

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
              if (onReset) {
                onReset();
                return;
              }
              onQuery("");
              onChange({
                ...filters,
                locations: [],
                categories: [],
                fuelPolicies: [],
                transmissions: [],
                tags: [],
              });
            }}
          >
            Reset
          </button>
        ) : null}
          <button type="button" className="list-filter-drawer__apply" onClick={() => setDrawer(false)}>
            Show results
          </button>
        </div>
        {drawer ? (
          <button type="button" className="list-filter-drawer__backdrop" aria-label="Close filters" onClick={() => setDrawer(false)} />
        ) : null}
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
  const [months, setMonths] = useState(1);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const apply = () => setMonths(query.matches ? 2 : 1);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <div className="bike-date">
      <DatePicker
        value={value}
        range
        rangeHover
        format="MMM D"
        numberOfMonths={months}
        portal
        zIndex={2000}
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
  swatch,
  active,
  open,
  onToggle,
  children,
  width = 220,
  align = "start",
  mark,
  inline = false,
}: {
  id: string;
  label: string;
  swatch?: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  width?: number;
  align?: "start" | "end";
  mark?: ReactNode;
  inline?: boolean;
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

  if (inline) {
    return (
      <div className="bike-menu bike-menu--inline">
        <div id={id} className="bike-menu__panel bike-menu__panel--inline">
          {children}
        </div>
      </div>
    );
  }

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
        {swatch ? <span className="bike-menu__swatch" style={{ background: swatch }} /> : null}
        {mark ? <span className="bike-menu__mark">{mark}</span> : null}
        <span className="bike-menu__text">{label}</span>
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
  colorFor,
  onPick,
}: {
  anyLabel: string;
  options: CountOption[];
  selected: string[];
  colorFor?: (label: string) => string;
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
            <span className="bike-menu__name">
              {colorFor ? <span className="bike-menu__swatch" style={{ background: colorFor(option.label) }} /> : null}
              {option.label}
            </span>
            <span className="bike-menu__count">{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}
