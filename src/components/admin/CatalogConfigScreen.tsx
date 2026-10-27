import {
  CatalogWorkspace,
  type CatalogRow,
} from "@/components/admin/CatalogWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { isCatalogKind, type CatalogKind } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getHotelSettings } from "@/lib/hotels/settings";
import { mapApiKey } from "@/lib/map-key";

export async function CatalogConfigScreen({
  section,
  kinds,
}: {
  section: "tours" | "hotels" | "buses";
  kinds?: CatalogKind[];
}) {
  await requirePermission(
    section === "hotels" ? "hotels.manage" : section === "buses" ? "buses.manage" : "tours.manage",
  );

  const rows = await prisma.catalogItem.findMany({
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
  const items: CatalogRow[] = rows.flatMap((row) => {
    if (!isCatalogKind(row.kind)) return [];
    return [
      {
        id: row.id,
        kind: row.kind,
        title: row.title,
        content: row.content,
        iconUrl: row.iconUrl,
        iconKey: row.iconKey,
        iconDriver: row.iconDriver === "cloudinary" ? "cloudinary" : "local",
        mapLat: row.mapLat,
        mapLng: row.mapLng,
        mapZoom: row.mapZoom,
      },
    ];
  });

  const hotelTaxEnabled =
    section === "hotels" ? (await getHotelSettings()).taxEnabled : false;

  return (
    <CatalogWorkspace
      items={items}
      sections={[section]}
      initialSection={section}
      hotelTaxEnabled={hotelTaxEnabled}
      hideSectionTabs
      onlyKinds={kinds}
      mapApiKey={mapApiKey()}
    />
  );
}
