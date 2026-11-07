"use client";

import { useEffect } from "react";

const KEYBOARD_OPEN_PX = 120;
const EDGE_PAD = 28;

function isEditable(el: EventTarget | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return false;
  const type = (el as HTMLInputElement).type;
  return !["button", "checkbox", "radio", "file", "submit", "reset", "image", "hidden", "range", "color"].includes(type);
}

function scrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const oy = style.overflowY;
    if ((oy === "auto" || oy === "scroll" || oy === "overlay") && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function ensureVisible(el: HTMLElement) {
  const vv = window.visualViewport;
  const rect = el.getBoundingClientRect();
  const visibleTop = (vv?.offsetTop ?? 0) + EDGE_PAD;
  const visibleBottom = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight) - EDGE_PAD;

  let delta = 0;
  if (rect.bottom > visibleBottom) delta = rect.bottom - visibleBottom;
  else if (rect.top < visibleTop) delta = rect.top - visibleTop;
  if (!delta) return;

  const parent = scrollParent(el);
  if (parent) parent.scrollTop += delta;
  else window.scrollBy({ top: delta, left: 0, behavior: "auto" });
}

/**
 * Keeps focused form fields above the on-screen keyboard on phones:
 * measures the keyboard via visualViewport, flags chrome to hide, and
 * scrolls the active field into the remaining visible area.
 */
export function KeyboardAvoid() {
  useEffect(() => {
    const root = document.documentElement;
    let focusTimer = 0;
    let resizeTimer = 0;

    function setInset(px: number) {
      const next = Math.max(0, Math.round(px));
      root.style.setProperty("--keyboard-inset", `${next}px`);
      root.classList.toggle("keyboard-open", next > KEYBOARD_OPEN_PX);
    }

    function measure() {
      const vv = window.visualViewport;
      if (!vv) {
        setInset(0);
        return;
      }
      // Layout height minus visible height (and any visual offset) ≈ keyboard.
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(inset);

      const active = document.activeElement;
      if (inset > KEYBOARD_OPEN_PX && isEditable(active)) {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => ensureVisible(active), 50);
      }
    }

    function onFocusIn(event: FocusEvent) {
      if (!isEditable(event.target)) return;
      window.clearTimeout(focusTimer);
      // Wait for the keyboard animation / visualViewport resize.
      focusTimer = window.setTimeout(() => {
        measure();
        ensureVisible(event.target as HTMLElement);
      }, 280);
    }

    function onFocusOut() {
      window.clearTimeout(focusTimer);
      // Clear after blur so a quick field-to-field hop does not flash chrome.
      focusTimer = window.setTimeout(() => {
        if (!isEditable(document.activeElement)) measure();
      }, 120);
    }

    measure();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(resizeTimer);
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      root.style.removeProperty("--keyboard-inset");
      root.classList.remove("keyboard-open");
    };
  }, []);

  return null;
}
