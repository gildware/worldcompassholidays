import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CatalogWorkspace,
  type CatalogRow,
} from "@/components/admin/CatalogWorkspace";
import type { ConfigRow } from "@/components/admin/rentals/ConfigWorkspace";
import { modules } from "@/config/modules";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { isCatalogKind } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { isRentalConfigKind } from "@/lib/rentals/labels";
import { getRentalSetup } from "@/lib/rentals/setup";

export const metadata: Metadata = { title: "Configuration" };

export default async function ConfigurationPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const user = await requireStaff();
  const toursOn = modules.tours && can(user, "tours.manage");
  const hotelsOn = modules.hotels && can(user, "hotels.manage");
  const rentalsOn = (modules.cars || modules.bikes) && can(user, "vehicles.manage");
  if (!toursOn && !hotelsOn && !rentalsOn) redirect("/admin/no-access");

  const { section } = await searchParams;
  let items: CatalogRow[] = [];
  if (toursOn || hotelsOn) {
    const rows = await prisma.catalogItem.findMany({
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
    });
    items = rows.flatMap((row) => {
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
  }

  let rentalItems: ConfigRow[] | undefined;
  if (rentalsOn) {
    const setup = await getRentalSetup();
    rentalItems = setup.configs.flatMap((item) =>
      isRentalConfigKind(item.kind)
        ? [
            {
              id: item.id,
              kind: item.kind,
              name: item.name,
              description: item.description,
              appliesTo: item.appliesTo,
              active: item.active,
              sortOrder: item.sortOrder,
              price: item.price,
              priceUnit: item.priceUnit,
              requiresNumber: item.requiresNumber,
              requiresIssueDate: item.requiresIssueDate,
              requiresExpiry: item.requiresExpiry,
            },
          ]
        : [],
    );
  }

  const sections = [
    ...(toursOn ? ["tours"] : []),
    ...(hotelsOn ? ["hotels"] : []),
    ...(rentalsOn ? ["rentals"] : []),
  ];
  const initialSection = sections.includes(section ?? "")
    ? section
    : sections[0];

  return (
    <CatalogWorkspace
      items={items}
      rentalItems={rentalItems}
      sections={sections}
      initialSection={initialSection}
    />
  );
}
