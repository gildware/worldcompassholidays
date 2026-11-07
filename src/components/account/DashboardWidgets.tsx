import Link from "next/link";
import type { AccountSectionKey } from "@/lib/account-sections";

export type DashboardWidget = {
  key: string;
  href: string;
  label: string;
  value: number;
  hint: string;
  icon: "favorites" | "enquiries" | AccountSectionKey;
};

const themes: Record<
  DashboardWidget["icon"],
  { tile: string; icon: string; value: string; glow: string }
> = {
  favorites: {
    tile: "from-[#fff1f4] to-[#ffe4ea] border-[#f8cdd7]",
    icon: "bg-[#e11d48] text-white shadow-[0_8px_16px_-8px_rgba(225,29,72,0.7)]",
    value: "text-[#9f1239]",
    glow: "bg-[#fb7185]/25",
  },
  enquiries: {
    tile: "from-[#fff7ed] to-[#ffedd5] border-[#fbd5a5]",
    icon: "bg-[#ea580c] text-white shadow-[0_8px_16px_-8px_rgba(234,88,12,0.7)]",
    value: "text-[#9a3412]",
    glow: "bg-[#fb923c]/25",
  },
  tour: {
    tile: "from-[#ecfdf5] to-[#d1fae5] border-[#a7f3d0]",
    icon: "bg-[#059669] text-white shadow-[0_8px_16px_-8px_rgba(5,150,105,0.7)]",
    value: "text-[#065f46]",
    glow: "bg-[#34d399]/25",
  },
  hotel: {
    tile: "from-[#eff6ff] to-[#dbeafe] border-[#bfdbfe]",
    icon: "bg-[#2563eb] text-white shadow-[0_8px_16px_-8px_rgba(37,99,235,0.7)]",
    value: "text-[#1e40af]",
    glow: "bg-[#60a5fa]/25",
  },
  visa: {
    tile: "from-[#f5f3ff] to-[#ede9fe] border-[#ddd6fe]",
    icon: "bg-[#7c3aed] text-white shadow-[0_8px_16px_-8px_rgba(124,58,237,0.7)]",
    value: "text-[#5b21b6]",
    glow: "bg-[#a78bfa]/25",
  },
  assist: {
    tile: "from-[#ecfeff] to-[#cffafe] border-[#a5f3fc]",
    icon: "bg-[#0891b2] text-white shadow-[0_8px_16px_-8px_rgba(8,145,178,0.7)]",
    value: "text-[#155e75]",
    glow: "bg-[#22d3ee]/25",
  },
  car: {
    tile: "from-[#eef2ff] to-[#e0e7ff] border-[#c7d2fe]",
    icon: "bg-[#4f46e5] text-white shadow-[0_8px_16px_-8px_rgba(79,70,229,0.7)]",
    value: "text-[#3730a3]",
    glow: "bg-[#818cf8]/25",
  },
  bike: {
    tile: "from-[#f7fee7] to-[#ecfccb] border-[#d9f99d]",
    icon: "bg-[#65a30d] text-white shadow-[0_8px_16px_-8px_rgba(101,163,13,0.7)]",
    value: "text-[#3f6212]",
    glow: "bg-[#a3e635]/25",
  },
  bus: {
    tile: "from-[#fffbeb] to-[#fef3c7] border-[#fde68a]",
    icon: "bg-[#d97706] text-white shadow-[0_8px_16px_-8px_rgba(217,119,6,0.7)]",
    value: "text-[#92400e]",
    glow: "bg-[#fbbf24]/25",
  },
};

function WidgetIcon({ name }: { name: DashboardWidget["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "favorites") {
    return (
      <svg {...common}>
        <path d="M12 19.2s-6.2-3.7-6.2-8.1A3.4 3.4 0 0 1 12 8.2a3.4 3.4 0 0 1 6.2 2.9c0 4.4-6.2 8.1-6.2 8.1z" />
      </svg>
    );
  }
  if (name === "enquiries") {
    return (
      <svg {...common}>
        <path d="M4.5 7.5h15v10h-15z" />
        <path d="m4.5 8.5 7.5 4.5 7.5-4.5" />
      </svg>
    );
  }
  if (name === "tour") {
    return (
      <svg {...common}>
        <path d="M3.5 18.5 8.5 8l3.2 4.2 2.2-2.8 6.6 9.1" />
        <path d="M3 18.5h18" />
      </svg>
    );
  }
  if (name === "hotel") {
    return (
      <svg {...common}>
        <path d="M4 20V9.5L12 4l8 5.5V20" />
        <path d="M9 20v-5h6v5" />
        <path d="M9 11h.01M12 11h.01M15 11h.01" />
      </svg>
    );
  }
  if (name === "visa") {
    return (
      <svg {...common}>
        <path d="M7 3.5h7l3.5 3.5V20.5H7z" />
        <path d="M14 3.5V7h3.5" />
        <path d="M9.5 12h5M9.5 15.5h3.5" />
      </svg>
    );
  }
  if (name === "assist") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="2.6" />
        <path d="M6.5 19.5c1.2-2.8 3-4.2 5.5-4.2s4.3 1.4 5.5 4.2" />
      </svg>
    );
  }
  if (name === "car") {
    return (
      <svg {...common}>
        <path d="M4 15.5h16" />
        <path d="M6 15.5 7.5 10.5h9L18 15.5" />
        <circle cx="8" cy="17.5" r="1.4" />
        <circle cx="16" cy="17.5" r="1.4" />
      </svg>
    );
  }
  if (name === "bike") {
    return (
      <svg {...common}>
        <circle cx="7" cy="16" r="2.4" />
        <circle cx="17" cy="16" r="2.4" />
        <path d="M9.4 16h3.2M7 16 11 8.5h3.2M11 8.5 8.8 8.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4.5" y="4.5" width="15" height="12.5" rx="1.8" />
      <path d="M4.5 11h15M8 19v-2M16 19v-2" />
    </svg>
  );
}

export function DashboardWidgets({ items }: { items: DashboardWidget[] }) {
  return (
    <div className="account-dash-widgets grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
      {items.map((item) => {
        const theme = themes[item.icon];
        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              "account-dash-widget group relative overflow-hidden rounded-xl border bg-gradient-to-br px-3 py-3",
              "shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200",
              "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(15,23,42,0.28)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              theme.tile,
            ].join(" ")}
          >
            <span
              className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl ${theme.glow}`}
              aria-hidden
            />
            <div className="relative flex items-start gap-2.5">
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}
              >
                <WidgetIcon name={item.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-navy/65">
                    {item.label}
                  </p>
                  <span
                    className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-navy/35 transition group-hover:translate-x-0.5 group-hover:text-navy/60"
                    aria-hidden
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3.5 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <p className={`mt-1 text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums ${theme.value}`}>
                  {item.value}
                </p>
                <p className="mt-1.5 line-clamp-1 text-[11px] leading-snug text-navy/55">{item.hint}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
