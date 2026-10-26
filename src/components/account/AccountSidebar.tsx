"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { logout } from "@/actions/auth";
import { visibleAccountSections, type AccountSectionKey } from "@/lib/account-sections";

type Item = {
  href: string;
  label: string;
  icon: "dashboard" | "booking" | "enquiries" | "favorites" | "settings" | AccountSectionKey;
  active?: (pathname: string) => boolean;
};

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isBookingPath(pathname: string) {
  if (pathname.startsWith("/account/bookings") || pathname.startsWith("/account/rentals")) return true;
  return visibleAccountSections().some((section) => isActive(pathname, section.href));
}

function itemActive(pathname: string, item: Item) {
  return item.active ? item.active(pathname) : isActive(pathname, item.href);
}

function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "A";
}

function Icon({
  name,
  className = "h-4 w-4 shrink-0",
}: {
  name: Item["icon"] | "logout";
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "dashboard") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 7.5v4.2l2.6 1.6" />
      </svg>
    );
  }
  if (name === "booking") {
    return (
      <svg {...common}>
        <path d="M7 3.5h10A1.5 1.5 0 0 1 18.5 5v15.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" />
        <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" />
      </svg>
    );
  }
  if (name === "enquiries") {
    return (
      <svg {...common}>
        <path d="M4.5 7.5h15v10h-15z" />
        <path d="m4.5 8.5 7.5 4.5 7.5-4.5" />
      </svg>
    );
  }
  if (name === "favorites") {
    return (
      <svg {...common}>
        <path d="M12 19.2s-6.2-3.7-6.2-8.1A3.4 3.4 0 0 1 12 8.2a3.4 3.4 0 0 1 6.2 2.9c0 4.4-6.2 8.1-6.2 8.1z" />
      </svg>
    );
  }
  if (name === "tour") {
    return (
      <svg {...common}>
        <path d="M3.5 18.5 8.5 8l3.2 4.2 2.2-2.8 6.6 9.1" />
        <path d="M3 18.5h18" />
      </svg>
    );
  }
  if (name === "hotel") {
    return (
      <svg {...common}>
        <path d="M4 20V9.5L12 4l8 5.5V20" />
        <path d="M9 20v-5h6v5" />
        <path d="M9 11h.01M12 11h.01M15 11h.01" />
      </svg>
    );
  }
  if (name === "visa") {
    return (
      <svg {...common}>
        <path d="M7 3.5h7l3.5 3.5V20.5H7z" />
        <path d="M14 3.5V7h3.5" />
        <path d="M9.5 12h5M9.5 15.5h3.5" />
      </svg>
    );
  }
  if (name === "assist") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="2.6" />
        <path d="M6.5 19.5c1.2-2.8 3-4.2 5.5-4.2s4.3 1.4 5.5 4.2" />
      </svg>
    );
  }
  if (name === "car") {
    return (
      <svg {...common}>
        <path d="M4 15.5h16" />
        <path d="M6 15.5 7.5 10.5h9L18 15.5" />
        <circle cx="8" cy="17.5" r="1.4" />
        <circle cx="16" cy="17.5" r="1.4" />
      </svg>
    );
  }
  if (name === "bike") {
    return (
      <svg {...common}>
        <circle cx="7" cy="16" r="2.4" />
        <circle cx="17" cy="16" r="2.4" />
        <path d="M9.4 16h3.2M7 16 11 8.5h3.2M11 8.5 8.8 8.5" />
      </svg>
    );
  }
  if (name === "bus") {
    return (
      <svg {...common}>
        <rect x="4.5" y="4.5" width="15" height="12.5" rx="1.8" />
        <path d="M4.5 11h15M8 19v-2M16 19v-2" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h6A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 10 18.5V17" />
      <path d="M13 12H4.5M7 9.5 4.5 12 7 14.5" />
    </svg>
  );
}

function itemClass(active: boolean) {
  return [
    "flex h-9 shrink-0 items-center gap-2.5 rounded px-2.5 text-[13px] font-medium",
    active ? "bg-brand-soft text-brand" : "text-navy hover:bg-surface",
  ].join(" ");
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

function AccountMobileNav({ name, phone, items }: { name: string; phone: string; items: Item[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const current = items.find((item) => itemActive(pathname, item));
  const booking = visibleAccountSections().find((section) => isActive(pathname, section.href));
  const subtitle = booking?.tabLabel ?? current?.label ?? "Account";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const place = () => {
      document.documentElement.style.setProperty("--account-bar-h", `${Math.round(bar.getBoundingClientRect().height)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--account-bar-h");
    };
  }, []);

  const drawer =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <button type="button" className="account-drawer-backdrop lg:hidden" aria-label="Close account menu" onClick={() => setOpen(false)} />
            <aside id={panelId} className="account-drawer lg:hidden" role="dialog" aria-modal="true" aria-label="Account menu">
              <div className="flex items-center gap-3 px-1">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {initials(name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold leading-tight text-navy">{name}</p>
                  {phone ? <p className="mt-0.5 truncate text-xs text-muted">{phone}</p> : null}
                </div>
                <button
                  type="button"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-navy"
                  aria-label="Close account menu"
                  onClick={() => setOpen(false)}
                >
                  <MenuIcon open />
                </button>
              </div>
              <nav aria-label="Account" className="mt-4 grid flex-1 content-start gap-1 overflow-y-auto">
                {items.map((item) => {
                  const active = itemActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium",
                        active ? "bg-brand-soft text-brand" : "text-navy",
                      ].join(" ")}
                    >
                      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-3 border-t border-line pt-3">
                <SignOut
                  wide
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-navy"
                />
              </div>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <div
      ref={barRef}
      className="sticky z-30 border-b border-line bg-white lg:hidden"
      style={{ top: "var(--app-header-h, 64px)" }}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <button
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-navy"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label="Open account menu"
          onClick={() => setOpen(true)}
        >
          <MenuIcon open={false} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-navy">{name}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      {drawer}
    </div>
  );
}

function BookingTabs() {
  const pathname = usePathname();
  const sections = visibleAccountSections();
  if (!isBookingPath(pathname)) return null;

  return (
    <nav aria-label="Bookings" className="account-booking-tabs-bar sticky z-20 border-b border-line bg-white">
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2 lg:flex lg:flex-wrap lg:px-6">
        {sections.map((section) => {
          const active = isActive(pathname, section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex h-9 items-center justify-center rounded-full px-2 text-center text-[12px] font-semibold leading-none lg:h-8 lg:px-3 lg:text-[13px]",
                active ? "bg-navy text-white" : "bg-surface text-navy",
              ].join(" ")}
            >
              {section.tabLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SignOut({ className, wide = false }: { className?: string; wide?: boolean }) {
  return (
    <form action={logout} className={wide ? "w-full" : "shrink-0"}>
      <input type="hidden" name="to" value="site" />
      <button type="submit" className={className ?? `${itemClass(false)} w-full`}>
        <Icon name="logout" />
        Sign out
      </button>
    </form>
  );
}

export function AccountSidebar({
  name,
  phone,
  showSettings,
  children,
}: {
  name: string;
  phone: string;
  showSettings: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bookingHref = visibleAccountSections()[0]?.href ?? "/account/tours";
  const items: Item[] = [
    { href: "/account", label: "Dashboard", icon: "dashboard" },
    { href: bookingHref, label: "Booking", icon: "booking", active: isBookingPath },
    { href: "/account/enquiries", label: "Enquiries", icon: "enquiries" },
    { href: "/account/favorites", label: "Favorites", icon: "favorites" },
    ...(showSettings ? [{ href: "/account/settings", label: "Settings", icon: "settings" as const }] : []),
  ];

  return (
    <div className="flex w-full min-h-[calc(100dvh-80px)] bg-surface md:min-h-[calc(100dvh-90px)]">
      <aside className="sticky top-[90px] hidden h-[calc(100dvh-90px)] w-[212px] shrink-0 flex-col border-r border-line bg-white px-3 py-4 lg:flex">
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{name}</p>
            {phone ? <p className="truncate text-xs text-muted">{phone}</p> : null}
          </div>
        </div>
        <nav aria-label="Account" className="mt-4 grid min-h-0 flex-1 content-start gap-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = itemActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-line pt-2">
          <SignOut wide />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <AccountMobileNav name={name} phone={phone} items={items} />
        <BookingTabs />
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:py-6">{children}</div>
      </div>
    </div>
  );
}
