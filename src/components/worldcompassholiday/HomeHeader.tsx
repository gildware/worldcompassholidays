"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/components/i18n/I18nProvider";
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
  logoUrl,
}: {
  items: NavItem[];
  actions: React.ReactNode;
  overlay?: boolean;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const { messages } = useI18n();
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });
  const slotRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const moreMeasureRef = useRef<HTMLLIElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const solid = !overlay || stuck;
  const overflow = items.slice(visibleCount);
  const moreCurrent = overflow.some((item) => isCurrent(pathname, item.href));

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setStuck(window.scrollY >= 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const measure = measureRef.current;
    if (!slot || !measure) return;

    const fit = () => {
      const available = slot.clientWidth;
      if (available < 8) return;
      const nodes = Array.from(measure.querySelectorAll<HTMLElement>(":scope > li.nav-item"));
      const moreWidth = moreMeasureRef.current?.getBoundingClientRect().width ?? 72;
      let used = 0;
      let count = nodes.length;
      for (let index = 0; index < nodes.length; index += 1) {
        const width = nodes[index].getBoundingClientRect().width;
        const isLast = index === nodes.length - 1;
        if (used + width + (isLast ? 0 : moreWidth) > available - 1) {
          count = index;
          break;
        }
        used += width;
      }
      setVisibleCount((current) => (current === count ? current : count));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(slot);
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => observer.disconnect();
  }, [items, messages.tabs.more]);

  useEffect(() => {
    if (!moreOpen) return;
    const place = () => {
      const button = moreBtnRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const rtl = document.documentElement.dir === "rtl";
      setPanelStyle({
        top: rect.bottom + 8,
        left: rtl ? rect.left : undefined,
        right: rtl ? undefined : Math.max(12, window.innerWidth - rect.right),
      });
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (moreBtnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

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
            <div className="col-auto header-lead">
              <div className="d-flex items-center header-lead__inner">
                <Link prefetch={false} href="/" className="header-logo mr-20" aria-label="World Compass Holidays">
                  <BrandLogo logoUrl={logoUrl} />
                </Link>
                <div className="header-menu" ref={slotRef}>
                  <div className="header-menu__content">
                    <nav className="menu js-navList">
                      <ul className="menu__nav text-white -is-active">
                        {items.slice(0, visibleCount).map((item) => {
                          const current = isCurrent(pathname, item.href);
                          return (
                            <li key={item.href} className={current ? "current" : ""}>
                              <Link prefetch={false} href={item.href} aria-current={current ? "page" : undefined}>
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                        {overflow.length ? (
                          <li className="nav-more">
                            <button
                              ref={moreBtnRef}
                              type="button"
                              className={`nav-more__btn${moreCurrent ? " is-current" : ""}`}
                              aria-expanded={moreOpen}
                              aria-haspopup="true"
                              onClick={() => setMoreOpen((open) => !open)}
                            >
                              {messages.tabs.more}
                              <i className="icon icon-chevron-sm-down text-7" aria-hidden="true" />
                            </button>
                          </li>
                        ) : null}
                      </ul>
                      {moreOpen && overflow.length ? (
                        <div className="nav-more__panel" ref={panelRef} style={panelStyle}>
                          <ul>
                            {overflow.map((item) => {
                              const current = isCurrent(pathname, item.href);
                              return (
                                <li key={item.href}>
                                  <Link
                                    prefetch={false}
                                    href={item.href}
                                    aria-current={current ? "page" : undefined}
                                    onClick={() => setMoreOpen(false)}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                    </nav>
                  </div>
                  <ul className="nav-measure" ref={measureRef} aria-hidden="true">
                    {items.map((item) => (
                      <li key={item.href} className="nav-item">
                        <span>{item.label}</span>
                      </li>
                    ))}
                    <li className="nav-more" ref={moreMeasureRef}>
                      <span className="nav-more__btn">
                        {messages.tabs.more}
                        <i className="icon icon-chevron-sm-down text-7" aria-hidden="true" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex items-center header-tools">
                <LanguageSwitcher />
                {actions}
                <div className="d-none xl:d-flex x-gap-20 items-center pl-30 text-white">
                  <div>
                    <Link prefetch={false}
                      href="/login"
                      className="d-flex items-center icon-user text-inherit text-22"
                      aria-label={messages.header.signIn}
                    />
                  </div>
                  <div>
                    <button
                      className="d-flex items-center icon-menu text-inherit text-20"
                      aria-controls="mobile-sidebar_menu"
                      aria-expanded={menuOpen}
                      aria-label={messages.header.openMenu}
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
          aria-label={messages.header.closeMenu}
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
          <Link prefetch={false} href="/" aria-label="World Compass Holidays" onClick={() => setMenuOpen(false)}>
            <BrandLogo tone="dark" logoUrl={logoUrl} />
          </Link>
          <button
            className="fix-icon"
            aria-label={messages.header.close}
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
                <Link prefetch={false}
                  href={item.href}
                  className="nav-drawer-link text-16 fw-500 py-10"
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
