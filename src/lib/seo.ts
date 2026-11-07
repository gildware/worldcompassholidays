import type { Metadata } from "next";
import { theme } from "@/config/theme";

export const siteName = theme.brandName;

/** Default social share image when a page does not supply its own. */
export const defaultShareImage = {
  url: "/img/masthead/1/bg.webp",
  alt: "A mountain road planned by World Compass Holidays",
  width: 1600,
  height: 900,
} as const;

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
};

const indexRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export const siteKeywords = [
  "World Compass Holidays",
  "India tours",
  "holiday packages India",
  "hotels in India",
  "car rental India",
  "bike rental India",
  "Kashmir tours",
  "Ladakh tours",
  "Goa holidays",
  "visa assistance India",
  "airport meet and assist",
  "DMC India",
] as const;

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = "http://localhost:3000";
  try {
    return new URL(configured || fallback).origin;
  } catch {
    return fallback;
  }
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = siteOrigin();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function clipText(value: string, max = 158) {
  const clean = plainText(value);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const boundary = cut.lastIndexOf(" ");
  const shortened = (boundary > 80 ? cut.slice(0, boundary) : cut).trimEnd();
  return `${shortened}…`;
}

/** Keep browser / SERP titles readable under the brand template. */
export function clipTitle(value: string, max = 60) {
  const clean = plainText(value);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > 24 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
}

export function phoneE164(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  return compact.startsWith("+") ? compact : `+${compact}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  index?: boolean;
  absoluteTitle?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  keywords?: string[];
  type?: "website" | "article";
};

function shareImage(url: string | undefined, alt: string) {
  const src = url?.trim() || defaultShareImage.url;
  const isDefault = src === defaultShareImage.url;
  return {
    url: src,
    alt: alt || defaultShareImage.alt,
    ...(isDefault
      ? { width: defaultShareImage.width, height: defaultShareImage.height }
      : {}),
  };
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const description = clipText(input.description);
  const index = input.index !== false;
  const pageTitle = clipTitle(input.title);
  const ogTitle = clipTitle(input.openGraphTitle?.trim() || input.title);
  const ogDescription = clipText(input.openGraphDescription?.trim() || description);
  const twTitle = clipTitle(input.twitterTitle?.trim() || ogTitle);
  const twDescription = clipText(input.twitterDescription?.trim() || ogDescription);
  const branded =
    input.absoluteTitle || input.title.toLowerCase().includes(siteName.toLowerCase());
  const image = shareImage(input.image ?? undefined, input.imageAlt || ogTitle);

  return {
    title: branded ? { absolute: input.title } : pageTitle,
    description,
    keywords: input.keywords?.length ? input.keywords : undefined,
    alternates: { canonical: input.path },
    robots: index ? indexRobots : noIndexRobots,
    openGraph: {
      type: input.type || "website",
      locale: "en_IN",
      siteName,
      title: ogTitle,
      description: ogDescription,
      url: input.path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: twTitle,
      description: twDescription,
      images: [image.url],
    },
  };
}

export function privateMetadata(title: string, description = "This page is not for search engines."): Metadata {
  return {
    title,
    description,
    robots: noIndexRobots,
    openGraph: { title, description, siteName, locale: "en_IN" },
    twitter: { card: "summary", title, description },
  };
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function graphLd(nodes: Array<Record<string, unknown> | null | undefined | false>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter((node): node is Record<string, unknown> => Boolean(node)),
  };
}

export function organizationNode() {
  const sameAs = Object.values(theme.social).filter((url) => Boolean(url?.trim()));
  return {
    "@type": "TravelAgency",
    "@id": `${siteOrigin()}/#organization`,
    name: theme.brandName,
    url: `${siteOrigin()}/`,
    logo: absoluteUrl("/icons/icon-512.png"),
    image: absoluteUrl(defaultShareImage.url),
    email: theme.contact.email,
    telephone: phoneE164(theme.contact.phone),
    description: theme.description,
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${siteOrigin()}/#website`,
    name: theme.brandName,
    url: `${siteOrigin()}/`,
    description: theme.description,
    inLanguage: "en-IN",
    publisher: { "@id": `${siteOrigin()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteOrigin()}/destinations?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqNode(faqs: { title: string; content: string }[]) {
  const mainEntity = faqs.flatMap((faq) => {
    const name = plainText(faq.title);
    const text = plainText(faq.content);
    if (!name || !text) return [];
    return [
      {
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      },
    ];
  });
  if (mainEntity.length === 0) return null;
  return { "@type": "FAQPage", mainEntity };
}

export function offerNode(input: {
  price: number;
  currency: string;
  path: string;
  unitText?: string;
  availability?: "InStock" | "OutOfStock" | "LimitedAvailability";
}) {
  if (!Number.isFinite(input.price) || input.price <= 0) return undefined;
  const price = String(Math.round(input.price));
  const priceCurrency = input.currency || "INR";
  return {
    "@type": "Offer",
    price,
    priceCurrency,
    url: absoluteUrl(input.path),
    availability: `https://schema.org/${input.availability ?? "InStock"}`,
    ...(input.unitText
      ? {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price,
            priceCurrency,
            unitText: input.unitText,
          },
        }
      : {}),
  };
}
