import type { Metadata } from "next";
import { ModuleAccountPage } from "@/components/account/ModuleAccountPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Hotel bookings",
  "Hotel requests on your World Compass Holidays account.",
);

export default function AccountHotelsPage() {
  return <ModuleAccountPage module="hotel" />;
}
