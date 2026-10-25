import type { Metadata } from "next";
import { PolicyView } from "@/components/company/PolicyView";
import { privacyPage } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: privacyPage.title,
  description: privacyPage.description,
  path: privacyPage.path,
});

export default function PrivacyPage() {
  return <PolicyView page={privacyPage} />;
}
