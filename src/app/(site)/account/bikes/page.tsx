import type { Metadata } from "next";
import { FleetAccountPage } from "@/components/account/FleetAccountPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Bike bookings",
  "Bike rentals on your World Compass Holidays account.",
);

export default async function AccountBikesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return <FleetAccountPage fleet="bike" view={view} />;
}
