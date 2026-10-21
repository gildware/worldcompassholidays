import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/login", "/signup", "/rentals/*/book"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
