"use client";

import { useEffect, useRef, useState } from "react";

export function useLazySlice<T>(items: T[], resetKey: string, batch = 12) {
  const [windowState, setWindowState] = useState({ key: resetKey, count: batch });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const count = windowState.key === resetKey ? windowState.count : batch;
  const visibleCount = Math.min(count, items.length);
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setWindowState((current) => {
          const base = current.key === resetKey ? current.count : batch;
          const next = Math.min(base + batch, items.length);
          if (current.key === resetKey && current.count === next) return current;
          return { key: resetKey, count: next };
        });
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [batch, count, hasMore, items.length, resetKey]);

  return {
    visible: items.slice(0, visibleCount),
    sentinelRef,
    hasMore,
  };
}
