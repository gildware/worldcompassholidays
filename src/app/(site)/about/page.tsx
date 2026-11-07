import type { Metadata } from "next";
import { AboutView } from "@/components/company/AboutView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About World Compass Holidays",
  description:
    "World Compass Holidays is the travel DMC of Negotrip Private Limited — desks in six Indian cities, our own fleet in three, and trip quotes before you pay.",
  path: "/about",
  image: "/img/company/about-hero.jpg",
  imageAlt: "A compass and an atlas, with mountains and a tropical shore beyond the window",
  keywords: ["World Compass Holidays", "DMC India", "Negotrip", "travel company India"],
});

export default function AboutPage() {
  return <AboutView />;
}
