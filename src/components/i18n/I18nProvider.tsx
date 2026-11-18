"use client";

import { createContext, useContext } from "react";
import type { Messages } from "@/i18n/messages";
import { localeDir, type Locale, type LocaleDirection } from "@/i18n/locales";
import { formatMoney, formatNumber, localizeNumerals } from "@/lib/format";

type I18nValue = {
  locale: Locale;
  dir: LocaleDirection;
  messages: Messages;
  dictionary: Record<string, string>;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  dictionary = {},
  children,
}: {
  locale: Locale;
  messages: Messages;
  dictionary?: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dir: localeDir(locale), messages, dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

export function useCopy() {
  const { dictionary } = useI18n();
  return (value: string) =>
    Object.prototype.hasOwnProperty.call(dictionary, value) ? dictionary[value] : value;
}

export function useFormatMoney() {
  const { locale } = useI18n();
  return (amount: number, currency = "INR") => formatMoney(amount, currency, locale);
}

export function useFormatNumber() {
  const { locale } = useI18n();
  return (amount: number) => formatNumber(amount, locale);
}

export function useLocalizeNumerals() {
  const { locale } = useI18n();
  return (value: string) => localizeNumerals(value, locale);
}
