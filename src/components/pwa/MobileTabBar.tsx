"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type TabIcon = "home" | "tours" | "cars" | "hotels" | "account";

const tabs: {
  href: string;
  label: string;
  match: (p: string) => boolean;
  icon: TabIcon;
}[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => p === "/",
    icon: "home",
  },
  {
    href: "/tours",
    label: "Tours",
    match: (p) => p === "/tours" || p.startsWith("/tours/"),
    icon: "tours",
  },
  {
    href: "/rentals/cars",
    label: "Cars",
    match: (p) =>
      p.startsWith("/rentals/cars") ||
      (p.startsWith("/rentals/") && !p.startsWith("/rentals/bikes")),
    icon: "cars",
  },
  {
    href: "/hotels",
    label: "Hotels",
    match: (p) => p === "/hotels" || p.startsWith("/hotels/"),
    icon: "hotels",
  },
  {
    href: "/account",
    label: "Account",
    match: (p) =>
      p.startsWith("/account") || p.startsWith("/login") || p.startsWith("/signup"),
    icon: "account",
  },
];

function TabGlyph({ name }: { name: TabIcon }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  const icons: Record<TabIcon, ReactNode> = {
    home: (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M12.4 3.3a.9.9 0 0 0-1.05.05l-7.6 6.4A1 1 0 0 0 3.4 11.5V19a1.6 1.6 0 0 0 1.6 1.6h4.1a.9.9 0 0 0 .9-.9V15.4c0-.7.55-1.25 1.25-1.25h1.5c.7 0 1.25.55 1.25 1.25v4.3a.9.9 0 0 0 .9.9h4.1A1.6 1.6 0 0 0 20.6 19v-7.5a1 1 0 0 0-.35-.75l-7.85-6.45Z"
        />
      </svg>
    ),
    tours: (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.9" />
        <path fill="currentColor" d="M12 5.2 14.2 11.4 12 12.55 9.8 11.4Z" />
        <path fill="currentColor" d="M12 18.8 9.8 12.6 12 11.45 14.2 12.6Z" />
      </svg>
    ),
    cars: (
      <svg {...common}>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M7.6 7.6c.45-.95 1.2-1.55 2.35-1.55h4.1c1.15 0 1.9.6 2.35 1.55l1.35 2.85h.85c1 0 1.8.8 1.8 1.8v2.2c0 .66-.54 1.2-1.2 1.2h-.55a2.25 2.25 0 0 1-4.4 0h-3.7a2.25 2.25 0 0 1-4.4 0H4.8c-.66 0-1.2-.54-1.2-1.2v-2.2c0-1 .8-1.8 1.8-1.8h.85L7.6 7.6Zm.95 1.55.85 1.8h5.2l.85-1.8c.15-.3.3-.55.55-.55H8c.25 0 .4.25.55.55ZM7.05 15.85a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Zm9.9 0a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"
        />
      </svg>
    ),
    hotels: (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M7.2 3.6h9.6c.9 0 1.6.7 1.6 1.6v14.2c0 .55-.45 1-1 1h-2.35a.9.9 0 0 1-.9-.9v-3.1c0-.7-.55-1.25-1.25-1.25h-1.8c-.7 0-1.25.55-1.25 1.25v3.1a.9.9 0 0 1-.9.9H6.6c-.55 0-1-.45-1-1V5.2c0-.9.7-1.6 1.6-1.6Zm1.55 3.1a.75.75 0 0 0-.75.75v1.1c0 .41.34.75.75.75h1.1c.41 0 .75-.34.75-.75v-1.1a.75.75 0 0 0-.75-.75h-1.1Zm3.5 0a.75.75 0 0 0-.75.75v1.1c0 .41.34.75.75.75h1.1c.41 0 .75-.34.75-.75v-1.1a.75.75 0 0 0-.75-.75h-1.1Zm3.5 0a.75.75 0 0 0-.75.75v1.1c0 .41.34.75.75.75h1.1c.41 0 .75-.34.75-.75v-1.1a.75.75 0 0 0-.75-.75h-1.1Zm-7 3.7a.75.75 0 0 0-.75.75v1.1c0 .41.34.75.75.75h1.1c.41 0 .75-.34.75-.75v-1.1a.75.75 0 0 0-.75-.75h-1.1Zm3.5 0a.75.75 0 0 0-.75.75v1.1c0 .41.34.75.75.75h1.1c.41 0 .75-.34.75-.75v-1.1a.75.75 0 0 0-.75-.75h-1.1Zm3.5 0a.75.75 0 0 0-.75.75v1.1c0 .41.34.75.75.75h1.1c.41 0 .75-.34.75-.75v-1.1a.75.75 0 0 0-.75-.75h-1.1Z"
        />
      </svg>
    ),
    account: (
      <svg {...common}>
        <circle cx="12" cy="8.2" r="3.35" fill="currentColor" />
        <path
          fill="currentColor"
          d="M5.2 18.7c.35-3.05 2.9-5.1 6.8-5.1s6.45 2.05 6.8 5.1c.05.45-.3.85-.75.85H5.95c-.45 0-.8-.4-.75-.85Z"
        />
      </svg>
    ),
  };

  return icons[name];
}

export function MobileTabBar() {
  const pathname = usePathname() || "/";

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="mobile-tabbar app-chrome-mobile" aria-label="Primary">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-tabbar__icon">
              <TabGlyph name={tab.icon} />
            </span>
            <span className="mobile-tabbar__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
