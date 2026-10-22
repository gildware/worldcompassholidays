import type { Metadata } from "next";
import { FleetAccountPage } from "@/components/account/FleetAccountPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Car bookings",
  "Car rentals on your World Compass Holidays account.",
);

export default async function AccountCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return <FleetAccountPage fleet="car" view={view} />;
}
