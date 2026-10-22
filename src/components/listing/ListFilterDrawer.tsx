"use client";

import { useEffect, type ReactNode } from "react";

export function FilterIconButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`list-filter-toggle${active ? " is-on" : ""}`}
      aria-label="Filters"
      aria-expanded={false}
      onClick={onClick}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M2.4 3.2h11.2L9.4 8.1v3.4l-2.8 1.3V8.1L2.4 3.2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function ListFilterDrawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="list-filter-drawer">
      <button type="button" className="list-filter-drawer__backdrop" aria-label="Close filters" onClick={onClose} />
      <aside className="list-filter-drawer__panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="list-filter-drawer__head">
          <h2>{title}</h2>
          <button type="button" aria-label="Close filters" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="list-filter-sheet">{children}</div>
        <button type="button" className="list-filter-drawer__apply" onClick={onClose}>
          Show results
        </button>
      </aside>
    </div>
  );
}
