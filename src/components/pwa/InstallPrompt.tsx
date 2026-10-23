"use client";

import { useEffect, useState } from "react";
import { theme } from "@/config/theme";

const DISMISS_KEY = "wch-pwa-install-dismissed";
const MOBILE_MQ = "(max-width: 1024px)";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && !chrome;
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [iosTip, setIosTip] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    if (!window.matchMedia(MOBILE_MQ).matches) return;
    // Keep admin desktop tooling free of install chrome on tablets too.
    if (window.location.pathname.startsWith("/admin")) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setIosTip(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);

    // iOS has no beforeinstallprompt — show a one-time tip instead.
    if (isIosSafari()) {
      setIosTip(true);
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install app"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "max(12px, env(safe-area-inset-bottom))",
        zIndex: 75,
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: 12,
        borderRadius: 14,
        background: "#fff",
        border: `1px solid ${theme.colors.line}`,
        boxShadow: "0 12px 40px rgba(5, 16, 54, 0.16)",
        fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
        color: theme.colors.navy,
        maxWidth: 420,
        marginInline: "auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        width={44}
        height={44}
        style={{ borderRadius: 12, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", fontSize: 14, fontWeight: 600 }}>
          {theme.brandName}
        </strong>
        <span style={{ fontSize: 12, color: theme.colors.muted, lineHeight: 1.35 }}>
          {iosTip
            ? "Tap Share, then Add to Home Screen for the app."
            : "Install for faster booking on this device."}
        </span>
      </div>
      {!iosTip && deferred ? (
        <button
          type="button"
          onClick={install}
          style={{
            appearance: "none",
            border: "none",
            background: theme.colors.blue,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Install
        </button>
      ) : null}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          appearance: "none",
          border: "none",
          background: "transparent",
          color: theme.colors.muted,
          fontSize: 18,
          lineHeight: 1,
          cursor: "pointer",
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}
