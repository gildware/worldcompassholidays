import type { Metadata } from "next";
import { SitemapView } from "@/components/company/SitemapView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sitemap",
  description: "Every public page on World Compass Holidays, from tours and hotels to the company policies.",
  path: "/sitemap",
});

export default function SitemapPage() {
  return <SitemapView />;
}
