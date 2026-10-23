"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    icon: "home",
  },
  {
    href: "/tours",
    label: "Tours",
    match: (p: string) => p === "/tours" || p.startsWith("/tours/"),
    icon: "tours",
  },
  {
    href: "/rentals/cars",
    label: "Cars",
    match: (p: string) =>
      p.startsWith("/rentals/cars") ||
      (p.startsWith("/rentals/") && !p.startsWith("/rentals/bikes")),
    icon: "cars",
  },
  {
    href: "/hotels",
    label: "Hotels",
    match: (p: string) => p === "/hotels" || p.startsWith("/hotels/"),
    icon: "hotels",
  },
  {
    href: "/account",
    label: "Account",
    match: (p: string) =>
      p.startsWith("/account") || p.startsWith("/login") || p.startsWith("/signup"),
    icon: "account",
  },
] as const;

export function MobileTabBar() {
  const pathname = usePathname() || "/";

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="mobile-tabbar app-chrome-mobile" aria-label="Primary">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        const src = active
          ? `/icons/tabs/${tab.icon}-active.png`
          : `/icons/tabs/${tab.icon}.png`;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-tabbar__icon">
              <Image
                src={src}
                alt=""
                width={24}
                height={24}
                unoptimized
                priority
              />
            </span>
            <span className="mobile-tabbar__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
