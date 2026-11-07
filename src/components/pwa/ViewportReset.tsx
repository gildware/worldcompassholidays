"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * iOS keeps a zoomed-out layout viewport after a client navigation when the
 * incoming page is briefly wider than the screen. Toggling the viewport meta
 * forces Safari to lock back to the device width before paint. Pinch-zoom
 * is restored once the page fits.
 */
export function ViewportReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const phone =
      window.matchMedia("(pointer: coarse)").matches &&
      Math.min(window.screen.width, window.screen.height) <= 1024;
    if (!phone) return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const current =
      meta.getAttribute("content") ||
      "width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover, interactive-widget=resizes-content";
    const unlocked = current.replace(/,?\s*maximum-scale=[^,]+/g, "");
    const withWidget = /interactive-widget=/i.test(unlocked)
      ? unlocked
      : `${unlocked}, interactive-widget=resizes-content`;
    meta.setAttribute("content", `${withWidget}, maximum-scale=1`);
    const timer = window.setTimeout(() => {
      const fits = document.documentElement.scrollWidth <= window.innerWidth + 1;
      meta.setAttribute("content", fits ? withWidget : `${withWidget}, maximum-scale=1`);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
