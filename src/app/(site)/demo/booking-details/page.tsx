import type { Metadata } from "next";
import { BookingDetailShowcase } from "@/components/demo/BookingDetailShowcase";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Booking detail demos",
  "Market-beating booking detail layouts for tours, hotels, cars, bikes, visa, and meet & assist.",
);

export default function BookingDetailDemoPage() {
  return <BookingDetailShowcase />;
}
