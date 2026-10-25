"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TabIcon = "home" | "hotels" | "tours" | "bikes" | "cars" | "more" | "account" | "visa" | "meet" | "about" | "help" | "contact" | "pages";

const tabs: {
  href: string;
  label: string;
  match: (p: string) => boolean;
  icon: TabIcon;
}[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => p === "/",
    icon: "home",
  },
  {
    href: "/hotels",
    label: "Find a stay",
    match: (p) => p === "/hotels" || p.startsWith("/hotels/"),
    icon: "hotels",
  },
  {
    href: "/tours",
    label: "Plan a tour",
    match: (p) => p === "/tours" || p.startsWith("/tours/"),
    icon: "tours",
  },
  {
    href: "/rentals/bikes",
    label: "Rent a bike",
    match: (p) => p.startsWith("/rentals/bikes"),
    icon: "bikes",
  },
  {
    href: "/rentals/cars",
    label: "Rent a car",
    match: (p) => p.startsWith("/rentals/cars"),
    icon: "cars",
  },
];

const moreLinks: {
  href: string;
  label: string;
  icon: TabIcon;
  match: (p: string) => boolean;
}[] = [
  {
    href: "/account",
    label: "See your bookings",
    icon: "account",
    match: (p) => p === "/account" || p.startsWith("/account/"),
  },
  {
    href: "/visa-services",
    label: "Apply for a visa",
    icon: "visa",
    match: (p) => p === "/visa-services" || p.startsWith("/visa-services/"),
  },
  {
    href: "/meet-and-assist",
    label: "Request a greeter",
    icon: "meet",
    match: (p) => p === "/meet-and-assist" || p.startsWith("/meet-and-assist/"),
  },
  {
    href: "/about",
    label: "Read about us",
    icon: "about",
    match: (p) => p === "/about",
  },
  {
    href: "/help",
    label: "Get help",
    icon: "help",
    match: (p) => p === "/help",
  },
  {
    href: "/contact",
    label: "Send an enquiry",
    icon: "contact",
    match: (p) => p === "/contact",
  },
  {
    href: "/sitemap",
    label: "See all pages",
    icon: "pages",
    match: (p) =>
      p === "/sitemap" ||
      p === "/terms" ||
      p === "/privacy" ||
      p === "/cancellation" ||
      p === "/cookies",
  },
];

function TabGlyph({ name }: { name: TabIcon }) {
  const common = {
    viewBox: "0 0 300 300",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  // Flaticon Uicons, solid rounded.
  const icons: Record<TabIcon, ReactNode> = {
    home: (
      <svg {...common}>
        <g transform="translate(0 300) scale(1 -1)">
          <path fill="currentColor" d="M150 113Q134 113 123.5 102.0Q113 91 113 75V0H188V75Q188 91 177.0 102.0Q166 113 150 113ZM213 75V0H263Q278 0 289.0 11.0Q300 22 300 38V152Q300 162 293 169L187 284Q173 299 152.0 300.0Q131 301 116 287L7 169Q0 162 0 151V38Q0 22 11.0 11.0Q22 0 38 0H87V75Q88 92 96.0 106.0Q104 120 118.0 128.5Q132 137 148.5 137.5Q165 138 180.0 130.0Q195 122 203.5 107.0Q212 92 213 75ZM150 113Q134 113 123.5 102.0Q113 91 113 75V0H188V75Q188 91 177.0 102.0Q166 113 150 113Z" />
        </g>
      </svg>
    ),
    hotels: (
      <svg {...common}>
        <g transform="translate(0 300) scale(1 -1)">
          <path fill="currentColor" d="M200 300H100Q83 300 68.5 291.5Q54 283 45.5 268.5Q37 254 38 237V63Q38 46 46.0 31.5Q54 17 68.5 8.5Q83 0 100 0H113Q118 0 121.5 3.5Q125 7 125 13V75H113Q107 75 103.5 78.5Q100 82 100.0 87.5Q100 93 103.5 96.5Q107 100 112 100H188Q193 100 196.5 96.5Q200 93 200.0 87.5Q200 82 196.5 78.5Q193 75 187 75H175V13Q175 7 178.5 3.5Q182 0 188 0H200Q217 0 231.5 8.5Q246 17 254.5 31.5Q263 46 262 63V238Q263 254 254.5 268.5Q246 283 231.5 291.5Q217 300 200 300ZM125 125H113Q107 125 103.5 128.5Q100 132 100.0 137.5Q100 143 103.5 146.5Q107 150 112 150H125Q130 150 133.5 146.5Q137 143 137.5 137.5Q138 132 134.0 128.5Q130 125 125 125ZM125 175H113Q107 175 103.5 178.5Q100 182 100.0 187.5Q100 193 103.5 196.5Q107 200 112 200H125Q130 200 133.5 196.5Q137 193 137.5 187.5Q138 182 134.0 178.5Q130 175 125 175ZM125 225H113Q107 225 103.5 228.5Q100 232 100.0 237.5Q100 243 103.5 246.5Q107 250 112 250H125Q130 250 133.5 246.5Q137 243 137.5 237.5Q138 232 134.0 228.5Q130 225 125 225ZM188 125H175Q170 125 166.5 128.5Q163 132 163.0 137.5Q163 143 166.5 146.5Q170 150 175 150H188Q193 150 196.5 146.5Q200 143 200.0 137.5Q200 132 196.5 128.5Q193 125 187 125ZM188 175H175Q170 175 166.5 178.5Q163 182 163.0 187.5Q163 193 166.5 196.5Q170 200 175 200H188Q193 200 196.5 196.5Q200 193 200.0 187.5Q200 182 196.5 178.5Q193 175 187 175ZM188 225H175Q170 225 166.5 228.5Q163 232 163.0 237.5Q163 243 166.5 246.5Q170 250 175 250H188Q193 250 196.5 246.5Q200 243 200.0 237.5Q200 232 196.5 228.5Q193 225 187 225Z" />
        </g>
      </svg>
    ),
    tours: (
      <svg {...common}>
        <g transform="translate(0 300) scale(1 -1)">
          <path fill="currentColor" d="M168 145 184 103 142 119Q135 122 132 130L116 172L158 156Q165 153 168 145ZM163 274V288Q163 293 159.0 296.5Q155 300 150.0 300.0Q145 300 141.0 296.5Q137 293 137 287V274L150 275L162 274ZM263 125H287Q284 93 267.0 65.5Q250 38 222.5 21.0Q195 4 162 1V25Q163 30 159.0 34.0Q155 38 150.0 38.0Q145 38 141.0 34.0Q137 30 137 25V1Q105 4 77.5 21.0Q50 38 33.0 65.5Q16 93 13 125H38Q43 125 46.5 128.5Q50 132 50.0 137.5Q50 143 46.5 146.5Q43 150 37 150H13Q16 182 33.0 209.5Q50 237 77.5 254.0Q105 271 137 274V250Q138 245 141.5 241.5Q145 238 150.0 237.5Q155 237 159.0 241.0Q163 245 163 250V274Q195 271 222.5 254.0Q250 237 267.0 209.5Q284 182 287 150H263Q257 150 253.5 146.5Q250 143 250.0 137.5Q250 132 253.5 128.5Q257 125 262 125ZM218 86 192 154Q188 163 181.5 169.5Q175 176 167 179L98 205Q95 207 91.5 206.0Q88 205 85.0 202.5Q82 200 81.5 196.5Q81 193 82 189L108 121Q112 112 118.5 105.5Q125 99 133 96L202 70Q204 69 206 69Q211 69 214.5 72.0Q218 75 218.5 78.5Q219 82 218 86Z" />
        </g>
      </svg>
    ),
    bikes: (
      <svg {...common}>
        <g transform="translate(0 300) scale(1 -1)">
          <path fill="currentColor" d="M300 100Q300 83 291.5 68.5Q283 54 268.5 46.0Q254 38 237 37Q215 37 199.0 50.5Q183 64 177.5 84.0Q172 104 179.5 123.5Q187 143 206 154L226 96Q227 91 232.0 88.5Q237 86 241.5 88.0Q246 90 248.5 94.5Q251 99 249 104L230 162Q243 163 256.0 159.5Q269 156 279.0 147.0Q289 138 294.5 125.5Q300 113 300 100ZM230 162Q217 160 206 154L199 175Q194 171 189 165L146 108Q138 96 124 91Q120 64 100 50Q82 37 58.0 38.5Q34 40 18 55Q1 73 0 100Q0 115 6.5 128.0Q13 141 24.5 149.5Q36 158 50.5 161.0Q65 164 79 160L85 168Q90 174 86.5 180.5Q83 187 75 187H38Q32 187 28.5 191.0Q25 195 25.0 200.0Q25 205 28.5 209.0Q32 213 38 213H75Q87 213 96.5 206.0Q106 199 110 187H176Q183 194 191 200L184 220Q182 228 175.5 232.5Q169 237 160 238H138Q132 237 128.5 241.0Q125 245 125.0 250.0Q125 255 128.5 259.0Q132 263 138 263H160Q177 263 190.0 253.5Q203 244 208 228L214 209H215Q228 211 241 212Q244 219 252.0 222.5Q260 226 267.0 224.0Q274 222 275 212V188Q274 179 267.5 176.5Q261 174 252.5 177.5Q244 181 241 187Q232 186 222 185ZM156 163H110Q108 157 105 152L75 113H106Q119 113 126 122Z" />
        </g>
      </svg>
    ),
    cars: (
      <svg {...common}>
        <g transform="translate(0 300) scale(1 -1)">
          <path fill="currentColor" d="M4 150Q4 151 4 152L39 246Q46 265 62.0 276.0Q78 287 98 288H203Q222 287 238.0 276.0Q254 265 261 246L296 150ZM250 125V100Q250 95 246.5 91.5Q243 88 237.5 88.0Q232 88 228.5 91.5Q225 95 225 100V125H75V100Q75 95 71.5 91.5Q68 88 62.5 88.0Q57 88 53.5 91.5Q50 95 50 100V125H0V100Q0 81 10.0 65.5Q20 50 37 43V25Q37 15 44.5 7.5Q52 0 62.5 0.0Q73 0 80.5 7.5Q88 15 88 25V38H213V25Q212 15 219.5 7.5Q227 0 237.5 0.0Q248 0 255.0 7.5Q262 15 262 25V43Q280 50 290.0 65.5Q300 81 300 100V125Z" />
        </g>
      </svg>
    ),
    more: (
      <svg {...common}>
        <g transform="translate(0 300) scale(1 -1)">
          <path fill="currentColor" d="M50 300H87Q108 300 122.5 285.5Q137 271 137 250V213Q137 192 122.5 177.5Q108 163 87 163H50Q29 162 14.5 177.0Q0 192 0 213V250Q0 271 14.5 285.5Q29 300 50 300ZM213 300H250Q271 300 285.5 285.5Q300 271 300 250V213Q300 192 285.5 177.5Q271 163 250 163H213Q192 163 177.5 177.5Q163 192 163 213V250Q162 271 177.0 285.5Q192 300 213 300ZM50 138H87Q108 138 122.5 123.0Q137 108 137 88V50Q137 29 122.5 14.5Q108 0 87 0H50Q29 0 14.5 14.5Q0 29 0 50V87Q0 108 14.5 123.0Q29 138 50 138ZM213 138H250Q271 138 285.5 123.0Q300 108 300 88V50Q300 29 285.5 14.5Q271 0 250 0H213Q192 0 177.5 14.5Q163 29 163 50V87Q162 108 177.0 123.0Q192 138 213 138Z" />
        </g>
      </svg>
    ),
    account: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          fill="currentColor"
          d="M12 12.1a4.05 4.05 0 1 0 0-8.1 4.05 4.05 0 0 0 0 8.1Zm-6.35 7.15c.45-2.85 2.85-4.75 6.35-4.75s5.9 1.9 6.35 4.75c.12.75-.48 1.4-1.24 1.4H6.89c-.76 0-1.36-.65-1.24-1.4Z"
        />
      </svg>
    ),
    visa: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M7 2.7h8.3A2.7 2.7 0 0 1 18 5.4v13.2a2.7 2.7 0 0 1-2.7 2.7H7a2.7 2.7 0 0 1-2.7-2.7V5.4A2.7 2.7 0 0 1 7 2.7Zm4.15 4.05a2.35 2.35 0 1 0 .02 4.7 2.35 2.35 0 0 0-.02-4.7ZM7.7 16.55c.42-1.5 1.7-2.3 3.45-2.3s3.03.8 3.45 2.3c.14.5-.22.95-.74.95H8.44c-.52 0-.88-.45-.74-.95Z"
        />
      </svg>
    ),
    meet: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          fill="currentColor"
          d="M8.15 10.7a3.15 3.15 0 1 0 0-6.3 3.15 3.15 0 0 0 0 6.3Zm7.35-.55a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM3.55 18.85c.38-2.6 2.4-4.4 5.15-4.4 1 0 1.92.27 2.7.74a3.35 3.35 0 0 0-1.2 2.56v1.7H4.8c-.78 0-1.38-.58-1.25-1.3Zm6.55.4c0-1.42 1.13-2.55 2.55-2.55h.3c2.3 0 4.15 1.5 4.45 3.5.1.58-.35 1.1-.95 1.1h-6.35v-2.05Z"
        />
      </svg>
    ),
    about: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 4.2v3.1M12 16.7v3.1M4.2 12h3.1M16.7 12h3.1M12 12l3.2-2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    help: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.4 9.3a2.6 2.6 0 1 1 3.5 2.4c-.7.3-1.1.8-1.1 1.5V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="11.8" cy="16.6" r="0.8" fill="currentColor" />
      </svg>
    ),
    contact: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7.2 4.2h2.2l1.2 2.8-1.6 1.1a10 10 0 0 0 4.9 4.9l1.1-1.6 2.8 1.2v2.2c0 .8-.6 1.4-1.4 1.5A12.2 12.2 0 0 1 5.7 5.6c.1-.8.7-1.4 1.5-1.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    pages: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 5.5h10M7 12h10M7 18.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[name];
}

export function MobileTabBar() {
  const pathname = usePathname() || "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreId = useId();
  const moreActive = moreLinks.some((item) => item.match(pathname));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="mobile-tabbar app-chrome-mobile" aria-label="Primary">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link prefetch={false}
            key={tab.href}
            href={tab.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-tabbar__icon">
              <TabGlyph name={tab.icon} />
            </span>
            <span className="mobile-tabbar__label">{tab.label}</span>
          </Link>
        );
      })}
      <div className="mobile-tabbar__more" ref={moreRef}>
        {moreOpen
          ? createPortal(
              <button
                type="button"
                className="mobile-tabbar__backdrop"
                aria-label="Close menu"
                onClick={() => setMoreOpen(false)}
              />,
              document.body,
            )
          : null}
        {moreOpen ? (
          <div className="mobile-tabbar__sheet" id={moreId} role="menu">
            {moreLinks.map((item) => {
              const active = item.match(pathname);
              return (
                <Link prefetch={false}
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={active ? "is-active" : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="mobile-tabbar__icon">
                    <TabGlyph name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
        <button
          type="button"
          className={`mobile-tabbar__more-btn${moreActive || moreOpen ? " is-active" : ""}`}
          aria-expanded={moreOpen}
          aria-controls={moreId}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <span className="mobile-tabbar__icon">
            <TabGlyph name="more" />
          </span>
          <span className="mobile-tabbar__label">More</span>
        </button>
      </div>
    </nav>
  );
}
