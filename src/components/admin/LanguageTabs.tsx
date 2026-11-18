"use client";

import { localeChoices, type Locale } from "@/i18n/locales";

export function LanguageTabs({
  locale,
  onChange,
  filled,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  filled?: Partial<Record<Locale, boolean>>;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Language">
      {localeChoices.map((choice) => {
        const active = choice.id === locale;
        const optional = choice.id !== "en";
        return (
          <button
            key={choice.id}
            type="button"
            role="tab"
            aria-selected={active}
            lang={choice.id}
            onClick={() => onChange(choice.id)}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              active ? "border-brand bg-brand-soft text-navy" : "border-line bg-white text-navy hover:bg-surface",
            ].join(" ")}
          >
            <span>{choice.label}</span>
            {optional ? <span className="font-medium text-muted">optional</span> : null}
            {filled?.[choice.id] ? <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-label="Filled" /> : null}
          </button>
        );
      })}
    </div>
  );
}
