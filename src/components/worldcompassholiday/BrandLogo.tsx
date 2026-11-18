export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={["brand-mark", className].filter(Boolean).join(" ")}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" fill="none" stroke="#e7c98a" strokeWidth="1.2" />
      <path d="M16 4 L18.2 16 L16 14.2 L13.8 16 Z" fill="#e7c98a" />
      <path d="M16 28 L18.2 16 L16 17.8 L13.8 16 Z" fill="#8ea0c8" />
      <circle cx="16" cy="16" r="2" fill="#f7f1e6" />
    </svg>
  );
}

export function BrandLogo({
  tone = "light",
  className,
  logoUrl,
}: {
  tone?: "light" | "dark";
  className?: string;
  logoUrl?: string | null;
}) {
  const lockupClass = ["brand-lockup", tone === "dark" ? "is-dark" : "", className]
    .filter(Boolean)
    .join(" ");

  if (logoUrl) {
    return (
      <span className={lockupClass} translate="no" data-skip-i18n="">
        <img src={logoUrl} alt="World Compass Holidays" className="brand-logo-img" />
      </span>
    );
  }
  return (
    <span className={lockupClass} translate="no" data-skip-i18n="">
      <BrandMark />
      <span className="brand-word">
        <span className="brand-word__name">World Compass</span>
        <span className="brand-word__line">Holidays</span>
      </span>
    </span>
  );
}
