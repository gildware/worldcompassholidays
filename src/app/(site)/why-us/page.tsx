import type { Metadata } from "next";
import { WhyUsView } from "@/components/company/WhyUsView";
import { pageMetadata } from "@/lib/seo";
import { whyUsPage } from "@/lib/why-us";

export const metadata: Metadata = pageMetadata({
  title: whyUsPage.kicker,
  description: whyUsPage.subtitle,
  path: "/why-us",
  image: "/img/company/about-hero.jpg",
  imageAlt: "A compass and atlas on a travel desk",
  keywords: [
    "Why book with World Compass Holidays",
    "India travel DMC",
    "Negotrip Private Limited",
    "local travel desks India",
  ],
});

export default function WhyUsPage() {
  return <WhyUsView />;
}
