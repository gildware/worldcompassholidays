import Link from "next/link";
import { companyLinks } from "@/lib/company";

export function CompanyLinks({ current }: { current?: string }) {
  const links = companyLinks.filter((item) => item.href !== current);

  return (
    <nav aria-label="Company pages" className="mt-12 border-t border-line pt-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#8a6230] uppercase">Also on this site</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex rounded-full border border-line bg-white px-3 py-1.5 text-sm text-navy transition hover:border-brand hover:text-brand"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function GoldRule() {
  return <span className="mt-4 block h-px w-16 bg-[#e7c98a]" aria-hidden="true" />;
}
