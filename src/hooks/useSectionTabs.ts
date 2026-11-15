"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

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
  const pad = 12;
  const leftOverflow = railBox.left + pad - linkBox.left;
  const rightOverflow = linkBox.right - (railBox.right - pad);
  // Only nudge enough to reveal the tab — centering the whole rail feels like a jump.
  if (leftOverflow > 2) scroller.scrollBy({ left: -leftOverflow, behavior: "smooth" });
  else if (rightOverflow > 2) scroller.scrollBy({ left: rightOverflow, behavior: "smooth" });
}

/**
 * Scroll-spy for on-page section tabs.
 * Tracks which section sits under sticky chrome so the selected tab stays in sync.
 * Clicks update the hash without the browser's instant jump, and the clicked tab
 * stays pinned through the smooth scroll so the underline does not jump.
 */
export function useSectionTabs(linkSelector: string, deps: unknown[] = []) {
  const [activeHref, setActiveHref] = useState("");
  const pinnedHref = useRef<string | null>(null);
  const lastScrollY = useRef(0);
  const idleFrames = useRef(0);

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
      const pinned = pinnedHref.current;

      if (pinned) {
        const y = window.scrollY;
        if (Math.abs(y - lastScrollY.current) < 1) idleFrames.current += 1;
        else idleFrames.current = 0;
        lastScrollY.current = y;

        // Hold the clicked tab until motion stops, then keep it (don't let spy
        // immediately flip to a neighbour because of scroll-margin mismatch).
        if (idleFrames.current < 12) {
          setActiveHref((prev) => (prev === pinned ? prev : pinned));
          return;
        }

        pinnedHref.current = null;
        idleFrames.current = 0;
        setActiveHref(pinned);
        return;
      }

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

  function selectHref(href: string, event?: MouseEvent<HTMLAnchorElement>) {
    event?.preventDefault();
    pinnedHref.current = href;
    lastScrollY.current = window.scrollY;
    idleFrames.current = 0;
    setActiveHref(href);

    const next = `${window.location.pathname}${window.location.search}${href}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(window.history.state, "", next);
    }

    const target = document.querySelector<HTMLElement>(href);
    if (!target) {
      pinnedHref.current = null;
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

    // If we're already on the section, scrollIntoView may not fire scroll events —
    // release the pin after the smooth scroll window so spy can resume.
    window.setTimeout(() => {
      if (pinnedHref.current !== href) return;
      pinnedHref.current = null;
      idleFrames.current = 0;
      setActiveHref(href);
    }, reduce ? 50 : 1400);
  }

  return {
    activeHref,
    selectHref,
    isActive: (href: string) => activeHref === href,
  };
}
