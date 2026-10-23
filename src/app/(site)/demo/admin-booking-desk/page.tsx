import type { Metadata } from "next";
import { AdminBookingDeskShowcase } from "@/components/demo/AdminBookingDeskShowcase";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Admin booking desk demos",
  "Ops booking detail layouts for tour, hotel, car, bike, visa, and meet & assist.",
);

export default function AdminBookingDeskDemoPage() {
  return <AdminBookingDeskShowcase />;
}
