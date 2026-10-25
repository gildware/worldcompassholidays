"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { formatMoney } from "@/lib/format";
import { hasSearchableQuery, queryTokens, tokenVariants } from "@/lib/search/rank";
import { searchKinds, type SearchHit, type SearchKind } from "@/lib/search/types";

const DEBOUNCE_MS = 220;
const RECENT_KEY = "wch-catalog-recent";
const SUGGESTIONS = ["Kashmir", "Leh", "Manali", "Amarnath", "Dal Lake", "SUV", "Scooter"];
const PREVIEW = 3;

const kindLabel: Record<SearchKind, string> = {
  tour: "Tours",
  car: "Cars",
  bike: "Bikes",
  hotel: "Hotels",
};

const priceNote: Record<SearchKind, string> = {
  tour: "from",
  hotel: "a night",
  car: "a day",
  bike: "a day",
};

type Phase = "idle" | "short" | "waiting" | "loading" | "ready" | "error";

function loadRecents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function remember(term: string) {
  const clean = term.trim();
  if (clean.length < 2) return;
  const next = [clean, ...loadRecents().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

function forgetRecents() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* private mode */
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = [...new Set(queryTokens(query).flatMap(tokenVariants))].sort((a, b) => b.length - a.length);
  if (!text || !parts.length) return <>{text}</>;
  const pattern = parts.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const matcher = new RegExp(`^(?:${pattern})$`, "i");
  return (
    <>
      {text.split(new RegExp(`(${pattern})`, "ig")).map((chunk, index) =>
        matcher.test(chunk) ? <mark key={`${chunk}-${index}`}>{chunk}</mark> : <span key={`${chunk}-${index}`}>{chunk}</span>,
      )}
    </>
  );
}

function HitThumb({ hit }: { hit: SearchHit }) {
  const [failed, setFailed] = useState(false);
  if (!hit.image || failed) {
    return (
      <span className={`catalog-search__badge is-${hit.kind}`}>
        <KindIcon kind={hit.kind} />
      </span>
    );
  }
  return (
    <img
      className="catalog-search__photo"
      src={hit.image}
      alt=""
      width={88}
      height={72}
      onError={() => setFailed(true)}
    />
  );
}

function KindIcon({ kind }: { kind: SearchKind }) {
  if (kind === "car") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M7 11.2 8.5 8.2A2 2 0 0 1 10.3 7h3.4a2 2 0 0 1 1.8 1.2l1.5 3H18a1.8 1.8 0 0 1 1.8 1.8v1.7a.9.9 0 0 1-.9.9h-.7a1.55 1.55 0 0 1-3 0H8.8a1.55 1.55 0 0 1-3 0h-.7a.9.9 0 0 1-.9-.9v-1.7A1.8 1.8 0 0 1 6 11.2h1Z"
        />
      </svg>
    );
  }
  if (kind === "bike") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="6.5" cy="16" r="3" />
        <circle cx="17.5" cy="16" r="3" />
        <path d="M6.5 16 11 8h4l2.5 8M11 8 9 12h6" />
      </svg>
    );
  }
  if (kind === "hotel") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 19V7h16v12" />
        <path d="M8 19v-5h8v5M9 10h.01M12 10h.01M15 10h.01" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5 14.2 12.7 12 14.2 9.8 12.7 12 7.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CatalogSearch({
  open,
  onOpen,
  onClose,
  inputRef,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [filter, setFilter] = useState<SearchKind | "all">("all");
  const [active, setActive] = useState(-1);
  const [recents, setRecents] = useState<string[]>(() => (typeof window === "undefined" ? [] : loadRecents()));
  const [retry, setRetry] = useState(0);
  const request = useRef(0);
  const router = useRouter();

  function updateQuery(next: string) {
    setQuery(next);
    setFilter("all");
    onOpen();
    if (!hasSearchableQuery(next)) {
      setHits([]);
      setPhase(next.trim() ? "short" : "idle");
      return;
    }
    setPhase("waiting");
  }

  useEffect(() => {
    if (!open || !hasSearchableQuery(query)) return;

    const current = ++request.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (current !== request.current) return;
      setPhase("loading");
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("Search failed");
          return (await response.json()) as { hits?: SearchHit[] };
        })
        .then((data) => {
          if (current !== request.current) return;
          setHits(Array.isArray(data.hits) ? data.hits : []);
          setPhase("ready");
          setActive(0);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || current !== request.current) return;
          console.error(error);
          setHits([]);
          setPhase("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, retry]);

  const counts = useMemo(() => {
    const tally = { all: hits.length, tour: 0, car: 0, bike: 0, hotel: 0 };
    hits.forEach((hit) => {
      tally[hit.kind] += 1;
    });
    return tally;
  }, [hits]);

  const visible = filter === "all" ? hits : hits.filter((hit) => hit.kind === filter);
  const groups = useMemo(() => {
    const order: SearchKind[] = [];
    visible.forEach((hit) => {
      if (!order.includes(hit.kind)) order.push(hit.kind);
    });
    return order.map((kind) => ({
      kind,
      hits: visible.filter((hit) => hit.kind === kind),
    }));
  }, [visible]);

  const rows = groups.flatMap((group) => (filter === "all" ? group.hits.slice(0, PREVIEW) : group.hits));

  function choose(hit: SearchHit) {
    remember(query || hit.title);
    setRecents(loadRecents());
    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!rows.length) return;
      event.preventDefault();
      setActive((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        return Math.min(rows.length - 1, Math.max(0, next));
      });
    } else if (event.key === "Enter") {
      const hit = rows[active] ?? rows[0];
      if (!hit) return;
      event.preventDefault();
      choose(hit);
      router.push(hit.href);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      inputRef.current?.blur();
    }
  }

  const pending = phase === "waiting" || phase === "loading";
  const status =
    phase === "waiting"
      ? "Waiting…"
      : phase === "loading"
        ? "Searching…"
        : phase === "short"
          ? "Type one more letter"
          : phase === "error"
            ? "Search is unavailable"
            : phase === "ready"
              ? visible.length
                ? filter === "all"
                  ? `${counts.all} matches`
                  : `${visible.length} ${kindLabel[filter].toLowerCase()}`
                : "No matches"
              : "Search tours, cars, bikes, and hotels";

  return (
    <div className="catalog-search">
      <div className="catalog-search__field">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
        <label className="sr-only" htmlFor={`${listId}-q`}>
          Search tours, cars, bikes, and hotels
        </label>
        <input
          id={`${listId}-q`}
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search tours, cars, bikes, hotels"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${listId}-results`}
          aria-activedescendant={open && rows[active] ? `${listId}-hit-${active}` : undefined}
          onFocus={() => {
            setRecents(loadRecents());
            onOpen();
          }}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="catalog-search__clear"
            aria-label="Clear search"
            onClick={() => {
              updateQuery("");
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        ) : null}
        <span className={`catalog-search__wait${phase === "waiting" ? " is-on" : ""}`} />
      </div>

      {open ? (
        <div className={`catalog-search__panel${pending ? " is-pending" : ""}`} id={`${listId}-results`}>
          {phase === "ready" || phase === "loading" || phase === "waiting" ? (
            <div className="catalog-search__chips" role="toolbar" aria-label="Catalog">
              <FilterChip
                label="All"
                count={counts.all}
                pressed={filter === "all"}
                onClick={() => {
                  setFilter("all");
                  setActive(0);
                }}
              />
              {searchKinds.map((kind) => (
                <FilterChip
                  key={kind}
                  label={kindLabel[kind]}
                  count={counts[kind]}
                  pressed={filter === kind}
                  onClick={() => {
                    setFilter(kind);
                    setActive(0);
                  }}
                />
              ))}
            </div>
          ) : null}

          <p className="catalog-search__status" aria-live="polite">
            {status}
          </p>

          {phase === "error" ? (
            <div className="catalog-search__empty">
              <p>Search is unavailable right now.</p>
              <button
                type="button"
                onClick={() => {
                  setPhase("waiting");
                  setRetry((value) => value + 1);
                }}
              >
                Try again
              </button>
            </div>
          ) : null}

          {phase === "short" ? (
            <div className="catalog-search__empty">
              <p>Type one more letter.</p>
            </div>
          ) : null}

          {phase === "loading" && hits.length === 0 ? (
            <div className="catalog-search__skeleton" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          ) : null}

          {phase === "idle" ? (
            <div className="catalog-search__idle">
              {recents.length ? (
                <div>
                  <div className="catalog-search__label">
                    <p>Recent</p>
                    <button
                      type="button"
                      onClick={() => {
                        forgetRecents();
                        setRecents([]);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="catalog-search__picks">
                    {recents.map((term) => (
                      <button key={term} type="button" onClick={() => updateQuery(term)}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <p>Example searches</p>
                <div className="catalog-search__picks">
                  {SUGGESTIONS.map((term) => (
                    <button key={term} type="button" onClick={() => updateQuery(term)}>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {phase === "ready" && visible.length === 0 ? (
            <div className="catalog-search__empty">
              <p>
                Nothing matches “<strong>{query.trim()}</strong>”.
              </p>
              <div className="catalog-search__picks">
                {SUGGESTIONS.slice(0, 3).map((term) => (
                  <button key={term} type="button" onClick={() => updateQuery(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {groups.map((group) => {
            const shown = filter === "all" ? group.hits.slice(0, PREVIEW) : group.hits;
            return (
              <section key={group.kind} className="catalog-search__group">
                <h3>
                  <span>
                    {kindLabel[group.kind]} · {group.hits.length}
                  </span>
                  {filter === "all" && group.hits.length > PREVIEW ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFilter(group.kind);
                        setActive(0);
                      }}
                    >
                      All {group.hits.length}
                    </button>
                  ) : null}
                </h3>
                {shown.map((hit) => {
                  const index = rows.indexOf(hit);
                  const facts = [hit.style, hit.detail].filter(Boolean).join(" · ");
                  return (
                    <Link
                      key={`${hit.kind}-${hit.slug}`}
                      id={`${listId}-hit-${index}`}
                      href={hit.href}
                      className={`catalog-search__row${index === active ? " is-on" : ""}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(hit)}
                    >
                      <HitThumb hit={hit} />
                      <span className="catalog-search__copy">
                        <strong>
                          <Highlight text={hit.title} query={query} />
                        </strong>
                        {hit.place ? (
                          <span className="catalog-search__place">
                            <svg viewBox="0 0 24 24" aria-hidden>
                              <path
                                fill="currentColor"
                                d="M12 2.5a7 7 0 0 0-7 7c0 5.1 6.1 11.3 6.4 11.6a.9.9 0 0 0 1.2 0C12.9 20.8 19 14.6 19 9.5a7 7 0 0 0-7-7Zm0 9.4a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"
                              />
                            </svg>
                            <Highlight text={hit.place} query={query} />
                          </span>
                        ) : null}
                        {facts ? (
                          <span className="catalog-search__facts">
                            <Highlight text={facts} query={query} />
                          </span>
                        ) : null}
                        {hit.price > 0 ? (
                          <span className="catalog-search__price">
                            {formatMoney(hit.price, hit.currency)}
                            <small>{priceNote[hit.kind]}</small>
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </section>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="catalog-search__chip" aria-pressed={pressed} onClick={onClick}>
      {label} <b>{count}</b>
    </button>
  );
}
