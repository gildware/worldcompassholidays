import Link from "next/link";

const links = [
  {
    href: "/tours",
    label: "Tours",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 9v3l2 1" />
      </svg>
    ),
  },
  {
    href: "/rentals/cars",
    label: "Cars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M5 16l1-4h12l1 4M5 16h14v3H5v-3z" />
      </svg>
    ),
  },
  {
    href: "/hotels",
    label: "Hotels",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 20V8l8-4 8 4v12M9 20v-5h6v5" />
      </svg>
    ),
  },
  {
    href: "/account/bookings",
    label: "Bookings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M8 7h8M6 12h12M9 17h6" />
      </svg>
    ),
  },
] as const;

export function MobileQuickLinks() {
  return (
    <nav className="mobile-quick-links app-chrome-mobile" aria-label="Shortcuts">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="mobile-quick-links__item">
          <span className="mobile-quick-links__icon">{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
