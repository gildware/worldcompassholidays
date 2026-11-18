import { messages, type Messages } from "@/i18n/messages";
import { locales, type Locale } from "@/i18n/locales";
import { sitePhrases } from "@/i18n/site-phrases";

export type Phrase = {
  key: string;
  page: string;
  group: string;
  english: string;
  builtin: Record<Locale, string>;
};

export const phrasePages = [
  { id: "menu", label: "Menu" },
  { id: "footer", label: "Footer" },
  { id: "home", label: "Home" },
  { id: "tours", label: "Tours" },
  { id: "hotels", label: "Hotels" },
  { id: "destinations", label: "Destinations" },
  { id: "rentals", label: "Cars & bikes" },
  { id: "buses", label: "Buses" },
  { id: "visa", label: "Visa" },
  { id: "assist", label: "Meet & assist" },
  { id: "contact", label: "Contact" },
  { id: "company", label: "Company" },
  { id: "account", label: "Account" },
  { id: "shared", label: "Shared" },
] as const;

const messagePage: Record<string, string> = {
  nav: "menu",
  tabs: "menu",
  more: "menu",
  header: "menu",
  footer: "footer",
  company: "footer",
  policy: "footer",
  contactForm: "contact",
};

const groupLabels: Record<string, string> = {
  menu: "Menu",
  footer: "Footer",
  home: "Home",
  tours: "Tours",
  hotels: "Hotels",
  destinations: "Destinations",
  rentals: "Cars & bikes",
  buses: "Buses",
  visa: "Visa",
  assist: "Meet & assist",
  contact: "Contact",
  company: "Company",
  account: "Account",
  shared: "Shared",
  nav: "Menu",
  tabs: "Phone tabs",
  more: "More menu",
  policy: "Policies",
  header: "Header",
  contactForm: "Contact form",
};

export function phraseGroupLabel(group: string) {
  return groupLabels[group] ?? group;
}

function emptyBuiltin(): Record<Locale, string> {
  return { en: "", fr: "", hi: "", he: "", ar: "", ur: "" };
}

export function phraseCatalog(): Phrase[] {
  const bucket = new Map<string, Phrase>();

  function walk(locale: Locale, value: unknown, prefix: string, page: string) {
    if (typeof value === "string") {
      const current = bucket.get(prefix);
      if (!current) {
        bucket.set(prefix, {
          key: prefix,
          page,
          group: page,
          english: locale === "en" ? value : "",
          builtin: emptyBuiltin(),
        });
      }
      const row = bucket.get(prefix)!;
      row.builtin[locale] = value;
      if (locale === "en") row.english = value;
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      const nextPage = prefix ? page : (messagePage[key] ?? key);
      walk(locale, child, nextPrefix, nextPage);
    }
  }

  for (const locale of locales) walk(locale, messages[locale], "", "menu");

  const rows = [...bucket.values()];
  for (const phrase of sitePhrases) {
    rows.push({
      key: phrase.key,
      page: phrase.page,
      group: phrase.page,
      english: phrase.en,
      builtin: {
        en: phrase.en,
        fr: phrase.fr,
        hi: phrase.hi,
        he: phrase.he,
        ar: phrase.ar,
        ur: phrase.ur,
      },
    });
  }
  return rows;
}

export function flattenMessages(locale: Locale) {
  const flat: Record<string, string> = {};
  function walk(value: unknown, prefix: string) {
    if (typeof value === "string") {
      flat[prefix] = value;
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      walk(child, prefix ? `${prefix}.${key}` : key);
    }
  }
  walk(messages[locale], "");
  return flat;
}

function setPath(target: Record<string, unknown>, key: string, value: string) {
  const parts = key.split(".");
  let cursor: Record<string, unknown> = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const next = cursor[part];
    if (!next || typeof next !== "object") return;
    cursor = next as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1];
  if (typeof cursor[leaf] === "string") cursor[leaf] = value;
}

export function applyPhraseOverrides(base: Messages, rows: { key: string; value: string }[]): Messages {
  const next = structuredClone(base);
  for (const row of rows) {
    const value = row.value.trim();
    if (!value) continue;
    setPath(next as unknown as Record<string, unknown>, row.key, value);
  }
  return next;
}
