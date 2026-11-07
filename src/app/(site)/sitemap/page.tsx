import type { Metadata } from "next";
import { SitemapView } from "@/components/company/SitemapView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "HTML Sitemap",
  description:
    "A full list of public World Compass Holidays pages — destinations, tours, hotels, rentals, visas, meet and assist, and company policies.",
  path: "/sitemap",
});

export default function SitemapPage() {
  return <SitemapView />;
}
