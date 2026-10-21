import type { Metadata } from "next";
import localFont from "next/font/local";
import { theme } from "@/config/theme";
import { RotatingFavicon } from "@/components/worldcompassholiday/RotatingFavicon";
import { siteName, siteOrigin } from "@/lib/seo";
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

const defaultTitle = `${siteName} | Tours, Hotels & Rentals`;
const shareImage = {
  url: "/img/masthead/1/bg.webp",
  alt: "A mountain road planned by World Compass Holidays",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: defaultTitle,
    template: `%s · ${siteName}`,
  },
  description: theme.description,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteOrigin() }],
  creator: siteName,
  publisher: siteName,
  category: "travel",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: defaultTitle,
    description: theme.description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: theme.description,
    images: [shareImage.url],
  },
  icons: {
    icon: [{ url: "/favicon.gif", type: "image/gif" }],
  },
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
    <html lang="en" className={`${jost.variable} min-h-dvh`} style={style}>
      <body className="flex min-h-dvh flex-col antialiased">
        <RotatingFavicon />
        {children}
      </body>
    </html>
  );
}
