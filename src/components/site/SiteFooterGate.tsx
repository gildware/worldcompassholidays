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
    /^\/destinations\/[^/]+$/.test(pathname)
  ) {
    return null;
  }
  return <SiteFooter items={items} />;
}
