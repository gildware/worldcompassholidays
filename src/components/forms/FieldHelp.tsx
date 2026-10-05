"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { guideFor } from "@/lib/field-help";

const OPEN_EVENT = "field-help-open";

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 7.2v3.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="4.85" r="0.7" fill="currentColor" />
    </svg>
  );
}

export function FieldHelp({
  label,
  help,
}: {
  label: string;
  /** Catalog key when the visible label is shared by different fields. */
  help?: string;
}) {
  const id = useId();
  const guide = guideFor(help ?? label, label);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  function place() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    const below = rect.bottom + 8;
    const estimated = 220;
    const openAbove = below + estimated > window.innerHeight && rect.top > estimated;
    setPosition({
      top: openAbove ? Math.max(8, rect.top - estimated - 8) : below,
      left,
    });
  }

  useEffect(() => {
    function onOther(event: Event) {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false);
    }
    window.addEventListener(OPEN_EVENT, onOther);
    return () => window.removeEventListener(OPEN_EVENT, onOther);
  }, [id]);

  useEffect(() => {
    if (!open) return;
    place();

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }

    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const next = !open;
    if (next) {
      // Notify siblings outside setState. React replays updater functions
      // during render, so dispatching from one would setState other FieldHelps
      // while this instance is still rendering.
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
      place();
    }
    setOpen(next);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`About ${label}`}
        data-field-help=""
        onMouseDown={(event) => event.stopPropagation()}
        onClick={toggle}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted hover:bg-brand-soft hover:text-brand"
      >
        <InfoIcon />
      </button>
      {mounted && open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={`${label} help`}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: Math.min(320, window.innerWidth - 16),
                zIndex: 100,
              }}
              data-field-help=""
              data-field-help-panel=""
              className="overflow-hidden rounded-xl border border-line bg-white text-left shadow-2xl"
            >
              <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
                <span className="inline-flex h-5 w-5 items-center justify-center text-brand">
                  <InfoIcon />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                  {label}
                </p>
                <button
                  type="button"
                  aria-label="Close field help"
                  onClick={() => {
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-white hover:text-navy"
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-3 px-3 py-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-brand uppercase">
                    What
                  </p>
                  <p className="mt-1 text-sm leading-5 font-normal text-navy">
                    {guide.what}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-brand uppercase">
                    Why fill it
                  </p>
                  <p className="mt-1 text-sm leading-5 font-normal text-muted">
                    {guide.why}
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function HelpText({
  label,
  help,
  className,
}: {
  label: string;
  help?: string;
  className?: string;
}) {
  return (
    <span className={className ?? "inline-flex items-center gap-1.5"}>
      <span>{label}</span>
      <FieldHelp label={label} help={help} />
    </span>
  );
}
