"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveUiPhrases } from "@/actions/languages";
import { Button } from "@/components/ui/Button";
import { localeChoices, rtlLocales, type Locale } from "@/i18n/locales";
import { phraseGroupLabel, phrasePages, type Phrase } from "@/lib/i18n/phrases";

const LONG = 72;

export function LanguagesScreen({
  phrases,
  saved,
}: {
  phrases: Phrase[];
  saved: Record<string, Record<string, string>>;
}) {
  const router = useRouter();
  const [page, setPage] = useState<string>(phrasePages[0].id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, Record<string, string>>>(() => {
    const next: Record<string, Record<string, string>> = {};
    for (const choice of localeChoices) {
      const bucket: Record<string, string> = {};
      for (const phrase of phrases) {
        bucket[phrase.key] = saved[choice.id]?.[phrase.key] ?? phrase.builtin[choice.id] ?? "";
      }
      next[choice.id] = bucket;
    }
    return next;
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const phrase of phrases) map.set(phrase.page, (map.get(phrase.page) ?? 0) + 1);
    return map;
  }, [phrases]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return phrases.filter((phrase) => {
      if (phrase.page !== page) return false;
      if (!needle) return true;
      if (phrase.english.toLowerCase().includes(needle) || phrase.key.toLowerCase().includes(needle)) return true;
      return localeChoices.some((choice) => (draft[choice.id]?.[phrase.key] ?? "").toLowerCase().includes(needle));
    });
  }, [draft, page, phrases, query]);

  function setValue(locale: Locale, key: string, value: string) {
    setDraft((current) => ({
      ...current,
      [locale]: { ...current[locale], [key]: value },
    }));
  }

  function save() {
    setError(null);
    setMessage(null);
    const entries = phrases.flatMap((phrase) =>
      localeChoices.map((choice) => ({
        key: phrase.key,
        locale: choice.id,
        value: draft[choice.id]?.[phrase.key] ?? "",
      })),
    );
    startTransition(async () => {
      const result = await saveUiPhrases(entries);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success ?? "Translations saved.");
      router.refresh();
    });
  }

  return (
    <div className="flex h-[calc(100dvh-7.25rem)] min-h-[28rem] flex-col gap-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-navy">Languages</h1>
          <p className="text-xs text-muted">
            One page at a time. Each language is a column. Empty text falls back to the built-in line.
            Record descriptions stay on the tour, hotel, and destination.
          </p>
        </div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save all languages"}
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-0.5" role="tablist" aria-label="Pages">
        {phrasePages.map((item) => {
          const count = counts.get(item.id) ?? 0;
          if (!count) return null;
          const active = item.id === page;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPage(item.id)}
              className={[
                "shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold",
                active ? "border-brand bg-brand-soft text-navy" : "border-line bg-white text-navy hover:bg-surface",
              ].join(" ")}
            >
              {item.label}
              <span className="ml-1 font-medium text-muted">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${phraseGroupLabel(page)}`}
          className="h-8 w-full max-w-sm rounded-md border border-line bg-white px-2 text-xs"
        />
        <p className="text-[11px] text-muted">
          {visible.length} lines
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-navy">{message}</p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-line bg-white">
        <table className="w-max min-w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-surface text-left">
            <tr>
              {localeChoices.map((choice) => (
                <th key={choice.id} className="border-b border-line px-1.5 py-1.5 font-semibold text-navy">
                  <span lang={choice.id}>{choice.label}</span>
                  <span className="ml-1 font-medium text-muted">{choice.short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((phrase) => {
              const long = phrase.english.length > LONG || phrase.english.includes("\n");
              return (
                <tr key={phrase.key} className="border-b border-line align-top last:border-b-0" title={phrase.key}>
                  {localeChoices.map((choice) => {
                    const dir = rtlLocales.has(choice.id) ? "rtl" : "ltr";
                    const value = draft[choice.id]?.[phrase.key] ?? "";
                    const className =
                      "w-[11.5rem] rounded border border-line bg-white px-1.5 py-1 text-xs leading-4 outline-none focus:border-brand";
                    return (
                      <td key={choice.id} className="px-1 py-1">
                        {long ? (
                          <textarea
                            value={value}
                            dir={dir}
                            lang={choice.id}
                            rows={2}
                            aria-label={`${choice.label} · ${phrase.english}`}
                            className={`${className} min-h-8 resize-y`}
                            onChange={(event) => setValue(choice.id, phrase.key, event.target.value)}
                          />
                        ) : (
                          <input
                            value={value}
                            dir={dir}
                            lang={choice.id}
                            aria-label={`${choice.label} · ${phrase.english}`}
                            className={`${className} h-7`}
                            onChange={(event) => setValue(choice.id, phrase.key, event.target.value)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted">Nothing on this page matches.</p>
        ) : null}
      </div>
    </div>
  );
}
