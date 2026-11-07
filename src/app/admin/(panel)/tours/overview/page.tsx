import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogModuleOverview } from "@/components/admin/CatalogModuleOverview";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { loadCatalogOverview } from "@/lib/catalog-overview";

export const metadata: Metadata = { title: "Tours overview" };

export const dynamic = "force-dynamic";

export default async function AdminToursOverviewPage() {
  if (!modules.tours) notFound();
  await requirePermission("tours.view");
  const data = await loadCatalogOverview("tour");
  return <CatalogModuleOverview data={data} />;
}
