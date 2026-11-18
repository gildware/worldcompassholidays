import type { Locale } from "@/i18n/locales";
import rows from "@/i18n/site-phrases.json";

export type SitePhrase = {
  key: string;
  page: string;
  en: string;
  fr: string;
  hi: string;
  he: string;
  ar: string;
  ur: string;
};

export const sitePhrases = rows as SitePhrase[];

const byEnglish = new Map<string, SitePhrase>();
for (const row of sitePhrases) {
  if (!byEnglish.has(row.en)) byEnglish.set(row.en, row);
}

export function lookupSitePhrase(english: string, locale: Locale): string | undefined {
  const row = byEnglish.get(english);
  if (!row) return undefined;
  const value = row[locale]?.trim();
  return value || undefined;
}
