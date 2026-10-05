import type { Metadata } from "next";
import localFont from "next/font/local";
import { theme } from "@/config/theme";
import "./globals.css";

// Pages read the live database. A production image must not freeze that data at build time.
export const dynamic = "force-dynamic";

const jost = localFont({
  src: [
    {
      path: "./fonts/jost-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/jost-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/jost-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/jost-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: theme.brandName,
    template: `%s · ${theme.brandName}`,
  },
  description: theme.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const style = {
    "--navy": theme.colors.navy,
    "--blue": theme.colors.blue,
    "--blue-soft": theme.colors.blueSoft,
    "--muted": theme.colors.muted,
    "--line": theme.colors.line,
    "--surface": theme.colors.surface,
    "--background": theme.colors.white,
    "--foreground": theme.colors.navy,
  } as React.CSSProperties;

  return (
    <html lang="en" className={`${jost.variable} h-full`} style={style}>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
