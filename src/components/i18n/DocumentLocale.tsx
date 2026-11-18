"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import type { Locale, LocaleDirection } from "@/i18n/locales";

export function DocumentLocale({ locale, dir }: { locale: Locale; dir: LocaleDirection }) {
  const pathname = usePathname() || "/";
  const admin = pathname.startsWith("/admin");
  const lang = admin ? "en" : locale;
  const direction = admin ? "ltr" : dir;

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
  }, [lang, direction]);

  return null;
}
