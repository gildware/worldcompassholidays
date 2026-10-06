import type { Metadata } from "next";
import { PickupLocations } from "@/components/admin/rentals/PickupLocations";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { mapApiKey } from "@/lib/map-key";
import { getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Pickup locations" };

export default async function RentalLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>;
}) {
  const user = await requirePermission("vehicles.view");
  const setup = await getRentalSetup();
  const { blocked } = await searchParams;

  return (
    <PickupLocations
      mapApiKey={mapApiKey()}
      manage={can(user, "vehicles.manage")}
      blocked={blocked === "used"}
      locations={setup.locations.map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        active: location.active,
        mapLat: location.mapLat,
        mapLng: location.mapLng,
        mapZoom: location.mapZoom,
        imageUrl: location.imageUrl,
        imageKey: location.imageKey,
        imageDriver: location.imageDriver,
      }))}
    />
  );
}
