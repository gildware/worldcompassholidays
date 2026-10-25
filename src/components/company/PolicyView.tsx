import Link from "next/link";
import { CompanyLinks } from "@/components/company/CompanyChrome";
import { companyUpdated, type PolicyPage } from "@/lib/company";

export function PolicyView({ page }: { page: PolicyPage }) {
  return (
    <article className="bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1100px] px-5 py-12 md:py-16">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">{page.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{page.description}</p>
          <p className="mt-4 text-sm text-muted">Updated {companyUpdated}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-14">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#8a6230] uppercase">On this page</p>
          <ol className="mt-3 space-y-2">
            {page.sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-sm leading-6 text-muted hover:text-brand">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="rounded-3xl border border-line bg-white px-5 py-6 shadow-[0px_10px_40px_rgba(5,16,54,0.04)] md:px-8 md:py-8">
          {page.sections.map((section, index) => (
            <section key={section.id} id={section.id} className={index === 0 ? "scroll-mt-28" : "mt-10 scroll-mt-28"}>
              <h2 className="text-2xl font-semibold tracking-tight">
                <span className="mr-2 text-[#8a6230]">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-base leading-7 text-muted">
                {section.blocks.map((block, blockIndex) =>
                  block.kind === "p" ? (
                    <p key={blockIndex}>{block.text}</p>
                  ) : (
                    <ul key={blockIndex} className="list-disc space-y-2 pl-5">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
          <p className="mt-10 text-sm leading-6 text-muted">
            Questions about a live booking start at{" "}
            <Link href="/contact" className="font-medium text-brand">
              contact
            </Link>
            . The cancellation rule for a trip you have already accepted is the one in that quote.
          </p>
          <CompanyLinks current={page.path} />
        </div>
      </div>
    </article>
  );
}
