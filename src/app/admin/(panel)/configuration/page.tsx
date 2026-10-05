import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CatalogWorkspace,
  type CatalogRow,
} from "@/components/admin/CatalogWorkspace";
import { modules } from "@/config/modules";
import { isCatalogKind } from "@/lib/catalog";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Configuration" };

export default async function ConfigurationPage() {
  if (!modules.tours) notFound();
  await requirePermission("tours.manage");

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

  return <CatalogWorkspace items={items} />;
}
