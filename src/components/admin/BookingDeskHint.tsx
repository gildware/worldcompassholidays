"use client";

import { useLayoutEffect } from "react";

/** Marks the active Bookings desk so the side nav can highlight the right child on detail pages. */
export function BookingDeskHint({ segment }: { segment: string }) {
  useLayoutEffect(() => {
    if (!segment) return;
    document.documentElement.dataset.bookingDesk = segment;
    return () => {
      if (document.documentElement.dataset.bookingDesk === segment) {
        delete document.documentElement.dataset.bookingDesk;
      }
    };
  }, [segment]);

  return null;
}
