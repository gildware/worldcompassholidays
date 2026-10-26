import Image from "next/image";
import Link from "next/link";
import { homeVisaServices } from "@/lib/homeServices";
import { defaultHomePageContent } from "@/lib/home-page";
import "@/styles/home-desks.css";

export function HomeVisaSection({
  headingId = "home-visa",
  title = defaultHomePageContent.visa.title,
  subtitle = defaultHomePageContent.visa.subtitle,
  meta = defaultHomePageContent.visa.meta,
  moreLabel = defaultHomePageContent.visa.moreLabel,
  ctaLabel = defaultHomePageContent.visa.ctaLabel,
}: {
  headingId?: string;
  title?: string;
  subtitle?: string;
  meta?: string;
  moreLabel?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="hx-visa" aria-labelledby={headingId}>
      <div className="hx-visa__head">
        <div>
          <div className="hx-desk__title">
            <h2 id={headingId}>{title}</h2>
            <Link prefetch={false} href="/visa-services" className="hx-desk__more">
              {moreLabel}
            </Link>
          </div>
          <p>{subtitle}</p>
          {meta ? <p className="hx-visa__meta">{meta}</p> : null}
        </div>
        <Link prefetch={false} href="/visa-services/apply" className="hx-desk__go">
          {ctaLabel}
        </Link>
      </div>
      <div className="hx-visa__grid">
        {homeVisaServices.map((item) => (
          <Link prefetch={false} key={item.title} href={item.href} className="hx-visa__card">
            <div className="hx-visa__photo">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 280px"
              />
            </div>
            <div className="hx-visa__body">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ul>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
