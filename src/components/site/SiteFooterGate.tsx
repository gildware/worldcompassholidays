"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { NavItem } from "@/lib/navigation";

export function SiteFooterGate({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (
    pathname === "/hotels" ||
    pathname.startsWith("/hotels/") ||
    pathname === "/tours" ||
    pathname.startsWith("/tours/") ||
    pathname === "/rentals" ||
    pathname === "/rentals/cars" ||
    pathname === "/rentals/bikes" ||
    pathname === "/destinations" ||
    pathname === "/contact" ||
    pathname === "/visa-services" ||
    /^\/destinations\/[^/]+$/.test(pathname)
  ) {
    return null;
  }
  return <SiteFooter items={items} />;
}
