"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/actions/favorites";
import { showFavoriteToast } from "@/components/favorites/FavoriteButton";
import { favoriteKindLabel, favoriteKinds, type FavoriteCard, type FavoriteKind } from "@/lib/favorite-kinds";

const browse: Record<FavoriteKind, { href: string; label: string }> = {
  tour: { href: "/tours", label: "Browse tours" },
  hotel: { href: "/hotels", label: "Browse hotels" },
  car: { href: "/rentals/cars", label: "Browse cars" },
  bike: { href: "/rentals/bikes", label: "Browse bikes" },
};

export function FavoriteList({ items }: { items: FavoriteCard[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const itemKey = items.map((item) => item.id).join("\0");
  const [filter, setFilter] = useState<FavoriteKind | "all">("all");
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setRows(items);
  }, [itemKey, items]);

  const counts = useMemo(() => {
    const next = { tour: 0, hotel: 0, car: 0, bike: 0 };
    for (const row of rows) next[row.kind] += 1;
    return next;
  }, [rows]);
  const visible = filter === "all" ? rows : rows.filter((row) => row.kind === filter);
  const kinds = favoriteKinds.filter((kind) => counts[kind] > 0 || filter === kind);

  async function remove(row: FavoriteCard) {
    if (pendingId) return;
    setError("");
    setPendingId(row.id);
    const previous = rows;
    setRows((current) => current.filter((item) => item.id !== row.id));
    const result = await toggleFavorite(row.kind, row.itemId);
    setPendingId("");
    if (!result.ok || result.saved) {
      setRows(previous);
      setError(result.ok ? "That item is still in your favorites." : "Could not remove that favorite. Try again.");
      return;
    }
    showFavoriteToast("Removed from favorites", "remove");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-1 overflow-x-auto">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          All · {rows.length}
        </FilterButton>
        {kinds.map((kind) => (
          <FilterButton key={kind} active={filter === kind} onClick={() => setFilter(kind)}>
            {favoriteKindLabel[kind]} · {counts[kind]}
          </FilterButton>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
          <p>{filter === "all" ? "No favorites yet." : `No ${favoriteKindLabel[filter].toLowerCase()} favorites yet.`}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(filter === "all" ? favoriteKinds : [filter]).map((kind) => (
              <Link key={kind} href={browse[kind].href} className="text-sm font-medium text-brand">
                {browse[kind].label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <Link href={item.href} className="flex gap-3 p-3 hover:bg-surface">
                {item.image ? (
                  <img src={item.image} alt="" className="h-20 w-24 shrink-0 rounded object-cover" />
                ) : (
                  <span className="flex h-20 w-24 shrink-0 items-center justify-center rounded bg-surface text-lg text-brand">
                    ♥
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {favoriteKindLabel[item.kind]}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium">{item.title}</span>
                  {item.meta ? <span className="mt-0.5 block truncate text-xs text-muted">{item.meta}</span> : null}
                  {item.price ? <span className="mt-1 block text-xs font-medium">{item.price}</span> : null}
                </span>
              </Link>
              <div className="border-t border-line px-3 py-2">
                <button
                  type="button"
                  className="text-xs font-medium text-rose-700 hover:underline disabled:opacity-60"
                  disabled={pendingId === item.id}
                  onClick={() => void remove(item)}
                >
                  {pendingId === item.id ? "Removing…" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
        active ? "bg-brand text-white" : "bg-white text-navy ring-1 ring-line hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
