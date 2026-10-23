import {
  CatalogWorkspace,
  type CatalogRow,
} from "@/components/admin/CatalogWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { isCatalogKind } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getHotelSettings } from "@/lib/hotels/settings";

export async function CatalogConfigScreen({
  section,
}: {
  section: "tours" | "hotels";
}) {
  await requirePermission(section === "hotels" ? "hotels.manage" : "tours.manage");

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
    />
  );
}
