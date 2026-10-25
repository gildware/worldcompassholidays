"use client";

import { useEffect, useRef, useState } from "react";
import { toggleFavorite } from "@/actions/favorites";
import { showFavoriteToast } from "@/components/favorites/FavoriteToast";
import type { FavoriteKind } from "@/lib/favorite-kinds";

const LOGIN_TOAST = "Log in first to mark it as a favorite";

export { showFavoriteToast };

function showLoginToast() {
  showFavoriteToast(LOGIN_TOAST, "login");
}

function showSavedToast(saved: boolean) {
  showFavoriteToast(
    saved ? "Added to favorites" : "Removed from favorites",
    saved ? "add" : "remove",
  );
}

export function useFavoriteList(initialIds: string[], signedIn: boolean) {
  const key = initialIds.join("\0");
  const [saved, setSaved] = useState(initialIds);
  const savedRef = useRef(saved);
  const pending = useRef(new Set<string>());
  savedRef.current = saved;

  useEffect(() => {
    const next = key ? key.split("\0") : [];
    savedRef.current = next;
    setSaved(next);
  }, [key]);

  async function toggle(kind: FavoriteKind, itemId: string) {
    if (!signedIn) {
      showLoginToast();
      return;
    }
    if (pending.current.has(itemId)) return;
    pending.current.add(itemId);
    const had = savedRef.current.includes(itemId);
    showSavedToast(!had);
    const optimistic = had
      ? savedRef.current.filter((id) => id !== itemId)
      : [...savedRef.current, itemId];
    savedRef.current = optimistic;
    setSaved(optimistic);
    try {
      const result = await toggleFavorite(kind, itemId);
      if (!result.ok) {
        const rolled = had
          ? savedRef.current.includes(itemId)
            ? savedRef.current
            : [...savedRef.current, itemId]
          : savedRef.current.filter((id) => id !== itemId);
        savedRef.current = rolled;
        setSaved(rolled);
        if (result.reason === "auth") showLoginToast();
        return;
      }
      if (result.saved === had) showSavedToast(result.saved);
      setSaved((current) => {
        const next = result.saved
          ? current.includes(itemId)
            ? current
            : [...current, itemId]
          : current.filter((id) => id !== itemId);
        savedRef.current = next;
        return next;
      });
    } finally {
      pending.current.delete(itemId);
    }
  }

  return { saved, toggle };
}

export function useFavoriteToggle({
  kind,
  itemId,
  initialSaved,
  signedIn,
}: {
  kind: FavoriteKind;
  itemId: string;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved, itemId]);

  async function toggle() {
    if (!signedIn) {
      showLoginToast();
      return;
    }
    if (pending) return;
    const next = !saved;
    showSavedToast(next);
    setSaved(next);
    setPending(true);
    try {
      const result = await toggleFavorite(kind, itemId);
      if (!result.ok) {
        setSaved(!next);
        if (result.reason === "auth") showLoginToast();
        return;
      }
      if (result.saved !== next) showSavedToast(result.saved);
      setSaved(result.saved);
    } finally {
      setPending(false);
    }
  }

  return { saved, pending, toggle };
}

export function FavoriteHeart({ filled }: { filled: boolean }) {
  return (
    <svg className="fav-btn__heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.6 10.6 19.3C5.5 14.7 2.2 11.7 2.2 8.1 2.2 5.2 4.4 3 7.3 3c1.6 0 3.2.8 4.2 2 1-1.2 2.6-2 4.2-2 2.9 0 5.1 2.2 5.1 5.1 0 3.6-3.3 6.6-8.4 11.2L12 20.6Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 1.2 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoriteButton({
  kind,
  itemId,
  initialSaved,
  signedIn,
  title,
  variant = "pill",
  className = "",
}: {
  kind: FavoriteKind;
  itemId: string;
  initialSaved: boolean;
  signedIn: boolean;
  title: string;
  variant?: "pill" | "icon";
  className?: string;
}) {
  const { saved, pending, toggle } = useFavoriteToggle({ kind, itemId, initialSaved, signedIn });

  return (
    <button
      type="button"
      className={`fav-btn fav-btn--${variant}${saved ? " is-on" : ""} ${className}`.trim()}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove" : "Add"} ${title} ${saved ? "from" : "to"} favorites`}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <FavoriteHeart filled={saved} />
      {variant === "pill" ? <span>{saved ? "Favorited" : "Favorite"}</span> : null}
    </button>
  );
}
