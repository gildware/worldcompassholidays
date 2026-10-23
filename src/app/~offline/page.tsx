import type { Metadata } from "next";
import Link from "next/link";
import { theme } from "@/config/theme";

export const metadata: Metadata = {
  title: "You are offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: theme.colors.surface,
        color: theme.colors.navy,
        fontFamily: "var(--font-jost), Jost, system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "28rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: theme.colors.blue,
            marginBottom: "0.75rem",
          }}
        >
          {theme.brandName}
        </p>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}
        >
          You are offline
        </h1>
        <p
          style={{
            color: theme.colors.muted,
            lineHeight: 1.55,
            marginBottom: "1.5rem",
          }}
        >
          Tours, hotels, and rentals need a connection so quotes stay current.
          Reconnect and try again.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: theme.colors.navy,
            color: "#fff",
            fontWeight: 600,
            padding: "0.85rem 1.25rem",
            borderRadius: "0.85rem",
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
