import Link from "next/link";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";

export function SiteFooter({ items }: { items: NavItem[] }) {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-lg font-semibold">{theme.brandName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
            {theme.tagline}
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/80">
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" className="text-white/80">
            Staff sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
