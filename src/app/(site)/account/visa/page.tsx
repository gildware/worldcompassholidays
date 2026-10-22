import type { Metadata } from "next";
import { ModuleAccountPage } from "@/components/account/ModuleAccountPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Visa requests",
  "Visa requests on your World Compass Holidays account.",
);

export default function AccountVisaPage() {
  return <ModuleAccountPage module="visa" />;
}
