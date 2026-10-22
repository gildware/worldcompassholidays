import type { Metadata } from "next";
import { ModuleAccountPage } from "@/components/account/ModuleAccountPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Tour bookings",
  "Tour and trek bookings on your World Compass Holidays account.",
);

export default function AccountToursPage() {
  return <ModuleAccountPage module="tour" />;
}
