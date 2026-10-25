"use client";

import { useEffect, useState } from "react";

export type FavoriteToastTone = "add" | "remove" | "login";

const COLORS: Record<FavoriteToastTone, string> = {
  add: "#157347",
  remove: "#c4232b",
  login: "#051036",
};

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
    <div
      className={`fav-toast fav-toast--${toast.tone} is-on`}
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        top: "calc(72px + env(safe-area-inset-top, 0px))",
        transform: "translateX(-50%)",
        zIndex: 10120,
        maxWidth: "calc(100% - 32px)",
        padding: "14px 18px",
        borderRadius: 999,
        background: COLORS[toast.tone],
        color: "#fff",
        fontSize: 15,
        fontWeight: 650,
        lineHeight: 1.3,
        textAlign: "center",
        boxShadow: "0 12px 32px rgba(5, 16, 54, 0.28)",
        opacity: 1,
        pointerEvents: "none",
      }}
    >
      {toast.message}
    </div>
  );
}
