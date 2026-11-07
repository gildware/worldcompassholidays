import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompanyLinks, GoldRule } from "@/components/company/CompanyChrome";
import { WhyUsIcon } from "@/components/company/WhyUsIcons";
import { branches, company } from "@/lib/company";
import { getSiteSettings } from "@/lib/brand";
import { absoluteUrl, graphLd, organizationNode, phoneE164, siteOrigin } from "@/lib/seo";
import { whatsAppHref } from "@/lib/visa";
import { whyUsPage, whyUsProof, whyUsReasons, whyUsSteps } from "@/lib/why-us";

export async function WhyUsView() {
  const settings = await getSiteSettings();
  const phoneHref = `tel:${phoneE164(settings.phone)}`;
  const whatsapp = whatsAppHref(settings.whatsapp);

  return (
    <article>
      <JsonLd
        data={graphLd([
          organizationNode(),
          {
            "@type": "WebPage",
            name: whyUsPage.kicker,
            url: absoluteUrl("/why-us"),
            description: whyUsPage.subtitle,
            mainEntity: { "@id": `${siteOrigin()}/#organization` },
          },
        ])}
      />

      <header className="relative isolate min-h-[480px] overflow-hidden bg-navy text-white">
        <img
          src="/img/company/about-hero.jpg"
          alt="A brass compass and an open atlas on a desk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#051036]/92 via-[#051036]/75 to-[#051036]/30" />
        <div className="relative mx-auto flex min-h-[480px] w-full max-w-[1180px] flex-col justify-end px-5 py-14 md:py-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#e7c98a] uppercase">{whyUsPage.kicker}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {whyUsPage.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">{whyUsPage.subtitle}</p>
          <GoldRule />
        </div>
      </header>

      <section className="border-b border-line bg-white">
        <dl className="mx-auto grid max-w-[1180px] gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {whyUsProof.map((item) => (
            <div key={item.label} className="bg-white px-5 py-6">
              <dt className="text-sm text-muted">{item.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-navy">{item.figure}</dd>
              <p className="mt-1 text-sm leading-6 text-muted">{item.detail}</p>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-14 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">Six reasons</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">What you get that a booking portal does not</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {whyUsReasons.map((reason) => (
            <li key={reason.id} className="flex gap-4 rounded-3xl border border-line bg-white p-5 shadow-[0px_12px_40px_rgba(5,16,54,0.04)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3efe4] text-[#8a6230]">
                <WhyUsIcon id={reason.id} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-navy">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{reason.long}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface py-14 lg:py-20">
        <div className="mx-auto max-w-[1180px] px-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">On the ground</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Desks and fleet, city by city</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <li key={branch.city} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-lg font-semibold text-navy">{branch.city}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{branch.detail}</p>
                {branch.fleet ? (
                  <p className="mt-3 text-xs font-semibold tracking-[0.14em] text-[#8a6230] uppercase">Own fleet</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-14 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">How booking works</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps, then you travel</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {whyUsSteps.map((step) => (
            <li key={step.number} className="rounded-2xl border border-line p-5">
              <p className="text-sm font-semibold tracking-[0.16em] text-[#8a6230]">{step.number}</p>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">Start with a quote</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Tell us the place and the dates</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              {company.contactName} · {settings.phone}
              <br />
              {settings.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={phoneHref} className="inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">
              Call
            </a>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy"
              >
                WhatsApp
              </a>
            ) : null}
            <Link href="/contact" className="inline-flex rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy">
              Send an enquiry
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-[1180px] px-5 pb-14">
          <CompanyLinks current="/why-us" />
        </div>
      </section>
    </article>
  );
}
