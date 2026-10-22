"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/worldcompassholiday/BrandLogo";
import type { NavItem } from "@/lib/navigation";

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HomeHeader({
  items,
  actions,
  overlay = false,
}: {
  items: NavItem[];
  actions: React.ReactNode;
  overlay?: boolean;
}) {
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const solid = !overlay || stuck;

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setStuck(window.scrollY >= 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="worldcompassholiday-page worldcompassholiday-header-scope">
      <header className={`header ${solid ? "bg-dark-1 is-sticky" : ""}`}>
        <div className="header__container px-30 sm:px-20">
          <div className="row justify-between items-center">
            <div className="col-auto">
              <div className="d-flex items-center">
                <Link href="/" className="header-logo mr-20" aria-label="World Compass Holidays">
                  <BrandLogo />
                </Link>
                <div className="header-menu">
                  <div className="header-menu__content">
                    <nav className="menu js-navList">
                      <ul className="menu__nav text-white -is-active">
                        {items.map((item) => {
                          const current = isCurrent(pathname, item.href);
                          return (
                            <li key={item.href} className={current ? "current" : ""}>
                              <Link href={item.href} aria-current={current ? "page" : undefined}>
                                <NavIcon href={item.href} />
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex items-center">
                {actions}
                <div className="d-none xl:d-flex x-gap-20 items-center pl-30 text-white">
                  <div>
                    <Link
                      href="/login"
                      className="d-flex items-center icon-user text-inherit text-22"
                      aria-label="Sign in"
                    />
                  </div>
                  <div>
                    <button
                      className="d-flex items-center icon-menu text-inherit text-20"
                      aria-controls="mobile-sidebar_menu"
                      aria-expanded={menuOpen}
                      aria-label="Open menu"
                      type="button"
                      onClick={() => setMenuOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {menuOpen ? (
        <button
          type="button"
          className="offcanvas-backdrop fade show"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <div
        className={`offcanvas offcanvas-start mobile_menu-contnet${menuOpen ? " show" : ""}`}
        tabIndex={-1}
        id="mobile-sidebar_menu"
        aria-labelledby="offcanvasMenuLabel"
        aria-hidden={!menuOpen}
      >
        <div className="pro-header d-flex align-items-center justify-between border-bottom-light">
          <Link href="/" aria-label="World Compass Holidays" onClick={() => setMenuOpen(false)}>
            <BrandLogo tone="dark" />
          </Link>
          <button
            className="fix-icon"
            aria-label="Close"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            <i className="icon icon-close" />
          </button>
        </div>
        <nav className="px-20 py-20">
          <ul className="y-gap-5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-drawer-link text-16 fw-500 py-10"
                  onClick={() => setMenuOpen(false)}
                >
                  <NavIcon href={item.href} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function NavIcon({ href }: { href: string }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {href === "/" ? (
        <>
          <path {...stroke} d="M3.5 11.2 12 3.8l8.5 7.4" />
          <path {...stroke} d="M6.2 9.8V20h11.6V9.8" />
          <path {...stroke} d="M10 20v-5h4v5" />
        </>
      ) : null}
      {href === "/destinations" ? (
        <>
          <path {...stroke} d="M12 21.2c2.2-2.4 6.4-6 6.4-9.6a6.4 6.4 0 1 0-12.8 0c0 3.6 4.2 7.2 6.4 9.6Z" />
          <circle {...stroke} cx="12" cy="11.4" r="2.1" />
        </>
      ) : null}
      {href === "/tours" ? (
        <path {...stroke} d="M2.4 19.6 8.4 8.2l3.6 5 2.6-3.6 7 10H2.4Z" />
      ) : null}
      {href === "/hotels" ? (
        <>
          <path {...stroke} d="M3.2 19.2V5.6" />
          <path {...stroke} d="M3.2 13.6h17.6v5.6H3.2" />
          <path {...stroke} d="M20.8 13.6v-2.2A2.4 2.4 0 0 0 18.4 9H9.6" />
          <circle {...stroke} cx="6.8" cy="10.4" r="1.7" />
        </>
      ) : null}
      {href === "/rentals/cars" ? (
        <>
          <path {...stroke} d="M3.2 14.6h17.6" />
          <path {...stroke} d="M5.4 14.6 7.2 8.6h9.6l1.8 6" />
          <path {...stroke} d="M7.2 8.6 8.4 5.8h7.2l1.2 2.8" />
          <circle {...stroke} cx="7.4" cy="17.4" r="1.8" />
          <circle {...stroke} cx="16.6" cy="17.4" r="1.8" />
        </>
      ) : null}
      {href === "/rentals/bikes" ? (
        <>
          <circle {...stroke} cx="5.6" cy="16.8" r="2.7" />
          <circle {...stroke} cx="18.2" cy="16.8" r="2.7" />
          <path {...stroke} d="M8.2 16.6h6.6" />
          <path {...stroke} d="M6.8 16.2 5.4 10.2h4.6l2.4 3.4h2.6" />
          <path {...stroke} d="M10 10.2 12.2 6.4h3.4" />
          <path {...stroke} d="M15.6 6.4h2.6" />
        </>
      ) : null}
      {href === "/buses" ? (
        <>
          <rect {...stroke} x="3.2" y="3.4" width="17.6" height="13.2" rx="2" />
          <path {...stroke} d="M3.2 9.6h17.6M7.2 16.6v2.6M16.8 16.6v2.6" />
          <circle cx="7.6" cy="12.6" r="1" fill="currentColor" />
          <circle cx="16.4" cy="12.6" r="1" fill="currentColor" />
        </>
      ) : null}
      {href === "/visa-services" ? (
        <>
          <rect {...stroke} x="5" y="2.4" width="14" height="19.2" rx="2" />
          <circle {...stroke} cx="12" cy="10.4" r="2.8" />
          <path {...stroke} d="M9.2 10.4h5.6M12 7.7c1.1 1 1.6 1.8 1.6 2.7s-.5 1.7-1.6 2.7c-1.1-1-1.6-1.8-1.6-2.7s.5-1.7 1.6-2.7Z" />
        </>
      ) : null}
      {href === "/meet-and-assist" ? (
        <>
          <circle {...stroke} cx="8" cy="6.6" r="2.4" />
          <path {...stroke} d="M2.8 19.4c.8-3.2 2.8-4.8 5.2-4.8s4.4 1.6 5.2 4.8" />
          <rect {...stroke} x="14.2" y="3.6" width="7.2" height="5.2" rx="1.1" />
          <path {...stroke} d="M17.8 8.8v10.6" />
        </>
      ) : null}
      {href === "/contact" ? (
        <>
          <rect {...stroke} x="2.6" y="4.6" width="18.8" height="14.2" rx="2" />
          <path {...stroke} d="m3.4 6.6 8.6 6.2 8.6-6.2" />
        </>
      ) : null}
    </svg>
  );
}
