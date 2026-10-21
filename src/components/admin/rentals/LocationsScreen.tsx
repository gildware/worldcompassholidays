import { PickupLocations } from "@/components/admin/rentals/PickupLocations";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { mapApiKey } from "@/lib/map-key";
import { getRentalSetup } from "@/lib/rentals/setup";

export async function LocationsScreen({
  fleet,
  blocked,
}: {
  fleet: "car" | "bike";
  blocked?: boolean;
}) {
  const user = await requirePermission("vehicles.view");
  const setup = await getRentalSetup(fleet);

  return (
    <PickupLocations
      fleet={fleet}
      mapApiKey={mapApiKey()}
      manage={can(user, "vehicles.manage")}
      blocked={blocked}
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
