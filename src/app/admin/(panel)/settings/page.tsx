import type { Metadata } from "next";
import { SettingsScreen } from "@/components/admin/SettingsScreen";
import { requirePermission } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/brand";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("staff.manage");
  const settings = await getSiteSettings();

  return <SettingsScreen settings={settings} />;
}
