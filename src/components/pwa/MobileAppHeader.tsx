"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function pageLabel(pathname: string) {
  if (pathname.startsWith("/tours")) return "Tours";
  if (pathname.startsWith("/hotels")) return "Hotels";
  if (pathname.startsWith("/cars") || pathname.startsWith("/car-rental")) return "Cars";
  if (pathname.startsWith("/bike")) return "Bikes";
  if (pathname.startsWith("/destinations")) return "Destinations";
  if (pathname.startsWith("/account")) return "Account";
  if (pathname.startsWith("/visa")) return "Visa";
  if (pathname.startsWith("/meet")) return "Meet & assist";
  if (pathname.startsWith("/contact")) return "Contact";
  return null;
}

export function MobileAppHeader() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return null;

  const isHome = pathname === "/";
  const label = pageLabel(pathname);
  /* Tours / hotels own their sticky search chrome — skip the global bar */
  if (pathname.startsWith("/tours") || pathname.startsWith("/hotels")) return null;

  const isListing = Boolean(label) && !isHome;

  if (isListing) {
    return (
      <header className="mobile-app-header mobile-app-header--listing app-chrome-mobile">
        <div className="mobile-app-header__inner">
          <Link href="/" className="mobile-app-header__back" aria-label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="mobile-app-header__listing-title">
            <p>{label}</p>
            <strong>World Compass</strong>
          </div>
          <Link href="/account" className="mobile-app-header__icon" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="9" r="3.5" />
              <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
            </svg>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="mobile-app-header app-chrome-mobile">
      <div className="mobile-app-header__inner">
        <Link href="/" className="mobile-app-header__brand" aria-label="World Compass Holidays">
          <span className="mobile-app-header__mark" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.6" />
              <path d="M14.5 9.5L11 13l-3.5 1.5L11 11l3.5-1.5z" fill="white" />
            </svg>
          </span>
          <span>
            <strong>World Compass</strong>
            <small>Holidays</small>
          </span>
        </Link>

        <div className="mobile-app-header__actions">
          <Link
            href="/destinations"
            className="mobile-app-header__icon"
            aria-label="Search destinations"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </Link>
          <Link href="/account" className="mobile-app-header__icon" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="9" r="3.5" />
              <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
            </svg>
          </Link>
        </div>
      </div>

      {isHome ? (
        <Link href="/destinations" className="mobile-app-header__search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" />
          </svg>
          Where do you want to go?
        </Link>
      ) : null}
    </header>
  );
}
