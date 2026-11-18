"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { isLocale } from "@/i18n/locales";
import { phraseCatalog } from "@/lib/i18n/phrases";

export async function saveUiPhrases(entries: { key: string; locale: string; value: string }[]) {
  await requirePermission("staff.manage");
  const catalog = phraseCatalog();
  const allowed = new Map(catalog.map((phrase) => [phrase.key, phrase.builtin]));
  const rows = entries.flatMap((entry) => {
    const builtin = allowed.get(entry.key);
    if (!builtin || !isLocale(entry.locale)) return [];
    const value = entry.value.trim();
    if (!value || value === builtin[entry.locale]) return [];
    return [{ key: entry.key, locale: entry.locale, value }];
  });

  await prisma.$transaction([
    prisma.uiPhrase.deleteMany({ where: { key: { in: [...allowed.keys()] } } }),
    ...(rows.length
      ? [
          prisma.uiPhrase.createMany({
            data: rows,
          }),
        ]
      : []),
  ]);

  revalidatePath("/", "layout");
  revalidatePath("/admin/languages");
  return { error: null as string | null, success: "Translations saved." };
}
