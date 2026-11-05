"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DateMenu, prettyStayDate } from "@/components/hotel-list/stay-list/HotelStayList";
import { SearchableSelect, type SelectOption } from "@/components/ui/SearchableSelect";
import { formatPhone } from "@/lib/auth/phone";
import { isBudgetValue, type BudgetBand, type RequestOption } from "@/lib/custom-request";

const glyphs: Record<string, string> = {
  any: "M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z",
  pin: "M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  "cal-in": "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9.5 14.5l2 2 3.5-3.5",
  "cal-out": "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 15h6M13 12.5l2.5 2.5-2.5 2.5",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  adults: "M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 21a7 7 0 0 1 14 0",
  children: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a2.5 2.5 0 1 0 0-5M17 14a5 5 0 0 1 4.5 5",
  wallet: "M4 7a2 2 0 0 1 2-2h12v3M4 7v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-1zM16 13.5h.01",
  note: "M5 4h14a1 1 0 0 1 1 1v14l-4-4H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 8h8M8 11h5",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z",
  luxury: "M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M9 3l3 6 3-6M12 21L8 9M12 21l4-12",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6",
  car: "M5 17h14l1-6-2-5H6l-2 5 1 6zM4 11h16M7 17v2M17 17v2M7 14h.01M17 14h.01",
  suv: "M3 16h18l-1-7-3-3H7L4 9l-1 7zM3 11h18M6 16v2M18 16v2M7 12h.01M17 12h.01",
  van: "M3 7h12v10H3zM15 10h4l3 3v4h-7zM6 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0",
  wheel: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 12h7M14 12h7M12 14v7",
  key: "M15 8a5 5 0 1 0-4.6 5L11 14h2v2h2v2h3v-3l-3.7-3.7M7.5 8h.01",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  bike: "M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 15l4-6h4l3 6M9 9L8 6H6M13 9l2-3h3",
  scooter: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h8M16 17l-2-11h-3M6 15l2-5h4",
  helmet: "M4 15a8 8 0 1 1 16 0v3H4v-3zM12 7v6h8",
  adventure: "M3 20l7-14 4 8 3-5 4 11H3z",
  licence: "M3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 16a3 3 0 0 1 6 0M14 9h4M14 13h4",
  bus: "M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 11h16M7 17v3M17 17v3M7.5 14h.01M16.5 14h.01",
  seat: "M7 4h6a2 2 0 0 1 2 2v7H9a2 2 0 0 1-2-2V4zM7 13l-1 6M15 13l1 6M5 19h12",
  bed: "M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M3 14h18M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2",
  sunrise: "M17 18a5 5 0 0 0-10 0M12 7V3M4.2 10.2l1.4 1.4M19.8 10.2l-1.4 1.4M2 18h2M20 18h2M2 22h20",
  sun: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z",
};

const optionIcons: Record<string, string> = {
  any: "any",
  either: "any",
  hatchback: "car",
  sedan: "car",
  suv: "suv",
  muv: "van",
  luxury: "luxury",
  self: "key",
  driver: "wheel",
  manual: "gear",
  automatic: "gear",
  scooter: "scooter",
  commuter: "bike",
  cruiser: "bike",
  adventure: "adventure",
  touring: "route",
  seater: "seat",
  volvo: "bus",
  sleeper: "bed",
  morning: "sunrise",
  afternoon: "sun",
  night: "moon",
};

export function Glyph({ name }: { name: string }) {
  const path = glyphs[name];
  return path ? (
    <svg className="hg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  ) : null;
}

export function optionIcon(value: string) {
  return optionIcons[value] ?? "any";
}

export function todayIso() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function nextDayIso(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function prettyDate(iso: string) {
  if (!iso) return "Not selected";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T00:00:00`));
}

export function clampCount(value: string | undefined, fallback: string, min: number, max: number) {
  const parsed = Number(value && /^\d+$/.test(value) ? value : fallback);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : min;
}

export function plural(value: number, unit: string) {
  return `${value} ${value === 1 ? unit : `${unit}s`}`;
}

export function focusGuideField(order: readonly string[], fields?: Record<string, string>) {
  const key = order.find((name) => fields?.[name]);
  const target = (key ? document.getElementById(key === "phone" ? "phone-entry-field" : `${key}-field`) : null) ?? document.querySelector(".hotel-request-banner-alert");
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const input = target.querySelector("input:not([type=hidden]), textarea, button");
  if (input instanceof HTMLElement) input.focus({ preventScroll: true });
}

export function timeOptions(extra?: string): SelectOption[] {
  const options: SelectOption[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    options.push({ value, label: timeLabel(value) });
  }
  if (extra && !options.some((option) => option.value === extra)) {
    options.push({ value: extra, label: timeLabel(extra) });
    options.sort((a, b) => a.value.localeCompare(b.value));
  }
  return options;
}

export function timeLabel(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return value;
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? "AM" : "PM"}`;
}

export function resolveBudget(bands: readonly BudgetBand[], choice: string, other: string) {
  const custom = choice === "other";
  const value = custom ? other.replace(/\D/g, "") : choice;
  const error = custom && (!value || !isBudgetValue(bands, value))
    ? value ? "Enter an amount from ₹100 to ₹5,00,000." : "Enter a budget or choose a range."
    : undefined;
  return { value, error };
}

export function budgetFromSaved(bands: readonly BudgetBand[], saved: string) {
  if (!saved) return { choice: "", other: "" };
  if (bands.some((band) => band.value === saved)) return { choice: saved, other: "" };
  if (/^\d+$/.test(saved)) return { choice: "other", other: saved };
  return { choice: "", other: "" };
}

export function budgetSummary(bands: readonly BudgetBand[], value: string, unit: string) {
  if (!value) return "Flexible budget";
  return bands.find((band) => band.value === value)?.label ?? `₹${Number(value).toLocaleString("en-IN")} ${unit}`;
}

export function FieldMessage({ id, message }: { id?: string; message?: string }) {
  return message ? <p id={id} className="hotel-request-error" role="alert">{message}</p> : null;
}

export function GuideProgress({ label, labels, step, onSelect }: { label: string; labels: readonly string[]; step: number; onSelect: (step: number) => void }) {
  return (
    <nav className="hotel-guide-progress" aria-label={`${label} request progress`}>
      <div className="hotel-guide-progress-meta"><span>STEP {step + 1} OF {labels.length}</span><strong>{labels[step]}</strong></div>
      <div className="hotel-guide-progress-track" role="group" aria-label="Completed and current steps">
        {labels.map((item, index) => (
          <button key={item} type="button" className={index === step ? "is-current" : index < step ? "is-complete" : ""} aria-current={index === step ? "step" : undefined} aria-label={`Step ${index + 1}: ${item}`} disabled={index > step} onClick={() => onSelect(index)}>
            <span />
          </button>
        ))}
      </div>
    </nav>
  );
}

export function StepTitle({ number, id, title, text }: { number: string; id: string; title: string; text: string }) {
  return (
    <div className="hotel-guide-step-title">
      <span>{number}</span>
      <div><h2 id={id}>{title}</h2><p>{text}</p></div>
    </div>
  );
}

export function GuideActions({
  step,
  last,
  formId,
  busy,
  submitLabel,
  busyLabel,
  onBack,
  onContinue,
  children,
}: {
  step: number;
  last: number;
  formId: string;
  busy: boolean;
  submitLabel: string;
  busyLabel: string;
  onBack: () => void;
  onContinue: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="hotel-guide-actions">
      {step > 0 ? <button type="button" className="hotel-guide-back" onClick={onBack}>Back</button> : <span className="hotel-guide-secure"><span aria-hidden="true">✦</span> Free, no-obligation request</span>}
      {step < last ? (
        <div className="hotel-guide-action-right">
          <button type="button" className="hotel-guide-primary" onClick={onContinue}>Continue <span aria-hidden="true">→</span></button>
        </div>
      ) : (
        <div className="hotel-guide-submit-group">
          <button type="submit" form={formId} className="hotel-guide-primary" disabled={busy}>{busy ? busyLabel : submitLabel}</button>
          {children}
        </div>
      )}
    </div>
  );
}

export function GuideCounter({ id, label, icon, hint, value, min, max, error, onChange }: { id: string; label: string; icon: string; hint: string; value: number; min: number; max: number; error?: string; onChange: (value: number) => void }) {
  return (
    <div id={`${id}-field`} className={`hotel-guide-counter${error ? " is-invalid" : ""}`}>
      <div className="hotel-guide-counter-label"><span><strong className="has-icon"><Glyph name={icon} />{label}</strong><small>{hint}</small></span></div>
      <div className="hotel-guide-counter-control" role="group" aria-label={label}>
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
      <FieldMessage message={error} />
    </div>
  );
}

export function GuideTextField({ name, label, icon, placeholder, value, onChange, error, type = "text", autoComplete, wide = false }: { name: string; label: string; icon?: string; placeholder?: string; value: string; onChange: (value: string) => void; error?: string; type?: string; autoComplete?: string; wide?: boolean }) {
  const id = `guide-${name}`;
  return (
    <div className={`hotel-guide-field${wide ? " hotel-guide-field-wide" : ""}`} id={`${name}-field`}>
      <label htmlFor={id} className={icon ? "has-icon" : undefined}>{icon ? <Glyph name={icon} /> : null}{label}</label>
      <div className={`hotel-request-control mt-5${error ? " is-invalid" : ""}`}>
        <input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
      </div>
      <FieldMessage id={`${id}-error`} message={error} />
    </div>
  );
}

export function GuideSelectField({ name, label, icon, value, options, emptyLabel, searchPlaceholder, error, onChange }: { name: string; label: string; icon?: string; value: string; options: readonly SelectOption[]; emptyLabel: string; searchPlaceholder: string; error?: string; onChange: (value: string) => void }) {
  const id = `guide-${name}`;
  return (
    <div className="hotel-guide-field" id={`${name}-field`}>
      <label htmlFor={id} className={icon ? "has-icon" : undefined}>{icon ? <Glyph name={icon} /> : null}{label}</label>
      <SearchableSelect
        id={id}
        value={value}
        options={options}
        emptyLabel={emptyLabel}
        placeholder={emptyLabel}
        searchPlaceholder={searchPlaceholder}
        ariaLabel={label}
        invalid={Boolean(error)}
        describedBy={error ? `${id}-error` : undefined}
        className="hotel-guide-select-trigger"
        menuClassName="hotel-guide-select-menu"
        onChange={(next) => onChange(next)}
      />
      <FieldMessage id={`${id}-error`} message={error} />
    </div>
  );
}

export function GuideCityField({ name, label, icon = "pin", value, cities, emptyLabel, customLabel, customPlaceholder, error, onChange }: { name: string; label: string; icon?: string; value: string; cities: readonly string[]; emptyLabel: string; customLabel: string; customPlaceholder: string; error?: string; onChange: (value: string) => void }) {
  const [custom, setCustom] = useState(Boolean(value) && !cities.includes(value));
  const id = `guide-${name}`;
  const options = useMemo<SelectOption[]>(() => [
    ...cities.map((city) => ({ value: city, label: city })),
    { value: "__custom__", label: customLabel, action: true },
  ], [cities, customLabel]);
  return (
    <div className="hotel-guide-field hotel-guide-destination-field" id={`${name}-field`}>
      <label htmlFor={id} className="has-icon"><Glyph name={icon} />{label}</label>
      {custom ? (
        <div className={`hotel-request-control hotel-guide-custom-destination-input${error ? " is-invalid" : ""}`}>
          <input id={id} type="text" autoFocus placeholder={customPlaceholder} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
          <button type="button" className="hotel-guide-custom-destination" onClick={() => { setCustom(false); onChange(""); }}>Choose from list</button>
        </div>
      ) : (
        <SearchableSelect
          id={id}
          value={value}
          options={options}
          emptyLabel={emptyLabel}
          placeholder={emptyLabel}
          searchPlaceholder="Search city, region or country"
          ariaLabel={label}
          invalid={Boolean(error)}
          describedBy={error ? `${id}-error` : undefined}
          className="hotel-guide-select-trigger"
          menuClassName="hotel-guide-select-menu"
          onChange={(next, typed) => {
            if (next === "__custom__") {
              setCustom(true);
              onChange(typed || "");
            } else {
              onChange(next);
            }
          }}
        />
      )}
      <FieldMessage id={`${id}-error`} message={error} />
    </div>
  );
}

export function GuideDateField({ name, label, icon = "calendar", value, min, error, onPick }: { name: string; label: string; icon?: string; value: string; min: string; error?: string; onPick: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 292;
      const height = 350;
      const flip = rect.bottom + 8 + height > window.innerHeight && rect.top - height - 8 > 0;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setPosition(flip ? { bottom: window.innerHeight - rect.top + 8, left } : { top: rect.bottom + 8, left });
    };
    place();
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-picker]")) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div id={`${name}-field`} className="hotel-guide-field hotel-guide-date-field">
      <label htmlFor={`guide-${name}`} className="has-icon"><Glyph name={icon} />{label}</label>
      <div ref={ref} className={`stay-list hr-stay-date mt-5${error ? " is-invalid" : ""}`} data-picker>
        <div className="sl-field">
          <button id={`guide-${name}`} className="sl-who" type="button" aria-haspopup="dialog" aria-expanded={open} aria-describedby={error ? `guide-${name}-error` : undefined} onClick={() => setOpen((current) => !current)}>
            <strong>{value ? prettyStayDate(value) : "Select date"}</strong>
          </button>
          {open && position ? createPortal(
            <div className="stay-list hr-cal-pop" style={{ top: position.top, bottom: position.bottom, left: position.left }} data-picker>
              <DateMenu label={label} value={value || min} min={min} onClose={() => setOpen(false)} onPick={(iso) => { onPick(iso); setOpen(false); }} />
            </div>,
            document.body,
          ) : null}
        </div>
      </div>
      <FieldMessage id={`guide-${name}-error`} message={error} />
    </div>
  );
}

export function GuideChips({ id, label, labelIcon, options, value, onChange, error, withIcons = false }: { id: string; label: string; labelIcon?: string; options: readonly RequestOption[]; value: string; onChange: (value: string) => void; error?: string; withIcons?: boolean }) {
  return (
    <fieldset id={`${id}-field`} className="hotel-guide-choice-group tour-guide-choice-group is-chips">
      <legend>{labelIcon ? <Glyph name={labelIcon} /> : null}{label}</legend>
      <div className="hotel-guide-chip-grid">
        {options.map((option) => (
          <button key={option.value} type="button" className={value === option.value ? "is-selected" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            {withIcons ? <Glyph name={optionIcon(option.value)} /> : null}{option.label}
          </button>
        ))}
      </div>
      <FieldMessage message={error} />
    </fieldset>
  );
}

export type GuideCardItem = { value: string; title: string; description: string; icon: string };

export function GuideCards({ id, label, items, value, onChange, error }: { id: string; label: string; items: readonly GuideCardItem[]; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <fieldset id={`${id}-field`} className="hotel-guide-choice-group tour-guide-choice-group">
      <legend>{label}</legend>
      <div className="hotel-guide-style-grid tour-guide-style-grid">
        {items.map((item) => {
          const selected = value === item.value;
          return (
            <button key={item.value} type="button" className={`hotel-guide-style-card${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={() => onChange(item.value)}>
              <span className="hotel-guide-radio" aria-hidden="true">{selected ? "✓" : ""}</span>
              <span className="hotel-guide-style-icon" aria-hidden="true"><Glyph name={item.icon} /></span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </button>
          );
        })}
      </div>
      <FieldMessage message={error} />
    </fieldset>
  );
}

export function GuideBudget({ label, unit, bands, choice, other, error, onChoice, onOther }: { label: string; unit: string; bands: readonly BudgetBand[]; choice: string; other: string; error?: string; onChoice: (value: string) => void; onOther: (value: string) => void }) {
  return (
    <div className="tour-guide-pref-card" id="budget-field">
      <label htmlFor="guide-budget" className="tour-guide-pref-title"><Glyph name="wallet" />{label} <span>(INR)</span></label>
      {choice === "other" ? (
        <div className={`hotel-request-control hotel-guide-custom-destination-input${error ? " is-invalid" : ""}`}>
          <input id="guide-budget" inputMode="numeric" autoComplete="off" autoFocus aria-label={label} placeholder={`Enter amount in rupees ${unit}`} value={other} onChange={(event) => onOther(event.target.value.replace(/\D/g, ""))} aria-invalid={error ? true : undefined} aria-describedby={error ? "guide-budget-error" : undefined} />
          <button type="button" className="hotel-guide-custom-destination" onClick={() => { onChoice(""); onOther(""); }}>Choose a range</button>
        </div>
      ) : (
        <SearchableSelect
          id="guide-budget"
          value={choice}
          options={[
            ...bands.map(({ value, label: bandLabel }) => ({ value, label: bandLabel })),
            { value: "other", label: "+ Enter a custom amount", action: true },
          ]}
          emptyLabel="Flexible budget"
          ariaLabel={label}
          searchPlaceholder="Search budget ranges"
          className="hotel-guide-select-trigger"
          menuClassName="hotel-guide-select-menu"
          onChange={(value) => onChoice(value)}
        />
      )}
      <FieldMessage id="guide-budget-error" message={error} />
    </div>
  );
}

export function GuideNote({ label, placeholder, value, onChange, max = 2000 }: { label: string; placeholder: string; value: string; onChange: (value: string) => void; max?: number }) {
  return (
    <div className="tour-guide-note" id="message-field">
      <label htmlFor="guide-message" className="tour-guide-pref-title"><Glyph name="note" />{label} <span>(optional)</span></label>
      <textarea id="guide-message" rows={3} maxLength={max} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-describedby="guide-message-count" />
      <span className="tour-guide-character-count" id="guide-message-count">{value.length}/{max}</span>
    </div>
  );
}

export function ReviewSection({ title, icon, onEdit, children }: { title: string; icon: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="hotel-guide-review-section">
      <div className="hotel-guide-review-heading"><h3 className="has-icon"><Glyph name={icon} />{title}</h3><button type="button" onClick={onEdit}>Edit</button></div>
      <dl>{children}</dl>
    </section>
  );
}

export function ReviewLine({ label, icon, value }: { label: string; icon: string; value: string }) {
  return <div className="hotel-guide-review-line"><dt><Glyph name={icon} />{label}</dt><dd>{value}</dd></div>;
}

export function GuideContact({ customer, phone, error, onPhone }: { customer: { name: string; phone: string } | null; phone: string; error?: string; onPhone: (value: string) => void }) {
  if (!customer) return <p className="hotel-guide-login-note">You’ll verify your mobile number before we send the request.</p>;
  return (
    <div className="hotel-guide-contact-summary">
      <span>Submitting as <strong>{customer.name}</strong></span>
      {customer.phone ? <span>{formatPhone(customer.phone) || customer.phone}</span> : <GuideTextField name="phone-entry" label="Phone number" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={phone} onChange={onPhone} error={error} />}
    </div>
  );
}
