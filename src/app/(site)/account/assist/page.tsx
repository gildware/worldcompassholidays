import type { Metadata } from "next";
import { ModuleAccountPage } from "@/components/account/ModuleAccountPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Meet and assist",
  "Airport meet and assist requests on your World Compass Holidays account.",
);

export default function AccountAssistPage() {
  return <ModuleAccountPage module="assist" />;
}
