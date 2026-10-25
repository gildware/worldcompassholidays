import type { Metadata } from "next";
import { PolicyView } from "@/components/company/PolicyView";
import { cancellationPage } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: cancellationPage.title,
  description: cancellationPage.description,
  path: cancellationPage.path,
});

export default function CancellationPage() {
  return <PolicyView page={cancellationPage} />;
}
