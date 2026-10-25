"use client";

export function HomeHeroSearch() {
  return (
    <button
      type="button"
      className="home-x__search"
      onClick={() => window.dispatchEvent(new Event("wch-open-search"))}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4 4" />
      </svg>
      <span>Search tours, cars, bikes, hotels</span>
    </button>
  );
}
