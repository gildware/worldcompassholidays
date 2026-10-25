import Link from "next/link";
import { siteMapGroups } from "@/lib/company";
import { CompanyLinks } from "@/components/company/CompanyChrome";

export function SitemapView() {
  const groups = siteMapGroups();

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-navy text-white">
        <img
          src="/img/company/about-branches.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[#051036]/75" />
        <div className="relative mx-auto max-w-[1100px] px-5 py-16">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#e7c98a] uppercase">Sitemap</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Every public page</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/85">
            The trips you can plan, the company pages, and the account.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map((group) => (
            <section key={group.title} className="rounded-3xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm leading-6 text-muted hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <CompanyLinks current="/sitemap" />
      </div>
    </article>
  );
}
