import type { Metadata } from "next";
import { HelpView } from "@/components/company/HelpView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Help & Trip Support",
  description:
    "How World Compass Holidays quotes a trip, where our desks are, how payments work, and what happens if you need to change or cancel.",
  path: "/help",
  image: "/img/company/help-hero.jpg",
  imageAlt: "A traveller by a window with a compass and a cup of tea",
});

export default function HelpPage() {
  return <HelpView />;
}
