import type { Metadata } from "next";
import { PolicyView } from "@/components/company/PolicyView";
import { termsPage } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: termsPage.title,
  description: termsPage.description,
  path: termsPage.path,
});

export default function TermsPage() {
  return <PolicyView page={termsPage} />;
}
