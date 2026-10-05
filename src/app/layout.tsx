import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { theme } from "@/config/theme";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jost",
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
