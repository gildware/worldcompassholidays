"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
    <div className="gotrip-page gotrip-header-scope">
      <header className={`header ${solid ? "bg-dark-1 is-sticky" : ""}`}>
        <div className="header__container px-30 sm:px-20">
          <div className="row justify-between items-center">
            <div className="col-auto">
              <div className="d-flex items-center">
                <Link href="/" className="header-logo mr-20">
                  <img src="/img/general/logo-light.svg" alt="logo icon" />
                  <img src="/img/general/logo-dark.svg" alt="logo icon" />
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
                                {item.label}
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
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <img src="/img/general/logo-dark.svg" alt="brand" />
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
                  className="d-block text-16 fw-500 py-10"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
