"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { setLocaleAction } from "@/actions/locale";
import { useI18n } from "@/components/i18n/I18nProvider";
import { LOCALE_COOKIE, localeChoices, localeDir, type Locale } from "@/i18n/locales";

export function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { locale, messages } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = localeChoices.find((choice) => choice.id === locale) ?? localeChoices[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    document.documentElement.lang = next;
    document.documentElement.dir = localeDir(next);
    // Write the cookie before the server action so that request, and the
    // refresh after it, already carry the language the visitor just picked.
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div className="lang-switch" ref={rootRef} translate="no" data-skip-i18n="">
      <button
        type="button"
        className="lang-switch__btn"
        aria-label={messages.header.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lang-switch__flag" aria-hidden="true">
          {current.flag}
        </span>
        <span className="lang-switch__name" lang={current.id} dir={localeDir(current.id)}>
          {current.label}
        </span>
      </button>
      {open ? (
        <ul className="lang-switch__menu" id={listId} role="listbox" aria-label={messages.header.language}>
          {localeChoices.map((choice) => {
            const selected = choice.id === locale;
            return (
              <li key={choice.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  className="lang-switch__option"
                  aria-selected={selected}
                  onClick={() => choose(choice.id)}
                >
                  <span className="lang-switch__flag" aria-hidden="true">
                    {choice.flag}
                  </span>
                  <span className="lang-switch__name" lang={choice.id} dir={localeDir(choice.id)}>
                    {choice.label}
                  </span>
                  <span className="lang-switch__short" dir="ltr">
                    {choice.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
