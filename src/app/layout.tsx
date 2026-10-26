import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { theme } from "@/config/theme";
import { RotatingFavicon } from "@/components/worldcompassholiday/RotatingFavicon";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { MobileAppHeader } from "@/components/pwa/MobileAppHeader";
import { MobileTabBar } from "@/components/pwa/MobileTabBar";
import { SerwistProvider } from "@/components/pwa/SerwistProvider";
import { FavoriteToast } from "@/components/favorites/FavoriteToast";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { getSiteSettings } from "@/lib/brand";
import { siteName, siteOrigin } from "@/lib/seo";
import "./globals.css";
import "@/styles/mobile-app-shell.css";
import "@/styles/whatsapp-float.css";

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
    icon: [
      { url: "/favicon.gif", type: "image/gif" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: theme.colors.navy },
    { media: "(prefers-color-scheme: dark)", color: theme.colors.navy },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appearance = await getSiteSettings();
  const style = {
    "--navy": theme.colors.navy,
    "--blue": appearance.primaryColor,
    "--blue-soft": appearance.primarySoft,
    "--muted": theme.colors.muted,
    "--line": theme.colors.line,
    "--surface": theme.colors.surface,
    "--background": theme.colors.white,
    "--foreground": theme.colors.navy,
  } as React.CSSProperties;

  return (
    <html lang="en" className={`${jost.variable} min-h-dvh`} style={style}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
          register
          cacheOnNavigation={false}
          reloadOnOnline
        >
          <RotatingFavicon />
          <FavoriteToast />
          {/* Phone/tablet chrome on every public page; CSS hides on desktop */}
          <MobileAppHeader />
          {children}
          <MobileTabBar />
          <WhatsAppFloat phone={appearance.whatsapp} />
          <InstallPrompt />
        </SerwistProvider>
      </body>
    </html>
  );
}
