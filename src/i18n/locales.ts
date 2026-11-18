export const locales = ["en", "fr", "hi", "he", "ar", "ur"] as const;

export type Locale = (typeof locales)[number];

export const LOCALE_COOKIE = "wch_locale";

export const rtlLocales = new Set<Locale>(["he", "ar", "ur"]);

export type LocaleDirection = "ltr" | "rtl";

export const localeChoices: { id: Locale; label: string; short: string; flag: string }[] = [
  { id: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { id: "fr", label: "Français", short: "FR", flag: "🇫🇷" },
  { id: "hi", label: "हिन्दी", short: "हि", flag: "🇮🇳" },
  { id: "he", label: "עברית", short: "עב", flag: "🇮🇱" },
  { id: "ar", label: "العربية", short: "ع", flag: "🇸🇦" },
  { id: "ur", label: "اردو", short: "ار", flag: "🇵🇰" },
];

const localeSet = new Set<string>(locales);

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

export function localeDir(locale: Locale): LocaleDirection {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

const englishNames: Record<Locale, string> = {
  en: "English",
  fr: "French",
  hi: "Hindi",
  he: "Hebrew",
  ar: "Arabic",
  ur: "Urdu",
};

export function localeEnglishName(locale: string) {
  return isLocale(locale) ? englishNames[locale] : locale;
}

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return "en";

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tagPart, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qParam ? Number(qParam.split("=")[1]) : 1;
      return { tag: tagPart.toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((part) => part.tag && part.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const part of ranked) {
    const primary = part.tag.split("-")[0];
    if (primary === "iw") return "he";
    if (isLocale(primary)) return primary;
  }

  return "en";
}
