import { cache } from "react";
import { cookies, headers } from "next/headers";
import { messages, type Messages } from "@/i18n/messages";
import { detectLocale, isLocale, LOCALE_COOKIE, localeDir, type Locale, type LocaleDirection } from "@/i18n/locales";
import { sitePhrases } from "@/i18n/site-phrases";
import { applyPhraseOverrides } from "@/lib/i18n/phrases";
import { prisma } from "@/lib/db";

export const getPathname = cache(async () => {
  const headerList = await headers();
  return headerList.get("x-pathname") ?? "";
});

export const getUserLocale = cache(async (): Promise<Locale> => {
  // The proxy header is stamped at the start of the request. A language switch
  // updates the cookie in that same request, so the cookie has to win or the
  // refreshed page keeps the previous language until a full reload.
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerList = await headers();
  const fromProxy = headerList.get("x-user-locale");
  if (isLocale(fromProxy)) return fromProxy;

  return detectLocale(headerList.get("accept-language"));
});

export async function getMessagesFor(locale: Locale): Promise<Messages> {
  const base = messages[locale];
  const phrases = prisma.uiPhrase;
  if (!phrases) return base;
  const rows = await phrases.findMany({
    where: { locale },
    select: { key: true, value: true },
  });
  if (rows.length === 0) return base;
  return applyPhraseOverrides(base, rows);
}

export async function getMessages(): Promise<Messages> {
  return getMessagesFor(await getUserLocale());
}

/** English source text → the string to show for the current locale, including saved edits. */
export const getUiDictionary = cache(async (): Promise<Record<string, string>> => {
  const locale = await getUserLocale();
  const map: Record<string, string> = {};
  for (const phrase of sitePhrases) {
    const builtin = phrase[locale]?.trim();
    if (builtin) map[phrase.en] = builtin;
  }
  const phrases = prisma.uiPhrase;
  if (!phrases) return map;
  const rows = await phrases.findMany({
    where: { locale },
    select: { key: true, value: true },
  });
  const byKey = new Map(sitePhrases.map((phrase) => [phrase.key, phrase]));
  for (const row of rows) {
    const phrase = byKey.get(row.key);
    const value = row.value.trim();
    if (!phrase || !value) continue;
    map[phrase.en] = value;
  }
  return map;
});

export async function getDocumentLocale(): Promise<{ locale: Locale; dir: LocaleDirection }> {
  const pathname = await getPathname();
  if (pathname.startsWith("/admin")) return { locale: "en", dir: "ltr" };
  const locale = await getUserLocale();
  return { locale, dir: localeDir(locale) };
}
