"use client";

import Link from "next/link";
import { useState } from "react";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";

export function SiteHeader({
  items,
  account,
}: {
  items: NavItem[];
  account: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-navy">
          {theme.brandName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-navy md:flex">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {account}
          <Link
            href="/contact"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            Enquire
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-md border border-line px-3 text-sm font-medium md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-line px-5 py-3 md:hidden">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2 py-2 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-line px-2 pt-3">{account}</div>
        </nav>
      ) : null}
    </header>
  );
}
