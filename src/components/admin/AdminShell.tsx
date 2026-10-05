"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
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
  const lockMainScroll =
    pathname === "/admin/tours/new" ||
    /^\/admin\/tours\/[^/]+$/.test(pathname);

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

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <aside className="hidden h-full w-64 shrink-0 flex-col bg-navy text-white md:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs tracking-wide text-white/60 uppercase">Admin</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{theme.brandName}</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/15 font-medium text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-white/10 px-5 py-4 text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-white/60">{user.roleName}</p>
          <div className="mt-3 flex items-center gap-4 text-white/75">
            <Link href="/" className="hover:text-white">
              View website
            </Link>
            {signOut}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-line bg-white/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{theme.brandName}</p>
              <p className="truncate text-xs text-muted">
                {user.name} · {user.roleName}
              </p>
            </div>
            <div className="shrink-0 text-sm font-medium text-brand">{signOut}</div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "border-brand bg-brand-soft font-medium text-brand"
                      : "border-line bg-white text-navy",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div
          className={[
            "mx-auto flex w-full min-h-0 min-w-0 max-w-6xl flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5",
            lockMainScroll ? "overflow-hidden" : "overflow-y-auto",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
