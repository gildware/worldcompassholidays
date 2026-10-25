import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompanyLinks, GoldRule } from "@/components/company/CompanyChrome";
import { branches, company, companyUpdated, moreServices, signServices } from "@/lib/company";
import { absoluteUrl, graphLd, organizationNode, phoneE164, siteOrigin } from "@/lib/seo";
import { whatsAppHref } from "@/lib/visa";

const steps = [
  {
    number: "01",
    title: "Tell us the trip",
    text: "The place, the dates, and who is travelling. A form, a call, or WhatsApp all start the same way.",
  },
  {
    number: "02",
    title: "Read the quote",
    text: "We send a plan and a price. A room, a car, or a visa file waits until you accept that quote.",
  },
  {
    number: "03",
    title: "Travel on the confirmation",
    text: "The confirmation names what is included, what is extra, and how that trip can be cancelled.",
  },
];

export function AboutView() {
  const phoneHref = `tel:${phoneE164(company.phone)}`;
  const whatsapp = whatsAppHref(company.whatsapp);

  return (
    <article>
      <JsonLd
        data={graphLd([
          organizationNode(),
          {
            "@type": "AboutPage",
            name: `About ${company.tradeName}`,
            url: absoluteUrl("/about"),
            description: `${company.tradeName} is ${company.dmcLine}, with desks in six Indian cities.`,
            mainEntity: { "@id": `${siteOrigin()}/#organization` },
          },
        ])}
      />

      <header className="relative isolate min-h-[560px] overflow-hidden bg-navy text-white">
        <img
          src="/img/company/about-hero.jpg"
          alt="A brass compass and an open atlas on a desk, with mountains and a tropical shore beyond the window"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#051036]/92 via-[#051036]/72 to-[#051036]/25" />
        <div className="relative mx-auto flex min-h-[560px] w-full min-w-0 max-w-[1180px] flex-col justify-end px-5 py-14 md:py-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#e7c98a] uppercase">{company.dmcLine}</p>
          <h1 className="mt-3 max-w-full text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Explore.
            <br />
            Experience.
            <br />
            Discover.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85 md:text-lg">
            {company.tradeName} plans travel in India and abroad. Flights, hotels, transfers, holidays,
            sightseeing, and full packages, with the price written down before you pay.
          </p>
          <GoldRule />
        </div>
      </header>

      <section className="border-b border-line bg-white">
        <dl className="mx-auto grid max-w-[1180px] gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["6", "Branch offices", "From the Andaman to Kashmir"],
            ["3", "Cities with our fleet", "Chandigarh, Bhubaneswar, Andaman"],
            ["2", "Kinds of journey", "Inside India, and overseas"],
            ["1", "Way we confirm", "A written quote you accept"],
          ].map(([figure, label, detail]) => (
            <div key={label} className="bg-white px-5 py-6">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-navy">{figure}</dd>
              <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">The company</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">The name on the door, and the company behind it</h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-muted">
            <p>
              {company.tradeName} is the travel name. {company.legalName} is the destination management
              company on the board: {company.dmcLine}. The work is the same in every city. We hear the
              trip, price it, and confirm it in writing.
            </p>
            <p>
              The desks are in Bhubaneswar, Chandigarh, the Andaman, Himachal, Kolkata, and Kashmir.
              Kashmir is the newest. Cars from our own fleet are based in Chandigarh, Bhubaneswar, and
              the Andaman. In every other city the transfer is still named in the quote before you accept it.
            </p>
            <p>
              Ask for {company.contactName} on {company.phone}, or write to {company.email}.
            </p>
          </div>
          <p className="mt-6 text-sm text-muted">Company pages updated {companyUpdated}.</p>
        </div>
        <figure className="overflow-hidden rounded-3xl border border-line bg-[#f3efe4] shadow-[0px_18px_50px_rgba(5,16,54,0.08)]">
          <img
            src="/img/company/about-branches.jpg"
            alt="An illustrated map of India with gold pins for mountain, river, city, and island desks"
            className="aspect-[16/10] w-full object-cover"
          />
          <figcaption className="px-5 py-4 text-sm leading-6 text-muted">
            An illustration of the country the desks cover. The offices themselves are listed below.
          </figcaption>
        </figure>
      </section>

      <section className="bg-surface py-14 lg:py-20">
        <div className="mx-auto max-w-[1180px] px-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">Branch offices</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Six desks, one way of working</h2>
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
        <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">What the board says we do</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">Flights, stays, transfers, and the days in between</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {signServices.map((service) => (
            <li key={service.title} className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0px_12px_40px_rgba(5,16,54,0.05)]">
              <img src={service.image} alt={service.alt} className="aspect-square w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{service.text}</p>
                <Link href={service.href} className="mt-4 inline-flex text-sm font-medium text-brand">
                  {service.action} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {moreServices.map((service) => (
            <li key={service.title} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{service.text}</p>
              <Link href={service.href} className="mt-3 inline-flex text-sm font-medium text-brand">
                {service.action} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1180px] items-center gap-8 px-5 py-14 lg:grid-cols-2 lg:py-0">
          <img
            src="/img/company/about-fleet.jpg"
            alt="An illustrated cream car and a navy coach on a road between mountains and the coast"
            className="aspect-[16/10] w-full rounded-3xl object-cover lg:my-12"
          />
          <div className="pb-4 lg:py-16">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#e7c98a] uppercase">Our own fleet</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Cars we send ourselves</h2>
            <p className="mt-4 text-base leading-7 text-white/80">
              Chandigarh, Bhubaneswar, and the Andaman have vehicles that belong to the company.
              The licence, the fuel, and the included distance are on the vehicle page and again in
              the quote. In other cities we still arrange the car, and we name it before you accept.
            </p>
            <Link
              href="/rentals/cars"
              className="mt-6 inline-flex rounded-full bg-[#e7c98a] px-5 py-2.5 text-sm font-semibold text-navy"
            >
              Look at the cars
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-14 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">How a trip is confirmed</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps, then you travel</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
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
            <p className="text-xs font-semibold tracking-[0.18em] text-[#8a6230] uppercase">Talk to the desk</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Start with the place and the dates</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              {company.contactName} · {company.phone}
              <br />
              {company.email}
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
          <CompanyLinks current="/about" />
        </div>
      </section>
    </article>
  );
}
