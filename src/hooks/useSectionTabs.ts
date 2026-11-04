"use client";

import { useEffect, useState } from "react";

/** Keep the active tab visible inside a horizontal rail without scrolling the page. */
function scrollTabIntoRail(link: HTMLElement) {
  const rail = link.closest<HTMLElement>("[data-section-tabs], .stay-links, .road-sub, .destination-page__chips");
  if (!rail || rail === link) return;
  const scroller =
    rail.scrollWidth > rail.clientWidth + 4
      ? rail
      : rail.querySelector<HTMLElement>(".swiper-wrapper")?.parentElement || rail;
  const railBox = scroller.getBoundingClientRect();
  const linkBox = link.getBoundingClientRect();
  const delta = linkBox.left - railBox.left - (railBox.width - linkBox.width) / 2;
  if (Math.abs(delta) < 4) return;
  scroller.scrollBy({ left: delta, behavior: "smooth" });
}

/**
 * Scroll-spy for on-page section tabs.
 * Tracks which section sits under sticky chrome so the selected tab stays in sync.
 */
export function useSectionTabs(linkSelector: string, deps: unknown[] = []) {
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>(linkSelector)].filter((link) =>
      Boolean(link.getAttribute("href")?.startsWith("#")),
    );
    if (links.length === 0) return;

    const sections = links
      .map((link) => {
        const href = link.getAttribute("href") || "";
        const node = document.querySelector(href);
        return node ? { href, node } : null;
      })
      .filter((item): item is { href: string; node: Element } => Boolean(item));

    if (sections.length === 0) return;

    const firstHref = sections[0].href;
    setActiveHref((current) => current || firstHref);

    const markerY = () => {
      let bottom = 0;
      for (const el of document.querySelectorAll<HTMLElement>(
        ".mobile-app-header, .stay-subnav, .road-sub, .destination-page__chips",
      )) {
        const position = getComputedStyle(el).position;
        if (position !== "sticky" && position !== "fixed") continue;
        const box = el.getBoundingClientRect();
        // Ignore sticky nodes that have not stuck yet (still lower in the page).
        if (box.top > 96) continue;
        bottom = Math.max(bottom, box.bottom);
      }
      return Math.max(bottom + 24, window.innerHeight * 0.28);
    };

    let frame = 0;
    const sync = () => {
      frame = 0;
      const marker = markerY();
      let current = sections[0].href;
      for (const section of sections) {
        if (section.node.getBoundingClientRect().top <= marker + 8) current = section.href;
      }
      setActiveHref((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes identity deps
  }, deps);

  useEffect(() => {
    if (!activeHref) return;
    const active = [...document.querySelectorAll<HTMLAnchorElement>(linkSelector)].find(
      (link) => link.getAttribute("href") === activeHref,
    );
    if (active) scrollTabIntoRail(active);
  }, [activeHref, linkSelector]);

  return {
    activeHref,
    selectHref: (href: string) => setActiveHref(href),
    isActive: (href: string) => activeHref === href,
  };
}
