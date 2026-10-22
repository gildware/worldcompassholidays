import { startTransition } from "react";

type ReplaceRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

/**
 * Writes listing filters into the query string without dropping unrelated params
 * (trip dates, campaign tags, and other links). Empty owned values are removed
 * so a cleared filter disappears from the URL.
 */
export function replaceOwnedQuery(
  router: ReplaceRouter,
  pathname: string,
  ownedKeys: readonly string[],
  owned: URLSearchParams,
) {
  if (typeof window === "undefined") return;

  const ownedSet = new Set(ownedKeys);
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams();

  for (const [key, value] of owned.entries()) {
    if (value !== "") next.append(key, value);
  }
  for (const [key, value] of current.entries()) {
    if (!ownedSet.has(key)) next.append(key, value);
  }

  const nextQuery = next.toString();
  const currentQuery = current.toString();
  if (currentQuery === nextQuery && window.location.pathname === pathname) return;

  const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
  startTransition(() => {
    router.replace(href, { scroll: false });
  });
}
