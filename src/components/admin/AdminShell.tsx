"use client";

import Link from "next/link";
import { Figtree } from "next/font/google";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/worldcompassholiday/BrandLogo";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";
import "./ops/ops-shell.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

const bookingDeskSegments = new Set([
  "tours",
  "hotels",
  "cars",
  "bikes",
  "visa",
  "assist",
]);

function childIsActive(
  pathname: string,
  href: string,
  parentHref: string,
  bookingDesk?: string | null,
) {
  if (href === parentHref) {
    // Bookings overview is only current on the exact overview URL — detail pages
    // highlight the type desk via BookingDeskHint instead.
    if (parentHref === "/admin/bookings") {
      return pathname === href;
    }
    if (pathname === href) return true;
    if (!pathname.startsWith(`${href}/`)) return false;
    const segment = pathname.slice(href.length + 1).split("/")[0] ?? "";
    // Sibling section routes under the same parent (e.g. /tours/configuration)
    const sectionRoots = new Set([
      "configuration",
      "overview",
      "availability",
      "bookings",
      "locations",
      "rules",
      ...bookingDeskSegments,
    ]);
    return !sectionRoots.has(segment);
  }
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  // Detail pages mark the type desk via BookingDeskHint (enquiry or fleet)
  if (
    parentHref === "/admin/bookings" &&
    bookingDesk &&
    href === `/admin/bookings/${bookingDesk}`
  ) {
    const match = pathname.match(/^\/admin\/bookings\/([^/]+)$/);
    if (match && !bookingDeskSegments.has(match[1])) return true;
    if (pathname.startsWith("/admin/rentals/bookings/")) return true;
  }
  return false;
}

function NavBadge({ count }: { count?: number }) {
  if (!count || count < 1) return null;
  return (
    <span className="nav-badge" aria-label={`${count} need action`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function NavIcon({ href, label }: { href: string; label?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true as const,
  };

  if (href === "/admin" || label === "Overview") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }
  if (href === "/admin/bookings" || label === "Bookings") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (href === "/admin/tours") {
    return (
      <svg {...common}>
        <path d="M3 17 9 7l4 6 3-4 5 8H3Z" />
        <path d="M3 20h18" />
      </svg>
    );
  }
  if (href === "/admin/destinations") {
    return (
      <svg {...common}>
        <path d="M12 21s6.5-5.6 6.5-10.2a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21z" />
        <circle cx="12" cy="10.5" r="2.2" />
      </svg>
    );
  }
  if (href === "/admin/hotels") {
    return (
      <svg {...common}>
        <path d="M4 20.5V9.5L12 5l8 4.5v11" />
        <path d="M9 20.5v-6h6v6" />
      </svg>
    );
  }
  if (href.startsWith("/admin/rentals/cars") || label === "Car rental") {
    return (
      <svg {...common}>
        <path d="M4 16h16" />
        <path d="M6 16 7.6 10.5h8.8L18 16" />
        <circle cx="8" cy="18.5" r="1.6" />
        <circle cx="16" cy="18.5" r="1.6" />
      </svg>
    );
  }
  if (href.startsWith("/admin/rentals/bikes") || label === "Bike rental") {
    return (
      <svg {...common}>
        <circle cx="7" cy="16" r="3" />
        <circle cx="17" cy="16" r="3" />
        <path d="M7 16h4l2-6h4" />
      </svg>
    );
  }
  if (href === "/admin/customers") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="2.6" />
        <path d="M3.8 18.5c.8-2.6 2.8-4 5.2-4s4.4 1.4 5.2 4" />
      </svg>
    );
  }
  if (href === "/admin/staff" || href === "/admin/roles") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="8" r="3.5" />
      </svg>
    );
  }
  if (href.endsWith("/configuration") || label === "Configuration") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
    </svg>
  );
}

const OPERATE_HREFS = new Set([
  "/admin",
  "/admin/destinations",
  "/admin/tours",
  "/admin/hotels",
  "/admin/rentals/cars",
  "/admin/rentals/bikes",
  "/admin/buses",
  "/admin/bookings",
  "/admin/visa",
  "/admin/meet-and-assist",
]);

function pageTitle(pathname: string, items: NavItem[], bookingDesk?: string | null) {
  if (pathname === "/admin") return "Operations overview";
  const bookingDetail = pathname.match(/^\/admin\/bookings\/([^/]+)$/);
  if (bookingDetail && !bookingDeskSegments.has(bookingDetail[1])) {
    if (bookingDesk) {
      const desk = items
        .find((i) => i.href === "/admin/bookings")
        ?.children?.find((c) => c.href === `/admin/bookings/${bookingDesk}`);
      if (desk) return desk.label;
    }
    return "Booking desk";
  }
  for (const item of items) {
    if (item.children?.length) {
      const child = item.children.find((c) =>
        childIsActive(pathname, c.href, item.href, bookingDesk),
      );
      if (child) {
        if (child.href === "/admin/bookings" && pathname === "/admin/bookings") {
          return "Bookings overview";
        }
        return child.label;
      }
    }
    if (isActive(pathname, item.href)) return item.label;
  }
  return "Admin";
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`nav-chevron${open ? " open" : ""}`}
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function NavAccordion({
  item,
  pathname,
  bookingDesk,
}: {
  item: NavItem;
  pathname: string;
  bookingDesk?: string | null;
}) {
  const childActive = Boolean(
    item.children?.some((c) => childIsActive(pathname, c.href, item.href, bookingDesk)),
  );
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive, pathname]);

  return (
    <div className={`nav-section${open ? " open" : ""}${childActive ? " active" : ""}`}>
      <button
        type="button"
        className="nav-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <NavIcon href={item.href} label={item.label} />
        <span className="nav-section-label">{item.label}</span>
        <NavBadge count={item.badge} />
        <ChevronIcon open={open} />
      </button>
      <div className="subnav-panel" aria-hidden={!open}>
        <div className="subnav">
          {item.children?.map((child) => {
            const current = childIsActive(pathname, child.href, item.href, bookingDesk);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={current ? "active" : undefined}
                aria-current={current ? "page" : undefined}
                tabIndex={open ? undefined : -1}
              >
                <span>{child.label}</span>
                <NavBadge count={child.badge} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function pageSub(pathname: string) {
  if (pathname === "/admin") {
    return "Decide today from pipeline, load, and cash — not vanity counts.";
  }
  if (pathname.startsWith("/admin/tours/configuration")) {
    return "Categories, styles, facilities, FAQs, includes, and excludes.";
  }
  if (pathname.startsWith("/admin/hotels/configuration")) {
    return "Amenities, room features, room amenities, FAQs, and tax.";
  }
  if (pathname.startsWith("/admin/rentals/cars/configuration")) {
    return "Tags, types, fuel, transmission, includes, excludes, and features.";
  }
  if (pathname.startsWith("/admin/rentals/bikes/configuration")) {
    return "Tags, types, fuel, features, and required documents.";
  }
  if (pathname.startsWith("/admin/tours")) return "Packages, treks, and departures.";
  if (pathname === "/admin/bookings") {
    return "All desks — tours, stays, fleet, visa, assist.";
  }
  if (pathname.startsWith("/admin/bookings/tours")) return "Tour and trek enquiries.";
  if (pathname.startsWith("/admin/bookings/hotels")) return "Hotel stay requests.";
  if (pathname.startsWith("/admin/bookings/cars")) return "Car rental bookings.";
  if (pathname.startsWith("/admin/bookings/bikes")) return "Bike rental bookings.";
  if (pathname.startsWith("/admin/bookings/visa")) return "Visa applications.";
  if (pathname.startsWith("/admin/bookings/assist")) return "Airport meet and assist.";
  const bookingDetail = pathname.match(/^\/admin\/bookings\/([^/]+)$/);
  if (bookingDetail && !bookingDeskSegments.has(bookingDetail[1])) {
    return "Guest, trip, quote, owner, and status desk.";
  }
  if (pathname.startsWith("/admin/hotels")) return "Stay inventory and property details.";
  if (pathname.startsWith("/admin/destinations")) return "Places shown on the site.";
  return theme.brandName;
}

export function AdminShell({
  items,
  user,
  signOut,
  children,
}: {
  items: NavItem[];
  user: { name: string; roleName: string };
  signOut: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  const [hintDesk, setHintDesk] = useState<string | null>(null);
  const deskFromQuery = searchParams.get("desk");
  const bookingDesk =
    (deskFromQuery && bookingDeskSegments.has(deskFromQuery) ? deskFromQuery : null) ??
    hintDesk;
  const title = useMemo(
    () => pageTitle(pathname, items, bookingDesk),
    [pathname, items, bookingDesk],
  );

  const operate = items.filter((item) => OPERATE_HREFS.has(item.href));
  const system = items.filter((item) => !OPERATE_HREFS.has(item.href));

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const sync = () => {
      const value = document.documentElement.dataset.bookingDesk ?? null;
      setHintDesk(value && bookingDeskSegments.has(value) ? value : null);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-booking-desk"],
    });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
    };
  }, []);

  function renderNavItem(item: NavItem) {
    const active = isActive(pathname, item.href);

    if (item.children?.length) {
      return (
        <NavAccordion
          key={item.href}
          item={item}
          pathname={pathname}
          bookingDesk={bookingDesk}
        />
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={active ? "active" : undefined}
        aria-current={active ? "page" : undefined}
      >
        <NavIcon href={item.href} label={item.label} />
        <span className="nav-section-label">{item.label}</span>
        <NavBadge count={item.badge} />
      </Link>
    );
  }

  return (
    <div className={`ops-cc ${figtree.variable} ${figtree.className}`} style={{ height: "100dvh" }}>
      <div
        className={`scrim${navOpen ? " show" : ""}`}
        hidden={!navOpen}
        onClick={() => setNavOpen(false)}
      />
      <div className="app">
        <aside className={`sidebar${navOpen ? " open" : ""}`} aria-label="Primary">
          <div className="brand worldcompassholiday-page worldcompassholiday-header-scope">
            <BrandLogo />
            <span className="brand-ops">Operations</span>
          </div>

          <nav className="nav" aria-label="Main">
            {operate.length ? (
              <>
                <div className="nav-label">Operate</div>
                {operate.map(renderNavItem)}
              </>
            ) : null}
            {system.length ? (
              <>
                <div className="nav-label">System</div>
                {system.map(renderNavItem)}
              </>
            ) : null}
          </nav>

          <div className="sidebar-foot">
            <div className="role-card">
              <div className="avatar" aria-hidden>
                {initials(user.name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</strong>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                  {user.roleName}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>{signOut}</div>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="menu-btn"
                type="button"
                aria-label="Open navigation"
                aria-expanded={navOpen}
                onClick={() => setNavOpen((o) => !o)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <div>
                <h1>{title}</h1>
                <div className="sub">{pageSub(pathname)}</div>
              </div>
            </div>
            <div className="top-actions">
              <span className="live" title="Live admin">
                <i /> Live
              </span>
              <Link
                className="btn"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open public website"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                  style={{ marginRight: 6, verticalAlign: "-2px" }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                </svg>
                View website
              </Link>
              {pathname === "/admin" ? (
                <Link className="btn btn-primary" href="/admin/bookings">
                  + New booking
                </Link>
              ) : (
                <Link className="btn" href="/admin">
                  Overview
                </Link>
              )}
            </div>
          </header>

          <div className="content">{children}</div>
        </div>
      </div>
    </div>
  );
}
