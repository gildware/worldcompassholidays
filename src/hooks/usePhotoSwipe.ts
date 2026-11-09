"use client";

import { useRef, type PointerEvent } from "react";

type Options = {
  enabled?: boolean;
  threshold?: number;
  /** Controls that should not start a swipe (nav, dots, favorites, etc.). */
  ignore?: string;
  onStep: (direction: 1 | -1) => void;
};

/**
 * Horizontal photo swipe for PWA/mobile galleries.
 * Call `didSwipe()` from click handlers to suppress open/navigate after a drag.
 */
export function usePhotoSwipe({
  enabled = true,
  threshold = 36,
  ignore,
  onStep,
}: Options) {
  const startX = useRef(0);
  const tracking = useRef(false);
  const consumed = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!enabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (ignore && event.target instanceof Element && event.target.closest(ignore)) return;
    startX.current = event.clientX;
    tracking.current = true;
    consumed.current = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore unsupported capture */
    }
  };

  const end = (event: PointerEvent<HTMLElement>, commit: boolean) => {
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* ignore */
    }
    if (!tracking.current) return;
    tracking.current = false;
    if (!commit || !enabled) return;
    if (ignore && event.target instanceof Element && event.target.closest(ignore)) return;
    const delta = event.clientX - startX.current;
    if (Math.abs(delta) < threshold) return;
    consumed.current = true;
    onStep(delta < 0 ? 1 : -1);
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => end(event, true);
  const onPointerCancel = (event: PointerEvent<HTMLElement>) => end(event, false);

  /** Returns true once after a completed swipe — use to cancel click/navigation. */
  const didSwipe = () => {
    if (!consumed.current) return false;
    consumed.current = false;
    return true;
  };

  return { onPointerDown, onPointerUp, onPointerCancel, didSwipe };
}
