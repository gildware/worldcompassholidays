import type { Metadata } from "next";
import { PolicyView } from "@/components/company/PolicyView";
import { cookiesPage } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: cookiesPage.title,
  description: cookiesPage.description,
  path: cookiesPage.path,
});

export default function CookiesPage() {
  return <PolicyView page={cookiesPage} />;
}
