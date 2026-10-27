import type { Metadata } from "next";
import { HomeCardShowcase } from "@/components/demo/HomeCardShowcase";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Home card demos",
  "Interactive card patterns for the World Compass Holidays home page.",
);

export default function HomeCardDemoPage() {
  return <HomeCardShowcase />;
}
