"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CatalogSearch } from "@/components/pwa/CatalogSearch";
import { BrandMark } from "@/components/worldcompassholiday/BrandLogo";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12.1a4.05 4.05 0 1 0 0-8.1 4.05 4.05 0 0 0 0 8.1Zm-6.35 7.15c.45-2.85 2.85-4.75 6.35-4.75s5.9 1.9 6.35 4.75c.12.75-.48 1.4-1.24 1.4H6.89c-.76 0-1.36-.65-1.24-1.4Z"
      />
    </svg>
  );
}

export function MobileAppHeader() {
  const pathname = usePathname() || "/";
  const [openPath, setOpenPath] = useState(pathname);
  const [open, setOpen] = useState(false);
  if (pathname !== openPath) {
    setOpenPath(pathname);
    setOpen(false);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      inputRef.current?.blur();
    };
  }, [open]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const place = () => {
      const box = header.getBoundingClientRect();
      document.documentElement.style.setProperty("--app-header-h", `${Math.round(box.height)}px`);
      header.style.setProperty("--catalog-search-top", `${Math.round(box.bottom)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(header);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      document.documentElement.style.removeProperty("--app-header-h");
    };
  }, [open, pathname]);

  if (pathname.startsWith("/admin")) return null;

  const searching = open ? " is-searching" : "";

  function toggleSearch() {
    setOpen((current) => !current);
  }

  const search = (
    <CatalogSearch open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} inputRef={inputRef} />
  );

  return (
    <header ref={headerRef} className={`mobile-app-header app-chrome-mobile${searching}`}>
      <div className="mobile-app-header__inner">
        <Link href="/" className="mobile-app-header__brand" aria-label="World Compass Holidays">
          <BrandMark className="mobile-app-header__mark" />
          <span className="mobile-app-header__word">
            <strong>World Compass</strong>
            <small>Holidays</small>
          </span>
        </Link>

        <div className="mobile-app-header__actions">
          <button
            type="button"
            className="mobile-app-header__icon"
            aria-label={open ? "Close search" : "Search"}
            aria-expanded={open}
            onClick={toggleSearch}
          >
            {open ? <CloseIcon /> : <SearchIcon />}
          </button>
          <Link
            href="/account"
            className={`mobile-app-header__icon${pathname.startsWith("/account") ? " is-active" : ""}`}
            aria-label="Account"
            aria-current={pathname.startsWith("/account") ? "page" : undefined}
          >
            <AccountIcon />
          </Link>
        </div>
      </div>

      {open ? search : null}
    </header>
  );
}
