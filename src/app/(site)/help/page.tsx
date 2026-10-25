import type { Metadata } from "next";
import { HelpView } from "@/components/company/HelpView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Help",
  description:
    "How World Compass Holidays quotes a trip, where the offices are, and what happens if you need to cancel.",
  path: "/help",
  image: "/img/company/help-hero.jpg",
  imageAlt: "A traveller by a window with a compass and a cup of tea",
});

export default function HelpPage() {
  return <HelpView />;
}
