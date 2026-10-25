import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompanyLinks } from "@/components/company/CompanyChrome";
import { helpFaqs } from "@/lib/company";
import { absoluteUrl, faqNode, graphLd } from "@/lib/seo";

export function HelpView() {
  return (
    <article>
      <JsonLd
        data={graphLd([
          faqNode(helpFaqs.map((item) => ({ title: item.title, content: item.content }))),
          {
            "@type": "WebPage",
            name: "Help",
            url: absoluteUrl("/help"),
          },
        ])}
      />
      <header className="relative isolate min-h-[420px] overflow-hidden bg-navy text-white">
        <img
          src="/img/company/help-hero.jpg"
          alt="A traveller by a train window, holding a blank paper and a phone, with a compass and tea on the table"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#051036]/90 via-[#051036]/68 to-[#051036]/20" />
        <div className="relative mx-auto flex min-h-[420px] max-w-[1100px] flex-col justify-end px-5 py-12">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#e7c98a] uppercase">Help</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">Answers before you call</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/85">
            How a trip is quoted, where the desks are, and what happens if the dates change.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[800px] px-5 py-12">
        <div className="divide-y divide-line rounded-3xl border border-line bg-white px-5 md:px-7">
          {helpFaqs.map((item) => (
            <details key={item.title} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.title}
                <span className="text-brand transition group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted">{item.content}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-base leading-7 text-muted">
          If the answer is not here,{" "}
          <Link href="/contact" className="font-medium text-brand">
            send the trip
          </Link>{" "}
          and the desk will reply with a plan.
        </p>
        <CompanyLinks current="/help" />
      </div>
    </article>
  );
}
