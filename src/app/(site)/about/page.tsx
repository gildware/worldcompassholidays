import type { Metadata } from "next";
import { AboutView } from "@/components/company/AboutView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description:
    "World Compass Holidays is the DMC of Negotrip Private Limited, with desks in six Indian cities and its own fleet in three.",
  path: "/about",
  image: "/img/company/about-hero.jpg",
  imageAlt: "A compass and an atlas, with mountains and a tropical shore beyond the window",
});

export default function AboutPage() {
  return <AboutView />;
}
