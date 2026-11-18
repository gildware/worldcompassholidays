import type { Metadata } from "next";
import { LanguagesScreen } from "@/components/admin/LanguagesScreen";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { locales } from "@/i18n/locales";
import { phraseCatalog } from "@/lib/i18n/phrases";

export const metadata: Metadata = { title: "Languages" };

export default async function LanguagesPage() {
  await requirePermission("staff.manage");
  const phrases = phraseCatalog();
  const rows = await prisma.uiPhrase.findMany({
    where: { locale: { in: [...locales] } },
    select: { key: true, locale: true, value: true },
  });
  const saved: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    const bucket = saved[row.locale] ?? {};
    bucket[row.key] = row.value;
    saved[row.locale] = bucket;
  }

  return <LanguagesScreen phrases={phrases} saved={saved} />;
}
