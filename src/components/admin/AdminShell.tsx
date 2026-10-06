"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function childIsActive(pathname: string, href: string, parentHref: string) {
  if (href === parentHref) return pathname === parentHref;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pillClass(active: boolean) {
  return [
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-brand bg-brand font-medium text-white"
      : "border-line bg-white text-navy/80 hover:border-navy/30 hover:text-navy",
  ].join(" ");
}

function NavMenu({
  item,
  pathname,
  open,
  onToggle,
}: {
  item: NavItem;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const active = isActive(pathname, item.href);

  return (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls={open ? "admin-submenu" : undefined}
      aria-current={active ? "page" : undefined}
      className={pillClass(active)}
      onClick={onToggle}
    >
      <NavIcon href={item.href} label={item.label} />
      {item.label}
      <svg
        viewBox="0 0 20 20"
        className={["h-3.5 w-3.5 shrink-0 transition-transform", open ? "rotate-180" : ""].join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function NavIcon({ href, label }: { href: string; label?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-4 w-4 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (href === "/admin" || label === "Overview") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
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
  if (href === "/admin/tours") {
    return (
      <svg {...common}>
        <path d="M3 19.5h18" />
        <path d="M4 19.5 9.2 8.5 13 14l2.4-3.6L20 19.5" />
      </svg>
    );
  }
  if (href === "/admin/configuration") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
        <circle cx="8" cy="7" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="10" cy="17" r="2" />
      </svg>
    );
  }
  if (href === "/admin/hotels") {
    return (
      <svg {...common}>
        <path d="M4 20.5V9.5L12 5l8 4.5v11" />
        <path d="M9 20.5v-6h6v6" />
        <path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" />
      </svg>
    );
  }
  if (href === "/admin/rentals/fleet" || href === "/admin/rentals") {
    return (
      <svg {...common}>
        <path d="M4 16h16" />
        <path d="M6 16 7.6 10.5h8.8L18 16" />
        <path d="M5 16v2.5h2.2M16.8 18.5H19V16" />
        <circle cx="8" cy="18.5" r="1.6" />
        <circle cx="16" cy="18.5" r="1.6" />
      </svg>
    );
  }
  if (href === "/admin/rentals/payments") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }
  if (href === "/admin/rentals/reports") {
    return (
      <svg {...common}>
        <path d="M4 19.5h16" />
        <path d="M7 16.5V11M12 16.5V7.5M17 16.5V9.5" />
      </svg>
    );
  }
  if (href === "/admin/rentals/availability") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16M8 3.5v3M16 3.5v3M8 14h.01M12 14h.01M16 14h.01" />
      </svg>
    );
  }
  if (href === "/admin/rentals/locations") {
    return (
      <svg {...common}>
        <path d="M12 21s6.5-5.6 6.5-10.2a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21z" />
        <circle cx="12" cy="10.5" r="2.2" />
      </svg>
    );
  }
  if (href === "/admin/rentals/configuration") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
        <circle cx="8" cy="7" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="10" cy="17" r="2" />
      </svg>
    );
  }
  if (href === "/admin/rentals/policies") {
    return (
      <svg {...common}>
        <path d="M8 3.5h6l4 4V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M14 3.5V8h4.2" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  if (href === "/admin/buses") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="13" rx="2" />
        <path d="M4 10h16M8 4v6M16 4v6" />
        <circle cx="8" cy="19.2" r="1.6" />
        <circle cx="16" cy="19.2" r="1.6" />
        <path d="M6.4 17.6h3.2M14.4 17.6h3.2" />
      </svg>
    );
  }
  if (href === "/admin/bookings" || href === "/admin/rentals/bookings") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16M8 3.5v3M16 3.5v3" />
      </svg>
    );
  }
  if (href === "/admin/customers" || href === "/admin/rentals/customers") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="2.6" />
        <path d="M3.8 18.5c.8-2.6 2.8-4 5.2-4s4.4 1.4 5.2 4" />
        <circle cx="16.5" cy="8.5" r="2" />
        <path d="M16 14.6c1.6.3 2.9 1.3 3.7 3.4" />
      </svg>
    );
  }
  if (href === "/admin/staff") {
    return (
      <svg {...common}>
        <rect x="3.5" y="7" width="17" height="12" rx="2" />
        <path d="M8 7V5.8A2.8 2.8 0 0 1 10.8 3h2.4A2.8 2.8 0 0 1 16 5.8V7M3.5 12.5h17" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3.5 19 6.5v5.2c0 4-2.8 6.8-7 8.3-4.2-1.5-7-4.3-7-8.3V6.5L12 3.5z" />
    </svg>
  );
}

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuHref, setSubmenuHref] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lockMainScroll =
    pathname === "/admin/tours/new" ||
    /^\/admin\/tours\/[^/]+$/.test(pathname) ||
    pathname === "/admin/rentals/fleet/new" ||
    /^\/admin\/rentals\/fleet\/[^/]+$/.test(pathname);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
      bodyTop: body.style.top,
    };
    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.top = "0";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.position = prev.bodyPosition;
      body.style.width = prev.bodyWidth;
      body.style.top = prev.bodyTop;
    };
  }, []);

  const openItem = items.find((item) => item.href === submenuHref && item.children?.length);

  useEffect(() => {
    setMenuOpen(false);
    const parent = items.find((item) => item.children?.length && isActive(pathname, item.href));
    setSubmenuHref(parent?.href ?? null);
  }, [pathname, items]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <header className="z-30 shrink-0 border-b border-line bg-white">
        <div className="flex h-14 items-stretch">
        <Link
          href="/admin"
          className="flex shrink-0 items-center px-4 text-lg font-semibold tracking-tight text-navy sm:px-5"
        >
          {theme.brandName}
        </Link>

        <nav
          aria-label="Admin"
          className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto"
        >
          {items.map((item) =>
            item.children?.length ? (
              <NavMenu
                key={item.href}
                item={item}
                pathname={pathname}
                open={submenuHref === item.href}
                onToggle={() => {
                  setMenuOpen(false);
                  setSubmenuHref((current) => (current === item.href ? null : item.href));
                }}
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={pillClass(isActive(pathname, item.href))}
                onClick={() => setSubmenuHref(null)}
              >
                <NavIcon href={item.href} label={item.label} />
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div ref={menuRef} className="relative flex shrink-0 items-center px-3 sm:px-4">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`${user.name}, account menu`}
            onClick={() => {
              setSubmenuHref(null);
              setMenuOpen((open) => !open);
            }}
          >
            {initials(user.name)}
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute top-full right-3 z-40 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg sm:right-4"
            >
              <div className="border-b border-line px-3 py-2">
                <p className="truncate text-sm font-medium text-navy">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.roleName}</p>
              </div>
              <Link
                href="/admin/configuration"
                role="menuitem"
                className="block px-3 py-2 text-sm text-navy hover:bg-surface"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <div role="menuitem" className="border-t border-line">
                {signOut}
              </div>
            </div>
          ) : null}
        </div>
        </div>
        {openItem?.children?.length ? (
          <div className="overflow-x-auto px-4 pt-2 pb-2.5 sm:px-5">
            <div
              id="admin-submenu"
              role="navigation"
              aria-label={`${openItem.label} sections`}
              className="flex w-max items-center gap-1.5"
            >
                  {openItem.children.map((child) => {
                    const current = childIsActive(pathname, child.href, openItem.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={current ? "page" : undefined}
                        className={pillClass(current)}
                      >
                        <NavIcon href={child.href} label={child.label} />
                        {child.label}
                      </Link>
                    );
                  })}
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 justify-center p-3 sm:p-5">
        <div
          className={[
            "flex h-full w-full min-h-0 min-w-0 max-w-7xl flex-col rounded-2xl border border-line bg-white px-5 py-5 shadow-sm sm:px-8 sm:py-6",
            lockMainScroll ? "overflow-hidden" : "overflow-y-auto",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
