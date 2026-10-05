"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  options: readonly SelectOption[];
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Show a red border when the field failed validation. */
  invalid?: boolean;
  className?: string;
  wrapperClassName?: string;
  /** Accessible name when the visible text is only the current choice. */
  ariaLabel?: string;
  /** Selectable blank choice, such as "None" or "Any service". */
  emptyLabel?: string;
};

type MenuBox = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
};

function measure(trigger: HTMLElement): MenuBox {
  const rect = trigger.getBoundingClientRect();
  const gap = 4;
  const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
  const spaceAbove = rect.top - gap - 8;
  const placement =
    spaceBelow < 220 && spaceAbove > spaceBelow ? "top" : "bottom";
  const available = placement === "bottom" ? spaceBelow : spaceAbove;
  const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 16);
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);

  return {
    top: placement === "bottom" ? rect.bottom + gap : rect.top - gap,
    left,
    width,
    maxHeight: Math.max(160, Math.min(320, available)),
    placement,
  };
}

function matches(query: string, label: string, value: string) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return (
    label.toLowerCase().includes(needle) ||
    value.toLowerCase().includes(needle)
  );
}

export function SearchableSelect({
  options,
  name,
  id,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Choose",
  searchPlaceholder = "Search",
  required = false,
  disabled = false,
  invalid = false,
  className,
  wrapperClassName,
  ariaLabel,
  emptyLabel,
}: SearchableSelectProps) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [box, setBox] = useState<MenuBox | null>(null);
  const [mounted, setMounted] = useState(false);

  const items: SelectOption[] = [];
  if (emptyLabel && matches(query, emptyLabel, "")) {
    items.push({ value: "", label: emptyLabel });
  }
  for (const option of options) {
    if (matches(query, option.label, option.value)) items.push(option);
  }

  const safeIndex =
    items.length === 0 ? -1 : Math.min(activeIndex, items.length - 1);
  const selectedOption = options.find((option) => option.value === selected);
  const blank = selected === "";
  const shown = blank ? (emptyLabel ?? placeholder) : (selectedOption?.label ?? selected);
  const muted = blank && !emptyLabel;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function update() {
      if (!triggerRef.current) return;
      setBox(measure(triggerRef.current));
    }

    update();
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-field-help], [data-field-help-panel]")
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector("[data-field-help-panel]")) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || safeIndex < 0) return;
    document
      .getElementById(`${listId}-option-${safeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, safeIndex, listId, query]);

  function commit(next: string) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function openMenu() {
    if (disabled) return;
    const full: SelectOption[] = [];
    if (emptyLabel) full.push({ value: "", label: emptyLabel });
    full.push(...options);
    const current = full.findIndex((option) => option.value === selected);
    setQuery("");
    setActiveIndex(current >= 0 ? current : 0);
    if (triggerRef.current) setBox(measure(triggerRef.current));
    setOpen(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      if (open) setOpen(false);
      else openMenu();
    }
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[safeIndex];
      if (item) commit(item.value);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const menu =
    mounted && open && box
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[80] overflow-hidden rounded-lg border border-line bg-white shadow-lg"
            style={{
              top: box.top,
              left: box.left,
              width: box.width,
              maxHeight: box.maxHeight,
              transform: box.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            <div className="border-b border-line px-2 py-1.5">
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                aria-label={searchPlaceholder}
                aria-controls={listId}
                aria-activedescendant={
                  safeIndex >= 0 ? `${listId}-option-${safeIndex}` : undefined
                }
                className="!h-8 !text-sm"
              />
            </div>
            <ul
              id={listId}
              role="listbox"
              className="overflow-y-auto overscroll-contain py-1"
              style={{ maxHeight: box.maxHeight - 44 }}
            >
              {items.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted">No matches</li>
              ) : (
                items.map((option, index) => {
                  const active = index === safeIndex;
                  const chosen = option.value === selected;
                  return (
                    <li key={`${option.value}-${option.label}`} role="presentation">
                      <button
                        type="button"
                        id={`${listId}-option-${index}`}
                        role="option"
                        aria-selected={chosen}
                        data-index={index}
                        className={[
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                          active ? "bg-brand-soft" : "hover:bg-surface",
                          chosen ? "font-medium text-navy" : "text-foreground",
                        ].join(" ")}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => commit(option.value)}
                      >
                        <span className="min-w-0 truncate">{option.label}</span>
                        {chosen ? (
                          <span className="shrink-0 text-brand" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={["relative min-w-0", wrapperClassName].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={[
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          invalid
            ? "border-red-500 !outline-none focus:!outline-none focus-visible:!outline-none focus:!shadow-[0_0_0_2px_#ef4444] focus-visible:!shadow-[0_0_0_2px_#ef4444]"
            : open
              ? "border-brand focus-visible:outline-brand"
              : "border-line focus-visible:outline-brand",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={["min-w-0 flex-1 truncate", muted ? "text-muted" : ""].join(" ")}>
          {shown}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={["h-4 w-4 shrink-0 text-muted", open ? "rotate-180" : ""].join(" ")}
          aria-hidden
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {name ? (
        <input
          tabIndex={-1}
          name={name}
          value={selected}
          required={required}
          autoComplete="off"
          aria-hidden="true"
          onChange={() => {}}
          className="pointer-events-none !absolute !inset-x-0 !bottom-0 !h-px !w-full !border-0 !p-0 opacity-0"
        />
      ) : null}
      {menu}
    </div>
  );
}
