"use client";

import { useEffect, useState } from "react";

export type FavoriteToastTone = "add" | "remove" | "login";

const TOAST_MS = 3200;

let active: { message: string; tone: FavoriteToastTone; until: number } | null = null;

function currentToast() {
  if (!active || active.until <= Date.now()) return null;
  return active;
}

export function showFavoriteToast(message: string, tone: FavoriteToastTone = "login") {
  if (typeof window === "undefined") return;
  active = { message, tone, until: Date.now() + TOAST_MS };
  window.dispatchEvent(new CustomEvent("wch-fav-toast"));
}

export function FavoriteToast() {
  const [toast, setToast] = useState(currentToast);

  useEffect(() => {
    let timer = 0;
    const sync = () => {
      const next = currentToast();
      setToast(next);
      window.clearTimeout(timer);
      if (!next) return;
      timer = window.setTimeout(() => setToast(currentToast()), next.until - Date.now());
    };
    sync();
    window.addEventListener("wch-fav-toast", sync);
    return () => {
      window.removeEventListener("wch-fav-toast", sync);
      window.clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className={`fav-toast fav-toast--${toast.tone} is-on`} role="status" aria-live="polite">
      <span className="fav-toast__text">{toast.message}</span>
    </div>
  );
}
