import type { Locale } from "@/i18n/locales";

const intlTags: Record<Locale, string> = {
  en: "en-IN",
  fr: "fr-FR",
  hi: "hi-IN-u-nu-deva",
  he: "he-IL",
  ar: "ar-u-nu-arab",
  ur: "ur-PK-u-nu-arabext",
};

const nativeDigits: Partial<Record<Locale, string>> = {
  hi: "०१२३४५६७८९",
  ar: "٠١٢٣٤٥٦٧٨٩",
  ur: "۰۱۲۳۴۵۶۷۸۹",
};

export function intlLocale(locale: Locale = "en") {
  return intlTags[locale] ?? "en-IN";
}

export function formatNumber(amount: number, locale: Locale = "en") {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(amount);
}

export function formatMoney(amount: number, currency = "INR", locale: Locale = "en") {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const moneyPattern = /(?:₹|\$|€)\s?[\d,]+|AED\s[\d,]+/g;

/** Rewrite prices into the active language, then any remaining Western digits. */
export function localizeNumerals(value: string, locale: Locale = "en") {
  if (!value || locale === "en") return value;
  const withMoney = value.replace(moneyPattern, (chunk) => {
    const amount = Number(chunk.replace(/[^\d]/g, ""));
    if (!Number.isFinite(amount)) return chunk;
    const currency = chunk.includes("$") ? "USD" : chunk.includes("€") ? "EUR" : chunk.includes("AED") ? "AED" : "INR";
    return formatMoney(amount, currency, locale);
  });
  const table = nativeDigits[locale];
  if (!table) return withMoney;
  return withMoney.replace(/\d/g, (digit) => table[Number(digit)] ?? digit);
}

export function formatDate(value: Date, locale: Locale = "en") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(value: Date, locale: Locale = "en") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
