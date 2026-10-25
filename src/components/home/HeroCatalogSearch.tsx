"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogSearch } from "@/components/pwa/CatalogSearch";
import "@/styles/hero-catalog-search.css";

export function HeroCatalogSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={rootRef} className={`masthead-search${open ? " is-open" : ""}`}>
      <CatalogSearch open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} inputRef={inputRef} />
    </div>
  );
}
