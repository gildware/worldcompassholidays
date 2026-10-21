"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COUNTRIES, countryByIso, flagEmoji } from "@/lib/auth/countries";

export function CountryCodeSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
}) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [box, setBox] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    placement: "bottom" | "top";
  } | null>(null);

  const selected = countryByIso(value) ?? COUNTRIES.find((country) => country.iso === "IN") ?? COUNTRIES[0];
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^\+/, "");
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter((country) => {
      return (
        country.name.toLowerCase().includes(needle) ||
        country.iso.toLowerCase().includes(needle) ||
        country.dial.startsWith(needle)
      );
    });
  }, [query]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function place() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 16);
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const placement = spaceBelow < 220 && spaceAbove > spaceBelow ? "top" : "bottom";
      const available = placement === "bottom" ? spaceBelow : spaceAbove;
      setBox({
        top: placement === "bottom" ? rect.bottom + 4 : rect.top - 4,
        left,
        width,
        maxHeight: Math.max(160, Math.min(360, available)),
        placement,
      });
    }

    place();
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open, activeIndex, listId]);

  function choose(iso: string) {
    onChange(iso);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  const menu =
    mounted && open && box
      ? createPortal(
          <div
            ref={menuRef}
            className="country-code-menu"
            style={{
              top: box.top,
              left: box.left,
              width: box.width,
              maxHeight: box.maxHeight,
              transform: box.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            <div className="country-code-menu__search">
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.min(index + 1, items.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.max(index - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    const item = items[activeIndex];
                    if (item) choose(item.iso);
                  }
                }}
                placeholder="Search country or code"
                aria-label="Search country or code"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <ul id={listId} role="listbox" aria-label="Country codes">
              {items.length === 0 ? (
                <li className="country-code-menu__empty">No matching country</li>
              ) : (
                items.map((country, index) => {
                  const chosen = country.iso === selected.iso;
                  return (
                    <li key={country.iso} role="presentation">
                      <button
                        type="button"
                        id={`${listId}-option-${index}`}
                        role="option"
                        aria-selected={chosen}
                        className={index === activeIndex ? "is-active" : undefined}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => choose(country.iso)}
                      >
                        <span className="country-code-menu__flag" aria-hidden>
                          {flagEmoji(country.iso)}
                        </span>
                        <span className="country-code-menu__name">{country.name}</span>
                        <span className="country-code-menu__dial">+{country.dial}</span>
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
    <>
      <button
        ref={triggerRef}
        type="button"
        className="country-code-trigger"
        disabled={disabled}
        aria-label={`${selected.name}, +${selected.dial}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          const current = COUNTRIES.findIndex((country) => country.iso === selected.iso);
          setQuery("");
          setActiveIndex(current >= 0 ? current : 0);
          setOpen(true);
        }}
      >
        <span className="country-code-trigger__flag" aria-hidden>
          {flagEmoji(selected.iso)}
        </span>
        <span>+{selected.dial}</span>
        <svg viewBox="0 0 12 8" aria-hidden className="country-code-trigger__chevron">
          <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {menu}
    </>
  );
}
